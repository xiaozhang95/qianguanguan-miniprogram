import request from '../utils/request'

export function userInfo() {
  return request<UserInfo>({
    url: '/user/info',
    method: 'GET'
  })
}

export function loginByWid(code: string) {
  return request<LoginResult>({
    url: '/user/LoginByWid?code=' + code,
    method: 'GET'
  })
}

export function userProfile(data: Record<string, unknown>) {
  return request<UserInfo>({
    url: '/user/profile',
    method: 'PUT',
    data
  })
}
