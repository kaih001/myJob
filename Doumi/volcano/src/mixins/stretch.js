// `展开/收起` 功能

export default {
  data: {
    _triggerHeight: 0,
    expend: {
      isShow: null, // 是否显示的 `展开/收起` 按钮
      isExpend: null // `展开/收起` 按钮的切换状态
    }
  },

  computed: {
    // 限制的高度
    triggerHeight () {
      return `${this._triggerHeight}px`
    }
  },

  methods: {
    /**
     * 展开／收起
     * @param {object} e.currentTarget.dataset
     * └─ @property {string} index - 索引
     */
    bindToggle () {
      this.expend.isExpend = !this.expend.isExpend
    },

    /**
     * 初始化 `展开/收起` 功能
     * @param {object} opts 配置的参数
     * ├──@prop {string} selector - css选择器, 要进行附加该功能的容器
     * ├──@prop {boolean?} rowCount - 行数
     * ├──@prop {boolean?} lineHeight - 行高
     */
    initStretch ({ selector, rowCount = 5, lineHeight = 22 }) {
      // 职位详情内容的  初始化
      this.createSelectorQuery()
        .select(selector)
        .fields(
          { size: true },
          res => {
            if (!res) return

            this._triggerHeight = lineHeight * rowCount // 限制的高度, 超过此高度显示 `展开/收起` 按钮
            console.log('nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn', this._triggerHeight);
            console.log('fffffffffffffffffffffffffffffffff', res.height);
            console.log('mmmmmmmmmmmmmmmmmmmm', res);
            if (res.height > this._triggerHeight) {
              this.expend.isShow = true
              this.expend.isExpend = false // 默认收起来的状态
            }
          }
        )
        .exec()
    }
  }
}
