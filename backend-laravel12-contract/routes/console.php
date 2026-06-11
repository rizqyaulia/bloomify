<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about:bloomify', function (): void {
    $this->info('Bloomify Laravel 12 API is configured for PostgreSQL.');
})->purpose('Show Bloomify API information');
