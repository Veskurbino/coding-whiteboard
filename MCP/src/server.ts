import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Basic MCP server skeleton with a few example tools.
// Run in dev: npm run dev
// Build: npm run build
// Run built: npm start

const server = new McpServer({
  name: "coding-whiteboard-mcp",
  version: "0.1.0",
});

// echo: returns the same text
server.tool(
  "echo",
  "Echo back provided text",
  {
    text: z.string().min(1, "text is required").describe("Text to echo back"),
  },
  async ({ text }) => {
    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  }
);

// time: returns current time in ISO 8601
server.tool(
  "time",
  "Get the current time in ISO 8601",
  {},
  async () => {
    const nowIso = new Date().toISOString();
    return {
      content: [
        {
          type: "text",
          text: nowIso,
        },
      ],
    };
  }
);

// system-info: returns basic system diagnostics
server.tool(
  "system-info",
  "Get basic system information",
  {},
  async () => {
    const info = {
      platform: process.platform,
      architecture: process.arch,
      nodeVersion: process.version,
      pid: process.pid,
      cwd: process.cwd(),
      execPath: process.execPath,
      envSample: {
        PATH: process.env.PATH ?? "",
      },
    };
    const asText = JSON.stringify(info, null, 2);
    return {
      content: [
        {
          type: "text",
          text: asText,
        },
      ],
    };
  }
);

// Connect transport via stdio (ideal for IDE integration)
const transport = new StdioServerTransport();
server.connect(transport);

// Optional: graceful shutdown
const shutdown = (signal: string) => {
  console.error(`[mcp] received ${signal}, exiting`);
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));


