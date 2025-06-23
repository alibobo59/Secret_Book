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
                'price' => 250000, // VND
                'stock' => 100,
                'category_id' => 1,
                'author_id' => 1,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => '1984',
                'price' => 200000, // VND
                'stock' => 80,
                'category_id' => 2,
                'author_id' => 2,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'To Kill a Mockingbird',
                'price' => 280000, // VND
                'stock' => 60,
                'category_id' => 3,
                'author_id' => 3,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Moby-Dick',
                'price' => 370000, // VND
                'stock' => 50,
                'category_id' => 4,
                'author_id' => 4,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'War and Peace',
                'price' => 460000, // VND
                'stock' => 30,
                'category_id' => 5,
                'author_id' => 5,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Pride and Prejudice',
                'price' => 230000, // VND
                'stock' => 90,
                'category_id' => 1,
                'author_id' => 6,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Catcher in the Rye',
                'price' => 280000, // VND
                'stock' => 70,
                'category_id' => 2,
                'author_id' => 7,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Hobbit',
                'price' => 350000, // VND
                'stock' => 40,
                'category_id' => 3,
                'author_id' => 8,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Brave New World',
                'price' => 250000, // VND
                'stock' => 85,
                'category_id' => 4,
                'author_id' => 9,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Odyssey',
                'price' => 330000, // VND
                'stock' => 55,
                'category_id' => 5,
                'author_id' => 10,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
