<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đặt hàng thành công - SecretBook</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .header .brand {
            font-size: 20px;
            font-weight: 600;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .success-badge {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .order-info {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border-left: 4px solid #f59e0b;
        }
        .order-items {
            margin: 24px 0;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #f3f4f6;
            background-color: #ffffff;
        }
        .item:last-child {
            border-bottom: none;
        }
        .item:nth-child(even) {
            background-color: #f9fafb;
        }
        .total-section {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            text-align: center;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        .status-processing {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .status-shipped {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-delivered {
            background-color: #dcfce7;
            color: #166534;
        }
        .contact-info {
            background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border-left: 4px solid #8b5cf6;
        }
        .footer {
            background-color: #f3f4f6;
            padding: 30px;
            text-align: center;
            color: #6b7280;
        }
        .footer .brand {
            font-size: 18px;
            font-weight: 600;
            color: #f59e0b;
            margin-bottom: 8px;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 16px 0;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 20px 0;
        }
        .info-item {
            padding: 12px;
            background-color: #f9fafb;
            border-radius: 8px;
            border-left: 3px solid #f59e0b;
        }
        .info-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            color: #1f2937;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>SecretBook</h1>
            <div class="brand">Cửa hàng sách trực tuyến</div>
        </div>

        <div class="content">
            <div class="success-badge">✅ Đặt hàng thành công</div>
            <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Xin chào {{ $order->user->name }}! 👋</h2>
            
            <p style="font-size: 16px; margin-bottom: 24px; color: #4b5563;">
                Cảm ơn bạn đã tin tưởng và đặt hàng tại <strong style="color: #f59e0b;">SecretBook</strong>! 
                Đơn hàng của bạn đã được tiếp nhận thành công và đang được xử lý.
            </p>

            <div class="order-info">
                <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                    📋 Thông tin đơn hàng
                </h3>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Mã đơn hàng</div>
                        <div class="info-value">#{{ $order->id }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Ngày đặt</div>
                        <div class="info-value">{{ $order->created_at->format('d/m/Y H:i') }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Trạng thái</div>
                        <div class="info-value">
                            <span class="status status-{{ $order->status }}">
                                @switch($order->status)
                                    @case('pending')
                                        ⏳ Chờ xử lý
                                        @break
                                    @case('processing')
                                        🔄 Đang xử lý
                                        @break
                                    @case('shipped')
                                        🚚 Đang giao hàng
                                        @break
                                    @case('delivered')
                                        ✅ Đã giao hàng
                                        @break
                                    @case('cancelled')
                                        ❌ Đã hủy
                                        @break
                                    @default
                                        {{ ucfirst($order->status) }}
                                @endswitch
                            </span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phương thức thanh toán</div>
                        <div class="info-value">
                            @switch($order->payment_method)
                                @case('cod')
                                    💵 Thanh toán khi nhận hàng
                                    @break
                                @case('vnpay')
                                    💳 VNPay
                                    @break
                                @case('bank_transfer')
                                    🏦 Chuyển khoản ngân hàng
                                    @break
                                @default
                                    {{ $order->payment_method }}
                            @endswitch
                        </div>
                    </div>
                </div>
            </div>

            <div class="order-items">
                <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                    📚 Chi tiết đơn hàng
                </h3>
                @if(!empty($order->items) && $order->items->count() > 0)
                    @foreach($order->items as $item)
                        <div class="item">
                            <div class="item-image">
                                📖
                            </div>
                            <div class="item-details">
                                <h4>{{ $item->book->title ?? 'N/A' }}</h4>
                                <p class="item-author">✍️ {{ $item->book->author->name ?? 'N/A' }}</p>
                                <p class="item-quantity">Số lượng: {{ $item->quantity }}</p>
                            </div>
                            <div class="item-price">
                                <div class="unit-price">{{ number_format($item->price, 0, ',', '.') }}₫</div>
                                <div class="total-price">{{ number_format($item->price * $item->quantity, 0, ',', '.') }}₫</div>
                            </div>
                        </div>
                    @endforeach
                @else
                    <div class="empty-order">
                        <p>📭 Không có sản phẩm nào trong đơn hàng này.</p>
                    </div>
                @endif
            </div>

            <div class="total-section">
                <div class="total-row">
                    <span class="total-label">💰 Tổng cộng:</span>
                    <span class="total-amount">{{ number_format($order->total_amount, 0, ',', '.') }}₫</span>
                </div>
            </div>

            <div class="shipping-info">
                <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                    🚚 Thông tin giao hàng
                </h3>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Người nhận</div>
                        <div class="info-value">{{ $order->shipping_name }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Số điện thoại</div>
                        <div class="info-value">{{ $order->shipping_phone }}</div>
                    </div>
                    <div class="info-item full-width">
                        <div class="info-label">Địa chỉ</div>
                        <div class="info-value">{{ $order->shipping_address }}</div>
                    </div>
                    @if($order->notes)
                        <div class="info-item full-width">
                            <div class="info-label">Ghi chú</div>
                            <div class="info-value">{{ $order->notes }}</div>
                        </div>
                    @endif
                </div>
            </div>

            <div class="contact-info">
                <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                    📞 Cần hỗ trợ?
                </h3>
                <p style="margin-bottom: 16px; color: #4b5563;">
                    Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, đội ngũ <strong style="color: #f59e0b;">SecretBook</strong> luôn sẵn sàng hỗ trợ:
                </p>
                <div class="contact-methods">
                    <div class="contact-item">
                        <span class="contact-icon">📧</span>
                        <span>Email: support@secretbook.com</span>
                    </div>
                    <div class="contact-item">
                        <span class="contact-icon">📱</span>
                        <span>Hotline: 1900-SECRET (1900-732738)</span>
                    </div>
                    <div class="contact-item">
                        <span class="contact-icon">🌐</span>
                        <span>Website: www.secretbook.com</span>
                    </div>
                </div>
            </div>

            <div class="important-notes">
                <h4 style="color: #1f2937; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center;">
                    ⚠️ Lưu ý quan trọng
                </h4>
                <div class="note-list">
                    <div class="note-item">📌 Vui lòng giữ lại email này để theo dõi đơn hàng</div>
                    <div class="note-item">🚚 Thời gian giao hàng dự kiến: 2-5 ngày làm việc</div>
                    <div class="note-item">🔔 Bạn sẽ nhận được thông báo khi đơn hàng được giao</div>
                    <div class="note-item">💳 Kiểm tra kỹ sản phẩm trước khi thanh toán (với COD)</div>
                </div>
            </div>

            <div class="thank-you">
                <p style="text-align: center; font-size: 18px; color: #1f2937; margin: 24px 0;">
                    🙏 Cảm ơn bạn đã tin tưởng và lựa chọn <strong style="color: #f59e0b;">SecretBook</strong>!
                </p>
                <p style="text-align: center; color: #6b7280; font-style: italic;">
                    "Mỗi cuốn sách là một cuộc phiêu lưu mới" 📚✨
                </p>
            </div>
        </div>

        <div class="footer">
            <div class="footer-content">
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                    Email này được gửi tự động từ hệ thống <strong>SecretBook</strong>.
                </p>
                <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">
                    Vui lòng không trả lời email này.
                </p>
                <div class="footer-divider"></div>
                <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 12px; text-align: center;">
                    &copy; {{ date('Y') }} SecretBook - Cửa hàng sách trực tuyến. Tất cả quyền được bảo lưu.
                </p>
            </div>
        </div>
</body>
</html>