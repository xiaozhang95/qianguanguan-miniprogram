import { wxNavigateBack } from '../../utils/wx'

const { globalData } = getApp()

Page({
  data: {
    app: globalData,
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
  }
})
