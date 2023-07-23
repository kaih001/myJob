import { api, app, util } from '../../../../allJS.js'
import pageApplyExpectPost from '../applyExpectPost/applyExpectPost?resolve'
import pageMyInterviewDetail from '~/pages/myInterviewDetail/myInterviewDetail?resolve'
import pageIndex from '~/pages/index/index?resolve'
import sendMsgMixin from '~/mixins/sendmsg'
import cityStore from '~/store/city'

let dmch = ''

Page({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------
  mixins: [sendMsgMixin],
  data: {
    consultingDisplay: 0,
    consultingInfo: '',
    showDesc: '',
    isChaoJianZhi: false,
    options: null,
    clickGoToJobList: false,
    region: [[], [], []],
    provinceLabel: '',
    cityLabel: '',
    townLabel: '',
    provinceList: [],
    cityList: {},
    townList: {},
    expectPost: {
      value: [],
      text: ''
    },
    expectRegion: {
      value: {},
      text: ''
    },
    value: [0, 0, 0],
    tmpIds: ['YGAiN3Xfhcci6OatPJvVHkES9kqpVuecYU2NefOSz5w', 'suhgSX5on1VQgF3MrtjbqHLrzULlc4CwfL7vXezc5pI'],
    isShowSendMsg: false, // - 展示订阅消息banner
    isExpectComplete: true, // - 求职意向是否完善
    isInterview: false, // - 是否是约面流程
    phoneContact:{},//电话联系是否符合要求
    jobId: '',
    biz_qrcode:'',
    isShowWebView: false,
    url:wx.getStorageSync('thrid_web_go')||'https://wd717cn.doumistatic.com/',
    thrid_web_go_desc:wx.getStorageSync('thrid_web_go_desc')||'即将跳转第三方试玩平台',
    uuid:wx.getStorageSync('uuid')||''
  },

  // -------------------------------------------------------------------------
  // 小程序生命周期
  // -------------------------------------------------------------------------

  onShow () {
    // - 另一项未填写 && 期望职位已经选择了,需要实时保存
    if (!this.data.isExpectComplete && app.globalData.expectPost.text) {
      this.__realTimeSave()
      this.__checkExpectComplete()
    }
    this.updateDetailPhoneBtn(this.data.jobId) //获取电话联系按钮信息
  },
  onReady(){
    let that=this;
    // if(that.data.url){//jumpOutsideTips
    //   wx.nextTick(() => {
    //     const jumpOutsideTips = that.selectComponent('#jumpOutsideTips');
    //     console.log('jumpOutsideTipsjumpOutsideTips',jumpOutsideTips);
    //     jumpOutsideTips.showDialog()
    //   })
    // }
  },

  async onLoad (options) {
    //id=12239672&consultantId=&contactPerson=&jobType=14&isChaoJianZhi=false&isInterview=false&applyId=&pierceParams=list_type%3Dzjbm%26applyconfirm%3Dhasresume%26adviser_id%3D%26reqid%3D1a23992fcee5e067b614fad5f5673a0b%26post_id%3D12239672&biz_qrcode=img
    let { id, consultantId, jobType, isChaoJianZhi, isInterview, applyId, pierceParams = '',biz_qrcode } = options
    this.setData({
      jobId: id,
      biz_qrcode
    })
    // console.log('this===', this)
    pierceParams = decodeURIComponent(pierceParams)
    pierceParams = decodeURIComponent(pierceParams)
    pierceParams = decodeURIComponent(pierceParams)

    api.setLog(1, dmch = `/jianzhi/${jobType}/detail/apply_success&${pierceParams}`)
    wx.hideShareMenu()
    wx.$addAppliedIds(id)

    isInterview = isInterview === 'true'
    if (!isInterview) {
      const consulting = await app.getPostContact(id)
      const { consulting_display, consulting_info } = consulting
      console.log('----1122', consulting)
      let showDesc = '请电话联系商家，完成录取'
      // let showDesc = ''
      if (+consulting_display === 2) {
        showDesc = `请加QQ ${consulting_info} 联系商家，完成录取`
      } else if (+consulting_display === 1) {
        showDesc = `请加微信 ${consulting_info} 联系商家，完成录取`
      } else if (+consulting_display === 4) {
        showDesc = `请关注微信公众号 ${consulting_info} 联系商家，完成录取`
      } else if (+consulting_display === 5) {
        showDesc = `请加QQ群 ${consulting_info} 联系商家，完成报名`
      } else if (+consulting_display === 3) {
        showDesc = '请发邮件联系商家，完成录取'
      }
      this.setData({
        consultingInfo: consulting_info || '',
        consultingDisplay: +consulting_display,
        showDesc
      })
    }
    const sendMsgTime = wx.getStorageSync('isApplySuccessSendMsg')
    const theDate = new Date().getDate()
    if (sendMsgTime !== theDate) {
      this.setData({
        isShowSendMsg: true
      })
    }

    const allCityList = await app.getAllCityList()
    this.__transformProvinceCityTown(allCityList)

    this.setData({
      pierceParams,
      isChaoJianZhi: isChaoJianZhi === 'true',
      isInterview,
      applyId: applyId || '',
      options,
      consultantId: consultantId || ''
    })
    await this.__getExpectPost()
  },

  // add by ltl 2018/10/29 产品要求点击返回左上角按钮时添加埋点
  onUnload () {
    if (!this.data.clickGoToJobList) {
      this.__postEv('@ca_from=back')
    }
  },

  //获取二维码
  // async getQRcode(){
  //   try {
  //     const { data } = await util.getData(`client/post/share/${id}`)
  //     console.log('页面二维码》》》',data);
  //     if(data.code === 1000) {
  //       this.setData({
  //         QRcode: ''
  //       });
  //     } else {
  //       wx.showToast({
  //         title: data.msg, // 提示的内容,
  //         icon: 'none', // 图标,
  //         duration: 1000, // 延迟时间,
  //         mask: true // 显示透明蒙层，防止触摸穿透,
  //       })
  //     }
  //   } catch (error) {
  //     console.log('error==', error)
  //   }
  // },

  // -------------------------------------------------------------------------
  // 页面bind的事件
  // -------------------------------------------------------------------------
  adClose(){
    this.setData({
      isShowAd:false
    })
  },
  onCountdownfinsh(){
    this.setData({
      isShowWebView:true
    })
  },

  bindGoToJobList () {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2] // - 拿到上一个页面的实例

    // - prevPage 为 `undefined` 时代表用户是从分享出去的职位详情页报名成功的, 此时不存在上一个列表页, 这里可以做返回首页的处理
    if (prevPage === undefined || prevPage.route === 'pages/jobDetail/jobDetail') {
      wx.switchTab({ url: pageIndex })
    } else {
      wx.navigateBack()
    }

    this.setData({ clickGoToJobList: true })

    if (this.data.isInterview) {
      this.__postEv('@ca_from=signup')
    } else {
      this.__postEv('@ca_from=continue_apply')
    }
  },

  bindGoToInterview () {
    this.__postEv('@ca_from=msdetail')
    wx.redirectTo({ url: `${pageMyInterviewDetail}?apply_id=${this.data.applyId}` })
  },

  bindCopyNum () {
    wx.setClipboardData({
      data: this.data.consultingInfo,
      success: res => {
        if (this.data.consultingDisplay === 1) {
          this.__postEv('@ca_from=wechat')
        } else if (this.data.consultingDisplay === 4) {
          this.__postEv('@ca_from=gzh')
        } else if (this.data.consultingDisplay === 2) {
          this.__postEv('@ca_from=QQ')
        }
        wx.showToast({ title: '复制成功' })
      }
    })
  },

  bindCallPhone () {
    wx.makePhoneCall({
      phoneNumber: this.data.consultingInfo,
      success: () => this.__postEv('@ca_from=call_success')
    })
    this.__postEv('@ca_from=call')
  },
  //电话联系
  async phoneContactHandle(){
    console.log('this.phoneContact===', this.data.phoneContact)
    const phoneContact = this.data.phoneContact;
    if(!!phoneContact.is_shared&&!phoneContact.tel){
      wx.showToast({
        title: '该职位未发布联系电话', // 提示的内容,
        icon: 'none', // 图标,
        duration: 2000, // 延迟时间,
        mask: true // 显示透明蒙层，防止触摸穿透,
      })
      return
    }
    if(!phoneContact.is_shared){
      this.__postEv(`@ca_from=lx_202201_noshare@post_id=${this.data.jobId}`)
      const sharePopContext = this.selectComponent('#sharePop');
      console.log('sharePopContext===', sharePopContext, sharePopContext.isShowApplyPop)
      // this.$refs.sharePop.show()
      sharePopContext.isShowApplyPop = true;
      return
    }else{
      this.__postEv(`@ca_from=lx_202201_shared@post_id=${this.data.jobId}`)
      wx.makePhoneCall({
        phoneNumber: phoneContact.tel
      })
    }
  },
//获取电话联系按钮信息
  async updateDetailPhoneBtn(id){
    try {
      const { data } = await util.getData(`client/post/share/${id}`)
      console.log('联系电话的状态',data);
      if(data.code === 1000) {
        // this.phoneContact = data.data;
        // console.log('this.phoneContact==', this.phoneContact)
        this.setData({
          phoneContact: data.data
        });
      } else {
        wx.showToast({
          title: data.msg, // 提示的内容,
          icon: 'none', // 图标,
          duration: 1000, // 延迟时间,
          mask: true // 显示透明蒙层，防止触摸穿透,
        })
        return
      }
    } catch (error) {
      console.log('error==', error)
    }
  },
  onShareAppMessage (res) {
    console.log('diidd==报名成功落地页',res);
    this.__postEv(`@ca_from=share_202201_wx@post_id=${this.data.jobId}`)
    this.saveShare()
  },

  //保存分享
  async saveShare(){
    try {
      // console.log('确定分享===', this, this.jobId, '222',this.data.jobId)
      const { data } = await util.getData(`client/post/share/record`,{post_id:this.data.jobId},'POST')
      console.log('data===',data)
    } catch (error) {

    }
  },

  bindCloseSendMsg () {
    this.setData({
      isShowSendMsg: false
    })
  },
  copyUrl(){
    wx.setClipboardData({
      data: this.data.url,
      success (res) {
        wx.showToast({ title: '复制成功', icon: "none" });
        // wx.getClipboardData({
        //   success (res) {
        //     console.log(res.data) // data
        //   }
        // })
      }
    })
  },

  bindSendMsg () {
    // console.log(typeof cityStore.getters.currentCity.id)
    let tmpIds = this.data.tmpIds
    console.log(tmpIds)
    let paramsTmpIds = []
    const that = this
    const theTime = new Date().getDate()
    wx.requestSubscribeMessage({
      tmplIds: tmpIds,
      async success (res) {
        if (res[tmpIds[0]] === 'accept' || res[tmpIds[1]] === 'accept') {
          if (res[tmpIds[0]] === 'accept' && res[tmpIds[1]] === 'accept') {
            that.bindCloseSendMsg()
            wx.setStorageSync('isApplySuccessSendMsg', theTime)
            paramsTmpIds = tmpIds
          } else if (res[tmpIds[0]] === 'accept') {
            paramsTmpIds = tmpIds.splice(0, 1)
            that.setData({
              tmpIds: tmpIds
            })
          } else {
            paramsTmpIds = tmpIds.splice(1, 1)
            that.setData({
              tmpIds: tmpIds
            })
          }
          if (tmpIds.length === 0) {
            wx.setStorageSync('isApplySuccessSendMsg', theTime)
            that.bindCloseSendMsg()
          }
          const params = {
            open_id: app.globalData.openId,
            city_id: cityStore.getters.currentCity.id,
            template_ids: paramsTmpIds
          }
          try {
            await util.getData('collect/subscribemsg', params, 'POST')
          } catch (err) {
            console.log(err)
          }
        } else {
        }
      },
      fail (res) {
        switch (res.errCode) {
          case 10002:
            util.showToast('网络链接错误，请检查网络状态')
            break
          case 10003:
            util.showToast('网络链接错误，请检查网络状态')
            break
          case 20004:
            that.bindCloseSendMsg()
            wx.setStorageSync('isindexSendMsg', theTime)
            break
        }
      }
    })
  },

  /**
   * 区域选项被更改时触发, 存在主动触发和被动触发
   * @param {Object} e
   * @param {Boolean} isRealTimeSave - 是否实时保存
   */
  async bindregionPickerChange (e, isRealTimeSave = true) {
    const value = e.detail.value
    const { region } = this.data

    await this.bindColumnchange({
      detail: { column: 0, value: value[0] }
    })
    await this.bindColumnchange({
      detail: { column: 1, value: value[1] }
    })

    const expectRegion = {
      value: {
        province: region[0][value[0]].id,
        city: region[1][value[1]].id,
        district: region[2][value[2]].id
      },
      text: `${region[0][value[0]].short_name} ${region[1][value[1]].short_name} ${region[2][value[2]].short_name}`
    }

    this.setData({
      provinceLabel: region[0][value[0]].short_name,
      cityLabel: region[1][value[1]].short_name,
      townLabel: region[2][value[2]].short_name,
      expectRegion
    })

    if (isRealTimeSave) {
      this.__realTimeSave()
      this.__checkExpectComplete()
    }
  },

  bindColumnchange (e) {
    const { column, value } = e.detail
    const { region, provinceList, cityList, townList } = this.data

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

  bindSelectRegion () {
    this.__postEv('@ca_from=region')
  },
  // 取消分享
  successHide(){
    this.__postEv(`@ca_from=share_202201_cancel@post_id=${this.data.jobId}`)
  },

  bindSelectPost () {
    this.__postEv('@ca_from=expect')
    app.globalData.expectPost = this.data.expectPost
    wx.navigateTo({ url: `${pageApplyExpectPost}?careerType=0` })
  },

  bindScroll (evt) {
    wx.$tracker.emit('scroll', evt)
  },

  bindComplete (listData) {
    this.__initTracker()
  },

  // -------------------------------------------------------------------------
  // 页面方法, 双下划线开头表示私有方法, 供内部调用
  // -------------------------------------------------------------------------

  __postEv (append = '') {
    // - pierceParams 中包含了 `reqid`、`post_id`等参数
    // const pierceParams = this.data.pierceParams.replace(/&/g, '@')
    let pierceParams = this.data.pierceParams
    console.log('pierceParams===', pierceParams)
    if (pierceParams) {
      pierceParams = pierceParams.replace(/&/g, '@')
    }
    api.setLog(
      2,
      `@atype=click@ca_name=doumi@ca_source=h5${append}@${pierceParams}`
    )
  },

  /**
   * 曝光埋点初始化
   */
  __initTracker () {
    const context = this.selectComponent('#recommendJobList')

    wx.$tracker.trackExposure(dmch, {
      el: { list: '.dm-recommend-list-item' },
      dmalog: list => {
        list = JSON.stringify(list)
        return `@atype=scroll@ca_name=doumi@ca_source=h5@from=direct_visits@ca_from=post_list@show_post_id=${list}`
      }
    }, context)
      .success(arg => console.log('曝光埋点发起成功: ', arg))
      .fail(err => console.warn('曝光埋点发起失败: ', err))
  },

  /**
   * 检查是否完善求职意向
   */
  __checkExpectComplete () {
    if (this.data.townLabel && this.data.expectPost.text) { // - 偏好区域和意向岗位 两项均填写完
      wx.showToast({ title: '求职意向已完善', icon: 'none' })
    }
  },

  /**
   * 实时保存
   */
  __realTimeSave () {
    return new Promise(async (resolve, reject) => {
      const { expectPost, expectRegion } = this.data
      app.globalData.expectPost = expectPost
      app.globalData.expectRegion = expectRegion

      const params = app.getExpectParams()

      try {
        const res = await util.getData('user/store/expect', params, 'POST')
        const { code, msg } = res.data

        if (code === 1000) {
          resolve(res)
        } else {
          reject(res)
          util.showToast(msg)
        }
      } catch (err) {
        reject(err)
        util.showToast(err === 'offline' ? '网络异常' : '服务器异常')
      }
    })
  },

  /**
   * 获取当前定位城市的信息(默认选中的省市区)
   */
  async __getLocationCityInfo () {
    let longitude = ''
    let latitude = ''
    try {
      if (!app.globalData.locationData) {
        const locationData = await app.checkAuthAndGetLocation(false)
        longitude = locationData.longitude
        latitude = locationData.latitude
      }
    } catch (err) {} // - 拒绝地理位置授权或者授权失败

    const res = await util.getData(`common/area/${latitude},${longitude}`)
    const { code, data } = res.data
    const { cityList, townList, region } = this.data

    if (code === 1000) {
      region[1] = cityList[data.province.id]
      region[2] = townList[cityList[data.province.id][0].id]

      const findIdx = (list, id) => list.findIndex(x => x.id === id)

      this.setData({ region }, () => {
        this.setData({
          value: [
            findIdx(region[0], data.province.id),
            findIdx(region[1], data.city.id),
            findIdx(region[2], data.district.id)
          ],
          province: data.province, // 省
          city: data.city, // 市
          town: data.district // 区
        })
      })
    }
  },

  /**
   * 转换城市数据
   * @param {Object[]} list - 接口或者缓存中获取的所有城市数据
   */
  __transformProvinceCityTown (list) {
    const { region, provinceList, cityList, townList } = this.data

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
   * 获取当前用户的求职意向
   */
  async __getExpectPost () {
    const res = await util.getData('user/info/expect')
    const { code, data } = res.data
    const { cityList, townList, region } = this.data

    if (code === 1000) {
      const { place, job_type_relation } = data

      const jobTypeRelation = []
      job_type_relation.forEach(x => { // - 全职兼职同职位去重
        if (!jobTypeRelation.some(xx => xx.value === x.value)) jobTypeRelation.push(x)
      })
      this.setData({
        expectPost: {
          value: jobTypeRelation,
          text: [...new Set(jobTypeRelation.map(x => x.name))].join(' ')
        }
      })

      const isExpectRegionComplete = !!place.province
      const isExpectPostComplete = job_type_relation.length > 0
      const isExpectComplete = isExpectRegionComplete && isExpectPostComplete

      this.setData({ isExpectComplete })

      if (!isExpectRegionComplete) {
        return this.__getLocationCityInfo()
      }

      region[1] = cityList[place.province]
      region[2] = townList[place.city]

      const findIdx = (list, id) => list.findIndex(x => x.id === id)
      const value = [
        findIdx(region[0], place.province),
        findIdx(region[1], place.city),
        findIdx(region[2], place.district)
      ]

      if (!isExpectComplete) { // - 求职意向未完善时显示求职意向完善的操作区域, 这时才做相关默认赋值操作
        this.setData({ region }, () => {
          this.bindregionPickerChange({ detail: { value } }, !isExpectRegionComplete)
        })
      }
    }
  }
})
