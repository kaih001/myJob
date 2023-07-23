<template>
  <div class="">
    <el-dialog title="导出进度提示" :visible.sync="progressDialog" :show-close="false" :close-on-click-modal="false" custom-class="progressWrap">
      <div class="circleWrap">
        <el-progress type="circle" :percentage="percentage" v-if="percentage == 0"></el-progress>
        <el-progress type="circle" :percentage="percentage" v-if="percentage !== 0 && percentage !== 100"></el-progress>
        <el-progress type="circle" :percentage="percentage" status="success" v-if="percentage == 100"></el-progress>
      </div>
      <div class="progressMes" :class="[percentage == 100?'green':'']">{{progressInfo}}</div>
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
    // 获取结果参数
    resultParams: {
      type: Object,
      default: () => {}
    },
    // 导出参数
    exportParams: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    return {
      team_id: '',
      project_id: '',
      timer: null,
      percentTimer: null,
      progressInfo: '',
      percentage: 0,
      progressDialog: false,
      canClosed: false,
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
      // this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      // this.project_id = util.getLocalStorage('projectStorageInfo').project_id
    },
    //上传提交
    submitImport(formName) {
      this.percentage = 0;
      if(this.percentage < 100) {
        this.percentTimer = setInterval(()=> {
          this.percentage += 1
        }, 1000)
      }
      this.progressInfo = '';
      this.canClosed = true;
      this.progressDialog = true;
      const data = {
        ...this.exportParams
      }
      util.ajax({
        url: this.requestUrl,
        type: "POST",
        data: data,
        timeout: 90000,
        success: (res) => {
          if (res.errno == '0') {
            let _time = 0;
            this.timer = setInterval(() => {
              _time++;
              if (_time > 199) {
                clearInterval(this.timer)
              };
              this.getCurrProgress();
            }, 1000)
          } else {
            this.progressDialog = false;
            clearInterval(this.timer)
            clearInterval(this.percentTimer)
            this.$message({
              message: res.errmsg,
              type: "error",
            });
          }
        },
        error: (xhr, status) => {
          clearInterval(this.timer);
          clearInterval(this.percentTimer)
          this.canClosed = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
        noNetwork: () => {
          clearInterval(this.timer);
          clearInterval(this.percentTimer)
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
        ...this.resultParams
      };
      util.ajax({
        url: this.resultUrl,
        type: 'GET',
        data: currParams,
        timeout: 1000 * 10 * 60,
        success: (res) => {
          if (res.errno == 0 && res.data.end_time == 0) {
            this.progressInfo = "正在处理数据中，请耐心等待~";
            if(this.percentage >= 98) {
              clearInterval(this.percentTimer);
            }
          } else if (res.errno == 0 && res.data.end_time > 0) {
            clearInterval(this.timer);
            clearInterval(this.percentTimer);
            this.percentage = 100;
            this.progressInfo = "导出完成";
            this.canClosed = false;
            window.location.href = res.data.file_url;
          } else {
            this.canClosed = false;
            this.progressDialog = false;
            clearInterval(this.timer);
            clearInterval(this.percentTimer)
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'error'
            });
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