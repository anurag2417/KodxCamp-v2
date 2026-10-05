#!/usr/bin/env node
// @ts-check

/**
 * Minimal build script for the portal during Phase 0.
 *
 * The portal is currently a static HTML placeholder. In Phase 1a it becomes
 * a Next.js app with a real build pipeline. For now, "build" means: copy
 * everything from public/ into dist/, so Render has a folder to serve.
 */

import { cp, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const distDir = resolve(root, "dist");

async function build() {
  console.log("[portal] building…");

  if (!existsSync(publicDir)) {
    console.error("[portal] public/ folder not found at", publicDir);
    process.exit(1);
  }

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await cp(publicDir, distDir, { recursive: true });

  console.log("[portal] build complete →", distDir);
}

build().catch((err) => {
  console.error("[portal] build failed:", err);
  process.exit(1);
});
