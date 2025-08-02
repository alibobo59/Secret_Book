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
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\AnalyticsController;
use App\Http\Controllers\API\CouponController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\CartController;
use App\Http\Controllers\API\SettingsController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\ImageUploadController;

// Root route
Route::get('/', function () {
    return 'API';
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('/logout', [AuthController::class, 'logout'])->middleware(['auth:sanctum'])->name('auth.logout');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

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

// Public analytics routes
Route::get('/featured-books', [AnalyticsController::class, 'getFeaturedBooks'])->name('featured-books');

// Admin/Mod routes (protected by auth:sanctum, check.user.status and admin.or.mod middleware)
Route::middleware(['auth:sanctum', 'check.user.status', 'admin.or.mod'])->group(function () {
    // Image upload for RichText Editor
    Route::post('/upload/editor-image', [ImageUploadController::class, 'uploadEditorImage'])->name('upload.editor-image');
    Route::delete('/upload/editor-image', [ImageUploadController::class, 'deleteEditorImage'])->name('upload.delete-editor-image');
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
    Route::get('/admin/orders/stats', [OrderController::class, 'getStats'])->name('admin.orders.stats');

    // Analytics
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'getDashboardStats'])->name('analytics.dashboard');
    Route::get('/admin/analytics/order-stats', [AnalyticsController::class, 'getOrderStats'])->name('admin.analytics.order-stats');
    Route::get('/admin/analytics/low-performing-books', [AnalyticsController::class, 'getLowPerformingBooks'])->name('admin.analytics.low-performing-books');

    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/audit-logs/stats', [AuditLogController::class, 'getStats'])->name('audit-logs.stats');
    Route::get('/audit-logs/export', [AuditLogController::class, 'export'])->name('audit-logs.export');
    Route::get('/audit-logs/{modelType}/{modelId}', [AuditLogController::class, 'getModelAuditLogs'])->name('audit-logs.model');

    // Coupons (Admin)
    Route::apiResource('coupons', CouponController::class);
    Route::post('/coupons/generate-code', [CouponController::class, 'generateCode'])->name('coupons.generate-code');
    Route::get('/coupons/{coupon}/stats', [CouponController::class, 'stats'])->name('coupons.stats');

    // User Management (Admin)
    Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::get('/admin/users/stats', [UserController::class, 'getStats'])->name('admin.users.stats');
    Route::get('/admin/users/{user}', [UserController::class, 'show'])->name('admin.users.show');
    Route::patch('/admin/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('admin.users.toggle-status');
    Route::put('/admin/users/{user}', [UserController::class, 'update'])->name('admin.users.update');


    // Review Management (Admin)
    Route::get('/admin/reviews', [ReviewController::class, 'adminIndex'])->name('admin.reviews.index');
    Route::patch('/admin/reviews/{review}/toggle-visibility', [ReviewController::class, 'toggleVisibility'])->name('admin.reviews.toggle-visibility');
    Route::get('/admin/reviews/stats', [ReviewController::class, 'getStats'])->name('admin.reviews.stats');
    Route::delete('/admin/reviews/{review}', [ReviewController::class, 'destroy'])->name('admin.reviews.destroy');

    // Settings Management (Admin)
    Route::get('/admin/settings', [SettingsController::class, 'index'])->name('admin.settings.index');
    Route::post('/admin/settings', [SettingsController::class, 'store'])->name('admin.settings.store');
    Route::get('/admin/settings/shipping', [SettingsController::class, 'getShippingSettings'])->name('admin.settings.shipping');
});

// Authenticated user routes
Route::middleware(['auth:sanctum', 'check.user.status'])->group(function () {
    // Order routes for authenticated users
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');

    // Payment routes
    Route::post('/payment/vnpay/create', [PaymentController::class, 'createVNPayPayment']);
    Route::post('/payment/vnpay/verify', [PaymentController::class, 'verifyVNPayPayment']);
    Route::post('/payment/vnpay/return', [PaymentController::class, 'vnpayReturn']);
    // Review routes for authenticated users
    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
    Route::put('/reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
    Route::get('/books/{book}/can-review', [ReviewController::class, 'canReview'])->name('reviews.can-review');

    // Coupon validation for authenticated users
    Route::post('/coupons/validate', [CouponController::class, 'validate'])->name('coupons.validate');
    
    // Cart routes
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/items', [CartController::class, 'addItem'])->name('cart.add-item');
    Route::put('/cart/items/{bookId}', [CartController::class, 'updateItem'])->name('cart.update-item');
    Route::delete('/cart/items/{bookId}', [CartController::class, 'removeItem'])->name('cart.remove-item');
    Route::delete('/cart', [CartController::class, 'clear'])->name('cart.clear');
    Route::post('/cart/merge', [CartController::class, 'merge'])->name('cart.merge');
    
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.update-password');
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('profile.delete-avatar');
});
