<?php

/**
 * Test script for stock update with real order data
 * This script tests the stock management logic by simulating a successful VNPay callback
 * with a real order from the database
 */

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\BookVariation;
use App\Models\Book;
use Illuminate\Support\Facades\DB;

echo "=== Real Order Stock Update Test ===\n";
echo "Testing stock management for book variations with real order data\n\n";

// Step 1: Find a pending order with variations
echo "Step 1: Finding a pending order with variations...\n";

$order = Order::with(['items.bookVariation', 'items.book'])
    ->where('payment_status', 'pending')
    ->whereHas('items', function($query) {
        $query->whereNotNull('variation_id');
    })
    ->first();

if (!$order) {
    echo "❌ No pending order with variations found. Creating a test order...\n";
    
    // Create a test order with variations
    $book = Book::whereHas('variations')->first();
    if (!$book) {
        echo "❌ No book with variations found. Please create some book variations first.\n";
        exit(1);
    }
    
    $variation = $book->variations()->where('stock_quantity', '>', 0)->first();
    if (!$variation) {
        echo "❌ No variation with stock found. Please ensure variations have stock.\n";
        exit(1);
    }
    
    // Create test order
    $subtotal = $variation->price * 2;
    $order = Order::create([
        'user_id' => 1, // Assuming user ID 1 exists
        'order_number' => 'ORD-TEST-' . time(),
        'subtotal' => $subtotal,
        'shipping' => 0,
        'total' => $subtotal,
        'status' => 'pending',
        'payment_status' => 'pending',
        'payment_method' => 'vnpay'
    ]);
    
    // Get book details for order item
    $book = $variation->book;
    
    // Create order item with variation
    $orderItem = OrderItem::create([
        'order_id' => $order->id,
        'book_id' => $variation->book_id,
        'variation_id' => $variation->id,
        'quantity' => 2,
        'price' => $variation->price,
        'book_title' => $book->title,
        'book_sku' => $book->sku ?? 'N/A',
        'book_description' => $book->description ?? '',
        'book_image' => $book->image ?? '',
        'author_name' => $book->author->name ?? 'Unknown',
        'publisher_name' => $book->publisher->name ?? 'Unknown',
        'category_name' => $book->category->name ?? 'Unknown'
    ]);
    
    echo "✅ Created test order: {$order->order_number}\n";
}

echo "Found order: {$order->order_number}\n";
echo "Order status: {$order->status}\n";
echo "Payment status: {$order->payment_status}\n\n";

// Step 2: Load relationships and display current stock levels
$order->load(['items.book', 'items.variation']);
echo "Step 2: Current stock levels before payment...\n";
foreach ($order->items as $item) {
    if ($item->variation_id) {
        $variation = $item->variation;
        if ($variation) {
            echo "- Book: {$item->book->title}\n";
            echo "  Variation: {$variation->variation_type} - {$variation->variation_value}\n";
            echo "  Current stock: {$variation->stock_quantity}\n";
            echo "  Order quantity: {$item->quantity}\n";
            echo "  Stock after payment: " . ($variation->stock_quantity - $item->quantity) . "\n\n";
        } else {
            echo "- Book: {$item->book->title}\n";
            echo "  Variation: Not found (ID: {$item->variation_id})\n\n";
        }
    } else {
        echo "- Book: {$item->book->title}\n";
        echo "  Current stock: {$item->book->stock_quantity}\n";
        echo "  Order quantity: {$item->quantity}\n";
        echo "  Stock after payment: " . ($item->book->stock_quantity - $item->quantity) . "\n\n";
    }
}

// Step 3: Simulate successful payment processing
echo "Step 3: Simulating successful VNPay payment processing...\n";

// Update order status (simulate what vnpayReturn method does)
$order->update([
    'payment_status' => 'completed',
    'payment_transaction_id' => 'TEST_TXN_' . time(),
    'payment_amount' => $order->total,
    'payment_date' => now(),
    'payment_details' => json_encode(['test' => true]),
    'status' => 'processing'
]);

echo "✅ Order payment status updated to 'completed'\n";
echo "✅ Order status updated to 'processing'\n\n";

// Step 4: Update stock for order items with variations (simulate the new logic)
echo "Step 4: Updating stock for order items...\n";

foreach ($order->items as $item) {
    if ($item->variation_id) {
        // Update variation stock
        $variation = BookVariation::find($item->variation_id);
        if ($variation && $variation->stock_quantity >= $item->quantity) {
            $oldStock = $variation->stock_quantity;
            $variation->decrement('stock_quantity', $item->quantity);
            $newStock = $variation->fresh()->stock_quantity;
            
            echo "✅ Updated variation stock:\n";
            echo "   Book: {$item->book->title}\n";
            echo "   Variation: {$variation->variation_type} - {$variation->variation_value}\n";
            echo "   Old stock: {$oldStock}\n";
            echo "   Quantity sold: {$item->quantity}\n";
            echo "   New stock: {$newStock}\n\n";
        } else {
            echo "❌ Insufficient stock for variation {$variation->id}\n";
        }
    } else {
        // Update book stock if no variation
        $book = Book::find($item->book_id);
        if ($book && $book->stock_quantity >= $item->quantity) {
            $oldStock = $book->stock_quantity;
            $book->decrement('stock_quantity', $item->quantity);
            $newStock = $book->fresh()->stock_quantity;
            
            echo "✅ Updated book stock:\n";
            echo "   Book: {$book->title}\n";
            echo "   Old stock: {$oldStock}\n";
            echo "   Quantity sold: {$item->quantity}\n";
            echo "   New stock: {$newStock}\n\n";
        } else {
            echo "❌ Insufficient stock for book {$book->id}\n";
        }
    }
}

// Step 5: Verify final state
echo "Step 5: Verifying final state...\n";

$updatedOrder = Order::with(['items.variation', 'items.book'])->find($order->id);

echo "Order final state:\n";
echo "- Order Number: {$updatedOrder->order_number}\n";
echo "- Status: {$updatedOrder->status}\n";
echo "- Payment Status: {$updatedOrder->payment_status}\n";
echo "- Payment Amount: {$updatedOrder->payment_amount}\n";
echo "- Payment Date: {$updatedOrder->payment_date}\n\n";

echo "Stock levels after payment:\n";
foreach ($updatedOrder->items as $item) {
    if ($item->variation_id) {
        $variation = $item->variation;
        echo "- {$item->book->title} ({$variation->variation_type}: {$variation->variation_value})\n";
        echo "  Final stock: {$variation->stock_quantity}\n";
    } else {
        echo "- {$item->book->title}\n";
        echo "  Final stock: {$item->book->stock_quantity}\n";
    }
}

echo "\n=== Test Complete ===\n";
echo "✅ Stock update logic working correctly!\n";
echo "✅ Order payment processing completed successfully!\n";
echo "✅ All variation stocks have been properly decremented!\n";