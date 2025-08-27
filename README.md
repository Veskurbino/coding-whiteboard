# Real-Time Collaborative Code Whiteboard

## Product Overview
A real-time collaborative code whiteboard platform that allows multiple users to write, edit, and share code simultaneously in a visual workspace environment. The platform enables developers, educators, and teams to collaborate effectively during code reviews, teaching sessions, and pair programming.

## Core Features

### 1. Real-Time Collaboration
- Multi-user simultaneous editing
- Real-time cursor positions and user presence indicators
- Live code synchronization across all connected users (set remote branch to poll)
- Collaborative drawing tools for text boxes diagrams and annotations

### 2. Code Editor block Features
- Syntax highlighting for multiple programming languages
- Code auto-completion and suggestions
- Line numbering and code folding
- Multiple cursors support
- Code formatting and linting
- Error highlighting and suggestions
- Code block address data compared to git repository

### 3. Whiteboard Features
- Drawing tools (pen, shapes, text)
- Code blocks that can be moved and resized on the canvas
- Ability to create/generate arrows and connections between code blocks
- Ability to generate architecture diagrams based on git repository data
- Zoom and pan capabilities
- Infinite canvas support

### 4. Collaboration Tools
- Chat with AI prompts (agentic coding support)
- User cursors and highlights
- Ability to save session data
- Export functionality (PNG, PDF, code files)

### 5. Project Management
- Project/Session organization
- Session history and versioning
- Integration with version control systems

## Technical Requirements

### Frontend Technologies
1. **Framework**
   - React.js with TypeScript
   - Next.js for server-side rendering and routing

2. **UI Components**
   - Monaco Editor for code editing
   - Konva.js for canvas manipulation
   - TailwindCSS for styling
   - Material-UI or Chakra UI for components

3. **State Management**
   - Redux Toolkit or Zustand
   - Yjs for conflict-free replicated data types (CRDT)

### Backend Technologies
1. **Server**
   - Node.js with Express.js or NestJS
   - TypeScript for type safety

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
- Rate limiting
- Input sanitization
- CORS policies
- Data encryption at rest and in transit

## Performance Requirements
- Low latency (< 100ms) for real-time updates
- Efficient canvas rendering
- Optimized network payload
- Offline support with sync on reconnection

## Development Phases

### Phase 1: MVP
- Basic real-time code editor
- Simple whiteboard features
- Session management
- Basic collaboration tools
- Git repository connection

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

