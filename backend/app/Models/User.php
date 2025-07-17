<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the reviews for the user
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Get the orders for the user
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Check if user purchased a specific book
     *
     * @param int $bookId
     * @return bool
     */
    public function hasPurchased(int $bookId): bool
    {
        return $this->orders()
            ->where('status', 'delivered')
            ->whereHas('items', function($query) use ($bookId) {
                $query->where('book_id', $bookId);
            })
            ->exists();
    }

    /**
     * Get human-readable field names for audit logs
     */
    public function getAuditFieldLabels()
    {
        return [
            'name' => 'Name',
            'email' => 'Email',
            'role' => 'Role',
        ];
    }

    /**
     * Get fields to exclude from audit (sensitive fields)
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

    // Add this method to the User model
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    public function getOrCreateCart()
    {
        return $this->cart ?: $this->cart()->create();
    }
}
