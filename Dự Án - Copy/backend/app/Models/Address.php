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
        'province_id',
        'ward_id',
        'phone',
        'email',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
    
    public function province()
    {
        return $this->belongsTo(Province::class, 'province_id');
    }
    
    public function wardModel()
    {
        return $this->belongsTo(Ward::class, 'ward_id');
    }
}
