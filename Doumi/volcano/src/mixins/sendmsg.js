import util from '~/utils/util'

export default {
  data: {
    msgId: ['hlgdHOVt-6je729GVIBeXOePhmr7h698W98R-kFN4xc', 'nYLek2z_A3BnUaIZh8ScHRRFyCmcoUlWj5Mc8Gp_cA4']
  },

  methods: {
    /**
*
* @param {Array} msgId 发送的订阅消息ID
*/
    isShowSendMsg (msgId) {
      // const time = new Date().getDate()
      // try {
      // if (mpx.getStorageSync('hasSendMsg') !== time) {
      // this.__sendMsg(time, msgId)
      // }
      // } catch (err) {
      // console.log(msgId)
      console.log('2345678987654345678')
      this.sendMsg(msgId)
      // }
    },
    // 唤起消息确认框
    sendMsg (msgId) {
      console.log(msgId)
      // wx.setStorageSync('hasSendMsg', time)
      wx.requestSubscribeMessage({
        tmplIds: msgId,
        success (res) {
          console.log('-----------------')
          util.showToast(res.errMsg)
          console.log(res)
        },
        fail (res) {
          console.log('==================')
          console.log(res)
          util.showToast(res.errMsg)
        }
      })
    }

  }
}