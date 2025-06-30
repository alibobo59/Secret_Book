<?php

namespace App\Http\Controllers\API;

use App\Models\Book;
use App\Models\Order;
use App\Models\Address;
use App\Models\OrderItem;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\OrderStatusChanged;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for the authenticated user
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Order::with(['items.book', 'user', 'address'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status if provided
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Display all orders (admin only)
     */
    public function adminIndex(Request $request)
    {
        $query = Order::with(['items.book', 'user', 'address'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status if provided
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by user if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('id', 'like', '%' . $searchTerm . '%')
                  ->orWhere('order_number', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('user', function($userQuery) use ($searchTerm) {
                      $userQuery->where('name', 'like', '%' . $searchTerm . '%')
                               ->orWhere('email', 'like', '%' . $searchTerm . '%');
                  })
                  ->orWhereHas('address', function($addressQuery) use ($searchTerm) {
                      $addressQuery->where('name', 'like', '%' . $searchTerm . '%')
                                  ->orWhere('email', 'like', '%' . $searchTerm . '%')
                                  ->orWhere('phone', 'like', '%' . $searchTerm . '%')
                                  ->orWhere('address', 'like', '%' . $searchTerm . '%')
                                  ->orWhere('city', 'like', '%' . $searchTerm . '%');
                  });
            });
        }

        // Get per_page from request, default to 15
        $perPage = $request->get('per_page', 15);
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.book_id' => 'required|exists:books,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'shipping' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            // Add address validation
            'address.name' => 'required|string|max:255',
            'address.address' => 'required|string|max:500',
            'address.city' => 'required|string|max:100',
            'address.phone' => 'required|string|max:20',
            'address.email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $user = Auth::user();
            $items = $request->items;
            $shipping = $request->shipping ?? 0;

            // Calculate subtotal
            $subtotal = 0;
            foreach ($items as $item) {
                $subtotal += $item['price'] * $item['quantity'];
            }

            $total = $subtotal + $shipping;

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => 'pending',
                'notes' => $request->notes,
            ]);

            // Create order items
            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'book_id' => $item['book_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            // Create address if provided
            if ($request->has('address')) {
                Address::create([
                    'order_id' => $order->id,
                    'name' => $request->address['name'],
                    'address' => $request->address['address'],
                    'city' => $request->address['city'],
                    'phone' => $request->address['phone'],
                    'email' => $request->address['email'],
                ]);
            }

            // Load relationships for response
            $order->load(['items.book', 'user', 'address']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified order
     */
    public function show($id)
    {
        $user = Auth::user();

        $order = Order::with(['items.book', 'user', 'address'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Display the specified order (admin)
     */
    public function adminShow($id)
    {
        $order = Order::with(['items.book', 'user', 'address'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update the specified order status (admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            // Store old status before updating
            $oldStatus = $order->status;
            
            $order->update([
                'status' => $request->status,
                'notes' => $request->notes ?? $order->notes,
            ]);

            $order->load(['items.book', 'user', 'address']);

            // Send email notification if status changed and user has email
            if ($oldStatus !== $request->status && $order->user && $order->user->email) {
                try {
                    Mail::to($order->user->email)->send(
                        new OrderStatusChanged($order, $oldStatus, $request->status)
                    );
                } catch (\Exception $mailException) {
                    // Log email error but don't fail the status update
                    Log::error('Failed to send order status email: ' . $mailException->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Cancel an order (user can only cancel their own pending orders)
     */
    public function cancel($id)
    {
        $user = Auth::user();

        $order = Order::where('id', $id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found or cannot be cancelled'
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $order->update([
                'status' => 'cancelled',
                'payment_status' => 'cancelled'
            ]);

            $order->load(['items.book', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel order: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get order statistics (admin only)
     */
    public function getStats()
    {
        try {
            $stats = [
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'processing_orders' => Order::where('status', 'processing')->count(),
                'shipped_orders' => Order::where('status', 'shipped')->count(),
                'delivered_orders' => Order::where('status', 'delivered')->count(),
                'cancelled_orders' => Order::where('status', 'cancelled')->count(),
                'total_revenue' => Order::where('payment_status', 'completed')->sum('total'),
                'pending_payments' => Order::where('payment_status', 'pending')->count(),
                'completed_payments' => Order::where('payment_status', 'completed')->count(),
                'failed_payments' => Order::where('payment_status', 'failed')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get order statistics: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update payment status (admin only)
     */
    public function updatePaymentStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'payment_status' => 'required|in:pending,completed,failed,refunded'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $order = Order::with(['items.book', 'user', 'address'])->findOrFail($id);
            $oldPaymentStatus = $order->payment_status;
            
            $order->update([
                'payment_status' => $request->payment_status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete an order (admin only)
     */
    public function destroy($id)
    {
        try {
            $order = Order::findOrFail($id);
            
            // Delete related order items first
            $order->items()->delete();
            
            // Delete the order
            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
