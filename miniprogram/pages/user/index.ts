import { uploadAvatar, userProfile } from '../../api/user'
import config from '../../config/index'
import { wxNavigateBack, wxShowToast } from '../../utils/wx'

const { globalData, update } = getApp()

Page({
  data: {
    avatar: '',
    avatarFilePath: '',
    oldAvatar: '',
    name: '',
    phone: '',
    email: '',
    saving: false
  },
  onShow() {
    const u = globalData.userInfo || {}
    const a = u.avatar || ''
    const isUpload = a.indexOf(config.uploadPath) === 0
    const avatarUrl = isUpload ? config.url + a : a
    this.setData({
      app: globalData,
      avatar: avatarUrl,
      avatarFilePath: '',
      oldAvatar: a,
      name: u.name || '',
      phone: u.phone || '',
      email: u.email || ''
    })
  },
  onChooseAvatar(e: WechatMiniprogram.CustomEvent) {
    const filePath = e.detail.avatarUrl
    this.setData({ avatarFilePath: filePath, avatar: filePath })
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
    const avatarFilePath = this.data.avatarFilePath
    const oldAvatar = this.data.oldAvatar

    this.setData({ saving: true })

    const saveWithAvatar = (avatar: string) => {
      userProfile({ avatar, name, phone, email })
        .then((res: CtmResponse<UserInfo>) => {
          wxShowToast({ title: '保存成功' })
          update('userInfo', res.data)
          setTimeout(function () {
            wxNavigateBack()
          }, 1000)
        })
        .catch(() => {
          this.setData({ saving: false })
        })
    }

    if (avatarFilePath && avatarFilePath !== oldAvatar) {
      uploadAvatar(avatarFilePath).then(res => {
        const json = JSON.parse(res.data) as CtmResponse<{ url: string }>
        saveWithAvatar(json.data.url)
      }).catch(() => {
        saveWithAvatar(oldAvatar)
      })
    } else {
      saveWithAvatar(oldAvatar)
    }
  }
})
