---
name: qianguanguan-miniprogram
description: Use when working on the qianguanguan-miniprogram (钱罐罐微信小程序). Runs pnpm lint (tsc --noEmit && eslint) to verify changes.
---

# qianguanguan-miniprogram

钱罐罐微信小程序，搭载记账功能的小程序端。

## 技术栈

- TypeScript + SCSS + WeChat Skyline 渲染引擎 + glass-easel 组件框架
- 包管理：**pnpm**
- 依赖：Vant Weapp ^1.11.7

## 验证命令

每次修改代码后**必须**运行：

```bash
pnpm lint
```

该命令等同于 `tsc --noEmit && eslint .`，会检查 TypeScript 类型错误和 ESLint 规则。

如果 PowerShell 执行策略限制无法直接运行 pnpm，使用：

```bash
cmd /c "pnpm lint"
```

## 项目结构

```
miniprogram/
├── api/          # 接口层 (user, bill)
├── config/       # 环境配置 (dev/trial/release)
├── utils/        # 工具 (wx.ts, request.ts)
├── pages/        # 页面
│   ├── setting/  # 个人中心
│   └── login/    # 登录页（已废弃，改用微信一键登录）
├── assets/       # 图片资源
├── app.ts        # 全局逻辑（token/用户状态/watch）
├── app.json      # 页面注册 + 窗口配置
└── app.scss      # 全局样式 + CSS 变量（主题色 --theme: #1677ff）
```

## 后端对接

API 基地址：`qianguanguan-java` Spring Boot 服务
- 开发环境：`http://localhost:8888/api/business`
- 认证方式：JWT Bearer token
- 登录流程：`wx.login()` → code → `GET /api/business/user/LoginByWid?code=xxx`
