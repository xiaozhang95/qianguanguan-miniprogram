import config from '../config/index'
import { ResponseCode } from '../constants/index'
import { wxShowToast } from './wx'

export default async function request<T>(d: RequestInfo) {
  const { globalData, exitLogin } = getApp()
  const { token } = globalData

  const defaultOptions = {
    header: {
      Authorization: token
    },
    timeout: 10000,
    errorMsg: true
  }

  const options = Object.assign(defaultOptions, d)
  options.url = config.url + config.baseUrl + options.url
  options.header = Object.assign(defaultOptions.header, options.header)

  return new Promise<CtmResponse<T>>((resolve, reject) => {
    wx.request({
      ...options,
      success: (response) => {
        if (response.statusCode === ResponseCode.SUCCESS) {
          const json = response.data as CtmResponse<T>

          if (json.code !== ResponseCode.SUCCESS) {
            if (options.errorMsg && json.code !== ResponseCode.UNAUTHORIZED) {
              wxShowToast({ title: json.msg || '请求失败' })
            }

            if (json.code === ResponseCode.UNAUTHORIZED) {
              exitLogin()
            }
            reject(json)
          } else {
            resolve(json)
          }
        } else {
          if (options.errorMsg) {
            wxShowToast({ title: '服务器异常' })
          }
          reject({ code: response.statusCode, msg: '服务器异常', data: null as T })
        }
      },
      fail: (error) => {
        if (options.errorMsg) {
          wxShowToast({ title: '网络请求失败' })
        }
        reject({ code: ResponseCode.NETWORK_ERROR, msg: error.errMsg, data: null as T })
      }
    })
  })
}
