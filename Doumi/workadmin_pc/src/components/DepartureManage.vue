<template>
  <div class="departure-manage" id="departure-manage" style="margin: 0 0 20px 0">
    <div class="header-title">
      <h2>离职管理</h2>
    </div>
    <div class="select-status">
      <div class="status-main">
        <el-form label-width="90px">
          <div class="from-item-list">
            <el-form-item label="状态：">
              <el-select v-model="fromData.statusValue" class="mystatus" style="width:100px">
                <template v-for="item in statusArr">
                  <el-option :key="item.id" :label="item.text" :value="item.id">
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-form-item label="离职原因：">
              <el-select v-model="fromData.leaveReason" class="mystatus" style="width:150px">
                <template v-for="item in leaveReasonList">
                  <el-option :key="item.id" :label="item.text" :value="item.id">
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-form-item label="人员：">
              <el-autocomplete popper-class="my-autocomplete2" style="width:135px;" v-model="fromData.member" :fetch-suggestions="querySearch" custom-item="my-item-zh" :trigger-on-focus="false" placeholder="姓名/手机号" @select="handleSelect">
              </el-autocomplete>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-button type="primary" @click="seachMember" class="seach-btn">搜 索</el-button>
          </div>
        </el-form>
        <!-- <p>状态：</p>
         <button :class="['but1',status == 1? 'but-active' :'']" @click="auditFn(1)">待审批</button>
         <button :class="['but2',status == 2 ? 'but-active' : '']" @click="auditFn(2)">已审批</button> -->
      </div>
    </div>
    <div class="depManTable">
      <el-table :height="tableHeight" v-loading.body="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="name" label="姓名" width="100">
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" width="120">
          <template slot-scope="scope">
            <el-popover
                placement="top"
                title=""
                width="150"
                trigger="hover">
                <span style="margin-left:35px">{{scope.row.mobile}}</span>
                <span slot="reference">{{scope.row.mobile.substr(0,3)+"****"+scope.row.mobile.substr(7)}}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="idnumber" label="身份证号" width="170">
           <template slot-scope="scope">
            <el-icon name="idnumber"></el-icon>
            <el-popover
              placement="top"
              title=""
              width="150"
              trigger="hover">
              <span style="margin-left:10px">{{scope.row.idnumber}}</span>
              <span slot="reference">{{scope.row.idnumber.substr(0,3)+"****"+scope.row.idnumber.substr(14)}}</span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="entry_date" label="入职时间" width="130">
        </el-table-column>
        <el-table-column prop="leave_date" label="离职时间" width="130">
        </el-table-column>
        <el-table-column prop="apply_time" label="提交审批时间" width="150">
        </el-table-column>
        <el-table-column prop="leave_reason" class="leave_reason" min-width="130" label="离职原因">
          <template slot-scope="scope">
            <span class="leave_reason">{{scope.row.status == 2 ? scope.row.real_leave_reason : scope.row.leave_reason}}</span>
          </template>
        </el-table-column>
        <el-table-column label="处理状态" width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.status == 1">待审批</span>
            <span v-if="scope.row.status == 2">已批准</span>
            <span v-if="scope.row.status == 3">已拒绝</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <div v-if="scope.row.status == 1" class="doBtn">
              <button :class="['approval',!removeMemberPre ? 'disabled-sty' : '']" type="text" :disabled="!removeMemberPre" @click="departureAppFn(scope.row)">批准</button>
              <button :class="['refused',!removeMemberPre ? 'disabled-sty' : '']" type="text" :disabled="!removeMemberPre" @click="departureRefFn(scope.row)">拒绝</button>
            </div>
            <div v-if="scope.row.status == 2 || scope.row.status == 3" class="doBtn">
              <button class="to-view" type="text" @click="departureView(scope.row)">查看</button>
            </div>
            <div class="doBtn" v-if="scope.row.status == '2' && scope.row.sign_status == 1 && current_user_role_id == 3 && project_type == 3">
              <!-- <div class="doBtn"> -->
              <el-button size="small" class="to-view2" type="primary" plain :disabled="scope.row.iDisabledFlag" @click="downPdf(scope.row, 3)">{{ scope.row.iBtnText }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="page depart-page" v-if="total_page > 0">
        <div class="block">
          <el-pagination @current-change="handleCurrentChange" :page-size="page_size" layout="total, prev, pager, next" :page-count="total_page" :total="total_num">
          </el-pagination>
        </div>
      </div>
    </div>
    <!-- 弹窗————批准 -->
    <div class="dialog-deparapp">
      <el-dialog :title="departureTitle" :visible.sync="dialogDepApp" @close="resetFormApp('departureApp')" size="tiny">
        <div class="myform">
          <el-form :model="departureApp" label-width="115px" :rules="rules" ref="departureApp" class="demo-ruleForm">
            <el-form-item label="止薪日期" prop="salary_end_date">
              <el-date-picker v-model="departureApp.salary_end_date" style="width:268px;" :picker-options="pickerDisabled" :editable="false" :clearable="false" format="yyyy-MM-dd" value-format="yyyy-MM-dd" type="date" placeholder="选择止薪日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="离职日期" prop="leave_date">
              <el-date-picker v-model="departureApp.leave_date" style="width:268px;" :editable="false" :picker-options="pickerDisabled" format="yyyy-MM-dd" value-format="yyyy-MM-dd" :clearable="false" type="date" placeholder="选择离职日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="申请离职原因">
              <el-input v-model="departureApp.leave_reason" disabled="true" class='apply-inp'></el-input>
            </el-form-item>
            <el-form-item label="真实离职原因" prop="real_reason_id">
              <el-select v-model="departureApp.real_reason_id" filterable placeholder="请选择" class="real-depart">
                <el-option v-for="item in reasonArr" :key="item.reason_id" :label="item.reason" :value="item.reason_id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="离职原因" class="depart-desc">
              <el-input type="textarea" placeholder="请输入离职原因" v-model="departureApp.leave_reason_remark"></el-input>
            </el-form-item>
            <template v-if="rowData.resign_apply_url!=-1">
              <el-form-item label="辞职申请书预览" class="depart-desc" v-if="(current_user_role_id == 3 && project_type == 3) || (current_user_role_id == 4 && project_type == 3)">
                <span @click="resignPreview(rowData)" class="preview">预览</span>
              </el-form-item>
            </template>
            <template v-if="departureApp.resignation_document&&departureApp.resignation_document.length">
              <el-form-item label="下载附件" class="depart-desc-o" style="line-height:20px">
                <template v-for="(item,index) in departureApp.resignation_document">
                  <div @click="resignAttachment(item,index)" class="preview">{{index+1}}、{{item.file}}</div>
                </template>
              </el-form-item>
            </template>
            
            <!-- </template> -->
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetFormApp('departureApp')" class="btn1">取 消</el-button>
          <el-button type="primary" @click="submitFormApp('departureApp')" class="btn2">确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 弹窗————查看 -->
    <div class="dialog-deparapp">
      <el-dialog :title="departureTitle" :visible.sync="dialogDepAppView" @close="dialogDepAppView = false" size="tiny">
        <div class="myform" id="asd">
          <el-form :model="departureAppView" label-width="115px" class="demo-ruleForm">
            <el-form-item label="止薪日期" prop="salary_end_date">
              <el-date-picker v-model="departureAppView.salary_end_date" style="width:268px;" :editable="false" :clearable="false" disabled="true" type="date" placeholder="计划离职日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="离职日期" prop="xinend1">
              <el-date-picker v-model="departureAppView.leave_date" style="width:268px;" :editable="false" :clearable="false" disabled="true" type="date" placeholder="选择离职日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="申请离职原因">
              <el-input v-model="departureAppView.leave_reason" disabled="true" class='apply-inp'></el-input>
            </el-form-item>
            <el-form-item label="真实离职原因">
              <el-input v-model="departureAppView.real_leave_reason" disabled="true" class='apply-inp'></el-input>
            </el-form-item>

            <el-form-item label="离职原因备注" class="depart-desc">
              <el-input type="textarea" disabled="true" placeholder="请输入" v-model="departureAppView.leave_reason_remark"></el-input>
            </el-form-item>
            <template v-if="rowData.resign_apply_url!=-1">
              <el-form-item label="辞职申请书预览" class="depart-desc" v-if="(current_user_role_id == 3 && project_type == 3) || (current_user_role_id == 4 && project_type == 3)">
                <span @click="resignPreview(rowData)" class="preview">预览</span>
              </el-form-item>
            </template>
            <template v-if="departureAppView.resignation_document&&departureAppView.resignation_document.length">
              <el-form-item label="下载附件" class="depart-desc-o" style="line-height:20px">
                <template v-for="(item,index) in departureAppView.resignation_document">
                  <div @click="resignAttachment(item,index)" class="preview">{{index+1}}、{{item.file}}</div>
                </template>
              </el-form-item>
            </template>
            
            <!-- </template> -->
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogDepAppView = false" class="btn2">确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 弹窗————拒绝 -->
    <div class="dialog-deparapp">
      <el-dialog :title="departureTitle" :visible.sync="dialogDepRef" @close="resetFormRef('departureRef')" size="tiny">
        <div class="myform">
          <el-form :model="departureRef" label-width="115px" :rules="rules" ref="departureRef" class="demo-ruleForm">
            <el-form-item label="计划离职日期" prop="xinend3">
              <el-date-picker disabled="true" v-model="departureRef.leave_date" style="width:268px;" :editable="false" :clearable="false" type="date">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="申请离职原因">
              <el-input v-model="departureRef.leave_reason" disabled="true" class='apply-inp'></el-input>
            </el-form-item>
            <el-form-item label="拒绝离职原因" class="depart-desc" prop="audit_refuse_reason">
              <el-input type="textarea" placeholder="请输入拒绝离职原因" v-model="departureRef.audit_refuse_reason"></el-input>
            </el-form-item>
            <template v-if="rowData.resign_apply_url!=-1">
              <el-form-item label="辞职申请书预览" class="depart-desc" v-if="(current_user_role_id == 3 && project_type == 3) || (current_user_role_id == 4 && project_type == 3)">
                <span @click="resignPreview(rowData)" class="preview">预览</span>
              </el-form-item>
            </template>
            <template v-if="departureRef.resignation_document&&departureRef.resignation_document.length">
              <el-form-item label="下载附件" class="depart-desc-o" style="line-height:20px">
                <template v-for="(item,index) in departureRef.resignation_document">
                  <div @click="resignAttachment(item,index)" class="preview">{{index+1}}、{{item.file}}</div>
                </template>
              </el-form-item>
            </template>
            <!-- </template> -->
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetFormRef('departureRef')" class="btn1">取 消</el-button>
          <el-button type="primary" @click="submitFormFef('departureRef')" class="btn2">确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 弹窗————拒绝查看 -->
    <div class="dialog-deparapp">
      <el-dialog :title="departureTitle" :visible.sync="dialogDepRefView" @close="dialogDepRefView = false" size="tiny">
        <div class="myform">
          <el-form :model="departureRefView" label-width="115px" class="demo-ruleForm">
            <el-form-item label="计划离职日期" prop="xinend3">
              <el-date-picker v-model="departureRefView.leave_date" style="width:268px;" :editable="false" :clearable="false" disabled="true" type="date" placeholder="选择止薪日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="申请离职原因">
              <el-input v-model="departureRefView.leave_reason" disabled="true" class='apply-inp'></el-input>
            </el-form-item>
            <el-form-item label="拒绝离职原因" class="depart-desc" prop="bz">
              <el-input type="textarea" disabled="true" v-model="departureRefView.audit_refuse_reason"></el-input>
            </el-form-item>
            <template v-if="rowData.resign_apply_url!=-1">
              <el-form-item label="辞职申请书预览" class="depart-desc" v-if="(current_user_role_id == 3 && project_type == 3) || (current_user_role_id == 4 && project_type == 3)">
                <span @click="resignPreview(rowData)" class="preview">预览</span>
              </el-form-item>
            </template>
            <template v-if="departureRefView.resignation_document&&departureRefView.resignation_document.length">
              <el-form-item label="下载附件" class="depart-desc-o" style="line-height:20px">
                <template v-for="(item,index) in departureRefView.resignation_document">
                  <div @click="resignAttachment(item,index)" class="preview">{{index+1}}、{{item.file}}</div>
                </template>
              </el-form-item>
            </template>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogDepRefView = false" class="btn2">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import * as util from '../assets/js/util.js'
export default {
  name: 'departure-manage',
  components: {

  },
  data: function () {
    var auditRefuseReasonReg = (rule, value, callback) => {
      let vald = value.replace(/\s+/g, "");
      console.log(vald, !vald)
      if (!vald) {
        return callback(new Error('请输入拒绝离职原因'));
      } else {
        callback();
      }
    };
    return {
      pickerDisabled: {
        // disabledDate: (time) => {
        //   return time.getTime() < new Date(new Date().toLocaleDateString()).getTime();
        // }
      },
      btndis: false,
      loading: true,
      departureTitle: '',
      dialogDepApp: false,
      dialogDepRef: false,
      dialogDepAppView: false,
      dialogDepRefView: false,
      tableData: [],
      reasonArr: [],
      //批准离职
      departureApp: {
        leave_reason: '',//申请离职原因
        leave_reason_remark: '',//离职原因备注
        leave_date: '',//离职日期
        real_reason_id: '',//真实离职原因id
        salary_end_date: '',//止薪日期
        resignation_document:[]
      },
      //批准离职查看
      departureAppView: {
        leave_reason_remark: '',
        leave_date: '',
        leave_reason: '',
        real_leave_reason: '',//真实离职原因
        salary_end_date: '',
        resignation_document:[]
      },
      //拒绝离职
      departureRef: {
        leave_date: '',//计划离职日期
        leave_reason: '',//申请离职原因
        audit_refuse_reason: '',//拒绝离职备注
        resignation_document:[]

      },
      //拒绝离职查看
      departureRefView: {
        leave_date: '',//计划离职日期
        leave_reason: '',//申请离职原因
        audit_refuse_reason: '',//拒绝离职备注
        resignation_document:[]

      },
      rules: {
        real_reason_id: [
          { required: true, message: '请选择真实离职原因' }
        ],
        leave_date: [
          { required: true, message: '请选择离职日期' }
        ],
        salary_end_date: [
          { required: true, message: '请选择止薪日期' }
        ],
        audit_refuse_reason: [
          { required: true, validator: auditRefuseReasonReg, trigger: 'blur' }
        ]
      },
      total_page: '',
      page_size: 20,
      page_no: 1,
      currentPage: 1,
      total_num: '',
      project_id: '',
      team_id: '',
      status: 1,//1待审批 2 已审批
      removeMemberPre: false,//审批权限
      tableHeight: 0,
      fromData: {
        statusValue: 1,//1待审批  2已审批
        member: '',
        currSeachRester: "",
        leaveReason:0
      },
      seachData: "",
      states: [],
      statusArr: [
        {
          id: 1,
          text: "待审批"
        },
        {
          id: 2,
          text: "已审批"
        },
      ],
      leaveReasonList:[
        {
          id: 0,
          text: "全部"
        },
        {
          id: 1,
          text: "主动离职"
        },
        {
          id: 2,
          text: "被动离职"
        },
      ],
      rowData: {},
      timer: null,
      current_user_role_id: '',
      project_type: null
    }
  },
  computed: {

  },
  watch: {
    '$route'() {
      this.init();
    }
  },
  methods: {
    init() {
      this.tableHeight = window.innerHeight - 249;
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      this.page_no = 1;
      this.status = 1;
      this.btndis = false;
      this.removeMemberPre = false;
      this.loading = true;
      this.getDepartureList();
      this.getLeaveReason();
      this.getPermissions();
      this.getOverview();
    },
    /*
    获取离职列表
     */
    getDepartureList() {
      util.ajax({
        url: '/leaveapply/get/list',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          // status:this.status,
          status: this.fromData.statusValue,
          leave_reason:this.fromData.leaveReason,
          member: this.seachData,
          pageSize: this.page_size,
          page: this.page_no
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            let data = obj.data;
            if (data.list && data.list.length > 0) {
              data.list.forEach(item => {
                item.iBtnText = '离职证明';
                item.iDisabledFlag = false;
              });
            }
            this.tableData = data.list;
            this.total_page = data.total_page;
            this.total_num = data.total_num
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: 'warning'
            });
          }
          this.loading = false;
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
          this.loading = false;
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
          this.loading = false;
        }
      })
    },

    //人员检索
    querySearch(queryString, cb) {
      if (queryString) {
        this.fromData.currSeachRester = "";
        this.states = [];
        util.ajax({
          url: "/group/member_search",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            group_id: "",
            keyword: queryString,
            page_no: "",
            page_size: ""
          },
          timeout: 10000,
          success: obj => {
            if (obj && obj.errno == 0) {
              let strArr = [];
              obj.data.list.forEach(o => {
                let str = "";
                str = {
                  value: o.user_name,
                  group_name: o.group_name,
                  group_id: o.group_id,
                  user_id: o.user_id
                };
                strArr.push(str);
              });
              this.restaurants = strArr;
              var results = queryString
                ? this.restaurants.filter(this.createFilter(queryString))
                : this.restaurants;
              if (results.length == 0) {
                results.push({ value: "无搜索结果", status: "-1" });
              }
              this.states = results;
              clearTimeout(this.timeout);
              this.timeout = setTimeout(() => {
                // 调用 callback 返回建议列表的数据
                cb(results);
              }, 1000 * Math.random());
            } else {
              this.$message({
                showClose: true,
                message: obj.errmsg,
                type: "warning"
              });
            }
          },
          error: (xhr, status) => {
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          }
        });
      }
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase() ||
          restaurant.value.indexOf(queryString) > -1
        );
      };
    },
    //搜索建议列表选择赋值
    handleSelect(item) {
      if (item.status == -1) {
        this.fromData.member = "";
        this.fromData.currSeachRester = "";
      } else {
        this.fromData.currSeachRester = item;
      }
    },

    //搜索按钮
    seachMember() {
      this.page_size = 20;
      this.page_no = 1;
      if (this.states.length != 0) {
        if (!this.fromData.member) {
          this.seachData = 0;
          this.getDepartureList();
          return false;
        }
        if (
          this.fromData.currSeachRester.user_id == -1 &&
          this.states[0].status == -1
        ) {
          this.seachData = 0;
          this.getDepartureList();
          return false;
        }
      }
      if (!this.fromData.currSeachRester.user_id) {
        this.seachData = 0;
        this.getDepartureList();
        return false;
      }
      if (
        this.fromData.currSeachRester.user_id &&
        this.fromData.currSeachRester.user_id != -1
      ) {
        this.seachData = this.fromData.currSeachRester.user_id;
        this.getDepartureList();
        return false;
      }
      if (
        this.fromData.currSeachRester.user_id &&
        this.states &&
        this.fromData.currSeachRester.user_id != -1
      ) {
        this.seachData = this.fromData.currSeachRester.user_id;
        this.getDepartureList();
        return false;
      }
      if (!this.fromData.member) {
        this.seachData = 0;
        this.getDepartureList();
        return false;
      }
    },

    getPermissions() {
      util.ajax({
        url: '/permission/application',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          application_id: 0
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(123)
          // console.log(obj)
          if (obj && obj.errno == 0) {
            obj.data.forEach((i) => {
              if (i.id_name == 'remove_group_member') {
                this.removeMemberPre = true;
              }
            })
          } else {
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
    /*
    批准离职弹框
     */
    departureAppFn(row) {
      this.rowData = row;
      this.departureTitle = '员工·' + row.name + '(' + row.idnumber + ')'
      let real_reason_id;
      for (let i = 0; i < this.reasonArr.length; i++) {
        if (this.reasonArr[i].reason == row.leave_reason) {
          real_reason_id = this.reasonArr[i].reason_id;
          console.log(real_reason_id)
        }
      }
      this.departureApp = {
        leave_reason_remark: '',
        leave_date: row.leave_date,
        refuse_reason: '',
        real_reason_id: real_reason_id,
        leave_reason: row.leave_reason,
        id: row.id,
        salary_end_date: row.leave_date,
        resignation_document:row.resignation_document
      };
      this.dialogDepApp = true;
    },
    /*
    拒绝离职弹框
     */
    departureRefFn(row) {
      this.rowData = row;
      this.departureTitle = '员工·' + row.name + '(' + row.idnumber + ')'
      this.departureRef = {
        id: row.id,
        leave_date: row.leave_date,
        leave_reason: row.leave_reason,
        audit_refuse_reason: '',
        resignation_document:row.resignation_document

      };
      this.dialogDepRef = true;
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-02-12
     * @example
     * @param    {[type]}   formName [description]
     * @return   {[type]}            [description]
     * @description 离职批准确认
     */
    submitFormApp(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid && !this.btndis) {
          this.btndis = true;
          let salary_end_date;
          let leave_date;
          if (this.departureApp.salary_end_date instanceof Date) {
            salary_end_date = util.getLocalTime(this.departureApp.salary_end_date, 'yyyyMMdd')
          } else {
            salary_end_date = this.departureApp.salary_end_date.replace(/-/g, '');
          }
          if (this.departureApp.leave_date instanceof Date) {
            leave_date = util.getLocalTime(this.departureApp.leave_date, 'yyyyMMdd')
          } else {
            leave_date = this.departureApp.leave_date.replace(/-/g, '');
          }
          let departureApp = this.departureApp;
          let data = {
            id: departureApp.id,
            project_id: this.project_id,
            salary_end_date: salary_end_date,
            leave_date: leave_date,
            reason_id: departureApp.reason_id,
            real_reason_id: departureApp.real_reason_id,
            leave_reason_remark: departureApp.leave_reason_remark
          };
          util.ajax({
            url: '/leaveapply/approve',
            type: 'GET',
            data: data,
            timeout: 10000,
            success: (obj) => {
              if (obj && obj.errno == 0) {
                this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: 'warning'
                });
                this.getDepartureList()
                this.dialogDepApp = false;
                this.$emit('triggerAppFun', { funName: 'departure_number' })
              } else {
                this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: 'warning'
                });
              }
              this.btndis = false;
            },
            error: (xhr, status) => {
              this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
              this.dialogDepApp = false;
              this.btndis = false;
            },
            noNetwork: () => {
              //网络超时
              this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
              this.dialogDepApp = false;
              this.btndis = false;
            }
          })
        }
      })
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-02-12
     * @example
     * @param    {[type]}   formName [description]
     * @return   {[type]}            [description]
     * @description 离职拒绝确认
     */
    submitFormFef(formName) {
      let that = this;
      this.$refs[formName].validate((valid) => {
        if (valid && !this.btndis) {
          this.btndis = true;
          let data = {
            id: this.departureRef.id,
            project_id: this.project_id,
            refuse_reason: this.departureRef.audit_refuse_reason
          };
          util.ajax({
            url: '/leaveapply/refuse',
            type: 'GET',
            data: data,
            timeout: 10000,
            success: (obj) => {
              if (obj && obj.errno == 0) {
                this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: 'warning'
                });
                this.getDepartureList()
                this.dialogDepRef = false;
                this.$emit('triggerAppFun', { funName: 'departure_number' })
              } else {
                this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: 'warning'
                });
              }
              this.btndis = false;
            },
            error: (xhr, status) => {
              this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
              this.dialogDepRef = false;
              this.btndis = false;
            },
            noNetwork: () => {
              //网络超时
              this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
              this.dialogDepRef = false;
              this.btndis = false;
            }
          })
        }
      })
    },
    /*
    获取离职原因
     */
    getLeaveReason() {
      util.ajax({
        url: '/leaveapply/reasonlist',
        type: 'GET',
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.reasonArr = obj.data
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
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-02-12
     * @example
     * @param    {[type]}   formName [description]
     * @return   {[type]}            [description]
     * @description 关闭离职审批
     */
    resetFormApp(formName) {
      this.dialogDepApp = false;
      this.$refs[formName].resetFields();
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-02-12
     * @example
     * @param    {[type]}   formName [description]
     * @return   {[type]}            [description]
     * @description 关闭拒绝弹框
     */
    resetFormRef(formName) {
      this.dialogDepRef = false;
      this.$refs[formName].resetFields();
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-02-12
     * @example
     * @param    {[object]}   row [表格一行所以字段]
     * @return   {[null]}       [description]
     * @description 展示查看已批准或拒绝弹框
     */
    departureView(row) {
      this.rowData = row;
      this.departureTitle = '员工·' + row.name + '(' + row.idnumber + ')'
      if (row.status == 3) {
        this.departureRefView = {
          leave_date: row.leave_date,//计划离职日期
          leave_reason: row.leave_reason,//申请离职原因
          audit_refuse_reason: row.audit_refuse_reason,//拒绝离职备注
          resignation_document:row.resignation_document

        },
          this.dialogDepRefView = true;
      } else {
        //批准离职查看
        this.departureAppView = {
          leave_reason_remark: row.leave_reason_remark,
          leave_date: row.leave_date,
          leave_reason: row.leave_reason,
          real_leave_reason: row.real_leave_reason,//真实离职原因
          salary_end_date: row.salary_end_date,
          user_id: row.user_id,
          resignation_document:row.resignation_document
        },
          this.dialogDepAppView = true;
      }
    },
    // 离职证明下载
    downPdf(row, prove_type) {
      if (row.leave_prove_url == -2) {
        this.$message({
          message: '正在生成中',
          type: 'info'
        });
      } else if (row.leave_prove_url == -1) {
        // prove_type	证明类型 1辞职申请书  2兼职工作证明 3离职证明-全职 4在职证明-全职
        let data = {
          team_id: this.team_id,
          project_id: this.project_id,
          user_id: row.user_id,
          prove_type: prove_type
        };
        util.ajax({
          url: '/group/issue_prove',
          type: 'GET',
          data: data,
          timeout: 10000,
          success: (obj) => {
            console.log('离职证明下载===', obj)
            if (obj && obj.errno == 0) {
              row.iBtnText = '正在下载...';
              row.iDisabledFlag = true;
              this.$message({
                message: '开始下载，请耐心等待~',
                type: 'info'
              });
              setTimeout(() => {
                let _time = 0;
                this.timer = setInterval(() => {
                  _time++;
                  if (_time > 6) {
                    clearInterval(this.timer)
                  };
                  this.issueProveStatusFun(row, prove_type);
                }, 1500)
              }, 500)
            } else {
              this.$message({
                message: `${obj.errmsg}`,
                type: 'error'
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
      } else {
        // window.open(row.leave_prove_url, '_blank');
        this.downloadProve(prove_type, row.leave_prove_url, 0)
      }
    },
    // 开具证明结果
    issueProveStatusFun(row, prove_type) {
      let data = {
        team_id: this.team_id,
        project_id: this.project_id,
        user_id: row.user_id,
        prove_type: prove_type
      };
      util.ajax({
        url: '/group/issue_prove_status',
        type: 'GET',
        data: data,
        timeout: 1000 * 10 * 60,
        success: (obj) => {
          console.log('开具证明结果obj===', obj);
          if (obj.errno == 0) {
            clearInterval(this.timer);
            row.iBtnText = '离职证明';
            row.iDisabledFlag = false;
            this.$message({
              message: '下载成功',
              type: 'success'
            });
            if (obj.data.prove_url) {
              // window.open(obj.data.prove_url, '_blank');
              this.downloadProve(prove_type, obj.data.prove_url, 0)
            };
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
    },
    // pdf格式下载-或预览 0 下载 1预览
    downloadProve(prove_type, prove_url, preview) {
      location.href =
        util.host +
        "/sea/api/1.0/client/v1/group/download_prove?dmclient=pcweb&X-Doumi-Agent=weixinqy&preview=" + preview + "&prove_type=" +
        prove_type +
        "&prove_url=" +
        prove_url
    },
    // 辞职申请书预览
    downloadProvePriview(prove_type, prove_url, preview) {
      window.open(
        util.host +
        "/sea/api/1.0/client/v1/group/download_prove?dmclient=pcweb&X-Doumi-Agent=weixinqy&preview=" + preview + "&prove_type=" +
        prove_type +
        "&prove_url=" +
        prove_url
      )
    },
    // 辞职申请书预览
    resignPreview(rowData) {
      if (rowData.resign_apply_url == -1) {
        this.$message({
          message: '抱歉，暂时无法预览',
          type: 'error'
        });
      } else {
        // window.open(rowData.resign_apply_url, '_blank');
        this.downloadProvePriview(1, rowData.resign_apply_url, 1);
      }
    },
    //下载附件
    resignAttachment(item,index){
      console.log('ddd',item);
      // this.downloadProvePriview(1, item.file, 1);
      window.open('//image-inner.doumi.com/'+item.file,'_blank')
    },
    getOverview() {
      util.ajax({
        url: '/project/overview',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: (obj) => {
          console.log('用户权限接口')
          if (obj && obj.errno == 0) {
            this.current_user_role_id = obj.data.list.current_user_role_id;
            this.project_type = obj.data.list.project_type;    // 3是全职
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
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    handleCurrentChange(val) {
      this.page_no = val;
      this.loading = true;
      this.getDepartureList();
    },
    handleCurrentPageChange() {

    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-02-12
     * @example
     * @param    {[number]}   status [当前选择状态]
     * @return   {[null]}          [description]
     * @description 切换待审批 已审批
     */
    auditFn(status) {
      console.log(status)
      if (this.status == status) return;
      this.page_no = 1;
      this.loading = true;
      this.status = status;
      this.getDepartureList()
    },
    textFn() {
      console.log(333)
    },
  },
  created() {
    this.init()

  },
  mounted() {
  }
}
</script>


<style  src='../assets/css/DepartureManage.css'></style>

<style  src='../assets/css/reset.css'></style>
