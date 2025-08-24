<?php

// Test API endpoint for creating book with variations
$url = 'http://localhost/Fpoly/DoAnTN/backend/public/api/books';

// Get admin token (you need to replace this with actual admin token)
$token = 'your_admin_token_here';

// Test data
$postData = [
    'title' => 'Test Book API ' . time(),
    'sku' => 'API-TEST-' . time(),
    'description' => 'Testing API book creation with variations',
    'price' => 150000,
    'category_id' => 1,
    'author_id' => 1,
    'publisher_id' => 1
];

// Add variations data
$postData['variations[0][attributes]'] = json_encode(['Size' => 'Small', 'Format' => 'Paperback']);
$postData['variations[0][price]'] = 140000;
$postData['variations[0][stock_quantity]'] = 15;
$postData['variations[0][sku]'] = 'API-TEST-' . time() . '-SM-PB';

$postData['variations[1][attributes]'] = json_encode(['Size' => 'Large', 'Format' => 'Hardcover']);
$postData['variations[1][price]'] = 160000;
$postData['variations[1][stock_quantity]'] = 8;
$postData['variations[1][sku]'] = 'API-TEST-' . time() . '-LG-HC';

echo "POST Data to be sent:\n";
print_r($postData);
echo "\n";

// Initialize cURL
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($postData),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/x-www-form-urlencoded',
        'Accept: application/json'
    ],
    CURLOPT_VERBOSE => true,
    CURLOPT_STDERR => fopen('php://temp', 'w+')
]);

echo "Making API request to: $url\n";
echo "Note: You need to replace 'your_admin_token_here' with actual admin token\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

if ($error) {
    echo "cURL Error: $error\n";
} else {
    echo "HTTP Status Code: $httpCode\n";
    echo "Response:\n";
    echo $response . "\n";
    
    // Try to decode JSON response
    $jsonResponse = json_decode($response, true);
    if ($jsonResponse) {
        echo "\nParsed Response:\n";
        print_r($jsonResponse);
    }
}

curl_close($ch);