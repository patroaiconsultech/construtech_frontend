// Reconciled test runner: preserves the frozen eight-file application patch.
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const testDir = join(projectRoot, "tests");
const files = readdirSync(testDir)
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => join(testDir, name));

if (files.length === 0) {
  console.error("NO_TEST_FILES_FOUND");
  process.exit(1);
}
const result = spawnSync(process.execPath, ["--test", ...files], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
  shell: false,
});
if (result.error) {
  console.error("TEST_RUNNER_SPAWN_FAILED", result.error.code ?? "UNKNOWN");
  process.exit(1);
}
process.exit(result.status ?? 1);
