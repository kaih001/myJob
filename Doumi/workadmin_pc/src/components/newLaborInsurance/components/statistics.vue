<template>
  <div class="statistics-cp">
    <div class="kq-seach-form">
      <el-form  :inline="true" >
        <el-form-item label="日期范围" prop="memberDate">
          <el-date-picker 
            type="daterange" 
            placeholder="选择日期" 
            range-separator="至" 
            style="width:225px" 
            v-model="searchDate" 
            value-format="yyyy-MM-dd" 
            @change="datachange" 
            :editable="false">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="人员">
            <el-input v-model="searchPerson" placeholder='姓名/手机号' ></el-input>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="投保结果" v-if="false">
          <el-select class="mystatus" style="width:106px" v-model="status">
            <template v-for="item in stateOptionsDay">
              <el-option :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="保单申请批次">
            <el-input v-model="searchPlain" placeholder='请输入保单申请批次' ></el-input>
          </el-autocomplete>
        </el-form-item>
        <el-button type="primary" class="seach-btn" style="margin-left:16px;" @click="searchlist">搜 索</el-button>
      </el-form>
    </div>
    <div class="insurance_info" v-if="false">
      <p>总成功人次：<span>{{success_num}}</span>总失败人次：{{error_num}}</p>
      <div class="export" v-if="false">
        <h3 @click="exportexcle"><i class="export-icon"></i><span>导出报表</span></h3>
      </div>
    </div>
    <div class="insurance_table">
      <div class="from-member">
        <el-table tooltip-effect="dark" style="width: 100%" border :data="insuranceDataList" :height="tableHeight" v-loading.body="loading">
          <el-table-column label="头像/姓名" show-overflow-tooltip label-class-name="border" width="130" fixed>
            <template slot-scope="scope">
              <span class="user-name">
                <img v-if="scope.row.logo.logo" :src="scope.row.logo.logo" class="user-img" alt="">
                <img v-else src="../../../assets/imgs/shareIcon/default_img.png" class="user-img" alt="">
                {{scope.row.user_name}}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="手机号" label-class-name="border" show-overflow-tooltip min-width="120" prop="mobile">
          </el-table-column>
          <el-table-column label="身份证号" label-class-name="border" show-overflow-tooltip min-width="150" prop="id_number">
          </el-table-column>
          <el-table-column label="所属小组" label-class-name="border" show-overflow-tooltip min-width="150" prop="group_name">
          </el-table-column>
          <el-table-column label="投保日期" show-overflow-tooltip label-class-name="border" min-width="150" prop="insurance_date_text">
          </el-table-column>
          <el-table-column label="起保日期" show-overflow-tooltip label-class-name="border" min-width="150" prop="start_date_text">
          </el-table-column>
          <el-table-column label="终止日期" show-overflow-tooltip label-class-name="border" min-width="150" prop="end_date_text">
          </el-table-column>
          <el-table-column label="投保状态" label-class-name="border" show-overflow-tooltip min-width="150">            
            <template slot-scope="scope">
              <span class="view-policy-d" v-if="scope.row.policy_url">{{scope.row.status_text}}<a :href="scope.row.policy_url" target="_blank" class="view-policy"></a></span>
              <span v-else>{{scope.row.status_text}}</span>
            </template>
          </el-table-column>
          <el-table-column label="投保来源" label-class-name="border" show-overflow-tooltip min-width="150" prop="insurance_type_text">
          </el-table-column>
          <el-table-column label="失败原因" label-class-name="border" show-overflow-tooltip min-width="150" prop="fail_reason">
          </el-table-column>
          <el-table-column label="投保方案" label-class-name="border" show-overflow-tooltip min-width="150" prop="insurance_plan"></el-table-column>
          <el-table-column label="投保金额" label-class-name="border" show-overflow-tooltip min-width="150">
            <template slot-scope="scope">
              <span>{{scope.row.insurance_amount / 100}}</span>
            </template>
            
          </el-table-column>
          <el-table-column label="保单申请批次" label-class-name="border" show-overflow-tooltip min-width="150" prop="order_no"></el-table-column>
         </el-table>
      </div>
      <!-- 分页组件 -->
      <div class="page" v-if="(totallist/page_size) > 1">
        <div class="block">
          <el-pagination @current-change="handleCurrentPageChange" :current-page.sync="currentPage" :page-size="page_size" layout="total, prev, pager, next" :total="totallist">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

import breadcrumb from '@/components/common/breadcrumb'
var date = new Date()
var ckprck = true;
var today = util.getStampFromDateStr(date)
var date2 = new Date(date)
date2.setDate(date.getDate())
var end_timees = util.getStampFromDateStr(date2)
export default {
  name: 'kqtasklist',
  components: {
    breadcrumb
  },
  data() {
    return {
      team_id: 0,
      project_id: 0,
      stateOptionsDay: [
        { value: 2, label: '全部' },
        { value: 1, label: '成功' },
        { value: 0, label: '失败' },
      ],
      viewTypeShow: {
        'label-1': '失败',
        'label0': '默认',
        'label1': '投保中',
        'label2': '成功',
        'label3': '成功'
      },
      loading: false,
      total_page: 2,
      searchPerson:'',
      searchDate:'',
      searchPlain:'',
      currentPage: 1, //当前分页
      winHeight: '',
      tableHeight: 0,
      success_num: '',
      error_num: '',
      insuranceDataList: [],
      page_no: 1,
      totallist: 0,
      start_date:'',
      page_size:20,
      end_date:'',
    }
  },
  methods: {
    init() {
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id;
      this.tabbtnwidth = $('.insurance_lifirst').width();
      // this.start_date = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
      // this.end_date = this.start_date;
      this.tableHeight = window.innerHeight - 279;
      this.getInitList()
    },
    //获取初始化列表
    getInitList() {
      util.ajax({
        url: '/insurance/query/policy_statistics_list',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          start_date: this.start_date,
          end_date: this.end_date,
          user_name: this.searchPerson,
          order_no: this.searchPlain,
          page_no: this.page_no,
          page_size: this.page_size,
        },
        timeout: 10000,
        success: (result) => {
          console.log('保单统计列表')
          console.log(result)
          if (result.errno == 0) {
            this.insuranceDataList = result.data.list;
            this.totallist = +result.data.total_num
            // this.success_num = result.data.total_success_num;
            // this.error_num = result.data.total_error_num;
          } else {
            this.insuranceDataList = [];
            this.totallist = 0;
          }
        },
        error: (xhr, status) => {
          this.alertinfo('网络连接失败，请检查网络')
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络')
        }
      })

    },
    //搜索人员列表
    searchlist() {
      this.page_no = 1;
      this.currentPage = 1;
      this.getInitList()
    },
    //表单全选操作或单选复选款操作
    /*分页操作*/
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`);
    },
    handleCurrentPageChange(val) {
      this.page_no = val
      this.getInitList()
    },
    datachange(val) {
      if (val) {
        this.timeval = val;
        let start_date = val.split('至')[0],
          end_date = val.split('至')[1];
        this.start_date = (new Date(start_date).getTime() - 28800000) / 1000;
        this.end_date = (new Date(end_date).getTime() - 28800000) / 1000 + 86399;
      } else {
        this.timeval = '';
        this.start_date = '';
        this.end_date = '';
      }
    },
    exportexcle() {
      if (this.insuranceDataList.length === 0) {
        this.alertinfo('当前选择范围内无保单记录，请重新选择范围再导出!')
        return;

      };
      this.page_no = ''
      if (!ckprck) return;
      let start_date,
        end_date;
      if (this.timeval) {
        start_date = this.timeval.split('至')[0],
          end_date = this.timeval.split('至')[1];
      } else {
        start_date = util.formatData1(new Date(this.start_date * 1000));
        end_date = util.formatData1(new Date(this.start_date * 1000));
      }
      util.locationHref('/sea/api/1.0/client/v1/insurance/history/export?dmclient=pcweb&X-Doumi-Agent=weixinqy&team_id=' + this.team_id + '&project_id=' + this.project_id + '&start_time=' + start_date + '&end_time=' + end_date + '&search_user_id=' + this.select_user_id + '&type=2' + '&status=' + this.status);
    },
    // 显示错误信息
    alertinfo(text, type) {
      this.$message({
        showClose: true,
        message: text,
        type: type || 'warning',
      });
    },
  },
  mounted() {
    this.init()
  },
  watch: {
    '$route'(to, from) {
      // 对路由变化作出响应...
      this.init();
    }
  }
}

</script>
<style src='../../../assets/css/statistics.css'></style>
