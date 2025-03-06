import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import { processSvg } from "./process-svg";

interface IconSet {
  name: string;
  style: string;
  kebabName: string; // 中横线格式名称
}

function camelCaseAttributes(svg: string): string {
  return svg
    .replace(/fill-rule/g, "fillRule")
    .replace(/clip-rule/g, "clipRule")
    .replace(/clip-path/g, "clipPath")
    .replace(/stroke-linecap/g, "strokeLinecap")
    .replace(/stroke-linejoin/g, "strokeLinejoin")
    .replace(/stroke-width/g, "strokeWidth")
    .replace(/stroke-miterlimit/g, "strokeMiterlimit");
}

// 确保首字母大写 - 用于组件名称
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 将中横线命名转换为驼峰命名
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

// 将中横线命名转换为组件名格式（首字母大写的驼峰）
function kebabToComponentName(str: string): string {
  return capitalizeFirstLetter(kebabToCamel(str));
}

async function generateIconComponents() {
  try {
    const svgFiles = await glob("src/**/*.svg");
    const iconSets: IconSet[] = [];

    for (const file of svgFiles) {
      const svg = await fs.readFile(file, "utf8");
      const pathParts = file.split(path.sep);
      const styleFolder = pathParts[1]; // 风格文件夹
      const fileName = pathParts[2];

      // 假设文件名是中横线格式 (例如 return-arrow.svg)
      const kebabName = path.parse(fileName).name;

      // 组件名称需要首字母大写的驼峰 + 风格后缀
      const componentName = `${kebabToComponentName(
        kebabName
      )}${capitalizeFirstLetter(styleFolder)}`;

      // 处理 SVG - 传递样式
      let processedSvg = processSvg(svg, styleFolder);
      // 转换属性为驼峰形式
      processedSvg = camelCaseAttributes(processedSvg);

      // 替换 SVG 标签 - 共有属性
      const commonSvgProps = `
          ref={ref}
          width={size}
          height={size}
          className={className}
          {...props}`;

      // 针对不同风格生成不同的组件代码
      let componentCode;

      if (styleFolder === "default") {
        // default 风格使用直接的样式传递，不设置 CSS 变量
        processedSvg = processedSvg.replace(
          /<svg([^>]*)>/,
          `<svg$1${commonSvgProps}
          style={componentStyle}>`
        );

        componentCode = `
        import React, { forwardRef, memo } from 'react'
        import type { SVGProps } from 'react'

        interface IconProps extends SVGProps<SVGSVGElement> {
          size?: number | string
          className?: string
          title?: string
        }

        const ${componentName} = memo(forwardRef<SVGSVGElement, IconProps>(({
          size = 24,
          className = '',
          title,
          style,
          ...props
        }, ref) => {
          const titleId = title ? \`title-\${Math.random().toString(36).substr(2, 9)}\` : undefined;
          
          // 直接使用传入的样式，不添加 CSS 变量
          const componentStyle = style;
          
          return (
            ${processedSvg.replace(
              "</svg>",
              "  {title ? <title id={titleId}>{title}</title> : null}\n    </svg>"
            )}
          )
        }));

        ${componentName}.displayName = '${componentName}'

        export default ${componentName}
        `;
      } else {
        // outline 和 solid 风格使用 CSS 变量
        processedSvg = processedSvg.replace(
          /<svg([^>]*)>/,
          `<svg$1${commonSvgProps}
          style={componentStyle}>`
        );

        componentCode = `
        import React, { forwardRef, memo } from 'react'
        import type { SVGProps } from 'react'

        interface IconProps extends SVGProps<SVGSVGElement> {
          size?: number | string
          className?: string
          title?: string
        }

        const ${componentName} = memo(forwardRef<SVGSVGElement, IconProps>(({
          size = 24,
          className = '',
          title,
          style,
          ...props
        }, ref) => {
          const titleId = title ? \`title-\${Math.random().toString(36).substr(2, 9)}\` : undefined;
          
          // 合并 CSS 变量和传入的样式
          const componentStyle = {
            '--ll-svg-default-color': '#000000',
            '--ll-svg-second-color': '#EEF1FB',
            ...style
          } as React.CSSProperties;
          
          return (
            ${processedSvg.replace(
              "</svg>",
              "  {title ? <title id={titleId}>{title}</title> : null}\n    </svg>"
            )}
          )
        }));

        ${componentName}.displayName = '${componentName}'

        export default ${componentName}
        `;
      }

      const componentDir = `build/components/${styleFolder}`;
      await fs.mkdir(componentDir, { recursive: true });
      await fs.writeFile(
        path.join(componentDir, `${componentName}.tsx`),
        componentCode
      );

      iconSets.push({
        name: componentName,
        style: styleFolder,
        kebabName,
      });
    }

    await generateEntryFiles(iconSets);
    await generateJsVersion(svgFiles);
  } catch (error) {
    console.error("Error generating components:", error);
    process.exit(1);
  }
}

async function generateEntryFiles(iconSets: IconSet[]) {
  // 按风格分组
  const groupedIcons = iconSets.reduce((acc, { name, style }) => {
    if (!acc[style]) {
      acc[style] = [];
    }
    acc[style].push(name);
    return acc;
  }, {} as Record<string, string[]>);

  // 生成每个风格的入口文件
  for (const [style, icons] of Object.entries(groupedIcons)) {
    const entryContent = icons
      .map(
        (name) =>
          `export { default as ${name} } from '../components/${style}/${name}';`
      )
      .join("\n");

    const entryDir = `build/${style}`;
    await fs.mkdir(entryDir, { recursive: true });
    await fs.writeFile(`${entryDir}/index.ts`, entryContent);
  }
}

async function generateJsVersion(svgFiles: string[]) {
  interface IconSet {
    [style: string]: {
      [kebabName: string]: string; // 直接使用中横线名称作为键
    };
  }

  const icons: IconSet = {
    outline: {},
    solid: {},
    default: {},
  };

  // CSS 变量的默认值
  const defaultStyles = `
    :root {
      --ll-svg-default-color: #000000;
      --ll-svg-second-color: #EEF1FB;
    }
  `;

  for (const file of svgFiles) {
    const svg = await fs.readFile(file, "utf8");
    const pathParts = file.split(path.sep);
    const style = pathParts[1];
    const fileName = pathParts[2];

    // 直接使用中横线格式的文件名
    const kebabName = path.parse(fileName).name;

    const processedSvg = processSvg(svg, style); // 传递样式参数
    icons[style][kebabName] = processedSvg;
  }

  const jsContent = `
    // 定义默认样式
    const styleEl = document.createElement('style');
    styleEl.textContent = ${JSON.stringify(defaultStyles)};
    if (!document.head.querySelector('style[data-hashcoop-icons]')) {
      styleEl.setAttribute('data-hashcoop-icons', '');
      document.head.appendChild(styleEl);
    }

    const icons: {
      [key in 'outline' | 'solid' | 'default']: {
        [key: string]: string;
      };
    } = ${JSON.stringify(icons, null, 2)};
    
    export type IconStyle = 'outline' | 'solid' | 'default';
    
    export interface IconOptions {
      size?: number | string;
      style?: IconStyle;
      className?: string;
      color?: string;          // 用于替换 currentColor
      defaultColor?: string;   // 用于替换 --ll-svg-default-color
      secondaryColor?: string; // 用于替换 --ll-svg-second-color
    }
    
    export function getIcon(name: string, options: IconOptions = {}): string | null {
      const {
        size = 24,
        style = 'outline',
        className = '',
        color,
        defaultColor,
        secondaryColor
      } = options;

      // 直接使用中横线格式名称
      const iconName = name;
      const iconSet = icons[style as keyof typeof icons];
      const svg = iconSet?.[iconName];
      
      if (!svg) {
        console.warn(\`Icon "\${name}" not found in \${style} style\`);
        return null;
      }

      // 创建临时容器来设置样式
      const container = document.createElement('div');
      
      // 只有非default样式才设置CSS变量
      if (style !== 'default') {
        if (defaultColor) {
          container.style.setProperty('--ll-svg-default-color', defaultColor);
        }
        if (secondaryColor) {
          container.style.setProperty('--ll-svg-second-color', secondaryColor);
        }
      }

      // 先处理颜色替换
      let processedSvg = svg;
      
      // 对于所有风格，支持color参数替换currentColor
      if (color) {
        processedSvg = processedSvg.replace(/currentColor/g, color);
      }

      // 替换 SVG 标签
      processedSvg = processedSvg.replace(
        /(<svg[^>]*)>/,
        function(match, svgStart) {
          // 移除已存在的 width 和 height
          const cleanedStart = svgStart.replace(/(width|height)="[^"]*"/g, '');
          
          // 添加新的属性
          return cleanedStart + 
                ' width="' + size + '"' + 
                ' height="' + size + '"' +
                (container.style.cssText ? ' style="' + container.style.cssText + '"' : '') +
                (className ? ' class="' + className + '"' : '') +
                '>';
        }
      );

      return processedSvg;
    }
    
    export function getAllIconNames(style: IconStyle = 'outline'): string[] {
      // 直接返回中横线格式的名称
      return Object.keys(icons[style]);
    }
    
    export const styles = ['outline', 'solid', 'default'] as const;
  `;

  await fs.writeFile("build/js.ts", jsContent);
}

// 执行生成
generateIconComponents();
