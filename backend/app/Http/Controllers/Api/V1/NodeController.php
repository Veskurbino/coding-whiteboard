<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Node;
use Illuminate\Http\Request;

class NodeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'canvas_id' => 'required|exists:canvases,id',
            'type' => 'required|string|max:255',
            'x' => 'required|numeric',
            'y' => 'required|numeric',
            'data' => 'nullable|array',
        ]);
        $node = Node::create($validated);
        return response()->json($node, 201);
    }

    public function show(Node $node)
    {
        return response()->json($node);
    }

    public function update(Request $request, Node $node)
    {
        $validated = $request->validate([
            'type' => 'sometimes|required|string|max:255',
            'x' => 'sometimes|required|numeric',
            'y' => 'sometimes|required|numeric',
            'data' => 'nullable|array',
        ]);
        $node->update($validated);
        return response()->json($node);
    }

    public function destroy(Node $node)
    {
        $node->delete();
        return response()->json(['deleted' => true]);
    }
}
