<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\BookVariation;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'book_id',
        'variation_id',
        'quantity',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function variation()
    {
        return $this->belongsTo(BookVariation::class, 'variation_id');
    }

    public function getSubtotalAttribute()
    {
        $price = $this->variation ? $this->variation->price : $this->book->price;
        return $this->quantity * $price;
    }
}
