# MCP Server Skeleton

Quick and dirty local MCP server you can plug into MCP-capable IDEs and agents.

## Features

- Stdio transport using `@modelcontextprotocol/sdk`
- Example tools to copy/paste and extend:
  - `echo(text)`
  - `time()`
  - `system-info()`
- TypeScript + `tsx` for fast dev runs

## Prerequisites

- Node.js 18+

## Install

```sh
npm install
```

## Run (dev)

```sh
npm run dev
```

This starts the server over stdio. Point your IDE/agent to run this command as the MCP server.

## Build

```sh
npm run build
```

## Run (built)

```sh
npm start
```

## Add your own tool

Open `src/server.ts` and follow the existing pattern:

```ts
server.tool(
  "your-tool-name",
  "Short description",
  { /* zod schema for inputs */ },
  async (inputs) => {
    return {
      content: [
        { type: "text", text: "result text or structured data as text" },
      ],
    };
  }
);
```

- Use `zod` to validate inputs.
- Return `content` as an array; simplest is `{ type: "text", text: "..." }`.

## IDE Integration

- Configure your IDE's MCP integration to launch the command used above (e.g. `npm run dev`).
- Transport: stdio.

## Files

- `src/server.ts` – server entry with example tools
- `tsconfig.json` – TypeScript config
- `package.json` – scripts and deps

## Notes

- This skeleton intentionally keeps things minimal for a hackathon-grade setup. Add auth, logging, persistence, etc., as needed.
