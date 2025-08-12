<?php

namespace App\Models;

<<<<<<< HEAD
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Coupon extends Model
{
    use HasFactory, Auditable;
=======
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;
>>>>>>> safety-checkpoint

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'minimum_amount',
        'maximum_discount',
        'usage_limit',
        'used_count',
        'usage_limit_per_user',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'minimum_amount' => 'decimal:2',
        'maximum_discount' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function usages()
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'coupon_usages')
                    ->withPivot('discount_amount')
                    ->withTimestamps();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        $now = Carbon::now();
        return $query->where('is_active', true)
                    ->where('start_date', '<=', $now)
                    ->where('end_date', '>=', $now);
    }

    public function scopeAvailable($query)
    {
        return $query->valid()
                    ->where(function ($q) {
                        $q->whereNull('usage_limit')
                          ->orWhereRaw('used_count < usage_limit');
                    });
    }

    // Helper methods
    public function isValid()
    {
        $now = Carbon::now();
        return $this->is_active 
            && $this->start_date <= $now 
            && $this->end_date >= $now;
    }

    public function isAvailable()
    {
        return $this->isValid() 
            && (is_null($this->usage_limit) || $this->used_count < $this->usage_limit);
    }

    public function canBeUsedByUser($userId)
    {
        if (!$this->isAvailable()) {
            return false;
        }

        if (is_null($this->usage_limit_per_user)) {
            return true;
        }

        $userUsageCount = $this->usages()->where('user_id', $userId)->count();
        return $userUsageCount < $this->usage_limit_per_user;
    }

    public function calculateDiscount($orderAmount)
    {
        if (!$this->isAvailable()) {
            return 0;
        }

        if ($this->minimum_amount && $orderAmount < $this->minimum_amount) {
            return 0;
        }

        if ($this->type === 'percentage') {
            $discount = ($orderAmount * $this->value) / 100;
            
            if ($this->maximum_discount) {
                $discount = min($discount, $this->maximum_discount);
            }
            
            return $discount;
        }

        // Fixed amount discount
        return min($this->value, $orderAmount);
    }

    public function getStatusAttribute()
    {
        $now = Carbon::now();
        
        if (!$this->is_active) {
            return 'inactive';
        }
        
        if ($this->start_date > $now) {
            return 'upcoming';
        }
        
        if ($this->end_date < $now) {
            return 'expired';
        }
        
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) {
            return 'used_up';
        }
        
        return 'active';
    }

    public function getTypeDisplayNameAttribute()
    {
        return $this->type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định';
    }

    public function getValueDisplayAttribute()
    {
        if ($this->type === 'percentage') {
            return $this->value . '%';
        }
        
        return number_format($this->value, 0, ',', '.') . ' VND';
    }

    public function getStatusDisplayNameAttribute()
    {
        $statusNames = [
            'active' => 'Đang hoạt động',
            'inactive' => 'Không hoạt động',
            'upcoming' => 'Sắp diễn ra',
            'expired' => 'Đã hết hạn',
            'used_up' => 'Đã hết lượt sử dụng'
        ];

        return $statusNames[$this->status] ?? 'Không xác định';
    }

    // Audit field labels for logging
    public function getAuditFieldLabels()
    {
        return [
            'code' => 'Mã khuyến mại',
            'name' => 'Tên khuyến mại',
            'description' => 'Mô tả',
            'type' => 'Loại giảm giá',
            'value' => 'Giá trị',
            'minimum_amount' => 'Số tiền tối thiểu',
            'maximum_discount' => 'Giảm tối đa',
            'usage_limit' => 'Giới hạn sử dụng',
            'used_count' => 'Đã sử dụng',
            'usage_limit_per_user' => 'Giới hạn mỗi người',
            'start_date' => 'Ngày bắt đầu',
            'end_date' => 'Ngày kết thúc',
            'is_active' => 'Trạng thái hoạt động',
        ];
    }
}