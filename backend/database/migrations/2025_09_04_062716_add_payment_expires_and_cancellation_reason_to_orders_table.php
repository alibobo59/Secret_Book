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
            // TTL for VNPay payment window
            $table->dateTime('payment_expires_at')->nullable()->after('payment_date');
            // Reason to show on UI when auto-cancel or manual cancel
            $table->string('cancellation_reason')->nullable()->after('status');

            // Optional index to query expired pending orders fast
            $table->index('payment_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['payment_expires_at']);
            $table->dropColumn(['payment_expires_at', 'cancellation_reason']);
        });
    }
};
