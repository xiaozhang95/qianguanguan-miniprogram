import type { UserInfo } from './api/user'

export interface IAppOption {
  globalData: {
    refreshing: boolean
    requestQueue: RequestQueue[]
    token: string
    userInfo: UserInfo | null
    offsetTop: number
    capsuleTop: number
    _qrScene: string
  }
  setUserInfo: (userInfo: UserInfo) => void
  setToken: (token: string) => void
  setRefreshing: (refreshing: boolean) => void
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
