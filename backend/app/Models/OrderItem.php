<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'book_id',
        'book_variation_id',
        'quantity',
        'price',
        'variation_attributes',
    ];

    protected $casts = [
        'price' => 'integer',
        'variation_attributes' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function bookVariation()
    {
        return $this->belongsTo(BookVariation::class);
    }
}
