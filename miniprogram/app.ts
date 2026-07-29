import { loginByWid } from './api/user'
import { wxGetMenuButtonBoundingClientRect, wxLogin, wxShowToast } from './utils/wx'

App<IAppOption>({
  globalData: {
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
  setRequestQueue(requestQueue: RequestQueue[]) {
    console.log(requestQueue)
    this.globalData.requestQueue = requestQueue
  },
  onLaunch() {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function () {
      // 请求完新版本信息的回调
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })

    const { top, height } = wxGetMenuButtonBoundingClientRect()
    this.globalData.offsetTop = top + height
    this.globalData.capsuleTop = top

    wxLogin()
      .then(({ code }) => {
        loginByWid(code).then(({ data }) => {
          setTimeout(() => {
            const { token, userInfo } = data
            this.globalData.userInfo = userInfo as UserInfo | null
            this.globalData.token = token as string
          }, 1000)
        })
      })
      .catch(() => {
        wxShowToast({ title: '登录失败' })
      })
  },
  onShow(options: WechatMiniprogram.App.LaunchShowOption) {
    const scene = options.query && (options.query.scene as string)
    if (scene) {
      this.globalData._qrScene = scene
    }
  }
})
