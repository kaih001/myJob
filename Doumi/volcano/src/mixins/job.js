import api from '~/utils/api'
import util from '~/utils/util'
import globalDataStore from '~/store/globalData'
import jobStore from '~/store/job'

const STE = jobStore.state

export default {
  // -------------------------------------------------------------------------
  // 计算属性(在store中共享)
  // -------------------------------------------------------------------------

  computed: {
    ...jobStore.mapState(Object.keys(STE)),
    ...globalDataStore.mapState(['isIpx', 'isBindPhone'])
  },

  watch: {
    // 监听如果有从其他页面登录回来的, 需要更新按钮信息
    isBindPhone (val) {
      this.updateDetailBtn() // 获取按钮信息
    }
  },
  data: {
    thisPageData: {
    }
  },

  // -------------------------------------------------------------------------
  // 小程序生命周期
  // -------------------------------------------------------------------------

  onLoad (options) {
    util.showLoading()
    let { from, scene, ca_campaign, fromCompanydetail, f } = options

    if (from) {
      api.setCasource('', from)
    }
    if (scene) {
      scene = util.decodeURI(scene)
      options.id = util.getQueryFieldVal(scene, 'jobid') || util.getQueryFieldVal(scene, 'id')
      options.jobType = util.getQueryFieldVal(scene, 'jobtype') || util.getQueryFieldVal(scene, 'type')
      options.consultantId = util.getQueryFieldVal(scene, 'cid')
      options.f = util.getQueryFieldVal(scene, 'f')
    }
    if (ca_campaign) {
      STE.caCampaign = `&ca_campaign=${ca_campaign}`
    }
    if (f || options.f) {
      STE.caCampaign = `&ca_campaign=dyxx_${f || options.f}`
    }

    if (fromCompanydetail) {
      STE.fromCompanydetail = fromCompanydetail
    }

    // 设置缓存中的注册信息
    let reg=/^[0-9]*$/;
    if (options.invite_code) {
      wx.setStorageSync('register', options.invite_code)
    }else if(options.consultantId&&!reg.test(options.consultantId)){
      wx.setStorageSync('register', options.consultantId)
    }

    // - consultantId 是顾问 id
    const { id, jobType, consultantId } = options
    STE.dmch = `/jianzhi/${jobType}/detail/index`
    STE._options = options
    STE.id = id
    STE.jobType = jobType
    STE.consultantId = consultantId || ''
    this.thisPageData.options = options
    this.thisPageData.id = id
    this.thisPageData.jobType = jobType
    this.thisPageData.consultantId = consultantId
    // console.log(this.thisPageData)

    this.getDetail() // 获取职位信息
    this.updateDetailBtn() // 获取按钮信息
    this.$nextTick(() => this.$refs.dmInterviewPop.check()) // 检查面试提醒
  },

  onShow () {

    if (!STE.id) {
      STE.id = this.thisPageData.id
      STE.jobType = this.thisPageData.jobType
      STE.consultantId = this.thisPageData.consultantId || ''
      this.getDetail() // 获取职位信息
      this.updateDetailBtn() // 获取按钮信息
      this.updateDetailPhoneBtn()//获取电话联系按钮信息
      this.$nextTick(() => this.$refs.dmInterviewPop.check()) // 检查面试提醒
    }
    this.updateDetailPhoneBtn()//获取电话联系按钮信息
  },

  /**
   * 用户点击右上角分享
   */
  async onShareAppMessage (res) {
    console.log('diidd',res);
    // DMC-3304点击右上角分享按钮ev埋点
    this.postEv({ append: '@ca_from=share_topright' })
    this.postEv({ append: '@ca_from=share' })
    if(res.from=='button'){
      this.postEv({ append: '@ca_from=share_202201_wx' })
    }

    const { title } = STE.jobDetail
    const { imageUrl } = this.$refs.dmShareDetail
    this.saveShare()
    let data= await this.getInviteCode()
    res.invite_code=data.invite_code

    const result = util.shara(res, res => {
      // 分享成功
      if (res === 'success') this.postEv({ append: '@ca_from=wxfriend' })
    })

    result.invite_code=data.invite_code;
    return { ...result, title, imageUrl }
  },

  methods: {
    ...globalDataStore.mapMutations(['updateLoginStatus']),
    ...jobStore.mapActions(['getDetail', 'updateDetailBtn', 'postEv','updateDetailPhoneBtn','saveShare','getInviteCode']),

    // 用于无网络重新加载 template/error
    init () {
      STE.showErrorTemp = false
      this.getDetail()
      this.updateLoginStatus()
      this.updateDetailBtn()
    }
  }
}
