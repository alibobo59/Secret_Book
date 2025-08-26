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
use App\Http\Controllers\API\AuditLogController;

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

// Public review routes
Route::get('/books/{book}/reviews', [ReviewController::class, 'index'])->name('reviews.index');

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
    
    // Bulk Operations for Books
    Route::post('/books/bulk-delete', [BookController::class, 'bulkDelete'])->name('books.bulk-delete');
    Route::post('/books/bulk-update', [BookController::class, 'bulkUpdate'])->name('books.bulk-update');
    Route::post('/books/bulk-stock-update', [BookController::class, 'bulkStockUpdate'])->name('books.bulk-stock-update');
    Route::post('/books/bulk-export', [BookController::class, 'bulkExport'])->name('books.bulk-export');

    // Authors
    Route::apiResource('authors', AuthorController::class)->except(['index', 'show']);

    // Publishers
    Route::apiResource('publishers', PublisherController::class)->except(['index', 'show']);

    // Orders (Admin)
    Route::get('/admin/orders', [OrderController::class, 'adminIndex'])->name('admin.orders.index');
    Route::get('/admin/orders/{order}', [OrderController::class, 'adminShow'])->name('admin.orders.show');
    Route::get('/admin/orders/{order}/allowed-statuses', [OrderController::class, 'getAllowedStatuses'])->name('admin.orders.allowed-statuses');
    Route::patch('/admin/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.update-status');
    Route::patch('/admin/orders/{order}/payment', [OrderController::class, 'updatePaymentStatus'])->name('admin.orders.update-payment');
    Route::delete('/admin/orders/{order}', [OrderController::class, 'destroy'])->name('admin.orders.destroy');
    // Coupons (Admin)
    Route::apiResource('coupons', CouponController::class);
    Route::post('/coupons/generate-code', [CouponController::class, 'generateCode'])->name('coupons.generate-code');
    Route::get('/coupons/{coupon}/stats', [CouponController::class, 'stats'])->name('coupons.stats');

    Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');
