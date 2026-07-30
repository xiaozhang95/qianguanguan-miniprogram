import type { LoginResult } from '../api/user'
import config from '../config/index'
import { ResponseCode } from '../constants/index'
import type { CtmResponse, IAppOption, RequestInfo } from '../typings'
import { wxShowToast } from './wx'

export async function create<T>(d: RequestInfo): Promise<CtmResponse<T>> {
  const { globalData } = getApp<IAppOption>()

  const defaultOptions = {
    header: {
      Authorization: globalData.token
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
              wxShowToast({ title: json.msg })
            }
            reject(json)
          } else {
            resolve(json)
          }
        } else {
          if (options.errorMsg) {
            wxShowToast({ title: response.errMsg })
          }
          reject({ code: response.statusCode, msg: response.errMsg, data: null })
        }
      },
      fail: (error) => {
        if (options.errorMsg) {
          wxShowToast({ title: error.errMsg })
        }
        reject({ code: 0, msg: error.errMsg, data: null })
      }
    })
  })
}

function tokenRefresh() {
  return create<LoginResult>({
    url: '/token/refresh',
    method: 'POST',
    errorMsg: false
  })
}

export default function refreshRequest<T>(requestInfo: RequestInfo): Promise<CtmResponse<T>> {
  const { globalData, setRequestQueue, setToken, setRefreshing } = getApp<IAppOption>()

  return new Promise((resolve, reject) => {
    create<T>(requestInfo)
      .then(resolve)
      .catch((err) => {
        if (err?.code !== ResponseCode.UNAUTHORIZED) return reject(err)
        setRequestQueue([...globalData.requestQueue, { resolve, reject, requestInfo }])

        if (globalData.loginFailed) return reject(err)
        if (globalData.refreshing || !globalData.token) return
        setRefreshing(true)
        tokenRefresh()
          .then(({ data }) => {
            setToken(data.token)
            globalData.requestQueue.forEach(({ resolve, reject, requestInfo }) => {
              create(requestInfo).then(resolve).catch(reject)
            })

            setRequestQueue([])
          })
          .catch((error) => {
            globalData.requestQueue.forEach(({ reject }) => reject(error))
            setRequestQueue([])
          })
          .finally(() => {
            setRefreshing(false)
          })
      })
  })
}
