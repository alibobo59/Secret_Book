<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefundItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'refund_id',
        'order_item_id',
        'book_title',
        'book_isbn',
        'quantity',
        'unit_price',
        'total_price',
        'reason',
        'book_details',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'book_details' => 'array',
        'quantity' => 'integer',
    ];

    /**
     * Quan hệ với Refund
     */
    public function refund(): BelongsTo
    {
        return $this->belongsTo(Refund::class);
    }

    /**
     * Quan hệ với OrderItem
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * Tính tổng tiền hoàn cho item này
     */
    public function calculateTotalPrice(): float
    {
        return $this->unit_price * $this->quantity;
    }

    /**
     * Kiểm tra xem item có thể được hoàn tiền không
     */
    public function canBeRefunded(): bool
    {
        return $this->quantity > 0 && $this->unit_price > 0;
    }

    /**
     * Scope để lọc theo refund_id
     */
    public function scopeByRefund($query, int $refundId)
    {
        return $query->where('refund_id', $refundId);
    }

    /**
     * Scope để lọc theo order_item_id
     */
    public function scopeByOrderItem($query, int $orderItemId)
    {
        return $query->where('order_item_id', $orderItemId);
    }
}