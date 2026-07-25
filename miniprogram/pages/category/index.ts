import { categoryDelete, categoryList } from '../../api/category'
import { BillType } from '../../constants/index'
import config from '../../config/index'
import { wxNavigateTo, wxShowToast } from '../../utils/wx'

const { globalData, isLogin, watch } = getApp()

Page({
  data: {
    BillType,
    categories: [] as Category[],
    filteredCategories: [] as Category[],
    systemCategories: [] as Category[],
    customCategories: [] as Category[],
    expenseCount: 0,
    incomeCount: 0,
    totalCount: 0,
    loading: false,
    activeTab: 0,
    filterTabs: [
      { label: '支出', type: 'expense' },
      { label: '收入', type: 'income' }
    ],

    isScrolled: false,
    navigating: false,

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
          const isImg = !!(c.icon && (c.icon.indexOf('/upload/') === 0 || c.icon.indexOf('http') === 0))
          return {
            ...c,
            iconIsImage: isImg,
            icon: isImg && c.icon.indexOf('/upload/') === 0 ? config.url + c.icon : c.icon
          }
        })
        const filterType = this.data.filterTabs[this.data.activeTab].type === 'expense' ? BillType.EXPENSE : BillType.INCOME
        const filtered = cats.filter((c) => c.type === filterType)
        const system = cats.filter((c) => c.userId === null)
        const custom = cats.filter((c) => c.userId !== null)
        const expenseCats = cats.filter((c) => c.type === BillType.EXPENSE)
        const incomeCats = cats.filter((c) => c.type === BillType.INCOME)
        this.setData({
          categories: cats,
          filteredCategories: filtered,
          systemCategories: system,
          customCategories: custom,
          expenseCount: expenseCats.length,
          incomeCount: incomeCats.length,
          totalCount: cats.length,
          loading: false
        })
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  onFilterTabChange(e: WechatMiniprogram.CustomEvent) {
    const idx = e.detail.index as number
    const filterType = idx === 0 ? BillType.EXPENSE : BillType.INCOME
    this.setData({
      activeTab: idx,
      filteredCategories: this.data.categories.filter((c) => c.type === filterType)
    })
  },

  onAdd() {
    if (this.data.navigating) return
    this.setData({ navigating: true })
    wxNavigateTo('category-form')
    this.setData({ navigating: false })
  },

  onEdit(e: WechatMiniprogram.CustomEvent) {
    if (this.data.navigating) return
    const cat = e.currentTarget.dataset.cat as Category
    this.setData({ navigating: true })
    wxNavigateTo('category-form', 'id=' + cat.id)
    this.setData({ navigating: false })
  },

  onSystemTap() {
    wxShowToast({ title: '系统分类不可编辑' })
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

  onPageScroll(e: { scrollTop: number }) {
    const scrolled = e.scrollTop > 40
    if (scrolled !== this.data.isScrolled) {
      this.setData({ isScrolled: scrolled })
    }
    const nav = this.selectComponent('#fixed-nav')
    if (nav) nav.onPageScroll(e)
  },

  onShareAppMessage() {
    return {
      title: '钱罐罐 - 好好记账，天天向上',
      path: '/pages/category/index'
    }
  }
})
