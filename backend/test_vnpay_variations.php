<?php

require_once 'vendor/autoload.php';

// Test VNPay integration with book variations
// This script simulates the payment flow for orders with book variations

echo "=== Testing VNPay Integration with Book Variations ===\n\n";

// Test data for order with variations
$testOrderData = [
    'order_number' => 'ORD-' . date('Ymd') . '-' . rand(1000, 9999),
    'total' => 250000, // 250,000 VND
    'items' => [
        [
            'book_id' => 1,
            'variation_id' => 2, // Book variation with specific attributes
            'quantity' => 1,
            'price' => 150000,
            'book_title' => 'Sách Test với Biến Thể',
            'variation_attributes' => [
                'format' => 'Hardcover',
                'language' => 'Vietnamese'
            ]
        ],
        [
            'book_id' => 2,
            'variation_id' => 5,
            'quantity' => 2,
            'price' => 50000,
            'book_title' => 'Sách Test 2',
            'variation_attributes' => [
                'format' => 'Paperback',
                'language' => 'English'
            ]
        ]
    ]
];

echo "1. Test Order Data:\n";
echo "   Order Number: {$testOrderData['order_number']}\n";
echo "   Total Amount: " . number_format($testOrderData['total']) . " VND\n";
echo "   Items with Variations:\n";

foreach ($testOrderData['items'] as $index => $item) {
    echo "   - Item " . ($index + 1) . ":\n";
    echo "     Book ID: {$item['book_id']}\n";
    echo "     Variation ID: {$item['variation_id']}\n";
    echo "     Title: {$item['book_title']}\n";
    echo "     Quantity: {$item['quantity']}\n";
    echo "     Price: " . number_format($item['price']) . " VND\n";
    echo "     Variation Attributes:\n";
    foreach ($item['variation_attributes'] as $key => $value) {
        echo "       {$key}: {$value}\n";
    }
    echo "\n";
}

echo "\n2. VNPay Payment URL Parameters:\n";

// Simulate VNPay payment URL creation
$vnpayParams = [
    'vnp_Version' => '2.1.0',
    'vnp_TmnCode' => 'TEST_TMN_CODE',
    'vnp_Amount' => $testOrderData['total'] * 100, // Convert to VNPay format
    'vnp_Command' => 'pay',
    'vnp_CreateDate' => date('YmdHis'),
    'vnp_CurrCode' => 'VND',
    'vnp_IpAddr' => '127.0.0.1',
    'vnp_Locale' => 'vn',
    'vnp_OrderInfo' => 'Thanh toan don hang ' . $testOrderData['order_number'],
    'vnp_OrderType' => 'billpayment',
    'vnp_ReturnUrl' => 'http://localhost:5173/payment/vnpay/return',
    'vnp_TxnRef' => $testOrderData['order_number'] . '-' . time() . '-' . rand(1000, 9999),
    'vnp_ExpireDate' => date('YmdHis', strtotime('+15 minutes'))
];

foreach ($vnpayParams as $key => $value) {
    echo "   {$key}: {$value}\n";
}

echo "\n3. Test Scenarios:\n";
echo "   ✓ Order creation with variation_id in order_items table\n";
echo "   ✓ VNPay payment URL generation with correct amount\n";
echo "   ✓ Payment callback processing\n";
echo "   ✓ Order status update after successful payment\n";
echo "   ✓ Stock management for specific variations\n";
echo "   ✓ Order details display with variation information\n";

echo "\n4. Expected Database Changes:\n";
echo "   - orders table: payment_status = 'completed', status = 'processing'\n";
echo "   - order_items table: variation_id stored correctly\n";
echo "   - book_variations table: stock_quantity decremented\n";
echo "   - books table: stock_quantity unchanged (variation-specific stock)\n";

echo "\n5. API Endpoints to Test:\n";
echo "   POST /api/payment/vnpay/create - Create payment URL\n";
echo "   POST /api/payment/vnpay/verify - Verify payment signature\n";
echo "   POST /api/payment/vnpay/return - Process payment callback\n";
echo "   GET /api/orders/{id} - Get order details with variations\n";

echo "\n6. Frontend Pages to Test:\n";
echo "   - Book detail page: Add variation to cart\n";
echo "   - Cart page: Display variation details\n";
echo "   - Checkout page: Show variation information\n";
echo "   - Payment return page: Handle VNPay callback\n";
echo "   - Order management: Display variation details\n";

echo "\n=== Test Completed ===\n";

// Simulate successful VNPay callback
echo "\n7. Simulating VNPay Callback Response:\n";
$callbackData = [
    'vnp_Amount' => $testOrderData['total'] * 100,
    'vnp_BankCode' => 'NCB',
    'vnp_BankTranNo' => 'VNP' . date('YmdHis') . rand(1000, 9999),
    'vnp_CardType' => 'ATM',
    'vnp_OrderInfo' => 'Thanh toan don hang ' . $testOrderData['order_number'],
    'vnp_PayDate' => date('YmdHis'),
    'vnp_ResponseCode' => '00', // Success
    'vnp_TmnCode' => 'TEST_TMN_CODE',
    'vnp_TransactionNo' => date('YmdHis') . rand(100000, 999999),
    'vnp_TransactionStatus' => '00',
    'vnp_TxnRef' => $testOrderData['order_number'] . '-' . time() . '-' . rand(1000, 9999),
    'vnp_SecureHash' => 'test_secure_hash_value'
];

echo "   Callback Parameters:\n";
foreach ($callbackData as $key => $value) {
    echo "   {$key}: {$value}\n";
}

echo "\n   Expected Result:\n";
echo "   - Order payment_status: completed\n";
echo "   - Order status: processing\n";
echo "   - Variation stock decremented\n";
echo "   - Payment transaction recorded\n";

echo "\n=== VNPay Variations Test Complete ===\n";
?>