<?php

namespace App\Http\Controllers\API;

use App\Models\Order;
use App\Models\User;
use App\Models\Book;
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
            'performance' => $this->getPerformanceStats($startDate)
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
            ->groupBy('date')
            ->get([
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            ]);

        $monthlySales = Order::where('status', 'delivered')
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
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
            'VIP Users' => DB::table('orders')
                ->where('created_at', '>=', $startDate)
                ->whereIn('status', ['delivered', 'processing'])
                ->groupBy('user_id')
                ->havingRaw('SUM(total) >= ?', [1000])
                ->count(),
            'Inactive Users' => User::where('last_login_at', '<', now()->subDays(30))->count()
        ];

        $userRegistrations = User::where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->get([
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as registrations')
            ]);

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
            'lowStockItems' => Book::where('stock', '<=', 10)->where('stock', '>', 0)->count(),
            'outOfStockItems' => Book::where('stock', 0)->count()
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
}