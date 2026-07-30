import { qrBindConfirm } from '../../api/user'
import { Route } from '../../constants/index'
import type { IAppOption } from '../../typings'
import { wxLogin, wxShowToast, wxSwitchTab } from '../../utils/wx'

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
    wxSwitchTab(Route.BILL)
  },
  handleConfirm() {
    if (this.data.loading) return

    const sceneId = this.data.sceneId
    if (!sceneId) return

    this.setData({ loading: true })
    wxLogin()
      .then((res) => {
        return qrBindConfirm({ sceneId, code: res.code })
      })
      .then(() => {
        wxShowToast({ title: '绑定成功' })
        setTimeout(() => {
          wxSwitchTab(Route.BILL)
        }, 1000)
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  }
})
