import { build } from "esbuild";
import { glob } from "glob";
import { dtsPlugin } from "esbuild-plugin-d.ts";
import { promises as fs } from "fs";
import path from "path";

async function buildPackage() {
  try {
    const entryPoints = await glob("build/**/*.{ts,tsx}");

    // 处理图片文件
    const imageFiles = await glob("build/image/*.{png,jpg,jpeg,gif,webp}");

    // 确保图片目录存在
    await fs.mkdir("dist/esm/image", { recursive: true });
    await fs.mkdir("dist/cjs/image", { recursive: true });

    // 为组件中导入图片创建目录
    await fs.mkdir("dist/esm/components/image/images", { recursive: true });
    await fs.mkdir("dist/cjs/components/image/images", { recursive: true });

    // 为demo应用创建图片目录
    // Vite默认会从public目录复制静态资源
    await fs
      .mkdir("../../demos/public/image", { recursive: true })
      .catch((err) => {
        console.warn(
          "Warning: Could not create demos/public/image directory:",
          err
        );
      });

    // 复制图片文件到dist目录和demo应用的public目录
    for (const file of imageFiles) {
      const fileName = path.basename(file);

      // 复制到dist目录
      await fs.copyFile(file, `dist/esm/image/${fileName}`);
      await fs.copyFile(file, `dist/cjs/image/${fileName}`);

      // 复制到组件images目录 - 这样import导入路径才能正确解析
      await fs.copyFile(file, `dist/esm/components/image/images/${fileName}`);
      await fs.copyFile(file, `dist/cjs/components/image/images/${fileName}`);

      // 复制到demo应用的Vite public目录，这样可以通过/image/xxx.png访问
      try {
        await fs.copyFile(file, `../../demos/public/image/${fileName}`);
        console.log(`Copied ${fileName} to demos/public/image/`);
      } catch (err) {
        console.warn(
          `Warning: Could not copy ${fileName} to demos/public/image:`,
          err
        );
      }
    }

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
      loader: {
        ".png": "file",
        ".jpg": "file",
        ".jpeg": "file",
        ".gif": "file",
        ".webp": "file",
      },
      // 图片输出到image目录
      assetNames: "image/[name]-[hash]",
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
      loader: {
        ".png": "file",
        ".jpg": "file",
        ".jpeg": "file",
        ".gif": "file",
        ".webp": "file",
      },
      // 图片输出到image目录
      assetNames: "image/[name]-[hash]",
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
