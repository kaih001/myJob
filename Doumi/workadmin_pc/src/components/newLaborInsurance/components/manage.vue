<template>
  <div class="manage-cp">
    <!-- 保单管理 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchPerson" class="demo-form-inline">
        <el-form-item label="投保日期">
          <el-date-picker
            type="daterange"
            placeholder="选择日期"
            range-separator="至"
            style="width: 225px"
            v-model="searchDate"
            value-format="yyyy-MM-dd"
            @change="datachange"
            :editable="false"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="人员">
          <el-autocomplete
            popper-class="my-autocomplete2"
            style="width: 150px"
            v-model="member"
            :fetch-suggestions="querySearch"
            custom-item="my-item-zh"
            :trigger-on-focus="false"
            placeholder="姓名/手机号"
            @select="handleSelect"
          >
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="auditStatus">
            <el-option label="不限" value="-99"></el-option>
            <el-option label="待审核" value="0"></el-option>
            <el-option label="拒绝" value="-1"></el-option>
            <el-option label="审核通过" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="投保状态">
          <el-select v-model="insuranceStatus">
            <el-option label="不限" value="-99"></el-option>
            <el-option label="已投保" value="1"></el-option>
            <el-option label="未投保" value="0"></el-option>
          </el-select>
        </el-form-item>

        <el-button type="primary" class="seach-btn" @click="searchBtnFn()"
          >搜 索</el-button
        >
      </el-form>
    </div>
    <el-table
      :data="tableList"
      border
      style="width: 100%"
      empty-text="暂无数据"
      :height="tableHeight"
    >
      <el-table-column
        prop="id"
        show-overflow-tooltip
        label="序号 "
        width="80"
      ></el-table-column>
      <el-table-column
        prop="order_no"
        show-overflow-tooltip
        label="保单申请批次号"
      ></el-table-column>
      <el-table-column
        prop="insure_date_text"
        show-overflow-tooltip
        label="投保日期"
        width="180"
      ></el-table-column>
      <el-table-column
        prop="start_date_text"
        show-overflow-tooltip
        label="起保日期"
        width="130"
      ></el-table-column>
      <el-table-column
        prop="end_date_text"
        show-overflow-tooltip
        label="终止日期"
        width="130"
      ></el-table-column>
      <el-table-column
        prop="total_num"
        show-overflow-tooltip
        label="投保人数"
        width="100"
      ></el-table-column>
      <el-table-column
        prop="payment_status_text"
        show-overflow-tooltip
        label="支付状态"
        width="150"
      >
        <template slot-scope="scope">
          <span>{{
            scope.row.payment_status_text === "默认"
              ? "未支付"
              : scope.row.payment_status_text
          }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="账单金额（元）" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.total_amount / 100 }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="approve_status_text"
        show-overflow-tooltip
        label="审核状态"
        width="130"
      ></el-table-column>
      <el-table-column
        prop="insurance_status_text"
        show-overflow-tooltip
        label="投保状态"
        width="130"
      ></el-table-column>
      <el-table-column
        prop="insurance_type_text"
        show-overflow-tooltip
        label="投保类型"
        width="130"
      ></el-table-column>
      <el-table-column
        prop="remark"
        show-overflow-tooltip
        label="操作"
        width="80"
      >
        <template scope="scope">
          <el-button
            v-if="scope.row.is_downsize !== 1 && scope.row.payment_status == 1"
            @click.native.prevent="reduct(scope)"
            type="text"
            size="small"
          >
            减员
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <template v-if="total_num / page_size > 1">
      <el-pagination
        @current-change="handleSizeChange"
        :current-page.sync="page_no"
        :page-size="page_size"
        layout="total, prev, pager, next"
        :total="total_num"
      >
      </el-pagination>
    </template>
  </div>
</template>

<script>
import $ from "jquery";
import * as util from "@/assets/js/util.js";

export default {
  name: "mealCp",
  data() {
    return {
      searchDate: "",
      insuranceStatus: "-99",
      auditStatus: "-99",
      tableList: [],
      tableHeight: 0,
      total_num: 0,
      page_no: 1,
      start_date: "",
      end_date: "",
      page_size: 20,
      team_id: "",
      project_id: "",
      page_no: 1,
      member: "",
      member_user_id: "",
    };
  },
  props: [],
  watch: {},
  methods: {
    init() {
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.tableHeight = window.innerHeight - 255;
      this.getTableList();
    },
    handleSizeChange() {
      //this.loading = true;
      this.getTableList();
    },
    getTableList() {
      util.ajax({
        url: "/insurance/query/policy_list",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          start_date: this.start_date,
          end_date: this.end_date,
          approve_status: this.auditStatus,
          insurance_status: this.insuranceStatus,
          page_no: this.page_no,
          page_size: this.page_size,
          user_id:this.member?this.member_user_id:''
        },
        timeout: 10000,
        success: (result) => {
          if (result.errno == 0) {
            this.tableList = result.data.list;
            this.total_num = +result.data.total_num;
          } else {
            this.tableList = [];
            this.alertinfo(result.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo("网络连接失败，请检查网络");
        },
        noNetwork: () => {
          this.alertinfo("网络连接失败，请检查网络");
        },
      });
    },
    datachange(val) {
      if (val) {
        this.timeval = val;
        let ut_date = val.split("至")[0],
          end_date = val.split("至")[1];
        this.start_date = (new Date(ut_date).getTime() - 28800000) / 1000;
        this.end_date =
          (new Date(end_date).getTime() - 28800000) / 1000 + 86399;
      } else {
        this.timeval = "";
        this.start_date = "";
        this.end_date = "";
      }
    },
    // 显示错误信息
    alertinfo(text, type) {
      this.$message({
        showClose: true,
        message: text,
        type: type || "warning",
      });
    },
    searchBtnFn() {
      this.page_no = 1;
      this.getTableList();
    },
    reduct(scope) {
      console.log(scope.row.id);
      this.$router.replace({
        name: "insuranceReductPerson",
        query: {
          id: scope.row.id
        },
      });
    },
    querySearch(queryString, cb) {
      if (queryString) {
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
            page_size: "",
          },
          timeout: 10000,
          success: (obj) => {
            console.log("------------");
            console.log(obj);
            if (obj && obj.errno == 0) {
              let strArr = [];
              obj.data.list.forEach((o) => {
                let str = "";
                str = {
                  value: o.user_name,
                  group_name: o.group_name,
                  group_id: o.group_id,
                  user_id: o.user_id,
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
                type: "warning",
              });
            }
          },
          error: (xhr, status) => {
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
        });
      }
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase() ||
          restaurant.value.indexOf(queryString) > -1
        );
      };
    },
    //搜索建议列表选择赋值
    handleSelect(item) {
      if (item.status == -1) {
        console.log('@@@');
        this.member = "";
        this.member_user_id = "";
      } else {
        console.log('@@@2');
        this.member_user_id = item.user_id;
      }
    },
  },
  mounted() {
    this.init();
  },
};
</script>
