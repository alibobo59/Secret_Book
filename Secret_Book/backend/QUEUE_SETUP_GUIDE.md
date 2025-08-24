# Hướng dẫn sử dụng Queue System

## Tổng quan
Hệ thống đã được cấu hình để sử dụng queue cho việc gửi email, giúp cải thiện hiệu suất và trải nghiệm người dùng.

## Cấu hình hiện tại
- **Queue Driver**: Database (được cấu hình trong `.env` với `QUEUE_CONNECTION=database`)
- **Mail Classes**: Tất cả các Mail class đã implement `ShouldQueue` interface
- **Controllers**: Đã được cập nhật để sử dụng `queue()` thay vì `send()`

## Các Mail class đã được cấu hình queue:
1. `OrderPlaced` - Email xác nhận đặt hàng
2. `OrderStatusChanged` - Email thông báo thay đổi trạng thái đơn hàng
3. `OrderCancelledByAdmin` - Email thông báo hủy đơn hàng bởi admin
4. `AccountStatusChanged` - Email thông báo thay đổi trạng thái tài khoản

## Cách khởi động Queue Worker

### Phương pháp 1: Sử dụng script có sẵn
```bash
./start-queue.sh
```

### Phương pháp 2: Chạy trực tiếp
```bash
php artisan queue:work --verbose --tries=3 --timeout=90
```

### Phương pháp 3: Chạy trong background (Production)
```bash
nohup php artisan queue:work --verbose --tries=3 --timeout=90 > storage/logs/queue.log 2>&1 &
```

## Các lệnh quản lý Queue hữu ích

### Xem danh sách jobs trong queue
```bash
php artisan queue:monitor
```

### Xóa tất cả jobs trong queue
```bash
php artisan queue:clear
```

### Restart queue workers
```bash
php artisan queue:restart
```

### Xem failed jobs
```bash
php artisan queue:failed
```

### Retry failed jobs
```bash
php artisan queue:retry all
```

## Lưu ý quan trọng

1. **Queue Worker phải được chạy liên tục** để xử lý các jobs
2. **Trong môi trường development**: Chạy `php artisan queue:work` trong terminal riêng
3. **Trong môi trường production**: Sử dụng process manager như Supervisor
4. **Khi thay đổi code**: Cần restart queue worker bằng `php artisan queue:restart`

## Kiểm tra hoạt động

1. Tạo một đơn hàng mới
2. Kiểm tra bảng `jobs` trong database để xem job đã được tạo
3. Chạy queue worker và quan sát job được xử lý
4. Kiểm tra email đã được gửi thành công

## Troubleshooting

### Nếu email không được gửi:
1. Kiểm tra queue worker có đang chạy không
2. Kiểm tra bảng `failed_jobs` để xem có job nào bị lỗi
3. Kiểm tra log file trong `storage/logs/laravel.log`
4. Kiểm tra cấu hình email trong `.env`

### Nếu jobs bị stuck:
```bash
php artisan queue:restart
php artisan queue:work
```