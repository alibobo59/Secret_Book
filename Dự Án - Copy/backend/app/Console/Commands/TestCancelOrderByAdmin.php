<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Mail\OrderCancelledByAdmin;
use Illuminate\Support\Facades\Mail;

class TestCancelOrderByAdmin extends Command
{
    protected $signature = 'test:cancel-order-by-admin {order_id?} {--email=}';
    protected $description = 'Test cancelling an order by admin and sending email notification';

    public function handle()
    {
        $orderId = $this->argument('order_id');
        $testEmail = $this->option('email');
        
        // If no order ID provided, find the first non-cancelled order
        if (!$orderId) {
            $order = Order::with(['items.book', 'user', 'address.province', 'address.wardModel'])
                ->whereNotIn('status', ['cancelled'])
                ->first();
                
            if (!$order) {
                $this->error('No available orders found for testing.');
                return 1;
            }
            
            $orderId = $order->id;
        } else {
            $order = Order::with(['items.book', 'user', 'address.province', 'address.wardModel'])
                ->find($orderId);
                
            if (!$order) {
                $this->error("Order with ID {$orderId} not found.");
                return 1;
            }
        }
        
        $this->info("Testing order cancellation by admin for Order ID: {$order->id}");
        $this->info("Order status: {$order->status}");
        
        // Determine email to send to
        $emailTo = $testEmail ?: ($order->user ? $order->user->email : null);
        
        if (!$emailTo) {
            $this->error('No email address available for testing.');
            return 1;
        }
        
        $this->info("Email will be sent to: {$emailTo}");
        
        // Validate email
        if (!filter_var($emailTo, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address.');
            return 1;
        }
        
        try {
            $reason = 'Đơn hàng bị hủy do kiểm tra hệ thống email';
            
            // Queue the email
            Mail::to($emailTo)->queue(new OrderCancelledByAdmin($order, $reason));
            
            $this->info('✅ Order cancellation email has been queued successfully!');
            $this->info('📧 Email queued to: ' . $emailTo);
            $this->info('📝 Cancellation reason: ' . $reason);
            $this->info('🔄 Run "php artisan queue:work --once --verbose" to process the email.');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to queue email: ' . $e->getMessage());
            return 1;
        }
    }
}