<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuthorsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('authors')->insert([
            ['name' => 'F. Scott Fitzgerald', 'bio' => 'Author of The Great Gatsby', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'George Orwell', 'bio' => 'Author of 1984', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Harper Lee', 'bio' => 'Author of To Kill a Mockingbird', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Herman Melville', 'bio' => 'Author of Moby-Dick', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Leo Tolstoy', 'bio' => 'Author of War and Peace', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jane Austen', 'bio' => 'Author of Pride and Prejudice', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'J.D. Salinger', 'bio' => 'Author of The Catcher in the Rye', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'J.R.R. Tolkien', 'bio' => 'Author of The Hobbit', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Aldous Huxley', 'bio' => 'Author of Brave New World', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Homer', 'bio' => 'Author of The Odyssey', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
