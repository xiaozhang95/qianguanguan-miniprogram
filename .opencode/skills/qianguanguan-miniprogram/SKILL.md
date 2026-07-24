---
name: qianguanguan-miniprogram
description: Use when writing or modifying code in qianguanguan-miniprogram/. Covers WeChat Mini Program, TypeScript, SCSS, Vant Weapp, Skyline/glass-easel, and project conventions.
---

# 钱罐罐 小程序开发规范

## 技术栈

- **框架**: WeChat Mini Program 原生 + TypeScript + SCSS
- **渲染引擎**: Skyline + glass-easel 组件框架
- **UI 库**: Vant Weapp（`@vant/weapp`）
- **HTTP**: 自定义 `wx.request` 封装 (`utils/request`)
- **后端**: qianguanguan-java Spring Boot（`/api/business`）
- **包管理**: pnpm
- **基础库**: 2.32.3

## 项目目录

| 路径               | 职责                         |
| ------------------ | ---------------------------- |
| `miniprogram/api/` | API 接口层，每个模块一个文件 |
| `miniprogram/pages/` | 页面，每个页面一个文件夹   |
| `miniprogram/config/` | 环境配置 + 静态资源常量    |
| `miniprogram/utils/` | 工具（wx 封装、request 封装）|
| `miniprogram/assets/` | 图片等静态资源             |
| `typings/`         | TypeScript 类型定义          |

## 代码质量

- **禁止** `eslint-disable` 注释
- 每次代码修改后运行 `pnpm lint`（`tsc --noEmit && eslint .`），确保零错误
- 如果 PowerShell 执行策略限制 `pnpm`，使用 `cmd /c "pnpm lint"`
- **禁止**可选链 `?.` 和空值合并 `??` — 微信小程序基础库不支持（`es6: false`），用 `if (x) x()` 替代

## 微信小程序特有约束

- **禁止** `Function` 类型 — ESLint 会报 `no-unsafe-function-type`，用具体回调类型替代
- **禁止** `any` 类型 — ESLint 会报 `no-explicit-any`
- `wx` API 统一用 `utils/wx.ts` 中的 Promise 封装，禁止页面内直接调 `wx.xxx`
- 页面 JSON 使用 `"navigationStyle": "custom"` 自定义导航栏
- Vant 组件在页面 JSON 中注册：`"usingComponents": { "van-xxx": "@vant/weapp/xxx/index" }`
- Skyline 专用属性：`"rendererOptions": { "skyline": { "defaultDisplayBlock": true } }`

## 样式约定

### 核心原则

- 每个页面对应一个 `index.scss`：`pages/setting/index.wxml` → `pages/setting/index.scss`
- `app.scss` 定义全局 CSS 变量 + 全局工具类
- **禁止** `style="{{}}"` 内联样式，所有样式提取到 SCSS 文件

### CSS 变量（定义在 app.scss `page {}` 中）

| 类别   | 变量                        | 值示例                    |
| ------ | --------------------------- | ------------------------- |
| 主题   | `--theme` `--theme-gradient` `--theme-light` | `#1677ff` / 渐变 / `rgba(...)` |
| 颜色   | `--color` `--color-secondary` `--color-light` | `#1d1d1d` `#666` `#999` |
| 背景   | `--bg` `--card-bg`          | `#f5f5f5` `#fff`    |
| 字号   | `--font-size-xs` `--font-size-sm` `--font-size` `--font-size-lg` `--font-size-xl` | 22/26/30/36/48rpx |
| 间距   | `--padding-sm` `--padding` `--padding-lg` | 16/24/32rpx         |
| 外边距 | `--margin-sm` `--margin` `--margin-lg` | 12/20/32rpx        |
| 圆角   | `--border-radius` | 12rpx           |
| 阴影   | `--shadow-sm` `--shadow` `--shadow-lg` | 各级阴影              |

### SCSS 中优先使用 CSS 变量，禁止硬编码

```scss
// 正确
font-size: var(--font-size);
padding: var(--padding);
color: var(--color);

// 错误
font-size: 30rpx;
padding: 24rpx;
color: #1d1d1d;
```

### 圆角规范

- 全局统一使用 `var(--border-radius)`（12rpx），**没有** `--border-radius-lg`
- 禁止硬编码 `8rpx`、`16rpx`、`20rpx`、`24rpx` 等圆角值
- 例外：圆形元素（头像、FAB 等）使用 `border-radius: 50%`；图表条等装饰元素按需

### 统计卡片与筛选栏布局

账单页中统计卡片和筛选栏用 `.stats-group` 包裹，`flex column + gap` 控制间距，外层统一负 margin 与头部重叠，子元素 `margin: 0`：

```xml
<view class="stats-group">
  <view class="stats-card">...</view>
  <view class="filter-bar">...</view>
</view>
```

```scss
.stats-group {
  margin: -20rpx var(--padding-lg) 0;
  display: flex; flex-direction: column; gap: var(--padding);
  position: relative; z-index: 10;
}
.stats-group .stats-card { margin: 0; border-radius: var(--border-radius); }
.stats-group .filter-bar { margin: 0; border-radius: var(--border-radius); }
```

### 硬编码允许场景

以下场景可使用硬编码值（页面特定的一次性颜色/尺寸，不在全局变量中）：
- 图标特定颜色（如 `#ef4444` 支出红、`#22c55e` 收入绿）
- 页面特有装饰元素尺寸

## Vant Weapp 使用规范

### 组件注册
```json
{
  "usingComponents": {
    "van-icon": "@vant/weapp/icon/index",
    "van-button": "@vant/weapp/button/index",
    "van-cell": "@vant/weapp/cell/index",
    "van-cell-group": "@vant/weapp/cell-group/index",
    "van-field": "@vant/weapp/field/index"
  }
}
```

### 常用模式

- **菜单列表**: `van-cell-group` (inset) + `van-cell` (is-link) + `van-icon` (slot="icon")
- **按钮**: `van-button type="primary" block round` 或自定义 `custom-class`
- **表单**: `van-field` 带 label/placeholder + `bind:change`
- **图标**: `van-icon` 尽量避免 `custom-class`，优先用 `color`/`size` prop

## API 调用规范

- 所有接口请求走 `utils/request.ts` 封装，自动带 JWT token、401 拦截、错误提示
- `api/*.ts` 导出纯函数，返回 `Promise<CtmResponse<T>>`
- **函数命名 = URL 路径转驼峰**（与 web 端一致）：`/user/info` → `userInfo()`, `/user/LoginByWid` → `loginByWid()`, `/user/profile` → `userProfile()`, `/bill/stats` → `billStats()`
- 页面内调用：`.then(({ data }) => ...)` 解构，错误统一走 `request.ts` 的 toast

```typescript
// api/user.ts
export function userInfo() {
  return request<UserInfo>({ url: '/user/info', method: 'GET' })
}

export function loginByWid(code: string) {
  return request<LoginResult>({ url: '/user/LoginByWid?code=' + code, method: 'GET' })
}

// 页面中调用
userInfo().then(({ data }) => {
  this.update('userInfo', data)
})
```

## 全局状态（app.ts）

| 方法       | 用途                         |
| ---------- | ---------------------------- |
| `watch(fn)` | 注册全局状态变化回调        |
| `update(key, value)` | 更新状态并通知所有 watcher |
| `isLogin(toast?)` | 返回 Promise，未登录则 reject |
| `login(code)` | 微信登录：code → LoginByWid → 存 token/userInfo |
| `exitLogin(fn?)` | 清空 token/userInfo |

## 收入/支出展示顺序

**所有 UI 中收入/支出同时出现时，支出在前、收入在后：**

- 统计卡片：支出 → 收入 → 结余
- 与 web 端保持一致

## 页面静态资源

- SVG/图片转 base64 存 `config/` 目录，页面 `data` 中引入后在 wxml 用 `{{ xxx }}` 引用
- 微信小程序不支持直接使用 SVG 文件，必须转为 base64 data URI

## 微信登录流程

```
用户点击"微信一键登录"
  → wx.login() 获取 code
  → GET /api/business/user/LoginByWid?code=xxx（Java 后端）
  → 返回 { token, userInfo }
  → doLogin(token, userInfo) 存入 globalData + storage
  → watch 回调通知页面刷新
```

## 环境配置

`config/index.ts` 根据 `wx.getAccountInfoSync().miniProgram.envVersion` 自动切换：

| 环境      | 后端地址                       |
| --------- | ------------------------------ |
| develop   | `http://localhost:8888`        |
| trial     | `http://47.108.152.97:8888`   |
| release   | `http://47.108.152.97:8888`   |
