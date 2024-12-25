import React from "react";
import { ReactOutlineIcon } from "@hashcoop/icons/outline";
import { ReactSolidIcon } from "@hashcoop/icons/solid";

export default function ReactDemo() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">基础用法</h3>
        <div className="flex items-center justify-center">
          <ReactOutlineIcon className="text-gray-600" size={24} />
        </div>
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm">
            {"<ReactOutlineIcon />"}
          </code>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">自定义大小</h3>
        <div className="flex items-center justify-center">
          <ReactOutlineIcon className="text-gray-600" size={32} />
        </div>
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm">
            {"<ReactOutlineIcon size={32} />"}
          </code>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">使用 currentColor</h3>
        <div className="flex items-center justify-center text-blue-500">
          <ReactOutlineIcon size={24} />
        </div>
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm">
            {'<div className="text-blue-500">'}
            <br />
            {"  <ReactOutlineIcon />"}
            <br />
            {"</div>"}
          </code>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">自定义默认颜色</h3>
        <div className="flex items-center justify-center">
          <ReactOutlineIcon
            size={24}
            style={
              { "--ll-svg-default-color": "#ef4444" } as React.CSSProperties
            }
          />
        </div>
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm whitespace-pre">
            {
              "<ReactOutlineIcon\n  style={{\n    '--ll-svg-default-color': '#ef4444'\n  }}\n/>"
            }
          </code>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">自定义第二颜色</h3>
        <div className="flex items-center justify-center">
          <ReactOutlineIcon
            size={24}
            style={
              { "--ll-svg-second-color": "#22c55e" } as React.CSSProperties
            }
          />
        </div>
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm whitespace-pre">
            {
              "<ReactOutlineIcon\n  style={{\n    '--ll-svg-second-color': '#22c55e'\n  }}\n/>"
            }
          </code>
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900">Solid 风格</h3>
        <div className="flex items-center justify-center">
          <ReactSolidIcon className="text-gray-600" size={24} />
        </div>
        <div className="mt-2">
          <code className="rounded bg-gray-100 px-2 py-1 text-sm">
            {"<ReactSolidIcon />"}
          </code>
        </div>
      </div>
    </div>
  );
}
