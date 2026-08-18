import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
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

rmSync(distDir, { recursive: true, force: true });
cpSync(openNextDir, distDir, { recursive: true });
mkdirSync(join(distDir, "server"), { recursive: true });
writeFileSync(
  join(distDir, "server", "index.js"),
  'export { default } from "../worker.js";\n',
  "utf8",
);
