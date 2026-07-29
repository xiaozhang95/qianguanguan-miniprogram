const env = wx.getAccountInfoSync().miniProgram.envVersion

const config: Config = {
  develop: {
    baseUrl: '/api/business',
    // url: 'http://localhost:8888',
    url: 'http://192.168.1.8:8888',
    // url: 'https://www.qianguanguan.top',
    uploadPath: '/upload/'
  },
  trial: {
    baseUrl: '/api/business',
    url: 'https://www.qianguanguan.top',
    uploadPath: '/upload/'
  },
  release: {
    baseUrl: '/api/business',
    url: 'https://www.qianguanguan.top',
    uploadPath: '/upload/'
  }
}

export default config[env]
