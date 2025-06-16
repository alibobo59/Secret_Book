<?php
// Migrations
// database/migrations/2025_06_16_000001_alter_books_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('books', function (Blueprint $table) {
            $table->text('description')->nullable()->after('title');
            $table->decimal('price', 15, 0)->change();

            $table->string('sku')->unique()->after('price');
            $table->renameColumn('stock', 'stock_quantity');
            $table->integer('stock_quantity')->nullable()->change();
            $table->unsignedBigInteger('category_id')->nullable()->change();
            $table->unsignedBigInteger('author_id')->nullable()->change();
            $table->unsignedBigInteger('publisher_id')->nullable()->change();
            $table->dropForeign(['category_id']);
            $table->dropForeign(['author_id']);
            $table->dropForeign(['publisher_id']);
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('author_id')->references('id')->on('authors')->onDelete('set null');
            $table->foreign('publisher_id')->references('id')->on('publishers')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn('description');
            $table->unsignedBigInteger('price')->change();
            $table->dropColumn('sku');
            $table->renameColumn('stock_quantity', 'stock');
            $table->integer('stock')->default(0)->change();
            $table->unsignedBigInteger('category_id')->change();
            $table->unsignedBigInteger('author_id')->change();
            $table->unsignedBigInteger('publisher_id')->change();
            $table->dropForeign(['category_id']);
            $table->dropForeign(['author_id']);
            $table->dropForeign(['publisher_id']);
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('author_id')->references('id')->on('authors')->onDelete('cascade');
            $table->foreign('publisher_id')->references('id')->on('publishers')->onDelete('cascade');
        });
    }
};
