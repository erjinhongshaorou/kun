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
      plugins: [],
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
      plugins: [],
      external: ["react"],
      bundle: true,
      minify: true,
    });

    // 单独生成类型定义文件
    console.log("Generating type definitions...");
    try {
      // 先检查入口文件是否存在
      const indexFiles = await glob("build/**/*.ts");
      console.log("Available entry files:", indexFiles);

      // 使用实际存在的入口文件
      await build({
        entryPoints: indexFiles,
        outdir: "dist/types",
        format: "esm",
        plugins: [dtsPlugin({ outDir: "dist/types" })],
        external: ["react"],
        bundle: true, // 打包，生成类型定义
        write: false, // 不写入文件，只生成类型定义
      }).catch((err: any) => {
        console.warn(
          "Warning: Type generation failed, but build will continue:",
          err
        );
        // 类型生成失败不影响构建
      });
    } catch (err) {
      console.warn(
        "Warning: Type generation setup failed, but build will continue:",
        err
      );
    }
  } catch (error) {
    console.error("Error building package:", error);
    process.exit(1);
  }
}

buildPackage();
