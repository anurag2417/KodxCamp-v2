import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  // Bundle workspace packages (they're TS source, not pre-built).
  noExternal: ["@kodxcamp/server-kit", "@kodxcamp/types"],
  // Keep node_modules external — installed normally at runtime on Render.
  external: ["express", "pg", "zod"],
  // Preserve shebangs and ESM semantics.
  splitting: false,
  dts: false,
});
