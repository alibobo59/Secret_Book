<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BooksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('books')->insert([
            [
                'title' => 'The Great Gatsby',
                'price' => 10.99,
                'category_id' => 1,
                'author_id' => 1,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => '1984',
                'price' => 8.99,
                'category_id' => 2,
                'author_id' => 2,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'To Kill a Mockingbird',
                'price' => 12.49,
                'category_id' => 3,
                'author_id' => 3,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Moby-Dick',
                'price' => 15.99,
                'category_id' => 4,
                'author_id' => 4,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'War and Peace',
                'price' => 20.00,
                'category_id' => 5,
                'author_id' => 5,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Pride and Prejudice',
                'price' => 9.99,
                'category_id' => 1,
                'author_id' => 6,
                'publisher_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Catcher in the Rye',
                'price' => 11.99,
                'category_id' => 2,
                'author_id' => 7,
                'publisher_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Hobbit',
                'price' => 14.99,
                'category_id' => 3,
                'author_id' => 8,
                'publisher_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Brave New World',
                'price' => 10.49,
                'category_id' => 4,
                'author_id' => 9,
                'publisher_id' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Odyssey',
                'price' => 13.99,
                'category_id' => 5,
                'author_id' => 10,
                'publisher_id' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
