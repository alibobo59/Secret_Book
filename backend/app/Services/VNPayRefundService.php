<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Refund;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VNPayRefundService
{
    private $vnp_TmnCode;
    private $vnp_HashSecret;
    private $vnp_ApiUrl;
    private $vnp_Api_Version;

    public function __construct()
    {
        $this->vnp_TmnCode = config('services.vnpay.vnp_TmnCode');
        $this->vnp_HashSecret = config('services.vnpay.vnp_HashSecret');
        $this->vnp_ApiUrl = config('services.vnpay.vnp_ApiUrl', 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction');
        $this->vnp_Api_Version = '2.1.0';
    }

    /**
     * Tạo yêu cầu hoàn tiền toàn phần
     */
    public function createFullRefund(Order $order, string $reason = '', ?int $requestedBy = null): array
    {
        try {
            // Kiểm tra điều kiện hoàn tiền
            $this->validateRefundConditions($order);

            // Tạo bản ghi hoàn tiền
            $refund = $this->createRefundRecord($order, $order->payment_amount, 'full', $reason, $requestedBy);

            // Gọi API VNPay để hoàn tiền
            $vnpayResponse = $this->callVNPayRefundAPI(
                $order->payment_transaction_id,
                $order->payment_amount,
                $refund->refund_number,
                $reason
            );

            // Cập nhật thông tin phản hồi từ VNPay
            $refund->update([
                'vnpay_response' => $vnpayResponse,
                'status' => $this->mapVNPayResponseToStatus($vnpayResponse)
            ]);

            return [
                'success' => true,
                'refund' => $refund,
                'vnpay_response' => $vnpayResponse
            ];

        } catch (Exception $e) {
            Log::error('VNPay Full Refund Error: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'order_number' => $order->order_number
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Tạo yêu cầu hoàn tiền một phần
     */
    public function createPartialRefund(Order $order, float $refundAmount, string $reason = '', ?int $requestedBy = null): array
    {
        try {
            // Kiểm tra điều kiện hoàn tiền
            $this->validateRefundConditions($order);
            $this->validatePartialRefundAmount($order, $refundAmount);

            // Tạo bản ghi hoàn tiền
            $refund = $this->createRefundRecord($order, $refundAmount, 'partial', $reason, $requestedBy);

            // Gọi API VNPay để hoàn tiền
            $vnpayResponse = $this->callVNPayRefundAPI(
                $order->payment_transaction_id,
                $refundAmount,
                $refund->refund_number,
                $reason
            );

            // Cập nhật thông tin phản hồi từ VNPay
            $refund->update([
                'vnpay_response' => $vnpayResponse,
                'status' => $this->mapVNPayResponseToStatus($vnpayResponse)
            ]);

            return [
                'success' => true,
                'refund' => $refund,
                'vnpay_response' => $vnpayResponse
            ];

        } catch (Exception $e) {
            Log::error('VNPay Partial Refund Error: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'refund_amount' => $refundAmount
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Kiểm tra trạng thái hoàn tiền từ VNPay
     */
    public function queryRefundStatus(string $vnpayTransactionId, string $refundTransactionId): array
    {
        try {
            $requestData = [
                'vnp_RequestId' => $this->generateRequestId(),
                'vnp_Version' => $this->vnp_Api_Version,
                'vnp_Command' => 'querydr',
                'vnp_TmnCode' => $this->vnp_TmnCode,
                'vnp_TxnRef' => $refundTransactionId,
                'vnp_OrderInfo' => 'Truy van ket qua hoan tien',
                'vnp_TransactionNo' => $vnpayTransactionId,
                'vnp_TransDate' => date('YmdHis'),
                'vnp_CreateDate' => date('YmdHis'),
                'vnp_IpAddr' => request()->ip() ?? '127.0.0.1'
            ];

            // Tạo chữ ký
            $requestData['vnp_SecureHash'] = $this->generateSecureHash($requestData);

            // Gọi API VNPay
            $response = Http::timeout(30)->post($this->vnp_ApiUrl, $requestData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                Log::info('VNPay Query Refund Status Response', [
                    'transaction_id' => $vnpayTransactionId,
                    'refund_transaction_id' => $refundTransactionId,
                    'response' => $responseData
                ]);

                return [
                    'success' => true,
                    'data' => $responseData
                ];
            }

            throw new Exception('VNPay API call failed: ' . $response->body());

        } catch (Exception $e) {
            Log::error('VNPay Query Refund Status Error: ' . $e->getMessage(), [
                'transaction_id' => $vnpayTransactionId,
                'refund_transaction_id' => $refundTransactionId
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Gọi API VNPay để thực hiện hoàn tiền
     */
    private function callVNPayRefundAPI(string $transactionId, float $amount, string $refundRef, string $reason): array
    {
        $requestData = [
            'vnp_RequestId' => $this->generateRequestId(),
            'vnp_Version' => $this->vnp_Api_Version,
            'vnp_Command' => 'refund',
            'vnp_TmnCode' => $this->vnp_TmnCode,
            'vnp_TransactionType' => '02', // 02: Hoàn tiền toàn phần, 03: Hoàn tiền một phần
            'vnp_TxnRef' => $refundRef,
            'vnp_Amount' => intval($amount * 100), // VNPay yêu cầu số tiền tính bằng đồng
            'vnp_OrderInfo' => $reason ?: 'Hoan tien don hang',
            'vnp_TransactionNo' => $transactionId,
            'vnp_TransDate' => date('YmdHis'),
            'vnp_CreateDate' => date('YmdHis'),
            'vnp_CreateBy' => 'System',
            'vnp_IpAddr' => request()->ip() ?? '127.0.0.1'
        ];

        // Tạo chữ ký
        $requestData['vnp_SecureHash'] = $this->generateSecureHash($requestData);

        Log::info('VNPay Refund API Request', [
            'request_data' => $requestData,
            'transaction_id' => $transactionId,
            'amount' => $amount
        ]);

        // Gọi API VNPay
        $response = Http::timeout(30)->post($this->vnp_ApiUrl, $requestData);

        if ($response->successful()) {
            $responseData = $response->json();
            
            Log::info('VNPay Refund API Response', [
                'response_data' => $responseData,
                'transaction_id' => $transactionId
            ]);

            return $responseData;
        }

        throw new Exception('VNPay API call failed: ' . $response->body());
    }

    /**
     * Tạo bản ghi hoàn tiền trong database
     */
    private function createRefundRecord(Order $order, float $refundAmount, string $refundType, string $reason, ?int $requestedBy): Refund
    {
        return Refund::create([
            'order_id' => $order->id,
            'user_id' => $requestedBy,
            'refund_number' => Refund::generateRefundNumber(),
            'refund_type' => $refundType,
            'refund_amount' => $refundAmount,
            'original_amount' => $order->total,
            'status' => Refund::STATUS_PENDING,
            'refund_method' => Refund::METHOD_VNPAY,
            'vnpay_txn_ref' => $order->payment_transaction_id,
            'reason' => $reason
        ]);
    }

    /**
     * Kiểm tra điều kiện hoàn tiền
     */
    private function validateRefundConditions(Order $order): void
    {
        if ($order->payment_method !== 'vnpay') {
            throw new Exception('Đơn hàng không được thanh toán bằng VNPay');
        }

        if ($order->payment_status !== 'completed') {
            throw new Exception('Đơn hàng chưa được thanh toán thành công');
        }

        if (empty($order->payment_transaction_id)) {
            throw new Exception('Không tìm thấy mã giao dịch VNPay');
        }

        // Kiểm tra xem đã có hoàn tiền thành công chưa
        $existingRefund = $order->refunds()->where('status', Refund::STATUS_COMPLETED)->first();
        if ($existingRefund) {
            throw new Exception('Đơn hàng đã được hoàn tiền trước đó');
        }
    }

    /**
     * Kiểm tra số tiền hoàn tiền một phần
     */
    private function validatePartialRefundAmount(Order $order, float $refundAmount): void
    {
        if ($refundAmount <= 0) {
            throw new Exception('Số tiền hoàn tiền phải lớn hơn 0');
        }

        if ($refundAmount > $order->payment_amount) {
            throw new Exception('Số tiền hoàn tiền không được vượt quá số tiền đã thanh toán');
        }

        // Kiểm tra tổng số tiền đã hoàn trước đó
        $totalRefunded = $order->refunds()
            ->where('status', Refund::STATUS_COMPLETED)
            ->sum('refund_amount');

        if (($totalRefunded + $refundAmount) > $order->payment_amount) {
            throw new Exception('Tổng số tiền hoàn tiền vượt quá số tiền đã thanh toán');
        }
    }

    /**
     * Tạo chữ ký bảo mật
     */
    private function generateSecureHash(array $data): string
    {
        // Loại bỏ vnp_SecureHash nếu có
        unset($data['vnp_SecureHash']);
        
        // Sắp xếp theo key
        ksort($data);
        
        // Tạo chuỗi hash
        $hashData = "";
        foreach ($data as $key => $value) {
            if (strlen($value) > 0) {
                $hashData .= $key . "=" . $value . "&";
            }
        }
        
        $hashData = rtrim($hashData, '&');
        
        return hash_hmac('sha512', $hashData, $this->vnp_HashSecret);
    }

    /**
     * Tạo Request ID duy nhất
     */
    private function generateRequestId(): string
    {
        return date('YmdHis') . rand(100000, 999999);
    }

    /**
     * Chuyển đổi phản hồi VNPay thành trạng thái hoàn tiền
     */
    private function mapVNPayResponseToStatus(array $response): string
    {
        $responseCode = $response['vnp_ResponseCode'] ?? '';
        
        switch ($responseCode) {
            case '00':
                return Refund::STATUS_COMPLETED;
            case '01':
            case '02':
                return Refund::STATUS_PROCESSING;
            default:
                return Refund::STATUS_FAILED;
        }
    }
}