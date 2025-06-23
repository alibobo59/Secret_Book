<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('restrict'); // Authenticated users only
            $table->string('order_number')->unique(); // e.g., ORD-2025-0001
            $table->unsignedBigInteger('subtotal'); // Store in VND
            $table->unsignedBigInteger('tax');      // Store in VND
            $table->unsignedBigInteger('shipping'); // Store in VND
            $table->unsignedBigInteger('total');    // Store in VND
            $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
