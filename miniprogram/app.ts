import { loginByWid, type UserInfo } from './api/user'
import { ResponseCode } from './constants/index'
import type { IAppOption, RequestQueue } from './typings'
import { create } from './utils/request'
import { wxGetMenuButtonBoundingClientRect, wxGetStorageSync, wxHideLoading, wxLogin, wxSetStorageSync, wxShowLoading, wxShowModal } from './utils/wx'

App<IAppOption>({
  globalData: {
    refreshing: false,
    loginFailed: null,
    requestQueue: [],
    token: '',
    userInfo: null,
    offsetTop: 0,
    capsuleTop: 0,
    qrScene: ''
  },
  setUserInfo(userInfo: UserInfo | null) {
    this.globalData.userInfo = userInfo
  },
  setToken(token: string) {
    this.globalData.token = token
    wxSetStorageSync('token', token)
  },
  setRefreshing(refreshing: boolean) {
    this.globalData.refreshing = refreshing
  },
  setLoginFailed(loginFailed: boolean | null) {
    this.globalData.loginFailed = loginFailed
  },
  setRequestQueue(requestQueue: RequestQueue[]) {
    this.globalData.requestQueue = requestQueue
  },
  getMenuButtonBoundingClientRect() {
    const { top, height } = wxGetMenuButtonBoundingClientRect()
    this.globalData.offsetTop = top + height
    this.globalData.capsuleTop = top
  },
  async login() {
    wxShowLoading({ title: '加载中...' })
    this.setRefreshing(true)
    return wxLogin()
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

        return userInfo
      })
      .catch(() => {
        this.setLoginFailed(true)
        this.globalData.requestQueue.forEach(({ reject }) => {
          reject({ code: ResponseCode.UNAUTHORIZED, msg: '', data: null })
        })
        this.setRequestQueue([])
        return null
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
    const savedToken = wxGetStorageSync('token')
    if (savedToken) {
      this.setToken(savedToken)
      return
    }
    this.login()
  },
  onShow(options: WechatMiniprogram.App.LaunchShowOption) {
    const scene = options.query && (options.query.scene as string)
    if (scene) {
      this.globalData.qrScene = scene
    }
  }
})
