import React, { useEffect, useState } from "react";
import * as OutlineIcons from "@hashcoop/icons/outline";
import * as SolidIcons from "@hashcoop/icons/solid";
import { getIcon, getAllIconNames } from "@hashcoop/icons/js";

interface IconStyle {
  name: string;
  ReactComponent: React.ComponentType<any>;
  jsName: string;
}

export default function IconList() {
  const [activeTab, setActiveTab] = useState<"outline" | "solid">("outline");
  const [icons, setIcons] = useState<IconStyle[]>([]);

  useEffect(() => {
    // 获取所有图标
    const iconSet = activeTab === "outline" ? OutlineIcons : SolidIcons;
    const iconNames = getAllIconNames(activeTab);

    const iconList = Object.entries(iconSet).map(([name, Component]) => ({
      name,
      ReactComponent: Component,
      jsName: name.replace(/^(.+?)(Outline|Solid)Icon$/, "$1").toLowerCase(),
    }));

    setIcons(iconList);
  }, [activeTab]);

  useEffect(() => {
    // 为 JS 版本渲染图标
    icons.forEach((icon) => {
      const jsIcon = getIcon(icon.jsName, {
        style: activeTab,
        size: 40,
        color: "#1246ff",
      });
      const container = document.getElementById(`js-${icon.jsName}`);
      if (container && jsIcon) {
        container.innerHTML = jsIcon;
      }
    });
  }, [icons, activeTab]);

  return (
    <div>
      {/* 样式切换标签 */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("outline")}
            className={`${
              activeTab === "outline"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Outline
          </button>
          <button
            onClick={() => setActiveTab("solid")}
            className={`${
              activeTab === "solid"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Solid
          </button>
        </nav>
      </div>

      {/* 图标列表 */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* React 组件版本 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            React Components
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {icons.map((icon) => (
              <div
                key={`react-${icon.name}`}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white"
              >
                <icon.ReactComponent size={40} className="text-[#1246ff]" />
                <span className="mt-2 text-xs text-gray-500 text-center truncate w-full">
                  {icon.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* JS API 版本 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            JavaScript API
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {icons.map((icon) => (
              <div
                key={`js-${icon.jsName}`}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white"
              >
                <div id={`js-${icon.jsName}`}></div>
                <span className="mt-2 text-xs text-gray-500 text-center truncate w-full">
                  {icon.jsName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
