#!/usr/bin/env node
// @ts-check

/**
 * Minimal dev server for the portal during Phase 0.
 *
 * Serves public/ on http://localhost:3000 using Node's built-in http module.
 * No dependencies, no bundler, no hot reload — this is just so we can
 * eyeball the placeholder page locally. Real dev tooling arrives with
 * Next.js in Phase 1a.
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "..", "public");
const PORT = Number(process.env["PORT"] ?? 3000);

/** @type {Record<string, string>} */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(url.pathname);

    // Prevent path traversal.
    const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(publicDir, normalized);

    // If path is a directory or has no extension, try index.html.
    try {
      const s = await stat(filePath);
      if (s.isDirectory()) {
        filePath = join(filePath, "index.html");
      }
    } catch {
      if (!extname(filePath)) {
        filePath = join(publicDir, "index.html");
      }
    }

    const content = await readFile(filePath);
    const type = MIME[extname(filePath)] ?? "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`[portal] dev server on http://localhost:${PORT}`);
});
