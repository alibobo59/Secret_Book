<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\Refund;
use App\Services\VNPayRefundService;

class RefundController extends Controller
{
    protected $vnpayRefundService;

    public function __construct(VNPayRefundService $vnpayRefundService)
    {
        $this->vnpayRefundService = $vnpayRefundService;
    }

    /**
     * Lấy danh sách hoàn tiền (Admin)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Refund::with(['order.user', 'user']);

            // Lọc theo trạng thái
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            // Lọc theo phương thức hoàn tiền
            if ($request->has('refund_method') && $request->refund_method !== '') {
                $query->where('refund_method', $request->refund_method);
            }

            // Lọc theo loại hoàn tiền
            if ($request->has('refund_type') && $request->refund_type !== '') {
                $query->where('refund_type', $request->refund_type);
            }

            // Tìm kiếm theo mã hoàn tiền hoặc mã đơn hàng
            if ($request->has('search') && $request->search !== '') {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('refund_number', 'like', "%{$search}%")
                      ->orWhereHas('order', function ($orderQuery) use ($search) {
                          $orderQuery->where('order_number', 'like', "%{$search}%");
                      });
                });
            }

            // Lọc theo khoảng thời gian
            if ($request->has('date_from') && $request->date_from !== '') {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to !== '') {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Sắp xếp
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Phân trang
            $perPage = $request->get('per_page', 15);
            $refunds = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $refunds,
                'message' => 'Lấy danh sách hoàn tiền thành công'
            ]);

        } catch (\Exception $e) {
            Log::error('Get refunds list error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách hoàn tiền'
            ], 500);
        }
    }

    /**
     * Lấy chi tiết hoàn tiền
     */
    public function show($id): JsonResponse
    {
        try {
            $refund = Refund::with([
                'order.user',
                'order.items.book',
                'refundItems',
                'user'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $refund,
                'message' => 'Lấy chi tiết hoàn tiền thành công'
            ]);

        } catch (\Exception $e) {
            Log::error('Get refund detail error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin hoàn tiền'
            ], 404);
        }
    }

    /**
     * Tạo yêu cầu hoàn tiền toàn phần (Admin)
     */
    public function createFullRefund(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'reason' => 'nullable|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $order = Order::findOrFail($request->order_id);
            $userId = Auth::id();

            // Gọi service để tạo hoàn tiền
            $result = $this->vnpayRefundService->createFullRefund(
                $order,
                $request->reason ?? '',
                $userId
            );

            if (!$result['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => $result['error']
                ], 400);
            }

            // Cập nhật ghi chú admin nếu có
            if ($request->admin_notes) {
                $result['refund']->update(['admin_notes' => $request->admin_notes]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $result['refund']->load(['order', 'user']),
                'message' => 'Tạo yêu cầu hoàn tiền thành công'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create full refund error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo yêu cầu hoàn tiền'
            ], 500);
        }
    }

    /**
     * Tạo yêu cầu hoàn tiền một phần (Admin)
     */
    public function createPartialRefund(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'refund_amount' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string|max:1000',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $order = Order::findOrFail($request->order_id);
            $userId = Auth::id();

            // Gọi service để tạo hoàn tiền
            $result = $this->vnpayRefundService->createPartialRefund(
                $order,
                $request->refund_amount,
                $request->reason ?? '',
                $userId
            );

            if (!$result['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => $result['error']
                ], 400);
            }

            // Cập nhật ghi chú admin nếu có
            if ($request->admin_notes) {
                $result['refund']->update(['admin_notes' => $request->admin_notes]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $result['refund']->load(['order', 'user']),
                'message' => 'Tạo yêu cầu hoàn tiền một phần thành công'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create partial refund error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo yêu cầu hoàn tiền'
            ], 500);
        }
    }

    /**
     * Cập nhật trạng thái hoàn tiền (Admin)
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,completed,failed,cancelled',
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $refund = Refund::findOrFail($id);
            $userId = Auth::id();

            // Cập nhật trạng thái
            $refund->updateStatus($request->status, $request->admin_notes);
            $refund->processed_by = $userId;
            $refund->save();

            return response()->json([
                'success' => true,
                'data' => $refund->load(['order', 'processedBy']),
                'message' => 'Cập nhật trạng thái hoàn tiền thành công'
            ]);

        } catch (\Exception $e) {
            Log::error('Update refund status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật trạng thái hoàn tiền'
            ], 500);
        }
    }

    /**
     * Kiểm tra trạng thái hoàn tiền từ VNPay
     */
    public function checkVNPayStatus($id): JsonResponse
    {
        try {
            $refund = Refund::findOrFail($id);

            if ($refund->refund_method !== 'vnpay') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hoàn tiền này không sử dụng VNPay'
                ], 400);
            }

            if (empty($refund->vnpay_txn_ref)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy mã giao dịch VNPay'
                ], 400);
            }

            // Gọi API VNPay để kiểm tra trạng thái
            $result = $this->vnpayRefundService->queryRefundStatus($refund);

            if ($result['success']) {
                // Cập nhật thông tin từ VNPay nếu cần
                $vnpayData = $result['data'];
                $refund->update([
                    'vnpay_response' => $vnpayData
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'refund' => $refund,
                        'vnpay_status' => $vnpayData
                    ],
                    'message' => 'Kiểm tra trạng thái VNPay thành công'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Check VNPay refund status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi kiểm tra trạng thái VNPay'
            ], 500);
        }
    }

    /**
     * Lấy danh sách hoàn tiền của khách hàng
     */
    public function getCustomerRefunds(Request $request): JsonResponse
    {
        try {
            $userId = Auth::id();
            
            $query = Refund::with(['order'])
                ->whereHas('order', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                });

            // Lọc theo trạng thái
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            // Sắp xếp
            $query->orderBy('created_at', 'desc');

            // Phân trang
            $perPage = $request->get('per_page', 10);
            $refunds = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $refunds,
                'message' => 'Lấy danh sách hoàn tiền thành công'
            ]);

        } catch (\Exception $e) {
            Log::error('Get customer refunds error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy danh sách hoàn tiền'
            ], 500);
        }
    }

    /**
     * Yêu cầu hoàn tiền từ khách hàng
     */
    public function requestRefund(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'reason' => 'required|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = Auth::id();
            $order = Order::where('id', $request->order_id)
                         ->where('user_id', $userId)
                         ->firstOrFail();

            // Kiểm tra điều kiện yêu cầu hoàn tiền
            if ($order->payment_method !== 'vnpay') {
                return response()->json([
                    'success' => false,
                    'message' => 'Chỉ có thể yêu cầu hoàn tiền cho đơn hàng thanh toán bằng VNPay'
                ], 400);
            }

            if (!in_array($order->payment_status, ['completed', 'processing', 'paid'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Đơn hàng chưa được thanh toán thành công'
                ], 400);
            }

            // Kiểm tra xem đã có yêu cầu hoàn tiền chưa
            $existingRefund = $order->refunds()
                ->whereIn('status', ['pending', 'processing', 'completed'])
                ->first();

            if ($existingRefund) {
                return response()->json([
                    'success' => false,
                    'message' => 'Đơn hàng đã có yêu cầu hoàn tiền'
                ], 400);
            }

            // Lấy vnp_TxnRef từ payment_details
            $vnpTxnRef = null;
            if (is_array($order->payment_details)) {
                $vnpTxnRef = $order->payment_details['vnp_TxnRef'] ?? null;
            } elseif (is_string($order->payment_details)) {
                $decoded = json_decode($order->payment_details, true);
                $vnpTxnRef = is_array($decoded) ? ($decoded['vnp_TxnRef'] ?? null) : null;
            }

            // Tạo yêu cầu hoàn tiền (chờ admin xử lý)
            $refund = Refund::create([
                'order_id' => $order->id,
                'user_id' => $userId,
                'refund_number' => Refund::generateRefundNumber(),
                'refund_type' => 'full',
                'refund_amount' => $order->total,
                'original_amount' => $order->total,
                'status' => Refund::STATUS_PENDING,
                'refund_method' => Refund::METHOD_VNPAY,
                'vnpay_txn_ref' => $vnpTxnRef,
                'reason' => $request->reason
            ]);

            return response()->json([
                'success' => true,
                'data' => $refund->load(['order']),
                'message' => 'Yêu cầu hoàn tiền đã được gửi thành công. Chúng tôi sẽ xem xét và phản hồi trong thời gian sớm nhất.'
            ]);

        } catch (\Exception $e) {
            Log::error('Customer request refund error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi gửi yêu cầu hoàn tiền'
            ], 500);
        }
    }

    /**
     * Lấy thống kê hoàn tiền (Admin)
     */
    public function getRefundStats(Request $request): JsonResponse
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth());
            $dateTo = $request->get('date_to', now()->endOfMonth());

            $stats = [
                'total_refunds' => Refund::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
                'total_amount' => Refund::whereBetween('created_at', [$dateFrom, $dateTo])
                    ->where('status', 'completed')
                    ->sum('refund_amount'),
                'by_status' => Refund::whereBetween('created_at', [$dateFrom, $dateTo])
                    ->selectRaw('status, COUNT(*) as count, SUM(refund_amount) as total_amount')
                    ->groupBy('status')
                    ->get(),
                'by_method' => Refund::whereBetween('created_at', [$dateFrom, $dateTo])
                    ->selectRaw('refund_method, COUNT(*) as count, SUM(refund_amount) as total_amount')
                    ->groupBy('refund_method')
                    ->get(),
                'by_type' => Refund::whereBetween('created_at', [$dateFrom, $dateTo])
                    ->selectRaw('refund_type, COUNT(*) as count, SUM(refund_amount) as total_amount')
                    ->groupBy('refund_type')
                    ->get()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Lấy thống kê hoàn tiền thành công'
            ]);

        } catch (\Exception $e) {
            Log::error('Get refund stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy thống kê hoàn tiền'
            ], 500);
        }
    }
}