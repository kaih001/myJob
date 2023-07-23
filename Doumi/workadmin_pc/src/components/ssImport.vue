<template>
  <div class="">
    <div class="dialog-import">
      <el-dialog :title="dialogTitle" :visible.sync="dialogImport" @close="cancelImport('ruleForm')" size="tiny">
        <div style="">
          <div style="fontSize:14px;width:100%;marginBottom:15px">
            <!-- <p class="formTips">只能上传1个Excel类型文件</p> -->
            <p class="formTips">
              按照标准模板导入:
              <a :href="tempHref" download="task_detail_template" class="createTask">下载表格模版</a>
            </p>
          </div>
          <p class="uploadText">上传要导入的excel：</p>
          <el-upload action="" :on-change="onChange" :auto-upload="false" :on-remove="handleRemove" accept=".xls, .xlsx" ref="uploadRef">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelImport('ruleForm')" class="btn1">取 消</el-button>
          <el-button type="primary" @click="submitImport('ruleForm')" class="btn2">导 入</el-button>
        </span>
      </el-dialog>
    </div>
    <el-dialog title="进度提示" :visible.sync="progressDialog" :show-close="false" :close-on-click-modal="false" custom-class="progressWrap">
      <div class="circleWrap">
        <el-progress type="circle" :percentage="percentage" v-if="percentage == 0"></el-progress>
        <el-progress type="circle" :percentage="percentage" v-if="percentage !== 0 && percentage !== 100"></el-progress>
        <el-progress type="circle" :percentage="percentage" status="success" v-if="percentage == 100"></el-progress>
      </div>
      <div class="progressMes" :class="[percentage == 100?'green':'']">{{progressInfo}}</div>
      <div class="successTxtWrap">
        <span class="successTxt">
          总共上传{{total_detail_num}}条，上传成功{{insert_sum}}条，
          <span style="color:red;font-size:16px;">
            上传失败{{error_sum}}条
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
  </div>
</template>

<script>
import $ from "jquery";
import * as util from "../assets/js/util.js";

export default {
  name: "",
  components: {},
  props: {
    dialogTitle: {
      type: String,
      default: ''
    },
    // 模板地址
    tempHref: {
      type: String,
      default: ''
    },
    // 请求接口的地址
    requestUrl: {
      type: String,
      default: ''
    },
    // 查询结果接口的地址
    resultUrl: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      team_id: '',
      project_id: '',
      dialogImport: false,
      timer: null,
      progressInfo: '',
      percentage: 0,
      progressDialog: false,
      form_data: new FormData(),
      canClosed: false,
      total_detail_num: 0,
      insert_sum: 0,
      error_sum: 0,
      errtableData: [],
    }
  },
  computed: {

  },
  watch: {

  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      // console.log('this.team_id===', this.team_id)
      // console.log('this.project_id===', this.project_id)
    },
    cancelImport() {
      this.dialogImport = false;
      this.$refs.uploadRef.clearFiles();
      this.form_data.delete("ss_fund_file");
    },
    onChange(file, fileList) {
      const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
      const whiteList = ['xls', 'xlsx'];
      const isSuffix = whiteList.indexOf(fileSuffix) === -1;
      if (isSuffix) {
        this.$message.error('请上传excel文件');
        /* 验证不通过删除此文件 */
        const currIdx = fileList.indexOf(file);
        fileList.splice(currIdx, 1);
        return;
      }
      if (file.status === "ready") {
        // 已上传文件列表如果存在 2 条记录，移除第一条，实现替换效果
        if (fileList.length === 2) {
          fileList.shift();
        }
      }
      // console.log('file===onChange', file, fileList);
      this.file_text = file.name;
      this.form_data.set("ss_fund_file", file.raw);        //添加文件
    },
    handleRemove(file, fileList) {
      this.form_data.delete("ss_fund_file");
    },
    //上传提交
    submitImport(formName) {
      this.errtableData = [];
      this.percentage = 0;
      this.progressInfo = '';
      this.canClosed = true;
      if (!this.file_text) {
        this.$message({
          showClose: true,
          message: "选择你要导入的文件",
          type: "warning",
        });
        return;
      }
      this.form_data.set("dmclient", 'pcweb')
      this.form_data.set("saas_project_id", this.project_id)
      $.ajax({
        url: util.host + this.requestUrl,
        type: "POST",
        data: this.form_data,
        processData: false,
        contentType: false,
        xhrFields: {
          withCredentials: true,
        },
        timeout: 10000,
        success: (res) => {
          if (res.errno == '0') {
            this.progressDialog = true;
            let _time = 0;
            this.timer = setInterval(() => {
              _time++;
              if (_time > 199) {
                clearInterval(this.timer)
              };
              this.getCurrProgress();
            }, 1000)
          } else {
            clearInterval(this.timer)
            this.$message({
              message: res.errmsg,
              type: "error",
            });
          }
        },
        error: (xhr, status) => {
          clearInterval(this.timer);
          this.canClosed = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
        noNetwork: () => {
          clearInterval(this.timer);
          this.canClosed = false;
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    // 获取上传结果
    getCurrProgress() {
      const currParams = {
        saas_project_id: this.project_id,
      };
      if(this.dialogTitle == '批量减员') {
        currParams.type = 2
      }
      util.ajax({
        url: this.resultUrl,
        type: 'GET',
        data: currParams,
        timeout: 1000 * 10 * 60,
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
            this.progressInfo = "导入完成";
            this.canClosed = false;
            this.total_detail_num = res.data.total_detail_num;
            this.insert_sum = res.data.insert_sum;
            this.error_sum = res.data.error_sum;
            if (res.data.error_sum > 0) {
              if (res.data.error_list && res.data.error_list.length) {
                this.errtableData = res.data.error_list;
              }
            }
            this.$refs.uploadRef.clearFiles();
          } else {
            this.canClosed = false;
            this.progressDialog = false;
            clearInterval(this.timer);
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'error'
            });
            this.$refs.uploadRef.clearFiles();
          }
        },
        error: (xhr, status) => {
          this.canClosed = false;
          this.progressDialog = false;
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        },
        noNetwork: () => {
          this.canClosed = false;
          this.progressDialog = false;
          //网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    sureClose() {
      this.progressDialog = false;
      this.cancelImport();
      this.$emit('updateListFun');
    },
  },
}
</script>
<style src="../assets/css/ssTabIn.css"></style>
<style scoped>
.uploadText {
  font-size: 14px;
  margin: 5px 0;
}
.progressWrap {
  width: 100%;
}
.progressWrap .circleWrap {
  width: 100%;
  margin: 10px 0 10px 0;
}
.progressWrap .progressMes {
  text-align: center;
  font-size: 14px;
}
.progressWrap .progressMes.green {
  color: #13ce66;
}
.successTxtWrap {
  margin: 10px 0;
}
.successTxt {
  font-size: 16px;
  color: #13ce66;
}
.p_title {
  margin: 20px 0 10px 0;
}
.failMes_tips {
  margin-left: 5px;
  font-size: 12px;
  color: #999999;
}
.table-wrap {
  margin: 0;
}
.formTips, .formTips a {
  font-size: 14px;
}
</style>
<style>
.progressWrap .el-dialog__body {
  margin: 0 10px!important;
}
.dialog-import .el-dialog__body{
    padding-top: 19px!important;
}
</style>