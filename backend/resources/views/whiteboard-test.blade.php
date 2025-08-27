<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Whiteboard Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2em; }
        #messages { border: 1px solid #ccc; padding: 1em; min-height: 200px; background: #f9f9f9; }
        .msg { margin-bottom: 1em; }
        .user { font-weight: bold; }
        #status { margin-bottom: 1em; color: #555; }
        form { margin: 1em 0; }
        input, button, textarea { padding: 0.5em; }
        #ai { width: 100%; min-height: 160px; margin-top: 1em; }
        .row { display: flex; gap: 0.5em; align-items: center; flex-wrap: wrap; }
    </style>
</head>
<body>
    <h1>Whiteboard Test Page</h1>
    <div id="status">Connecting...</div>

    <form id="sendForm" class="row">
        <input type="text" id="name" placeholder="Your name (optional)" />
        <input type="text" id="message" placeholder="Type a message" required />
        <button type="submit">Send</button>
        <button type="button" id="analyzeBtn">Analyze</button>
        <span id="sendResult" style="margin-left: 1em;"></span>
    </form>

    <div id="messages">
        <em>Waiting for messages...</em>
    </div>

    <label for="ai">AI Response</label>
    <textarea id="ai" placeholder="AI analysis will appear here..." readonly></textarea>

    <!-- Laravel Echo and Pusher JS -->
    <script src="https://js.pusher.com/7.2/pusher.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/laravel-echo@1.15.0/dist/echo.iife.js"></script>
    <script>
        const configuredHost = @json(config('broadcasting.connections.reverb.options.host')) || '127.0.0.1';
        const configuredPort = @json(config('broadcasting.connections.reverb.options.port')) || 8080;
        const appKey = @json(config('broadcasting.connections.reverb.key')) || 'local';

        const host = configuredHost;
        const port = configuredPort;

        const statusEl = document.getElementById('status');
        const sendForm = document.getElementById('sendForm');
        const sendResult = document.getElementById('sendResult');
        const inputMessage = document.getElementById('message');
        const inputName = document.getElementById('name');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const aiTextarea = document.getElementById('ai');

        window.Echo = new window.Echo({
            broadcaster: 'pusher',
            key: appKey,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS: false,
            disableStats: true,
            enabledTransports: ['ws', 'wss'],
        });

        // Basic connection logging
        Pusher.logToConsole = false;
        try {
            const pusherClient = window.Echo.connector.pusher;
            pusherClient.connection.bind('state_change', (states) => {
                statusEl.textContent = `Connection: ${states.current}`;
            });
            pusherClient.connection.bind('error', (err) => {
                console.error('Pusher error', err);
                statusEl.textContent = 'Connection error (see console)';
            });
        } catch (e) {
            console.warn('Unable to attach connection logs', e);
        }

        // Listen for broadcastAs('MessageSent') → must use a leading dot
        window.Echo.channel('public')
            .listen('.MessageSent', (e) => {
                const messages = document.getElementById('messages');
                if (messages.querySelector('em')) messages.innerHTML = '';
                const div = document.createElement('div');
                div.className = 'msg';
                const name = e.user && (e.user.name || e.user.username || e.user.id) ? (e.user.name || e.user.username || e.user.id) : 'Unknown';
                div.innerHTML = `<span class=\"user\">${name}:</span> ${e.message}`;
                messages.appendChild(div);
            });

        // Send message to backend via POST
        sendForm.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            sendResult.textContent = 'Sending...';
            try {
                const response = await fetch('/test-websocket', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    },
                    body: JSON.stringify({
                        message: inputMessage.value,
                        name: inputName.value || undefined,
                    }),
                });
                if (!response.ok) throw new Error('HTTP ' + response.status);
                await response.json();
                sendResult.textContent = 'Sent!';
                inputMessage.value = '';
            } catch (err) {
                console.error('Send failed', err);
                sendResult.textContent = 'Failed to send';
            }
        });

        // Analyze: build a simple graph from current messages as mock input
        analyzeBtn.addEventListener('click', async () => {
            aiTextarea.value = 'Analyzing...';
            try {
                // Example graph: nodes are messages, edges in sequence
                const msgEls = Array.from(document.querySelectorAll('#messages .msg'));
                const nodes = msgEls.map((el, idx) => ({ id: 'n'+idx, type: 'message', x: 0, y: idx*80, data: { html: el.innerHTML } }));
                const edges = nodes.slice(1).map((n, idx) => ({ source: nodes[idx].id, target: n.id }));
                const graph = { nodes, edges };

                const resp = await fetch('/api/v1/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ graph }),
                });
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                const data = await resp.json();
                aiTextarea.value = data.response || '[No response]';
            } catch (e) {
                console.error('Analyze failed', e);
                aiTextarea.value = 'Analyze failed: ' + e.message;
            }
        });
    </script>
</body>
</html>
