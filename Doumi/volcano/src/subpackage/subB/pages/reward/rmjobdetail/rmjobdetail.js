// pages/reward/rmjobdetail/rmjobdetail.js
import { util, api, app, encrypt } from '../../../../../allJS.js'
import pageRmlist from '../rmlist/rmlist?resolve'
import pageJobDetail from '../jobDetail/jobDetail?resolve'
import pageRmjobDetail from '../rmjobdetail/rmjobdetail?resolve'
import pageSkipPage from '../skipPage/skipPage?resolve'
import apgeApply from '../../../../subA/pages/apply/apply?resolve'
import pageApplySuccess from '../../../../subA/pages/applySuccess/applySuccess?resolve'

var dialog
let bindMobileFlag = false
var getPhoneNumberDialog
Page({
  /**
   * 页面的初始数据
   */
  data: {
    zid: 1,
    isLogin: false, // 是否已登录
    jobid: '', // 职位ID
    jobDetail: {}, // 职位详情接口
    jobReward: {}, // 奖金职位详情
    jobRewardAddress: [], // 奖金工作地址数据
    jobRewardInterview: [], // 当前选中工作地址对应的面试时间
    isBindPhone: false, // 是否绑定手机号码
    userid: '', // 用户ID
    source: 'sy_postlist&rm', // 来源
    shareUserId: '', // 分享用户ID
    isAssociated: false,
    headimgurl: 'https://cdn.doumistatic.com/131,01125557602f88d6.png', // 默认头像地址
    nickname: '', // 昵称
    isShowAddress: false, // 是否显示地址
    jobBtnStatus: {}, // 报名按钮状态
    formWorkAddressId: '',
    sinterviewId: '', // 面试时间ID
    isChaoJianZhi: false, // 是否是潮兼职
    share_auth_str: '', // 分享用户加密串
    isShowShare: false, // 是否显示分享
    expendList: [],
    canIUseFlag: true,
    bindPhoneTitle: '斗米找工作申请获得您微信绑定的手机号，为您提供更好的服务', // 绑定手机号文案
    isLodingSuccess: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    dialog = this.selectComponent('#dialog')
    getPhoneNumberDialog = this.selectComponent('#getPhoneNumber')

    let shareUserId = options.uid
    let jobid = options.jobid
    let auth_str = options.auth_str
    let from = options.from

    if (shareUserId === undefined && options.q) {
      let q = options.q
      // 增加多次decode解密 解决encode问题
      q = decodeURIComponent(q)
      q = decodeURIComponent(q)
      q = decodeURIComponent(q)
      jobid = q.substring(q.indexOf('jobid=') + 6, q.indexOf('&auth_str'))
      // auth_str = q.substring(q.indexOf('&auth_str=') + 10, q.length)
      auth_str = q.substring(q.indexOf('&auth_str=') + 10, q.indexOf('&share_user_id'))
      auth_str = encrypt.base64_encode(auth_str)
      shareUserId = q.substring(q.indexOf('&share_user_id=') + 15, q.indexOf('&from'))
      from = q.substring(q.indexOf('&from=') + 6, q.length)
    }

    api.setLog(1, `/jianzhi/connection/detail_crm&post_id=${jobid}`)

    // 获取from值并给ca_source赋值
    if (from) {
      api.setCasource('', from)
    }

    if (auth_str !== undefined) {
      this.setData({
        share_auth_str: auth_str
      })

      // console.log('share_auth_str', this.data.share_auth_str);

      wx.setStorageSync('rm_j_id', jobid)
      wx.setStorageSync('rm_auth_str', auth_str)
    }

    // if(jobid == undefined){
    //   return
    // }
    this.setData({
      shareUserId,
      jobid
    })

    this.getJobDetail()
    this.getShareUserInfo()
    this.getLocation()

    // 隐藏右上角分享
    wx.hideShareMenu({})
  },

  /**
   * 手机号码授权成功后回调
   */
  _allow (e) {
    bindMobileFlag = true
    const userId = wx.getStorageSync('userId')
    this.setData({
      isBindPhone: userId > 0
    })
    this.getRewardDetail()
    if (
      this.data.jobRewardAddress.length > 0 ||
      this.data.jobRewardInterview.length > 0
    ) {
      this.setData({
        isShowAddress: true
      })
    } else {
      this.fastApply()
    }
  },

  onClickToApply (e) {
    var user_id = wx.getStorageSync('userId')

    if (!this.data.isBindPhone && this.data.applyBtnText == '立即报名') {
      this.setData({
        bindPhoneTitle:
          '斗米找工作申请获得您微信绑定的手机号，为您提供更好的服务'
      })
      getPhoneNumberDialog.showDialog()
      return
    }
    if (this.data.applyBtnText == '立即报名') {
      if (
        this.data.jobRewardAddress == undefined ||
        this.data.jobRewardInterview == undefined
      ) {
        return
      }
      if (
        this.data.jobRewardAddress.length > 0 ||
        this.data.jobRewardInterview.length > 0
      ) {
        this.setData({
          isShowAddress: true
        })
      } else {
        this.fastApply()
      }
    }

    if (this.data.applyBtnText == '取消报名') {
      this.onCancelApply()
    }
  },
  /**
   * 获取定位
   */
  async getLocation () {
    try {
      await app.checkAuthAndGetLocation()
    } catch (err) {
      // app.showErrorPageHandler(err)
    }
    util.hideLoading()
  },
  onCancelApply () {
    var self = this
    wx.showModal({
      content: '确定取消报名？',
      confirmText: '确认',
      cancelText: '取消',
      success (res) {
        if (res.confirm) {
          self.unApply()
        }
      }
    })
  },
  /**
   * 取消报名
   */
  unApply () {
    var self = this
    self.cancleApply()
    util.showLoading()
    util
      .getData(
        'client/unapply/' +
          self.data.jobid +
          '?citydomain=' +
          app.globalData.cityInfo.domain
      )
      .then(
        res => {
          // 请求成功
          util.hideLoading()
        },
        res => {
          // 请求失败
          // console.log('fail', res)
        }
      )
  },
  onClickFastApply (e) {
    api.setLog(
      2,
      '@atype=click@ca_name=doumi@ca_source=h5@ca_from=ljbm@post_id=' +
        this.data.jobid
    )
    this.onConlectInterViewid()
  },
  cancleApply () {
    var pid = this.data.jobid
    let that = this
    let time = new Date().getTime()

    let sStr = '' + pid + time + encrypt.md5_key
    let sign = encrypt.md5(sStr)
    var url = 'post/cancel_apply'

    util.requestByPost(
      url,
      {
        post_id: pid,
        time: time,
        sign: sign
      },
      false,
      res => {
        if (res.data.code == 200) {
          that.getDetailBtn()
        } else {
          setTimeout(function () {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }, 1000)
        }
      },
      err => {}
    )
  },

  onConlectInterViewid () {
    var selectID = this.data.sinterviewId
    if (!selectID) {
      wx.showToast({
        title: '请选择面试时间',
        icon: 'none'
      })
      return
    }
    let that = this
    let time = new Date().getTime()
    let auth_str = wx.getStorageSync('auth_str')
    let sStr = '' + selectID + time + encrypt.md5_key
    let sign = encrypt.md5(sStr)
    let url = 'post/apply'

    util.requestByPost(
      url,
      {
        interview_id: selectID,
        share_auth_str: this.data.share_auth_str,
        invite_auth_str: auth_str,
        share_user_id: this.data.shareUserId,
        time,
        sign
      },
      false,
      res => {
        if (res.data.code == 200) {
          this.fastApply()
          this.setData({
            isShowAddress: false
          })
          this.setBtnStatus()
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      },
      err => {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    )
  },

  fastApply () {
    var self = this
    if (self.data.caCampaign) {
      api.setLog(
        1,
        `/jianzhi/${
          self.data.jobType
        }/detail/applyconfirm/hasresume&ca_campaign=${
          self.data.options.ca_campaign
        }`
      )
    } else {
      api.setLog(
        1,
        `/jianzhi/${self.data.jobType}/detail/applyconfirm/hasresume`
      )
    }
    if (self.data.isLogin && self.data.jobBtnStatus.is_resume_complete == 1) {
      if (self.data.jobBtnStatus.is_degree_complete == 1) {
        // 已登录并且简历完善，直接报名
        // 直接报名
        util.showLoading('报名中')

        let param = {}
        param.addr_id = self.data.formWorkAddressId
        param.ca_platform = 4 // 数据来源微信

        // 带上从聚合页传的ca_campaign参数
        if (self.data.caCampaign) {
          param.ca_campaign = self.data.options.ca_campaign
        }
        if (
          self.data.jobDetail.work_type != 2 &&
          self.data.checkFormWorkTimeId
        ) {
          param.work_time_id = self.data.formWorkTimeId
        }

        // 获取入口参数
        param.invite_code = wx.getStorageSync('register')
        param.userId = self.data.userId

        const ca_source = api.getCasource()
        // 90
        util
          .getData(
            'client/apply/' + self.data.jobid,
            param,
            'POST',
            `dm_fm=${ca_source}`
          )
          .then(
            res => {
              util.hideLoading()
              if (res.data.code == 0) {
                // if (self.data.options.source) {
                //   // DMC-3413报名成功埋点，增加了来源参数source
                //   // 运营位进入 @source=yyw_[index]_[name]
                //   // 列表进入 @source=sy_postlist
                //   api.setLog(2, `@atype=click@ca_name=doumi@ca_source=h5@ca_from=apply_success@post_id=${self.data.id}@source=${self.data.options.source}`); //
                // } else {
                //   // 没有source,即从非首页入口进入则不传source
                //   api.setLog(2, `@atype=click@ca_name=doumi@ca_source=h5@ca_from=apply_success@post_id=${self.data.id}`);
                // }
                wx.navigateTo({
                  url: `${pageApplySuccess}?jobType=${self.data.jobDetail.job_type}&id=${self.data.jobid}&isChaoJianZhi=${self.data.isChaoJianZhi}&contactPerson=${self.data.jobDetail.contact_person}`
                })
              } else if (res.data.message) {
                util.showToast(res.data.message)
              } else {
                util.showToast('服务器异常')
              }
            },
            res => {
              if (res == 'offline') {
                util.showToast('网络异常')
              } else {
                util.showToast('服务器异常')
              }
            }
          )
      } else {
        wx.navigateTo({
          url: `${apgeApply}?id=${self.data.id}&jobType=${
            self.data.jobType
          }&loginFlag=true&addressId=${
            self.data.formWorkAddressId
          }&is_resume_complete=${
            self.data.jobBtnStatus.is_resume_complete
          }&is_degree_complete=${
            self.data.jobBtnStatus.is_degree_complete
          }&source=${self.data.source}`
        })
      }
    } else {
      if (self.data.caCampaign) {
        var ca_campaign = `&ca_campaign=${self.data.caCampaign}`
      } else {
        var ca_campaign = ''
      }
      wx.navigateTo({
        url: `${apgeApply}?id=${self.data.id}&jobType=${
          self.data.jobType
        }&addressId=${self.data.formWorkAddressId}&timeId=${
          self.data.formWorkTimeId
        }&source=${self.data.source}${ca_campaign}` //
      })
    }
  },
  initRewardBtn () {
    let that = this
    let time = new Date().getTime()
    let post_id = that.data.jobid
    let sStr = '' + post_id + time + encrypt.md5_key

    let sign = encrypt.md5(sStr)
    var url = 'post/apply_status'
    util.requestByPost(
      url,
      {
        post_id: post_id,
        time: time,
        sign: sign
      },
      false,
      res => {
        if (res.data.code == 200) {
          // that.setData({
          //   isAssociated: true
          // })
          if (res.data.data.status) {
            this.setData({
              applyBtnText: '立即报名'
            })
          } else {
            this.setData({
              applyBtnText: '取消报名'
            })
          }
        }
      },
      err => {}
    )
  },
  /**
   * 获取职位报名状态
   */
  getDetailBtn () {
    var self = this
    util.getData('client/applyinfo/' + self.data.jobid + '?rp=mobile').then(
      res => {
        self.initRewardBtn()
        // if (!!res && res.data.code == 0) {
        // console.log(res.data)
        self.setData({
          jobBtnStatus: res.data
        })
        let workAddrNum =
          self.data.jobBtnStatus.post_address.post_address_list.length
        let workTimeNum = self.data.jobBtnStatus.post_work_times.length
        // console.log('工作地点：', workAddrNum)
        // console.log('工作时间：', workTimeNum)
        if (workAddrNum == 1 && workTimeNum <= 1) {
          // 0或1个工作时间1个工作地点，系统均默认选中，去掉浮层，直接进入下一级页面
          self.setData({
            formWorkAddressId:
              self.data.jobBtnStatus.post_address.post_address_list[0].id,
            formWorkTimeId:
              self.data.jobBtnStatus.post_work_times.length !== 0
                ? self.data.jobBtnStatus.post_work_times[0].id
                : '',
            jumpConfirm: true
          })
        } else if (workAddrNum == 1 && workTimeNum > 1) {
          // 多个工作时间一个工作地点，无论能否获取到用户定位，默认选中该工作地点，有浮层
          self.setData({
            formWorkAddressId:
              self.data.jobBtnStatus.post_address.post_address_list[0].id
          })
        } else if (workAddrNum > 1 && app.globalData.locationData) {
          // 多个工作时间多个工作地点，如果有定位默认选中最近，否则全都不选
          self.setData({
            formWorkAddressId:
              self.data.jobBtnStatus.post_address.post_address_list[0].id
          })
        }
        if (self.data.jobBtnStatus.post_address.post_address_list.length > 0) {
          self.computeDistance()
        }

        self.setBtnStatus()
        if (bindMobileFlag) {
          bindMobileFlag = false
          if (self.data.applyBtnText == '报名参加') {
            self.fastApply()
          } else if (self.data.applyBtnText == '取消报名') {
            util.showToast('您已报名')
          } else {
            util.showToast(self.data.applyBtnText)
          }
        }

        wx.hideLoading()
      },
      res => {
        self.initRewardBtn()
        wx.hideLoading()
        let errorType = 'loadFail'
        if (res == 'offline') {
          errorType = 'offline'
        }
        self.setData({
          showErrorTemp: true,
          errorType: errorType
        })
      }
    )
  },
  /**
   * 计算距离，根据距离排序
   * @method computeDistance
   * public
   * @return {Null} void
   */
  computeDistance () {
    let self = this
    let locationData = app.globalData.locationData
    if (locationData && locationData.latitude && locationData.longitude) {
      let currentLocation = {
        lat: locationData.latitude,
        lng: locationData.longitude
      }
      let distance = -1
      if (
        self.data.jobBtnStatus.post_address.post_address_list.length == 1 &&
        self.data.jobBtnStatus.post_address.post_address_list[0].lat !==
          undefined &&
        self.data.jobBtnStatus.post_address.post_address_list[0].lng !==
          undefined
      ) {
        distance = util.getDistance(currentLocation, {
          lat: self.data.jobBtnStatus.post_address.post_address_list[0].lat,
          lng: self.data.jobBtnStatus.post_address.post_address_list[0].lng
        })
      } else if (
        self.data.jobBtnStatus.post_address.post_address_list.length > 1
      ) {
        self.data.jobBtnStatus.post_address.post_address_list.sort(
          (addr1, addr2) => {
            if (addr1.lat !== undefined && addr1.lng !== undefined) {
              addr1.distance = util.getDistance(currentLocation, {
                lat: addr1.lat,
                lng: addr1.lng
              })
            } else {
              addr1.distance = -1
            }
            if (addr2.lat !== undefined && addr2.lng !== undefined) {
              addr2.distance = util.getDistance(currentLocation, {
                lat: addr2.lat,
                lng: addr2.lng
              })
            } else {
              addr2.distance = -1
            }
            return addr1.distance - addr2.distance
          }
        )
        distance =
          self.data.jobBtnStatus.post_address.post_address_list[0].distance
      }
      // 如果是从附近兼职跳进的，直接更改首项的距离
      if (distance != -1) {
        if (distance >= 1000) {
          distance = `${(distance / 1000).toFixed(1)}km`
        } else {
          distance = `${parseInt(distance)}m`
        }
      }
      self.setData({
        nearestDistance: distance
      })
    }
  },
  /**
   * 设置底部button显示
   */
  setBtnStatus () {
    var self = this
    let buttonStatus = self.data.jobBtnStatus
    if (
      !!buttonStatus.post_button_status &&
      !!buttonStatus.post_button_status.applyLimit
    ) {
      // 限制报名次数
      this.setData({
        showApplyAccount: true,
        applyAccount: buttonStatus.post_button_status.unApplyCcount
      })
    }
    let btnText = ''
    let btnStyle = ''
    switch (buttonStatus.post_button_status.can_apply) {
      case -10000:
        btnText = '已下线'
        btnStyle = 'dm-disabled'
        break //
      case -104:
        btnText = '取消报名'
        btnStyle = 'dm-active'
        break //
      case -106:
        btnText = '今日报名过多'
        btnStyle = 'dm-disabled'
        break //
      case -107:
        btnText = '暂停招聘'
        btnStyle = 'dm-disabled'
        break //
      case -108:
        btnText = '已拒绝'
        btnStyle = 'dm-disabled'
        break //
      case -109:
        btnText = '立即报名'
        btnStyle = ''
        break
      case -110:
        btnText = '已录取'
        btnStyle = 'dm-disabled'
        break //
      case -120:
        btnText = '已录取'
        btnStyle = 'dm-disabled'
        break //
      case -124:
        btnText = '只招男生'
        btnStyle = 'dm-disabled'
        break //
      case -125:
        btnText = '只招女生'
        btnStyle = 'dm-disabled'
        break //
      case -126:
        btnText = '只招学生'
        btnStyle = 'dm-disabled'
        break //
      case -122:
        btnText = '已结束'
        btnStyle = 'dm-disabled'
        break //
      case -127:
        btnText = '只招社会人员'
        btnStyle = 'dm-disabled'
        break //

      default:
        btnText = '立即报名'
        btnStyle = ''
        break
    }
    this.setData({
      applyBtnText: btnText,
      applyBtnStyle: btnStyle
    })
    if (
      !!app.globalData.cityInfo &&
      app.globalData.cityInfo.name != buttonStatus.city_name
    ) {
      this.setData({
        applyBtnWarmingText: `本职位只在${
          buttonStatus.city_name
        }招聘，请确认后再报名`,
        showApplyBtnWarming: true
      })
    }
    let checkFormWorkTimeId =
      !!buttonStatus.post_work_times && buttonStatus.post_work_times.length > 0
    let checkFormWorkAddressId =
      !!buttonStatus.post_address &&
      !!buttonStatus.post_address.post_address_list &&
      buttonStatus.post_address.post_address_list.length > 0
    this.setData({
      checkFormWorkTimeId: checkFormWorkTimeId,
      checkFormWorkAddressId: checkFormWorkAddressId
    })
  },

  onClickHideAddress (e) {
    this.setData({
      isShowAddress: false
    })
  },
  getRewardDetail () {
    let that = this
    let time = new Date().getTime()
    let sStr = '' + that.data.zid + that.data.jobid + time + encrypt.md5_key
    let sign = encrypt.md5(sStr)
    var url = 'post/detail'
    util.requestByPost(
      url,
      {
        id: that.data.zid,
        post_id: that.data.jobid,
        time: time,
        sign: sign
      },
      false,
      res => {
        if (res.data.code == 200) {
          const { address } = res.data.data
          var id = ''
          let jobRewardAddress = address.map((x, i) => {
            x.isSelect = i === 0
            return x
          })
          let jobRewardInterview = Object.values(address[0].interview)
          // for (let i = 0; i < jobRewardInterview.length; i++) {
          //   if (i === 0) {
          //     jobRewardInterview[i].isSelect = true
          //     id = jobRewardInterview[i].id
          //   } else {
          //     jobRewardInterview[i].isSelect = false
          //   }
          // }

          that.setData({
            jobReward: res.data.data,
            sinterviewId: id,
            jobRewardAddress,
            jobRewardInterview
          })
        } else {
        }
      },
      err => {}
    )
  },

  getJobDetail () {
    var self = this
    util.getData('client/detail/' + self.data.jobid).then(
      res => {
        var moneys = ('' + res.data.data.salary).replace(/k/g, '').split('-')
        if (moneys.length != 2) {
          res.data.data.salaryShow = res.data.data.salary
        } else {
          res.data.data.salaryShow = moneys[0] * 1000 + '-' + moneys[1] * 1000
        }

        for (var i = 0; i < res.data.data.post_addr_list.length; i++) {
          if (i == 0) {
            res.data.data.post_addr_list[i].isSelect = true
          } else {
            res.data.data.post_addr_list[i].isSelect = false
          }
        }
        if (wx.canIUse('rich-text')) {
          if (
            !!res.data.data.post_detail_content &&
            res.data.data.post_detail_content.length != 0
          ) {
            var regex = new RegExp('\\n', 'g')
            var count = 1
            var result = res.data.data.post_detail_content.match(regex)

            if (result != null) {
              count = result.length
            }

            res.data.data.post_detail_content = res.data.data.post_detail_content.replace(
              /<a.*?>(.*?)<\/a>/gi,
              ''
            )
            res.data.data.post_detail_content = res.data.data.post_detail_content.replace(
              /\r\n|\n/g,
              '<br />'
            )
            let content = res.data.data.post_detail_content
            this.setData({
              canIUseFlag: true,
              morecount: count
            })
          }
        }

        // 处理职位描述
        this.setData({
          formWorkAddressId: res.data.data.post_addr_list[0].id,
          jobDetail: res.data.data,
          jobType: res.data.data.job_type,
          isLodingSuccess: true,
          isChaoJianZhi: res.data.data.operate_label.indexOf('chaojianzhi') > -1
        })

        setTimeout(function () {
          self.descController()
        }, 500)

        util.hideLoading()
      },
      res => {
        let errorType = 'loadFail'
        if (res == 'offline') {
          errorType = 'offline'
        }
      }
    )
  },
  /**
   * 根据需要显示收起按钮
   * @method descController
   * @public
   * @return {Null} void
   */
  descController () {
    var self = this
    // 处理面试地点

    let item = {}

    let list = []

    if (self.data.morecount < 10) {
      item.expendShow = false
    } else {
      item.expendShow = true
      item.isExpend = ''
      item.isExpendText = '展开'
    }

    list[0] = item
    list[1] = {
      expendShow: false
    }
    self.setData({
      expendList: list
    })
  },
  /**
   * 展开／收起的公共方法
   */
  setToggle (e) {
    let flag = +e.currentTarget.dataset.index
    let list = this.data.expendList
    // 面试地点
    let item = {}
    item.expendShow = true
    if (list[flag].isExpendText == '展开') {
      if (flag == 2) {
        api.setLog(
          2,
          '@atype=click@ca_name=doumi@ca_source=h5@ca_from=job_location_open@post_id=' +
            this.data.jobid
        )
      }
      item.isExpend = 'dm-toggle'
      item.isExpendText = '收起'
    } else {
      if (flag == 2) {
        api.setLog(
          2,
          '@atype=click@ca_name=doumi@ca_source=h5@ca_from=job_location_close@post_id=' +
            this.data.jobid
        )
      }
      item.isExpend = ''
      item.isExpendText = '展开'
    }
    list[flag] = item

    this.setData({
      expendList: list
    })
  },

  /**
   * 选择工作地点
   */
  onSelectAddress (e) {
    const { index } = e.currentTarget.dataset
    const newDetail = this.data.jobDetail
    const { jobRewardAddress } = this.data

    const newJobRewardAddress = jobRewardAddress.map(x => {
      x.isSelect = false
      let interview = Object.values(x.interview)
      interview.forEach(xx => xx.isSelect = false)
      return x
    })

    newJobRewardAddress[index].isSelect = true

    const newSinterviewId = ''
    const newJobRewardInterview = Object.values(newJobRewardAddress[index].interview)

    this.setData({
      jobDetail: newDetail,
      formWorkAddressId: newDetail.post_addr_list[index].id,
      jobRewardAddress: newJobRewardAddress,
      jobRewardInterview: newJobRewardInterview,
      sinterviewId: newSinterviewId
    })
  },

  /**
   * 选择面试时间
   */
  onSelectTime (e) {
    const index = e.currentTarget.dataset.index
    const newDetail = this.data.jobReward
    let newJobRewardInterview = this.data.jobRewardInterview

    for (var i = 0; i < newJobRewardInterview.length; i++) {
      newJobRewardInterview[i].isSelect = false
    }
    newJobRewardInterview[index].isSelect = true

    this.setData({
      jobReward: newDetail,
      sinterviewId: newJobRewardInterview[index].id,
      jobRewardInterview: newJobRewardInterview
    })
  },

  // 关联用户
  onAssociated () {
    var auth_str = wx.getStorageSync('auth_str')
    var userId = wx.getStorageSync('userId')
    let that = this
    let time = new Date().getTime()
    let data = {
      share_auth_str: this.data.share_auth_str,
      share_user_id: this.data.shareUserId,
      invite_auth_str: auth_str,
      invite_user_id: userId,
      post_id: this.data.jobid
    }
    let sStr = '' + JSON.stringify(data) + time + encrypt.md5_key
    // console.log(sStr, 'ccc')
    let sign = encrypt.md5(sStr)
    var url = 'friends/relation'
    util.requestByPost(
      url,
      {
        data: JSON.stringify(data),
        time: time,
        sign: sign
      },
      false,
      res => {
        if (res.data.code == 200) {
          that.setData({
            isAssociated: true
          })
        }
      },
      err => {}
    )
  },
  // 点击分享
  shareJob (auth_str) {
    let that = this
    let time = new Date().getTime()
    let userId = wx.getStorageSync('userId')
    let data = {
      share_auth_str: auth_str,
      share_user_id: userId,
      post_id: this.data.jobid
    }
    let sStr = '' + JSON.stringify(data) + time + encrypt.md5_key

    let sign = encrypt.md5(sStr)
    var url = 'post/share'
    util.requestByPost(
      url,
      {
        data: JSON.stringify(data),
        time: time,
        sign: sign
      },
      false,
      res => {
        if (res.data.code == 200) {
          that.setData({
            isAssociated: true
          })
        }
      },
      err => {}
    )
  },
  getShareUserInfo () {
    if (this.data.share_auth_str == '') {
      return
    }
    let that = this
    let time = new Date().getTime()

    let sStr = '' + this.data.share_auth_str + time + encrypt.md5_key
    let sign = encrypt.md5(sStr)
    var url = 'share/info'
    util.requestByGet(
      url,
      {
        share_auth_str: this.data.share_auth_str,
        time: time,
        sign: sign
      },
      false,
      res => {
        if (res.data.code == 200) {
          if (res.data.data.headimgurl != '') {
            that.setData({
              headimgurl: res.data.data.headimgurl
            })
          }
          that.setData({
            nickname: res.data.data.nickname
          })
        }
      },
      err => {}
    )
  },
  onClickListItem (e) {
    let item = e.currentTarget.dataset.item
    api.setLog(
      2,
      '@atype=click@ca_name=doumi@ca_source=h5@ca_from=tuijianlist@post_id=' +
        item.id
    )
    wx.redirectTo({
      url:`${pageJobDetail}?id=${item.id}&jobType=${item.job_type_id}&source=${this.data.source}`
    })
  },
  toMore (e) {
    api.setLog(
      2,
      '@atype=click@ca_name=doumi@ca_source=h5@ca_from=gdsjzw@post_id=' +
        this.data.jobid
    )

    wx.redirectTo({
      url: pageRmlist
    })
  },
  onClickToList (e) {
    wx.redirectTo({
      url: pageRmlist
    })
  },

  bindShowShare (e) {
    api.setLog(
      2,
      '@atype=click@ca_name=doumi@ca_source=h5@ca_from=wyzf@post_id=' +
        this.data.jobid
    )
    if (!this.data.isLodingSuccess) {
      return
    }
    this.setData({
      isShowShare: true
    })
  },
  onClickSave (e) {
    api.setLog(
      2,
      '@atype=click@ca_name=doumi@ca_source=h5@ca_from=xftc_tpfx@post_id=' +
        this.data.jobid
    )
    if (!this.data.isBindPhone) {
      this.setData({
        bindPhoneTitle: '需要绑定手机号才能领取到奖金'
      })
      getPhoneNumberDialog.showDialog()
    }
    this.saveImage()
  },

  onClickShare (e) {
    // console.log(e)
  },
  bindCancelShare (e) {
    this.setData({
      isShowShare: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
    this.getRewardDetail()
    var logininfo = wx.getStorageSync('loginInfo')

    var loginstatus = logininfo.login_status
    var uid = wx.getStorageSync('userId')
    this.getDetailBtn()

    if (loginstatus) {
      this.setData({
        isLogin: wx.getStorageSync('loginInfo').login_status,
        userid: uid
      })

      if (this.data.shareUserId != '' && !this.data.isAssociated) {
        this.onAssociated()
      }

      dialog.hideDialog()
    } else {
      dialog.showDialog()
    }
    var user_id = wx.getStorageSync('userId')

    this.setData({
      isBindPhone: user_id > 0
    })
  },
  cancelLogin () {
    wx.navigateTo({
      url: pageSkipPage
    })
  },
  getuserInfoCallBack (e) {
    var that = this

    util.getUserInfoLog(e, app, function (e) {
      if (e == 'fail') {
        dialog.showDialog()
        return
      }

      var loginInfo = wx.getStorageSync('loginInfo')
      var user_id = wx.getStorageSync('userId')

      that.setData({
        isBindPhone: user_id > 0
      })
      if (
        loginInfo != '' &&
        wx.getStorageSync('loginInfo').login_status != undefined
      ) {
        var uid = wx.getStorageSync('userId')
        that.getRewardDetail()
        that.setData({
          isLogin: wx.getStorageSync('loginInfo').login_status,
          userid: uid
        })

        if (that.data.shareUserId != '' && !that.data.isAssociated) {
          that.onAssociated()
        }
        dialog.hideDialog()
      } else {
        dialog.showDialog()
      }
    })
  },
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
  onReachBottom () {},
  saveImage () {
    let that = this
    let time = new Date().getTime()
    var auth_str = wx.getStorageSync('auth_str')

    let sStr = '' + auth_str + this.data.jobid + time + encrypt.md5_key

    let sign = encrypt.md5(sStr)
    var url = 'post/share_img'
    wx.showLoading({
      title: '正在保存...',
      mask: true
    })

    util.requestByPost(
      url,
      {
        auth_str: auth_str,
        post_id: this.data.jobid,
        time: time,
        sign: sign
      },
      false,
      res => {
        if (res.data.code == 200) {
          util.downFile(
            res.data.data.pic,
            res => {
              wx.showToast({
                title: '保存图片成功',
                icon: 'none'
              })
              that.setData({
                isShowShare: false
              })
              var auth_str = wx.getStorageSync('auth_str')
              that.shareJob(auth_str)
              wx.hideLoading()
            },
            res => {
              wx.hideLoading()
            }
          )
        }
      },
      err => {}
    )
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage (res) {
    var auth_str = wx.getStorageSync('auth_str')

    var that = this
    api.setLog(
      2,
      '@atype=click@ca_name=doumi@ca_source=h5@ca_from=xftc_fxhy@post_id=' +
        that.data.jobid
    )

    if (!this.data.isBindPhone) {
      this.setData({
        bindPhoneTitle: '需要绑定手机号才能领取到奖金'
      })
      getPhoneNumberDialog.showDialog()
    }
    that.shareJob(auth_str)
    return {
      title: this.data.jobDetail.title,
      path: `${pageRmjobDetail}?uid=${this.data.userid}&jobid=${this.data.jobid}&auth_str=${auth_str}&from=partnerhr_share`,
      imageUrl: this.data.jobReward.share_img,
      success (res1) {
        // 转发成功
      },
      fail (res2) {
        // 转发失败
      }
    }
  }
})
