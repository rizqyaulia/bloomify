<?php

use App\Http\Controllers\Api\Admin\OrderManagementController;
use App\Http\Controllers\Api\Admin\PaymentManagementController;
use App\Http\Controllers\Api\Admin\ProductManagementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\NewsletterSubscriptionController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SupportTicketController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/admin/products', [ProductManagementController::class, 'index']);
Route::post('/admin/products', [ProductManagementController::class, 'store']);
Route::post('/admin/products/{id}', [ProductManagementController::class, 'update'])
    ->whereNumber('id');
Route::patch('/admin/products/{id}', [ProductManagementController::class, 'update'])
    ->whereNumber('id');
Route::delete('/admin/products/{id}', [ProductManagementController::class, 'destroy'])
    ->whereNumber('id');

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/me', [AuthController::class, 'me']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart', [CartController::class, 'store']);
Route::patch('/cart/{id}', [CartController::class, 'update'])->whereNumber('id');
Route::delete('/cart/{id}', [CartController::class, 'destroy'])->whereNumber('id');
Route::delete('/cart', [CartController::class, 'clear']);

Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders', [OrderManagementController::class, 'index']);
Route::get('/orders/history', [OrderController::class, 'history']);
Route::patch('/orders/{order_code}/confirm-received', [OrderController::class, 'confirmReceived']);
Route::get('/orders/{order_code}', [OrderController::class, 'show']);
Route::get('/tracking/{order_code}', [OrderController::class, 'show']);
Route::patch('/orders/{id}/status', [OrderManagementController::class, 'updateStatus'])
    ->whereNumber('id');
Route::patch('/orders/{id}/payment', [OrderManagementController::class, 'updatePayment'])
    ->whereNumber('id');
Route::delete('/admin/orders/{id}', [OrderManagementController::class, 'destroy'])
    ->whereNumber('id');
Route::patch('/admin/orders/{id}/process', [OrderManagementController::class, 'process'])
    ->whereNumber('id');
Route::patch('/admin/orders/{id}/ready-to-deliver', [OrderManagementController::class, 'readyToDeliver'])
    ->whereNumber('id');
Route::patch('/admin/orders/{id}/deliver', [OrderManagementController::class, 'deliver'])
    ->whereNumber('id');
Route::patch('/admin/orders/{id}/complete', [OrderManagementController::class, 'complete'])
    ->whereNumber('id');
Route::patch('/admin/payments/{id}/approve', [PaymentManagementController::class, 'approve'])
    ->whereNumber('id');
Route::patch('/admin/payments/{id}/reject', [PaymentManagementController::class, 'reject'])
    ->whereNumber('id');

Route::post('/payments', [PaymentController::class, 'store']);
Route::post('/newsletter-subscriptions', [NewsletterSubscriptionController::class, 'store']);
Route::post('/support-tickets', [SupportTicketController::class, 'store']);
