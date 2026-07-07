import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  externals: {
    external: [
      "firebase-admin",
      "firebase-admin/app",
      "firebase-admin/messaging",
      "firebase-admin/firestore"
    ]
  }
});
