<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Default to CoreSeeder for standard installation unless demo environment flag is passed
        if (config('app.seed_demo', false)) {
            $this->call(DemoSeeder::class);
        } else {
            $this->call(CoreSeeder::class);
        }
    }
}
