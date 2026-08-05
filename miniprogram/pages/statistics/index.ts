import { billList, billStats, type BillVO } from '../../api/bill'
import { appConfig } from '../../config/index'
import { BillType, Route, routePath } from '../../constants/index'
import type { IAppOption } from '../../typings'
import { fmt, pad } from '../../utils/format'
import { wxGetSystemInfoSync, wxShowShareMenu } from '../../utils/wx'

const EXP_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4']
const INC_COLORS = ['#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899']

function buildConic(items: { percent: number; color: string }[]): string {
  if (items.length === 0) return ''
  let cum = 0
  const parts = items.map((item) => {
    const p = Math.max(item.percent, 0.5)
    const start = cum
    cum += item.percent
    const end = start + p
    return `${item.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`
  })
  return `conic-gradient(${parts.join(',')})`
}

interface PieItem {
  name: string
  valueStr: string
  percent: number
  color: string
}

Page({
  data: {
    filterYear: new Date().getFullYear(),
    filterMonth: new Date().getMonth() + 1,
    showPicker: false,
    currentDate: Date.now(),
    minDate: new Date(2020, 0).getTime(),
    maxDate: new Date(2099, 11, 31).getTime(),
    expenseStr: '0.00',
    incomeStr: '0.00',
    balanceStr: '0.00',
    chartData: [] as { date: string; incomeBar: number; expenseBar: number }[],
    incomePie: [] as PieItem[],
    expensePie: [] as PieItem[],
    expenseConic: '',
    incomeConic: '',
    hasChart: false,
    hasIncomePie: false,
    hasExpensePie: false,
    chartScrollLeft: 0,
    isScrolled: false,
    loading: false,
    app: {}
  },
  onShareAppMessage() {
    return {
      title: appConfig.shareTitle,
      path: routePath(Route.STATISTICS),
      imageUrl: appConfig.shareImage
    }
  },

  onLoad() {
    wxShowShareMenu()
  },

  onShow() {
    const { globalData } = getApp<IAppOption>()
    this.setData({ app: globalData, isScrolled: false })
    this.loadData()
  },

  onHide() {
    this.setData({ isScrolled: false })
  },

  loadData() {
    const { filterYear: year, filterMonth: month } = this.data
    const yearStr = String(year)
    const monthStr = String(month)

    const daysInMonth = new Date(year, month, 0).getDate()
    const startDate = `${year}-${pad(month)}-01`
    const endDate = `${year}-${pad(month)}-${pad(daysInMonth)}`

    this.setData({ loading: true })

    Promise.all([billStats(yearStr, monthStr), billList({ startDate, endDate, pageNum: 1, pageSize: daysInMonth * 2 })])
      .then(([statsRes, listRes]) => {
        const stats = statsRes.data
        const records = listRes.data.records || []

        this.setData({
          expenseStr: fmt(stats.totalExpense),
          incomeStr: fmt(stats.totalIncome),
          balanceStr: fmt(stats.balance),
          balanceClass: stats.balance < 0 ? 'balance-negative' : stats.balance > 0 ? 'balance-positive' : 'balance-zero'
        })

        const dailyMap = new Map<string, { income: number; expense: number }>()
        for (let i = 1; i <= daysInMonth; i++) {
          const d = `${year}-${pad(month)}-${pad(i)}`
          dailyMap.set(d, { income: 0, expense: 0 })
        }

        records.forEach((b: BillVO) => {
          const entry = dailyMap.get(b.billDate)
          if (entry) {
            if (b.type === BillType.INCOME) entry.income += b.amount
            else entry.expense += b.amount
          }
        })

        const rawChart = Array.from(dailyMap.entries()).map(([date, v]) => ({
          date: date.slice(-2) + '日',
          income: v.income,
          expense: v.expense
        }))

        const maxVal = Math.max(...rawChart.map((d) => Math.max(d.income, d.expense)), 1)

        const chartData = rawChart.map((d) => ({
          date: d.date,
          incomeBar: Math.round((d.income / maxVal) * 160),
          expenseBar: Math.round((d.expense / maxVal) * 160)
        }))

        const hasChart = rawChart.some((d) => d.income > 0 || d.expense > 0)

        const incomeMap = new Map<string, number>()
        const expenseMap = new Map<string, number>()
        records.forEach((b: BillVO) => {
          if (b.type === BillType.INCOME) {
            incomeMap.set(b.categoryName, (incomeMap.get(b.categoryName) || 0) + b.amount)
          } else {
            expenseMap.set(b.categoryName, (expenseMap.get(b.categoryName) || 0) + b.amount)
          }
        })

        const totalIncome = stats.totalIncome
        const totalExpense = stats.totalExpense

        const incomePie: PieItem[] = Array.from(incomeMap.entries())
          .map(([name, value], i) => ({
            name,
            valueStr: fmt(value),
            percent: totalIncome > 0 ? (value / totalIncome) * 100 : 0,
            color: INC_COLORS[i % INC_COLORS.length]
          }))
          .sort((a, b) => b.percent - a.percent)

        const expensePie: PieItem[] = Array.from(expenseMap.entries())
          .map(([name, value], i) => ({
            name,
            valueStr: fmt(value),
            percent: totalExpense > 0 ? (value / totalExpense) * 100 : 0,
            color: EXP_COLORS[i % EXP_COLORS.length]
          }))
          .sort((a, b) => b.percent - a.percent)

        const now = new Date()
        const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month
        const rpxRate = wxGetSystemInfoSync().windowWidth / 750
        const chartScrollLeft = isCurrentMonth ? Math.max(0, (now.getDate() - 1) * 68 * rpxRate) : 0

        this.setData({
          chartData,
          incomePie,
          expensePie,
          expenseConic: buildConic(expensePie),
          incomeConic: buildConic(incomePie),
          hasChart,
          hasIncomePie: incomePie.length > 0,
          hasExpensePie: expensePie.length > 0,
          chartScrollLeft,
          loading: false
        })
      })
      .catch(() => {
        this.setData({ loading: false })
      })
  },

  onMonthConfirm(e: WechatMiniprogram.CustomEvent) {
    const val = new Date(e.detail as unknown as number)
    this.setData({
      filterYear: val.getFullYear(),
      filterMonth: val.getMonth() + 1,
      currentDate: e.detail as unknown as number,
      showPicker: false
    })
    this.loadData()
  },

  onMonthPrev() {
    let { filterYear, filterMonth } = this.data
    if (filterMonth === 1) {
      filterYear--
      filterMonth = 12
    } else {
      filterMonth--
    }
    this.setData({ filterYear, filterMonth })
    this.loadData()
  },

  onMonthNext() {
    let { filterYear, filterMonth } = this.data
    if (filterMonth === 12) {
      filterYear++
      filterMonth = 1
    } else {
      filterMonth++
    }
    this.setData({ filterYear, filterMonth })
    this.loadData()
  },

  onPickerOpen() {
    const { filterYear, filterMonth } = this.data
    this.setData({
      showPicker: true,
      currentDate: new Date(filterYear, filterMonth - 1, 1).getTime()
    })
  },

  onPickerClose() {
    this.setData({ showPicker: false })
  },

  onPrevent() {
    return
  },

  onPageScroll(e: { scrollTop: number }) {
    const scrolled = e.scrollTop > 40
    if (scrolled !== this.data.isScrolled) {
      this.setData({ isScrolled: scrolled })
    }
    const nav = this.selectComponent('#fixed-nav')
    if (nav) nav.onPageScroll(e)
  }
})
