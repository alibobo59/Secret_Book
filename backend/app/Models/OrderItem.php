<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\BookVariation;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'book_id',
        'variation_id',
        'quantity',
        'price',
        'book_title',
        'book_sku',
        'book_description',
        'book_image',
        'author_name',
        'publisher_name',
        'category_name',
    ];

    protected $casts = [
        'price' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function variation()
    {
        return $this->belongsTo(BookVariation::class, 'variation_id');
    }
}
