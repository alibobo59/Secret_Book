<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class PublishersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        DB::table('publishers')->insert([
            ['name' => 'Penguin Random House', 'address' => 'New York, USA', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'HarperCollins', 'address' => 'New York, USA', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Macmillan', 'address' => 'London, UK', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Hachette Livre', 'address' => 'Paris, France', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Simon & Schuster', 'address' => 'New York, USA', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
