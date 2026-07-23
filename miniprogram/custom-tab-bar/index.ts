Component({
  data: {
    active: 0,
    list: [
      {
        text: '首页',
        icon: 'home-o',
        pagePath: '/pages/home/index'
      },
      {
        text: '账单',
        icon: 'balance-list-o',
        pagePath: '/pages/bill/index'
      },
      {
        text: '我的',
        icon: 'user-o',
        pagePath: '/pages/setting/index'
      }
    ]
  },

  methods: {
    onChange(e: WechatMiniprogram.CustomEvent) {
      const idx = e.detail as number
      const pagePath = this.data.list[idx].pagePath
      wx.switchTab({ url: pagePath })
    }
  }
})
