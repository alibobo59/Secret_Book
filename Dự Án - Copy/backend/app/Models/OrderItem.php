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

    protected $appends = ['variation_attributes'];

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

    public function getVariationAttributesAttribute()
    {
        if (!$this->variation || !$this->variation->attributes) {
            return null;
        }
        
        $attributes = $this->variation->attributes;
        
        // If attributes is a JSON string, decode it first
        if (is_string($attributes)) {
            $attributes = json_decode($attributes, true);
        }
        
        if (is_array($attributes)) {
            // Convert array to user-friendly string format
            $formatted = [];
            foreach ($attributes as $key => $value) {
                $formatted[] = $key . ': ' . $value;
            }
            return implode(', ', $formatted);
        }
        
        return $attributes;
    }
}
