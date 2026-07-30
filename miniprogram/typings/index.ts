import type { UserInfo } from '../api/user'

export interface IAppOption {
  globalData: {
    watchers: Array<() => void>
    refreshing: boolean
    loginFailed: boolean | null
    requestQueue: RequestQueue[]
    token: string
    userInfo: UserInfo | null
    offsetTop: number
    capsuleTop: number
    qrScene: string
  }
  watch: (fn: () => void) => void
  update: <K extends keyof IAppOption['globalData']>(key: K, value: IAppOption['globalData'][K]) => void
  setUserInfo: (userInfo: UserInfo) => void
  setToken: (token: string) => void
  setRefreshing: (refreshing: boolean) => void
  setLoginFailed: (loginFailed: boolean | null) => void
  setRequestQueue: (requestQueue: RequestQueue[]) => void
  updateManager: () => void
  getMenuButtonBoundingClientRect: () => void
  login: () => void
}

export interface CtmResponse<T> {
  code: number
  data: T
  msg: string
}

export interface RequestInfo {
  header?: Record<string, string>
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  timeout?: number
  data?: Record<string, unknown>
  errorMsg?: boolean
}

export interface RequestQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void
  requestInfo: RequestInfo
}
