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
