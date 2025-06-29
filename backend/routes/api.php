<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BookController;
use App\Http\Controllers\API\AuthorController;
use App\Http\Controllers\API\AuditLogController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\PublisherController;
use App\Http\Controllers\API\OrderController;

// Root route
Route::get('/', function () {
    return 'API';
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('auth.logout');

// Public routes (accessible by all, read-only)
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
Route::get('/books', [BookController::class, 'index'])->name('books.index');
Route::get('/books/{book}', [BookController::class, 'show'])->name('books.show');
Route::get('/authors', [AuthorController::class, 'index'])->name('authors.index');
Route::get('/authors/{author}', [AuthorController::class, 'show'])->name('authors.show');
Route::get('/publishers', [PublisherController::class, 'index'])->name('publishers.index');
Route::get('/publishers/{publisher}', [PublisherController::class, 'show'])->name('publishers.show');

// Admin/Mod routes (protected by auth:sanctum and admin.or.mod middleware)
Route::middleware(['auth:sanctum', 'admin.or.mod'])->group(function () {
    // Categories
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    // Books
    Route::post('/books', [BookController::class, 'store'])->name('books.store');
    Route::put('/books/{book}', [BookController::class, 'update'])->name('books.update');
    Route::delete('/books/{book}', [BookController::class, 'destroy'])->name('books.destroy');

    // Authors
    Route::apiResource('authors', AuthorController::class)->except(['index', 'show']);

    // Publishers
    Route::apiResource('publishers', PublisherController::class)->except(['index', 'show']);

    // Orders (Admin)
    Route::get('/admin/orders', [OrderController::class, 'adminIndex'])->name('admin.orders.index');
    Route::get('/admin/orders/{order}', [OrderController::class, 'adminShow'])->name('admin.orders.show');
    Route::patch('/admin/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.update-status');
    Route::get('/admin/orders/stats', [OrderController::class, 'getStats'])->name('admin.orders.stats');
    
    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/audit-logs/stats', [AuditLogController::class, 'getStats'])->name('audit-logs.stats');
    Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
    Route::get('/audit-logs/{modelType}/{modelId}', [AuditLogController::class, 'getModelAuditLogs'])->name('audit-logs.model');
});

// Authenticated user routes
Route::middleware('auth:sanctum')->group(function () {
    // Order routes for authenticated users
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    
    // Payment routes
    Route::post('/payment/vnpay/create', [PaymentController::class, 'createVNPayPayment']);
});

// Public routes for VNPay
Route::get('/payment/vnpay', [PaymentController::class, 'createVNPayPaymentUrl']);
Route::get('/payment/vnpay/return', [PaymentController::class, 'vnpayReturn']);
