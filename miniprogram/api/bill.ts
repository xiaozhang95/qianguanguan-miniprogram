import request from '../utils/request'

export function billStats(year: string, month: string) {
  return request<BillStatsData>({
    url: '/bill/stats',
    method: 'POST',
    data: { year, month }
  })
}
