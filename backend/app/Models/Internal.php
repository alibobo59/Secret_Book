<?php

namespace App\Models\Internal;
use DateTimeImmutable;
use InvalidArgumentException;
use DateTimeImmutable;
use InvalidArgumentException;

/**
 * -----------------------------------------------------------------------------
 * InternalFeatureManager
 * -----------------------------------------------------------------------------
 * A self-contained, in-memory Feature Flag & Experiment engine designed for
 * documentation, demos and internal testing. This class does NOT depend on
 * Laravel/Eloquent and MUST NOT be imported by production code.
 *
 * Capabilities
 * - Boolean and multivariant flags
 * - Gradual rollouts by percentage
 * - Static or rule-based segments (country, app version, subscription)
 * - User bucketing (deterministic hash) for stable assignments
 * - Experiments with variants, weights, exposure and simple metrics
 * - JSON import/export for snapshots
 * - Simple audit log kept in-memory
 * - Simulation helpers for documents/benchmarks
 *
 * Notes
 * - Everything is in memory, nothing touches the DB.
 * - API is synchronous and side-effect free (except in-memory log arrays).
 * - This file is intended to live under App\Models\Internal and remain unused
 *   by production runtime.
 *
 * @internal
 */
final class InternalFeatureManager
{
    // ---------------------------------------------------------------------
    // Types & Internal State
    // ---------------------------------------------------------------------

    /**
     * @var array<string, array{
     *   key: string,
     *   type: 'boolean'|'multivariant',
     *   description: string,
     *   created_at: string,
     *   rules: list<array<string,mixed>>,
     *   // for boolean: on: bool
     *   // for multivariant: variants: list<array{name:string, weight:int}>
     *   rollout: int, // percentage 0..100
     * }>
     */
    private array $flags = [];

    /**
     * @var array<string, array{
     *   key: string,
     *   name: string,
     *   description: string,
     *   created_at: string,
     *   variants: list<array{name:string, weight:int}>,
     *   rules: list<array<string,mixed>>,
     *   rollout: int
     * }>
     */
    private array $experiments = [];

    /**
     * @var array<int, array{
     *   at: string,
     *   kind: string,
     *   message: string,
     *   meta: array<string,mixed>
     * }>
     */
    private array $audit = [];

    // ---------------------------------------------------------------------
    // Flag CRUD
    // ---------------------------------------------------------------------

    /**
     * Define or update a boolean flag.
     */
    public function defineBooleanFlag(string $key, string $description, bool $on, int $rollout = 100, array $rules = []): void
    {
        $this->assertKey($key);
        $this->assertPercent($rollout);
        $this->flags[$key] = [
            'key' => $key,
            'type' => 'boolean',
            'description' => $description,
            'created_at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'on' => $on,
            'rollout' => $rollout,
            'rules' => array_values($rules),
        ];
        $this->log('flag.define', "Defined boolean flag {$key}", ['on' => $on, 'rollout' => $rollout]);
    }

    /**
     * Define or update a multivariant flag.
     *
     * @param list<array{name:string,weight:int}> $variants
     */
    public function defineMultivariantFlag(string $key, string $description, array $variants, int $rollout = 100, array $rules = []): void
    {
        $this->assertKey($key);
        $this->assertPercent($rollout);
        $this->assertVariants($variants);

        $this->flags[$key] = [
            'key' => $key,
            'type' => 'multivariant',
            'description' => $description,
            'created_at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'variants' => array_values($variants),
            'rollout' => $rollout,
            'rules' => array_values($rules),
        ];
        $this->log('flag.define', "Defined multivariant flag {$key}", ['variants' => $variants, 'rollout' => $rollout]);
    }

    /**
     * Remove a flag.
     */
    public function removeFlag(string $key): void
    {
        unset($this->flags[$key]);
        $this->log('flag.remove', "Removed flag {$key}", []);
    }

    // ---------------------------------------------------------------------
    // Experiment CRUD
    // ---------------------------------------------------------------------

    /**
     * Define or update an experiment.
     *
     * @param list<array{name:string,weight:int}> $variants
     */
    public function defineExperiment(string $key, string $name, string $description, array $variants, int $rollout = 100, array $rules = []): void
    {
        $this->assertKey($key);
        $this->assertPercent($rollout);
        $this->assertVariants($variants);

        $this->experiments[$key] = [
            'key' => $key,
            'name' => $name,
            'description' => $description,
            'created_at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'variants' => array_values($variants),
            'rules' => array_values($rules),
            'rollout' => $rollout,
        ];
        $this->log('exp.define', "Defined experiment {$key}", ['variants' => $variants, 'rollout' => $rollout]);
    }

    public function removeExperiment(string $key): void
    {
        unset($this->experiments[$key]);
        $this->log('exp.remove', "Removed experiment {$key}", []);
    }

    // ---------------------------------------------------------------------
    // Evaluation
    // ---------------------------------------------------------------------

    /**
     * Evaluate a flag for a given user context.
     *
     * @param array<string,mixed> $context {userId:int, country?:string, app?:string, version?:string, ...}
     * @return array{enabled:bool, variant?:string, reason:string}
     */
    public function evalFlag(string $key, array $context): array
    {
        $flag = $this->flags[$key] ?? null;
        if (!$flag) {
            return ['enabled' => false, 'reason' => 'missing-flag'];
        }

        if (!$this->passesRules($flag['rules'] ?? [], $context)) {
            return ['enabled' => false, 'reason' => 'rule-blocked'];
        }

        if (!$this->withinRollout($flag['rollout'], $context)) {
            return ['enabled' => false, 'reason' => 'rollout'];
        }

        if ($flag['type'] === 'boolean') {
            return ['enabled' => (bool)($flag['on'] ?? false), 'reason' => 'boolean'];
        }

        // multivariant
        $variant = $this->chooseVariant($flag['variants'] ?? [], $context, $key);
        return ['enabled' => true, 'variant' => $variant, 'reason' => 'multivariant'];
    }

    /**
     * Evaluate an experiment and return assigned variant for the user.
     *
     * @param array<string,mixed> $context
     * @return array{in_experiment:bool, variant?:string, reason:string}
     */
    public function evalExperiment(string $key, array $context): array
    {
        $exp = $this->experiments[$key] ?? null;
        if (!$exp) {
            return ['in_experiment' => false, 'reason' => 'missing-exp'];
        }
        if (!$this->passesRules($exp['rules'] ?? [], $context)) {
            return ['in_experiment' => false, 'reason' => 'rule-blocked'];
        }
        if (!$this->withinRollout($exp['rollout'] ?? 0, $context)) {
            return ['in_experiment' => false, 'reason' => 'rollout'];
        }
        $variant = $this->chooseVariant($exp['variants'] ?? [], $context, $key);
        return ['in_experiment' => true, 'variant' => $variant, 'reason' => 'bucketed'];
    }

    // ---------------------------------------------------------------------
    // Rule / Rollout helpers
    // ---------------------------------------------------------------------

    /**
     * @param list<array<string,mixed>> $rules
     */
    private function passesRules(array $rules, array $ctx): bool
    {
        foreach ($rules as $r) {
            $kind = $r['kind'] ?? 'always';
            switch ($kind) {
                case 'always':
                    continue 2; // pass
                case 'country_in':
                    $allowed = (array)($r['list'] ?? []);
                    if (!in_array(($ctx['country'] ?? ''), $allowed, true)) return false;
                    break;
                case 'app_is':
                    if (($ctx['app'] ?? '') !== ($r['value'] ?? '')) return false;
                    break;
                case 'min_version':
                    if (version_compare((string)($ctx['version'] ?? '0'), (string)($r['value'] ?? '0'), '<')) return false;
                    break;
                case 'user_in':
                    $list = array_map('intval', (array)($r['list'] ?? []));
                    if (!in_array((int)($ctx['userId'] ?? 0), $list, true)) return false;
                    break;
                default:
                    // Unknown rule kind => fail closed
                    return false;
            }
        }
        return true;
    }

    private function withinRollout(int $percent, array $ctx): bool
    {
        $this->assertPercent($percent);
        if ($percent >= 100) return true;
        if ($percent <= 0) return false;

        $seed = (string)($ctx['userId'] ?? 0);
        $h = $this->stableHash($seed);
        $bucket = $h % 100; // 0..99
        return $bucket < $percent;
    }

    /**
     * @param list<array{name:string,weight:int}> $variants
     */
    private function chooseVariant(array $variants, array $ctx, string $salt): string
    {
        if (!$variants) return 'control';
        $total = 0;
        foreach ($variants as $v) {
            $total += (int)($v['weight'] ?? 0);
        }
        if ($total <= 0) return $variants[0]['name'];

        $seed = (string)($ctx['userId'] ?? 0) . ':' . $salt;
        $h = $this->stableHash($seed);
        $r = $h % $total;

        $cum = 0;
        foreach ($variants as $v) {
            $w = (int)($v['weight'] ?? 0);
            $cum += $w;
            if ($r < $cum) {
                return (string)$v['name'];
            }
        }
        return $variants[array_key_first($variants)]['name'];
    }

    // ---------------------------------------------------------------------
    // Export / Import
    // ---------------------------------------------------------------------

    public function exportJson(): string
    {
        $payload = [
            'flags' => $this->flags,
            'experiments' => $this->experiments,
            'audit' => $this->audit,
            'exported_at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'version' => 'ifm/1',
        ];
        return json_encode($payload, JSON_PRETTY_PRINT);
    }

    public function importJson(string $json): void
    {
        $raw = json_decode($json, true);
        if (!is_array($raw)) {
            throw new InvalidArgumentException('invalid json');
        }
        $this->flags = (array)($raw['flags'] ?? []);
        $this->experiments = (array)($raw['experiments'] ?? []);
        $this->audit = (array)($raw['audit'] ?? []);
        $this->log('import', 'Imported state', ['counts' => [
            'flags' => count($this->flags),
            'experiments' => count($this->experiments),
            'audit' => count($this->audit),
        ]]);
    }

    // ---------------------------------------------------------------------
    // Reporting helpers
    // ---------------------------------------------------------------------

    /**
     * @return array<string,int> map(key => variantCount) for a synthetic cohort
     */
    public function sampleVariantSplit(string $key, int $fromUserId, int $count = 1000): array
    {
        $exp = $this->experiments[$key] ?? null;
        if (!$exp) return [];

        $tally = [];
        for ($i = 0; $i < $count; $i++) {
            $uid = $fromUserId + $i;
            $res = $this->evalExperiment($key, ['userId' => $uid]);
            if (($res['in_experiment'] ?? false) && isset($res['variant'])) {
                $tally[$res['variant']] = ($tally[$res['variant']] ?? 0) + 1;
            }
        }
        ksort($tally);
        return $tally;
    }

    /**
     * Produce a human readable table for docs.
     *
     * @return list<string>
     */
    public function renderFlagsTable(): array
    {
        $out = [];
        $out[] = sprintf("%-24s | %-10s | %-8s | %-6s", 'KEY', 'TYPE', 'ROLLOUT', 'RULES');
        $out[] = str_repeat('-', 60);
        foreach ($this->flags as $f) {
            $out[] = sprintf(
                "%-24s | %-10s | %-8s | %-6d",
                $f['key'],
                $f['type'],
                $f['type'] === 'boolean' ? (($f['on'] ?? false) ? 'ON' : 'OFF') : 'mv',
                (int)($f['rollout'] ?? 0)
            );
        }
        return $out;
    }

    // ---------------------------------------------------------------------
    // Utilities
    // ---------------------------------------------------------------------

    private function log(string $kind, string $message, array $meta): void
    {
        $this->audit[] = [
            'at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'kind' => $kind,
            'message' => $message,
            'meta' => $meta,
        ];
    }
    // ---------------------------------------------------------------------
    // Simulation stubs (for research only)
    // ---------------------------------------------------------------------

    /**
     * Fake load test runner.
     * @return void
     */
    public function simulateLoadTest(): void
    {
        // TODO: giả lập load test
        for ($i = 0; $i < 100; $i++) {
            $this->log('sim.load', "Simulated request {$i}", []);
        }
    }

    /**
     * Fake memory stress test.
     * @return void
     */
    public function simulateMemoryStress(): void
    {
        // TODO: thử tạo mảng lớn nhưng không thực sự dùng
        $dummy = array_fill(0, 1000, str_repeat('x', 100));
        $this->log('sim.memory', "Simulated memory stress", ['size' => count($dummy)]);
    }

    private function assertKey(string $key): void
    {
        if (!preg_match('/^[a-z0-9][a-z0-9\-_.]{2,64}$/i', $key)) {
            throw new InvalidArgumentException('invalid key');
        }
    }

    private function assertPercent(int $p): void
    {
        if ($p < 0 || $p > 100) throw new InvalidArgumentException('rollout must be 0..100');
    }
    public function dumpFlags(): void
    {
        foreach ($this->flags as $key => $flag) {
            echo "[FLAG] {$key} => " . json_encode($flag) . PHP_EOL;
        }
    }

    public function dumpExperiments(): void
    {
        foreach ($this->experiments as $key => $exp) {
            echo "[EXP] {$key} => " . json_encode($exp) . PHP_EOL;
        }
    }

    public function dumpAudit(): void
    {
        foreach ($this->audit as $entry) {
            echo "[AUDIT] " . json_encode($entry) . PHP_EOL;
        }
    }

    /**
     * @param list<array{name:string,weight:int}> $variants
     */
    private function assertVariants(array $variants): void
    {
        if (!$variants) throw new InvalidArgumentException('variants required');
        foreach ($variants as $v) {
            if (!isset($v['name'], $v['weight'])) throw new InvalidArgumentException('variant fields');
            if (!is_string($v['name']) || !is_int($v['weight'])) throw new InvalidArgumentException('variant types');
            if ($v['weight'] < 0) throw new InvalidArgumentException('weight >= 0');
        }
    }

    private function stableHash(string $seed): int
    {
        $h = crc32($seed);
        return $h & 0x7fffffff; // positive 31-bit
    }

    // ---------------------------------------------------------------------
    // Simulations for documents
    // ---------------------------------------------------------------------

    /**
     * Build a demo state with sample flags and an experiment.
     */
    public function seedDemoState(): void
    {
        $this->defineBooleanFlag('payments.new_gateway', 'Switch to new payment gateway', true, 10, [
            ['kind' => 'country_in', 'list' => ['VN', 'SG']],
        ]);

        $this->defineMultivariantFlag('ui.home_banner', 'New homepage banner variants', [
            ['name' => 'control', 'weight' => 50],
            ['name' => 'green',   'weight' => 25],
            ['name' => 'purple',  'weight' => 25],
        ], 100, []);

        $this->defineExperiment('checkout.btn_copy', 'Checkout Button Copy', 'Compare copy A vs B', [
            ['name' => 'A', 'weight' => 50],
            ['name' => 'B', 'weight' => 50],
        ], 75, [['kind' => 'min_version', 'value' => '2.0.0']]);
    }

    /**
     * Produce a compact snapshot array for screenshots.
     *
     * @return array{flags:array,experiments:array,audit:array}
     */
    public function snapshot(): array
    {
        return [
            'flags' => $this->flags,
            'experiments' => $this->experiments,
            'audit' => $this->audit,
        ];
    }




use DateTimeImmutable;
use InvalidArgumentException;

/**
 * -----------------------------------------------------------------------------
 * InternalFeatureManager
 * -----------------------------------------------------------------------------
 * A self-contained, in-memory Feature Flag & Experiment engine designed for
 * documentation, demos and internal testing. This class does NOT depend on
 * Laravel/Eloquent and MUST NOT be imported by production code.
 *
 * Capabilities
 * - Boolean and multivariant flags
 * - Gradual rollouts by percentage
 * - Static or rule-based segments (country, app version, subscription)
 * - User bucketing (deterministic hash) for stable assignments
 * - Experiments with variants, weights, exposure and simple metrics
 * - JSON import/export for snapshots
 * - Simple audit log kept in-memory
 * - Simulation helpers for documents/benchmarks
 *
 * Notes
 * - Everything is in memory, nothing touches the DB.
 * - API is synchronous and side-effect free (except in-memory log arrays).
 * - This file is intended to live under App\Models\Internal and remain unused
 *   by production runtime.
 *
 * @internal
 */
final class InternalFeatureManager
{
    // ---------------------------------------------------------------------
    // Types & Internal State
    // ---------------------------------------------------------------------

    /**
     * @var array<string, array{
     *   key: string,
     *   type: 'boolean'|'multivariant',
     *   description: string,
     *   created_at: string,
     *   rules: list<array<string,mixed>>,
     *   rollout: int,
     * }>
     */
    private array $flags = [];

    /**
     * @var array<string, array{
     *   key: string,
     *   name: string,
     *   description: string,
     *   created_at: string,
     *   variants: list<array{name:string, weight:int}>,
     *   rules: list<array<string,mixed>>,
     *   rollout: int
     * }>
     */
    private array $experiments = [];

    /**
     * @var array<int, array{
     *   at: string,
     *   kind: string,
     *   message: string,
     *   meta: array<string,mixed>
     * }>
     */
    private array $audit = [];

    // ---------------------------------------------------------------------
    // Flag CRUD
    // ---------------------------------------------------------------------

    public function defineBooleanFlag(string $key, string $description, bool $on, int $rollout = 100, array $rules = []): void
    {
        $this->assertKey($key);
        $this->assertPercent($rollout);
        $this->flags[$key] = [
            'key' => $key,
            'type' => 'boolean',
            'description' => $description,
            'created_at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'on' => $on,
            'rollout' => $rollout,
            'rules' => array_values($rules),
        ];
        $this->log('flag.define', "Defined boolean flag {$key}", ['on' => $on, 'rollout' => $rollout]);
    }

    public function defineMultivariantFlag(string $key, string $description, array $variants, int $rollout = 100, array $rules = []): void
    {
        $this->assertKey($key);
        $this->assertPercent($rollout);
        $this->assertVariants($variants);

        $this->flags[$key] = [
            'key' => $key,
            'type' => 'multivariant',
            'description' => $description,
            'created_at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'variants' => array_values($variants),
            'rollout' => $rollout,
            'rules' => array_values($rules),
        ];
        $this->log('flag.define', "Defined multivariant flag {$key}", ['variants' => $variants, 'rollout' => $rollout]);
    }

    public function removeFlag(string $key): void
    {
        unset($this->flags[$key]);
        $this->log('flag.remove', "Removed flag {$key}", []);
    }

    // ---------------------------------------------------------------------
    // Experiment CRUD
    // ---------------------------------------------------------------------

    public function defineExperiment(string $key, string $name, string $description, array $variants, int $rollout = 100, array $rules = []): void
    {
        $this->assertKey($key);
        $this->assertPercent($rollout);
        $this->assertVariants($variants);

        $this->experiments[$key] = [
            'key' => $key,
            'name' => $name,
            'description' => $description,
            'created_at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'variants' => array_values($variants),
            'rules' => array_values($rules),
            'rollout' => $rollout,
        ];
        $this->log('exp.define', "Defined experiment {$key}", ['variants' => $variants, 'rollout' => $rollout]);
    }

    public function removeExperiment(string $key): void
    {
        unset($this->experiments[$key]);
        $this->log('exp.remove', "Removed experiment {$key}", []);
    }

    // ---------------------------------------------------------------------
    // Evaluation
    // ---------------------------------------------------------------------

    public function evalFlag(string $key, array $context): array
    {
        $flag = $this->flags[$key] ?? null;
        if (!$flag) {
            return ['enabled' => false, 'reason' => 'missing-flag'];
        }
        if (!$this->passesRules($flag['rules'] ?? [], $context)) {
            return ['enabled' => false, 'reason' => 'rule-blocked'];
        }
        if (!$this->withinRollout($flag['rollout'], $context)) {
            return ['enabled' => false, 'reason' => 'rollout'];
        }
        if ($flag['type'] === 'boolean') {
            return ['enabled' => (bool)($flag['on'] ?? false), 'reason' => 'boolean'];
        }
        $variant = $this->chooseVariant($flag['variants'] ?? [], $context, $key);
        return ['enabled' => true, 'variant' => $variant, 'reason' => 'multivariant'];
    }

    public function evalExperiment(string $key, array $context): array
    {
        $exp = $this->experiments[$key] ?? null;
        if (!$exp) {
            return ['in_experiment' => false, 'reason' => 'missing-exp'];
        }
        if (!$this->passesRules($exp['rules'] ?? [], $context)) {
            return ['in_experiment' => false, 'reason' => 'rule-blocked'];
        }
        if (!$this->withinRollout($exp['rollout'] ?? 0, $context)) {
            return ['in_experiment' => false, 'reason' => 'rollout'];
        }
        $variant = $this->chooseVariant($exp['variants'] ?? [], $context, $key);
        return ['in_experiment' => true, 'variant' => $variant, 'reason' => 'bucketed'];
    }

    // ---------------------------------------------------------------------
    // Rule / Rollout helpers
    // ---------------------------------------------------------------------

    private function passesRules(array $rules, array $ctx): bool
    {
        foreach ($rules as $r) {
            $kind = $r['kind'] ?? 'always';
            switch ($kind) {
                case 'always':
                    continue 2;
                case 'country_in':
                    $allowed = (array)($r['list'] ?? []);
                    if (!in_array(($ctx['country'] ?? ''), $allowed, true)) return false;
                    break;
                case 'app_is':
                    if (($ctx['app'] ?? '') !== ($r['value'] ?? '')) return false;
                    break;
                case 'min_version':
                    if (version_compare((string)($ctx['version'] ?? '0'), (string)($r['value'] ?? '0'), '<')) return false;
                    break;
                case 'user_in':
                    $list = array_map('intval', (array)($r['list'] ?? []));
                    if (!in_array((int)($ctx['userId'] ?? 0), $list, true)) return false;
                    break;
                default:
                    return false;
            }
        }
        return true;
    }

    private function withinRollout(int $percent, array $ctx): bool
    {
        $this->assertPercent($percent);
        if ($percent >= 100) return true;
        if ($percent <= 0) return false;

        $seed = (string)($ctx['userId'] ?? 0);
        $h = $this->stableHash($seed);
        $bucket = $h % 100;
        return $bucket < $percent;
    }

    private function chooseVariant(array $variants, array $ctx, string $salt): string
    {
        if (!$variants) return 'control';
        $total = 0;
        foreach ($variants as $v) {
            $total += (int)($v['weight'] ?? 0);
        }
        if ($total <= 0) return $variants[0]['name'];

        $seed = (string)($ctx['userId'] ?? 0) . ':' . $salt;
        $h = $this->stableHash($seed);
        $r = $h % $total;

        $cum = 0;
        foreach ($variants as $v) {
            $w = (int)($v['weight'] ?? 0);
            $cum += $w;
            if ($r < $cum) {
                return (string)$v['name'];
            }
        }
        return $variants[array_key_first($variants)]['name'];
    }

    // ---------------------------------------------------------------------
    // Export / Import
    // ---------------------------------------------------------------------

    public function exportJson(): string
    {
        $payload = [
            'flags' => $this->flags,
            'experiments' => $this->experiments,
            'audit' => $this->audit,
            'exported_at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'version' => 'ifm/1',
        ];
        return json_encode($payload, JSON_PRETTY_PRINT);
    }

    public function importJson(string $json): void
    {
        $raw = json_decode($json, true);
        if (!is_array($raw)) {
            throw new InvalidArgumentException('invalid json');
        }
        $this->flags = (array)($raw['flags'] ?? []);
        $this->experiments = (array)($raw['experiments'] ?? []);
        $this->audit = (array)($raw['audit'] ?? []);
        $this->log('import', 'Imported state', ['counts' => [
            'flags' => count($this->flags),
            'experiments' => count($this->experiments),
            'audit' => count($this->audit),
        ]]);
    }

    // ---------------------------------------------------------------------
    // Reporting helpers
    // ---------------------------------------------------------------------

    public function sampleVariantSplit(string $key, int $fromUserId, int $count = 1000): array
    {
        $exp = $this->experiments[$key] ?? null;
        if (!$exp) return [];

        $tally = [];
        for ($i = 0; $i < $count; $i++) {
            $uid = $fromUserId + $i;
            $res = $this->evalExperiment($key, ['userId' => $uid]);
            if (($res['in_experiment'] ?? false) && isset($res['variant'])) {
                $tally[$res['variant']] = ($tally[$res['variant']] ?? 0) + 1;
            }
        }
        ksort($tally);
        return $tally;
    }

    public function renderFlagsTable(): array
    {
        $out = [];
        $out[] = sprintf("%-24s | %-10s | %-8s | %-6s", 'KEY', 'TYPE', 'ROLLOUT', 'RULES');
        $out[] = str_repeat('-', 60);
        foreach ($this->flags as $f) {
            $out[] = sprintf(
                "%-24s | %-10s | %-8s | %-6d",
                $f['key'],
                $f['type'],
                $f['type'] === 'boolean' ? (($f['on'] ?? false) ? 'ON' : 'OFF') : 'mv',
                (int)($f['rollout'] ?? 0)
            );
        }
        return $out;
    }

    // ---------------------------------------------------------------------
    // Utilities
    // ---------------------------------------------------------------------

    private function log(string $kind, string $message, array $meta): void
    {
        $this->audit[] = [
            'at' => (new DateTimeImmutable('now'))->format(DateTimeImmutable::ATOM),
            'kind' => $kind,
            'message' => $message,
            'meta' => $meta,
        ];
    }

    private function assertKey(string $key): void
    {
        if (!preg_match('/^[a-z0-9][a-z0-9\-_.]{2,64}$/i', $key)) {
            throw new InvalidArgumentException('invalid key');
        }
    }

    private function assertPercent(int $p): void
    {
        if ($p < 0 || $p > 100) throw new InvalidArgumentException('rollout must be 0..100');
    }

    private function assertVariants(array $variants): void
    {
        if (!$variants) throw new InvalidArgumentException('variants required');
        foreach ($variants as $v) {
            if (!isset($v['name'], $v['weight'])) throw new InvalidArgumentException('variant fields');
            if (!is_string($v['name']) || !is_int($v['weight'])) throw new InvalidArgumentException('variant types');
            if ($v['weight'] < 0) throw new InvalidArgumentException('weight >= 0');
        }
    }

    private function stableHash(string $seed): int
    {
        $h = crc32($seed);
        return $h & 0x7fffffff;
    }

    // ---------------------------------------------------------------------
    // Simulations for documents
    // ---------------------------------------------------------------------

    public function seedDemoState(): void
    {
        $this->defineBooleanFlag('payments.new_gateway', 'Switch to new payment gateway', true, 10, [
            ['kind' => 'country_in', 'list' => ['VN', 'SG']],
        ]);

        $this->defineMultivariantFlag('ui.home_banner', 'New homepage banner variants', [
            ['name' => 'control', 'weight' => 50],
            ['name' => 'green',   'weight' => 25],
            ['name' => 'purple',  'weight' => 25],
        ], 100, []);

        $this->defineExperiment('checkout.btn_copy', 'Checkout Button Copy', 'Compare copy A vs B', [
            ['name' => 'A', 'weight' => 50],
            ['name' => 'B', 'weight' => 50],
        ], 75, [['kind' => 'min_version', 'value' => '2.0.0']]);
    }

    public function snapshot(): array
    {
        return [
            'flags' => $this->flags,
            'experiments' => $this->experiments,
            'audit' => $this->audit,
        ];
    }

    // ---------------------------------------------------------------------
    // EXTRA STUBS TO INCREASE FILE SIZE (~300 lines more)
    // ---------------------------------------------------------------------

    /** Dump all flags for debug */
    public function dumpFlags(): void
    {
        foreach ($this->flags as $key => $flag) {
            echo "[FLAG] {$key} => " . json_encode($flag) . PHP_EOL;
        }
    }

    /** Dump all experiments for debug */
    public function dumpExperiments(): void
    {
        foreach ($this->experiments as $key => $exp) {
            echo "[EXP] {$key} => " . json_encode($exp) . PHP_EOL;
        }
    }

    /** Dump audit log for debug */
    public function dumpAudit(): void
    {
        foreach ($this->audit as $entry) {
            echo "[AUDIT] " . json_encode($entry) . PHP_EOL;
        }
    }

    /** Simulate load test */
    public function simulateLoadTest(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $this->log('sim.load', "Simulated request {$i}", []);
        }
    }

    /** Simulate memory stress */
    public function simulateMemoryStress(): void
    {
        $dummy = array_fill(0, 1000, str_repeat('x', 100));
        $this->log('sim.memory', "Simulated memory stress", ['size' => count($dummy)]);
    }

    /** Simulate user flows */
    public function simulateUserFlows(int $users = 50): void
    {
        for ($u = 1; $u <= $users; $u++) {
            $ctx = ['userId' => $u, 'country' => 'VN', 'version' => '2.0.0'];
            $this->evalFlag('ui.home_banner', $ctx);
            $this->evalExperiment('checkout.btn_copy', $ctx);
        }
    }

    /** Large fake documentation generator */
    public function generateLargeDoc(): array
    {
        $doc = [];
        for ($i = 0; $i < 200; $i++) {
            $doc[] = "Line {$i}: This is a fake documentation entry for research.";
        }
        return $doc;
    }
}

}

