<template>
  	<div id="Customerconfirm">
        <div class="customer-wapper">
            <h1>
              客户确认
              <div class="new-build-mail" @click="NewCreatMailClick"  v-if="admins.category == false" ><i class="addIcon"></i>新建确认邮件</div>
              <div class="new-build-mail daily_mr" @click="NewDailywage" v-if="admins.newDailywageFlag"><i class="addIcon"></i>新建日薪确认</div>
            </h1>
            <div class="mytabs">
                <el-tabs v-model="activeTabName" @tab-click="tabsClick">
                  <el-tab-pane :label="'待确认'+notConfirm" name="0">
                      <div class="notConfirmTableList" id="notConfirmId">
                          <el-table
                            tooltip-effect="dark"
                            style="width: 100%"
                            :height="winHeight"
                            :data="notConfirmTableData"
                            @row-click="gotoKqDetail"
                            empty-text="暂无待确认邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="100">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="80">
                              </el-table-column>
                              <el-table-column
                                label="考勤周期"
                                prop="start_date"
                                show-overflow-tooltip>
                                  <template slot-scope="scope">
                                      <div>{{getLocalTime(scope.row.start_date*1000)}}至{{getLocalTime(scope.row.end_date*1000)}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="考勤人天"
                                prop="attend_man_day"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                prop="total_real_wage"
                                show-overflow-tooltip
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="打卡率"
                                prop="punch_rate"
                                show-overflow-tooltip
                                width="130">
                                  <template slot-scope="scope">
                                     <div class="progress_bar">
                                        <div class="green" :style="{'width': scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 90 && scope.row.punch_rate <= 100"></div>
                                        
                                        <div class="yellow" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 50 && scope.row.punch_rate < 90"></div>

                                        <div class="red" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 0 && scope.row.punch_rate < 50"></div>
                                      </div>
                                      <div class="progress_text">{{scope.row.punch_rate == 0 ? 0 : scope.row.punch_rate}}%</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                align='center'
                                label="操作"
                                width="70">
                                <template slot-scope="scope">
                                  <el-button type="text" size="small">删除</el-button>
                                </template>
                              </el-table-column>
                          </el-table>
                      </div>
                  </el-tab-pane>
                  <el-tab-pane :label="'已确认'+confirm" name="1">
                      <div class="confirmTableList" id="confirmId">
                          <el-table
                            tooltip-effect="dark"
                            style="width: 100%"
                            :height="winHeight"
                            :data="confirmTableData"
                            @row-click="gotoKqDetail"
                            empty-text="暂无已确认邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="100">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="80">
                              </el-table-column>
                              <el-table-column
                                label="考勤周期"
                                prop="start_date"
                                show-overflow-tooltip>
                                  <template slot-scope="scope">
                                      <div>{{getLocalTime(scope.row.start_date*1000)}}至{{getLocalTime(scope.row.end_date*1000)}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="考勤人天"
                                prop="attend_man_day"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                prop="total_real_wage"
                                show-overflow-tooltip
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="打卡率"
                                prop="punch_rate"
                                show-overflow-tooltip
                                width="130">
                                  <template slot-scope="scope">
                                     <div class="progress_bar">
                                        <div class="green" :style="{'width': scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 90 && scope.row.punch_rate <= 100"></div>
                                        
                                        <div class="yellow" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 50 && scope.row.punch_rate < 90"></div>

                                        <div class="red" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 0 && scope.row.punch_rate < 50"></div>
                                      </div>
                                      <div class="progress_text">{{scope.row.punch_rate == 0 ? 0 : scope.row.punch_rate}}%</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                              align='center'
                                label="操作"
                                width="70">
                                <template slot-scope="scope">
                                  <el-button type="text" size="small">删除</el-button>
                                </template>
                              </el-table-column>
                          </el-table>
                      </div>
                  </el-tab-pane>
                  <el-tab-pane :label="'拒绝确认'+refuseConfirm" name="2">
                      <div class="refuseConfirmTableList" id="refuseConfirmId">
                          <el-table
                            tooltip-effect="dark"
                            style="width: 100%"
                            :height="winHeight"
                            :data="refuseConfirmTableData"
                            @row-click="gotoKqDetail"
                            empty-text="暂无拒绝确认邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="100">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="80">
                              </el-table-column>
                              <el-table-column
                                label="考勤周期"
                                prop="start_date"
                                show-overflow-tooltip>
                                  <template slot-scope="scope">
                                      <div>{{getLocalTime(scope.row.start_date*1000)}}至{{getLocalTime(scope.row.end_date*1000)}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="考勤人天"
                                prop="attend_man_day"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                prop="total_real_wage"
                                show-overflow-tooltip
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="打卡率"
                                prop="punch_rate"
                                show-overflow-tooltip
                                width="130">
                                  <template slot-scope="scope">
                                     <div class="progress_bar">
                                        <div class="green" :style="{'width': scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 90 && scope.row.punch_rate <= 100"></div>
                                        
                                        <div class="yellow" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 50 && scope.row.punch_rate < 90"></div>

                                        <div class="red" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 0 && scope.row.punch_rate < 50"></div>
                                      </div>
                                      <div class="progress_text">{{scope.row.punch_rate == 0 ? 0 : scope.row.punch_rate}}%</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                              align='center'
                                label="操作"
                                width="70">
                                <template slot-scope="scope">
                                  <el-button type="text" size="small">删除</el-button>
                                </template>
                              </el-table-column>
                          </el-table>
                      </div>
                  </el-tab-pane>
                  <el-tab-pane :label="'审核通过'+throughConfirm" name="3">
                      <div class="approvedList" id="approved">
                          <el-table
                            tooltip-effect="dark"
                            style="width: 100%"
                            :height="winHeight"
                            :data="throughConfirmTableData"
                            @row-click="gotoKqDetail"
                            empty-text="暂无审核通过邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="100">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="80">
                              </el-table-column>
                              <el-table-column
                                label="考勤周期"
                                prop="start_date"
                                show-overflow-tooltip>
                                  <template slot-scope="scope">
                                      <div>{{getLocalTime(scope.row.start_date*1000)}}至{{getLocalTime(scope.row.end_date*1000)}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="考勤人天"
                                prop="attend_man_day"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                prop="total_real_wage"
                                show-overflow-tooltip
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="打卡率"
                                prop="punch_rate"
                                show-overflow-tooltip
                                width="130">
                                  <template slot-scope="scope">
                                     <div class="progress_bar">
                                        <div class="green" :style="{'width': scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 90 && scope.row.punch_rate <= 100"></div>
                                        
                                        <div class="yellow" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 50 && scope.row.punch_rate < 90"></div>

                                        <div class="red" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 0 && scope.row.punch_rate < 50"></div>
                                      </div>
                                      <div class="progress_text">{{scope.row.punch_rate == 0 ? 0 : scope.row.punch_rate}}%</div>
                                  </template>
                              </el-table-column>
                          </el-table>
                      </div>
                  </el-tab-pane>
                  <el-tab-pane :label="'部分支付'+partPay" name="7" >
                      <div class="havePlayLsit" id="havePlay">
                          <el-table
                            tooltip-effect="dark"
                            style="width: 100%"
                            :height="winHeight"
                            :data="alreadyPayTableData"
                            @row-click="gotoKqDetail"
                            empty-text="暂无部分支付邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="100">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="80">
                              </el-table-column>
                              <el-table-column
                                label="考勤周期"
                                prop="start_date"
                                show-overflow-tooltip>
                                  <template slot-scope="scope">
                                      <div>{{getLocalTime(scope.row.start_date*1000)}}至{{getLocalTime(scope.row.end_date*1000)}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="考勤人天"
                                prop="attend_man_day"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                prop="total_real_wage"
                                show-overflow-tooltip
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="已发工资总额"
                                prop="total_real_wage"
                                show-overflow-tooltip
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.paid_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="暂扣工资总额"
                                prop="total_real_wage"
                                show-overflow-tooltip
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.deduct_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="打卡率"
                                prop="punch_rate"
                                show-overflow-tooltip
                                width="130">
                                  <template slot-scope="scope">
                                     <div class="progress_bar">
                                        <div class="green" :style="{'width': scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 90 && scope.row.punch_rate <= 100"></div>
                                        
                                        <div class="yellow" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 50 && scope.row.punch_rate < 90"></div>

                                        <div class="red" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 0 && scope.row.punch_rate < 50"></div>
                                      </div>
                                      <div class="progress_text">{{scope.row.punch_rate == 0 ? 0 : scope.row.punch_rate}}%</div>
                                  </template>
                              </el-table-column>
                          </el-table>
                      </div>
                  </el-tab-pane>
                  <el-tab-pane :label="'已支付'+alreadyPay" name="5">
                      <div class="approvedList" id="approved">
                          <el-table
                            tooltip-effect="dark"
                            style="width: 100%"
                            :height="winHeight"
                            :data="alreadyPayTableData"
                            @row-click="gotoKqDetail"
                            empty-text="暂无已支付邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="100">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="80">
                              </el-table-column>
                              <el-table-column
                                label="考勤周期"
                                prop="start_date"
                                show-overflow-tooltip>
                                  <template slot-scope="scope">
                                      <div>{{getLocalTime(scope.row.start_date*1000)}}至{{getLocalTime(scope.row.end_date*1000)}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="考勤人天"
                                prop="attend_man_day"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                prop="total_real_wage"
                                show-overflow-tooltip
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                label="打卡率"
                                prop="punch_rate"
                                show-overflow-tooltip
                                width="130">
                                  <template slot-scope="scope">
                                     <div class="progress_bar">
                                        <div class="green" :style="{'width': scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 90 && scope.row.punch_rate <= 100"></div>
                                        
                                        <div class="yellow" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 50 && scope.row.punch_rate < 90"></div>

                                        <div class="red" :style="{'width':scope.row.punch_rate+'%'}" v-if="scope.row.punch_rate >= 0 && scope.row.punch_rate < 50"></div>
                                      </div>
                                      <div class="progress_text">{{scope.row.punch_rate == 0 ? 0 : scope.row.punch_rate}}%</div>
                                  </template>
                              </el-table-column>
                          </el-table>
                      </div>
                  </el-tab-pane>
                </el-tabs>
                <!-- 分页组件 -->
                <div class="page">
                  <div class="block">
                    <el-pagination
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentPageChange"
                      :current-page.sync="currentPage"
                      :page-size="20"
                      layout="total, prev, pager, next"
                      :total="parseInt(total_num)">
                    </el-pagination>
                  </div>
                </div>
            </div>
        </div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

export default {
  	name: 'Customerconfirm',
  	data () {
    	return {
          admins:{
            category:false,
            newDailywageFlag: false
          },
          team_id:'',
          project_id:'',
          winHeight:'',
          activeTabName:'0',  //默认当前tab
          currTabActive:'',
          notConfirm:'', //待确认num
          confirm:'',  //已确认num
          partPay:'',//部分支付num
          refuseConfirm:'', //拒绝确认num
          throughConfirm:'',//审核通过num
          alreadyPay:'',//已支付num
          notConfirmTableData:[],   // 待确认表格数据
          confirmTableData:[],   // 确认表格数据
          refuseConfirmTableData:[],   // 拒绝确认表格数据
          throughConfirmTableData:[],//审核通过
          alreadyPayTableData:[],//已支付
          page_no:1, //分页
          currentPage: 1, // 分页--当前显示页码
          total_num:'',
          winHeight:''
    	}
  	},
  	methods: {
    	init() {
        // this.admins.category = false
        this.winHeight = window.innerHeight - 220;
        this.team_id = util.getLocalStorage('projectStorageInfo').team_id
        this.project_id = util.getLocalStorage('projectStorageInfo').project_id
        this.currTabActive = util.getLocalStorage('activeTabName');
        if(this.currTabActive){
          this.activeTabName = this.currTabActive
          this.getData()
        }else{
          this.activeTabName = '0'
        }
        this.getData()
        //获取权限
        this.getPermissions()
    	},
      //获取表格数据列表
      getData(){
        setTimeout(() => {
          $('.el-table__body-wrapper').scrollTop(0)
        })
        let _data = '';
        _data = {
          team_id:this.team_id,
          project_id:this.project_id,
          status:this.activeTabName,
          page_no:this.page_no,
          page_size:20
        }
        util.ajax({
          url:'/confirmmail/list',
          type:'POST',
          data:_data,
          timeout:10000,
          success:(obj) => {
              // console.log(obj)
              util.setLocalStorage('activeTabName','')
              if(obj && obj.errno == 0){
                  this.total_num = obj.data.total_num || 0
                  this.notConfirm = '('+obj.data.pending+')'
                  this.confirm = '('+obj.data.confirmed+')'
                  this.refuseConfirm = '('+obj.data.not_confirmed+')'
                  this.throughConfirm = '('+obj.data.check_pass+')'
                  this.alreadyPay = '('+ (obj.data.already_pay || 0) +')'
                  this.partPay = '('+ (obj.data.partial_pay || 0) +')';
                  if(this.activeTabName == 0){
                      this.notConfirmTableData = obj.data.list
                  }else if(this.activeTabName == 1){
                      this.confirmTableData = obj.data.list
                  }else if(this.activeTabName == 2){
                      this.refuseConfirmTableData = obj.data.list
                  }else if(this.activeTabName == 3){
                      this.throughConfirmTableData = obj.data.list
                  }else if(this.activeTabName == 5){
                      this.alreadyPayTableData = obj.data.list
                  }else if(this.activeTabName == 7){
                      this.alreadyPayTableData = obj.data.list
                  }
                  
              }else{
                  this.$message({
                      showClose: true,
                      message: obj.errmsg,
                      type: 'warning'
                  });
              }
          },   
          error: (xhr, status) => {
            util.setLocalStorage('activeTabName','')
          },
          noNetwork: () => {
            util.setLocalStorage('activeTabName','')
            //网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
          }
        })
      },
      //前往考勤详情页
      gotoKqDetail(row,event,column){
        if(event.target.nodeName == "BUTTON" || event.target.nodeName == "SPAN"){
          this.$confirm('确认删除“邮件主题'+row.subject+'”？', '确认删除邮件', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
          // 删除邮件
          let data = {
            team_id:this.team_id,
            project_id:this.project_id,	
            confirm_id:row.id
          }
          util.ajax({
          url:'/confirmmail/delete',
          type:'POST',
          data:data,
          timeout:10000,
          success:(obj) => {
              if(obj && obj.errno == 0){
                  this.getData()
                  this.$message({
                    type: 'success',
                    message: '删除成功!'
                  });
              }else{
                  this.$message({
                      showClose: true,
                      message: obj.errmsg,
                      type: 'warning'
                  });
              }
          },   
          error: (xhr, status) => {
            util.setLocalStorage('activeTabName','')
          },
          noNetwork: () => {
            util.setLocalStorage('activeTabName','')
            //网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
          }
        })
        }).catch(() => {
        });
        return false
        };
        // console.log(row)
        if(navigator.onLine){
          util.setLocalStorage('activeTabName',this.activeTabName)
          this.$router.replace('kqConfirm?confirm_id='+row.id)
        }else{
          this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
          });
        }
      },
      // 前往新建日薪确认
      NewDailywage() {
        this.$router.replace('newDailywage')
      },
      //前往新建确认邮件页面
      NewCreatMailClick(){
        this.$router.replace('newcreatmail')
      },
      //tab切换
      tabsClick(tab, event){
        this.activeTabName = tab.name
        this.page_no = 1
        this.currentPage = 1
        this.getData()
      },
      //分页
      handleCurrentPageChange(val) {
        this.page_no = val
        this.getData()
      },
      /*分页操作*/
      handleSizeChange(val) {
          // console.log(`每页 ${val} 条`);
      },
      //日期格式化“分秒”
      getLocalTime(timestr){
          return util.getLocalTime(timestr, 'yyyy-MM-dd')
      },
      //获取权限
      getPermissions(){
        util.ajax({
            url:'/permission/application',
            type:'GET',
            data:{
                team_id: this.team_id,
                project_id: this.project_id,
                application_id:0
            },
            timeout:10000,
            success:(obj) => {
              // console.log(obj)
              if(obj && obj.errno == 0){
                obj.data.forEach ( (i) => {
                  if(i.id_name == 'invisible_man'){ 
                    this.admins.category = true;
                  }else{
                    this.admins.category = false;
                  }
                  if(i.id_name == 'naixue_saas_project_ids_daycofirm') {
                    this.admins.newDailywageFlag = true;
                  } 
                })
                console.log(this.admins.category)
              }else{
                this.$message({
                    showClose: true,
                    message: obj.errmsg,
                    type: 'warning'
                });
              }
            },   
            error: (xhr, status) => {

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
      GetQueryString(name){
         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = ('?'+window.location.href.split('?')[1]).substr(1).match(reg);
         if(r!=null)return  unescape(r[2]); return null;
      }
  	},
  	mounted() {
    	this.init()
      $(window).on('resize',()=>{
        this.winHeight = window.innerHeight - 220;     
      })
  	},
  	watch: {
  	  '$route' (to, from) {
  	    // 对路由变化作出响应...
        this.init()
  	  }
  	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#Customerconfirm .customer-wapper .el-tabs__item{color: #8492a6;}
#Customerconfirm .customer-wapper .el-tabs__item.is-active{color: #6699ee;}
#Customerconfirm .customer-wapper .el-tabs__active-bar{background-color:#6699ee;}
#Customerconfirm .customer-wapper .el-table td{border-right: none;}
#Customerconfirm .customer-wapper .el-table .is-center{border-left: 1px solid #e0e6ed;border-right: 1px solid #e0e6ed;}
#Customerconfirm .customer-wapper .el-table th{height: 36px;}
#Customerconfirm .customer-wapper .el-table--border th, .el-table td, .el-table th.is-leaf{border-right: 1px solid #e0e6ed;}
#Customerconfirm .customer-wapper .el-table--enable-row-hover .el-table__body tr:hover>td{background-color: #f7f7f9}
#Customerconfirm .customer-wapper .el-table__empty-text{font-size: 16px;color: #c0ccda;}


</style>
<style scoped>
.customer-wapper{
  padding: 16px 20px 0 20px;
  overflow: hidden;
}
.customer-wapper h1{
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  color: #475568;
  margin-bottom: 8px;
  line-height: 1.4;
}
.customer-wapper h1 .new-build-mail{
  cursor: pointer;
  float: right;
  color: rgb(102, 153, 238);
  font-size: 13px;
  font-weight: normal;
}
.customer-wapper h1 .daily_mr{
  margin-right: 10px;
}
.customer-wapper h1 .new-build-mail .addIcon{
  display: block;
  width: 13px;
  height: 13px;
  float: left;
  margin-right: 6px;
  margin-top: 2px;
  background-image:url(../assets/imgs/shareIcon/add_hover.svg);
}
/* 分页 */
.page{
  float: right;
}
/* 进度条 */
.progress_bar{
  width: 20px;
  height: 6px;
  border-radius: 100px;
  background: #e5e9f2;
  vertical-align: middle;
  float: left;
  margin-top: 10px;
}
.progress_bar .green{
  height: 6px;
  border-radius: 100px;
  background-color:#8dd256;
}
.progress_bar .red{
  height: 6px;
  border-radius: 100px;
  background-color:#f56c54;
}
.progress_bar .yellow{
  height: 6px;
  border-radius: 100px;
  background-color:#fec622;
}
.progress_text{
  font-size: 12px;
  color: #475669;
  float: left;
  margin-left: 5px;
}
</style>


