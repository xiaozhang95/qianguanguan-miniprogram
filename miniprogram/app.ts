import { loginByWid, type UserInfo } from './api/user'
import { ResponseCode } from './constants/index'
import type { IAppOption, RequestQueue } from './pages/typings'
import { create } from './utils/request'
import { wxGetMenuButtonBoundingClientRect, wxLogin, wxShowModal } from './utils/wx'

App<IAppOption>({
  globalData: {
    refreshing: false,
    requestQueue: [],
    token: '',
    userInfo: null,
    offsetTop: 0,
    capsuleTop: 0,
    _qrScene: ''
  },
  setUserInfo(userInfo: UserInfo) {
    this.globalData.userInfo = userInfo
  },
  setToken(token: string) {
    this.globalData.token = token
  },
  setRefreshing(refreshing: boolean) {
    this.globalData.refreshing = refreshing
  },
  setRequestQueue(requestQueue: RequestQueue[]) {
    this.globalData.requestQueue = requestQueue
  },
  getMenuButtonBoundingClientRect() {
    const { top, height } = wxGetMenuButtonBoundingClientRect()
    this.globalData.offsetTop = top + height
    this.globalData.capsuleTop = top
  },
  login() {
    this.setRefreshing(true)
    wxLogin()
      .then(({ code }) => loginByWid(code))
      .then(({ data }) => {
        const { token, userInfo } = data
        this.setUserInfo(userInfo)
        this.setToken(token)

        this.globalData.requestQueue.forEach(({ resolve, reject, requestInfo }) => {
          create(requestInfo).then(resolve).catch(reject)
        })
        this.setRequestQueue([])
      })
      .catch(() => {
        this.globalData.requestQueue.forEach(({ reject }) => {
          reject({ code: ResponseCode.UNAUTHORIZED, msg: '', data: null })
        })
        this.setRequestQueue([])
      })
      .finally(() => {
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
    // this.login()
  },
  onShow(options: WechatMiniprogram.App.LaunchShowOption) {
    const scene = options.query && (options.query.scene as string)
    if (scene) {
      this.globalData._qrScene = scene
    }
  }
})
