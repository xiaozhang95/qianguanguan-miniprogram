# 钱罐罐小程序开发规范

## 项目结构

```
miniprogram/
├── api/            # 接口层
├── assets/         # 静态资源（图标）
├── components/     # 共用组件
├── config/         # 环境配置、常量
├── constants/      # 枚举常量
├── pages/          # 页面
├── styles/         # 共享样式
├── utils/          # 工具函数
├── app.ts/json/scss
└── typings/        # 类型声明
```

## 枚举常量 (`constants/index.ts`)

```ts
BillType.INCOME / BillType.EXPENSE     // 账单类型
BillTypeLabel[INCOME] = '收入'         // 类型标签
Role.SUPER_ADMIN / ADMIN / USER        // 角色
RoleLabel[SUPER_ADMIN] = '管理员'      // 角色标签
Colors.expense / income / balance / theme / border / ...
```

**注意**: 可变的 `formType`/`filterType` 字段用 `BillType.EXPENSE as string` 初始化以保持 `string` 类型，避免 TS 字面量类型导致后续赋值报错。

## 共享样式 (`styles/common.scss`)

所有页面 SCSS 通过 `@import '../../styles/common';` 引入公共样式，再补充页面专属样式。

**CSS 变量**（定义在 `app.scss`）:
- 颜色: `var(--color-expense)` `var(--color-income)` `var(--color-balance)` `var(--color-border)` `var(--color-white)` `var(--theme-gradient)`
- 间距: `var(--padding)` `var(--margin)` `var(--gap)`
- 字号: `var(--font-size)` `var(--font-size-sm)` `var(--font-size-xs)`
- 阴影: `var(--shadow)` `var(--shadow-lg)`
- 圆角: `var(--border-radius)`

## 共用组件 (`components/`)

| 组件 | 用途 | Props |
|------|------|-------|
| `stats-card` | 收支结余统计 | expenseStr, incomeStr, balanceStr, balanceClass |
| `fixed-nav-bar` | 滚动固定导航 | title, app (需要页面 onPageScroll 转发) |
| `filter-tabs` | 支出/收入筛选 | tabs[{label,type}], activeIndex; bind:change |
| `fab-button` | 悬浮加号按钮 | bind:tap |
| `loading-block` | 加载状态 | loading, text |

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

## 工具函数 (`utils/`)

- `fmt(n)` - 金额格式化 `n.toFixed(2)`
- `pad(n)` - 补零 `String(n).padStart(2, '0')`

## 代码规范

**SCSS**: 页面 SCSS 只保留页面专属样式，公共样式统一在 `common.scss`。
**颜色**: 必须使用 CSS 变量，禁止硬编码 `#ef4444` / `#22c55e` 等。
**常量**: 强制使用 `BillType.INCOME` / `BillType.EXPENSE`，标签文本使用 `BillTypeLabel`。可变字段（`formType`/`filterType`）用 `as string` 加宽类型。
**组件**: 重复的 UI 模式优先提取为组件（4文件: json/ts/wxml/scss）。

## 弹窗规范

所有 `van-popup` 必须添加 `lock-scroll` 属性禁止背景滚动。
表单弹窗的 page 根元素添加 `catchtouchmove` 双重保护。

## 图片上传

使用 `wx.chooseImage` → `wx.uploadFile` 方式上传到 `/api/business/upload`，避免 base64 过大导致接口报错。

## Lint

运行 `npm run lint` 检查类型和代码规范。预设错误（API 类型签名不匹配）11 个已确认不影响运行。
