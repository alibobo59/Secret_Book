<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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

    public function createPaymentUrl($order, $ipAddr)
    {
        $vnp_TxnRef = $order->order_number;
        $vnp_OrderInfo = "Thanh toan don hang: " . $order->order_number;
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $order->total * 100; // VNPay requires amount in VND * 100
        $vnp_Locale = 'vn';
        $vnp_BankCode = '';
        $vnp_IpAddr = $this->getClientIpAddress($ipAddr);

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $this->vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $this->vnp_ReturnUrl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        if (isset($vnp_BankCode) && $vnp_BankCode != "") {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        }

        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $this->vnp_Url . "?" . $query;
        if (isset($this->vnp_HashSecret)) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $this->vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        // Log payment creation details for debugging
        Log::info('VNPay Payment URL Created', [
            'order_number' => $vnp_TxnRef,
            'amount' => $vnp_Amount,
            'ip_address' => $vnp_IpAddr,
            'create_date' => $inputData['vnp_CreateDate'],
            'hash_data' => $hashdata,
            'secure_hash' => $vnpSecureHash
        ]);

        return $vnp_Url;
    }

    public function validateResponse($inputData)
    {
        $vnp_SecureHash = $inputData['vnp_SecureHash'];
        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $hashData = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $this->vnp_HashSecret);
        
        // Log validation details for debugging
        Log::info('VNPay Response Validation', [
            'calculated_hash' => $secureHash,
            'received_hash' => $vnp_SecureHash,
            'hash_data' => $hashData,
            'is_valid' => $secureHash === $vnp_SecureHash
        ]);
        
        return $secureHash === $vnp_SecureHash;
    }

    /**
     * Get the real client IP address from various sources
     * Handles proxy, load balancer, and CDN scenarios
     */
    private function getClientIpAddress($fallbackIp = null)
    {
        // Array of possible IP sources in order of preference
        $ipSources = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',            // Proxy
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];
        
        foreach ($ipSources as $source) {
            if (!empty($_SERVER[$source])) {
                $ip = $_SERVER[$source];
                
                // Handle comma-separated IPs (X-Forwarded-For can contain multiple IPs)
                if (strpos($ip, ',') !== false) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]); // Take the first IP
                }
                
                // Validate IP and ensure it's not a private/reserved IP
                if ($this->isValidPublicIp($ip)) {
                    Log::info('VNPay IP Detection', [
                        'source' => $source,
                        'detected_ip' => $ip,
                        'raw_value' => $_SERVER[$source]
                    ]);
                    return $ip;
                }
            }
        }
        
        // If no valid public IP found, use fallback or default
        $finalIp = $fallbackIp ?: $this->getDefaultPublicIp();
        
        Log::warning('VNPay IP Fallback Used', [
            'fallback_ip' => $finalIp,
            'original_ip' => $fallbackIp,
            'server_remote_addr' => $_SERVER['REMOTE_ADDR'] ?? 'not_set'
        ]);
        
        return $finalIp;
    }
    
    /**
     * Validate if IP is a valid public IP address
     */
    private function isValidPublicIp($ip)
    {
        // First check if it's a valid IP
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            return false;
        }
        
        // Check if it's not a private or reserved IP
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get a default public IP for development/testing
     */
    private function getDefaultPublicIp()
    {
        // For development, you can:
        // 1. Use a fixed public IP
        // 2. Try to get your actual public IP
        // 3. Use a common public IP for testing
        
        // Option 1: Try to get actual public IP (requires internet)
        try {
            $publicIp = file_get_contents('https://api.ipify.org');
            if ($publicIp && $this->isValidPublicIp($publicIp)) {
                return $publicIp;
            }
        } catch (\Exception $e) {
            Log::warning('Failed to get public IP from service', ['error' => $e->getMessage()]);
        }
        
        // Option 2: Use a default public IP (Google DNS)
        // You should replace this with your actual server's public IP
        return '8.8.8.8';
    }
}