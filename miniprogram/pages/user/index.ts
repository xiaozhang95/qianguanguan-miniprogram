import { sendEmailCode, uploadAvatar, userProfile } from '../../api/user'
import config from '../../config/index'
import { debounceNavigateTo, wxNavigateBack, wxShowToast } from '../../utils/wx'

const { globalData, update } = getApp()

Page({
  data: {
    avatar: '',
    avatarFilePath: '',
    oldAvatar: '',
    name: '',
    phone: '',
    email: '',
    oldEmail: '',
    emailCode: '',
    sendCodeLoading: false,
    codeCountdown: 0,
    emailChanged: false,
    agreed: false,
    saving: false
  },
  _countdownTimer: 0 as unknown as ReturnType<typeof setInterval>,
  onLoad() {
    const u = globalData.userInfo || {}
    const a = u.avatar || ''
    const isUpload = a.indexOf(config.uploadPath) === 0
    const avatarUrl = isUpload ? config.url + a : a
    const email = u.email || ''
    this.setData({
      app: globalData,
      avatar: avatarUrl,
      avatarFilePath: '',
      oldAvatar: a,
      name: u.name || '',
      phone: u.phone || '',
      email,
      oldEmail: email,
      emailCode: '',
      codeCountdown: 0,
      emailChanged: false
    })
  },
  onShow() {
    this.setData({ app: globalData })
  },
  onUnload() {
    if (this._countdownTimer) {
      clearInterval(this._countdownTimer)
    }
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
    const email = e.detail.value
    const emailChanged = email !== this.data.oldEmail
    this.setData({ email, emailChanged })
    if (!emailChanged) {
      this.setData({ emailCode: '' })
    }
  },
  onEmailCodeInput(e: WechatMiniprogram.Input) {
    this.setData({ emailCode: e.detail.value })
  },
  handleBack() {
    wxNavigateBack()
  },
  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },
  handleToService() {
    debounceNavigateTo('agreement', 'tab=service')
  },
  handleToPrivacy() {
    debounceNavigateTo('agreement', 'tab=privacy')
  },
  handleSendCode() {
    const email = this.data.email
    if (!email) {
      wxShowToast({ title: '请先输入邮箱' })
      return
    }
    this.setData({ sendCodeLoading: true })
    sendEmailCode(email)
      .then(() => {
        wxShowToast({ title: '验证码已发送' })
        this.setData({ codeCountdown: 60 })
        this._countdownTimer = setInterval(() => {
          const next = this.data.codeCountdown - 1
          this.setData({ codeCountdown: next })
          if (next <= 0) {
            clearInterval(this._countdownTimer)
          }
        }, 1000)
      })
      .catch(() => {})
      .finally(() => {
        this.setData({ sendCodeLoading: false })
      })
  },
  handleSave() {
    if (!this.data.agreed) {
      wxShowToast({ title: '请先阅读并同意用户协议和隐私政策' })
      return
    }
    const name = (this.data.name || '').trim()
    if (!name) {
      wxShowToast({ title: '请输入昵称' })
      return
    }
    const phone = (this.data.phone || '').trim()
    const email = (this.data.email || '').trim()
    const oldEmailTrimmed = (this.data.oldEmail || '').trim()
    const emailChanged = email !== oldEmailTrimmed
    if (emailChanged && !this.data.emailCode) {
      wxShowToast({ title: '请输入邮箱验证码' })
      return
    }
    const avatarFilePath = this.data.avatarFilePath
    const oldAvatar = this.data.oldAvatar

    this.setData({ saving: true })

    const saveWithAvatar = (avatar: string) => {
      const payload: Record<string, unknown> = { avatar, name, phone, email }
      if (emailChanged) {
        payload.emailCode = this.data.emailCode
      }
      userProfile(payload)
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
