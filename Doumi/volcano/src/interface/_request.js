import util from '../utils/util'

let isShowError = false
let isShowLoading = false

/**
 * 通用请求框架
 * @param {array} args - util.getData 的四个参数
 * ├──@prop {string} url - 请求地址
 * ├──@prop {object?} params - 请求参数
 * ├──@prop {string?} method - 请求方法 默认 GET
 * ├──@prop {string?} cookie - 额外携带的cookie信息
 * @return {promise<any>}
 */
export const request = async (...args) => {
  const _isShowError = isShowError
  const _isShowLoading = isShowLoading
  isShowError = isShowLoading = false
  if (_isShowLoading) util.showLoading()

  try {
    const res = await util.getData(...args)
    const { msg, code } = res.data

    if (_isShowLoading) util.hideLoading()

    if (code === 1000) { // 接口数据查询成功状态
      return Promise.resolve({ ...res.data, _response: res })
    } else { // 接口其他失败情况
      if (_isShowError) wx.showToast({ title: msg, icon: 'none' })
      return Promise.reject({ ...res.data, _response: res })
    }
  } catch (err) {
    if (_isShowLoading) util.hideLoading()
    return Promise.reject(err)
  }
}

export const controller = () => request

controller.showErrorToast = () => isShowError = true
controller.showLoading = () => isShowLoading = true
