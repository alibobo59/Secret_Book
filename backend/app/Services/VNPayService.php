<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

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
     * Sort object theo cách của VNPay (quan trọng để tránh lỗi signature)
     */
    private function sortObject($obj)
    {
        $sorted = [];
        $str = [];

        foreach ($obj as $key => $value) {
            $str[] = $key;
        }

        sort($str);

        foreach ($str as $key) {
            $sorted[$key] = $this->encodeURIComponent($obj[$key]);
        }

        return $sorted;
    }

    /**
     * Encode URI component giống JavaScript (quan trọng cho VNPay)
     */
    private function encodeURIComponent($str) {
        $revert = ['%21'=>'!', '%2A'=>'*', '%27'=>"'", '%28'=>'(', '%29'=>')'];
        return strtr(rawurlencode($str), $revert);
    }

    /**
     * Tạo query string theo format VNPay yêu cầu
     */
    private function buildQueryString($data)
    {
        $query = '';
        foreach ($data as $key => $value) {
            if ($query != '') {
                $query .= '&';
            }
            // Xử lý khoảng trắng thành + như VNPay yêu cầu
            $encodedValue = str_replace('%20', '+', rawurlencode($value));
            $query .= $key . '=' . $encodedValue;
        }
        return $query;
    }

    public function createPaymentUrl($order, $ipAddr)
    {
        // Đảm bảo IP là IPv4 format
        if (!filter_var($ipAddr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $ipAddr = '127.0.0.1';
        }
        
        // Sử dụng Carbon để đảm bảo timezone đúng
        $now = Carbon::now();
        $expireTime = Carbon::now()->addMinutes(30);
        
        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $this->vnp_TmnCode,
            "vnp_Amount" => (int)($order->total * 100),
            "vnp_Command" => "pay",
            "vnp_CreateDate" => $now->format('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $ipAddr,
            "vnp_Locale" => "vn",
            "vnp_OrderInfo" => "Thanh toan don hang " . $order->order_number,
            "vnp_OrderType" => "other",
            "vnp_ReturnUrl" => $this->vnp_ReturnUrl,
            "vnp_TxnRef" => $order->order_number,
            "vnp_ExpireDate" => $expireTime->format('YmdHis'),
        ];

        // Sắp xếp theo key (quan trọng)
        ksort($inputData);

        // Tạo hash data cho signature
        $hashData = '';
        foreach ($inputData as $key => $value) {
            if ($hashData != '') {
                $hashData .= '&';
            }
            $hashData .= $key . '=' . $value;
        }

        // Tạo secure hash
        $vnpSecureHash = hash_hmac('sha512', $hashData, $this->vnp_HashSecret);

        // Tạo query string cho URL với encoding đúng
        $queryString = $this->buildQueryString($inputData);

        // URL cuối cùng
        $vnp_Url = $this->vnp_Url . "?" . $queryString . '&vnp_SecureHash=' . $vnpSecureHash;

        Log::info('VNPay Payment URL Creation', [
            'input_data' => $inputData,
            'hash_data' => $hashData,
            'secure_hash' => $vnpSecureHash,
            'final_url' => $vnp_Url,
            'timezone' => config('app.timezone'),
            'create_date_formatted' => $now->format('Y-m-d H:i:s T'),
            'expire_date_formatted' => $expireTime->format('Y-m-d H:i:s T')
        ]);

        return $vnp_Url;
    }

    /**
     * Xử lý response từ VNPay bao gồm cả timeout
     */
    public function validateResponse(array $inputData): array
    {
        $vnp_SecureHash = $inputData['vnp_SecureHash'];
        unset($inputData['vnp_SecureHash'], $inputData['vnp_SecureHashType']);
        $hashData = '';
        foreach ($inputData as $key => $value) {
            if ($hashData != '') {
                $hashData .= '&';
            }
            $hashData .= $key . '=' . $value;
        }

        $secureHash = hash_hmac('sha512', $hashData, $this->vnp_HashSecret);
        $isValid = ($secureHash === $vnp_SecureHash);
        
        // Xử lý các mã response code
        $responseCode = $inputData['vnp_ResponseCode'] ?? '';
        $message = $this->getResponseMessage($responseCode);
        
        return [
            'is_valid' => $isValid,
            'response_code' => $responseCode,
            'message' => $message,
            'data' => $inputData
        ];
    }

    /**
     * Lấy thông báo dựa trên response code
     */
    private function getResponseMessage($responseCode)
    {
        $messages = [
            '00' => 'Giao dịch thành công',
            '07' => 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09' => 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10' => 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11' => 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
            '12' => 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
            '13' => 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
            '24' => 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
            '51' => 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
            '65' => 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
            '75' => 'Ngân hàng thanh toán đang bảo trì.',
            '79' => 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
            '99' => 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
        ];
        
        return $messages[$responseCode] ?? 'Lỗi không xác định';
    }
}
