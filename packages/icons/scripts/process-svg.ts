import { optimize, Config } from "svgo";

// 定义颜色映射的类型
type ColorMap = {
  [key: `#${string}`]: string;
};

// 定义颜色映射对象
const COLOR_MAPPINGS: ColorMap = {
  "#000000": "var(--ll-svg-default-color)",
  "#1246ff": "currentColor",
  "#e5e5eb": "var(--ll-svg-second-color)",
} as const;

// 检查颜色是否在映射中的辅助函数
function isValidColor(color: string): color is keyof typeof COLOR_MAPPINGS {
  return color.toLowerCase() in COLOR_MAPPINGS;
}

// SVGO 配置
const optimizeConfig: Config = {
  plugins: [
    "removeXMLNS",
    {
      name: "removeAttrs",
      params: {
        attrs: ["class", "data-slot", "width", "height", "aria-hidden"],
      },
    },
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
    // 自定义颜色替换插件
    {
      name: "customColorReplacer",
      fn: () => {
        return {
          element: {
            enter: (node) => {
              if (node.type === "element") {
                // 处理 fill 属性
                const fill = node.attributes.fill;
                if (fill && isValidColor(fill)) {
                  node.attributes.fill = COLOR_MAPPINGS[fill];
                }

                // 处理 stroke 属性
                const stroke = node.attributes.stroke;
                if (stroke && isValidColor(stroke)) {
                  node.attributes.stroke = COLOR_MAPPINGS[stroke];
                }
              }
            },
          },
        };
      },
    },
  ],
};

// 导出处理 SVG 的函数
export function processSvg(svg: string): string {
  const optimizedSvg = optimize(svg, optimizeConfig);
  return optimizedSvg.data;
}
