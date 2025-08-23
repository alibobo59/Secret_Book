<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo trạng thái tài khoản - SecretBook</title>
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
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin-bottom: 24px;
        }
        
        .status-activated {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
        }
        
        .status-deactivated {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
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
            content: '👤';
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
        
        .account-info {
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
        
        .reason-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            position: relative;
        }
        
        .reason-box::before {
            content: '⚠️';
            position: absolute;
            top: -12px;
            left: 24px;
            background: #f59e0b;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
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
        
        .btn-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
            <div class="status-badge {{ $status === 'active' ? 'status-activated' : 'status-deactivated' }}">
                @if($status === 'active')
                    ✅ Tài khoản đã được kích hoạt
                @else
                    ❌ Tài khoản đã bị vô hiệu hóa
                @endif
            </div>
            
            <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Xin chào {{ $user->name }}! 👋</h2>
            
            <p style="font-size: 16px; margin-bottom: 24px; color: #4b5563;">
                Chúng tôi xin thông báo về việc thay đổi trạng thái tài khoản của bạn tại <strong style="color: #f59e0b;">SecretBook</strong>.
            </p>

            <div class="status-change">
                <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 12px; font-weight: 600;">
                    📋 Thông tin thay đổi
                </h3>
                
                @if($status === 'active')
                    <div style="text-align: center; margin: 16px 0;">
                        <div style="background: #d1fae5; color: #065f46; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                            <h4 style="margin: 0; font-size: 18px;">🎉 Tài khoản đã được kích hoạt thành công!</h4>
                        </div>
                        <p style="color: #1e40af; font-weight: 500;">
                            Bạn có thể đăng nhập và sử dụng đầy đủ các tính năng của SecretBook.
                        </p>
                    </div>
                @else
                    <div style="text-align: center; margin: 16px 0;">
                        <div style="background: #fee2e2; color: #dc2626; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                            <h4 style="margin: 0; font-size: 18px;">⚠️ Tài khoản đã bị vô hiệu hóa</h4>
                        </div>
                        <p style="color: #1e40af; font-weight: 500;">
                            Tài khoản của bạn hiện tại không thể truy cập vào hệ thống.
                        </p>
                    </div>
                @endif
            </div>

            <div class="account-info">
                <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                    👤 Thông tin tài khoản
                </h3>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Tên người dùng</div>
                        <div class="info-value">{{ $user->name }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">{{ $user->email }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Trạng thái hiện tại</div>
                        <div class="info-value">
                            @if($status === 'active')
                                <span style="color: #059669; font-weight: 600;">✅ Đang hoạt động</span>
                            @else
                                <span style="color: #dc2626; font-weight: 600;">❌ Bị vô hiệu hóa</span>
                            @endif
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Thời gian thay đổi</div>
                        <div class="info-value">{{ now()->format('d/m/Y H:i') }}</div>
                    </div>
                </div>
            </div>

            @if(isset($reason) && $reason)
                <div class="reason-box">
                    <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; font-weight: 600;">
                        📝 Lý do thay đổi
                    </h3>
                    <p style="color: #92400e; font-weight: 500; font-size: 16px; line-height: 1.6;">
                        {{ $reason }}
                    </p>
                </div>
            @endif

            @if($status === 'active')
                <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #10b981;">
                    <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                        🎊 Chào mừng trở lại!
                    </h3>
                    <p style="color: #065f46; margin-bottom: 16px; font-weight: 500;">
                        Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể:
                    </p>
                    <ul style="color: #065f46; margin-left: 20px; font-weight: 500;">
                        <li>📚 Duyệt và mua sách yêu thích</li>
                        <li>📖 Quản lý thư viện cá nhân</li>
                        <li>🛒 Theo dõi đơn hàng</li>
                        <li>⭐ Đánh giá và bình luận sách</li>
                        <li>🎁 Nhận ưu đãi đặc biệt</li>
                    </ul>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://www.secretbook.com/login" class="btn btn-success">
                            🚀 Đăng nhập ngay
                        </a>
                    </div>
                </div>
            @else
                <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #ef4444;">
                    <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                        🚫 Tài khoản bị hạn chế
                    </h3>
                    <p style="color: #dc2626; margin-bottom: 16px; font-weight: 500;">
                        Tài khoản của bạn hiện không thể:
                    </p>
                    <ul style="color: #dc2626; margin-left: 20px; font-weight: 500;">
                        <li>❌ Đăng nhập vào hệ thống</li>
                        <li>❌ Thực hiện mua hàng</li>
                        <li>❌ Truy cập thông tin cá nhân</li>
                        <li>❌ Sử dụng các tính năng của website</li>
                    </ul>
                </div>
            @endif

            <div class="contact-info">
                <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                    📞 Cần hỗ trợ?
                </h3>
                <p style="margin-bottom: 16px; color: #4b5563;">
                    @if($status === 'active')
                        Nếu bạn có bất kỳ câu hỏi nào về tài khoản hoặc cần hỗ trợ, đội ngũ <strong style="color: #f59e0b;">SecretBook</strong> luôn sẵn sàng giúp đỡ:
                    @else
                        Nếu bạn không đồng ý với quyết định này hoặc muốn khiếu nại, vui lòng liên hệ với đội ngũ <strong style="color: #f59e0b;">SecretBook</strong>:
                    @endif
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
                    <div class="contact-item">
                        <span class="contact-icon">💬</span>
                        <span>Live Chat: Có sẵn 24/7 trên website</span>
                    </div>
                </div>
            </div>

            <div class="important-notes">
                <h4 style="color: #1f2937; font-size: 16px; margin-bottom: 12px; display: flex; align-items: center;">
                    ⚠️ Lưu ý quan trọng
                </h4>
                <div class="note-list">
                    @if($status === 'active')
                        <div class="note-item">🔐 Vui lòng đổi mật khẩu nếu bạn nghi ngờ tài khoản bị xâm phạm</div>
                        <div class="note-item">📧 Kiểm tra email thường xuyên để nhận thông báo từ SecretBook</div>
                        <div class="note-item">🛡️ Không chia sẻ thông tin đăng nhập với người khác</div>
                    @else
                        <div class="note-item">📧 Vui lòng giữ lại email này để làm bằng chứng</div>
                        <div class="note-item">⏰ Bạn có 30 ngày để khiếu nại quyết định này</div>
                        <div class="note-item">📞 Liên hệ ngay với bộ phận hỗ trợ nếu cần giải thích</div>
                    @endif
                    <div class="note-item">📞 Liên hệ với chúng tôi nếu cần hỗ trợ thêm</div>
                </div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
                @if($status === 'active')
                    <p style="font-size: 18px; color: #1f2937; margin-bottom: 16px;">
                        🎉 Chào mừng bạn trở lại với <strong style="color: #f59e0b;">SecretBook</strong>!
                    </p>
                    <p style="color: #6b7280; font-style: italic; margin-bottom: 24px;">
                        "Hành trình khám phá tri thức bắt đầu từ đây" 📚✨
                    </p>
                    <a href="https://www.secretbook.com" class="btn">
                        🛒 Khám phá sách ngay
                    </a>
                @else
                    <p style="font-size: 18px; color: #1f2937; margin-bottom: 16px;">
                        😔 Chúng tôi rất tiếc về sự bất tiện này
                    </p>
                    <p style="color: #6b7280; font-style: italic; margin-bottom: 24px;">
                        "Mọi vấn đề đều có thể được giải quyết" 🤝
                    </p>
                    <a href="mailto:support@secretbook.com" class="btn btn-danger">
                        📧 Liên hệ hỗ trợ
                    </a>
                @endif
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