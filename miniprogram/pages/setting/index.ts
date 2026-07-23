import { LOGO_BASE64 } from '../../config/logo'
import { wxLogin, wxNavigateTo, wxShowShareMenu, wxShowToast } from '../../utils/wx'

const { globalData, login, exitLogin, watch } = getApp()

Page({
  data: {
    LOGO_BASE64
  },
  onLoad() {
    wxShowShareMenu()
    watch((gd: typeof globalData) => {
      this.setData({ app: gd })
    })
  },
  onShow() {
    this.setData({ app: globalData })
  },
  handleToLogin() {
    wxShowToast({ title: '请求中...', mask: true })
    wxLogin()
      .then((res) => {
        login(res.code)
      })
      .catch(() => {
        wxShowToast({ title: '登录失败' })
      })
  },
  handleToUser() {
    wxNavigateTo('user')
  },
  handleToExitLogin() {
    exitLogin(() => {
      wxShowToast({ title: '已退出登录' })
      this.setData({
        app: globalData
      })
    })
  },
  onShareAppMessage() {
    return {
      title: '钱罐罐 - 好好记账，天天向上',
      path: '/pages/setting/index'
    }
  }
})
