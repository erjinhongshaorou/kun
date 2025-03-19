import React, { useEffect, useState, useRef } from "react";
import {
  getImage,
  getAllImageNames,
  getImageUrl,
  setBasePath,
} from "@hashcoop/icons/js/image";
import { Transition } from "react-transition-group";

// 定义过渡动画的样式
const duration = 150;

const transitionStyles = {
  entering: { opacity: 0, transform: "translateX(20px)" },
  entered: { opacity: 1, transform: "translateX(0)" },
  exiting: { opacity: 0, transform: "translateX(-20px)" },
  exited: { opacity: 0, transform: "translateX(20px)" },
};

// 简化的图片组件，支持所有图片类型
function DynamicImage({
  name,
  fileName,
  size = 64,
}: {
  name: string;
  fileName?: string;
  size?: number;
}) {
  // 在演示环境中，我们仍然可以使用公共路径下的图片
  const imageSrc = `/image/${fileName || name}`;

  return (
    <img
      src={imageSrc}
      alt={name}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="object-contain"
      onError={(e) => {
        // 加载失败时显示占位符
        e.currentTarget.style.display = "none";
        const container = e.currentTarget.parentElement;
        if (container) {
          const placeholder = document.createElement("div");
          placeholder.className =
            "w-16 h-16 bg-gray-100 flex items-center justify-center rounded";
          placeholder.innerHTML =
            '<span class="text-xs text-gray-500">Image</span>';
          container.appendChild(placeholder);
        }
      }}
    />
  );
}

interface ImageStyle {
  name: string; // 图片名称(kebab-case)
  fileName: string; // 图片文件名（包含扩展名）
}

interface ImageListProps {
  displayMode: "react" | "js";
}

export default function ImageList({
  displayMode: propDisplayMode,
}: ImageListProps) {
  const [images, setImages] = useState<ImageStyle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredImages, setFilteredImages] = useState<ImageStyle[]>([]);
  const [displayMode, setDisplayMode] = useState<"react" | "js">("js");
  const [isLoading, setIsLoading] = useState(true);
  const [gridHeight, setGridHeight] = useState(350);
  const gridRef = useRef<HTMLDivElement>(null);
  const [dataFetched, setDataFetched] = useState(false);

  // 添加 Transition 组件所需的 refs
  const reactTransitionRef = useRef(null);
  const jsTransitionRef = useRef(null);

  // 同步顶层displayMode状态
  useEffect(() => {
    setDisplayMode(propDisplayMode);
  }, [propDisplayMode]);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        // 获取所有图片名称
        const imageNames = getAllImageNames();

        // 映射图片名称和文件名
        const availableImages = imageNames.map((name) => {
          // 通过JS API创建图片元素来获取正确的文件名
          const imgElement = getImage(name);
          let fileName = name;

          // 从图片的src中提取文件名
          if (imgElement) {
            const srcUrl = imgElement.src;
            const srcParts = srcUrl.split("/");
            if (srcParts.length > 0) {
              const lastPart = srcParts[srcParts.length - 1];
              if (lastPart) {
                fileName = lastPart;
              }
            }
          }

          return {
            name,
            fileName,
          };
        });

        setImages(availableImages);
        setFilteredImages(availableImages);
        setDataFetched(true);
      } catch (error) {
        console.error("Error loading images:", error);
        setImages([]);
        setFilteredImages([]);
        setDataFetched(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // 当搜索词或图片列表变化时过滤图片
  useEffect(() => {
    const filtered = searchTerm
      ? images.filter((image) =>
          image.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : images;

    setFilteredImages(filtered);
  }, [searchTerm, images]);

  // 在显示模式切换时，确保JS图片正确渲染
  useEffect(() => {
    if (displayMode === "js" && filteredImages.length > 0 && !isLoading) {
      // 立即渲染JS图片，避免切换延迟
      requestAnimationFrame(() => {
        renderJSImages();
      });
    }
  }, [displayMode, filteredImages, isLoading]);

  // 渲染JS图片的函数
  const renderJSImages = () => {
    filteredImages.forEach((image) => {
      // 设置图片参数
      const imageParams = {
        size: 54, // 调整为和React组件相同的尺寸
        className: "max-w-full max-h-full object-contain",
      };

      const jsImage = getImage(image.name, imageParams);
      const container = document.getElementById(`js-image-${image.name}`);
      if (container && jsImage) {
        container.innerHTML = "";
        container.appendChild(jsImage);
      }
    });
  };

  // 在图片列表变化时计算网格高度
  useEffect(() => {
    const calculateGridHeight = () => {
      if (filteredImages.length === 0) return;

      // 根据图片数量和布局计算行数
      const itemsPerRow =
        window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 4 : 6;
      const rows = Math.ceil(filteredImages.length / itemsPerRow);

      // 每行的高度（卡片高度 + 间距）
      const rowHeight = 150 + 16; // 卡片高度150px + 间距16px

      // 计算总高度，最小高度为350px
      const calculatedHeight = Math.max(350, rows * rowHeight);
      setGridHeight(calculatedHeight);
    };

    calculateGridHeight();

    // 添加窗口大小变化监听器
    window.addEventListener("resize", calculateGridHeight);
    return () => window.removeEventListener("resize", calculateGridHeight);
  }, [filteredImages]);

  // 在加载中或数据未加载完成时，返回一个占位区域
  if (isLoading || !dataFetched) {
    return (
      <div style={{ minHeight: "350px" }}>{/* 空白占位，不显示任何内容 */}</div>
    );
  }

  // 只有在确认没有图片时才显示提示信息
  if (dataFetched && images.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 mb-4">
          没有找到图片。请将PNG、JPG等图片文件放入 packages/icons/src/image
          目录。
        </p>
        <div className="flex justify-center">
          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-md max-w-lg">
            <h3 className="text-sm font-medium mb-1">提示</h3>
            <p className="text-xs">
              上传图片后，需要运行{" "}
              <code className="bg-blue-100 px-1 rounded">pnpm build</code>{" "}
              命令重新构建图标库。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 搜索框与统计信息 */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative rounded-md shadow-sm w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 py-2 px-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm text-sm"
            placeholder="搜索图片..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <span className="font-medium text-blue-600">
            {filteredImages.length}
          </span>{" "}
          / {images.length} 张图片
        </div>
      </div>

      {/* 图片网格 - 带过渡效果 */}
      <div
        className="relative"
        style={{ height: `${gridHeight}px` }}
        ref={gridRef}
      >
        {/* 使用同一绝对定位层，确保内容在同一位置切换 */}
        <div style={{ position: "absolute", width: "100%", top: 0, left: 0 }}>
          <Transition
            nodeRef={reactTransitionRef}
            in={displayMode === "react"}
            timeout={duration}
            mountOnEnter
            unmountOnExit
          >
            {(state) => (
              <div
                ref={reactTransitionRef}
                style={{
                  transition: `all ${duration}ms ease-in-out`,
                  ...transitionStyles[state],
                  position: "absolute",
                  width: "100%",
                  top: 0,
                  left: 0,
                }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredImages.map((image) => {
                    // 转换为PascalCase，用于组件名称
                    const componentName =
                      image.name
                        .split("-")
                        .map(
                          (part) => part.charAt(0).toUpperCase() + part.slice(1)
                        )
                        .join("") + "Image";

                    return (
                      <div
                        key={`react-${image.name}`}
                        className="border border-gray-200 rounded-md overflow-hidden flex flex-col min-h-[150px] justify-between hover:shadow-lg transition-shadow duration-200"
                      >
                        <div
                          className="flex-grow p-2 rounded-md bg-gray-50 flex items-center justify-center"
                          style={{ height: "100px" }}
                        >
                          <DynamicImage
                            name={image.name}
                            fileName={image.fileName}
                            size={54}
                          />
                        </div>
                        <div className="p-2 border-t border-gray-200 text-center">
                          <span className="text-sm font-medium text-blue-600">
                            {image.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Transition>

          <Transition
            nodeRef={jsTransitionRef}
            in={displayMode === "js"}
            timeout={duration}
            mountOnEnter
            unmountOnExit
          >
            {(state) => (
              <div
                ref={jsTransitionRef}
                style={{
                  transition: `all ${duration}ms ease-in-out`,
                  ...transitionStyles[state],
                  position: "absolute",
                  width: "100%",
                  top: 0,
                  left: 0,
                }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredImages.map((image) => (
                    <div
                      key={image.name}
                      className="border border-gray-200 rounded-md overflow-hidden flex flex-col min-h-[150px] justify-between hover:shadow-lg transition-shadow duration-200"
                    >
                      <div
                        id={`js-image-${image.name}`}
                        className="flex-grow p-2 rounded-md bg-gray-50 flex items-center justify-center"
                        style={{ height: "100px" }}
                      ></div>
                      <div className="p-2 border-t border-gray-200 text-center">
                        <span className="text-sm font-medium text-blue-600">
                          {image.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Transition>
        </div>
      </div>

      {/* 使用示例 */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          使用示例和说明
        </h2>

        {/* 基础路径设置说明 */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-md font-medium text-blue-800 mb-2">
            ⚠️ 重要：在其他项目中使用时的配置
          </h3>
          <p className="text-sm text-blue-700 mb-2">
            当您在外部项目中使用此图标库时，需要设置正确的基础路径才能正确加载图片。
            有以下几种方式可以解决：
          </p>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>
              使用 <code className="bg-blue-100 px-1 rounded">setBasePath</code>{" "}
              函数设置图片基础路径。例如：
              <pre className="mt-1 bg-blue-100 p-2 rounded text-xs">{`// 在应用的入口文件（如main.tsx或App.tsx）中：
import { setBasePath } from '@hashcoop/icons/image';

// 在应用初始化时调用一次
setBasePath('/assets/images'); // 指向您项目中存放这些图片的目录`}</pre>
            </li>
            <li>
              将图片文件复制到您项目的公共目录中（例如
              public/image/），并确保可以通过 /image/ 路径访问。
            </li>
            <li>
              如果使用CDN托管，可以设置为CDN路径：
              <pre className="mt-1 bg-blue-100 p-2 rounded text-xs">{`setBasePath('https://cdn.example.com/assets/icons');`}</pre>
            </li>
          </ul>
        </div>

        {/* 通用图标组件示例 */}
        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-md font-medium text-green-800 mb-2">
            📋 通用 Icon 组件示例
          </h3>
          <p className="text-sm text-green-700 mb-2">
            以下是一个集成了所有图标类型（包括图片）的通用 Icon 组件示例：
          </p>
          <pre className="mt-1 bg-green-100 p-2 rounded text-xs overflow-auto">{`// 在应用入口文件中设置图片路径
import { setBasePath } from '@hashcoop/icons/image';
setBasePath('/assets/images'); // 指向存放图片的实际目录

// Icon.tsx 组件
import * as DefaultIcons from '@hashcoop/icons/default';
import * as ImageIcons from '@hashcoop/icons/image';
import * as OutlineIcons from '@hashcoop/icons/outline';
import * as SolidIcons from '@hashcoop/icons/solid';
import React from 'react';

interface IconType {
  name: string;   // 图标名称（kebab-case格式）
  type: 'outline' | 'solid' | 'default' | 'image';
  url?: string;   // 可选的自定义URL
}

interface IconProps {
  icon: IconType;
  size?: number | string;
  className?: string;
  [key: string]: any; // 其他所有属性
}

// 首字母大写
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 将中横线格式转换为驼峰格式
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

// 将中横线格式转换为组件名格式
function kebabToComponentName(kebabName: string, styleFolder: string): string {
  const camelName = kebabToCamel(kebabName);
  // 对于图片类型，添加Image后缀
  if (styleFolder === 'image') {
    return \`\${capitalizeFirstLetter(camelName)}Image\`;
  }
  // 对于其他类型，添加样式名后缀
  return \`\${capitalizeFirstLetter(camelName)}\${capitalizeFirstLetter(styleFolder)}\`;
}

export default function Icon({ icon, size = 24, className = '', ...props }: IconProps) {
  if (!icon) return null;
  
  // 处理空图标
  if (!icon.name && !icon.url) {
    return (
      <DefaultIcons.EmptyDefault
        size={size}
        className={className}
        {...props}
        style={{
          ...props.style,
          '--ll-svg-default-color': 'var(--ll-fg-primary)'
        } as React.CSSProperties}
      />
    );
  }
  
  // 处理自定义URL图标
  if (icon.url) {
    return (
      <img 
        src={icon.url} 
        alt="icon" 
        className={className}
        style={{ 
          width: typeof size === 'number' ? \`\${size}px\` : size,
          height: typeof size === 'number' ? \`\${size}px\` : size,
          ...props.style 
        }}
        {...props}
      />
    );
  }

  // 获取对应的图标库
  let iconLibrary: any;
  switch (icon.type) {
    case 'outline':
      iconLibrary = OutlineIcons;
      break;
    case 'solid':
      iconLibrary = SolidIcons;
      break;
    case 'default':
      iconLibrary = DefaultIcons;
      break;
    case 'image':
      iconLibrary = ImageIcons;
      break;
    default:
      iconLibrary = OutlineIcons;
  }

  // 计算组件名
  const componentName = kebabToComponentName(icon.name, icon.type);

  // 获取图标组件
  const IconComponent = iconLibrary[componentName];

  if (!IconComponent) {
    console.warn(\`Icon component "\${componentName}" not found in \${icon.type} style.\`);
    return (
      <DefaultIcons.EmptyDefault
        size={size}
        className={className}
        {...props}
        style={{
          ...props.style,
          '--ll-svg-default-color': 'var(--ll-fg-primary)'
        } as React.CSSProperties}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      className={className}
      {...props}
      style={{
        ...props.style,
        '--ll-svg-default-color': 'var(--ll-fg-primary)'
      } as React.CSSProperties}
    />
  );
}`}</pre>

          <p className="text-sm text-green-700 mt-2">
            <strong>使用方式：</strong>
          </p>
          <pre className="mt-1 bg-green-100 p-2 rounded text-xs overflow-auto">{`// 使用图标
<Icon 
  icon={{ name: 'trophy', type: 'image' }} 
  size={48} 
  className="my-trophy" 
/>

// 使用SVG图标
<Icon 
  icon={{ name: 'check-circle', type: 'outline' }} 
  size={24} 
  className="text-green-500" 
/>`}</pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* React 使用示例 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col h-full">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              React 组件用法
            </h3>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto flex-grow">
              {`// 添加到应用的入口文件（如 main.tsx 或 App.tsx）中：
import { setBasePath } from '@hashcoop/icons/image';

// 重要：设置图片基础路径，应在应用初始化时执行一次
setBasePath('/assets/images'); // 适配您项目的实际路径

// 然后在组件中使用：
import { VipImage } from '@hashcoop/icons/image';

function MyComponent() {
  return (
    <VipImage 
      size={64} 
      className="my-custom-class"
      alt="Example image" 
    />
  );
}

// 如果需要手动使用图片URL
function SimpleImageComponent({ imageName }) {
  // 导入和使用图片URL
  import { getImageUrl } from '@hashcoop/icons/js/image';
  
  // 获取图片资源地址
  const imageUrl = getImageUrl(imageName);
  
  return imageUrl ? (
    <img 
      src={imageUrl}
      alt={imageName}
      style={{ width: '64px', height: '64px' }}
      className="my-custom-class"
    />
  ) : null;
}`}
            </pre>
          </div>

          {/* JavaScript 使用示例 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col h-full">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              JavaScript API 用法
            </h3>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto flex-grow">
              {`import { 
  getImage, 
  getAllImageNames, 
  setBasePath, 
  getImageUrl 
} from '@hashcoop/icons/js/image';

// 重要：设置图片基础路径，应在应用初始化时执行一次
setBasePath('/assets/icons'); // 适配您项目的实际路径

// 获取所有可用图片名称
const imageNames = getAllImageNames();

// 创建图片元素
const imgElement = getImage('gold', { 
  size: 64, 
  className: 'my-custom-class',
  alt: 'Gold图标'
});

// 添加到DOM
document.getElementById('container').appendChild(imgElement);

// 另一种方式 - 使用图片URL
const imgUrl = getImageUrl('gold');
if (imgUrl) {
  const img = document.createElement('img');
  img.src = imgUrl;
  img.width = 64;
  img.height = 64;
  document.getElementById('container').appendChild(img);
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
