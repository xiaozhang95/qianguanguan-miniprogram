import type { UserInfo } from '../../api/user'
import config from '../../config/index'
import { Role, RoleLabel } from '../../constants/index'
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
    app: null as { offsetTop: number; capsuleTop: number; userInfo: UserInfo | null } | null
  },

  onShow() {
    const { globalData } = getApp<IAppOption>()
    this.setData({ app: globalData, avatar: avatarUrl(globalData.userInfo) })
  },
  handleToUser() {
    debounceNavigateTo('user')
  },
  handleToQrLogin() {
    debounceNavigateTo('qr-login')
  },
  handleToWeb() {
    wxSetClipboardData({ data: config.url }).then(() => {
      wxShowToast({ title: '链接已复制，请用浏览器打开' })
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
      title: '钱罐罐记账 - 好好记账，天天向上',
      path: '/pages/bill/index'
    }
  }
})
