<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@bloomify.local'],
            [
                'name' => 'Bloomify Admin',
                'phone' => '0800-ADMIN',
                'campus_address' => 'Bloomify Office',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );
    }
}
