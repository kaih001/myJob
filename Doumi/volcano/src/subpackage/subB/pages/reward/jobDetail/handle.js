import { createPage } from '@mpxjs/core'
import { util, api, app, encrypt } from '../../../../../allJS.js'
import pageLogin from '~/pages/login/login?resolve'
import pageRmjobdetail from '../rmjobdetail/rmjobdetail?resolve'
import pageRmlist from '../rmlist/rmlist?resolve'
import pageCertification from '../certification/certification?resolve'
import pageIWantTRecommend from '../IWantTRecommend/IWantTRecommend?resolve'
import pageJobDetail from '../jobDetail/jobDetail?resolve'

let bindMobileFlag = false
let delayClick = false // 进行延迟点击
let dmch = ''

createPage({
  /**
   * 页面的初始数据
   */
  data: {
    id: '', // 职位ID
    jobType: '', // 职位类型
    jobDetail: {}, // 职位详情字段
    jobBtnStatus: {}, // 报名按钮状态
    nearestDistance: '',
    expendList: [],
    interviewAddrCount: '',
    appyConfirmAsheet: false,
    showApplyAccount: false,
    applyAccount: 10,
    applyBtnText: '报名',
    applyBtnStyle: '',
    checkFormWorkTimeId: false,
    formWorkTimeId: '',
    checkFormWorkAddressId: false,
    formWorkAddressId: '',
    applyBtnWarmingText: '',
    showApplyBtnWarming: false,
    showErrorTemp: false,
    errorType: '',
    loginFlag: false,
    canIUseFlag: true,
    userId: '',
    auth_str: '',
    cehckFormFlag: false,
    invite_code: '',
    options: '',
    caCampaign: '',
    jumpConfirm: false,
    isChaoJianZhi: false,
    isZhiPin: false,
    isWagesGuarantee: false,
    // 奖金相关
    isReward: 2, // 默认不是奖金不是普通职位
    sinterviewId: '',
    // jobReward: {},
    jobReward: {
      'interview': [
        {
          'id': 12, // 场次id
          'date': '10月18日', // 面试场次日期
          'week': '星期三', // 星期
          'start': '13:20', // 开始时间
          'end': '22:25' // 结束时间
        },
        {
          'id': 13, // 场次id
          'date': '10月18日',
          'week': '星期四',
          'start': '13:20',
          'end': '14:30'
        }
      ]
    }, // 调试用
    jobRewardAddress: [], // 奖金工作地址数据
    jobRewardInterview: [], // 当前选中工作地址对应的面试时间
    headimgurl: 'https://cdn.doumistatic.com/131,01125557602f88d6.png',
    share_auth_str: '',
    source: 'sy_postlist&rm',
    isShowShare: false,
    isBindPhone: false,
    bindPhoneTitle: '斗米找工作申请获得您微信绑定的手机号，为您提供更好的服务',
    isLodingSuccess: false,
    applyJoinFormId: '', // 点击了报名参加按钮后的formId
    isShowApply: true, // 是否展示推荐弹层
    isShowAddress: false,
    isIpx: false, // 判断是否是iPhone X
    isCertified: false, // 是否已实名认证
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    // 初始化数据
    await this.__init(options)

    // 获取分享者信息
    const share_auth = wx.getStorageSync('rm_auth_str')
    const open_job_id = wx.getStorageSync('rm_j_id')
    if (open_job_id === this.id) {
      this.share_auth_str = share_auth
      this.getShareUserInfo()
    }

    // 判断iPhone X
    const isIpx = app.globalData.isIpx
    this.isIpx = isIpx
    const auth_strs = wx.getStorageSync('auth_str')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow (options) {
    // 在⽤户当⽇第2次打开⼩程序详情⻚从未弹过弹层时，为⽤户弹出弹层
    let openJobDetailTimes = wx.getStorageSync('openJobDetailTimes')
    let times = parseInt(openJobDetailTimes)
    if (!times) {
      times = 1
      wx.setStorageSync('openJobDetailTimes', times)
    } else {
      times += 1
      wx.setStorageSync('openJobDetailTimes', times)
    }

    dmch = `/jianzhi/${this.jobType}/detail/index`

    // DMC-3413详情页pv埋点dmch增加refer_page参数,值同ev埋点的source
    if (this.options.source) {
      api.setLog(1, `${dmch}&post_id=${this.id}&refer_page=${this.options.source}${this.caCampaign}`)
    } else {
      // 如果没有就不传
      api.setLog(1, `${dmch}&post_id=${this.id}${this.caCampaign}`)
    }

    // 用户授权信息查询
    this.__updateLoginStatus()
    // 如果已授权未绑定手机号显示注册引导
    if (this.isLogin && !this.isBindPhone) {
      this.isShowGuide = true
    }
    // 如果已登录则进行实名认证检测
    if (this.isBindPhone && !this.isCertified) {
      this.__checkRealNameAuth()
    }

    this.getDetail()
    this.getRewardDetail()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage (res) {
    // DMC-3304点击右上角分享按钮ev埋点
    api.setLog(2, `@atype=click@ca_name=doumi@ca_source=h5@ca_from=share_topright`)
    api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=share@post_id=' + this.id)

    if (this.isReward === 0) {
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=xftc_fxhy@post_id=' + this.id)

      const auth_str = wx.getStorageSync('auth_str')
      if (!this.isBindPhone) {
        this.setData({ bindPhoneTitle: '需要绑定手机号才能领取到奖金' })
        this.selectComponent('#getPhoneNumber').showDialog()
      }
      this.shareJob(auth_str)

      return {
        title: this.jobDetail.title,
        path: `${pageRmjobdetail}?uid=${this.userId}&jobid=${this.id}&auth_str=${auth_str}&from=partnerhr_share`,
        imageUrl: this.jobReward.share_img
      }
    }
  },

  methods: {
    // -------------------------------------------------------------------------
    // 页面bind的事件
    // -------------------------------------------------------------------------

    /**
     * 获取分享用户信息
     */
    getShareUserInfo () {
      const { share_auth_str } = this

      if (share_auth_str === '') return

      const time = new Date().getTime()
      const sStr = '' + share_auth_str + time + encrypt.md5_key
      const sign = encrypt.md5(sStr)

      util.requestByGet('share/info', {
        share_auth_str,
        time,
        sign
      }, false, res => {
        if (res.data.code == 200) {
          const { headimgurl, nickname } = res.data.data
          if (headimgurl !== '') {
            this.setData({ headimgurl })
          }
          this.setData({ nickname })
        }
      }, err => {

      })
    },

    /**
     * 用户信息组件授权反馈-点击授权回调
     */
    getUserInfoCallBack (e) {
      // 点击授权之后再次更新极速报名按钮
      util.getUserInfoLog(e, app, () => {
        wx.getStorage({
          key: 'loginInfo',
          success: res => {
            if (res.data.login_status) {
              if (this.isReward == 0) {
                this.getRewardDetail()
              }
            }

            const userId = wx.getStorageSync('userId')
            this.setData({
              userId: userId,
              loginFlag: userId !== '',
              isBindPhone: userId > 0
            })
          }
        })
        wx.getStorage({
          key: 'auth_str',
          success: res => {
            if (res.data) {
              this.setData({ auth_str: res.data })
            }
          }
        })
      })
    },

    /**
     * 用户信息组件授权反馈-点击跳过后的回调
     */
    clickCancelBtn () {
      // 在⽤户当⽇第2次打开⼩程序详情⻚从未弹过弹层时，为⽤户弹出弹层
      const userId = wx.getStorageSync('userId')
      this.setData({ isBindPhone: userId > 0 })
    },

    /**
     * 获取微猎头职位信息
     */
    getRewardDetail () {
      const time = new Date().getTime()
      const zid = 1
      const post_id = this.id
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
            const { address, reward } = res.data.data
            let id = ''
            let jobRewardAddress = address.map((x, i) => {
              x.isSelect = i === 0
              return x
            })
            let jobRewardInterview = Object.values(address[0].interview)

            if (reward !== undefined) { // 奖金
              this.setData({
                jobReward: res.data.data,
                sinterviewId: id,
                isReward: 0,
                jobRewardAddress,
                jobRewardInterview
              })

              api.setLog(1, `/jianzhi/connection/detail_bakd&post_id=${post_id}`)
            } else {
              this.setData({ isReward: 1 })
            }
          } else {
            this.setData({ isReward: 1 })
          }
        }, (err) => {
          this.setData({ isReward: 1 })
          this.getDetailBtn()
        }
      )
    },

    /**
     * 展开／收起的公共方法
     */
    setToggle (e) {
      let flag = +e.currentTarget.dataset.index
      let list = this.expendList
      // 面试地点
      let item = {}
      item.expendShow = true
      if (list[flag].isExpendText == '展开') {
        if (flag == 2) {
          api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=job_location_open@post_id=' + this.id)
        }
        item.isExpend = 'dm-toggle'
        item.isExpendText = '收起'
      } else {
        if (flag == 2) {
          api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=job_location_close@post_id=' + this.id)
        }
        item.isExpend = ''
        item.isExpendText = '展开'
      }
      list[flag] = item
      // console.log(list)
      this.setData({
        expendList: list
      })
    },

    /**
     * 获取电话号码授权
     */
    async getPhoneNumber (e) {
      const { encryptedData, iv } = e.detail
      const invite_code = wx.getStorageSync('register') // 获取分享来源
      const { post_work_times, post_address } = this.jobBtnStatus
      const { post_address_list } = post_address

      if (!encryptedData) { // - 拒绝授权手机号
        // apply_type等于1为黄展帖，走黄展报名流程
        if (this.jobDetail.apply_type === 1) {
          wx.navigateTo({
            url: `${pageLogin}?from=jobDetail?id=${this.id}`
          })
        } else if (post_work_times.length > 1 || post_address_list.length > 1) {
          this.setData({
            formWorkAddressId: (post_address_list[0] && post_address_list[0].id) ? post_address_list[0].id : '0',
            formWorkTimeId: post_work_times.length !== 0 ? post_work_times[0].id : '',
            appyConfirmAsheet: true
          })
        } else {
          this.setData({ appyConfirmAsheet: false })
          this.goTofastApplyPage()
        }
      } else {
        // const result = await app.login2()
        const auth_str = wx.getStorageSync('auth_str')
        this.setData({ auth_str })

        const param = {
          encrypted_data: e.detail.encryptedData,
          iv: e.detail.iv,
          invite_code
        }

        if (this.options.ca_campaign) {
          param.ca_campaign = this.options.ca_campaign
        }

        const ca_source = api.getCasource()
        let isNext = false

        try {
          const res = await util.getData(`client/bindmobile`, param, 'POST', `dm_fm=${ca_source}`)
          wx.setStorageSync('userId', res.data.data.user_id)
          wx.setStorageSync('hasUserId', true)

          if (res.data.code === 1000) {
            let cookie = res.header['Set-Cookie'] || res.header['set-cookie']
            util.setCookie(cookie)
            // 登录成功处理
            if (this.isReward == 0) {
              this.getRewardDetail()
            }

            bindMobileFlag = true
            this.setData({ isBindPhone: true, loginFlag: true })
            isNext = true
          } else if (res.data.code === 2202) {
            app.code2login()
            wx.showToast({ title: res.data.msg, icon: 'none' })
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none' })
          }
        } catch (err) {}

        // - 工作时间或者工作地点存在多个的时候需要显示弹框进行选择
        if (post_work_times.length > 1 || post_address.post_address_list.length > 1) {
          this.setData({ appyConfirmAsheet: true })
        } else {
          isNext ? this.getDetailBtn() : this.goTofastApplyPage()
        }
      }
    },

    /**
     * 点击分享-保存图片发朋友圈-保存图片操作
     */
    saveImage () {
      const time = new Date().getTime()
      const auth_str = wx.getStorageSync('auth_str')
      const sStr = '' + auth_str + this.id + time + encrypt.md5_key
      const sign = encrypt.md5(sStr)

      util.showLoading('正在保存...')

      util.requestByPost('post/share_img', {
        auth_str,
        post_id: this.id,
        time,
        sign
      }, false, (res) => {
        if (res.data.code === 200) {
          util.downFile(res.data.data.pic, res => {
            wx.showToast({
              title: '保存图片成功',
              icon: 'none'
            })
            this.setData({ isShowShare: false })
            this.shareJob(auth_str)
            util.hideLoading()
          }, res => {
            util.hideLoading()
          })
        }
      }, err => {
        util.hideLoading()
      })
    },

    /**
     * 进入地图页面
     */
    goToMap (e) {
      // DMC-3451点击工作地点ev埋点
      api.setLog(2, `@atype=click@ca_source=h5@ca_name=doumi@ca_from=addr`)
      wx.openLocation({
        name: e.currentTarget.dataset.addressName,
        latitude: +e.currentTarget.dataset.latitude,
        longitude: +e.currentTarget.dataset.longitude
      })
    },

    /**
     * 回到微猎头列表页
     */
    toMore (e) {
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=gdsjzw@post_id=' + this.id)

      wx.navigateTo({
        url: pageRmlist,
      })
    },

    /**
     * 获取职位详情
     */
    async getDetail () {
      try {
        const res = await util.getData(`client/detail/${this.id}`)
        const { data } = res.data

        for (let i = 0; i < data.post_addr_list.length; i++) {
          data.post_addr_list[i].isSelect = i === 0
        }

        data.zhipin = (data.operate_label.indexOf('zhipin') !== -1)
        var key = data.flush_at != 0 ? 'flush_at' : 'modify_at'
        var times = 7 * 24 * 60 * 60 * 1000
        if ((new Date().getTime() - data[key] * 1000) <= times) {
          data.new = true
        } else {
          data.new = false
        }

        // 处理职位描述
        if (wx.canIUse('rich-text')) {
          if (!!data.post_detail_content && data.post_detail_content.length != 0) {
            data.post_detail_content = data.post_detail_content.replace(/<a.*?>(.*?)<\/a>/ig, '')
            data.post_detail_content = data.post_detail_content.replace(/\r\n|\n/g, '<br />')
            let content = data.post_detail_content
            this.setData({ canIUseFlag: true })
          }
        }
        // 处理工作时间次日格式
        for (let key in data.working_hours_arr) {
          data.working_hours_arr[key].forEach((hour) => {
            if (util.compareTime(hour.am_time, hour.pm_time) == 1 && hour.pm_time != '00:00') {
              hour.pm_time = `次日${hour.pm_time}`
            }
          })
        }
        // data.tab_treatment_tags = [{ 4: '有提成', 2: '抱住' }]
        // TODO 薪资福利数据
        // console.log(data.contact_person)
        data.contact_person = encodeURIComponent(data.contact_person)
        this.setData({
          jobDetail: data,
          jobType: data.job_type,
          isLodingSuccess: true,
          isChaoJianZhi: (data.operate_label.indexOf('chaojianzhi') > -1), // 是否是潮兼职
          isZhiPin: (data.operate_label.indexOf('zhipin') > -1), // 是否是直聘贴
          isWagesGuarantee: data.is_wages_guarantee == 1 // 是否工资保障
        })
        // 计算距离

        // 展开／收起初始化
        setTimeout(() => this.descController(), 500)
      } catch (err) {
        this.setData({
          showErrorTemp: true,
          errorType: err === 'offline' ? 'offline' : 'loadFail'
        })
      }

      util.hideLoading()
    },

    /**
     * 更新微猎头报名按钮状态
     */
    initRewardBtn () {
      if (this.isReward == 0) {
        let time = new Date().getTime()
        let post_id = this.id
        let sStr = '' + post_id + time + encrypt.md5_key

        let sign = encrypt.md5(sStr)

        util.requestByPost('post/apply_status', {
          post_id,
          time,
          sign
        }, false, res => {
          if (res.data.code === 200) {
            if (res.data.data.status) {
              this.setData({ applyBtnText: '报名' })
            } else {
              this.setData({ applyBtnText: '取消报名' })
            }
          }
        })
      }
    },

    /**
     * 职位投诉
     */
    openComplaintConfirm () {
      api.telPhone('拨打斗米客服电话投诉', '', this.kefu_mobile)
    },

    /**
     * @method computeDistance - 计算距离，根据距离排序
     */
    computeDistance () {
      let { locationData } = app.globalData
      if (locationData && locationData.latitude && locationData.longitude) {
        let currentLocation = {
          lat: locationData.latitude,
          lng: locationData.longitude
        }
        let nearestDistance = -1
        if (
          this.jobBtnStatus.post_address.post_address_list.length == 1 &&
          this.jobBtnStatus.post_address.post_address_list[0].lat !==
            undefined &&
          this.jobBtnStatus.post_address.post_address_list[0].lng !==
            undefined
        ) {
          nearestDistance = util.getDistance(currentLocation, {
            lat: this.jobBtnStatus.post_address.post_address_list[0].lat,
            lng: this.jobBtnStatus.post_address.post_address_list[0].lng
          })
        } else if (
          this.jobBtnStatus.post_address.post_address_list.length > 1
        ) {
          this.jobBtnStatus.post_address.post_address_list.sort(
            (addr1, addr2) => {
              if (addr1.lat !== undefined && addr1.lng !== undefined) {
                addr1.nearestDistance = util.getDistance(currentLocation, {
                  lat: addr1.lat,
                  lng: addr1.lng
                })
              } else {
                addr1.nearestDistance = -1
              }
              if (addr2.lat !== undefined && addr2.lng !== undefined) {
                addr2.nearestDistance = util.getDistance(currentLocation, {
                  lat: addr2.lat,
                  lng: addr2.lng
                })
              } else {
                addr2.nearestDistance = -1
              }
              return addr1.nearestDistance - addr2.nearestDistance
            }
          )
          nearestDistance =
            this.jobBtnStatus.post_address.post_address_list[0].nearestDistance
        }
        // 如果是从附近兼职跳进的，直接更改首项的距离
        if (nearestDistance != -1) {
          if (nearestDistance >= 1000) {
            nearestDistance = `${(nearestDistance / 1000).toFixed(1)}km`
          } else {
            nearestDistance = `${parseInt(nearestDistance)}m`
          }
        }
        this.setData({ nearestDistance })
      }
    },

    /**
     * 根据需要显示收起按钮
     * @method descController
     * @public
     * @return {Null} void
     */
    descController () {
      // 处理面试地点
      let item = {}
      let interviewAddrCount = ''
      let list = []
      if (this.jobDetail.interview_addr_list.length > 2) {
        interviewAddrCount = `(${this.jobDetail.interview_addr_list.length})`
        item.isExpend = ''
        item.isExpendText = '展开'
        item.expendShow = true
      } else {
        item.expendShow = false
      }
      list[2] = item

      // 处理其他(职位详情／工作时间)
      // let moreItems = $('.desc-text');
      if (wx.createSelectorQuery) {
        wx.createSelectorQuery().selectAll('.desc-text').fields({
          dataset: true,
          size: true,
          scrollOffset: true,
          properties: ['scrollX', 'scrollY']
        }, res => {
          // res.height // 节点的高度
          res.forEach((moreItem, index) => {
            let item2 = {}
            let lineHeight = 20
            let rowCount = 4
            if (index == 0) {
              rowCount = 11
              lineHeight = 22
            }
            let triggerHeight = lineHeight * rowCount
            if (moreItem.height > triggerHeight) {
              // 显示收起按钮
              item2.isExpend = ''
              item2.isExpendText = '展开'
              item2.expendShow = true
            } else {
              item2.expendShow = false
            }
            list[index] = item2
          })

          this.setData({
            interviewAddrCount: interviewAddrCount,
            expendList: list
          })
        }).exec()
      }
    },

    checkWork (e) {
      this.setData({
        [e.currentTarget.dataset.workType == 0 ? 'formWorkTimeId' : 'formWorkAddressId']: e.detail.value,
      })
    },

    /**
     * 点击分享处理逻辑
     * @param {*} auth_str
     */
    shareJob (auth_str) {
      const userId = wx.getStorageSync('userId')
      const time = new Date().getTime()
      const data = {
        share_auth_str: auth_str,
        share_user_id: userId,
        post_id: this.id
      }
      const sStr = '' + JSON.stringify(data) + time + encrypt.md5_key
      const sign = encrypt.md5(sStr)

      util.requestByPost('post/share', {
        data: JSON.stringify(data),
        time,
        sign
      }, false, res => {})
    },

    /**
     * 点击推荐职位处理逻辑
     * @param {*} e
     */
    onClickListItem (e) {
      const item = e.currentTarget.dataset.item
      const { options } = this
      const from = options.from || 'direct_visits'

      api.setLog(2, `@atype=click@ca_name=doumi@ca_source=h5@from=${from}@ca_from=tuijianlist@post_id=${item.id}`)
      wx.redirectTo({
        url: `${pageJobDetail}?id=${item.id}&jobType=${item.job_type_id}&source=${this.source}`
      })
    },

    /**
     * 展示获取用户信息弹层
     */
    showUserInfoDialog (e) {
      if (!this.loginFlag) {
        this.selectComponent('#dialog').showDialog()
      }
    },

    /**
     * 点击分享按钮
     * 如果没有绑定手机号需要先提醒绑定
     */
    bindShowShare (e) {
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=wyzf@post_id=' + this.id)

      if (!this.loginFlag) {
        return this.selectComponent('#dialog').showDialog()
      } else {
        if (!this.isBindPhone) {
          this.setData({
            bindPhoneTitle: '需要绑定手机号才能领取到奖金',
            isShowShare: false
          })
          this.selectComponent('#getPhoneNumber').showDialog()
          return
        } else {
          // 验证是否已实名认证
          util.requestByPost(
            'headhunter/get_authentication',
            {},
            false,
            res => {
              const {code , data, message } = res.data
              if (code === 200) {
                if (data.authentic_status === 1) {
                  this.isCertified = true
                  this.isShowShare = true
                } else {
                  this.isCertified = false
                  wx.navigateTo({
                    url: `${pageCertification}`
                  })
                }
              } else {
                wx.showToast({
                  title: message,
                  icon: 'none'
                })
              }
            },
            err => {
              // wx.stopPullDownRefresh()
            }
          )
        }
      }
    },

    /**
     * 点击允许操作
     */
    _allow (e) {
      if (!this.isShowApply) {
        const userId = wx.getStorageSync('userId')
        this.setData({ isBindPhone: userId > 0 })
      } else {
        this.getRewardDetail()
        if (this.jobDetail.post_addr_list.length > 0 || this.jobRewardInterview > 0) {
          this.setData({ isShowAddress: true })
        } else {
          this.fastApply()
        }
      }
    },

    /**
     * 点击分享-保存图片发朋友圈
     */
    onClickSave (e) {
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=xftc_tpfx@post_id=' + this.id)
      this.saveImage()
    },

    /**
     * 点击分享-转发给好友
     */
    onClickShare (e) {
      // 点击分享已要求绑定手机号
      // if (!this.isBindPhone) {
      //   this.setData({
      //     bindPhoneTitle: '需要绑定手机号才能领取到奖金'
      //   })
      //   this.selectComponent('#getPhoneNumber').showDialog()
      // }
    },

    bindCancelShare () {
      this.isShowShare = false
    },

    /**
     * 点击了报名参加按钮获取的formId
     */
    applyJoinData (e) {
      this.applyJoinFormId = e.detail.formId
    },

    /**
     * 我要推荐
     */
    IWantReFuc () {
      if (!this.loginFlag) {
        return this.selectComponent('#dialog').showDialog()
      } else {
        if (!this.isBindPhone) {
          this.setData({
            bindPhoneTitle: '斗米找工作申请获得您微信绑定的手机号，为您提供更好的服务',
            isShowApply: false
          })
          this.selectComponent('#getPhoneNumber').showDialog()
          return
        } else {
          // 验证是否已实名认证
          util.requestByPost(
            'headhunter/get_authentication',
            {},
            false,
            res => {
              const { code, data, message } = res.data
              if (code === 200) {
                if (data.authentic_status === 1) {
                  this.isCertified = true
                  wx.navigateTo({
                    url: `${pageIWantTRecommend}?post_id=${this.id}`
                  })
                } else {
                  this.isCertified = false
                  wx.navigateTo({
                    url: `${pageCertification}`
                  })
                }
              } else {
                wx.showToast({
                  title: message,
                  icon: 'none'
                })
              }
            },
            err => {
              // wx.stopPullDownRefresh()
            }
          )
        }
      }
    },

    /**
     * 跳转到实名认证
     */
    async bindAuthHandle () {
      // 获取用户绑定状态
      await this.__updateLoginStatus()

      if (!this.isBindPhone) {
        this.selectComponent('#getPhoneNumber').showDialog()
        return
      } else {
        wx.navigateTo({
          url: `${pageCertification}`
        })
      }
    },

    // -------------------------------------------------------------------------
    // 页面方法, 双下划线开头表示私有方法, 供内部调用
    // -------------------------------------------------------------------------

    /**
     * 初始化页面数据
     * 处理 option中的信息
     * 初始化页面信息
     * @param {*} options
     */
    __init (options) {
      try {
        // 获取from值并给ca_source赋值
        if (options.from) {
          api.setCasource('', options.from)
        }

        // 如果是二维码分享，解析二维码携带信息
        if (options.scene) {
          var scene = decodeURIComponent(options.scene)
          // - 兼容之前生成的老二维码参数(jobid, jobtype), 新生成的二维码对参数长度减短了(id, type)
          options.id = util.getQueryFieldVal(scene, 'jobid') || util.getQueryFieldVal(scene, 'id')
          options.jobType = util.getQueryFieldVal(scene, 'jobtype') || util.getQueryFieldVal(scene, 'type')
        }

        // 获取ca_campaign值并给ca_campaign赋值
        if (options.ca_campaign) {
          this.setData({
            caCampaign: `&ca_campaign=${options.ca_campaign}`
          })
        }

        // 设置缓存中的注册信息
        if (options.register) {
          wx.setStorageSync('register', options.register)
        }
      } catch (err) {}

      // 获取缓存中的用户加密信息
      wx.getStorage({
        key: 'auth_str',
        success: res => {
          if (res.data) {
            this.setData({ auth_str: res.data })
          }
        }
      })

      this.setData({
        showErrorTemp: false,
        id: options.id || this.id,
        jobType: options.jobType || this.jobType
      })

      this.setData({ options })
    },

    /**
     * 获取用户授权登录状态
     */
    __updateLoginStatus () {
      const auth_str = wx.getStorageSync('auth_str')
      const userId = wx.getStorageSync('userId') // user_id === 0 表示未授权手机号但是已经登录, user_id === '' 表示未登录
      this.setData({
        auth_str,
        userId,
        loginFlag: userId !== '' && userId > -1,
        isBindPhone: userId > 0
      })
    },

    /**
     * 获取实名认证状态
     */
    __checkRealNameAuth () {
      util.requestByPost(
        'headhunter/get_authentication',
        {},
        false,
        res => {
          const { code, data, message } = res.data
          if (code == 200) {
            if (data.authentic_status === 1) {
              this.isCertified = true
            } else {
              this.isCertified = false
            }
          } else {
            wx.showToast({
              title: message,
              icon: 'none'
            })
          }
        },
        err => {
          // wx.stopPullDownRefresh()
        }
      )
    },
  }
})
