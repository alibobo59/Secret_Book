<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'user_id',
        'order_number',
        'subtotal',
        'shipping',
        'total',
        'status',
        'notes',
        'payment_method',
        'payment_status',
        'payment_transaction_id',
        'payment_amount',
        'payment_date',
        'payment_details',
    ];

    protected $casts = [
        'status' => 'string',
        'subtotal' => 'integer',
        'shipping' => 'integer',
        'total' => 'integer',
        'payment_amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'payment_details' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function address()
    {
        return $this->hasOne(Address::class);
    }

    public function couponUsages()
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function coupons()
    {
        return $this->belongsToMany(Coupon::class, 'coupon_usages')
                    ->withPivot('discount_amount')
                    ->withTimestamps();
    }

    /**
     * Định nghĩa trình tự trạng thái hợp lệ
     */
    const STATUS_TRANSITIONS = [
        'pending' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'],
        'delivered' => [], // Trạng thái cuối, không thể chuyển
        'cancelled' => [] // Trạng thái cuối, không thể chuyển
    ];

    /**
     * Kiểm tra xem có thể chuyển từ trạng thái hiện tại sang trạng thái mới không
     */
    public function canTransitionTo($newStatus)
    {
        $currentStatus = $this->status;
        
        // Nếu trạng thái không thay đổi, cho phép
        if ($currentStatus === $newStatus) {
            return true;
        }
        
        // Kiểm tra xem trạng thái mới có trong danh sách cho phép không
        $allowedTransitions = self::STATUS_TRANSITIONS[$currentStatus] ?? [];
        
        return in_array($newStatus, $allowedTransitions);
    }

    /**
     * Lấy danh sách trạng thái có thể chuyển từ trạng thái hiện tại
     */
    public function getAllowedNextStatuses()
    {
        return self::STATUS_TRANSITIONS[$this->status] ?? [];
    }

    /**
     * Lấy tên hiển thị của trạng thái
     */
    public static function getStatusDisplayName($status)
    {
        $statusNames = [
            'pending' => 'Chờ xử lý',
            'processing' => 'Đang xử lý', 
            'shipped' => 'Đã giao hàng',
            'delivered' => 'Đã giao thành công',
            'cancelled' => 'Đã hủy'
        ];
        
        return $statusNames[$status] ?? $status;
    }

    /**
     * Get human-readable field names for audit logs
     */
    public function getAuditFieldLabels()
    {
        return [
            'user_id' => 'User',
            'order_number' => 'Order Number',
            'subtotal' => 'Subtotal',
            'shipping' => 'Shipping',
            'total' => 'Total',
            'status' => 'Status',
            'notes' => 'Notes',
        ];
    }
}
