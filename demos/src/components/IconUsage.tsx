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
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

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

      // 默认颜色变量 - 尺寸调大到 32px (对所有风格都显示，但对default只是示例)
      const defaultColorIcon = getIcon(iconName, {
        style: style as any,
        size: 32,
        defaultColor: "#3b82f6",
      });
      if (document.getElementById("default-color-js")) {
        document.getElementById("default-color-js")!.innerHTML =
          defaultColorIcon || "";
      }

      // 第二颜色变量 - 尺寸调大到 32px (对所有风格都显示，但对default只是示例)
      const secondColorIcon = getIcon(iconName, {
        style: style as any,
        size: 32,
        secondaryColor: "#22c55e",
      });
      if (document.getElementById("second-color-js")) {
        document.getElementById("second-color-js")!.innerHTML =
          secondColorIcon || "";
      }
    }, 0);
  };

  // 如果没有找到可用的组件，显示一个占位符
  if (!IconComponent) {
    return <div className="p-6 text-center text-gray-500">加载图标中...</div>;
  }

  return (
    <div>
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
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block">
                  {`<${IconComponent.displayName} />`}
                </code>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <div id="basic-js"></div>
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block">
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
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block">
                  {`<${IconComponent.displayName} size={48} />`}
                </code>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <div id="large-js"></div>
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block">
                  {`getIcon('${availableIcon}', { style: '${activeStyle}', size: 48 })`}
                </code>
              </div>
            </div>
          </div>
        </div>

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
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block whitespace-pre">
                  {`<div className="text-red-500">\n  <${IconComponent.displayName} size={32} />\n</div>`}
                </code>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <div id="color-js"></div>
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block whitespace-pre">
                  {`getIcon('${availableIcon}', {\n  style: '${activeStyle}',\n  color: '#ef4444'\n})`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* 默认颜色变量 - 对所有风格都显示 */}
        <div
          className={`rounded-lg border ${
            activeStyle === "default"
              ? "border-gray-200 bg-white"
              : "border-gray-200 bg-white"
          } p-6 shadow-sm`}
        >
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
            CSS Variable: Default Color
            {activeStyle === "default" && (
              <span className="text-xs text-gray-500 ml-2">(样例展示)</span>
            )}
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
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block whitespace-pre">
                  {`<${IconComponent.displayName}\n  size={32}\n  style={{\n    '--ll-svg-default-color': '#ef4444'\n  }}\n/>`}
                </code>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <div id="default-color-js"></div>
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block whitespace-pre">
                  {`getIcon('${availableIcon}', {\n  style: '${activeStyle}',\n  defaultColor: '#3b82f6'\n})`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* 第二颜色变量 - 对所有风格都显示 */}
        <div
          className={`rounded-lg border ${
            activeStyle === "default"
              ? "border-gray-200 bg-white"
              : "border-gray-200 bg-white"
          } p-6 shadow-sm`}
        >
          <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
            CSS Variable: Second Color
            {activeStyle === "default" && (
              <span className="text-xs text-gray-500 ml-2">(样例展示)</span>
            )}
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
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block whitespace-pre">
                  {`<${IconComponent.displayName}\n  size={32}\n  style={{\n    '--ll-svg-second-color': '#22c55e'\n  }}\n/>`}
                </code>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 flex justify-center items-center min-h-[48px]">
                <div id="second-color-js"></div>
              </div>
              <div className="ml-6 flex-1">
                <code className="rounded bg-gray-100 px-3 py-2 text-sm block whitespace-pre">
                  {`getIcon('${availableIcon}', {\n  style: '${activeStyle}',\n  secondaryColor: '#22c55e'\n})`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
