import React from "react";
import ReactDemo from "./demos/ReactDemo";
import VanillaDemo from "./demos/VanillaDemo";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* 头部 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Hashcoop Icons
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Beautiful hand-crafted SVG icons, by the makers of Hashcoop
          </p>
        </div>

        {/* 示例展示区域 */}
        <div className="mt-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-8">
            React Components
          </h2>
          <ReactDemo />

          <h2 className="text-lg font-semibold text-gray-900 mb-8 mt-16">
            JavaScript API
          </h2>
          <VanillaDemo />
        </div>
      </div>
    </div>
  );
}

export default App;
