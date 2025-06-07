<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'type',
        'value',
        'max_uses',
        'expires_at',
    ];

    protected $dates = ['deleted_at'];
    public function calculateDiscount($orderAmount)
{
    if ($this->type === 'percent') {
        return $orderAmount * ($this->value / 100);
    }
    return min($this->value, $orderAmount);
}

}
