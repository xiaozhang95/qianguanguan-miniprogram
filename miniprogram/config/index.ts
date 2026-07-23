const env = wx.getAccountInfoSync().miniProgram.envVersion

const config: Config = {
  develop: {
    baseUrl: '/api/business',
    url: 'http://192.168.1.8:8888'
  },
  trial: {
    baseUrl: '/api/business',
    url: 'http://47.108.152.97:8888'
  },
  release: {
    baseUrl: '/api/business',
    url: 'http://47.108.152.97:8888'
  }
}

export default config[env]
