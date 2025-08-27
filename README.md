# Real-Time Collaborative Code Whiteboard

## Product Overview
A real-time collaborative code whiteboard platform that allows multiple users to write, edit, and share notes simultaneously in a visual workspace environment. The platform enables developers, educators, and teams to collaborate effectively during code reviews, teaching sessions, and pair programming.

## Core Features

### 1. Real-Time Collaboration
- Multi-user simultaneous editing
- Real-time cursor positions and user presence indicators

### 2. Whiteboard Features
- Post-it notes
   - Text
   - Tags, which map to colors per unique set of tags
- Select one or more notes
   - Move
   - etc..
- Zoom and pan capabilities
- Infinite canvas support

### 3. Project Management
- Project/Session organization
- Session history and versioning
- Integration with version control systems

## Technical Requirements

### Frontend Technologies
1. **Framework**
   - React.js with TypeScript
   - Next.js for server-side rendering and routing
   - Laravel

2. **UI Components**
   - Konva.js for canvas manipulation
   - TailwindCSS for styling
   - Material-UI or Chakra UI for components

3. **State Management**
   - Redux Toolkit or Zustand
   - Yjs for conflict-free replicated data types (CRDT)

### Backend Technologies
1. **Server**
   - Laravel
   - PHP

2. **Real-time Communication**
   - WebSocket (Socket.io)

3. **Database**
   - PostgreSQL for document storage

### DevOps & Infrastructure
1. **Deployment**
   - Docker containers
   - CI/CD pipeline (GitHub Actions or GitLab CI)

2. **Cloud Services**
   - CDN for static assets
   - Load balancing for scalability

## Security Requirements
- Secure WebSocket connections
- JWT-based authentication
- Input sanitization

## Performance Requirements
- Efficient canvas rendering
- Offline support with sync on reconnection

## Development Phases

### Phase 1: MVP
- Basic real-time code editor
- Whiteboard features
- Session management
- Basic collaboration tools

### Frontend MVP (this repo)
- Next.js + TypeScript app lives under `src/frontend`
- Canvas tools: select, pan, rect, ellipse, arrow, text, code block
- Code editing: Monaco modal attached to code blocks
- Export: JSON and PNG
- Autosave: debounced; saves to backend API when configured, falls back to localStorage
- Placeholder API base: `NEXT_PUBLIC_API_BASE` env var

### Preliminary Backend API Contract
- PUT `/boards/:id` saves a complete board document
- GET `/boards/:id` returns a complete board document

Board document shape (WhiteboardDocument):

```
{
  id: string,
  title: string,
  elements: Array<{
    id: string,
    type: "rect"|"ellipse"|"arrow"|"text"|"code",
    position: { x: number, y: number },
    width?: number,
    height?: number,
    points?: number[],
    text?: string,
    code?: string,
    language?: string,
    selected?: boolean,
    createdAt: number,
    updatedAt: number
  }>,
  viewport: { x: number, y: number, scale: number },
  updatedAt: number
}
```

### Phase 2: Enhanced Features
- AI agent integration capabilities (MCP server)
- Chat log with AI prompting possibility
- Improved whiteboard capabilities

### Phase 3: Scale & Optimize
- Performance optimizations
- Security features
- Further API development
- Enhanced UI/UX

This document serves as a living guide and should be updated as the product evolves and new requirements are identified.


