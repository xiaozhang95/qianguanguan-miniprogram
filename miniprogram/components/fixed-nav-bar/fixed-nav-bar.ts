Component({
  properties: {
    title: { type: String, value: '' },
    app: { type: Object, value: {} }
  },
  data: {
    isScrolled: false
  },
  pageLifetimes: {
    show() {
      this.setData({ isScrolled: false })
    },
    hide() {
      this.setData({ isScrolled: false })
    }
  },
  methods: {
    onPageScroll(e: { scrollTop: number }) {
      const scrolled = e.scrollTop > 40
      if (scrolled !== this.data.isScrolled) {
        this.setData({ isScrolled: scrolled })
      }
    }
  }
})
