<template>
  <div class="project-detail">
    <div class="kqtask_top">
      <breadcrumb>
        <router-link to="overviews" replace>项目概览</router-link>
        <router-link to="">项目详情</router-link>
      </breadcrumb>
    </div>
    <div class="kqtask_main">
      <el-card class="box-card">
        <div class="card-item">
          <div class="card-label">SaaS项目ID：</div>
          <div class="card-text">
            {{ projectDetail.project_id || "暂无数据" }}
          </div>
        </div>
        <div class="card-item card-item-last">
          <div class="card-label">SaaS项目名称：</div>
          <div class="card-text">
            {{ projectDetail.project_name || "暂无数据" }}
          </div>
        </div>
      </el-card>
      <!-- <h1 class="info-title">绑定该SaaS项目的评估单信息：</h1>
      <el-card class="box-card">
        <div class="card-item">
          <div class="card-label">评估单ID：</div>
          <div class="card-text">{{projectDetail.project_evaluate_id||'暂无数据'}}</div>
        </div>
        <div class="card-item">
          <div class="card-label">评估单名称：</div>
          <div class="card-text">{{projectDetail.project_evaluate_title||'暂无数据'}}</div>
        </div>
        <div class="card-item">
          <div class="card-label">评估单状态：</div>
          <div class="card-text">{{projectDetail.project_evaluate_status_txt||'暂无数据'}}</div>
        </div>
        <div class="card-item">
          <div class="card-label">需求单ID：</div>
          <div class="card-text">{{projectDetail.project_demand_id||'暂无数据'}}</div>
        </div>
        <div class="card-item">
          <div class="card-label">对应的岗位：</div>
          <div class="card-text">{{projectDetail.project_demand_post||'暂无数据'}}</div>
        </div>
        <div class="card-item">
          <div class="card-label">客户名称：</div>
          <div class="card-text">{{projectDetail.project_demand_customer_title||'暂无数据'}}</div>
        </div>
        <div class="card-item card-item-last">
          <div class="card-label">商家账号：</div>
          <div class="card-text">{{projectDetail.project_demand_company_mobile||'暂无数据'}}</div>
        </div>
      </el-card> -->
      <h1 class="info-title">绑定该SaaS项目的评估单信息：</h1>
      <el-table :data="projectEvaluateList" stripe style="margin-top: 20px">
        <el-table-column
          prop="project_evaluate_id"
          label="评估单ID"
          width="100"
        >
        </el-table-column>
        <el-table-column
          prop="project_evaluate_title"
          label="评估单名称"
          width="180"
        >
        </el-table-column>
        <el-table-column
          prop="project_evaluate_status_txt"
          label="评估单状态"
          width="100"
        >
        </el-table-column>
        <el-table-column prop="project_demand_id" label="需求单ID" width="100">
        </el-table-column>
        <el-table-column prop="project_demand_post" label="对应的岗位" width="300">
        </el-table-column>
        <el-table-column prop="project_demand_customer_title" label="客户名称" width="300">
        </el-table-column>
        <el-table-column prop="project_demand_company_mobile" label="商家账号" min-width="180">
        </el-table-column>
      </el-table>
      <h1 class="info-title">招聘中的职位列表：</h1>
      <el-table :data="positionList" stripe style="margin-top: 20px">
        <el-table-column prop="id" label="职位ID" width="200">
        </el-table-column>
        <el-table-column prop="title" label="职位名称" width="300">
        </el-table-column>
        <el-table-column prop="real_name" label="职位发布人" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="职位发布账号"> </el-table-column>
        <el-table-column prop="project_demand_post" label="绑定的岗位"> </el-table-column>
      </el-table>
      <!-- <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="1000">
        </el-pagination>
      </div> -->
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import * as util from "@/assets/js/util.js";
import breadcrumb from "@/components/common/breadcrumb";

export default {
  name: "Projectdetail",
  components: {
    breadcrumb,
  },
  data() {
    return {
      projectDetail: {},
      positionList: [],
      projectEvaluateList: [],
      team_id: util.getLocalStorage("projectStorageInfo").team_id,
      project_id: util.getLocalStorage("projectStorageInfo").project_id,
    };
  },
  methods: {
    // 获取项目详情
    getProjectDetail() {
      util.ajax({
        url: "/project/detail",
        type: "GET",
        data: {
          project_id: this.project_id,
          team_id: this.team_id,
        },
        success: (res) => {
          console.log("考勤任务列表");
          if (res && res.errno == 0) {
            this.projectDetail = res.data.list || {};
            this.positionList = res.data.list.project_post_list || [];
            this.projectEvaluateList =
              res.data.list.project_evaluate_list || [];
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
  },
  mounted() {
    this.getProjectDetail();
  },
  watch: {},
};
</script>

<style>
.project-detail {
  padding: 0 20px;
}
.project-detail .kqtask_top {
  height: 50px;
  border-bottom: 1px solid #e0e6ed;
}
.box-card {
  margin-top: 20px;
}
.info-title {
  font-size: 16px;
  font-weight: bold;
  margin: 40px 0 0px;
}
.project-detail .card-item {
  display: flex;
  align-items: center;
  padding: 0 0 20px;
}
.project-detail .card-item-last {
  padding-bottom: 0;
}
.card-label {
  font-size: 14px;
  font-weight: bold;
}
.card-text {
  font-size: 14px;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: end;
  padding-bottom: 10px;
}
</style>
