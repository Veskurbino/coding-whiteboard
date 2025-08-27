<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Edge;
use Illuminate\Http\Request;

class EdgeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'canvas_id' => 'required|exists:canvases,id',
            'source_node_id' => 'required|exists:nodes,id',
            'target_node_id' => 'required|exists:nodes,id',
            'label' => 'nullable|string|max:255',
            'data' => 'nullable|array',
        ]);
        $edge = Edge::create($validated);
        return response()->json($edge, 201);
    }

    public function show(Edge $edge)
    {
        return response()->json($edge);
    }

    public function update(Request $request, Edge $edge)
    {
        $validated = $request->validate([
            'source_node_id' => 'sometimes|required|exists:nodes,id',
            'target_node_id' => 'sometimes|required|exists:nodes,id',
            'label' => 'nullable|string|max:255',
            'data' => 'nullable|array',
        ]);
        $edge->update($validated);
        return response()->json($edge);
    }

    public function destroy(Edge $edge)
    {
        $edge->delete();
        return response()->json(['deleted' => true]);
    }
}
