const env = wx.getAccountInfoSync().miniProgram.envVersion

const config: Config = {
  develop: {
    baseUrl: '/api/business',
    // url: 'http://localhost:8888',
    url: 'http://192.168.1.8:8888',
    uploadPath: '/upload/'
  },
  trial: {
    baseUrl: '/api/business',
    url: 'http://47.108.152.97:8888',
    uploadPath: '/upload/'
  },
  release: {
    baseUrl: '/api/business',
    url: 'http://47.108.152.97:8888',
    uploadPath: '/upload/'
  }
}

export default config[env]
