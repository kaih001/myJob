/**
 * 检查手机号
 * @param {string} mobile
 * @return {boolean}
 */
export const checkMobile = mobile => {
  return /^1[3456789]\d{9}$/.test(mobile)
}

/**
 * 检查姓名(中文、英文、.·)2~10长度
 * @param {string} name
 * @return {boolean}
 */
export const checkName = name => {
  return /^[a-z\u4e00-\u9fa5.·]{2,10}$/i.test(name)
}

/**
 * 检查手机验证码 - 6位纯数字
 * @param {string} code
 * @return {boolean}
 */
export const checkMobileCode = code => {
  return /^\d{6}$/.test(code)
}

/**
 * 检查身份证号码
 * @param {string} idcard 地址
 * @return {boolean} true/false
 */
export const checkIdcard = idcard => {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/i.test(idcard)
}