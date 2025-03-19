import React, { useEffect, useState, useRef } from "react";
import * as OutlineIcons from "@hashcoop/icons/outline";
import * as SolidIcons from "@hashcoop/icons/solid";
import * as DefaultIcons from "@hashcoop/icons/default";
import { getIcon, getAllIconNames } from "@hashcoop/icons/js";
import { Transition } from "react-transition-group";

interface IconStyle {
  name: string; // React 组件名 (PascalCase)
  ReactComponent: React.ComponentType<any>;
  kebabName: string; // 中横线格式名 (kebab-case)
}

interface IconListProps {
  activeTab: "outline" | "solid" | "default" | "image";
  displayMode: "react" | "js";
}

// 将 PascalCase 转换为 kebab-case
function pascalToKebab(str: string): string {
  // 先去掉风格后缀
  const baseName = str.replace(/(Outline|Solid|Default)$/, "");
  // 然后转换为 kebab-case
  return baseName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

// 定义过渡动画的样式
const duration = 150;

const transitionStyles = {
  entering: { opacity: 0, transform: "translateX(20px)" },
  entered: { opacity: 1, transform: "translateX(0)" },
  exiting: { opacity: 0, transform: "translateX(-20px)" },
  exited: { opacity: 0, transform: "translateX(20px)" },
};

export default function IconList({
  activeTab,
  displayMode: propDisplayMode,
}: IconListProps) {
  const [icons, setIcons] = useState<IconStyle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIcons, setFilteredIcons] = useState<IconStyle[]>([]);
  const [displayMode, setDisplayMode] = useState<"react" | "js">("js");
  const [gridHeight, setGridHeight] = useState(350); // 默认网格高度
  const gridRef = useRef<HTMLDivElement>(null);

  // 添加 Transition 组件所需的 refs
  const reactTransitionRef = useRef(null);
  const jsTransitionRef = useRef(null);

  // 同步顶层displayMode状态
  useEffect(() => {
    setDisplayMode(propDisplayMode);
  }, [propDisplayMode]);

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

  // 在显示模式切换时，确保JS图标正确渲染
  useEffect(() => {
    if (displayMode === "js" && filteredIcons.length > 0) {
      // 立即渲染JS图标，避免切换时闪烁
      renderJSIcons();
    }
  }, [displayMode, filteredIcons, activeTab]);

  // 渲染 JS 图标的函数
  const renderJSIcons = () => {
    filteredIcons.forEach((icon) => {
      // 根据不同的风格设置不同的参数
      const iconParams: any = {
        style: activeTab,
        size: 54,
        className: "max-w-full max-h-full object-contain",
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

  // 在图标列表变化时计算网格高度
  useEffect(() => {
    const calculateGridHeight = () => {
      if (filteredIcons.length === 0) return;

      // 根据图标数量和布局计算行数
      const itemsPerRow =
        window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 4 : 6;
      const rows = Math.ceil(filteredIcons.length / itemsPerRow);

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
  }, [filteredIcons]);

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
            placeholder="搜索图标..."
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
            {filteredIcons.length}
          </span>{" "}
          / {icons.length} 个图标
        </div>
      </div>

      {/* 图标网格 - 带过渡效果 */}
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
                  {filteredIcons.map((icon) => (
                    <div
                      key={`react-${icon.name}`}
                      className="border border-gray-200 rounded-md overflow-hidden flex flex-col min-h-[150px] justify-between hover:shadow-lg transition-shadow duration-200"
                    >
                      <div
                        className="flex-grow p-2 rounded-md bg-gray-50 flex items-center justify-center"
                        style={{ height: "100px" }}
                      >
                        {/* default 风格下不传入 className 以使用原始颜色 */}
                        {activeTab === "default" ? (
                          <icon.ReactComponent size={54} />
                        ) : (
                          <icon.ReactComponent
                            size={54}
                            className="text-[#1246ff]"
                          />
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-200 text-center">
                        <span className="text-sm font-medium text-blue-600">
                          {icon.name}
                        </span>
                      </div>
                    </div>
                  ))}
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
                  {filteredIcons.map((icon) => (
                    <div
                      key={`js-box-${icon.kebabName}`}
                      className="border border-gray-200 rounded-md overflow-hidden flex flex-col min-h-[150px] justify-between hover:shadow-lg transition-shadow duration-200"
                    >
                      <div
                        className="flex-grow p-2 rounded-md bg-gray-50 flex items-center justify-center"
                        style={{ height: "100px" }}
                      >
                        <div id={`js-${icon.kebabName}`}></div>
                      </div>
                      <div className="p-2 border-t border-gray-200 text-center">
                        <span className="text-sm font-medium text-blue-600">
                          {icon.kebabName}
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
    </div>
  );
}
