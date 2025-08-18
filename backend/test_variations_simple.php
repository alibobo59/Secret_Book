<?php

// Test script để kiểm tra API tạo sản phẩm có biến thể

$url = 'http://localhost/Fpoly/DoAnTN/backend/public/api/books';

// Dữ liệu test cho sản phẩm có biến thể
$postData = [
    'title' => 'Test Book With Variations',
    'sku' => 'TEST-BOOK-' . time(),
    'description' => 'Test book description',
    'price' => 100000,
    'category_id' => 1,
    'author_id' => 1,
    'publisher_id' => 1,
    'variations' => [
        [
            'attributes' => json_encode(['Size' => 'S', 'Color' => 'Red']),
            'price' => 95000,
            'stock_quantity' => 10,
            'sku' => 'TEST-VAR-S-RED-' . time()
        ],
        [
            'attributes' => json_encode(['Size' => 'M', 'Color' => 'Blue']),
            'price' => 105000,
            'stock_quantity' => 15,
            'sku' => 'TEST-VAR-M-BLUE-' . time()
        ]
    ]
];

echo "Testing API endpoint: $url\n";
echo "Post data:\n";
print_r($postData);
echo "\n";

// Khởi tạo cURL
$ch = curl_init();

// Cấu hình cURL
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);

// Thực hiện request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($error) {
    echo "cURL Error: $error\n";
}

echo "Response:\n";
echo $response . "\n";

// Decode JSON response để xem chi tiết
$responseData = json_decode($response, true);
if ($responseData) {
    echo "\nDecoded Response:\n";
    print_r($responseData);
} else {
    echo "\nFailed to decode JSON response\n";
}

?>