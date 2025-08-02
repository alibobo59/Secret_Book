<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông báo trạng thái tài khoản</title>
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
        .status-deactivated {
            color: #dc3545;
            font-weight: bold;
        }
        .status-activated {
            color: #28a745;
            font-weight: bold;
        }
        .reason-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
        .contact-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ config('app.name') }}</h1>
        <h2>Thông báo trạng thái tài khoản</h2>
    </div>

    <div class="content">
        <p>Xin chào <strong>{{ $user->name }}</strong>,</p>

        @if($status === 'deactivated')
            <p>Chúng tôi xin thông báo rằng tài khoản của bạn đã bị <span class="status-deactivated">khóa</span> trên hệ thống {{ config('app.name') }}.</p>
            
            @if($reason)
                <div class="reason-box">
                    <strong>Lý do khóa tài khoản:</strong><br>
                    {{ $reason }}
                </div>
            @endif

            <p><strong>Điều này có nghĩa là:</strong></p>
            <ul>
                <li>Bạn không thể đăng nhập vào hệ thống</li>
                <li>Tất cả các hoạt động trên tài khoản đã bị tạm dừng</li>
                <li>Bạn không thể thực hiện các giao dịch mới</li>
            </ul>

            <div class="contact-info">
                <strong>Cần hỗ trợ?</strong><br>
                Nếu bạn cho rằng đây là một sự nhầm lẫn hoặc cần thêm thông tin, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.
            </div>
        @else
            <p>Chúng tôi xin thông báo rằng tài khoản của bạn đã được <span class="status-activated">kích hoạt lại</span> trên hệ thống {{ config('app.name') }}.</p>
            
            <p><strong>Bạn có thể:</strong></p>
            <ul>
                <li>Đăng nhập vào hệ thống bình thường</li>
                <li>Sử dụng tất cả các tính năng của tài khoản</li>
                <li>Thực hiện các giao dịch như trước đây</li>
            </ul>

            <p>Cảm ơn bạn đã tiếp tục sử dụng dịch vụ của chúng tôi!</p>
        @endif

        <p><strong>Thông tin tài khoản:</strong></p>
        <ul>
            <li>Email: {{ $user->email }}</li>
            <li>Thời gian: {{ now()->format('d/m/Y H:i:s') }}</li>
        </ul>
    </div>

    <div class="footer">
        <p>Email này được gửi tự động từ hệ thống {{ config('app.name') }}.</p>
        <p>Vui lòng không trả lời email này.</p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Tất cả quyền được bảo lưu.</p>
    </div>
</body>
</html>