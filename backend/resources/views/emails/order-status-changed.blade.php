<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cập nhật trạng thái đơn hàng</title>
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
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .order-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .status-change {
            background-color: #e7f3ff;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .order-items {
            margin: 15px 0;
        }
        .item {
            border-bottom: 1px solid #eee;
            padding: 10px 0;
        }
        .item:last-child {
            border-bottom: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Cập nhật trạng thái đơn hàng</h1>
        <p>Đơn hàng #{{ $order->order_number }}</p>
    </div>

    <div class="content">
        <p>Xin chào {{ $order->user->name }},</p>
        
        <p>Chúng tôi xin thông báo rằng trạng thái đơn hàng của bạn đã được cập nhật.</p>

        <div class="status-change">
            <h3>Thay đổi trạng thái:</h3>
            <p><strong>Trạng thái cũ:</strong> 
                @switch($oldStatus)
                    @case('pending')
                        Chờ xử lý
                        @break
                    @case('confirmed')
                        Đã xác nhận
                        @break
                    @case('processing')
                        Đang xử lý
                        @break
                    @case('shipped')
                        Đã gửi
                        @break
                    @case('delivered')
                        Đã giao
                        @break
                    @case('cancelled')
                        Đã hủy
                        @break
                    @default
                        {{ $oldStatus }}
                @endswitch
            </p>
            <p><strong>Trạng thái mới:</strong> 
                @switch($newStatus)
                    @case('pending')
                        Chờ xử lý
                        @break
                    @case('confirmed')
                        Đã xác nhận
                        @break
                    @case('processing')
                        Đang xử lý
                        @break
                    @case('shipped')
                        Đã gửi
                        @break
                    @case('delivered')
                        Đã giao
                        @break
                    @case('cancelled')
                        Đã hủy
                        @break
                    @default
                        {{ $newStatus }}
                @endswitch
            </p>
        </div>

        <div class="order-info">
            <h3>Thông tin đơn hàng:</h3>
            <p><strong>Mã đơn hàng:</strong> {{ $order->order_number }}</p>
            <p><strong>Ngày đặt hàng:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
            <p><strong>Tổng tiền:</strong> {{ number_format($order->total_amount, 0, ',', '.') }} VNĐ</p>
            
            @if($order->address)
            <p><strong>Địa chỉ giao hàng:</strong><br>
                {{ $order->address->name }}<br>
                {{ $order->address->address }}, {{ $order->address->city }}<br>
                Điện thoại: {{ $order->address->phone }}
            </p>
            @endif
        </div>

        @if($order->items && $order->items->count() > 0)
        <div class="order-items">
            <h3>Sản phẩm đã đặt:</h3>
            @foreach($order->items as $item)
            <div class="item">
                <p><strong>{{ $item->book->title }}</strong></p>
                <p>Số lượng: {{ $item->quantity }} | Giá: {{ number_format($item->price, 0, ',', '.') }} VNĐ</p>
            </div>
            @endforeach
        </div>
        @endif

        @if($newStatus === 'shipped')
        <p><strong>Thông báo quan trọng:</strong> Đơn hàng của bạn đã được giao cho đơn vị vận chuyển. Bạn sẽ nhận được hàng trong vòng 2-3 ngày làm việc.</p>
        @elseif($newStatus === 'delivered')
        <p><strong>Cảm ơn bạn:</strong> Đơn hàng đã được giao thành công! Cảm ơn bạn đã mua sắm tại cửa hàng chúng tôi.</p>
        @elseif($newStatus === 'cancelled')
        <p><strong>Thông báo:</strong> Đơn hàng của bạn đã bị hủy. Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
        @endif

        <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.</p>

        <p>Trân trọng,<br>
        Đội ngũ hỗ trợ khách hàng</p>
    </div>

    <div class="footer">
        <p>Email này được gửi tự động, vui lòng không trả lời trực tiếp.</p>
        <p>© {{ date('Y') }} Cửa hàng sách. Tất cả quyền được bảo lưu.</p>
    </div>
</body>
</html>