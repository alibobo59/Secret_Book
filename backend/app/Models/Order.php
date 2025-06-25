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
    ];

    protected $casts = [
        'status' => 'string',
        'subtotal' => 'integer',
        'shipping' => 'integer',
        'total' => 'integer',
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
