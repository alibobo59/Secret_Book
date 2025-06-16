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
                'price' => 1099, // 10.99 * 100 for decimal(15,0)
                'sku' => 'BOOK-000001',
                'stock_quantity' => 100,
                'category_id' => 1,
                'author_id' => 1,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => '1984',
                'price' => 899,
                'sku' => 'BOOK-000002',
                'stock_quantity' => 80,
                'category_id' => 2,
                'author_id' => 2,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'To Kill a Mockingbird',
                'price' => 1249,
                'sku' => 'BOOK-000003',
                'stock_quantity' => 60,
                'category_id' => 3,
                'author_id' => 3,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Moby-Dick',
                'price' => 1599,
                'sku' => 'BOOK-000004',
                'stock_quantity' => 50,
                'category_id' => 4,
                'author_id' => 4,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'War and Peace',
                'price' => 2000,
                'sku' => 'BOOK-000005',
                'stock_quantity' => 30,
                'category_id' => 5,
                'author_id' => 5,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Pride and Prejudice',
                'price' => 999,
                'sku' => 'BOOK-000006',
                'stock_quantity' => 90,
                'category_id' => 1,
                'author_id' => 6,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Catcher in the Rye',
                'price' => 1199,
                'sku' => 'BOOK-000007',
                'stock_quantity' => 70,
                'category_id' => 2,
                'author_id' => 7,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Hobbit',
                'price' => 1499,
                'sku' => 'BOOK-000008',
                'stock_quantity' => 40,
                'category_id' => 3,
                'author_id' => 8,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Brave New World',
                'price' => 1049,
                'sku' => 'BOOK-000009',
                'stock_quantity' => 85,
                'category_id' => 4,
                'author_id' => 9,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Odyssey',
                'price' => 1399,
                'sku' => 'BOOK-000010',
                'stock_quantity' => 55,
                'category_id' => 5,
                'author_id' => 10,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
};

