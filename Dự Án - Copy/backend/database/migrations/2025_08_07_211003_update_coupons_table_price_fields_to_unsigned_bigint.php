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
            // Thay đổi các trường liên quan đến giá tiền thành unsigned bigInt
            $table->unsignedBigInteger('value')->change()->comment('Giá trị giảm giá (đơn vị: đồng)');
            $table->unsignedBigInteger('minimum_amount')->nullable()->change()->comment('Số tiền tối thiểu để áp dụng (đơn vị: đồng)');
            $table->unsignedBigInteger('maximum_discount')->nullable()->change()->comment('Số tiền giảm tối đa (đơn vị: đồng)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            // Khôi phục lại kiểu dữ liệu decimal ban đầu
            $table->decimal('value', 10, 2)->change()->comment('Giá trị giảm giá');
            $table->decimal('minimum_amount', 10, 2)->nullable()->change()->comment('Số tiền tối thiểu để áp dụng');
            $table->decimal('maximum_discount', 10, 2)->nullable()->change()->comment('Số tiền giảm tối đa (cho loại phần trăm)');
        });
    }
};
