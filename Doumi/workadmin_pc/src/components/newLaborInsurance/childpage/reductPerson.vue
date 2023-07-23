<template>
  <div class="insurance-addperson">
    <div class="kq-wapper">
      <div class="headertitle clearfix">
        <h2 class="fl">
          <span @click="goInsurance">用工保险</span>
          <i class="icon-arrow-right"></i> 减员操作
        </h2>
      </div>
      <div class="reduct-container">
        <el-steps :active="step" align-center>
          <el-step title="上传数据"></el-step>
          <el-step title="核对数据"></el-step>
        </el-steps>
        <block v-if="step === 1">
          <div class="notice">
            <div class="title">注意:</div>
            <div class="first-line">1.不在本次保单中的人员无法减员</div>
            <div class="second-line">
              2.减员的终保日期需小于当前在保人员的终保日期
            </div>
          </div>
          <div class="downloadTemplate">
            <div class="title">下载文件模板：</div>
            <a class="content" href="https://attach.doumi.com/88/3451d3664b07e4/%E5%87%8F%E5%91%98%E6%A8%A1%E6%9D%BF.xlsx">减员人员名单.xls</a>
          </div>
          <div class="uploadTemplate">
            <div class="title">上传被保人员名单：</div>
            <div class="upload">
              <el-upload ref="upload" class="upload-demo" name="downsize_excel" :with-credentials="true" :headers="cookie" :data="ruleForm" :action="actionUrl" :on-success="handleSuccess" :file-list="fileList" :on-change="onChangeFile">
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传excel文件</div>
              </el-upload>
            </div>
          </div>
        </block>
        <block v-else>
          <div class="execl-table">
            <el-table :data="tableData" style="width: 100%" height="250">
              <el-table-column prop="real_name" label="姓名"> </el-table-column>
              <el-table-column prop="mobile" label="手机号"> </el-table-column>
              <el-table-column prop="idnumber" label="身份证号" width="180">
              </el-table-column>
              <el-table-column prop="start_date" label="起保日期">
              </el-table-column>
              <el-table-column prop="old_end_date" label="原终保日期">
              </el-table-column>
              <el-table-column prop="new_end_date" label="现终保日期">
              </el-table-column>
              <el-table-column prop="insurance_plan" label="投保方案">
              </el-table-column>
              <el-table-column prop="refund_amount" label="返费金额(元)">
                <template slot-scope="scope">
                  <span>{{ scope.row.refund_amount / 100 }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="table-info">
            <div class="left">
              <div class="total">总人数：{{ total_num }}人</div>
              <div class="money">总返费金额：{{ total_amount/100 }}元</div>
            </div>
            <div class="right">
              <el-button type="primary" @click="submit">确认提交</el-button>
            </div>
          </div>
        </block>
      </div>
    </div>
  </div>
</template>
<script>
import * as util from "@/assets/js/util.js";

export default {
  name: "reductPerson",
  components: {},
  data() {
    return {
      step: 1,
      actionUrl: `//work.doumi.com/sea/api/1.0/client/v1/insurance/audit/downsize_upload?dmclient=pcweb`,
      fileList: [],
      ruleForm: {
        audit_id: "",
        project_id: "",
        team_id: ""
      },
      tableData: [],
      total_amount: 0,
      total_num: 0,
      list_key: "",
    };
  },
  computed: {
    tableHeight() {
      return document.body.clientHeight - 804;
    },
    cookie() {},
  },
  methods: {
    init() {
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      if (this.$route.query.id) {
        this.audit_id = this.$route.query.id;
      }
      this.ruleForm = {
        audit_id: this.audit_id,
        project_id: this.project_id,
        team_id: this.team_id,
        dmclient: "pcweb",
      };
    },
    //面包屑返回
    goInsurance() {
      this.$router.replace({
        name: "newLaborInsurance",
        query: {
          from: "insuranceManage",
        },
      });
    },
    onChangeFile(file, fileList) {
      if (file.status === "ready") {
        // 已上传文件列表如果存在 2 条记录，移除第一条，实现替换效果
        if (fileList.length === 2) {
          fileList.shift();
        }
      }
      this.fileList = fileList;
    },
    handleSuccess(res) {
      if (res.errno === "0") {
        this.tableData = res.data.list;
        this.total_amount = res.data.total_amount;
        this.total_num = res.data.total_num;
        this.list_key = res.data.list_key;
        this.step = 2;
      } else {
        this.$message({
          showClose: true,
          message: res.errmsg+':  '+res.data.error_list,
          type: "warning",
        });
        this.$refs.upload.clearFiles();
      }
    },
    submit() {
      util.ajax({
        url: "/insurance/audit/downsize",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          dmclient: "pcweb",
          audit_id: this.audit_id,
          total_amount: this.total_amount,
          total_num: this.total_num,
          downsize_list_key: this.list_key,
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.goInsurance();
            console.log("------------");
            console.log(obj);
            this.$message({
              showClose: true,
              message: "减员成功",
              type: "success",
            });
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {
          this.goInsurance();
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
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    $route(to, from) {
      // 对路由变化作出响应...
      this.init();
    },
  },
};

</script>
<style src="@/assets/css/base.css"></style>
<style src="@/assets/css/addperson.css"></style>
<style>
.reduct-container {
  padding: 16px;
}

.notice {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  color: #909399;
  font-size: 12px;
  background-color: #f4f4f5;
  padding: 8px 16px;
}

.notice .title {
  padding: 10px;
  font-weight: 700;
  font-size: 13px;
  line-height: 18px;
  color: #909399;
}

.first-line,
.second-line {
  padding: 10px;
}

.downloadTemplate {
  margin-top: 40px;
  display: flex;
  align-items: center;
}

.downloadTemplate .content {
  font-weight: 700;
  font-size: 14px;
  color: #6699ee;
  cursor: pointer;
  text-decoration: underline;
}

.downloadTemplate .title {
  margin-right: 20px;
  font-weight: 700;
  font-size: 14px;
}

.uploadTemplate {
  margin-top: 30px;
  display: flex;
}

.uploadTemplate .title {
  font-weight: 700;
  margin-top: 20px;
  margin-right: 20px;
  font-size: 14px;
}

.uploadTemplate .upload {
  margin-top: 10px;
}

.execl-table {
  margin-top: 30px;
}

.table-info {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-info .left {
  display: flex;
  font-weight: 700;
}

.table-info .left .money {
  margin-left: 20px;
  font-size: 14px;
}

.table-info .left .total {
  font-size: 14px;
}

</style>
