<?php
<<<<<<< HEAD
namespace app\Models;
=======

namespace App\Models;

>>>>>>> safety-checkpoint
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
<<<<<<< HEAD
        //Cho phép Laravel tự động gán giá trị vào field user_id khi tạo bản ghi mới
=======
>>>>>>> safety-checkpoint
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
<<<<<<< HEAD
        //Mỗi giỏ hàng thuộc về 1 người dùng
=======
>>>>>>> safety-checkpoint
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
<<<<<<< HEAD
        //Một giỏ hàng có nhiều CartItem
=======
>>>>>>> safety-checkpoint
    }

    public function getTotalAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->quantity * $item->book->price;
        });
<<<<<<< HEAD
        //tính tổng tiền của giỏ hàng
=======
>>>>>>> safety-checkpoint
    }

    public function getItemCountAttribute()
    {
        return $this->items->sum('quantity');
<<<<<<< HEAD
        //tính tổng số lượng sản phẩm trong giỏ
    }
=======
   }
>>>>>>> safety-checkpoint
}
