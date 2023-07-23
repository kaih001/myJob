// pages/uc/perfect_information/perfect_information.js
var dmNetwork = require('../../../utils/network.js')
import { OCR } from '../../../utils/ocr'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    real_name: '',
    mobile: '',
    idnumber: '',
    detail_address: '',
    detail_address_flag: true,
    detail_unit_company: '',
    detail_unit_company_flag: true,
    detail_leaving_reason_flag: true,
    detail_nocontract_reason_flag: true,
    detail_leaving_reason: '',
    detail_nocontract_reason: '',
    real_name_enable_flag: true,
    mobile_enable_flag: true,
    idnumber_enable_flag: true,
    detail_address_enable_flag: true,
    is_protocol_supplement_info: 0,
    team_id: '',
    project_id: '',
    protocol_order_id: '',
    index: -1,
    employer: '',
    company: [],
    frontCardImg: '',
    backCardImg: '',
    uploadFrontImg: '',
    uploadBackImg: '',
    bank_images: '',
    health_images: '',
    bank_images_view: '',
    health_images_view: '',
    is_upload_idcard_info: 0,
    is_ocr_check: 1,
    newOcrData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('team_id:' + options.team_id)
    console.log('project_id:' + options.project_id)
    this.setData({
      team_id: options.team_id,
      is_protocol_supplement_info: options.is_protocol_supplement_info,
      is_upload_idcard_info: options.is_upload_idcard_info || 1,
      // agreement_num: options.agreement_num,
      // protocol_type: options.protocol_type,
      project_id: options.project_id,
      protocol_order_id: options.protocol_order_id,
      is_ocr_check: options.is_ocr_check
    })
    var that = this;
    dmNetwork.get(dmNetwork.getauthentication, { project_id: options.project_id }, (res) => {
      if (res.data.errno == 0) {
        that.setData({
          real_name: res.data.data.real_name,
          mobile: res.data.data.mobile,
          idnumber: res.data.data.idnumber,
          detail_address: res.data.data.detail_address,
          employer: res.data.data.is_company,
          bank_images_view: res.data.data.bank_images,
          health_images_view: res.data.data.health_images,
          frontCardImg: res.data.data.card_front,
          backCardImg: res.data.data.card_back,
          uploadFrontImg: res.data.data.card_front,
          uploadBackImg: res.data.data.card_back,
          bank_images: res.data.data.bank_images,
          health_images: res.data.data.health_images,
        })
      }
      if (res.data.data.is_company) {
        that.getCompany()
      }

      if (res.data.data.real_name) {
        that.setData({
          real_name_enable_flag: false,
        })
      }

      if (res.data.data.mobile) {
        that.setData({
          mobile_enable_flag: false,
        })
      }

      if (res.data.data.idnumber) {
        that.setData({
          idnumber_enable_flag: false,
        })
      }

      if (res.data.data.detail_address) {
        that.setData({
          detail_address_enable_flag: false,
        })
      }

    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  next: function () {
    const that = this;
    // if (this.data.is_protocol_supplement_info == 1) {
    //   if (!(this.data.real_name && this.data.mobile && this.data.idnumber && this.data.detail_address && this.data.detail_unit_company && this.data.laborRelationsDate && this.data.detail_leaving_reason && this.data.detail_nocontract_reason)) {
    //     return;
    //   }
    //   if (this.data.employer && this.data.index == -1) {
    //     return
    //   }
    // } else {
    //   console.log(this.data.employer);
    //   console.log(this.data.employer);
    //   if (this.data.employer && this.data.index == -1) {
    //     return
    //   }
    //   if (!(this.data.real_name && this.data.mobile && this.data.idnumber && this.data.detail_address)) {
    //     console.log('111111' + '有未填写的项目')
    //     return;
    //   }
    // }
    if (!that.checkFormData()) {
      return
    }

    // let params = {
    //   name: that.data.real_name,
    //   idnumber: that.data.idnumber,
    //   detail_address: that.data.detail_address,
    //   mobile: that.data.mobile,
    //   project_id: that.data.project_id
    // }

    // if (that.data.is_protocol_supplement_info == 1) {
    //   params.original_company = that.data.detail_unit_company
    //   params.leave_date = that.data.laborRelationsDate
    //   params.leave_reason = that.data.detail_leaving_reason
    //   params.no_leave_certify_reason = that.data.detail_nocontract_reason
    //   params.protocol_order_id = that.data.protocol_order_id
    // }
    // if (that.data.employer) {
    //   params.employer_id = that.data.company[that.data.index].id
    // }
    const { ocrParams, otherInfoParams } = that.getOtherInfoParams();
    console.log('kaieee', ocrParams)
    console.log('kaieee', otherInfoParams)
    that.loading()
    const allPromise = that.data.is_upload_idcard_info == 1 && that.data.is_ocr_check == 1 ? [that.setOcr(ocrParams), that.setOtherInfo(otherInfoParams)] : [that.setOtherInfo(otherInfoParams)];
    console.log('kaieee', allPromise)
    // return
    Promise.all(allPromise).then((v) => {
      that.hideLoading()
      console.log('sucess', v)
      const navigateUrl = `../contract_signing_new/contract_signing_new?project_id=${that.data.project_id}&team_id=${that.data.team_id}`
      wx.navigateTo({
        url: navigateUrl,
      })
    }).catch((err) => {
      // that.hideLoading()
      console.log('faile', err)
    })
    return
    dmNetwork.get(dmNetwork.doauthentication, params, (res) => {
      wx.hideLoading()
      let navigateUrl = `../contract_signing_new/contract_signing_new?project_id=${that.data.project_id}&team_id=${that.data.team_id}`
      if (res.data.errno == 0) {
        wx.navigateTo({
          url: navigateUrl,
        })
      } else {
        wx.showToast({
          title: res.data.errmsg,
          icon: 'none'
        })
      }
    })
  },
  // ocr 请求
  setOcr (params) {
    return new Promise((resolve, reject) => {
      dmNetwork.get(dmNetwork.auth, params, (res) => {
        if (res.data.errno == 0 || res.data.errno==29022) {
          resolve(res.data)
        } else {
          reject()
        }
      })
    })
  },
  // 其他请求
  setOtherInfo (params) {
    return new Promise((resolve, reject) => {
      dmNetwork.get(dmNetwork.doauthentication, params, (res) => {
        if (res.data.errno == 0) {
          resolve(res.data)
        } else {
          wx.showToast({
            title: res.data.errmsg,
            icon: 'none',
            duration:3000
          })
          reject()
        }
      })
    })
  },
  /**
   * 获取用人单位
   * @param {*} e 
   */
  getCompany: function () {
    var that = this;
    dmNetwork.get(dmNetwork.getCompany, {
      page_no: 1,
      page_size: 10000
    }, (res) => {
      console.log('ressssssss', res);
      if (res.data.errno == 0 && res.data.data.list && res.data.data.list.length) {
        that.setData({
          company: res.data.data.list
        })
      } else {
        that.setData({
          company: []
        })
      }
    })
  },

  real_name: function (e) {
    var value = e.detail.value;
    if (value) {
      this.setData({
        real_name: value
      })
    } else {
      this.setData({
        real_name: ''
      })
    }
  },

  mobile: function (e) {
    var value = e.detail.value;
    if (value) {
      this.setData({
        mobile: value
      })
    } else {
      this.setData({
        mobile: ''
      })
    }
  },

  idnumber: function (e) {
    var value = e.detail.value;
    if (value) {
      this.setData({
        idnumber: value
      })
    } else {
      this.setData({
        idnumber: ''
      })
    }
  },

  detail_address: function (e) {
    var value = e.detail.value;
    if (value) {
      this.setData({
        detail_address: value
      })
    } else {
      this.setData({
        detail_address: ''
      })
    }
  },
  bindDateChange (e) {
    this.setData({
      laborRelationsDate: e.detail.value
    })
  },
  blur_unit_company () {
    if (!this.data.detail_unit_company) {
      return
    }
    this.setData({
      detail_unit_company_flag: false
    })
  },
  on_unit_company_txt () {
    this.setData({
      detail_unit_company_flag: true
    })
  },
  blur_detail_address () {
    if (!this.data.detail_address) {
      return
    }
    this.setData({
      detail_address_flag: false
    })
  },
  on_detail_address_txt () {
    this.setData({
      detail_address_flag: true
    })
  },
  detail_unit_company: function (e) {
    var value = e.detail.value;
    if (value) {
      this.setData({
        detail_unit_company: value,
      })
    } else {
      this.setData({
        detail_unit_company: ''
      })
    }
  },

  blur_leaving_reason () {
    if (!this.data.detail_leaving_reason) {
      return
    }
    this.setData({
      detail_leaving_reason_flag: false
    })
  },
  on_leaving_reason_txt () {
    this.setData({
      detail_leaving_reason_flag: true
    })
  },
  detail_leaving_reason: function (e) {
    var value = e.detail.value;
    if (value) {
      this.setData({
        detail_leaving_reason: value,
      })
    } else {
      this.setData({
        detail_leaving_reason: ''
      })
    }
  },



  blur_nocontract_reason () {
    if (!this.data.detail_nocontract_reason) {
      return
    }
    this.setData({
      detail_nocontract_reason_flag: false
    })
  },
  on_nocontract_reason_txt () {
    this.setData({
      detail_nocontract_reason_flag: true
    })
  },
  detail_nocontract_reason: function (e) {
    var value = e.detail.value;
    if (value) {
      this.setData({
        detail_nocontract_reason: value,
      })
    } else {
      this.setData({
        detail_nocontract_reason: ''
      })
    }
  },
  pickerChange: function (e) {
    console.log('vvvvvvvv', e);
    this.setData({
      index: e.detail.value
    })
  },
  // 身份证正面
  async uploadIDcard (e) {
    if (this.data.is_ocr_check == 0) {
      wx.showToast({
        title: '您已经进行过ocr识别，请勿重复上传！',
        icon: 'none'
      })
      return
    }
    const target = e.currentTarget.dataset.idcard;
    const ocrUploadConfig = {
      isOcr: true,
      frontCardImg: 'front_image',
      backCardImg: 'back_image',
      ocrUrl: '/sea/api/1.0/client/v1/user/ocr/idcard?dmclient=weixinxcx',
    }
    const [error, uploadData] = await OCR.uploadImg(target, ocrUploadConfig);
    console.log('uploaddata.....', uploadData)
    this.getCardimg(uploadData);
  },
  // 健康证和银行卡
  async uploadHealthWithBankCard (e) {
    const target = e.currentTarget.dataset.ordinary;
    const uploadConfig = {
      isOcr: false,
      ocrUrl: '/sea/api/1.0/client/v1/user/ocr/idcard?dmclient=weixinxcx',
    }
    const [error, uploadData] = await OCR.uploadImg(target, uploadConfig);
    console.log('uploaddata.....', uploadData)
    this.getCardimg(uploadData);
  },
  //获取健康证和银行卡图片
  getCardimg ({ target, zipPath, newDoumiData, newOcrData }) {
    const that = this;
    const cardImgConfig = {
      frontCardImg: {
        uploadImgView: 'frontCardImg',
        uploadImg: 'uploadFrontImg'
      },
      backCardImg: {
        uploadImgView: 'backCardImg',
        uploadImg: 'uploadBackImg'
      },
      healthCard: {
        uploadImgView: 'health_images_view',
        uploadImg: 'health_images'
      },
      bankCard: {
        uploadImgView: 'bank_images_view',
        uploadImg: 'bank_images'
      }
    }
    if (target == "frontCardImg") {
      wx.setStorageSync('upload_idcard_number', newOcrData.data.idcard_number)
      // that.setData({
      //   newOcrData
      // })
    }
    that.setData({
      [cardImgConfig[target].uploadImgView]: zipPath,
      [cardImgConfig[target].uploadImg]: newDoumiData.info[0].url
    })
  },
  // 校验
  checkFormData () {
    const that = this;
    if (!(that.data.real_name && that.data.mobile && that.data.idnumber && that.data.detail_address)) {
      wx.showToast({
        title: '请填写姓名、手机号、身份证号、居住地区等基本信息！',
        icon: 'none'
      })
      return;
    }
    console.log('e', that.data.newOcrData)
    const upload_idcard_number = wx.getStorageSync('upload_idcard_number')
    if (upload_idcard_number && that.data.idnumber && upload_idcard_number != that.data.idnumber) {
      wx.showToast({
        title: '请上传本人身份证！',
        icon: 'none'
      })
      return;
    }
    if (that.data.employer && that.data.index == -1) {
      wx.showToast({
        title: '请选择用人单位！',
        icon: 'none'
      })
      return
    }
    if (that.data.is_protocol_supplement_info == 1 && !(that.data.detail_unit_company && that.data.laborRelationsDate && that.data.detail_leaving_reason && that.data.detail_nocontract_reason)) {
      wx.showToast({
        title: '请填选择或写原单位名称、原单位解除劳动关系时间、离职原因、无法出具原单位解除劳动关系证明原因！',
        icon: 'none'
      })
      return
    }
    if (that.data.is_upload_idcard_info == 1 && !(that.data.uploadFrontImg && that.data.uploadBackImg)) {
      wx.showToast({
        title: '请上传身份证正面、身份证反面等信息！',
        icon: 'none'
      })
      return
    }
    console.log(that.data.bank_images);
    console.log(that.data.health_images);
    if (that.data.is_upload_idcard_info == 1 && !(that.data.bank_images && that.data.health_images)) {
      wx.showToast({
        title: '请上传健康证、银行卡等信息！',
        icon: 'none'
      })
      return
    }
    return true;
  },
  // 格式化图片
  formatImgUrl (url) {
    return url.replace(/https:\/\/work\.doumi\.com\/show\.php\?p=/g, "");
  },
  // 格式化参数
  getOtherInfoParams () {
    const that = this;
    let baseParams = {}, protocolParams = {}, employerParams = {}, uploadCardParams = {},uploadBackWidthHealthCardParams = {}, ocrParams = {}, otherInfoParams = {};
    const { real_name, idnumber, detail_address, mobile, project_id } = that.data;

    baseParams = {
      name: real_name,
      idnumber: idnumber,
      detail_address: detail_address,
      mobile: mobile,
      project_id: project_id
    }

    if (that.data.is_protocol_supplement_info == 1) {
      const { detail_unit_company, laborRelationsDate, detail_leaving_reason, detail_nocontract_reason, protocol_order_id } = that.data;
      protocolParams = {
        original_company: detail_unit_company,
        leave_date: laborRelationsDate,
        leave_reason: detail_leaving_reason,
        no_leave_certify_reason: detail_nocontract_reason,
        protocol_order_id: protocol_order_id,
      }
    }

    if (that.data.employer) {
      const { company, index } = that.data;
      employerParams = {
        employer_id: company[index].id
      }
    }
    if (that.data.is_upload_idcard_info == 1) {
      const { uploadFrontImg, uploadBackImg, bank_images, health_images } = that.data;
      uploadCardParams = {
        card_front: that.formatImgUrl(uploadFrontImg),
        card_back: that.formatImgUrl(uploadBackImg),
      }
      uploadBackWidthHealthCardParams = {
        bank_images: that.formatImgUrl(bank_images),
        health_images: that.formatImgUrl(health_images),
      }
    }
    ocrParams = {
      name: baseParams.name,
      idnumber: baseParams.idnumber,
      ...uploadCardParams
    }
    otherInfoParams = {
      ...baseParams,
      ...protocolParams,
      ...employerParams,
      ...uploadBackWidthHealthCardParams
    }
    return {
      ocrParams,
      otherInfoParams
    }
  },
  loading: function () {
    wx.showLoading({
      title: '',
      mask: true,
    });
  },
  hideLoading: function () {
    wx.hideLoading({
      title: '',
      mask: true,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})