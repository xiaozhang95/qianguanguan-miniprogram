---
name: qianguanguan-miniprogram
description: Use when writing or modifying code in qianguanguan-miniprogram/. Covers WeChat Mini Program, TypeScript, SCSS, Vant Weapp, Skyline/glass-easel, and project conventions.
---

# 钱罐罐账本 小程序开发规范

## 技术栈

- **框架**: WeChat Mini Program 原生 + TypeScript + SCSS
- **渲染引擎**: Skyline + glass-easel 组件框架
- **UI 库**: Vant Weapp（`@vant/weapp`）
- **HTTP**: 自定义 `wx.request` 封装 (`utils/request`)
- **后端**: qianguanguan-java Spring Boot（`/api/business`）
- **包管理**: pnpm
- **基础库**: 2.32.3

## 项目目录

| 路径                      | 职责                                      |
| ------------------------- | ----------------------------------------- |
| `miniprogram/api/`        | API 接口层                                |
| `miniprogram/pages/`      | 页面                                      |
| `miniprogram/config/`     | 环境配置                                  |
| `miniprogram/utils/`      | 工具函数（wx 封装、request 封装、格式化） |
| `miniprogram/assets/`     | 图片等静态资源                            |
| `miniprogram/styles/`     | 全局共享样式                              |
| `miniprogram/components/` | 共用组件                                  |
| `typings/`                | TypeScript 类型定义                       |

```
miniprogram/
├── api/          # 接口层
├── assets/       # 静态资源（图标）
├── components/   # 共用组件
├── config/       # 环境配置、常量
├── constants/    # 枚举常量
├── pages/        # 页面
├── styles/       # 共享样式
├── utils/        # 工具函数
├── app.ts/json/scss
└── typings/      # 类型声明
```

## 代码质量

- **禁止** `eslint-disable` 注释
- 每次代码修改后运行 `pnpm lint`（`tsc --noEmit && eslint .`），确保零错误（预设错误 API 类型签名不匹配 11 个已确认不影响运行）
- 如果 PowerShell 执行策略限制 `pnpm`，使用 `cmd /c "pnpm lint"`
- **禁止**可选链 `?.` 和空值合并 `??`，用 `if (x) x()` 替代
- **禁止** `Function` 类型，用具体回调类型替代
- **禁止** `any` 类型，`app` 字段用 `null as { offsetTop: number; capsuleTop: number } | null`
- **禁止** `var`，使用 `const` 或 `let`
- 页面 JSON 只能注册真正在 WXML 中使用的组件，禁止冗余注册

## 微信小程序特有约束

- **`wx` API 必须通过 `utils/wx.ts` 封装调用**，禁止页面/组件内直接调 `wx.xxx`（config/index.ts 中模块级调用的 `wx.getAccountInfoSync()` 除外）
- 页面 JSON 使用 `"navigationStyle": "custom"` 自定义导航栏
- Vant 组件注册：`"usingComponents": { "van-xxx": "@vant/weapp/xxx/index" }`
- Skyline 属性：`"rendererOptions": { "skyline": { "defaultDisplayBlock": true, "defaultContentBox": true } }`
- 模块导入必须带 `/index` 后缀（如 `'../../constants/index'`）

## `utils/wx.ts` 封装方法

| 方法                                              | 用途                          |
| ------------------------------------------------- | ----------------------------- |
| `wxLogin()`                                       | `wx.login()` → Promise        |
| `wxShowLoading({ title, mask? })`                 | 显示 loading                  |
| `wxHideLoading()`                                 | 隐藏 loading                  |
| `wxShowToast({ title, icon?, duration?, mask? })` | 显示 toast → Promise          |
| `wxSetStorageSync(key, value)`                    | 同步写 storage                |
| `wxGetStorageSync(key)`                           | 同步读 storage                |
| `wxNavigateTo(name, query?)`                      | 跳转页面 `pages/{name}/index` |
| `debounceNavigateTo(name, query?, threshold?)`    | 防抖跳转（默认 500ms）        |
| `wxNavigateBack()`                                | 返回上一页                    |
| `wxSwitchTab(name)`                               | 切换 tabBar 页面              |
| `wxShowShareMenu()`                               | 显示分享按钮                  |
| `wxReadFile(filePath)`                            | `readFile` base64 → Promise   |
| `wxGetSystemInfoSync()`                           | `getSystemInfoSync()`         |
| `wxShowModal({ title, content })`                 | `showModal()` → Promise       |
| `wxChooseImage(options)`                          | `chooseImage()` → Promise     |
| `wxUploadFile(options)`                           | `uploadFile()` → Promise      |
| `wxGetMenuButtonBoundingClientRect()`             | 获取胶囊按钮位置              |

**注意**: `wx.reLaunch` 等未封装的方法如需使用，先添加到 `utils/wx.ts` 封装。

## 工具函数（`utils/format.ts`）

| 函数     | 用途                              |
| -------- | --------------------------------- |
| `fmt(n)` | 金额格式化 `n.toFixed(2)`         |
| `pad(n)` | 补零 `String(n).padStart(2, '0')` |

## 枚举常量（`constants/index.ts`）

| 常量                         | 值                                                             | 用途       |
| ---------------------------- | -------------------------------------------------------------- | ---------- |
| `BillType.INCOME`            | `'INCOME'`                                                     | 收入       |
| `BillType.EXPENSE`           | `'EXPENSE'`                                                    | 支出       |
| `BillTypeLabel`              | `{ INCOME: '收入', EXPENSE: '支出' }`                          | 类型标签   |
| `Role.SUPER_ADMIN`           | `'SUPER_ADMIN'`                                                | 超级管理员 |
| `Role.ADMIN`                 | `'ADMIN'`                                                      | 管理员     |
| `Role.USER`                  | `'USER'`                                                       | 普通用户   |
| `RoleLabel`                  | `{ SUPER_ADMIN: '管理员', ADMIN: '管理员', USER: '普通用户' }` | 角色标签   |
| `Colors.theme`               | `'#1677ff'`                                                    | 主题色     |
| `Colors.expense`             | `'#ef4444'`                                                    | 支出色     |
| `Colors.income`              | `'#22c55e'`                                                    | 收入色     |
| `Colors.balance`             | `'#1677ff'`                                                    | 结余色     |
| `Colors.border`              | `'#f0f0f0'`                                                    | 边框色     |
| `Colors.text`                | `'#1d1d1d'`                                                    | 主文字色   |
| `Colors.textSecondary`       | `'#666666'`                                                    | 次要文字色 |
| `Colors.textLight`           | `'#999999'`                                                    | 浅色文字   |
| `ResponseCode.SUCCESS`       | `200`                                                          | 响应成功   |
| `ResponseCode.UNAUTHORIZED`  | `401`                                                          | 登录过期   |
| `ResponseCode.NETWORK_ERROR` | `0`                                                            | 网络失败   |

- **强制使用** 枚举常量，禁止代码中硬编码 `'INCOME'`、`'EXPENSE'`、`200`、`401` 等
- 可变的 `formType`/`filterType` 用 `BillType.EXPENSE as string` 加宽类型
- WXML 中用 `BillType` 需在 data 中传入：`data: { BillType, ... }`
- WXML 中用 `RoleLabel` 同理需传入 data；角色判断用 `Role.xxx` 常量而非硬编码字符串

## 配置常量（`config/index.ts`）

```ts
const config: Config = {
  develop: { url: 'https://www.qianguanguan.top', baseUrl: '/api/business', uploadPath: '/upload/' },
  trial: { url: 'https://www.qianguanguan.top', baseUrl: '/api/business', uploadPath: '/upload/' },
  release: { url: 'https://www.qianguanguan.top', baseUrl: '/api/business', uploadPath: '/upload/' }
}
```

- `uploadPath` 用来判断图标是否为上传文件，**禁止硬编码 `'/upload/'`**
- 图标 URL 判断示例：

```ts
const isImg = !!(c.icon && (c.icon.indexOf(config.uploadPath) === 0 || c.icon.indexOf('http') === 0))
const icon = isImg && c.icon.indexOf(config.uploadPath) === 0 ? config.url + c.icon : c.icon
```

## 图标回显逻辑

后端返回的图标可能是完整 URL、相对路径或 emoji。统一用 `iconIsImage` 标记判断：

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

## 弹窗规范

- 所有 `van-popup` 必须添加 `lock-scroll` 属性禁止背景滚动
- 表单弹窗的 page 根元素添加 `catchtouchmove` 双重保护
- **禁止用弹窗（van-popup）做表单**（Skyline + HarmonyOS 键盘兼容问题）

## 图片上传

使用 `wx.chooseImage` → `wx.uploadFile` 方式上传到 `/api/business/upload`，**避免 base64 过大导致接口报错**。

## 表单页面规范

表单独立页面 + `navigateTo` 跳转。

### 页面结构

```
pages/
├── home/index              # 首页：月度统计仪表盘（收支图、饼图）
├── bill/index              # 账单列表（FAB → bill-form）
├── bill-form/index         # 记一笔/编辑账单
├── category/index          # 分类列表（FAB → category-form）
├── category-form/index     # 新增/编辑分类
├── user/index              # 用户资料编辑
├── setting/index           # 我的/设置（tabBar 页）
├── qr-login/index          # 扫码登录确认
├── qr-bind/index           # 扫码绑定微信确认
└── agreement/index         # 用户协议 & 隐私政策
```

### 表单页面头部模板

使用 `common.scss` 中已定义的 BEM 修饰类：

```xml
<view class="page">
  <view class="header">
    <view class="header-bg">
      <view class="header-circle c1"></view>
      <view class="header-circle c2"></view>
    </view>
    <view class="header-content header-content--form">
      <view class="nav-bar nav-bar--form" style="height:{{ app.offsetTop }}px">
        <view class="nav-back" bindtap="handleBack">
          <van-icon name="arrow-left" color="#fff" size="36rpx" />
          <text>返回</text>
        </view>
      </view>
      <text class="header-title">页面标题</text>
    </view>
  </view>
  <view class="form-card">
    <!-- 表单字段使用 .form-field + .field-label -->
  </view>
  <view class="btn-wrap">
    <van-button custom-class="save-btn" block loading="{{ saving }}" bindtap="onFormSubmit">保存</van-button>
    <van-button wx:if="{{ editing }}" custom-class="del-btn" block bindtap="onFormDelete">删除</van-button>
  </view>
</view>
```

### 共用 SCSS 类

`common.scss` 已包含以下共用样式，页面无需重复定义：

| 类                         | 用途                                                  |
| -------------------------- | ----------------------------------------------------- |
| `.page`                    | `padding-bottom: 60rpx; background: var(--bg)`        |
| `.header-content--form`    | 左对齐 + 60rpx 底部间距                               |
| `.nav-bar--form`           | `justify-content: flex-start; padding: 0 24rpx 12rpx` |
| `.nav-back`                | 返回按钮样式                                          |
| `.header-title`            | 页面标题 42rpx 白色加粗                               |
| `.form-card`               | 表单卡片（重叠 header、圆角、阴影、flex column gap）  |
| `.form-field`              | 表单行（flex + border-bottom）                        |
| `.field-label`             | `width: 120rpx`                                       |
| `.field-input`             | `flex: 1`                                             |
| `.btn-wrap`                | 按钮区（flex column + gap 20rpx）                     |
| `.save-btn`                | 保存按钮（蓝紫渐变）                                  |
| `.del-btn`                 | 删除按钮（红底白字）                                  |
| `.form-type` / `.type-tab` | 支出/收入切换标签                                     |
| `.card` / `.card-title`    | 通用卡片容器                                          |

## 导航跳转

所有 `navigateTo` 必须使用 `debounceNavigateTo`：

```ts
import { debounceNavigateTo, wxNavigateBack, wxSwitchTab } from '../../utils/wx'

// 跳转（500ms 防抖）
debounceNavigateTo('bill-form', 'date=' + this.data.filterDate)

// 需要登录检查
isLogin(true)
  .then(() => {
    debounceNavigateTo('bill-form', 'date=' + this.data.filterDate)
  })
  .catch(() => {
    wxSwitchTab('setting')
  })
```

## 样式约定

### CSS 变量（定义在 `app.scss`）

| 变量                                                                                  | 值示例                                         |
| ------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `--header-height`                                                                     | `420rpx`                                       |
| `--theme` `--theme-gradient` `--theme-light`                                          | `#1677ff` / 渐变 / `rgba(...)`                 |
| `--color` `--color-secondary` `--color-light` `--color-placeholder`                   | `#1d1d1d` `#666` `#999` `#ccc`                 |
| `--color-expense` `--color-income` `--color-balance` `--color-white` `--color-border` | `#ef4444` `#22c55e` `#1677ff` `#fff` `#f0f0f0` |
| `--bg` `--card-bg`                                                                    | `#f5f5f5` `#fff`                               |
| `--font-size-xs` `--font-size-sm` `--font-size` `--font-size-lg` `--font-size-xl`     | 22/26/30/36/48rpx                              |
| `--padding-sm` `--padding` `--padding-lg`                                             | 16/24/32rpx                                    |
| `--margin-sm` `--margin` `--margin-lg`                                                | 12/20/32rpx                                    |
| `--gap-sm` `--gap` `--gap-lg`                                                         | 12/20/32rpx                                    |
| `--border-radius`                                                                     | 12rpx                                          |
| `--shadow-sm` `--shadow` `--shadow-lg`                                                | 各级阴影                                       |
| `--popup-round-border-radius`                                                         | 12rpx（Vant popup 圆角）                       |

### 圆角规范

- **全局统一使用 `var(--border-radius)`（12rpx）**，禁止硬编码 `8rpx`、`16rpx`、`20rpx`、`24rpx` 等
- 例外：圆形元素（头像、FAB 等）`border-radius: 50%`；图表条/装饰点 `4rpx`
- Vant 组件通过 CSS 变量统一：`--cell-group-inset-border-radius: var(--border-radius)`

### SCSS 禁止硬编码

```scss
// 正确
font-size: var(--font-size);
padding: var(--padding);
color: var(--color);
border-radius: var(--border-radius);
color: var(--color-placeholder);

// 错误
font-size: 30rpx;
padding: 24rpx;
color: #1d1d1d;
border-radius: 16rpx;
border: 2rpx dashed #ccc;
```

## 共用组件（`components/`）

| 组件            | 用途           | Props                                                       |
| --------------- | -------------- | ----------------------------------------------------------- |
| `stats-card`    | 统计卡片       | expenseStr, incomeStr, balanceStr, balanceClass             |
| `fixed-nav-bar` | 滚动固定导航栏 | title, app（需 onPageScroll 转发）                          |
| `filter-tabs`   | 支出/收入筛选  | tabs[{label,type}], activeIndex; bind:change→e.detail.index |
| `fab-button`    | 悬浮加号按钮   | bind:tap                                                    |
| `loading-block` | 加载状态       | loading, text                                               |

**使用示例**:

```json
// page.json
{
  "usingComponents": {
    "stats-card": "/components/stats-card/stats-card",
    "fixed-nav-bar": "/components/fixed-nav-bar/fixed-nav-bar"
  }
}
```

```xml
<!-- page.wxml -->
<fixed-nav-bar id="fixed-nav" title="页面标题" app="{{ app }}" />
<stats-card expense-str="{{ expenseStr }}" income-str="{{ incomeStr }}" balance-str="{{ balanceStr }}" balance-class="{{ balanceClass }}" />
```

**fixed-nav-bar 需要页面转发 onPageScroll**:

```ts
onPageScroll(e: { scrollTop: number }) {
  const comp = this.selectComponent('#fixed-nav')
  if (comp) comp.onPageScroll(e)
}
```

## API 调用规范

- 所有请求走 `utils/request.ts`，自动带 JWT、401 拦截、错误提示
- `api/*.ts` 导出函数，返回 `Promise<CtmResponse<T>>`
- 函数命名 = URL 路径转驼峰：`/user/info` → `userInfo()`, `/bill/stats` → `billStats()`
- 外部上传（如分类图标）用 `wxUploadFile` 直接上传到 `config.url + config.baseUrl + '/upload'`

## 全局状态（`app.ts`）

| 方法                 | 用途                                 |
| -------------------- | ------------------------------------ |
| `watch(fn)`          | 注册全局状态回调                     |
| `update(key, value)` | 更新状态并通知 watcher               |
| `isLogin(toast?)`    | Promise，未登录 reject，可选 toast   |
| `login(code)`        | `wx.login` → `LoginByWid` → 存 token |
| `exitLogin(fn?)`     | 清空 token/userInfo                  |

## 收入/支出展示顺序

**支出在前、收入在后**（与 web 端一致）：统计卡片 支出→收入→结余
