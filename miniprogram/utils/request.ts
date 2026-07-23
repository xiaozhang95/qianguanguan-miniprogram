import config from '../config/index'
import { wxShowToast } from './wx'

export default async function request<T>(d: RequestInfo) {
  const { globalData, exitLogin } = getApp()
  const { token } = globalData

  const defaultOptions = {
    header: {
      Authorization: token
    },
    timeout: 10000
  }

  const options = Object.assign(defaultOptions, d)
  options.url = config.url + config.baseUrl + options.url
  options.header = Object.assign(defaultOptions.header, options.header)

  return new Promise<CtmResponse<T>>((resolve, reject) => {
    wx.request({
      ...options,
      success: (response) => {
        if (response.statusCode === 200) {
          const json = response.data as CtmResponse<T>

          if (json.code !== 200) {
            wxShowToast({ title: json.msg || '请求失败' })

            if (json.code === 401) {
              exitLogin(() => {
                wxShowToast({ title: '登录已过期，请重新登录' })
              })
            }
            reject(json)
          } else {
            resolve(json)
          }
        } else {
          wxShowToast({ title: '服务器异常' })
          reject({ code: response.statusCode, msg: '服务器异常', data: null as T })
        }
      },
      fail: (error) => {
        wxShowToast({ title: '网络请求失败' })
        reject({ code: 0, msg: error.errMsg, data: null as T })
      }
    })
  })
}
