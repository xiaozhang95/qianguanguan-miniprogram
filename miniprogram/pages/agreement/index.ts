import { wxNavigateBack } from '../../utils/wx'

const { globalData } = getApp()

Page({
  data: {
    app: globalData as { offsetTop: number; capsuleTop: number },
    activeTab: 0
  },
  onLoad(options: { tab?: string }) {
    if (options.tab === 'privacy') {
      this.setData({ activeTab: 1 })
    }
  },
  onTabChange(e: WechatMiniprogram.CustomEvent<{ index: number }>) {
    this.setData({ activeTab: e.detail.index })
  },
  handleBack() {
    wxNavigateBack()
  },
  onPageScroll(e: { scrollTop: number }) {
    const nav = this.selectComponent('#fixed-nav')
    if (nav) nav.onPageScroll(e)
  },
  onShareAppMessage() {
    return {
      title: '钱罐罐记账 - 好好记账，天天向上',
      path: '/pages/bill/index'
    }
  }
})
