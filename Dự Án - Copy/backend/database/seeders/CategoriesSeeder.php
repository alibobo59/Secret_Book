<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insert([
            ['name' => 'Fiction', 'description' => 'Books that contain fictional stories', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Science Fiction', 'description' => 'Sci-fi stories about the future', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Drama', 'description' => 'Emotional and dramatic stories', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Adventure', 'description' => 'Exciting tales of exploration', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Classics', 'description' => 'Timeless literary works', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
