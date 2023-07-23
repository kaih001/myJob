export default {
  data: {
    isShowAd:true,
  },

  computed: {
  },

  methods: {
    adClose(){
      console.log('关闭广告...')
      this.isShowAd=false
    }
  }
}
