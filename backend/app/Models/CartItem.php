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
<<<<<<< HEAD
        //Cho phép Laravel gán dữ liệu hàng loạt vào 3 field
=======
>>>>>>> safety-checkpoint
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
<<<<<<< HEAD
        //Mỗi CartItem thuộc về một giỏ hàng
=======
>>>>>>> safety-checkpoint
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
<<<<<<< HEAD
        //Mỗi CartItem đại diện cho 1 cuốn sách.
=======
>>>>>>> safety-checkpoint
    }

    public function getSubtotalAttribute()
    {
        return $this->quantity * $this->book->price;
<<<<<<< HEAD
        //Tự động tính thành tiền của sản phẩm trong giỏ = số lượng × giá sản phẩm.
=======
>>>>>>> safety-checkpoint
    }
}
