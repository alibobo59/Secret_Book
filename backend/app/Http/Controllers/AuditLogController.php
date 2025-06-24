<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    /**
     * Get audit logs for a specific model
     */
    public function getModelAuditLogs(Request $request, $modelType, $modelId): JsonResponse
    {
        $query = AuditLog::where('auditable_type', $modelType)
                         ->where('auditable_id', $modelId)
                         ->with('user:id,name')
                         ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('event') && $request->event) {
            $query->where('event', $request->event);
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $auditLogs = $query->paginate($perPage);

        // Transform the data for frontend consumption
        $auditLogs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'event' => $log->event,
                'user_name' => $log->user_name,
                'user_id' => $log->user_id,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at' => $log->created_at,
                'formatted_changes' => $log->formatted_changes,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
            ];
        });

        return response()->json($auditLogs);
    }

    /**
     * Get all audit logs with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with('user:id,name')
                         ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->has('auditable_type') && $request->auditable_type) {
            $query->where('auditable_type', $request->auditable_type);
        }

        if ($request->has('event') && $request->event) {
            $query->where('event', $request->event);
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%")
                  ->orWhere('auditable_type', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $auditLogs = $query->paginate($perPage);

        // Transform the data
        $auditLogs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'auditable_type' => $log->auditable_type,
                'auditable_id' => $log->auditable_id,
                'event' => $log->event,
                'user_name' => $log->user_name,
                'user_id' => $log->user_id,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at' => $log->created_at,
                'formatted_changes' => $log->formatted_changes,
            ];
        });

        return response()->json($auditLogs);
    }

    /**
     * Get audit log statistics
     */
    public function getStats(Request $request): JsonResponse
    {
        $stats = [
            'total_logs' => AuditLog::count(),
            'events' => AuditLog::selectRaw('event, COUNT(*) as count')
                               ->groupBy('event')
                               ->pluck('count', 'event'),
            'models' => AuditLog::selectRaw('auditable_type, COUNT(*) as count')
                               ->groupBy('auditable_type')
                               ->pluck('count', 'auditable_type'),
            'recent_activity' => AuditLog::whereDate('created_at', '>=', now()->subDays(7))
                                        ->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Export audit logs to CSV
     */
    public function export(Request $request)
    {
        $query = AuditLog::with('user:id,name')
                         ->orderBy('created_at', 'desc');

        // Apply same filters as index method
        if ($request->has('auditable_type') && $request->auditable_type) {
            $query->where('auditable_type', $request->auditable_type);
        }

        if ($request->has('event') && $request->event) {
            $query->where('event', $request->event);
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $auditLogs = $query->get();

        $filename = 'audit_logs_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($auditLogs) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'ID',
                'Model Type',
                'Model ID',
                'Event',
                'User',
                'IP Address',
                'Date',
                'Changes'
            ]);

            foreach ($auditLogs as $log) {
                $changes = '';
                foreach ($log->formatted_changes as $change) {
                    $changes .= $change['field'] . ': ' . ($change['old'] ?? 'null') . ' → ' . ($change['new'] ?? 'null') . '; ';
                }
                
                fputcsv($file, [
                    $log->id,
                    $log->auditable_type,
                    $log->auditable_id,
                    $log->event,
                    $log->user_name,
                    $log->ip_address,
                    $log->created_at->format('Y-m-d H:i:s'),
                    rtrim($changes, '; ')
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}