import { billDelete, billList, billSave, billStats, billUpdate, type BillSaveParams } from '../../api/bill'
import { categoryList, type Category } from '../../api/category'
import { LOGO_BASE64 } from '../../config/logo'
import { wxShowToast } from '../../utils/wx'

const { globalData, isLogin, watch } = getApp()

function fmt(n: number) {
  return n.toFixed(2)
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface BillGroup {
  date: string
  items: BillVO[]
}

Page({
  data: {
    LOGO_BASE64,
    filterDate: todayStr(),
    filterYear: new Date().getFullYear(),
    filterMonth: new Date().getMonth() + 1,
    filterDay: new Date().getDate(),
    filterType: 'EXPENSE' as string,
    activeTab: 0,
    showDatePicker: false,
    currentDate: Date.now(),
    minDate: new Date(2020, 0).getTime(),
    maxDate: Date.now(),

    stats: { totalIncome: 0, totalExpense: 0, balance: 0 },
    expenseStr: '0.00',
    incomeStr: '0.00',
    balanceStr: '0.00',
    balanceClass: 'balance-zero',
    bills: [] as BillVO[],
    billGroups: [] as BillGroup[],
    loading: false,
    hasData: false,

    categories: [] as Category[],
    incomeCategories: [] as Category[],
    expenseCategories: [] as Category[],
    filteredCategories: [] as Category[],

    showForm: false,
    editingBill: null as BillVO | null,
    formType: 'EXPENSE',
    formCategoryId: '',
    formCategoryName: '',
    formAmount: '',
    formDate: todayStr(),
    formRemark: '',
    showCategoryPicker: false,
    saving: false,

    deletingId: '',
    isScrolled: false,

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
    this.setData({ showForm: false, showCategoryPicker: false, showDatePicker: false })
  },

  init() {
    isLogin(false).then(() => {
      this.loadCategories()
      this.loadData()
    }).catch(() => {
      this.setData({ stats: { totalIncome: 0, totalExpense: 0, balance: 0 }, bills: [], billGroups: [], hasData: false, categories: [], incomeCategories: [], expenseCategories: [], expenseStr: '0.00', incomeStr: '0.00', balanceStr: '0.00', balanceClass: 'balance-zero' })
    })
  },

  loadCategories() {
    categoryList().then(({ data }) => {
      const cats = data || []
      this.setData({
        categories: cats,
        incomeCategories: cats.filter((c: Category) => c.type === 'INCOME'),
        expenseCategories: cats.filter((c: Category) => c.type === 'EXPENSE'),
        filteredCategories: cats.filter((c: Category) => c.type === 'EXPENSE')
      })
    })
  },

  loadData() {
    const { filterYear, filterMonth, filterDay, filterType } = this.data
    this.setData({ loading: true })

    const yearStr = String(filterYear)
    const monthStr = String(filterMonth)
    const dayStr = String(filterDay)
    const dateStr = `${filterYear}-${pad(filterMonth)}-${pad(filterDay)}`

    Promise.all([
      billStats(yearStr, monthStr, dayStr),
      billList({ type: filterType, startDate: dateStr, endDate: dateStr, pageNum: 1, pageSize: 200 })
    ])
      .then(([statsRes, listRes]) => {
        const stats = statsRes.data
        const records = listRes.data.records || []

        const groupMap = new Map<string, any[]>()
        records.forEach((b: any) => {
          b.amountStr = fmt(b.amount)
          b.amountPrefix = b.type === 'INCOME' ? '+' : '-'
          const arr = groupMap.get(b.billDate) || []
          arr.push(b)
          groupMap.set(b.billDate, arr)
        })
        const billGroups: BillGroup[] = Array.from(groupMap.entries())
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([date, items]) => ({ date, items }))

        this.setData({
          stats,
          expenseStr: fmt(stats.totalExpense),
          incomeStr: fmt(stats.totalIncome),
          balanceStr: fmt(stats.balance),
          balanceClass: stats.balance < 0 ? 'balance-negative' : stats.balance > 0 ? 'balance-positive' : 'balance-zero',
          bills: records,
          billGroups,
          hasData: records.length > 0,
          loading: false
        })
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  onFilterChange(e: WechatMiniprogram.CustomEvent) {
    const idx = Number(e.currentTarget.dataset.idx)
    const types = ['EXPENSE', 'INCOME']
    this.setData({ activeTab: idx, filterType: types[idx] })
    this.loadData()
  },

  onDatePrev() {
    const d = new Date(this.data.filterYear, this.data.filterMonth - 1, this.data.filterDay)
    d.setDate(d.getDate() - 1)
    this.setData({
      filterDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      filterYear: d.getFullYear(),
      filterMonth: d.getMonth() + 1,
      filterDay: d.getDate()
    })
    this.loadData()
  },

  onDateNext() {
    const d = new Date(this.data.filterYear, this.data.filterMonth - 1, this.data.filterDay)
    d.setDate(d.getDate() + 1)
    this.setData({
      filterDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      filterYear: d.getFullYear(),
      filterMonth: d.getMonth() + 1,
      filterDay: d.getDate()
    })
    this.loadData()
  },

  onDatePickerOpen() {
    const { filterYear, filterMonth, filterDay } = this.data
    this.setData({
      showDatePicker: true,
      currentDate: new Date(filterYear, filterMonth - 1, filterDay).getTime()
    })
  },

  onDatePickerClose() {
    this.setData({ showDatePicker: false })
  },

  onDateConfirm(e: WechatMiniprogram.CustomEvent) {
    const val = new Date(e.detail as number)
    const y = val.getFullYear()
    const m = val.getMonth() + 1
    const d = val.getDate()
    this.setData({
      filterDate: `${y}-${pad(m)}-${pad(d)}`,
      filterYear: y,
      filterMonth: m,
      filterDay: d,
      showDatePicker: false
    })
    this.loadData()
  },

  onAddBill() {
    this.ensureCategories(() => {
      const expenseCats = this.data.expenseCategories
      this.setData({
        showForm: true,
        editingBill: null,
        formType: 'EXPENSE',
        formCategoryId: '',
        formCategoryName: '',
        formAmount: '',
        formDate: this.data.filterDate,
        formRemark: '',
        filteredCategories: expenseCats
      })
    })
  },

  onEditBill(e: WechatMiniprogram.CustomEvent) {
    const bill = e.currentTarget.dataset.bill as BillVO
    this.ensureCategories(() => {
      const cats = bill.type === 'INCOME' ? this.data.incomeCategories : this.data.expenseCategories
      this.setData({
        showForm: true,
        editingBill: bill,
        formType: bill.type,
        formCategoryId: bill.categoryId,
        formCategoryName: bill.categoryName,
        formAmount: String(bill.amount),
        formDate: bill.billDate,
        formRemark: bill.remark || '',
        filteredCategories: cats
      })
    })
  },

  onFormCategoryOpen() {
    this.ensureCategories(() => {
      this.setData({ showCategoryPicker: true })
    })
  },

  onFormCategoryClose() {
    this.setData({ showCategoryPicker: false })
  },

  ensureCategories(cb: () => void) {
    if (this.data.categories.length === 0) {
      categoryList().then(({ data }) => {
        const cats = data || []
        const incomeCats = cats.filter((c: Category) => c.type === 'INCOME')
        const expenseCats = cats.filter((c: Category) => c.type === 'EXPENSE')
        this.setData({
          categories: cats,
          incomeCategories: incomeCats,
          expenseCategories: expenseCats,
          filteredCategories: this.data.formType === 'INCOME' ? incomeCats : expenseCats
        })
        cb()
      })
    } else {
      cb()
    }
  },

  onDeleteBill(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这笔账单吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ deletingId: id })
          billDelete(id)
            .then(({ msg }) => {
              wxShowToast({ title: msg || '删除成功' })
              this.setData({ deletingId: '' })
              this.loadData()
            })
            .catch(() => {
              this.setData({ deletingId: '' })
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
    const cats = type === 'INCOME' ? this.data.incomeCategories : this.data.expenseCategories
    this.setData({ formType: type, formCategoryId: '', formCategoryName: '', filteredCategories: cats })
  },

  onFormCategorySelect(e: WechatMiniprogram.CustomEvent) {
    const cat = e.currentTarget.dataset.cat as Category
    this.setData({
      formCategoryId: cat.id,
      formCategoryName: cat.name,
      showCategoryPicker: false
    })
  },

  onFormCategoryClose() {
    this.setData({ showCategoryPicker: false })
  },

  onFormAmountInput(e: WechatMiniprogram.Input) {
    this.setData({ formAmount: e.detail.value })
  },

  onFormDateChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ formDate: e.detail.value })
  },

  onFormRemarkInput(e: WechatMiniprogram.Input) {
    this.setData({ formRemark: e.detail.value })
  },

  onFormSubmit() {
    const { formType, formCategoryId, formAmount, formDate, formRemark, editingBill } = this.data

    if (!formCategoryId) {
      wxShowToast({ title: '请选择分类' })
      return
    }
    const amount = parseFloat(formAmount)
    if (!formAmount || isNaN(amount) || amount <= 0) {
      wxShowToast({ title: '请输入有效金额' })
      return
    }
    if (!formDate) {
      wxShowToast({ title: '请选择日期' })
      return
    }

    const params: BillSaveParams = {
      categoryId: formCategoryId,
      type: formType,
      amount: Math.round(amount * 100) / 100,
      billDate: formDate,
      remark: formRemark || undefined
    }

    this.setData({ saving: true })

    const request = editingBill ? billUpdate(editingBill.id, params) : billSave(params)
    request
      .then(({ msg }) => {
        wxShowToast({ title: msg || '保存成功' })
        this.setData({ showForm: false, saving: false })
        this.loadData()
        this.loadCategories()
      })
      .catch(() => {
        this.setData({ saving: false })
      })
  },

  onFormDelete() {
    const { editingBill } = this.data
    if (!editingBill) return
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这笔账单吗？',
      success: (res) => {
        if (res.confirm) {
          billDelete(editingBill.id)
            .then(({ msg }) => {
              wxShowToast({ title: msg || '删除成功' })
              this.setData({ showForm: false, editingBill: null })
              this.loadData()
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
  },

  onShareAppMessage() {
    return {
      title: '钱罐罐 - 好好记账，天天向上',
      path: '/pages/bill/index'
    }
  }
})
