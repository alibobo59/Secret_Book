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
        Schema::table('cart_items', function (Blueprint $table) {
            // Drop the old unique constraint
            $table->dropUnique(['cart_id', 'book_id']);
            
            // Add new unique constraint that includes variation_id
            $table->unique(['cart_id', 'book_id', 'variation_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            // Drop the new unique constraint
            $table->dropUnique(['cart_id', 'book_id', 'variation_id']);
            
            // Restore the old unique constraint
            $table->unique(['cart_id', 'book_id']);
        });
    }
};