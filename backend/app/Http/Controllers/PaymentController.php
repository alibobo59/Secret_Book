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

            // Update order payment method
            $order->update([
                'payment_method' => 'vnpay',
                'payment_status' => 'processing'
            ]);

            // Get client IP và đảm bảo IPv4 format
            $ipAddr = $request->ip();

            // Validate và convert IP nếu cần
            if (!filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                // Nếu là IPv6 hoặc invalid, dùng IP mặc định
                $ipAddr = '127.0.0.1';
            }

            // Nếu đang test, có thể dùng IP cố định
            // $ipAddr = "183.80.234.255"; // Uncomment nếu cần test

            // Create VNPay payment URL
            $paymentUrl = $this->vnpayService->createPaymentUrl($order, $ipAddr);

            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'order_number' => $order->order_number
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
            $orderNumber = explode('-', $vnp_TxnRef)[0] . '-' . explode('-', $vnp_TxnRef)[1]; // Get ORD-XXXXXXXX part
            $order = Order::where('order_number', $orderNumber)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
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
                    'status' => 'processing' // Update order status
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
                // Payment failed
                $order->update([
                    'payment_status' => 'failed',
                    'payment_details' => json_encode($inputData)
                ]);

                Log::warning('VNPay payment failed', [
                    'order_number' => $orderNumber,
                    'response_code' => $vnp_ResponseCode
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed',
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'response_code' => $vnp_ResponseCode
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
        try {
            // Validate order exists and belongs to authenticated user
            $order = Order::where('id', $orderId)
                         ->where('user_id', auth()->user()->id)
                         ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Đơn hàng không tồn tại hoặc không thuộc về bạn.'
                ], 404);
            }

            // Check if order can be retried
            if (!$this->canRetryPayment($order)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Đơn hàng này không thể thanh toán lại.'
                ], 400);
            }

            // Update payment method and status for retry (keep order status unchanged)
            $order->update([
                'payment_method' => 'vnpay',
                'payment_status' => 'processing'
            ]);

            // Get client IP
            $ipAddr = $request->ip();
            if (!filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                $ipAddr = '127.0.0.1';
            }

            // Create new VNPay payment URL
            $paymentUrl = $this->vnpayService->createPaymentUrl($order, $ipAddr);

            Log::info('VNPay payment retry initiated', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'user_id' => auth()->user()->id
            ]);

            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'order_number' => $order->order_number,
                'message' => 'Đã tạo liên kết thanh toán mới.'
            ]);

        } catch (\Exception $e) {
            Log::error('VNPay payment retry failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo thanh toán mới: ' . $e->getMessage()
            ], 500);
        }
    }

    public function changePaymentMethod(Request $request, $orderId)
    {
        try {
            $request->validate([
                'payment_method' => 'required|in:cod,vnpay'
            ]);

            $order = Order::where('id', $orderId)
                         ->where('user_id', auth()->user()->id)
                         ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Đơn hàng không tồn tại hoặc không thuộc về bạn.'
                ], 404);
            }

            // Check if order can be retried
            if (!$this->canRetryPayment($order)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Đơn hàng này không thể thay đổi phương thức thanh toán.'
                ], 400);
            }

            $paymentMethod = $request->payment_method;
            
            // Update order with new payment method
            $updateData = [
                'payment_method' => $paymentMethod
                // Status will be set based on payment method below
            ];

            if ($paymentMethod === 'cod') {
                // For COD, mark as pending and waiting for delivery
                $updateData['payment_status'] = 'pending';
                // Keep order status as pending for COD - don't auto-change to processing
                
                $order->update($updateData);

                Log::info('Payment method changed to COD', [
                    'order_id' => $orderId,
                    'user_id' => auth()->user()->id,
                    'new_method' => $paymentMethod
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Đã chuyển sang thanh toán khi nhận hàng (COD)',
                    'order_number' => $order->order_number,
                    'payment_method' => $paymentMethod
                ]);
            } else if ($paymentMethod === 'vnpay') {
                // For VNPay, generate new payment URL
                $updateData['payment_status'] = 'processing';
                $updateData['status'] = 'processing'; // VNPay requires immediate processing
                $order->update($updateData);

                // Get client IP
                $ipAddr = $request->ip();
                if (!filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                    $ipAddr = '127.0.0.1';
                }

                $paymentUrl = $this->vnpayService->createPaymentUrl($order, $ipAddr);

                Log::info('Payment method changed to VNPay', [
                    'order_id' => $orderId,
                    'user_id' => auth()->user()->id,
                    'new_method' => $paymentMethod
                ]);

                return response()->json([
                    'success' => true,
                    'payment_url' => $paymentUrl,
                    'message' => 'Đã chuyển sang thanh toán VNPay',
                    'order_number' => $order->order_number,
                    'payment_method' => $paymentMethod
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Change payment method failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể thay đổi phương thức thanh toán: ' . $e->getMessage()
            ], 500);
        }
    }

    private function canRetryPayment($order)
    {
        // Check if payment status is failed, pending, or processing (for VNPay timeout/error cases)
        if (!in_array($order->payment_status, ['failed', 'pending', 'processing'])) {
            return false;
        }

        // Check if order is not too old (24 hours)
        $orderAge = Carbon::now()->diffInHours($order->created_at);
        if ($orderAge > 24) {
            return false;
        }

        // Check if order items are still available (optional - can be implemented later)
        // foreach ($order->orderItems as $item) {
        //     if ($item->product->stock < $item->quantity) {
        //         return false;
        //     }
        // }

        return true;
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

            // For API calls, return JSON
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'payment_url' => $paymentUrl,
                    'order_number' => $order->order_number
                ]);
            }

            // For direct browser access, redirect to VNPay
            return redirect($paymentUrl);

        } catch (\Exception $e) {
            Log::error('VNPay payment URL creation failed: ' . $e->getMessage());
            
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment URL creation failed: ' . $e->getMessage()
                ], 500);
            }

            // Dòng 222
            return redirect()->back()->with('error', 'Tạo thanh toán thất bại');
        }
    }
}
