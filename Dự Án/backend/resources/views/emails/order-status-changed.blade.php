<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cập nhật trạng thái đơn hàng - SecretBook</title>
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
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 32px 24px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 32px 24px;
            background: #ffffff;
        }
        
        .status-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
        }
        
        .status-change {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 2px solid #3b82f6;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            position: relative;
        }
        
        .status-change::before {
            content: '🔄';
            position: absolute;
            top: -12px;
            left: 24px;
            background: #3b82f6;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        
        .order-info {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #e5e7eb;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 16px;
        }
        
        .info-item {
            background: white;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .info-item.full-width {
            grid-column: 1 / -1;
        }
        
        .info-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 4px;
            font-weight: 500;
        }
        
        .info-value {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
        }
        
        .order-items {
            margin: 24px 0;
            background: #f9fafb;
            border-radius: 12px;
            padding: 24px;
            border: 1px solid #e5e7eb;
        }
        
        .item {
            display: flex;
            align-items: center;
            padding: 16px;
            background: white;
            border-radius: 8px;
            margin-bottom: 12px;
            border: 1px solid #e5e7eb;
            transition: all 0.2s ease;
        }
        
        .item:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .item:last-child {
            margin-bottom: 0;
        }
        
        .item-image {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            margin-right: 16px;
            flex-shrink: 0;
        }
        
        .item-details {
            flex: 1;
        }
        
        .item-details h4 {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 4px;
            font-weight: 600;
        }
        
        .item-author {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        
        .item-quantity {
            font-size: 14px;
            color: #4b5563;
            font-weight: 500;
        }
        
        .item-price {
            text-align: right;
            flex-shrink: 0;
        }
        
        .unit-price {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        
        .total-price {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
        }
        
        .empty-order {
            text-align: center;
            padding: 32px;
            color: #6b7280;
        }
        
        .total-section {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 20px 24px;
            border-radius: 12px;
            margin: 24px 0;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .total-label {
            font-size: 18px;
            font-weight: 600;
        }
        
        .total-amount {
            font-size: 24px;
            font-weight: 700;
        }
        
        .status {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-processing {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .status-shipped {
            background: #e0e7ff;
            color: #5b21b6;
        }
        
        .status-delivered {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-cancelled {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .shipping-info {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #0ea5e9;
        }
        
        .contact-info {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #0ea5e9;
        }
        
        .contact-methods {
            margin-top: 16px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
            color: #0f172a;
        }
        
        .contact-icon {
            margin-right: 12px;
            font-size: 16px;
        }
        
        .important-notes {
            background: #fef3c7;
            padding: 20px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #f59e0b;
        }
        
        .note-list {
            margin-top: 12px;
        }
        
        .note-item {
            padding: 8px 0;
            color: #92400e;
            font-weight: 500;
        }
        
        .footer {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: #d1d5db;
            padding: 24px;
            text-align: center;
        }
        
        .footer-content {
            max-width: 400px;
            margin: 0 auto;
        }
        
        .footer-divider {
            height: 1px;
            background: #4b5563;
            margin: 16px 0;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 16px 0;
            transition: all 0.2s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .header {
                padding: 24px 16px;
            }
            
            .content {
                padding: 24px 16px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .item {
                flex-direction: column;
                text-align: center;
            }
            
            .item-image {
                margin-right: 0;
                margin-bottom: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📚 SecretBook</h1>
            <p>Cửa hàng sách trực tuyến</p>
        </div>
        
        <div class="content">
            <div class="status-badge">🔄 Cập nhật trạng thái đơn hàng</div>
            
            <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Xin chào {{ $order->user->name }}! 👋</h2>
            
            <p style="font-size: 16px; margin-bottom: 24px; color: #4b5563;">
                Đơn hàng #{{ $order->id }} của bạn tại <strong style="color: #f59e0b;">SecretBook</strong> đã có cập nhật trạng thái mới.
            </p>

            <div class="status-change">
                <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 12px; font-weight: 600;">
                    📋 Trạng thái mới của đơn hàng
                </h3>
                <div style="display: flex; align-items: center; justify-content: center; margin: 16px 0;">
                    <span class="status status-{{ $newStatus }}">
                        @switch($newStatus)
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
                                {{ ucfirst($newStatus) }}
                        @endswitch
                    </span>
                </div>
                
                @switch($newStatus)
                    @case('processing')
                        <p style="color: #1e40af; text-align: center; font-weight: 500;">
                            🎉 Tuyệt vời! Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.
                        </p>
                        @break
                    @case('shipped')
                        <p style="color: #1e40af; text-align: center; font-weight: 500;">
                            🚚 Đơn hàng đã được giao cho đơn vị vận chuyển và đang trên đường đến với bạn!
                        </p>
                        @break
                    @case('delivered')
                        <p style="color: #1e40af; text-align: center; font-weight: 500;">
                            🎊 Chúc mừng! Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua sắm tại SecretBook!
                        </p>
                        @break
                    @case('cancelled')
                        <p style="color: #1e40af; text-align: center; font-weight: 500;">
                            😔 Đơn hàng đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.
                        </p>
                        @break
                    @default
                        <p style="color: #1e40af; text-align: center; font-weight: 500;">
                            📝 Trạng thái đơn hàng đã được cập nhật.
                        </p>
                @endswitch
            </div>

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
                        <div class="info-label">Trạng thái hiện tại</div>
                        <div class="info-value">
                            <span class="status status-{{ $newStatus }}">
                                @switch($newStatus)
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
                                        {{ ucfirst($newStatus) }}
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
                    @if($newStatus === 'shipped')
                        <div class="note-item">📦 Đơn hàng đang được vận chuyển, vui lòng chuẩn bị nhận hàng</div>
                        <div class="note-item">📱 Bạn sẽ nhận được cuộc gọi từ shipper trước khi giao hàng</div>
                    @elseif($newStatus === 'delivered')
                        <div class="note-item">⭐ Đánh giá sản phẩm để giúp khách hàng khác có trải nghiệm tốt hơn</div>
                        <div class="note-item">🔄 Liên hệ ngay nếu có vấn đề với sản phẩm</div>
                    @else
                        <div class="note-item">📧 Vui lòng giữ lại email này để theo dõi đơn hàng</div>
                        <div class="note-item">🔔 Bạn sẽ nhận được thông báo khi có cập nhật mới</div>
                    @endif
                    <div class="note-item">📞 Liên hệ với chúng tôi nếu cần hỗ trợ thêm</div>
                </div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <p style="font-size: 18px; color: #1f2937; margin-bottom: 16px;">
                    🙏 Cảm ơn bạn đã tin tưởng <strong style="color: #f59e0b;">SecretBook</strong>!
                </p>
                <p style="color: #6b7280; font-style: italic; margin-bottom: 24px;">
                    "Mỗi cuốn sách là một cuộc phiêu lưu mới" 📚✨
                </p>
                <a href="https://www.secretbook.com" class="btn">
                    🛒 Tiếp tục mua sắm
                </a>
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
    </div>
</body>
</html>