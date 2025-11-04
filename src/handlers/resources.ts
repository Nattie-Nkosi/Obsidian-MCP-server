import type { ResourceContents } from "@modelcontextprotocol/sdk/types.js";
import * as path from "path";
import { OBSIDIAN_VAULT_PATH } from "../config.js";
import { getAllMarkdownFiles, readNote } from "../utils/filesystem.js";
import { validatePath } from "../utils/validation.js";

export async function handleListResources() {
  const notes = getAllMarkdownFiles(OBSIDIAN_VAULT_PATH);
  return {
    resources: notes.map((note) => ({
      uri: `obsidian://${note.uri}`,
      name: note.name,
      mimeType: "text/markdown",
      description: `Note: ${note.name}`,
    })),
  };
}

export async function handleReadResource(uri: string) {
  const cleanUri = uri.replace("obsidian://", "");
  const filePath = path.join(OBSIDIAN_VAULT_PATH, cleanUri);

  validatePath(filePath);

  const content = readNote(filePath);

  const contents: ResourceContents[] = [
    {
      uri: `obsidian://${cleanUri}`,
      mimeType: "text/markdown",
      text: content,
    },
  ];

  return { contents };
}
