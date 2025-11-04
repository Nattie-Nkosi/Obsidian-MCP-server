import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type {
  TextContent,
  ResourceContents,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs";
import * as path from "path";

// Configuration
const OBSIDIAN_VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || process.cwd();

// Validate vault path
if (!fs.existsSync(OBSIDIAN_VAULT_PATH)) {
  throw new Error(`Obsidian vault path does not exist: ${OBSIDIAN_VAULT_PATH}`);
}

const server = new Server({
  name: "obsidian-mcp",
  version: "1.0.0",
}, {
  capabilities: {
    resources: {},
    tools: {},
  },
});

// ============= Resource Handlers =============

// List all markdown files in vault
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const notes = getAllMarkdownFiles(OBSIDIAN_VAULT_PATH);
  return {
    resources: notes.map((note) => ({
      uri: `obsidian://${note.uri}`,
      name: note.name,
      mimeType: "text/markdown",
      description: `Note: ${note.name}`,
    })),
  };
});

// Read a specific note
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri.replace("obsidian://", "");
  const filePath = path.join(OBSIDIAN_VAULT_PATH, uri);

  // Security: Prevent directory traversal
  if (!path.resolve(filePath).startsWith(path.resolve(OBSIDIAN_VAULT_PATH))) {
    throw new Error("Access denied: Path outside vault");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Note not found: ${uri}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");

  const contents: ResourceContents[] = [
    {
      uri: request.params.uri,
      mimeType: "text/markdown",
      text: content,
    },
  ];

  return { contents };
});

// ============= Tool Handlers =============

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "write_note",
        description: "Create a new note or overwrite an existing one in the vault",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path within vault (e.g., 'folder/note.md')",
            },
            content: {
              type: "string",
              description: "The markdown content of the note",
            },
          },
          required: ["path", "content"],
        },
      },
      {
        name: "edit_note",
        description: "Edit an existing note by replacing specific content",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path to the note within vault",
            },
            find: {
              type: "string",
              description: "Text to find in the note",
            },
            replace: {
              type: "string",
              description: "Text to replace with",
            },
          },
          required: ["path", "find", "replace"],
        },
      },
      {
        name: "append_note",
        description: "Append content to an existing note",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path to the note within vault",
            },
            content: {
              type: "string",
              description: "Content to append",
            },
          },
          required: ["path", "content"],
        },
      },
      {
        name: "read_note",
        description: "Read the content of a specific note",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Relative path to the note within vault",
            },
          },
          required: ["path"],
        },
      },
      {
        name: "list_notes",
        description: "List all notes in the vault with their paths",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_notes",
        description: "Search for notes containing specific text",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Text to search for",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments as Record<string, string>;

  switch (toolName) {
    case "write_note": {
      if (!args.path || !args.content) {
        throw new Error("path and content parameters are required");
      }
      const notePath = path.join(OBSIDIAN_VAULT_PATH, args.path);
      validatePath(notePath);

      // Create directory if it doesn't exist
      const dir = path.dirname(notePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(notePath, args.content, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: `Note created/updated: ${args.path}`,
          },
        ],
      };
    }

    case "edit_note": {
      if (!args.path || !args.find || !args.replace) {
        throw new Error("path, find, and replace parameters are required");
      }
      const notePath = path.join(OBSIDIAN_VAULT_PATH, args.path);
      validatePath(notePath);

      if (!fs.existsSync(notePath)) {
        throw new Error(`Note not found: ${args.path}`);
      }

      let content = fs.readFileSync(notePath, "utf-8");

      if (!content.includes(args.find)) {
        throw new Error(`Text not found in note: "${args.find}"`);
      }

      content = content.replace(args.find, args.replace);
      fs.writeFileSync(notePath, content, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `Note edited: ${args.path}`,
          },
        ],
      };
    }

    case "append_note": {
      if (!args.path || !args.content) {
        throw new Error("path and content parameters are required");
      }
      const notePath = path.join(OBSIDIAN_VAULT_PATH, args.path);
      validatePath(notePath);

      if (!fs.existsSync(notePath)) {
        throw new Error(`Note not found: ${args.path}`);
      }

      let content = fs.readFileSync(notePath, "utf-8");
      if (!content.endsWith("\n")) {
        content += "\n";
      }
      content += args.content;

      fs.writeFileSync(notePath, content, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `Content appended to: ${args.path}`,
          },
        ],
      };
    }

    case "read_note": {
      if (!args.path) {
        throw new Error("path parameter is required");
      }
      const notePath = path.join(OBSIDIAN_VAULT_PATH, args.path);
      validatePath(notePath);

      if (!fs.existsSync(notePath)) {
        throw new Error(`Note not found: ${args.path}`);
      }

      const content = fs.readFileSync(notePath, "utf-8");
      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    }

    case "list_notes": {
      const notes = getAllMarkdownFiles(OBSIDIAN_VAULT_PATH);
      const noteList = notes.map((n) => n.uri).join("\n");
      return {
        content: [
          {
            type: "text",
            text: noteList || "No notes found in vault",
          },
        ],
      };
    }

    case "search_notes": {
      if (!args.query) {
        throw new Error("Query parameter is required");
      }
      const results = searchNotes(OBSIDIAN_VAULT_PATH, args.query);
      const resultText =
        results.length > 0
          ? results.join("\n")
          : `No notes found containing "${args.query}"`;
      return {
        content: [
          {
            type: "text",
            text: resultText,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
});

// ============= Helper Functions =============

function validatePath(filePath: string) {
  const resolvedPath = path.resolve(filePath);
  const vaultBase = path.resolve(OBSIDIAN_VAULT_PATH);
  if (!resolvedPath.startsWith(vaultBase)) {
    throw new Error("Access denied: Path outside vault");
  }
}

function getAllMarkdownFiles(
  dir: string,
  prefix = ""
): Array<{ uri: string; name: string }> {
  const files: Array<{ uri: string; name: string }> = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip hidden files and common folders
    if (entry.name.startsWith(".")) continue;
    if (entry.name === "node_modules") continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath, relativePath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push({
        uri: relativePath,
        name: entry.name,
      });
    }
  }

  return files;
}

function searchNotes(dir: string, query: string): string[] {
  const results: string[] = [];
  const notes = getAllMarkdownFiles(dir);

  for (const note of notes) {
    const filePath = path.join(dir, note.uri);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.toLowerCase().includes(query.toLowerCase())) {
        results.push(note.uri);
      }
    } catch (e) {
      // Skip unreadable files
    }
  }

  return results;
}

// ============= Server Setup =============

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Obsidian MCP Server running on stdio");
}

main().catch(console.error);