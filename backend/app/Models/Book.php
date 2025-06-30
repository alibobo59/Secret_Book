<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'title',
        'sku',
        'description',
        'price',
        'stock_quantity', 
        'category_id',
        'author_id',
        'publisher_id',
        'image',
    ];

    protected $appends = ['image_url', 'average_rating', 'reviews_count'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    public function publisher()
    {
        return $this->belongsTo(Publisher::class);
    }

    public function variations()
    {
        return $this->hasMany(BookVariation::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function verifiedReviews()
    {
        return $this->reviews()->verifiedPurchase();
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . $this->image) : null;
    }

    // Calculate average rating from verified reviews only
    public function getAverageRatingAttribute()
    {
        return $this->verifiedReviews()->avg('rating') ?? 0;
    }

    public function getReviewsCountAttribute()
    {
        return $this->verifiedReviews()->count();
    }

    /**
     * Get human-readable field names for audit logs
     */
    public function getAuditFieldLabels()
    {
        return [
            'title' => 'Title',
            'sku' => 'SKU',
            'description' => 'Description',
            'price' => 'Price',
            'stock_quantity' => 'Stock Quantity',
            'category_id' => 'Category',
            'author_id' => 'Author',
            'publisher_id' => 'Publisher',
            'image' => 'Image',
        ];
    }
}
