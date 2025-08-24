<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChatBotSupportController extends Controller
{
    public function faqs() {
        return response()->json(['faqs' => [
            ['q'=>'Hướng dẫn đặt hàng','a'=>'B1: Chọn sách → B2: Thêm vào giỏ → B3: Giỏ hàng → B4: Điền địa chỉ & thanh toán → B5: Xác nhận.'],
            ['q'=>'Phương thức thanh toán','a'=>'VNPay (thẻ/Momo/QR), chuyển khoản, COD.'],
            ['q'=>'Thời gian giao hàng','a'=>'Nội thành 1–2 ngày; tỉnh khác 2–5 ngày.'],
            ['q'=>'Chính sách đổi trả','a'=>'Đổi trả trong 7 ngày nếu sách lỗi. Liên hệ kèm ảnh.'],
            ['q'=>'Freeship','a'=>'Tùy chương trình; thường freeship đơn từ 300k hoặc có mã. Xem mục Khuyến mãi.'],
        ]]);
    }
    public function feedback(Request $r){ $d=$r->validate(['rating'=>'required|int|min:1|max:5','notes'=>'nullable|string|max:500']); Log::info('[Chatbot] feedback',$d); return response()->json(['ok'=>true]); }
    public function contact(Request $r){ $d=$r->validate(['name'=>'required|string|max:100','email'=>'nullable|email|max:120','phone'=>'nullable|string|max:20','message'=>'required|string|max:800']); Log::info('[Chatbot] contact',$d); return response()->json(['ok'=>true]); }
    public function log(Request $r){ $d=$r->validate(['event'=>'required|string|max:50','payload'=>'array']); Log::info('[Chatbot] log',$d); return response()->json(['ok'=>true]); }
}
