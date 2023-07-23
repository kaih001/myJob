import { api } from '../../../../allJS.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    webUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    // DMC-3413 pv埋点
    api.setLog(1, '/jianzhi/wap')
    let webUrl = decodeURIComponent(options.webUrl)
    if (options.webUrl) {
      if (webUrl.indexOf('?') !== -1) {
        webUrl += '&browserType=miniprogram'
      } else {
        webUrl += '?browserType=miniprogram'
      }
      webUrl = this.replaceUrlParam(webUrl, 'from', api.getCasource())
    } else {
      throw new Error('webPage组件没有传递webUrl参数')
    }
    // console.log('最终链接:', webUrl)
    this.setData({ webUrl })
  },

  /**
   * 该方法仅适用于替换from参数（ca_source），
   * 用于替换from参数
   * 例如：输入('url?from=1111','from','xxx')
   *      输出  url?from=xxx_1111
   */
  replaceUrlParam (url, parm, value) {
    if (!url && !parm && !value) {
      throw new Error('请输入正确的参数')
    }
    var test = url
    var name = parm
    test = test.split('?')
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
    if (reg.test(test[1])) {
      test[1] = test[1].replace(
        reg,
        `${reg.exec(test[1])[1]}${name + '=' + value}_${reg.exec(test[1])[2]}${
          reg.exec(test[1])[3]
        }`
      )
    } else {
      test[1] += `&${name}=${value}`
    }
    return test.join('?')
  }
})
