<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\VNPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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

            // Get client IP
            $ipAddr = $request->ip();
            
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
                'message' => 'Payment creation failed'
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

            // Find order by order number
            $order = Order::where('order_number', $vnp_TxnRef)->first();
            
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
                    'order_number' => $vnp_TxnRef,
                    'transaction_id' => $vnp_TransactionNo,
                    'amount' => $vnp_Amount
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment successful',
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
                    'order_number' => $vnp_TxnRef,
                    'response_code' => $vnp_ResponseCode
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed',
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
}