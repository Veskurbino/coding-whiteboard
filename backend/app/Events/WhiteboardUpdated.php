<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WhiteboardUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sessionId;
    public $data;
    public $clientId;

    public function __construct($sessionId, array $data, ?string $clientId = null)
    {
        $this->sessionId = $sessionId;
        $this->data = $data;
        $this->clientId = $clientId;
    }

    public function broadcastOn(): array
    {
        $channelName = $this->sessionId ? ('whiteboard.' . $this->sessionId) : 'whiteboard';
        return [ new Channel($channelName) ];
    }

    public function broadcastAs(): string
    {
        return 'WhiteboardUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'sessionId' => $this->sessionId,
            'data' => $this->data,
            'clientId' => $this->clientId,
        ];
    }
}
