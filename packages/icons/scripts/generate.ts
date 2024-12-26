import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import { processSvg } from "./process-svg";

interface IconSet {
  name: string;
  style: string;
  baseName: string;
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

async function generateIconComponents() {
  try {
    const svgFiles = await glob("src/**/*.svg");
    const iconSets: IconSet[] = [];

    for (const file of svgFiles) {
      const svg = await fs.readFile(file, "utf8");
      const pathParts = file.split(path.sep);
      const style = pathParts[1];
      const fileName = pathParts[2];
      const baseName = path.parse(fileName).name;

      const componentName = `${baseName
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("")}${style.charAt(0).toUpperCase() + style.slice(1)}Icon`;

      // 处理 SVG
      let processedSvg = processSvg(svg);
      // 转换属性为驼峰形式
      processedSvg = camelCaseAttributes(processedSvg);

      // 替换 SVG 标签
      processedSvg = processedSvg.replace(
        /<svg([^>]*)>/,
        `<svg$1
          ref={ref}
          width={size}
          height={size}
          className={className}
          {...props}>`
      );

      // 生成组件代码
      const componentCode = `
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
  
  const mergedStyle = {
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

      const componentDir = `build/components/${style}`;
      await fs.mkdir(componentDir, { recursive: true });
      await fs.writeFile(
        path.join(componentDir, `${componentName}.tsx`),
        componentCode
      );

      iconSets.push({
        name: componentName,
        style,
        baseName,
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
      [name: string]: string;
    };
  }

  const icons: IconSet = {
    outline: {},
    solid: {},
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
    const style = pathParts[1] as "outline" | "solid";
    const baseName = path.parse(pathParts[2]).name;

    const processedSvg = processSvg(svg);
    icons[style][baseName] = processedSvg;
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
      [key in 'outline' | 'solid']: {
        [key: string]: string;
      };
    } = ${JSON.stringify(icons, null, 2)};
    
    export type IconStyle = 'outline' | 'solid';
    
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

      // 保持原始大小写，并加回后缀
      const iconName = name.charAt(0).toUpperCase() + name.slice(1);
      const iconSet = icons[style as keyof typeof icons];
      const svg = iconSet?.[iconName];
      
      if (!svg) {
        console.warn(\`Icon "\${name}" not found in \${style} style\`);
        return null;
      }

      // 创建临时容器来设置样式
      const container = document.createElement('div');
      if (defaultColor) {
        container.style.setProperty('--ll-svg-default-color', defaultColor);
      }
      if (secondaryColor) {
        container.style.setProperty('--ll-svg-second-color', secondaryColor);
      }

      // 先处理颜色替换
      let processedSvg = svg
        .replace(/currentColor/g, color || 'currentColor');

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
      return Object.keys(icons[style]);
    }
    
    export const styles = ['outline', 'solid'] as const;
  `;

  await fs.writeFile("build/js.ts", jsContent);
}

// 执行生成
generateIconComponents();
