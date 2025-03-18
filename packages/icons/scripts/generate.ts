import { promises as fs } from "fs";
import path from "path";
import { glob } from "glob";
import { processSvg } from "./process-svg";

interface IconSet {
  name: string;
  style: string;
  kebabName: string; // 中横线格式名称
}

// 添加对图片的支持
interface ImageSet {
  name: string;
  fileName: string;
  filePath: string;
}

function camelCaseAttributes(svg: string): string {
  return svg
    .replace(/fill-rule/g, "fillRule")
    .replace(/clip-rule/g, "clipRule")
    .replace(/clip-path/g, "clipPath")
    .replace(/stop-color/g, "stopColor")
    .replace(/stroke-linecap/g, "strokeLinecap")
    .replace(/stroke-linejoin/g, "strokeLinejoin")
    .replace(/stroke-width/g, "strokeWidth")
    .replace(/stroke-dasharray/g, "strokeDasharray")
    .replace(/stroke-miterlimit/g, "strokeMiterlimit")
    .replace(/fill-opacity/g, "fillOpacity")
    .replace(/flood-opacity/g, "floodOpacity")
    .replace(/stop-opacity/g, "stopOpacity")
    .replace(/color-interpolation-filters/g, "colorInterpolationFilters")
    .replace(/stroke-opacity/g, "strokeOpacity")
    .replace(/mask-type/g, "maskType")
    .replace(/flood-color/g, "floodColor")
    .replace(/font-family/g, "fontFamily")
    .replace(/font-size/g, "fontSize")
    .replace(/font-style/g, "fontStyle")
    .replace(/font-weight/g, "fontWeight")
    .replace(/text-anchor/g, "textAnchor")
    .replace(/dominant-baseline/g, "dominantBaseline")
    .replace(/mask-units/g, "maskUnits")
    .replace(/style="([^"]*)"/g, (match, styleString) => {
      // 将style字符串转换为对象字符串
      if (!styleString) return "style={{}}";

      const styleObj = styleString
        .split(";")
        .filter((s) => s.trim())
        .map((s) => {
          const [key, value] = s.split(":").map((part) => part.trim());
          // 转换key为驼峰命名
          const camelKey = key.replace(/-([a-z])/g, (_, char) =>
            char.toUpperCase()
          );
          return `"${camelKey}":"${value}"`;
        })
        .join(",");

      return `style={{${styleObj}}}`;
    });
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
    // 添加对图片文件的支持
    const imageFiles = await glob("src/images/**/*.{png,jpg,jpeg,gif,webp}");

    const iconSets: IconSet[] = [];
    const imageSets: ImageSet[] = [];

    // 定义复杂SVG文件列表
    const complexSvgFiles = [
      "gold.svg",
      "platinum.svg",
      "diamond.svg",
      "silver.svg",
      "bronze.svg",
      "glowingTrophy.svg",
      "tallGlowingTrophy.svg",
      "starTrophy.svg",
      "diamondTrophy.svg",
      "trophyDefault.svg",
      "standingTrophy.svg",
      "badgeMedal.svg",
      "corsageMedal.svg",
      "halterMedal.svg",
      "starMedal.svg",
    ];

    // 处理图片文件
    for (const file of imageFiles) {
      const fileName = path.basename(file);
      const kebabName = path.parse(fileName).name;

      // 组件名称使用首字母大写的驼峰
      const componentName = `${kebabToComponentName(kebabName)}Image`;

      // 将图片复制到构建目录
      const buildImageDir = `build/images`;
      const destImagePath = path.join(buildImageDir, fileName);

      await fs.mkdir(buildImageDir, { recursive: true });
      await fs.copyFile(file, destImagePath);

      // 生成图片组件代码
      const imageComponentCode = `
      import React, { forwardRef, memo } from 'react'
      
      interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
        size?: number | string
        className?: string
      }
      
      const ${componentName} = memo(forwardRef<HTMLImageElement, ImageProps>(({
        size = 24,
        className = '',
        alt = "${kebabName}",
        ...props
      }, ref) => {
        // 计算宽高样式
        const style = {
          width: typeof size === 'number' ? \`\${size}px\` : size,
          height: typeof size === 'number' ? \`\${size}px\` : size,
          ...props.style
        };
        
        return (
          <img
            ref={ref}
            src={\`/images/${fileName}\`}
            alt={alt}
            className={className}
            style={style}
            {...props}
          />
        )
      }));
      
      ${componentName}.displayName = '${componentName}'
      
      export default ${componentName}
      `;

      // 保存组件文件
      const componentDir = `build/components/images`;
      await fs.mkdir(componentDir, { recursive: true });
      await fs.writeFile(
        path.join(componentDir, `${componentName}.tsx`),
        imageComponentCode
      );

      imageSets.push({
        name: componentName,
        fileName,
        filePath: file,
      });
    }

    // 处理SVG文件 (现有代码)
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

      // 检查是否为复杂SVG
      const isComplexSvg = complexSvgFiles.some(
        (complexFile) => fileName.toLowerCase() === complexFile.toLowerCase()
      );

      // 处理 SVG - 传递样式
      let processedSvg;
      if (isComplexSvg) {
        // 对于复杂SVG，只进行最基本的处理
        processedSvg = svg
          .replace(/<svg([^>]*)>/, `<svg$1>`)
          .replace(/width="[^"]*"/, "")
          .replace(/height="[^"]*"/, "")
          // 确保所有mask-type属性都转换为maskType
          .replace(/mask-type/g, "maskType")
          // 确保所有style属性都转换为React风格的对象
          .replace(/style="([^"]*)"/g, (match, styleString) => {
            if (!styleString) return "";

            const styleObj = styleString
              .split(";")
              .filter((s) => s.trim())
              .map((s) => {
                const [key, value] = s.split(":").map((part) => part.trim());
                // 转换key为驼峰命名
                const camelKey = key.replace(/-([a-z])/g, (_, char) =>
                  char.toUpperCase()
                );
                return `"${camelKey}":"${value}"`;
              })
              .join(",");

            return `style={{${styleObj}}}`;
          });
      } else {
        // 对于普通SVG，进行完整处理
        processedSvg = processSvg(svg, styleFolder);
      }

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

      if (isComplexSvg) {
        // 对于复杂SVG，使用一个特殊的模板，不使用style属性
        processedSvg = processedSvg.replace(
          /<svg([^>]*)>/,
          `<svg$1
          ref={ref}
          width={size}
          height={size}
          className={className}
          {...props}>`
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
          ...props
        }, ref) => {
          const titleId = title ? \`title-\${Math.random().toString(36).substr(2, 9)}\` : undefined;
          
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
      } else if (styleFolder === "default") {
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
          
          // 直接使用传入的样式，不添加 CSS 变量，但需要类型转换
          const componentStyle = style as React.CSSProperties;
          
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

    // 生成图片入口文件
    await generateImageEntryFiles(imageSets);

    // 生成JS版本的图片使用API
    await generateJsImagesVersion(imageFiles);

    await generateEntryFiles(iconSets);
    await generateJsVersion(svgFiles);

    // 生成主入口文件
    await generateMainEntryFile(iconSets, imageSets);
  } catch (error) {
    console.error("Error generating components:", error);
    process.exit(1);
  }
}

// 生成图片入口文件
async function generateImageEntryFiles(imageSets: ImageSet[]) {
  const entryContent = imageSets
    .map(
      ({ name }) =>
        `export { default as ${name} } from '../components/images/${name}';`
    )
    .join("\n");

  const entryDir = `build/images`;
  await fs.mkdir(entryDir, { recursive: true });
  await fs.writeFile(`${entryDir}/index.ts`, entryContent);
}

// 生成JS版本的图片使用API
async function generateJsImagesVersion(imageFiles: string[]) {
  const images: Record<string, string> = {};

  for (const file of imageFiles) {
    const fileName = path.basename(file);
    const kebabName = path.parse(fileName).name;

    // 存储图片文件名，将在运行时使用Vite的资源导入功能
    images[kebabName] = fileName;
  }

  const jsImageContent = `
  export interface ImageOptions {
    size?: number | string;
    className?: string;
    alt?: string;
    style?: Record<string, string>;
  }
  
  // 图片名称到文件名的映射
  const imageMap: Record<string, string> = ${JSON.stringify(images)};
  
  // 获取所有可用的图片名称
  export function getAllImageNames(): string[] {
    return ${JSON.stringify(Object.keys(images))};
  }
  
  // 创建图片HTML元素
  export function getImage(name: string, options: ImageOptions = {}): HTMLImageElement | null {
    const {
      size = 24,
      className = '',
      alt = name,
      style = {}
    } = options;
    
    const imageFileName = imageMap[name];
    
    if (!imageFileName) {
      console.warn(\`Image "\${name}" not found\`);
      return null;
    }
    
    const img = document.createElement('img');
    // 使用Vite的公共目录（假设图片已被复制到public/images目录）
    img.src = \`/images/\${imageFileName}\`;
    img.alt = alt;
    
    if (className) {
      img.className = className;
    }
    
    // 设置尺寸
    const sizeValue = typeof size === 'number' ? \`\${size}px\` : size;
    img.style.width = sizeValue;
    img.style.height = sizeValue;
    
    // 应用其他样式
    Object.entries(style).forEach(([key, value]) => {
      img.style[key as any] = value;
    });
    
    return img;
  }
  `;

  await fs.writeFile("build/images/js.ts", jsImageContent);
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

// 生成主入口文件，导出所有SVG图标和图片
async function generateMainEntryFile(
  iconSets: IconSet[],
  imageSets: ImageSet[]
) {
  const svgExports = iconSets
    .map(
      ({ name, style }) =>
        `export { default as ${name} } from './components/${style}/${name}';`
    )
    .join("\n");

  const imageExports = imageSets
    .map(
      ({ name }) =>
        `export { default as ${name} } from './components/images/${name}';`
    )
    .join("\n");

  const entryContent = `
  // SVG 图标导出
  ${svgExports}
  
  // 图片导出
  ${imageExports}
  
  // 导出JS版本
  export * from './js';
  export * from './images/js';
  `;

  await fs.writeFile(`build/index.ts`, entryContent);
}

// 执行生成
generateIconComponents();
