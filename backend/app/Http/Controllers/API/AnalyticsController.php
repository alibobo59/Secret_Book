<?php

namespace App\Http\Controllers\API;

use App\Models\Order;
use App\Models\User;
use App\Models\Book;
use App\Models\Review;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function getDashboardStats(Request $request): JsonResponse
    {
        $period = $request->get('period', '30d');
        $startDate = $this->getStartDate($period);

        $stats = [
            'sales' => $this->getSalesStats($startDate),
            'users' => $this->getUserStats($startDate),
            'inventory' => $this->getInventoryStats(),
            'performance' => $this->getPerformanceStats($startDate),
            'reviews' => $this->getReviewStats($startDate),
            'promotions' => $this->getPromotionStats($startDate),
            'behavior' => $this->getBehaviorStats($startDate)
        ];

        return response()->json($stats);
    }

    private function getStartDate(string $period): Carbon
    {
        return match($period) {
            '7d' => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subDays(30)
        };
    }

    private function getSalesStats(Carbon $startDate): array
    {
        $completedOrders = Order::where('status', 'delivered')
            ->where('created_at', '>=', $startDate);

        $totalRevenue = $completedOrders->sum('total');
        $totalOrders = $completedOrders->count();

        $dailySales = Order::where('status', 'delivered')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get([
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            ]);

        $monthlySales = Order::where('status', 'delivered')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'))
            ->get([
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(total) as revenue')
            ]);

        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('books', 'books.id', '=', 'order_items.book_id')
            ->where('orders.status', 'delivered')
            ->where('orders.created_at', '>=', $startDate)
            ->groupBy('books.id', 'books.title')
            ->orderByRaw('SUM(order_items.quantity * order_items.price) DESC')
            ->limit(5)
            ->get([
                'books.title',
                DB::raw('SUM(order_items.quantity * order_items.price) as revenue')
            ]);

        $categoryPerformance = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('books', 'books.id', '=', 'order_items.book_id')
            ->join('categories', 'categories.id', '=', 'books.category_id')
            ->where('orders.status', 'delivered')
            ->where('orders.created_at', '>=', $startDate)
            ->groupBy('categories.id', 'categories.name')
            ->orderByRaw('SUM(order_items.quantity * order_items.price) DESC')
            ->get([
                'categories.name as category',
                DB::raw('SUM(order_items.quantity * order_items.price) as revenue')
            ]);

        return [
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'conversionRate' => $this->calculateConversionRate($startDate),
            'dailySales' => $dailySales,
            'monthlySales' => $monthlySales,
            'topProducts' => $topProducts,
            'categoryPerformance' => $categoryPerformance
        ];
    }

    private function getUserStats(Carbon $startDate): array
    {
        $totalUsers = User::count();
        
        $userSegments = [
            'New Users' => User::where('created_at', '>=', $startDate)->count(),
            'Returning Users' => DB::table('orders')
                ->where('created_at', '>=', $startDate)
                ->whereIn('status', ['delivered', 'processing'])
                ->distinct('user_id')
                ->count(),
            'VIP Users' => DB::table(DB::raw('(
                SELECT user_id, SUM(total) as total_spent
                FROM orders 
                WHERE created_at >= "' . $startDate . '" 
                AND status IN ("delivered", "processing")
                GROUP BY user_id
                HAVING SUM(total) >= 1000
            ) as vip_users'))->count(),
            'Inactive Users' => User::where('created_at', '<', now()->subDays(30))
                ->whereDoesntHave('orders', function($query) {
                    $query->where('created_at', '>=', now()->subDays(30));
                })->count()
        ];

        $userRegistrations = User::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as registrations')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get();

        return [
            'totalUsers' => $totalUsers,
            'userSegments' => array_map(fn($segment, $count) => [
                'segment' => $segment,
                'count' => $count
            ], array_keys($userSegments), array_values($userSegments)),
            'userRegistrations' => $userRegistrations
        ];
    }

    private function getInventoryStats(): array
    {
        return [
            'totalProducts' => Book::count(),
            'lowStockItems' => Book::where('stock_quantity', '<=', 10)->where('stock_quantity', '>', 0)->count(),
            'outOfStockItems' => Book::where('stock_quantity', 0)->count()
        ];
    }

    private function getPerformanceStats(Carbon $startDate): array
    {
        // In a real application, these metrics would come from analytics tracking
        // For now, we'll return mock data
        return [
            'pageViews' => 125000,
            'uniqueVisitors' => 45000,
            'bounceRate' => 35,
            'averageSessionDuration' => 180,
            'deviceBreakdown' => [
                ['device' => 'Desktop', 'sessions' => 25000],
                ['device' => 'Mobile', 'sessions' => 15000],
                ['device' => 'Tablet', 'sessions' => 5000]
            ],
            'topPages' => [
                ['page' => '/books', 'views' => 15000],
                ['page' => '/categories', 'views' => 12000],
                ['page' => '/authors', 'views' => 8500]
            ]
        ];
    }

    private function calculateConversionRate(Carbon $startDate): float
    {
        $totalVisitors = 100000; // This should come from actual analytics tracking
        $completedOrders = Order::where('status', 'delivered')
            ->where('created_at', '>=', $startDate)
            ->count();

        return $totalVisitors > 0
            ? round(($completedOrders / $totalVisitors) * 100, 2)
            : 0;
    }

    private function getReviewStats(Carbon $startDate): array
    {
        $totalReviews = Review::where('is_hidden', false)->count();
        $newReviews = Review::where('created_at', '>=', $startDate)->count();
        $averageRating = Review::where('is_hidden', false)->avg('rating');
        $hiddenReviews = Review::where('is_hidden', true)->count();

        $ratingDistribution = [
            '5_star' => Review::where('is_hidden', false)->where('rating', 5)->count(),
            '4_star' => Review::where('is_hidden', false)->where('rating', 4)->count(),
            '3_star' => Review::where('is_hidden', false)->where('rating', 3)->count(),
            '2_star' => Review::where('is_hidden', false)->where('rating', 2)->count(),
            '1_star' => Review::where('is_hidden', false)->where('rating', 1)->count(),
        ];

        $topRatedBooks = DB::table('reviews')
            ->join('books', 'books.id', '=', 'reviews.book_id')
            ->where('reviews.is_hidden', false)
            ->groupBy('books.id', 'books.title')
            ->havingRaw('COUNT(reviews.id) >= 5')
            ->orderByRaw('AVG(reviews.rating) DESC')
            ->limit(5)
            ->get([
                'books.title',
                DB::raw('AVG(reviews.rating) as average_rating'),
                DB::raw('COUNT(reviews.id) as review_count')
            ]);

        $dailyReviews = Review::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as reviews')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get();

        return [
            'totalReviews' => $totalReviews,
            'newReviews' => $newReviews,
            'hiddenReviews' => $hiddenReviews,
            'averageRating' => round($averageRating, 2),
            'ratingDistribution' => $ratingDistribution,
            'topRatedBooks' => $topRatedBooks,
            'dailyReviews' => $dailyReviews
        ];
    }

    private function getPromotionStats(Carbon $startDate): array
    {
        $totalCoupons = Coupon::count();
        $activeCoupons = Coupon::where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->count();
        $expiredCoupons = Coupon::where('end_date', '<', now())->count();
        $totalUsages = CouponUsage::where('created_at', '>=', $startDate)->count();
        $totalDiscount = CouponUsage::where('created_at', '>=', $startDate)->sum('discount_amount');

        $topCoupons = DB::table('coupon_usages')
            ->join('coupons', 'coupons.id', '=', 'coupon_usages.coupon_id')
            ->where('coupon_usages.created_at', '>=', $startDate)
            ->groupBy('coupons.id', 'coupons.code', 'coupons.name')
            ->orderByRaw('COUNT(coupon_usages.id) DESC')
            ->limit(5)
            ->get([
                'coupons.code',
                'coupons.name',
                DB::raw('COUNT(coupon_usages.id) as usage_count'),
                DB::raw('SUM(coupon_usages.discount_amount) as total_discount')
            ]);

        $dailyUsages = CouponUsage::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as usages, SUM(discount_amount) as discount')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get();

        return [
            'totalCoupons' => $totalCoupons,
            'activeCoupons' => $activeCoupons,
            'expiredCoupons' => $expiredCoupons,
            'totalUsages' => $totalUsages,
            'totalDiscount' => $totalDiscount,
            'topCoupons' => $topCoupons,
            'dailyUsages' => $dailyUsages
        ];
    }

    private function getBehaviorStats(Carbon $startDate): array
    {
        // Customer behavior analysis
        $repeatCustomers = DB::table(DB::raw('(
            SELECT user_id, COUNT(*) as order_count
            FROM orders 
            WHERE created_at >= "' . $startDate . '" 
            AND status IN ("delivered", "processing")
            GROUP BY user_id
            HAVING COUNT(*) > 1
        ) as repeat_customers'))->count();

        $averageOrderValue = Order::where('status', 'delivered')
            ->where('created_at', '>=', $startDate)
            ->avg('total');

        $customerLifetimeValue = DB::table('orders')
            ->where('status', 'delivered')
            ->groupBy('user_id')
            ->get([
                DB::raw('AVG(total) as avg_order_value'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total) as lifetime_value')
            ]);

        $avgLifetimeValue = $customerLifetimeValue->avg('lifetime_value');

        $topCustomers = DB::table('orders')
            ->join('users', 'users.id', '=', 'orders.user_id')
            ->where('orders.status', 'delivered')
            ->where('orders.created_at', '>=', $startDate)
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByRaw('SUM(orders.total) DESC')
            ->limit(10)
            ->get([
                'users.name',
                'users.email',
                DB::raw('COUNT(orders.id) as order_count'),
                DB::raw('SUM(orders.total) as total_spent')
            ]);

        $orderStatusDistribution = Order::where('created_at', '>=', $startDate)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $paymentMethodStats = Order::where('created_at', '>=', $startDate)
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total) as revenue')
            ->groupBy('payment_method')
            ->get();

        return [
            'repeatCustomers' => $repeatCustomers,
            'averageOrderValue' => round($averageOrderValue, 2),
            'averageLifetimeValue' => round($avgLifetimeValue, 2),
            'topCustomers' => $topCustomers,
            'orderStatusDistribution' => $orderStatusDistribution,
            'paymentMethodStats' => $paymentMethodStats
        ];
    }

    /**
     * Get order statistics by status for a date range
     */
    public function getOrderStats(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $orderStats = Order::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Ensure all statuses are represented
        $allStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        $result = [];
        foreach ($allStatuses as $status) {
            $result[$status] = $orderStats[$status] ?? 0;
        }

        return response()->json($result);
    }

    /**
     * Get featured books based on sales quantity in last 30 days
     */
    public function getFeaturedBooks(Request $request): JsonResponse
    {
        // Get last 30 days start date
        $startDate = now()->subDays(30);
        
        // Get books with highest sales quantity in last 30 days
        $featuredBooks = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('books', 'books.id', '=', 'order_items.book_id')
            ->leftJoin('categories', 'categories.id', '=', 'books.category_id')
            ->leftJoin('authors', 'authors.id', '=', 'books.author_id')
            ->leftJoin('publishers', 'publishers.id', '=', 'books.publisher_id')
            ->where('orders.status', 'delivered')
            ->where('orders.created_at', '>=', $startDate)
            ->groupBy('books.id', 'books.title', 'books.price', 'books.image', 'books.stock_quantity', 'categories.name', 'authors.name', 'publishers.name')
            ->orderByRaw('SUM(order_items.quantity) DESC')
            ->limit(5)
            ->get([
                'books.id',
                'books.title',
                'books.price',
                'books.image',
                'books.stock_quantity',
                'categories.name as category_name',
                'authors.name as author_name',
                'publishers.name as publisher_name',
                DB::raw('SUM(order_items.quantity * order_items.price) as monthly_revenue'),
                DB::raw('SUM(order_items.quantity) as monthly_sales')
            ]);

        // If no books have sales in last 30 days, fallback to latest books
        if ($featuredBooks->isEmpty()) {
            $featuredBooks = Book::with(['category', 'author', 'publisher'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function($book) {
                    return [
                        'id' => $book->id,
                        'title' => $book->title,
                        'price' => $book->price,
                        'image' => $book->image,
                        'stock_quantity' => $book->stock_quantity,
                        'category_name' => $book->category->name ?? null,
                        'author_name' => $book->author->name ?? null,
                        'publisher_name' => $book->publisher->name ?? null,
                        'monthly_revenue' => 0,
                        'monthly_sales' => 0
                    ];
                });
        }

        return response()->json([
            'message' => 'Sách nổi bật dựa trên số lượng bán cao nhất trong 30 ngày gần nhất',
            'data' => $featuredBooks,
            'period' => 'last-30-days'
        ]);
    }

    /**
     * Get books with low performance (low sales/revenue)
     */
    public function getLowPerformingBooks(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());
        $limit = $request->get('limit', 10);

        $lowPerformingBooks = DB::table('books')
            ->leftJoin('order_items', function($join) use ($startDate, $endDate) {
                $join->on('books.id', '=', 'order_items.book_id')
                     ->join('orders', function($orderJoin) use ($startDate, $endDate) {
                         $orderJoin->on('orders.id', '=', 'order_items.order_id')
                                  ->where('orders.status', 'delivered')
                                  ->whereBetween('orders.created_at', [$startDate, $endDate]);
                     });
            })
            ->select([
                'books.id',
                'books.title',
                'books.price',
                'books.stock_quantity',
                DB::raw('COALESCE(SUM(order_items.quantity), 0) as sold_quantity'),
                DB::raw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as revenue')
            ])
            ->groupBy('books.id', 'books.title', 'books.price', 'books.stock_quantity')
            ->orderBy('revenue', 'asc')
            ->orderBy('sold_quantity', 'asc')
            ->limit($limit)
            ->get();

        return response()->json($lowPerformingBooks);
    }
}