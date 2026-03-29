import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    middleware: "src/middleware.ts",
    vercel: "src/vercel/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["next", "next/server", "next/headers", "@vercel/node"],
});
