<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            background-color: #007bff;
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            margin: -20px -20px 20px -20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 0;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .message {
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .reset-button {
            text-align: center;
            margin: 30px 0;
        }
        .reset-button a {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
        }
        .reset-button a:hover {
            background-color: #0056b3;
        }
        .alternative-link {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            word-break: break-all;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📚 BookStore</div>
            <h1>Đặt lại mật khẩu</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                Xin chào {{ $user->name }},
            </div>
            
            <div class="message">
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại BookStore.</p>
                
                <p>Để đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:</p>
            </div>
            
            <div class="reset-button">
                <a href="{{ $resetUrl }}" target="_blank">Đặt lại mật khẩu</a>
            </div>
            
            <div class="alternative-link">
                <strong>Hoặc sao chép và dán liên kết sau vào trình duyệt:</strong><br>
                <a href="{{ $resetUrl }}" target="_blank">{{ $resetUrl }}</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul>
                    <li>Liên kết này sẽ hết hạn sau <strong>60 phút</strong></li>
                    <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                    <li>Để bảo mật tài khoản, không chia sẻ liên kết này với bất kỳ ai</li>
                </ul>
            </div>
            
            <div class="message">
                <p>Nếu bạn gặp khó khăn khi đặt lại mật khẩu, vui lòng liên hệ với chúng tôi qua email hỗ trợ.</p>
                
                <p>Trân trọng,<br>
                <strong>Đội ngũ BookStore</strong></p>
            </div>
        </div>
        
        <div class="footer">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            <p>© {{ date('Y') }} BookStore. Tất cả quyền được bảo lưu.</p>
        </div>
    </div>
</body>
</html>