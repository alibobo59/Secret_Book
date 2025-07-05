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
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('Mã khuyến mại');
            $table->string('name')->comment('Tên khuyến mại');
            $table->text('description')->nullable()->comment('Mô tả khuyến mại');
            $table->enum('type', ['percentage', 'fixed'])->comment('Loại giảm giá: phần trăm hoặc số tiền cố định');
            $table->decimal('value', 10, 2)->comment('Giá trị giảm giá');
            $table->decimal('minimum_amount', 10, 2)->nullable()->comment('Số tiền tối thiểu để áp dụng');
            $table->decimal('maximum_discount', 10, 2)->nullable()->comment('Số tiền giảm tối đa (cho loại phần trăm)');
            $table->integer('usage_limit')->nullable()->comment('Giới hạn số lần sử dụng');
            $table->integer('used_count')->default(0)->comment('Số lần đã sử dụng');
            $table->integer('usage_limit_per_user')->nullable()->comment('Giới hạn số lần sử dụng mỗi người');
            $table->datetime('start_date')->comment('Ngày bắt đầu');
            $table->datetime('end_date')->comment('Ngày kết thúc');
            $table->boolean('is_active')->default(true)->comment('Trạng thái hoạt động');
            $table->timestamps();
            
            $table->index(['code', 'is_active']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};