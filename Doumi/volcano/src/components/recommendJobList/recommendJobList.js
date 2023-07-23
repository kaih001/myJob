import { util, api, app } from '../../allJS.js'
import jobDetailInterviewPath from '~/pages/jobDetailInterview/jobDetailInterview?resolve'
import jobDetailPath from '~/pages/jobDetail/jobDetail?resolve'

Component({
  properties: {
    jobId: {
      type: String
    },
    jobType: {
      type: Number,
      observer () {
        this.data.jobType &&
          this.data.jobId &&
          this.getRecommendJobList(
            app.globalData.cityInfo.domain,
            this.data.jobType,
            this.data.jobId
          )
      }
    },
    isChaoJianZhi: {
      type: Boolean,
      value: false
    },
    subscribe: {
      type: Boolean,
      value: false
    }
  },
  data: {
    listData: [],
    source: '',
    reqid: '-'
  },
  attached () {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1].route.split('/')
    const pagePath = currentPage[currentPage.length - 1]
    if (pagePath === 'jobDetail') {
      this.setData({ source: 'tuijian_detail' })
    } else {
      this.setData({ source: 'tuijian_apply_success' })
    }
  },
  methods: {
    async getRecommendJobList (citydomain, job_type, jobId) {
      const query = util.obj2uri({ citydomain, job_type, postsid: jobId })
      const res = await util.getData(`client/recommend/list?${query}`)
      const { data, cityInfo } = res.data

      const reqid = cityInfo.reqid
      this.setData({ listData: data, reqid })
      this.triggerEvent('complete', data)
    },
    /**
     * 埋点
     * id 是当前列表中的职位 id, jobId 是组件所在的职位详情页的职位 id
     * @param {Object} e.currentTarget.dataset
     * ├─ @property {Array} label - 职位的标签
     * ├─ @property {String} query - 当前职位要跳转页面需要携带的参数
     * ├─ @property {String} id - 当前点击职位的 id
     * ├─ @property {Number} index - 当前职位在职位列表的索引
     * └─ @property {Number} label - 当前点击的图片在图片列表中的索引
     */
    lookUpRecommendJob ({
      currentTarget: {
        dataset: { label, query, id, index }
      }
    }) {
      const { jobId, reqid } = this.data
      api.setLog(
        '2',
        `@atype=click@ca_source=h5@ca_name=doumi@from=direct_visits@ca_from=tuijian@post_id=${jobId}@ca_kw=${index}@reqid=${reqid}`
      )

      wx.$addClickIds(id) // - 缓存算法所需参数

      query = query.replace(/&amp;/g, '&')
      if (label.includes('zhipin')) {
        // - 列表的直聘职位现在都走约面流程
        wx.redirectTo({
          url: `${jobDetailInterviewPath}?${query}`
        })
      } else {
        // - 走普通报名流程
        wx.redirectTo({ url: `${jobDetailPath}?${query}` })
      }
    },
    // - 推荐职位点击更多
    showMore () {
      api.setLog(2, '@atype=click@ca_source=h5@ca_name=doumi@ca_from=more')
    }
  }
})
