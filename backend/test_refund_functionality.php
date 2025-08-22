<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\Order;
use App\Services\VNPayRefundService;
use Illuminate\Support\Facades\Log;

try {
    echo "=== Test Refund Functionality ===\n";
    
    // Tìm một đơn hàng đã thanh toán thành công với VNPay
    $order = Order::where('payment_method', 'vnpay')
                  ->where('payment_status', 'completed')
                  ->whereNotNull('payment_transaction_id')
                  ->first();
    
    if (!$order) {
        echo "Không tìm thấy đơn hàng VNPay đã thanh toán thành công để test\n";
        exit(1);
    }
    
    echo "Tìm thấy đơn hàng test:\n";
    echo "- ID: {$order->id}\n";
    echo "- Order Number: {$order->order_number}\n";
    echo "- Transaction ID: {$order->payment_transaction_id}\n";
    echo "- Amount: {$order->payment_amount}\n";
    echo "- Created: {$order->created_at}\n\n";
    
    // Khởi tạo VNPay Refund Service
    $refundService = new VNPayRefundService();
    
    echo "=== Test Full Refund ===\n";
    
    // Test hoàn tiền toàn phần
    $result = $refundService->createFullRefund(
        $order,
        'Test full refund from admin',
        1 // Admin user ID
    );
    
    if ($result['success']) {
        echo "✅ Hoàn tiền toàn phần thành công!\n";
        echo "Refund ID: {$result['refund']->id}\n";
        echo "Refund Number: {$result['refund']->refund_number}\n";
        echo "Status: {$result['refund']->status}\n";
        
        if (isset($result['vnpay_response'])) {
            echo "VNPay Response: " . json_encode($result['vnpay_response'], JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "❌ Hoàn tiền toàn phần thất bại!\n";
        echo "Error: {$result['error']}\n";
    }
    
    echo "\n=== Test Partial Refund ===\n";
    
    // Tìm đơn hàng khác để test hoàn tiền một phần
    $order2 = Order::where('payment_method', 'vnpay')
                   ->where('payment_status', 'completed')
                   ->whereNotNull('payment_transaction_id')
                   ->where('id', '!=', $order->id)
                   ->first();
    
    if ($order2) {
        $partialAmount = min(10000, $order2->payment_amount * 0.5); // Hoàn 10k hoặc 50% số tiền
        
        $result2 = $refundService->createPartialRefund(
            $order2,
            $partialAmount,
            'Test partial refund from admin',
            1 // Admin user ID
        );
        
        if ($result2['success']) {
            echo "✅ Hoàn tiền một phần thành công!\n";
            echo "Refund ID: {$result2['refund']->id}\n";
            echo "Refund Number: {$result2['refund']->refund_number}\n";
            echo "Amount: {$partialAmount}\n";
            echo "Status: {$result2['refund']->status}\n";
            
            if (isset($result2['vnpay_response'])) {
                echo "VNPay Response: " . json_encode($result2['vnpay_response'], JSON_PRETTY_PRINT) . "\n";
            }
        } else {
            echo "❌ Hoàn tiền một phần thất bại!\n";
            echo "Error: {$result2['error']}\n";
        }
    } else {
        echo "Không tìm thấy đơn hàng thứ 2 để test hoàn tiền một phần\n";
    }
    
} catch (Exception $e) {
    echo "❌ Lỗi trong quá trình test: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Kiểm tra Log ===\n";
echo "Hãy kiểm tra file log Laravel để xem chi tiết request/response với VNPay\n";
echo "Đường dẫn log: storage/logs/laravel.log\n";