<?php

namespace App\Http\Controllers\API;

use App\Models\Book;
use App\Models\Order;
use App\Models\Address;
use App\Models\OrderItem;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\OrderStatusChanged;
use App\Mail\OrderPlaced;
use App\Mail\OrderCancelledByAdmin;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for the authenticated user
     */
    public function searchByCode(Request $req)
{
    $req->validate(['code' => 'required|string|max:50']);
    $code = $req->query('code');

    $order = \App\Models\Order::where('user_id', $req->user()->id)
        ->where(function($q) use ($code) {
            $q->where('code', $code)
              ->orWhere('order_code', $code)
              ->orWhere('order_number', $code)
              ->orWhere('reference', $code);
        })
        ->with(['items.book:id,title,price']) // tuỳ quan hệ
        ->first();

    if (!$order) return response()->json(['message' => 'Not found'], 404);
    return response()->json($order);
}

    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Order::with(['items.book.author', 'items.variation', 'user', 'address.province', 'address.wardModel'])
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
        $query = Order::with(['items.book.author', 'items.variation', 'user', 'address.province', 'address.wardModel'])
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
            'coupon_code' => 'nullable|string|max:50',
            // Add address validation
            'address.name' => 'required|string|max:255',
            'address.address' => 'required|string|max:500',
            'address.province_id' => 'required|exists:provinces,id',
            'address.ward_id' => 'required|exists:wards,id',
            'address.phone' => 'required|string|max:20',
            'address.email' => 'required|email|max:255',
        ], [
            'items.required' => 'Danh sách sản phẩm là bắt buộc.',
            'items.array' => 'Danh sách sản phẩm phải là mảng.',
            'items.min' => 'Phải có ít nhất 1 sản phẩm trong đơn hàng.',
            'items.*.book_id.required' => 'ID sách là bắt buộc.',
            'items.*.book_id.exists' => 'Sách không tồn tại.',
            'items.*.quantity.required' => 'Số lượng là bắt buộc.',
            'items.*.quantity.integer' => 'Số lượng phải là số nguyên.',
            'items.*.quantity.min' => 'Số lượng phải lớn hơn 0.',
            'items.*.price.required' => 'Giá là bắt buộc.',
            'items.*.price.numeric' => 'Giá phải là số.',
            'items.*.price.min' => 'Giá không được nhỏ hơn 0.',
            'shipping.numeric' => 'Phí vận chuyển phải là số.',
            'shipping.min' => 'Phí vận chuyển không được nhỏ hơn 0.',
            'notes.string' => 'Ghi chú phải là chuỗi ký tự.',
            'notes.max' => 'Ghi chú không được vượt quá 1000 ký tự.',
            'coupon_code.string' => 'Mã giảm giá phải là chuỗi ký tự.',
            'coupon_code.max' => 'Mã giảm giá không được vượt quá 50 ký tự.',
            'address.name.required' => 'Tên người nhận là bắt buộc.',
            'address.name.string' => 'Tên người nhận phải là chuỗi ký tự.',
            'address.name.max' => 'Tên người nhận không được vượt quá 255 ký tự.',
            'address.address.required' => 'Địa chỉ là bắt buộc.',
            'address.address.string' => 'Địa chỉ phải là chuỗi ký tự.',
            'address.address.max' => 'Địa chỉ không được vượt quá 500 ký tự.',
            'address.province_id.required' => 'Tỉnh/Thành phố là bắt buộc.',
            'address.province_id.exists' => 'Tỉnh/Thành phố không tồn tại.',
            'address.ward_id.required' => 'Phường/Xã là bắt buộc.',
            'address.ward_id.exists' => 'Phường/Xã không tồn tại.',
            'address.phone.required' => 'Số điện thoại là bắt buộc.',
            'address.phone.string' => 'Số điện thoại phải là chuỗi ký tự.',
            'address.phone.max' => 'Số điện thoại không được vượt quá 20 ký tự.',
            'address.email.required' => 'Email là bắt buộc.',
            'address.email.email' => 'Email không hợp lệ.',
            'address.email.max' => 'Email không được vượt quá 255 ký tự.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Xác thực thất bại',
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

            $orderAmount = $subtotal + $shipping;
            $discountAmount = 0;
            $coupon = null;

            // Handle coupon if provided
            if ($request->has('coupon_code') && !empty($request->coupon_code)) {
                $coupon = Coupon::where('code', $request->coupon_code)->first();
                
                if (!$coupon) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Mã khuyến mại không tồn tại'
                    ], Response::HTTP_BAD_REQUEST);
                }

                if (!$coupon->canBeUsedByUser($user->id)) {
                    $reasons = [];
                    
                    if (!$coupon->isValid()) {
                        if (!$coupon->is_active) {
                            $reasons[] = 'Mã khuyến mại đã bị vô hiệu hóa';
                        } elseif ($coupon->start_date > now()) {
                            $reasons[] = 'Mã khuyến mại chưa có hiệu lực';
                        } elseif ($coupon->end_date < now()) {
                            $reasons[] = 'Mã khuyến mại đã hết hạn';
                        }
                    }
                    
                    if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
                        $reasons[] = 'Mã khuyến mại đã hết lượt sử dụng';
                    }
                    
                    if ($coupon->usage_limit_per_user) {
                        $userUsageCount = $coupon->usages()->where('user_id', $user->id)->count();
                        if ($userUsageCount >= $coupon->usage_limit_per_user) {
                            $reasons[] = 'Bạn đã sử dụng hết lượt cho mã khuyến mại này';
                        }
                    }

                    return response()->json([
                        'success' => false,
                        'message' => implode('. ', $reasons)
                    ], Response::HTTP_BAD_REQUEST);
                }

                $discountAmount = $coupon->calculateDiscount($orderAmount);

                if ($discountAmount <= 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Đơn hàng không đủ điều kiện áp dụng mã khuyến mại này'
                    ], Response::HTTP_BAD_REQUEST);
                }
            }

            $total = $orderAmount - $discountAmount;

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'discount_amount' => $discountAmount,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => 'pending',
                'notes' => $request->notes,
            ]);

            // Create order items and update stock
            foreach ($items as $item) {
                // Check stock availability and load relationships
                $book = Book::with(['author', 'publisher', 'category', 'variations'])->find($item['book_id']);
                if (!$book) {
                    throw new \Exception("Sách với ID {$item['book_id']} không tồn tại");
                }
                
                $variation = null;
                $stockQuantity = $book->stock_quantity;
                $itemPrice = $book->price;
                $itemImage = $book->image;
                
                // If variation_id is provided, check variation stock
                if (isset($item['variation_id']) && $item['variation_id']) {
                    $variation = $book->variations()->find($item['variation_id']);
                    if (!$variation) {
                        throw new \Exception("Biến thể sách với ID {$item['variation_id']} không tồn tại");
                    }
                    $stockQuantity = $variation->stock_quantity;
                    $itemPrice = $variation->price;
                    $itemImage = $variation->image ?: $book->image;
                }
                
                if ($stockQuantity < $item['quantity']) {
                    $productName = $variation ? "{$book->title} (biến thể)" : $book->title;
                    throw new \Exception("Sản phẩm '{$productName}' không đủ số lượng trong kho. Còn lại: {$stockQuantity}, yêu cầu: {$item['quantity']}");
                }
                
                // Create order item with book snapshot
                OrderItem::create([
                    'order_id' => $order->id,
                    'book_id' => $item['book_id'],
                    'variation_id' => $item['variation_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'book_title' => $book->title,
                    'book_sku' => $variation ? $variation->sku : $book->sku,
                    'book_description' => $book->description,
                    'book_image' => $itemImage,
                    'author_name' => $book->author->name ?? null,
                    'publisher_name' => $book->publisher->name ?? null,
                    'category_name' => $book->category->name ?? null,
                ]);
                
                // Decrease stock quantity
                if ($variation) {
                    $variation->decrement('stock_quantity', $item['quantity']);
                } else {
                    $book->decrement('stock_quantity', $item['quantity']);
                }
            }

            // Create address if provided
            if ($request->has('address')) {
                Address::create([
                    'order_id' => $order->id,
                    'name' => $request->address['name'],
                    'address' => $request->address['address'],
                    'province_id' => $request->address['province_id'],
                    'ward_id' => $request->address['ward_id'],
                    'phone' => $request->address['phone'],
                    'email' => $request->address['email'],
                ]);
            }

            // Record coupon usage if coupon was applied
            if ($coupon && $discountAmount > 0) {
                CouponUsage::create([
                    'coupon_id' => $coupon->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'discount_amount' => $discountAmount,
                ]);

                // Increment coupon usage count
                $coupon->increment('used_count');
            }

            // Load relationships for response
            $order->load(['items', 'user', 'address.province', 'address.wardModel']);

            // Send order placed email notification
            if ($order->user && $order->user->email && filter_var($order->user->email, FILTER_VALIDATE_EMAIL)) {
                try {
                    Mail::to($order->user->email)->queue(new OrderPlaced($order));
                } catch (\Exception $mailException) {
                    // Log email error but don't fail the order creation
                    Log::error('Failed to send order placed email: ' . $mailException->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Tạo đơn hàng thành công',
                'data' => $order
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tạo đơn hàng thất bại: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified order
     */
    public function show($id)
    {
        $user = Auth::user();

        $order = Order::with(['items.book.author', 'user', 'address.province', 'address.wardModel'])
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
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
        $order = Order::with(['items.book.author', 'user', 'address.province', 'address.wardModel'])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
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
            'cancellation_reason' => 'required_if:status,cancelled|string|max:500',
        ], [
            'status.required' => 'Trạng thái đơn hàng là bắt buộc.',
            'status.in' => 'Trạng thái đơn hàng không hợp lệ. Chỉ chấp nhận: pending, processing, shipped, delivered, cancelled.',
            'notes.string' => 'Ghi chú phải là chuỗi ký tự.',
            'notes.max' => 'Ghi chú không được vượt quá 1000 ký tự.',
            'cancellation_reason.required_if' => 'Lý do hủy đơn hàng là bắt buộc khi trạng thái là cancelled.',
            'cancellation_reason.string' => 'Lý do hủy phải là chuỗi ký tự.',
            'cancellation_reason.max' => 'Lý do hủy không được vượt quá 500 ký tự.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Xác thực thất bại',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], Response::HTTP_NOT_FOUND);
        }

        // Kiểm tra trình tự trạng thái hợp lệ
        if (!$order->canTransitionTo($request->status)) {
            $currentStatusName = Order::getStatusDisplayName($order->status);
            $newStatusName = Order::getStatusDisplayName($request->status);
            $allowedStatuses = $order->getAllowedNextStatuses();
            $allowedStatusNames = array_map(function($status) {
                return Order::getStatusDisplayName($status);
            }, $allowedStatuses);
            
            return response()->json([
                'success' => false,
                'message' => "Không thể chuyển từ trạng thái '{$currentStatusName}' sang '{$newStatusName}'. Các trạng thái hợp lệ tiếp theo: " . (empty($allowedStatusNames) ? 'Không có' : implode(', ', $allowedStatusNames)),
                'current_status' => $order->status,
                'current_status_name' => $currentStatusName,
                'requested_status' => $request->status,
                'requested_status_name' => $newStatusName,
                'allowed_next_statuses' => $allowedStatuses,
                'allowed_next_status_names' => $allowedStatusNames
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Store old status before updating
            $oldStatus = $order->status;
            
            $order->update([
                'status' => $request->status,
                'notes' => $request->notes ?? $order->notes,
            ]);

            // Handle stock restoration when order is cancelled
            if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
                foreach ($order->items as $item) {
                    $book = Book::find($item->book_id);
                    if ($book) {
                        // Restore stock quantity
                        $book->increment('stock_quantity', $item->quantity);
                    }
                }
            }

            // Load all necessary relationships for email templates
            $order->load(['items.book.author', 'user', 'address.province', 'address.wardModel']);

            // Send email notification if status changed and user has email
            if ($oldStatus !== $request->status && $order->user && $order->user->email && filter_var($order->user->email, FILTER_VALIDATE_EMAIL)) {
                try {
                    // Send order cancelled by admin email if status changed to cancelled
                    if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
                        $reason = $request->cancellation_reason ?? 'Không có lý do cụ thể';
                        Mail::to($order->user->email)->queue(
                            new OrderCancelledByAdmin($order, $reason)
                        );
                    } else {
                        // Send regular status change email
                        Mail::to($order->user->email)->queue(
                            new OrderStatusChanged($order, $oldStatus, $request->status)
                        );
                    }
                } catch (\Exception $mailException) {
                    // Log email error but don't fail the status update
                    Log::error('Failed to send order status email: ' . $mailException->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái đơn hàng thành công',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật trạng thái đơn hàng thất bại: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Cancel an order (user can only cancel their own pending or processing orders)
     */
    public function cancel($id)
    {
        $user = Auth::user();

        $order = Order::where('id', $id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'processing'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng hoặc không thể hủy'
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $order->update([
                'status' => 'cancelled',
                'payment_status' => 'cancelled'
            ]);

            // Restore stock quantity when order is cancelled
            foreach ($order->items as $item) {
                $book = Book::find($item->book_id);
                if ($book) {
                    $book->increment('stock_quantity', $item->quantity);
                }
            }

            $order->load(['items', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Hủy đơn hàng thành công',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Hủy đơn hàng thất bại: ' . $e->getMessage()
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
        ], [
            'payment_status.required' => 'Trạng thái thanh toán là bắt buộc.',
            'payment_status.in' => 'Trạng thái thanh toán không hợp lệ. Chỉ chấp nhận: pending, completed, failed, refunded.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Xác thực thất bại',
                'errors' => $validator->errors()
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $order = Order::with(['items', 'user', 'address'])->findOrFail($id);
            $oldPaymentStatus = $order->payment_status;
            
            $order->update([
                'payment_status' => $request->payment_status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái thanh toán thành công',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật trạng thái thanh toán thất bại: ' . $e->getMessage()
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
                'message' => 'Xóa đơn hàng thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Xóa đơn hàng thất bại: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Lấy danh sách trạng thái có thể chuyển cho đơn hàng
     */
    public function getAllowedStatuses($id)
    {
        $order = Order::find($id);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], Response::HTTP_NOT_FOUND);
        }
        
        $allowedStatuses = $order->getAllowedNextStatuses();
        $statusOptions = [];
        
        foreach ($allowedStatuses as $status) {
            $statusOptions[] = [
                'value' => $status,
                'label' => Order::getStatusDisplayName($status)
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'current_status' => $order->status,
                'current_status_name' => Order::getStatusDisplayName($order->status),
                'allowed_next_statuses' => $statusOptions
            ]
        ]);
    }
}
