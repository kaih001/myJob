import { app, util } from '../../allJS.js'

Component({
  data: {
    active: 'icon-down',
    jobType: false,
    city: false,
    sort: false,
    select: false,
    fixClass: '',
    contentScroll: true,
    lastPoint: null,
    secondDistrict: null,
    districtId: 0,
    streetId: 0,
    jobId: 0,
    sortId: 0,
    moreId: [],
    sex: 0,
    sexActive: 0,
    identity: 0,
    identityActive: 0,
    districtText: '',
    streetText: '',
    dateType: 0,
    dateTypeActive: 0,
    dateTypeText: '',
    jobText: '',
    sortText: '',
    sexText: '',
    identityText: '',
    reset: null,
    cacheConfig: null,
    moreCacheData: null,
    isClick: true,
    hideSort: true
  },

  lifetimes: {
    ready () {
      // 在组件实例进入页面节点树时执行
      if (this.data.isNear) {
        // 如果从首页运营位点击的运营位带sort=1(即离我最近)，第三个按钮默认选中离我最近
        this.setData({ sortText: '离我最近', sortId: 1 })
      }

      const { domain } = app.globalData.cityInfo
      if (!domain) return false

      util.getData(`client/indexmeta?citydomain=${domain}`)
        .then(data => {
          if (data.data.data.hideSort === 0) { // 展示
            this.setData({ hideSort: true })
          } else if (data.data.data.hideSort === 1) {
            this.setData({ hideSort: false })
          }
        })
    },
  },
  properties: {
    config: Object,
    doubleDis: Boolean,
    isNear: Boolean
  },
  methods: {
    setSelect () {
      this.setData({
        sexText: this.data.moreCacheData.sexText,
        identityText: this.data.moreCacheData.identityText,
        moreId: this.data.moreCacheData.moreId,
        sex: this.data.moreCacheData.sex,
        sexActive: this.data.moreCacheData.sexActive,
        identity: this.data.moreCacheData.identity,
        identityActive: this.data.moreCacheData.identityActive,
        dateType: this.data.moreCacheData.dateType,
        dateTypeActive: this.data.moreCacheData.dateTypeActive,
        dateTypeText: this.data.moreCacheData.dateTypeText
      })
    },
    // 点击蒙层收起筛选框
    close () {
      if (this.data.moreCacheData && this.data.select) {
        this.setSelect()
      }
      this.setData({
        jobType: false,
        city: false,
        sort: false,
        select: false,
        moreCacheData: null
      })
      this.complete('close')
    },
    // 筛选框重置按钮
    reset () {
      let obj = this.data.config
      for (let i = 0; i < obj.more.more.length; i++) {
        obj.more.more[i].show = true
      }
      this.setData({
        reset: false,
        config: obj,
        sex: '',
        sexActive: 0,
        sexText: '',
        identity: '',
        identityActive: 0,
        identityText: '',
        dateType: '0',
        dateTypeActive: '0',
        dateTypeText: '',
        moreId: [],
        moreCacheData: null
      })
      this.setData({
        moreCacheData: {
          sexText: this.data.sexText,
          identityText: this.data.identityText,
          moreId: this.data.moreId,
          sex: this.data.sex,
          sexActive: this.data.sexActive,
          identity: this.data.identity,
          identityActive: this.data.identityActive,
          dateType: this.data.dateType,
          dateTypeActive: this.data.dateTypeActive,
          dateTypeText: this.data.dateTypeText
        }
      })
      this.complete('reset')
    },
    // 筛选点击完成
    sortCom () {
      if (this.data.moreCacheData) {
        this.setData({
          moreCacheData: null
        })
      }
      this.complete('complete')
      this.close()
      if (this.data.cacheConfig) {
        this.setData({
          config: this.data.cacheConfig,
          cacheConfig: null
        })
      }
    },
    // 筛选栏目确定按钮
    complete (selectType) {
      let self = this
      if (!this.data.isClick) {
        return
      }
      this.setData({
        isClick: false
      })
      setTimeout(function () {
        self.setData({
          isClick: true
        })
      }, 200)
      this.triggerEvent('select', {
        type: 'secClick',
        selectType: selectType || 'more',
        data: {
          districtId: this.data.districtId,
          districtText: this.data.districtText || '',
          streetId: this.data.streetId,
          streetText: this.data.streetText || '',
          jobId: this.data.jobId,
          jobText: this.data.jobText || '',
          sortId: this.data.sortId,
          sortText: this.data.sortText || '',
          moreId: this.data.moreId,
          sex: this.data.sex,
          sexText: this.data.sexText || '',
          identity: this.data.identity,
          identityText: this.data.identityText || '',
          dateType: this.data.dateType,
          dateTypeActive: this.data.dateTypeActive,
          dateTypeText: this.data.dateTypeText,
          isSelect: false
        }
      })
    },
    // 筛选栏目点击多选的时候触发
    check (e) {
      this.setData({
        moreId: e.detail.value
      })
      this.complete()
    },
    // 点击一级区域的时候触发，展示二级区域
    chooseDistrict (e) {
      if (e.currentTarget.dataset.id !== 0) {
        this.setData({
          districtId: e.currentTarget.dataset.id,
          districtText: e.currentTarget.dataset.text,
          streetText: '',
          streetId: 0
        })
      } else {
        this.setData({
          districtId: e.currentTarget.dataset.id,
          districtText: '全城',
          streetText: '',
          streetId: 0,
          secondDistrict: []
        })
        this.complete(e.currentTarget.dataset.name)
        this.close()
        return
      }
      this.complete('district1')
      if (this.data.districtId) {
        util.getData(`client/getstreets?districtId=${e.currentTarget.dataset.id}`)
          .then(data => {
            if (data.data.code === 1000) {
              this.setData({
                secondDistrict: data.data.data
              })
            } else {
              wx.showToast({
                title: data.data.msg
              })
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    // 点击一级区域的时候触发，不展开二级地区
    singleChooseDistrict (e) {
      if (e.currentTarget.dataset.id !== 0) {
        this.setData({
          districtId: e.currentTarget.dataset.id,
          districtText: e.currentTarget.dataset.text,
          streetText: '',
          streetId: 0
        })
      } else {
        this.setData({
          districtId: e.currentTarget.dataset.id,
          districtText: '全城',
          streetText: '',
          streetId: 0,
          secondDistrict: []
        })
      }
      this.complete(e.currentTarget.dataset.name)
      this.close()
    },
    // 点击每个筛选项的时候触发
    choose (e) {
      let obj = this.data.config
      if (this.data.cacheConfig) {
        obj = this.data.cacheConfig
        this.setData({
          cacheConfig: null
        })
      }
      if (e.currentTarget.dataset.name === 'job_type') {
        this.setData({
          jobId: e.currentTarget.dataset.id,
          jobText: e.currentTarget.dataset.text
        })
      } else if (e.currentTarget.dataset.name === 'district') {
        this.setData({
          streetId: e.currentTarget.dataset.id,
          streetText: e.currentTarget.dataset.text,
          secondDistrict: this.data.secondDistrict
        })
      } else if (e.currentTarget.dataset.name === 'order') {
        this.setData({
          sortId: e.currentTarget.dataset.id,
          sortText: e.currentTarget.dataset.text
        })
      } else if (e.currentTarget.dataset.name === 'more') {
        if (e.currentTarget.dataset.type === 'demand') {
          let key = e.currentTarget.dataset.key
          this.setData({
            [`${key}Active`]: e.currentTarget.dataset.id,
            [key]: e.currentTarget.dataset.id,
            [`${key}Text`]: e.currentTarget.dataset.text
          })
        }
        if (e.currentTarget.dataset.type === 'more') {
          obj[e.currentTarget.dataset.name][e.currentTarget.dataset.type][e.currentTarget.dataset.index].show = !obj[e.currentTarget.dataset.name][e.currentTarget.dataset.type][e.currentTarget.dataset.index].show
        }
      }
      this.complete(e.currentTarget.dataset.name)
      if (e.currentTarget.dataset.name !== 'more') {
        this.close()
        this.setData({
          config: obj
        })
      } else {
        this.setData({
          cacheConfig: obj
        })
      }
    },
    click (e) {
      let self = this
      if (!this.data.isClick) {
        return
      }
      this.setData({
        isClick: false
      })
      setTimeout(function () {
        self.setData({
          isClick: true
        })
      }, 100)
      if (this.data[e.currentTarget.dataset.name]) {
        this.setData({
          [e.currentTarget.dataset.name]: false,
        })
        if (this.data.moreCacheData) {
          this.setSelect()
          this.setData({
            moreCacheData: null
          })
        }
        this.triggerEvent('select', {
          type: 'fsClick',
          data: {
            data: e.currentTarget.dataset.name,
            isSelect: false
          }
        })
        return
      }
      let moreCacheDataSave = this.data.jobType || this.data.city || this.data.sort || this.data.select
      if (e.currentTarget.dataset.name === 'select' && !moreCacheDataSave) {
        this.setData({
          moreCacheData: {
            sexText: this.data.sexText,
            identityText: this.data.identityText,
            moreId: this.data.moreId,
            sex: this.data.sex,
            sexActive: this.data.sexActive,
            identity: this.data.identity,
            identityActive: this.data.identityActive,
            dateType: this.data.dateType,
            dateTypeActive: this.data.dateTypeActive,
            dateTypeText: this.data.dateTypeText
          }
        })
        console.log(this.data.moreCacheData)
      }
      self.setData({
        jobType: false,
        city: false,
        sort: false,
        select: false,
        [e.currentTarget.dataset.name]: true
      })
      let name = e.currentTarget.dataset.name
      self.triggerEvent('select', {
        type: 'fsClick',
        data: {
          data: name,
          isSelect: true
        }
      })
    }
  }
})