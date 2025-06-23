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
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('book_variation_id')->nullable()->constrained()->onDelete('restrict');
            $table->json('variation_attributes')->nullable(); // Store variation attributes snapshot
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['book_variation_id']);
            $table->dropColumn(['book_variation_id', 'variation_attributes']);
        });
    }
};
