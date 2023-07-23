import { app, api, util } from '../../allJS.js'

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    // 弹窗标题
    title: {
      type: String,
      value: '斗米找工作申请获得您微信绑定的手机号，为您提供更好的服务'
    }
  },
  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    // 弹窗显示控制
    isShow: !false
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
     * 公有方法
     */

    // 隐藏弹框
    hideDialog () {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    // 展示弹框
    showDialog () {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    // 点击 好的
    btn (e) {
      // 隐藏自己的模态款
      this.hideDialog()
    },
    /**
     * 老的手机号授权方式-已替换为公用方法
     */
    getPhoneNumber (e) {
      var that = this
      var info = {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      }
      if (info.encryptedData === undefined || info.iv === undefined) {
        // 埋点
        api.setLog(
          2,
          `@atype=click@ca_source=h5@ca_name=doumi@ca_from=refuse_mobile`
        )
        // 触发拒绝回调
        return false
      }
      wx.login({
        success: function (login) {
          const param = {
            encrypted_data: e.detail.encryptedData,
            iv: e.detail.iv
          }
          const ca_source = api.getCasource()

          util
            .getData(`client/bindmobile`, param, 'POST', `dm_fm=${ca_source}`)
            .then(
              res => {
                if (res.data.code === 1000) {
                  let cookie = res.header['Set-Cookie'] || res.header['set-cookie']
                  wx.setStorageSync('userId', res.data.data.user_id)
                  util.setCookie(cookie)
                  // 埋点
                  api.setLog(
                    2,
                    `@atype=click@ca_source=h5@ca_name=doumi@ca_from=allow_mobile`
                  )
                  that.triggerEvent('allow')
                } else if (res.data.code === 2202) {
                  app.code2login()
                  that.triggerEvent('refuse')
                } else {
                  that.triggerEvent('refuse')
                }
              },
              res => {
                console.log('bindmobile_error', res)
              }
            )
        }
      })
    },

    /**
     * 登录组件手机号授权反馈
     */
    async bindGetPhoneNumberCallBack (e) {
      await app.getPhoneNumber(e)
    }
  }
})
