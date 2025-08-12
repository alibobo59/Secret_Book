<?php

/**
 * VNPay IP Detection Test Script
 * 
 * This script helps you test and debug IP detection for VNPay integration
 * Run this script to see what IP addresses are being detected
 */

require_once __DIR__ . '/vendor/autoload.php';

// Simulate different IP scenarios
function testIpDetection() {
    echo "=== VNPay IP Detection Test ===\n\n";
    
    // Display current server variables
    echo "Current Server IP Variables:\n";
    $ipSources = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_CLIENT_IP', 
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_FORWARDED',
        'HTTP_X_CLUSTER_CLIENT_IP',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'
    ];
    
    foreach ($ipSources as $source) {
        $value = $_SERVER[$source] ?? 'Not Set';
        echo "  {$source}: {$value}\n";
    }
    
    echo "\n";
    
    // Test IP validation
    $testIps = [
        '127.0.0.1',        // Local
        '192.168.1.1',      // Private
        '10.0.0.1',         // Private
        '172.16.0.1',       // Private
        '8.8.8.8',          // Public (Google DNS)
        '1.1.1.1',          // Public (Cloudflare DNS)
        'invalid-ip',       // Invalid
        '203.162.71.100'    // Public (Vietnam)
    ];
    
    echo "IP Validation Tests:\n";
    foreach ($testIps as $ip) {
        $isValid = filter_var($ip, FILTER_VALIDATE_IP);
        $isPublic = filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
        
        $status = 'Invalid';
        if ($isValid && $isPublic) {
            $status = 'Valid Public IP';
        } elseif ($isValid) {
            $status = 'Valid Private/Local IP';
        }
        
        echo "  {$ip}: {$status}\n";
    }
    
    echo "\n";
    
    // Try to get public IP
    echo "Attempting to get public IP from external service:\n";
    try {
        $publicIp = @file_get_contents('https://api.ipify.org');
        if ($publicIp) {
            echo "  Detected Public IP: {$publicIp}\n";
        } else {
            echo "  Failed to get public IP\n";
        }
    } catch (Exception $e) {
        echo "  Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
    echo "=== Recommendations ===\n";
    echo "1. If running locally, use ngrok or similar to expose your server\n";
    echo "2. Update VNPAY_RETURN_URL in .env to use public domain/IP\n";
    echo "3. Check server logs for VNPay IP Detection messages\n";
    echo "4. For production, ensure your server has a public IP\n";
}

// Run the test
testIpDetection();

?>