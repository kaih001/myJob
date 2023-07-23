import { util, encrypt } from '../../../../../allJS.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    radioItems: [{ name: '男', value: '1' }, { name: '女', value: '0' }],
    ageList: [],
    educationList: [
      '初中以下',
      '初中',
      '高中',
      '中专',
      '大专',
      '本科',
      '硕士',
      '博士及以上'
    ],
    sceneList: ['2018-12-17 14:00-17:00', '2018-12-18 14:00-17:00'],
    mobile: '',
    real_name: '',
    gender: '',
    degree: '',
    age: '',
    ageIndex: '',
    interviewId: '',
    post_id: '',
    addressList: [], // 工作地点列表
    interviewLists: [], // 面试时间总的列表
    interviewList: [], // 面试时间列表
    isSubmit: false,
    isName: false,
    isMobile: false,
    isSex: false,
    isAge: false,
    isDegree: false,
    isAddress: false,
    isInterview: false,
    submitFlag: true, // 提交状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.setData({
      post_id: options.post_id
      // interviewList: JSON.parse(options.interview)
    })
    this.getAddressList()
    this.ageListFuc()
    // this.interviewListFuc()
  },

  /**
   * 获取工作地点和约面时间
   */
  getAddressList () {
    const time = new Date().getTime()
    const zid = 1
    const post_id = this.data.post_id
    const sStr = '' + zid + post_id + time + encrypt.md5_key
    const sign = encrypt.md5(sStr)
    const url = 'post/detail'
    const params = { id: zid, post_id, time, sign }

    util.requestByPost(
      url,
      params,
      false,
      res => {
        if (res.data.code === 200) {
          const { address } = res.data.data
          let addressList = address.map((x, i) => {
            return x.address
          })
          let interviewLists = address.map((x, i) => {
            return Object.values(x.interview)
          })

          this.setData({
            addressList,
            interviewLists,
            interviewList: interviewLists[0]
          })
        }
      },
      err => {
        util.showToast(err.message)
      }
    )
  },

  // 遍历年龄
  ageListFuc () {
    var array = []
    for (var i = 18; i <= 55; i++) {
      array.push(i)
    }
    this.setData({
      ageList: array
    })
  },

  // 遍历面试场次
  interviewListFuc () {
    var that = this
    var interviewdate
    var start_time
    var end_time
    var range_time
    var interviewtime
    var interviewtimeArray = []
    for (var j = 0; j < that.data.interviewList.length; j++) {
      interviewdate = that.data.interviewList[j].date
      interviewdate = interviewdate.replace('/', '月')
      start_time = that.data.interviewList[j].start
      end_time = that.data.interviewList[j].end
      range_time = start_time + '-' + end_time
      interviewtime = interviewdate + '日 ' + range_time
      interviewtimeArray.push(interviewtime)
    }
    this.setData({
      sceneList: interviewtimeArray
    })
  },

  // 男女单选事件
  radioChange (e) {
    var checked = e.detail.value
    if (checked == 1 || checked == 2) {
      this.setData({
        isSex: true
      })
    }
    var changed = {}
    for (var i = 0; i < this.data.radioItems.length; i++) {
      if (checked.indexOf(this.data.radioItems[i].name) !== -1) {
        changed['radioItems[' + i + '].checked'] = true
      } else {
        changed['radioItems[' + i + '].checked'] = false
      }
    }
    this.setData(changed)
  },

  // 选择年龄
  bindAgeChange (e) {
    console.log('年龄' + e.detail.value)
    this.setData({
      ageIndex: e.detail.value
    })
    if (e.detail.value != '') {
      this.setData({
        isAge: true
      })
    }
  },

  // 选择学历
  bindEducationChange (e) {
    this.setData({
      education: e.detail.value
    })
    if (e.detail.value != '') {
      this.setData({
        isDegree: true
      })
    }
  },

  // 选择工作地点
  bindAddressChange (e) {
    let address = e.detail.value
    this.setData({
      address: e.detail.value
    })
    let interviewList = this.data.interviewLists[address]

    if (address !== '') {
      this.setData({
        isAddress: true,
        interviewList
      })
    }

    this.interviewListFuc()
  },

  // 选择面试场次
  bindSceneChange (e) {
    var that = this
    var interviewId = JSON.stringify(that.data.interviewList[e.detail.value].id)
    this.setData({
      scene: e.detail.value,
      interviewId: interviewId
    })
    if (e.detail.value !== '') {
      this.setData({
        isInterview: true
      })
    }
  },
  // 表单提交事件
  formSubmit (e) {
    var that = this
    console.log(
      'form发生了submit事件，携带数据为：',
      JSON.stringify(e.detail.value)
    )
    this.setData({
      mobile: e.detail.value.phone,
      real_name: e.detail.value.name,
      gender: e.detail.value.gender,
      age: e.detail.value.age
    })
    if (e.detail.value.education === '初中以下') {
      that.setData({
        degree: 0
      })
    } else if (e.detail.value.education === '初中') {
      that.setData({
        degree: 6
      })
    } else if (e.detail.value.education === '高中') {
      that.setData({
        degree: 1
      })
    } else if (e.detail.value.education === '中专') {
      that.setData({
        degree: 7
      })
    } else if (e.detail.value.education === '大专') {
      that.setData({
        degree: 2
      })
    } else if (e.detail.value.education === '本科') {
      that.setData({
        degree: 3
      })
    } else if (e.detail.value.education === '硕士') {
      that.setData({
        degree: 4
      })
    } else if (e.detail.value.education === '博士及以上') {
      that.setData({
        degree: 5
      })
    }

    if (
      that.data.isName &&
      that.data.isMobile &&
      that.data.isSex &&
      that.data.isAge &&
      that.data.isDegree &&
      that.data.isInterview
    ) {
      that.formSubmitData()
    } else {
    }
  },
  watchChange (e) {
    if (e.currentTarget.dataset.applyType == 'inputName') {
      if (e.detail.value != '') {
        this.setData({
          isName: true
        })
      }
    } else if (e.currentTarget.dataset.applyType == 'inputMobile') {
      this.setData({
        isMobile: true
      })
    }
  },

  // 表单提交，字段验证
  formSubmitData () {
    // 校验姓名和手机号
    let that = this
    var reg = /[^\u4E00-\u9FA5\·]/
    if (reg.test(that.data.real_name)) {
      wx.showToast({
        title: '请输入真实姓名',
        icon: 'none'
      })
      
    } else if (!/^1\d{10}$/.test(that.data.mobile)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return
    } else {
      that.formSubmitHandle()
    }
  },

  // 表单提交，请求接口
  formSubmitHandle (loadingType = true) {
    let that = this
    that.setData({
      submitFlag: false
    })
    let auth_str = wx.getStorageSync('auth_str')
    let time = new Date().getTime()
    let str =
      that.data.mobile +
      '' +
      that.data.post_id +
      '' +
      that.data.interviewId +
      '' +
      time +
      encrypt.md5('api_mini-opt-key')
    let sign = encrypt.md5(str)
    let url = 'post/recommend'
    util.requestByPost(
      url,
      {
        mobile: that.data.mobile,
        real_name: that.data.real_name,
        gender: that.data.gender,
        degree: that.data.degree,
        age: that.data.age,
        interview_id: that.data.interviewId,
        post_id: that.data.post_id,
        time: time,
        sign: sign
      },
      loadingType,
      res => {
        if (res.data.code == 200) {
          wx.showToast({
            title: '系统已安排面试，请跟候选人确认是否收到面试短信',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
            that.setData({
              submitFlag: true
            })
          }, 3000)
        } else {
          wx.showToast({
            icon: 'none',
            title: res.data.message
          })
          that.setData({
            submitFlag: true
          })
          // util.showToast(res.data.message);
        }
      },
      err => {
        that.setData({
          submitFlag: true
        })
      }
    )
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {}

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage () {

  // }
})
