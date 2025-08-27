<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Canvas;
use App\Models\Snapshot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SnapshotController extends Controller
{
    public function index(Canvas $canvas)
    {
        $snapshots = $canvas->snapshots()->latest()->paginate(20);
        return response()->json($snapshots);
    }

    public function store(Request $request, Canvas $canvas)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'graph' => 'required|array',
            'metadata' => 'nullable|array',
        ]);

        $snapshot = $canvas->snapshots()->create($validated);
        return response()->json($snapshot, 201);
    }

    public function show(Canvas $canvas, Snapshot $snapshot)
    {
        if ($snapshot->canvas_id !== $canvas->id) {
            abort(404);
        }
        return response()->json($snapshot);
    }

    public function restore(Canvas $canvas, Snapshot $snapshot)
    {
        if ($snapshot->canvas_id !== $canvas->id) {
            abort(404);
        }

        $graph = $snapshot->graph;
        return response()->json($graph);
    }
}
