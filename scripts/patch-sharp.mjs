import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nodeModulesRoot = resolve(projectRoot, "node_modules");
const sharpDir = resolve(nodeModulesRoot, "sharp");
const fileLoggerPath = resolve(
  nodeModulesRoot,
  "next/dist/server/dev/browser-logs/file-logger.js",
);
const consoleDimPath = resolve(
  nodeModulesRoot,
  "next/dist/server/node-environment-extensions/console-dim.external.js",
);
const fastImmediatePath = resolve(
  nodeModulesRoot,
  "next/dist/server/node-environment-extensions/fast-set-immediate.external.js",
);
const nodeCryptoPath = resolve(
  nodeModulesRoot,
  "next/dist/server/node-environment-extensions/node-crypto.js",
);
const webCryptoPath = resolve(
  nodeModulesRoot,
  "next/dist/server/node-environment-extensions/web-crypto.js",
);

if (!sharpDir.startsWith(`${nodeModulesRoot}${sep}`)) {
  throw new Error("Refusing to patch sharp outside node_modules.");
}

rmSync(sharpDir, { recursive: true, force: true });
mkdirSync(sharpDir, { recursive: true });
writeFileSync(
  join(sharpDir, "package.json"),
  JSON.stringify({ name: "sharp", version: "0.35.3", main: "index.cjs" }, null, 2),
  "utf8",
);
writeFileSync(
  join(sharpDir, "index.cjs"),
  `"use strict";\n\nfunction sharpUnavailable() {\n  throw new Error("Next.js image optimization is disabled for this site.");\n}\n\nsharpUnavailable.versions = { sharp: "0.35.3" };\nmodule.exports = sharpUnavailable;\n`,
  "utf8",
);

if (
  ![
    fileLoggerPath,
    consoleDimPath,
    fastImmediatePath,
    nodeCryptoPath,
    webCryptoPath,
  ].every((filePath) => filePath.startsWith(`${nodeModulesRoot}${sep}`))
) {
  throw new Error("Refusing to patch Next.js outside node_modules.");
}

writeFileSync(
  fileLoggerPath,
  `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nclass FileLogger {\n  initialize() {}\n  isEnabled() { return false; }\n  log() {}\n  logServer() {}\n  logBrowser() {}\n  forceFlush() {}\n  destroy() {}\n}\nlet fileLogger = null;\nfunction getFileLogger() {\n  if (!fileLogger) fileLogger = new FileLogger();\n  return fileLogger;\n}\nfunction test__resetFileLogger() { fileLogger = null; }\nexports.FileLogger = FileLogger;\nexports.getFileLogger = getFileLogger;\nexports.test__resetFileLogger = test__resetFileLogger;\n`,
  "utf8",
);

writeFileSync(
  consoleDimPath,
  `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nfunction setAbortedLogsStyle() {}\nexports.setAbortedLogsStyle = setAbortedLogsStyle;\n`,
  "utf8",
);

writeFileSync(
  fastImmediatePath,
  `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nfunction DANGEROUSLY_runPendingImmediatesAfterCurrentTask() {}\nfunction expectNoPendingImmediates() {}\nexports.DANGEROUSLY_runPendingImmediatesAfterCurrentTask = DANGEROUSLY_runPendingImmediatesAfterCurrentTask;\nexports.expectNoPendingImmediates = expectNoPendingImmediates;\nexports.unpatchedSetImmediate = globalThis.setImmediate;\n`,
  "utf8",
);

for (const cryptoExtensionPath of [nodeCryptoPath, webCryptoPath]) {
  writeFileSync(
    cryptoExtensionPath,
    `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n`,
    "utf8",
  );
}
