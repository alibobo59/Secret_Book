<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookVariationsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('book_variations')->insert([
            // The Great Gatsby variations
            [
                'book_id' => 1, // The Great Gatsby
                'attributes' => json_encode(['format' => 'hardcover']),
                'price' => 180000, // 180,000 VND
                'stock_quantity' => 50,
                'sku' => 'BOOK-GAT-001-HC',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'book_id' => 1, // The Great Gatsby
                'attributes' => json_encode(['format' => 'paperback']),
                'price' => 150000, // 150,000 VND
                'stock_quantity' => 80,
                'sku' => 'BOOK-GAT-001-PB',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // 1984 variations (4 biến thể)
            [
                'book_id' => 2, // 1984
                'attributes' => json_encode(['format' => 'hardcover', 'language' => 'vietnamese']),
                'price' => 160000, // 160,000 VND
                'stock_quantity' => 60,
                'sku' => 'BOOK-NIN-002-HC-VI',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'book_id' => 2, // 1984
                'attributes' => json_encode(['format' => 'paperback', 'language' => 'vietnamese']),
                'price' => 120000, // 120,000 VND
                'stock_quantity' => 100,
                'sku' => 'BOOK-NIN-002-PB-VI',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'book_id' => 2, // 1984
                'attributes' => json_encode(['format' => 'hardcover', 'language' => 'english']),
                'price' => 200000, // 200,000 VND
                'stock_quantity' => 40,
                'sku' => 'BOOK-NIN-002-HC-EN',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'book_id' => 2, // 1984
                'attributes' => json_encode(['format' => 'paperback', 'language' => 'english']),
                'price' => 140000, // 140,000 VND
                'stock_quantity' => 75,
                'sku' => 'BOOK-NIN-002-PB-EN',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Update 1984 to have no stock_quantity (variable book)
        DB::table('books')->where('id', 2)->update(['stock_quantity' => null]);
    }
};
