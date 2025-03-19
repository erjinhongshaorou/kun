import React, { useState, useEffect, useRef } from "react";
import IconList from "./components/IconList";
import IconUsage from "./components/IconUsage";
import NamingConvention from "./components/NamingConvention";
import ImageList from "./components/ImageList";
import { Transition } from "react-transition-group";

// 定义过渡动画的样式
const duration = 150;

const transitionStyles = {
  entering: { opacity: 0, transform: "translateX(20px)" },
  entered: { opacity: 1, transform: "translateX(0)" },
  exiting: { opacity: 0, transform: "translateX(-20px)" },
  exited: { opacity: 0, transform: "translateX(20px)" },
};

function App() {
  const [activeTab, setActiveTab] = useState<
    "outline" | "solid" | "default" | "images"
  >("outline");
  const [displayMode, setDisplayMode] = useState<"react" | "js">("js");
  const scrollPosRef = useRef<number>(0);
  const nodeRef = useRef(null); // Transition需要的ref

  // 处理标签切换，保存滚动位置
  const handleTabChange = (tab: "outline" | "solid" | "default" | "images") => {
    // 保存当前滚动位置
    scrollPosRef.current = window.scrollY;
    setActiveTab(tab);
  };

  // 处理显示模式切换
  const handleDisplayModeChange = (mode: "react" | "js") => {
    // 避免重复切换
    if (mode === displayMode) return;

    // 平滑切换
    setDisplayMode(mode);
  };

  // 在组件更新后恢复滚动位置
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, scrollPosRef.current);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* 头部 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Hashcoop Icons
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Beautiful hand-crafted SVG icons and images
          </p>
        </div>

        {/* 标签切换 */}
        <div className="mt-8 mb-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange("outline")}
                className={`${
                  activeTab === "outline"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Outline
              </button>
              <button
                onClick={() => handleTabChange("solid")}
                className={`${
                  activeTab === "solid"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Solid
              </button>
              <button
                onClick={() => handleTabChange("default")}
                className={`${
                  activeTab === "default"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Default
              </button>
              <button
                onClick={() => handleTabChange("images")}
                className={`${
                  activeTab === "images"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } pb-4 px-1 border-b-2 font-medium text-sm`}
              >
                Images
              </button>
            </nav>

            {/* 显示模式切换 */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors pb-4">
                <span>
                  {displayMode === "js" ? "JavaScript API" : "React Components"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 transform opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-right">
                <div className="py-1">
                  <button
                    onClick={() => handleDisplayModeChange("js")}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      displayMode === "js"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    JavaScript API
                  </button>
                  <button
                    onClick={() => handleDisplayModeChange("react")}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      displayMode === "react"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    React Components
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 图标和图片展示区域 - 带过渡效果 */}
        <div className="relative">
          <Transition
            nodeRef={nodeRef}
            in={true}
            appear={true}
            timeout={duration}
          >
            {(state) => (
              <div
                ref={nodeRef}
                style={{
                  transition: `all ${duration}ms ease-in-out`,
                  ...transitionStyles[state],
                  position: "relative",
                }}
              >
                {/* 增加一个固定高度的容器，防止内容切换时位置跳动 */}
                <div style={{ minHeight: "500px" }}>
                  {activeTab === "images" ? (
                    <div>
                      <ImageList displayMode={displayMode} />
                    </div>
                  ) : (
                    <>
                      {/* 图标列表展示 */}
                      <div>
                        <IconList
                          activeTab={activeTab}
                          displayMode={displayMode}
                        />
                      </div>

                      {/* 命名约定说明 */}
                      <div className="mt-16">
                        <NamingConvention />
                      </div>

                      {/* 使用示例 */}
                      <div className="mt-10 mb-16">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                          Icon Usage Examples -{" "}
                          {activeTab.charAt(0).toUpperCase() +
                            activeTab.slice(1)}{" "}
                          Style
                        </h2>
                        <IconUsage activeStyle={activeTab} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </Transition>
        </div>
      </div>
    </div>
  );
}

export default App;
