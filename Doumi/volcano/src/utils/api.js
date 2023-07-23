import { isObject } from './util'
import globalDataStore from '~/store/globalData'

let dmch = ''
let evFrom = ''

const api = {
  /**
   * 更新埋点中的城市信息
   * @param {number} cityId
   */
  setCity (cityId) {
    wx.setStorageSync('cityId', cityId)
  },

  /**
   * 更新埋点中的 ca_source 字段
   * api.setCasource('', options.from); 表示为所有的埋点添加from参数
   * @param {string} scene - 场景值
   * @param {string} from - 来源，表示从哪个合作商跳转到我们的小程序的，比如从淘宝过来的
   */
  setCasource (scene, from) {
    wx.$tracker.setCasource(scene || wx.getLaunchOptionsSync()['scene'], from)
  },

  /**
   * 获取埋点的 ca_source 字段
   */
  getCasource () {
    return wx.$tracker.getCasource()
  },

  /**
   * 获取挂载小程序上的全局埋点实例
   */
  getTracker () {
    return wx.$tracker
  },

  /**
   * 解析ev中 `dmalog` 的值
   * @param {string} dmalog - ev 的 dmalog 字段
   * @return {object} 解析后的返回值为一个[key: value]的对象
   */
  parseDmalog (dmalog) {
    const temp = {}
    dmalog.substr(1).split('@')
      .forEach(x => {
        const current = x.split('=')
        temp[current[0]] = current[1]
      })
    return temp
  },

  /**
   * 发起埋点
   * @param {number} type `1` PV | `2` EV
   * @param {string} dmalog pv的值 | ev的值
   * @param {object} options 附加给埋点请求里需要额外携带的参数
   * @param {boolean} isDeepEvFrom 是否深透传ev的from值, 深透传时 后续流程的所有ev将会被强制替换成成此次from的值
   */
  setLog (type, dmalog, options = {}, isDeepEvFrom = false) {
    const from = wx.$tracker.from

    const check = () => { // - 因埋点的uuid依赖于 openid, 所以 现在等待 openId 获取完成后在发起埋点
      if (globalDataStore.state.openId) {
        if (from) options = isObject(from) ? { ...options, ...from } : { ...options, from } // - 兼容老的埋点方式

        if (+type === 1) { // pv埋点
          wx.setStorageSync('pvPath', dmch = dmalog) // - 保存的pv路径
          wx.$tracker.trackPageView(dmch, options)
        } else { // ev埋点
          dmalog = api.parseDmalog(dmalog)
          if (isDeepEvFrom) evFrom = dmalog.from
          if (evFrom) dmalog.from = evFrom
          wx.$tracker.trackEvent(dmch, { ...options, dmalog })
        }
      } else {
        setTimeout(check, 300)
      }
    }

    check()
  }
}

export default api
