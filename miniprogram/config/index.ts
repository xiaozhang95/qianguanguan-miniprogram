const env = wx.getAccountInfoSync().miniProgram.envVersion

export const appConfig = {
  name: '钱罐罐记账',
  slogan: '好好记账，天天向上',
  shareTitle: '钱罐罐记账 - 好好记账，天天向上',
  shareImage: '/assets/logo.png'
} as const

export interface Config {
  [key: string]: {
    baseUrl: string
    url: string
    uploadPath: string
  }
}

const config: Config = {
  develop: {
    baseUrl: '/api/business',
    url: 'http://localhost:8888',
    // url: 'http://192.168.1.8:8888',
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
