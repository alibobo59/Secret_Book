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
                'message' => 'Unauthorized to update this review.'
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
}
