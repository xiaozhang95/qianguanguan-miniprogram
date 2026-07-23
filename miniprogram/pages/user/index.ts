import { userProfile } from '../../api/user'
import { wxNavigateBack, wxReadFile, wxShowToast } from '../../utils/wx'

const { globalData, update } = getApp()

Page({
  data: {
    avatar: '',
    name: '',
    phone: '',
    email: ''
  },
  onShow() {
    const u = globalData.userInfo || {}
    this.setData({
      app: globalData,
      avatar: u.avatar || '',
      name: u.name || '',
      phone: u.phone || '',
      email: u.email || ''
    })
  },
  onChooseAvatar(e: WechatMiniprogram.CustomEvent) {
    wxReadFile(e.detail.avatarUrl, 'base64').then((res) => {
      this.setData({ avatar: 'data:image/png;base64,' + res.data })
    })
  },
  onNameInput(e: WechatMiniprogram.Input) {
    this.setData({ name: e.detail.value })
  },
  onPhoneInput(e: WechatMiniprogram.Input) {
    this.setData({ phone: e.detail.value })
  },
  onEmailInput(e: WechatMiniprogram.Input) {
    this.setData({ email: e.detail.value })
  },
  handleBack() {
    wxNavigateBack()
  },
  handleSave() {
    const { avatar, name, phone, email } = this.data
    if (!name.trim()) {
      wxShowToast({ title: '请输入昵称' })
      return
    }

    userProfile({ avatar, name: name.trim(), phone: phone.trim(), email: email.trim() })
      .then((res: CtmResponse<UserInfo>) => {
        wxShowToast({ title: '保存成功' })
        update('userInfo', res.data)
        setTimeout(() => {
          wxNavigateBack()
        }, 1000)
      })
  }
})
