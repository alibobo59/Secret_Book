<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CouponController extends Controller
{
    /**
     * Lấy danh sách mã khuyến mại (Admin)
     */
    public function index(Request $request)
    {
        $query = Coupon::query();

        // Tìm kiếm theo mã hoặc tên
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // Lọc theo trạng thái
        if ($request->has('status') && $request->status) {
            $status = $request->status;
            $now = Carbon::now();
            
            switch ($status) {
                case 'active':
                    $query->where('is_active', true)
                          ->where('start_date', '<=', $now)
                          ->where('end_date', '>=', $now)
                          ->where(function ($q) {
                              $q->whereNull('usage_limit')
                                ->orWhereRaw('used_count < usage_limit');
                          });
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
                case 'expired':
                    $query->where('end_date', '<', $now);
                    break;
                case 'upcoming':
                    $query->where('start_date', '>', $now);
                    break;
                case 'used_up':
                    $query->whereNotNull('usage_limit')
                          ->whereRaw('used_count >= usage_limit');
                    break;
            }
        }

        // Lọc theo loại
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Sắp xếp
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Phân trang
        $perPage = $request->get('per_page', 10);
        $coupons = $query->paginate($perPage);

        // Thêm thông tin trạng thái cho mỗi coupon
        $coupons->getCollection()->transform(function ($coupon) {
            $coupon->status_display = $coupon->status_display_name;
            $coupon->type_display = $coupon->type_display_name;
            $coupon->value_display = $coupon->value_display;
            return $coupon;
        });

        return response()->json([
            'success' => true,
            'data' => $coupons
        ]);
    }

    /**
     * Tạo mã khuyến mại mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:coupons,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'minimum_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_user' => 'nullable|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean'
        ], [
            'code.required' => 'Mã khuyến mại là bắt buộc',
            'code.unique' => 'Mã khuyến mại đã tồn tại',
            'name.required' => 'Tên khuyến mại là bắt buộc',
            'type.required' => 'Loại giảm giá là bắt buộc',
            'type.in' => 'Loại giảm giá không hợp lệ',
            'value.required' => 'Giá trị giảm giá là bắt buộc',
            'value.min' => 'Giá trị giảm giá phải lớn hơn 0',
            'start_date.required' => 'Ngày bắt đầu là bắt buộc',

            'end_date.required' => 'Ngày kết thúc là bắt buộc',
            'end_date.after' => 'Ngày kết thúc phải sau ngày bắt đầu'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validation bổ sung
        if ($request->type === 'percentage' && $request->value > 100) {
            return response()->json([
                'success' => false,
                'message' => 'Giá trị phần trăm không được vượt quá 100%'
            ], 422);
        }

        $coupon = Coupon::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tạo mã khuyến mại thành công',
            'data' => $coupon
        ], 201);
    }

    /**
     * Xem chi tiết mã khuyến mại
     */
    public function show(Coupon $coupon)
    {
        $coupon->load(['usages.user', 'usages.order']);
        
        $coupon->status_display = $coupon->status_display_name;
        $coupon->type_display = $coupon->type_display_name;
        $coupon->value_display = $coupon->value_display;
        
        return response()->json([
            'success' => true,
            'data' => $coupon
        ]);
    }

    /**
     * Cập nhật mã khuyến mại
     */
    public function update(Request $request, Coupon $coupon)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:coupons,code,' . $coupon->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'minimum_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'usage_limit_per_user' => 'nullable|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_active' => 'boolean'
        ], [
            'code.required' => 'Mã khuyến mại là bắt buộc',
            'code.unique' => 'Mã khuyến mại đã tồn tại',
            'name.required' => 'Tên khuyến mại là bắt buộc',
            'type.required' => 'Loại giảm giá là bắt buộc',
            'type.in' => 'Loại giảm giá không hợp lệ',
            'value.required' => 'Giá trị giảm giá là bắt buộc',
            'value.min' => 'Giá trị giảm giá phải lớn hơn 0',
            'start_date.required' => 'Ngày bắt đầu là bắt buộc',
            'end_date.required' => 'Ngày kết thúc là bắt buộc',
            'end_date.after' => 'Ngày kết thúc phải sau ngày bắt đầu'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validation bổ sung
        if ($request->type === 'percentage' && $request->value > 100) {
            return response()->json([
                'success' => false,
                'message' => 'Giá trị phần trăm không được vượt quá 100%'
            ], 422);
        }

        $coupon->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật mã khuyến mại thành công',
            'data' => $coupon
        ]);
    }

    /**
     * Xóa mã khuyến mại
     */
    public function destroy(Coupon $coupon)
    {
        // Kiểm tra xem mã khuyến mại đã được sử dụng chưa
        if ($coupon->used_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa mã khuyến mại đã được sử dụng'
            ], 422);
        }

        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa mã khuyến mại thành công'
        ]);
    }

    /**
     * Kiểm tra tính hợp lệ của mã khuyến mại (Public)
     */
    public function validate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
            'order_amount' => 'required|numeric|min:0'
        ], [
            'code.required' => 'Mã khuyến mại là bắt buộc',
            'code.max' => 'Mã khuyến mại không được vượt quá 50 ký tự',
            'order_amount.required' => 'Số tiền đơn hàng là bắt buộc',
            'order_amount.numeric' => 'Số tiền đơn hàng phải là số',
            'order_amount.min' => 'Số tiền đơn hàng phải lớn hơn hoặc bằng 0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        // Tìm coupon với code (case-insensitive)
        $coupon = Coupon::whereRaw('UPPER(code) = ?', [strtoupper($request->code)])->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Mã khuyến mại không tồn tại'
            ], 404);
        }

        $userId = Auth::check() ? Auth::id() : null;
        
        // Kiểm tra điều kiện sử dụng
        if (!$coupon->canBeUsedByUser($userId)) {
            $reasons = $this->getCouponInvalidReasons($coupon, $userId);

            return response()->json([
                'success' => false,
                'message' => implode('. ', $reasons)
            ], 422);
        }

        // Tính toán giảm giá
        $discountAmount = $coupon->calculateDiscount($request->order_amount);

        if ($discountAmount <= 0) {
            $message = 'Đơn hàng không đủ điều kiện áp dụng mã khuyến mại này';
            if ($coupon->minimum_amount && $request->order_amount < $coupon->minimum_amount) {
                $message = 'Đơn hàng phải có giá trị tối thiểu ' . number_format($coupon->minimum_amount, 0, ',', '.') . ' VND để sử dụng mã này';
            }
            
            return response()->json([
                'success' => false,
                'message' => $message
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mã khuyến mại hợp lệ',
            'data' => [
                'coupon' => $coupon,
                'discount_amount' => round($discountAmount, 2),
                'final_amount' => round($request->order_amount - $discountAmount, 2)
            ]
        ]);
    }

    /**
     * Lấy danh sách lý do mã khuyến mại không hợp lệ
     */
    private function getCouponInvalidReasons($coupon, $userId)
    {
        $reasons = [];
        
        if (!$coupon->isValid()) {
            if (!$coupon->is_active) {
                $reasons[] = 'Mã khuyến mại đã bị vô hiệu hóa';
            } elseif ($coupon->start_date > now()) {
                $reasons[] = 'Mã khuyến mại chưa có hiệu lực (bắt đầu từ ' . $coupon->start_date->format('d/m/Y H:i') . ')';
            } elseif ($coupon->end_date < now()) {
                $reasons[] = 'Mã khuyến mại đã hết hạn (hết hạn lúc ' . $coupon->end_date->format('d/m/Y H:i') . ')';
            }
        }
        
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            $reasons[] = 'Mã khuyến mại đã hết lượt sử dụng (' . $coupon->used_count . '/' . $coupon->usage_limit . ')';
        }
        
        if ($coupon->usage_limit_per_user && $userId) {
            $userUsageCount = $coupon->usages()->where('user_id', $userId)->count();
            if ($userUsageCount >= $coupon->usage_limit_per_user) {
                $reasons[] = 'Bạn đã sử dụng hết lượt cho mã khuyến mại này (' . $userUsageCount . '/' . $coupon->usage_limit_per_user . ')';
            }
        }

        return $reasons;
    }

    /**
     * Tạo mã khuyến mại ngẫu nhiên
     */
    public function generateCode()
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (Coupon::where('code', $code)->exists());

        return response()->json([
            'success' => true,
            'data' => ['code' => $code]
        ]);
    }

    /**
     * Lấy danh sách mã khuyến mại đang hoạt động cho user
     */
    public function getActiveCoupons(Request $request)
    {
        $now = Carbon::now();
        $userId = Auth::id();
        
        $coupons = Coupon::where('is_active', true)
                         ->where('start_date', '<=', $now)
                         ->where('end_date', '>=', $now)
                         ->where(function ($query) {
                             $query->whereNull('usage_limit')
                                   ->orWhereRaw('used_count < usage_limit');
                         })
                         ->orderBy('created_at', 'desc')
                         ->get();

        // Lọc các coupon mà user chưa sử dụng hết lượt
        $availableCoupons = $coupons->filter(function ($coupon) use ($userId) {
            if ($coupon->usage_limit_per_user && $userId) {
                $userUsageCount = $coupon->usages()->where('user_id', $userId)->count();
                return $userUsageCount < $coupon->usage_limit_per_user;
            }
            return true;
        });

        // Format dữ liệu trả về
        $formattedCoupons = $availableCoupons->map(function ($coupon) {
            return [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'description' => $coupon->description,
                'type' => $coupon->type,
                'value' => $coupon->value,
                'minimum_amount' => $coupon->minimum_amount,
                'maximum_discount' => $coupon->maximum_discount,
                'end_date' => $coupon->end_date->format('Y-m-d H:i:s'),
                'value_display' => $coupon->value_display,
                'type_display' => $coupon->type_display_name
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $formattedCoupons
        ]);
    }

    /**
     * Thống kê sử dụng mã khuyến mại
     */
    public function stats(Coupon $coupon)
    {
        $usages = CouponUsage::where('coupon_id', $coupon->id)
                            ->with(['user', 'order'])
                            ->orderBy('created_at', 'desc')
                            ->paginate(10);

        $totalDiscount = CouponUsage::where('coupon_id', $coupon->id)
                                   ->sum('discount_amount');

        $uniqueUsers = CouponUsage::where('coupon_id', $coupon->id)
                                 ->distinct('user_id')
                                 ->count('user_id');

        return response()->json([
            'success' => true,
            'data' => [
                'coupon' => $coupon,
                'usages' => $usages,
                'total_discount' => $totalDiscount,
                'unique_users' => $uniqueUsers
            ]
        ]);
    }
}