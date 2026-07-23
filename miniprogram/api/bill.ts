import request from '../utils/request'

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
