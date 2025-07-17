<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'book_id',
        'quantity',
        //Cho phép Laravel gán dữ liệu hàng loạt vào 3 field
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
        //Mỗi CartItem thuộc về một giỏ hàng
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
        //Mỗi CartItem đại diện cho 1 cuốn sách.
    }

    public function getSubtotalAttribute()
    {
        return $this->quantity * $this->book->price;
        //Tự động tính thành tiền của sản phẩm trong giỏ = số lượng × giá sản phẩm.
    }
}
