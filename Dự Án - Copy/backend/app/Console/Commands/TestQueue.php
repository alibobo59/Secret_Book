<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlaced;
use App\Models\Order;

class TestQueue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:queue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test queue system by sending a test email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing queue system...');
        
        // Get the first order for testing
        $order = Order::with(['user', 'items', 'address'])->first();
        
        if (!$order) {
            $this->error('No orders found in database. Please create an order first.');
            return 1;
        }
        
        if (!$order->user || !$order->user->email) {
            $this->error('Order does not have a user with email.');
            return 1;
        }
        
        try {
            // Queue the email
            Mail::to($order->user->email)->queue(new OrderPlaced($order));
            
            $this->info('Test email queued successfully!');
            $this->info('Email will be sent to: ' . $order->user->email);
            $this->info('Order ID: ' . $order->id);
            $this->info('');
            $this->info('Now run: php artisan queue:work --once');
            $this->info('to process the queued job.');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to queue email: ' . $e->getMessage());
            return 1;
        }
    }
}