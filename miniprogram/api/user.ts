import request from '../utils/request'

export function getUserInfo() {
  return request<UserInfo>({
    url: '/user/info',
    method: 'GET'
  })
}

export function toLogin(code: string) {
  return request<LoginResult>({
    url: '/user/LoginByWid?code=' + code,
    method: 'GET'
  })
}
