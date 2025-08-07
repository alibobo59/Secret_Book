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
        Schema::table('coupons', function (Blueprint $table) {
            // Skip if indexes already exist
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropIndex('idx_coupon_validity');
            $table->dropIndex('idx_coupon_usage');
            $table->dropIndex('idx_coupon_type_active');
            $table->dropIndex('idx_coupon_name');
            $table->dropIndex('idx_coupon_code_upper');
        });
    }
};