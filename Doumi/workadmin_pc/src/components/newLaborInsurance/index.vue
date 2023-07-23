<template>
  <div id="labor-insurance">
    <div class="insurance-main">
      <div class="headertitle clearfix">
        <h2 class="fl">用工保险</h2>
        <div class="balance">
          <div class="balance-main">
            <span class="balance-t">余额：</span
            ><span class="amount">{{ balance }} 元</span>
          </div>
        </div>
      </div>
      <div class="head-tab">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="保险套餐" name="insurancePlan"></el-tab-pane>
          <el-tab-pane label="投保管理" name="insuranceManage"></el-tab-pane>
          <el-tab-pane label="保单统计" name="insuranceStatist"></el-tab-pane>
        </el-tabs>
      </div>
      <div class="table-main">
        <meal-cp v-if="activeName == 'insurancePlan'"></meal-cp>
        <manage-cp v-if="activeName == 'insuranceManage'"></manage-cp>
        <statistics-cp v-if="activeName == 'insuranceStatist'"></statistics-cp>
      </div>
    </div>
  </div>
</template>
<script>
import * as util from "../../assets/js/util.js";
import mealCp from "./components/meal.vue";
import statisticsCp from "./components/statistics.vue";
import manageCp from "./components/manage.vue";
export default {
  components: {
    mealCp,
    statisticsCp,
    manageCp,
  },
  data: function () {
    return {
      balance: 0,
      activeName: "insurancePlan",
      team_id: "",
      project_id: "",
    };
  },
  vuex: {
    getters: {},
    actions: {},
  },
  watch:{
    '$route'(to, from) {

      console.log('mmmmmmmmmmmmmmmmmm');
      this.activeName = 'insurancePlan'
    }
  },
  methods: {
    init() {
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.getBalance();
    },
    getBalance() {
      util.ajax({
        url: "/insurance/query/adv_balance",
        type: "GET",
        data: {
          project_id: this.project_id,
          adv_type: 35,
          team_id: this.team_id,
        },
        timeout: 10000,
        success: (result) => {
          if (result && result.errno == 0) {
            this.balance = +result.data.surplus_num / 100;
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
    handleClick(tab, event) {
      console.log(this.activeName);
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
  created() {
    this.init();
  },
  mounted() {
    if (this.$route.query.from) {
      this.activeName = this.$route.query.from;
    }

  },
};
</script>

<style src="@/assets/css/base.css"></style>
<style src="@/assets/css/newlaborinsurance.css"></style>
<style scope></style>
