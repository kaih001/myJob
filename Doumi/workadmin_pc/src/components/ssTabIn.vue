<template>
  <div class="">
    <div class="form_wrap">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="人员信息：">
          <el-input v-model="formInline.user" placeholder="姓名/身份证号/手机号" clearable></el-input>
        </el-form-item>
        <el-form-item label="员工状态">
          <el-select v-model="formInline.staffStatus" placeholder="请选择">
            <el-option v-for="(value,key) in (searchData.user_status||{})" :key="key" :label="value" :value="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="参保城市">
          <el-select v-model="formInline.cityId" filterable placeholder="请选择" clearable @change="insuredCityChange">
            <el-option v-for="item in insured_place_list" :label="item.short_name" :key="item.city_id" :value="item.city_id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="参保区县">
          <el-select v-model="formInline.districtCounty" filterable placeholder="请选择" clearable>
            <el-option v-for="item in districtCounty_list" :label="item.short_name" :key="item.district_id" :value="item.district_id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="社保状态">
          <el-select v-model="formInline.ssStatus" placeholder="请选择">
            <el-option v-for="(value,key) in (searchData.insurance_status||{})" :key="key" :label="value" :value="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="社保缴纳月份">
          <el-date-picker v-model="formInline.ssMonth" type="month" placeholder="选择月">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="公积金状态">
          <el-select v-model="formInline.fundStatus" placeholder="请选择">
            <el-option v-for="(value,key) in (searchData.fund_status||{})" :key="key" :label="value" :value="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="公积金缴纳月份">
          <el-date-picker v-model="formInline.fundMonth" type="month" placeholder="选择月">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">搜索</el-button>
          <el-button type="info" plain @click="resetFun">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table_wrap">
      <div class="table_operate">
        操作：
        <span>
          <el-button type="primary" @click="goAdd">新增</el-button>
          <el-button type="primary" @click="withdraw">撤回报增</el-button>
          <el-button type="primary" @click="downSizing">减员</el-button>
        </span>
        <span class="operate_wrap">
          <el-button class="batchBtn" type="text" @click="addImport">
            <span style="font-size:14px">新增导入</span>
          </el-button>
          <el-button class="batchBtn" type="text" @click="reduceImport">
            <span style="font-size:14px">批量减员</span>
          </el-button>
          <el-button class="batchBtn" type="text" @click="exportList">
            <span style="font-size:14px">导出名单</span>
          </el-button>
        </span>
      </div>
      <div class="table_list">
        <el-table ref="multipleTable" :data="tableData" border tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" fixed="left"></el-table-column>
          <el-table-column label="员工姓名" width="120" property="real_name">
          </el-table-column>
          <el-table-column label="参保城市" width="120" property="insurance_city_name">
          </el-table-column>
          <el-table-column label="手机号" width="120" property="mobile">
            <template slot-scope="scope">
              <el-icon name="mobile"></el-icon>
              <el-popover placement="top" title="" width="150" trigger="hover">
                <span style="margin-left:35px">{{scope.row.mobile}}</span>
                <span slot="reference">{{scope.row.mobile.substr(0,3)+"****"+scope.row.mobile.substr(7)}}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="身份证号" width="120">
            <template slot-scope="scope">
              <el-icon name="idnumber"></el-icon>
              <el-popover placement="top" title="" width="180" trigger="hover">
                <span style="margin-left:35px">{{scope.row.idnumber}}</span>
                <span slot="reference">{{scope.row.idnumber.substr(0,3)+"****"+scope.row.idnumber.substr(15)}}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="参保身份" width="140">
            <template scope="scope">{{ scope.row.insurance_identity_name }}</template>
          </el-table-column>
          <el-table-column label="入职时间" width="120">
            <template scope="scope">{{ scope.row.entry_date }}</template>
          </el-table-column>
          <el-table-column label="员工状态" width="120">
            <template scope="scope">{{ scope.row.user_status_name }}</template>
          </el-table-column>
          <el-table-column label="离职日期" width="200">
            <template scope="scope">
              <span v-if="scope.row.leave_date && !scope.row.showLzDate">
                {{ scope.row.leave_date }} <i class="el-icon-edit" @click="modifyDate(scope.row)"></i>
              </span>
              <span v-if="scope.row.showLzDate">
                <el-date-picker v-model="scope.row.leave_date" type="date" placeholder="选择离职日期" style="width:120px">
                </el-date-picker>
                <i class="el-icon-close" @click="cancelModifyDate(scope.row)"></i>
                <i class="el-icon-check" @click="sureModifyDate(scope.row.leave_date)"></i>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="社保状态" width="120">
            <template scope="scope">{{ scope.row.insurance_status_name }}</template>
          </el-table-column>
          <el-table-column label="社保开始缴纳月份" width="150">
            <template scope="scope">{{ scope.row.month_date }}</template>
          </el-table-column>
          <el-table-column label="社保申报工资" width="120">
            <template scope="scope">{{ scope.row.social_security }}</template>
          </el-table-column>
          <el-table-column label="公积金状态" width="120">
            <template scope="scope">{{ scope.row.fund_status_name }}</template>
          </el-table-column>
          <el-table-column label="公积金开始缴纳月份" width="150">
            <template scope="scope">{{ scope.row.fund_month_date }}</template>
          </el-table-column>
          <el-table-column label="公积金申报工资" width="150">
            <template scope="scope">{{ scope.row.fund_social_security }}</template>
          </el-table-column>
          <el-table-column label="公积金企业比例" width="150">
            <template scope="scope">{{ scope.row.enterprise_fund }}</template>
          </el-table-column>
          <el-table-column label="公积金个人比例" width="150">
            <template scope="scope">{{ scope.row.personal_fund }}</template>
          </el-table-column>
          <el-table-column label="社保供应商" width="120">
            <template scope="scope">{{ scope.row.supplier_name }}</template>
          </el-table-column>
          <el-table-column label="备注" width="280">
            <template scope="scope">
              <el-popover placement="top" title="" width="280" trigger="hover">
                <span v-for="(item,index) in scope.row.remark" :key="index">
                  <p style="line-height:18px">{{index+1}}. {{item.remark}}&nbsp;{{item.create_at}}</p>
                </span>
                <span slot="reference">{{scope.row.remark[0]?"1." + scope.row.remark[0].remark.substr(0,15)+"...":''}}</span>
              </el-popover>
            </template>
          </el-table-column>
          <!-- <el-table-column label="操作" width="120" fixed="right">
            <template scope="scope">
              <el-button @click.native.prevent="addRemark(scope.row)" type="text" size="small">
                新增备注
              </el-button>
            </template>
          </el-table-column> -->
        </el-table>
        <!--分页-->
        <div class="pagination">
          <el-pagination background @current-change="handleCurrentPageChange" :current-page.sync="page_no" :page-size="page_size" layout="total, prev, pager, next" :total="total_num">
          </el-pagination>
        </div>
      </div>
    </div>
    <!-- 新增备注 -->
    <el-dialog title="新增备注" :visible.sync="remarkDialog" :before-close="remarkHandleClose">
      <div>
        <el-form :model="remarkForm" ref="remarkForm" label-width="100px" size="small" style="width:90%">
          <el-form-item label="备注" prop="mark">
            <el-input type="textarea" :rows="3" v-model="remarkForm.mark" placeholder="请输入"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="remarkHandleClose">取 消</el-button>
        <el-button type="primary" @click="addSure('remarkForm')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="减员" custom-class="downDialog" :visible.sync="downSizeVisible" :before-close="handleClose">
      <div class="downBody">
        <div class="downPersons">
          <span>要减员的人员：</span>
          <span v-for="(item,index) in multipleSelection" :key="index">
            {{item.real_name+item.ss_fund_text }} <em v-if="index !== multipleSelection.length-1">,</em>
          </span>
        </div>
        <div class="downTips">提示：减员仅能减参保中及已参保状态下的人员，增员中的人员可以进行撤回报增</div>
        <div class="quitSelect">
          <span>
            人员离职原因：
          </span>
          <el-select v-model="leave_reason" placeholder="请选择" style="width:250px">
            <el-option v-for="(item,index) in (searchData.leave_reason||{})" :key="index" :label="item" :value="item">
            </el-option>
          </el-select>
        </div>
        <div class="quitSelect quitSelect2" v-if="ssDownDateShow">
          <p class="ss_check">
            <el-checkbox v-model="ss_checked" disabled>社保</el-checkbox>
          </p>
          <p>
            <span>
              减员生效时间：
            </span>
            <el-date-picker v-model="ss_down_date" type="month" placeholder="选择月" :disabled="ss_can_selected" style="width:250px">
            </el-date-picker>
          </p>
        </div>
        <div class="quitSelect quitSelect2" v-if="fundDownDateShow">
          <p class="ss_check">
            <el-checkbox v-model="fund_checked" disabled>公积金</el-checkbox>
          </p>
          <p>
            <span>
              减员生效时间：
            </span>
            <el-date-picker v-model="fund_down_date" type="month" placeholder="选择月" :disabled="fund_can_selected" style="width:250px">
            </el-date-picker>
          </p>
        </div>
        <div>
          <p>
            <span style="width:98px;text-align:right;display:inline-block;font-size:14px">
              离职时间：
            </span>
            <el-date-picker v-model="quit_date" type="date" placeholder="请选择" style="width:250px">
            </el-date-picker>
          </p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="downSizeFun">提交</el-button>
      </span>
    </el-dialog>
    <el-dialog title="减员进度提示" :visible.sync="progressDialog" :show-close="false" :close-on-click-modal="false" modal-append-to-body custom-class="progressWrap">
      <div class="circleWrap">
        <el-progress type="circle" :percentage="percentage" v-if="percentage == 0"></el-progress>
        <el-progress type="circle" :percentage="percentage" v-if="percentage !== 0 && percentage !== 100"></el-progress>
        <el-progress type="circle" :percentage="percentage" status="success" v-if="percentage == 100"></el-progress>
      </div>
      <div class="progressMes" :class="[percentage == 100?'green':'']">{{progressInfo}}</div>
      <div class="">
        <span class="successTxt">
          总共减员{{total_detail_num}}条，上传减员{{insert_sum}}条，
          <span style="color:red;font-size:16px;">
            减员失败{{error_sum}}条
          </span>
        </span>
      </div>
      <div class="failList" v-if="errtableData.length > 0">
        <p class="p_title"><span class="failMes">异常数据信息</span><span class="failMes_tips">下表为已处理数据中的异常数据，共 <span>{{ errtableData.length }}</span> 条</span></p>
        <div class="table-wrap">
          <el-table :data="errtableData" empty-text size="mini" style="width: 100%">
            <el-table-column prop="real_name" label="姓名" width="80">
            </el-table-column>
            <el-table-column prop="idnumber" label="身份证号" width="170">
            </el-table-column>
            <el-table-column prop="mobile" label="手机号" width="120">
            </el-table-column>
            <el-table-column prop="errmsg" :show-overflow-tooltip="true" label="错误原因">
            </el-table-column>
          </el-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureClose" :disabled="canClosed">关 闭</el-button>
      </span>
    </el-dialog>
    <!-- 新增导入 -->
    <ssImpot ref="importRef" :dialogTitle="'新增导入'" :tempHref="searchData.batch_add_ss" :requestUrl="requestUrl_add" :resultUrl="resultUrl_add" @updateListFun="updateListFun"></ssImpot>
    <!-- 批量减员 -->
    <ssImpot ref="importReduceRef" :dialogTitle="'批量减员'" :tempHref="searchData.batch_reduce_ss" :resultUrl="resultUrl_reduce" :requestUrl="requestUrl_reduce" @updateListFun="updateListFun"></ssImpot>
    <!-- 导出名单 -->
    <ssExport ref="exportRef" :requestUrl="requestUrl_export" :resultUrl="resultUrl_export" :exportParams="exportParams" :resultParams="resultParams" @updateListFun="updateListFun"></ssExport>
  </div>
</template>

<script>
import * as util from "../assets/js/util.js";
import ssImpot from "./ssImport.vue";
import ssExport from "./ssExport.vue";
import mixinAll from '../mixins/searchMixin.js'
let mixinInstance = new mixinAll({
  list_type: 1
})
export default {
  name: "",
  components: {
    ssImpot,
    ssExport
  },
  props: {},
  mixins: [mixinInstance],
  data() {
    return {
      searchData: {},
      insured_place_list: [],
      districtCounty_list: [],
      formInline: {
        user: '',
        staffStatus: '-3',
        cityId: '',
        districtCounty: '',
        ssStatus: '-1',
        ssMonth: '',
        fundStatus: '-1',
        fundMonth: ''
      },
      tableData: [],
      multipleSelection: [],
      showLzDate: false,
      total_num: 0,
      page_size: 10,
      page_no: 1,
      downSizeVisible: false,
      allDownPersons: [],
      leave_reason: '',
      ss_checked: true,
      ss_down_date: '',
      fund_checked: true,
      fund_down_date: '',
      quit_date: '',
      ss_can_selected: false,
      fund_can_selected: false,
      progressDialog: false,
      progressInfo: '',
      percentage: 0,
      canClosed: false,
      total_detail_num: 0,
      insert_sum: 0,
      error_sum: 0,
      errtableData: [],
      requestUrl_add: '/sea/api/1.0/client/v1/fulltimess/batchaddss',     // 新增导入
      requestUrl_reduce: '/sea/api/1.0/client/v1/fulltimess/batchreducess',  // 批量减员
      resultUrl_add: '/fulltimess/batchaddss/getresult',     // 新增导入结果查询
      resultUrl_reduce: '/fulltimess/batchreducess/getresult',  // 批量减员结果查询
      requestUrl_export: '/fulltimess/ssfundlist/export',  // 导出名单
      resultUrl_export: '/fulltimess/ssfundlist/export/getresult',  // 导出名单结果查询
      exportParams: {},
      resultParams: {},
      ssDownDateShow: true,
      fundDownDateShow: true,
      remarkForm: {
        mark: ''
      },
      remarkDialog: false
    }
  },
  computed: {

  },
  watch: {
    // ss_checked (newValue,oldValue) {
    //   if(newValue) {
    //     this.ss_can_selected = false
    //   } else {
    //     this.ss_down_date = ''
    //     this.ss_can_selected = true
    //   }
    // },
    // fund_checked(newValue,oldValue) {
    //   if(newValue) {
    //     this.fund_can_selected = false
    //   } else {
    //     this.fund_down_date = ''
    //     this.fund_can_selected = true
    //   }
    // }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      this.getList()
      if (this.$route.query && this.$route.query.from == 'ry') {
        setTimeout(() => {
          this.addImport()
        }, 100)
      }
    },
    onSubmit() {
      this.page_no = 1
      this.getList()
    },
    resetFun() {
      this.formInline = {
        user: '',
        staffStatus: '-3',
        cityId: '',
        districtCounty: '',
        ssStatus: '-1',
        ssMonth: '',
        fundStatus: '-1',
        fundMonth: ''
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    modifyDate(row) {
      row.origin_leave_Date = row.leave_date
      row.showLzDate = true
      this.rowMess = row
    },
    cancelModifyDate(row) {
      row.showLzDate = false
      row.leave_date = row.origin_leave_Date
    },
    sureModifyDate(value) {
      if (!value) {
        this.$message({
          showClose: true,
          message: '请勾选离职日期',
          type: 'warning'
        });
        return
      }
      const lzDate = util.formatData1(value)
      const listParams = {
        saas_project_id: this.project_id,
        social_security_detail_id: this.rowMess.id,
        leave_date: lzDate
      }
      console.log('listParams===', listParams)
      util.ajax({
        url: '/fulltimess/leave_date/update',
        data: listParams,
        type: 'GET',
        success: (res) => {
          if (res.errno == 0) {
            this.$message({
              showClose: true,
              message: '离职日期修改成功',
              type: 'success'
            });
            this.page_no = 1;
            this.getList();
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
          console.log('xhr==', xhr)
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
    handleCurrentPageChange(val) {
      this.page_no = val;
      this.getList();
    },
    updateListFun() {
      this.page_no = 1;
      this.getList();
    },
    getList() {
      const { user, staffStatus, cityId, districtCounty, ssStatus, ssMonth, fundStatus, fundMonth } = this.formInline
      const listParams = {
        saas_project_id: this.project_id,
        list_type: 1,
        page: this.page_no,
        page_size: this.page_size,
        user_info: user,
        user_status: staffStatus,
        insurance_city: cityId,
        insurance_status: ssStatus,
        month_date: ssMonth ? util.formatData2(ssMonth) : '',
        fund_status: fundStatus,
        fund_month_date: fundMonth ? util.formatData2(fundMonth) : '',
        is_district: 0
      }
      console.log('districtCounty===', cityId, districtCounty)
      // 判断区县是否有值
      if(districtCounty) {
        listParams.insurance_city = districtCounty
        listParams.is_district = 1
      }
      util.ajax({
        url: '/fulltimess/ssfundlist',
        data: listParams,
        type: 'GET',
        success: (res) => {
          if (res.errno == 0) {
            res.data.list.forEach(item => {
              item.showLzDate = false
            })
            this.tableData = res.data.list;
            this.total_num = Number(res.data.total_num) || 0;
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
          console.log('xhr==', xhr)
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
    goAdd() {
      this.$router.push(`ssSafing?from=ssTabPre`)
    },
    // 撤回报增
    withdraw() {
      if (this.multipleSelection.length === 0) {
        this.$message({
          showClose: true,
          message: '撤回报增前请先勾选列表项',
          type: 'warning'
        });
        return;
      }
      this.$alert('确定要撤回报增吗', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
        callback: action => {
          console.log('action添加人员===', action)
          if (action == 'confirm') {
            const rowids = [];
            this.multipleSelection.forEach(item => rowids.push(item.id))
            const data = {
              saas_project_id: this.project_id,
              social_security_detail_id: rowids,
            }
            util.ajax({
              url: '/fulltimess/revocation/addss',
              data: data,
              type: 'GET',
              success: (res) => {
                if (res.errno == 0) {
                  this.$message({
                    showClose: true,
                    message: '撤回报增成功',
                    type: 'success'
                  });
                  this.page_no = 1;
                  this.getList()
                } else {
                  this.$message({
                    showClose: true,
                    message: res.errmsg,
                    type: 'warning'
                  });
                }
              },
              error: (xhr, status) => {
                console.log('xhr==', xhr)
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
          }
        }
      })
    },
    // 减员
    downSizing() {
      this.leave_reason = '';
      this.ss_down_date = '';
      this.fund_down_date = '';
      if (this.multipleSelection.length === 0) {
        this.$message({
          showClose: true,
          message: '减员前请先勾选列表项',
          type: 'warning'
        })
        return
      }
      if (this.multipleSelection.length !== 1) {
        this.$message({
          showClose: true,
          message: '列表中的人员仅能选择一个，即：减员为单个减员',
          type: 'warning'
        })
        return
      }
      // console.log(this.multipleSelection, '....')
      const user_ids = []
      this.multipleSelection.forEach(item => {
        if (user_ids.indexOf(item.user_id) === -1) {
          user_ids.push(item.user_id)
        }
        item.ss_fund_text = ''
        if (item.month_date && !item.fund_month_date) {
          item.ss_fund_text = '（社保）'
          this.ssDownDateShow = true
          this.fundDownDateShow = false
        }
        if (item.fund_month_date && !item.month_date) {
          item.ss_fund_text = '（公积金）'
          this.fundDownDateShow = true
          this.ssDownDateShow = false
        }
        if (item.month_date && item.fund_month_date) {
          item.ss_fund_text = '（社保、公积金）'
          this.ssDownDateShow = true
          this.fundDownDateShow = true
        }
      })
      this.user_ids = user_ids
      const selectedObj = this.multipleSelection[0]
      const canArr = ['参保中', '已参保'];
      if (selectedObj.month_date && !selectedObj.fund_month_date) {
        if (canArr.indexOf(selectedObj.insurance_status_name) == -1) {
          this.$message({
            showClose: true,
            message: '减员仅能减参保中及已参保状态下的人员',
            type: 'warning'
          })
          return
        }
      } else if (selectedObj.fund_month_date && !selectedObj.month_date) {
        if (canArr.indexOf(selectedObj.fund_status_name) == -1) {
          this.$message({
            showClose: true,
            message: '减员仅能减参保中及已参保状态下的人员',
            type: 'warning'
          })
          return
        }
      } else if (selectedObj.month_date && selectedObj.fund_month_date) {
        if (canArr.indexOf(selectedObj['fund_status_name']) == -1 && canArr.indexOf(selectedObj['insurance_status_name']) == -1) {
          this.$message({
            showClose: true,
            message: '减员仅能减参保中及已参保状态下的人员',
            type: 'warning'
          })
          return
        }
      }
      // 禁用社保公积金弹窗里日期选择
      if (canArr.indexOf(selectedObj['fund_status_name']) == -1) {
        this.fund_can_selected = true
      } else {
        this.fund_can_selected = false
      }
      if (canArr.indexOf(selectedObj['insurance_status_name']) == -1) {
        this.ss_can_selected = true
      } else {
        this.ss_can_selected = false
      }
      this.downSizeVisible = true
    },
    // 新增导入
    addImport() {
      this.$refs.importRef.dialogImport = true;
    },
    // 批量减员
    reduceImport() {
      this.$refs.importReduceRef.dialogImport = true;
    },
    // 导出名单
    exportList() {
      const { user, staffStatus, cityId, districtCounty, ssStatus, ssMonth, fundStatus, fundMonth } = this.formInline
      const exportParams = {
        saas_project_id: this.project_id,
        list_type: 1,
        user_info: user,
        user_status: staffStatus,
        insurance_city: cityId,
        insurance_status: ssStatus,
        month_date: ssMonth ? util.formatData2(ssMonth) : '',
        fund_status: fundStatus,
        fund_month_date: fundMonth ? util.formatData2(fundMonth) : '',
        is_district: 0
      }
      const resultParams = {
        saas_project_id: this.project_id,
        list_type: 1,
      }
      // 判断区县是否有值
      if(districtCounty) {
        exportParams.insurance_city = districtCounty
        exportParams.is_district = 1
      }
      this.exportParams = exportParams;
      this.resultParams = resultParams;
      setTimeout(() => {
        this.$refs.exportRef.submitImport();
      }, 500)
    },
    handleClose() {
      this.downSizeVisible = false;
      this.leave_reason = '';
      this.ss_down_date = '';
      this.fund_down_date = '';
      this.quit_date = '';
    },
    // 减员提交
    downSizeFun() {
      if (!this.leave_reason) {
        this.$message({
          showClose: true,
          message: '请勾选人员离职性质',
          type: 'warning'
        });
        return;
      }
      if (this.ssDownDateShow == true && this.fundDownDateShow == false && !this.ss_down_date) {
        this.$message({
          showClose: true,
          message: '请勾选社保减员生效时间',
          type: 'warning'
        });
        return;
      }
      if (this.fundDownDateShow == true && this.ssDownDateShow == false && !this.fund_down_date) {
        this.$message({
          showClose: true,
          message: '请勾选公积金减员生效时间',
          type: 'warning'
        });
        return;
      }
      if (this.fundDownDateShow == true && this.ssDownDateShow == true) {
        console.log('this.fund_can_selected==', this.fund_can_selected, this.ss_can_selected)
        if (this.fund_can_selected == false && !this.fund_down_date) {
          this.$message({
            showClose: true,
            message: '请勾选公积金减员生效时间',
            type: 'warning'
          });
          return;
        }
        if (this.ss_can_selected == false && !this.ss_down_date) {
          this.$message({
            showClose: true,
            message: '请勾选社保减员生效时间',
            type: 'warning'
          });
          return;
        }
      }
      if (!this.quit_date) {
        this.$message({
          showClose: true,
          message: '请选择离职日期',
          type: 'warning'
        });
        return;
      }
      this.percentage = 0;
      this.progressInfo = '';
      this.canClosed = true;
      const data = {
        saas_project_id: this.project_id,
        user_ids: this.user_ids.join(','),
        leave_reason: this.leave_reason,
        social_security_month: this.ss_down_date ? util.formatData2(this.ss_down_date) : '',
        provident_fund_month: this.fund_down_date ? util.formatData2(this.fund_down_date) : '',
        leave_date: this.quit_date ? util.formatData1(this.quit_date) : ''
      }
      util.ajax({
        url: '/fulltimess/soloreducess',
        data: data,
        type: 'GET',
        success: (res) => {
          if (res.errno == 0) {
            this.progressDialog = true;
            this.progressInfo = "开始减员申请，请等待~";
            this.getDownSizeResult()
            let _time = 0;
            this.timer = setInterval(() => {
              _time++;
              if (_time > 199) {
                clearInterval(this.timer)
              };
              this.getDownSizeResult();
            }, 1000)
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
          console.log('xhr==', xhr)
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
    // 获取单个减员结果
    getDownSizeResult() {
      const data = {
        saas_project_id: this.project_id,
        type: 1,
      }
      util.ajax({
        url: '/fulltimess/batchreducess/getresult',
        data: data,
        type: 'GET',
        success: (res) => {
          if (res.errno == 0 && res.data.end_time == 0) {
            this.progressInfo = "正在处理数据中，请耐心等待~";
            let percentage = parseInt(
              (res.data.processed_shard_num / res.data.total_shard_num) * 100
            );
            this.percentage = percentage;
          } else if (res.errno == 0 && res.data.end_time > 0) {
            clearInterval(this.timer);
            this.percentage = 100;
            this.progressInfo = "减员操作已申请，我们会尽快处理";
            this.canClosed = false;
            this.total_detail_num = res.data.total_detail_num;
            this.insert_sum = res.data.insert_sum;
            this.error_sum = res.data.error_sum;
            if (res.data.error_sum > 0) {
              if (res.data.error_list && res.data.error_list.length) {
                this.errtableData = res.data.error_list;
              }
            }
          } else {
            this.canClosed = false;
            this.progressDialog = false;
            clearInterval(this.timer);
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'error'
            });
          }
        },
        error: (xhr, status) => {
          console.log('xhr==', xhr)
          this.canClosed = false;
          this.progressDialog = false;
          clearInterval(this.timer);
        },
        noNetwork: () => {
          this.canClosed = false;
          this.progressDialog = false;
          clearInterval(this.timer);
          // 网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    // 关闭
    sureClose() {
      this.progressDialog = false;
      this.downSizeVisible = false;
      this.page_no = 1;
      this.getList();
    },
    // 新增备注
    addRemark(row) {
      this.remarkDialog = true
      console.log('row===', row)
      this.ssDetId = row.id
    },
    remarkHandleClose() {
      this.remarkDialog = false
      this.remarkForm.mark = ''
    },
    addSure() {
      const data = {
        id: this.ssDetId,
        remark: this.remarkForm.mark,
      };
      util.ajax({
        url: '/fulltimess/ssfund/add_record',
        data: data,
        type: 'GET',
        success: (res) => {
          if (res.errno == '0') {
            this.$message({
              message: '新增备注成功',
              type: "success",
            });
            this.remarkDialog = false
            this.remarkForm.mark = ''
            this.page_no = 1
            this.getList()
          } else {
            this.$message({
              message: res.errmsg,
              type: "error",
            });
          }
        },
        error: (xhr, status) => {
          console.log('xhr==', xhr)
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
    insuredCityChange() {
      this.formInline.districtCounty = ''
      this.districtCounty_list = []
      if(!this.formInline.cityId) {
        return
      }
      const data = {
        city_id: this.formInline.cityId
      };
      util.ajax({
        url: '/common/district/get',
        data: data,
        type: 'GET',
        success: (res) => {
          if (res.errno == '0') {
            this.districtCounty_list = res.data
          } else {
            this.$message({
              message: res.errmsg,
              type: "error",
            });
          }
        },
        error: (xhr, status) => {
          console.log('xhr==', xhr)
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
  },
}
</script>
<style scoped>
.table_operate {
  margin: 0 0 10px 0;
}
.operate_wrap {
  float: right;
  margin-top: 5px;
  font-size: 16px;
}
.operate_wrap .batchBtn {
  margin-right: 5px;
}
.downDialog div {
  font-size: 14px;
}
.downBody {
  margin: 10px 20px;
  font-size: 14px;
}
.downPersons {
  margin: 15px 0;
}
.downPersons span {
  font-size: 14px;
}
.downTips {
  color: red;
}
.quitSelect {
  margin: 20px 0;
}
.quitSelect span {
  font-size: 14px;
}
.quitSelect2 {
}
.ss_check {
  margin: 0 0 5px 0;
}
.progressMes {
  margin: 10px;
}
/* .failList {
  margin: 0 20px;
} */
.p_title {
  margin: 20px 0 10px 0;
}
.successTxt {
  /* margin-left: 20px; */
  font-size: 16px;
  color: #13ce66;
}
.table-wrap {
  margin: 0;
}
.form_wrap .el-table__fixed,.el-table__fixed-right {
  height: 442px;
}
</style>
