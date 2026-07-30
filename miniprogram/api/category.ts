import request from '../utils/request'

export interface Category {
  id: string
  name: string
  icon: string
  iconIsImage?: boolean
  type: string
  userId: string | null
  sort: number
  createtime: string
}

export interface CategorySaveParams {
  [key: string]: unknown
  name: string
  icon: string
  type: string
  sort: number
}

export function categoryList(type?: string) {
  const data: Record<string, string> = {}
  if (type) data.type = type
  return request<Category[]>({
    url: '/category/list',
    method: 'POST',
    data
  })
}

export function categorySave(data: CategorySaveParams) {
  return request<Category>({
    url: '/category/save',
    method: 'POST',
    data
  })
}

export function categoryUpdate(id: string, data: CategorySaveParams) {
  return request<Category>({
    url: `/category/update/${id}`,
    method: 'PUT',
    data
  })
}

export function categoryDelete(id: string) {
  return request({
    url: `/category/delete/${id}`,
    method: 'DELETE'
  })
}
