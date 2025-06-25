<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publisher extends Model
{
    use HasFactory, Auditable;

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
