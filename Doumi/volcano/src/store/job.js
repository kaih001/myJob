import { createStore } from '@mpxjs/core'
import util from '~/utils/util'
import api from '~/utils/api'
import { dateFormat } from '~/utils/date'
import commonApi from '~/interface/common'
import interviewApi from '~/interface/interview'
import globalDataStore from './globalData'
import cityStore from './city'
import applyPath from '~/subpackage/subA/pages/interview/applyInterview/applyInterview?resolve'
import applySuccessPath from '~/subpackage/subA/pages/applySuccess/applySuccess?resolve'

const app = getApp()

const { locationCity } = cityStore.state

const SET_JOB_DETAIL = 'SET_JOB_DETAIL'
const SET_BTN_STATUS = 'SET_BTN_STATUS'
const COMPUTE_DISTANCE = 'COMPUTE_DISTANCE'
const DESTROY_JOB = 'DESTROY_JOB'
const THRIDWEBGODESC='THRIDWEBGODESC'

const getDefaultState = () => ({
  _options: {}, // onLoad携带的参数
  dmch: '', // pv的dmch
  delayClick: false, // 进行延迟点击
  id: '', // 职位id
  jobType: '', // 职位类型
  jobDetail: null, // 职位详情数据
  jobBtnStatus: null, // 按钮状态
  consulting: null, // 商家联系方式
  nearestDistance: '',
  showApplyAccount: false,
  applyAccount: 10, // 报名次数
  applyBtnText: '报名', // 报名按钮默认文案
  telPhone: '13167568888', // 报名按钮默认文案
  applyBtnClass: '', // 报名按钮的class名
  applyBtnWarmingText: '',
  checkFormWorkTimeId: false,
  checkFormWorkAddressId: false,
  formWorkTimeId: '',
  formWorkAddressId: 0,
  showApplyBtnWarming: false,
  showErrorTemp: false,
  errorType: '',
  userId: '',
  invite_code: '',
  caCampaign: '',
  consultantId: '', // 约面-顾问id
  source: 'sy_postlist&rm',
  isChaoJianZhi: false, // 是否潮兼职
  isWagesGuarantee: false, // 是否工资保障
  isScrollY: true, // 页面是否可以滚动
  // isAuthWechat: true, // 是否微信授权
  // isBindPhone: null, // 是否手机号授权 || 是否登录
  isInterview: false, // 是否走约面流程
  interview: [], // 约面工作地址数据
  interviewAddress: {}, // 当前选中工作地址对应的面试地址
  interviewTimes: [], // 当前选中工作地址对应的面试时间
  // isIpx: false, // 判断是否是iPhoneX
  share: {}, // 分享的图片
  pierceParams: '', // 埋点透传的参数串
  fromCompanydetail: false, // 是否来自公司详情页
  jobCategory: '', // 职位类目
  phoneContact:{},//电话联系是否符合要求
  third_web_go:'',
  thrid_web_go_desc:''
})

export default createStore({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------

  state: getDefaultState(),
  getters: {
    // 需要透传的埋点参数
    pierceParams ({
      jobBtnStatus, isInterview, consultantId, id, _options
    }) {
      const listType = isInterview ? 'yyms' : 'zjbm'

      let applyconfirm = 'fastreg'
      if (globalDataStore.state.isBindPhone) applyconfirm =
        jobBtnStatus.is_resume_complete === 1
          ? 'hasresume'
          : 'noresume'

      const params = {
        list_type: listType, // - 区分帖子类型 `约面贴 | 报名贴`
        applyconfirm, // - 区分用户的登录状态 `fastreg:未登录 | noresume:登录简历不全 | hasresume:登录简历完善`
        adviser_id: consultantId, // - 求职顾问ID
        reqid: _options.reqid || '-', // - 用户点击帖子时的加载ID
        post_id: id // - 帖子ID
      }
      return util.obj2uri(params)
    },

    // 拼接并获取约面报名所需的参数
    interviewParams ({
      id, interview, isInterview, interviewAddress, interviewTimes, consultantId
    }) {
      if (!isInterview) return {} // 非约面职位直接返回空对象, 因为并不会用到

      const curInterview = interview.find(x => x.work_address && x.work_address.isSelect)
      const addrId = curInterview ? curInterview.work_address.addr_id : ''
      const params = {
        domain: locationCity.domain,
        addrId,
        openId: globalDataStore.state.openId,
        postId: id,
        interviewAddress,
        interviewTime: interviewTimes.find(x => x.isSelect).source,
        inviteCode: wx.getStorageSync('register'),
        consultantId
      }
      return params
    }
  },
  mutations: {
    // 设置职位详情数据
    [SET_JOB_DETAIL] (state, jobDetail) {
      state.jobDetail = { ...state.jobDetail, ...jobDetail }
    },

    // 设置底部button显示
    [SET_BTN_STATUS] (state) {
      const { jobBtnStatus } = state
      const { txt, code } = jobBtnStatus.interview_info.interview_btn

      if (
        jobBtnStatus.post_button_status &&
        jobBtnStatus.post_button_status.applyLimit
      ) {
        // 限制报名次数
        state.showApplyAccount = true
        state.applyAccount = jobBtnStatus.post_button_status.unApplyCcount
      }

      let applyBtnText = ''
      let applyBtnClass = ''

      if (code !== 0) {
        // - 约面状态的按钮文案
        applyBtnText = txt
        applyBtnClass = code === 1 ? '' : 'dm-disabled'
      } else {
        // - 普通报名的按钮文案
        switch (jobBtnStatus.post_button_status.can_apply) {
          case -10000:
            applyBtnText = '已下线'
            applyBtnClass = 'dm-disabled'
            break
          case -104:
            applyBtnText = '取消报名'
            applyBtnClass = 'dm-active'
            break
          case -106:
            applyBtnText = '今日报名过多'
            applyBtnClass = 'dm-disabled'
            break
          case -107:
            applyBtnText = '暂停招聘'
            applyBtnClass = 'dm-disabled'
            break
          case -108:
            // - 接口-108目前存在两种状态 `年龄不符` || `已拒绝`
            applyBtnText = jobBtnStatus.post_button_status.can_apply_text || '已拒绝'
            applyBtnClass = 'dm-disabled'
            break
          case -109:
            applyBtnText = '报名'
            applyBtnClass = ''
            break
          case -110:
            applyBtnText = '已录取'
            applyBtnClass = 'dm-disabled'
            break
          case -120:
            applyBtnText = '已录取'
            applyBtnClass = 'dm-disabled'
            break
          case -124:
            applyBtnText = '只招男生'
            applyBtnClass = 'dm-disabled'
            break
          case -125:
            applyBtnText = '只招女生'
            applyBtnClass = 'dm-disabled'
            break
          case -126:
            applyBtnText = '只招学生'
            applyBtnClass = 'dm-disabled'
            break
          case -122:
            applyBtnText = '已结束'
            applyBtnClass = 'dm-disabled'
            break
          case -127:
            applyBtnText = '只招社会人员'
            applyBtnClass = 'dm-disabled'
            break
          case -129:
            applyBtnText = '已报满'
            applyBtnClass = 'dm-disabled'
            break
          default:
            applyBtnText = '报名'
            applyBtnClass = ''
            break
        }
      }

      state.applyBtnText = applyBtnText
      state.applyBtnClass = applyBtnClass

      if (locationCity.name !== jobBtnStatus.city_name) {
        state.applyBtnWarmingText = `本职位只在${
          jobBtnStatus.city_name
        }招聘，请确认后再报名`
        state.showApplyBtnWarming = true
      }

      state.checkFormWorkTimeId =
        jobBtnStatus.post_work_times && jobBtnStatus.post_work_times.length > 0
      state.checkFormWorkAddressId =
        jobBtnStatus.post_address &&
        jobBtnStatus.post_address.post_address_list &&
        jobBtnStatus.post_address.post_address_list.length > 0
    },

    // 计算距离，根据距离排序
    [COMPUTE_DISTANCE] (state) {
      const { jobDetail } = state
      const { post_addr_list } = jobDetail
      const { latitude, longitude } = cityStore.state

      if (latitude && longitude) {
        const currentLocation = { lat: latitude, lng: longitude }
        let distance = -1

        if (
          post_addr_list.length === 1 &&
          post_addr_list[0].lat &&
          post_addr_list[0].lng
        ) {
          distance = post_addr_list[0].distance = util.getDistance(
            currentLocation,
            {
              lat: post_addr_list[0].lat,
              lng: post_addr_list[0].lng
            }
          )
        } else {
          post_addr_list.sort((addr1, addr2) => {
            if (addr1.lat && addr1.lng) {
              addr1.distance = util.getDistance(currentLocation, {
                lat: addr1.lat,
                lng: addr1.lng
              })
            } else {
              addr1.distance = -1
            }
            if (addr2.lat && addr2.lng) {
              addr2.distance = util.getDistance(currentLocation, {
                lat: addr2.lat,
                lng: addr2.lng
              })
            } else {
              addr2.distance = -1
            }

            return addr1.distance - addr2.distance
          })

          distance = post_addr_list[0].distance
        }

        for (const item of post_addr_list)
          item.distance = util.transfromDistance(item.distance)

        state.nearestDistance = util.transfromDistance(distance)
        state.jobDetail = jobDetail
      }
    },

    // 销毁某个职位清空职位的数据
    [DESTROY_JOB] (state) {
      const defaultState = getDefaultState()
      for (const [key, value] of Object.entries(defaultState)) {
        state[key] = value
      }
    },

    //设置报名成功页面的第三方跳转
    [THRIDWEBGODESC](state,{third_web_go,thrid_web_go_desc}){
      state.third_web_go=third_web_go
      state.thrid_web_go_desc=thrid_web_go_desc
    }
  },

  actions: {
    // 获取职位信息
    async getDetail ({ state, commit }) {
      const { latitude, longitude } = cityStore.state
      const openId = globalDataStore.state.openId
      const scene = wx.$tracker.scene

      try {
        // 通过搜一搜进入的场景值
        const isSearchScene = scene === 1005 || scene === 1042 || scene === 1053
        const { data } = isSearchScene
          ? await commonApi.getJobDetailData({ postId: state.id, lng: longitude, lat: latitude, openId, scene })
          : await commonApi.getJobDetailData({ postId: state.id, lng: longitude, lat: latitude })
        const key = data.flush_at !== 0 ? 'flush_at' : 'modify_at'
        const times = 7 * 24 * 60 * 60 * 1000

        data.new = new Date().getTime() - data[key] * 1000 <= times
        data.zhipin = data.operate_label.indexOf('zhipin') !== -1
        // 处理职位描述
        if (wx.canIUse('rich-text')) {
          if (
            !!data.post_detail_content &&
            data.post_detail_content.length !== 0
          ) {
            data.post_detail_content = data.post_detail_content.replace(
              /<a.*?>(.*?)<\/a>/gi,
              ''
            )
            data.post_detail_content = data.post_detail_content.replace(
              /\r\n|\n/g,
              '<br />'
            )
          }
        }
        state.jobCategory = data.job_type_str || '职位'
        // 处理工作时间次日格式
        for (let key in data.working_hours_arr) {
          data.working_hours_arr[key] = data.working_hours_arr[key].slice(0, 3) // 最多取 3 条工作时间
          data.working_hours_arr[key].forEach(hour => {
            if (
              util.compareTime(hour.am_time, hour.pm_time) === 1 &&
              hour.pm_time !== '00:00'
            ) {
              hour.pm_time = `次日${hour.pm_time}`
            }
          })
        }

        // TODO 薪资福利数据
        data.contact_person = encodeURIComponent(data.contact_person)
        state.jobDetail = data
        state.jobType = data.job_type
        state.isChaoJianZhi = data.operate_label.indexOf('chaojianzhi') > -1 // 是否是潮兼职
        state.isWagesGuarantee = +data.is_wages_guarantee === 1 // 是否工资保障

        // 分享卡片参数
        state.share = {
          salary: data.salary,
          salaryCompany: +data.is_salary_nego !== 1 ? `${data.salary_unit_str}/${data.salary_type_str}` : '',
          treatment: data.tab_treatment_tags.map(itme => { return itme.value }),
          content: data.post_detail_content.replace(/<\/?[^>]*>/g, '<br />') || data.tab_demand_tags_detail.join()
        }

        if (data.post_addr_list.length > 0) {
          // state.nearestDistance = data.post_addr_list[0].distance_long
          commit('COMPUTE_DISTANCE')
        }
      } catch (err) {
        app.showErrorPageHandler(err)
      }

      util.hideLoading()
    },

    // 获取按钮信息和职位报名状态
    async updateDetailBtn ({ state, commit, dispatch }) {
      state.delayClick = true // - 从补充信息页回来调此方法的时候 ios 手机不会显示 loading, 这里用这个做个延迟点击
      util.showLoading()

      try {
        if (locationCity.domain === '') { // - 未地理授权
          try {
            api.setLog(1, '/jianzhi/position_access')
            await app.checkAuthAndGetLocation(false)
            await app.getCityInfo()
          } catch (err) {
            // - 拒绝地理位置授权或者授权失败
          }
        }

        const { longitude, latitude } = cityStore.state
        const { data } = await util.getData(`client/applyinfo/${state.id}?rp=mobile`)

        if (data.interview_info) {
          state.jobBtnStatus = data
          state.isInterview = ~~data.interview_info.is_interview === 1

          longitude === '' ? dispatch('postPv', { longitude, latitude }) : dispatch('postPv') // - 页面的 pv

          const { post_address, post_work_times } = state.jobBtnStatus
          const { post_address_list } = post_address
          const workTimeNum = post_work_times.length // - 工作时间
          const workAddrNum = post_address_list.length // - 工作地点

          // 默认选中第一个工作时间 第一个工作地址
          if (workTimeNum > 0) state.formWorkTimeId = post_work_times[0].id
          if (workAddrNum > 0) state.formWorkAddressId = post_address_list[0].id

          commit('SET_BTN_STATUS')
        } else {
          // console.log('data-------------')
          // console.log(data)
          // app.showErrorToastHandler(data)
        }
      } catch (err) {
        // console.error('this is error')
        // console.log(err)
        // app.showErrorPageHandler(err)
      }
      util.hideLoading()
      state.delayClick = false // - 从补充信息页回来调此方法的时候 ios 手机不会显示 loading, 这里恢复点击
    },

    //获取电话联系按钮信息
    async updateDetailPhoneBtn({state,commit,dispatch}){
      try {
        const { data } = await util.getData(`client/post/share/${state.id}`)
        console.log('联系电话的状态',data);
        state.phoneContact=data.data;
      } catch (error) {

      }
    },
    //保存分享
    async saveShare({state,commit,dispatch}){
      try {
        const { data } = await util.getData(`client/post/share/record`,{post_id:state.id},'POST')
      } catch (error) {

      }
    },

    /**
     * 报名(普通贴)
     * @param {boolean?} isFast - 是否极速报名
     */
    async generalApplyJob ({ state, dispatch }, isFast = false) {
      if (globalDataStore.state.isBindPhone) {
        await dispatch('updateDetailBtn')

        const { is_resume_complete, is_degree_complete } = state.jobBtnStatus
        if (is_resume_complete === 1 && is_degree_complete === 1) {
          // 已登录并且简历完善，直接报名
          let param = { postId: state.id }
          param.addrId = state.formWorkAddressId || '0'
          param.ca_platform = 4 // 数据来源微信
          // 带上从聚合页传的ca_campaign参数
          if (state.caCampaign) {
            param.ca_campaign = state.caCampaign
          }
          if (state.jobDetail.work_type !== 2 && state.checkFormWorkTimeId) {
            param.workTimeId = state.formWorkTimeId
          }
          if (locationCity.domain) {
            param.domain = locationCity.domain
          }
          // 获取入口参数
          param.inviteCode = wx.getStorageSync('register')
          // param.userId = state.userId
          // param.openId = globalDataStore.state.openId

          try {
            await commonApi
              .showLoading()
              .applyJob(param)
          } catch (res) {
            if (res.code === 0) { // 老接口报名成功 code为 0
              if (state._options.source) {
                // DMC-3413报名成功埋点，增加了来源参数source
                // 运营位进入 @source=yyw_[index]_[name]
                // 列表进入 @source=sy_postlist
                dispatch('postEv', { append: `@ca_from=apply_success@source=${state._options.source}` })
              } else {
                // 没有source,即从非首页入口进入则不传source
                dispatch('postEv', { append: '@ca_from=apply_success' })
              }
              const biz_qrcode=res.biz_qrcode
              const thrid_web_go=res.third_web_go
              const thrid_web_go_desc=res.third_web_go_desc
              dispatch('goToPageApplySuccess',{biz_qrcode,thrid_web_go,thrid_web_go_desc})
            } else if (res.code) {
              return isFast
                ? Promise.reject(res)
                : app.showErrorToastHandler(res)
            }
            app.showErrorToastHandler(res)
          }
          util.hideLoading()
        } else {
          // - 已登录, 学历不完善, 进入极速报名流程(去极速报名补充信息)
          dispatch('goToPageApply')
        }
      } else {
        // - (未登录 || 已登录简历不完善), 进入极速报名流程
        dispatch('goToPageApply')
      }
    },

    /**
     * 极速报名(普通帖)
     */
    async fastGeneralApplyJob ({ state, dispatch }, args) {
      const param = {
        inviteCode: wx.getStorageSync('register'), // 获取链接来源参数
        postId: state.id,
        resume: {
          real_name: args.real_name,
          gender: args.gender,
          birth_date: args.birth_date,
          at_school: args.at_school,
          degree: args.degree,
          job_date_type: args.job_date_type,
          job_type_relation: args.job_type_relation,
          place: args.place
        }
      }

      if (!globalDataStore.state.isBindPhone) param.mobile = {
        number: args.mobile,
        verification: args.verification
      }

      if (state.caCampaign) param.caCampaign = state.caCampaign

      try {
        await commonApi
          .showLoading()
          .fastApplyJob(param)
      } catch (res) {
        const { loginInfo } = res
        if (!globalDataStore.state.isBindPhone && loginInfo && loginInfo.userId) {
          wx.setStorageSync('userId', loginInfo.userId)
          util.setCookie(res._response.header['Set-Cookie'] || res.header['set-cookie'])
          globalDataStore.commit('updateLoginStatus')
        }
        if (res.code === 0) { // 老接口报名成功 code为 0
          if (loginInfo && loginInfo.code && loginInfo.code < 0) {
            // 可能会验证码错误等
            util.showToast(res.message || loginInfo.message)
          } else {
            try {
              await dispatch('generalApplyJob', true)
            } catch (err) {
              return Promise.reject(err)
            }
          }
        } else if (res.code) {
          return Promise.reject(res)
        }
        app.showErrorToastHandler(res)
      }
    },

    /**
     * 极速约面(约面贴)
     */
    async fastInterviewApplyJob ({ state, getters, dispatch }, args) {
      args = { ...getters.interviewParams, resume: args }
      try {
        const res = await interviewApi
          .showLoading()
          .fastApplyJob(args)
        const { data, _response } = res

        wx.setStorageSync('userId', data.user_id)
        util.setCookie(_response.header['Set-Cookie'] || _response.header['set-cookie'])
        const apply_id=data.apply_id
        const biz_qrcode=data.biz_qrcode
        const thrid_web_go=data.third_web_go
        const thrid_web_go_desc=data.third_web_go_desc
        dispatch('goToPageApplySuccess', {apply_id,biz_qrcode,thrid_web_go,thrid_web_go_desc})
      } catch (res) {
        if (res.code === -205) { // - 验证码错误
          wx.showToast({ title: res.msg || res.message, icon: 'none' })
        } else if (res.code) {
          wx.setStorageSync('userId', res.data.user_id)
          util.setCookie(res.header['Set-Cookie'] || res.header['set-cookie'])
          return Promise.reject(res)
        }
        app.showErrorToastHandler(res)
      }
    },

    // 获取约面工作地点和面试时间地点
    async getInterviewDate ({ state, dispatch }) {
      try {
        const { longitude, latitude } = cityStore.state
        const param = { postId: state.id, lat: latitude, lng: longitude }
        const { data } = await interviewApi
          .showLoading()
          .getInterviewAdderssAndTime(param)
        const spt = str => str.match(/\d{2}:\d{2}/)[0]

        if (data.length === 0) return

        const getWeek = d => {
          const weekDay = [
            '周日',
            '周一',
            '周二',
            '周三',
            '周四',
            '周五',
            '周六'
          ]
          const myDate = new Date(Date.parse(d))
          return weekDay[myDate.getDay()]
        }

        const interview = data.map((x, i) => {
          x.work_address.isSelect = i === 0
          x.work_times = x.work_times.map(xx => {
            const start = xx.start_time.split(' ')
            const end = xx.end_time.split(' ')
            return {
              isSelect: false,
              date: `${dateFormat(start[0], 'MM/DD')} ${getWeek(start[0])}`,
              time: `${spt(start[1])}-${spt(end[1])}`,
              source: xx
            }
          })
          return x
        })

        state.interview = interview
        state.interviewAddress = interview[0].interview_address
        state.interviewTimes = interview[0].work_times.slice(0, 4) // - 最多取四条时间
      } catch (err) {
        app.showErrorToastHandler(err)
      }
    },

    // 跳转到极速报名页
    goToPageApply ({ state, getters }) {
      const { id, jobType, caCampaign, isInterview } = state
      const pierceParams = encodeURIComponent(getters.pierceParams)

      const query = util.obj2uri({
        pierceParams,
        ca_campaign: caCampaign,
        id,
        jobType,
        isInterview,
        callbackName: 'applyCallback' // - 补充完个人信息后的回调函数
      })

      wx.navigateTo({ url: `${applyPath}?${query}` })
    },

    /**
     * 根据情况带不同参数跳转到报名成功页
     * @param {string} applyId - 报名的id,由接口返回
     */
    goToPageApplySuccess ({ state, getters, commit }, {applyId,biz_qrcode,thrid_web_go,thrid_web_go_desc}) {
      const pages = getCurrentPages()
      const curPage = util.getCurrentPage()
      const isRedirect = (pages.length > 1 && curPage.route !== 'pages/search/search') || curPage.route === 'pages/jobDetail/jobDetail'
      // debugger
      const { id, consultantId, jobType, isChaoJianZhi, isInterview, jobDetail } = state
      const pierceParams = encodeURIComponent(getters.pierceParams)
      const query = util.obj2uri({
        id,
        consultantId,
        contactPerson: jobDetail.contact_person,
        jobType,
        isChaoJianZhi,
        isInterview,
        applyId,
        pierceParams, // - 要透传的埋点参数
        biz_qrcode
      })
      wx.setStorageSync('thrid_web_go',thrid_web_go)
      wx.setStorageSync('thrid_web_go_desc',thrid_web_go_desc)

      wx[isRedirect ? 'redirectTo' : 'navigateTo']({
        url: `${applySuccessPath}?${query}`,
        success: () => {
          commit(DESTROY_JOB)
          commit(THRIDWEBGODESC,{thrid_web_go,thrid_web_go_desc})
        }
      })
    },

    // 发起ev
    postEv ({ getters }, { append = '' }) {
      // - pierceParams 中包含了 `reqid`、`post_id`等参数
      const pierceParams = getters.pierceParams.replace(/&/g, '@')
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5${append}@${pierceParams}`
      )
    },

    // 发起pv
    postPv ({ state, getters: { pierceParams } }, opts = {}) {
      const { source } = state._options
      const { caCampaign } = state

      if (source) {
        // DMC-3413详情页pv埋点dmch增加refer_page参数,值同ev埋点的source
        api.setLog(
          1,
          `${state.dmch}${caCampaign}&${pierceParams}&refer_page=${source}`,
          opts
        )
      } else {
        // 如果没有就不传
        api.setLog(
          1,
          `${state.dmch}${caCampaign}&${pierceParams}`,
          opts
        )
      }
    },

    // 获取唯一标识
    async getInviteCode ({ state, commit }) {
      try {
        const { data } = await commonApi.getInviteCode({ })
        return data
      } catch (err) {
      }
    },

    //同意协议
    async agreeToTheAgreement({ state, commit }, args){
      try {
        const { data } = await commonApi.agreeToTheAgreement(args)
        return data
      } catch (err) {
      }
    },
  }
})
