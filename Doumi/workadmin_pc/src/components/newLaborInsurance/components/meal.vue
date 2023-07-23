<template>
  <div class="meal-cp">
    <div class="meal-op">
      <p class="contact">客服电话/微信：{{ contact }}</p>
      <div class="add-btn" @click="addPerson">
        <i class="add_icon"></i>
        添加投保人
      </div>
    </div>
    <el-table
      :data="tableList"
      border
      style="width: 100%"
      empty-text="暂无数据"
      :height="tableHeight"
    >
      <el-table-column show-overflow-tooltip label="保障种类 " width="110">
        <template slot-scope="scope">
          <span>{{ scope.row.ext.category_name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="adv_name"
        show-overflow-tooltip
        label="保障方案"
        width="150"
      ></el-table-column>
      <el-table-column show-overflow-tooltip label="保障责任">
        <template slot-scope="scope">
          <span>{{ scope.row.ext.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.ext.price + scope.row.ext.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="职位类别" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.ext.post_type }}</span>
        </template>
      </el-table-column>
    </el-table>
    <template v-if="total != 0">
      <el-pagination
        @current-change="handleSizeChange"
        :current-page.sync="page_no"
        :page-size="page_size"
        layout="total, prev, pager, next"
        :total="total"
      >
      </el-pagination>
    </template>
    <p class="meal-info" style="color: #ffa928">
      备注：月单和日单雇主险当天16：00之前投保，T＋1生效；当天16：00以后投保，T＋2生效；日单意外险当天23：40之前投保，当天生效，23：40之后投保，T＋1生效；
    </p>
  </div>
</template>

<script>
import $ from "jquery";
import * as util from "@/assets/js/util.js";

export default {
  name: "mealCp",
  data() {
    return {
      contact: "010-57977118",
      tableList: [],
      tableHeight: 0,
      total: 0,
      page_no: 1,
      page_size: 10,
      team_id: "",
      project_id: "",
    };
  },
  props: [],
  watch: {
    '$route'(to, from) {
      if(to.params.projectId){
        this.project_id = to.params.projectId
      }
      this.getPackage()
    }
  },
  methods: {
    init() {
      this.tableHeight = window.innerHeight - 255;
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.getPackage();
    },
    getPackage() {
      util.ajax({
        url: "/insurance/query/adv_buy_list",
        type: "POST",
        data: {
          project_id: this.project_id,
          charge_type: 40,
          team_id: this.team_id,
        },
        timeout: 10000,
        success: (result) => {
          if (result && result.errno == 0) {
            this.tableList = result.data;
          }
        },
        error: (xhr, status) => {
          this.alertinfo("服务器异常");
        },
        noNetwork: () => {
          this.alertinfo("网络连接失败，请检查网络");
        },
      });
    },
    handleSizeChange() {
      this.loading = true;
      this.getPayrollList();
    },
    addPerson() {
      this.$router.replace("insuranceAddPerson");
    },
    // 显示错误信息
    alertinfo(text, type) {
      this.$message({
        showClose: true,
        message: text,
        type: type || "warning",
      });
    },
  },
  mounted() {
    console.log("mounted++++++++++++++=");
    this.init();
  },
};
</script>
<style scoped>
.meal-cp .meal-op {
  display: flex;
  justify-content: space-between;
}
.meal-cp .add-btn {
  color: #6699ee;
  font-size: 14px;
  cursor: pointer;
}
.meal-cp .meal-op .add_icon {
  display: block;
  width: 13px;
  height: 13px;
  margin-right: 6px;
  float: left;
  background-image: url(../../../assets/imgs/shareIcon/add_hover.svg);
}
.meal-info {
  font-size: 12px;
  color: #99a9bf;
  letter-spacing: 0;
  line-height: 20px;
  margin-top: 16px;
}
</style>
