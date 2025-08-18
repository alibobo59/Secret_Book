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
        if (Schema::hasTable('coupons')) {
            Schema::table('coupons', function (Blueprint $table) {
                if (Schema::hasColumn('coupons', 'valid_from')) {
                    $table->dropIndex('idx_coupon_validity');
                }
                if (Schema::hasColumn('coupons', 'usage_count')) {
                    $table->dropIndex('idx_coupon_usage');
                }
                if (Schema::hasColumn('coupons', 'type')) {
                    $table->dropIndex('idx_coupon_type_active');
                }
                if (Schema::hasColumn('coupons', 'name')) {
                    $table->dropIndex('idx_coupon_name');
                }
                if (Schema::hasColumn('coupons', 'code')) {
                    $table->dropIndex('idx_coupon_code_upper');
                }
            });
        }
    }
};