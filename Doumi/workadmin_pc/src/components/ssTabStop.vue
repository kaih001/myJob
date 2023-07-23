<template>
  <div class="">
    <div class="form_wrap">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="人员信息：">
          <el-input v-model="formInline.user" clearable placeholder="姓名/身份证号/手机号"></el-input>
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
          <el-select v-model="formInline.insurance_status" placeholder="请选择">
            <el-option v-for="(value,key) in (searchData.insurance_status||{})" :key="key" :label="value" :value="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="公积金状态">
          <el-select v-model="formInline.fund_status" placeholder="请选择">
            <el-option v-for="(value,key) in (searchData.fund_status||{})" :key="key" :label="value" :value="key"></el-option>
          </el-select>
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
          <el-button type="primary" @click="widthdrawDownSizing">撤回减员</el-button>
        </span>
        <span class="operate_wrap">
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
          <el-table-column label="参保城市" width="120" property="insurance_city_name">
          </el-table-column>
          <el-table-column label="离职原因" width="120" property="leave_reason">
          </el-table-column>
          <el-table-column label="离职日期" width="120">
            <template scope="scope">
              {{ scope.row.leave_date }}
            </template>
          </el-table-column>
          <el-table-column label="社保减员月份" width="150">
            <template scope="scope">{{ scope.row.social_security_month }}</template>
          </el-table-column>
          <el-table-column label="社保状态" width="150">
            <template scope="scope">{{ scope.row.insurance_status_name }}</template>
          </el-table-column>
          <el-table-column label="公积金减员月份" width="150">
            <template scope="scope">{{ scope.row.provident_fund_month }}</template>
          </el-table-column>
          <el-table-column label="公积金状态" width="150">
            <template scope="scope">{{ scope.row.fund_status_name }}</template>
          </el-table-column>
          <!-- <el-table-column label="审批状态" width="120">
            <template scope="scope">{{ scope.row.approval_status_name }}</template>
          </el-table-column> -->
          <el-table-column label="供应商" width="120">
            <template scope="scope">{{ scope.row.supplier_name }}</template>
          </el-table-column>
          <el-table-column label="社保实际减员月" width="150">
            <template scope="scope">{{ scope.row.social_security_real_month }}</template>
          </el-table-column>
          <el-table-column label="公积金实际减员月" width="150">
            <template scope="scope">{{ scope.row.provident_fund_rea_month }}</template>
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
        </el-table>
        <!--分页-->
        <div class="pagination">
          <el-pagination background @current-change="handleCurrentPageChange" :current-page.sync="page_no" :page-size="page_size" layout="total, prev, pager, next" :total="total_num">
          </el-pagination>
        </div>
      </div>
    </div>
    <!-- 导出名单 -->
    <ssExport ref="exportRef" :requestUrl="requestUrl_export" :resultUrl="resultUrl_export" :exportParams="exportParams" :resultParams="resultParams" @updateListFun="updateListFun"></ssExport>
  </div>
</template>

<script>
import * as util from "../assets/js/util.js";
import mixinAll from '../mixins/searchMixin.js';
import ssExport from "./ssExport.vue";
let mixinInstance = new mixinAll({
  list_type: 2
})
export default {
  name: "",
  components: {
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
        cityId: '',
        districtCounty: '',
        insurance_status: '-1',
        fund_status: '-1'
      },
      tableData: [],
      multipleSelection: [],
      total_num: 0,
      page_size: 10,
      page_no: 1,
      requestUrl_export: '/fulltimess/ssfundlist/export',  // 导出名单
      resultUrl_export: '/fulltimess/ssfundlist/export/getresult',  // 导出名单结果查询
      exportParams: {},
      resultParams: {}
    }
  },
  computed: {

  },
  watch: {

  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      this.getList()
    },
    onSubmit() {
      this.page_no = 1;
      this.getList();
    },
    resetFun() {
      this.formInline = {
        user: '',
        cityId: '',
        districtCounty: '',
        insurance_status: '-1',
        fund_status: '-1'
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
      const { user, cityId, districtCounty, insurance_status, fund_status } = this.formInline
      const listParams = {
        saas_project_id: this.project_id,
        list_type: 2,
        page: this.page_no,
        page_size: this.page_size,
        user_info: user,
        insurance_city: cityId,
        insurance_status: insurance_status,
        fund_status: fund_status,
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
    // 撤回减员
    widthdrawDownSizing() {
      if (this.multipleSelection.length === 0) {
        this.$message({
          showClose: true,
          message: '撤回减员前请先勾选列表项',
          type: 'warning'
        });
        return;
      }
      this.$alert('确定要撤回减员吗', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
        callback: action => {
          if (action == 'confirm') {
            const rowids = [];
            this.multipleSelection.forEach(item => rowids.push(item.id))
            const data = {
              saas_project_id: this.project_id,
              social_security_detail_id: rowids,
            }
            util.ajax({
              url: '/fulltimess/revocation/reducess',
              data: data,
              type: 'GET',
              success: (res) => {
                if (res.errno == 0) {
                  this.$message({
                    showClose: true,
                    message: '撤回减员成功',
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
    // 导出名单
    exportList() {
      const { user, cityId, districtCounty, insurance_status, fund_status } = this.formInline
      const exportParams = {
        saas_project_id: this.project_id,
        list_type: 2,
        user_info: user,
        insurance_city: cityId,
        insurance_status: insurance_status,
        fund_status: fund_status,
        is_district: 0
      }
      const resultParams = {
        saas_project_id: this.project_id,
        list_type: 2,
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
      this.downSizeVisible = false
    },
    // 减员提交
    downSizeFun() {

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
</style>
