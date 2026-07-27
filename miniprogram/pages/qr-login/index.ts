import { qrLoginConfirm } from '../../api/user'
import { LOGO_BASE64 } from '../../config/logo'
import { wxLogin, wxShowToast, wxSwitchTab } from '../../utils/wx'

const { globalData, update } = getApp()

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
        return qrLoginConfirm({ sceneId, code: res.code })
      })
      .then((res: CtmResponse<LoginResult>) => {
        update('token', res.data.token)
        update('userInfo', res.data.userInfo)
        wxShowToast({ title: '登录成功' })
        setTimeout(() => {
          wxSwitchTab('home')
        }, 1000)
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  }
})
