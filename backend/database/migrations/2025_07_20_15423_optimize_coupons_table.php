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
            // Thêm index để tối ưu hóa tìm kiếm
            $table->index(['is_active', 'start_date', 'end_date'], 'idx_coupon_validity');
            $table->index(['usage_limit', 'used_count'], 'idx_coupon_usage');
            $table->index(['type', 'is_active'], 'idx_coupon_type_active');
            
            // Thêm index cho tìm kiếm text
            $table->index(['name'], 'idx_coupon_name');
            
            // Đảm bảo code không phân biệt hoa thường
            $table->rawIndex('UPPER(code)', 'idx_coupon_code_upper');
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