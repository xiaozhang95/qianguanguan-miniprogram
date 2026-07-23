/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    token: string
    userInfo: UserInfo | null
    updateFn: Function[]
  }
}

interface Config {
  [key: string]: {
    baseUrl: string
    url: string
  }
}

interface UserInfo {
  id?: string
  username?: string
  name?: string
  role?: string
  phone?: string
  email?: string
  avatar?: string
  createtime?: string
}

interface LoginResult {
  token?: string
  userInfo?: UserInfo
}

interface CaptchaResult {
  captchaKey: string
  captchaImage: string
}

interface BillStatsData {
  totalIncome: number
  totalExpense: number
  balance: number
}

interface CtmResponse<T> {
  code: number
  data: T
  msg: string
}

interface RequestInfo {
  header?: Record<string, string>
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  timeout?: number
  data?: Record<string, unknown>
}
