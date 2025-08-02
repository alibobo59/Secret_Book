<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('payment_method', ['cod', 'vnpay', 'bank_transfer'])
                  ->default('cod')
                  ->after('status');
            
            $table->enum('payment_status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
                  ->default('pending')
                  ->after('payment_method');
            
            $table->string('payment_transaction_id', 100)
                  ->nullable()
                  ->after('payment_status')
                  ->comment('VNPay transaction ID or other payment gateway reference');
            
            $table->decimal('payment_amount', 15, 2)
                  ->nullable()
                  ->after('payment_transaction_id')
                  ->comment('Actual amount paid (may differ from total due to promotions)');
            
            $table->timestamp('payment_date')
                  ->nullable()
                  ->after('payment_amount')
                  ->comment('Date when payment was completed');
            
            $table->json('payment_details')
                  ->nullable()
                  ->after('payment_date')
                  ->comment('Additional payment gateway response data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'payment_status', 
                'payment_transaction_id',
                'payment_amount',
                'payment_date',
                'payment_details'
            ]);
        });
    }
};
