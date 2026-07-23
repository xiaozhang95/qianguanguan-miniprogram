/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    token: string
    userInfo: UserInfo | null
    updateFn: Function[]
    offsetTop: number
    capsuleTop: number
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
  name: string
  icon: string
  type: string
  sort: number
}

interface BillSaveParams {
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
}
