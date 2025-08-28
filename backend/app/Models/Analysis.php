<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Analysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'canvas_id',
        'model',
        'input_summary',
        'input_json',
        'response_text',
        'metadata',
        'status',
        'error_message',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function canvas(): BelongsTo
    {
        return $this->belongsTo(Canvas::class);
    }
}
