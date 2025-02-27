import React, { useEffect, useState, useRef } from "react";
import * as OutlineIcons from "@hashcoop/icons/outline";
import * as SolidIcons from "@hashcoop/icons/solid";
import * as DefaultIcons from "@hashcoop/icons/default";
import { getIcon, getAllIconNames } from "@hashcoop/icons/js";

interface IconUsageProps {
  activeStyle: "outline" | "solid" | "default";
}

export default function IconUsage({ activeStyle }: IconUsageProps) {
  const [availableIcon, setAvailableIcon] = useState<string>("birthday");
  const [IconComponent, setIconComponent] =
    useState<React.ComponentType<any> | null>(null);
  const initialRenderRef = useRef(true);
  const jsHoverContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 获取当前风格下的第一个可用图标
    findAvailableIcon(activeStyle);
  }, [activeStyle]);

  // 组件挂载后立即强制渲染一次JS图标
  useEffect(() => {
    if (initialRenderRef.current) {
      // 短暂延迟确保DOM已经渲染
      const timer = setTimeout(() => {
        findAvailableIcon(activeStyle);
        initialRenderRef.current = false;
      }, 200);

      return () => clearTimeout(timer);
    }
  }, []);

  // 初始化JS版本的hover效果 (仅用于default风格)
  useEffect(() => {
    if (activeStyle === "default" && jsHoverContainerRef.current) {
      const container = jsHoverContainerRef.current;

      // 为JS hover容器添加鼠标事件
      container.addEventListener("mouseenter", handleJsHoverEnter);
      container.addEventListener("mouseleave", handleJsHoverLeave);

      return () => {
        container.removeEventListener("mouseenter", handleJsHoverEnter);
        container.removeEventListener("mouseleave", handleJsHoverLeave);
      };
    }
  }, [availableIcon, activeStyle]);

  // JS hover效果的处理函数
  const handleJsHoverEnter = () => {
    if (jsHoverContainerRef.current) {
      const hoverIcon = getIcon(availableIcon, {
        style: activeStyle as any,
        size: 32,
        color: "#22c55e", // 悬停时的绿色
      });

      if (hoverIcon) {
        jsHoverContainerRef.current.innerHTML = hoverIcon;
      }
    }
  };

  const handleJsHoverLeave = () => {
    if (jsHoverContainerRef.current) {
      const normalIcon = getIcon(availableIcon, {
        style: activeStyle as any,
        size: 32,
        color: "#6b7280", // 默认灰色
      });

      if (normalIcon) {
        jsHoverContainerRef.current.innerHTML = normalIcon;
      }
    }
  };

  // 根据当前风格找到一个可用的图标
  const findAvailableIcon = (style: string) => {
    let iconNames;
    let iconComponents;

    // 获取当前风格的所有图标
    switch (style) {
      case "outline":
        iconComponents = OutlineIcons;
        break;
      case "solid":
        iconComponents = SolidIcons;
        break;
      case "default":
        iconComponents = DefaultIcons;
        break;
      default:
        iconComponents = OutlineIcons;
    }

    // 从JS API获取所有图标名称
    try {
      iconNames = getAllIconNames(style as any);
    } catch (e) {
      console.error("获取图标名称失败", e);
      iconNames = [];
    }

    // 如果有可用图标
    if (iconNames && iconNames.length > 0) {
      // 取第一个图标名称 (去掉首字母大写)
      const iconBaseName =
        iconNames[0].charAt(0).toLowerCase() + iconNames[0].slice(1);
      setAvailableIcon(iconBaseName);

      // 查找对应的React组件
      const componentEntries = Object.entries(iconComponents);
      if (componentEntries.length > 0) {
        const [, Component] = componentEntries[0];
        setIconComponent(() => Component as React.ComponentType<any>);
      }

      // 更新JS示例
      generateJsExamples(style, iconBaseName);
    }
  };

  const generateJsExamples = (style: string, iconName: string) => {
    // 确保元素存在后再操作
    setTimeout(() => {
      // 基础用法 - 尺寸调大到 32px
      const basicIcon = getIcon(iconName, {
        style: style as any,
        size: 32,
      });
      if (document.getElementById("basic-js")) {
        document.getElementById("basic-js")!.innerHTML = basicIcon || "";
      }

      // 自定义大小 - 尺寸调大到 48px
      const largeIcon = getIcon(iconName, {
        style: style as any,
        size: 48,
      });
      if (document.getElementById("large-js")) {
        document.getElementById("large-js")!.innerHTML = largeIcon || "";
      }

      // 自定义颜色 - 尺寸调大到 32px
      const colorIcon = getIcon(iconName, {
        style: style as any,
        size: 32,
        color: "#ef4444",
      });
      if (document.getElementById("color-js")) {
        document.getElementById("color-js")!.innerHTML = colorIcon || "";
      }

      // 默认颜色变量 - 尺寸调大到 32px
      const defaultColorIcon = getIcon(iconName, {
        style: style as any,
        size: 32,
        defaultColor: "#3b82f6",
      });
      if (document.getElementById("default-color-js")) {
        document.getElementById("default-color-js")!.innerHTML =
          defaultColorIcon || "";
      }

      // 第二颜色变量 - 尺寸调大到 32px
      const secondColorIcon = getIcon(iconName, {
        style: style as any,
        size: 32,
        secondaryColor: "#22c55e",
      });
      if (document.getElementById("second-color-js")) {
        document.getElementById("second-color-js")!.innerHTML =
          secondColorIcon || "";
      }

      // Hover效果的初始图标 (仅用于default风格)
      if (style === "default" && jsHoverContainerRef.current) {
        const hoverIcon = getIcon(iconName, {
          style: style as any,
          size: 32,
          color: "#6b7280", // 默认灰色
        });
        if (hoverIcon) {
          jsHoverContainerRef.current.innerHTML = hoverIcon || "";
        }
      }
    }, 100);
  };

  // 如果没有找到可用的组件，显示一个占位符
  if (!IconComponent) {
    return <div className="p-6 text-center text-gray-500">加载图标中...</div>;
  }

  // 为default风格提供特殊说明
  const defaultStyleNote =
    activeStyle === "default" ? (
      <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 mb-6">
        <p className="text-amber-800 text-sm">
          <strong>注意：</strong> Default 风格图标保持原始颜色，可通过 className
          或 color 参数修改颜色。
        </p>
      </div>
    ) : null;

  return (
    <div>
      {defaultStyleNote}
      <div className="space-y-6">
        {/* 基础用法 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
            Default Usage
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <IconComponent size={32} />
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-normal break-all">
                  {`<${IconComponent.displayName} />`}
                </code>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <div id="basic-js"></div>
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-normal break-all">
                  {`getIcon('${availableIcon}', { style: '${activeStyle}' })`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* 自定义大小 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
            Custom Size
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <IconComponent size={48} />
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-normal break-all">
                  {`<${IconComponent.displayName} size={48} />`}
                </code>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <div id="large-js"></div>
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-normal break-all">
                  {`getIcon('${availableIcon}', { style: '${activeStyle}', size: 48 })`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Hover 效果 (仅用于 default 风格) */}
        {activeStyle === "default" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
              Hover Effect
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start">
                <div className="w-24 flex justify-center items-center min-h-[48px] group">
                  <IconComponent
                    size={32}
                    className="text-gray-500 hover:text-green-500 transition-colors duration-200 cursor-pointer"
                  />
                </div>
                <div className="ml-6 flex-1">
                  <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-pre">
                    {`<${IconComponent.displayName} 
  size={32}
  className="text-gray-500 hover:text-green-500 
    transition-colors duration-200 cursor-pointer"
/>`}
                  </code>
                </div>
              </div>
              <div className="flex items-start">
                <div
                  className="w-24 flex justify-center items-center min-h-[48px] cursor-pointer"
                  ref={jsHoverContainerRef}
                >
                  {/* JS hover图标通过引用添加 */}
                </div>
                <div className="ml-6 flex-1">
                  <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-pre">
                    {`// 添加鼠标事件处理
el.addEventListener('mouseenter', () => {
  el.innerHTML = getIcon('${availableIcon}', {
    style: '${activeStyle}',
    size: 32,
    color: '#22c55e'  // 绿色
  });
});

el.addEventListener('mouseleave', () => {
  el.innerHTML = getIcon('${availableIcon}', {
    style: '${activeStyle}',
    size: 32,
    color: '#6b7280'  // 灰色
  });
});`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 自定义颜色 - className */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
            Custom Color with className
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px] text-red-500">
                <IconComponent size={32} />
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-pre">
                  {`<div className="text-red-500">\n  <${IconComponent.displayName} size={32} />\n</div>`}
                </code>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <div id="color-js"></div>
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-pre">
                  {`getIcon('${availableIcon}', {\n  style: '${activeStyle}',\n  color: '#ef4444'\n})`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* 默认颜色变量 - 只为非default风格显示 */}
        {activeStyle !== "default" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
              CSS Variable: Default Color
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start">
                <div className="w-24 flex justify-center items-center min-h-[48px]">
                  <IconComponent
                    size={32}
                    style={
                      {
                        "--ll-svg-default-color": "#ef4444",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className="ml-6 flex-1">
                  <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-pre">
                    {`<${IconComponent.displayName}\n  size={32}\n  style={{\n    '--ll-svg-default-color': '#ef4444'\n  }}\n/>`}
                  </code>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-24 flex justify-center items-center min-h-[48px]">
                  <div id="default-color-js"></div>
                </div>
                <div className="ml-6 flex-1">
                  <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-pre">
                    {`getIcon('${availableIcon}', {\n  style: '${activeStyle}',\n  defaultColor: '#3b82f6'\n})`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 第二颜色变量 - 只为非default风格显示 */}
        {activeStyle !== "default" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
              CSS Variable: Second Color
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start">
                <div className="w-24 flex justify-center items-center min-h-[48px]">
                  <IconComponent
                    size={32}
                    style={
                      {
                        "--ll-svg-second-color": "#22c55e",
                      } as React.CSSProperties
                    }
                  />
                </div>
                <div className="ml-6 flex-1">
                  <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-pre">
                    {`<${IconComponent.displayName}\n  size={32}\n  style={{\n    '--ll-svg-second-color': '#22c55e'\n  }}\n/>`}
                  </code>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-24 flex justify-center items-center min-h-[48px]">
                  <div id="second-color-js"></div>
                </div>
                <div className="ml-6 flex-1">
                  <code className="rounded bg-gray-100 px-3 py-2 text-sm block overflow-x-auto whitespace-pre">
                    {`getIcon('${availableIcon}', {\n  style: '${activeStyle}',\n  secondaryColor: '#22c55e'\n})`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
