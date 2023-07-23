<template>
  <div class="violation_wrap">
    <div class="violation">
      <div class="vio_header">
        <span class="logo"></span>
        <span class="vio-name">
          <span class="vio_tile">信用报告</span>
          <span class="sub_num">报告编号：{{dataMessage.report_number}}</span>
          <span class="sub_time">报告时间：{{dataMessage.report_time}}</span>
        </span>
        <div class="user-wrap">
          <span class="user-mes">用户信息</span>
          <div class="user-mess-box">
            <div class="user_head">
              <img src="../assets/imgs/violation/user@1x.png" alt="">
            </div>
            <div class="user-det">
              <span class="user-name">
                <span class="real_name">{{dataMessage.real_name}}</span> <span>{{dataMessage.age}}</span>
              </span>
              <span class="user-iphone">
                {{dataMessage.mobile}}
                <!-- <el-popover placement="top" title="" width="150" trigger="hover">
                  <span>{{dataMessage.mobile}}</span>
                  <span slot="reference">{{mobile.substr(0,3)+"****"+mobile.substr(7)}}</span>
                </el-popover> -->
              </span>
              <span class="user-idnum">
                {{dataMessage.idnumber}}
                <!-- <el-popover placement="top" title="" width="150" trigger="hover">
                  <span>{{idnum}}</span>
                  <span slot="reference">{{idnum.substr(0,3)+"****"+idnum.substr(14)}}</span>
                </el-popover> -->
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="risk_wrap">
        <h4 class="risk_title">风险提醒</h4>
        <div class="risk_message">
          <div class="risk_num_wrap">本次报告命中·<em class="risk_num_box">{{dataMessage.hit_fx_num}}</em>·条异常规则信息</div>
          <div class="risk_detail">
            <span :class="[item.hit_status == 1?'red_icon':item.hit_status == 2?'green_icon':item.hit_status == 3?'black_icon':'']" v-for="(item,index) in dataMessage.fx_list" :key="index">{{item.title}}{{item.remark}}</span>
            <!-- <span class="red_icon">命中不良信息</span>
            <span class="black_icon">命中限高被执行人</span>
            <span class="green_icon">命中司法涉诉</span>
            <span class="black_icon">命中职业打假人（未开通）</span> -->
          </div>
        </div>
      </div>
      <div class="risk_wrap mt">
        <h4 class="risk_title">风险情况总览</h4>
        <div class="risk_message2" v-if="risk_info.risk_title">
          <div class="bad_messages_title">不良信息</div>
          <div class="rick_type">
            {{risk_info.risk_title}}包括但不限于以下几种：
            <div class="risk_icon" :class="[risk_leval == 1?'highest':risk_leval == 2?'highIcon':risk_leval == 3?'medium':risk_leval == 4?'zd':risk_leval == 5?'low':risk_leval == 6?'free':'']"></div>
          </div>
          <div class="risk_details">
            <span class="bad_det">{{risk_info.remarks}}</span>
          </div>
        </div>
        <div class="bad_messages_wrap" v-if="dataMessage.sfss_list && dataMessage.sfss_list.length>0">
          <div class="bad_messages_title">司法涉诉</div>
          <div class="judicial_box" v-for="(item,index) in dataMessage.sfss_list" :key="index">
            <div class="jud_title">{{item.title}}</div>
            <div class="jud_section">
              <!-- <div v-if="(item.list.length)%2 == 0"> -->
                <div class="section_line" :class="[parseInt(index1/2)%2 != 0 ? 'bgClass':'']" v-if="(item.list.length)%2 == 0" v-for="(item1,index1) in item.list" :key="index1" >
                  <span class="span1">{{item1.title}}</span>
                  <span class="span2">{{item1.num}}</span>
                </div>
                <div class="section_line line_width line_border" v-if="(item.list.length)%2 != 0" v-for="(item1,index1) in item.list" :key="index1">
                  <span class="span1">{{item1.title}}</span>
                  <span class="span2">{{item1.num}}</span>
                </div>
              <!-- </div> -->
              <!-- <div v-else>
                <div class="section_line line_width" v-for="(item1,index1) in item.list" :key="index1">
                  <span class="span1">{{item1.title}}</span>
                  <span class="span2">{{item1.num}}</span>
                </div>
              </div> -->
            </div>
          </div>
        </div>
        <div class="bad_messages_wrap" v-if="dataMessage.other_list && Object.keys(dataMessage.other_list).length>0">
          <div class="bad_messages_title bad_messages_title2">其他案件概览</div>
          <div class="judicial_box">
            <div class="jud_title">{{dataMessage.other_list.title}}</div>
            <div class="jud_section">
              <div class="section_line2" v-for="(ele,ele_index) in dataMessage.other_list.list" :key="ele_index">
                <span class="span1">{{ele.title}}</span>
                <span class="span2">{{ele.num}}</span>
              </div>
              <!-- <div class="section_line2">
                <span class="span1">限制高消费</span>
                <span class="span2">0</span>
              </div>
              <div class="section_line2">
                <span class="span1">职业放贷人</span>
                <span class="span2">0</span>
              </div>
              <div class="section_line2">
                <span class="span1">虚假诉讼</span>
                <span class="span2">0</span>
              </div>
              <div class="section_line2">
                <span class="span1">职业打假人</span>
                <span class="span2">0</span>
              </div>
              <div class="section_line2">
                <span class="span1">商业冲突</span>
                <span class="span2">0</span>
              </div> -->
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        最终解释权归斗米所有
      </div>
    </div>
  </div>
</template>

<script>
import * as util from '@/assets/js/util.js'

export default {
  name: "",
  components: {},
  props: {
    user_id: {
      type: String,
      default: ''
    },
    project_id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // user_id: '',
      // project_id: '',
      risk_num:0,
      riskLeval: 2,
      mobile: '13134567890',
      idnum: '410825199209227571',
      dataMessage: {},
      risk_info: {},
      risk_leval: 0
    }
  },
  computed: {
  },
  watch: {
    '$route'(to, from) {
    },
  },
  mounted() {
    if(this.$route.query && this.$route.query.userId) {
      this.user_id = this.$route.query.userId
      this.project_id = this.$route.query.projectId
      console.log('this.user_id==', this.user_id)
      // console.log('this.project_id==', this.project_id)
      this.getViolationreport()
    } else {
      setTimeout(()=> {
        this.getViolationreport()
      }, 800)
    }
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

<style>
.violation_wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}
.violation {
  width: 100%;
  background: #FFFFFF;
}
.vio_header {
  width: 100%;
  height: 404px;
  background: url('../assets/imgs/violation/bg_header@1x.png') no-repeat left top;
  background-size: 100% 68%;
  overflow: hidden;
}
.logo {
  display: block;
  width: 97px;
  height: 48px;
  background: url('../assets/imgs/violation/logo@1x.png') no-repeat left center;
  margin: 10px 0 0 30px;
}
.vio-name {
  display: block;
  margin-top: 39px;
  margin-left: 36px;
}
.vio_tile {
  display: block;
  font-family: PingFangSC-Medium;
  font-size: 46px;
  color:#FFFFFF;
  letter-spacing: 4px;
  margin-bottom: 12px;
}
.sub_num {
  display: block;
  font-size: 14px;
  color:#FFFFFF;
  margin-bottom: 8px;
  margin-left: 5px;
}
.sub_time {
  display: block;
  font-size: 14px;
  color:#FFFFFF;
  margin-left: 5px;
}
.user-wrap {
  height: 200px;
  background: #FFFFFF;
  border-radius: 3px;
  width: 92%;
  margin: 0 auto;
  margin-top: 31px;
  overflow: hidden;
}
.user-mes {
  display: block;
  font-family: PingFangSC-Medium;
  font-size: 24px;
  color: #565656;
  margin: 18px 0 0 18px;
}
.user-mess-box {
  display: flex;
  margin-top: 15px;
  padding: 10px 0;
  background: url('../assets/imgs/violation/user_bg@1x.png') no-repeat center center;
  background-size: cover;
}
.user_head {
  margin-right: 10px;
}
.user_head img {
  /* margin: 0 0 0 36px; */
  padding: 0;
  font-size: 0;
  width: 96px;
  /* height: 96px; */
  /* border-radius: 48px; */
  /* background: url('../assets/imgs/violation/user@1x.png') no-repeat center center; */
}
.user-name {
  line-height: 20px;
  display: block;
  color: #404040;
  margin-top: 20px;
}
.user-name span {
  font-size: 20px;
}
.real_name {
  margin-right: 30px;
}
.user-iphone,.user-idnum {
  display: block;
  line-height: 25px;
  font-size: 14px;
  color: #404040;
}
.user-iphone {
  background: url('../assets/imgs/violation/icon_phone@1x.png') no-repeat left center;
  padding-left: 19px;
  background-size: 14px;
}
.user-idnum {
  background: url('../assets/imgs/violation/icon_id@1x.png') no-repeat left center;
  padding-left: 19px;
  width: 14px;
  background-size: 14px;
} 
.risk_wrap {
  background: #FFFFFF;
  width: 92%;
  margin: 10px auto;
  
}
.risk_wrap .risk_title {
  font-size: 24px;
  color: #565656;
}
.risk_wrap .risk_message {
  width: 100%;
  padding: 0 5% 5px;
  box-sizing: border-box;
  margin: 20px auto 0;
  /* box-shadow: 0 0 5px #CBE0FF; */
  border: 1px dashed #e2ecfc;
}
.mt {
  margin-top: 40px;
}
.risk_num_wrap {
  width: 90%;
  height: 48px;
  background: linear-gradient(180deg, #2AB7F5 0%, #1791DD 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  border-radius: 6px;
  margin: 0 auto;
  margin-top: 10px;
  position: relative;
  top: -25px;
}
.risk_num_box {
  color: yellow;
  font-size: 24px;
  margin: 0 5px;
}
.risk_detail {
  display: flex;
  flex-flow: wrap;
}
.risk_detail span {
  width: 50%;
  /* margin-left: 5%; */
  display: block;
  box-sizing: border-box;
  line-height: 25px;
  display: flex;
  /* justify-content: center; */
  align-items: center;
}
.risk_detail .red_icon {
  background: url('../assets/imgs/violation/icon_red@1x.png') no-repeat left center;
  padding-left: 19px;
  background-size: 14px;
}
.risk_detail .black_icon {
  background: url('../assets/imgs/violation/icon_black@1x.png') no-repeat left center;
  padding-left: 19px;
  background-size: 14px;
}
.risk_detail .green_icon {
  background: url('../assets/imgs/violation/icon_green@1x.png') no-repeat left center;
  padding-left: 19px;
  background-size: 14px;
}
.risk_message2 {
  margin: 0 auto;
  margin: 20px 0 0 0;
  padding-bottom: 10px;
  text-align: center;
  /* box-shadow: 0 0 5px #CBE0FF; */
  border: 1px dashed #e2ecfc;
}
.rick_type {
  margin: 0 auto;
  font-size: 16px;
  font-weight: bold;
  display: block;
  height: 60px;
  line-height: 60px;
  position: relative;
}
.risk_icon {
  width: 100px;
  height: 100px;
  /* background: url('../assets/imgs/violation/high@1x.png') no-repeat center center; */
  position: absolute;
  right: 40px;
  top: -30px;
}
.risk_icon.free {
  background: url('../assets/imgs/violation/icon_free@1x.png') no-repeat center center;
}
.risk_icon.low {
  background: url('../assets/imgs/violation/icon_low@1x.png') no-repeat center center;
}
.risk_icon.zd {
  background: url('../assets/imgs/violation/icon_zd@1x.png') no-repeat center center;
}
.risk_icon.medium {
  background: url('../assets/imgs/violation/icon_medium@1x.png') no-repeat center center;
}
.risk_icon.highIcon {
  background: url('../assets/imgs/violation/high_icon@1x.png') no-repeat center center;
}
.risk_icon.highest {
  background: url('../assets/imgs/violation/highest@1x.png') no-repeat center center;
}
.risk_details {
  width: 80%;
  margin: 0 auto;
  border-radius: 44px;
  height: 88px;
  background: url('../assets/imgs/violation/bg_red@1x.png') no-repeat left center;
  background-size: cover;
  font-size: 16px;
  color: #5E5E5E;
  display: flex;
  justify-content: center;
  align-items: center;
}
.bad_det {
  margin: 0 10px;
  line-height: 22px;
}
.bad_messages_wrap {
  padding-bottom: 20px;
  /* box-shadow: 0 0 5px #CBE0FF; */
  margin-top: 20px;
  border: 1px dashed #e2ecfc;
}
.bad_messages_title {
  width: 150px;
  height: 40px;
  line-height: 40px;
  font-size: 20px;
  color: #FFFFFF;
  background: url('../assets/imgs/violation/bg_title@1x.png') no-repeat left center;
  background-size: cover;
  /* margin: 20px 0 0 0; */
  text-align: left;
  padding-left: 22px;
  margin-bottom: 20px;
}
.bad_messages_title2 {
  width: 190px;
}
.judicial_box {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 20px;
}
.jud_title {
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 14px;
  color: #FFFFFF;
  background: linear-gradient(270deg, #0C60FF 0%, #76CFF2 100%);
}
.jud_section {
  display: flex;
  flex-wrap: wrap;
}

.section_line {
  width: 50%;
  display: flex;
  min-height: 30px;
  line-height: 30px;
  border-bottom: 1px solid #CBE0FF;
}
.bgClass {
  background: #E7F0FF;
}
.line_width {
  width: 100%;
}
.section_line span {
  flex: 1;
  text-align: center;
  border-right: 1px solid #CBE0FF;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* .section_line span:nth-child(1) {
  flex: 1.5;
} */
.section_line:nth-child(2n-1) span:nth-child(1) {
  border-left: 1px solid #CBE0FF;
}
.line_border:nth-child(2n) span:nth-child(1) {
  border-left: 1px solid #CBE0FF;
}
.line_border:nth-child(even) {
  background: #E7F0FF;
}

.section_line2 {
  width: 100%;
  display: flex;
  min-height: 30px;
  line-height: 30px;
  border-bottom: 1px solid #CBE0FF;
}
.section_line2:nth-child(even) {
  background: #E7F0FF;
}
.section_line2 span {
  flex: 1;
  border-right: 1px solid #CBE0FF;
  text-align: center;
  font-size: 12px;
}
.section_line2 span:nth-child(1) {
  flex: 1;
}
.section_line2 span:nth-child(1) {
  border-left: 1px solid #CBE0FF;
}
.footer {
  text-align: center;
  font-size: 12px;
  color: #404040;
  margin-top: 50px;
  margin-bottom: 35px;
}
</style>
