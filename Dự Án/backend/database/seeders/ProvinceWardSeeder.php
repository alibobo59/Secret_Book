<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Commands\Seed;
use Illuminate\Database\Seeder;
use App\Models\Province;
use App\Models\Ward;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ProvinceWardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Ward::truncate();
        Province::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Read JSON file
        $jsonPath = base_path('../sorted_provinces.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error('File sorted_provinces.json not found at: ' . $jsonPath);
            return;
        }

        $data = json_decode(File::get($jsonPath), true);
        
        if (!$data) {
            $this->command->error('Invalid JSON data in sorted_provinces.json');
            return;
        }

        $this->command->info('Starting to seed provinces and wards...');
        
        $provinceCount = 0;
        $wardCount = 0;

        foreach ($data as $provinceName => $provinceData) {
            // Create province
            $province = Province::create([
                'name' => $provinceName
            ]);
            
            $provinceCount++;
            $this->command->info("Created province: {$provinceName}");

            // Create wards for this province
            if (isset($provinceData['phuong_xa']) && is_array($provinceData['phuong_xa'])) {
                foreach ($provinceData['phuong_xa'] as $wardName) {
                    Ward::create([
                        'name' => $wardName,
                        'province_id' => $province->id
                    ]);
                    $wardCount++;
                }
                
                $this->command->info("Created " . count($provinceData['phuong_xa']) . " wards for {$provinceName}");
            }
        }

        $this->command->info("Seeding completed!");
        $this->command->info("Total provinces created: {$provinceCount}");
        $this->command->info("Total wards created: {$wardCount}");
    }
}