import { categoryDelete, categoryList, categorySave, categoryUpdate } from '../../api/category'
import { BillType } from '../../constants'
import config from '../../config/index'
import { wxShowToast } from '../../utils/wx'

const { globalData, isLogin, watch } = getApp()

Page({
  data: {
    categories: [] as Category[],
    filteredCategories: [] as Category[],
    loading: false,
    activeTab: 0,
    tabs: ['支出', '收入'],

    showForm: false,
    editingCategory: null as Category | null,
    formName: '',
    formIcon: '',
    formIconFile: '',
    iconChanged: false,
    formType: BillType.EXPENSE as string,
    formSort: 0,
    saving: false,
    isScrolled: false,
    choosingImage: false,

    app: null as { offsetTop: number; capsuleTop: number } | null
  },

  onLoad() {
    watch((gd: typeof globalData) => {
      this.setData({ app: gd })
      this.init()
    })
  },

  onShow() {
    this.setData({ app: globalData, isScrolled: false })
    this.init()
  },

  onHide() {
    if (!this.data.choosingImage) {
      this.setData({ showForm: false })
    }
    this.setData({ isScrolled: false })
  },

  init() {
    isLogin(false).then(() => {
      this.loadCategories()
    }).catch(() => {
      this.setData({ categories: [], filteredCategories: [] })
    })
  },

  loadCategories() {
    this.setData({ loading: true })
    categoryList()
      .then(({ data }) => {
        const cats = (data || []).map((c: Category) => {
          const isImg = c.icon && (c.icon.startsWith('/upload/') || c.icon.startsWith('http'))
          return {
            ...c,
            iconIsImage: isImg,
            icon: isImg && c.icon.startsWith('/upload/') ? config.url + c.icon : c.icon
          }
        })
        this.setData({ categories: cats, loading: false })
        this.applyFilter()
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  applyFilter() {
    const { activeTab, categories } = this.data
    let filtered: Category[]
    if (activeTab === 0) {
      filtered = categories.filter((c: Category) => c.type === BillType.EXPENSE)
    } else {
      filtered = categories.filter((c: Category) => c.type === BillType.INCOME)
    }
    this.setData({ filteredCategories: filtered })
  },

  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const idx = Number(e.currentTarget.dataset.idx)
    this.setData({ activeTab: idx }, () => {
      this.applyFilter()
    })
  },

  onSystemTap() {
    wxShowToast({ title: '系统默认分类，不允许编辑' })
  },

  onAdd() {
    this.setData({
      showForm: true,
      editingCategory: null,
      formName: '',
      formIcon: '',
      formIconFile: '',
      iconChanged: false,
      formType: BillType.EXPENSE as string,
      formSort: 0
    })
  },

  onEdit(e: WechatMiniprogram.CustomEvent) {
    const cat = e.currentTarget.dataset.cat as Category
    const isSystem = cat.userId === null
    const isImg = cat.icon && (cat.icon.startsWith('/upload/') || cat.icon.startsWith('http'))
    const imgUrl = isImg ? (cat.icon.startsWith('/upload/') ? config.url + cat.icon : cat.icon) : ''
    this.setData({
      showForm: true,
      editingCategory: isSystem ? null : cat,
      formName: cat.name,
      formIcon: isImg ? '' : cat.icon,
      formIconFile: imgUrl,
      iconChanged: false,
      formType: cat.type,
      formSort: cat.sort
    })
  },

  onDelete(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个分类吗？',
      success: (res) => {
        if (res.confirm) {
          categoryDelete(id)
            .then(({ msg }) => {
              wxShowToast({ title: msg || '删除成功' })
              this.loadCategories()
            })
        }
      }
    })
  },

  onFormClose() {
    this.setData({ showForm: false })
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
    const { formName, formIcon, formIconFile, iconChanged, formType, formSort, editingCategory } = this.data

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
      const req = editingCategory ? categoryUpdate(editingCategory.id, params) : categorySave(params)
      req
        .then(({ msg }) => {
          wxShowToast({ title: msg || '保存成功' })
          this.setData({ showForm: false, saving: false, formIconFile: '' })
          this.loadCategories()
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
            if (data.code === 200) {
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
        doSave(formIconFile)
      }
    } else {
      doSave(formIcon.trim())
    }
  },

  onPrevent() {
    return
  },

  onPageScroll(e: { scrollTop: number }) {
    const scrolled = e.scrollTop > 40
    if (scrolled !== this.data.isScrolled) {
      this.setData({ isScrolled: scrolled })
    }
  },

  onShareAppMessage() {
    return {
      title: '钱罐罐 - 好好记账，天天向上',
      path: '/pages/category/index'
    }
  }
})
