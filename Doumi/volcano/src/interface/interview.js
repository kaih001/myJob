// 约面相关接口
import util from '../utils/util'
import { request, controller } from './_request'

const interview = {}

interview.showLoading = () => {
  controller.showLoading()
  return interview
}

interview.showErrorToast = () => {
  controller.showErrorToast()
  return interview
}

/**
 * 检查签到提醒
 */
interview.checkSignRemind = () => request('interview/signin/remind')

/**
 * 检查面试提醒
 */
interview.checkInterviewRemind = () => request('interview/remind')

/**
 * 获得未面试调研反馈原因
 */
interview.getFeedbackReason = () => request('interview/signin/feedback_reason')

/**
 * 未面试调研反馈原因提交
 * ├──@prop {string} postId - 职位ID
 * ├──@prop {string} applyId - 报名的ID
 * ├──@prop {string} reason - 填写的原因
 * ├──@prop {string} customReason - 填写的原因
 */
interview.putFeedback = ({
  postId,
  applyId,
  reason,
  customReason
}) => {
  const param = {
    post_id: postId,
    apply_id: applyId,
    reason,
    custom_reason: customReason
  }
  return request('interview/signin/feedback', param, 'POST')
}

/**
 * 有报名记录时获得报名记录中的一条职位信息用来签到
 * @param {object} param
 * ├──@prop {string} primaryCode - 根据项目ID和面试ID生成的主键码
 */
interview.getSignInPost = ({ primaryCode }) => {
  const param = { primary_code: primaryCode }
  return request('interview/signin/info', param, 'POST')
}

/**
 * 检查签到状态
 * @param {object} type - `qrcode`(二维码进入页面) 或者 `direct`(直接进入页面)
 * @param {object} param
 * ├──@prop {string?} postId - 职位ID, type = 'direct' 时有效
 * ├──@prop {string?} primaryCode - 根据项目ID和面试ID生成的主键码, type = 'qrcode' 时有效
 */
interview.checkSignIn = (type = 'direct', { postId, primaryCode }) => {
  // return Promise.reject({ code: -201, msg: 'ssss' })
  return type === 'direct'
    ? request('interview/fastvalidsign', { post_id: postId }, 'POST')
    : request('interview/has_signin', { primary_code: primaryCode }, 'POST')
}

/**
 * 检查签到位置
 * @param {object} type - `qrcode`(二维码进入页面) 或者 `direct`(直接进入页面)
 * @param {object} param
 * ├──@prop {string} lng - 经度
 * ├──@prop {string} lat - 纬度
 * ├──@prop {string?} primaryCode - 根据项目ID和面试ID生成的主键码, type = 'qrcode' 时有效
 * ├──@prop {string?} postId - 职位ID, type = 'direct' 时有效
 * ├──@prop {string?} addressId - 地址ID, type = 'direct' 时有效
 */
interview.checkSignInLocation = (type = 'direct', {
  lng,
  lat,
  primaryCode,
  postId,
  addressId
}) => {
  const param = { lng, lat }
  const p1 = { ...param, post_id: postId, address_id: addressId }
  const p2 = { ...param, primary_code: primaryCode }
  return type === 'direct'
    ? request('interview/fastvalidaddr', p1, 'POST')
    : request('interview/signin/validaddr', p2, 'POST')
}

interview.checkApplyRecord = () => {
  return request('interview/checkapply', null, 'POST')
}

/**
 * 签到
 * @param {object} type - `qrcode`(二维码进入页面) 或者 `direct`(直接进入页面)
 * @param {object} param
 * ├──@prop {string?} postId - 职位ID
 * ├──@prop {string?} addressId - 地址ID
 * ├──@prop {string?} applyId - 约面报名成功后给的一个apply_id, type = 'qrcode' 时有效
 * ├──@prop {string?} primaryCode - 根据项目ID和面试ID生成的主键码, type = 'qrcode' 时有效
 */
interview.signIn = (type = 'direct', {
  postId,
  addressId,
  applyId,
  primaryCode
}) => {
  const param = {
    post_id: postId,
    address_id: addressId
  }
  const param2 = {
    ...param,
    apply_id: applyId,
    primary_code: primaryCode,
    sign_type: 1, // 签到类型 1表示用户直接签到
    ca_platform: 2, // 签到平台 1:WAP;2:小程序;3:APP
    ca_source: 'direct_visits' // 签到来源
  }
  return type === 'direct'
    ? request('interview/fastsignin', param, 'POST')
    : request('interview/signin', param2, 'POST')
}

/**
 * 获取推荐职位列表(扫码进入时用到)
 * @param {object} param
 * ├──@prop {string} primaryCode - 根据项目ID和面试ID生成的主键码
 */
interview.getRecommendList = ({ primaryCode }) => request('interview/recommend', { primary_code: primaryCode }, 'POST')

/**
 * 获取获取自己要签到的职位信息(前提已经约面成功)
 * @param {object} param
 * ├──@prop {string} postId - 职位id
 */
interview.getMyInterviewInfo = ({ postId }) => request(`interview/signin_detail?post_id=${postId}`)

/**
 * 获取约面工作地点和面试时间地点
 * @param {object} param
 * ├──@prop {string} postId - 职位id
 * ├──@prop {string?} lng - 经度
 * ├──@prop {string?} lat - 纬度
 */
interview.getInterviewAdderssAndTime = ({ postId, lng, lat }) => {
  const query = util.obj2uri({ post_id: postId, lng, lat })
  return request(`interview/info?${query}`)
}

/**
 * 约面报名
 * @param {object} param
 * ├──@prop {string} domain - 当前选择城市的简拼 如北京: bj
 * ├──@prop {string} addrId
 * ├──@prop {string} openId
 * ├──@prop {string} postId - 职位id
 * ├──@prop {object} interviewAddress - 面试地址
 * ├──@prop {object} interviewTimes - 面试时间
 * ├──@prop {string?} inviteCode
 * ├──@prop {string?} consultantId - 顾问id
 * ├──@prop {boolean?} noLimit - 是否开启后台校验
 */
interview.applyJob = ({
  domain,
  addrId,
  openId,
  postId,
  interviewAddress,
  interviewTime,
  inviteCode = '',
  consultantId = '',
  noLimit = false
}) => {
  const param = {
    ca_platform: 4,
    domain,
    addr_id: addrId,
    open_id: openId,
    post_id: postId,
    interview_address: interviewAddress,
    interview_times: interviewTime,
    invite_code: inviteCode,
    consultant_id: consultantId,
    no_limit: noLimit
  }
  return request('interview/apply', param, 'POST')
}

/**
 * 约面极速报名
 * @param {object} param
 * ├──@prop {string} domain - 当前选择城市的简拼
 * ├──@prop {string} addrId
 * ├──@prop {string} openId
 * ├──@prop {string} postId - 职位id
 * ├──@prop {object} resume - 简历信息
 * ├──@prop {object} interviewAddress - 面试地址
 * ├──@prop {object} interviewTimes - 面试时间
 * ├──@prop {string?} inviteCode
 * ├──@prop {string?} consultantId - 顾问id
 * ├──@prop {boolean?} noLimit - 是否开启后台校验
 */
interview.fastApplyJob = ({
  domain,
  addrId,
  openId,
  postId,
  resume = {},
  interviewAddress,
  interviewTime,
  inviteCode = '',
  consultantId = '',
  noLimit = false
}) => {
  const param = {
    ca_platform: 4,
    domain,
    addr_id: addrId,
    open_id: openId,
    post_id: postId,
    resume,
    interview_address: interviewAddress,
    interview_times: interviewTime,
    invite_code: inviteCode,
    consultant_id: consultantId,
    no_limit: noLimit
  }
  return request('interview/fastapply', param, 'POST')
}

export default interview
