<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
<<<<<<< HEAD
        'title', 'isbn', 'description', 'price', 'sku', 'stock_quantity',
        'category_id', 'author_id', 'publisher_id', 'image'
    ];

    protected $appends = ['image_url'];
=======
        'title',

        'price',
        'stock',
        'category_id',
        'author_id',
        'publisher_id',
        'image',
    ];
>>>>>>> 9d6a090 (khong biet noi gi)

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

    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . $this->image) : null;
    }
}
