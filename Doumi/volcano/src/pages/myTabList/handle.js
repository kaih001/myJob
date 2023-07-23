import { createPage } from '@mpxjs/core'
import util from '~/utils/util'
import api from '~/utils/api'
import { dateFormat } from '~/utils/date'
import globalDataStore from '~/store/globalData'

const app = getApp()

let canNextRequest = true
let page = 1

const SHOW_STATUS = {
  // 列表中职位点击产生 ev 的 `ca_form` 的值
  '1': 'interview_post', // 待面试
  '2': 'lentry_post', // 已录取
  '3': 'jentry_post', // 已拒绝
  '4': 'apply_post', // 已报名
  '5': 'entry_post' // 已取消
}
const LIST_TYPE = {
  // 每个 tab 下对应的 pv 和 ev 的`ca_form` 的值
  '1': 'interview', // 待面试
  '2': 'entry', // 已录取
  '3': 'refuse', // 已拒绝
  '0': 'apply' // 已报名
}

createPage({
  data: {
    showErrorTemp: false,
    errorType: '',
    showButtomLoading: false,
    isScrollY: true,
    listData: [],
    // tab状态和type值
    tabType: 0,
    // tab是否有点
    has_spot: false,
    cancelId: ''
  },

  computed: {
    ...globalDataStore.mapState(['isBindPhone'])
  },

  // -------------------------------------------------------------------------
  // 小程序生命周期
  // -------------------------------------------------------------------------

  /**
   * 事件处理函数
   */
  onLoad ({ tabType }) {
    // 从我的页面进入时更新tabType值
    this.tabType = ~~tabType
    this.__updateRedDot()
    this.__init()

    if (wx.canIUse('hideShareMenu')) wx.hideShareMenu()
  },

  onShow () {
    api.setLog(1, '/jianzhi/myapply', {
      list_type: `${LIST_TYPE[this.tabType]}`
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {
    if (canNextRequest) {
      canNextRequest = false
      this.__getListData()
    }
  },

  // -------------------------------------------------------------------------
  // 页面bind的事件
  // -------------------------------------------------------------------------

  methods: {
    /**
     * 切换tab
     */
    changeTab (e) {
      const tabType = ~~e.currentTarget.dataset.tabtype
      page = 1
      this.listData = []
      this.tabType = tabType
      this.showErrorTemp = false
      this.errorType = ''
      util.showLoading()
      this.__getListData()
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5@ca_from=${LIST_TYPE[tabType]}`
      ) // - 点击每个 tab 的 ev
      api.setLog(1, '/jianzhi/myapply', {
        // - 每个 tab 切换的 pv
        list_type: `${LIST_TYPE[tabType]}`
      })
    },

    /**
     * 取消面试按钮
     */
    cancelOption (e) {
      const { id } = e.currentTarget.dataset
      this.cancelId = id
      this.isScrollY = false // - 阻止页面滑动
      this.selectComponent('#myProgressPop').showPop()
      api.setLog(2, `@atype=click@ca_name=doumi@ca_source=h5@ca_from=cancel_ms`)
    },

    /**
     * 弹窗派发事件-提交取消原因
     */
    submitInfo (val) {
      api.setLog(2, `@atype=click@ca_name=doumi@ca_source=h5@ca_from=submit`)
      util
        .getData(
          `interview/cancel`,
          {
            post_id: this.cancelId,
            cancel_reason: val.detail.selectedId,
            custom_cancel_reason: val.detail.otherReason
          },
          'POST'
        )
        .then(async res => {
          if (res.data.code === 1000) {
            api.setLog(
              2,
              `@atype=click@ca_name=doumi@ca_source=h5@ca_from=submit_success`
            )
            await util.showToast('取消成功', { showCancel: false })
            this.selectComponent('#myProgressPop').hidePop()

            this.isScrollY = true // - 恢复页面滑动
            this.cancelId = ''
            this.__getListData()
            this.__updateRedDot()
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        })
    },

    /**
     * 原因弹层点击取消的回调
     */
    bindCancelPop () {
      this.isScrollY = true
      api.setLog(2, '@atype=click@ca_name=doumi@ca_source=h5@ca_from=cancel')
    },

    setLog (e) {
      const { type, id } = e.currentTarget.dataset
      const statusType = SHOW_STATUS[type] ? `${SHOW_STATUS[type]}` : `${type}`
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5@ca_from=${statusType}@post_id=${id}`
      )
    },

    /**
     * 取消报名
     */
    unApply (id, index) {
      util.showLoading()

      util
        .getData(
          `client/unapply/${id}?citydomain=${app.globalData.cityInfo.domain}`
        )
        .then(
          res => {
            api.setLog(
              2,
              `@atype=click@ca_name=doumi@ca_source=h5@ca_from=submit_success`
            )
            util.hideLoading()

            this.listData[index].show_status_code = 5
            this.listData[index].btn = {}
            this.listData[index].show_status_str = '已取消'
            wx.$addCalcelApplyIds(id) // - 添加到已取消报名帖子列表中, 用于在首页列表状态更新
          },
          res => {
            // 请求失败
            util.showToast('取消报名失败')
          }
        )
    },

    /**
     * 取消报名
     */
    openCancleConfirm (e) {
      this.setLog(e)

      const { id, index } = e.currentTarget.dataset

      wx.showModal({
        content: '确定取消报名？',
        confirmText: '确认',
        cancelText: '取消',
        success: res => {
          if (res.confirm) {
            api.setLog(
              2,
              `@atype=click@ca_name=doumi@ca_source=h5@ca_from=submit`
            )
            this.unApply(id, index)
          } else {
            api.setLog(
              2,
              `@atype=click@ca_name=doumi@ca_source=h5@ca_from=cancel`
            )
          }
        }
      })
    },

    openComplaintConfirm (e) {
      const { id } = e.currentTarget.dataset
      this.setLog(e)
      util.telPhone('拨打斗米客服电话投诉', res => {
        if (res === 'confirm') {
          api.setLog(
            2,
            '@atype=click@ca_name=doumi@ca_source=h5@ca_from=call@post_id=' + id
          )
        } else {
          api.setLog(
            2,
            '@atype=click@ca_name=doumi@ca_source=h5@ca_from=cancel@post_id=' + id
          )
        }
      })
    },

    // -------------------------------------------------------------------------
    // 页面方法, 双下划线开头表示私有方法, 供内部调用
    // -------------------------------------------------------------------------

    /**
     * 更新红点状态
     */
    __updateRedDot () {
      util.getData('ucenter/common').then(res => {
        this.has_spot = res.data.data.interview_red_dot
      })
    },

    /**
     * 获取数据
     */
    async __getListData () {
      try {
        if (!app.globalData.locationData) await app.checkAuthAndGetLocation(false)
      } catch (err) {} // - 拒绝地理位置授权或者授权失败
      const { locationData } = app.globalData

      let lat = ''
      let lng = ''
      if (locationData) {
        lat = locationData.latitude
        lng = locationData.longitude
      }

      const query = util.obj2uri({
        type: this.tabType,
        lat,
        lng,
        page
      })

      try {
        const res = await util.getData(`apply/list?${query}`)
        util.hideLoading()
        if (
          res &&
          res.data &&
          res.data.data &&
          res.data.data.data &&
          res.data.data.data.length > 0
        ) {
          canNextRequest = true
          let list = []
          if (page === 1) {
            this.showButtomLoading = true
            list = res.data.data.data
          } else {
            list = [...this.listData, ...res.data.data.data]
          }

          const transformTime = times => {
            if (!times) return
            const start = times.start_time
            const end = times.end_time
            times.time = `${dateFormat(start, 'YYYY/MM/DD')}  ${dateFormat(
              start,
              'HH:mm'
            )} - ${dateFormat(end, 'HH:mm')}`
          }

          list.forEach(item => {
            if (item.detail) {
              transformTime(item.detail.interview_times)
            } else {
              transformTime(item.interview_times)
            }
          })
          this.listData = list
          if (
            res.data.data.last_page === 1 ||
            res.data.data.current_page === res.data.data.last_page
          ) {
            canNextRequest = false
            this.showButtomLoading = false
          } else {
            page++
          }
        } else if (
          res &&
          res.data &&
          res.data.data &&
          res.data.data.data &&
          res.data.data.data.length === 0
        ) {
          canNextRequest = false
          if (page === 1) {
            // 显示没有数据页面
            this.showErrorTemp = true
            this.errorType = 'noData'
          } else {
            this.showButtomLoading = false
          }
        } else {
          canNextRequest = true
          if (page === 1) {
            // 获取数据失败页面
            app.showErrorPageHandler('loadFail')
          } else {
            util.showToast('服务器异常') // 弹toast提示
          }
        }
      } catch (err) {
        canNextRequest = true

        if (page === 1) {
          // 获取数据失败页面
          app.showErrorPageHandler(err)
        } else {
          // 弹toast提示
          app.showErrorToastHandler(err)
        }
      }
    },

    __init () {
      this.showErrorTemp = false
      this.showButtomLoading = false

      if (this.isBindPhone) {
        wx.pageScrollTo({ scrollTop: 0 }) // 返回顶部
        util.showLoading()
        page = 1
        canNextRequest = true
        this.__getListData()
        this.$nextTick(() => this.$refs.dmSurveyPop.check()) // 检查签到提醒
      }
    }
  }
})
