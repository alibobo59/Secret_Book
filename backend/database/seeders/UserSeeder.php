<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo admin user
        User::create([
            'name' => 'Quản trị viên',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Tạo các khách hàng thường
        $customers = [
            [
                'name' => 'Nguyễn Văn An',
                'email' => 'nguyenvanan@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ],
            [
                'name' => 'Trần Thị Bình',
                'email' => 'tranthibinh@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ],
            [
                'name' => 'Lê Văn Cường',
                'email' => 'levancuong@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ],
            [
                'name' => 'Phạm Thị Dung',
                'email' => 'phamthidung@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ],
            [
                'name' => 'Hoàng Văn Em',
                'email' => 'hoangvanem@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ],
            [
                'name' => 'Vũ Thị Phương',
                'email' => 'vuthiphuong@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ],
            [
                'name' => 'Đặng Văn Giang',
                'email' => 'dangvangiang@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ],
            [
                'name' => 'Bùi Thị Hoa',
                'email' => 'buithihoa@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        ];

        foreach ($customers as $customer) {
            User::create($customer);
        }

        $this->command->info('Đã tạo thành công 1 admin và ' . count($customers) . ' khách hàng!');
    }
}
