import React from "react";

const NamingConvention: React.FC = () => {
  return (
    <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-5">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">图标命名约定</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-blue-700 mb-2">后端 API</h4>
          <p className="text-blue-600 mb-2">
            <strong>始终使用中横线格式</strong> 作为图标名称:
          </p>
          <div className="bg-white rounded p-3 mb-2">
            <code className="text-sm">return-arrow</code>,{" "}
            <code className="text-sm">user-profile</code>,{" "}
            <code className="text-sm">calendar-event</code>
          </div>
          <p className="text-sm text-blue-600">
            后端返回的图标名称应该保持这种格式，前端会自动处理转换。
          </p>
        </div>

        <div>
          <h4 className="font-medium text-blue-700 mb-2">前端组件</h4>
          <p className="text-blue-600 mb-2">React 组件使用 Pascal 命名法:</p>
          <div className="bg-white rounded p-3 mb-2">
            <code className="text-sm">&#60;ReturnArrowOutline /&#62;</code>,{" "}
            <code className="text-sm">&#60;UserProfileSolid /&#62;</code>
          </div>
          <p className="text-blue-600 mb-2">JS API 使用中横线格式:</p>
          <div className="bg-white rounded p-3 mb-1">
            <code className="text-sm">getIcon('return-arrow')</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NamingConvention;
