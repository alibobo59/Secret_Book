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
            // Make book_id nullable and remove foreign key constraint
            $table->dropForeign(['book_id']);
            $table->unsignedBigInteger('book_id')->nullable()->change();
            
            // Add book snapshot fields
            $table->string('book_title')->nullable()->after('book_id');
            $table->string('book_sku')->nullable()->after('book_title');
            $table->text('book_description')->nullable()->after('book_sku');
            $table->string('book_image')->nullable()->after('book_description');
            $table->string('author_name')->nullable()->after('book_image');
            $table->string('publisher_name')->nullable()->after('author_name');
            $table->string('category_name')->nullable()->after('publisher_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Remove book snapshot fields
            $table->dropColumn([
                'book_title',
                'book_sku', 
                'book_description',
                'book_image',
                'author_name',
                'publisher_name',
                'category_name'
            ]);
            
            // Restore book_id foreign key constraint
            $table->unsignedBigInteger('book_id')->nullable(false)->change();
            $table->foreign('book_id')->references('id')->on('books')->onDelete('restrict');
        });
    }
};
