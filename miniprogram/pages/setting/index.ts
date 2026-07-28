import config from '../../config/index'
import { Role, RoleLabel } from '../../constants/index'
import { debounceNavigateTo, wxLogin, wxShowShareMenu, wxShowToast } from '../../utils/wx'

const { globalData, login, exitLogin, watch } = getApp()

function avatarUrl(u: { avatar?: string } | null) {
  const a = (u && u.avatar) || ''
  if (a.indexOf(config.uploadPath) === 0 || a.indexOf('http') === 0) {
    return a.indexOf(config.uploadPath) === 0 ? config.url + a : a
  }
  return a
}

Page({
  data: {
    Role,
    RoleLabel,
    avatar: '',
    app: null as { offsetTop: number; capsuleTop: number; userInfo: UserInfo | null } | null
  },
  onLoad() {
    wxShowShareMenu()
    watch((gd: typeof globalData) => {
      this.setData({ app: gd, avatar: avatarUrl(gd.userInfo) })
    })
  },
  onShow() {
    this.setData({ app: globalData, avatar: avatarUrl(globalData.userInfo) })
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
    debounceNavigateTo('user')
  },
  handleToQrLogin() {
    debounceNavigateTo('qr-login')
  },
  handleToExitLogin() {
    exitLogin(() => {
      wxShowToast({ title: '已退出登录' })
      this.setData({
        app: globalData
      })
    })
  },
  handleToAgreement() {
    debounceNavigateTo('agreement', 'tab=service')
  },
  handleToPrivacy() {
    debounceNavigateTo('agreement', 'tab=privacy')
  },
  onShareAppMessage() {
    return {
      title: '钱罐罐账本 - 好好记账，天天向上',
      path: '/pages/home/index'
    }
  }
})
