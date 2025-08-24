<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCancelledByAdmin extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;
    public $reason;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, ?string $reason = null)
    {
        // Load necessary relationships for queue serialization
        $this->order = $order->load(['items.book', 'user', 'address.province', 'address.wardModel']);
        $this->reason = $reason;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Thông báo hủy đơn hàng #' . $this->order->id . ' - ' . config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.order-cancelled-by-admin',
            with: [
                'order' => $this->order,
                'reason' => $this->reason,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
