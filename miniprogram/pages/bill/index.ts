import { billList, billStats } from '../../api/bill'
import config from '../../config/index'
import { BillType } from '../../constants/index'
import { fmt, pad } from '../../utils/format'
import { debounceNavigateTo, wxSwitchTab } from '../../utils/wx'

const { globalData, isLogin, watch } = getApp()

function todayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

interface BillItem extends BillVO {
  amountStr: string
  amountPrefix: string
  iconIsImage: boolean
}

interface BillGroup {
  date: string
  items: BillItem[]
}

Page({
  data: {
    BillType,
    filterDate: todayStr(),
    filterYear: new Date().getFullYear(),
    filterMonth: new Date().getMonth() + 1,
    filterDay: new Date().getDate(),
    filterType: BillType.EXPENSE as string,
    filterTabs: [
      { label: '支出', type: 'expense' },
      { label: '收入', type: 'income' }
    ],
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

    isScrolled: false,

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
    this.setData({ showDatePicker: false, isScrolled: false })
  },

  init() {
    isLogin(false)
      .then(() => {
        this.loadData()
      })
      .catch(() => {
        this.setData({
          stats: { totalIncome: 0, totalExpense: 0, balance: 0 },
          bills: [],
          billGroups: [],
          hasData: false,
          expenseStr: '0.00',
          incomeStr: '0.00',
          balanceStr: '0.00',
          balanceClass: 'balance-zero'
        })
      })
  },

  loadData() {
    const { filterYear, filterMonth, filterDay, filterType } = this.data
    this.setData({ loading: true })

    const yearStr = String(filterYear)
    const monthStr = String(filterMonth)
    const dayStr = String(filterDay)
    const dateStr = filterYear + '-' + pad(filterMonth) + '-' + pad(filterDay)

    Promise.all([billStats(yearStr, monthStr, dayStr), billList({ type: filterType, startDate: dateStr, endDate: dateStr, pageNum: 1, pageSize: 200 })])
      .then(([statsRes, listRes]) => {
        const stats = statsRes.data
        const records = listRes.data.records || []

        const groupMap = new Map<string, BillItem[]>()
        records.forEach((b: BillVO) => {
          const isImg = !!(b.categoryIcon && (b.categoryIcon.indexOf(config.uploadPath) === 0 || b.categoryIcon.indexOf('http') === 0))
          const bill: BillItem = {
            ...b,
            amountStr: fmt(b.amount),
            amountPrefix: b.type === BillType.INCOME ? '+' : '-',
            iconIsImage: isImg,
            categoryIcon: isImg && b.categoryIcon.indexOf(config.uploadPath) === 0 ? config.url + b.categoryIcon : b.categoryIcon
          }
          const arr = groupMap.get(bill.billDate) || []
          arr.push(bill)
          groupMap.set(bill.billDate, arr)
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

  onFilterTabChange(e: WechatMiniprogram.CustomEvent) {
    const idx = e.detail.index as number
    const types = [BillType.EXPENSE, BillType.INCOME]
    this.setData({ activeTab: idx, filterType: types[idx] })
    this.loadData()
  },

  onDatePrev() {
    const d = new Date(this.data.filterYear, this.data.filterMonth - 1, this.data.filterDay)
    d.setDate(d.getDate() - 1)
    this.setData({
      filterDate: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
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
      filterDate: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
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
    const val = new Date(e.detail as unknown as number)
    const y = val.getFullYear()
    const m = val.getMonth() + 1
    const d = val.getDate()
    const dateStr = y + '-' + pad(m) + '-' + pad(d)
    this.setData({
      filterDate: dateStr,
      filterYear: y,
      filterMonth: m,
      filterDay: d,
      showDatePicker: false
    })
    this.loadData()
  },

  onAddBill() {
    isLogin(true).then(() => {
      debounceNavigateTo('bill-form', 'date=' + this.data.filterDate)
    }).catch(() => {
      wxSwitchTab('setting')
    })
  },

  onEditBill(e: WechatMiniprogram.CustomEvent) {
    const bill = e.currentTarget.dataset.bill as BillVO
    isLogin(true).then(() => {
      debounceNavigateTo('bill-form', 'id=' + bill.id)
    }).catch(() => {
      wxSwitchTab('setting')
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
      path: '/pages/bill/index'
    }
  }
})
