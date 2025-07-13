<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * CartItem model (commit 4) — skeleton + fillable.
 * Đại diện 1 sản phẩm trong giỏ.
 *
 * Ghi chú:
 * - Mỗi dòng thể hiện một sách trong giỏ hàng của người dùng.
 * - Các trường trong $fillable sẽ được dùng để tạo, cập nhật dữ liệu.
 * - Trường 'price' có thể được bỏ nếu schema không lưu giá tại dòng này.
 * - Các method quan hệ và logic nghiệp vụ sẽ thêm sau.
 */
class CartItem extends Model
{
    use HasFactory;

    /** @var array<int,string> */
    protected $fillable = [
        'cart_id',   // ID giỏ hàng liên kết
        'book_id',   // ID sách trong dòng này
        'quantity',  // số lượng sách
        'price',     // giá sách tại thời điểm thêm vào giỏ
        // TODO: các trường bổ sung nếu cần
    ];

    // TODO: thêm quan hệ cart(), book() ở commit sau
    /**
 * Nhiều CartItem thuộc 1 Cart.
 * Quan hệ này giúp truy xuất giỏ hàng chứa item hiện tại.
 * Dùng để tính tổng giá trị giỏ, hiển thị chi tiết giỏ, hoặc quản lý trạng thái item.
 */
public function cart()
{
    return $this->belongsTo(Cart::class);
}

/**
 * Mỗi CartItem tham chiếu 1 Book.
 * Giúp truy xuất thông tin sách từ item,
 * có thể dùng để hiển thị tên sách, giá, hình ảnh,
 * hoặc để kiểm tra tồn kho khi tạo đơn hàng.
 */
public function book()
{
    return $this->belongsTo(Book::class);
}

}
