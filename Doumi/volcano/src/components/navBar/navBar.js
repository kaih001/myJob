// eslint-disable-next-line no-unused-vars
import { util, api, app } from '../../allJS.js'

Component({
  properties: {
    // title值
    title: {
      type: String,
      value: ''
    },
    // 是否显示返回按钮
    backShow: {
      type: String,
      value: false
    },
    // 自定义返回页
    toPath: {
      type: String,
      value: ''
    },
  },
  data: {
    // title是否居中
    titleInCenter: false,
    // 整个头部高度
    navbarStyle: '',
    // 状态栏高度
    statusBarHeight: '',
  },
  attached () {
    // 判断title是否居中
    if (wx.getSystemInfoSync().platform === 'ios') {
      this.setData({
        titleInCenter: true
      })
    }
    let menuButton = wx.getMenuButtonBoundingClientRect()
    // 设置样式
    wx.getSystemInfo({
      success: res => {
        this.setData({
          navbarStyle: `height:${menuButton.bottom + menuButton.top - res.statusBarHeight}px`,
          statusBarHeight: `height:${menuButton.top}px`
        })
      }
    })
  },
  methods: {
    back () {
      // 获取当前页面栈
      const pages = getCurrentPages()
      // 场景值用于判断是否是由分享或消息模版进入
      const { scene } = wx.getLaunchOptionsSync()
      const isShareOrTpl = scene === 1007 || scene === 1008 || scene === 1014 || scene === 1129
      let toUrl = ''

      // 返回按钮所跳转的路径
      if (this.data.toPath) {
        toUrl = this.data.toPath// 如果设置自定义返回路径则返回此路径
      } else if (pages.length === 1 && (isShareOrTpl || pages[0].options.route !== 'pages/index/index')) {
        // 如果此页由分享或消息模版进入,或此页为本用户分享并未close进程进入,返回到首页
        toUrl = '/pages/index/index'
      }

      if (toUrl) {
        wx.reLaunch({
          url: toUrl
        })
      } else {
        wx.navigateBack({
          delta: 1
        })
      }
      // 埋点
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5@ca_from=return`
      )
    }
  }
})