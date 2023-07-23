import util from '~/utils/util'
import { checkMobile, checkMobileCode } from '~/utils/validate'

let checkCookie = ''

export default {
  data: {
    picCode: '',
    mobile: '',
    code: '',
    checkPicCodeFlg: false,
    num: 0
  },

  computed: {
    checkNumber () {
      return checkMobile(this.mobile)
    },
    codeBtnText () {
      let { num } = this
      if (num <= 0) return '获取验证码'
      num = num < 10 ? `0${num}` : num
      return `${num}秒后重发`
    },
    codeBtnClass () {
      return {
        'dm-disabled': !this.checkNumber ||
          this.codeBtnText !== '获取验证码'
      }
    }
  },

  methods: {
    /**
     * 获取验证码
     */
    bindGetCode () {
      if (this.__checkGetCode()) {
        let param = {}
        let cookie = ''
        param.mobile = this.mobile

        if (this.checkPicCodeFlg) {
          param.code = this.inputPicCode
          cookie = checkCookie
        }

        util.showLoading()
        util.getData('client/authCkCode/', param, 'POST', cookie).then(
          res => {
            util.hideLoading()
            if (res.data.code === 0) {
              this.__clock(60)
            } else if (res.data.code === -3) {
              this.bindGetPicCode()
              this.setData({ checkPicCodeFlg: true })
            } else {
              if (this.checkPicCodeFlg) {
                this.bindGetPicCode()
              }
              util.showToast(res.data.message)
            }
          },
          res => {
            util.hideLoading()
          }
        )
      }
    },

    /**
     * 获取图片验证码
     */
    bindGetPicCode () {
      util.getData('client/showCkCode').then(
        res => {
        // 请求成功
          util.hideLoading()
          this.setData({
            picCode: res.data.pic
          })
          checkCookie = 'ganji_jz_melon_uuid=' + res.data.code
        },
        res => {
        // 请求失败
          console.log('fail', res)
        }
      )
    },

    /**
     * 登录信息校验
     */
    __checkLogin () {
      if (this.__checkPhoneData()) {
        if (!checkMobileCode(this.code)) {
          util.showToast('请输入正确的验证码')
          return false
        }
        return true
      }
    },

    __checkGetCode () {
      if (this.num <= 0) {
        if (this.__checkPhoneData()) {
          if (this.checkPicCodeFlg) {
            return this.__checkPicCode()
          }
          return true
        }
      }
    },

    /**
     * 验证码倒计时
     * @param {Number} num - 倒计时的起始值
     */
    __clock (num) {
      this.num = num
      if (this.num > 0) {
        setTimeout(() => this.__clock(--num), 1000)
      }
    },

    __checkPhoneData () {
      if (this.checkNumber) {
        return true
      } else {
        util.showToast('请输入正确的手机号')
        return false
      }
    },

    __checkPicCode () {
      if (this.inputPicCode) {
        if (this.inputPicCode.length === 4) {
          return true
        } else {
          util.showToast('请输入正确的图片验证码')
        }
      } else {
        util.showToast('图片验证码不能为空')
      }
    }
  }
}
