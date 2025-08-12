<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use App\Models\User;
use App\Models\Book;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lấy danh sách users và books
        $users = User::all();
        $books = Book::all();
        
        if ($users->isEmpty() || $books->isEmpty()) {
            $this->command->warn('Cần có users và books trước khi tạo orders!');
            return;
        }

        $orders = [
            [
                'user_id' => 1,
                'order_number' => 'ORD-2024-0001',
                'subtotal' => 530000,
                'tax' => 53000,
                'shipping' => 30000,
                'total' => 613000,
                'status' => 'delivered',
                'notes' => 'Giao hàng nhanh, khách hàng hài lòng',
                'payment_method' => 'vnpay',
                'payment_status' => 'completed',
                'payment_transaction_id' => 'VNP_' . time() . '_001',
                'payment_amount' => 613000,
                'payment_date' => now()->subDays(15),
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(15),
                'items' => [
                    ['book_id' => 1, 'quantity' => 1, 'price' => 250000],
                    ['book_id' => 2, 'quantity' => 1, 'price' => 280000]
                ],
                'address' => [
                    'name' => 'Nguyễn Văn An',
                    'address' => '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
                    'city' => 'Thành phố Hồ Chí Minh',
                    'phone' => '0901234567',
                    'email' => 'nguyenvanan@gmail.com'
                ]
            ],
            [
                'user_id' => 1,
                'order_number' => 'ORD-2024-0002',
                'subtotal' => 370000,
                'tax' => 37000,
                'shipping' => 25000,
                'total' => 432000,
                'status' => 'delivered',
                'notes' => 'Đóng gói cẩn thận, sách không bị hỏng',
                'payment_method' => 'vnpay',
                'payment_status' => 'completed',
                'payment_transaction_id' => 'VNP_' . time() . '_002',
                'payment_amount' => 432000,
                'payment_date' => now()->subDays(10),
                'created_at' => now()->subDays(12),
                'updated_at' => now()->subDays(10),
                'items' => [
                    ['book_id' => 4, 'quantity' => 1, 'price' => 370000]
                ],
                'address' => [
                    'name' => 'Nguyễn Văn An',
                    'address' => '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1',
                    'city' => 'Thành phố Hồ Chí Minh',
                    'phone' => '0901234567',
                    'email' => 'nguyenvanan@gmail.com'
                ]
            ],
            [
                'user_id' => 2,
                'order_number' => 'ORD-2024-0003',
                'subtotal' => 690000,
                'tax' => 69000,
                'shipping' => 35000,
                'total' => 794000,
                'status' => 'delivered',
                'notes' => 'Khách hàng yêu cầu giao vào buổi chiều',
                'payment_method' => 'bank_transfer',
                'payment_status' => 'completed',
                'payment_transaction_id' => 'BANK_' . time() . '_003',
                'payment_amount' => 794000,
                'payment_date' => now()->subDays(8),
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(8),
                'items' => [
                    ['book_id' => 5, 'quantity' => 1, 'price' => 460000],
                    ['book_id' => 6, 'quantity' => 1, 'price' => 230000]
                ],
                'address' => [
                    'name' => 'Trần Thị Bình',
                    'address' => '456 Đường Nguyễn Huệ, Phường Đa Kao, Quận 1',
                    'city' => 'Thành phố Hồ Chí Minh',
                    'phone' => '0912345678',
                    'email' => 'tranthibinh@gmail.com'
                ]
            ],
            [
                'user_id' => 3,
                'order_number' => 'ORD-2024-0004',
                'subtotal' => 630000,
                'tax' => 63000,
                'shipping' => 30000,
                'total' => 723000,
                'status' => 'delivered',
                'notes' => 'Giao hàng thành công, khách hàng thanh toán đúng hạn',
                'payment_method' => 'vnpay',
                'payment_status' => 'completed',
                'payment_transaction_id' => 'VNP_' . time() . '_004',
                'payment_amount' => 723000,
                'payment_date' => now()->subDays(5),
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(5),
                'items' => [
                    ['book_id' => 7, 'quantity' => 1, 'price' => 280000],
                    ['book_id' => 8, 'quantity' => 1, 'price' => 350000]
                ],
                'address' => [
                    'name' => 'Lê Văn Cường',
                    'address' => '789 Đường Pasteur, Phường Võ Thị Sáu, Quận 3',
                    'city' => 'Thành phố Hồ Chí Minh',
                    'phone' => '0923456789',
                    'email' => 'levancuong@gmail.com'
                ]
            ],
            [
                'user_id' => 4,
                'order_number' => 'ORD-2024-0005',
                'subtotal' => 480000,
                'tax' => 48000,
                'shipping' => 25000,
                'total' => 553000,
                'status' => 'processing',
                'notes' => 'Đơn hàng đang được chuẩn bị',
                'payment_method' => 'cod',
                'payment_status' => 'completed',
                'payment_transaction_id' => null,
                'payment_amount' => 553000,
                'payment_date' => now()->subDays(2),
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(1),
                'items' => [
                    ['book_id' => 1, 'quantity' => 1, 'price' => 250000],
                    ['book_id' => 6, 'quantity' => 1, 'price' => 230000]
                ],
                'address' => [
                    'name' => 'Phạm Thị Dung',
                    'address' => '321 Đường Cách Mạng Tháng 8, Phường 10, Quận 3',
                    'city' => 'Thành phố Hồ Chí Minh',
                    'phone' => '0934567890',
                    'email' => 'phamthidung@gmail.com'
                ]
            ]
        ];

        foreach ($orders as $orderData) {
            // Tạo order
            $order = Order::create([
                'user_id' => $orderData['user_id'],
                'order_number' => $orderData['order_number'],
                'subtotal' => $orderData['subtotal'],
                'tax' => $orderData['tax'],
                'shipping' => $orderData['shipping'],
                'total' => $orderData['total'],
                'status' => $orderData['status'],
                'notes' => $orderData['notes'],
                'payment_method' => $orderData['payment_method'],
                'payment_status' => $orderData['payment_status'],
                'payment_transaction_id' => $orderData['payment_transaction_id'],
                'payment_amount' => $orderData['payment_amount'],
                'payment_date' => $orderData['payment_date'],
                'created_at' => $orderData['created_at'],
                'updated_at' => $orderData['updated_at']
            ]);

            // Tạo order items
            foreach ($orderData['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'book_id' => $item['book_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ]);
            }

            // Tạo address
            Address::create([
                'order_id' => $order->id,
                'name' => $orderData['address']['name'],
                'address' => $orderData['address']['address'],
                'city' => $orderData['address']['city'],
                'phone' => $orderData['address']['phone'],
                'email' => $orderData['address']['email']
            ]);
        }

        $this->command->info('Đã tạo thành công ' . count($orders) . ' đơn hàng với các sản phẩm và địa chỉ tương ứng!');
    }
}