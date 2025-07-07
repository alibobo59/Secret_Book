<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publisher extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'address'];


    public function books()
    {
        return $this->hasMany(Book::class);
    }

    /**
     * Get human-readable field names for audit logs
     */
    public function getAuditFieldLabels()
    {
        return [
            'name' => 'Name',
            'address' => 'Address',
        ];
    }
}
