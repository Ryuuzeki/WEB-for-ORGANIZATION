import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nodeModulesRoot = resolve(projectRoot, "node_modules");
const sharpDir = resolve(nodeModulesRoot, "sharp");

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
