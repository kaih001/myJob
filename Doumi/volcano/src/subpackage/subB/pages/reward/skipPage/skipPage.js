import { util, api } from '../../../../../allJS.js'
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({ callbackName }) {
    if (callbackName) this.setData({ callbackName })
    console.log(this.data.callbackName)
  },

  /**
   * 用户信息授权
   */
  bindGetUserInfo (e) {
    // e.detail = { detail: e.detail }
    // var info = {
    //   encryptedData: e.detail.detail.encryptedData,
    //   iv: e.detail.detail.iv
    // }
    const info = {
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    }
    if (info.encryptedData === undefined || info.iv === undefined) {
      wx.showToast({
        title: '登录失败，请重新授权',
        icon: 'none'
      })
      return
    }
    util.getUserInfoLog(e, app, () => {
      console.log('授权成功！！！')
      const { callbackName } = this.data
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2] // - 拿到上一个页面的实例
      // 授权成功跳转逻辑
      wx.navigateBack({
        delta: 1,
        success: () => {
          callbackName && prevPage[callbackName]() // - 调用上个页面传过来的回调方法
        }
      })
    })
  }
})
