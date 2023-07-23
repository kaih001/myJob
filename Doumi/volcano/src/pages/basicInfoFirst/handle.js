import { createPage } from '@mpxjs/core'
import api from '~/utils/api'
import util from '~/utils/util'
import globalDataStore from '~/store/globalData'
import { AT_SCHOOL, DEGREES, GENDER, YEARS, JOB_DATE_TYPE } from '~/data/options'
import pageApplyExpectPost from '~/subpackage/subA/pages/applyExpectPost/applyExpectPost?resolve'

let cacheIdxs = [-1, -1, -1] // - 缓存索引以用来和后续选择的做对比, -1 表示一开始未选中任何

const app = getApp()
const STATE_ARRAY = [AT_SCHOOL, YEARS, DEGREES]
const select = { AT_SCHOOL, GENDER, STATE_ARRAY, JOB_DATE_TYPE }
const PICKER_1_NOOP_VALUE = [0, 30, 2]
const PICKER_2_NOOP_VALUE = 0
const findIdx = (obj, value) => obj.findIndex(x => x.value === ~~value)

createPage({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------

  data: {
    provinceList: [],
    province: { name: '' },
    cityList: {},
    city: { name: '' },
    townList: {},
    town: { name: '' },
    region: [[], [], []],
    select,
    realName: '',
    gender: '',
    state: [-1, -1, -1],
    careerIndex: -1,
    jobHuntingStatus: '',
    workYears: '',
    expectPost: {
      value: [],
      text: ''
    },
    isCompleteBaseInfo: false, // 是否完善了基本信息(仅针对首屏load)
    isCompleteExpect: false, // 是否完善了意向信息(仅针对首屏load)
    isUpdateLayout: false, // 是否强制更新布局(上下排版)
    iseqhd: false // 是否展示疫情活动文案
  },

  watch: {
    isUpdateLayout (val) {
      if (val) {
        this.isCompleteBaseInfo = this.__isComplete[0]
        this.isCompleteExpect = this.__isComplete[1]
      }
    }
  },

  // -------------------------------------------------------------------------
  // 计算属性
  // -------------------------------------------------------------------------

  computed: {
    ...globalDataStore.mapState(['isIpx', 'isBindPhone']),
    __isComplete () {
      const isCompleteBaseInfo = !!( // - 基本信息
        this.realName &&
        this.gender !== '' &&
        this.state[0] !== -1 &&
        this.state[1] !== -1 &&
        this.state[2] !== -1
      )
      const isCompleteExpect = !!( // - 意向信息
        this.careerIndex !== -1 &&
        this.town.name &&
        (this.expectPost.text || this.careerIndex === 3)
      )

      return [isCompleteBaseInfo, isCompleteExpect]
    },
    buttonState () {
      return !(this.__isComplete[0] && this.__isComplete[1])
    }
  },

  // -------------------------------------------------------------------------
  // 小程序生命周期
  // -------------------------------------------------------------------------

  async onLoad ({ scene }) {
    // 扫码进来的参数处理。
    if (scene) {
      scene = util.decodeURI(scene)
      var iseqhd = util.getQueryFieldVal(scene, 'iseqhd')
      if (iseqhd) {
        this.iseqhd = iseqhd === 1 || iseqhd === '1'
        if (this.iseqhd) {
          wx.setNavigationBarTitle({
            title: '斗米'
          })
        }
      }
    }
    if (this.isBindPhone) {
      this.__initData()
    } else {
      this.selectComponent('#dmPicker1').updateDetaultValue(PICKER_1_NOOP_VALUE)
      this.selectComponent('#dmPicker2').updateDetaultValue(PICKER_2_NOOP_VALUE)
      this.isUpdateLayout = true
    }

    const allCityList = await app.getAllCityList()
    this.__transformProvinceCityTown(allCityList)
    this.setIsJumpBasicInfo(true)
  },

  onShow () {
    api.setLog(1, '/jianzhi/guide/expect')
  },

  methods: {
    ...globalDataStore.mapMutations(['setIsJumpBasicInfo']),

    // -------------------------------------------------------------------------
    // 页面bind的事件
    // -------------------------------------------------------------------------

    bindSetLog ({ currentTarget: { dataset: { logType } } }) {
      api.setLog(2, `@atype=click@ca_name=doumi@ca_source=h5@ca_from=${logType}`)
    },

    bindClickSkip () {
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=skip')

      if (getCurrentPages().length === 1) { // - 1个页面实例, 表示从模板推送直接进来的该页面, 此时点 `跳过` 需要直接回到首页
        wx.switchTab({ url: '../index/index' })
      } else {
        wx.navigateBack({ delta: 1000 })
      }
    },

    bindNameInput ({ detail: { value } }) {
      this.realName = value
    },

    bindGenderChange ({ detail: { value } }) {
      this.gender = ~~value
    },

    bindStateMultiPickerConfirm ({ detail: { value } }) {
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=t_sure')
      this.state = value
    },

    bindStateMultiPickerCancel () {
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=t_cancel')
    },

    bindCityChange ({ detail: { value } }) {
      const { provinceList, cityList, townList, region } = this

      if (cacheIdxs[0] !== value[0]) { // - 省份发生变化
        region[1] = cityList[provinceList[value[0]].id]
        region[2] = townList[cityList[provinceList[value[0]].id][0].id]
      }
      if (cacheIdxs[1] !== value[1]) { // - 市发生变化
        region[2] = townList[cityList[provinceList[value[0]].id][value[1]].id]
      }
      if (cacheIdxs[2] !== value[2]) { // - 区发生变化

      }

      cacheIdxs = value // - 更新缓存的索引值
      this.$forceUpdate()
    },

    /**
     * 城市选择确定时触发
     */
    bindCityConfirm ({ detail: { source } }) {
      this.province = source[0]
      this.city = source[1]
      this.town = source[2]
    },

    /**
     * 期望职位选择
     */
    bindSelectPost (e) {
      this.bindSetLog(e)
      if (this.careerIndex === -1) {
        wx.showToast({
          title: `请先选择${!this.iseqhd ? '求职类型' : '当前岗位类型'}`, // 提示的内容,
          icon: 'none', // 图标,
          duration: 2000, // 延迟时间,
          mask: true // 显示透明蒙层，防止触摸穿透,
        })
      } else {
        app.globalData.expectPost = this.expectPost
        wx.navigateTo({ url: `${pageApplyExpectPost}?careerType=${this.careerIndex}` })
      }
    },

    /**
     * 求职类型选择
     */
    bindCareerTypePickerChange ({ detail: { value } }) {
      if (this.careerIndex === +value) return
      this.careerIndex = +value
      this.expectPost = {
        value: [],
        text: ''
      }
    },

    /**
     * 提交表单保存7个字段信息
     */
    async bindClickOk () {
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=sure')
      const {
        realName,
        gender,
        state,
        careerIndex,
        jobHuntingStatus, // - 当前状态(可选参数)
        workYears, // - 工作经验(可选参数)
        expectPost
      } = this

      const params = {
        real_name: realName,
        gender,
        job_hunting_status: jobHuntingStatus,
        birth_date: `${STATE_ARRAY[1][state[1]]}01`,
        at_school: AT_SCHOOL[state[0]].value,
        work_years: workYears,
        degree: DEGREES[state[2]].value,
        // degree: state[2],
        job_date_type: careerIndex,
        job_type_relation: JSON.stringify(expectPost.value),
        place: JSON.stringify({
          province: this.province.id,
          city: this.city.id,
          district: this.town.id
        })
      }

      try {
        console.log(params)
        const res = await util.getData(`user/store/basic`, params, 'POST')
        const { code, msg } = res.data

        if (code === 1000) {
          wx.showToast({
            title: '保存成功',
            success: () => {
              setTimeout(() => {
                // - 1个页面实例, 表示从模板推送直接进来的该页面, 意向职位的信息也有了, 此时点 `跳过` 需要直接回到首页
                if (this.iseqhd) {
                  // 打开水滴保小程序
                  wx.navigateToMiniProgram({
                    appId: 'wx274d646e4a33808a',
                    path: `/pages/view/index?url=${encodeURIComponent('https://www.sdbao.com/cps/landing/I0NDgxNjM4NA/ax_sdwyb_zx?pageStyle=common&subchannel=FR_doumi_01_ax_sdwyb_zx_ldy&channel=sdbbtt')}`,
                    success: function () {
                      // 成功进入水滴保小程序，关闭水滴保小程序后，进入斗米首页
                      wx.reLaunch({ url: '/pages/index/index' })
                    },
                    fail: function (err) {
                      console.log(err)
                    }
                  })
                } else if (getCurrentPages().length === 1) {
                  wx.switchTab({ url: '../index/index' })
                } else {
                  wx.navigateBack({ delta: 1000 })
                  wx.navigateBack()
                }
              }, 800)
            }
          })
        } else {
          wx.showToast({ title: msg, icon: 'none' })
        }
      } catch (err) {
        app.showErrorToastHandler(err)
      }
    },

    /**
     * 未登录时点击 `完成` 授权手机号登录
     */
    async bindGetPhoneNumber (e) {
      await app.getPhoneNumber(e)
      this.bindClickOk()
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=login_success@from=resume')
    },

    // -------------------------------------------------------------------------
    // 页面方法, 双下划线开头表示私有方法, 供内部调用
    // -------------------------------------------------------------------------

    async __initData () {
      util.showLoading()

      try {
        const res = await util.getData(`user/info/basic`)
        const { code, data } = res.data

        if (code === 1000) {
          const { profile } = data
          const { place, job_type_relation } = profile
          let { careerIndex, region } = this

          if (profile.gender > 0) { // - 性别
            this.gender = GENDER[findIdx(GENDER, profile.gender)].value
          }
          if (profile.at_school > -1) { // - 身份
            this.state[0] = findIdx(AT_SCHOOL, profile.at_school)
          }
          if (+profile.birth_date) { // - 出生年份
            this.state[1] = YEARS.indexOf(profile.birth_date.substr(0, 4)) // - 保存的时候带了月份,这里把月份截取掉,只留下前四位年份
          }
          if (profile.degree > -1) { // - 学历
            this.state[2] = findIdx(DEGREES, profile.degree)
          }
          if (profile.job_date_type > -1) { // - 求职类型
            this.careerIndex = findIdx(JOB_DATE_TYPE, profile.job_date_type)
          }
          if (place.province) { // - 期望城市
            this.province = { id: place.province, name: place.province_text }
            this.city = { id: place.city, name: place.city_text }
            this.town = { id: place.district, name: place.district_text }

            // 更新当前的省市区列表
            region[1] = this.cityList[this.province.id]
            region[2] = this.townList[region[1].find(x => x.id === this.city.id).id]

            this.$nextTick(() => {
              const cityValue = this.__getCityValue()
              this.selectComponent('#dmPicker3').updateDetaultValue(cityValue)
            })
          } else {
            // - 库里无城市信息时拉取一下定位城市作为展示
            // await this.__getLocationCityInfo()
          }
          if (profile.work_years > 0) { // - 工作经验
            this.workYears = profile.work_years
          }
          if (profile.job_hunting_status && profile.job_hunting_status !== '0') { // - 当前状态
            this.jobHuntingStatus = profile.job_hunting_status
          } else {
            this.jobHuntingStatus = 1
          }

          const jobTypeRelation = []
          job_type_relation.forEach(x => { // - 全职兼职同职位去重
            if (!jobTypeRelation.some(xx => xx.value === x.value)) jobTypeRelation.push(x)
          })

          this.expectPost = app.globalData.expectPost = { // - 期望岗位
            value: jobTypeRelation,
            text: [...new Set(jobTypeRelation.map(x => x.name))].join(' ')
          }
          this.realName = profile.real_name

          this.$nextTick(() => {
            const ste = [...this.state]

            // 无信息时回归默认值的选中态
            if (ste[0] < 0) ste[0] = PICKER_1_NOOP_VALUE[0]
            if (ste[1] < 0) ste[1] = PICKER_1_NOOP_VALUE[1]
            if (ste[2] < 0) ste[2] = PICKER_1_NOOP_VALUE[2]
            if (careerIndex < 0) careerIndex = PICKER_2_NOOP_VALUE

            // 将新值更新到组件
            this.selectComponent('#dmPicker1').updateDetaultValue(ste)
            this.selectComponent('#dmPicker2').updateDetaultValue(careerIndex)
          })
          this.isUpdateLayout = true
          util.hideLoading()
        } else {
          app.showErrorToastHandler(res.data)
        }
      } catch (err) {
        app.showErrorToastHandler(err)
      }
    },

    /**
     * 获取当前定位城市的信息(默认选中的省市区)
     */
    // async __getLocationCityInfo () {
    //   let longitude = ''
    //   let latitude = ''
    //   try {
    //     if (!app.globalData.locationData) {
    //       const locationData = await app.checkAuthAndGetLocation(false)
    //       longitude = locationData.longitude
    //       latitude = locationData.latitude
    //     }
    //   } catch (err) {} // - 拒绝地理位置授权或者授权失败

    //   const res = await util.getData(`common/area/${latitude},${longitude}`)
    //   const { code, data } = res.data
    //   const { cityList, townList, region } = this

    //   if (code === 1000) {
    //     region[1] = cityList[data.province.id]
    //     region[2] = townList[cityList[data.province.id][0].id]

    //     this.setData({ region }, () => {
    //       this.setData({
    //         province: data.province, // 省
    //         city: data.city, // 市
    //         town: data.district // 区
    //       })
    //     })
    //   }
    // },

    __getCityValue () {
      const { region, province, city, town } = this
      const findIdx = (obj, id) => obj.findIndex(x => ~~x.id === ~~id)

      return [
        findIdx(region[0], province.id),
        findIdx(region[1], city.id),
        findIdx(region[2], town.id)
      ]
    },

    /**
     * 转换城市数据
     * @param {Object[]} list - 接口或者缓存中获取的所有城市数据
     */
    __transformProvinceCityTown (list) {
      const { provinceList, cityList, townList, region } = this

      list.forEach(province => {
        provinceList.push({
          id: province.province_id,
          name: province.short_name
        })
        cityList[province.province_id] = []
        province.cities.forEach(city => {
          cityList[province.province_id].push({
            id: city.city_id,
            name: city.short_name
          })
          townList[city.city_id] = []
          city.districts.forEach(town => {
            townList[city.city_id].push({
              id: town.district_id,
              name: town.short_name
            })
          })
        })
      })
      region[0] = provinceList
      region[1] = cityList[provinceList[0].id]
      region[2] = townList[cityList[provinceList[0].id][0].id]

      this.setData({ provinceList, cityList, townList, region })
    }
  }
})
