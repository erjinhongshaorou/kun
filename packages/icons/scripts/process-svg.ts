import { optimize, Config } from "svgo";

// 定义颜色映射的类型
type ColorMap = {
  [key: string]: string;
};

// 定义不同风格的颜色映射对象
const STYLE_COLOR_MAPPINGS = {
  // outline 和 solid 风格的颜色映射
  standard: {
    "#000000": "var(--ll-svg-default-color)",
    black: "var(--ll-svg-default-color)", // 添加对 black 的支持
    "#007BFE": "currentColor",
    "#EEF1FB": "var(--ll-svg-second-color)",
  } as ColorMap,

  // default 风格的颜色映射
  default: {
    "#000000": "currentColor", // default 风格下黑色映射到 currentColor
    black: "currentColor", // 添加对 black 的支持
  } as ColorMap,
};

// 定义需要保留原始值的特殊颜色
const PRESERVED_COLORS = new Set(["none", "white"]);

// 创建针对不同样式的配置
function createOptimizeConfig(style: string): Config {
  // 选择合适的颜色映射
  const colorMappings =
    style === "default"
      ? STYLE_COLOR_MAPPINGS.default
      : STYLE_COLOR_MAPPINGS.standard;

  return {
    plugins: [
      "removeXMLNS",
      {
        // 移除 removeAttrs 插件，我们将在 customHandler 中处理 width 和 height
        name: "customHandler",
        fn: () => ({
          element: {
            enter: (node: any) => {
              if (node.type === "element") {
                // 只处理 svg 根标签的 width 和 height
                if (node.name === "svg") {
                  delete node.attributes.width;
                  delete node.attributes.height;
                }

                // 处理所有元素的颜色属性
                const colorAttributes = ["fill", "stroke"];
                colorAttributes.forEach((attr) => {
                  const value = node.attributes[attr];
                  if (value && !PRESERVED_COLORS.has(value.toLowerCase())) {
                    // 检查颜色值是否需要映射
                    // 先尝试直接映射
                    let mappedColor = colorMappings[value];

                    // 如果直接映射失败，尝试转换为大写后映射
                    if (!mappedColor && value.startsWith("#")) {
                      mappedColor = colorMappings[value.toUpperCase()];
                    }

                    if (mappedColor) {
                      node.attributes[attr] = mappedColor;
                    }
                  }
                });
              }
            },
          },
        }),
      },
    ],
  };
}

// 导出处理 SVG 的函数
export function processSvg(svg: string, style: string = "outline"): string {
  const optimizeConfig = createOptimizeConfig(style);
  const optimizedSvg = optimize(svg, optimizeConfig);
  return optimizedSvg.data;
}
