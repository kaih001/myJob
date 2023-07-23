import { createPage } from '@mpxjs/core'
import { util, api, app } from '../../../../allJS.js'
import { DEGREES } from '../../../../data/options'
import { checkName } from '../../../../utils/validate'
import pageAppluSuccess from '../applySuccess/applySuccess?resolve'
import pageApplyExpectPost from '../applyExpectPost/applyExpectPost?resolve'
import jobStore from '~/store/job'

const STE = jobStore.state

let checkCookie = ''

createPage({
  data: {
    job_id: '',
    jobType: '',
    addressId: '',
    timeId: '',
    userId: '',
    userInfo: {
      real_name: '',
      gender: 0,
      birth_date: '',
      at_school: '',
      degree: 3
    },
    picCode: '',
    codeBtnStyle: 'dm-cell-code-btn dm-disabled',
    codeBtnText: '获取验证码',
    isCountDown: false,
    checkPicCodeFlg: false,
    loginFlag: false,
    checkFormFlag: true,
    goToLoginFlag: false,
    degreeList: DEGREES,
    birthText: '',
    degreeText: '',
    careerTypeIndex: 0,
    is_resume_complete: '',
    is_degree_complete: '',
    invite_code: '',
    options: '',
    inviter: null,
    fromPage: '', // 从哪个页面进入到这个页面
    fromPagePost_id: '',
    fromPageTopic_id: '',
    fromPageForm_id: '',
    fromPageCookie: '',
    fromPageInvite_code: '',
    fromActivity: '',
    expectPost: {
      value: [],
      text: ''
    },
    isAgree:false
  },
  onLoad (options) {
    console.log('eeeeeeeeeeeeeeeee',STE)
    console.log(options)
    this.setData({ options })

    if (options.fromViewpointPage === 'true') {
      this.setData({ fromViewpointPage: true })
    }

    if (options.fromPage) {
      this.setData({
        fromPage: options.fromPage
      })
    }

    if (options.id) {
      this.setData({
        fromPage: options.id
      })
    }

    if (options.topic_id) {
      this.setData({
        fromPageTopic_id: options.topic_id
      })
    }

    if (options.form_id) {
      this.setData({
        fromPageForm_id: options.form_id
      })
    }

    if (options.cookie) {
      this.setData({
        fromPageCookie: options.cookie
      })
    }

    if (options.invite_code) {
      this.setData({
        fromPageInvite_code: options.invite_code
      })
    }

    if (options.fromActivity) {
      this.setData({
        fromActivity: options.fromActivity
      })
    }

    this.setData({ loginFlag: options.loginFlag === 'true' })

    if (options.root_id) {
      this.setData({
        inviter: {
          root_id: options.root_id,
          scene: options.scene,
          post_id: options.post_id,
          personId: options.personId,
          rank: options.rank
        }
      })
    }
    if (options.register) {
      wx.setStorage({
        key: 'register',
        data: options.register
      })
    }
    wx.hideShareMenu()

    this.setData({
      pierceParams: decodeURIComponent(decodeURIComponent(options.pierceParams)),
      job_id: options.id,
      jobType: options.jobType,
      timeId: options.timeId,
      addressId: options.addressId,
      is_resume_complete: ~~options.is_resume_complete,
      is_degree_complete: ~~options.is_degree_complete
    })
    this.__postEv('@ca_from=apply_success')
  },
  onShow () {
    this.init(this.options)
  },
  /**
   * 页面初始化，获取登录态设置登陆状态
   */
  init ({ jobType, ca_campaign, pierceParams = '' }) {
    const { goToLoginFlag, is_resume_complete, is_degree_complete } = this.data

    wx.getStorage({
      key: 'loginInfo',
      success: res => {
        const { login_status, userId } = res.data
        if (login_status && userId > 0) {
          if (
            goToLoginFlag &&
            is_resume_complete === 1 &&
            is_degree_complete === 1
          ) {
            this.setData({ checkFormFlag: false })
            this.fastApply()
          }

          this.setData({ userId })
        }
      }
    })

    pierceParams = decodeURIComponent(decodeURIComponent(pierceParams))
    ca_campaign = ca_campaign ? `&ca_campaign=${ca_campaign}` : ''
    const applyconfirm = util.getQueryFieldVal(pierceParams, 'applyconfirm') || 'fastreg'
    api.setLog(
      1,
      `/jianzhi/${jobType}/detail/applyconfirm/${applyconfirm}&${pierceParams}${ca_campaign}`
    )
  },
  /**
   * 信息校验
   */
  checkForm () {
    // 如果是登录完成返回则需要校验表单
    if (!this.data.checkFormFlag) {
      return true
    }
    if (this.data.is_resume_complete !== 1) {
      if (this.data.userInfo.real_name) {
        if (!checkName(this.data.userInfo.real_name)) {
          wx.showToast({ title: '姓名格式错误', icon: 'none' })
          return false
        }
      } else {
        wx.showToast({ title: '请填写姓名', icon: 'none' })
        return false
      }
    }

    if (this.data.is_resume_complete !== 1 && !this.data.userInfo.gender) {
      wx.showToast({ title: '请选择性别', icon: 'none' })
      return false
    }
    if (
      (this.data.is_resume_complete !== 1 &&
        this.data.userInfo.at_school === '') ||
      this.data.userInfo.at_school === undefined
    ) {
      wx.showToast({ title: '请选择身份', icon: 'none' })
      return false
    }
    if (!this.data.degreeText) {
      wx.showToast({ title: '请选择学历', icon: 'none' })
      return false
    }
    if (this.data.is_resume_complete !== 1 && !this.data.userInfo.birth_date) {
      wx.showToast({ title: '请选择生日', icon: 'none' })
      return false
    }

    if (!this.data.loginFlag) {
      // 未登录
      if (this.checkLogin()) {
        return true
      }
    } else {
      return true
    }
  },
  checkGetCode () {
    if (
      !this.data.isCountDown &&
      this.data.codeBtnStyle.indexOf('disabled') === -1
    ) {
      if (this.checkPhoneData()) {
        if (this.data.checkPicCodeFlg) {
          return this.checkPicCode()
        }
        return true
      }
    }
  },
  /**
   * 极速报名请求是否可以报名
   */
  fastApply () {
    this.__postEv('@ca_from=apply')

    if (this.checkForm()) {
      let param = {}
      // 获取链接来源参数
      param.invite_code = wx.getStorageSync('register')
      param.job_id = this.data.job_id

      if (this.data.checkFormFlag) {
        param.resume = {}

        if (this.data.is_resume_complete !== 1) {
          param.resume.real_name = this.data.userInfo.real_name
          param.resume.gender = this.data.userInfo.gender
          param.resume.birth_date = `${this.data.userInfo.birth_date}01`
          param.resume.at_school = this.data.userInfo.at_school
          param.resume.degree = this.data.userInfo.degree
        } else {
          param.resume.degree = this.data.userInfo.degree
        }
      }

      if (!this.data.loginFlag) {
        param.mobile = {}
        param.mobile.number = this.data.phoneNumber
        param.mobile.verification = this.data.code
      }

      if (this.data.options.ca_campaign) {
        param.ca_campaign = this.data.options.ca_campaign
      }
      util.showLoading()

      util
        .getData('client/fastapply/', param, 'POST')
        .then(
          res => {
            const { loginInfo, code, message, msg } = res.data

            if (!this.data.loginFlag && loginInfo && loginInfo.userId) {
              wx.setStorageSync('userId', loginInfo.userId)
              util.setCookie(res.header['Set-Cookie'] || res.header['set-cookie'])
              this.setData({ loginFlag: true })
            }

            if (code === 0) {
              if (loginInfo && loginInfo.code && loginInfo.code < 0) {
                // 可能会验证码错误等
                util.hideLoading()
                this.showToast(message || loginInfo.message, false)
              } else {
                return this.apply()
              }
            } else {
              util.hideLoading()
              this.showToast(message || msg)
            }
          },
          res => {
            // 请求失败
            util.showToast('服务器异常')
          }
        )
    }
  },
  /**
   * 报名
   */
  apply () {
    if (this.checkForm()) {
      let param = {}
      // 获取报名来源数据
      param.invite_code = wx.getStorageSync('register')
      param.addr_id = this.data.addressId
      param.ca_platform = 4 // 数据来源微信
      param.open_id = app.globalData.openId
      param.domain = app.globalData.cityInfo.domain || ''

      if (this.data.timeId) {
        param.work_time_id = this.data.timeId
      }
      if (this.data.options.ca_campaign) {
        param.ca_campaign = this.data.options.ca_campaign
      }
      param.userId = this.data.userId

      util
        .getData(
          'client/apply/' + this.data.job_id,
          param,
          'POST'
        )
        .then(
          res => {
            util.hideLoading()

            if (res.data.code === 0) {
              if (this.data.inviter) {
                var param = {
                  auth_str: wx.getStorageSync('auth_str'),
                  root_id: this.data.inviter.root_id,
                  scene: this.data.inviter.scene,
                  post_id: this.data.inviter.post_id,
                  rank: this.data.inviter.rank
                }
                util
                  .getData(
                    `client/offer/${this.data.inviter.personId}/joinlinked`,
                    param,
                    'POST'
                  )
                  .then(
                    data => {},
                    () => {
                      wx.hideLoading()
                      util.showToast('服务器异常')
                    }
                  )
              }

              this.__postEv('@ca_from=apply_success')

              wx.redirectTo({
                url: `${pageAppluSuccess}?${util.obj2uri({
                  jobType: this.data.jobType,
                  id: this.data.options.id,
                  pierceParams: this.options.pierceParams
                })}`
              })
            } else {
              this.showToast(res.data.message)
            }
          },
          res => {
            // 请求失败
            util.showToast('服务器异常')
          }
        )
    }
  },
  watchChange (e) {
    if (e.currentTarget.dataset.applyType === 'phoneNumber') {
      this.data.checkNumber =
        e.detail.value.length === 11 && /^1/.test(e.detail.value)
      this.setData({
        phoneNumber: e.detail.value
      })
      if (this.data.checkNumber) {
        this.setData({
          codeBtnStyle: 'dm-cell-code-btn'
        })
      } else {
        this.setData({
          codeBtnStyle: 'dm-cell-code-btn dm-disabled'
        })
      }
    } else if (e.currentTarget.dataset.applyType === 'code') {
      this.setData({
        code: e.detail.value
      })
    } else if (e.currentTarget.dataset.applyType === 'inputPicCode') {
      this.setData({
        inputPicCode: e.detail.value
      })
    } else {
      if (e.currentTarget.dataset.applyType === 'degree') {
        this.setData({
          degreeText: this.data.degreeList[e.detail.value].label
        })
      }
      if (e.currentTarget.dataset.applyType === 'birth_date') {
        this.setData({
          birthText: e.detail.value
        })
      }
      let userInfo = this.data.userInfo
      userInfo[e.currentTarget.dataset.applyType] = e.detail.value
      this.setData({ userInfo })
    }
  },
  async bindregionPickerChange ({ detail: { value } }) {
    const { region } = this

    await this.bindColumnchange({
      detail: { column: 0, value: value[0] }
    })
    await this.bindColumnchange({
      detail: { column: 1, value: value[1] }
    })

    this.provinceLabel = region[0][value[0]].short_name
    this.provinceIndex = region[0][value[0]].id
    this.cityLabel = region[1][value[1]].short_name
    this.cityIndex = region[1][value[1]].id
    this.townLabel = region[2][value[2]].short_name
    this.townIndex = region[2][value[2]].id
  },
  bindColumnchange ({ detail: { column, value } }) {
    const { region, provinceList, cityList, townList } = this

    switch (column) {
      case 0:
        region[1] = cityList[provinceList[value].id]
        region[2] = townList[cityList[provinceList[value].id][0].id]
        break
      case 1:
        region[2] = townList[region[1][value].id]
        break
      case 2:
        break
      default:
        break
    }

    return new Promise(resolve => this.setData({ region }, resolve))
  },

  bindSelectPost () {
    if (!this.careerText) {
      wx.showToast({
        title: '请先选择求职类型', // 提示的内容,
        icon: 'none', // 图标,
        duration: 2000, // 延迟时间,
        mask: true // 显示透明蒙层，防止触摸穿透,
      })
    } else {
      app.globalData.expectPost = this.expectPost
      wx.navigateTo({ url: `${pageApplyExpectPost}?careerType=${this.careerTypeIndex}` })
    }
  },

  showTopTips () {
    var that = this
    this.setData({
      showTopTips: true
    })
    setTimeout(() => {
      that.setData({
        showTopTips: false
      })
    }, 3000)
  },
  // 登录流程//
  /**
   * 登录信息校验
   */
  checkLogin () {
    if (this.data.phoneNumber) {
      if (this.data.checkNumber) {
        if (this.data.code) {
          if (this.data.code.length === 6) {
            return true
          } else {
            util.showToast('请输入正确的验证码')
            return false
          }
        } else {
          util.showToast('验证码不能为空')
          return false
        }
      } else {
        util.showToast('请输入正确的手机号')
        return false
      }
    } else {
      util.showToast('手机号不能为空')
      return false
    }
  },
  clock (num) {
    let timer = null
    this.setData({
      codeBtnText: num + 's后重发',
      isCountDown: true,
      codeBtnStyle: 'dm-cell-code-btn dm-disabled'
    })

    clearTimeout(timer)

    if (num <= 0) {
      return this.setData({
        codeBtnText: '获取验证码',
        isCountDown: false,
        codeBtnStyle: 'dm-cell-code-btn'
      })
    }
    let n = num < 10 ? '0' + num : '' + num
    this.setData({
      codeBtnText: n + '秒后重发',
      isCountDown: true,
      codeBtnStyle: 'dm-cell-code-btn dm-disabled'
    })
    num--
    timer = setTimeout(() => this.clock(num), 1000)
  },
  /**
   * 获取验证码
   */
  getCode () {
    if (this.checkGetCode()) {
      let param = {}
      let cookie = ''
      param.mobile = this.data.phoneNumber

      if (this.data.checkPicCodeFlg) {
        param.code = this.data.inputPicCode
        cookie = checkCookie
      }

      util.showLoading()
      util.getData('client/authCkCode/', param, 'POST', cookie).then(
        res => {
          util.hideLoading()
          if (res.data.code === 0) {
            this.clock(60)
          } else if (res.data.code === -3) {
            this.getPicCode()
            this.setData({ checkPicCodeFlg: true })
          } else {
            if (this.data.checkPicCodeFlg) {
              this.getPicCode()
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

  __postEv (append = '') {
    // - pierceParams 中包含了 `reqid`、`post_id`等参数
    const pierceParams = this.data.pierceParams.replace(/&/g, '@')
    const { source } = this.options

    if (source) {
      // 运营位进入 @source=yyw_[index]_[name]
      // 列表进入 @source=sy_postlist
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5@source=${source}${append}@${pierceParams}`
      )
    } else {
      // 没有source,即从非首页入口进入则不传source
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5${append}@${pierceParams}`
      )
    }
  },

  /**
   * 获取图片验证码
   */
  getPicCode () {
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
   * 无法获取验证码
   */
  cantGetCode () {
    this.__postEv('@ca_from=noyzm')
    util.telPhone('请拨打客服电话！')
  },
  checkPhoneData () {
    if (this.data.phoneNumber) {
      if (this.data.checkNumber) {
        return true
      } else {
        util.showToast('请输入正确的手机号')
      }
    } else {
      util.showToast('手机号不能为空')
    }
  },
  checkPicCode () {
    if (this.data.inputPicCode) {
      if (this.data.inputPicCode.length === 4) {
        return true
      } else {
        util.showToast('请输入正确的图片验证码')
      }
    } else {
      util.showToast('图片验证码不能为空')
    }
  },
  // 登录流程//
  /**
   * toast提示
   * content 提示内容
   */
  showToast (content, isBack = true) {
    wx.showModal({
      title: '提示',
      content,
      success (res) {
        isBack && wx.navigateBack()
      }
    })
  },
  goToLogin (e) {
    let type = e.currentTarget.dataset.type

    if (type === 'toLogin') {
      this.setData({ goToLoginFlag: true })
      this.__postEv('@ca_from=gotologin')
    }
  },
  toggleAgree(){
    this.isAgree=!this.isAgree
  }
})
