import { categoryList, categorySave, categoryUpdate } from '../../api/category'
import { BillType, ResponseCode } from '../../constants/index'
import config from '../../config/index'
import { wxNavigateBack, wxShowToast } from '../../utils/wx'

const { globalData, isLogin } = getApp()

Page({
  data: {
    BillType,
    editing: false,
    categoryId: '',

    formName: '',
    formIcon: '',
    formIconFile: '',
    originalIcon: '',
    iconChanged: false,
    formType: BillType.EXPENSE as string,
    formSort: 0,
    saving: false,
    choosingImage: false,

    app: null as { offsetTop: number; capsuleTop: number } | null
  },

  onLoad(options: Record<string, string>) {
    this.setData({ app: globalData })

    if (options.id) {
      this.setData({ editing: true, categoryId: options.id })
    }

    isLogin(false).then(() => {
      if (options.id) {
        this.loadCategory(options.id)
      }
    })
  },

  loadCategory(id: string) {
    categoryList().then(({ data: cats }) => {
      const cat = (cats || []).find((c) => c.id === id)
      if (!cat) return
      const isImg = !!(cat.icon && (cat.icon.indexOf('/upload/') === 0 || cat.icon.indexOf('http') === 0))
      const imgUrl = isImg ? (cat.icon.indexOf('/upload/') === 0 ? config.url + cat.icon : cat.icon) : ''
      this.setData({
        formName: cat.name,
        formIcon: isImg ? '' : cat.icon,
        formIconFile: imgUrl,
        originalIcon: cat.icon,
        iconChanged: false,
        formType: cat.type,
        formSort: cat.sort
      })
    })
  },

  onFormTypeChange(e: WechatMiniprogram.CustomEvent) {
    const type = e.currentTarget.dataset.type as string
    this.setData({ formType: type })
  },

  onNameInput(e: WechatMiniprogram.Input) {
    this.setData({ formName: e.detail.value })
  },

  onIconInput(e: WechatMiniprogram.Input) {
    this.setData({ formIcon: e.detail.value })
  },

  onSortChange(e: WechatMiniprogram.Input) {
    this.setData({ formSort: parseInt(e.detail.value) || 0 })
  },

  onChooseIcon() {
    this.setData({ choosingImage: true })
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ formIconFile: res.tempFilePaths[0], iconChanged: true })
      },
      fail: () => {
        this.setData({ choosingImage: false })
      }
    })
  },

  onRemoveIcon() {
    this.setData({ formIconFile: '', iconChanged: true })
  },

  onFormSubmit() {
    const { formName, formIcon, formIconFile, originalIcon, iconChanged, formType, formSort, editing, categoryId } = this.data

    if (!formName.trim()) {
      wxShowToast({ title: '请输入分类名称' })
      return
    }
    if (!formIcon.trim() && !formIconFile) {
      wxShowToast({ title: '请输入图标或上传图片' })
      return
    }

    this.setData({ saving: true })

    const doSave = (icon: string) => {
      const params: CategorySaveParams = {
        name: formName.trim(),
        icon,
        type: formType,
        sort: formSort
      }
      const req = editing ? categoryUpdate(categoryId, params) : categorySave(params)
      req
        .then(({ msg }) => {
          wxShowToast({ title: msg || '保存成功' })
          wxNavigateBack()
        })
        .catch(() => {
          this.setData({ saving: false })
        })
    }

    if (formIconFile) {
      if (iconChanged) {
        wx.uploadFile({
          url: config.url + config.baseUrl + '/upload',
          filePath: formIconFile,
          name: 'file',
          header: { Authorization: globalData.token },
          success: (res) => {
            const data = JSON.parse(res.data)
            if (data.code === ResponseCode.SUCCESS) {
              doSave(data.data.url)
            }
          },
          fail: () => {
            this.setData({ saving: false })
          }
        })
      } else {
        doSave(originalIcon)
      }
    } else {
      doSave(formIcon.trim())
    }
  },

  handleBack() {
    wxNavigateBack()
  }
})
