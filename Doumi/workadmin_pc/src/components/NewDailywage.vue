<template>
  <div id="Newcreatmail">
    <div class="c-top">
      <breadcrumb>
        <router-link to="customerconfirmpage" replace>客户确认</router-link>
        <router-link to="" v-if="confirm_id && confirm_id != ''">修改日薪确认</router-link>
        <router-link to="" v-else>新建日薪确认</router-link>
      </breadcrumb>
    </div>
    <div class="newCreatCount">
      <div class="steps">
        <el-steps :active="stepActive" align-center>
          <el-step title="填写内容"></el-step>
          <el-step title="核对数据"></el-step>
        </el-steps>
      </div>
      <!-- 第一步：填写内容 -->
      <div class="step1_form" v-show="step1_form">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px" label-position="left">
          <el-form-item label="考勤周期" prop="weektime">
            <el-date-picker v-model="ruleForm.weektime" type="daterange" value-format="yyyy-MM-dd" style="width:50%;" placeholder="请选择">
            </el-date-picker>
            <span class="weekTimeTips">{{dateTips}}</span>
          </el-form-item>
          <el-form-item label="邮件主题" prop="mailTheme">
            <el-input v-model="ruleForm.mailTheme" style="width:50%;" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="margin-top: 10px;" @click="next('ruleForm')">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 第二步：核对数据 -->
      <div class="step2_form" v-show="step2_form">
        <div class="myUploadDataList">
          <!--正确形式的列表展示-->
          <div class="successDataList">
            <div class="myTop">
              <div class="successtop" v-if="checkWork">
                <h3>获取成功</h3>
                <p>打卡率：<em>{{successObj.sum.punch_rate}}</em>&nbsp;&nbsp;考勤人数：<em>{{successObj.sum.man_number}}</em>人&nbsp;&nbsp;考勤人天：<em>{{successObj.sum.attend_man_day}}</em>天</p>
              </div>
              <div class="errortop" v-else>
                <h3>获取失败，无对应考勤数据</h3>
              </div>
            </div>
            <div style="display:flex;justify-content: space-between;margin:0 0 5px 0">
              <div style="width:300px">
                人员：<el-input v-model="search_val" placeholder="姓名/手机号" size="small" style="width:170px;margin:0 20px 0 0;"></el-input>
                <el-button type="primary" size="small" @click="onSubmit">搜索</el-button>
              </div>
              <!-- 分页组件 -->
              <div class="page" v-if="numtotal != 0" style="margin:3px 0 0 10px;">
                  <el-pagination @current-change="handleCurrentPageChange" :current-page.sync="currentPage" :page-size="page_size" layout="total, prev, pager, next" :total="numtotal">
                  </el-pagination>
              </div>
            </div>
            <div class="successTable">
              <el-table tooltip-effect="dark" style="width: 100%" :height="winHeight" :data="successObj.success_list" show-summary :summary-method="getSummaries" border>
                <el-table-column label="姓名" width="78" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <!-- <span :class="{'weight':scope.row.name == '合计'}">{{scope.row.name}}</span> -->
                    {{scope.row.user_name}}
                  </template>
                </el-table-column>
                <el-table-column
                  label="人员来源"
                  label-class-name="border"
                  min-width="120"
                  v-if="is_nx_project"
                >
                  <template slot-scope="scope">
                    {{scope.row.worker_source}}
                  </template>
                </el-table-column>
                <el-table-column label="手机号" width="115" prop="mobile">
                  <template slot-scope="scope">
                    <el-icon name="mobile"></el-icon>
                    <el-popover placement="top" title="" width="150" trigger="hover">
                      <span style="margin-left:35px">{{scope.row.mobile}}</span>
                      <span slot="reference">{{scope.row.mobile.substr(0,3)+"****"+scope.row.mobile.substr(7)}}</span>
                    </el-popover>
                  </template>
                </el-table-column>
                <el-table-column label="工作日期" width="108" prop="work_date" show-overflow-tooltip>
                </el-table-column>
                <el-table-column width="100" label="城市" prop="job_city_name" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="岗位" width="110" prop="job_station_name">
                </el-table-column>
                <!-- <el-table-column label="出勤天数" width="100" prop="attend_day_counts">
                </el-table-column> -->
                <el-table-column label="实发工资" width="100" prop="real_wage" show-overflow-tooltip align="center">
                </el-table-column>
                <el-table-column label="服务费" width="100" prop="service_fee" show-overflow-tooltip align="center">
                </el-table-column>
                <el-table-column label="税费" width="100" prop="taxation" show-overflow-tooltip align="center">
                </el-table-column>
                <el-table-column label="总确认费用" width="100" prop="confirm_cost" show-overflow-tooltip align="center">
                </el-table-column>
                <el-table-column label="打卡情况" prop="is_punch" show-overflow-tooltip align="center">
                  <template slot-scope="scope">
                    <el-tag :type=" +scope.row.is_punch == 1 ? 'success' : ''" close-transition>{{+scope.row.is_punch == 1 ? '已打卡' : '未打卡'}}</el-tag>
                  </template>
                </el-table-column>
                <!-- <el-table-column label="打卡天数" width="100" prop="clock_sum" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="未打卡天数" width="100" prop="not_clock_sum" show-overflow-tooltip>
                </el-table-column> -->
              </el-table>
              <el-button style="margin-top: 10px;" @click="prev">上一步</el-button>
              <el-button type="primary" style="margin-top: 10px;" @click="submitFun">确定提交</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="el-loading-mask custom-mask" v-show="loading">
      <div class="el-loading-spinner">
        <svg viewBox="25 25 50 50" class="circular">
          <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
        </svg>
        <p class="el-loading-text">正在提交，请等待</p>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
import breadcrumb from '@/components/common/breadcrumb'
let sumDays = ''
export default {
  name: 'Newcreatmail',
  components: {
    breadcrumb
  },
  data() {
    // var weektimeReg = (rule, value, callback) => {
    //   if (!value || value[0] == null) {
    //     return callback(new Error('请选择考勤周期'));
    //   } else {
    //     sumDays = util.DateDiff(util.formatData1(value[0]), util.formatData1(value[1]))
    //     console.log(sumDays)
    //     if (sumDays > 31) {
    //       return callback(new Error('考勤周期不能超过31天'));
    //     } else {
    //       callback();
    //     }
    //   }
    // };
    var mailThemeReg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入邮件主题'));
      } else {
        callback();
      }
    };
    return {
      team_id: '',
      project_id: '',
      winHeight: '',
      stepActive: 1, // 第一步默认贞
      step1_form: true, // 第一步：填写内容
      step2_form: false,  //第二步：核对数据
      checkWork: false,
      ruleForm: {  // 第一步：form表单数据
        weektime: [],
        mailTheme: '',
      },
      //第一步：form表单相关校验
      rules: {
        weektime: [
          // { validator: weektimeReg, trigger: 'change' }
        ],
        mailTheme: [
          { validator: mailThemeReg, trigger: 'change' }
        ]
      },
      //第二步：上传之后列表--正确展示
      successObj: {
        success_list: [],
        sum: {}
      },
      currentPage: 1,
      numtotal: 0,
      page_size: 10,
      loading:false,
      search_val: '',
      is_nx_project: false,
      dateTips: ''
    }
  },
  methods: {
    init() {
      this.winHeight = window.innerHeight - 340;
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      // console.log('this.team_id===', this.team_id)
      // console.log('this.project_id===', this.project_id)
      this.confirm_id = document.URL.split('=')[1];
      this.getProjectType();
    },

    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总价';
          return;
        }
        // const values = data.map(item => Number(item[column.property]));
        //if (!values.every(value => isNaN(value)) && index != 1 && index != columns.length - 1) {
          // sums[index] = values.reduce((prev, curr) => {
          //   const value = Number(curr);
          //   if (!isNaN(value)) {
          //     return prev + curr;
          //   } else {
          //     return prev;
          //   }
          // }, 0);
          // sums[index] += ' 元';
          // sums[index];
        // } 
          // else if (index == columns.length - 1) {
          //   sums[index] = '100%已打卡';
          // }
          if(column.property && column.property == 'real_wage') {
            sums[index] = this.successObj.sum.total_real_wage;
          }
          if(column.property && column.property == 'service_fee') {
            sums[index] = this.successObj.sum.total_service_fee;
          }
          if(column.property && column.property == 'taxation') {
            sums[index] = this.successObj.sum.total_taxation;
          }
          if(column.property && column.property == 'confirm_cost') {
            sums[index] = this.successObj.sum.total_confirm_cost;
          }
          if(column.property && column.property == 'is_punch') {
            sums[index] = this.successObj.sum.punch_rate + '已打卡';
          }
      });
      return sums;
    },
    /**
  *
  * 第三步：发送预览
  *
  ***/

    //第二步：核对数据  上一步按钮操作
    prev() {
      this.stepActive--
      if (this.stepActive < 1) this.stepActive = 1;
      this.step1_form = true
      this.step2_form = false
      this.successObj.success_list = 0;
      this.numtotal = 0;
      this.search_val = '';
    },
    //第二步：核对数据  下一步按钮操作
    // next_success() {
    //   if (this.stepActive > 2) this.stepActive = 1;
    // },
    //第一步：填写内容  下一步按钮操作
    next(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.stepActive++
          this.step1_form = false
          this.step2_form = true
          // if (this.stepActive++ > 2) this.stepActive = 1;
          this.getDailyList()
        } else {
          console.log('error submit!!');
          return false;
        }
      })
    },
    onSubmit() {
      this.currentPage = 1;
      this.getDailyList();
    },
    getDailyList() {
      util.ajax({
        url: '/confirm/list/daily',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          start_date: util.formatData1(this.ruleForm.weektime[0]),
          end_date: util.formatData1(this.ruleForm.weektime[1]),
          page_no: this.currentPage,
          page_size: this.page_size,
          search: this.search_val
        },
        timeout: 10000,
        success: (obj) => {
          console.log('obj===', obj)
          if (obj.data.list && obj.data.list.length > 0) {
            this.checkWork = true;
          } else {
            this.checkWork = false;
          }
          if(obj.errno == '0') {
            this.successObj.success_list = obj.data.list;
            this.successObj.sum = obj.data.sum;
            this.numtotal = obj.data.total_row;
            this.deadline = obj.data.deadline;
          } else if (obj.errno == 30003) {
            this.successObj.success_list = obj.data;
            this.numtotal = 0;
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '服务器异常',
            type: 'warning'
          });
        },
        noNetwork: () => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    submitFun() {
      if(this.successObj.success_list.length == 0) {
        this.$message({
          showClose: true,
          message: '无考勤数据，无法提交',
          type: 'warning'
        });
        return
      }
      this.loading = true;
      util.ajax({
        url: '/confirm/create/daily',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          start_date: util.formatData1(this.ruleForm.weektime[0]),
          end_date: util.formatData1(this.ruleForm.weektime[1]),
          deadline: this.deadline,
          title: this.ruleForm.mailTheme
        },
        timeout: 10000,
        success: (res) => {
          this.loading = false;
          console.log('res===', res)
          this.$router.push('customerconfirmpage')
          util.setLocalStorage('activeTabName', '1');
        },
        error: (xhr, status) => {
          this.loading = false;
          this.$message({
            showClose: true,
            message: '服务器异常',
            type: 'warning'
          });
        },
        noNetwork: () => {
          this.loading = false;
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    handleCurrentPageChange(val) {
      console.log('val===', val)
      this.currentPage = val
      this.getDailyList()
    },
    getProjectType() {
      util.ajax({
        url: "/project/overview",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
        },
        success: (res) => {
          //console.log(res)
          if (res && res.errno == 0) {
            if(res.data.list.no_confirmattendance_date) {
              this.dateTips = res.data.list.no_confirmattendance_date;
            }
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {},
      });
    },
  },
  mounted() {
    this.init();
    this.is_nx_project = JSON.parse(window.localStorage.getItem('isNxProject'));
    console.log('this.is_nx_project===daily', this.is_nx_project)
    $(window).on('resize', () => {
      this.winHeight = window.innerHeight - 350;
    })
  },
  watch: {
    '$route'(to, from) {
      // 对路由变化作出响应...
      this.init()
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#Newcreatmail .newCreatCount .el-step__head.is-text.is-finish {
  background-color: #6699ee;
  border-color: #6699ee;
  font-weight: bold;
  font-size: 14px;
}
#Newcreatmail .newCreatCount .el-step__title.is-finish {
  color: #6699ee;
  font-size: 12px;
  font-weight: bold;
  margin-left: 5px;
}
#Newcreatmail .newCreatCount .el-step__head.is-text.is-process {
  background-color: #c0ccda;
  border-color: #c0ccda;
  font-weight: bold;
  font-size: 14px;
}
#Newcreatmail .newCreatCount .el-step__title.is-process {
  font-weight: bold;
  color: #99a9bf;
  font-size: 12px;
  margin-left: 5px;
}
#Newcreatmail .newCreatCount .el-step__head.is-text.is-wait {
  border-color: #c0ccda;
  color: #c0ccda;
  font-weight: bold;
  font-size: 14px;
}
#Newcreatmail .newCreatCount .el-step__title.is-wait {
  font-weight: bold;
  color: #99a9bf;
  font-size: 12px;
  margin-left: 5px;
}
#Newcreatmail .newCreatCount .step1_form .el-icon-loading {
  display: none;
}

#Newcreatmail .newCreatCount .step2_form .el-table th {
  height: 36px;
}
#Newcreatmail .newCreatCount .step2_form .el-table--border th,
.el-table td,
.el-table th.is-leaf {
  border-right: 1px solid #e0e6ed;
}
#Newcreatmail .newCreatCount .step2_form .el-progress-bar__inner {
  background-color: #6699ee;
}
#Newcreatmail
  .newCreatCount
  .step2_form
  .el-table--enable-row-hover
  .el-table__body
  tr:hover
  > td {
  background-color: #f7f7f9;
}

/* 第二步：核对数据--上传 */
#Newcreatmail .newCreatCount .step2_form .upload {
  width: 70%;
}
#Newcreatmail .newCreatCount .step2_form .el-upload {
  width: 100%;
}
#Newcreatmail .newCreatCount .step2_form .el-upload-dragger {
  width: 100%;
  height: 220px;
  border-color: #e0e6ed;
  background-color: #f7f9fc;
}
#Newcreatmail .newCreatCount .step2_form .el-upload-dragger .el-icon-upload {
  margin: 53px 0 20px;
}
#Newcreatmail .newCreatCount .step2_form .el-upload-dragger .el-upload__text {
  color: #99a9bf;
}
#Newcreatmail
  .newCreatCount
  .step2_form
  .el-upload-dragger
  .el-upload__text
  em {
  color: #6699ee;
  font-size: 14px;
}
#Newcreatmail
  .newCreatCount
  .step2_form
  .el-upload-dragger
  .el-upload__text
  em:active {
  color: #517ed6;
}
#Newcreatmail .newCreatCount .step2_form .el-upload__tip {
  text-align: center;
  color: #99a9bf;
  font-size: 12px;
  margin-top: 16px;
}
#Newcreatmail .newCreatCount .step2_form .el-upload__tip a {
  color: #6699ee;
  font-size: 12px;
}
#Newcreatmail .newCreatCount .step2_form .el-upload__tip a:active {
  color: #517ed6;
}
#Newcreatmail .newCreatCount .step2_form .uploadExplain {
  margin-top: 40px;
}
#Newcreatmail .newCreatCount .step2_form .uploadExplain h2 {
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  color: #5e6d82;
  margin-bottom: 10px;
}
#Newcreatmail .newCreatCount .step2_form .uploadExplain p {
  font-size: 14px;
  line-height: 1.71;
  text-align: left;
  color: #99a9bf;
}
#Newcreatmail .newCreatCount .step2_form .uploadExplain img {
  margin-top: 16px;
}

#Newcreatmail .newCreatCount .step2_form .el-upload-list {
  display: none;
}
#Newcreatmail .newCreatCount .step2_form .el-table--border td {
  border-right: none;
}

/* 邀请加入 */
#Newcreatmail .dialog-invit .el-dialog--tiny {
  width: 470px;
}
#Newcreatmail .dialog-quit .el-dialog--tiny {
  width: 420px;
}
#Newcreatmail .dialog-quit .dialogQuitform p {
  font-size: 14px;
  color: #8492a6;
  letter-spacing: 0;
  margin-bottom: 12px;
}
#Newcreatmail .dialog-quit .dialogQuitform p span {
  color: #ffaa00;
  font-weight: bold;
}
#Newcreatmail .dialog-quit .dialogQuitform .el-table th {
  height: 36px;
}
#Newcreatmail
  .dialog-quit
  .dialogQuitform
  .el-table--enable-row-hover
  .el-table__body
  tr:hover
  > td {
  background-color: #f7f7f9;
}
#Newcreatmail .dialog-quit .el-dialog__footer {
  padding: 15px 20px 17px;
}
#Newcreatmail .dialog-invit .el-dialog__body {
  padding: 30px 40px 50px 40px;
}

#Newcreatmail .dialog-quit .el-dialog__body {
  padding: 30px 40px 25px 40px;
  border-bottom: 1px solid #e5ebf1;
}
#Newcreatmail .dialog-invit .el-form-item {
  margin-left: 2px;
}
#Newcreatmail .dialog-invit h3 {
  font-size: 14px;
  line-height: 1.14;
  color: #1f2d3d;
  text-align: center;
  margin-bottom: 8px;
}
#Newcreatmail .dialog-invit .ewm {
  width: 225px;
  height: 200px;
  margin: 0 auto;
  /*margin-bottom: 32px;*/
}
#Newcreatmail .dialog-invit .ewm dl dt {
  width: 160px;
  height: 160px;
  background: #eeeeee;
  margin: 0 auto;
  margin-bottom: 8px;
}
#Newcreatmail .dialog-invit .ewm dl dt #canvas {
  width: 160px !important;
  height: 160px !important;
}
#Newcreatmail .dialog-invit .ewm dl dd {
  font-size: 13px;
  line-height: 1.23;
  color: #8492a6;
  text-align: center;
}
#Newcreatmail .dialog-invit .el-form-item__label {
  font-size: 14px;
  color: #8492a6;
}
#Newcreatmail .dialog-invit .el-form-item__content {
  width: 290px;
  position: relative;
}
#Newcreatmail .dialog-invit .myinput .btn2 {
  position: absolute;
  right: 0px;
  top: 27px;
}
#Newcreatmail .dialog-invit .myinput {
  position: relative;
}
#Newcreatmail .dialog-invit .myinput label {
  font-size: 14px;
  color: #8492a6;
}
#Newcreatmail .dialog-invit .myinput input {
  margin-top: 12px;
  height: 36px;
  line-height: 36px;
  border: 1px solid #e0e6ed;
  width: 260px;
  padding: 0 15px;
  color: #1f2d3d;
  font-size: 14px;
  border-radius: 2px;
}
#Newcreatmail .dialog-invit .myinput input:hover {
  border-color: #c0ccda;
}
#Newcreatmail .dialog-invit .myinput input:focus {
  border-color: #6699ee;
}
#Newcreatmail .invitmember-btn,
.copybtn {
  margin-left: 0px !important;
  width: 88px !important;
}

/* 富文本编辑 */
#Newcreatmail .newCreatCount .step1_form .editor_div {
  width: 67.7%;
  margin-bottom: 5px;
  position: relative;
}
#Newcreatmail .newCreatCount .step1_form #editor {
  width: 100%;
}
#Newcreatmail .newCreatCount .step1_form #editor .w-e-toolbar {
  background-color: #eff1f3 !important;
  border: 1px solid #e0e6ed !important;
  height: 32px;
  line-height: 22px;
}
#Newcreatmail .newCreatCount .step1_form #editor .w-e-text-container {
  border: 1px solid #e0e6ed !important;
  border-top: none !important;
  height: 208px !important;
}
#Newcreatmail .newCreatCount .step1_form #editor .w-e-text p {
  font-size: 14px;
}
#Newcreatmail .newCreatCount .step1_form #editor .w-e-text p.placeholder_txt {
  color: #99a9bf !important;
}
#Newcreatmail .w-e-toolbar .w-e-menu i {
  color: #99a9bf;
}
#Newcreatmail .w-e-toolbar .w-e-menu:hover i {
  color: #6699ee;
}
#Newcreatmail .w-e-toolbar .w-e-active i {
  color: #517ed6;
}
#Newcreatmail .w-e-toolbar .w-e-active:hover i {
  color: #6699ee;
}
#Newcreatmail .w-e-text-container .w-e-panel-container {
  left: 23%;
}
#Newcreatmail
  .w-e-text-container
  .w-e-panel-container
  .w-e-panel-tab-content
  .w-e-button-container
  button {
  color: #6699ee;
}

#Newcreatmail .w-e-text-container .w-e-panel-container {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
}

.mysend-item {
  position: relative;
}
.el-picker-panel {
  z-index: 99999 !important;
}

#Newcreatmail .sendPreview .send_content .s_text table {
  margin: 16px 0 0 0;
}
#Newcreatmail .sendPreview .send_content .s_text tbody {
  border: 1px solid #e0e6ed;
}
#Newcreatmail .sendPreview .send_content .s_text tbody tr {
  border-bottom: 1px solid #e0e6ed;
}
#Newcreatmail .sendPreview .send_content .s_text tbody td {
  border-right: 1px solid #e0e6ed;
  padding: 7.5px 0;
}
#Newcreatmail .sendPreview .send_content .s_text tbody th {
  border-right: 1px solid #e0e6ed;
  padding: 7.5px 0;
}
#Newcreatmail .step3_form .el-loading-mask {
  width: 70%;
}

.placeholder_tip {
  width: 90%;
  border: none;
  outline: none;
  height: 30px;
  line-height: 30px;
  margin-left: 10px;
  position: absolute;
  left: 0px;
  top: 35px;
}
.upload-img p {
  font-size: 14px;
  color: #99a9bf;
}
.upload-imgmain {
  margin-top: 14px;
}
.upload-imgadd {
  position: relative;
  height: 140px;
  width: 140px;
  border: solid 1px #e0e6ed;
  cursor: pointer;
}
.upload-imgadd i {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  height: 140px;
  width: 140px;
  background: url(../assets/imgs/add_imgison.svg) no-repeat;
  background-size: 100% 100%;
}
.upload-imginput {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
  opacity: 0;
}

.upload-imgmain .el-upload--picture-card {
  height: 140px;
  width: 140px;
  border: none;
  border-radius: 2px;
}
.upload-imgmain .el-upload--picture-card:hover {
  border-color: #e0e6ed;
}
.upload-imgmain .el-icon-plus:before {
  content: '';
}
.upload-imgmain .el-icon-plus {
  display: block;
  height: 140px;
  width: 140px;
  background: url(../assets/imgs/add_imgison.svg) no-repeat;
  background-size: 100% 100%;
  border: none;
}
.upload-imgmain .el-upload-list--picture-card .el-upload-list__item {
  width: 140px;
  height: 140px;
  border: none;
  border-radius: 2px;
  margin: 0 20px 0 0;
}
.upload-imgmain .el-icon-check:before {
  content: '';
}
.upload-imgmain
  .el-upload-list--picture-card
  .el-upload-list__item-status-label {
  height: 0;
  width: 0;
}
.upload-imgmain .el-icon-delete2 {
  position: relative;
  display: block;
  width: 22px;
  height: 24px;
  background: url(../assets/imgs/delete_imgicon.svg) no-repeat;
  background-size: 100% 100%;
  margin: 47px auto 0;
}
.upload-imgmain .el-icon-delete2:before {
  display: block;
  position: absolute;
  bottom: -21px;
  left: -59px;
  width: 140px;
  font-size: 14px;
  text-align: center;
  content: '删除图片';
}
.upload-imgmain .deleteUptext {
  font-size: 14px;
  color: #fff;
  text-align: content;
}

.el-form-item.confirm_method {
  margin-bottom: 13px;
}
.confirm_method .el-radio__label {
  padding-left: 10px;
}
.confirm_method .el-radio + .el-radio {
  margin-left: 32px;
}
</style>
<style scoped>
#Newcreatmail {
  padding: 0 20px;
}
#Newcreatmail .c-top {
  height: 54px;
  line-height: 20px;
  border-bottom: 1px solid #e0e6ed;
  margin-bottom: 30px;
}
.newCreatCount .steps {
  margin-left: 10px;
  /* margin-bottom: 20px; */
}

/* 填写内容 */
.step1_form {
  padding: 0 4px;
}

/* 抄送人 */
#Newcreatmail .newCreatCount .step1_form .senddiv {
  width: 65.9%;
  height: auto;
  padding: 0px 0.8%;
  border: 1px solid #e0e6ed;
  border-radius: 2px;
  overflow: hidden;
  float: left;
  position: relative;
}
#Newcreatmail .newCreatCount .step1_form .senddiv_hover {
  border-color: #c0ccda;
}
#Newcreatmail .newCreatCount .step1_form .border_color {
  border-color: #6699ee;
}
#Newcreatmail .newCreatCount .step1_form .senddiv .addr_text {
  float: left;
  overflow: hidden;
  outline: none;
  height: 34px;
}
#Newcreatmail .newCreatCount .step1_form .senddiv .addr_text input {
  -webkit-appearance: none;
  border: none;
  outline: none;
  font-size: 14px;
}
#Newcreatmail .newCreatCount .step1_form .senddiv .mytags {
}
#Newcreatmail .newCreatCount .step1_form .senddiv .mytags .emailTxt {
  float: left;
  padding: 0 6px;
  height: 26px;
  line-height: 26px;
  margin-right: 5px;
  background-color: #f3f7ff;
  border: solid 1px #d4e4ff;
  margin-top: 3px;
  font-size: 14px;
  color: #1f2d3d;
  border-radius: 2px;
}
#Newcreatmail .newCreatCount .step1_form .senddiv .mytags .emailTxt_error {
  float: left;
  padding: 0 6px;
  height: 26px;
  line-height: 26px;
  margin-top: 5px;
  font-size: 14px;
  color: #1f2d3d;
}
#Newcreatmail .newCreatCount .step1_form .error_border {
  border: 1px solid #ff6600;
  margin-bottom: 6px;
}
#Newcreatmail .newCreatCount .step1_form .error_border_txt {
  color: #ff6600;
  font-size: 12px;
  position: absolute;
  left: 0px;
  bottom: -23px;
}
.emailinput::-webkit-input-placeholder {
  color: #99a9bf;
  font-size: 14px;
}
.emailinput:-moz-placeholder {
  color: #99a9bf;
  font-size: 14px;
}
.emailinput::-moz-placeholder {
  color: #99a9bf;
  font-size: 14px;
}
.emailinput:-ms-input-placeholder {
  color: #99a9bf;
  font-size: 14px;
}

.placeholder_tip::-webkit-input-placeholder {
  color: #99a9bf;
  font-size: 14px;
}
.placeholder_tip:-moz-placeholder {
  color: #99a9bf;
  font-size: 14px;
}
.placeholder_tip::-moz-placeholder {
  color: #99a9bf;
  font-size: 14px;
}
.placeholder_tip:-ms-input-placeholder {
  color: #99a9bf;
  font-size: 14px;
}

/* 核对数据---错误列表展示 */
.errorDataList .myTop {
  margin-bottom: 4px;
  height: 32px;
}
.errorDataList .myTop h2 {
  height: 32px;
  padding-left: 26px;
  line-height: 32px;
  font-size: 14px;
  color: #8492a6;
  float: left;
  background: url(../assets/imgs/mail/error_tip.svg) no-repeat left center;
}
.errorDataList .myTop h2 span {
  font-weight: 600;
  color: #5e6d82;
}
.isJoinButton {
  font-size: 12px;
  color: #6699ee;
  /*margin-left: 16px;*/
}
.errorDataList .myTop h2 #upfile {
  float: right;
  margin-left: 7px;
  margin-top: 3px;
}
.errorDataList .myTop h2 a.file {
  position: relative;
  display: block;
  float: right;
  width: 64px;
  height: 24px;
  line-height: 24px;
  background: #ffffff;
  border: 1px solid #6699ee;
  overflow: hidden;
  color: #6699ee;
  text-decoration: none;
  text-indent: 0;
  border-radius: 2px;
  font-size: 12px;
  text-align: center;
  margin-left: 10px;
}
.errorDataList .myTop {
  content: '';
  display: block;
  clear: both;
}
.errorDataList .myTop h2 a.file:hover {
  border: 1px solid #8bb1f2;
  color: #8bb1f2;
}
.errorDataList .myTop h2 a.file:active {
  border: 1px solid #517ed6;
  color: #517ed6;
}
.errorDataList .myTop h2 a.file input {
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
}

.successDataList .myTop {
  height: 32px;
  margin-bottom: 4px;
}
.successDataList .myTop:after {
  content: '';
  display: block;
  clear: both;
}
.successtop {
  display: block;
}
.successDataList .myTop .successtop h3 {
  height: 32px;
  padding-left: 26px;
  line-height: 32px;
  font-size: 14px;
  color: #8492a6;
  float: left;
  background: url(../assets/imgs/mail/success_tip.svg) no-repeat left center;
}
.successDataList .myTop .errortop h3 {
  height: 32px;
  padding-left: 26px;
  line-height: 32px;
  font-size: 14px;
  color: #8492a6;
  float: left;
  background: url(../assets/imgs/mail/error_tip.svg) no-repeat left center;
}
.successDataList .myTop p {
  float: left;
  font-size: 14px;
  color: #8492a6;
  line-height: 32px;
  margin-left: 24px;
}
.successDataList .myTop p em {
  font-weight: 600;
  color: #5e6d82;
  font-size: 14px;
}
.successDataList .myTop #upfile2 {
  float: left;
  margin-left: 7px;
  margin-top: 3px;
}
.successDataList .myTop a.file {
  position: relative;
  display: block;
  float: right;
  width: 64px;
  height: 24px;
  line-height: 24px;
  background: #ffffff;
  border: 1px solid #6699ee;
  overflow: hidden;
  color: #6699ee;
  text-decoration: none;
  text-indent: 0;
  border-radius: 2px;
  font-size: 12px;
  text-align: center;
  margin-left: 10px;
}
.successDataList .myTop a.file:hover {
  border: 1px solid #8bb1f2;
  color: #8bb1f2;
}
.successDataList .myTop a.file:active {
  border: 1px solid #517ed6;
  color: #517ed6;
}
.successDataList .myTop a.file input {
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
}
.clockOk {
  display: block;
  width: 52px;
  height: 24px;
  line-height: 24px;
  border-radius: 2px;
  background-color: rgba(99, 180, 93, 0.07);
  border: solid 1px rgba(99, 180, 93, 0.35);
  font-size: 12px;
  text-align: center;
  color: #70cb6a;
}
.clockNo {
  display: block;
  width: 52px;
  height: 24px;
  line-height: 24px;
  border-radius: 2px;
  background-color: rgba(242, 106, 75, 0.05);
  border: solid 1px rgba(242, 106, 75, 0.27);
  font-size: 12px;
  text-align: center;
  color: #f58369;
}
.weight {
  font-weight: bold;
  color: #475669;
  font-size: 14px;
}

/* 第三步：发送预览 */
/*.step1_form, .step2_form, .step3_form{
  margin-bottom: 50px;
}*/
.step1_form,
.step3_form {
  margin-bottom: 50px;
}
.sendPreview h1 {
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  color: #475669;
  margin-bottom: 16px;
  width: 68%;
  line-height: 24px;
}
.sendPreview h2 {
  font-size: 13px;
  line-height: 1.54;
  text-align: left;
  color: #99a9bf;
}
.sendPreview h2 span {
  font-size: 13px;
  line-height: 1.54;
  text-align: left;
  color: #475669;
}
.sendPreview .send_content {
  width: 66.7%;
  padding: 20px 20px 20px 20px;
  background-color: #f7f9fc;
  border-radius: 10px;
  margin-bottom: 30px;
  margin-top: 24px;
  overflow: auto;
}
.sendPreview .send_content h3 {
  font-size: 14px;
  text-align: left;
  color: #475669;
  margin-bottom: 16px;
}
.sendPreview .send_content .s_text p {
  font-size: 14px;
  line-height: 1.71;
  text-align: left;
  color: #475669;
}
.sendPreview .send_content .s_text {
  font-size: 14px;
  line-height: 1.71;
  color: #475669;
}

.sendPreview .download {
  width: 64.8%;
  padding: 0 20px 0 40px;
  height: 42px;
  line-height: 42px;
  border-radius: 6px;
  background-color: #ffffff;
  border: solid 1px #edf1f5;
  margin-bottom: 16px;
}
.sendPreview .download h4 {
  float: left;
  font-size: 12px;
  font-weight: 500;
  color: #5e6d82;
  margin-right: 60px;
  position: relative;
}
.sendPreview .download h4 i {
  display: block;
  width: 15px;
  height: 13px;
  background: url(../assets/imgs/mail/fujian.svg);
  position: absolute;
  left: -22px;
  top: 14px;
}
.sendPreview .download h5 {
  font-size: 14px;
  text-align: left;
  color: #5e6d82;
  position: relative;
  float: left;
}
.sendPreview .download h5 i {
  display: block;
  width: 15px;
  height: 16px;
  background: url(../assets/imgs/EXCEL_icon.svg);
  position: absolute;
  left: -23px;
  top: 13px;
}
.sendPreview .download a {
  float: right;
  font-size: 12px;
  font-weight: 500;
  color: #6699ee;
  position: relative;
}
.sendPreview .download a i {
  display: block;
  width: 13px;
  height: 13px;
  background: url(../assets/imgs/mail/xiazai.svg);
  position: absolute;
  left: -16px;
  top: 15px;
}
.sendPreview .down-tip {
  width: 70%;
}
.sendPreview .down-tip p {
  width: 250px;
  font-size: 12px;
  line-height: 1.17;
  color: #99a9bf;
  float: right;
  text-align: right;
  background: url(../assets/imgs/mail/tip.svg) no-repeat left center;
}
.kqway {
  display: flex;
}
.kqway .wayemail {
  font-size: 14px;
  color: #1f2d3d;
  margin-right: 32px;
  cursor: pointer;
}
.kqway .wayemail i {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border: solid 1px #e0e6ed;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 10px;
}
.kqway .set-thisway i {
  position: relative;
  background-color: #6699ee;
}
.kqway .set-thisway i:after {
  position: absolute;
  top: 5px;
  left: 5px;
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  background-color: #ffffff;
  border-radius: 50%;
}
.upload-imgmain .uploadimg_cent {
  height: 140px;
}
.weekTimeTips {
  font-size: 14px;
  color: red;
  margin-left: 15px;
}
</style>