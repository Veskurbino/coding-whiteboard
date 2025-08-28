<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Canvas;
use App\Models\Edge;
use App\Models\Node;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CanvasController extends Controller
{
    public function index()
    {
        $canvases = Canvas::withCount(['nodes', 'edges'])->latest()->paginate(20);
        return response()->json($canvases);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $canvas = Canvas::create($validated);
        return response()->json($canvas, 201);
    }

    public function show(Canvas $canvas)
    {
        $canvas->load(['project', 'nodes', 'edges']);
        return response()->json($canvas);
    }

    public function update(Request $request, Canvas $canvas)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $canvas->update($validated);
        return response()->json($canvas);
    }

    public function destroy(Canvas $canvas)
    {
        $canvas->delete();
        return response()->json(['deleted' => true]);
    }

    public function getGraph(Canvas $canvas)
    {
        $nodes = $canvas->nodes()->get();
        $edges = $canvas->edges()->get();
        return response()->json(['nodes' => $nodes, 'edges' => $edges]);
    }

    public function updateGraph(Request $request, Canvas $canvas)
    {
        $validated = $request->validate([
            'nodes' => 'required|array',
            'edges' => 'required|array',
        ]);

        DB::transaction(function () use ($canvas, $validated) {
            // Replace nodes
            $canvas->nodes()->delete();
            $nodeIdMap = [];
            foreach ($validated['nodes'] as $n) {
                $node = $canvas->nodes()->create([
                    'type' => $n['type'] ?? 'default',
                    'x' => $n['x'] ?? 0,
                    'y' => $n['y'] ?? 0,
                    'data' => $n['data'] ?? null,
                ]);
                if (isset($n['id'])) $nodeIdMap[$n['id']] = $node->id;
            }

            // Replace edges
            $canvas->edges()->delete();
            foreach ($validated['edges'] as $e) {
                $sourceId = $e['source_node_id'] ?? ($nodeIdMap[$e['source']] ?? null);
                $targetId = $e['target_node_id'] ?? ($nodeIdMap[$e['target']] ?? null);
                if (!$sourceId || !$targetId) continue;
                $canvas->edges()->create([
                    'source_node_id' => $sourceId,
                    'target_node_id' => $targetId,
                    'label' => $e['label'] ?? null,
                    'data' => $e['data'] ?? null,
                ]);
            }
        });

        return $this->getGraph($canvas);
    }
}
