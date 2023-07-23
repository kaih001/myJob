// 基础服务相关接口
import util from '../utils/util'
import { request, controller } from './_request'

const common = {}

common.showLoading = () => {
  controller.showLoading()
  return common
}

common.showErrorToast = () => {
  controller.showErrorToast()
  return common
}

/**
 * 检查简历五项是否全
 * @return {promise<object>}
 */
common.checkResume = () => request('profile/uncompleted')

/**
 * 获取帖子详情数据
 * @param {object} param
 * ├──@prop {string} postId - 职位id
 * ├──@prop {string?} lng - 经度
 * ├──@prop {string?} lat - 纬度
 * ├──@prop {string} openId - 用户唯一标识
 * ├──@prop {number?} scene - 场景值
 * @return {promise<object>}
 */
common.getJobDetailData = ({ postId, lng, lat, openId, scene }) => {
  // 接口经纬度接收参数反了, 影响其他业务, 暂时无法修改, 这里先反着传
  const query = util.obj2uri({ lat: lng, lng: lat, open_id: openId, scene })
  return request(`client/detail/${postId}?${query}`)
}

/**
 * 获取帖子的报名状态
 * @param {object} param
 * ├──@prop {string} postId - 职位id
 * @return {promise<object>}
 */
// common.getJobApplyInfoData = ({ postId }) => request(`client/applyinfo/${postId}?rp=mobile`)

/**
 * 收集formid
 * @param {object} param
 * ├──@prop {string} formId- 表单的formid, 传多个时用逗号(,)分隔
 * ├──@prop {string} openId - 小程序用户的openId
 * ├──@prop {string?} pushType - 推送类型 12:签到通知
 */
// common.collectFormid = ({
//   formId,
//   openId,
//   pushType = ''
// }) => {
//   if (formId.indexOf('the formId is a mock one') > -1) return // 开发工具的formid值
//   const param = {
//     formid: formId,
//     open_id: openId,
//     push_type: pushType
//   }
//   return request('collect/formid', param, 'POST')
// }

/**
 * 普通帖子报名
 * @param {object} param
 * ├──@prop {string} domain - 当前选择城市的简拼 如北京: bj
 * ├──@prop {string} addrId
 * ├──@prop {string} openId
 * ├──@prop {string} postId - 职位id
 * ├──@prop {string} userId - 用户id
 * ├──@prop {string} workTimeId - 工作时间id
 * ├──@prop {string?} inviteCode
 * ├──@prop {boolean?} noLimit - 是否开启后台校验
 */
common.applyJob = ({
  domain,
  addrId,
  openId,
  postId,
  userId,
  workTimeId,
  inviteCode = '',
  noLimit = false
}) => {
  const param = {
    ca_platform: 4,
    domain,
    addr_id: addrId,
    open_id: openId,
    post_id: postId,
    userId,
    work_time_id: workTimeId,
    invite_code: inviteCode,
    no_limit: noLimit
  }
  return request(`client/apply/${postId}`, param, 'POST')
}

/**
 * 普通帖极速报名
 * @param {object} param
 * ├──@prop {string} postId - 职位id
 * ├──@prop {object} resume - 简历信息
 * ├──@prop {string?} inviteCode
 * ├──@prop {object?} mobile
 *    ├──@prop {string} number - 手机号
 *    ├──@prop {string} verification - 验证码
 * ├──@prop {string?} caCampaign
 * ├──@prop {boolean?} noLimit - 是否开启后台校验
 */
common.fastApplyJob = ({
  postId,
  resume = {},
  inviteCode = '',
  mobile = '',
  caCampaign = '',
  noLimit = false
}) => {
  const param = {
    job_id: postId,
    resume,
    mobile,
    invite_code: inviteCode,
    ca_campaign: caCampaign,
    no_limit: noLimit
  }
  return request('client/fastapply', param, 'POST')
}

/**
 * 普通帖子取消报名
 * @param {object} param
 * ├──@prop {string} postId - 职位id
 * ├──@prop {string?} domain - 当前选择城市的简拼 如北京: bj
 */
common.unApplyJob = ({
  postId,
  domain = ''
}) => {
  return request(`client/unapply/${postId}?citydomain=${domain}`)
}

common.getInviteCode=({})=>{
  console.log('nsnsnsnsn');
  return request(`client/post/share/invitecode`,{}, 'POST')
}

common.agreeToTheAgreement = (listing_status) => {
  return request('client/zhima/agreement', {listing_status}, 'POST')
}

export default common
