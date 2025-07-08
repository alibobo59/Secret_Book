<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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
            'code' => 'required|string',
            'order_amount' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Mã khuyến mại không tồn tại'
            ], 404);
        }

        $userId = auth()->id();
        
        if (!$coupon->canBeUsedByUser($userId)) {
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
                $userUsageCount = $coupon->usages()->where('user_id', $userId)->count();
                if ($userUsageCount >= $coupon->usage_limit_per_user) {
                    $reasons[] = 'Bạn đã sử dụng hết lượt cho mã khuyến mại này';
                }
            }

            return response()->json([
                'success' => false,
                'message' => implode('. ', $reasons)
            ], 422);
        }

        $discountAmount = $coupon->calculateDiscount($request->order_amount);

        if ($discountAmount <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng không đủ điều kiện áp dụng mã khuyến mại này'
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mã khuyến mại hợp lệ',
            'data' => [
                'coupon' => $coupon,
                'discount_amount' => $discountAmount,
                'final_amount' => $request->order_amount - $discountAmount
            ]
        ]);
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