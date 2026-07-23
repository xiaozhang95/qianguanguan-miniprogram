import { userProfile } from '../../api/user'
import { wxNavigateBack, wxReadFile, wxShowToast } from '../../utils/wx'

const { globalData, update } = getApp()

Page({
  data: {
    avatar: '',
    avatarUrl: '',
    name: '',
    phone: '',
    email: ''
  },
  onShow() {
    const u = globalData.userInfo || {}
    this.setData({
      app: globalData,
      avatar: u.avatar || '',
      avatarUrl: '',
      name: u.name || '',
      phone: u.phone || '',
      email: u.email || ''
    })
  },
  onChooseAvatar(e: WechatMiniprogram.CustomEvent) {
    const url = e.detail.avatarUrl
    this.setData({ avatarUrl: url, avatar: url })
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
    const { avatarUrl, name, phone, email } = this.data
    if (!name.trim()) {
      wxShowToast({ title: '请输入昵称' })
      return
    }

    const doSave = function (avatar: string) {
      userProfile({ avatar, name: name.trim(), phone: phone.trim(), email: email.trim() })
        .then((res: CtmResponse<UserInfo>) => {
          wxShowToast({ title: '保存成功' })
          update('userInfo', res.data)
          setTimeout(function () {
            wxNavigateBack()
          }, 1000)
        })
    }

    if (avatarUrl) {
      wxReadFile(avatarUrl, 'base64').then(function (res) {
        doSave('data:image/png;base64,' + res.data)
      }, function () {
        doSave('')
      })
    } else {
      doSave('')
    }
  }
})
