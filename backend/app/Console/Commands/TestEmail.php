<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Models\Order;
use App\Mail\OrderStatusChanged;

class TestEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {email} {--order-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email functionality with Gmail SMTP';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $orderId = $this->option('order-id');
        
        $this->info('Testing email functionality...');
        
        try {
            if ($orderId) {
                // Test with actual order
                $order = Order::with(['user', 'items.book', 'address'])->find($orderId);
                
                if (!$order) {
                    $this->error('Order not found with ID: ' . $orderId);
                    return 1;
                }
                
                Mail::to($email)->send(new OrderStatusChanged($order, 'pending', 'confirmed'));
                $this->info('Order status change email sent successfully to: ' . $email);
            } else {
                // Send simple test email
                Mail::raw('Đây là email thử nghiệm từ hệ thống Laravel với Gmail SMTP. Cấu hình email đã hoạt động thành công!', function ($message) use ($email) {
                    $message->to($email)
                           ->subject('Test Email - Hệ thống hoạt động tốt!');
                });
                $this->info('Test email sent successfully to: ' . $email);
            }
            
            $this->info('Email configuration is working properly!');
            return 0;
            
        } catch (\Exception $e) {
            // Dòng 61
            $this->error('Gửi email thất bại: ' . $e->getMessage());
            return 1;
        }
    }
}
