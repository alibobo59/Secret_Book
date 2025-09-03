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
        // Đồng bộ với cấu hình VNPay hiện tại (không thay đổi hash/secret, chỉ đọc đúng key)
        $this->vnp_TmnCode = config('services.vnpay.tmn_code');
        $this->vnp_HashSecret = config('services.vnpay.hash_secret');
        $this->vnp_ApiUrl = config('services.vnpay.api_url', 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction');
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

            // Gọi API VNPay để hoàn tiền (TransactionType 02 = Full)
            $vnpayResponse = $this->callVNPayRefundAPI(
                $order,
                $order->payment_amount,
                $refund->refund_number,
                $reason,
                '02'
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

            // Gọi API VNPay để hoàn tiền (TransactionType 03 = Partial)
            $vnpayResponse = $this->callVNPayRefundAPI(
                $order,
                $refundAmount,
                $refund->refund_number,
                $reason,
                '03'
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
    public function queryRefundStatus(Refund $refund): array
    {
        try {
            $order = $refund->order()->firstOrFail();

            $vnpTxnRef = $this->getVnpTxnRefFromOrder($order);
            if (!$vnpTxnRef) {
                throw new Exception('Không tìm thấy vnp_TxnRef của giao dịch thanh toán');
            }

            $vnp_TransactionDate = $this->getVnpTransactionDateFromOrder($order);
            if (!$vnp_TransactionDate) {
                throw new Exception('Không tìm thấy thời gian giao dịch (vnp_TransactionDate/vnp_PayDate)');
            }

            $requestData = [
                'vnp_RequestId' => $this->generateRequestId(),
                'vnp_Version' => $this->vnp_Api_Version,
                'vnp_Command' => 'querydr',
                'vnp_TmnCode' => $this->vnp_TmnCode,
                'vnp_TxnRef' => $vnpTxnRef,
                'vnp_OrderInfo' => 'Query transaction',
                // 'vnp_TransactionNo' => $order->payment_transaction_id, // tuỳ chọn
                'vnp_TransactionDate' => $vnp_TransactionDate,
                'vnp_CreateDate' => date('YmdHis'),
                'vnp_IpAddr' => request()->ip() ?? '127.0.0.1'
            ];

            // Tạo chữ ký theo định dạng querydr của VNPay demo
            $requestData['vnp_SecureHash'] = $this->generateSecureHashForQuery($requestData);

            // Gọi API VNPay
            $response = Http::timeout(30)->asJson()->post($this->vnp_ApiUrl, $requestData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                Log::info('VNPay Query Refund Status Response', [
                    'refund_id' => $refund->id,
                    'order_id' => $order->id,
                    'vnp_TxnRef' => $vnpTxnRef,
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
                'refund_id' => $refund->id,
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
    private function callVNPayRefundAPI(Order $order, float $amount, string $refundRef, string $reason, string $transactionType): array
    {
        $vnpTxnRef = $this->getVnpTxnRefFromOrder($order);
        if (!$vnpTxnRef) {
            throw new Exception('Không tìm thấy vnp_TxnRef của giao dịch thanh toán');
        }

        $vnp_TransactionDate = $this->getVnpTransactionDateFromOrder($order);
        if (!$vnp_TransactionDate) {
            throw new Exception('Không tìm thấy thời gian giao dịch (vnp_TransactionDate/vnp_PayDate)');
        }

        $requestData = [
            'vnp_RequestId' => $this->generateRequestId(),
            'vnp_Version' => $this->vnp_Api_Version,
            'vnp_Command' => 'refund',
            'vnp_TmnCode' => $this->vnp_TmnCode,
            'vnp_TransactionType' => $transactionType, // 02: Hoàn tiền toàn phần, 03: Hoàn tiền một phần
            'vnp_TxnRef' => $vnpTxnRef,
            'vnp_Amount' => intval($amount * 100), // VNPay yêu cầu số tiền tính bằng đồng
            'vnp_OrderInfo' => $reason ?: 'Hoan Tien Giao Dich',
            'vnp_TransactionNo' => $order->payment_transaction_id ?? '0',
            'vnp_TransactionDate' => $vnp_TransactionDate,
            'vnp_CreateDate' => date('YmdHis'),
            'vnp_CreateBy' => $this->buildCreateBy(),
            'vnp_IpAddr' => request()->ip() ?? '127.0.0.1'
        ];

        // Tạo chữ ký theo định dạng refund của VNPay demo
        $requestData['vnp_SecureHash'] = $this->generateSecureHashForRefund($requestData);

        Log::info('VNPay Refund API Request', [
            'request_data' => $requestData,
            'order_id' => $order->id,
            'refund_ref' => $refundRef,
            'amount' => $amount
        ]);

        // Gọi API VNPay (JSON)
        $response = Http::timeout(30)->asJson()->post($this->vnp_ApiUrl, $requestData);

        if ($response->successful()) {
            $responseData = $response->json();
            
            Log::info('VNPay Refund API Response', [
                'response_data' => $responseData,
                'order_id' => $order->id
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
            // Lưu đúng TxnRef của giao dịch thanh toán VNPay để dùng cho refund/querydr
            'vnpay_txn_ref' => $this->getVnpTxnRefFromOrder($order),
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

        if (!in_array($order->payment_status, ['completed', 'paid'])) {
            throw new Exception('Đơn hàng chưa được thanh toán thành công');
        }

        if (empty($order->payment_transaction_id)) {
            throw new Exception('Không tìm thấy mã giao dịch VNPay (vnp_TransactionNo)');
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
     * Tạo chữ ký bảo mật chung (KHÔNG dùng cho refund/querydr)
     */
    private function generateSecureHash(array $data): string
    {
        unset($data['vnp_SecureHash']);
        ksort($data);
        $hashData = "";
        foreach ($data as $key => $value) {
            if (strlen((string)$value) > 0) {
                $hashData .= $key . "=" . $value . "&";
            }
        }
        $hashData = rtrim($hashData, '&');
        return hash_hmac('sha512', $hashData, $this->vnp_HashSecret);
    }

    /**
     * Tạo chữ ký cho API Refund theo demo VNPAY (đúng thứ tự các trường, nối bằng |)
     */
    private function generateSecureHashForRefund(array $d): string
    {
        $format = '%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s|%s';
        $dataHash = sprintf(
            $format,
            $d['vnp_RequestId'] ?? '',
            $d['vnp_Version'] ?? '',
            $d['vnp_Command'] ?? '',
            $d['vnp_TmnCode'] ?? '',
            $d['vnp_TransactionType'] ?? '',
            $d['vnp_TxnRef'] ?? '',
            $d['vnp_Amount'] ?? '',
            $d['vnp_TransactionNo'] ?? '',
            $d['vnp_TransactionDate'] ?? '',
            $d['vnp_CreateBy'] ?? '',
            $d['vnp_CreateDate'] ?? '',
            $d['vnp_IpAddr'] ?? '',
            $d['vnp_OrderInfo'] ?? ''
        );
        return hash_hmac('SHA512', $dataHash, $this->vnp_HashSecret);
    }

    /**
     * Tạo chữ ký cho API Querydr theo demo VNPAY (đúng thứ tự các trường, nối bằng |)
     */
    private function generateSecureHashForQuery(array $d): string
    {
        $format = '%s|%s|%s|%s|%s|%s|%s|%s|%s';
        $dataHash = sprintf(
            $format,
            $d['vnp_RequestId'] ?? '',
            $d['vnp_Version'] ?? '',
            $d['vnp_Command'] ?? '',
            $d['vnp_TmnCode'] ?? '',
            $d['vnp_TxnRef'] ?? '',
            $d['vnp_TransactionDate'] ?? '',
            $d['vnp_CreateDate'] ?? '',
            $d['vnp_IpAddr'] ?? '',
            $d['vnp_OrderInfo'] ?? ''
        );
        return hash_hmac('SHA512', $dataHash, $this->vnp_HashSecret);
    }

    /**
     * Tạo Request ID duy nhất
     */
    private function generateRequestId(): string
    {
        return date('YmdHis') . rand(100000, 999999);
    }

    /**
     * Lấy vnp_TxnRef từ payment_details của Order
     */
    private function getVnpTxnRefFromOrder(Order $order): ?string
    {
        $details = $this->getPaymentDetailsArray($order);
        return $details['vnp_TxnRef'] ?? null;
    }

    /**
     * Lấy vnp_TransactionDate từ payment_details (ưu tiên vnp_PayDate), fallback payment_date của Order
     */
    private function getVnpTransactionDateFromOrder(Order $order): ?string
    {
        $details = $this->getPaymentDetailsArray($order);
        if (!empty($details['vnp_PayDate'])) {
            return $details['vnp_PayDate'];
        }
        if (!empty($order->payment_date)) {
            return date('YmdHis', strtotime($order->payment_date));
        }
        return null;
    }

    private function getPaymentDetailsArray(Order $order): array
    {
        if (is_array($order->payment_details)) {
            return $order->payment_details;
        }
        if (is_string($order->payment_details)) {
            $decoded = json_decode($order->payment_details, true);
            return is_array($decoded) ? $decoded : [];
        }
        return [];
    }

    /**
     * Xây dựng giá trị vnp_CreateBy
     */
    private function buildCreateBy(): string
    {
        // Có thể gắn thông tin hệ thống/người dùng tại đây
        return 'System';
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