import React, { useEffect, useState } from "react";
import { getImage, getAllImageNames } from "@hashcoop/icons/js/images";

// 简化的图片组件，不使用Vite的动态导入
function DynamicImage({ name, size = 64 }: { name: string; size?: number }) {
  // 直接使用绝对路径
  const imageSrc = `/images/${name}.png`;

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
  fileName?: string; // 图片文件名（包含扩展名）
}

export default function ImageList() {
  const [images, setImages] = useState<ImageStyle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredImages, setFilteredImages] = useState<ImageStyle[]>([]);

  useEffect(() => {
    try {
      // 获取所有图片名称
      const imageNames = getAllImageNames();

      // 映射图片名称
      const availableImages = imageNames.map((name) => {
        return {
          name,
          fileName: `${name}.png`, // 默认假设为PNG
        };
      });

      setImages(availableImages);
      setFilteredImages(availableImages);
    } catch (error) {
      console.error("Error loading images:", error);
      setImages([]);
      setFilteredImages([]);
    }
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

  // 渲染JS图片的副作用
  useEffect(() => {
    // 延迟一点执行，确保DOM已经更新
    const timeoutId = setTimeout(() => {
      renderJSImages();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [filteredImages]);

  // 渲染JS图片的函数
  const renderJSImages = () => {
    filteredImages.forEach((image) => {
      // 设置图片参数
      const imageParams = {
        size: 64,
      };

      const jsImage = getImage(image.name, imageParams);
      const container = document.getElementById(`js-image-${image.name}`);
      if (container && jsImage) {
        container.innerHTML = "";
        container.appendChild(jsImage);
      }
    });
  };

  // 如果没有找到图片，显示一个消息提醒上传
  if (images.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 mb-4">
          没有找到图片。请将PNG、JPG等图片文件放入 packages/icons/src/images
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
      {/* 搜索框 */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm max-w-md mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 py-3 px-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search images..."
          />
        </div>
      </div>

      {/* 图片统计 */}
      <div className="text-center mb-6 text-gray-500">
        Showing {filteredImages.length} of {images.length} images
      </div>

      {/* 图片网格 */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* React 组件版本 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            React Components
          </h2>
          <p className="text-sm text-gray-500 mb-4">使用React组件加载的图片</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredImages.map((image) => {
              // 转换为PascalCase，用于组件名称
              const componentName =
                image.name
                  .split("-")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join("") + "Image";

              return (
                <div
                  key={`react-${image.name}`}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-center h-16">
                    {/* 使用简化的图片组件 */}
                    <DynamicImage name={image.name} size={64} />
                  </div>
                  <span className="mt-2 text-xs text-gray-500 text-center break-words w-full">
                    {componentName}
                  </span>
                  <span className="mt-1 text-xs text-blue-400 text-center break-words w-full">
                    {image.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* JS API 版本 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            JavaScript API
          </h2>
          <p className="text-sm text-gray-500 mb-4">使用 JS API 加载的图片</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredImages.map((image) => (
              <div
                key={`js-box-${image.name}`}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-center h-16">
                  <div id={`js-image-${image.name}`}></div>
                </div>
                <span className="mt-2 text-xs font-medium text-blue-500 text-center break-words w-full">
                  {image.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 使用示例 */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Usage Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* React 使用示例 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              React Usage
            </h3>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
              {`import { VipImage } from '@hashcoop/icons/images';

function MyComponent() {
  return (
    <VipImage 
      size={64} 
      className="my-custom-class"
      alt="Example image" 
    />
  );
}

// 简单的图片组件
function SimpleImageComponent({ name, size = 64 }) {
  return (
    <img 
      src={'/images/' + name + '.png'}
      alt={name}
      style={{ width: size + 'px', height: size + 'px' }}
      className="my-custom-class"
    />
  );
}`}
            </pre>
          </div>

          {/* JavaScript 使用示例 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              JavaScript Usage
            </h3>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
              {`import { getImage, getAllImageNames } from '@hashcoop/icons/js/images';

// 获取所有可用图片名称
const imageNames = getAllImageNames();

// 创建图片元素
const imgElement = getImage('VIP', { 
  size: 64, 
  className: 'my-custom-class',
  alt: 'VIP图标'
});

// 添加到DOM
document.getElementById('container').appendChild(imgElement);

// 另一种简单的方式
const img = document.createElement('img');
img.src = '/images/VIP.png';
img.width = 64;
img.height = 64;
document.getElementById('container').appendChild(img);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
