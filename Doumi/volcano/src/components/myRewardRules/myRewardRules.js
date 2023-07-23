import { util, encrypt } from '../../allJS.js'

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {

  },
  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    // 弹窗显示控制
    isShow: !false,
    content: ''
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
     * 公有方法
     */
    // 展示弹框
    showDialog () {
      this.setData({
        isShow: !this.data.isShow
      })
      let url = 'reward'
      let time = new Date().getTime()
      let sStr = time + encrypt.md5('api_rules-opt-ket')
      let sign = encrypt.md5(sStr)
      util.requestByPost(
        url, {
          time: time,
          sign: sign
        }, true, (res) => {
          if (res.data.code === 200) {
            this.setData({
              content: res.data.data
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: res.data.message,
            })
          }
        }, (err) => {}
      )
    },
    close () {
      this.setData({
        isShow: !this.data.isShow
      })
    }
  }
})