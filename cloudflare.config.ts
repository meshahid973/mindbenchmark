import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "mindbenchmark",
    entrypoint: "./worker/index.ts",
    compatibilityDate: "2026-11-13",
    assets: {
      notFoundHandling: "single-page-application",
      runWorkerFirst: ["/api/*"],
    },
  },
});
