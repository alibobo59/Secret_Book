<?php

/**
 * Test script for VNPay payment callback with stock update for variations
 * This script tests the stock management when VNPay payment is successful
 */

require_once 'vendor/autoload.php';

// Test configuration
$baseUrl = 'http://localhost:8000/api';
$testOrderNumber = 'ORD-' . date('YmdHis');

echo "=== VNPay Stock Update Test ===\n";
echo "Testing stock management for book variations after successful payment\n\n";

// Step 1: Create a test order with book variations
echo "Step 1: Creating test order with book variations...\n";

// Mock VNPay callback data for successful payment
$vnpayCallbackData = [
    'vnp_Amount' => '50000', // 500.00 VND * 100
    'vnp_BankCode' => 'NCB',
    'vnp_BankTranNo' => 'VNP' . time(),
    'vnp_CardType' => 'ATM',
    'vnp_OrderInfo' => 'Thanh toan don hang ' . $testOrderNumber,
    'vnp_PayDate' => date('YmdHis'),
    'vnp_ResponseCode' => '00', // Success code
    'vnp_TmnCode' => 'VNPAY_TEST',
    'vnp_TransactionNo' => time(),
    'vnp_TransactionStatus' => '00',
    'vnp_TxnRef' => $testOrderNumber . '-' . time(),
    'vnp_SecureHashType' => 'SHA256'
];

// Add secure hash (this would normally be calculated by VNPay)
$vnpayCallbackData['vnp_SecureHash'] = 'test_hash_' . md5(json_encode($vnpayCallbackData));

echo "Mock VNPay callback data prepared\n";
echo "Order Number: " . $testOrderNumber . "\n";
echo "Amount: " . ($vnpayCallbackData['vnp_Amount'] / 100) . " VND\n";
echo "Response Code: " . $vnpayCallbackData['vnp_ResponseCode'] . " (Success)\n\n";

// Step 2: Test the VNPay return endpoint
echo "Step 2: Testing VNPay return endpoint...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/payment/vnpay/return');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($vnpayCallbackData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: " . $httpCode . "\n";
echo "Response: " . $response . "\n\n";

if ($httpCode === 200) {
    $responseData = json_decode($response, true);
    if ($responseData && $responseData['success']) {
        echo "✅ VNPay callback processed successfully\n";
        echo "Order ID: " . $responseData['order_id'] . "\n";
        echo "Transaction ID: " . $responseData['transaction_id'] . "\n\n";
        
        // Step 3: Verify stock updates
        echo "Step 3: Verifying stock updates...\n";
        echo "Note: This test assumes an order exists with the test order number\n";
        echo "Expected behavior:\n";
        echo "- Order payment_status should be 'completed'\n";
        echo "- Order status should be 'processing'\n";
        echo "- Book variation stock_quantity should be decremented\n";
        echo "- Regular book stock_quantity should be decremented (if no variation)\n\n";
        
    } else {
        echo "❌ VNPay callback failed\n";
        if (isset($responseData['message'])) {
            echo "Error: " . $responseData['message'] . "\n";
        }
    }
} else {
    echo "❌ HTTP request failed with status: " . $httpCode . "\n";
    echo "Response: " . $response . "\n";
}

// Step 4: Database verification queries
echo "Step 4: Database verification queries\n";
echo "Run these SQL queries to verify the stock updates:\n\n";

echo "-- Check order status and payment details\n";
echo "SELECT id, order_number, status, payment_status, payment_amount, payment_date\n";
echo "FROM orders WHERE order_number = '{$testOrderNumber}';\n\n";

echo "-- Check order items and their variations\n";
echo "SELECT oi.*, bv.variation_type, bv.variation_value, bv.stock_quantity as variation_stock\n";
echo "FROM order_items oi\n";
echo "LEFT JOIN book_variations bv ON oi.variation_id = bv.id\n";
echo "WHERE oi.order_id = (SELECT id FROM orders WHERE order_number = '{$testOrderNumber}');\n\n";

echo "-- Check book stock (for items without variations)\n";
echo "SELECT b.id, b.title, b.stock_quantity\n";
echo "FROM books b\n";
echo "JOIN order_items oi ON b.id = oi.book_id\n";
echo "WHERE oi.order_id = (SELECT id FROM orders WHERE order_number = '{$testOrderNumber}')\n";
echo "AND oi.variation_id IS NULL;\n\n";

echo "=== Test Complete ===\n";
echo "Note: For a complete test, you need to:\n";
echo "1. Create an actual order with book variations\n";
echo "2. Use the real VNPay signature validation\n";
echo "3. Verify the stock quantities before and after payment\n";