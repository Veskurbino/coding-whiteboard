<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Events\MessageSent;

class TestWebSocketController extends Controller
{
    public function sendTestMessage(Request $request)
    {
        $user = $request->user() ?? (object)['id' => 1, 'name' => 'Test User'];
        $message = $request->input('message', 'This is a test message from TestWebSocketController.');

        // Dispatch the MessageSent event
        MessageSent::dispatch($user, $message);

        return response()->json([
            'status' => 'Message dispatched',
            'user' => $user,
            'message' => $message,
        ]);
    }

    public function receiveFromFrontend(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'name' => 'nullable|string|max:255',
        ]);

        $user = (object) [
            'id' => 1,
            'name' => $validated['name'] ?? 'Frontend Tester',
        ];

        MessageSent::dispatch($user, $validated['message']);

        return response()->json([
            'status' => 'Broadcasted from frontend',
            'user' => $user,
            'message' => $validated['message'],
        ]);
    }
}
