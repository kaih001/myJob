
import * as util from '@/assets/js/util.js'
export default (config) => {
  const { list_type } = config
  return {
    methods: {
      // 获取当前页面搜索条件
      getCurrentSearchFun() {
        this.searchData = {}
        util.ajax({
          url: '/fulltimess/ssfundoptget',
          type: 'GET',
          data: {
            list_type: list_type
          },
          timeout: 10000,
          success: (res) => {
            if (res && res.errno == 0) {
              this.searchData = res.data
              // console.log('this.searchData==', this.searchData)
            } else {
              this.$message({
                message: res.errmsg,
                type: 'warning'
              });
            }
          },
          error: (xhr, status) => {
            this.$message({
              message: '请求失败',
              type: 'warning'
            });
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              message: '请求超时',
              type: 'warning'
            });
          }
        })
      },
      // 获取所有市
      getAllCityFun() {
        this.insured_place_list = []
        util.ajax({
          url:'/common/city/all',
          type:'GET',
          data:{},
          timeout:10000,
          success:(res) => {
            if(res.errno == '0'){
              this.insured_place_list = res.data
            } else {
              this.$message({
                showClose: true,
                message: res.errmsg,
                type: 'warning'
              });
            }
          },
          error: (xhr, status) => {
              // console.log(xhr)
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
          }
        })
      },
    },
    watch: {
      '$route'(to, from) {
        // console.log('111')
      }
    },
    created: function () {
      this.getCurrentSearchFun()
      this.getAllCityFun()
    }
  }
}