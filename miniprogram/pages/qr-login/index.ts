import { qrLoginConfirm, type LoginResult } from '../../api/user'
import { wxLogin, wxShowToast, wxSwitchTab } from '../../utils/wx'
import type { CtmResponse, IAppOption } from '../typings'

Page({
  data: {
    sceneId: '',
    loading: false,
    app: {}
  },
  onLoad(options: Record<string, string>) {
    const { globalData } = getApp<IAppOption>()
    this.setData({ app: globalData })
    if (options.scene) {
      this.setData({ sceneId: options.scene })
    }
  },
  onShow() {
    const { globalData } = getApp<IAppOption>()
    this.setData({ app: globalData })
  },
  handleBack() {
    wxSwitchTab('bill')
  },
  handleConfirm() {
    if (this.data.loading) return

    const { setToken, setUserInfo } = getApp<IAppOption>()
    const sceneId = this.data.sceneId
    if (!sceneId) return

    this.setData({ loading: true })
    wxLogin()
      .then((res) => {
        return qrLoginConfirm({ sceneId, code: res.code })
      })
      .then(({ data }: CtmResponse<LoginResult>) => {
        setToken(data.token)
        setUserInfo(data.userInfo)
        wxShowToast({ title: '登录成功' })
        setTimeout(() => {
          wxSwitchTab('bill')
        }, 1000)
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },
  onShareAppMessage() {
    return {
      title: '钱罐罐记账 - 好好记账，天天向上',
      path: '/pages/bill/index'
    }
  }
})
