<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookVariationsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('book_variations')->insert([
            // Truyện Kiều - Nguyễn Du (2 biến thể)
            [
                'book_id' => 1, // Truyện Kiều
                'attributes' => json_encode(['hình thức' => 'bìa cứng']),
                'price' => 180000,
                'stock_quantity' => 50,
                'sku' => 'BOOK-TK-001-BC',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'book_id' => 1, // Truyện Kiều
                'attributes' => json_encode(['hình thức' => 'bìa mềm']),
                'price' => 150000,
                'stock_quantity' => 80,
                'sku' => 'BOOK-TK-001-BM',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Dế Mèn Phiêu Lưu Ký - Tô Hoài (4 biến thể: bìa cứng/mềm + tiếng Việt/tiếng Anh)
            [
                'book_id' => 2, 
                'attributes' => json_encode(['hình thức' => 'bìa cứng', 'ngôn ngữ' => 'tiếng Việt']),
                'price' => 160000,
                'stock_quantity' => 60,
                'sku' => 'BOOK-DM-002-BC-VI',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'book_id' => 2,
                'attributes' => json_encode(['hình thức' => 'bìa mềm', 'ngôn ngữ' => 'tiếng Việt']),
                'price' => 120000,
                'stock_quantity' => 100,
                'sku' => 'BOOK-DM-002-BM-VI',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'book_id' => 2,
                'attributes' => json_encode(['hình thức' => 'bìa cứng', 'ngôn ngữ' => 'tiếng Anh']),
                'price' => 200000,
                'stock_quantity' => 40,
                'sku' => 'BOOK-DM-002-BC-EN',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'book_id' => 2,
                'attributes' => json_encode(['hình thức' => 'bìa mềm', 'ngôn ngữ' => 'tiếng Anh']),
                'price' => 140000,
                'stock_quantity' => 75,
                'sku' => 'BOOK-DM-002-BM-EN',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Update "Dế Mèn Phiêu Lưu Ký" thành sách biến thể => bỏ số lượng chính
        DB::table('books')->where('id', 2)->update(['stock_quantity' => null]);
    }
}
