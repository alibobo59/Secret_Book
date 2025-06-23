<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Mail\OrderConfirmation;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $query = Order::with(['items.book', 'address', 'user']);

        if (!in_array(auth()->user()->role, ['admin', 'mod'])) {
            $query->where('user_id', auth()->id());
        }

        $orders = $query->get()->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'subtotal' => $order->subtotal,
                'shipping' => $order->shipping,
                'total' => $order->total,
                'user_id' => $order->user_id,
                'customerName' => $order->user->name ?? 'N/A',
                'customerEmail' => $order->user->email ?? 'N/A',
                'items' => $order->items->map(fn($item) => [
                    'book_id' => $item->book_id,
                    'title' => $item->book->title,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ]),
                'shipping_address' => [
                    'name' => $order->address->name,
                    'address' => $order->address->address,
                    'city' => $order->address->city,
                    'postal_code' => $order->address->postal_code,
                    'phone' => $order->address->phone,
                    'email' => $order->address->email,
                ],
                'notes' => $order->notes,
                'cancellation_reason' => $order->cancellation_reason,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ];
        });

        return response()->json($orders, Response::HTTP_OK);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $books = Book::whereIn('id', collect($request->items)->pluck('bookId'))
                ->get()
                ->keyBy('id');

            $subtotal = 0;

            foreach ($request->items as $item) {
                $bookId = $item['bookId'];
                if (!isset($books[$bookId])) {
                    return response()->json([
                        'message' => "Invalid book ID: {$bookId}",
                    ], Response::HTTP_BAD_REQUEST);
                }

                $book = $books[$bookId];
                if ($book->stock_quantity < $item['quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for book ID {$bookId}",
                    ], Response::HTTP_BAD_REQUEST);
                }

                $itemTotal = $book->price * $item['quantity'];
                $subtotal += $itemTotal;
            }

            $shipping = 0;
            $total = $subtotal;

            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => 'ORD-' . date('Y') . '-' . str_pad((Order::max('id') ?? 0) + 1, 4, '0', STR_PAD_LEFT),
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total' => $total,
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                $book = $books[$item['bookId']];
                OrderItem::create([
                    'order_id' => $order->id,
                    'book_id' => $item['bookId'],
                    'quantity' => $item['quantity'],
                    'price' => $book->price,
                ]);
                Book::where('id', $item['bookId'])->decrement('stock_quantity', $item['quantity']);
            }

            Address::create([
                'order_id' => $order->id,
                'name' => $request->shippingAddress['name'],
                'address' => $request->shippingAddress['address'],
                'city' => $request->shippingAddress['city'],
                'postal_code' => null,
                'phone' => $request->contactInfo['phone'],
                'email' => $request->contactInfo['email'] ?? null,
            ]);

            // Mail::to(auth()->user()->email)->queue(new OrderConfirmation($order));

            return response()->json([
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'total' => $order->total,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ], Response::HTTP_CREATED);
        });
    }

    public function show(Order $order): JsonResponse
    {
        if ($order->user_id !== auth()->id() && !in_array(auth()->user()->role, ['admin', 'mod'])) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $order->load(['items.book', 'address', 'user']);

        return response()->json([
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'subtotal' => $order->subtotal,
            'shipping' => $order->shipping,
            'total' => $order->total,
            'user_id' => $order->user_id,
            'customerName' => $order->user->name ?? 'N/A',
            'customerEmail' => $order->user->email ?? 'N/A',
            'items' => $order->items->map(fn($item) => [
                'book_id' => $item->book_id,
                'title' => $item->book->title,
                'quantity' => $item->quantity,
                'price' => $item->price,
            ]),
            'shipping_address' => [
                'name' => $order->address->name,
                'address' => $order->address->address,
                'city' => $order->address->city,
                'postal_code' => $order->address->postal_code,
                'phone' => $order->address->phone,
                'email' => $order->address->email,
            ],
            'notes' => $order->notes,
            'cancellation_reason' => $order->cancellation_reason,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ], Response::HTTP_OK);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        if (!in_array(auth()->user()->role, ['admin', 'mod'])) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
        ]);

        $order->update([
            'status' => $request->status,
            'updated_at' => now(),
        ]);

        $order->load(['items.book', 'address', 'user']);

        return response()->json([
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'subtotal' => $order->subtotal,
            'shipping' => $order->shipping,
            'total' => $order->total,
            'user_id' => $order->user_id,
            'customerName' => $order->user->name ?? 'N/A',
            'customerEmail' => $order->user->email ?? 'N/A',
            'items' => $order->items->map(fn($item) => [
                'book_id' => $item->book_id,
                'title' => $item->book->title,
                'quantity' => $item->quantity,
                'price' => $item->price,
            ]),
            'shipping_address' => [
                'name' => $order->address->name,
                'address' => $order->address->address,
                'city' => $order->address->city,
                'postal_code' => $order->address->postal_code,
                'phone' => $order->address->phone,
                'email' => $order->address->email,
            ],
            'notes' => $order->notes,
            'cancellation_reason' => $order->cancellation_reason,
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ], Response::HTTP_OK);
    }

    public function cancelOrder(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== auth()->id() && !in_array(auth()->user()->role, ['admin', 'mod'])) {
            return response()->json(['message' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'message' => 'Order cannot be cancelled. It is not in a cancellable state.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $request->validate([
            'cancellation_reason' => ['required', 'string', 'min:10', 'max:500'],
        ]);

        return DB::transaction(function () use ($order, $request) {
            // Update order status to cancelled with reason
            $order->update([
                'status' => 'cancelled',
                'cancellation_reason' => $request->cancellation_reason,
                'updated_at' => now(),
            ]);

            // Restore stock for each order item
            foreach ($order->items as $item) {
                Book::where('id', $item->book_id)->increment('stock_quantity', $item->quantity);
            }

            // Load related data for response
            $order->load(['items.book', 'address', 'user']);

            return response()->json([
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'subtotal' => $order->subtotal,
                'shipping' => $order->shipping,
                'total' => $order->total,
                'user_id' => $order->user_id,
                'customerName' => $order->user->name ?? 'N/A',
                'customerEmail' => $order->user->email ?? 'N/A',
                'items' => $order->items->map(fn($item) => [
                    'book_id' => $item->book_id,
                    'title' => $item->book->title,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ]),
                'shipping_address' => [
                    'name' => $order->address->name,
                    'address' => $order->address->address,
                    'city' => $order->address->city,
                    'postal_code' => $order->address->postal_code,
                    'phone' => $order->address->phone,
                    'email' => $order->address->email,
                ],
                'notes' => $order->notes,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ], Response::HTTP_OK);
        });
    }
}

