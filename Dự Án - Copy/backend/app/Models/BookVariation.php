<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookVariation extends Model
{
    protected $fillable = ['book_id', 'attributes', 'price', 'stock_quantity', 'sku', 'image'];

    protected $casts = ['attributes' => 'array'];

    protected $appends = ['image_url', 'stock'];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . $this->image) : $this->book->image_url;
    }

    public function getStockAttribute()
    {
        return $this->stock_quantity;
    }
}
