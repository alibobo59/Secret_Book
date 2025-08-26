<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_embeddings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->json('embedding');
            $table->unsignedSmallInteger('dim');
            $table->string('model', 100)->nullable();
            $table->timestamps();
            $table->unique('book_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_embeddings');
    }
};
