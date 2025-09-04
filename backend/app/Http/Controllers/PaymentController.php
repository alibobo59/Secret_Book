<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\VNPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PaymentController extends Controller
{
    protected $vnpayService;

    public function __construct(VNPayService $vnpayService)
    {
        $this->vnpayService = $vnpayService;
    }

    public function createVNPayPayment(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|exists:orders,id'
            ], [
                'order_id.required' => 'ID đơn hàng là bắt buộc.',
                'order_id.exists' => 'Đơn hàng không tồn tại.'
            ]);

            $order = Order::findOrFail($request->order_id);

            // Check if order is eligible for payment
            if ($order->payment_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is not eligible for payment'
                ], 400);
            }

            // Determine TTL without extending if already set and valid
            $now = Carbon::now();
            $expiresAt = null;
            if ($order->payment_expires_at) {
                if ($now->greaterThan($order->payment_expires_at)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment window has expired'
                    ], 400);
                }
                $expiresAt = $order->payment_expires_at; // keep original TTL
            } else {
                $ttlMinutes = config('payments.vnpay_ttl_minutes', 15);
                $expiresAt = $now->copy()->addMinutes($ttlMinutes);
            }

            // Set payment method and start processing
            $order->update([
                'payment_method' => 'vnpay',
                'payment_status' => 'processing',
                // keep order status as pending until success
                'payment_expires_at' => $expiresAt,
                'cancellation_reason' => null,
            ]);

            // Get client IP and ensure IPv4
            $ipAddr = $request->ip();
            if (!filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                $ipAddr = '127.0.0.1';
            }

            // Create VNPay payment URL
            $paymentUrl = $this->vnpayService->createPaymentUrl($order, $ipAddr);

            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'order_number' => $order->order_number,
                'payment_expires_at' => optional($expiresAt)->toIso8601String(),
            ]);

        } catch (\Exception $e) {
            Log::error('VNPay payment creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Payment creation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function vnpayReturn(Request $request)
    {
        try {
            $inputData = $request->all();

            // Validate VNPay response
            if (!$this->vnpayService->validateResponse($inputData)) {
                Log::warning('VNPay invalid signature', $inputData);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid payment signature'
                ], 400);
            }

            $vnp_TxnRef = $inputData['vnp_TxnRef'];
            $vnp_ResponseCode = $inputData['vnp_ResponseCode'];
            $vnp_TransactionNo = $inputData['vnp_TransactionNo'] ?? null;
            $vnp_Amount = $inputData['vnp_Amount'] / 100; // Convert back from VNPay format

            // Find order by order number (extract from vnp_TxnRef which may have timestamp suffix)
            $parts = explode('-', $vnp_TxnRef);
            $orderNumber = $parts[0] . '-' . $parts[1];
            $order = Order::where('order_number', $orderNumber)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // If expired already and not paid, cancel
            if (in_array($order->payment_status, ['pending', 'processing']) && $order->payment_expires_at && Carbon::now()->greaterThan($order->payment_expires_at)) {
                // restore stock if not cancelled yet
                if ($order->status !== 'cancelled') {
                    foreach ($order->items as $item) {
                        if ($item->variation_id) {
                            $variation = \App\Models\BookVariation::find($item->variation_id);
                            if ($variation) {
                                $variation->increment('stock_quantity', $item->quantity);
                            }
                        } else {
                            $book = \App\Models\Book::find($item->book_id);
                            if ($book) {
                                $book->increment('stock_quantity', $item->quantity);
                            }
                        }
                    }
                }

                $order->update([
                    'payment_status' => 'failed',
                    'payment_details' => json_encode($inputData),
                    'status' => 'cancelled',
                    'cancellation_reason' => 'VNPay quá hạn thanh toán',
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payment expired and order has been cancelled',
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'response_code' => 'EXPIRED'
                ], 400);
            }

            // Process payment result
            if ($vnp_ResponseCode == '00') {
                // Payment successful
                $order->update([
                    'payment_status' => 'completed',
                    'payment_transaction_id' => $vnp_TransactionNo,
                    'payment_amount' => $vnp_Amount,
                    'payment_date' => Carbon::now(),
                    'payment_details' => json_encode($inputData),
                    'status' => 'processing', // business rule: move to processing after paid
                    'payment_expires_at' => null,
                    'cancellation_reason' => null,
                ]);

                Log::info('VNPay payment successful', [
                    'order_number' => $orderNumber,
                    'transaction_id' => $vnp_TransactionNo,
                    'amount' => $vnp_Amount
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment successful',
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'transaction_id' => $vnp_TransactionNo
                ]);
            } else {
                // If order already finalized, ignore failure callback
                if (!in_array($order->payment_status, ['pending', 'processing']) || $order->status === 'cancelled') {
                    Log::info('VNPay failure callback ignored for finalized order', [
                        'order_number' => $orderNumber,
                        'current_payment_status' => $order->payment_status,
                        'current_status' => $order->status,
                        'response_code' => $vnp_ResponseCode
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Order already finalized. No state change.',
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'current_payment_status' => $order->payment_status,
                        'current_status' => $order->status,
                    ]);
                }

                // Payment failed but NOT expired: do NOT cancel or restore stock; allow retry within TTL
                $order->update([
                    'payment_status' => 'pending', // revert to pending to allow retry via createVNPayPayment
                    'payment_details' => json_encode($inputData),
                    // keep status as-is, keep payment_expires_at unchanged, do not set cancellation_reason
                ]);

                Log::warning('VNPay payment failed within TTL; order not cancelled', [
                    'order_number' => $orderNumber,
                    'response_code' => $vnp_ResponseCode
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed. You can retry before expiration.',
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'response_code' => $vnp_ResponseCode,
                    'payment_expires_at' => optional($order->payment_expires_at)->toIso8601String(),
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('VNPay return processing failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Payment processing failed'
            ], 500);
        }
    }

    public function verifyVNPayPayment(Request $request)
    {
        try {
            $inputData = $request->all();

            // Validate VNPay response
            if (!$this->vnpayService->validateResponse($inputData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid payment signature'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment signature is valid',
                'data' => $inputData
            ]);

        } catch (\Exception $e) {
            Log::error('VNPay verification failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed'
            ], 500);
        }
    }

    public function retryVNPayPayment(Request $request, $orderId)
    {
        // Deprecated per new business rules: always return 410 Gone
        return response()->json([
            'success' => false,
            'message' => 'Tính năng thanh toán lại đã bị vô hiệu hoá. Đơn hàng sẽ tự động huỷ khi quá hạn hoặc thất bại.'
        ], 410);
    }

    public function changePaymentMethod(Request $request, $orderId)
    {
        // Deprecated per new business rules: always return 410 Gone
        return response()->json([
            'success' => false,
            'message' => 'Tính năng thay đổi phương thức thanh toán đã bị loại bỏ.'
        ], 410);
    }

    private function canRetryPayment($order)
    {
        // Legacy method, kept for backward compatibility of code references if any
        return false;
    }

    public function createVNPayPaymentUrl(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:1000',
                'orderInfo' => 'string'
            ]);

            // Create a temporary order object for testing
            $order = new \stdClass();
            $order->order_number = 'TEST-' . time() . '-' . rand(1000, 9999);
            $order->total = $request->amount;

            $paymentUrl = $this->vnpayService->createPaymentUrl($order, $request->ip());

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'payment_url' => $paymentUrl,
                    'order_number' => $order->order_number
                ]);
            }

            return redirect($paymentUrl);

        } catch (\Exception $e) {
            Log::error('VNPay payment URL creation failed: ' . $e->getMessage());
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create VNPay payment URL'
                ], 500);
            }

            return back()->withErrors(['error' => 'Failed to create VNPay payment URL']);
        }
    }
}
