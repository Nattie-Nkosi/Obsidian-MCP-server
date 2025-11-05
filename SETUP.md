# Docker Auto-Start Setup for Windows

This guide will help you run the Obsidian MCP server automatically on Windows startup using Docker.

## Prerequisites

- Docker Desktop installed on Windows
- Docker Desktop set to start on Windows startup

## Setup Instructions

### 1. Configure Your Vault Path

Create a `docker-compose.override.yml` file (ignored by git) with your personal vault path:

```yaml
version: '3.8'

services:
  obsidian-mcp-server:
    volumes:
      - "C:/Users/YOUR_USERNAME/path/to/your/Obsidian Vault:/vault"
```

Or copy the example file:
```bash
copy docker-compose.override.yml.example docker-compose.override.yml
```

Then edit it with your actual vault path.

### 2. Configure Docker Desktop to Start on Boot

1. Open Docker Desktop
2. Go to Settings (gear icon)
3. Under "General", ensure **"Start Docker Desktop when you log in"** is checked
4. Click "Apply & Restart"

### 3. Build and Run the Container

Open PowerShell or Command Prompt in this project directory and run:

```bash
docker-compose up -d --build
```

This will:
- Build the Docker image
- Start the container in detached mode
- Set the container to restart automatically (even after PC reboot)

### 4. Configure MCP Client (Claude Desktop)

If you're using Claude Desktop or another MCP client, update your configuration file:

**Location**: `%APPDATA%\Claude\claude_desktop_config.json`

Add or update the MCP server configuration:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "obsidian-mcp-server",
        "node",
        "dist/index.js"
      ]
    }
  }
}
```

### 5. Verify Container is Running

Check if the container is running:

```bash
docker ps
```

You should see `obsidian-mcp-server` in the list.

### 6. View Logs (Optional)

To view the server logs:

```bash
docker-compose logs -f
```

## Management Commands

### Stop the server
```bash
docker-compose stop
```

### Start the server
```bash
docker-compose start
```

### Restart the server
```bash
docker-compose restart
```

### Stop and remove the container
```bash
docker-compose down
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

## Troubleshooting

### Container not starting after reboot
1. Ensure Docker Desktop is running
2. Check container status: `docker ps -a`
3. Check logs: `docker-compose logs`

### Vault path issues
- Ensure the vault path in `docker-compose.override.yml` matches your actual Obsidian vault location
- Check that Docker Desktop has access to the drive (Settings > Resources > File Sharing)
- If you don't have an override file, create one from the example: `copy docker-compose.override.yml.example docker-compose.override.yml`

### MCP client can't connect
- Verify container is running: `docker ps`
- Ensure the container name matches in your MCP client config
- Restart your MCP client after configuration changes

## Notes

- The vault has full read/write access in the Docker container
- The container will automatically restart if it crashes
- Docker must be running for the container to be accessible
- Your personal vault path is stored in `docker-compose.override.yml` which is gitignored
