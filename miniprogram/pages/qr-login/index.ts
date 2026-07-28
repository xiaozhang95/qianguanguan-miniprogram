import { qrLoginConfirm } from '../../api/user'
import { wxLogin, wxShowToast, wxSwitchTab } from '../../utils/wx'

const { globalData, update } = getApp()

Page({
  data: {
    sceneId: '',
    loading: false,
    app: null as { offsetTop: number; capsuleTop: number } | null
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
  },
  onShareAppMessage() {
    return {
      title: '钱罐罐账本 - 好好记账，天天向上',
      path: '/pages/home/index'
    }
  }
})
