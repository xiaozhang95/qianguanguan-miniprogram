import { loginByWid, type UserInfo } from './api/user'
import type { IAppOption, RequestQueue } from './type'
import { create } from './utils/request'
import { wxGetMenuButtonBoundingClientRect, wxLogin, wxShowModal, wxShowToast } from './utils/wx'

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
    console.log(requestQueue)
    this.globalData.requestQueue = requestQueue
  },
  getMenuButtonBoundingClientRect() {
    const { top, height } = wxGetMenuButtonBoundingClientRect()
    this.globalData.offsetTop = top + height
    this.globalData.capsuleTop = top
  },
  login() {
    wxLogin()
      .then(({ code }) => {
        loginByWid(code).then(({ data }) => {
          setTimeout(() => {
            const { token, userInfo } = data
            this.globalData.userInfo = userInfo as UserInfo | null
            this.globalData.token = token as string

            this.globalData.requestQueue.forEach(({ resolve, reject, requestInfo }) => {
              create(requestInfo).then(resolve).catch(reject)
            })

            this.setRequestQueue([])
          }, 1000)
        })
      })
      .catch(() => {
        wxShowToast({ title: '登录失败' })
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
