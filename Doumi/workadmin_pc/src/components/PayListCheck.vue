<template>
  <div class="wrapest">
    <div class="payListCheckWrap">
      <div class="title"><span>工资单审核</span></div>
      <div class="payListContent">
        <p>
          <em>SaaS项目ID:</em>
          <span>{{project_id}}</span>
        </p>
        <p>
          <em>SaaS项目名称:</em>
          <span>{{project_name}}</span>
        </p>
        <p style="margin:0;">
          <em>工资单名称：</em>
          <span>
            {{order_name}}
            <span class="lookOver" @click="lookOverOrder">查看</span>
          </span>
        </p>
        <p>
          <em>结算周期：</em>
          <span>
            {{startDate}}~{{endDate}}
          </span>
        </p>
        <p>
          <em>状态：</em>
          <span>
            <span v-if="status_no==0">草稿</span>
            <span v-if="status_no==1">待审批</span>
            <span v-if="status_no==2">审批通过</span>
            <span v-if="status_no==3">审批驳回</span>
            <span v-if="status_no==4">支付中</span>
            <span v-if="status_no==5">已支付</span>
            <span v-if="status_no==6">支付异常</span>
          </span>
        </p>
        <p>
          <em>结算人数：</em>
          <span>
            {{settlementNumber}}
          </span>
        </p>
        <p>
          <em>总金额：</em>
          <span>
            {{total_wage}}
          </span>
        </p>
        <p>
          <em>关联工资单：</em>
          <span>
            {{wage_name}}-{{wage_total_wage}}
            <span class="lookOver" @click="lookOverWage">查看</span>
          </span>
        </p>
        <p>
          <em>提交人：</em>
          <span>
            {{create_user_name}}
          </span>
        </p>
        <p>
          <em>备注：</em>
          <span>
            {{remarks}}
          </span>
        </p>
        <p>
          <em>附件：</em>
          <span style="display:inline-block;margin-left:-5px;">
            <elUpload ref="uploadRef" :fileListValue="fileList" :isDet="true" :isDisabled="true"></elUpload>
          </span>
        </p>
      </div>
      <div class="btnWrap" v-if="action_no == 3">
        <el-button type="success" class="passBtn" @click="passFun()">通过</el-button>
        <el-button type="danger" @click="refuseFun()">拒绝</el-button>
      </div>
      <!-- <el-dialog title="审核" :visible.sync="dialogFormVisible">
        备注：
        <el-input type="textarea" :rows="2" v-model="remark" autocomplete="off"></el-input>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
        </div>
      </el-dialog> -->
    </div>
  </div>
</template>

<script>
import * as util from '../assets/js/util.js'
import elUpload from "./ElUpload";
export default {
  name: "PayListCheck",
  components: {
    elUpload
  },
  props: {},
  data() {
    return {
      order_name: '',
      project_name: '',
      project_id: '',
      create_user_name: '',
      startDate: '',
      endDate: '',
      wage_order_id: '',
      wage_name: '',
      settlementNumber: 0,
      wage_total_wage: '',
      total_wage: 0,
      remarks: '',
      fileList: [],
      action_no: null,
      status_no: ''
    }
  },
  computed: {

  },
  watch: {

  },
  mounted() {
    this.getData();
    this.getProjectListData();
  },
  methods: {
    // 获取单个项目信息
    getProjectListData() {
      util.ajax({
        url: '/project/search',
        type: 'GET',
        data: {
          search_str: this.$route.query.project_id || 3408,
          status: 0,
          page_no: '',
          page_size: '',
          view_type: 2,
          team_id: this.team_id || 26
        },
        timeout: 10000,
        success: (obj) => {
          const { errmsg, data } = obj;
          if (obj && obj.errno == 0) {
            const itemMes = data.list[0];
            util.setLocalStorage('projectStorageInfo', itemMes)
          } else {
            this.alertinfo(errmsg);
          }
        },
        error: (xhr, status) => {
          this.loading = false;
        },
        noNetwork: () => {
          this.loading = false;
          //网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    //获取工资单详情
    getData() {
      util.ajax({
        url: '/wage/order_user/detail',
        type: 'GET',
        data: {
          // dmclient: 'pcweb',
          // 'X-Doumi-Agent': 'weixinqy',
          team_id: this.$route.query.team_id || 26,
          project_id: this.$route.query.project_id || 3408,
          order_id: this.$route.query.order_id || 2798
        },
        timeout: 60000,
        success: (result) => {
          console.log('result===', result);
          const { errno, data, errmsg } = result;
          if (errno == '0') {
            this.order_name = data.general.order_name;
            this.order_id = data.general.order_id;
            this.startDate = util.getLocalTime(data.general.start_date * 1000, 'yyyy-MM-dd');
            this.endDate = util.getLocalTime(data.general.end_date * 1000, 'yyyy-MM-dd');
            this.create_user_name = data.approve.create_user_name;
            this.project_name = data.general.project_name;
            this.project_id = data.general.project_id;
            this.team_id = data.general.team_id;
            this.wage_order_id = data.general.wage_order_id;
            this.wage_name = data.general.wage_name;
            this.wage_total_wage = data.general.wage_total_wage;
            this.remarks = data.general.remarks;
            this.total_wage = data.general.total_wage / 100;
            this.settlementNumber = data.detail.list.length;
            this.action_no = data.action_no.action_no;
            this.status_no = data.general.status_no;
            if (data.general.enclosure && JSON.parse(data.general.enclosure).length > 0) {
              this.fileList = JSON.parse(data.general.enclosure);
            }
          } else {
            this.alertinfo(errmsg);
            window.open('https://vip.doumi.com/login', '_self');
          }
        },
        error: (xhr, status) => {
          this.alertinfo('服务器异常');
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络');
        }
      })
    },
    // 显示错误信息
    alertinfo(text, type) {
      this.btnDisable = false;
      this.fullscreenLoading = false;
      this.$message({
        showClose: true,
        message: text,
        type: type || 'warning',
      });
    },
    passFun() {
      this.approveOrderFun(1);
    },
    refuseFun() {
      this.approveOrderFun(0);
    },
    approveOrderFun(action) {
      util.ajax({
        url: '/wage/approve/order',
        type: 'GET',
        data: {
          team_id: this.$route.query.team_id || 26,
          project_id: this.$route.query.project_id || 3408,
          order_id: this.$route.query.order_id || 2795,
          action_no: action,
          remark: '',
          payment_method: ''
        },
        timeout: 60000,
        success: (result) => {
          const { errno, data, errmsg } = result;
          if (errno == '0') {
            if (action === 1) {
              this.alertinfo('通过成功', 'success');
            } else if (action === 0) {
              this.alertinfo('拒绝成功', 'success');
            }
            this.getData();
          } else {
            this.alertinfo(errmsg, 'error');
            this.getData();
          }
        },
        error: (xhr, status) => {
          this.alertinfo('服务器异常');
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络');
        }
      })
    },
    // 工资单名称
    lookOverOrder() {
      const url = `/project/${this.project_id}/PaylistDetail?order_id=${this.order_id}&project_id=${this.project_id}&team_id=${this.team_id}&ifConfirmEmail=false&from="check"`;
      const jump = this.$router.resolve(url);
      window.open(jump.href, '_blank');
    },
    // 关联工资单
    lookOverWage() {
      const url = `/project/${this.project_id}/PaylistDetail?order_id=${this.wage_order_id}&project_id=${this.project_id}&team_id=${this.team_id}&ifConfirmEmail=false&from="check"`;
      const jump = this.$router.resolve(url);
      console.log('jump===', jump);
      window.open(jump.href, '_blank');
    }
  },
}
</script>

<style>
.wrapest {
  background: white;
}
.payListCheckWrap {
  min-height: 100vh;
  width: 800px;
  box-sizing: border-box;
  border: 1px solid rgb(206, 206, 206);
  margin: 0 auto;
  background: white;
  overflow: hidden;
  padding: 0 50px 0 50px;
  line-height: 20px;
}
.payListCheckWrap .title {
  margin: 20px 0;
}
.payListCheckWrap .title span {
  font-size: 22px;
}
.payListContent p {
  margin: 10px 0;
}
.payListContent p em {
  display: inline-block;
  font-size: 12px;
  color: #8492a6;
  width: 80px;
}
.btnWrap {
  margin: 20px 0 0 40px;
}
.passBtn {
  margin-right: 40px;
}
.lookOver {
  margin-left: 20px;
  background: url(../assets/imgs/payListDetail/search.svg) no-repeat;
  padding-left: 15px;
  color: #6699ee;
  cursor: pointer;
}
</style>
