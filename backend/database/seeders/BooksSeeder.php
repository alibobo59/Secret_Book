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
<<<<<<< HEAD
                'price' => 1099, // 10.99 * 100 for decimal(15,0)
                'sku' => 'BOOK-000001',
                'stock_quantity' => 100,
=======
                'price' => 250000, // VND
                'stock' => 50,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 1,
                'author_id' => 1,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => '1984',
<<<<<<< HEAD
                'price' => 899,
                'sku' => 'BOOK-000002',
                'stock_quantity' => 80,
=======
                'price' => 200000, // VND
                'stock' => 30,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 2,
                'author_id' => 2,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'To Kill a Mockingbird',
<<<<<<< HEAD
                'price' => 1249,
                'sku' => 'BOOK-000003',
                'stock_quantity' => 60,
=======
                'price' => 280000, // VND
                'stock' => 40,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 3,
                'author_id' => 3,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Moby-Dick',
<<<<<<< HEAD
                'price' => 1599,
                'sku' => 'BOOK-000004',
                'stock_quantity' => 50,
=======
                'price' => 370000, // VND
                'stock' => 25,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 4,
                'author_id' => 4,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'War and Peace',
<<<<<<< HEAD
                'price' => 2000,
                'sku' => 'BOOK-000005',
                'stock_quantity' => 30,
=======
                'price' => 460000, // VND
                'stock' => 15,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 5,
                'author_id' => 5,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Pride and Prejudice',
<<<<<<< HEAD
                'price' => 999,
                'sku' => 'BOOK-000006',
                'stock_quantity' => 90,
=======
                'price' => 230000, // VND
                'stock' => 35,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 1,
                'author_id' => 6,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Catcher in the Rye',
<<<<<<< HEAD
                'price' => 1199,
                'sku' => 'BOOK-000007',
                'stock_quantity' => 70,
=======
                'price' => 280000, // VND
                'stock' => 45,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 2,
                'author_id' => 7,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Hobbit',
<<<<<<< HEAD
                'price' => 1499,
                'sku' => 'BOOK-000008',
                'stock_quantity' => 40,
=======
                'price' => 350000, // VND
                'stock' => 20,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 3,
                'author_id' => 8,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Brave New World',
<<<<<<< HEAD
                'price' => 1049,
                'sku' => 'BOOK-000009',
                'stock_quantity' => 85,
=======
                'price' => 250000, // VND
                'stock' => 30,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 4,
                'author_id' => 9,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Odyssey',
<<<<<<< HEAD
                'price' => 1399,
                'sku' => 'BOOK-000010',
                'stock_quantity' => 55,
=======
                'price' => 330000, // VND
                'stock' => 25,
>>>>>>> 9d6a090 (khong biet noi gi)
                'category_id' => 5,
                'author_id' => 10,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
};

