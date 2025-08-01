<?php
<<<<<<< HEAD
namespace App\Http\Controllers\API;
=======

namespace App\Http\Controllers\API;

>>>>>>> safety-checkpoint
use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index()
<<<<<<< HEAD
    //Lấy giỏ hàng hiện tại
=======
>>>>>>> safety-checkpoint
    {
        try {
            $user = Auth::user();
            $cart = $user->cart()->with(['items.book'])->first();

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
                'message' => 'Failed to fetch cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addItem(Request $request)
<<<<<<< HEAD
    //Thêm sản phẩm vào giỏ
=======
>>>>>>> safety-checkpoint
    {
        try {
            $validator = Validator::make($request->all(), [
                'book_id' => 'required|exists:books,id',
                'quantity' => 'required|integer|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $cart = $user->getOrCreateCart();

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
                'message' => 'Item added to cart successfully',
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
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateItem(Request $request, $bookId)
<<<<<<< HEAD
    //Cập nhật số lượng sản phẩm
=======
>>>>>>> safety-checkpoint
    {
        try {
            $validator = Validator::make($request->all(), [
                'quantity' => 'required|integer|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $cart = $user->cart;

            if (!$cart) {
                return response()->json(['message' => 'Cart not found'], 404);
            }

            $cartItem = $cart->items()->where('book_id', $bookId)->first();

            if (!$cartItem) {
                return response()->json(['message' => 'Item not found in cart'], 404);
            }

            $cartItem->update(['quantity' => $request->quantity]);
            $cartItem->load('book');

            return response()->json([
                'message' => 'Item updated successfully',
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
                'message' => 'Failed to update item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function removeItem($bookId)
<<<<<<< HEAD
    //Xóa sản phẩm khỏi giỏ
=======
>>>>>>> safety-checkpoint
    {
        try {
            $user = Auth::user();
            $cart = $user->cart;

            if (!$cart) {
                return response()->json(['message' => 'Cart not found'], 404);
            }

            $cartItem = $cart->items()->where('book_id', $bookId)->first();

            if (!$cartItem) {
                return response()->json(['message' => 'Item not found in cart'], 404);
            }

            $cartItem->delete();

            return response()->json(['message' => 'Item removed from cart successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to remove item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function clear()
<<<<<<< HEAD
    //Xóa toàn bộ giỏ
=======
>>>>>>> safety-checkpoint
    {
        try {
            $user = Auth::user();
            $cart = $user->cart;

            if ($cart) {
                $cart->items()->delete();
            }

            return response()->json(['message' => 'Cart cleared successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function merge(Request $request)
    {
<<<<<<< HEAD
        //Gộp giỏ hàng của khách với user khi đăng nhập
=======
>>>>>>> safety-checkpoint
        try {
            $validator = Validator::make($request->all(), [
                'guest_cart' => 'required|array',
                'guest_cart.*.id' => 'required|exists:books,id',
                'guest_cart.*.quantity' => 'required|integer|min:1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $cart = $user->getOrCreateCart();
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
                'message' => 'Cart merged successfully',
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
                'message' => 'Failed to merge cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
