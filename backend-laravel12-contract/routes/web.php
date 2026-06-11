<?php

use Illuminate\Support\Facades\Route;

Route::get('/product-images/{filename}', function (string $filename) {
    abort_unless(
        preg_match('/\A[A-Za-z0-9._-]+\.(?:jpe?g|png|webp)\z/i', $filename) === 1,
        404
    );

    $directory = realpath(storage_path('app/public/products'));
    abort_unless($directory, 404);

    $path = realpath($directory.DIRECTORY_SEPARATOR.$filename);
    abort_unless(
        $path && str_starts_with(strtolower($path), strtolower($directory.DIRECTORY_SEPARATOR)) && is_file($path),
        404
    );

    return response()
        ->file($path, [
            'Cache-Control' => 'public, max-age=604800',
        ]);
})->where('filename', '[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp)');

Route::get('/storage/products/{filename}', function (string $filename) {
    abort_unless(
        preg_match('/\A[A-Za-z0-9._-]+\.(?:jpe?g|png|webp)\z/i', $filename) === 1,
        404
    );

    $directory = realpath(storage_path('app/public/products'));
    abort_unless($directory, 404);

    $path = realpath($directory.DIRECTORY_SEPARATOR.$filename);
    abort_unless(
        $path && str_starts_with(strtolower($path), strtolower($directory.DIRECTORY_SEPARATOR)) && is_file($path),
        404
    );

    return response()
        ->file($path, [
            'Cache-Control' => 'public, max-age=604800',
        ]);
})->where('filename', '[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp)');

Route::get('/payment-proofs/{filename}', function (string $filename) {
    abort_unless(
        preg_match('/\A[A-Za-z0-9._-]+\.(?:jpe?g|png|webp|pdf)\z/i', $filename) === 1,
        404
    );

    $directory = realpath(storage_path('app/public/payment-proofs'));
    abort_unless($directory, 404);

    $path = realpath($directory.DIRECTORY_SEPARATOR.$filename);
    abort_unless(
        $path && str_starts_with(strtolower($path), strtolower($directory.DIRECTORY_SEPARATOR)) && is_file($path),
        404
    );

    return response()
        ->file($path, [
            'Cache-Control' => 'private, max-age=300',
        ]);
})->where('filename', '[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp|pdf)');
