<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\BookVariation; //model khác để định nghĩa quan hệ

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id', //liên kết giỏ hàng nào.
        'book_id', //sách nào.
        'variation_id', //phiên bản nào của sách (nếu có).
        'quantity',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class); //Nhiều CartItem thuộc về Một Cart
    }

    public function book()
    {
        return $this->belongsTo(Book::class);//Mỗi CartItem thuộc về một Book
    }

    public function variation()
    {
        return $this->belongsTo(BookVariation::class, 'variation_id'); //Mỗi CartItem có thể có một BookVariation.
    }

    public function getSubtotalAttribute()
    {
        $price = $this->variation ? $this->variation->price : $this->book->price;
        return $this->quantity * $price; //tổng tiền của item. 
    }
    //CartItem là 1 sản phẩm trong giỏ hàng. Nó liên kết với Cart, Book, BookVariation và có hàm subtotal để tính số tiền từng item.
}
