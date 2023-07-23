import JSEncrypt from './encrypt/jsencrypt'
import { PUBLIC_KEY } from './encrypt/crypt-key'
import config from '../config.js'
import api from './api.js'
import { ApiVersion } from './version'
import { md5 } from './encrypt/md5'
import globalDataStore from '~/store/globalData'

const RSA = new JSEncrypt()
RSA.setPublicKey(PUBLIC_KEY)

export const isType = (o, t) => Object.prototype.toString.call(o) === `[object ${t}]`
export const isObject = o => isType(o, 'Object')
export const isString = o => isType(o, 'String')
export const isArray = o => isType(o, 'Array')
export const $ = (selector, { isAll = false, context = wx } = {}) => {
  const query = context.createSelectorQuery()
  const arg = { rect: true, size: true, dataset: true }
  return new Promise((resolve, reject) => {
    try {
      const done = context => resolve(context)
      // @see https://developers.weixin.qq.com/miniprogram/dev/api/NodesRef.fields.html
      isAll
        ? query.selectAll(selector).fields(arg, done).exec()
        : query.select(selector).fields(arg, done).exec()
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * JSON格式转URL参数格式
 * @param {String} baseUrl - 基于此URL拼接(可选)
 * @param {Object} obj     - 需要转的JSON对象
 */
const obj2uri = (baseUrl, obj) => {
  if (isObject(baseUrl)) {
    obj = baseUrl
    baseUrl = ''
  } else {
    baseUrl += '?'
  }

  for (let k in obj) {
    baseUrl += k + '=' + obj[k] + '&'
  }
  return baseUrl.substr(0, baseUrl.length - 1)
}

/**
 * 获取登录态信息
 */
const getStorage = callback => {
  let header = {}
  wx.getStorage({
    key: 'loginInfo',
    success (res) {
      if (res && res.data && res.data.Cookie) {
        const caSource = api.getCasource()
        header.cookie = `${res.data.Cookie}; dm_fm=${caSource}; `
      }
      callback(header)
    },
    fail (res) {
      callback(header)
    }
  })
}

const getRequestBaseUrl = () => {
  const envFlag = wx.getStorageSync('envFlag')
  if (envFlag === 0) {
    return config.TestAPI
  } else if (envFlag === 1) {
    return config.SimAPI
  }
  return config.OnlineAPI
}

/**
 * 奖金专用接口请求方法 - POST
 */
const requestByPost = (
  url,
  params,
  showloading,
  callbacksuccess,
  callbackfail
) => {
  // 奖金专用接口请求方法
  if (showloading) {
    wx.showToast({
      icon: 'loading',
      title: '加载中...',
      mask: true
    })
  }

  const { ROP_HOST_URL } = getRequestBaseUrl()
  const { Cookie } = wx.getStorageSync('loginInfo')

  wx.request({
    // weixinxcx
    url: ROP_HOST_URL + url,
    data: params,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie
    },
    method: 'POST',
    success: res => {
      if (showloading) {
        wx.hideToast()
      }
      if (res.data.code !== undefined) {
        if (res.data.code !== -200) {
          if (typeof callbacksuccess === 'function') callbacksuccess(res)
        } else {
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }
      }
    },
    fail (err) {
      wx.showToast({
        title: '网络连接失败',
        icon: 'none',
        mask: true,
        duration: 1500
      })
      if (typeof callbackfail === 'function') callbackfail(err)
    }
  })
}

/**
 * 奖金专用接口请求方法 - GET
 */
const requestByGet = (
  url,
  params,
  showloading,
  callbacksuccess,
  callbackfail
) => {
  // 奖金专用接口请求方法
  if (showloading) {
    wx.showToast({
      icon: 'loading',
      title: '加载中...',
      mask: true
    })
  }

  const { ROP_HOST_URL } = getRequestBaseUrl()
  const { Cookie } = wx.getStorageSync('loginInfo')

  wx.request({
    url: ROP_HOST_URL + url,
    data: params,
    header: {
      'Content-Type': 'application/json',
      Cookie
    },
    success: res => {
      if (showloading) {
        wx.hideToast()
      }
      if (res.data.code !== undefined) {
        if (res.data.code !== -200) {
          if (typeof callbacksuccess === 'function') callbacksuccess(res)
        } else {
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      }
    },
    fail (err) {
      wx.showToast({
        title: '网络连接失败',
        icon: 'none',
        mask: true,
        duration: 1500
      })
      if (typeof callbackfail === 'function') callbackfail(err)
    }
  })
}

/**
 * toast提示
 * content 提示内容
 */
const showToast = (content, opts = {}) => {
  return new Promise((resolve, reject) => {
    opts = Object.assign(opts, {
      title: '提示',
      content,
      success (res) {
        resolve(res)
        if (res.confirm) {
          // - 用户点击确定
        } else if (res.cancel) {
          // - 用户点击取消
        }
      },
      fail (err) {
        reject(err)
      }
    })
    wx.showModal(opts)
  })
}

/**
 * 网络请求
 * @param {String} url - 请求地址
 * @param {Object?} param - 请求参数
 * @param {String?} method - 请求方式 `POST` | `GET`
 * @param {String?} cookie - 需要额外携带的 `Cookie` 信息
 */
const getData = (url, param, method = 'GET', cookie) => {
  if (!param) param = {}
  param.version = 'v3'

  const token = JSON.stringify({
    doumi_wechat_mini_program_api_token: ~~(Date.now() / 1000)
  })
  let header = {
    Accept: `application/vnd.app.v${ApiVersion}+json`,
    token: RSA.encrypt(token),
    uuid: wx.getStorageSync('uuid'),
    cookie: ''
  }

  return new Promise((resolve, reject) => {
    getStorage(res => {
      if (res && res.cookie) {
        header = { ...header, ...res }
      }
      if (cookie) {
        header.cookie += cookie
      }

      let hostUrl = getRequestBaseUrl().HOST_URL

      if (url.match(/^(http|https):/)) {
        hostUrl = ''
      }

      // console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeee',hostUrl + url);

      wx.getNetworkType({
        success (res) {
          // 返回网络类型, 有效值：
          // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
          if (res.networkType !== 'none') {
            wx.request({
              url: hostUrl + url,
              data: param,
              method,
              header,
              success (res) {
                if (
                  res &&
                  res.data &&
                  (res.data.code === -100 || res.data.code === -200)
                ) {
                  let list = getCurrentPages()
                  let current = list[list.length - 1]
                  clearCookie()
                  wx.navigateTo({
                    url: '/pages/login/login?from=' + current.route.split('/')[1]
                  })
                } else {
                  resolve(res)
                }
              },
              fail (res) {
                hideLoading()
                reject(res)
              }
            })
          } else {
            hideLoading()
            reject('offline')
          }
        },
        fail: res => {
          hideLoading()
          reject(res)
        }
      })
    })
  })
}

/**
 * 微信状态栏高度
 */
const wxStatusBarHeight = () => {
  try {
    const systemInfo = wx.getSystemInfoSync()
    const model = systemInfo.model
    const isIpx = model.search('iPhone X') !== -1
    globalDataStore.commit('setIsIpx', isIpx)
    return systemInfo.statusBarHeight || 0
  } catch (err) {
    console.error('util.wxStatusBarHeight', err)
  }
}

/**
 * 微信标题栏高度
 */
const wxNavBarHeight = () => {
  try {
    if (__mpx_mode__ === 'ali') {
      return wx.getSystemInfoSync().titleBarHeight || 0
    } else {
      const rect = wx.getMenuButtonBoundingClientRect
        ? wx.getMenuButtonBoundingClientRect()
        : null
      const gap = rect.top - wxStatusBarHeight()
      return 2 * gap + rect.height
    }
  } catch (err) {
    console.error('util.wxNavBarHeight', err)
    // Do something when catch error
  }
}

const shara = (res, callBack) => {
  let list = getCurrentPages()
  let current = list[list.length - 1]
  let options = current.options
  let param = ''
  if (options) {
    for (let key in options) {
      param += param ? `&${key}=${options[key]}` : `${key}=${options[key]}`
    }
  }
  if (!!res && res.from === 'button') {
    // 来自页面内转发按钮
    // console.log(res.target)
  }
  param+=`&invite_code=${res.invite_code}`
  console.log('pathhhhhhhhhhhhh',current.route + '?' + param);
  return {
    title: '靠谱高薪兼职 尽在斗米',
    path: current.route + '?' + param,
    success (res) {
      // 转发成功
      typeof callBack === 'function' && callBack('success')
    },
    fail (res) {
      // 转发失败
      typeof callBack === 'function' && callBack('fail')
    }
  }
}

/**
 * 比较两个时间的大小
 * @param {String} time1 - 时间一
 * @param {String} time2 - 时间二
 */
const compareTime = (time1, time2) => {
  let dateA = new Date('1900/1/1 ' + time1)
  let dateB = new Date('1900/1/1 ' + time2)
  if (isNaN(dateA) || isNaN(dateB)) {
    return null
  }
  if (dateA > dateB) {
    return 1
  }
  if (dateA < dateB) {
    return -1
  }
  return 0
}

/**
 * 返回两个经纬度坐标之间的距离
 * @param {Object} point1 坐标1 & point2 坐标2
 * @return {Number} 如果time1>time2 返回1，如果time1<time2返回-1，相等返回0
 */
const getDistance = (point1, point2) => {
  var toRadians = function (d) {
    return (d * Math.PI) / 180
  }
  let dis = 0
  let radLat1 = toRadians(point1.lat)
  let radLat2 = toRadians(point2.lat)
  let deltaLat = radLat1 - radLat2
  let deltaLng = toRadians(point1.lng) - toRadians(point2.lng)
  dis =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(deltaLat / 2), 2) +
          Math.cos(radLat1) *
            Math.cos(radLat2) *
            Math.pow(Math.sin(deltaLng / 2), 2)
      )
    )
  return dis * 6378137 // 取WGS84标准参考椭球中的地球长半径(单位:m)
}

/**
 * 缓存登录信息
 */
const setCookie = cookie => {
  let cookieStorage = []
  let list = []
  let userId = wx.getStorageSync('userId')

  cookie.split(';').forEach(item => {
    if (
      item.indexOf('ganji_jz_wc_jzuid') >= 0 ||
      item.indexOf('doumi_melon') >= 0 ||
      item.indexOf('dm_userinfo') >= 0
    ) {
      if (item.indexOf('doumi_melon') >= 0) {
        item = item.split(',')[1] || item
      }
      list.push(item)
    }
  })

  cookieStorage = list.join(';')
  wx.setStorageSync('loginInfo', {
    userId,
    login_status: userId !== '' && userId >= 0,
    Cookie: cookieStorage
  })
}

/**
 * 登陆授权后埋点，并保存登录态
 */
const getUserInfoLog = (e, app, callback) => {
  // 根据iv判断用户是都点击了授权按钮
  if (e.detail.iv) {
    // 授权
    // 首页授权允许ev埋点 DMC-3304
    api.setLog(
      2,
      `@atype=click@ca_name=doumi@ca_source=h5@ca_from=allow_unionid`
    )
    app.login().then(callback)
  } else {
    // 拒绝授权
    // 首页授拒绝ev埋点 DMC-3304
    typeof callback === 'function' && callback('fail')
    api.setLog(
      2,
      `@atype=click@ca_name=doumi@ca_source=h5@ca_from=refuse_unionid`
    )
  }
}

/**
 * 清除登录信息
 */
const clearCookie = () => {
  wx.removeStorage({
    key: 'loginInfo',
    success (res) {}
  })
}

/**
 * 下载文件
 * @param {String} url - 下载地址
 * @param {Function} callbacksuccess - 成功回调
 * @param {Function} callbackfail - 失败回调
 */
const downFile = (url, callbacksuccess, callbackfail) => {
  wx.downloadFile({
    url,
    success (res) {
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success (res) {
          if (typeof callbacksuccess === 'function') callbacksuccess(res)
        },
        fail (res) {
          if (typeof callbackfail === 'function') callbackfail(res)
        }
      })
    },
    fail (err) {
      if (typeof callbackfail === 'function') callbackfail(err)
    }
  })
}

/**
 * 关闭loading
 */
const hideLoading = () => {
  if (wx.hideLoading) {
    wx.hideLoading()
  }
}

/**
 * 展示loading
 */
const showLoading = (title = '加载中') => {
  if (wx.showLoading) {
    wx.showLoading({ title, mask: true })
  }
}

/**
 * 将距离值转换为带单位的文字
 * @param {Number} distance - 距离值(m)
 */
const transfromDistance = distance => {
  if (distance !== -1) {
    if (distance < 1000) {
      distance = `${parseInt(distance)}m`
    } else if (distance > 1000 * 50) {
      distance = `>50km`
    } else {
      distance = `${(distance / 1000).toFixed(1)}km`
    }
  }
  return distance
}

/**
 * 获取 url 中 `query` 部分指定字段的值
 * @param {String} query - query(比如id=1&jobType=12)
 * @param {String} field - 字段名字
 */
export const getQueryFieldVal = (query, field) => {
  const reg = new RegExp(`(^|&)${field}=([^&]*)(&|$)`, 'i').exec(query)
  return reg ? reg[2] : ''
}

/**
 * 用于解析小程序二维码后面 `scene` 参数
 * 服务端生成二维码时可能会 `encodeURIComponent` 一次
 * 微信那边也 `encodeURIComponent` 一次
 * 这里多次解析防止参数解析不出来
 */

export const decodeURI = str => {
  str = decodeURIComponent(str)
  str = decodeURIComponent(str)
  str = decodeURIComponent(str)
  return str
}

/**
 * 检查上一层页面是否有回调函数并调用
 */
export const CCCallFuncN = () => {
  const curPage = getCurrentPage()
  const prevPage = getPrevPage()
  const { callbackName } = curPage.options
  callbackName && prevPage[callbackName]() // - 调用上个页面传过来的回调方法
}

/**
 * 拨打投诉电话
 * @param {string} content - 提示标题
 * @param {function} callback - 回调
 * @param {string} telNum - 电话号
 */
export const telPhone = (content, callback, telNum) => {
  let telNumber = telNum || '4007333300'
  wx.showModal({
    title: content,
    content: telNumber,
    confirmText: '拨打电话',
    cancelText: '取消',
    success (res) {
      if (res.confirm) {
        wx.makePhoneCall({ phoneNumber: telNumber })
        typeof callback === 'function' && callback('confirm')
      } else {
        // console.log('用户点击辅助操作')
        typeof callback === 'function' && callback('cancle')
      }
    }
  })
}

/**
 * 获取当前页面的实例
 */
export const getCurrentPage = () => {
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

/**
 * 获取上一个页面的实例
 */
export const getPrevPage = () => {
  const pages = getCurrentPages()
  return pages[pages.length - 2]
}

/**
 * @desc 节流函数，对于想控制一些触发频率较高的事件有帮助
 *       创建并返回一个像节流阀一样的函数，当重复调用函数的时候，至少每隔 `wait` 毫秒调用一次该函数
 *       默认情况下，throttle将在你调用的第一时间尽快执行这个function，并且，如果你在 `wait` 周期内调用任意次数的函数，都将尽快的被覆盖。
 *       如果你想禁用第一次首先执行的话，传递{leading: false}，还有如果你想禁用最后一次执行的话，传递{trailing: false}。
 * @param {function} func 目标函数
 * @param {number} wait 延迟执行毫秒数
 * @param {object} options
 * ├──@prop {boolean?} leading - 是否在开始前执行一次
 * ├──@prop {boolean?} trailing - 是否在时间结束后执行
 */
export const throttle = (func, wait, options) => {
  let timeout, context, args, result
  let previous = 0
  if (!options) options = {}

  const later = function () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }

  const throttled = function (..._args) {
    const now = Date.now()
    if (!previous && options.leading === false) previous = now
    const remaining = wait - (now - previous)
    context = this
    args = _args
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }

  throttled.cancel = function () {
    clearTimeout(timeout)
    previous = 0
    timeout = context = args = null
  }

  return throttled
}

/**
 * @desc 函数防抖
 * @param {function} func 目标函数
 * @param {number} wait 延迟执行毫秒数
 * @param {boolean} immediate true - 立即执行， false - 延迟执行
 */
export const debounce = (func, wait, immediate) => {
  let timer
  return function (...args) {
    const context = this

    if (timer) clearTimeout(timer)
    if (immediate) {
      let callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, wait)
      if (callNow) func.apply(context, args)
    } else {
      timer = setTimeout(() => {
        func.apply(context, args)
      }, wait)
    }
  }
}

/**
 * 网络请求
 * @param {String} url - 请求地址
 * @param {String} filePath - 要上传文件资源的路径
 * @param {String} name - 文件对应的 key
 * @param {String} cookie - 需要额外携带的 `Cookie` 信息
 * @param {Object} formData - HTTP 请求中其他额外的 form data
 * @param {Number} timeout - 超时时间，单位为毫秒
 */
const uploadFile = (url, filePath, name, cookie, formData = {}, timeout = 60000) => {
  const token = JSON.stringify({
    doumi_wechat_mini_program_api_token: ~~(Date.now() / 1000)
  })
  let header = {
    Accept: `application/vnd.app.v${ApiVersion}+json`,
    token: RSA.encrypt(token),
    uuid: wx.getStorageSync('uuid'),
    cookie: ''
  }
  return new Promise((resolve, reject) => {
    getStorage(res => {
      if (res && res.cookie) {
        header = { ...header, ...res }
      }
      if (cookie) {
        header.cookie += cookie
      }

      let hostUrl = getRequestBaseUrl().HOST_URL

      if (url.match(/^(http|https):/)) {
        hostUrl = ''
      }
      wx.getNetworkType({
        success (res) {
          // 返回网络类型, 有效值：
          // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
          if (res.networkType !== 'none') {
            wx.uploadFile({
              url: hostUrl + url,
              filePath,
              name,
              header,
              formData,
              timeout,
              success (res) {
                console.log(res, '上传图片 success')
                resolve(res)
              },
              fail (err) {
                console.log(err, '上传图片 fail')
                hideLoading()
                reject(err)
              }
            })
          } else {
            hideLoading()
            reject('offline')
          }
        },
        fail: res => {
          hideLoading()
          reject(res)
        }
      })
    })
  })
}

export default {
  isObject,
  isString,
  isArray,
  obj2uri,
  getUserInfoLog,
  getStorage,
  requestByPost,
  requestByGet,
  getData,
  showToast,
  wxStatusBarHeight,
  wxNavBarHeight,
  shara,
  compareTime,
  downFile,
  getDistance,
  setCookie,
  md5,
  clearCookie,
  hideLoading,
  showLoading,
  transfromDistance,
  getQueryFieldVal,
  decodeURI,
  CCCallFuncN,
  telPhone,
  getCurrentPage,
  getPrevPage,
  throttle,
  debounce,
  getRequestBaseUrl,
  uploadFile
}
