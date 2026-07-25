import { userProfile } from '../../api/user'
import config from '../../config/index'
import { ResponseCode } from '../../constants/index'
import { wxNavigateBack, wxShowToast } from '../../utils/wx'

const { globalData, update } = getApp()

Page({
  data: {
    avatar: '',
    avatarUrl: '',
    name: '',
    phone: '',
    email: '',
    saving: false
  },
  onShow() {
    const u = globalData.userInfo || {}
    this.setData({
      app: globalData,
      avatar: u.avatar || '',
      avatarUrl: '',
      name: u.name || '',
      phone: u.email || '',
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
    const name = (this.data.name || '').trim()
    if (!name) {
      wxShowToast({ title: '请输入昵称' })
      return
    }
    const phone = (this.data.phone || '').trim()
    const email = (this.data.email || '').trim()
    const avatarUrl = this.data.avatarUrl
    const currentAvatar = this.data.avatar

    this.setData({ saving: true })

    const doSave = (avatar: string) => {
      userProfile({ avatar, name, phone, email })
        .then((res: CtmResponse<UserInfo>) => {
          wxShowToast({ title: '保存成功' })
          update('userInfo', res.data)
          setTimeout(() => {
            wxNavigateBack()
          }, 1000)
        })
        .catch(() => {
          this.setData({ saving: false })
        })
    }

    if (avatarUrl && avatarUrl !== currentAvatar) {
      wx.uploadFile({
        url: config.url + config.baseUrl + '/upload',
        filePath: avatarUrl,
        name: 'file',
        header: { Authorization: globalData.token },
        success: (res) => {
          const data = JSON.parse(res.data)
          if (data.code === ResponseCode.SUCCESS) {
            doSave(data.data.url)
          } else {
            wxShowToast({ title: data.msg || '上传失败' })
            this.setData({ saving: false })
          }
        },
        fail: () => {
          wxShowToast({ title: '上传失败' })
          this.setData({ saving: false })
        }
      })
    } else {
      doSave(currentAvatar || '')
    }
  }
})
