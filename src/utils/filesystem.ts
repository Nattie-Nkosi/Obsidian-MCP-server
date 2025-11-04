import * as fs from "fs";
import * as path from "path";

export interface NoteInfo {
  uri: string;
  name: string;
}

export function getAllMarkdownFiles(
  dir: string,
  prefix = ""
): NoteInfo[] {
  const files: NoteInfo[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
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

export function searchNotes(dir: string, query: string): string[] {
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

export function readNote(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Note not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}

export function writeNote(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, "utf-8");
}

export function appendToNote(filePath: string, content: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Note not found: ${filePath}`);
  }

  let existingContent = fs.readFileSync(filePath, "utf-8");
  if (!existingContent.endsWith("\n")) {
    existingContent += "\n";
  }
  existingContent += content;

  fs.writeFileSync(filePath, existingContent, "utf-8");
}

export function replaceInNote(
  filePath: string,
  find: string,
  replace: string
): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Note not found: ${filePath}`);
  }

  let content = fs.readFileSync(filePath, "utf-8");

  if (!content.includes(find)) {
    throw new Error(`Text not found in note: "${find}"`);
  }

  content = content.replace(find, replace);
  fs.writeFileSync(filePath, content, "utf-8");
}
