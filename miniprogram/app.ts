import { loginByWid, type UserInfo } from './api/user'
import { ResponseCode } from './constants/index'
import type { IAppOption, RequestQueue } from './typings'
import { create } from './utils/request'
import { wxGetMenuButtonBoundingClientRect, wxHideLoading, wxLogin, wxShowLoading, wxShowModal } from './utils/wx'

App<IAppOption>({
  globalData: {
    watchers: [],
    refreshing: false,
    loginFailed: null,
    requestQueue: [],
    token: '',
    userInfo: null,
    offsetTop: 0,
    capsuleTop: 0,
    qrScene: ''
  },
  watch(fn: () => void) {
    this.globalData.watchers.push(fn)
  },
  update<K extends keyof IAppOption['globalData']>(key: K, value: IAppOption['globalData'][K]) {
    ;(this.globalData as Record<string, unknown>)[key] = value
    this.globalData.watchers.forEach(function (fn) {
      fn()
    })
  },
  setUserInfo(userInfo: UserInfo) {
    this.update('userInfo', userInfo)
  },
  setToken(token: string) {
    this.update('token', token)
  },
  setRefreshing(refreshing: boolean) {
    this.update('refreshing', refreshing)
  },
  setLoginFailed(loginFailed: boolean | null) {
    this.update('loginFailed', loginFailed)
  },
  setRequestQueue(requestQueue: RequestQueue[]) {
    this.update('requestQueue', requestQueue)
  },
  getMenuButtonBoundingClientRect() {
    const { top, height } = wxGetMenuButtonBoundingClientRect()
    this.globalData.offsetTop = top + height
    this.globalData.capsuleTop = top
  },
  login() {
    wxShowLoading({ title: '加载中...' })
    this.setRefreshing(true)
    wxLogin()
      .then(({ code }) => loginByWid(code))
      .then(({ data }) => {
        this.setLoginFailed(false)
        const { token, userInfo } = data
        this.setUserInfo(userInfo)
        this.setToken(token)

        this.globalData.requestQueue.forEach(({ resolve, reject, requestInfo }) => {
          create(requestInfo).then(resolve).catch(reject)
        })
        this.setRequestQueue([])
      })
      .catch(() => {
        this.setLoginFailed(true)
        this.globalData.requestQueue.forEach(({ reject }) => {
          reject({ code: ResponseCode.UNAUTHORIZED, msg: '', data: null })
        })
        this.setRequestQueue([])
      })
      .finally(() => {
        wxHideLoading()
        this.setRefreshing(false)
      })
  },

  updateManager() {
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wxShowModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？'
      }).then(({ confirm }) => {
        if (confirm) updateManager.applyUpdate()
      })
    })
  },
  onLaunch() {
    this.updateManager()
    this.getMenuButtonBoundingClientRect()
    this.login()
  },
  onShow(options: WechatMiniprogram.App.LaunchShowOption) {
    const scene = options.query && (options.query.scene as string)
    if (scene) {
      this.globalData.qrScene = scene
    }
  }
})
