import config from '../config/index'
import request from '../utils/request'
import { wxUploadFile } from '../utils/wx'

export function userInfo() {
  return request<UserInfo>({
    url: '/user/info',
    method: 'GET',
    errorMsg: false
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

export function qrLoginConfirm(data: { sceneId: string; code: string }) {
  return request<LoginResult>({
    url: '/qr-login/confirm',
    method: 'POST',
    data
  })
}

export function qrBindConfirm(data: { sceneId: string; code: string }) {
  return request({
    url: '/wechat-bind/confirm',
    method: 'POST',
    data
  })
}

export function uploadAvatar(filePath: string) {
  return wxUploadFile({
    url: config.url + '/api/business/upload',
    filePath,
    name: 'file'
  })
}

export function sendEmailCode(email: string) {
  return request({
    url: '/send-email-code',
    method: 'POST',
    data: { email }
  })
}
