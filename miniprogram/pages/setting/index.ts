import { billStats } from '../../api/bill'
import { LOGO_BASE64 } from '../../config/logo'
import { wxLogin, wxNavigateTo, wxShowShareMenu, wxShowToast, wxSwitchTab } from '../../utils/wx'

const { globalData, login, exitLogin, isLogin, watch } = getApp()

Page({
  data: {
    LOGO_BASE64,
    stats: {
      income: 0,
      expense: 0
    }
  },
  onLoad() {
    wxShowShareMenu()
    watch((gd: typeof globalData) => {
      this.setData({ app: gd })
      this.loadStats()
    })
  },
  onShow() {
    this.setData({ app: globalData })
    this.loadStats()
  },
  loadStats() {
    isLogin(false)
      .then(() => {
        const now = new Date()
        billStats(String(now.getFullYear()), String(now.getMonth() + 1)).then(({ data }) => {
          this.setData({
            stats: {
              income: data.totalIncome,
              expense: data.totalExpense
            }
          })
        })
      })
      .catch(() => {
        this.setData({
          stats: { income: 0, expense: 0 }
        })
      })
  },
  handleToLogin() {
    wxShowToast({ title: '请求中...', mask: true })
    wxLogin()
      .then((res) => {
        login(res.code)
      })
      .catch(() => {
        wxShowToast({ title: '登录失败' })
      })
  },
  handleToClassification() {
    isLogin().then(() => {
      wxSwitchTab('category')
    }).catch(() => {})
  },
  handleToBook() {
    wxShowToast({ title: '暂未开放' })
  },
  handleToUser() {
    wxNavigateTo('user')
  },
  handleToExitLogin() {
    exitLogin(() => {
      wxShowToast({ title: '已退出登录' })
      this.setData({
        app: globalData,
        stats: { income: 0, expense: 0 }
      })
    })
  },
  onShareAppMessage() {
    return {
      title: '钱罐罐 - 好好记账，天天向上',
      path: '/pages/setting/index'
    }
  }
})
