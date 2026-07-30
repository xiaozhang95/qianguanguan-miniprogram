import config, { appConfig } from '../../config/index'
import { Role, RoleLabel, Route, routePath } from '../../constants/index'
import type { IAppOption } from '../../typings'
import { debounceNavigateTo, wxSetClipboardData, wxShowToast } from '../../utils/wx'

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
    app: {}
  },

  onLoad() {
    const app = getApp<IAppOption>()
    app.watch(() => {
      this.syncGlobalData()
    })
  },

  onShow() {
    this.syncGlobalData()
  },

  syncGlobalData() {
    const { globalData } = getApp<IAppOption>()
    this.setData({ app: globalData, avatar: avatarUrl(globalData.userInfo) })
  },
  handleToLogin() {
    const { setRequestQueue, login } = getApp<IAppOption>()
    setRequestQueue([])
    login()
  },
  handleToUser() {
    debounceNavigateTo(Route.USER)
  },
  handleToQrLogin() {
    debounceNavigateTo(Route.QR_LOGIN)
  },
  handleToWeb() {
    wxSetClipboardData({ data: config.url }).then(() => {
      wxShowToast({ title: '链接已复制，请用浏览器打开' })
    })
  },
  handleToAgreement() {
    debounceNavigateTo(Route.AGREEMENT, 'tab=service')
  },
  handleToPrivacy() {
    debounceNavigateTo(Route.AGREEMENT, 'tab=privacy')
  },
  onShareAppMessage() {
    return {
      title: appConfig.shareTitle,
      path: routePath(Route.BILL),
      imageUrl: appConfig.shareImage
    }
  }
})
