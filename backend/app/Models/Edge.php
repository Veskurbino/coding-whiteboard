<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Edge extends Model
{
    use HasFactory;

    protected $fillable = [
        'canvas_id',
        'source_node_id',
        'target_node_id',
        'label',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function canvas(): BelongsTo
    {
        return $this->belongsTo(Canvas::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'source_node_id');
    }

    public function target(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'target_node_id');
    }
}
