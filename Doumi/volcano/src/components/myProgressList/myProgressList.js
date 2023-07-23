import { util, api, app } from '../../allJS.js'

const EV_STATUS = {
  // 点击面试时间或者工作地点产生 ev 的 `ca_form` 的值
  '1': 'msdetail', // 待面试
  '2': 'lmsdetail', // 已录取
  '3': 'jmsdetail', // 已拒绝
  '4': '', // 已报名
  '5': '' // 已取消
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showStatus: {
      '1': 'dm-product-status-reject', // 待面试
      '2': 'dm-product-status-reject', // 已录取
      '3': 'dm-product-status-cancle', // 已拒绝
      '4': 'dm-product-status-reject', // 已报名
      '5': 'dm-product-status-cancle' // 已取消
    }
  },
  options: {
    multipleSlots: true
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 根据条件跳转约面职位详情或者普通职位详情
     * @param {Object} e.currentTarget.dataset
     * └─ @property {String} query - 要跳转到页面需要的参数
     */
    async bindGoToJobDetail ({
      currentTarget: {
        dataset: { query }
      }
    }) {
      query = query.replace(/&amp;/g, '&')
      let url = `../../pages/jobDetail/jobDetail?${query}`
      try {
        util.showLoading()
        const res = await util.getData(
          `client/applyinfo/${this.data.item.post_id}?rp=mobile`
        )
        const { interview_info } = res.data

        if (interview_info.is_zhipin) {
          // - 直聘帖都跳约面详情页模板
          url = `../../pages/jobDetailInterview/jobDetailInterview?${query}`
        }
      } catch (err) {
        app.showErrorToastHandler(err)
      }

      wx.navigateTo({ url })
    },

    /**
     * 跳转到面试详情页
     * @param {Object} e.currentTarget.dataset
     * └─ @property {String} query - 要跳转到页面需要的参数
     */
    bindGoToInterviewDetail ({
      currentTarget: {
        dataset: { id, status, query }
      }
    }) {
      query = query.replace(/&amp;/g, '&')
      wx.navigateTo({
        url: `../../pages/myInterviewDetail/myInterviewDetail?${query}`
      })
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5@ca_from=${
          EV_STATUS[status]
        }@post_id=${id}`
      )
    }
  }
})
