<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Book;
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
            $cart = $user->cart ? $user->cart->load(['items.book']) : null;

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
                    return [
                        'id' => $item->book->id,
                        'title' => $item->book->title,
                        'price' => $item->book->price,
                        'image' => $item->book->image,
                        'quantity' => $item->quantity,
                        'subtotal' => $item->subtotal
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
                'quantity' => 'required|integer|min:1'
            ], [
                'book_id.required' => 'ID sách là bắt buộc.',
                'book_id.exists' => 'Sách không tồn tại.',
                'quantity.required' => 'Số lượng là bắt buộc.',
                'quantity.integer' => 'Số lượng phải là số nguyên.',
                'quantity.min' => 'Số lượng phải lớn hơn 0.'
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
                $cart = Cart::create(['user_id' => $user->id]);
            }

            $existingItem = $cart->items()->where('book_id', $request->book_id)->first();

            if ($existingItem) {
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $request->quantity
                ]);
                $cartItem = $existingItem;
            } else {
                $cartItem = $cart->items()->create([
                    'book_id' => $request->book_id,
                    'quantity' => $request->quantity
                ]);
            }

            $cartItem->load('book');

            return response()->json([
                'message' => 'Thêm sản phẩm vào giỏ hàng thành công',
                'item' => [
                    'id' => $cartItem->book->id,
                    'title' => $cartItem->book->title,
                    'price' => $cartItem->book->price,
                    'image' => $cartItem->book->image,
                    'quantity' => $cartItem->quantity,
                    'subtotal' => $cartItem->subtotal
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Thêm sản phẩm vào giỏ hàng thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateItem(Request $request, $bookId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'quantity' => 'required|integer|min:1'
            ], [
                'quantity.required' => 'Số lượng là bắt buộc.',
                'quantity.integer' => 'Số lượng phải là số nguyên.',
                'quantity.min' => 'Số lượng phải lớn hơn 0.'
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

            $cartItem = $cart->items()->where('book_id', $bookId)->first();

            if (!$cartItem) {
                return response()->json(['message' => 'Không tìm thấy sản phẩm trong giỏ hàng'], 404);
            }

            $cartItem->update(['quantity' => $request->quantity]);
            $cartItem->load('book');

            return response()->json([
                'message' => 'Cập nhật sản phẩm thành công',
                'item' => [
                    'id' => $cartItem->book->id,
                    'title' => $cartItem->book->title,
                    'price' => $cartItem->book->price,
                    'image' => $cartItem->book->image,
                    'quantity' => $cartItem->quantity,
                    'subtotal' => $cartItem->subtotal
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Cập nhật sản phẩm thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function removeItem($bookId)
    {
        try {
            $user = Auth::user();
            $cart = $user->cart;

            if (!$cart) {
                return response()->json(['message' => 'Không tìm thấy giỏ hàng'], 404);
            }

            $cartItem = $cart->items()->where('book_id', $bookId)->first();

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

    public function removeItems(Request $request)
    {
        Log::info('🔍 CartController::removeItems called with request data:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'book_ids' => 'required|array',
            'book_ids.*' => 'integer|exists:books,id',
        ]);

        if ($validator->fails()) {
            Log::error('❌ Validation failed:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = Auth::user();
            $cart = $user->cart;
            
            Log::info('👤 User ID: ' . $user->id . ', Cart ID: ' . ($cart ? $cart->id : 'null'));
            Log::info('🔢 Book IDs to remove:', $request->book_ids);

            if ($cart) {
                $itemsBeforeDelete = $cart->items()->pluck('book_id')->toArray();
                Log::info('📦 Cart items before deletion:', $itemsBeforeDelete);
                
                $deletedCount = $cart->items()->whereIn('book_id', $request->book_ids)->delete();
                Log::info('🗑️ Number of items deleted: ' . $deletedCount);
                
                $itemsAfterDelete = $cart->items()->pluck('book_id')->toArray();
                Log::info('📦 Cart items after deletion:', $itemsAfterDelete);
            } else {
                Log::warning('⚠️ No cart found for user');
            }

            return response()->json(['message' => 'Các sản phẩm đã chọn đã được xóa khỏi giỏ hàng']);
        } catch (\Exception $e) {
            Log::error('❌ Exception in removeItems:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
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

    public function merge(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'guest_cart' => 'required|array',
                'guest_cart.*.id' => 'required|exists:books,id',
                'guest_cart.*.quantity' => 'required|integer|min:1'
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
                $cart = Cart::create(['user_id' => $user->id]);
            }
            
            $guestCart = $request->guest_cart;

            DB::transaction(function () use ($cart, $guestCart) {
                foreach ($guestCart as $guestItem) {
                    $existingItem = $cart->items()->where('book_id', $guestItem['id'])->first();

                    if ($existingItem) {
                        // Merge quantities
                        $existingItem->update([
                            'quantity' => $existingItem->quantity + $guestItem['quantity']
                        ]);
                    } else {
                        // Add new item
                        $cart->items()->create([
                            'book_id' => $guestItem['id'],
                            'quantity' => $guestItem['quantity']
                        ]);
                    }
                }
            });

            // Return updated cart
            $cart->load(['items.book']);

            return response()->json([
                'message' => 'Hợp nhất giỏ hàng thành công',
                'cart' => [
                    'items' => $cart->items->map(function ($item) {
                        return [
                            'id' => $item->book->id,
                            'title' => $item->book->title,
                            'price' => $item->book->price,
                            'image' => $item->book->image,
                            'quantity' => $item->quantity,
                            'subtotal' => $item->subtotal
                        ];
                    }),
                    'total' => $cart->total,
                    'item_count' => $cart->item_count
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi xảy ra khi merge giỏ hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
