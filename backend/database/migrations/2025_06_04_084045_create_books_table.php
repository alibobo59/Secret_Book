<?php
<<<<<<< HEAD
// Migrations
// database/migrations/2025_06_16_000001_create_books_table.php
=======
>>>>>>> 9d6a090 (khong biet noi gi)
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

<<<<<<< HEAD
return new class extends Migration {
    public function up(): void
=======
class CreateBooksTable extends Migration
{
    public function up()
>>>>>>> 9d6a090 (khong biet noi gi)
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
<<<<<<< HEAD
            $table->text('description')->nullable();
            $table->decimal('price', 15, 0);
            $table->string('sku')->unique();
            $table->integer('stock_quantity')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('author_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('publisher_id')->nullable()->constrained()->onDelete('set null');
            $table->string('image')->nullable();
=======

            $table->unsignedBigInteger('price');

            $table->integer('stock')->default(0);
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('author_id');
            $table->unsignedBigInteger('publisher_id');
            $table->string('image')->nullable(); // Primary image path
>>>>>>> 9d6a090 (khong biet noi gi)
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('author_id')->references('id')->on('authors')->onDelete('cascade');
            $table->foreign('publisher_id')->references('id')->on('publishers')->onDelete('cascade');
        });
    }

<<<<<<< HEAD
    public function down(): void
=======
    public function down()
>>>>>>> 9d6a090 (khong biet noi gi)
    {
        Schema::dropIfExists('books');
    }
}
