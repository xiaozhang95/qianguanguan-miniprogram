import config from '../config/index'
import request, { create } from '../utils/request'
import { wxUploadFile } from '../utils/wx'

export interface UserInfo {
  id?: string
  username?: string
  name?: string
  role?: string
  phone?: string
  email?: string
  avatar?: string
  createtime?: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

export function userInfo() {
  return request<UserInfo>({
    url: '/user/info',
    method: 'GET',
    errorMsg: false
  })
}

export function loginByWid(code: string) {
  return create<LoginResult>({
    url: '/user/LoginByWid?code=' + code,
    method: 'GET',
    errorMsg: false
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
