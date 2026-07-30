import type { IAppOption } from '../../typings'
import { wxNavigateBack } from '../../utils/wx'

Page({
  data: {
    app: {},
    activeTab: 0
  },
  onLoad(options: { tab?: string }) {
    const { globalData } = getApp<IAppOption>()
    this.setData({
      app: globalData,
      activeTab: options.tab === 'privacy' ? 1 : 0
    })
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
