<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'name',
        'address',
        'city',
        'phone',
        'email',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
