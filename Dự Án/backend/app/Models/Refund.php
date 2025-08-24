<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'refund_number',
        'refund_type',
        'refund_amount',
        'original_amount',
        'status',
        'refund_method',
        'vnpay_txn_ref',
        'reason',
        'admin_notes',
        'vnpay_data',
        'vnpay_response_code',
        'vnpay_response_message',
        'processed_at',
        'completed_at',
        'processed_by',
        'vnpay_response',
    ];

    protected $casts = [
        'refund_amount' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'vnpay_data' => 'array',
        'vnpay_response' => 'array',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Các trạng thái hoàn tiền hợp lệ
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';

    // Các loại hoàn tiền
    public const TYPE_FULL = 'full';
    public const TYPE_PARTIAL = 'partial';

    // Các phương thức hoàn tiền
    public const METHOD_VNPAY = 'vnpay';
    public const METHOD_BANK_TRANSFER = 'bank_transfer';
    public const METHOD_CASH = 'cash';

    /**
     * Quan hệ với Order
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Quan hệ với RefundItem
     */
    public function refundItems(): HasMany
    {
        return $this->hasMany(RefundItem::class);
    }

    /**
     * Người yêu cầu hoàn tiền
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Người xử lý hoàn tiền
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Tạo mã hoàn tiền duy nhất
     */
    public static function generateRefundNumber(): string
    {
        do {
            $refundNumber = 'RF' . date('Ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (self::where('refund_number', $refundNumber)->exists());

        return $refundNumber;
    }

    /**
     * Kiểm tra xem hoàn tiền có thể được hủy không
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_PROCESSING]);
    }

    /**
     * Kiểm tra xem hoàn tiền có thể được xử lý không
     */
    public function canBeProcessed(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Kiểm tra xem hoàn tiền đã hoàn thành chưa
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Kiểm tra xem hoàn tiền có thất bại không
     */
    public function isFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    /**
     * Cập nhật trạng thái hoàn tiền
     */
    public function updateStatus(string $status, ?string $adminNotes = null): bool
    {
        $this->status = $status;
        
        if ($adminNotes) {
            $this->admin_notes = $adminNotes;
        }

        switch ($status) {
            case self::STATUS_PROCESSING:
                $this->processed_at = now();
                break;
            case self::STATUS_COMPLETED:
                $this->completed_at = now();
                break;
        }

        return $this->save();
    }

    /**
     * Scope để lọc theo trạng thái
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope để lọc theo phương thức hoàn tiền
     */
    public function scopeByMethod($query, string $method)
    {
        return $query->where('refund_method', $method);
    }

    /**
     * Scope để lọc hoàn tiền VNPay
     */
    public function scopeVnpayRefunds($query)
    {
        return $query->where('refund_method', self::METHOD_VNPAY);
    }
}