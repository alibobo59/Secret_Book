<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait Auditable
{
    /**
     * Boot the auditable trait for a model.
     */
    public static function bootAuditable()
    {
        static::created(function ($model) {
            $model->auditActivity('created');
        });

        static::updated(function ($model) {
            $model->auditActivity('updated');
        });

        static::deleted(function ($model) {
            $model->auditActivity('deleted');
        });
    }

    /**
     * Get all audit logs for this model
     */
    public function auditLogs()
    {
        return $this->morphMany(AuditLog::class, 'auditable')
                   ->orderBy('created_at', 'desc');
    }

    /**
     * Create an audit log entry
     */
    protected function auditActivity($event)
    {
        $user = Auth::user();
        $oldValues = null;
        $newValues = null;

        switch ($event) {
            case 'created':
                $newValues = $this->getAuditableAttributes();
                break;
            case 'updated':
                $oldValues = $this->getOriginal();
                $newValues = $this->getAttributes();
                
                // Only log if there are actual changes
                $changes = $this->getDirty();
                if (empty($changes)) {
                    return;
                }
                
                // Filter to only include changed values
                $oldValues = array_intersect_key($oldValues, $changes);
                $newValues = array_intersect_key($newValues, $changes);
                break;
            case 'deleted':
                $oldValues = $this->getAuditableAttributes();
                break;
        }

        // Remove sensitive fields
        $oldValues = $this->filterSensitiveFields($oldValues);
        $newValues = $this->filterSensitiveFields($newValues);

        AuditLog::create([
            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
            'event' => $event,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'user_id' => $user ? $user->id : null,
            'user_name' => $user ? $user->name : 'System',
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Get auditable attributes (override in model if needed)
     */
    protected function getAuditableAttributes()
    {
        $attributes = $this->getAttributes();
        return $this->filterSensitiveFields($attributes);
    }

    /**
     * Filter out sensitive fields from audit logs
     */
    protected function filterSensitiveFields($attributes)
    {
        if (!$attributes) {
            return $attributes;
        }

        $sensitiveFields = $this->getAuditExclude();
        
        return array_diff_key($attributes, array_flip($sensitiveFields));
    }

    /**
     * Get fields to exclude from audit (override in model if needed)
     */
    protected function getAuditExclude()
    {
        return [
            'password',
            'remember_token',
            'email_verified_at',
            'created_at',
            'updated_at'
        ];
    }

    /**
     * Get human-readable field names (override in model if needed)
     */
    public function getAuditFieldLabels()
    {
        return [];
    }

    /**
     * Get formatted field name for display
     */
    public function getFormattedFieldName($field)
    {
        $labels = $this->getAuditFieldLabels();
        return $labels[$field] ?? ucfirst(str_replace('_', ' ', $field));
    }
}