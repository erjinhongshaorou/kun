# Hashcoop Icons

一个现代的 SVG 图标库，支持 React 组件和原生 JS 使用方式，提供灵活的颜色自定义功能。

## 特性

- 💎 高质量的 SVG 图标
- 🎨 支持两种风格：outline 和 solid
- 🎯 支持 Tree Shaking
- 🌈 灵活的颜色定制系统
- 📦 支持按需加载
- 🔧 TypeScript 支持

## 安装

```bash
npm install @hashcoop/icons
# 或
yarn add @hashcoop/icons
# 或
pnpm add @hashcoop/icons
```

## 使用方式

### React 组件

```jsx
import { ReactOutlineIcon } from "@hashcoop/icons/outline";
// 或
import { ReactSolidIcon } from "@hashcoop/icons/solid";

function App() {
  return (
    <>
      {/* 基础用法 */}
      <ReactOutlineIcon />

      {/* 自定义大小 */}
      <ReactOutlineIcon size={32} />

      {/* 使用 currentColor */}
      <div className="text-blue-500">
        <ReactOutlineIcon />
      </div>

      {/* 使用 CSS 变量自定义颜色 */}
      <ReactOutlineIcon style={{ "--ll-svg-default-color": "#ef4444" }} />

      <ReactOutlineIcon style={{ "--ll-svg-second-color": "#22c55e" }} />
    </>
  );
}
```

### JavaScript API

```javascript
import { getIcon } from "@hashcoop/icons/js";

// 基础用法
const icon = getIcon("react", { style: "outline" });

// 自定义大小
const largeIcon = getIcon("react", {
  style: "outline",
  size: 32,
});

// 自定义颜色
const customIcon = getIcon("react", {
  style: "outline",
  defaultColor: "#ef4444", // 替换默认颜色
  secondaryColor: "#22c55e", // 替换第二颜色
  color: "#3b82f6", // 替换 currentColor
});

// 在 HTML 中使用
document.querySelector(".icon-container").innerHTML = icon;
```

## 颜色系统

图标库支持三种颜色定制方式：

1. **currentColor** (`#1246ff` → `currentColor`)

   - React: 通过父元素的 `color` 或 `className` 控制
   - JS API: 通过 `color` 选项设置

2. **默认颜色** (`#000000` → `var(--ll-svg-default-color)`)

   - React: 通过 CSS 变量 `--ll-svg-default-color` 控制
   - JS API: 通过 `defaultColor` 选项设置

3. **第二颜色** (`#e5e5eb` → `var(--ll-svg-second-color)`)
   - React: 通过 CSS 变量 `--ll-svg-second-color` 控制
   - JS API: 通过 `secondaryColor` 选项设置

## API 参考

### React 组件属性

| 属性      | 类型             | 默认值 | 描述                        |
| --------- | ---------------- | ------ | --------------------------- |
| size      | number \| string | 24     | 图标大小                    |
| className | string           | ''     | CSS 类名                    |
| style     | CSSProperties    | {}     | 样式对象，可以设置 CSS 变量 |
| title     | string           | -      | 无障碍标题                  |

### JavaScript API

#### getIcon(name, options)

| 参数                   | 类型                 | 默认值    | 描述              |
| ---------------------- | -------------------- | --------- | ----------------- |
| name                   | string               | -         | 图标名称          |
| options.size           | number \| string     | 24        | 图标大小          |
| options.style          | 'outline' \| 'solid' | 'outline' | 图标风格          |
| options.className      | string               | ''        | CSS 类名          |
| options.color          | string               | -         | 替换 currentColor |
| options.defaultColor   | string               | -         | 替换默认颜色      |
| options.secondaryColor | string               | -         | 替换第二颜色      |

## 开发

```bash
# 安装依赖
pnpm install

# 构建图标库
pnpm build

# 运行示例项目
cd demos
pnpm install
pnpm dev
```

### Demo 项目的额外依赖

Demo 项目使用了以下技术：

- Vite
- React
- TypeScript
- Tailwind CSS

要运行 demo，需要安装这些依赖：

```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 许可证

MIT
