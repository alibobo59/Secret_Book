<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Book;
use App\Models\BookVariation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            $cart = $user->cart ? $user->cart->load(['items.book.author', 'items.variation']) : null;

            if (!$cart) {
                return response()->json([
                    'cart' => null,
                    'items' => [],
                    'total' => 0,
                    'item_count' => 0
                ]);
            }

            return response()->json([
                'cart' => $cart,
                'items' => $cart->items->map(function ($item) {
                    $price = $item->variation ? $item->variation->price : $item->book->price;

                    return [
                        // 🔁 Trả về cartItemId để FE dùng khi PUT/DELETE
                        'id' => $item->id,                   // cartItemId
                        'cart_item_id' => $item->id,         // alias cho rõ
                        'book_id' => $item->book->id,
                        'title' => $item->book->title,
                        'price' => $price,
                        'image' => $item->variation && $item->variation->image ? $item->variation->image : $item->book->image,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->subtotal,
                        'stock_quantity' => $item->variation ? $item->variation->stock_quantity : $item->book->stock_quantity,
                        'author' => $item->book->author,
                        'variation_id' => $item->variation_id,
                        'sku' => $item->variation ? $item->variation->sku : $item->book->sku,
                        'variant_sku' => $item->variation ? $item->variation->sku : null,
                        'variation' => $item->variation ? [
                            'id' => $item->variation->id,
                            'attributes' => $item->variation->attributes,
                            'price' => $item->variation->price,
                            'stock_quantity' => $item->variation->stock_quantity,
                            'image' => $item->variation->image,
                            'sku' => $item->variation->sku
                        ] : null,
                    ];
                }),
                'total' => $cart->total,
                'item_count' => $cart->item_count
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lấy giỏ hàng thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addItem(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'book_id' => 'required|exists:books,id',
                'quantity' => 'required|integer|min:1',
                'variation_id' => 'nullable|exists:book_variations,id'
            ], [
                'book_id.required' => 'ID sách là bắt buộc.',
                'book_id.exists' => 'Sách không tồn tại.',
                'quantity.required' => 'Số lượng là bắt buộc.',
                'quantity.integer' => 'Số lượng phải là số nguyên.',
                'quantity.min' => 'Số lượng phải lớn hơn 0.',
                'variation_id.exists' => 'Biến thể sản phẩm không tồn tại.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Xác thực thất bại',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validate variation belongs to book
            if ($request->variation_id) {
                $variation = BookVariation::find($request->variation_id);
                if (!$variation || $variation->book_id != $request->book_id) {
                    return response()->json([
                        'message' => 'Biến thể không thuộc về sách này',
                    ], 422);
                }
            }

            $user = Auth::user();
            $cart = $user->cart ?: Cart::create(['user_id' => $user->id]);

            // merge theo (book_id, variation_id)
            $existingItem = $cart->items()
                ->where('book_id', $request->book_id)
                ->where(function ($q) use ($request) {
                    if ($request->variation_id) {
                        $q->where('variation_id', $request->variation_id);
                    } else {
                        $q->whereNull('variation_id');
                    }
                })
                ->first();

            if ($existingItem) {
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $request->quantity
                ]);
                $cartItem = $existingItem->fresh(['book.author', 'variation']);
            } else {
                $cartItem = $cart->items()->create([
                    'book_id' => $request->book_id,
                    'variation_id' => $request->variation_id,
                    'quantity' => $request->quantity,
                ]);
                $cartItem->load(['book.author', 'variation']);
            }

            $price = $cartItem->variation ? $cartItem->variation->price : $cartItem->book->price;

            return response()->json([
                'message' => 'Thêm sản phẩm vào giỏ hàng thành công',
                'item' => [
                    'id' => $cartItem->id,              // 🔁 trả về cartItemId
                    'cart_item_id' => $cartItem->id,
                    'book_id' => $cartItem->book->id,
                    'title' => $cartItem->book->title,
                    'price' => $price,
                    'image' => $cartItem->variation && $cartItem->variation->image ? $cartItem->variation->image : $cartItem->book->image,
                    'quantity' => $cartItem->quantity,
                    'subtotal' => $cartItem->subtotal,
                    'stock_quantity' => $cartItem->variation ? $cartItem->variation->stock_quantity : $cartItem->book->stock_quantity,
                    'author' => $cartItem->book->author,
                    'variation_id' => $cartItem->variation_id,
                    'sku' => $cartItem->variation ? $cartItem->variation->sku : $cartItem->book->sku,
                    'variant_sku' => $cartItem->variation ? $cartItem->variation->sku : null,
                    'variation' => $cartItem->variation ? [
                        'id' => $cartItem->variation->id,
                        'attributes' => $cartItem->variation->attributes,
                        'price' => $cartItem->variation->price,
                        'stock_quantity' => $cartItem->variation->stock_quantity,
                        'image' => $cartItem->variation->image,
                        'sku' => $cartItem->variation->sku
                    ] : null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Thêm sản phẩm vào giỏ hàng thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🔁 Dùng cartItemId
    public function updateItem(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'quantity' => 'required|integer|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Xác thực thất bại',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $cart = $user->cart;

            if (!$cart) {
                return response()->json(['message' => 'Không tìm thấy giỏ hàng'], 404);
            }

            $cartItem = $cart->items()->where('id', $id)->first();
            if (!$cartItem) {
                return response()->json(['message' => 'Không tìm thấy sản phẩm trong giỏ hàng'], 404);
            }

            $cartItem->update(['quantity' => $request->quantity]);
            $cartItem->load(['book.author', 'variation']);

            $price = $cartItem->variation ? $cartItem->variation->price : $cartItem->book->price;

            return response()->json([
                'message' => 'Cập nhật sản phẩm thành công',
                'item' => [
                    'id' => $cartItem->id, // cartItemId
                    'cart_item_id' => $cartItem->id,
                    'book_id' => $cartItem->book->id,
                    'title' => $cartItem->book->title,
                    'price' => $price,
                    'image' => $cartItem->variation && $cartItem->variation->image ? $cartItem->variation->image : $cartItem->book->image,
                    'quantity' => $cartItem->quantity,
                    'subtotal' => $cartItem->subtotal,
                    'stock_quantity' => $cartItem->variation ? $cartItem->variation->stock_quantity : $cartItem->book->stock_quantity,
                    'author' => $cartItem->book->author,
                    'variation_id' => $cartItem->variation_id,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Cập nhật sản phẩm thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🔁 Dùng cartItemId
    public function removeItem($id)
    {
        try {
            $user = Auth::user();
            $cart = $user->cart;

            if (!$cart) {
                return response()->json(['message' => 'Không tìm thấy giỏ hàng'], 404);
            }

            $cartItem = $cart->items()->where('id', $id)->first();
            if (!$cartItem) {
                return response()->json(['message' => 'Không tìm thấy sản phẩm trong giỏ hàng'], 404);
            }

            $cartItem->delete();

            return response()->json(['message' => 'Xóa sản phẩm khỏi giỏ hàng thành công']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Xóa sản phẩm thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 🔁 Bulk delete theo cartItemId
    public function removeItems(Request $request)
    {
        Log::info('CartController::removeItems payload:', $request->all());

        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:cart_items,id',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = Auth::user();
            $cart = $user->cart;

            if (!$cart) {
                return response()->json(['message' => 'Không tìm thấy giỏ hàng'], 404);
            }

            $deleted = $cart->items()->whereIn('id', $request->ids)->delete();

            return response()->json([
                'message' => 'Các sản phẩm đã chọn đã được xóa khỏi giỏ hàng',
                'deleted' => $deleted
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in removeItems:', ['message' => $e->getMessage()]);
            return response()->json([
                'message' => 'Xóa sản phẩm thất bại',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function clear()
    {
        try {
            $user = Auth::user();
            $cart = $user->cart;

            if ($cart) {
                $cart->items()->delete();
            }

            return response()->json(['message' => 'Giỏ hàng đã được xóa']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Xóa giỏ hàng thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Hỗ trợ merge theo format FE: { items: [{book_id, quantity, variation_id?}] }
    public function merge(Request $request)
    {
        try {
            // chấp nhận cả "items" (mới) hoặc "guest_cart" (cũ)
            $payloadItems = $request->input('items');
            if (!$payloadItems) {
                // backward-compat
                $guest = $request->input('guest_cart', []);
                $payloadItems = array_map(function ($gi) {
                    return [
                        'book_id' => $gi['id'],
                        'quantity' => $gi['quantity'],
                        'variation_id' => $gi['variation_id'] ?? null,
                    ];
                }, $guest);
            }

            $validator = Validator::make(['items' => $payloadItems], [
                'items' => 'required|array',
                'items.*.book_id' => 'required|exists:books,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.variation_id' => 'nullable|exists:book_variations,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Xác thực thất bại',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $cart = $user->cart ?: Cart::create(['user_id' => $user->id]);

            DB::transaction(function () use ($cart, $payloadItems) {
                foreach ($payloadItems as $it) {
                    $existing = $cart->items()
                        ->where('book_id', $it['book_id'])
                        ->where(function ($q) use ($it) {
                            if (!empty($it['variation_id'])) {
                                $q->where('variation_id', $it['variation_id']);
                            } else {
                                $q->whereNull('variation_id');
                            }
                        })
                        ->first();

                    if ($existing) {
                        $existing->update(['quantity' => $existing->quantity + $it['quantity']]);
                    } else {
                        $cart->items()->create([
                            'book_id' => $it['book_id'],
                            'variation_id' => $it['variation_id'] ?? null,
                            'quantity' => $it['quantity'],
                        ]);
                    }
                }
            });

            $cart->load(['items.book.author', 'items.variation']);

            return response()->json([
                'message' => 'Hợp nhất giỏ hàng thành công',
                'cart' => [
                    'items' => $cart->items->map(function ($item) {
                        $price = $item->variation ? $item->variation->price : $item->book->price;
                        return [
                            'id' => $item->id,
                            'cart_item_id' => $item->id,
                            'book_id' => $item->book->id,
                            'title' => $item->book->title,
                            'price' => $price,
                            'image' => $item->variation && $item->variation->image ? $item->variation->image : $item->book->image,
                            'quantity' => $item->quantity,
                            'subtotal' => $item->subtotal,
                            'stock_quantity' => $item->variation ? $item->variation->stock_quantity : $item->book->stock_quantity,
                            'author' => $item->book->author,
                            'variation_id' => $item->variation_id,
                            'sku' => $item->variation ? $item->variation->sku : $item->book->sku,
                            'variant_sku' => $item->variation ? $item->variation->sku : null,
                            'variation' => $item->variation ? [
                                'id' => $item->variation->id,
                                'attributes' => $item->variation->attributes,
                                'price' => $item->variation->price,
                                'stock_quantity' => $item->variation->stock_quantity,
                                'image' => $item->variation->image,
                                'sku' => $item->variation->sku
                            ] : null,
                        ];
                    }),
                    'total' => $cart->total,
                    'item_count' => $cart->item_count
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Hợp nhất giỏ hàng thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
