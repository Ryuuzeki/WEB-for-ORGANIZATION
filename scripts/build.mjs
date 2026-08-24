import { cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) process.exit(result.status ?? 1);
}

const nextCli = join(projectRoot, "node_modules", "next", "dist", "bin", "next");
run(process.execPath, [nextCli, "build"]);

// OpenNext's local transformer is supported on Linux/macOS. The hosted build
// runs on Linux; Windows keeps the verified standard Next.js build for local QA.
if (process.platform === "win32") process.exit(0);

const openNextCli = join(
  projectRoot,
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "index.js",
);
run(process.execPath, [openNextCli, "build", "--skipNextBuild"]);

const openNextDir = join(projectRoot, ".open-next");
const distDir = join(projectRoot, "dist");
if (!existsSync(join(openNextDir, "worker.js"))) {
  throw new Error("OpenNext did not produce .open-next/worker.js");
}

const workerPath = join(openNextDir, "worker.js");
const originalWorkerPath = join(openNextDir, "worker-original.js");
rmSync(originalWorkerPath, { force: true });
renameSync(workerPath, originalWorkerPath);
writeFileSync(
  workerPath,
  `import * as nodeAssert from "node:assert";
import * as nodeAsyncHooks from "node:async_hooks";
import * as nodeBuffer from "node:buffer";
import * as nodeCrypto from "node:crypto";
import * as nodeEvents from "node:events";
import * as nodeFs from "node:fs";
import * as nodeFsPromises from "node:fs/promises";
import * as nodeOs from "node:os";
import * as nodePath from "node:path";
import * as nodeProcess from "node:process";
import * as nodeStream from "node:stream";
import * as nodeUrl from "node:url";
import * as nodeUtil from "node:util";

const nodeModules = new Map([
  ["assert", nodeAssert],
  ["async_hooks", nodeAsyncHooks],
  ["buffer", nodeBuffer],
  ["crypto", nodeCrypto],
  ["events", nodeEvents],
  ["fs", nodeFs],
  ["fs/promises", nodeFsPromises],
  ["os", nodeOs],
  ["path", nodePath],
  ["process", nodeProcess],
  ["stream", nodeStream],
  ["url", nodeUrl],
  ["util", nodeUtil],
]);

globalThis.require = (specifier) => {
  const normalized = specifier.startsWith("node:") ? specifier.slice(5) : specifier;
  const loaded = nodeModules.get(normalized);
  if (!loaded) throw new Error(\`Unsupported runtime require: \${specifier}\`);
  return loaded;
};

const workerModule = await import("./worker-original.js");
export default workerModule.default;
`,
  "utf8",
);

rmSync(distDir, { recursive: true, force: true });
mkdirSync(join(distDir, "server"), { recursive: true });
cpSync(openNextDir, join(distDir, "server"), { recursive: true });
if (existsSync(join(openNextDir, "assets"))) {
  cpSync(join(openNextDir, "assets"), join(distDir, "client"), {
    recursive: true,
  });
}
mkdirSync(join(distDir, ".openai"), { recursive: true });
cpSync(
  join(projectRoot, ".openai", "hosting.json"),
  join(distDir, ".openai", "hosting.json"),
);
writeFileSync(
  join(distDir, "server", "index.js"),
  'export { default } from "./worker.js";\n',
  "utf8",
);
