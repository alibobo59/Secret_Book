<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\Book;
use App\Models\BookVariation;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CancelExpiredVNPayOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-expired-vnpay {--dry-run : Chỉ hiển thị mà không cập nhật dữ liệu}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động huỷ các đơn hàng VNPay đã quá hạn thanh toán và khôi phục tồn kho';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = Carbon::now();
        $dryRun = (bool) $this->option('dry-run');

        $query = Order::with('items')
            ->where('payment_method', 'vnpay')
            ->whereIn('payment_status', ['pending', 'processing'])
            ->whereNotNull('payment_expires_at')
            ->where('payment_expires_at', '<', $now)
            ->where('status', '!=', 'cancelled');

        $total = $query->count();
        if ($total === 0) {
            $this->info('Không có đơn VNPay quá hạn cần huỷ.');
            return self::SUCCESS;
        }

        $this->info("Tìm thấy {$total} đơn VNPay quá hạn. Bắt đầu xử lý..." . ($dryRun ? ' (dry-run)' : ''));

        $cancelled = 0; $restoredItems = 0; $errors = 0;

        $query->orderBy('id')->chunk(100, function ($orders) use (&$cancelled, &$restoredItems, &$errors, $dryRun) {
            foreach ($orders as $order) {
                try {
                    // Khôi phục tồn kho nếu đơn chưa bị huỷ
                    if ($order->status !== 'cancelled') {
                        foreach ($order->items as $item) {
                            if ($item->variation_id) {
                                $variation = BookVariation::find($item->variation_id);
                                if ($variation) {
                                    if (!$dryRun) {
                                        $variation->increment('stock_quantity', $item->quantity);
                                    }
                                    $restoredItems += $item->quantity;
                                }
                            } else {
                                $book = Book::find($item->book_id);
                                if ($book) {
                                    if (!$dryRun) {
                                        $book->increment('stock_quantity', $item->quantity);
                                    }
                                    $restoredItems += $item->quantity;
                                }
                            }
                        }
                    }

                    if (!$dryRun) {
                        $order->update([
                            'payment_status' => 'failed',
                            'status' => 'cancelled',
                            'cancellation_reason' => 'VNPay quá hạn thanh toán',
                        ]);
                    }

                    $cancelled++;
                } catch (\Throwable $e) {
                    $errors++;
                    Log::error('Lỗi khi huỷ đơn VNPay quá hạn', [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'error' => $e->getMessage(),
                    ]);
                    $this->error("[Order #{$order->id}] Lỗi: " . $e->getMessage());
                }
            }
        });

        $this->info("Đã huỷ {$cancelled} đơn. Số lượng sản phẩm được khôi phục: {$restoredItems}. Lỗi: {$errors}.");

        return $errors === 0 ? self::SUCCESS : self::FAILURE;
    }
}