<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * -----------------------------------------------------------------------------
 * Category Model
 * -----------------------------------------------------------------------------
 * Đây là Eloquent Model đại diện cho bảng `categories`.
 *
 * Mục tiêu:
 *  - Quản lý thông tin danh mục (Category) trong hệ thống.
 *  - Cho phép liên kết với bảng `books` (quan hệ hasMany).
 *
 * Thuộc tính fillable:
 *  - name        : tên danh mục
 *  - slug        : slug để SEO / URL friendly
 *  - description : mô tả danh mục
 *  - created_by  : user_id người tạo
 *
 * Ghi chú bổ sung:
 *  - Sử dụng trait HasFactory để hỗ trợ tạo dữ liệu giả (factory).
 *  - Có thể mở rộng quan hệ khác trong tương lai (ví dụ: products).
 */
class Category extends Model
{
    use HasFactory;

    /**
     * Các cột cho phép gán hàng loạt (Mass Assignment).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',         // Tên danh mục
        'slug',         // Đường dẫn thân thiện (slug)
        'description',  // Mô tả danh mục
        'created_by',   // Người tạo
    ];

    /**
     * Quan hệ 1-nhiều: Category -> Books
     *
     * Mỗi Category có thể có nhiều Book.
     * Eloquent sẽ dựa vào khóa ngoại `category_id` trong bảng `books`.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function books()
    {
        return $this->hasMany(Book::class);
    }

    /**
     * Trả về label dễ đọc cho các field (dùng cho audit log / UI).
     *
     * Key: tên cột trong DB.
     * Value: tên hiển thị cho người dùng.
     *
     * @return array<string, string>
     */
    public function getAuditFieldLabels()
    {
        return [
            'name'        => 'Name',
                      // Tên danh mục
            'slug'        => 'Slug',
                      // Đường dẫn thân thiện
            'description' => 'Description',
               // Mô tả
            'created_by'  => 'Created By',
                // Người tạo
                
        ];
    }
}
