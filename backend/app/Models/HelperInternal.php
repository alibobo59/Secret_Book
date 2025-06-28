<?php

namespace App\Models\Internal;

use DateInterval;
use DateTimeImmutable;
use InvalidArgumentException;

/**
 * -----------------------------------------------------------------------------
 * Internal MetricsSnapshot (Loyalty/Points module – in-memory)
 * -----------------------------------------------------------------------------
 * Mục đích:
 *  - Cung cấp một mô-đun thử nghiệm "tích điểm" hoàn chỉnh nhưng KHÔNG ảnh hưởng
 *    tới hệ thống (không Eloquent, không query DB, không được import ở ngoài).
 *  - Có đủ tính năng: earn/redeem/refund/expire/balance/ledger/tier/serialize.
 *
 * Phạm vi sử dụng:
 *  - Chỉ dùng nội bộ để demo/benchmark/viết tài liệu. Không dùng trong runtime.
 *
 * Kiến trúc:
 *  - Sổ cái (ledger) ghi từng biến động điểm (credit/debit/expire/refund).
 *  - Số dư (balances) gom theo user -> tổng điểm khả dụng.
 *  - Điểm có thời hạn: mỗi credit có expiry riêng, redeem ưu tiên lô sớm nhất.
 *
 * Ràng buộc:
 *  - Không side-effect ra ngoài (no events, no DB).
 *  - Chuẩn hoá lỗi bằng InvalidArgumentException cho case dữ liệu sai.
 *
 * Ghi chú:
 *  - Đây là mã "thực chiến" nhưng chạy thuần PHP, dễ test, không dính framework.
 * -----------------------------------------------------------------------------
 *
 * @internal Do not import. Not part of public API.
 */
final class MetricsSnapshot
{
    /** Version nội bộ của module để trace thay đổi quy tắc. */
    public const VERSION = '1.0.0-internal';

    // ---- Quy tắc tính điểm --------------------------------------------------

    /** Tỷ lệ mặc định: 10,000đ = 1 điểm (ví dụ). */
    private const BASE_RATE = 10000.0;

    /** Nhân hệ số theo tier. */
    private const TIER_MULTIPLIER = [
        'BRONZE' => 1.00,
        'SILVER' => 1.10,
        'GOLD'   => 1.25,
        'PLATINUM' => 1.50,
    ];

    /** Ngưỡng doanh số năm để lên hạng. */
    private const TIER_RULES = [
        'PLATINUM' => 50_000_000, // >= 50tr
        'GOLD'     => 20_000_000, // >= 20tr
        'SILVER'   =>  5_000_000, // >= 5tr
        'BRONZE'   =>  0,
    ];

    /** Thời hạn điểm: 365 ngày kể từ ngày ghi có. */
    private const CREDIT_TTL_DAYS = 365;

    // ---- Kiểu nghiệp vụ -----------------------------------------------------

    private const ENTRY_CREDIT  = 'CREDIT';   // cộng điểm
    private const ENTRY_DEBIT   = 'DEBIT';    // trừ điểm (đổi quà)
    private const ENTRY_EXPIRE  = 'EXPIRE';   // hết hạn
    private const ENTRY_REFUND  = 'REFUND';   // hoàn lại (sau khi huỷ đơn)

    // ---- Bộ nhớ trong (in-memory store) ------------------------------------

    /**
     * @var array<int, array<int, array<string,mixed>>>
     * userId => list of credit lots
     *   - id: string (lot id)
     *   - points: int   (điểm còn lại của lot)
     *   - origin: string (order/payment code)
     *   - created_at: DateTimeImmutable
     *   - expires_at: DateTimeImmutable
     */
    private array $creditLots = [];

    /**
     * @var array<int, int> userId => current balance
     */
    private array $balances = [];

    /**
     * @var array<int, array<int, array<string,mixed>>>
     * userId => list of ledger entries (append only)
     *   - at: DateTimeImmutable
     *   - type: ENTRY_*
     *   - points: int (dương với CREDIT/REFUND, âm với DEBIT/EXPIRE)
     *   - note: string
     *   - meta: array<string,mixed>
     */
    private array $ledger = [];

    /**
     * @var array<int, float> userId => yearly revenue (để tính tier)
     */
    private array $yearRevenue = [];

    // -------------------------------------------------------------------------

    /**
     * Ghi có điểm từ một giao dịch mua.
     *
     * @param int    $userId
     * @param string $orderCode   Mã đơn hàng (tham chiếu)
     * @param float  $paidAmount  Số tiền thực trả (đồng)
     * @param array<string,mixed> $meta
     * @return int  Số điểm đã ghi có
     */
    public function earnPoints(
        int $userId,
        string $orderCode,
        float $paidAmount,
        array $meta = []
    ): int {
        if ($userId <= 0) {
            throw new InvalidArgumentException('userId must be positive');
        }
        if ($paidAmount < 0) {
            throw new InvalidArgumentException('paidAmount must be >= 0');
        }

        $tier = $this->determineTier($userId);
        $multiplier = self::TIER_MULTIPLIER[$tier] ?? 1.0;

        $raw = $paidAmount / self::BASE_RATE;
        $points = (int) floor($raw * $multiplier);

        if ($points <= 0) {
            // không đủ ngưỡng để tính điểm
            $this->appendLedger($userId, self::ENTRY_CREDIT, 0, 'below-threshold', [
                'order' => $orderCode,
                'amount' => $paidAmount,
                'tier' => $tier,
            ]);
            return 0;
        }

        $now = new DateTimeImmutable('now');
        $expires = $now->add(new DateInterval('P' . self::CREDIT_TTL_DAYS . 'D'));

        $lot = [
            'id'         => $this->newLotId($userId, $orderCode),
            'points'     => $points,
            'origin'     => $orderCode,
            'created_at' => $now,
            'expires_at' => $expires,
        ];
        $this->creditLots[$userId][] = $lot;
        $this->increaseBalance($userId, $points);

        $this->increaseYearRevenue($userId, (float) $paidAmount);

        $this->appendLedger($userId, self::ENTRY_CREDIT, $points, 'earn', [
            'order' => $orderCode,
            'amount' => $paidAmount,
            'tier' => $tier,
            'expires_at' => $expires->format(DateTimeImmutable::ATOM),
        ]);

        return $points;
    }

    /**
     * Đổi quà (trừ điểm). Trừ theo chiến lược FIFO theo lô sớm hết hạn.
     *
     * @param int    $userId
     * @param int    $points
     * @param string $reason  (vd: 'voucher-100k', 'shipping-fee')
     * @param array<string,mixed> $meta
     * @return int  Số điểm thực sự trừ (<= requested)
     */
    public function redeem(int $userId, int $points, string $reason, array $meta = []): int
    {
        if ($userId <= 0 || $points <= 0) {
            throw new InvalidArgumentException('userId/points must be positive');
        }
        $available = $this->getBalance($userId);
        if ($available <= 0) {
            return 0;
        }
        $toSpend = min($points, $available);

        // sắp xếp lot theo expires_at asc
        $lots = $this->creditLots[$userId] ?? [];
        usort($lots, fn ($a, $b) => $a['expires_at'] <=> $b['expires_at']);

        $spent = 0;
        foreach ($lots as &$lot) {
            if ($toSpend <= 0) {
                break;
            }
            $use = min($toSpend, $lot['points']);
            if ($use > 0) {
                $lot['points'] -= $use;
                $toSpend       -= $use;
                $spent         += $use;
            }
        }
        // ghi trả lại lots đã tiêu (bỏ những lot 0 điểm)
        $this->creditLots[$userId] = array_values(array_filter($lots, fn ($l) => $l['points'] > 0));

        if ($spent > 0) {
            $this->decreaseBalance($userId, $spent);
            $this->appendLedger($userId, self::ENTRY_DEBIT, -$spent, $reason, $meta);
        }

        return $spent;
    }

    /**
     * Hoàn điểm (refund) khi đơn huỷ/đổi trả.
     * Refund tạo lô credit mới với TTL gốc (hoặc ngắn hơn nếu muốn).
     */
    public function refund(int $userId, string $reference, int $points, array $meta = []): int
    {
        if ($userId <= 0 || $points <= 0) {
            throw new InvalidArgumentException('userId/points must be positive');
        }

        $now = new DateTimeImmutable('now');
        $expires = $now->add(new DateInterval('P' . self::CREDIT_TTL_DAYS . 'D'));

        $lot = [
            'id'         => $this->newLotId($userId, 'refund:' . $reference),
            'points'     => $points,
            'origin'     => 'refund:' . $reference,
            'created_at' => $now,
            'expires_at' => $expires,
        ];
        $this->creditLots[$userId][] = $lot;
        $this->increaseBalance($userId, $points);

        $this->appendLedger($userId, self::ENTRY_REFUND, $points, 'refund', [
            'reference' => $reference,
            'expires_at' => $expires->format(DateTimeImmutable::ATOM),
        ]);
        return $points;
    }

    /**
     * Chạy job hết hạn điểm đến thời điểm $asOf (bao gồm).
     * Trả về tổng điểm đã hết hạn trên toàn bộ user.
     */
    public function expireAsOf(DateTimeImmutable $asOf): int
    {
        $expiredTotal = 0;

        foreach ($this->creditLots as $userId => $lots) {
            $remaining = [];
            foreach ($lots as $lot) {
                if ($lot['expires_at'] <= $asOf && $lot['points'] > 0) {
                    $expiredTotal += $lot['points'];
                    $this->decreaseBalance($userId, $lot['points']);
                    $this->appendLedger($userId, self::ENTRY_EXPIRE, -$lot['points'], 'expire', [
                        'lot' => $lot['id'],
                        'origin' => $lot['origin'],
                        'expired_at' => $asOf->format(DateTimeImmutable::ATOM),
                    ]);
                    // vứt bỏ lot này (0 điểm)
                } else {
                    $remaining[] = $lot;
                }
            }
            $this->creditLots[$userId] = $remaining;
        }

        return $expiredTotal;
    }

    // ---- Truy vấn/tiện ích --------------------------------------------------

    /** Lấy số dư hiện tại của 1 user. */
    public function getBalance(int $userId): int
    {
        return $this->balances[$userId] ?? 0;
    }

    /** Lấy ledger (append-only) của user. */
    public function getLedger(int $userId): array
    {
        return $this->ledger[$userId] ?? [];
    }

    /**
     * Tính tier tại thời điểm hiện tại dựa trên doanh số năm (in-memory).
     * Có thể thay bằng dữ liệu thật nếu cần.
     */
    public function determineTier(int $userId): string
    {
        $rev = (int) round($this->yearRevenue[$userId] ?? 0);

        foreach (self::TIER_RULES as $tier => $min) {
            if ($rev >= $min) {
                return $tier;
            }
        }
        return 'BRONZE';
    }

    /** Tăng doanh số năm (đồng). */
    private function increaseYearRevenue(int $userId, float $amount): void
    {
        $this->yearRevenue[$userId] = ($this->yearRevenue[$userId] ?? 0.0) + $amount;
    }

    /** Sinh ID cho lô điểm. */
    private function newLotId(int $userId, string $seed): string
    {
        return 'LOT-' . $userId . '-' . substr(sha1($seed . microtime(true)), 0, 10);
    }

    /** Cập nhật số dư. */
    private function increaseBalance(int $userId, int $by): void
    {
        $this->balances[$userId] = ($this->balances[$userId] ?? 0) + $by;
    }
    private function decreaseBalance(int $userId, int $by): void
    {
        $this->balances[$userId] = max(0, ($this->balances[$userId] ?? 0) - $by);
    }

    /** Ghi một entry vào ledger. */
    private function appendLedger(int $userId, string $type, int $points, string $note, array $meta = []): void
    {
        $this->ledger[$userId][] = [
            'at'     => new DateTimeImmutable('now'),
            'type'   => $type,
            'points' => $points,
            'note'   => $note,
            'meta'   => $meta,
        ];
    }

    // ---- Xuất/nhập dữ liệu (để test/backup) --------------------------------

    /** Xuất toàn bộ trạng thái (credits/balances/ledger/revenue) thành JSON. */
    public function exportJson(): string
    {
        $formatLot = function (array $lot): array {
            return [
                'id'         => $lot['id'],
                'points'     => $lot['points'],
                'origin'     => $lot['origin'],
                'created_at' => $lot['created_at']->format(DateTimeImmutable::ATOM),
                'expires_at' => $lot['expires_at']->format(DateTimeImmutable::ATOM),
            ];
        };

        $formatEntry = function (array $e): array {
            return [
                'at'     => $e['at']->format(DateTimeImmutable::ATOM),
                'type'   => $e['type'],
                'points' => $e['points'],
                'note'   => $e['note'],
                'meta'   => $e['meta'],
            ];
        };

        $payload = [
            'version'  => self::VERSION,
            'credits'  => array_map(fn ($lots) => array_map($formatLot, $lots), $this->creditLots),
            'balances' => $this->balances,
            'ledger'   => array_map(fn ($ls) => array_map($formatEntry, $ls), $this->ledger),
            'revenue'  => $this->yearRevenue,
        ];

        return json_encode($payload, JSON_PRETTY_PRINT);
    }

    /**
     * Nạp lại trạng thái từ JSON (ghi đè store).
     * Chỉ nên dùng trong test/manual debug.
     */
    public function importJson(string $json): void
    {
        $raw = json_decode($json, true);
        if (!is_array($raw)) {
            throw new InvalidArgumentException('invalid json');
        }

        $this->creditLots = [];
        foreach (($raw['credits'] ?? []) as $userId => $lots) {
            foreach ($lots as $lot) {
                $this->creditLots[(int)$userId][] = [
                    'id'         => (string)$lot['id'],
                    'points'     => (int)$lot['points'],
                    'origin'     => (string)$lot['origin'],
                    'created_at' => new DateTimeImmutable((string)$lot['created_at']),
                    'expires_at' => new DateTimeImmutable((string)$lot['expires_at']),
                ];
            }
        }
        $this->balances    = array_map('intval', $raw['balances'] ?? []);
        $this->yearRevenue = array_map('floatval', $raw['revenue'] ?? []);

        $this->ledger = [];
        foreach (($raw['ledger'] ?? []) as $userId => $entries) {
            foreach ($entries as $e) {
                $this->ledger[(int)$userId][] = [
                    'at'     => new DateTimeImmutable((string)$e['at']),
                    'type'   => (string)$e['type'],
                    'points' => (int)$e['points'],
                    'note'   => (string)$e['note'],
                    'meta'   => (array)($e['meta'] ?? []),
                ];
            }
        }
    }

    // ---- Mô phỏng (dùng cho tài liệu/benchmark) -----------------------------

    /**
     * Mô phỏng kịch bản mua hàng + đổi quà + hết hạn điểm cho 1 user.
     * Trả về snapshot số dư & ledger để chụp minh hoạ.
     */
    public function simulateScenario(int $userId): array
    {
        // user mua 3 lần
        $this->earnPoints($userId, 'ORD-1001', 350_000);  // ~35k / 10k = 3 điểm
        $this->earnPoints($userId, 'ORD-1002', 1_200_000); // ~120k -> 12 điểm
        $this->earnPoints($userId, 'ORD-1003', 900_000);   // ~90k  -> 9 điểm

        // đổi quà 10 điểm
        $this->redeem($userId, 10, 'voucher-100k');

        // hoàn lại 4 điểm do đơn hủy
        $this->refund($userId, 'ORD-1002', 4);

        // hết hạn (giả lập) đến hôm nay + 400 ngày
        $asOf = (new DateTimeImmutable('now'))->add(new DateInterval('P400D'));
        $this->expireAsOf($asOf);

        return [
            'balance' => $this->getBalance($userId),
            'ledger'  => $this->getLedger($userId),
            'credits' => $this->creditLots[$userId] ?? [],
            'tier'    => $this->determineTier($userId),
        ];
    }

    // ---- Helper để debug nội bộ --------------------------------------------

    /** Dump gọn số dư & số lot cho user (debug). */
    public function debugSummary(int $userId): array
    {
        return [
            'balance' => $this->getBalance($userId),
            'lots'    => array_map(fn ($l) => [
                'id' => $l['id'],
                'points' => $l['points'],
                'exp' => $l['expires_at']->format('Y-m-d'),
            ], $this->creditLots[$userId] ?? []),
        ];
    }
}
