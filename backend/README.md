<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Testing WebSocket (Reverb) Functionality

A test controller is available to verify that WebSocket messages are working with Reverb.

### How to Test

1. Start your Laravel backend and ensure Reverb is running.
2. Visit the following URL in your browser or use a tool like curl/Postman:

    http://localhost:8001/test-websocket

3. This will trigger a test message to be broadcast via WebSocket using the `MessageSent` event.
4. Check your frontend or WebSocket client to confirm the message is received.

You can also pass a custom message as a query parameter:

    http://localhost:8001/test-websocket?message=HelloFromTest

### Frontend Whiteboard Test Page

A simple frontend page is available to visually verify that WebSocket messages are received in real time.

1. Start your Laravel backend and ensure Reverb is running.
2. Open your browser and go to:

    http://localhost:8001/whiteboard-test

3. Trigger a test message by visiting:

    http://localhost:8001/test-websocket

4. You should see the message appear instantly on the frontend test page.

You can open multiple browser tabs to see real-time updates across clients.

## Reverb setup (WebSockets)

Add these to your `.env` and adjust ports if needed:

```
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=local
REVERB_APP_KEY=local
REVERB_APP_SECRET=local
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

Then clear config cache:

```
php artisan config:clear
```

## Start servers

In two terminals:

```
php artisan serve --port=8001
php artisan reverb:start
```

The Reverb server typically shows: `Starting server on 0.0.0.0:8080 (127.0.0.1).` Use that port in your client.

## Test: backend → frontend

1. Open the test page:

   http://localhost:8001/whiteboard-test

2. Trigger a broadcast from the backend:

   http://localhost:8001/test-websocket

3. The message should appear on the page immediately.

You can also send a custom message:

   http://localhost:8001/test-websocket?message=HelloFromTest

## Test: frontend → backend

1. Open:

   http://localhost:8001/whiteboard-test

2. Use the form at the top to send a message. The page POSTs to `/test-websocket` and the backend broadcasts it. You should see your message appear live below.

## Troubleshooting

- “Unable to parse URI: https://:443”
  - Set `REVERB_HOST`, `REVERB_PORT`, `REVERB_SCHEME` in `.env`, then `php artisan config:clear`.
- Connection not “connected” on the test page
  - Ensure `php artisan reverb:start` is running, and the page is using the same host/port (defaults to `127.0.0.1:8080`).
- Broadcasts not sending
  - Ensure `BROADCAST_CONNECTION=reverb` and `REVERB_*` keys are set.
- Check logs
  - Backend logs: `backend/storage/logs/laravel.log`.

## REST API (v1)

### Data model

- Projects: groups of work, own multiple canvases
- Canvases: a graph workspace under a project
- Nodes: vertices on a canvas with type, position, data
- Edges: connections between nodes with optional label/data
- Snapshots: saved versions of a canvas graph for restore/versioning

### Migrations

Tables: `projects`, `canvases`, `nodes`, `edges`, `snapshots`.

### Base URL

```
http://localhost:8001/api/v1
```

### Projects

- GET `/projects`
- POST `/projects` { name, description?, user_id? }
- GET `/projects/{id}`
- PUT `/projects/{id}`
- DELETE `/projects/{id}`

### Canvases

- GET `/canvases`
- POST `/canvases` { project_id, name, metadata? }
- GET `/canvases/{id}`
- PUT `/canvases/{id}`
- DELETE `/canvases/{id}`
- GET `/canvases/{id}/graph` → { nodes: [...], edges: [...] }
- PUT `/canvases/{id}/graph` body: { nodes: [{ id?, type, x, y, data? }...], edges: [{ source_node_id?|source, target_node_id?|target, label?, data? }...] }

### Nodes

- POST `/nodes` { canvas_id, type, x, y, data? }
- GET `/nodes/{id}`
- PUT `/nodes/{id}`
- DELETE `/nodes/{id}`

### Edges

- POST `/edges` { canvas_id, source_node_id, target_node_id, label?, data? }
- GET `/edges/{id}`
- PUT `/edges/{id}`
- DELETE `/edges/{id}`

### Snapshots

- GET `/canvases/{id}/snapshots`
- POST `/canvases/{id}/snapshots` { name?, graph, metadata? }
- GET `/canvases/{id}/snapshots/{snapshotId}`
- POST `/canvases/{id}/snapshots/{snapshotId}/restore` → returns stored graph

### Notes

- All endpoints return JSON. Validate errors return HTTP 422.
- Authentication/authorization is not enabled yet; add as needed.
- For large graphs, prefer the graph endpoints to minimize round-trips.

### Analyze (Gemini)

- Env: add to `.env`

```
GEMINI_API_KEY=your_api_key_here
```

- Endpoint:
  - POST `/api/v1/analyze` body: `{ graph: { nodes: [...], edges: [...] }, project_id?, canvas_id?, model?, summary? }`
  - Returns: `{ id, model, response }`
  - Also broadcasts the AI response as a chat message from "AI" on the public channel.

- From the test page (`/whiteboard-test`):
  - Click "Analyze" to POST the current on-screen messages as a simple graph.
  - The AI response is shown in the "AI Response" textarea and streamed to the messages panel via WebSocket.

- Data persistence:
  - Stored in table `analyses` with `input_json`, `response_text`, `model`, and `metadata`.
