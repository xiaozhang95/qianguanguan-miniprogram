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

export function wxNavigateTo(name: string) {
  return wx.navigateTo({ url: '/pages/' + name + '/index' })
}

export function wxSwitchTab(name: string) {
  return wx.switchTab({ url: '/pages/' + name + '/index' })
}

export function wxShowShareMenu() {
  return wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

export function wxReadFile(filePath: string, encoding = 'base64') {
  return new Promise<WechatMiniprogram.ReadFileSuccessCallbackResult>((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding,
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    } as WechatMiniprogram.ReadFileOption)
  })
}

export function wxNavigateBack() {
  return wx.navigateBack()
}

export function wxDownloadFile(url: string) {
  return new Promise<WechatMiniprogram.DownloadFileSuccessCallbackResult>((resolve, reject) => {
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res)
        } else {
          reject(new Error('download failed: ' + res.statusCode))
        }
      },
      fail: (err) => reject(err)
    })
  })
}
