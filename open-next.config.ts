import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const cloudflareConfig = defineCloudflareConfig();

// The site does not use Next.js image optimization. Keep sharp out of the
// Worker bundle because its native binaries cannot run in workerd.
cloudflareConfig.edgeExternals = [
  ...(cloudflareConfig.edgeExternals ?? []),
  "sharp",
];

export default cloudflareConfig;
