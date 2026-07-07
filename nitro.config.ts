import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  externals: {
    traceInclude: [
      "node_modules/firebase-admin/**",
      "node_modules/google-auth-library/**",
      "node_modules/jspdf/**",
      "node_modules/xlsx/**"
    ]
  }
});
