import React from "react";
import IconList from "./components/IconList";

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
            Beautiful hand-crafted SVG icons
          </p>
        </div>

        {/* 图标列表展示 */}
        <div className="mt-16">
          <IconList />
        </div>
      </div>
    </div>
  );
}

export default App;
