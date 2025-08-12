# Hướng dẫn cài đặt và sử dụng hệ thống Email

## Cấu hình đã hoàn thành

### 1. Cấu hình Gmail SMTP
Hệ thống đã được cấu hình để sử dụng Gmail SMTP với thông tin:
- **Email**: secret.book.e@gmail.com
- **App Password**: yyeq skej oonx dgrb
- **SMTP Host**: smtp.gmail.com
- **Port**: 587
- **Encryption**: TLS

### 2. Các file đã được tạo/cập nhật

#### A. Mailable Class
- **File**: `app/Mail/OrderStatusChanged.php`
- **Mục đích**: Xử lý gửi email thông báo thay đổi trạng thái đơn hàng
- **Tính năng**: 
  - Nhận thông tin đơn hàng, trạng thái cũ và mới
  - Tiêu đề email bằng tiếng Việt
  - Truyền dữ liệu đến template email

#### B. Email Template
- **File**: `resources/views/emails/order-status-changed.blade.php`
- **Mục đích**: Template HTML cho email thông báo
- **Tính năng**:
  - Giao diện đẹp, responsive
  - Nội dung hoàn toàn bằng tiếng Việt
  - Hiển thị thông tin đơn hàng chi tiết
  - Thông báo phù hợp với từng trạng thái

#### C. Controller Updates
- **File**: `app/Http/Controllers/API/OrderController.php`
- **Cập nhật**: Method `updateStatus()`
- **Tính năng**:
  - Tự động gửi email khi trạng thái đơn hàng thay đổi
  - Xử lý lỗi email không ảnh hưởng đến việc cập nhật trạng thái
  - Log lỗi để debug

#### D. Test Command
- **File**: `app/Console/Commands/TestEmail.php`
- **Mục đích**: Kiểm tra cấu hình email

## Cách sử dụng

### 1. Kiểm tra cấu hình email

#### Test email đơn giản:
```bash
php artisan email:test your-email@example.com
```

#### Test với đơn hàng thực tế:
```bash
php artisan email:test your-email@example.com --order-id=1
```

### 2. Gửi email tự động
Email sẽ được gửi tự động khi:
- Admin cập nhật trạng thái đơn hàng qua API
- Trạng thái thay đổi từ trạng thái cũ sang trạng thái mới
- Khách hàng có email hợp lệ

### 3. API Endpoint
```
PUT /api/orders/{id}/status
```

**Request Body:**
```json
{
    "status": "confirmed",
    "notes": "Đơn hàng đã được xác nhận"
}
```

**Các trạng thái hợp lệ:**
- `pending` - Chờ xử lý
- `confirmed` - Đã xác nhận
- `processing` - Đang xử lý
- `shipped` - Đã giao hàng
- `delivered` - Đã giao thành công
- `cancelled` - Đã hủy

## Nội dung email theo trạng thái

### Shipped (Đã giao hàng)
- Thông báo đơn hàng đã được giao cho đơn vị vận chuyển
- Thời gian dự kiến nhận hàng: 2-3 ngày làm việc

### Delivered (Đã giao thành công)
- Cảm ơn khách hàng
- Xác nhận đơn hàng đã được giao thành công

### Cancelled (Đã hủy)
- Thông báo đơn hàng đã bị hủy
- Hướng dẫn liên hệ nếu có thắc mắc

## Troubleshooting

### 1. Kiểm tra log
```bash
tail -f storage/logs/laravel.log
```

### 2. Các lỗi thường gặp

#### Gmail SMTP Authentication Failed
- Kiểm tra App Password có đúng không
- Đảm bảo 2FA đã được bật cho Gmail
- Kiểm tra cấu hình .env

#### Email không được gửi
- Kiểm tra kết nối internet
- Kiểm tra firewall/port 587
- Xem log Laravel để biết chi tiết lỗi

### 3. Debug email

#### Chuyển sang log driver để test:
```env
MAIL_MAILER=log
```

Email sẽ được ghi vào file log thay vì gửi thực tế.

#### Chuyển về SMTP để gửi thực tế:
```env
MAIL_MAILER=smtp
```

## Bảo mật

### 1. App Password
- Không chia sẻ App Password
- Thay đổi App Password định kỳ
- Sử dụng biến môi trường (.env)

### 2. Rate Limiting
Gmail có giới hạn:
- 500 emails/ngày cho tài khoản thường
- 2000 emails/ngày cho Google Workspace

### 3. Monitoring
- Theo dõi log email
- Kiểm tra tỷ lệ gửi thành công
- Cảnh báo khi có lỗi

## Mở rộng

### 1. Thêm loại email khác
```bash
php artisan make:mail WelcomeEmail
php artisan make:mail OrderConfirmation
php artisan make:mail PasswordReset
```

### 2. Queue emails
Để tránh chậm trễ khi gửi email:

```php
// Trong OrderController
Mail::to($order->user->email)
    ->queue(new OrderStatusChanged($order, $oldStatus, $request->status));
```

### 3. Email templates khác
- Tạo template cho từng loại thông báo
- Sử dụng Markdown templates
- Tùy chỉnh CSS/styling

## Kết luận

Hệ thống email đã được cấu hình hoàn chỉnh với:
✅ Gmail SMTP integration
✅ Vietnamese email templates
✅ Automatic order status notifications
✅ Error handling and logging
✅ Test commands
✅ Comprehensive documentation

Hệ thống sẵn sàng sử dụng trong production!