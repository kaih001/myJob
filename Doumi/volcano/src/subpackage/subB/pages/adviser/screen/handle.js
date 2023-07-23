import { util, api, app } from '../../../../../allJS.js'
import { createPage } from '@mpxjs/core'
import pageScreenDetail from '../screenDetail/screenDetail?resolve'

createPage({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------
  data: {
    cityValue: [0, 0, 0],
    jobValue: [0, 0],
    btnSelectValue: [['0'], [], ['0'], ['0'], ['0'], []],
    // 城市数据
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
    // 职位类型
    jobType: [[], []],
    jobTypeText: '',
    // 性别按钮筛选条件
    sexList: [
      { label: '全部', value: '0' },
      { label: '男', value: '1' },
      { label: '女', value: '2' }
    ],
    // 福利按钮筛选条件
    treatmentList: [],
    // 身份按钮筛选条件
    identityList: [
      { label: '全部', value: '0' },
      { label: '学生可做', value: '1' },
      { label: '非学生可做', value: '3' }
    ],
    // 职位要求按钮筛选条件
    workTypeList: [
      { label: '全部', value: '0' },
      { label: '只看兼职', value: '1' },
      { label: '只看全职', value: '2' }
    ],
    // 排序方式按钮筛选条件
    orderList: [],
    // 其他按钮筛选条件
    otherList: [
      { label: '工资保障', value: '0' },
      { label: '日结', value: '1' }
    ],
    // 城市id
    city_id: 0,
    // 区域id
    district_id: 0,
    // 职位类型
    job_type: 0,
    // 性别
    sex: 0,
    // 福利
    treatment: '',
    // 身份要求
    identity: 0,
    // 职位要求
    work_type: 0,
    // 排序
    order_type: 0,
    // 工资保障
    is_wages_guarantee: 0,
    // 日结
    payment_type: 0,
    // 搜索中防止多次点击
    submitIng: false,
    // 网络状态组件显示状态
    showErrorTemp: false,
    errorType: ''

  },

  // -------------------------------------------------------------------------
  // 小程序生命周期
  // -------------------------------------------------------------------------
  async onLoad () {
    this.init()
    // pv埋点
    let jobAdviser = wx.getStorageSync('jobAdviser')
    api.setLog(1, '/jianzhi/gw/select', { ca_campaign: jobAdviser })
  },
  onShow () {

  },
  // -------------------------------------------------------------------------
  // 页面bind的事件
  // -------------------------------------------------------------------------
  /**
     * 点击搜索框跳转到搜索页面
     */
  bindJumpSearchPage () {
    api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=search')
    wx.navigateTo({ url: '/pages/search/search' })
  },

  /**
     * 修改城市信息
     */
  async bindregionPickerChange ({ detail: { value } }) {
    await this.bindColumnchangeCity({
      detail: { column: 0, value: value[0] }
    })
    await this.bindColumnchangeCity({
      detail: { column: 1, value: value[1] }
    })

    this.cityValue = value,
    this.provinceLabel = this.region[0][value[0]].short_name,
    this.provinceIndex = this.region[0][value[0]].id,
    this.cityLabel = this.region[1][value[1]].short_name,
    this.cityIndex = this.region[1][value[1]].id,
    this.townLabel = this.region[2][value[2]].short_name,
    this.townIndex = this.region[2][value[2]].id,
    this.city_id = this.region[1][value[1]].id,
    this.district_id = this.region[2][value[2]].id
  },

  bindColumnchangeCity ({ detail: { column, value } }) {
    switch (column) {
      case 0:
        this.region[1] = this.cityList[this.provinceList[value].id]
        this.region[2] = this.townList[this.cityList[this.provinceList[value].id][0].id]
        break
      case 1:
        this.region[2] = this.townList[this.region[1][value].id]
        break
    }
    return new Promise(resolve => this.setData({ region: this.region }, resolve))
  },

  /**
     * 选择职位类型
     */
  bindSelectJobType ({ detail: { value } }) {
    let [job_type, jobTypeText] = [this.jobType[1][value[1]].value, this.jobType[0][value[0]].name + ' ' + this.jobType[1][value[1]].name]
    this.job_type = job_type
    this.jobTypeText = jobTypeText
    this.jobValue = value
  },
  bindColumnchangeJobType ({ detail: { column, value } }) {
    if (!column) {
      this.jobType[1] = this.jobType[0][value].items
    }
    this.setData({ jobType: this.jobType })
  },

  /**
     * 选择工资保障，日结，斗米自营
     */
  bindChangeOther ({ detail: { value } }) {
    this.is_wages_guarantee = 0
    this.payment_type = 0
    if (!value.length) return
    value.forEach(i => {
      if (i === '0') {
        this.is_wages_guarantee = 1
      } else if (i === '1') {
        this.payment_type = 1
      }
    })
  },

  /**
     * 重置
     */
  bindReset () {
    this.cityValue = [0, 0, 0]
    this.jobValue = [0, 0]
    this.btnSelectValue = [['0'], [], ['0'], ['0'], ['0'], []]
    this.provinceLabel = ''
    this.cityLabel = ''
    this.townLabel = ''
    this.jobTypeText = ''
    // 城市id
    this.city_id = 0
    // 区域id
    this.district_id = 0
    // 职位类型
    this.job_type = 0
    // 性别
    this.sex = 0
    // 福利
    this.treatment = ''
    // 身份要求
    this.identity = 0
    // 职位要求
    this.work_type = 0
    // 排序
    this.order_type = 0
    // 工资保障
    this.is_wages_guarantee = 0
    // 日结
    this.payment_type = 0
  },

  /**
     * 搜索
     */
  async bindSubmit () {
    if (this.submitIng) return
    if (!this.city_id && !this.district_id) {
      util.showToast('请选择地址')
      return
    }

    let params = {
      city_id: Number(this.city_id),
      district_id: Number(this.district_id),
      job_type: Number(this.job_type),
      sex: Number(this.btnSelectValue[0][0]),
      identity: Number(this.btnSelectValue[2][0]),
      work_type: Number(this.btnSelectValue[3][0]),
      order_type: Number(this.btnSelectValue[4][0]),
      is_wages_guarantee: Number(this.is_wages_guarantee),
      payment_type: Number(this.payment_type)
    }
    if (this.btnSelectValue[1].length) {
      params.treatment = this.btnSelectValue[1].join(',')
    }

    // 储存筛选条件
    wx.setStorageSync('adviserScreenParams', params)
    wx.navigateTo({ url: pageScreenDetail })
  },

  // -------------------------------------------------------------------------
  // 页面方法, 双下划线开头表示私有方法, 供内部调用
  // -------------------------------------------------------------------------

  // 页面初始化/用于无网络重新加载 template/error
  async init () {
    wx.getSystemInfo({
      success: res => {
        // model中包含着设备信息
        this.isIpx = res.model.search('iPhone X') !== -1
      }
    })
    // 获取筛选条件数据
    this.__getData()
    // 获取城市数据并初始化数据
    const allCityList = await app.getAllCityList()
    this.__transformProvinceCityTown(allCityList)
  },
  // 获取页面初始化数据
  async __getData () {
    util.showLoading()
    try {
      const res = await util.getData('client/aggregation/consultant/filtermenu')
      let { data, code } = res.data
      util.hideLoading()

      if (code === 1000) {
        console.log(data)
        // 初始化职位类型数据
        this.__jobTypeinfo(data.job_type)
        this.orderList = data.order
        this.treatmentList = data.treatment
      } else {
        app.showErrorToastHandler(res.data)
      }
    } catch (err) {
      util.hideLoading()
      this.showErrorTemp = true,
      this.errorType = err === 'offline' ? 'offline' : 'loadFail'
    }
  },

  // 初始化城市数据
  __transformProvinceCityTown (list) {
    list.forEach(province => {
      this.provinceList.push({
        id: province.province_id,
        short_name: province.short_name
      })
      this.cityList[province.province_id] = []
      province.cities.forEach(city => {
        this.cityList[province.province_id].push({
          id: city.city_id,
          short_name: city.short_name
        })
        this.townList[city.city_id] = []
        city.districts.forEach((town,i) => {
          // 添加不限
          if(city.districts.length>1&&i==0){
            this.townList[city.city_id].push({
              id: 0,
              short_name: '不限'
            })
          }

          this.townList[city.city_id].push({
            id: town.district_id,
            short_name: town.short_name
          })
        })
      })
    })

    this.region[0] = this.provinceList
    this.region[1] = this.cityList[this.provinceList[0].id]
    this.region[2] = this.townList[this.cityList[this.provinceList[0].id][0].id]
  },

  // 初始化职位类型数据
  __jobTypeinfo (list) {
    this.jobType[0] = list
    this.jobType[1] = this.jobType[0][0].items
  }
})