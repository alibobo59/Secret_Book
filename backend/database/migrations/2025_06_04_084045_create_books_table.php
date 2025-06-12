<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->decimal('price', 8, 2);
            $table->foreignId('category_id')->constrained()->onDelete('restrict');
            $table->foreignId('author_id')->constrained()->onDelete('restrict');
            $table->foreignId('publisher_id')->constrained()->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('books');
    }
};
