<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Analysis;
use App\Models\Canvas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;
use Throwable;
use App\Events\MessageSent;

class AnalyzeController extends Controller
{
    public function analyze(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'canvas_id' => 'nullable|exists:canvases,id',
            'model' => 'nullable|string',
            'graph' => 'required|array',
            'summary' => 'nullable|string',
        ]);

        $model = $validated['model'] ?? 'gemini-1.5-flash';
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'Missing GEMINI_API_KEY'], 500);
        }

        $analysis = Analysis::create([
            'project_id' => $validated['project_id'] ?? null,
            'canvas_id' => $validated['canvas_id'] ?? null,
            'model' => $model,
            'input_summary' => $validated['summary'] ?? null,
            'input_json' => json_encode($validated['graph']),
            'status' => 'completed',
        ]);

        try {
            $verify = filter_var(env('HTTP_VERIFY_SSL', 'true'), FILTER_VALIDATE_BOOLEAN);
            $client = new Client([
                'base_uri' => 'https://generativelanguage.googleapis.com/',
                'timeout' => 60,
                'verify' => $verify,
            ]);

            $prompt = $validated['summary'] ?? 'Analyze this process/code graph and provide insights and suggestions.';
            $content = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            ['text' => 'Graph JSON: '.json_encode($validated['graph'])],
                        ],
                    ],
                ],
            ];

            $resp = $client->post("v1beta/models/{$model}:generateContent?key={$apiKey}", [
                'headers' => ['Content-Type' => 'application/json'],
                'json' => $content,
            ]);

            $body = json_decode((string) $resp->getBody(), true);
            $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';

            $analysis->update([
                'response_text' => $text,
                'metadata' => $body,
            ]);

            // Broadcast response
            $user = (object)['id' => 0, 'name' => 'AI'];
            MessageSent::dispatch($user, $text);

            return response()->json([
                'id' => $analysis->id,
                'model' => $analysis->model,
                'response' => $text,
            ]);
        } catch (Throwable $e) {
            Log::error('Analyze failed', ['e' => $e->getMessage()]);
            $analysis->update([
                'status' => 'error',
                'error_message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Analyze failed', 'message' => $e->getMessage()], 500);
        }
    }
}
