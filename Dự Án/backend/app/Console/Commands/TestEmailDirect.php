<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlaced;
use App\Models\Order;
use App\Models\User;

class TestEmailDirect extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:email-direct {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email sending directly (not queued)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info('Testing direct email sending to: ' . $email);
        
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
            // Send email directly (not queued)
            Mail::to($email)->send(new OrderPlaced($order));
            
            $this->info('Email sent successfully!');
            $this->info('Email sent to: ' . $email);
            $this->info('Order ID: ' . $order->id);
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Failed to send email: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }
    }
}