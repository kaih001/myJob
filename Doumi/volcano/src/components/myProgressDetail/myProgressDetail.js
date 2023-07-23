import { api } from '../../allJS'

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
      '1': 'dm-product-status-reject' // 待面试
    }
  },
  options: {
    multipleSlots: true
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 获取联系方式
    bindCallPhone () {
      api.setLog(2, `@atype=click@ca_name=doumi@ca_source=h5@ca_from=adviser`)
      wx.makePhoneCall({
        phoneNumber: this.data.item.contact_mobile
      })
    },
    // 进入地图页面
    goToMap (e) {
      const { address, latitude, longitude, id } = e.currentTarget.dataset
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5@ca_from=map@post_id=${id}`
      )
      wx.openLocation({
        name: address,
        latitude: +latitude,
        longitude: +longitude
      })
    },
    goToJobDetailEv () {
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5@ca_from=interview_post@post_id=${
          this.data.item.id
        }`
      )
    }
  }
})
