<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlaced;
use App\Models\Order;

class TestQueueWithValidOrder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:queue-valid-order {order_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test queue system with a valid order that has real email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $orderId = $this->argument('order_id');
        
        if (!$orderId) {
            // Find an order with valid email (not admin@example.com)
            $order = Order::with(['items.book', 'user', 'address.province', 'address.wardModel'])
                ->whereHas('user', function($query) {
                    $query->where('email', '!=', 'admin@example.com')
                          ->where('email', 'like', '%@gmail.com');
                })
                ->first();
        } else {
            $order = Order::with(['items.book', 'user', 'address.province', 'address.wardModel'])
                ->find($orderId);
        }
        
        if (!$order) {
            $this->error('No valid order found. Please specify an order ID or ensure there are orders with valid emails.');
            return 1;
        }
        
        if (!$order->user || !$order->user->email) {
            $this->error('Order does not have a valid user email.');
            return 1;
        }
        
        $this->info('Testing queue system with order: ' . $order->id);
        $this->info('User email: ' . $order->user->email);
        
        try {
            // Queue the email
            Mail::to($order->user->email)->queue(new OrderPlaced($order));
            
            $this->info('Test email queued successfully!');
            $this->info('Email will be sent to: ' . $order->user->email);
            $this->info('Order ID: ' . $order->id);
            $this->info('');
            $this->info('Now run: php artisan queue:work --once --verbose');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to queue email: ' . $e->getMessage());
            return 1;
        }
    }
}