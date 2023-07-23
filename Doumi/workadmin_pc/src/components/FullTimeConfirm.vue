<template>
  	<div id="Customerconfirm" v-loading="evaluationLoading">
        <div class="customer-wapper">
            <h1>客户确认<div class="new-build-mail" @click="NewCreatMailClick" v-if="admins.category == false" ><i class="addIcon"></i>新建确认邮件</div></h1>
            <div class="mytabs">
                <el-tabs v-model="activeTabName" @tab-click="tabsClick">
                  <el-tab-pane :label="'待确认'+notConfirm" name="0">
                      <div class="notConfirmTableList" id="notConfirmId">
                          <el-table
                            tooltip-effect="dark"
                            style="width: 100%"
                            :height="winHeight"
                            :data="notConfirmTableData"
                            empty-text="暂无待确认邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                width="200"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="工资月份"
                                prop="month_date"
                                width="150"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                align='center'
                                label="操作">
                                <template slot-scope="scope">
                                  <el-button type="text" size="small" @click="deleteEmail(scope.row.confirm_id,scope.row.subject)">删除</el-button>
                                  <el-button type="text" size="small" @click="emailDoing(scope.row)" v-if="scope.row.action_no == 2">重发邮件</el-button>
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
                            empty-text="暂无已确认邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                width="200"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="工资月份"
                                prop="month_date"
                                width="150"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                align='center'
                                label="操作">
                                <template slot-scope="scope">
                                  <el-button type="text" size="small" @click="deleteEmail(scope.row.confirm_id,scope.row.subject)">删除</el-button>
                                  <el-button type="text" size="small" @click="emailDoing(scope.row)" v-if="scope.row.action_no == 2">重发邮件</el-button>
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
                            empty-text="暂无拒绝确认邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                width="200"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="工资月份"
                                prop="month_date"
                                width="150"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                align='center'
                                label="操作">
                                <template slot-scope="scope">
                                  <el-button type="text" size="small" @click="deleteEmail(scope.row.confirm_id,scope.row.subject)">删除</el-button>
                                  <el-button type="text" size="small" @click="emailDoing(scope.row)" v-if="scope.row.action_no == 2">重发邮件</el-button>
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
                            empty-text="暂无审核通过邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                width="200"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="工资月份"
                                prop="month_date"
                                width="150"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                align='center'
                                label="操作">
                                <template slot-scope="scope">
                                  <el-button type="text" size="small" @click="deleteEmail(scope.row.confirm_id,scope.row.subject)">删除</el-button>
                                  <el-button type="text" size="small" @click="emailDoing(scope.row)" v-if="scope.row.action_no == 2">重发邮件</el-button>
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
                            empty-text="暂无已支付邮件"
                            border>
                              <el-table-column
                                label="邮件主题"
                                prop="subject"
                                width="200"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="确认人"
                                prop="confirm_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="发送人"
                                prop="send_user_name"
                                show-overflow-tooltip
                                width="150">
                              </el-table-column>
                              <el-table-column
                                label="工资月份"
                                prop="month_date"
                                width="150"
                                show-overflow-tooltip>
                              </el-table-column>
                              <el-table-column
                                label="实发工资总额"
                                width="200">
                                  <template slot-scope="scope">
                                    <div>{{scope.row.total_real_wage/100}}</div>
                                  </template>
                              </el-table-column>
                              <el-table-column
                                align='center'
                                label="操作">
                                <template slot-scope="scope">
                                  <el-button type="text" size="small" @click="deleteEmail(scope.row.confirm_id,scope.row.subject)">删除</el-button>
                                  <el-button type="text" size="small" @click="emailDoing(scope.row)" v-if="scope.row.action_no == 2">重发邮件</el-button>
                                </template>
                              </el-table-column>
                          </el-table>
                      </div>
                  </el-tab-pane>
                </el-tabs>
                <!-- 分页组件 -->
                <div class="page" v-if="total_num != 0">
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

        <!-- 重新发送 -->
        <div class="export-dialog checkconfirm">
            <el-dialog
                title="提示"
                top="35%"
                :visible.sync="showsetdel"
                v-loading="evaluationLoading"
                @close="btnDisable = showsetdel = false"
                size="tiny">
                    <span>是否重新发送确认邮件给{{confirm_user_email}}</span>
                    <span slot="footer" class="dialog-footer">
                    <el-button class="cancel" @click="btnDisable = showsetdel = false">取 消</el-button>
                    <el-button type="primary" class="confirm" @click="confirSendEmail">确 定</el-button>
                </span>
            </el-dialog>
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
          showsetdel:false,
          evaluationLoading:false,
          btnDisable:false,
          sendBeginTime:0,
          admins:{
            category:false
          },
          team_id:'',
          project_id:'',
          winHeight:'',
          activeTabName:'0',  //默认当前tab
          currTabActive:'',
          notConfirm:'', //待确认num
          confirm:'',  //已确认num
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
          winHeight:'',
          confirm_user_email:'',
          confirm_id:''
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
      confirSendEmail(){
        this.showsetdel = false;
        this.evaluationLoading = true;
        util.ajax({
          url: '/ss/confirm/mail/resend',
          type:'POST',
          data: {
              confirm_id:this.confirm_id,
              team_id:this.team_id,
              project_id:this.project_id,
          },
          success: (res) => {
              this.evaluationLoading = false;
              this.showsetdel = false;
              if(res && res.errno == 0){
                this.sendBeginTime = +(new Date())
                this.$message({
                  showClose: true,
                  message: '重新发送成功',
                  type: 'success'
                });
              }else{
                this.$message({
                  showClose: true,
                  message: res.errmsg,
                  type: 'warning'
                });
              }
          },
          error: (xhr, status) => {
            this.showsetdel = false;
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
            this.evaluationLoading = false;
            
          },
          noNetwork: () => {
            this.showsetdel = false;
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
            this.evaluationLoading = false;
          }
      })
      },
      emailDoing(row){
        this.confirm_user_email = row.confirm_user_email
        this.confirm_id = row.confirm_id
        let newSendTime = +(new Date());
        if(newSendTime - this.sendBeginTime < 180000 ){
          this.$message({
            showClose: true,
            message: '操作过于频繁，请于3分钟后再次尝试重新发送',
            type: 'warning'
          });
        }else{
          this.showsetdel = true;
        }
      },
      //获取表格数据列表
      getData(){
        this.evaluationLoading = true
        setTimeout(() => {
          $('.el-table__body-wrapper').scrollTop(0)
        })
        let _data = '';
        _data = {
          team_id:this.team_id,
          project_id:this.project_id,
          status:this.activeTabName,
          page:this.page_no,
          page_size:20
        }
        util.ajax({
          url:'/ss/confirm/list',
          type:'POST',
          data:_data,
          timeout:10000,
          success:(obj) => {
              // console.log(obj)
              this.evaluationLoading = false
              util.setLocalStorage('activeTabName','')
              if(obj && obj.errno == 0){
                  this.total_num = obj.data.total_num || 0
                  this.notConfirm = '('+obj.data.not_confirmed+')'
                  this.confirm = '('+obj.data.confirmed+')'
                  this.refuseConfirm = '('+obj.data.pending+')'
                  this.throughConfirm = '('+obj.data.check_pass+')'
                  this.alreadyPay = '('+ (obj.data.already_pay || 0) +')'
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
            this.evaluationLoading = false
            util.setLocalStorage('activeTabName','')
          },
          noNetwork: () => {
            this.evaluationLoading = false
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
      //删除
      deleteEmail(confirm_id,title){
        this.$confirm('确认删除“邮件主题'+title+'”？', '确认删除邮件', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        }).then(() => {
          // 删除邮件
          let data = {
            team_id:this.team_id,
            project_id:this.project_id,	
            confirm_id:confirm_id
          }
          util.ajax({
          url:'/ss/confirm/delete',
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
      },
      //前往新建确认邮件页面
      NewCreatMailClick(){
        this.$router.replace('fullTimeCreatMail')
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
                })
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

#Customerconfirm .checkconfirm .el-dialog--tiny{
  width: 400px;
}
#Customerconfirm .checkconfirm .el-dialog__header{
    padding: 24px 20px 0;
}
#Customerconfirm .checkconfirm  .el-dialog__body{
  padding: 30px 40px;
}
.alertjected .el-dialog__body{
  border-bottom:1px solid #e0e6ed
  
}
#Customerconfirm .checkconfirm .el-form-item__content{
  width: 246px;
}
#Customerconfirm .checkconfirm  .el-form-item{
  margin-bottom: 0;
}
#Customerconfirm .checkconfirm  .el-dialog__footer{
  padding: 16px 20px;
}



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


