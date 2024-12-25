import { build } from "esbuild";
import { glob } from "glob";
import { dtsPlugin } from "esbuild-plugin-d.ts";

async function buildPackage() {
  try {
    const entryPoints = await glob("build/**/*.{ts,tsx}");

    // ESM 构建
    await build({
      entryPoints,
      outdir: "dist/esm",
      format: "esm",
      target: "es2019",
      jsx: "transform",
      plugins: [dtsPlugin()],
      external: ["react"],
      bundle: true,
      splitting: true,
      minify: true,
    });

    // CJS 构建
    await build({
      entryPoints,
      outdir: "dist/cjs",
      format: "cjs",
      target: "es2019",
      jsx: "transform",
      plugins: [dtsPlugin()],
      external: ["react"],
      bundle: true,
      minify: true,
    });
  } catch (error) {
    console.error("Error building package:", error);
    process.exit(1);
  }
}

buildPackage();
