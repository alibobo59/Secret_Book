<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Order;
use App\Models\User;
use App\Models\Book;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Chỉ tạo review cho các đơn hàng đã delivered
        $deliveredOrders = Order::where('status', 'delivered')
            ->with(['items', 'user'])
            ->get();

        if ($deliveredOrders->isEmpty()) {
            $this->command->warn('Không có đơn hàng nào đã giao để tạo review!');
            return;
        }

        $vietnameseReviews = [
            // Reviews tích cực (4-5 sao)
            [
                'rating' => 5,
                'reviews' => [
                    'Cuốn sách rất hay, nội dung phong phú và hấp dẫn. Tôi đã đọc một mạch không thể dừng lại!',
                    'Chất lượng sách tuyệt vời, in ấn đẹp, giấy tốt. Nội dung sâu sắc và ý nghĩa.',
                    'Đây là một trong những cuốn sách hay nhất tôi từng đọc. Rất đáng để sưu tầm!',
                    'Sách được đóng gói cẩn thận, giao hàng nhanh. Nội dung không làm tôi thất vọng.',
                    'Cuốn sách kinh điển, ai cũng nên đọc một lần trong đời. Cảm ơn shop!'
                ]
            ],
            [
                'rating' => 4,
                'reviews' => [
                    'Sách hay, nội dung bổ ích. Chỉ tiếc là bìa hơi bị móp một chút khi giao hàng.',
                    'Đọc rất thú vị, cốt truyện hấp dẫn. Giá cả hợp lý so với chất lượng.',
                    'Nội dung tốt, dịch thuật ổn. Sẽ tiếp tục ủng hộ shop trong tương lai.',
                    'Sách đúng như mô tả, chất lượng tốt. Giao hàng đúng hẹn.',
                    'Cuốn sách đáng đọc, có nhiều bài học hay. Recommend cho mọi người!'
                ]
            ],
            // Reviews trung bình (3 sao)
            [
                'rating' => 3,
                'reviews' => [
                    'Sách ổn, nội dung bình thường. Không quá xuất sắc nhưng cũng không tệ.',
                    'Chất lượng sách tạm được, giá hơi cao so với mong đợi.',
                    'Nội dung hay nhưng bản dịch có một số chỗ chưa được tự nhiên.',
                    'Sách đến đúng hẹn, đóng gói cẩn thận. Nội dung như kỳ vọng.'
                ]
            ],
            // Reviews tiêu cực (1-2 sao) - ít hơn
            [
                'rating' => 2,
                'reviews' => [
                    'Sách hơi khô khan, khó đọc. Có thể không phù hợp với sở thích của tôi.',
                    'Chất lượng giấy không được tốt lắm, có mùi hơi khó chịu.'
                ]
            ]
        ];

        $reviewCount = 0;

        foreach ($deliveredOrders as $order) {
            foreach ($order->items as $item) {
                // Chỉ tạo review cho một số sản phẩm (không phải tất cả)
                if (rand(1, 100) <= 70) { // 70% khả năng có review
                    
                    // Chọn ngẫu nhiên rating và review tương ứng
                    $ratingGroup = $this->getRandomRatingGroup($vietnameseReviews);
                    $randomReview = $ratingGroup['reviews'][array_rand($ratingGroup['reviews'])];
                    
                    // Tạo review với thời gian sau khi đơn hàng được giao
                    $reviewDate = $order->updated_at->addDays(rand(1, 7));
                    
                    Review::create([
                        'user_id' => $order->user_id,
                        'book_id' => $item->book_id,
                        'order_id' => $order->id,
                        'rating' => $ratingGroup['rating'],
                        'review' => $randomReview,
                        'created_at' => $reviewDate,
                        'updated_at' => $reviewDate
                    ]);
                    
                    $reviewCount++;
                }
            }
        }

        $this->command->info("Đã tạo thành công {$reviewCount} đánh giá từ các đơn hàng đã giao!");
    }

    /**
     * Lấy ngẫu nhiên nhóm rating với xác suất khác nhau
     * Reviews tích cực sẽ có xác suất cao hơn
     */
    private function getRandomRatingGroup($vietnameseReviews)
    {
        $random = rand(1, 100);
        
        if ($random <= 50) {
            // 50% cho 5 sao
            return $vietnameseReviews[0];
        } elseif ($random <= 80) {
            // 30% cho 4 sao
            return $vietnameseReviews[1];
        } elseif ($random <= 95) {
            // 15% cho 3 sao
            return $vietnameseReviews[2];
        } else {
            // 5% cho 2 sao
            return $vietnameseReviews[3];
        }
    }
}