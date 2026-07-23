import { getUserInfo, toLogin } from './api/user'
import { wxGetStorageSync, wxHideLoading, wxSetStorageSync, wxShowLoading, wxShowToast } from './utils/wx'

type AppCallback = (data: { token: string; userInfo: UserInfo | null }) => void

App({
  globalData: {
    updateFn: [] as AppCallback[],
    token: '',
    userInfo: null as UserInfo | null
  },
  watch(fn: AppCallback) {
    this.globalData.updateFn.push(fn)
  },
  update(key: string, value: unknown) {
    if (key === 'userInfo') {
      this.globalData.userInfo = value as UserInfo | null
    }
    if (key === 'token') {
      this.globalData.token = value as string
      wxSetStorageSync('token', value)
    }
    this.globalData.updateFn.forEach((fn) => {
      fn(this.globalData)
    })
  },
  isLogin(toast: boolean = true) {
    return new Promise<void>((resolve, reject) => {
      if (!this.globalData.token) {
        if (toast) wxShowToast({ title: '请先登录' })
        reject('未登录')
      } else {
        resolve()
      }
    })
  },
  login(code: string) {
    wxShowLoading({ title: '登录中...' })
    toLogin(code).then(({ data }) => {
      setTimeout(() => {
        wxHideLoading()
        const { token, userInfo } = data
        this.update('token', token)
        this.update('userInfo', userInfo)
      }, 1000)
    })
  },
  exitLogin(fn?: () => void) {
    this.update('token', '')
    this.update('userInfo', null)
    if (fn) fn()
  },
  onLaunch() {
    const token = wxGetStorageSync('token') || ''
    this.update('token', token)

    this.isLogin(false)
      .then(() => {
        getUserInfo()
          .then((res: CtmResponse<UserInfo>) => {
            this.update('userInfo', res.data)
          })
          .catch(() => {
            this.exitLogin()
          })
      })
      .catch(() => {})
  }
})
