import * as path from "path";
import { OBSIDIAN_VAULT_PATH } from "../config.js";

export function validatePath(filePath: string): void {
  const resolvedPath = path.resolve(filePath);
  const vaultBase = path.resolve(OBSIDIAN_VAULT_PATH);
  if (!resolvedPath.startsWith(vaultBase)) {
    throw new Error("Access denied: Path outside vault");
  }
}

export function validateToolArguments(
  args: Record<string, string | undefined>,
  required: string[]
): void {
  const missing = required.filter((key) => !args[key]);
  if (missing.length > 0) {
    throw new Error(`Required parameters missing: ${missing.join(", ")}`);
  }
}
