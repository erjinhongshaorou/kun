import React, { useState } from "react";
import IconList from "./components/IconList";
import IconUsage from "./components/IconUsage";

function App() {
  const [activeTab, setActiveTab] = useState<"outline" | "solid" | "default">(
    "outline"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* 头部 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Hashcoop Icons
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Beautiful hand-crafted SVG icons
          </p>
        </div>

        {/* 标签切换 */}
        <div className="mt-12 mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 justify-center">
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
            <button
              onClick={() => setActiveTab("default")}
              className={`${
                activeTab === "default"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Default
            </button>
          </nav>
        </div>

        {/* 图标列表展示 */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Icons
          </h2>
          <IconList activeTab={activeTab} />
        </div>

        {/* 使用示例 */}
        <div className="mt-10 mb-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Icon Usage Examples -{" "}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Style
          </h2>
          <IconUsage activeStyle={activeTab} />
        </div>
      </div>
    </div>
  );
}

export default App;
