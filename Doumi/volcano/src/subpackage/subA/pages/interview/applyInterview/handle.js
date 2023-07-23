import { createPage } from '@mpxjs/core'
import { util, app, api } from '../../../../../allJS.js'
import { DEGREES } from '../../../../../data/options'
import pageApplyExpectPost from '../../applyExpectPost/applyExpectPost?resolve'
import cityStore from '~/store/city'
import pageIndex from '../../../../../pages/index/index?resolve'

import jobStore from '~/store/job'
const { jobDetail }=jobStore.state


let checkCookie = ''

// const app = getApp()

createPage({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------

  data: {
    jobId: '', // 职位id
    jobType: '', // 职位类型
    userId: '',
    userInfo: {
      real_name: '',
      gender: 0,
      birth_date: '',
      at_school: '',
      degree: 3
    },
    picCode: '',
    job_date_type: '',
    jobDateType: '',
    codeBtnStyle: 'dm-cell-code-btn dm-disabled',
    codeBtnText: '获取验证码',
    isCountDown: false,
    checkPicCodeFlg: false,
    loginFlag: false,
    degreeList: DEGREES,
    birthText: '',
    phoneNumber: '',
    degreeText: '',
    jobData: {},
    code: '',
    fieldStatus: {
      // - 简历的各个字段是否填写
      isRealName: false, // - 姓名
      isGender: false, // - 性别
      isBirthDate: false, // - 出生年份
      isDegree: false, // - 学历
      isAtSchool: false // - 身份
    },
    isInterview: false,
    expectPost: {
      value: [],
      text: ''
    },
    expect_post: [],
    region: [[], [], []],
    provinceLabel: '',
    cityLabel: '',
    townLabel: '',
    provinceIndex: '',
    cityIndex: '',
    townIndex: '',
    provinceList: [],
    cityList: {},
    townList: {},
    callbackName: '',
    inputPicCode: '',
    isAgree:false,
    jobDetail:jobDetail
  },

  // -------------------------------------------------------------------------
  // 页面计算属性
  // -------------------------------------------------------------------------
  computed: {
    ...cityStore.mapState(['locationCity']),
    buttonState () {
      return !(
        this.realName &&
        this.genderText &&
        this.birthDate &&
        this.degreeText &&
        this.workYearText &&
        this.stateText &&
        this.mobile &&
        this.careerText &&
        this.townLabel &&
        (this.expectPost.text || this.careerTypeIndex === 3)
      )
    },

    buttonStyle () {
      return 'button bottom ' + (
        this.buttonState
          ? 'disabled'
          : 'active'
      )
    }
  },

  // -------------------------------------------------------------------------
  // 小程序生命周期
  // -------------------------------------------------------------------------
  async onLoad ({ id, jobType, isInterview, callbackName, ca_campaign, pierceParams = '' }) {
    util.showLoading()
    this.__setCity()
    const userId = wx.getStorageSync('userId')
    const loginFlag = userId > 0 // userId === 0 表示未授权手机号但是已经授权了微信信息, userId === '' 表示未登录
    this.setData({ loginFlag, jobType, jobId: id })

    const allCityList = await app.getAllCityList()
    this.__transformProvinceCityTown(allCityList)
    await this.__getJobData()

    isInterview = isInterview === 'true'
    if (isInterview) { // 约面职位
      this.setData({ isInterview })
      wx.setNavigationBarTitle({ title: '极速预约' })
    } else { // 普通职位
      wx.setNavigationBarTitle({ title: '极速报名' })
    }
    if (callbackName) this.callbackName = callbackName
    if (loginFlag) this.__getResumeData()

    pierceParams = decodeURIComponent(pierceParams)
    pierceParams = decodeURIComponent(pierceParams)
    pierceParams = decodeURIComponent(pierceParams)

    this.setData({ pierceParams })
    ca_campaign = ca_campaign ? `&ca_campaign=${ca_campaign}` : ''
    const applyconfirm = util.getQueryFieldVal(pierceParams, 'applyconfirm') || 'fastreg'
    util.hideLoading()
    api.setLog(
      1,
      `/jianzhi/${jobType}/detail/applyconfirm/${applyconfirm}&${pierceParams}${ca_campaign}`
    )
  },

  // -------------------------------------------------------------------------
  // 页面bind的事件
  // -------------------------------------------------------------------------

  bindWatchChange (e) {
    const { applyType } = e.currentTarget.dataset
    const val = e.detail.value
    const degreeList = this.degreeList
    const userInfo = this.userInfo
    if (applyType === 'phoneNumber') {
      this.data.checkNumber =
        val.length === 11 && /^1/.test(val)
      this.setData({ phoneNumber: val })
      if (this.data.checkNumber) {
        this.setData({ codeBtnStyle: 'dm-cell-code-btn' })
      } else {
        this.setData({ codeBtnStyle: 'dm-cell-code-btn dm-disabled' })
      }
    } else if (applyType === 'code') {
      this.setData({ code: val })
    } else if (applyType === 'inputPicCode') {
      this.setData({ inputPicCode: val })
    } else if (applyType === 'degree') {
      userInfo[applyType] = degreeList[val].value
      this.setData({ degreeText: degreeList[val].label })
    } else if (applyType === 'birth_date') {
      userInfo[applyType] = `${val}01`
      this.setData({ birthText: val })
    } else {
      userInfo[applyType] = val
    }
    this.setData({ userInfo })
  },

  async bindConfirm () {
    // const { callbackName, loginFlag, userInfo, phoneNumber, code } = this.data
    if(this.jobDetail.is_zhima&&this.jobDetail.is_proto&&!this.isAgree){
      wx.showToast({ title: '请勾选协议后报名', icon: "none" })
      return
    }
    const callbackName = this.callbackName
    const done = () => {
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2] // - 拿到上一个页面的实例
      const placeData = {
        province: this.provinceIndex,
        city: this.cityIndex,
        district: this.townIndex
      }
      const job_type_relation = JSON.stringify(this.expectPost.value)
      const place = JSON.stringify(placeData)

      let job_date_type = ''
      if (this.jobDateType == -1) {
        job_date_type = this.job_date_type
      } else if (this.jobDateType == 0) {
        job_date_type = 0
      } else {
        if (this.jobDateType == this.job_date_type) {
          job_date_type = this.job_date_type
        } else {
          job_date_type = 0
        }
      }

      const params = {
        ...this.userInfo,
        mobile: this.phoneNumber,
        verification: this.code,
        job_date_type: job_date_type,
        job_type_relation,
        place,
        zhima:this.jobDetail.is_zhima&&this.jobDetail.is_proto&&this.isAgree?1:''
      }
      callbackName && prevPage[callbackName](params)
        .then(successCallback => successCallback && successCallback())
        .catch(({ msg, message }) => { // - 调用上个页面传过来的回调方法
          this.selectComponent('#dmModal').show(msg || message)
        })
    }
    // console.log(this.expectPost.value)
    // let expect_post = this.expectPost.value.concat(this.expect_post)
    // if (expect_post.length > 5) {
    //   expect_post = expect_post.slice(0, 5)
    // }
    if (this.__checkForm()) {
      if (this.loginFlag) {
        try {
          done()
        } catch (err) {
          app.showErrorToastHandler(err)
        }
      } else {
        done()
      }
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

  /**
   * 获取验证码
   */
  getCode () {
    if (this.__checkGetCode()) {
      let param = {}
      let cookie = ''
      param.mobile = this.phoneNumber

      if (this.data.checkPicCodeFlg) {
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
    this.__postEv(`@ca_from=noyzm@post_id=${this.options.id}`)
    util.telPhone('请拨打客服电话！')
  },

  /**
   * 模态框点击 `返回`
   */
  bindModalCancel () {
    this.__postEv(`@ca_from=return`)
    wx.navigateBack({ delta: 1 })
  },

  /**
   * 模态框点击 `去职位列表`
   */
  bindModalConfirm () {
    this.__postEv('@ca_from=jumppost')
    wx.switchTab({ url: `${pageIndex}` })

    // const pages = getCurrentPages()
    // if (pages[0].route === 'pages/jobDetailInterview/jobDetailInterview') {
    //   wx.switchTab({ url: '/pages/index/index' })
    // } else {
    //   wx.navigateBack({ delta: 2 })
    // }
  },

  bindSelectPost () {
    app.globalData.expectPost = this.expectPost
    wx.navigateTo({ url: `${pageApplyExpectPost}?careerType=${this.careerTypeIndex}` })
  },

  // -------------------------------------------------------------------------
  // 页面方法, 双下划线开头表示私有方法, 供内部调用
  // -------------------------------------------------------------------------
  __setCity () {
    if (this.locationCity.parent_id) {
      this.provinceIndex = this.locationCity.parent_id
      this.cityIndex = this.locationCity.id
      this.townIndex = 0
    } else {
      const selectCity = wx.getStorageSync('selectedCity')
      this.provinceIndex = 0
      this.cityIndex = selectCity.id
      this.townIndex = 0
      this.locationCity.name = selectCity.name
    }
  },

  __postEv (append = '') {
    // - pierceParams 中包含了 `reqid`、`post_id`等参数
    if (this.pierceParams) {
      const pierceParams = this.pierceParams.replace(/&/g, '@')
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5${append}@${pierceParams}`
      )
    } else {
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5${append}`
      )
    }
  },

  __checkGetCode () {
    if (
      !this.data.isCountDown &&
      this.data.codeBtnStyle.indexOf('disabled') === -1
    ) {
      if (this.__checkPhoneData()) {
        if (this.data.checkPicCodeFlg) {
          return this.__checkPicCode()
        }
        return true
      }
    }
  },

  /**
   * 信息校验
   */
  __checkForm () {
    this.fieldStatus = this.userInfo
    if (!this.data.fieldStatus.isRealName) {
      if (this.data.userInfo.real_name) {
        if (!/^([\u4e00-\u9fa5]|[A-Za-z])+([.\u00B7]?([\u4e00-\u9fa5]|[A-Za-z])+)+$/.test(this.data.userInfo.real_name)
        ) {
          util.showToast('姓名格式错误！')
          return false
        }
      } else {
        util.showToast('请填写姓名')
        return false
      }
    }

    if (!this.data.fieldStatus.isGender && this.data.userInfo.gender <= 0) {
      util.showToast('请选择性别')
      return false
    }
    if (
      !this.data.fieldStatus.isAtSchool &&
      (this.data.userInfo.at_school === '' ||
        this.data.userInfo.at_school === undefined)
    ) {
      util.showToast('请选择身份')
      return false
    }
    if (!this.data.fieldStatus.isDegree && !this.data.degreeText) {
      util.showToast('请选择学历')
      return false
    }
    if (!this.data.fieldStatus.isBirthDate && !this.data.userInfo.birth_date) {
      util.showToast('请选择生日')
      return false
    }
    if (!this.cityIndex) {
      util.showToast('请选择期望城市')
      return false
    }
    if (!this.expectPost.text) {
      util.showToast('请选择期望岗位')
      return false
    }

    if (!this.data.loginFlag) {
      // 未登录
      return this.__checkLogin()
    }

    return true
  },

  /**
   * 登录信息校验
   */
  __checkLogin () {
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

  toggleAgree(){
    this.isAgree=!this.isAgree
  },
  goAgreement () {
    wx.navigateTo({
      url:'/pages/zhima/zhimaAgreement'
    })
  },

  /**
   * 验证码倒计时
   * @param {Number} num - 倒计时的起始值
   */
  __clock (num) {
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
    timer = setTimeout(() => this.__clock(num), 1000)
  },

  __checkPhoneData () {
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

  __checkPicCode () {
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

  __transformProvinceCityTown (list) {
    const { region, provinceList, cityList, townList } = this

    list.forEach(province => {
      provinceList.push({
        id: province.province_id,
        short_name: province.short_name
      })
      cityList[province.province_id] = []
      province.cities.forEach(city => {
        cityList[province.province_id].push({
          id: city.city_id,
          short_name: city.short_name
        })
        townList[city.city_id] = []
        city.districts.forEach(town => {
          townList[city.city_id].push({
            id: town.district_id,
            short_name: town.short_name
          })
        })
      })
    })

    region[0] = provinceList
    region[1] = cityList[provinceList[0].id]
    region[2] = townList[cityList[provinceList[0].id][0].id]

    this.setData({ region, provinceList, cityList, townList })
  },

  /**
   * 获取职位信息
   */
  async __getJobData () {
    try {
      const res = await util.getData('client/detail/' + this.jobId)
      this.jobData = res.data.data
      this.job_date_type = res.data.data.job_date_type
      const query = util.obj2uri({
        hidden_operation: 0, // 是否展示运营推荐分类 1不展示
        hidden_hot: 0, // 是否展示兼职热门类目 1不展示
        citydomain: '', // 当前城市
        hidden_other: 0, // 是否展示其他类目 1不展示
        hidden_guide: 0, // 将热门标签中的子类别从全职和兼职中移除 1合并 0不合并
        job_type: 0, // 是否将标签进行拆分成 0:'不限';1:'兼职';2:'全职'
      })
      const res2 = await util.getData(`common/jobtype/list?${query}`)
      const listData = res2.data.data
      for (let i = 0; i < listData.length; i++) {
        for (let j = 0; j < listData[i].items.length; j++) {
          if (res.data.data.job_type === listData[i].items[j].value) {
            // const valueFirst = [listData[i].items[j]]
            const expectPostOne = {
              value: [listData[i].items[j]],
              text: listData[i].items[j].name
            }
            this.expectPost = expectPostOne
          }
        }
      }

      await this.__getCompanyData(res.data.data.company_id)
    } catch (err) {
      console.error(err)
    }
  },

  // 获取公司数据
  async __getCompanyData (id) {
    try {
      const res = await util.getData(
        `company/detail`,
        { company_id: id }
      )
      console.log(res)
    } catch (err) {
      util.hideLoading()
      if (err === 'offline') {
        this.errorType = err
        this.showErrorTemp = true
      }
    }
  },

  /**
   * 获取简历信息
   */
  async __getResumeData () {
    util.showLoading()

    try {
      const res = await util.getData(`user/info/basic`)
      const { code, data } = res.data
      console.log(data)

      util.hideLoading()
      if (code === 1000) {
        let { real_name, gender, birth_date, at_school, degree, job_date_type, job_type_relation } = data.profile
        birth_date = +birth_date
        this.jobDateType = job_date_type
        this.expect_post = job_type_relation
        this.setData({
          fieldStatus: {
            isRealName: real_name, // - 姓名
            isGender: gender > 0, // - 性别
            isBirthDate: birth_date, // - 出生年份
            isDegree: degree > -1, // - 学历
            isAtSchool: at_school > -1 // - 身份

          }
        })

        if (degree < 0) degree = ''
        if (at_school < 0) at_school = ''
        this.setData({ userInfo: { real_name, gender, birth_date, at_school, degree } })
      } else {
        return Promise.reject(res.data)
      }
    } catch (err) {
      app.showErrorToastHandler(err)
    }
  }
})
