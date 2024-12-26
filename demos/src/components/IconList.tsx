import React, { useEffect, useState } from "react";
import * as OutlineIcons from "@hashcoop/icons/outline";
import * as SolidIcons from "@hashcoop/icons/solid";
import { getIcon } from "@hashcoop/icons/js";

interface IconStyle {
  name: string;
  ReactComponent: React.ComponentType<any>;
  jsName: string;
}

export default function IconList() {
  const [activeTab, setActiveTab] = useState<"outline" | "solid">("outline");
  const [icons, setIcons] = useState<IconStyle[]>([]);

  useEffect(() => {
    const currentIcons = activeTab === "outline" ? OutlineIcons : SolidIcons;

    const availableIcons = Object.entries(currentIcons).map(
      ([name, Component]) => {
        const baseName = name.replace(/(Outline|Solid)Icon$/, "");
        return {
          name,
          ReactComponent: Component,
          jsName: baseName,
        };
      }
    );

    setIcons(availableIcons);

    setTimeout(() => {
      availableIcons.forEach((icon) => {
        const jsIcon = getIcon(icon.jsName, {
          style: activeTab,
          size: 40,
          color: "#1246ff",
          // 只在 solid 风格时设置第二颜色
          ...(activeTab === "solid" ? { secondaryColor: "#EEF1FB" } : {}),
        });
        const container = document.getElementById(`js-${icon.jsName}`);
        if (container && jsIcon) {
          container.innerHTML = jsIcon;
        }
      });
    });
  }, [activeTab]);

  return (
    <div>
      {/* 标签切换 */}
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

      {/* 图标网格 */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* React 组件版本 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            React Components ({icons.length} icons)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {icons.map((icon) => (
              <div
                key={`react-${icon.name}`}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white min-w-[120px] min-h-[120px]"
              >
                <div className="flex items-center justify-center h-[40px]">
                  <icon.ReactComponent size={40} className="text-[#1246ff]" />
                </div>
                <span className="mt-2 text-xs text-gray-500 text-center break-words w-full">
                  {icon.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* JS API 版本 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            JavaScript API ({icons.length} icons)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {icons.map((icon) => (
              <div
                key={`js-${icon.jsName}`}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white min-w-[120px] min-h-[120px]"
              >
                <div className="flex items-center justify-center h-[40px]">
                  <div id={`js-${icon.jsName}`}></div>
                </div>
                <span className="mt-2 text-xs text-gray-500 text-center break-words w-full">
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
