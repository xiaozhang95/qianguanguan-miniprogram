import config from '../config/index'
import { ResponseCode } from '../constants/index'
import { wxShowToast } from './wx'

async function create<T>(d: RequestInfo): Promise<CtmResponse<T>> {
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
            wxShowToast({ title: '服务器异常' })
          }
          reject({ code: response.statusCode, msg: '服务器异常', data: null as T })
        }
      },
      fail: (error) => {
        if (options.errorMsg) {
          wxShowToast({ title: '网络请求失败' })
        }
        reject({ code: 0, msg: error.errMsg, data: null as T })
      }
    })
  })
}

function tokenRefresh() {
  return create<LoginResult>({
    url: '/token/refresh',
    method: 'POST'
  })
}

let isRefreshing = false

export default function refreshRequest<T>(requestInfo: RequestInfo): Promise<CtmResponse<T>> {
  const { globalData, setRequestQueue, setToken } = getApp<IAppOption>()

  return new Promise((resolve, reject) => {
    create<T>(requestInfo)
      .then(resolve)
      .catch((err) => {
        if (err?.code !== ResponseCode.UNAUTHORIZED) {
          return reject(err)
        }

        setRequestQueue([...globalData.requestQueue, { resolve, reject, requestInfo }])

        if (!isRefreshing) {
          isRefreshing = true

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
              isRefreshing = false
            })
        }
      })
  })
}
