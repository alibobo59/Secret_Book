<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\VNPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
class PaymentController extends Controller
{
    public function createVNPayPayment(Request $request)
    {
        $order = Order::findOrFail($request->order_id);

        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $vnpayService = new VNPayService();
        $paymentUrl = $vnpayService->createPaymentUrl($order, $request->ip());

        $order->update([
            'payment_method' => 'vnpay',
            'payment_status' => 'processing'
        ]);

        return response()->json(['payment_url' => $paymentUrl]);
    }

    public function createVNPayPaymentUrl(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'orderInfo' => 'required|string'
        ]);

        // Create a temporary order for VNPay payment
        $order = new \stdClass();
        $order->order_number = 'TEMP-' . time() . '-' . rand(1000, 9999);
        $order->total = $request->amount;

        $vnpayService = new VNPayService();
        $paymentUrl = $vnpayService->createPaymentUrl($order, $request->ip());

        // Redirect directly to VNPay
        return redirect($paymentUrl);
    }

    public function vnpayReturn(Request $request)
    {
        $vnpayService = new VNPayService();

        if ($vnpayService->validateResponse($request->all())) {
            $order = Order::where('order_number', $request->vnp_TxnRef)->first();

            if ($request->vnp_ResponseCode === '00') {
                $order->update([
                    'payment_status' => 'completed',
                    'payment_transaction_id' => $request->vnp_TransactionNo,
                    'payment_amount' => $request->vnp_Amount / 100, // Convert back from VNPay format
                    'payment_date' => now(),
                    'payment_details' => $request->all()
                ]);

                return redirect(config('app.frontend_url') . '/order-success/' . $order->id);
            } else {
                $order->update([
                    'payment_status' => 'failed',
                    'payment_details' => $request->all()
                ]);

                return redirect(config('app.frontend_url') . '/order-failed/' . $order->id);
            }
        }

        return redirect(config('app.frontend_url') . '/order-failed');
    }
}
