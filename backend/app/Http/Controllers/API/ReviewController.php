<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    /**
     * GET /books/{book}/can-review
     * Trả về: { can_review, purchased, already }
     */
    public function canReview(Request $request, Book $book)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'can_review' => false,
                'purchased'  => false,
                'already'    => false,
                'reason'     => 'Người dùng chưa xác thực',
            ], 200);
        }

        // Đã từng mua & đơn đã hoàn tất?
        $purchased = OrderItem::query()
            ->where('book_id', $book->id)
            ->whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  // Sửa cho khớp enum trạng thái đơn của bạn
                  ->whereIn('status', ['completed', 'delivered']);
            })
            ->exists();

        // Đã review rồi chưa?
        $already = Review::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->exists();

        return response()->json([
            'can_review' => $purchased && !$already,
            'purchased'  => $purchased,
            'already'    => $already,
        ]);
    }

    /**
     * GET /books/{book}/reviews
     * Danh sách review (public)
     */
    public function index(Book $book)
    {
        $reviews = Review::query()
            ->where('book_id', $book->id)
            ->where('is_hidden', false)
            ->with(['user:id,name', 'images'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * POST /reviews
     * body: multipart/form-data { book_id, rating(1..5), review?, images[] (<=3) }
     */
    public function store(Request $request)
    {
        $request->validate([
            'book_id'   => 'required|exists:books,id',
            'rating'    => 'required|integer|min:1|max:5',
            'review'    => 'nullable|string|max:1000',
            'images'    => 'nullable|array|max:3',
            'images.*'  => 'file|image|mimes:jpeg,png,jpg,webp,gif|max:2048', // 2MB mỗi ảnh
        ]);

        $user   = Auth::user();
        $bookId = (int) $request->book_id;

        // Bắt buộc đã mua (đơn hoàn tất)
        $purchased = OrderItem::query()
            ->where('book_id', $bookId)
            ->whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->whereIn('status', ['completed', 'delivered']);
            })
            ->exists();

        if (!$purchased) {
            return response()->json(['message' => 'Bạn phải mua sách này trước khi đánh giá.'], 403);
        }

        // Không cho review trùng
        $exists = Review::query()
            ->where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Bạn đã đánh giá sách này rồi.'], 409);
        }

        // Lấy order đã giao gần nhất chứa quyển sách (để lưu order_id)
        $order = $user->orders()
            ->whereIn('status', ['completed', 'delivered'])
            ->whereHas('items', fn ($q) => $q->where('book_id', $bookId))
            ->latest('created_at')
            ->first();

        DB::beginTransaction();
        try {
            $review = Review::create([
                'user_id'  => $user->id,
                'book_id'  => $bookId,
                'order_id' => optional($order)->id,
                'rating'   => (int) $request->rating,
                'review'   => $request->review,
                'is_hidden'=> false,
            ]);

            // Xử lý lưu ảnh nếu có
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    if (!$file->isValid()) continue;
                    $path = $file->store('reviews', 'public'); // lưu vào storage/app/public/reviews
                    ReviewImage::create([
                        'review_id' => $review->id,
                        'path'      => $path,
                    ]);
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Không thể lưu đánh giá: '.$e->getMessage()], 500);
        }

        $review->load(['user:id,name', 'images']);

        return response()->json([
            'message' => 'Gửi đánh giá thành công.',
            'review'  => $review,
        ], 201);
    }

    /**
     * PUT /reviews/{review}
     */
    public function update(Request $request, Review $review)
    {
        $user = Auth::user();
        if ($review->user_id !== $user->id && (($user->role ?? null) !== 'admin')) {
            return response()->json(['message' => 'Không có quyền cập nhật đánh giá này.'], 403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        $review->update([
            'rating' => (int) $request->rating,
            'review' => $request->review,
        ]);

        return response()->json([
            'message' => 'Cập nhật đánh giá thành công.',
            'review'  => $review->load('user:id,name'),
        ]);
    }

    /**
     * Admin – GET /admin/reviews
     */
    public function adminIndex(Request $request)
    {
        $q = Review::with(['user:id,name,email', 'book:id,title', 'order:id'])
            ->orderByDesc('created_at');

        if ($request->filled('is_hidden')) $q->where('is_hidden', $request->boolean('is_hidden'));
        if ($request->filled('rating'))    $q->where('rating', (int) $request->rating);
        if ($request->filled('book_id'))   $q->where('book_id', (int) $request->book_id);

        if ($request->filled('search')) {
            $search = $request->search;
            $q->where(function ($sub) use ($search) {
                $sub->where('review', 'like', "%$search%")
                    ->orWhereHas('user', fn ($uq) =>
                        $uq->where('name', 'like', "%$search%")
                           ->orWhere('email', 'like', "%$search%"))
                    ->orWhereHas('book', fn ($bq) =>
                        $bq->where('title', 'like', "%$search%"));
            });
        }

        return response()->json([
            'success' => true,
            'data'    => $q->paginate($request->integer('per_page', 15)),
        ]);
    }

    /**
     * Admin – PATCH /admin/reviews/{review}/toggle-visibility
     */
    public function toggleVisibility(Review $review)
    {
        $review->update(['is_hidden' => !$review->is_hidden]);

        return response()->json([
            'success' => true,
            'message' => $review->is_hidden ? 'Review đã được ẩn' : 'Review đã được hiển thị',
            'data'    => $review->load(['user:id,name,email', 'book:id,title']),
        ]);
    }
}
