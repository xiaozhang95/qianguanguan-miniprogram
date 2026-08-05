import { userInfo } from '../../api/user'
import config, { appConfig } from '../../config/index'
import { Role, RoleLabel, Route, routePath } from '../../constants/index'
import type { IAppOption } from '../../typings'
import { debounceNavigateTo, wxHideLoading, wxSetClipboardData, wxShowLoading, wxShowShareMenu, wxShowToast } from '../../utils/wx'

Page({
  data: {
    config,
    Role,
    RoleLabel,
    app: {}
  },

  onLoad() {
    wxShowShareMenu()
  },

  onShow() {
    const { globalData, setUserInfo } = getApp<IAppOption>()

    this.setData({ app: globalData })

    if (!globalData.userInfo) {
      wxShowLoading({ title: '加载中' })
      userInfo()
        .then(({ data }) => {
          this.setData({
            app: {
              ...this.data.app,
              userInfo: data
            }
          })

          setUserInfo(data)
        })
        .finally(() => {
          wxHideLoading()
        })
    }
  },
  handleToLogin() {
    const { setRequestQueue, login, setUserInfo } = getApp<IAppOption>()
    setRequestQueue([])
    login().then((u) => {
      this.setData({
        app: {
          ...this.data.app,
          userInfo: u
        }
      })

      setUserInfo(u)
    })
  },
  handleToUser() {
    debounceNavigateTo(Route.USER)
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
