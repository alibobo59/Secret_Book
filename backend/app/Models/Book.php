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

    /**
     * Get metadata for creation events
     */
    protected function getCreationMetadata()
    {
        return [
            'action_type' => 'book_created',
            'book_details' => [
                'title' => $this->title,
                'sku' => $this->sku,
                'price' => $this->price,
                'stock_quantity' => $this->stock_quantity,
            ],
            'related_entities' => [
                'category' => $this->category ? $this->category->name : null,
                'author' => $this->author ? $this->author->name : null,
                'publisher' => $this->publisher ? $this->publisher->name : null,
            ],
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Get metadata for update events
     */
    protected function getUpdateMetadata($changes)
    {
        $metadata = [
            'action_type' => 'book_updated',
            'changed_fields' => array_keys($changes),
            'change_summary' => [],
            'business_impact' => [],
            'timestamp' => now()->toISOString(),
        ];

        // Analyze specific field changes
        foreach ($changes as $field => $newValue) {
            $oldValue = $this->getOriginal($field);
            
            switch ($field) {
                case 'price':
                    $metadata['change_summary'][] = "Price changed from {$oldValue} to {$newValue}";
                    if ($newValue > $oldValue) {
                        $metadata['business_impact'][] = 'Price increase may affect sales';
                    } else {
                        $metadata['business_impact'][] = 'Price decrease may boost sales';
                    }
                    break;
                    
                case 'stock_quantity':
                    $metadata['change_summary'][] = "Stock changed from {$oldValue} to {$newValue}";
                    if ($newValue == 0) {
                        $metadata['business_impact'][] = 'Book is now out of stock';
                    } elseif ($oldValue == 0 && $newValue > 0) {
                        $metadata['business_impact'][] = 'Book is back in stock';
                    } elseif ($newValue < 10) {
                        $metadata['business_impact'][] = 'Low stock warning';
                    }
                    break;
                    
                case 'title':
                    $metadata['change_summary'][] = "Title changed from '{$oldValue}' to '{$newValue}'";
                    $metadata['business_impact'][] = 'Title change may affect SEO and customer recognition';
                    break;
                    
                case 'category_id':
                    $oldCategory = $oldValue ? \App\Models\Category::find($oldValue)?->name : 'None';
                    $newCategory = $newValue ? \App\Models\Category::find($newValue)?->name : 'None';
                    $metadata['change_summary'][] = "Category changed from '{$oldCategory}' to '{$newCategory}'";
                    $metadata['business_impact'][] = 'Category change affects book discoverability';
                    break;
                    
                case 'author_id':
                    $oldAuthor = $oldValue ? \App\Models\Author::find($oldValue)?->name : 'None';
                    $newAuthor = $newValue ? \App\Models\Author::find($newValue)?->name : 'None';
                    $metadata['change_summary'][] = "Author changed from '{$oldAuthor}' to '{$newAuthor}'";
                    break;
                    
                case 'publisher_id':
                    $oldPublisher = $oldValue ? \App\Models\Publisher::find($oldValue)?->name : 'None';
                    $newPublisher = $newValue ? \App\Models\Publisher::find($newValue)?->name : 'None';
                    $metadata['change_summary'][] = "Publisher changed from '{$oldPublisher}' to '{$newPublisher}'";
                    break;
                    
                default:
                    $metadata['change_summary'][] = "{$field} changed from '{$oldValue}' to '{$newValue}'";
            }
        }

        return $metadata;
    }

    /**
     * Get metadata for deletion events
     */
    protected function getDeletionMetadata()
    {
        return [
            'action_type' => 'book_deleted',
            'deleted_book' => [
                'title' => $this->title,
                'sku' => $this->sku,
                'price' => $this->price,
                'stock_quantity' => $this->stock_quantity,
            ],
            'related_entities' => [
                'category' => $this->category ? $this->category->name : null,
                'author' => $this->author ? $this->author->name : null,
                'publisher' => $this->publisher ? $this->publisher->name : null,
            ],
            'business_impact' => [
                'Book removed from catalog',
                'May affect existing orders and reviews',
            ],
            'timestamp' => now()->toISOString(),
        ];
    }
}
