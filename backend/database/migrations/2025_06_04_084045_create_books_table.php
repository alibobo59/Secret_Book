<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();

            // --- THIS IS THE CORRECTED LINE for VND ---
            // Creates a large, positive integer column, perfect for whole-number currencies.
            $table->unsignedBigInteger('price');

            $table->string('sku')->unique();
            $table->integer('stock_quantity')->nullable();

            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('author_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('publisher_id')->nullable()->constrained()->onDelete('set null');

            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
