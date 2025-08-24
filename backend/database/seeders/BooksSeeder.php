<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BooksSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('books')->insert([
            [
                'title' => 'Cho tôi xin một vé đi tuổi thơ',
                'sku' => 'BOOK-NNA-001',
                'price' => 95000, // VND
                'stock_quantity' => 120,
                'category_id' => 1,
                'author_id' => 1, // Nguyễn Nhật Ánh
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Chí Phèo',
                'sku' => 'BOOK-NC-002',
                'price' => 80000, // VND
                'stock_quantity' => 100,
                'category_id' => 2,
                'author_id' => 2, // Nam Cao
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Tắt đèn',
                'sku' => 'BOOK-NTT-003',
                'price' => 90000, // VND
                'stock_quantity' => 70,
                'category_id' => 3,
                'author_id' => 3, // Ngô Tất Tố
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Số đỏ',
                'sku' => 'BOOK-VTP-004',
                'price' => 85000, // VND
                'stock_quantity' => 65,
                'category_id' => 4,
                'author_id' => 4, // Vũ Trọng Phụng
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Dế mèn phiêu lưu ký',
                'sku' => 'BOOK-TH-005',
                'price' => 100000, // VND
                'stock_quantity' => 80,
                'category_id' => 5,
                'author_id' => 5, // Tô Hoài
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Truyện Kiều',
                'sku' => 'BOOK-ND-006',
                'price' => 150000, // VND
                'stock_quantity' => 50,
                'category_id' => 1,
                'author_id' => 6, // Nguyễn Du
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Thơ tình Xuân Diệu',
                'sku' => 'BOOK-XD-007',
                'price' => 110000, // VND
                'stock_quantity' => 60,
                'category_id' => 2,
                'author_id' => 7, // Xuân Diệu
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Thơ Hàn Mặc Tử',
                'sku' => 'BOOK-HMT-008',
                'price' => 120000, // VND
                'stock_quantity' => 45,
                'category_id' => 3,
                'author_id' => 8, // Hàn Mặc Tử
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Bến quê',
                'sku' => 'BOOK-NMC-009',
                'price' => 105000, // VND
                'stock_quantity' => 55,
                'category_id' => 4,
                'author_id' => 9, // Nguyễn Minh Châu
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Thơ Hồ Xuân Hương',
                'sku' => 'BOOK-HXH-010',
                'price' => 95000, // VND
                'stock_quantity' => 70,
                'category_id' => 5,
                'author_id' => 10, // Hồ Xuân Hương
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
