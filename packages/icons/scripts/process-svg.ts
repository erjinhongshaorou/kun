import { optimize, Config } from "svgo";

// 定义颜色映射的类型
type ColorMap = {
  [key: `#${string}`]: string;
};

// 定义颜色映射对象
const COLOR_MAPPINGS: ColorMap = {
  "#000000": "var(--ll-svg-default-color)",
  "#007BFE": "currentColor",
  "#EEF1FB": "var(--ll-svg-second-color)",
} as const;

// 定义需要保留原始值的特殊颜色
const PRESERVED_COLORS = new Set(["none", "white"]);

const optimizeConfig: Config = {
  plugins: [
    "removeXMLNS",
    {
      name: "removeAttrs",
      params: {
        attrs: ["width", "height"],
      },
    },
    {
      name: "customColorReplacer",
      fn: () => ({
        element: {
          enter: (node: any) => {
            if (node.type === "element") {
              // 处理所有可能包含颜色值的属性
              const colorAttributes = ["fill", "stroke"];

              colorAttributes.forEach((attr) => {
                const value = node.attributes[attr];
                if (value && !PRESERVED_COLORS.has(value.toLowerCase())) {
                  // 从 COLOR_MAPPINGS 中获取映射的颜色值
                  const mappedColor =
                    COLOR_MAPPINGS[
                      value.toUpperCase() as keyof typeof COLOR_MAPPINGS
                    ];
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

// 导出处理 SVG 的函数
export function processSvg(svg: string): string {
  const optimizedSvg = optimize(svg, optimizeConfig);
  return optimizedSvg.data;
}
