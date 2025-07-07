<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\AccountStatusChanged;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of users (Admin only)
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '' && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->withCount(['orders', 'reviews'])->paginate(15);

        return response()->json($users);
    }

    /**
     * Display the specified user
     */
    public function show(User $user)
    {
        $user->load(['orders' => function($query) {
            $query->latest()->take(5);
        }, 'reviews' => function($query) {
            $query->latest()->take(5)->with('book:id,title');
        }]);

        $user->loadCount(['orders', 'reviews']);

        return response()->json($user);
    }

    /**
     * Toggle user account status (active/inactive)
     */
    public function toggleStatus(User $user, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $user->is_active;
        $user->is_active = !$user->is_active;
        $user->save();

        // Send email notification if account is being deactivated
        if ($oldStatus && !$user->is_active) {
            try {
                Mail::to($user->email)->send(new AccountStatusChanged($user, 'deactivated', $request->reason));
            } catch (\Exception $e) {
                Log::error('Failed to send account deactivation email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => $user->is_active ? 'Tài khoản đã được kích hoạt' : 'Tài khoản đã bị khóa',
            'user' => $user
        ]);
    }

    /**
     * Get user statistics
     */
    public function getStats()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = User::where('is_active', false)->count();
        $newUsersThisMonth = User::whereMonth('created_at', now()->month)
                                ->whereYear('created_at', now()->year)
                                ->count();

        $usersByRole = User::selectRaw('role, count(*) as count')
                          ->groupBy('role')
                          ->get();

        return response()->json([
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'inactive_users' => $inactiveUsers,
            'new_users_this_month' => $newUsersThisMonth,
            'users_by_role' => $usersByRole
        ]);
    }

    /**
     * Update user information (Admin only)
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:admin,mod,user'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'email', 'role']));

        return response()->json([
            'message' => 'Thông tin người dùng đã được cập nhật',
            'user' => $user
        ]);
    }

    /**
     * Delete user (Admin only)
     */
    public function destroy(User $user)
    {
        // Prevent deleting admin users
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Không thể xóa tài khoản admin'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Người dùng đã được xóa'
        ]);
    }
}
