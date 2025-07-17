<?php

namespace App\Http\Controllers\API;

use App\Models\Book;
use App\Models\Review;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    /**
     * Display reviews for a specific book
     */
    public function index(Book $book)
    {
        $reviews = $book->verifiedReviews()
            ->where('is_hidden', false)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Store a newly created review
     */
    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000'
        ]);

        $user = Auth::user();
        $bookId = $request->book_id;

        // Check if user has purchased the book
        if (!$user->hasPurchased($bookId)) {
            return response()->json([
                'message' => 'You must purchase this book before reviewing it.'
            ], 403);
        }

        // Check if user already reviewed this book
        $existingReview = Review::where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'You have already reviewed this book.'
            ], 409);
        }

        // Get the order that contains this book for verification
        $order = $user->orders()
            ->where('status', 'delivered')
            ->whereHas('items', function($query) use ($bookId) {
                $query->where('book_id', $bookId);
            })
            ->first();

        $review = Review::create([
            'user_id' => $user->id,
            'book_id' => $bookId,
            'order_id' => $order->id,
            'rating' => $request->rating,
            'review' => $request->review
        ]);

        $review->load('user:id,name');

        return response()->json([
            'message' => 'Review submitted successfully.',
            'review' => $review
        ], 201);
    }

    /**
     * Update the specified review
     */
    public function update(Request $request, Review $review)
    {
        $user = Auth::user();

        // Check if user owns the review or is admin
        if ($review->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Không có quyền cập nhật đánh giá này.'
            ], 403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000'
        ]);

        $review->update([
            'rating' => $request->rating,
            'review' => $request->review
        ]);

        $review->load('user:id,name');

        return response()->json([
            'message' => 'Review updated successfully.',
            'review' => $review
        ]);
    }

    /**
     * Remove the specified review
     */
    public function destroy(Review $review)
    {
        $user = Auth::user();

        // Check if user owns the review or is admin
        if ($review->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized to delete this review.'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully.'
        ]);
    }

    /**
     * Check if user can review a specific book
     */
    public function canReview(Book $book)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'can_review' => false,
                'reason' => 'User not authenticated'
            ]);
        }

        // Check if user has purchased the book
        if (!$user->hasPurchased($book->id)) {
            return response()->json([
                'can_review' => false,
                'reason' => 'You must purchase this book to review it'
            ]);
        }

        // Check if user already reviewed this book
        $existingReview = Review::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'can_review' => false,
                'reason' => 'You have already reviewed this book',
                'existing_review' => $existingReview
            ]);
        }

        return response()->json([
            'can_review' => true
        ]);
    }

    /**
     * Display all reviews for admin management
     */
    public function adminIndex(Request $request)
    {
        $query = Review::with(['user:id,name,email', 'book:id,title', 'order:id'])
            ->orderBy('created_at', 'desc');

        // Filter by hidden status
        if ($request->has('is_hidden')) {
            $query->where('is_hidden', $request->boolean('is_hidden'));
        }

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        // Filter by book
        if ($request->has('book_id')) {
            $query->where('book_id', $request->book_id);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('review', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('user', function($userQuery) use ($searchTerm) {
                      $userQuery->where('name', 'like', '%' . $searchTerm . '%')
                               ->orWhere('email', 'like', '%' . $searchTerm . '%');
                  })
                  ->orWhereHas('book', function($bookQuery) use ($searchTerm) {
                      $bookQuery->where('title', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        $perPage = $request->get('per_page', 15);
        $reviews = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Toggle review visibility (hide/show)
     */
    public function toggleVisibility(Review $review)
    {
        $review->update([
            'is_hidden' => !$review->is_hidden
        ]);

        $review->load(['user:id,name,email', 'book:id,title']);

        return response()->json([
            'success' => true,
            'message' => $review->is_hidden ? 'Review đã được ẩn' : 'Review đã được hiển thị',
            'data' => $review
        ]);
    }

    /**
     * Get review statistics for admin
     */
    public function getStats()
    {
        try {
            $stats = [
                'total_reviews' => Review::count(),
                'visible_reviews' => Review::where('is_hidden', false)->count(),
                'hidden_reviews' => Review::where('is_hidden', true)->count(),
                'average_rating' => Review::where('is_hidden', false)->avg('rating'),
                'rating_distribution' => [
                    '5_star' => Review::where('is_hidden', false)->where('rating', 5)->count(),
                    '4_star' => Review::where('is_hidden', false)->where('rating', 4)->count(),
                    '3_star' => Review::where('is_hidden', false)->where('rating', 3)->count(),
                    '2_star' => Review::where('is_hidden', false)->where('rating', 2)->count(),
                    '1_star' => Review::where('is_hidden', false)->where('rating', 1)->count(),
                ],
                'recent_reviews' => Review::with(['user:id,name', 'book:id,title'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get review statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
