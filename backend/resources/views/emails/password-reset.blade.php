<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu - SecretBook</title>
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
        
        .security-badge {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
        }
        
        .security-notice {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 2px solid #3b82f6;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            position: relative;
        }
        
        .security-notice::before {
            content: '🔐';
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
        
        .reset-info {
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
        
        .reset-button-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 32px 24px;
            border-radius: 12px;
            margin: 24px 0;
            text-align: center;
            border: 1px solid #0ea5e9;
        }
        
        .btn {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 18px;
            margin: 16px 0;
            transition: all 0.3s ease;
            box-shadow: 0 8px 15px -3px rgba(245, 158, 11, 0.4);
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 20px -3px rgba(245, 158, 11, 0.5);
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.4);
        }
        
        .btn-primary:hover {
            box-shadow: 0 12px 20px -3px rgba(59, 130, 246, 0.5);
        }
        
        .token-info {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            position: relative;
        }
        
        .token-info::before {
            content: '⏰';
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
        
        .manual-token {
            background: #f3f4f6;
            border: 2px dashed #9ca3af;
            padding: 20px;
            border-radius: 8px;
            margin: 16px 0;
            text-align: center;
            font-family: 'Courier New', monospace;
        }
        
        .token-code {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            letter-spacing: 2px;
            background: white;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid #d1d5db;
            display: inline-block;
            margin: 8px 0;
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
            background: #fee2e2;
            padding: 20px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #ef4444;
        }
        
        .note-list {
            margin-top: 12px;
        }
        
        .note-item {
            padding: 8px 0;
            color: #dc2626;
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
            
            .btn {
                padding: 14px 24px;
                font-size: 16px;
            }
            
            .token-code {
                font-size: 18px;
                letter-spacing: 1px;
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
            <div class="security-badge">🔐 Yêu cầu đặt lại mật khẩu</div>
            
            <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Xin chào {{ $user->name }}! 👋</h2>
            
            <p style="font-size: 16px; margin-bottom: 24px; color: #4b5563;">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong style="color: #f59e0b;">SecretBook</strong>.
            </p>

            <div class="security-notice">
                <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 12px; font-weight: 600;">
                    🛡️ Thông tin bảo mật
                </h3>
                <p style="color: #1e40af; font-weight: 500; margin-bottom: 12px;">
                    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
                </p>
                <p style="color: #1e40af; font-weight: 500;">
                    Nếu bạn thực sự muốn đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới hoặc sử dụng mã xác thực.
                </p>
            </div>

            <div class="reset-info">
                <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                    📋 Thông tin yêu cầu
                </h3>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Tài khoản</div>
                        <div class="info-value">{{ $user->email }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Thời gian yêu cầu</div>
                        <div class="info-value">{{ now()->format('d/m/Y H:i') }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Địa chỉ IP</div>
                        <div class="info-value">{{ request()->ip() ?? 'N/A' }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Trình duyệt</div>
                        <div class="info-value">{{ request()->userAgent() ? substr(request()->userAgent(), 0, 30) . '...' : 'N/A' }}</div>
                    </div>
                </div>
            </div>

            <div class="reset-button-section">
                <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 16px; font-weight: 600;">
                    🚀 Đặt lại mật khẩu ngay
                </h3>
                <p style="color: #4b5563; margin-bottom: 24px; font-size: 16px;">
                    Nhấp vào nút bên dưới để được chuyển đến trang đặt lại mật khẩu an toàn:
                </p>
                <a href="{{ $resetUrl }}" class="btn btn-primary">
                    🔑 Đặt lại mật khẩu
                </a>
                <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
                    Liên kết này sẽ hết hạn sau 60 phút kể từ khi gửi email.
                </p>
            </div>

            <div class="token-info">
                <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; font-weight: 600;">
                    ⏰ Mã xác thực thay thế
                </h3>
                <p style="color: #92400e; margin-bottom: 16px; font-weight: 500;">
                    Nếu nút trên không hoạt động, bạn có thể sử dụng mã xác thực sau:
                </p>
                <div class="manual-token">
                    <p style="color: #4b5563; margin-bottom: 8px; font-size: 14px;">Mã xác thực:</p>
                    <div class="token-code">{{ $token }}</div>
                    <p style="color: #6b7280; margin-top: 8px; font-size: 12px;">
                        Sao chép mã này và dán vào trang đặt lại mật khẩu
                    </p>
                </div>
                <p style="color: #92400e; font-weight: 500; font-size: 14px;">
                    ⚠️ Mã này chỉ có hiệu lực trong 60 phút và chỉ sử dụng được một lần.
                </p>
            </div>

            <div class="contact-info">
                <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; display: flex; align-items: center;">
                    📞 Cần hỗ trợ?
                </h3>
                <p style="margin-bottom: 16px; color: #4b5563;">
                    Nếu bạn gặp khó khăn trong việc đặt lại mật khẩu hoặc có thắc mắc về bảo mật, đội ngũ <strong style="color: #f59e0b;">SecretBook</strong> luôn sẵn sàng hỗ trợ:
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
                    ⚠️ Lưu ý bảo mật quan trọng
                </h4>
                <div class="note-list">
                    <div class="note-item">🔐 Không chia sẻ mã xác thực hoặc liên kết với bất kỳ ai</div>
                    <div class="note-item">⏰ Liên kết và mã xác thực sẽ hết hạn sau 60 phút</div>
                    <div class="note-item">🛡️ Chọn mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</div>
                    <div class="note-item">📧 SecretBook sẽ không bao giờ yêu cầu mật khẩu qua email</div>
                    <div class="note-item">🚨 Nếu bạn không yêu cầu đặt lại mật khẩu, hãy liên hệ ngay với chúng tôi</div>
                </div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <p style="font-size: 18px; color: #1f2937; margin-bottom: 16px;">
                    🔒 Bảo mật tài khoản là ưu tiên hàng đầu của <strong style="color: #f59e0b;">SecretBook</strong>
                </p>
                <p style="color: #6b7280; font-style: italic; margin-bottom: 24px;">
                    "An toàn trước tiên, trải nghiệm tuyệt vời sau" 🛡️✨
                </p>
                <a href="https://www.secretbook.com/security-tips" class="btn">
                    🛡️ Tìm hiểu về bảo mật
                </a>
            </div>
        </div>

        <div class="footer">
            <div class="footer-content">
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                    Email này được gửi tự động từ hệ thống bảo mật <strong>SecretBook</strong>.
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