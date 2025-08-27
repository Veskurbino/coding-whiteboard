<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Node extends Model
{
    use HasFactory;

    protected $fillable = [
        'canvas_id',
        'type',
        'x',
        'y',
        'data',
    ];

    protected $casts = [
        'x' => 'float',
        'y' => 'float',
        'data' => 'array',
    ];

    public function canvas(): BelongsTo
    {
        return $this->belongsTo(Canvas::class);
    }

    public function sourceEdges(): HasMany
    {
        return $this->hasMany(Edge::class, 'source_node_id');
    }

    public function targetEdges(): HasMany
    {
        return $this->hasMany(Edge::class, 'target_node_id');
    }
}
