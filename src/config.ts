import * as fs from "fs";

export const OBSIDIAN_VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || process.cwd();

export function validateVaultPath(): void {
  if (!fs.existsSync(OBSIDIAN_VAULT_PATH)) {
    throw new Error(`Obsidian vault path does not exist: ${OBSIDIAN_VAULT_PATH}`);
  }
}

export const SERVER_INFO = {
  name: "obsidian-mcp",
  version: "1.0.0",
} as const;
