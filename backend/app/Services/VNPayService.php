<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class VNPayService
{
    private $vnp_TmnCode;
    private $vnp_HashSecret;
    private $vnp_Url;
    private $vnp_ReturnUrl;

    public function __construct()
    {
        $this->vnp_TmnCode = config('services.vnpay.tmn_code');
        $this->vnp_HashSecret = config('services.vnpay.hash_secret');
        $this->vnp_Url = config('services.vnpay.url');
        $this->vnp_ReturnUrl = config('services.vnpay.return_url');
    }

    /**
     * Build query string for VNPay URL (for redirect)
     */
    private function buildQueryString($data)
    {
        $query = '';
        foreach ($data as $key => $value) {
            $query .= urlencode($key) . '=' . urlencode($value) . '&';
        }
        return $query;
    }

    public function createPaymentUrl($order, $ipAddr)
    {
        // Đảm bảo IP là IPv4 format
        if (!filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $ipAddr = '127.0.0.1'; // fallback IP
        }
        
        // Đầy đủ tham số theo VNPay documentation
        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $this->vnp_TmnCode,
            "vnp_Amount" => (int)($order->total * 100),
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $ipAddr,
            "vnp_Locale" => "vn",
            "vnp_OrderInfo" => "Thanh toan don hang " . $order->order_number,
            "vnp_OrderType" => "billpayment",
            "vnp_ReturnUrl" => $this->vnp_ReturnUrl,
            "vnp_TxnRef" => $order->order_number,
            // Thêm các tham số bắt buộc khác
            "vnp_ExpireDate" => date('YmdHis', strtotime('+15 minutes')),
        ];

        // Sort by key (critical for VNPay signature)
        ksort($inputData);
        
        // Build hash data for signature (exactly like working PHP example)
        $i = 0;
        $hashData = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        // Generate secure hash
        $vnpSecureHash = hash_hmac('sha512', $hashData, $this->vnp_HashSecret);
        
        // Build query string for URL
        $queryString = $this->buildQueryString($inputData);
        
        // Final URL
        $vnp_Url = $this->vnp_Url . "?" . $queryString . 'vnp_SecureHash=' . $vnpSecureHash;

        Log::info('VNPay Payment URL Creation', [
            'input_data' => $inputData,
            'hash_data' => $hashData,
            'secure_hash' => $vnpSecureHash,
            'final_url' => $vnp_Url
        ]);

        return $vnp_Url;
    }

    public function validateResponse(array $inputData): bool
    {
        $vnp_SecureHash = $inputData['vnp_SecureHash'];
        
        // Remove vnp_SecureHash from validation data (exactly like working PHP example)
        $validationData = [];
        foreach ($inputData as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $validationData[$key] = $value;
            }
        }
        unset($validationData['vnp_SecureHash']);
        
        // Sort by key
        ksort($validationData);
        
        // Build hash data for validation (exactly like working PHP example)
        $i = 0;
        $hashData = "";
        foreach ($validationData as $key => $value) {
            if ($i == 1) {
                $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $this->vnp_HashSecret);
        
        Log::info('VNPay Response Validation', [
            'validation_data' => $validationData,
            'hash_data' => $hashData,
            'received_hash' => $vnp_SecureHash,
            'calculated_hash' => $secureHash,
            'is_valid' => ($secureHash === $vnp_SecureHash)
        ]);

        return $secureHash === $vnp_SecureHash;
    }
}
