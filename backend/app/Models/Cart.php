<?php
namespace app\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        //Cho phép Laravel tự động gán giá trị vào field user_id khi tạo bản ghi mới
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
        //Mỗi giỏ hàng thuộc về 1 người dùng
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
        //Một giỏ hàng có nhiều CartItem
    }

    public function getTotalAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->quantity * $item->book->price;
        });
        //tính tổng tiền của giỏ hàng
    }

    public function getItemCountAttribute()
    {
        return $this->items->sum('quantity');
        //tính tổng số lượng sản phẩm trong giỏ
    }
}
