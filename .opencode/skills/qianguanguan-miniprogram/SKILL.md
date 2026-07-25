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
- **禁止** `Function` 类型 — ESLint 会报 `no-unsafe-function-type`，用具体回调类型替代
- **禁止** `any` 类型 — ESLint 会报 `no-explicit-any`。`app` 字段用 `null as { offsetTop: number; capsuleTop: number } | null`
- **禁止** `var` — 使用 `const` 或 `let`
- 页面 JSON 只能注册真正在 WXML 中使用的组件，禁止冗余注册
- **字符串拼接**使用 `+`，禁止模板字符串 `` `${}` ``（es6: false）

## 微信小程序特有约束

- `wx` API 统一用 `utils/wx.ts` 中的 Promise 封装，**禁止页面内直接调 `wx.xxx`**
- 页面 JSON 使用 `"navigationStyle": "custom"` 自定义导航栏
- Vant 组件在页面 JSON 中注册：`"usingComponents": { "van-xxx": "@vant/weapp/xxx/index" }`
- Skyline 专用属性：`"rendererOptions": { "skyline": { "defaultDisplayBlock": true, "defaultContentBox": true } }`
- **不要**添加 `tagNameStyleIsolation`、`disableABTest`、`sdkVersionBegin/End` 等非法/过时配置
- 模块导入必须带 `/index` 后缀（如 `'../../constants/index'`），否则微信编译器可能解析失败

## 共用组件（`components/`）

| 组件 | 用途 | Props |
|------|------|-------|
| `stats-card` | 收支/分类统计卡片 | expenseStr, incomeStr, balanceStr, balanceClass |
| `fixed-nav-bar` | 滚动固定导航栏 | title, app（需页面 onPageScroll 转发） |
| `filter-tabs` | 支出/收入筛选标签 | tabs[{label,type}], activeIndex; bind:change → e.detail.index |
| `fab-button` | 悬浮加号按钮 | bind:tap |
| `loading-block` | 加载状态 | loading, text |

**所有页面必须使用组件，禁止内联重复 HTML。** 组件代码在 `components/` 下，样式统一走 `common.scss`。

### 组件使用示例

```xml
<!-- page.wxml -->
<fixed-nav-bar id="fixed-nav" title="账单" app="{{ app }}" />
<stats-card expense-str="{{ expenseStr }}" income-str="{{ incomeStr }}" balance-str="{{ balanceStr }}" balance-class="{{ balanceClass }}" />
<filter-tabs tabs="{{ filterTabs }}" active-index="{{ activeTab }}" bind:change="onFilterTabChange" />
<loading-block loading="{{ loading }}" />
<fab-button bind:tap="onAddBill" />
```

```ts
// page.ts — filterTabs 数据格式
filterTabs: [
  { label: '支出', type: 'expense' },
  { label: '收入', type: 'income' }
]

// filter-tabs 事件处理
onFilterTabChange(e: WechatMiniprogram.CustomEvent) {
  const idx = e.detail.index as number
}
```

`fixed-nav-bar` 需要页面转发 `onPageScroll`：
```ts
onPageScroll(e: { scrollTop: number }) {
  const nav = this.selectComponent('#fixed-nav')
  if (nav) nav.onPageScroll(e)
}
```

### 组件属性处理 null 值

若框架报警告 `received type-uncompatible value: expected <String> but get null`，在组件 WXML 用 WXS 兜底：

```xml
<wxs module="f">
  var cls = function(v) { return v || 'default'; };
  module.exports = { cls: cls };
</wxs>
<text class="{{ f.cls(propName) }}">...</text>
```

同时在组件 TS 中将该属性 type 设为 `null`（允许任意类型），消除框架校验警告。

## 枚举常量（`constants/index.ts`）

- **强制使用** `BillType.INCOME` / `BillType.EXPENSE`，禁止字符串字面量
- 标签文本使用 `BillTypeLabel`、`RoleLabel`
- 可变的 `formType`/`filterType` 用 `BillType.EXPENSE as string` 加宽类型
- **响应状态码** 使用 `ResponseCode.SUCCESS` = 200，禁止硬编码 `200`
- TS 文件 import：`import { BillType, ResponseCode } from '../../constants/index'`
- WXML 中需要在 page data 里传入 `BillType` 才能用 `{{ BillType.INCOME }}`：`data: { BillType, ... }`

## 配置常量（`config/index.ts`）

`config` 对象包含环境配置和路径常量：

| 字段 | 值 | 用途 |
|------|-----|------|
| `url` | `http://47.108.152.97:8888` | 后端地址 |
| `baseUrl` | `/api/business` | API 前缀 |
| `uploadPath` | `/upload/` | 上传文件路径前缀 |

**图标 URL 判断必须使用 `config.uploadPath`，禁止硬编码 `'/upload/'`。**

```ts
import config from '../../config/index'

// 正确
const isImg = !!(c.icon && (c.icon.indexOf(config.uploadPath) === 0 || c.icon.indexOf('http') === 0))
const icon = isImg && c.icon.indexOf(config.uploadPath) === 0 ? config.url + c.icon : c.icon

// 错误
const isImg = !!(c.icon && c.icon.indexOf('/upload/') === 0)
```

## 导航跳转（`utils/wx.ts`）

### 防抖导航

所有 `navigateTo` 跳转必须使用 `debounceNavigateTo` 防止 Skyline 下双击触发两次：

```ts
import { debounceNavigateTo, wxNavigateBack } from '../../utils/wx'

// 跳转页面（自动 500ms 防抖）
debounceNavigateTo('bill-form', 'date=' + this.data.filterDate)
debounceNavigateTo('bill-form', 'id=' + bill.id)
debounceNavigateTo('category-form')

// 返回上一页
wxNavigateBack()
```

### 可用方法

| 方法 | 参数 | 用途 |
|------|------|------|
| `wxNavigateTo(name, query?)` | 页面名, 可选 query string | 跳转页面 |
| `debounceNavigateTo(name, query?)` | 同上 | 防抖跳转（500ms） |
| `wxNavigateBack()` | 无 | 返回上一页 |
| `wxShowToast({ title, icon?, duration? })` | title, icon='none', duration=2000 | 显示 toast |

## 表单页面规范

**禁止用弹窗（van-popup）做表单**，Skyline + HarmonyOS 下键盘兼容问题无解。统一用独立页面 + navigateTo 跳转。

### 页面结构

```
pages/
├── bill/index          # 账单列表（FAB → bill-form）
├── bill-form/index     # 记一笔/编辑账单
│   ├── 表单字段使用 .form-field + .field-label（common.scss）
│   ├── 分类选择器用 van-popup + cat-picker-wrap
│   ├── 日期选择器用 van-popup + van-datetime-picker
│   └── 删除按钮用 .del-btn
├── category/index      # 分类列表（FAB → category-form）
└── category-form/index # 新增/编辑分类
    ├── 图标选择用 ChooseImage + 上传
    └── 删除按钮用 .del-btn
```

### 页面头部模板

参考 `pages/user/index.wxml` 的 header 结构（渐变背景 + 回退按钮 + 标题）：

```xml
<view class="page">
  <view class="header">
    <view class="header-bg">
      <view class="header-circle c1"></view>
      <view class="header-circle c2"></view>
    </view>
    <view class="header-content">
      <view class="nav-bar" style="height:{{ app.offsetTop }}px">
        <view class="nav-back" bindtap="handleBack">
          <van-icon name="arrow-left" color="#fff" size="36rpx" />
          <text>返回</text>
        </view>
      </view>
      <text class="header-title">页面标题</text>
    </view>
  </view>
  ...
</view>
```

### 表单卡片

`form-card` 内使用 `.form-field` + `.field-label` + `.field-input` 布局，间距通过 flex gap 控制：

```scss
.form-card {
  margin: -40rpx 20rpx 0;
  padding: var(--padding-lg) var(--padding-lg) 28rpx;
  background: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
```

### 删除按钮

统一使用 `.del-btn` 样式（红色背景，白色文字）：

```scss
.del-btn {
  width: 100% !important;
  border-radius: var(--border-radius) !important;
  background: var(--color-expense) !important;
  border: none !important;
  color: var(--color-white) !important;
  font-size: var(--font-size) !important;
}
```

```xml
<van-button wx:if="{{ editing }}" custom-class="del-btn" block bindtap="onFormDelete">删除</van-button>
```

### 按钮区域

多按钮时（保存 + 删除），用 `btn-wrap` + flex column gap 布局：

```scss
.btn-wrap {
  padding: 0 20rpx;
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
```

## 图标回显逻辑

后端返回的 `categoryIcon` 可能是完整 URL（`http://` 开头）或相对路径（`/upload/` 开头）或 emoji。TS 中生成 `iconIsImage` 标记，WXML 用 `wx:if` 判断：

```ts
const isImg = !!(b.categoryIcon && (b.categoryIcon.indexOf(config.uploadPath) === 0 || b.categoryIcon.indexOf('http') === 0))
const bill: BillItem = {
  ...b,
  iconIsImage: isImg,
  categoryIcon: isImg && b.categoryIcon.indexOf(config.uploadPath) === 0 ? config.url + b.categoryIcon : b.categoryIcon
}
```

```xml
<image wx:if="{{ bill.iconIsImage }}" class="bill-icon-img" src="{{ bill.categoryIcon }}" mode="aspectFill"></image>
<text wx:else class="bill-icon">{{ bill.categoryIcon }}</text>
```

## 样式约定

### 核心原则

- 每个页面对应一个 `index.scss`：`pages/setting/index.wxml` → `pages/setting/index.scss`
- `app.scss` 定义全局 CSS 变量 + 全局工具类
- **禁止** `style="{{}}"` 内联样式，所有样式提取到 SCSS 文件

### CSS 变量（定义在 app.scss `page {}` 中）

| 类别   | 变量                        | 值示例                    |
| ------ | --------------------------- | ------------------------- |
| 主题   | `--theme` `--theme-gradient` `--theme-light` | `#1677ff` / 渐变 / `rgba(...)` |
| 颜色   | `--color` `--color-secondary` `--color-light` `--color-placeholder` | `#1d1d1d` `#666` `#999` `#ccc` |
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

统计卡片和筛选栏之间用 `.stats-group` 包裹统计卡片，`flex column + gap` 控制间距，外层统一负 margin 与头部重叠：

```xml
<view class="stats-group">
  <stats-card ... />
</view>
<filter-tabs ... />
```

```scss
.stats-group {
  margin: -20rpx var(--padding-lg) 0;
  display: flex; flex-direction: column; gap: var(--padding);
  position: relative; z-index: 10;
}
.stats-group .stats-card { margin: 0; border-radius: var(--border-radius); }
```

**注意**：`filter-tabs` 不要放在 `.stats-group` 内部，因为它是独立组件，组件隔离样式无法穿透。

### 页面底部间距

所有列表页（home、bill、category）统一加 `padding-bottom: 60rpx` 防止内容贴底。

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
