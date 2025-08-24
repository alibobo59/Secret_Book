#!/bin/bash

# Script để khởi động Laravel Queue Worker
# Sử dụng: ./start-queue.sh

echo "Đang khởi động Laravel Queue Worker..."
echo "Nhấn Ctrl+C để dừng queue worker"
echo "----------------------------------------"

# Khởi động queue worker với các tùy chọn tối ưu
php artisan queue:work --verbose --tries=3 --timeout=90