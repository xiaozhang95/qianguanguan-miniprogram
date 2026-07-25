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

export function wxUploadFile(options: { url: string; filePath: string; name: string; header: Record<string, string> }) {
  return new Promise<WechatMiniprogram.UploadFileSuccessCallbackResult>((resolve, reject) => {
    const task = wx.uploadFile({
      ...options,
      success: resolve,
      fail: reject
    })
    return task
  })
}

export function wxGetMenuButtonBoundingClientRect() {
  return wx.getMenuButtonBoundingClientRect()
}
