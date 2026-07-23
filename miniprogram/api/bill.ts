import request from '../utils/request'

export function getBillStats(year: string, month: string) {
  return request<BillStatsData>({
    url: '/bill/stats',
    method: 'POST',
    data: { year, month }
  })
}
