/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    requestQueue: RequestQueue[]
    token: string
    userInfo: UserInfo | null
    offsetTop: number
    capsuleTop: number
    _qrScene: string
  }
  setUserInfo: (userInfo: UserInfo) => void
  setToken: (token: string) => void
  setRequestQueue: (requestQueue: RequestQueue[]) => void
}

interface Config {
  [key: string]: {
    baseUrl: string
    url: string
    uploadPath: string
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
  token: string
  userInfo: UserInfo
}

interface Category {
  id: string
  name: string
  icon: string
  type: string
  userId: string | null
  sort: number
  createtime: string
}

interface CategorySaveParams {
  [key: string]: unknown
  name: string
  icon: string
  type: string
  sort: number
}

interface BillSaveParams {
  [key: string]: unknown
  categoryId: string
  type: string
  amount: number
  billDate: string
  remark?: string
}

interface BillStatsData {
  totalIncome: number
  totalExpense: number
  balance: number
}

interface BillVO {
  id: string
  userId: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  type: string
  amount: number
  billDate: string
  remark: string
  createtime: string
}

interface BillPage {
  records: BillVO[]
  total: number
  size: number
  current: number
}

interface BillListParams {
  [key: string]: unknown
  type?: string
  categoryId?: string
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
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
  errorMsg?: boolean
}

interface RequestQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (value: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void
  requestInfo: RequestInfo
}
