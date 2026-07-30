# 登录与鉴权流程

## 启动流程

```
onLaunch
├── Storage 有 token → setToken(恢复内存) → return
└── Storage 无 token → login()
```

## login()

调用链：`wxLogin()` → `loginByWid(code)` → 拿到 token + userInfo → 持久化 → 重放请求队列

```
login()
  → wxLogin()                          // 获取微信 code
  → loginByWid(code)                   // /user/LoginByWid?code=xxx（走 create，不经 refreshRequest）
  → 成功
      setUserInfo(userInfo)
      setToken(token)                  // 内存 + wxSetStorageSync 持久化
      setLoginFailed(false)
      重放 requestQueue 中的请求
  → 失败
      setLoginFailed(true)
      requestQueue 全部 reject
  → finally
      setRefreshing(false)
```

**注意**：`loginByWid` 使用 `create()` 而非 `refreshRequest()`，因为登录接口自身返回 token，无需鉴权，且避免 login 期间 `refreshing=true` 导致的死锁。

## Token 刷新

所有业务请求通过 `refreshRequest()`（`utils/request.ts` 默认导出），401 自动触发刷新：

```
业务请求 → 401
  → 请求入队 requestQueue
  → refreshing=true 时 return（等待中的 refresh/login 会处理队列）
  → refreshing=false 时
      tokenRefresh()                  // /token/refresh（走 create）
      → 成功
          setToken(新 token)          // 内存 + 持久化
          重放 requestQueue
      → 失败
          setUserInfo(null)           // 清空用户信息
          requestQueue 全部 reject
      → finally
          setRefreshing(false)
```

## 并发保护

`refreshing` 标志位被 `login()` 和 `tokenRefresh()` 共用：

- **login 期间请求 401** → 入队 → 等 login 完成后批量重试
- **refresh 期间触发 login** → refresh 自然结束，login 接管队列
- 两者几乎不会同时发生，共享同一个 `requestQueue` 保证请求不丢失

## 请求入口区别

| 函数 | 401 处理 | 使用场景 |
|------|----------|----------|
| `refreshRequest<T>()`（默认导出） | 自动刷新 token + 重试 | 所有业务 API |
| `create<T>()` | 不做 401 处理 | `tokenRefresh()`、`loginByWid()`、队列重放 |

## Token 持久化

- `setToken(token)` → `wx.setStorageSync('token', token)`
- `onLaunch` → `wx.getStorageSync('token')` → 恢复
- 持久化入口：`login()` 成功、`tokenRefresh()` 成功、`qr-login` 扫码登录成功
