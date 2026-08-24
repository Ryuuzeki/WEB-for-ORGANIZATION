import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

const handlerPath = join(
  openNextDir,
  "server-functions",
  "default",
  "handler.mjs",
);
if (!existsSync(handlerPath)) {
  throw new Error("OpenNext did not produce the default server handler.");
}
const handlerSource = readFileSync(handlerPath, "utf8");
writeFileSync(
  handlerPath,
  `import * as __codexNodeAssert from "node:assert";
import * as __codexNodeAsyncHooks from "node:async_hooks";
import * as __codexNodeBuffer from "node:buffer";
import * as __codexNodeCrypto from "node:crypto";
import * as __codexNodeEvents from "node:events";
import * as __codexNodeFs from "node:fs";
import * as __codexNodeFsPromises from "node:fs/promises";
import * as __codexNodeOs from "node:os";
import * as __codexNodePath from "node:path";
import * as __codexNodeQuerystring from "node:querystring";
import * as __codexNodeStream from "node:stream";
import * as __codexNodeStreamPromises from "node:stream/promises";
import * as __codexNodeUrl from "node:url";
import * as __codexNodeUtil from "node:util";
import * as __codexNodeZlib from "node:zlib";

const __codexRequireModules = new Map([
  ["assert", __codexNodeAssert],
  ["async_hooks", __codexNodeAsyncHooks],
  ["buffer", __codexNodeBuffer],
  ["crypto", __codexNodeCrypto],
  ["events", __codexNodeEvents],
  ["fs", __codexNodeFs],
  ["fs/promises", __codexNodeFsPromises],
  ["os", __codexNodeOs],
  ["path", __codexNodePath],
  ["querystring", __codexNodeQuerystring],
  ["stream", __codexNodeStream],
  ["stream/promises", __codexNodeStreamPromises],
  ["url", __codexNodeUrl],
  ["util", __codexNodeUtil],
  ["zlib", __codexNodeZlib],
]);

globalThis.require = (specifier) => {
  const normalized = specifier.startsWith("node:") ? specifier.slice(5) : specifier;
  const loaded = __codexRequireModules.get(normalized);
  if (!loaded) throw new Error(\`Unsupported runtime require: \${specifier}\`);
  return loaded;
};

${handlerSource}
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
