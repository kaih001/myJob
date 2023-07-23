<template>
  	<div class="tjpackage">
      <tjtop
          title="招聘概览"
          :show_sel_date="true"
          :date="date"
          :show_sel_post="true"
          :post_ids="post_ids"
          :shortcuts="shortcuts"
          :month-num="12"
          @dateChange="dateChange"
          @postChange="postChange"
      ></tjtop>
      <div class="main_data">
          <div>
              <p class="num">{{apply_info.apply_num_all}}</p>
              <p class="name">
                  <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                      <div slot="content">从注册斗米开始，截止当前日期全部<br/>报名量</div>
                      <span>历史累计报名量</span>
                  </el-tooltip>
              </p>
          </div>
          <div>
              <p class="num">{{apply_info.show_num}}<span :class="{'up': apply_info.show_num_change>0, 'down': apply_info.show_num_change<=0}">{{apply_info.show_num_change=='--'?'--':Math.abs(apply_info.show_num_change)}}%</span></p>
              <p class="name">
                  <el-tooltip :enterable="false" transition="none" effect="dark" content="职位在列表页被求职者看到的次数" placement="bottom">
                      <span>曝光次数</span>
                  </el-tooltip>
              </p>
          </div>
          <div>
              <p class="num">{{apply_info.browser_num}}<span :class="{'up': apply_info.browser_num_change>0, 'down': apply_info.browser_num_change<=0}">{{apply_info.browser_num_change=='--'?'--':Math.abs(apply_info.browser_num_change)}}%</span></p>
              <p class="name">
                  <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                      <div slot="content">职位被求职者看到并点击查看职位详情的次数<br/></div>
                      <span>点击次数</span>
                  </el-tooltip>
              </p>
          </div>
          <div>
              <p class="num">{{apply_info.apply_num}}<span :class="{'up': apply_info.apply_num_change>0, 'down': apply_info.apply_num_change<=0}">{{apply_info.apply_num_change=='--'?'--':Math.abs(apply_info.apply_num_change)}}%</span></p>
              <p class="name">
                  <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                      <div slot="content">职位被求职者报名的次数<br/></div>
                      <span>报名次数</span>
                  </el-tooltip>
              </p>
          </div>
      </div>
      <div class="chart" v-loading="!getChartDataEnd">
          <div class="table_title">
              <div class="title">招聘趋势</div>
              <div class="right">
                  <span class="help" v-if="tipData.contents.length" v-on:mouseenter="hoverFn">提示
                      <div class="help_tip">
                          <div class="help_tip_title">数据提示说明</div>
                          <!-- <p><span>总报名人数：</span>每日报名总人次。</p> -->
                          <p v-for="(tip,i) in tipData.contents">{{(i<(tipData.contents.length-1)?(i+1+'.'):'') + tip}}</p>
                          <el-button type="primary" v-if="tipData.have_pointgold_button==1" @click="tipClickFn" style="padding: 10px 9px;float:right;margin:8px 0 12px;">发布点金职位</el-button>
                      </div>
                  </span>
              </div>
          </div>
          <div class="legend_wrap">
              <div class="tabs_wrap">
                  <el-tabs v-model="tabs" @tab-click="handleClick">
                      <el-tab-pane label="曝光次数" name="1-2"></el-tab-pane>
                      <el-tab-pane label="点击次数" name="1-3"></el-tab-pane>
                      <el-tab-pane label="报名次数" name="1-1"></el-tab-pane>
                  </el-tabs>
              </div>
              <div class="legends">
                  <div class="legend"><span style="background:#84aef5;"></span>{{legend}}</div>
              </div>
          </div>
          <chart-line
              id="chart_line_1"
              :xData="xData"
              :yData="yData"
          ></chart-line>
      </div>
      <div class="chart" v-loading="!getChartDataEnd">
          <div class="table_title">
              <div class="title">招聘数据</div>
              <!-- <div class="right">
                  <span class="download" @click="exportData('account_data')">下载数据</span>
                  <span class="help">帮助
                      <div class="help_tip">
                          <div class="help_tip_title">数据指标说明</div>
                          <p><span>登录次数：</span>所选时段内，每个人的访问斗米后台次数。</p>
                          <p><span>日均登录次数：</span>所选时段内，每个人每日平均访问斗米后台次数。</p>
                      </div>
                  </span>
              </div> -->
          </div>
          <div class="table_wrap">
              <el-table
                  :data="curTableData"
                  border
                  style="width: 100%"
              >
                  <el-table-column
                      prop="date_time"
                      label="日期"
                      min-width="196">
                  </el-table-column>
                  <el-table-column
                      prop="show_num"
                      label="曝光次数"
                      min-width="196">
                  </el-table-column>
                  <el-table-column
                      prop="browser_num"
                      label="点击次数"
                      min-width="196">
                  </el-table-column>
                  <el-table-column
                      prop="apply_num"
                      label="报名次数"
                      min-width="196">
                  </el-table-column>
              </el-table>
              <div class="pagination_wrap">
                  <div class="pagination">
                      <el-pagination
                          @current-change="handleCurrentChange"
                          :current-page.sync="currentPage"
                          :page-size="20"
                          layout="prev, pager, next"
                          :total="detaliData.length">
                      </el-pagination>
                  </div>
                  <div class="total">共 {{detaliData.length}} 条</div>
              </div>
          </div>
      </div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

import tjtop from '@/components/common/TJtop'
import breadcrumb from '@/components/common/breadcrumb'
import ChartLine from '@/components/common/ChartLine'

const dmch = '/jianzhi/vip/statistics/zhipintong'
const cookie = {}
export default {
  	name: 'TJpackage',
    components: {
        tjtop,
        breadcrumb,
        ChartLine
    },
  	data () {
    	return {
        // 组件所需数据
        date: {
            date:[new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 7), new Date().setTime(new Date().getTime() - 3600 * 1000 * 24)]
        },
        shortcuts: [// 传入组件的 自定义快捷项
          {
              text: '最近一周',
              onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                  end.setTime(end.getTime() - 3600 * 1000 * 24);
                  picker.$emit('pick', [start, end]);
              }
          },
        ],
        post_id: 0,
        post_ids: [
          {
            "id":0,                
            "title":"全部职位"          
          }
          // {
          //   "id":1001,                //类型：Number  必有字段  备注：职位id
          //   "title":"直聘通服务员测试职位111"                //类型：String  必有字段  备注：职位名称
          // },
          // {
          //   "id":1002,                //类型：Number  必有字段  备注：职位id
          //   "title":"直聘通服务员测试职位"                //类型：String  必有字段  备注：职位名称
          // },
        ],
        //请求的原始数据
        apply_info: {//核心指标
            "apply_num_all": '--',//历史报名数
            "show_num": '--',//曝光次数
            "show_num_change": '--',//曝光次数变化
            "browser_num": '--',//点击次数
            "browser_num_change": '--',//点击次数变化
            "apply_num": '--',//报名次数
            "apply_num_change": '--'//报名次数变化
        },
        getChartDataEnd: true,
        detaliData: [
          // {                //类型：Object  必有字段  备注：无
          //   "date_time":"2019-03-10",                //类型：String  必有字段  备注：无
          //   "apply_num":186,                //类型：Number  必有字段  备注：无
          //   "show_num":101,                //类型：Number  必有字段  备注：无
          //   "browser_num":49                //类型：Number  必有字段  备注：无
          // },
        ],
        tipData: {                //类型：Object  必有字段  备注：无
            "contents": [                //类型：Array  必有字段  备注：无
                // "你的职位转化较低，建议优化职位标题/描述",                //类型：String  必有字段  备注：无
                // "你的职位在同城市同行业职位中转化较低，建议优化职位描述以及薪资等信息",                //类型：String  必有字段  备注：无
                // "你的职位转化在同城市同行业职位中较高，如果想进一步提高效果可以发布点金职位获取更高流量",                //类型：String  必有字段  备注：无
                // "职位转化较低，建议优化职位内容，提高职位转化。或者发布点金职位获取更多流量",                //类型：String  必有字段  备注：无
                // "*同城市同类目职位转化排行计算：分别取同城市同类目下所有直聘通职位转化均值，高于均值算高，低于均值算低"                //类型：String  必有字段  备注：无
            ],
            "have_pointgold_button":0,                //类型：Number  必有字段  备注：是否有点金按钮0:没有1:有
            "url":"https://vip.doumi.com/pointgold/index"                //类型：String  必有字段  备注：点金跳转链接
        },
        curTableData: [],//表格当前页数据
        xData: [],//日期
        yData: [
            // {
            //     name: '录用',
            //     data: [1,2,3,4,5,6,7],
            //     color: '#7fc25d'
            // },
            // {
            //     name: '待面试',
            //     data: [7,6,5,4,3,2,1],
            //     color: '#86b0f6'
            // }
        ],
        tabs: '1-2',
        legend: '曝光量',
        currentPage: 1,
    	}
  	},
  	methods: {
    	init() {
        this.getPostList()
        this.getApply_info()
        this.getDetailData()
    	},
      getPostList() {
        util.ajaxB({
            url: '/stat/yearly/posts',
            type:'POST',
            data: {
                
            },
            success: (res) => {
                console.log('获取职位列表')
                console.log(res)
                if(res.code == 0){
                  this.post_ids.length = 0
                  this.post_ids.push({
                    "id":0,                
                    "title":"全部职位"          
                  })
                  this.post_ids.push(...res.data)
                }
            },
            error: (xhr, status) => {
                console.log(xhr)
            },
            noNetwork: () => {
                //网络超时
                this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络。',
                    type: 'warning'
                });
            }
        })
      },
      getApply_info() {//获取核心指标
        this.apply_info = {//核心指标
          "apply_num_all": '--',//历史报名数
          "show_num": '--',//曝光次数
          "show_num_change": '--',//曝光次数变化
          "browser_num": '--',//点击次数
          "browser_num_change": '--',//点击次数变化
          "apply_num": '--',//报名次数
          "apply_num_change": '--'//报名次数变化
        }
        util.ajaxB({
          url: '/stat/yearly/overview',
          type:'POST',
          data: {
              date_start: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
              date_end: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
              id: this.post_id
          },
          success: (res) => {
              console.log('核心指标')
              console.log(res)
              if(res.code == 0){
                  this.apply_info = res.data.info
                  this.tipData = res.data.tips
              }
          },
          error: (xhr, status) => {
              console.log(xhr)
          },
          noNetwork: () => {
              //网络超时
              this.$message({
                  showClose: true,
                  message: '网络连接失败，请检查网络。',
                  type: 'warning'
              });
          }
        })
      },
      getDetailData() {//详细招聘数据
          this.getChartDataEnd = false
          util.ajaxB({
              url: '/stat/yearly/graph',
              type:'POST',
              data: {
                  // team_id: this.team_id,
                  date_start: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                  date_end: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                  id: this.post_id
              },
              success: (res) => {
                  console.log('详细招聘数据')
                  console.log(res)
                  if(res.code == 0){
                      
                      this.detaliData = res.data

                      let tempX = []
                      let tempY = [{
                              name: '曝光量',
                              data: [],
                              color: '#84aef5'
                          }]
                      this.detaliData.forEach((obj) => {
                          tempX.push(obj.date_time)
                          tempY[0].data.push(Number(obj.show_num))
                      })

                      this.xData = tempX
                      this.yData = tempY

                      this.curTableData = this.detaliData.slice(this.currentPage*20-20,this.currentPage*20)
                  }
                  this.getChartDataEnd = true
              },
              error: (xhr, status) => {
                  this.getChartDataEnd = true
                  console.log(xhr)
              },
              noNetwork: () => {
                  this.getChartDataEnd = true
                  //网络超时
                  this.$message({
                      showClose: true,
                      message: '网络连接失败，请检查网络。',
                      type: 'warning'
                  });
              }
          })
      },
      dateChange() {
          this.tabs = '1-2'
          this.legend = '曝光量'
          this.currentPage = 1
          // console.log(this.date)
          this.getApply_info()
          this.getDetailData()
      },
      postChange(post) {
          this.tabs = '1-2'
          this.legend = '曝光量'
          this.currentPage = 1
          // console.log(post.id)
          this.post_id = post.id
          //重新获取数据
          this.getApply_info()
          this.getDetailData()
      },
      tipClickFn() {
        window.open(this.tipData.url)
        // 埋点
        let time = util.getLocalTime(new Date().getTime(), 'yyyy-MM-dd HH:mm:ss')
        this.$trackEvent(dmch, `@atype=click@ca_source=pc@from=zpttj@ca_from=dianjin@ca_name=doumi@company_id=${cookie.company_id}&time=${time}`)
      },
      hoverFn() {
        // 埋点
        let time = util.getLocalTime(new Date().getTime(), 'yyyy-MM-dd HH:mm:ss')
        this.$trackEvent(dmch, `@atype=hover@ca_source=pc@from=zpttj@ca_from=tishi@ca_name=doumi@company_id=${cookie.company_id}&time=${time}`)
      },
      handleClick(tab, event){
          // console.log(tab, event)
          // console.log(tab.name)
          // this.tabs1 = tab.name
          let key = 'apply_num'
          let name = '报名量'

          switch(tab.name){
              case '1-1':
                  key = 'apply_num'
                  this.legend = name = '报名量'
              break;
              case '1-2':
                  key = 'show_num'
                  this.legend = name = '曝光量'
              break;
              case '1-3':
                  key = 'browser_num'
                  this.legend = name = '点击量'
              break;
          }

          let tempX = []
          let tempY = [{
              name: name,
              data: [],
              color: '#79a8f6'
          }]
          this.detaliData.forEach((obj) => {
              tempX.push(obj.date_time)
              tempY[0].data.push(Number(obj[key]))
          })

          this.xData = tempX
          this.yData = tempY
      },
      handleCurrentChange() {
          this.curTableData = this.detaliData.slice(this.currentPage*20-20,this.currentPage*20)
      },
      getCookie(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg)){
          return unescape(arr[2]);
        }else{
          return null;
        }
      }
  	},
  	mounted() {
      // 获取cookie信息
      cookie.company_id = this.getCookie('cid')
      cookie.uuid = this.getCookie('dmb_uuid')
      cookie.dmuser = this.getCookie('dmb_userid')
      cookie.sid = this.getCookie('sid')
      cookie.loginfrom = this.getCookie('dmb_loginfrom')

    	this.init()
      // 埋点
      let time = util.getLocalTime(new Date().getTime(), 'yyyy-MM-dd HH:mm:ss')
      this.$trackEvent(dmch, `@atype=show@ca_source=pc@from=zpttj@ca_name=doumi@company_id=${cookie.company_id}&time=${time}`)
      // this.$trackEvent(dmch, `@atype=show@ca_source=pc@from=zpttj@ca_from=dianjin@ca_name=doumi@company_id=${cookie.company_id}&company_id=${cookie.company_id}&uuid=${cookie.uuid}&dmuser=${cookie.dmuser}&sid=${cookie.sid}&loginfrom=${cookie.loginfrom}&time=${time}`)
  	},
  	// watch: {
  	//   '$route' (to, from) {
  	//     // 对路由变化作出响应...
   //      this.init()
  	//   }
  	// }
}
</script>

<style>
.tjpackage .chart .tabs_wrap .el-tabs__header{
    margin: 12px 0 0;
    border-bottom: none;
}
.tjpackage .chart .tabs_wrap .el-tabs__header .el-tabs__active-bar{
    background-color: #6699ee;
}
.tjpackage .chart .tabs_wrap .el-tabs__header .el-tabs__item{
    color: #5e6d82;
    padding: 0 8px;
}
.tjpackage .chart .tabs_wrap .el-tabs__header .el-tabs__item.is-active{
    color: #6699ee;
    font-weight: bold;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tjpackage{
    padding: 0 20px;
}

.tjpackage .main_data{
    display: flex;
    height: 151px;
}
.tjpackage .main_data>div{
    margin-right: 47px;
}
.tjpackage .main_data>div .num{
    font-family: 'SFUIDisplay';
    font-size: 32px;
    line-height: 38px;
    color: #475669;
    margin-top: 44px;
}
.tjpackage .main_data>div .num>span{
    display: inline-block;
    height: 13px;
    line-height: 12px;
    text-indent: 14px;
    margin-left: 8px;
    font-size: 12px;
    color: #8492a6;
}
.tjpackage .main_data>div .num>span.up{
    background: url(../assets/imgs/statistic/up.svg) left center no-repeat;
}
.tjpackage .main_data>div .num>span.down{
    background: url(../assets/imgs/statistic/down.svg) left center no-repeat;
}
.tjpackage .main_data>div .name{
    font-size: 12px;
    line-height: 17px;
    color: #8492a6;
    margin-top: 8px;
}

.tjpackage .chart .table_title{
    border-bottom: 1px solid #e0e6ed;
}
.tjpackage .chart .table_title:after{
    content: '';
    display: block;
    clear:both;
}
.tjpackage .chart .table_title .title{
    float: left;
    line-height: 27px;
    font-size: 16px;
    font-weight: bold;
    color: #475669; 
    margin-bottom: 14px;
}
.tjpackage .chart .table_title .right{
    float: right;
    height: 27px;
    line-height: 27px;
    /*margin-bottom: 14px;*/
}
.tjpackage .chart .table_title .right>span{
    display: inline-block;
    text-indent: 19px;
    font-size: 14px;
    font-weight: 500;
    color: #6699ee;
}
.tjpackage .chart .table_title .right>span.help{
    position: relative;
    background: url(../assets/imgs/statistic/tip.svg) left center no-repeat;
}
.tjpackage .chart .table_title .right>span.help:after{
    content: '';
    position: absolute;
    width: 120%;
    height: 10px;
    top:22px;
    right: 0;
}
.tjpackage .chart .table_title .right>span.help .help_tip{
    display: none;
    position: absolute;
    z-index: 9999;
    right:0;
    top:29px;
    width: 313px;
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.07);
    border: solid 1px #e0e6ed;
    padding: 0 20px 8px;
}
.tjpackage .chart .table_title .right>span.help:hover .help_tip{
    display: block;
}
.tjpackage .chart .table_title .right>span.help .help_tip:after{
    content: '';
    position: absolute;
    right:16px;
    top:-5px;
    width: 7px;
    height: 7px;
    background: #fff;
    border-top: solid 1px #e0e6ed;
    border-right: solid 1px #e0e6ed;
    transform: rotate(-45deg)
}
.tjpackage .chart .table_title .right>span.help .help_tip .help_tip_title{
    height: 46px;
    line-height: 46px;
    font-size: 13px;
    font-weight: bold;
    color: #99a9bf;
    text-indent: 0;
    border-bottom:1px solid #e0e6ed;
    margin-bottom: 16px;
}
.tjpackage .chart .table_title .right>span.help .help_tip>p{
    color: #5e6d82;
    font-weight: 350;
    font-size: 12px;
    line-height: 22px;
    text-indent: 0;
    margin-bottom:12px;
}
.tjpackage .chart .table_title .right>span.help .help_tip>p:nth-of-type(2n){
    background: #f5f7f9;
}
.tjpackage .chart .table_title .right>span.help .help_tip>p>span{
    color: #5e6d82;
    font-weight: bold;
}
.tjpackage .chart .tabs_wrap{
    float: left;
}
.tjpackage .chart .legend_wrap{
    height: 65px;
    line-height: 18px;
    margin-bottom: 12px;
}
.tjpackage .chart .legend_wrap .left{
    float: left;
    font-size: 13px;
    color: #99a9bf;
    margin-top: 24px;
}
.tjpackage .chart .legend_wrap .left>span{
    font-size: 14px;
    font-weight: 500;
    color: #5e6d82;
    margin-left: 4px;
}
.tjpackage .chart .legends{
    float: right;
    height: 18px;
    margin-top: 24px;
}
.tjpackage .chart .legends .legend{
    font-size: 12px;
    color: #5e6d82;
    float: left;
    margin-left: 16px;
}
.tjpackage .chart .legends .legend>span{
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
}

.tjpackage .chart .table_wrap{
    margin-top:16px;
}
.tjpackage .chart .table_wrap .pagination_wrap{
    float: right;
    margin-bottom: 40px;
}
.tjpackage .chart .table_wrap .pagination_wrap{
    content: '';
    display: block;
    clear:all;
}
.tjpackage .chart .table_wrap .pagination_wrap .pagination{
    float: right;
}
.tjpackage .chart .table_wrap .pagination_wrap .total{
    float: right;
    margin: 10px 10px 0 0;
    font-size: 13px;
    color: #5e6d82;
    line-height: 28px;
}
</style>
