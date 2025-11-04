import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SERVER_INFO, validateVaultPath } from "./config.js";
import { handleListResources, handleReadResource } from "./handlers/resources.js";
import { TOOL_DEFINITIONS, handleToolCall } from "./handlers/tools.js";

export function createServer(): Server {
  validateVaultPath();

  const server = new Server(
    {
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return handleListResources();
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return handleReadResource(request.params.uri);
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOL_DEFINITIONS,
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return handleToolCall(
      request.params.name,
      request.params.arguments as Record<string, string | undefined>
    );
  });

  return server;
}

export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Obsidian MCP Server running on stdio");
}
