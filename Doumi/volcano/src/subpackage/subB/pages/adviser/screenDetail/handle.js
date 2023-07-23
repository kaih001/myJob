import { util, api, app } from '../../../../../allJS.js'
import { createPage } from '@mpxjs/core'
import pageJobDetailInterview from '~/pages/jobDetailInterview/jobDetailInterview?resolve'
import pageJobDetail from '~/pages/jobDetail/jobDetail?resolve'
import screenDetailPath from '~/subpackage/subB/pages/adviser/screenDetail/screenDetail?resolve'

let canNextRequest = true
let dmch = '/jianzhi/juhe'

createPage({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------
  data: {
    page: 1,
    pageSize: 10,
    showErrorTemp: false,
    errorType: '',
    listQueryParams: {},
    setScrollTop: 0,
    listData: [],
    showNoMore: false,
    showButtomLoading: false,
    reqid: '-',
    // 顾问
    jobAdviser: '-'
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    // 分享卡片添加顾问id
    this.listQueryParams.jobAdviser = this.jobAdviser
    const query = util.obj2uri(this.listQueryParams)
    console.log(query)
    const result = {
      path: `${screenDetailPath}?${query}`
    }
    return result
  },

  // -------------------------------------------------------------------------
  // 小程序生命周期
  // -------------------------------------------------------------------------
  onLoad (options) {
    // 获取顾问id
    this.jobAdviser = wx.getStorageSync('jobAdviser')
    // 如果此页由顾问筛选页跳转，获取顾问筛选条件，并清除缓存
    if (wx.getStorageSync('adviserScreenParams')) {
      this.listQueryParams = wx.getStorageSync('adviserScreenParams')
      wx.removeStorageSync('adviserScreenParams')
    }

    // 分享卡片进入
    if (options.jobAdviser) {
      // 获取分享顾问name
      console.log('options')
      console.log(options)
      this.jobAdviser = options.jobAdviser
      // 否则由分享卡片进入，获取顾问筛选条件
      delete options.ald_share_src
      delete options.jobAdviser
      for (let x in options) {
        if (x !== 'treatment') {
          options[x] = Number(options[x])
        }
      }
      this.listQueryParams = options
    }

    // 初始化页面
    this.init()

    // pv埋点
    api.setLog(1, dmch, { ca_campaign: this.jobAdviser })
  },
  onShow () {},

  // -------------------------------------------------------------------------
  // 页面bind的事件
  // -------------------------------------------------------------------------

  /**
   * 返回顶部
   */
  backTop () {
    this.setData({ setScrollTop: 0 })
    wx.pageScrollTo({ setScrollTop: 0 }) // 返回顶部
  },

  // 加载下一页列表数据
  loadMore () {
    if (canNextRequest) {
      canNextRequest = false
      this.__getListData()
    }
  },

  // 点击列表
  bindItemClick ({
    currentTarget: {
      dataset: { index, id, label, query }
    }
  }) {
    api.setLog(
      2,
      `@atype=click@ca_name=doumi@ca_source=h5@ca_from=post_list@post_id=${id}@ca_kw=${index}@reqid=${this.reqid}`
    )

    query = query.replace(/&amp;/g, '&')

    if (label.includes('zhipin')) {
      // - 列表的直聘职位现在都走约面流程
      wx.navigateTo({
        url: `${pageJobDetailInterview}?${query}`
      })
    } else {
      // - 走普通报名流程
      wx.navigateTo({ url: `${pageJobDetail}?${query}` })
    }
  },

  // -------------------------------------------------------------------------
  // 页面方法, 双下划线开头表示私有方法, 供内部调用
  // -------------------------------------------------------------------------

  // 页面初始化/用于无网络重新加载 template/error
  async init () {
    // 获取页面列表数据
    this.__getListData()
  },

  // 获取页面列表数据
  async __getListData () {
    util.showLoading()
    try {
      this.listQueryParams.page = this.page
      this.listQueryParams.pageSize = this.pageSize
      console.log(this.listQueryParams)
      const res = await util.getData(
        'client/aggregation/consultant/sharelist',
        this.listQueryParams,
        'POST'
      )
      const { code, data, cityInfo } = res.data
      util.hideLoading()

      if (code === 1000) {
        if (this.page !== 1) {
          this.listData = [...this.listData, ...data.data]
        } else {
          this.listData = data.data
        }
        this.__initTracker()
        if (data.totalPage !== 0 && data.data.length >= 10) {
          this.page++
          canNextRequest = true
          this.showNoMore = false
          this.showButtomLoading = false
        } else {
          canNextRequest = false
          this.showNoMore = true
          this.showButtomLoading = false
        }
        this.reqid = cityInfo.reqid
      } else {
        app.showErrorToastHandler(res.data)
      }
    } catch (err) {
      util.hideLoading()
      this.showErrorTemp = true
      this.errorType = err === 'offline' ? 'offline' : 'loadFail'
    }
  },

  // 曝光埋点初始化
  __initTracker () {
    wx.$tracker
      .trackExposure(dmch, {
        el: { list: '.dm-list-item' },
        dmalog: list => {
          // 添加ad_type参数
          list.map(item => {
            item.ad_type = 0
            return item
          })
          list = JSON.stringify(list)
          return `@atype=scroll@ca_name=doumi@ca_source=h5@ca_from=show_post_list@show_post_id=${list}`
        }
      })
      .success(arg => console.log('曝光埋点发起成功: ', arg))
      .fail(err => console.warn('曝光埋点发起失败: ', err))
  }
})
