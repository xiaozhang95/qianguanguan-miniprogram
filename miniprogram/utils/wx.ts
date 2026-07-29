import { ResponseCode } from '../constants/index'

export async function wxLogin() {
  return new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    })
  })
}

export function wxShowLoading({ title = '', mask = true }) {
  return wx.showLoading({ title, mask })
}

export function wxHideLoading() {
  return wx.hideLoading()
}

export function wxShowToast({ title = '', icon = 'none' as const, duration = 2000, mask = false }) {
  return new Promise<void>((resolve) => {
    wx.showToast({ title, icon, duration, mask, success: () => resolve() })
  })
}

export function wxSetStorageSync(key: string, value: unknown) {
  return wx.setStorageSync(key, value)
}

export function wxGetStorageSync(key: string) {
  return wx.getStorageSync(key)
}

export function wxNavigateTo(name: string, query?: string) {
  let url = '/pages/' + name + '/index'
  if (query) {
    url += '?' + query
  }
  return wx.navigateTo({ url })
}

let lastNavTime = 0

export function debounceNavigateTo(name: string, query?: string, threshold?: number) {
  const now = Date.now()
  if (now - lastNavTime < (threshold || 500)) return
  lastNavTime = now
  return wxNavigateTo(name, query)
}

export function wxShowShareMenu() {
  return wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

export function wxNavigateBack() {
  return wx.navigateBack()
}

export function wxSwitchTab(name: string) {
  return wx.switchTab({ url: '/pages/' + name + '/index' })
}

export function wxReLaunch(url: string) {
  return wx.reLaunch({ url })
}

export function wxReadFile(filePath: string) {
  return new Promise<{ data: string }>((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (res) => resolve({ data: res.data as string }),
      fail: reject
    })
  })
}

export function wxGetSystemInfoSync() {
  return wx.getSystemInfoSync()
}

export function wxShowModal({ title = '', content = '' }) {
  return new Promise<WechatMiniprogram.ShowModalSuccessCallbackResult>((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: resolve,
      fail: reject
    })
  })
}

export function wxChooseImage(options: { count: number; sizeType: ('original' | 'compressed')[]; sourceType: ('album' | 'camera')[] }) {
  return new Promise<WechatMiniprogram.ChooseImageSuccessCallbackResult>((resolve, reject) => {
    wx.chooseImage({
      ...options,
      success: resolve,
      fail: reject
    })
  })
}

export function wxUploadFile(options: { url: string; filePath: string; name: string }) {
  return new Promise<CtmResponse<{ url: string }>>((resolve, reject) => {
    const task = wx.uploadFile({
      ...options,
      success: (res) => {
        if (res.statusCode === ResponseCode.SUCCESS) {
          const json = JSON.parse(res.data) as CtmResponse<{ url: string }>
          if (json.code === ResponseCode.SUCCESS) {
            resolve(json)
          } else {
            wxShowToast({ title: json.msg || '上传失败!!!' })
            reject(json)
          }
        } else {
          wxShowToast({ title: '上传失败!!!' })
          reject({ code: res.statusCode, msg: '上传失败!!!', data: null as never })
        }
      },
      fail: (err) => {
        wxShowToast({ title: '上传失败!!!' })
        reject({ code: ResponseCode.NETWORK_ERROR, msg: err.errMsg, data: null as never })
      }
    })
    return task
  })
}

export function wxSetClipboardData({ data = '' }) {
  return new Promise<void>((resolve, reject) => {
    wx.setClipboardData({ data, success: () => resolve(), fail: (err) => reject(err) })
  })
}

export function wxGetMenuButtonBoundingClientRect() {
  return wx.getMenuButtonBoundingClientRect()
}
