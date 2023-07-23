<template>
  <div id="PayResultDown">
    <div class="section-warp">
      <div class="pay-result-header">
        <h2>支付结果下载</h2>
      </div>
      <div class="table-warp">
        <el-table :data="PayResultDownList" :height="tableHeight" style="width:100%">
          <el-table-column prop="paid_time" label="批量支付时间"></el-table-column>
          <el-table-column prop="user_name" label="操作人"></el-table-column>
          <el-table-column prop="result_file" label="结果文件下载" width="200">
            <template scope="scope">
              <div slot="reference">
                <el-button v-if="scope.row.result_file" type="success" size="small" @click="downloadExcel(scope)">下载文件</el-button>
                <span v-if="!scope.row.result_file">文件生成中，请稍后</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-warp" v-if="!!PayResultDownList.length">
         <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[20, 30, 50]"
          :page-size="pagination.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import * as util from '../assets/js/util.js'
let $ = require("jquery")
export default {
  components: {
  },
  data: function () {
    return {
      team_id:util.getLocalStorage('projectStorageInfo') && util.getLocalStorage('projectStorageInfo').team_id,
      project_id:util.getLocalStorage('projectStorageInfo') && util.getLocalStorage('projectStorageInfo').project_id,
      tableHeight: 380,
      PayResultDownList:[],
      pagination:{
        currentPage:1,
        page_size:20,
        page_no:1,
        total:0
      },
    }
  },
  watch: {
    '$route'(to, from) {
      
    },
  },
  methods: {
    getPayResultDownList() {
      util.ajax({
        url: '/wage/payment/unfinished_order_list',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          page_no: this.pagination.page_no,
          page_size: this.pagination.page_size
        },
        timeout: 60000,
        success: (result) => {
          if(result.errno=='0'){
            this.PayResultDownList=result.data.list.map(v=>{
              v.paid_time=util.formatMs2Date(v.paid_time);
              return v;
            });
            this.pagination.total=+result.data.total_count;
          }
        },
        error: (xhr, status) => {
        },
        noNetwork: () => {
        }
      })
    },
    handleSizeChange(size){
      this.initPagination();
      this.pagination.page_size=size;
      this.getPayResultDownList();
    },
    handleCurrentChange(currentPage){
      this.pagination.page_no=currentPage;
      this.getPayResultDownList();
    },
    initPagination(){
      this.pagination.currentPage=1;
      this.pagination.page_no=1;
    },
    downloadExcel(scope){
      console.log(scope);
      let {result_file}=scope.row;
      if(!result_file){
        this.$message({
          showClose: true,
          message: '文件连接丢失，请确认数据！',
          type: 'warning'
        });
        return
      };
      window.location.href=result_file;
    },
  },
  created() {
    // this.getData();
  },
  mounted() {
    this.getPayResultDownList();
  }
}

</script>
<style src='../assets/css/PayResultDown.css'></style>
<style src='../assets/css/base.css'></style>
<style scope>
.applications {
  overflow-y: hidden;
}
</style>
