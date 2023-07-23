import { createStore } from '@mpxjs/core'

export default createStore({
  state: {
    isIpx: false, // 是否为 iPhone X
    isAuthWechat: null, // 是否微信头像昵称授权过
    isAuthAli: null, // 是否支付宝头像昵称授权过
    isBindPhone: null, // 是否手机号授权 || 是否登录
    isJumpBasicInfo: false, // 是否跳转过补充简历页
    userInfo: null,
    avatar: 'https://cdn.doumistatic.com/209,01af1fc3935f9c8e.png',
    nickName: '',
    score: '0', // 积分
    wallet: '10000.56', // 钱包余额
    scene: '',
    fromMinePage: false, // 在我的页面点击了首页 加埋点用
    showSwitchEnvBtn: false,
    openId: '',
    reqid: '-',
    fromPage: '', // 上一页是哪页
    expectRegion: {
      // 偏好区域
      value: {},
      text: ''
    },
    expectPost: {
      // 期望职位
      value: [],
      text: ''
    }
  },
  getters: {},
  mutations: {
    // 全局设置openId
    setOpenId (state, openId) {
      state.openId = openId
    },
    setUserInfo (state, userInfo) {
      state.userInfo = userInfo
    },
    setShowSwitchEnvBtn (state, env) {
      state.showSwitchEnvBtn = env
    },
    setFromMinePage (state, flag) {
      state.fromMinePage = flag
    },
    setExpectPost (state, expectPost) {
      state.expectPost = expectPost
    },
    setIsIpx (state, isIpx) {
      state.isIpx = isIpx
    },
    setIsJumpBasicInfo (state, isJumpBasicInfo) {
      state.isJumpBasicInfo = isJumpBasicInfo
    },
    updateLoginStatus (state) {
      const userId = wx.getStorageSync('userId')
      state.isAuthWechat = state.isAuthAli = userId !== null && userId >= 0
      state.isBindPhone = userId > 0
    },
    setAvatarAndNickName (state, obj) {
      state.avatar = obj.avatar || state.avatar
      state.nickName = obj.nick_name || ''
      state.score = obj.score || ''
    },
    setFromPage (state, fromPage) {
      state.fromPage = fromPage
    }
  }
})