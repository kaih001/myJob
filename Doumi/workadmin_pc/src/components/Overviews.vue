<template>
  <div class="overviews" v-loading="!load_end">
    <template v-if="overCard">
      <div class="header-title">
        <h2>项目概览 </h2>
        <!-- <div class="check-detail"  @click="checkDetail()">查看详情</div> -->
        <router-link to="projectdetail"  style="color:#6699ee;font-weight:normal;font-size:13px;line-height: 1;" class="kaaddminset">查看详情<i class="setico_svg"></i></router-link>
      </div>
      <div class="statistical">
        <div class="statistical-list" v-if="attend_user_num || attend_user_num == 0">
          <h3>{{attend_user_num}}</h3>
          <p>今日出勤人数</p>
        </div>
        <div class="statistical-list" v-if="insure_user_num || insure_user_num == 0">
          <h3>{{insure_user_num}}</h3>
          <p>今日投保人数</p>
        </div> 
        <div class="statistical-list" v-if="valid_user_num || valid_user_num == 0">
          <h3>{{valid_user_num}}</h3>
          <p>项目成员</p>
        </div>
        <div class="statistical-list " v-if="sum_wage_num ||  sum_wage_num == 0">
          <h3>{{sum_wage_num}}</h3>
          <p>结算工资总额</p>
        </div>
      </div>
      <div class="statistical-list statistical-listLast" v-if="chargerefund && (wallet_amount ||  wallet_amount == 0)">
        <div class="statistical-operation">
          <h3 class="statistical-total">¥{{wallet_amount}}</h3>
          <p class="stat-opre">项目资金余额</p>
        </div>
        <div class="statistical-operation detained-amount" style="margin-left: 20px;">
          <h3 class="statistical-total">¥{{frozen_wallet_amount}}</h3>
            <el-popover
              ref="popover"
              placement="top-start"
              title="提示"
              width="200"
              trigger="hover"
              content="在支付工资单时，给C端员工调整未发的工资部分会进入暂扣金额，此金额只可以用于支付状态为‘部分发放’工资单中调整未发的工资；项目资金余额不含暂扣金额 ">
          </el-popover>
          <p class="stat-opre stat-opre2" v-popover:popover>暂扣金额<i class="dm-icon-question"></i></p>
        </div>
        <div class="overviews-operation" v-if="!is_premium_user">
          <i  class="stat-opre top-up" @click="topUp">充值</i>
          <i  class="stat-opre a-refund" @click="aRefund" :class="{disablebtndel:wallet_amount == 0}" v-if="refund == true">退款</i>
        </div>
        <div style="display:flex;" v-if="current_user_role_id == 1 || current_user_role_id == 3">
          <div class="statistical-operation" style="margin: 0 20px" v-for="(item,idx) in payment_amount" :key="idx">
            <h3 class="statistical-total">¥{{item.amount}}</h3>
            <p class="stat-opre">{{item.payment_method}}</p>
          </div>
        </div>
      </div>
    </template>
    <!-- 充值 -->
    <div class="export-dialog topup">
        <el-dialog 
          title="请填写充值信息" 
          top="35%"
          :visible.sync="showtopup"
          @close="resetForm('topup')"
          size="tiny">  
          <el-form  label-width="70px" :model="topup" :rules="rules"  ref="topup">
            <el-form-item label="充值金额" prop="amount">
              <el-input v-model="topup.amount" min="0" auto-complete="off" style="width:218px" placeholder="请输入"></el-input>
              <span class="topUp-overviews">元</span>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
              <el-button class="cancel" @click="resetForm('topup')">取 消</el-button>
              <el-button type="primary" class="confirm" @click="confirtopup('topup')">确 定</el-button>
          </div>
        </el-dialog>
    </div>
    <!-- 退款 -->
    <div class="export-dialog showrefund">
      <el-dialog
        title="退款至企业钱包"
        top="35%"
        :visible.sync="showrefund"
        size="tiny">
        <span>确认将剩余{{wallet_amount}}元项目资金退还至企业钱包？</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showrefund = false" class="cancel">取 消</el-button>
          <el-button type="primary" class="confirm" @click="confirmrefund">确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 统计折线图 -->
    <div class="chart" :style="overCard?'':'padding-top:13px;'">
        <div class="table_title">
            <div class="title">30日趋势</div>
        </div>
        <div class="legend_wrap" :style="tabs==='1-1'?'':'margin-bottom:24px;'">
            <a class="more" @click="gotoKq(1)" v-if="tabs==='1-1'&&echarts_data.length">查看更多</a>
            <div class="tabs_wrap">
                <el-tabs v-model="tabs" @tab-click="handleClick">
                    <el-tab-pane label="出勤员工" name="1-1"></el-tab-pane>
                    <template v-if="showOther">
                      <!-- <el-tab-pane label="位置上报人数" name="1-2"></el-tab-pane>
                      <el-tab-pane label="新增员工" name="1-3"></el-tab-pane>
                      <el-tab-pane label="投保人数" name="1-4"></el-tab-pane>
                      <el-tab-pane label="支付工资" name="1-5"></el-tab-pane> -->
                      <template v-for="item in statistics">
                        <el-tab-pane :label="item.tab_name" :name="item.tab_name"></el-tab-pane>
                      </template>
                    </template>
                </el-tabs>
            </div>
        </div>
        <chart-line
            v-if="tabs!=='1-1'"
            id="chart_line_1"
            :xData="xData1"
            :yData="yData1"
        ></chart-line>
    </div>

    <div class="linear_cont" v-show="tabs==='1-1'">
      <!-- <router-link to="kqaddmin" class="more" replace>查看更多</router-link> -->
      <!-- <a class="more" @click="gotoKq(1)" v-if="echarts_data.length">查看更多</a> -->
      <!-- <span class="line" v-if="echarts_data.length"></span> -->
      <div id="echarts_main" @click="gotoKq(0, $event)"></div>
    </div>

    <!-- 饼图 -->
    <div class="chart" style="margin-bottom:107px;min-width:784px;" v-if="showPie">
        <div class="table_title">
            <div class="title">项目成员画像</div>
        </div>
        <div class="chartpie_wrap pie2">
          <div class="chartpie_top">
            <p class="title">年龄比例：（岁）</p>
            <div class="leg"><span>17以下</span><span>18-24</span><span>25-29</span><span>30-39</span><span>40-49</span><span>50以上</span><span>未填写</span></div>
          </div>
          <chart-pie
            id="chart_pie_2"
            name="年龄比例"
            :data="member_portrait.age_radio"
            :color="['#86E2F3', '#76C7F6', '#6699EE', '#51C99B', '#FEA922', '#F6D14F', '#D0D3DD', '#D0D3DD']"
          ></chart-pie>
        </div>
        <div class="chartpie_wrap pie1">
          <div class="chartpie_top">
            <p class="title">性别比例：</p>
            <div class="leg"><span>男</span><span>女</span><span>未填写</span></div>
          </div>
          <chart-pie
            id="chart_pie_1"
            name="性别比例"
            :data="member_portrait.gender_radio"
            :color="['#6699EE', '#FEA922', '#D0D3DD']"
          ></chart-pie>
        </div>
        <div class="chartpie_wrap pie3">
          <div class="chartpie_top">
            <p class="title">学历比例：</p>
            <div class="leg"><span>初中以下</span><span>高中</span><span>大专</span><span>本科</span><span>硕士</span><span>博士</span><span>未填写</span></div>
          </div>
          <chart-pie
            id="chart_pie_3"
            name="学历比例"
            :data="member_portrait.degree_radio"
            :color="['#86E2F3', '#76C7F6', '#51C99B', '#6699EE', '#FEA922', '#F6D14F', '#D0D3DD', '#D0D3DD']"
          ></chart-pie>
        </div>
        <div style="clear:both;"></div>
    </div>


  </div>
</template>

<script>
import $ from 'jquery'
import echarts from 'echarts'
import * as util from '../assets/js/util.js'

import ChartLine from '@/components/common/ChartLine'
import ChartPie from '@/components/common/ChartPie'

// 基于准备好的dom，初始化echarts实例
let myChart = null

export default {
  name: 'overviews',
  components: {
    ChartLine,
    ChartPie,
  },
  data () {
    var checkPrice = (rule, value, callback) => {
        //console.log(!Number.isInteger(value))
        if(isNaN(value) || !value){
          if(!value){
              return callback(new Error('金额不能为空'));
            }else{
              return callback(new Error('请输入正确的金额'));
            }
        }else if(value < 0 || value > 10000000){
            callback(new Error('基本金额应在0到10000000'));
        }else if(value.toString().indexOf('.') != -1 && value.toString().split(".")[1].length > 2){
            callback(new Error('请保留两位小数'));
        }else{
            callback();
        }
    };
    return {
      refund:false,
      overCard:false,
      chargerefund:false,
      showrefund:false,
      showtopup:false,
      attend_user_num:'',
      insure_user_num:'',
      valid_user_num:'',
      sum_wage_num:'',
      wallet_amount:'',
      topup:{
        amount:''
      },
      rules:{
        amount:[
          { validator: checkPrice, trigger: 'blur' }
        ]
      },
      team_id: 0,
      project_id: 0,
      echarts_data:  [
       
      ],
      load_end: false,
      tabs: '1-1',
      statistics: [],//30日项目趋势 后4项数据
      xData1: [],
      yData1: [],
      is_premium_user:false,
      member_portrait: {
        age_radio: [],
        degree_radio: [],
        gender_radio: [],
      },
      showOther: false,//是否有权限查看 其他 tab
      showPie: false,//是否有权限查看 其他 tab
      groupFlag: false,
      current_user_role_id: 0,  // 1为超级管理员  3项目超级管理员
      payment_amount: []
    }
  },
  methods: {
    init() {
      this.load_end = false

      this.overCard= false;
      this.chargerefund = false;
      //滚动条至顶部
      // $(window).scrollTop(0)
      // $('.linear_cont').width(util.getLocalStorage('applications_width')-200)
      if($(window).width()>1000){
        $('.linear_cont').width($(window).width()-200)
      }else{
        $('.linear_cont').width(800)
      }
      
      this.is_premium_user = util.getLocalStorage('is_premium_user') == 1 ? true : false;
      //基于准备好的dom，初始化echarts实例
      myChart = echarts.init(document.getElementById('echarts_main'));

      //获取个人信息
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      //获取图表数据
      this.getData()
      // this.initEcharts()
      
      // setTimeout(() => {
      //   window.onresize = () =>{
      //     // $('.overviews').width($(window).width()-200)
      //     // $('.overviews').height($(window).height()-60)
      //     console.log($('.overviews').height())
      //     myChart.resize({
      //       width:'auto'
      //     })
      //   }
      // },100)
      this.getStatistics()//折线图其他数据
      this.getMember_portrait()//人员比例饼图
    },
    getStatistics(){
      this.showOther = false
      util.ajax({
        url: '/project/statistics/get',
        type:'GET',
        data: {
            team_id: this.team_id,
            project_id: this.project_id,
        },
        success: (res) => {
            console.log('折线图其他数据')
            console.log(res)
            if(res.errno == 0){
              this.showOther = true//有权限
              //30日趋势
              res.data.forEach((obj) => {
                if(obj.name === '新增员工分析'){
                  obj.tab_name = '新增员工'
                }else if(obj.name === '位置上报分析'){
                  obj.tab_name = '位置上报人数'
                }else if(obj.name === '投保情况分析'){
                  obj.tab_name = '投保人数'
                }else if(obj.name === '支付工资分析'){
                  obj.tab_name = '支付工资'
                }
              })

              this.statistics = res.data
              let tempX1 = []
              let tempY1 = [{
                  name: '位置上报人数',
                  data: [],
                  color: '#79a8f6'
              }]
              this.statistics[1].detail.forEach((obj) => {
                  tempX1.push(util.getLocalTime(obj.x*1000, 'yyyy-MM-dd'))
                  tempY1[0].data.push(Number(obj.y))
              })
              // console.log(tempX1)
              // console.log(tempY1)
              this.xData1 = tempX1
              this.yData1 = tempY1

              // console.log(this.statistics)
              // this.getStatistics_end = true
            }else if(res.errno == 4){
              // 无权限
              this.showOther = false
            }
        },
        error: (xhr, status) => {
            // this.getStatistics_end = true
            console.log(xhr)
        },
        noNetwork: () => {
            // this.getStatistics_end = true
            //网络超时
            this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
            });
        }
      })
    },
    getMember_portrait(){
      this.showPie = false
      util.ajax({
        url: '/project/member_portrait/get',
        type:'GET',
        data: {
            team_id: this.team_id,
            project_id: this.project_id,
        },
        success: (res) => {
            console.log('人员比例饼图')
            console.log(res)
            if(res.errno == 0){
              this.showPie = true//有权限
              this.member_portrait = res.data
            }else if(res.errno == 4){
              this.showPie = false
            }
        },
        error: (xhr, status) => {
            // this.getStatistics_end = true
            console.log(xhr)
        },
        noNetwork: () => {
            // this.getStatistics_end = true
            //网络超时
            this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
            });
        }
      })
    },
    getData(){
      //获取当前查看的项目id
      this.project_id = this.$route.params.projectId
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id;
      util.ajax({
          url:'/permission/application',
          type:'GET',
          data:{
            team_id: this.team_id,
            project_id: this.project_id,
          },
          timeout:10000,
          success:(obj) => {
              if(obj && obj.errno == 0){
                let chargerefund = false;
                if(obj.data != undefined){
                  obj.data.forEach( (o) => {
                      if(o.id_name == 'project_wallet_refund'){
                        this.refund = true
                      }
                      if(o.id_name == 'pc_charge_refund'){
                        chargerefund = true
                      }
                      if(o.id_name == 'naixue_saas_project_ids_group'){
                        // console.log('----111', this.groupFlag)
                        this.groupFlag = true;
                        // console.log('----222', this.groupFlag)
                        this.$router.push('memberadmin')
                      }
                  });
                }
                this.chargerefund = chargerefund
              }
          },
          error: (xhr, status) => {
            this.chargerefund = false;
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
            this.chargerefund = false;
          }
      })
      util.ajax({
        url: '/project/overview',
        type:'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        success: (res) => {
            //console.log(res)
            if(res&&res.errno==0){
              let data = res.data.list;
              this.attend_user_num = data.attend_user_num;
              this.insure_user_num = data.insure_user_num;
              this.valid_user_num = data.valid_user_num;
              this.sum_wage_num = data.sum_wage_num/100;
              this.wallet_amount = data.wallet_amount/100;
              this.frozen_wallet_amount = data.frozen_wallet_amount/100;
              this.overCard = true;
              this.current_user_role_id = data.current_user_role_id;
              this.payment_amount = data.payment_amount;
            }else if(res.errno == 4){
              this.overCard = false;
            }
        },
        error: (xhr, status) => {
          this.overCard = false;
          
        },
        noNetwork: () => {
            // 网络超时
          this.overCard = false;
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
        }
      });
      util.ajax({
        url: '/attendance/preview',
        type:'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          application_id:0
        },
        success: (res) => {
            //console.log(JSON.stringify(res))
            if(res&&res.errno==0){
              this.echarts_data = res.data
              //绘制图表
              this.initEcharts()
            }else{
              this.load_end = true
            }
        },
        error: (xhr, status) => {
          
        },
        noNetwork: () => {
            // 网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
        }
      })
      
    },
    // 绘制图表
    initEcharts() {
      let data1 = []
      let data2 = []
      this.echarts_data.forEach((obj, index) => {
        data1.push(util.getLocalTime(obj.date*1000, 'yyyy-MM-dd'))
        let tempArr = []
        tempArr.push(index, obj.attend_amount, obj.stats[0].amount, obj.stats[1].amount, obj.stats[2].amount, obj.stats[3].amount, obj.stats[4].amount, obj.stats[5].amount)
        data2.push(tempArr)
      })
      myChart.setOption({
          // title: { 
          //   text: '出勤情况',
          //   textStyle: {
          //     color: '#475568',
          //     fontWeight: 700,
          //     fontSize: 16,
          //   },
          //   padding: [19, 20]
          // },
          grid: {
            containLabel: true,
            left: 20,
            height:300,
            right:20,
            top: 34
          },
          axisPointer: {
            lineStyle: {
              color: '#c0ccda'
            }
          },
          tooltip: {
            trigger: 'axis',
            enterable: true,
            confine: true,
            position: function (point, params, dom, rect, size) {
              return [point[0]+10, point[1]+10];
            },
            padding: [7, 12],
            backgroundColor: '#fff',
            borderColor: '#e0e6ed',
            borderWidth: 1,
            extraCssText: 'box-shadow: 0 2px 38px 0 rgba(0, 0, 0, 0.07);line-height:25px;color: #475568;font-size: 12px;font-weight: normal;font-style: normal;font-stretch: normal;',
            textStyle: {
              color: '#475568'
            },
            transitionDuration: .5,
            // formatter:  '{b0}<br/>{a0}: <a href="http://www.baidu.com">{c0}</a><br/>' + '缺勤：' + 10,
            formatter: function (params, ticket, callback) {
              // console.log(params)
              let str = ''
              let total = ''
              params[0].data.forEach((obj,index) => {
                switch(index){
                  case 0:
                    str += '<div style="font-weight:bold;color:#475568;padding-bottom:3px;">' + params[0].name + '</div>'
                  break
                  case 2:
                    if(obj != 0){
                      str += '<p style="width:92px;position:relative;">正常<a style="font-size:14px;position:absolute;right:0;color:#6699ee;font-weight:bold;text-decoration:underline;" href="javascript:;" tip-data='+params[0].name+',1>' + obj + '</a><p/>'
                    }
                  break
                  case 3:
                    if(obj != 0){
                      str += '<p style="width:92px;position:relative;">迟到<a style="font-size:14px;position:absolute;right:0;color:#6699ee;font-weight:bold;text-decoration:underline;" href="javascript:;" tip-data='+params[0].name+',2>' + obj + '</a></p>'
                    }
                  break
                  case 4:
                    if(obj != 0){
                      str += '<p style="width:92px;position:relative;">早退<a style="font-size:14px;position:absolute;right:0;color:#6699ee;font-weight:bold;text-decoration:underline;"  href="javascript:;" tip-data='+params[0].name+',3>' + obj + '</a></p>'
                    }
                  break
                  case 5:
                    if(obj != 0){
                      str += '<p style="width:92px;position:relative;">工时短缺<a style="font-size:14px;position:absolute;right:0;color:#6699ee;font-weight:bold;text-decoration:underline;"  href="javascript:;" tip-data='+params[0].name+',4>' + obj + '</a></p>'
                    }
                  break
                  case 6:
                    if(obj != 0){
                      str += '<p style="width:92px;position:relative;">地点异常<a style="font-size:14px;position:absolute;right:0;color:#6699ee;font-weight:bold;text-decoration:underline;"  href="javascript:;" tip-data='+params[0].name+',5>' + obj + '</a></p>'
                    }
                  break
                  case 7:
                    if(obj != 0){
                      str += '<p style="width:92px;position:relative;">缺卡<a style="font-size:14px;position:absolute;right:0;color:#6699ee;font-weight:bold;text-decoration:underline;"  href="javascript:;" tip-data='+params[0].name+',6>' + obj + '</a></p>'
                    }
                  break
                  case 1:
                    // if(obj != 0){
                      total += '<p style="width:92px;position:relative;">出勤总数<a style="font-size:14px;position:absolute;right:0;color:#6699ee;font-weight:bold;text-decoration:underline;"  href="javascript:;" tip-data='+params[0].name+',0>' + obj + '</a></p>'
                    // }
                  break
                }
                
              })
              return str + total
            }
          },
          xAxis: {
            splitLine: {
              show: true,
              lineStyle: {
                    color: '#eceff2'
                }
            },
            axisLine: {
              lineStyle: {
                color: '#e0e6ed',
                width: 2
              }
            },
            type: 'category',
            axisTick: {
              alignWithLabel: true,
              lineStyle: {
                width: 2
              }
            },
            axisLabel: {
              textStyle: {
                color: '#5e6d82',
                fontSize: 13,
              }
            },
            // data: [util.getLocalTime(this.echarts_data[0].date*1000, 'yyyy-MM-dd'),
            //   util.getLocalTime(this.echarts_data[1].date*1000, 'yyyy-MM-dd'),
            //   util.getLocalTime(this.echarts_data[2].date*1000, 'yyyy-MM-dd'),
            //   util.getLocalTime(this.echarts_data[3].date*1000, 'yyyy-MM-dd'),
            //   util.getLocalTime(this.echarts_data[4].date*1000, 'yyyy-MM-dd'),
            //   util.getLocalTime(this.echarts_data[5].date*1000, 'yyyy-MM-dd'),
            //   util.getLocalTime(this.echarts_data[6].date*1000, 'yyyy-MM-dd')]
            data: data1
          },
          yAxis: {
            // min: 1,
            minInterval: 1,
            axisLine: {
              lineStyle: {
                color: '#eceff2',
                width: 1
              }
            },
            axisTick: {
              show: false,
              alignWithLabel: true,
              lineStyle: {
                width: 2
              }
            },
            axisLabel: {
              textStyle: {
                color: '#5e6d82',
                fontSize: 13,
              }
            },
            splitLine: {
              lineStyle: {
                    color: '#eceff2'
                }
            }
          },
          series: [
            {
              name: '总人数',
              type: 'line',
              smooth: true,
              // data: [
              //   // 维度X(日期的索引) 维度Y(总人数) 正常 迟到 早退 工时短缺 地点异常 缺卡
              //   [0, this.echarts_data[0].attend_amount, this.echarts_data[0].stats[0].amount, this.echarts_data[0].stats[1].amount, this.echarts_data[0].stats[2].amount, this.echarts_data[0].stats[3].amount, this.echarts_data[0].stats[4].amount, this.echarts_data[0].stats[5].amount],
              //   [  1, this.echarts_data[1].attend_amount, this.echarts_data[1].stats[0].amount, this.echarts_data[1].stats[1].amount, this.echarts_data[1].stats[2].amount, this.echarts_data[1].stats[3].amount, this.echarts_data[1].stats[4].amount, this.echarts_data[1].stats[5].amount],
              //   [  2, this.echarts_data[2].attend_amount, this.echarts_data[2].stats[0].amount, this.echarts_data[2].stats[1].amount, this.echarts_data[2].stats[2].amount, this.echarts_data[2].stats[3].amount, this.echarts_data[2].stats[4].amount, this.echarts_data[2].stats[5].amount],
              //   [  3, this.echarts_data[3].attend_amount, this.echarts_data[3].stats[0].amount, this.echarts_data[3].stats[1].amount, this.echarts_data[3].stats[2].amount, this.echarts_data[3].stats[3].amount, this.echarts_data[3].stats[4].amount, this.echarts_data[3].stats[5].amount],
              //   [  4, this.echarts_data[4].attend_amount, this.echarts_data[4].stats[0].amount, this.echarts_data[4].stats[1].amount, this.echarts_data[4].stats[2].amount, this.echarts_data[4].stats[3].amount, this.echarts_data[4].stats[4].amount, this.echarts_data[4].stats[5].amount],
              //   [  5, this.echarts_data[5].attend_amount, this.echarts_data[5].stats[0].amount, this.echarts_data[5].stats[1].amount, this.echarts_data[5].stats[2].amount, this.echarts_data[5].stats[3].amount, this.echarts_data[5].stats[4].amount, this.echarts_data[5].stats[5].amount],
              //   [  6, this.echarts_data[6].attend_amount, this.echarts_data[6].stats[0].amount, this.echarts_data[6].stats[1].amount, this.echarts_data[6].stats[2].amount, this.echarts_data[6].stats[3].amount, this.echarts_data[6].stats[4].amount, this.echarts_data[6].stats[5].amount]
              // ],
              data: data2,
              lineStyle: {
                normal: {
                  color: '#6699ee'
                }
              },
              itemStyle: {
                normal: {
                  color: '#6699ee'
                }
              },
              areaStyle: {
                      normal: {
                          // color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                          //     offset: 0,
                          //     color: 'rgb(220, 233, 251)'
                          // }, {
                          //     offset: 1,
                          //     color: 'rgb(252, 253, 255)'
                          // }])
                          color: '#F2F7FF'
                      }
                  },
            }
          ]
      })
      this.load_end = true
    },
    gotoKq(tab,evt){
      if(tab == 1){
        //跳至按月统计tab
        util.setLocalStorage('kqProp',{origin: 'Overviews', props:{tab: 1}})
        this.$router.replace('kqaddmin')
      }else if(tab == 0){
        //跳至按日统计tab
        // console.log(evt.target.tagName)
        if(evt.target.tagName === 'A'){
          // alert(evt.target.attributes['tip-data'].value)
          let tempArr = evt.target.attributes['tip-data'].value.split(',')
          util.setLocalStorage('kqProp',{origin: 'Overviews', props:{tab: 0,date: tempArr[0], status: tempArr[1]}})
          // this.$router.replace({path: 'kqaddmin', query: {date: tempArr[0], status: tempArr[1]}})
          this.$router.replace('kqaddmin')
        }
      }
    },
    //充值
    topUp(){
      this.showtopup = true;
    },
    confirtopup(formName){
        this.$refs[formName].validate((valid) => {

          if(valid){
            if(this.topup.amount == 0){
              this.$message({
                showClose: true,
                message: '充值金额不能为0',
                type: 'warning'
              });
              return;
            }
            this.showtopup = false;
            let amount = (this.topup.amount*100).toFixed(2);
            //console.log(amount)
            let url  = '/sea/api/1.0/client/v1/wallet/charge_frist?team_id='+this.team_id+'&project_id='+this.project_id+'&amount='+amount+'&client_type=2&client_type=1&dmclient=pcweb&X-Doumi-Agent=weixinqy';
            //console.log(url)
            util.windowOpen(url)
            return;
          }
        })
    },
    resetForm(formName){
      this.$refs[formName].resetFields();
      this.showtopup = false
    },
    //退款
    aRefund(){
      if(this.wallet_amount == 0){
        return;
      }
      this.showrefund = true;
    },
    confirmrefund(){
      util.ajax2({
        url: '/wallet/to_team',
        type:'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          client_type:1,
          amount:this.wallet_amount*100
        },
        success: (res) => {
            console.log(JSON.stringify(res))
            if(res&&res.errno==0){
              this.showrefund = false;
              this.$message({
                showClose: true,
                message: '操作成功',
                type: 'success'
              });
              setTimeout(function(){
                location.reload();
              },500)
            }else{
              this.showrefund = false;
              this.$message({
                showClose: true,
                message: res.errmsg,
                type: 'warning'
              });
            }
        },
        error: (xhr, status) => {
          
        },
        noNetwork: () => {
            // 网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
        }
      })
    },
    handleClick(tab, event){
      // console.log(tab, event)
      // console.log(tab.name)
      // this.tabs1 = tab.name
      if(tab.name === '1-1') return

      let tempX = []
      let tempY = [{
          name: '',
          data: [],
          color: '#79a8f6'
      }]

      this.statistics.forEach((obj1) => {
        if(obj1.tab_name === tab.name){
          obj1.detail.forEach((obj2) => {

              tempX.push(util.getLocalTime(obj2.x*1000, 'yyyy-MM-dd'))
              tempY[0].data.push(Number(obj2.y))
              tempY[0].name = tab.name

              this.xData1 = tempX
              this.yData1 = tempY

              // console.log(tempX)
              // console.log(tempY)
          })
        }
      })
    }
  },
  created() {
    this.getData()
  },
  mounted() {
    this.init()
  },
  watch: {
      '$route' (to, from) {
        // 对路由变化作出响应...
        // console.log(to.params.projectId)
        this.tabs = '1-1'
        this.getData()
        this.getStatistics()//折线图其他数据
        this.getMember_portrait()//人员比例饼图
      }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style  src='../assets/css/base.css'></style>
<style>
.overviews .chart .tabs_wrap .el-tabs__header{
    margin: 12px 0 0;
    border-bottom: none;
}
.overviews .chart .tabs_wrap .el-tabs__header .el-tabs__active-bar{
    background-color: #6699ee;
}
.overviews .chart .tabs_wrap .el-tabs__header .el-tabs__item{
    color: #5e6d82;
    padding: 0 8px;
}
.overviews .chart .tabs_wrap .el-tabs__header .el-tabs__item.is-active{
    color: #6699ee;
    font-weight: bold;
}
</style>
<style scoped>
.overviews .linear_cont{
  width:100%;
  height:384px;
  position: relative;
  overflow: hidden;
}
.overviews .legend_wrap{
  position: relative;
}
.overviews .legend_wrap .more{
  position: absolute;
  top:14px;
  right:20px;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  color: #6699EE;
  text-decoration: none;
  z-index: 99;
  cursor: pointer;
}
.overviews .legend_wrap .more:active{
  color: #517ed6;
}
/*.overviews .linear_cont .line{
  position: absolute;
  top:54px;
  left: 20px;
  width: calc(100% - 40px);
  height: 1px;
  background-color: #e0e6ed;
}*/
#echarts_main{
  width:100%;
  height:384px;
  overflow: hidden;
}
.header-title{
    margin: 0 20px;
    padding:16px 0;
    overflow: hidden;
    border-bottom: 1px solid #e0e6ed;
    display:flex;
    align-items: center;
    justify-content: space-between;
}
.header-title h2{
    font-size: 16px;
    font-weight: 700;
    text-align: left;
    color: #475568;
    line-height: 1.4;
}
.header-title div.check-detail{
  color:#69e;
  cursor: pointer;
}
.statistical {
    display: flex;
    margin: 40px 0 40px 20px
}
.statistical-list {
    margin-right: 50px;
}
 .statistical-list h3 {
    font-size: 32px;
    font-weight: 600;
    color: #475568;
    text-align: center;
}

.statistical-list p {
    font-size: 12px;
    text-align: center;
    color: #5e6d82;
    margin-top: 10px;
}
.statistical-list p.stat-opre2{
  margin-top: 4px;
}
 .statistical-list .statistical-total{
  font-size: 32px;
  font-weight: 600;
  color: #f5974e;
}
 .statistical-list .statistical-operation i{
  display:block;
  width: 44px;
  height: 26px;
  border-radius: 2px;
  text-align: center;
  line-height: 26px;
  cursor: pointer;
}
.statistical-list .statistical-operation i:hover{
  opacity: .6;
}

.statistical-listLast{
  padding-left: 20px;
  margin-bottom: 25px;
  border-left: 1px solid #e0e6ed;
  height: 50px;
  display: flex;
}
.overviews-operation i{
  display: inline-block;
  width: 44px;
  height: 26px;
  border-radius: 2px;
  text-align: center;
  font-size: 12px;
  line-height: 26px;
  margin-top: 20px;
  cursor: pointer;
}
.overviews-operation .top-up:hover{
  opacity: 0.6;
}
.overviews-operation .top-up{
  background-color: #6699ee;
  color: #fff;
  margin-left:30px;
}
.overviews-operation .a-refund{
  color: #475568;
  border:solid 1px #e0e6ed;
  background-color:#fff;
  margin-left:10px;
}
.overviews-operation .a-refund:hover{
  color:#6699ee;
  border-color: #6699ee;
}
.topUp-overviews{
  color: #99a9bf;
  font-size: 14px;
  margin-left: 10px;
}

.overviews .el-dialog__headerbtn .el-dialog__close{
  font-size: 15px;
}
.overviews-operation .top-up:active{
  background-color: #517ed6;
  opacity: 1;
}
.overviews-operation .a-refund:active{
    color: #517ed6;
    border: 1px solid #517ed6;
}
.topup .cancel.el-button{
  border-color: #e0e6ed;
}
.overviews-operation .disablebtndel{
  border-color: #e0e6ed;
  color: #c0ccda;
}
.overviews-operation .disablebtndel:hover{
  cursor:default;
  border-color: #e0e6ed;
  color: #c0ccda;
}
.overviews-operation .disablebtndel:active{
  cursor:default;
  border-color: #e0e6ed ;
  color: #c0ccda;
}

.overviews .chart{
  padding: 0 20px;
}
.overviews .chart .table_title{
    border-bottom: 1px solid #e0e6ed;
}
.overviews .chart .table_title:after{
    content: '';
    display: block;
    clear:both;
}
.overviews .chart .table_title .title{
    float: left;
    /*line-height: 27px;*/
    height: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #475669; 
    margin-bottom: 14px;
}

/*扇形图*/
.overviews .chart{
  min-width: 804px;
}
.overviews .chart .chartpie_wrap{
  float:left;
  width: 33.33%;
}
.overviews .chart .chartpie_wrap .chartpie_top{
  padding-top: 30px;
}
.overviews .chart .chartpie_wrap .chartpie_top .title{
  font-family: 'PingFangSC-Regular';
  font-size: 14px;
  color: #1F2D3D;
  letter-spacing: 0;
  text-align: center;
  line-height: 20px;
  margin-bottom: 16px;
}
.overviews .chart .chartpie_wrap .chartpie_top .leg{
  height: 74px;
  text-align: center;
}
.overviews .chart .chartpie_wrap .chartpie_top .leg span{
  position: relative;
  display: inline-block;
  line-height: 17px;
  text-indent: 24px;
  margin-right: 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #5e6d82;
}
.overviews .chart .chartpie_wrap .chartpie_top .leg span:before{
  content: '';
  position: absolute;
  width: 20px;
  height: 12px;
  background: red;
  left: 0px;
  top:3px;
}
/*第一图例*/
.overviews .chart .chartpie_wrap.pie1 .chartpie_top .leg span:nth-of-type(1):before{
  background: #6699EE;
}
.overviews .chart .chartpie_wrap.pie1 .chartpie_top .leg span:nth-of-type(2):before{
  background: #FEA922;
}
.overviews .chart .chartpie_wrap .chartpie_top .leg span:last-child:before{
  background: #D0D3DD;
}
/*第二图例*/
.overviews .chart .chartpie_wrap.pie2 .chartpie_top .leg span:nth-of-type(1):before{
  background: #86E2F3;
}
.overviews .chart .chartpie_wrap.pie2 .chartpie_top .leg span:nth-of-type(2):before{
  background: #76C7F6;
}
.overviews .chart .chartpie_wrap.pie2 .chartpie_top .leg span:nth-of-type(3):before{
  background: #6699EE;
}
.overviews .chart .chartpie_wrap.pie2 .chartpie_top .leg span:nth-of-type(4):before{
  background: #51C99B;
}
.overviews .chart .chartpie_wrap.pie2 .chartpie_top .leg span:nth-of-type(5):before{
  background: #FEA922;
}
.overviews .chart .chartpie_wrap.pie2 .chartpie_top .leg span:nth-of-type(6):before{
  background: #F6D14F;
}
/*第三图例*/
.overviews .chart .chartpie_wrap.pie3 .chartpie_top .leg span:nth-of-type(1):before{
  background: #86E2F3;
}
.overviews .chart .chartpie_wrap.pie3 .chartpie_top .leg span:nth-of-type(2):before{
  background: #76C7F6;
}
.overviews .chart .chartpie_wrap.pie3 .chartpie_top .leg span:nth-of-type(3):before{
  background: #51C99B;
}
.overviews .chart .chartpie_wrap.pie3 .chartpie_top .leg span:nth-of-type(4):before{
  background: #6699EE;
}
.overviews .chart .chartpie_wrap.pie3 .chartpie_top .leg span:nth-of-type(5):before{
  background: #FEA922;
}
.overviews .chart .chartpie_wrap.pie3 .chartpie_top .leg span:nth-of-type(6):before{
  background: #F6D14F;
}
.overviews .statistical-list .detained-amount .dm-icon-question{
  display: inline-block;
  width: 15px;
}
</style>






