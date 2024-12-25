import React, { useEffect } from "react";
import { getIcon } from "@hashcoop/icons/js";

export default function VanillaDemo() {
  useEffect(() => {
    // 基础用法
    const basicIcon = getIcon("react", {
      style: "outline",
      size: 24,
    });
    document.getElementById("basic-js")!.innerHTML = basicIcon || "";

    // 自定义大小
    const largeIcon = getIcon("react", {
      style: "outline",
      size: 32,
    });
    document.getElementById("large-js")!.innerHTML = largeIcon || "";

    // 默认颜色
    const defaultColorIcon = getIcon("react", {
      style: "outline",
      size: 24,
      defaultColor: "#ef4444",
    });
    document.getElementById("default-color-js")!.innerHTML =
      defaultColorIcon || "";

    // 第二颜色
    const secondColorIcon = getIcon("react", {
      style: "outline",
      size: 24,
      secondaryColor: "#22c55e",
    });
    document.getElementById("second-color-js")!.innerHTML =
      secondColorIcon || "";

    // currentColor
    const currentColorIcon = getIcon("react", {
      style: "outline",
      size: 24,
      color: "#3b82f6",
    });
    document.getElementById("current-color-js")!.innerHTML =
      currentColorIcon || "";
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">基础用法</h3>
        <div id="basic-js" className="flex items-center justify-center" />
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm whitespace-pre">
            {"getIcon('react', {\n  style: 'outline'\n})"}
          </code>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">自定义大小</h3>
        <div id="large-js" className="flex items-center justify-center" />
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm whitespace-pre">
            {"getIcon('react', {\n  size: 32\n})"}
          </code>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">自定义默认颜色</h3>
        <div
          id="default-color-js"
          className="flex items-center justify-center"
        />
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm whitespace-pre">
            {"getIcon('react', {\n  defaultColor: '#ef4444'\n})"}
          </code>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">自定义第二颜色</h3>
        <div
          id="second-color-js"
          className="flex items-center justify-center"
        />
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm whitespace-pre">
            {"getIcon('react', {\n  secondaryColor: '#22c55e'\n})"}
          </code>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">使用 currentColor</h3>
        <div
          id="current-color-js"
          className="flex items-center justify-center"
        />
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm whitespace-pre">
            {"getIcon('react', {\n  color: '#3b82f6'\n})"}
          </code>
        </div>
      </div>
    </div>
  );
}
