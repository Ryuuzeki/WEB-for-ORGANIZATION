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
run(process.execPath, [nextCli, "build", "--webpack"]);

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
import * as __codexNodeConsole from "node:console";
import * as __codexNodeCrypto from "node:crypto";
import * as __codexNodeDiagnosticsChannel from "node:diagnostics_channel";
import * as __codexNodeDns from "node:dns";
import * as __codexNodeDnsPromises from "node:dns/promises";
import * as __codexNodeEvents from "node:events";
import * as __codexNodeFs from "node:fs";
import * as __codexNodeFsPromises from "node:fs/promises";
import * as __codexNodeHttp from "node:http";
import * as __codexNodeHttps from "node:https";
import * as __codexNodeModule from "node:module";
import * as __codexNodeNet from "node:net";
import * as __codexNodeOs from "node:os";
import * as __codexNodePath from "node:path";
import * as __codexNodePerfHooks from "node:perf_hooks";
import * as __codexNodeProcess from "node:process";
import * as __codexNodeQuerystring from "node:querystring";
import * as __codexNodeStream from "node:stream";
import * as __codexNodeStreamPromises from "node:stream/promises";
import * as __codexNodeStreamWeb from "node:stream/web";
import * as __codexNodeTimers from "node:timers";
import * as __codexNodeTimersPromises from "node:timers/promises";
import * as __codexNodeUrl from "node:url";
import * as __codexNodeUtil from "node:util";
import * as __codexNodeV8 from "node:v8";
import * as __codexNodeVm from "node:vm";
import * as __codexNodeZlib from "node:zlib";

const __codexRequireModules = new Map([
  ["assert", __codexNodeAssert],
  ["async_hooks", __codexNodeAsyncHooks],
  ["buffer", __codexNodeBuffer],
  ["console", __codexNodeConsole],
  ["crypto", __codexNodeCrypto],
  ["diagnostics_channel", __codexNodeDiagnosticsChannel],
  ["dns", __codexNodeDns],
  ["dns/promises", __codexNodeDnsPromises],
  ["events", __codexNodeEvents],
  ["fs", __codexNodeFs],
  ["fs/promises", __codexNodeFsPromises],
  ["http", __codexNodeHttp],
  ["https", __codexNodeHttps],
  ["module", __codexNodeModule.default ?? __codexNodeModule.Module],
  ["net", __codexNodeNet],
  ["os", __codexNodeOs],
  ["path", __codexNodePath],
  ["perf_hooks", __codexNodePerfHooks],
  ["process", __codexNodeProcess],
  ["querystring", __codexNodeQuerystring],
  ["stream", __codexNodeStream],
  ["stream/promises", __codexNodeStreamPromises],
  ["stream/web", __codexNodeStreamWeb],
  ["timers", __codexNodeTimers],
  ["timers/promises", __codexNodeTimersPromises],
  ["url", __codexNodeUrl],
  ["util", __codexNodeUtil],
  ["v8", __codexNodeV8],
  ["vm", __codexNodeVm],
  ["zlib", __codexNodeZlib],
]);

const __codexRequire = (specifier) => {
  const normalized = specifier.startsWith("node:") ? specifier.slice(5) : specifier;
  const loaded = __codexRequireModules.get(normalized);
  if (!loaded) throw new Error(\`Unsupported runtime require: \${specifier}\`);
  return loaded;
};

// Next's require hook probes optional packages through require.resolve().
// The packages are already bundled for Workers, so an unresolved probe should
// simply follow the hook's existing try/catch fallback.
__codexRequire.resolve = (specifier) => {
  throw new Error(\`Runtime resolution is unavailable for bundled module: \${specifier}\`);
};

globalThis.require = __codexRequire;

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
