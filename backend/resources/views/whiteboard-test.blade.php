<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Greenboard</title>
	<style>
		body { font-family: Arial, sans-serif; margin: 2em; }
		#boardWrap { border: 1px solid #ccc; padding: 0.5em; margin-bottom: 1em; }
		#board { border: 1px solid #999; background: #fff; width: 100%; height: 420px; display: block; }
		.toolbar { display: flex; gap: 0.5em; align-items: center; margin: 0.5em 0; flex-wrap: wrap; }
		#topToolbar { padding-left: 0.75em; padding-right: 0.75em; }
		#messages { border: 1px solid #ccc; padding: 0.75em; min-height: 90px; max-height: 180px; overflow: auto; background: #f9f9f9; }
		.msg { margin-bottom: 0.5em; }
		.user { font-weight: bold; }
		#status { margin-bottom: 1em; color: #555; }
		form { margin: 1em 0; }
		input, button, select, textarea { padding: 0.5em; }
		.badge { background: #eef; border: 1px solid #99c; padding: 0.15em 0.5em; border-radius: 4px; font-size: 12px; color: #335; }
		.small { font-size: 12px; color: #666; }
		input[type="text"].short { width: 160px; }
		.dot { display:inline-block; width:10px; height:10px; border-radius:50%; background:#bbb; vertical-align:middle; margin-left:6px; }
		.dot.connecting { background:#f7a; }
		.dot.connected { background:#2b7; }
		.dot.disconnected { background:#e33; }
		#ai { width: 100%; min-height: 320px; max-height: 520px; overflow: auto; font-family: Consolas, "Courier New", monospace; }
		#aiPreviewWrap { margin-top: 0.5em; border: 1px solid #ddd; }
		#aiPreviewWrap pre { margin: 0; padding: 0.75em 1em; overflow: auto; }
		#langSelect { border: 1px solid var(--brand-200); border-radius: 8px; background: #fff; color: var(--text-strong); }

		/* Confirma green theme (restore) - excludes AI preview area */
		:root {
			--brand-50: #ecfdf5;
			--brand-100: #d1fae5;
			--brand-200: #a7f3d0;
			--brand-600: #16a34a;
			--brand-700: #15803d;
			--text-strong: #0b3d2e;
			--bg-soft: #f0fff4;
		}

		body { background: var(--bg-soft); color: var(--text-strong); }
		h1 { color: var(--brand-700); }
		#boardWrap { border-color: var(--brand-200); background: #ffffff; border-radius: 10px; }
		#board { border-color: var(--brand-600); }
		.toolbar { background: var(--brand-50); border: 1px solid var(--brand-200); border-radius: 10px; }
		.badge { background: var(--brand-100); border-color: var(--brand-200); color: var(--brand-700); }
		#messages { border-color: var(--brand-200); background: var(--brand-50); }
		input[type="text"] { border: 1px solid var(--brand-200); border-radius: 8px; background: #fff; color: var(--text-strong); }
		input[type="text"]:focus { outline: 2px solid var(--brand-600); border-color: var(--brand-600); }
		button { background: var(--brand-600); color: #fff; border: 1px solid var(--brand-700); border-radius: 8px; cursor: pointer; }
		button:hover { background: var(--brand-700); }
		.dot.connected { background: var(--brand-600); }
		.dot.connecting { background: #f59e0b; }
		/* keep AI preview dark theme */
		#aiPreviewWrap { border-color: #ddd; background: transparent; position: relative; }
		/* Copy button */
		#copyCodeBtn { position: absolute; top: 6px; right: 6px; border-radius: 6px; padding: 6px 8px; display: inline-flex; align-items: center; gap: 6px; background: var(--brand-600); border: 1px solid var(--brand-700); color: #fff; }
		#copyCodeBtn:hover { background: var(--brand-700); }
		#copyCodeBtn svg { width: 16px; height: 16px; fill: currentColor; }
	</style>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css" />
</head>
<body>
	<h1>Greenboard</h1>
	<div id="status">Connecting...</div>

	<div id="topToolbar" class="toolbar">
		<span class="badge">Shared Whiteboard</span>
		<span id="sessionStatus" class="small"></span>
		<span id="wsDot" class="dot connecting" title="WebSocket status"></span>
		<span id="presenceCount" class="small" style="margin-left:auto;">Connected clients: 1</span>
	</div>

	<div id="boardWrap">
		<div class="toolbar">
			<span class="badge">Whiteboard</span>
			<button type="button" id="modeAddBtn">Add Class/Interface</button>
			<button type="button" id="modeConnectBtn">Connect</button>
			<select id="nodeType" title="Node type">
				<option value="class">class</option>
				<option value="interface">interface</option>
				<option value="module">module</option>
			</select>
			<select id="edgeType" title="Edge type">
				<option value="association">association</option>
				<option value="inherits">inherits</option>
			</select>
			<button type="button" id="addPropBtn">Add Property</button>
			<button type="button" id="addMethBtn">Add Method</button>
			<button type="button" id="deleteBtn">Delete Selected</button>
			<button type="button" id="clearBtn">Clear</button>
		</div>
		<canvas id="board"></canvas>
	</div>

	<div class="toolbar">
		<span class="badge">Language</span>
		<select id="langSelect" title="Target language">
			<option value="php" selected>PHP</option>
			<option value="java">Java</option>
			<option value="csharp">C#</option>
			<option value="cpp">C++</option>
			<option value="python">Python</option>
			<option value="typescript">TypeScript</option>
			<option value="javascript">JavaScript</option>
			<option value="ruby">Ruby</option>
			<option value="kotlin">Kotlin</option>
			<option value="swift">Swift</option>
		</select>
		<button type="button" id="analyzeBtn">Analyze</button>
	</div>

	<div class="badge" style="margin-top: 1em;">AI Response (code)</div>
	<div id="aiPreviewWrap">
		<button id="copyCodeBtn" title="Copy code to clipboard" aria-label="Copy code">
			<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>
			<span>Copy</span>
		</button>
		<pre><code id="aiPreview" class="language-php"></code></pre>
	</div>

	<div id="messages" style="margin-top: 1em;">
		<em>Waiting for messages...</em>
	</div>

	<form id="sendForm" class="toolbar">
		<input type="text" id="name" placeholder="Your name (optional)" />
		<input type="text" id="message" placeholder="Type a message" required />
		<button type="submit">Send</button>
		<span id="sendResult" style="margin-left: 1em;"></span>
	</form>

	<script src="https://js.pusher.com/7.2/pusher.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/laravel-echo@1.15.0/dist/echo.iife.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/php.min.js"></script>
	<script>
		const configuredHost = @json(config('broadcasting.connections.reverb.options.host')) || '';
		const configuredPortOpt = @json(config('broadcasting.connections.reverb.options.port'));
		const configuredPort = (configuredPortOpt && Number(configuredPortOpt)) ? Number(configuredPortOpt) : 8080;
		const appKey = @json(config('broadcasting.connections.reverb.key')) || 'local';

		const host = window.location.hostname;
		const port = configuredPort;

		const statusEl = document.getElementById('status');
		const sendForm = document.getElementById('sendForm');
		const sendResult = document.getElementById('sendResult');
		const inputMessage = document.getElementById('message');
		const inputName = document.getElementById('name');
		const analyzeBtn = document.getElementById('analyzeBtn');
		const sessionStatus = document.getElementById('sessionStatus');
		const wsDot = document.getElementById('wsDot');
		const langSelect = document.getElementById('langSelect');
		const aiPreview = document.getElementById('aiPreview');
		const copyCodeBtn = document.getElementById('copyCodeBtn');
		const presenceCountEl = document.getElementById('presenceCount');

		const HLJS_LANG_CDN = {
			php: 'php', java: 'java', csharp: 'csharp', cpp: 'cpp', python: 'python',
			typescript: 'typescript', javascript: 'javascript', ruby: 'ruby', kotlin: 'kotlin', swift: 'swift'
		};
		function ensureHljsLanguage(langId, cb) {
			try {
				if (window.hljs && hljs.getLanguage && hljs.getLanguage(langId)) { cb && cb(); return; }
			} catch (_) {}
			const langFile = HLJS_LANG_CDN[langId];
			if (!langFile) { cb && cb(); return; }
			const existing = document.querySelector(`script[data-hljs-lang="${langId}"]`);
			if (existing) { existing.addEventListener('load', () => cb && cb()); return; }
			const s = document.createElement('script');
			s.src = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/${langFile}.min.js`;
			s.async = true;
			s.setAttribute('data-hljs-lang', langId);
			s.onload = () => cb && cb();
			document.head.appendChild(s);
		}

		function renderPreview(codeText) {
			if (!aiPreview) return;
			const desiredLang = languageSpec(langSelect.value).hljs;
			const code = codeText || '';
			ensureHljsLanguage(desiredLang, () => {
				try {
					let html;
					if (window.hljs && hljs.getLanguage && hljs.getLanguage(desiredLang)) {
						html = hljs.highlight(code, { language: desiredLang, ignoreIllegals: true }).value;
					} else if (window.hljs && typeof hljs.highlightAuto === 'function') {
						html = hljs.highlightAuto(code).value;
					} else {
						html = code.replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]));
					}
					aiPreview.className = 'hljs';
					aiPreview.innerHTML = html;
				} catch (_) {
					aiPreview.className = '';
					aiPreview.textContent = code;
				}
			});
		}
		function cleanAiText(text) {
			let t = (text || '').trim();
			// Prefer the first fenced code block if present (handles multiple blocks)
			const firstFence = t.match(/```[a-zA-Z0-9]*\n([\s\S]*?)```/);
			if (firstFence) t = firstFence[1];
			// Strip wrapping quotes if model returned a quoted string
			if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith('\'') && t.endsWith('\''))) {
				t = t.slice(1, -1);
			}
			return t;
		}
		function languageSpec(langKey) {
			switch (langKey) {
				case 'java': return { name: 'Java', hljs: 'java', guidance: 'Use Java 17+, Maven or Gradle, proper packages.' };
				case 'csharp': return { name: 'C#', hljs: 'csharp', guidance: '.NET 8, namespaces, project structure.' };
				case 'cpp': return { name: 'C++', hljs: 'cpp', guidance: 'Use modern C++20, headers and sources.' };
				case 'python': return { name: 'Python', hljs: 'python', guidance: 'Use Python 3.11, packages and modules.' };
				case 'typescript': return { name: 'TypeScript', hljs: 'typescript', guidance: 'ES2020 modules, tsconfig, types.' };
				case 'javascript': return { name: 'JavaScript', hljs: 'javascript', guidance: 'ES modules, classes.' };
				case 'ruby': return { name: 'Ruby', hljs: 'ruby', guidance: 'Modules/classes, idiomatic Ruby.' };
				case 'kotlin': return { name: 'Kotlin', hljs: 'kotlin', guidance: 'JVM target, packages.' };
				case 'swift': return { name: 'Swift', hljs: 'swift', guidance: 'Swift 5.9, modules.' };
				default: return { name: 'PHP', hljs: 'php', guidance: 'PHP 8.2, PSR-12, namespaces, Composer autoload.' };
			}
		}
		function setPreviewLanguage(langKey) {
			const spec = languageSpec(langKey);
			aiPreview.className = 'language-' + spec.hljs;
			ensureHljsLanguage(spec.hljs, () => renderPreview(aiPreview.textContent));
		}

		const canvas = document.getElementById('board');
		const ctx = canvas.getContext('2d');
		const modeAddBtn = document.getElementById('modeAddBtn');
		const modeConnectBtn = document.getElementById('modeConnectBtn');
		const clearBtn = document.getElementById('clearBtn');
		const nodeTypeSel = document.getElementById('nodeType');
		const edgeTypeSel = document.getElementById('edgeType');
		const deleteBtn = document.getElementById('deleteBtn');
		const addPropBtn = document.getElementById('addPropBtn');
		const addMethBtn = document.getElementById('addMethBtn');

		let mode = 'select';
		let pendingAdd = false;
		let nodes = [];
		let edges = [];
		let draggingNodeId = null;
		let dragOffset = { x: 0, y: 0 };
		let connectStartNodeId = null;
		let nextId = 1;
		let selectedIds = new Set();
		let isShift = false;

		const clientId = Math.random().toString(36).slice(2, 10);
		let broadcastTimer = null;
		let presenceTimer = null;

		function getNodeHeight(n) {
			const titleH = 26;
			const lineH = 18;
			const propsH = (n.properties ? n.properties.length : 0) * lineH;
			const methsH = (n.methods ? n.methods.length : 0) * lineH;
			let h = titleH + 6 + propsH + 6 + methsH + 10;
			if (h < 80) h = 80;
			return h;
		}

		function resizeCanvas() {
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
			draw();
		}
		window.addEventListener('resize', resizeCanvas);
		setTimeout(resizeCanvas, 0);

		function addNode(x, y, type, label) {
			const node = {
				id: 'n' + (nextId++),
				type: type || 'class',
				label: label || (type || 'class').toUpperCase(),
				x: x - 80,
				y: y - 50,
				w: 160,
				h: 100,
				properties: [],
				methods: [],
			};
			nodes.push(node);
			draw();
			scheduleBroadcast();
		}

		function nodeAt(x, y) {
			for (let i = nodes.length - 1; i >= 0; i--) {
				const n = nodes[i];
				if (x >= n.x && x <= n.x + n.w && y >= n.y && y <= n.y + n.h) return n;
			}
			return null;
		}

		function deleteSelected() {
			if (selectedIds.size === 0) return;
			nodes = nodes.filter(n => !selectedIds.has(n.id));
			edges = edges.filter(e => !selectedIds.has(e.source) && !selectedIds.has(e.target));
			selectedIds.clear();
			draw();
		}

		function drawArrow(fromX, fromY, toX, toY, style) {
			ctx.beginPath();
			if (style === 'inherits') ctx.setLineDash([6, 4]); else ctx.setLineDash([]);
			ctx.moveTo(fromX, fromY);
			ctx.lineTo(toX, toY);
			ctx.stroke();
			const angle = Math.atan2(toY - fromY, toX - fromX);
			const headLen = 8;
			ctx.beginPath();
			ctx.moveTo(toX, toY);
			ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
			ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
			ctx.closePath();
			ctx.fillStyle = style === 'inherits' ? '#666' : '#333';
			ctx.fill();
			ctx.setLineDash([]);
		}

		function draw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.strokeStyle = '#666';
			edges.forEach(e => {
				const s = nodes.find(n => n.id === e.source);
				const t = nodes.find(n => n.id === e.target);
				if (!s || !t) return;
				const sw = typeof s.w === 'number' ? s.w : 160;
				const tw = typeof t.w === 'number' ? t.w : 160;
				const sh = typeof s.h === 'number' ? s.h : getNodeHeight(s);
				const th = typeof t.h === 'number' ? t.h : getNodeHeight(t);
				drawArrow(s.x + sw / 2, s.y + sh / 2, t.x + tw / 2, t.y + th / 2, e.kind || 'association');
			});
			nodes.forEach(n => {
				if (typeof n.w !== 'number') n.w = 160;
				const titleH = 26;
				const lineH = 18;
				const propsH = (n.properties ? n.properties.length : 0) * lineH;
				const methsH = (n.methods ? n.methods.length : 0) * lineH;
				let h = titleH + 6 + propsH + 6 + methsH + 10;
				if (h < 80) h = 80;
				n.h = h;

				ctx.fillStyle = '#fff';
				ctx.strokeStyle = '#333';
				ctx.lineWidth = 1;
				ctx.fillRect(n.x, n.y, n.w, n.h);
				ctx.strokeRect(n.x, n.y, n.w, n.h);

				if (selectedIds.has(n.id)) {
					ctx.strokeStyle = '#2b7';
					ctx.lineWidth = 2;
					ctx.strokeRect(n.x - 3, n.y - 3, n.w + 6, n.h + 6);
				}

				ctx.fillStyle = '#333';
				ctx.font = 'bold 14px Arial';
				ctx.fillText(n.label + ' [' + n.type + ']', n.x + 6, n.y + 18);
				ctx.strokeStyle = '#ccc';
				ctx.beginPath(); ctx.moveTo(n.x, n.y + titleH); ctx.lineTo(n.x + n.w, n.y + titleH); ctx.stroke();

				ctx.fillStyle = '#333';
				ctx.font = '12px Arial';
				let cursorY = n.y + titleH + 16;
				(n.properties || []).forEach(p => { ctx.fillText(p.name + (p.type ? ': ' + p.type : ''), n.x + 8, cursorY); cursorY += lineH; });
				ctx.strokeStyle = '#eee';
				ctx.beginPath(); ctx.moveTo(n.x, n.y + titleH + 6 + propsH); ctx.lineTo(n.x + n.w, n.y + titleH + 6 + propsH); ctx.stroke();
				cursorY = n.y + titleH + 12 + propsH + 16;

				(n.methods || []).forEach(m => { const sig = `${m.name}(${m.params || ''})${m.returns ? ': ' + m.returns : ''}`; ctx.fillText(sig, n.x + 8, cursorY); cursorY += lineH; });
			});
		}

		function toggleSelect(node, additive) {
			if (!additive) selectedIds.clear();
			if (selectedIds.has(node.id)) { if (additive) selectedIds.delete(node.id); else { selectedIds.clear(); selectedIds.add(node.id); } }
			else { selectedIds.add(node.id); }
			draw();
		}

		canvas.addEventListener('mousedown', (ev) => {
			const rect = canvas.getBoundingClientRect();
			const x = ev.clientX - rect.left;
			const y = ev.clientY - rect.top;
			if (pendingAdd) { addNode(x, y, nodeTypeSel.value, null); pendingAdd = false; sessionStatus.textContent = ''; return; }
			const n = nodeAt(x, y);
			if (mode === 'select') {
				if (n) {
					if (isShift) { toggleSelect(n, true); }
					else { if (!selectedIds.has(n.id)) { selectedIds.clear(); selectedIds.add(n.id); } draggingNodeId = n.id; dragOffset.x = x - n.x; dragOffset.y = y - n.y; draw(); }
				} else { if (!isShift) { selectedIds.clear(); draw(); } }
			} else if (mode === 'connect') {
				if (n) {
					if (!connectStartNodeId) { connectStartNodeId = n.id; }
					else if (connectStartNodeId && connectStartNodeId !== n.id) { edges.push({ id: 'e' + (nextId++), source: connectStartNodeId, target: n.id, kind: edgeTypeSel.value }); connectStartNodeId = null; draw(); scheduleBroadcast(); }
				}
			}
		});
		canvas.addEventListener('mousemove', (ev) => {
			if (!draggingNodeId) return;
			const rect = canvas.getBoundingClientRect();
			const x = ev.clientX - rect.left;
			const y = ev.clientY - rect.top;
			const n = nodes.find(n => n.id === draggingNodeId);
			if (n) { n.x = x - dragOffset.x; n.y = y - dragOffset.y; draw(); }
		});
		canvas.addEventListener('mouseup', () => { if (draggingNodeId) { draggingNodeId = null; scheduleBroadcast(); } });
		canvas.addEventListener('mouseleave', () => { if (draggingNodeId) { draggingNodeId = null; scheduleBroadcast(); } });
		canvas.addEventListener('dblclick', (ev) => {
			const rect = canvas.getBoundingClientRect();
			const x = ev.clientX - rect.left;
			const y = ev.clientY - rect.top;
			const n = nodeAt(x, y);
			if (n) { const newLabel = prompt('Set name for ' + n.type, n.label) || n.label; n.label = newLabel; draw(); scheduleBroadcast(); }
		});

		modeAddBtn.onclick = () => { pendingAdd = true; sessionStatus.textContent = 'Click on canvas to add a ' + nodeTypeSel.value; setTimeout(()=>{ if (pendingAdd) sessionStatus.textContent=''; }, 3000); };
		modeConnectBtn.onclick = () => { mode = 'connect'; connectStartNodeId = null; };
		clearBtn.onclick = () => { if (confirm('Clear whiteboard?')) { nodes = []; edges = []; selectedIds.clear(); draw(); scheduleBroadcast(); } };
		deleteBtn.onclick = () => { deleteSelected(); scheduleBroadcast(); };
		addPropBtn.onclick = () => {
			if (selectedIds.size !== 1) return alert('Select one class/interface to add a property.');
			const id = Array.from(selectedIds)[0];
			const n = nodes.find(n => n.id === id);
			if (!n || (n.type !== 'class' && n.type !== 'interface')) return alert('Select a class or interface node.');
			const input = prompt('Property (name:type)', 'prop:string'); if (!input) return;
			const [name, type] = input.split(':'); n.properties.push({ name: (name || '').trim(), type: (type || '').trim() || undefined }); draw(); scheduleBroadcast();
		};
		addMethBtn.onclick = () => {
			if (selectedIds.size !== 1) return alert('Select one class/interface to add a method.');
			const id = Array.from(selectedIds)[0];
			const n = nodes.find(n => n.id === id);
			if (!n || (n.type !== 'class' && n.type !== 'interface')) return alert('Select a class or interface node.');
			const name = prompt('Method name', 'doSomething'); if (!name) return;
			const params = prompt('Parameters (e.g., a: number, b: string)', '') || '';
			const returns = prompt('Return type (optional)', '') || '';
			n.methods.push({ name, params, returns }); draw(); scheduleBroadcast();
		};

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

		Pusher.logToConsole = false;
		try {
			const pusherClient = window.Echo.connector.pusher;
			statusEl.textContent = `Connecting to ws://${host}:${port}`;
			pusherClient.connection.bind('state_change', (states) => {
				statusEl.textContent = `WebSocket ${host}:${port} → ${states.current}`;
				wsDot.classList.remove('connected','connecting','disconnected');
				wsDot.classList.add(states.current === 'connected' ? 'connected' : (states.current === 'connecting' ? 'connecting' : 'disconnected'));
				if (states.current === 'connected') {
					clearInterval(presenceTimer);
					presenceTimer = setInterval(() => { sendPresenceHeartbeat(); }, 5000);
					sendPresenceHeartbeat();
					refreshPresenceCount();
				} else if (states.current === 'disconnected') {
					clearInterval(presenceTimer);
				}
			});
			pusherClient.connection.bind('error', (err) => {
				console.error('Pusher error', err);
				statusEl.textContent = 'Connection error (see console)';
				wsDot.classList.remove('connected','connecting');
				wsDot.classList.add('disconnected');
			});
		} catch (e) { console.warn('Unable to attach connection logs', e); }

		function serializeWhiteboard() {
			return {
				nodes: nodes.map(n => ({ id: n.id, type: n.type, label: n.label, x: n.x, y: n.y, w: n.w, h: n.h, properties: n.properties, methods: n.methods })),
				edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, kind: e.kind || 'association' }))
			};
		}
		function applyWhiteboard(data) {
			nodes = (data && data.nodes) ? data.nodes.map(n => ({
				id: n.id,
				type: n.type || 'class',
				label: n.label || (n.type || 'class').toUpperCase(),
				x: typeof n.x === 'number' ? n.x : 0,
				y: typeof n.y === 'number' ? n.y : 0,
				w: typeof n.w === 'number' ? n.w : 160,
				h: typeof n.h === 'number' ? n.h : getNodeHeight(n),
				properties: Array.isArray(n.properties) ? n.properties : [],
				methods: Array.isArray(n.methods) ? n.methods : [],
			})) : [];
			edges = (data && data.edges) ? data.edges.map(e => ({ id: e.id || ('e'+Math.random().toString(36).slice(2,8)), source: e.source, target: e.target, kind: e.kind || 'association' })) : [];
			const maxN = nodes.reduce((m,n)=>Math.max(m, parseInt((n.id||'n0').slice(1))||0),0);
			const maxE = edges.reduce((m,e)=>Math.max(m, parseInt((e.id||'e0').slice(1))||0),0);
			nextId = Math.max(maxN, maxE) + 1;
			draw();
		}
		async function saveShared() {
			try {
				const resp = await fetch('/api/v1/whiteboard/save', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ data: serializeWhiteboard(), clientId }) });
				if (!resp.ok) throw new Error('HTTP ' + resp.status);
				// Quiet success (no UI badge now that buttons are removed)
			} catch (e) { console.error('Save failed', e); sessionStatus.textContent = 'Save failed'; }
		}
		async function loadShared() {
			try {
				const resp = await fetch('/api/v1/whiteboard/load');
				if (!resp.ok) throw new Error('HTTP ' + resp.status);
				const json = await resp.json();
				applyWhiteboard(json.data);
				// Quiet success
			} catch (e) { console.error('Load failed', e); sessionStatus.textContent = 'Load failed'; }
		}
		function scheduleBroadcast() { clearTimeout(broadcastTimer); broadcastTimer = setTimeout(() => { saveShared(); }, 250); }

		const sharedChannel = window.Echo.channel('whiteboard');
		sharedChannel.listen('.WhiteboardUpdated', (e) => {
			if (e.clientId && e.clientId === clientId) return;
			applyWhiteboard(e.data);
			sessionStatus.textContent = 'Synced'; setTimeout(()=>sessionStatus.textContent='', 800);
		});

		async function sendPresenceHeartbeat() {
			try {
				const resp = await fetch('/api/v1/presence/heartbeat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
					body: JSON.stringify({ clientId })
				});
				if (!resp.ok) throw new Error('HTTP ' + resp.status);
				const json = await resp.json();
				presenceCountEl.textContent = 'Connected clients: ' + (json.count || 1);
			} catch (e) {
				// keep silent, maybe offline temporarily
			}
		}

		async function refreshPresenceCount() {
			try {
				const resp = await fetch('/api/v1/presence/count');
				if (!resp.ok) throw new Error('HTTP ' + resp.status);
				const json = await resp.json();
				presenceCountEl.textContent = 'Connected clients: ' + (json.count || 1);
			} catch (_) {}
		}

		// Removed manual Save/Load buttons

		window.Echo.channel('public').listen('.MessageSent', (e) => {
			const name = e.user && (e.user.name || e.user.username || e.user.id) ? (e.user.name || e.user.username || e.user.id) : 'Unknown';
			if (name === 'AI') {
				setPreviewLanguage(langSelect.value);
				renderPreview(cleanAiText(e.message || ''));
				return;
			}
			const messages = document.getElementById('messages');
			if (messages.querySelector('em')) messages.innerHTML = '';
			const div = document.createElement('div');
			div.className = 'msg';
			div.innerHTML = `<span class=\"user\">${name}:</span> ${e.message}`;
			messages.appendChild(div);
		});

		async function copyPlainText(text) {
			try {
				if (navigator.clipboard && window.isSecureContext) {
					await navigator.clipboard.writeText(text);
					return true;
				}
			} catch (_) {}
			try {
				const ta = document.createElement('textarea');
				ta.value = text;
				ta.setAttribute('readonly', '');
				ta.style.position = 'fixed';
				ta.style.top = '-9999px';
				document.body.appendChild(ta);
				ta.focus();
				ta.select();
				const ok = document.execCommand('copy');
				document.body.removeChild(ta);
				if (ok) return true;
			} catch (_) {}
			try {
				window.prompt('Press Ctrl/Cmd+C to copy, then Enter', text);
				return false;
			} catch (_) {}
			return false;
		}

		copyCodeBtn.addEventListener('click', async () => {
			const plain = aiPreview ? aiPreview.textContent : '';
			const success = await copyPlainText(plain || '');
			copyCodeBtn.querySelector('span').textContent = success ? 'Copied' : 'Copy';
			setTimeout(() => { copyCodeBtn.querySelector('span').textContent = 'Copy'; }, 1400);
		});

		sendForm.addEventListener('submit', async (ev) => {
			ev.preventDefault();
			sendResult.textContent = 'Sending...';
			try {
				const response = await fetch('/test-websocket', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': '{{ csrf_token() }}' }, body: JSON.stringify({ message: inputMessage.value, name: inputName.value || undefined }) });
				if (!response.ok) throw new Error('HTTP ' + response.status);
				await response.json();
				sendResult.textContent = 'Sent!'; inputMessage.value = '';
			} catch (err) { console.error('Send failed', err); sendResult.textContent = 'Failed to send'; }
		});

		analyzeBtn.addEventListener('click', async () => {
			setPreviewLanguage(langSelect.value);
			renderPreview('// Analyzing...');
			try {
				const program = { classes: nodes.filter(n => n.type === 'class').map(n => ({ id: n.id, name: n.label, properties: n.properties, methods: n.methods })), interfaces: nodes.filter(n => n.type === 'interface').map(n => ({ id: n.id, name: n.label, methods: n.methods, properties: n.properties })), modules: nodes.filter(n => n.type === 'module').map(n => ({ id: n.id, name: n.label })), relationships: edges.map(e => ({ source: e.source, target: e.target, type: e.kind || 'association' })) };
				const spec = languageSpec(langSelect.value);
				const summary = `You are an expert ${spec.name} engineer. From the provided program model, generate ONLY the library/source code: classes, interfaces, modules, and their members. Do NOT include example usage, entrypoints, bootstrapping, Composer/autoload code, CLI demos, tests, or scaffolding. No markdown/backticks. Return a single contiguous ${spec.name} code snippet only (you may include minimal file header comments like // File: Class.php if needed). ${spec.guidance} Use object-oriented design where appropriate.`;
				const resp = await fetch('/api/v1/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: JSON.stringify({ graph: program, summary }) });
				if (!resp.ok) throw new Error('HTTP ' + resp.status);
				const data = await resp.json();
				renderPreview(cleanAiText(data.response || '[No response]'));
			} catch (e) {
				console.error('Analyze failed', e);
				renderPreview('// Analyze failed: ' + e.message);
			}
		});

		loadShared();
	</script>
</body>
</html>
