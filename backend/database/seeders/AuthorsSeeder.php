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
            ['name' => 'Nguyễn Nhật Ánh', 'bio' => 'Tác giả nổi tiếng với truyện thiếu nhi như "Cho tôi xin một vé đi tuổi thơ"', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Nam Cao', 'bio' => 'Tác giả của tác phẩm "Chí Phèo"', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ngô Tất Tố', 'bio' => 'Tác giả của tác phẩm "Tắt đèn"', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Vũ Trọng Phụng', 'bio' => 'Tác giả của tác phẩm "Số đỏ"', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tô Hoài', 'bio' => 'Tác giả của tác phẩm "Dế mèn phiêu lưu ký"', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Nguyễn Du', 'bio' => 'Đại thi hào dân tộc với "Truyện Kiều"', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Xuân Diệu', 'bio' => 'Nhà thơ tình nổi tiếng của phong trào Thơ mới', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Hàn Mặc Tử', 'bio' => 'Nhà thơ nổi bật với phong cách lãng mạn và siêu thực', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Nguyễn Minh Châu', 'bio' => 'Tác giả với nhiều truyện ngắn hiện đại đặc sắc', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Hồ Xuân Hương', 'bio' => 'Nữ sĩ nổi tiếng với thơ Nôm trào phúng', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
