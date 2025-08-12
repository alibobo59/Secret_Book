<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookVariationsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('book_variations')->insert([
            [
                'book_id' => 2, // 1984
                'attributes' => json_encode(['format' => 'hardcover']),
                'price' => 1599, // 15.99 * 100 for decimal(15,0)
                'stock_quantity' => 50,
                'sku' => 'BOOK-000002-HC',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'book_id' => 2, // 1984
                'attributes' => json_encode(['format' => 'paperback']),
                'price' => 1099,
                'stock_quantity' => 80,
                'sku' => 'BOOK-000002-PB',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Update 1984 to have no stock_quantity (variable book)
        DB::table('books')->where('id', 2)->update(['stock_quantity' => null]);
    }
};
