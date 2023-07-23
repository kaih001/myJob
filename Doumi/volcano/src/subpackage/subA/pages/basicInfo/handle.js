import { createPage } from '@mpxjs/core'
import util from '~/utils/util'
import api from '~/utils/api'
import { AT_SCHOOL, DEGREES, GENDER, JOB_DATE_TYPE, JOB_HUNTING_STATUS, WORK_YEARS } from '~/data/options'
import loginPath from '~/pages/login/login?resolve'
import indexPath from '~/pages/index/index?resolve'
import pageApplyExpectPost from '../applyExpectPost/applyExpectPost?resolve'

const STATE_ARRAY = [AT_SCHOOL, JOB_HUNTING_STATUS]
const select = { STATE_ARRAY, DEGREES, GENDER, JOB_DATE_TYPE, WORK_YEARS }
const app = getApp()

createPage({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------

  data: {
    loginFlag: false,
    isAuth: false,
    realName: '',
    genderIndex: 0,
    genderText: '',
    birthDate: '',
    endYear: new Date().getFullYear() - 16 + '-12-31',
    degreeIndex: 0,
    degreeText: '',
    workYearIndex: 0,
    workYearText: '',
    stateIndex: [0, 0],
    stateText: '',
    mobile: '',
    careerTypeIndex: 0,
    careerText: '',
    region: [[], [], []],
    provinceIndex: 0,
    cityIndex: 0,
    townIndex: 0,
    provinceLabel: '',
    cityLabel: '',
    townLabel: '',
    provinceList: [],
    cityList: {},
    townList: {},
    isIpx: false,
    columnChanging: false,
    select,
    expectPost: {
      value: [],
      text: ''
    }
  },

  // -------------------------------------------------------------------------
  // 页面计算属性
  // -------------------------------------------------------------------------

  computed: {
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
        this.cityLabel &&
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

  onShow () {
    api.setLog(1, '/jianzhi/my/basic')
  },

  async onLoad () {
    util.showLoading()

    const allCityList = await app.getAllCityList()

    this.isIpx = app.globalData.isIpx
    this.loginFlag = wx.getStorageSync('userId') > 0
    this.__transformProvinceCityTown(allCityList)
    util.hideLoading()

    if (this.loginFlag) {
      await this.initData()
    } else {
      this.selectComponent('#dialog').showDialog()
    }
  },

  methods: {
    // -------------------------------------------------------------------------
    // 页面bind的事件
    // -------------------------------------------------------------------------

    /**
     * 登录组件手机号授权反馈
     */
    async bindGetPhoneNumberCallBack (e) {
      await app.getPhoneNumber(e)
      this.initData()
    },

    /**
     * 账号登录
     */
    bindAccountLogin () {
      wx.navigateTo({ url: `${loginPath}?callbackName=initData` })
    },

    bindNameInput (e) {
      this.realName = e.detail.value
    },

    bindGenderPickerChange (e) {
      this.genderIndex = ~~e.detail.value
      this.genderText = GENDER[e.detail.value].label
    },

    bindBirthdayPickerChange (e) {
      this.birthDate = e.detail.value
    },

    bindEducationPickerChange (e) {
      this.degreeIndex = parseInt(e.detail.value)
      this.degreeText = DEGREES[e.detail.value].label
    },

    bindWorkExperiencePickerChange (e) {
      this.workYearIndex = ~~e.detail.value
      this.workYearText = WORK_YEARS[e.detail.value].label
    },

    bindStateMultiPickerChange (e) {
      const [oneIndex, twoIndex] = e.detail.value
      this.stateIndex = [oneIndex, twoIndex]
      this.stateText = `${STATE_ARRAY[0][oneIndex].label} ${STATE_ARRAY[1][twoIndex].label}`
    },

    bindCareerTypePickerChange ({ detail: { value } }) {
      const careerText = JOB_DATE_TYPE[value].label
      if (this.careerText === careerText) return

      this.careerTypeIndex = +value
      this.careerText = careerText
      this.expectPost = { value: [], text: '' }
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

    async bindSubmit () {
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=preservation')

      const {
        realName,
        genderIndex,
        birthDate,
        stateIndex,
        workYearIndex,
        degreeIndex,
        careerTypeIndex,
        expectPost,
        provinceIndex,
        cityIndex,
        townIndex
      } = this

      const params = {
        real_name: realName,
        gender: GENDER[genderIndex].value,
        birth_date: `${birthDate}01`,
        at_school: AT_SCHOOL[stateIndex[0]].value,
        job_hunting_status: JOB_HUNTING_STATUS[stateIndex[1]].value,
        work_years: WORK_YEARS[workYearIndex].value,
        degree: DEGREES[degreeIndex].value,
        job_date_type: JOB_DATE_TYPE[careerTypeIndex].value,
        job_type_relation: JSON.stringify(expectPost.value),
        place: JSON.stringify({
          province: provinceIndex,
          city: cityIndex,
          district: townIndex
        })
      }

      try {
        const res = await util.getData(`user/store/basic`, params, 'POST')
        const { code } = res.data

        if (code === 1000) {
          wx.showToast({
            title: '保存成功',
            success: () => {
              setTimeout(() => {
                getCurrentPages().length > 1
                  ? wx.navigateBack()
                  : wx.switchTab({ url: indexPath })
              }, 800)
            }
          })
        } else {
          app.showErrorToastHandler(res.data)
        }
      } catch (err) {
        app.showErrorToastHandler(err)
      }
    },

    // -------------------------------------------------------------------------
    // 页面方法, 双下划线开头表示私有方法, 供内部调用
    // -------------------------------------------------------------------------

    async initData () {
      util.showLoading()
      this.$nextTick(() => this.selectComponent('#dialog').hideDialog())

      try {
        const res = await util.getData(`user/info/basic`)
        const { code, msg, data } = res.data

        if (code === 1000) {
          const { profile } = data
          const { place, job_type_relation } = profile
          const findIdx = (obj, value) => {
            const idx = obj.findIndex(x => x.value === ~~value)
            return idx > -1 ? idx : 0
          }

          this.isAuth = profile.is_auth // - 是否认证过
          this.realName = profile.real_name // - 姓名
          this.mobile = profile.mobile // - 手机号

          if (profile.gender > 0) { // - 性别
            this.genderIndex = findIdx(GENDER, profile.gender)
            this.genderText = profile.gender_text
          }
          if (+profile.birth_date) { // - 出生年份
            this.birthDate = profile.birth_date.substr(0, 4) // - 保存的时候带了月份,这里把月份截取掉,只留下前四位年份
          }
          if (profile.degree > -1) { // - 学历
            this.degreeIndex = findIdx(DEGREES, profile.degree)
            this.degreeText = profile.degree_text
          }
          if (profile.work_years > 0) { // - 工作经验
            this.workYearIndex = findIdx(WORK_YEARS, profile.work_years)
            this.workYearText = profile.work_year_text
          }
          if (profile.at_school > -1) { // - 当前状态
            this.stateIndex = [
              findIdx(AT_SCHOOL, profile.at_school),
              findIdx(JOB_HUNTING_STATUS, profile.job_hunting_status)
            ]
            this.stateText = `${STATE_ARRAY[0][profile.at_school].label} ${profile.job_hunting_status_text}`
          }

          if (profile.job_date_type > -1) { // - 求职类型
            this.careerTypeIndex = findIdx(JOB_DATE_TYPE, profile.job_date_type)
            this.careerText = profile.job_date_type_text
          }

          if (place.province) { // - 期望城市
            this.provinceIndex = place.province
            this.provinceLabel = place.province_text
            this.cityIndex = place.city
            this.cityLabel = place.city_text
            this.townIndex = place.district
            this.townLabel = place.district_text
          }

          const jobTypeRelation = []
          job_type_relation.forEach(x => { // - 全职兼职同职位去重
            if (!jobTypeRelation.some(xx => xx.value === x.value)) jobTypeRelation.push(x)
          })
          app.globalData.expectPost =
            this.expectPost = { // - 期望岗位
              value: jobTypeRelation,
              text: [...new Set(jobTypeRelation.map(x => x.name))].join(' ')
            }
        } else {
          util.showToast(msg)
        }
      } catch (err) {
        app.showErrorToastHandler(err)
      }

      util.hideLoading()
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
    }
  }
})
