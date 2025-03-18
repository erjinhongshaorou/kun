import React, { useEffect, useState } from "react";
import * as OutlineIcons from "@hashcoop/icons/outline";
import * as SolidIcons from "@hashcoop/icons/solid";
import * as DefaultIcons from "@hashcoop/icons/default";
import { getIcon, getAllIconNames } from "@hashcoop/icons/js";

interface IconStyle {
  name: string; // React 组件名 (PascalCase)
  ReactComponent: React.ComponentType<any>;
  kebabName: string; // 中横线格式名 (kebab-case)
}

interface IconListProps {
  activeTab: "outline" | "solid" | "default" | "images";
}

// 将 PascalCase 转换为 kebab-case
function pascalToKebab(str: string): string {
  // 先去掉风格后缀
  const baseName = str.replace(/(Outline|Solid|Default)$/, "");
  // 然后转换为 kebab-case
  return baseName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

export default function IconList({ activeTab }: IconListProps) {
  const [icons, setIcons] = useState<IconStyle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIcons, setFilteredIcons] = useState<IconStyle[]>([]);

  useEffect(() => {
    let currentIcons;
    switch (activeTab) {
      case "outline":
        currentIcons = OutlineIcons;
        break;
      case "solid":
        currentIcons = SolidIcons;
        break;
      case "default":
        currentIcons = DefaultIcons;
        break;
    }

    // 映射组件与中横线名称
    const availableIcons = Object.entries(currentIcons).map(
      ([name, Component]) => {
        // 从组件名转换获取中横线格式名
        const kebabName = pascalToKebab(name);

        return {
          name,
          ReactComponent: Component as React.ComponentType<any>,
          kebabName,
        };
      }
    );

    setIcons(availableIcons);
    // 重置搜索
    setSearchTerm("");
    setFilteredIcons(availableIcons);
  }, [activeTab]);

  // 当搜索词或图标列表变化时过滤图标
  useEffect(() => {
    const filtered = searchTerm
      ? icons.filter(
          (icon) =>
            icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            icon.kebabName.includes(searchTerm.toLowerCase())
        )
      : icons;

    setFilteredIcons(filtered);
  }, [searchTerm, icons]);

  // 渲染 JS 图标的副作用
  useEffect(() => {
    // 延迟一点执行，确保 DOM 已经更新
    const timeoutId = setTimeout(() => {
      renderJSIcons();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [filteredIcons, activeTab]);

  // 渲染 JS 图标的函数
  const renderJSIcons = () => {
    filteredIcons.forEach((icon) => {
      // 根据不同的风格设置不同的参数
      const iconParams: any = {
        style: activeTab,
        size: 40,
      };

      // default 风格下不设置颜色，使用原始颜色
      if (activeTab !== "default") {
        iconParams.color = "#1246ff";
        // 在 solid 风格时设置第二颜色
        if (activeTab === "solid") {
          iconParams.secondaryColor = "#EEF1FB";
        }
      }

      const jsIcon = getIcon(icon.kebabName, iconParams);
      const container = document.getElementById(`js-${icon.kebabName}`);
      if (container && jsIcon) {
        container.innerHTML = jsIcon;
      }
    });
  };

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
            placeholder="Search icons..."
          />
        </div>
      </div>

      {/* 图标统计 */}
      <div className="text-center mb-6 text-gray-500">
        Showing {filteredIcons.length} of {icons.length} icons
      </div>

      {/* 图标网格 */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* React 组件版本 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            React Components
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            使用 PascalCase 命名的 React 组件
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredIcons.map((icon) => (
              <div
                key={`react-${icon.name}`}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 min-w-[120px] min-h-[120px]"
              >
                <div className="flex items-center justify-center h-[40px]">
                  {/* default 风格下不传入 className 以使用原始颜色 */}
                  {activeTab === "default" ? (
                    <icon.ReactComponent size={40} />
                  ) : (
                    <icon.ReactComponent size={40} className="text-[#1246ff]" />
                  )}
                </div>
                <span className="mt-2 text-xs text-gray-500 text-center break-words w-full">
                  {icon.name}
                </span>
                <span className="mt-1 text-xs text-blue-400 text-center break-words w-full">
                  {icon.kebabName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* JS API 版本 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            JavaScript API
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            使用 kebab-case 中横线格式的 JS 图标
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredIcons.map((icon) => (
              <div
                key={`js-box-${icon.kebabName}`}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 min-w-[120px] min-h-[120px]"
              >
                <div className="flex items-center justify-center h-[40px]">
                  <div id={`js-${icon.kebabName}`}></div>
                </div>
                <span className="mt-2 text-xs font-medium text-blue-500 text-center break-words w-full">
                  {icon.kebabName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
