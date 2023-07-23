<template>
  <div class="">
    <div class="form_wrap">
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="人员信息：">
          <el-input v-model="formInline.user" placeholder="姓名/身份证号/手机号"></el-input>
        </el-form-item>
        <el-form-item label="员工状态">
          <el-select v-model="formInline.staffStatus" placeholder="请选择">
            <el-option v-for="item in staffStatusList" :label="item.name" :key="item.id" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="参保城市">
          <el-select v-model="formInline.city" placeholder="请选择">
            <el-option v-for="item in cityList" :label="item.name" :key="item.id" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="社保状态">
          <el-select v-model="formInline.ssStatus" placeholder="请选择">
            <el-option v-for="item in ss_status_list" :label="item.name" :key="item.id" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="社保缴纳月份">
          <el-date-picker v-model="formInline.ssMonth" type="month" placeholder="选择月">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="公积金状态">
          <el-select v-model="formInline.fundStatus" placeholder="请选择">
            <el-option v-for="item in fund_status_list" :label="item.name" :key="item.id" :value="item.id"></el-option>
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
          <el-button type="primary">撤回报增</el-button>
          <el-button type="primary" @click="downSizing">减员</el-button>
        </span>
        <span class="operate_wrap">
          <el-button class="batchBtn" type="text" @click="addImport">
            <span style="font-size:14px">新增导入</span> 
          </el-button>
          <el-button class="batchBtn" type="text">
            <span style="font-size:14px">批量减员</span>
          </el-button>
          <el-button class="batchBtn" type="text">
            <span style="font-size:14px">导出名单</span>
          </el-button>
        </span>
      </div>
      <div class="table_list">
        <el-table ref="multipleTable" :data="tableData" border tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" fixed="left"></el-table-column>
          <el-table-column label="员工姓名" width="120" property="name">
          </el-table-column>
          <el-table-column label="参保城市" width="120" property="city">
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
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="户口性质" width="120">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="入职时间" width="120">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="员工状态" width="120">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="离职日期" width="120">
            <template scope="scope">
              <span v-if="!showLzDate">
                {{ scope.row.lzdate }} <i class="el-icon-edit" @click="modifyDate"></i>
              </span>
              <span v-if="showLzDate">
                <el-date-picker v-model="lzdate" type="date" placeholder="选择月">
                </el-date-picker>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="社保状态" width="120">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="社保开始缴纳月份" width="150">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="社保申报工资" width="120">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="公积金状态" width="120">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="公积金开始缴纳月份" width="150">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="公积金申报工资" width="150">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="公积金企业比例" width="150">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="公积金个人比例" width="150">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="社保供应商" width="120">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
          <el-table-column label="备注">
            <template scope="scope">{{ scope.row.idNum }}</template>
          </el-table-column>
        </el-table>
        <!--分页-->
        <div class="pagination">
          <el-pagination background @current-change="handleCurrentPageChange" :current-page.sync="page_no" :page-size="page_size" layout="total, prev, pager, next" :total="total_num">
          </el-pagination>
        </div>
      </div>
    </div>
    <el-dialog
      title="减员"
      custom-class="downDialog"
      :visible.sync="downSizeVisible"
      :before-close="handleClose">
      <div class="downBody">
        <div class="downPersons">
          <span>要减员的人员：</span>
          <span>{{allPersons}}</span>
        </div>
        <div class="downTips">提示：减员仅能减参保中及已参保状态下的人员，增员中的人员可以进行撤回报增</div>
        <div class="quitSelect">
          <span>
            人员离职性质：
          </span>
          <el-select v-model="quitText" placeholder="请选择" style="width:250px">
            <el-option
              v-for="item in quitList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="quitSelect quitSelect2">
          <p class="ss_check">
            <el-checkbox v-model="ss_checked">社保</el-checkbox>
          </p>
          <p>
            <span>
              减员生效时间：
            </span>
            <el-date-picker v-model="ss_down_date" type="month" placeholder="选择月" style="width:250px">
            </el-date-picker>
          </p>
        </div>
        <div class="quitSelect quitSelect2">
          <p class="ss_check">
            <el-checkbox v-model="fund_checked">公积金</el-checkbox>
          </p>
          <p>
            <span>
              减员生效时间：
            </span>
            <el-date-picker v-model="fund_down_date" type="month" placeholder="选择月" style="width:250px">
            </el-date-picker>
          </p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="downSizeVisible = false">取 消</el-button>
        <el-button type="primary" @click="downSizeFun">提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "",
  components: {},
  props: {},
  data() {
    return {
      staffStatusList: [
        {
          id: '0',
          name: '不限'
        },
        {
          id: '1',
          name: '在职'
        },
        {
          id: '2',
          name: '离职'
        },
      ],
      cityList: [],
      ss_status_list: [],
      fund_status_list: [],
      formInline: {
        user: '',
        staffStatus: '',
        city: '',
        ssStatus: '',
        ssMonth: '',
        fundStatus: '',
        fundMonth: ''
      },
      tableData: [],
      multipleSelection: [],
      showLzDate: false,
      total_num: 0,
      page_size: 10,
      page_no: 1,
      downSizeVisible: false,
      allPersons: [],
      quitText: '',
      quitList: [
        {
          value: '1',
          label: '主动离职'
        }, {
          value: '2',
          label: '被动离职'
        }, {
          value: '3',
          label: '其他'
        }
      ],
      ss_checked: false,
      ss_down_date: '',
      fund_checked: '',
      fund_down_date: '',
    }
  },
  computed: {

  },
  watch: {

  },
  mounted() {

  },
  methods: {
    onSubmit() {
      console.log('submit!');
    },
    resetFun() {
      this.formInline = {
        user: '',
        staffStatus: '',
        city: '',
        ssStatus: '',
        ssMonth: '',
        fundStatus: '',
        fundMonth: ''
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    modifyDate() {
      this.showLzDate = true
    },
    handleCurrentPageChange(val) {
      this.page_no = val;
      this.getList();
    },
    getList() {
      util.ajax({
        url: '',
        data: {
          project_id: this.project_id,
          team_id: this.team_id,
          page: this.page_no,
          page_size: this.page_size
        },
        type: 'POST',
        success: (res) => {
          if (res.errno == 0) {
            this.tableData = res.data.list;
            this.total_num = +res.data.page_data.total;
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
    // 减员
    downSizing() {
      this.downSizeVisible = true
    },
    // 新增导入
    addImport() {

    },
    handleClose() {
      this.downSizeVisible = false
    },
    // 减员提交
    downSizeFun() {

    }
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
