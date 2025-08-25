<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insert([
            ['name' => 'Tiểu thuyết', 'description' => 'Những tác phẩm hư cấu, có cốt truyện hấp dẫn', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Khoa học viễn tưởng', 'description' => 'Các câu chuyện giả tưởng về khoa học và tương lai', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kịch', 'description' => 'Những tác phẩm giàu cảm xúc và kịch tính', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Phiêu lưu', 'description' => 'Những chuyến hành trình và khám phá ly kỳ', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kinh điển', 'description' => 'Những tác phẩm văn học nổi bật và trường tồn', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
