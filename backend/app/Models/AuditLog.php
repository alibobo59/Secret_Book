<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'auditable_type',
        'auditable_id',
        'event',
        'old_values',
        'new_values',
        'user_id',
        'user_name',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the auditable model
     */
    public function auditable()
    {
        return $this->morphTo();
    }

    /**
     * Get formatted changes for display
     */
    public function getFormattedChangesAttribute()
    {
        $changes = [];
        
        if ($this->event === 'created') {
            foreach ($this->new_values ?? [] as $field => $value) {
                $changes[] = [
                    'field' => $field,
                    'old' => null,
                    'new' => $value,
                    'action' => 'created'
                ];
            }
        } elseif ($this->event === 'updated') {
            $oldValues = $this->old_values ?? [];
            $newValues = $this->new_values ?? [];
            
            foreach ($newValues as $field => $newValue) {
                $oldValue = $oldValues[$field] ?? null;
                if ($oldValue !== $newValue) {
                    $changes[] = [
                        'field' => $field,
                        'old' => $oldValue,
                        'new' => $newValue,
                        'action' => 'updated'
                    ];
                }
            }
        } elseif ($this->event === 'deleted') {
            foreach ($this->old_values ?? [] as $field => $value) {
                $changes[] = [
                    'field' => $field,
                    'old' => $value,
                    'new' => null,
                    'action' => 'deleted'
                ];
            }
        }
        
        return $changes;
    }

    /**
     * Scope to filter by auditable type
     */
    public function scopeForModel($query, $modelType)
    {
        return $query->where('auditable_type', $modelType);
    }

    /**
     * Scope to filter by event type
     */
    public function scopeForEvent($query, $event)
    {
        return $query->where('event', $event);
    }

    /**
     * Scope to filter by user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}