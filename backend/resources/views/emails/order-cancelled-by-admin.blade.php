<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo hủy đơn hàng</title>
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
            background-color: #dc3545;
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
        .reason-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
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
        .contact-info {
            background-color: #d1ecf1;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .refund-info {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ config('app.name') }}</h1>
        <h2>❌ Thông báo hủy đơn hàng</h2>
    </div>

    <div class="content">
        <p>Xin chào <strong>{{ $order->user->name }}</strong>,</p>

        <p>Chúng tôi xin lỗi phải thông báo rằng đơn hàng <strong>#{{ $order->id }}</strong> của bạn đã bị hủy bởi quản trị viên.</p>

        @if($reason)
            <div class="reason-box">
                <strong>Lý do hủy đơn hàng:</strong><br>
                {{ $reason }}
            </div>
        @endif

        <div class="order-info">
            <h3>Thông tin đơn hàng đã hủy</h3>
            <p><strong>Mã đơn hàng:</strong> #{{ $order->id }}</p>
            <p><strong>Ngày đặt:</strong> {{ $order->created_at->format('d/m/Y H:i:s') }}</p>
            <p><strong>Ngày hủy:</strong> {{ now()->format('d/m/Y H:i:s') }}</p>
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
            <h3>Chi tiết đơn hàng đã hủy</h3>
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
                <span>Tổng giá trị đơn hàng:</span>
                <span>{{ number_format($order->total_amount, 0, ',', '.') }}₫</span>
            </div>
        </div>

        @if($order->payment_method !== 'cod')
            <div class="refund-info">
                <h3>💰 Thông tin hoàn tiền</h3>
                <p>Vì đơn hàng đã được thanh toán trước, chúng tôi sẽ tiến hành hoàn tiền cho bạn:</p>
                <ul>
                    <li><strong>Số tiền hoàn:</strong> {{ number_format($order->total_amount, 0, ',', '.') }}₫</li>
                    <li><strong>Thời gian hoàn tiền:</strong> 3-7 ngày làm việc</li>
                    <li><strong>Phương thức hoàn:</strong> Hoàn về tài khoản/thẻ thanh toán gốc</li>
                </ul>
                <p><em>Bạn sẽ nhận được thông báo khi giao dịch hoàn tiền được xử lý thành công.</em></p>
            </div>
        @endif

        <div class="contact-info">
            <strong>📞 Cần hỗ trợ?</strong><br>
            Nếu bạn có bất kỳ câu hỏi nào về việc hủy đơn hàng này, vui lòng liên hệ với chúng tôi:<br>
            - Email: support@{{ config('app.name', 'bookstore') }}.com<br>
            - Hotline: 1900-xxxx<br>
            - Hoặc truy cập website để được hỗ trợ trực tiếp
        </div>

        <p><strong>Chúng tôi xin lỗi vì sự bất tiện này!</strong></p>
        <p>Hy vọng bạn sẽ tiếp tục tin tưởng và mua sắm tại {{ config('app.name') }} trong tương lai.</p>

        <p><em>Lưu ý: Nếu bạn vẫn muốn mua các sản phẩm trong đơn hàng này, vui lòng đặt hàng mới trên website.</em></p>
    </div>

    <div class="footer">
        <p>Email này được gửi tự động từ hệ thống {{ config('app.name') }}.</p>
        <p>Vui lòng không trả lời email này.</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tất cả quyền được bảo lưu.</p>
    </div>
</body>
</html>