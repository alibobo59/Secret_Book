<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlaced;
use App\Models\Order;
use App\Models\User;

class TestQueueWithEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:queue-email {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test queue system by sending email to specified address';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info('Testing queue system with email: ' . $email);
        
        // Get the first order for testing
        $order = Order::with(['items', 'address'])->first();
        
        if (!$order) {
            $this->error('No orders found in database. Please create an order first.');
            return 1;
        }
        
        // Create a temporary user object for testing
        $testUser = new User();
        $testUser->email = $email;
        $testUser->name = 'Test User';
        
        // Assign the test user to the order
        $order->user = $testUser;
        
        try {
            // Queue the email
            Mail::to($email)->queue(new OrderPlaced($order));
            
            $this->info('Test email queued successfully!');
            $this->info('Email will be sent to: ' . $email);
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