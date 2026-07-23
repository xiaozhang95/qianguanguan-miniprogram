import request from '../utils/request'

export function categoryList(type?: string) {
  const data: Record<string, string> = {}
  if (type) data.type = type
  return request<Category[]>({
    url: '/category/list',
    method: 'POST',
    data
  })
}
