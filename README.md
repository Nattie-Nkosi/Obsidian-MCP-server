# Obsidian MCP Server

A Model Context Protocol (MCP) server that provides programmatic access to your Obsidian vault. This server enables AI assistants and other MCP clients to read, write, edit, and search markdown notes in your Obsidian vault.

## Features

- **Read Notes**: Access individual notes or list all notes in your vault
- **Write Notes**: Create new notes or overwrite existing ones
- **Edit Notes**: Find and replace text within notes
- **Append Content**: Add content to the end of existing notes
- **Search**: Search for notes containing specific text (case-insensitive)
- **MCP Resources**: Expose all vault notes as MCP resources with `obsidian://` URIs
- **Path Security**: Built-in directory traversal protection to keep access restricted to your vault

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

The server implements path validation to prevent directory traversal attacks. All file operations are restricted to the configured vault path.

## License

MIT

## Author

Nattie Nkosi
