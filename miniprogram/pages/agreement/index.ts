import { wxNavigateBack } from '../../utils/wx'
import type { IAppOption } from '../typings'

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
  },
  onShareAppMessage() {
    return {
      title: '钱罐罐记账 - 好好记账，天天向上',
      path: '/pages/bill/index'
    }
  }
})
