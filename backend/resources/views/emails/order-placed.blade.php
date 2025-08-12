<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đặt hàng thành công</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #ffffff;
            padding: 30px;
            border: 1px solid #dee2e6;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 8px 8px;
            font-size: 14px;
            color: #6c757d;
        }
        .order-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .order-items {
            margin: 20px 0;
        }
        .item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .item:last-child {
            border-bottom: none;
        }
        .total {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
            font-size: 18px;
        }
        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        .contact-info {
            background-color: #d1ecf1;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ config('app.name') }}</h1>
        <h2>✅ Đặt hàng thành công!</h2>
    </div>

    <div class="content">
        <p>Xin chào <strong>{{ $order->user->name }}</strong>,</p>

        <p>Cảm ơn bạn đã đặt hàng tại {{ config('app.name') }}! Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>

        <div class="order-info">
            <h3>Thông tin đơn hàng</h3>
            <p><strong>Mã đơn hàng:</strong> #{{ $order->id }}</p>
            <p><strong>Ngày đặt:</strong> {{ $order->created_at->format('d/m/Y H:i:s') }}</p>
            <p><strong>Trạng thái:</strong> 
                <span class="status status-pending">
                    @switch($order->status)
                        @case('pending')
                            Chờ xử lý
                            @break
                        @case('confirmed')
                            Đã xác nhận
                            @break
                        @case('shipped')
                            Đang giao hàng
                            @break
                        @case('delivered')
                            Đã giao hàng
                            @break
                        @case('cancelled')
                            Đã hủy
                            @break
                        @default
                            {{ ucfirst($order->status) }}
                    @endswitch
                </span>
            </p>
            <p><strong>Phương thức thanh toán:</strong> 
                @switch($order->payment_method)
                    @case('cod')
                        Thanh toán khi nhận hàng (COD)
                        @break
                    @case('bank_transfer')
                        Chuyển khoản ngân hàng
                        @break
                    @case('credit_card')
                        Thẻ tín dụng
                        @break
                    @default
                        {{ $order->payment_method }}
                @endswitch
            </p>
        </div>

        <div class="order-items">
            <h3>Chi tiết đơn hàng</h3>
            @foreach($order->orderItems as $item)
                <div class="item">
                    <div>
                        <strong>{{ $item->book->title }}</strong><br>
                        <small>Tác giả: {{ $item->book->author->name ?? 'N/A' }}</small><br>
                        <small>Số lượng: {{ $item->quantity }}</small>
                    </div>
                    <div style="text-align: right;">
                        <div>{{ number_format($item->price, 0, ',', '.') }}₫</div>
                        <small>{{ number_format($item->price * $item->quantity, 0, ',', '.') }}₫</small>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="total">
            <div style="display: flex; justify-content: space-between;">
                <span>Tổng cộng:</span>
                <span>{{ number_format($order->total_amount, 0, ',', '.') }}₫</span>
            </div>
        </div>

        <div class="order-info">
            <h3>Thông tin giao hàng</h3>
            <p><strong>Người nhận:</strong> {{ $order->shipping_name }}</p>
            <p><strong>Số điện thoại:</strong> {{ $order->shipping_phone }}</p>
            <p><strong>Địa chỉ:</strong> {{ $order->shipping_address }}</p>
            @if($order->notes)
                <p><strong>Ghi chú:</strong> {{ $order->notes }}</p>
            @endif
        </div>

        <div class="contact-info">
            <strong>📞 Cần hỗ trợ?</strong><br>
            Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:<br>
            - Email: support@{{ config('app.name', 'bookstore') }}.com<br>
            - Hotline: 1900-xxxx<br>
            - Hoặc truy cập website để theo dõi đơn hàng
        </div>

        <p><strong>Lưu ý quan trọng:</strong></p>
        <ul>
            <li>Vui lòng giữ lại email này để theo dõi đơn hàng</li>
            <li>Thời gian giao hàng dự kiến: 2-5 ngày làm việc</li>
            <li>Bạn sẽ nhận được thông báo khi đơn hàng được giao</li>
        </ul>

        <p>Cảm ơn bạn đã tin tưởng và mua sắm tại {{ config('app.name') }}!</p>
    </div>

    <div class="footer">
        <p>Email này được gửi tự động từ hệ thống {{ config('app.name') }}.</p>
        <p>Vui lòng không trả lời email này.</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tất cả quyền được bảo lưu.</p>
    </div>
</body>
</html>