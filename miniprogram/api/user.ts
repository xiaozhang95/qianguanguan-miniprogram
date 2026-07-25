import config from '../config/index'
import request from '../utils/request'
import { wxUploadFile } from '../utils/wx'

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

export function uploadAvatar(filePath: string) {
  const { globalData } = getApp<{ globalData: { token: string } }>()
  return wxUploadFile({
    url: config.url + '/api/business/upload',
    filePath,
    name: 'file',
    header: {
      Authorization: globalData.token
    }
  })
}
