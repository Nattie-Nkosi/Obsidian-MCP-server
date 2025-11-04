# Obsidian MCP Server

A Model Context Protocol (MCP) server that provides programmatic access to your Obsidian vault. This server enables AI assistants and other MCP clients to read, write, edit, and search markdown notes in your Obsidian vault.

<div align="center">
<img src="image.png" alt="Obsidian MCP Server Icon" width="128" height="128">
</div>

Built with a clean, modular architecture following separation of concerns principles for maintainability and extensibility.

## Features

- **Read Notes**: Access individual notes or list all notes in your vault
- **Write Notes**: Create new notes or overwrite existing ones
- **Edit Notes**: Find and replace text within notes
- **Append Content**: Add content to the end of existing notes
- **Search**: Search for notes containing specific text (case-insensitive)
- **MCP Resources**: Expose all vault notes as MCP resources with `obsidian://` URIs
- **Path Security**: Built-in directory traversal protection to keep access restricted to your vault
- **Clean Architecture**: Modular codebase with clear separation of concerns
- **Type Safety**: Fully typed with TypeScript for reliability

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root:

```env
OBSIDIAN_VAULT_PATH=C:\path\to\your\obsidian\vault
```

If not specified, the server will default to the current working directory.

## Usage

### Build and Run

```bash
# Build the TypeScript project
npm run build

# Run the compiled server
npm start
```

### Development

```bash
# Run directly from TypeScript source
npm run dev
```

## Project Structure

The codebase follows a modular architecture with clear separation of concerns:

```
src/
├── index.ts              # Entry point - starts the server
├── server.ts             # Server initialization and request handler setup
├── config.ts             # Configuration and environment variables
├── handlers/
│   ├── resources.ts      # MCP resource handlers (list/read notes)
│   └── tools.ts          # MCP tool handlers and definitions
└── utils/
    ├── validation.ts     # Path validation and argument checking
    └── filesystem.ts     # File system operations
```

### Architecture Highlights

- **Modular Design**: Each module has a single, clear responsibility
- **Handler Separation**: Resources and tools are handled in separate modules
- **Reusable Utilities**: Common operations abstracted into utility functions
- **Centralized Validation**: Security and input validation in dedicated modules
- **Easy Testing**: Isolated functions for better unit testing
- **Maintainability**: Clear code organization makes updates simple

## MCP Client Integration

This server uses stdio transport and can be integrated with any MCP client. Add the following to your MCP client configuration:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/path/to/obsidian-mcp-server/dist/index.js"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "C:\\path\\to\\your\\obsidian\\vault"
      }
    }
  }
}
```

### Example Client Integrations

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/Users/username/projects/obsidian-mcp-server/dist/index.js"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/Users/username/Documents/ObsidianVault"
      }
    }
  }
}
```

**Windows** (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["C:\\projects\\obsidian-mcp-server\\dist\\index.js"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "C:\\Users\\username\\Documents\\ObsidianVault"
      }
    }
  }
}
```

## Available Tools

### `write_note`

Create a new note or overwrite an existing one.

**Parameters:**

- `path` (string): Relative path within vault (e.g., `folder/note.md`)
- `content` (string): The markdown content

### `edit_note`

Edit an existing note by replacing specific text.

**Parameters:**

- `path` (string): Relative path to the note
- `find` (string): Text to find
- `replace` (string): Text to replace with

### `append_note`

Append content to an existing note.

**Parameters:**

- `path` (string): Relative path to the note
- `content` (string): Content to append

### `read_note`

Read the content of a specific note.

**Parameters:**

- `path` (string): Relative path to the note

### `list_notes`

List all notes in the vault with their paths.

**Parameters:** None

### `search_notes`

Search for notes containing specific text (case-insensitive).

**Parameters:**

- `query` (string): Text to search for

## Resources

All markdown files in your vault are exposed as MCP resources with:

- **URI**: `obsidian://{relative-path}`
- **MIME Type**: `text/markdown`
- **Name**: The filename

## Security

The server implements multiple security measures:

- **Path Validation**: All file operations validate paths to prevent directory traversal attacks
- **Vault Restriction**: Operations are strictly limited to the configured vault path
- **Input Validation**: Tool arguments are validated before processing
- **Error Handling**: Graceful error handling with informative error messages

## Technical Details

### Technologies

- **Language**: TypeScript (ESM modules)
- **MCP SDK**: `@modelcontextprotocol/sdk` v0.6.1+
- **Transport**: stdio (Standard Input/Output)
- **Node.js**: Built for modern Node.js with ES2022+ features

### MCP Protocol Implementation

This server implements the Model Context Protocol specification:

- **Resources**: Exposes vault notes as readable resources with custom `obsidian://` URIs
- **Tools**: Provides six tools for complete note management
- **Stdio Transport**: Communicates via standard input/output for easy integration

### Development

To extend the server with new functionality:

1. **Add new tools**: Define tool schemas in `src/handlers/tools.ts` and implement handlers
2. **Add utilities**: Create reusable functions in `src/utils/`
3. **Extend validation**: Add new validation rules in `src/utils/validation.ts`
4. **Modify resources**: Update resource handlers in `src/handlers/resources.ts`

The modular architecture makes it easy to add new features without affecting existing functionality.

## Contributing

Contributions are welcome! The clean architecture and TypeScript types make it easy to understand and extend the codebase.

## License

MIT

## Author

Nattie Nkosi
