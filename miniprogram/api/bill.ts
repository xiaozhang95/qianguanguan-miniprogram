import request from '../utils/request'

export interface BillSaveParams {
  [key: string]: unknown
  categoryId: string
  type: string
  amount: number
  billDate: string
  remark?: string
}

export interface BillStatsData {
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface BillVO {
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

export interface BillPage {
  records: BillVO[]
  total: number
  size: number
  current: number
}

export interface BillListParams {
  [key: string]: unknown
  type?: string
  categoryId?: string
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

export function billStats(year: string, month: string, day?: string, type?: string, categoryId?: string) {
  return request<BillStatsData>({
    url: '/bill/stats',
    method: 'POST',
    data: { year, month, day, type, categoryId }
  })
}

export function billList(params: BillListParams) {
  return request<BillPage>({
    url: '/bill/list',
    method: 'POST',
    data: params
  })
}

export function billDetail(id: string) {
  return request<BillVO>({
    url: `/bill/detail/${id}`,
    method: 'GET'
  })
}

export function billSave(data: BillSaveParams) {
  return request<BillVO>({
    url: '/bill/save',
    method: 'POST',
    data
  })
}

export function billUpdate(id: string, data: BillSaveParams) {
  return request<BillVO>({
    url: `/bill/update/${id}`,
    method: 'PUT',
    data
  })
}

export function billDelete(id: string) {
  return request({
    url: `/bill/delete/${id}`,
    method: 'DELETE'
  })
}
