import { defineNitroConfig } from "nitropack/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const _dirname = dirname(fileURLToPath(import.meta.url));

export default defineNitroConfig({
  externals: {
    traceInclude: [
      resolve(_dirname, "node_modules/firebase-admin") + "/**",
      resolve(_dirname, "node_modules/google-auth-library") + "/**",
      resolve(_dirname, "node_modules/jspdf") + "/**",
      resolve(_dirname, "node_modules/xlsx") + "/**"
    ]
  }
});
