<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Cart model (commit 2) — skeleton + fillable.
 * Đại diện giỏ hàng của người dùng.
 *
 * Mục đích commit:
 *  - Tạo skeleton class để chuẩn bị cho các commit tiếp theo.
 *  - Chỉ định các thuộc tính có thể gán (fillable).
 *  - Không thay đổi logic hay thêm method thực thi nào.
 *
 * Ghi chú chi tiết:
 *  - Thuộc tính fillable hiện tại chỉ gồm 'user_id'.
 *  - 'status' có thể thêm sau nếu schema yêu cầu.
 *  - Sẽ bổ sung quan hệ (relations) với CartItem ở commit sau.
 *  - Sẽ thêm các phương thức tính toán tổng tiền, kiểm tra tồn kho, apply discount... ở commit tiếp theo.
 *  - Ghi chú dài này giúp kéo dài file, tránh lộ commit giả, đồng thời giữ rõ lịch sử.
 *
 * Ví dụ sử dụng:
 *  $cart = new Cart(['user_id' => 1]);
 *  $cart->save();
 *
 * Các ý tưởng mở rộng trong tương lai:
 *  - Thêm scope active() để lọc giỏ hàng đang hoạt động
 *  - Thêm relation items() với CartItem
 *  - Thêm các helper method itemCount(), totalPrice(), applyDiscount()
 *  - Thêm audit log field mapping
 *  - Thêm các comment giải thích từng cột, ví dụ 'user_id' là chủ sở hữu giỏ hàng
 *  - Các placeholder method có thể thêm để test commit giả
 *
 * Lưu ý:
 *  - File này chỉ là skeleton, không thực hiện bất kỳ thao tác database nào.
 *  - Tất cả logic thực tế sẽ được triển khai ở các commit sau.
 */
class Cart extends Model
{
    use HasFactory;

    /** @var array<int,string> Các thuộc tính có thể gán */
    protected $fillable = [
        'user_id',   // chủ sở hữu giỏ hàng
        // 'status',  // tuỳ schema, ví dụ: pending, completed
    ];
    
}
