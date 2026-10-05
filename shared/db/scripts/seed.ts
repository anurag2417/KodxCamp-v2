import { loadRootEnv } from "../src/load-env.js";

loadRootEnv();

async function main(): Promise<void> {
  console.log("[seed] no seeds defined yet (Phase 1a.1 placeholder)");
  console.log("[seed] real seeds arrive in sub-step 1a.2");
}

main().catch((err: unknown) => {
  console.error("[seed] uncaught:", err);
  process.exit(1);
});
