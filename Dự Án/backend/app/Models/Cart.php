<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory; //hỗ trợ tạo dữ liệu mẫu

    protected $fillable = [
        'user_id', //để biết giỏ hàng thuộc về user nào.
    ];

    public function user()
    {
        return $this->belongsTo(User::class); //1 giỏ hàng thuộc về 1 user.
    }

    public function items()
    {
        return $this->hasMany(CartItem::class); //1 giỏ hàng có nhiều sản phẩm
    }

    // App/Models/Cart.php
    public function getTotalAttribute()
    {
        return $this->items->sum(function ($item) {
            $price = $item->variation ? $item->variation->price : $item->book->price;
            return $item->quantity * $price;
        });
    }

    public function getItemCountAttribute()
    {
        return $this->items->sum('quantity'); //tổng số sách trong giỏ
    }
}
