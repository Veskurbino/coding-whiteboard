# Coding Whiteboard Frontend (MVP)

This is a Next.js + TypeScript UI for a collaborative code whiteboard. Objects drawn are saved via API calls; until the backend exists, saves fall back to localStorage.

Scripts:
- dev: next dev
- build: next build
- start: next start
- lint: next lint

Structure:
- src/app: Next.js app router pages
- src/components: Toolbar, WhiteboardCanvas, CodeEditorModal, ExportButtons
- src/store: Zustand whiteboard store
- src/types: Whiteboard types
- src/lib: API client and autosave hook

Environment:
- NEXT_PUBLIC_API_BASE: optional base URL for the backend API. If not set, autosave uses localStorage.

Preliminary API Contract:
- PUT /boards/:id -> Save a full WhiteboardDocument
- GET /boards/:id -> Retrieve a full WhiteboardDocument

WhiteboardDocument fields:
- id: string
- title: string
- elements: array of { id, type: rect|ellipse|arrow|text|code, position {x,y}, optional width/height/points/text/code/language, selected, createdAt, updatedAt }
- viewport: { x, y, scale }
- updatedAt: number (epoch ms)

Notes:
- Tools: select, pan, rect, ellipse, arrow, text, code block
- Zoom with mouse wheel, pan using Pan tool
- Code blocks open Monaco editor modal for content and language
- Export JSON and PNG available from board UI
