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
        'discount_amount',
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
        'discount_amount' => 'decimal:2',
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
     * Trình tự bắt buộc: pending -> processing -> shipped -> delivered
     * Chỉ cho phép hủy từ trạng thái pending và processing
     */
    const STATUS_TRANSITIONS = [
        'pending' => ['processing', 'cancelled'],
        'processing' => ['shipped', 'cancelled'],
        'shipped' => ['delivered'], // Không cho phép hủy từ trạng thái shipped
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
            'shipped' => 'Đã gửi',
            'delivered' => 'Đã giao',
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
            'discount_amount' => 'Discount Amount',
            'total' => 'Total',
            'status' => 'Status',
            'notes' => 'Notes',
            'payment_status' => 'Payment Status',
            'payment_method' => 'Payment Method',
        ];
    }

    /**
     * Get metadata for creation events
     */
    protected function getCreationMetadata()
    {
        return [
            'action_type' => 'order_created',
            'order_details' => [
                'order_number' => $this->order_number,
                'total_amount' => $this->total,
                'status' => $this->status,
                'payment_method' => $this->payment_method,
                'payment_status' => $this->payment_status,
            ],
            'customer_info' => [
                'user_id' => $this->user_id,
                'user_name' => $this->user ? $this->user->name : null,
            ],
            'business_impact' => [
                'New order received',
                'Revenue potential: ' . number_format($this->total, 0, ',', '.') . ' VND',
            ],
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Get metadata for update events
     */
    protected function getUpdateMetadata($changes)
    {
        $metadata = [
            'action_type' => 'order_updated',
            'changed_fields' => array_keys($changes),
            'change_summary' => [],
            'business_impact' => [],
            'status_transition' => null,
            'timestamp' => now()->toISOString(),
        ];

        // Analyze specific field changes
        foreach ($changes as $field => $newValue) {
            $oldValue = $this->getOriginal($field);
            
            switch ($field) {
                case 'status':
                    $oldStatusName = self::getStatusDisplayName($oldValue);
                    $newStatusName = self::getStatusDisplayName($newValue);
                    
                    $metadata['change_summary'][] = "Status changed from '{$oldStatusName}' to '{$newStatusName}'";
                    $metadata['status_transition'] = [
                        'from' => $oldValue,
                        'to' => $newValue,
                        'from_display' => $oldStatusName,
                        'to_display' => $newStatusName,
                        'is_valid_transition' => $this->canTransitionTo($newValue),
                        'changed_at' => now()->toISOString(),
                    ];
                    
                    // Business impact based on status change
                    switch ($newValue) {
                        case 'processing':
                            $metadata['business_impact'][] = 'Order is being processed';
                            break;
                        case 'shipped':
                            $metadata['business_impact'][] = 'Order has been shipped to customer';
                            break;
                        case 'delivered':
                            $metadata['business_impact'][] = 'Order successfully delivered - revenue confirmed';
                            break;
                        case 'cancelled':
                            $metadata['business_impact'][] = 'Order cancelled - potential revenue loss';
                            break;
                    }
                    break;
                    
                case 'payment_status':
                    $metadata['change_summary'][] = "Payment status changed from '{$oldValue}' to '{$newValue}'";
                    if ($newValue === 'paid') {
                        $metadata['business_impact'][] = 'Payment confirmed - order can proceed';
                    } elseif ($newValue === 'failed') {
                        $metadata['business_impact'][] = 'Payment failed - order may need attention';
                    }
                    break;
                    
                case 'total':
                    $metadata['change_summary'][] = "Total amount changed from {$oldValue} to {$newValue}";
                    $difference = $newValue - $oldValue;
                    if ($difference > 0) {
                        $metadata['business_impact'][] = "Order value increased by " . number_format($difference, 0, ',', '.') . " VND";
                    } else {
                        $metadata['business_impact'][] = "Order value decreased by " . number_format(abs($difference), 0, ',', '.') . " VND";
                    }
                    break;
                    
                case 'notes':
                    $metadata['change_summary'][] = "Order notes updated";
                    $metadata['business_impact'][] = 'Additional information added to order';
                    break;
                    
                default:
                    $metadata['change_summary'][] = "{$field} changed from '{$oldValue}' to '{$newValue}'";
            }
        }

        return $metadata;
    }

    /**
     * Get metadata for deletion events
     */
    protected function getDeletionMetadata()
    {
        return [
            'action_type' => 'order_deleted',
            'deleted_order' => [
                'order_number' => $this->order_number,
                'total_amount' => $this->total,
                'status' => $this->status,
                'customer' => $this->user ? $this->user->name : null,
            ],
            'business_impact' => [
                'Order permanently removed from system',
                'Revenue impact: ' . number_format($this->total, 0, ',', '.') . ' VND',
                'Customer history affected',
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
}
