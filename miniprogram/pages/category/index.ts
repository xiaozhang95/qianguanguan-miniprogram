import { categoryDelete, categoryList, categorySave, categoryUpdate, type CategorySaveParams } from '../../api/category'
import { wxShowToast } from '../../utils/wx'

const { globalData, isLogin, watch } = getApp()

Page({
  data: {
    categories: [] as Category[],
    filteredCategories: [] as Category[],
    loading: false,
    activeTab: 0,
    tabs: ['全部', '支出', '收入'],

    showForm: false,
    editingCategory: null as Category | null,
    formName: '',
    formIcon: '',
    formType: 'EXPENSE',
    formSort: 0,
    saving: false,

    app: null as any
  },

  onLoad() {
    watch((gd: typeof globalData) => {
      this.setData({ app: gd })
      this.init()
    })
  },

  onShow() {
    this.setData({ app: globalData })
    this.init()
  },

  onHide() {
    this.setData({ showForm: false })
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
        const cats = data || []
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
    if (activeTab === 1) {
      filtered = categories.filter((c: Category) => c.type === 'EXPENSE')
    } else if (activeTab === 2) {
      filtered = categories.filter((c: Category) => c.type === 'INCOME')
    } else {
      filtered = categories
    }
    this.setData({ filteredCategories: filtered })
  },

  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const idx = Number(e.currentTarget.dataset.idx)
    this.setData({ activeTab: idx }, () => {
      this.applyFilter()
    })
  },

  onAdd() {
    this.setData({
      showForm: true,
      editingCategory: null,
      formName: '',
      formIcon: '',
      formType: 'EXPENSE',
      formSort: 0
    })
  },

  onEdit(e: WechatMiniprogram.CustomEvent) {
    const cat = e.currentTarget.dataset.cat as Category
    const isSystem = cat.userId === null
    this.setData({
      showForm: true,
      editingCategory: isSystem ? null : cat,
      formName: cat.name,
      formIcon: cat.icon,
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

  onSortChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ formSort: e.detail })
  },

  onFormSubmit() {
    const { formName, formIcon, formType, formSort, editingCategory } = this.data

    if (!formName.trim()) {
      wxShowToast({ title: '请输入分类名称' })
      return
    }
    if (!formIcon.trim()) {
      wxShowToast({ title: '请输入图标（如表情符号）' })
      return
    }

    const params: CategorySaveParams = {
      name: formName.trim(),
      icon: formIcon.trim(),
      type: formType,
      sort: formSort
    }

    this.setData({ saving: true })

    const request = editingCategory ? categoryUpdate(editingCategory.id, params) : categorySave(params)
    request
      .then(({ msg }) => {
        wxShowToast({ title: msg || '保存成功' })
        this.setData({ showForm: false, saving: false })
        this.loadCategories()
      })
      .catch(() => {
        this.setData({ saving: false })
      })
  },

  onShareAppMessage() {
    return {
      title: '钱罐罐 - 好好记账，天天向上',
      path: '/pages/category/index'
    }
  }
})
