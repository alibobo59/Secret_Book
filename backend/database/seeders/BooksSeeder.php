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
                'title' => 'The Great Gatsby',
                'sku' => 'BOOK-GAT-001',
                'price' => 250000, // VND
                'stock_quantity' => 100,
                'category_id' => 1,
                'author_id' => 1,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => '1984',
                'sku' => 'BOOK-NIN-002',
                'price' => 200000, // VND
                'stock_quantity' => 80,
                'category_id' => 2,
                'author_id' => 2,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'To Kill a Mockingbird',
                'sku' => 'BOOK-MOC-003',
                'price' => 280000, // VND
                'stock_quantity' => 60,
                'category_id' => 3,
                'author_id' => 3,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Moby-Dick',
                'sku' => 'BOOK-MOB-004',
                'price' => 370000, // VND
                'stock_quantity' => 50,
                'category_id' => 4,
                'author_id' => 4,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'War and Peace',
                'sku' => 'BOOK-WAR-005',
                'price' => 460000, // VND
                'stock_quantity' => 30,
                'category_id' => 5,
                'author_id' => 5,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Pride and Prejudice',
                'sku' => 'BOOK-PRI-006',
                'price' => 230000, // VND
                'stock_quantity' => 90,
                'category_id' => 1,
                'author_id' => 6,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Catcher in the Rye',
                'sku' => 'BOOK-CAT-007',
                'price' => 280000, // VND
                'stock_quantity' => 70,
                'category_id' => 2,
                'author_id' => 7,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Hobbit',
                'sku' => 'BOOK-HOB-008',
                'price' => 350000, // VND
                'stock_quantity' => 40,
                'category_id' => 3,
                'author_id' => 8,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Brave New World',
                'sku' => 'BOOK-BRA-009',
                'price' => 250000, // VND
                'stock_quantity' => 85,
                'category_id' => 4,
                'author_id' => 9,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Odyssey',
                'sku' => 'BOOK-ODY-010',
                'price' => 330000, // VND
                'stock_quantity' => 55,
                'category_id' => 5,
                'author_id' => 10,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
