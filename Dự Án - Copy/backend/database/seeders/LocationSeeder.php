<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Province;
use App\Models\Ward;
use Illuminate\Support\Facades\File;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Đường dẫn đến file JSON
        $jsonPath = '/Applications/XAMPP/xamppfiles/htdocs/Fpoly/DoAnTN/sorted_provinces.json';
        
        // Kiểm tra file có tồn tại không
        if (!File::exists($jsonPath)) {
            $this->command->error('File sorted_provinces.json không tồn tại!');
            return;
        }
        
        // Đọc và decode JSON
        $jsonContent = File::get($jsonPath);
        $provincesData = json_decode($jsonContent, true);
        
        if (!$provincesData) {
            $this->command->error('Không thể đọc dữ liệu từ file JSON!');
            return;
        }
        
        $this->command->info('Bắt đầu import dữ liệu tỉnh/thành phố và phường/xã...');
        
        foreach ($provincesData as $provinceName => $provinceData) {
            // Tạo hoặc tìm province
            $province = Province::firstOrCreate(['name' => $provinceName]);
            
            $this->command->info("Đang xử lý: {$provinceName}");
            
            // Kiểm tra xem có key 'phuong_xa' không
            if (isset($provinceData['phuong_xa']) && is_array($provinceData['phuong_xa'])) {
                // Import các phường/xã
                foreach ($provinceData['phuong_xa'] as $wardName) {
                    Ward::firstOrCreate([
                        'name' => $wardName,
                        'province_id' => $province->id
                    ]);
                }
            }
        }
        
        $this->command->info('Hoàn thành import dữ liệu!');
    }
}
