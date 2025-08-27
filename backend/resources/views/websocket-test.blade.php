<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2em; }
        #messages { border: 1px solid #ccc; padding: 1em; min-height: 200px; background: #f9f9f9; }
        .msg { margin-bottom: 1em; }
        .user { font-weight: bold; }
        #status { margin-bottom: 1em; color: #555; }
        form { margin: 1em 0; }
        input, button { padding: 0.5em; }
    </style>
</head>
<body>
    <h1>WebSocket Test Page</h1>
    <div id="status">Connecting...</div>

    <form id="sendForm">
        <input type="text" id="name" placeholder="Your name (optional)" />
        <input type="text" id="message" placeholder="Type a message" required />
        <button type="submit">Send</button>
        <span id="sendResult" style="margin-left: 1em;"></span>
    </form>

    <div id="messages">
        <em>Waiting for messages...</em>
    </div>

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
                const data = await response.json();
                sendResult.textContent = 'Sent!';
                inputMessage.value = '';
            } catch (err) {
                console.error('Send failed', err);
                sendResult.textContent = 'Failed to send';
            }
        });
    </script>
</body>
</html>
