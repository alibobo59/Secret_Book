<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id', 
        'order_id',
        'rating',
        'review',
        'is_hidden'
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_hidden' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Scope to get verified purchase reviews only
    public function scopeVerifiedPurchase($query)
    {
        return $query->whereHas('order', function($q) {
            $q->where('status', 'delivered');
        });
    }
}
