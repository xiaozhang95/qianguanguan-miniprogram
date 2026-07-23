Component({
  properties: {
    tabs: { type: Array, value: [] },
    activeIndex: { type: Number, value: 0 }
  },
  methods: {
    onChange(e: WechatMiniprogram.CustomEvent) {
      const idx = Number(e.currentTarget.dataset.idx)
      if (idx !== this.data.activeIndex) {
        this.triggerEvent('change', { index: idx })
      }
    }
  }
})
