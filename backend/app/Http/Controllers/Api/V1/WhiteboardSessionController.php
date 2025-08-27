<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WhiteboardSession;
use Illuminate\Http\Request;
use App\Events\WhiteboardUpdated;

class WhiteboardSessionController extends Controller
{
    public function index()
    {
        return response()->json(WhiteboardSession::latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'data' => 'nullable|array',
        ]);
        $session = WhiteboardSession::create($validated);
        return response()->json($session, 201);
    }

    public function show(WhiteboardSession $session)
    {
        return response()->json($session);
    }

    public function update(Request $request, WhiteboardSession $session)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'data' => 'nullable|array',
        ]);
        $session->update($validated);
        return response()->json($session);
    }

    public function destroy(WhiteboardSession $session)
    {
        $session->delete();
        return response()->json(['deleted' => true]);
    }

    public function saveData(Request $request, WhiteboardSession $session)
    {
        $validated = $request->validate([
            'data' => 'required|array',
            'broadcast' => 'nullable|boolean',
            'clientId' => 'nullable|string',
        ]);
        $session->update(['data' => $validated['data']]);
        if ($validated['broadcast'] ?? true) {
            WhiteboardUpdated::dispatch($session->id, $validated['data'], $validated['clientId'] ?? null);
        }
        return response()->json($session);
    }

    public function loadData(WhiteboardSession $session)
    {
        return response()->json(['data' => $session->data ?? [ 'nodes' => [], 'edges' => [] ]]);
    }

    // Shared whiteboard endpoints (no session)
    public function saveShared(Request $request)
    {
        $validated = $request->validate([
            'data' => 'required|array',
            'clientId' => 'nullable|string',
        ]);
        WhiteboardUpdated::dispatch(null, $validated['data'], $validated['clientId'] ?? null);
        return response()->json(['ok' => true]);
    }

    public function loadShared()
    {
        // Stateless: returns empty by default; can be extended to cache last shared state if needed
        return response()->json(['data' => [ 'nodes' => [], 'edges' => [] ]]);
    }
}
