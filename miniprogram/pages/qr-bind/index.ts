import { qrBindConfirm } from '../../api/user'
import { LOGO_BASE64 } from '../../config/logo'
import { wxLogin, wxShowToast, wxSwitchTab } from '../../utils/wx'

const { globalData } = getApp()

Page({
  data: {
    LOGO_BASE64,
    sceneId: '',
    loading: false
  },
  onLoad(options: Record<string, string>) {
    this.setData({ app: globalData })
    if (options.scene) {
      this.setData({ sceneId: options.scene })
    }
  },
  onShow() {
    this.setData({ app: globalData })
  },
  handleBack() {
    wxSwitchTab('home')
  },
  handleConfirm() {
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
          wxSwitchTab('home')
        }, 1000)
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  }
})
