<template>
  <div class="invest_wrap">
    <div class="in_header">斗米满意度调研问卷</div>
    <div class="in_body">
      <p class="in_body_p1">使用<span>微信</span>扫码填写问卷</p>
      <p class="in_body_p2">才能领到<span>微信红包</span></p>
      <p class="img_p3">
        <img src="../assets/imgs/invest/qrcode.png" alt="" width="60%">
      </p>
    </div>
    <div class="in_step">
      <p class="in_step_p1">
        建议步骤：
      </p>
      <p class="in_step_p2">
        第一步：保存二维码图片到手机相册
      </p>
      <p class="in_step_p2">
        第二步：微信—扫一扫—-选择相册中的二维码图片
      </p>
      <p class="in_step_p2">
        第三步：填写问卷，提交后即可领取微信红包
      </p>
    </div>
  </div>
</template>

<script>
import * as util from '@/assets/js/util.js'

export default {
  name: "",
  components: {},
  props: {
  },
  data() {
    return {
    
    }
  },
  computed: {
  },
  watch: {
    '$route'(to, from) {
    },
  },
  mounted() {
   
  },
  methods: {
    getViolationreport () {
      let data = {
        user_id: this.user_id,
        project_id: this.project_id,
      };
      // console.log('data===', data)
      util.ajax({
        url: '/project/violation_report/get',
        type: 'GET',
        data: data,
        timeout: 1000 * 10 * 60,
        success: (obj) => {
          if (obj.errno == 0) {
            const {data} = obj;
            this.dataMessage = data;
            this.risk_info = data.risk_info;
            this.risk_leval = this.risk_info['risk_level'];
            console.log('this.risk_leval===', this.risk_info, this.risk_leval)
          } else {
            this.$message({
              message: `${obj.errmsg}`,
              type: 'info'
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
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
    }
  },
}
</script>

<style scoped>
.invest_wrap {
  width: 100%;
  height: 100vh;
  background: #FFFFFF;
  box-sizing: border-box;
  overflow: hidden;
}
.in_header {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin: 30px 0 60px;
}
.in_body {
  text-align: center;
}
.in_body_p1 {
  font-size: 18px;
  margin-bottom: 20px;
}
.in_body_p1 span {
  font-size: 20px;
  color: rgb(255, 160, 0);
  font-weight: bold;
}
.in_body_p2 {
  font-size: 18px;
}
.in_body_p2 span {
  font-size: 20px;
  color: rgb(255, 160, 0);
  font-weight: bold;
}
.img_p3 {
  margin: 30px 0;
}
.in_step {
  width: 80%;
  margin: 0 auto;
}
.in_step_p1 {
  font-size: 12px;
  font-weight: bold;
}
.in_step_p2 {
  line-height: 25px;
  font-size: 12px;
}
</style>
