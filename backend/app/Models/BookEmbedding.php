<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookEmbedding extends Model
{
    protected $fillable = [
        'book_id', 'embedding', 'dim', 'model'
    ];

    protected $casts = [
        'embedding' => 'array',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}