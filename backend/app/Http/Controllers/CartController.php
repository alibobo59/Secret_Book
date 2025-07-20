<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

/**
 * CartController (commit 6) — endpoints đọc dữ liệu.
 * Mục tiêu:
 *  - Thêm các method cơ bản để đọc dữ liệu giỏ hàng.
 *  - Giữ skeleton, chưa thêm hành vi phức tạp (store/update/destroy).
 *  - Comment dài để kéo dài file mà không thay đổi logic.
 */
class CartController extends Controller
{
    /**
     * Danh sách tất cả carts.
     * Thường chỉ dùng cho admin.
     *
     * Các bước thực hiện:
     * 1. Lấy tất cả carts.
     * 2. Kèm theo số lượng items cho mỗi cart.
     * 3. Sắp xếp theo thời gian cập nhật giảm dần.
     * 4. Trả về response dạng JSON với HTTP 200 OK.
     *
     * Ghi chú:
     *  - Có thể mở rộng filter theo user hoặc trạng thái.
     *  - Chỉ đọc, không thay đổi dữ liệu.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $carts = Cart::withCount('items')->orderByDesc('updated_at')->get();

        // Trả về kết quả JSON
        return response()->json([
            'data' => $carts
        ], Response::HTTP_OK);
    }

    /**
     * Giỏ hàng của user hiện tại.
     *
     * Các bước thực hiện:
     * 1. Lấy user_id từ request.
     * 2. Tìm giỏ hàng theo user_id.
     * 3. Nếu chưa có, tạo giỏ hàng mới.
     * 4. Kèm theo items và thông tin book.
     * 5. Trả về response JSON với HTTP 200 OK.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $userId = $request->user()->id ?? null;

        // Lấy hoặc tạo giỏ hàng cho user
        $cart = Cart::with('items.book')->firstOrCreate([
            'user_id' => $userId
        ]);

        // Trả về JSON
        return response()->json([
            'data' => $cart
        ], Response::HTTP_OK);
    }
        /**
     * -------------------------------------------------------------------------
     * Thêm sản phẩm vào giỏ
     * -------------------------------------------------------------------------
     * Logic:
     *  - Lấy user_id từ request.
     *  - Validate dữ liệu đầu vào (book_id, quantity, price).
     *  - Nếu chưa có giỏ thì tạo giỏ mới cho user.
     *  - Nếu book đã có trong giỏ thì cập nhật, ngược lại thì thêm mới.
     *  - Trả về giỏ hàng kèm items.
     */
    public function addItem(Request $request)
    {
        $userId = $request->user()->id ?? null;

        // Bước 1: Validate
        $validator = Validator::make(
            $request->all(),
            [
                'book_id'  => 'required|integer|exists:books,id',
                'quantity' => 'required|integer|min:1',
                'price'    => 'nullable|numeric|min:0',
            ]
        );

        if ($validator->fails()) {
            return response()->json(
                ['error' => $validator->errors()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        // Bước 2: Lấy hoặc tạo giỏ
        $cart = Cart::firstOrCreate(['user_id' => $userId]);

        // Bước 3: Thêm hoặc cập nhật sản phẩm
        $item = CartItem::updateOrCreate(
            ['cart_id' => $cart->id, 'book_id' => $request->book_id],
            [
                'quantity' => (int) $request->quantity,
                'price'    => $request->price,
            ]
        );

        // Bước 4: Load lại quan hệ
        $cart->load('items.book');

        // Bước 5: Trả về response
        return response()->json(['data' => $cart], Response::HTTP_CREATED);
    }

    /**
     * -------------------------------------------------------------------------
     * Cập nhật số lượng item
     * -------------------------------------------------------------------------
     * Logic:
     *  - Xác định user_id.
     *  - Validate số lượng mới.
     *  - Lấy giỏ của user.
     *  - Tìm item theo book_id, nếu không có thì báo lỗi.
     *  - Nếu có thì update số lượng và trả về giỏ hàng.
     */
    public function updateItemQty(Request $request, $bookId)
    {
        $userId = $request->user()->id ?? null;

        // Validate
        $validator = Validator::make(
            $request->all(),
            ['quantity' => 'required|integer|min:1']
        );

        if ($validator->fails()) {
            return response()->json(
                ['error' => $validator->errors()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        // Lấy giỏ
        $cart = Cart::firstOrCreate(['user_id' => $userId]);

        // Tìm item
        $item = CartItem::where('cart_id', $cart->id)
                        ->where('book_id', $bookId)
                        ->first();

        if (!$item) {
            return response()->json(
                ['error' => 'Không tìm thấy sản phẩm trong giỏ'],
                Response::HTTP_NOT_FOUND
            );
        }

        // Update số lượng
        $item->update(['quantity' => (int) $request->quantity]);

        $cart->load('items.book');

        return response()->json(['data' => $cart], Response::HTTP_OK);
    }

    /**
     * -------------------------------------------------------------------------
     * Xoá một item khỏi giỏ
     * -------------------------------------------------------------------------
     * Logic:
     *  - Xác định user_id.
     *  - Lấy giỏ của user.
     *  - Tìm item theo book_id, nếu không có thì báo lỗi.
     *  - Nếu có thì xoá và trả về giỏ hàng còn lại.
     */
    public function removeItem(Request $request, $bookId)
    {
        $userId = $request->user()->id ?? null;

        $cart = Cart::firstOrCreate(['user_id' => $userId]);

        $item = CartItem::where('cart_id', $cart->id)
                        ->where('book_id', $bookId)
                        ->first();

        if (!$item) {
            return response()->json(
                ['error' => 'Không tìm thấy sản phẩm trong giỏ'],
                Response::HTTP_NOT_FOUND
            );
        }

        $item->delete();

        $cart->load('items.book');

        return response()->json(['data' => $cart], Response::HTTP_OK);
    }

}
