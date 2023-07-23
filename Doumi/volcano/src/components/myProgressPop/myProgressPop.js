Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    option: '',
    selectItem: [
      {
        id: 27,
        val: '联系不上',
        isActive: false
      },
      {
        id: 28,
        val: '临时有事',
        isActive: false
      },
      {
        id: 29,
        val: '职位不合适',
        isActive: false
      },
      {
        id: 30,
        val: '已找到工作',
        isActive: false
      },
      {
        id: 31,
        val: '不可控因素',
        isActive: false
      },
      {
        id: 100,
        val: '距离远',
        isActive: false
      },
      {
        id: 101,
        val: '薪资待遇低',
        isActive: false
      },
      {
        id: 102,
        val: '工作内容不符合',
        isActive: false
      },
      {
        id: 103,
        val: '工作时间不符合',
        isActive: false
      },
      {
        id: 104,
        val: '无人联系我',
        isActive: false
      }
    ],
    selectedId: [],
    otherReason: '',
    inputValue: '',
    bottom: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 展示弹框
    showPop () {
      this.setData({
        isShow: true
      })
    },
    // 原因选择
    optionItem (e) {
      let id = e.currentTarget.dataset.id
      let selectedId = this.data.selectedId
      for (let items of this.data.selectItem) {
        if (items.id === id) {
          if (items.isActive) {
            items.isActive = !items.isActive
            for (let items of this.data.selectItem) {
              if (items.id === id) {
                let index = selectedId.indexOf(id)
                if (index > -1) {
                  selectedId.splice(index, 1)
                }
              }
            }
          } else {
            if (selectedId.length <= 2) {
              items.isActive = true
              selectedId.push(items.id)
            } else {
              wx.showToast({
                title: '最多可选择三个',
                icon: 'none'
              })
            }
          }
        }
      }

      this.setData({
        selectedId: selectedId,
        selectItem: this.data.selectItem
      })
    },
    // 输入框
    inputedit (e) {
      let value = e.detail.value
      if (value.length > 1) {
        this.setData({
          otherReason: value
        })
      }
    },
    // 输入聚焦
    foucus (e) {
      var that = this
      that.setData({
        bottom: e.detail.height - 75
      })
    },
    // 失去聚焦
    blur (e) {
      var that = this
      that.setData({
        bottom: 0
      })
    },
    hidePop () {
      for (let items of this.data.selectItem) {
        if (items.isActive) {
          items.isActive = !items.isActive
        }
      }
      this.setData({
        selectItem: this.data.selectItem,
        selectedId: [],
        otherReason: '',
        isShow: false,
        inputValue: ''
      })
    },
    // 点击取消
    cancelBtn (e) {
      this.hidePop()
      this.triggerEvent('cancel', e.detail)
    },
    // 点击确定
    sureBtn () {
      // 调取接口
      let { otherReason, selectedId } = this.data
      otherReason = otherReason.trim()
      let reasonlen = otherReason.length
      let selectedIdlen = selectedId.length
      if (selectedIdlen === 0 && reasonlen === 0) {
        wx.showToast({ title: '请选择取消原因', icon: 'none' })
      } else if (reasonlen > 0 && (reasonlen < 3 || reasonlen > 30)) {
        wx.showToast({ title: '请输入3-30个字', icon: 'none' })
      } else {
        this.triggerEvent('confirm', { selectedId, otherReason })
      }
    }
  }
})
