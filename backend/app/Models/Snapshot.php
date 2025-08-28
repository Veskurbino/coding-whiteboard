<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Snapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'canvas_id',
        'name',
        'graph',
        'metadata',
    ];

    protected $casts = [
        'graph' => 'array',
        'metadata' => 'array',
    ];

    public function canvas(): BelongsTo
    {
        return $this->belongsTo(Canvas::class);
    }
}
