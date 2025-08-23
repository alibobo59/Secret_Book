<?php

require_once 'vendor/autoload.php';

// Simulate a POST request to create a book with variations
$testData = [
    'title' => 'Test Book with Variations',
    'sku' => 'TEST-BOOK-' . time(),
    'description' => 'This is a test book with variations',
    'price' => 100000,
    'category_id' => 1,
    'author_id' => 1,
    'publisher_id' => 1,
    'variations' => [
        [
            'attributes' => json_encode(['Size' => 'Small', 'Color' => 'Red']),
            'price' => 95000,
            'stock_quantity' => 10,
            'sku' => 'TEST-BOOK-' . time() . '-SM-RED'
        ],
        [
            'attributes' => json_encode(['Size' => 'Large', 'Color' => 'Blue']),
            'price' => 105000,
            'stock_quantity' => 5,
            'sku' => 'TEST-BOOK-' . time() . '-LG-BLUE'
        ]
    ]
];

echo "Test data for book with variations:\n";
echo json_encode($testData, JSON_PRETTY_PRINT);
echo "\n\n";

// Test JSON decoding of attributes
foreach ($testData['variations'] as $index => $variation) {
    echo "Variation {$index}:\n";
    echo "Attributes JSON: " . $variation['attributes'] . "\n";
    $decoded = json_decode($variation['attributes'], true);
    echo "Decoded attributes: ";
    var_dump($decoded);
    echo "JSON decode error: " . json_last_error_msg() . "\n\n";
}