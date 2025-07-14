<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * -----------------------------------------------------------------------------
 * CategoriesSeeder (full implementation)
 * -----------------------------------------------------------------------------
 * Bổ sung dữ liệu mẫu vào bảng `categories`.
 * Mỗi phần tử gồm: name, description, timestamps.
 */
class CategoriesSeeder extends Seeder
{
    public function run(): void
    {
        // Danh sách dữ liệu mẫu
        $items = [
            // Fiction
            [
                'name'        => 'Fiction',
                'description' => 'Books that contain fictional stories',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            // Science Fiction
            [
                'name'        => 'Science Fiction',
                'description' => 'Sci-fi stories about the future',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            // Drama
            [
                'name'        => 'Drama',
                'description' => 'Emotional and dramatic stories',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            // Adventure
            [
                'name'        => 'Adventure',
                'description' => 'Exciting tales of exploration',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            // Classics
            [
                'name'        => 'Classics',
                'description' => 'Timeless literary works',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ];

        // Insert vào DB
        DB::table('categories')->insert($items);
    }
    /*
    $items = [
            // Fiction
            [
                'name'        => 'Fiction',
                'description' => 'Books that contain fictional stories',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            // Science Fiction
            [
                'name'        => 'Science Fiction',
                'description' => 'Sci-fi stories about the future',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            // Drama
            [
                'name'        => 'Drama',
                'description' => 'Emotional and dramatic stories',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            $items = [
            // Fiction
            [
                'name'        => 'Fiction',
                'description' => 'Books that contain fictional stories',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            // Science Fiction
            [
                'name'        => 'Science Fiction',
                'description' => 'Sci-fi stories about the future',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            // Drama
            [
                'name'        => 'Drama',
                'description' => 'Emotional and dramatic stories',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
    */
}
