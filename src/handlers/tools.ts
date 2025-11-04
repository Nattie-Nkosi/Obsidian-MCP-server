import * as path from "path";
import { OBSIDIAN_VAULT_PATH } from "../config.js";
import {
  getAllMarkdownFiles,
  searchNotes,
  readNote,
  writeNote,
  appendToNote,
  replaceInNote,
} from "../utils/filesystem.js";
import { validatePath, validateToolArguments } from "../utils/validation.js";

export const TOOL_DEFINITIONS = [
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
];

type ToolResponse = {
  content: Array<{ type: string; text: string }>;
};

export async function handleToolCall(
  toolName: string,
  args: Record<string, string | undefined>
): Promise<ToolResponse> {
  switch (toolName) {
    case "write_note":
      return handleWriteNote(args);
    case "edit_note":
      return handleEditNote(args);
    case "append_note":
      return handleAppendNote(args);
    case "read_note":
      return handleReadNote(args);
    case "list_notes":
      return handleListNotes();
    case "search_notes":
      return handleSearchNotes(args);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function handleWriteNote(
  args: Record<string, string | undefined>
): Promise<ToolResponse> {
  validateToolArguments(args, ["path", "content"]);

  const notePath = path.join(OBSIDIAN_VAULT_PATH, args.path!);
  validatePath(notePath);

  writeNote(notePath, args.content!);

  return {
    content: [
      {
        type: "text",
        text: `Note created/updated: ${args.path}`,
      },
    ],
  };
}

async function handleEditNote(
  args: Record<string, string | undefined>
): Promise<ToolResponse> {
  validateToolArguments(args, ["path", "find", "replace"]);

  const notePath = path.join(OBSIDIAN_VAULT_PATH, args.path!);
  validatePath(notePath);

  replaceInNote(notePath, args.find!, args.replace!);

  return {
    content: [
      {
        type: "text",
        text: `Note edited: ${args.path}`,
      },
    ],
  };
}

async function handleAppendNote(
  args: Record<string, string | undefined>
): Promise<ToolResponse> {
  validateToolArguments(args, ["path", "content"]);

  const notePath = path.join(OBSIDIAN_VAULT_PATH, args.path!);
  validatePath(notePath);

  appendToNote(notePath, args.content!);

  return {
    content: [
      {
        type: "text",
        text: `Content appended to: ${args.path}`,
      },
    ],
  };
}

async function handleReadNote(
  args: Record<string, string | undefined>
): Promise<ToolResponse> {
  validateToolArguments(args, ["path"]);

  const notePath = path.join(OBSIDIAN_VAULT_PATH, args.path!);
  validatePath(notePath);

  const content = readNote(notePath);

  return {
    content: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}

async function handleListNotes(): Promise<ToolResponse> {
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

async function handleSearchNotes(
  args: Record<string, string | undefined>
): Promise<ToolResponse> {
  validateToolArguments(args, ["query"]);

  const results = searchNotes(OBSIDIAN_VAULT_PATH, args.query!);
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
