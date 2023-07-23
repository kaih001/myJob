<template>
  <div id="PaydayReport" class="payday-report-warp">
    <div class="section-warp">
      <div class="payday-report-header">
        <h2>发薪报备</h2>
        <a href="javascript:;" class="create-payday-btn" @click="createPaydayReport" v-permission="{ team_id, project_id,id_name:'create_wage_report' }"><i class="createico_svg"></i>新建发薪报备</a>
      </div>
      <div class="payday-report-pannel">
        <div class="person-payday-data">
          <div class="payday-data-title">人员工资报备发薪数据</div>
          <div class="payday-data-list">
            <div class="payday-data-list-item">
              <div class="nums">{{pannelData.wage_report_total}}</div>
              <div class="nums-text">报备总金额（元）</div>
            </div>
            <div class="payday-data-list-item">
              <div class="nums">{{pannelData.wage_report_used}}</div>
              <div class="nums-text">已发放金额（元）</div>
            </div>
            <div class="payday-data-list-item">
              <div class="nums remaining-nums">{{pannelData.wage_report_balance}}</div>
              <div class="nums-text">剩余可发放金额（元）</div>
            </div>
          </div>
        </div> 
        <div class="supplier-payday-data">
          <div class="payday-data-title">供应商费用报备发薪数据<span class="payday-data-title-tips">（项目运营代垫付金额不用报备）</span></div>
          <div class="payday-data-list">
            <div class="payday-data-list-item">
              <div class="nums">{{pannelData.supplier_report_total}}</div>
              <div class="nums-text">报备总金额（元）</div>
            </div>
            <div class="payday-data-list-item">
              <div class="nums">{{pannelData.supplier_report_used}}</div>
              <div class="nums-text">已发放金额（元）</div>
            </div>
            <div class="payday-data-list-item">
              <div class="nums remaining-nums">{{pannelData.supplier_report_balance}}</div>
              <div class="nums-text">剩余可发放金额（元）</div>
            </div>
          </div>
        </div> 
      </div>
      <div class="search-pannel">
        <el-row>
          <el-col :span="8">
            <label>发薪日期：</label>
            <el-date-picker
              v-model="searchData.paydayDates"
              range-separator="至"
              type="daterange"
              placeholder="选择日期范围"
              @change="searchPaydayDates">
            </el-date-picker>
          </el-col>
          <el-col :span="8">
            <label>报备日期：</label>
            <el-date-picker
              v-model="searchData.reportDates"
              range-separator="至"
              type="daterange"
              placeholder="选择日期范围"
              @change='searchReportDates'>
            </el-date-picker>
          </el-col>
          <el-col :span="8">
            <label>发薪类型：</label>
            <el-select v-model="searchData.paydayType" placeholder="请选择" @change="searchPaydayType">
              <el-option
                v-for="item in paydayTypeList"
                :key="item.id"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
        </el-row>
      </div>
      <div class="search-pannel" style="margin-top:20px;">
        <el-row>
          <el-col :span="8">
            <label>状&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;态：</label>
            <el-select v-model="searchData.status" placeholder="请选择" @change="searchPaydayType">
              <el-option
                v-for="item in paydayStatusList"
                :key="item.id"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="2">
            <el-button type="primary" @click="searchSubmit">搜&nbsp;&nbsp;索</el-button>
          </el-col>
        </el-row>
      </div>
      <div class="table-warp">
        <el-table :data="paydayReportList" :height="tableHeight" style="width:100%">
          <el-table-column prop="wage_date" label="发薪日期" width="180" fixed></el-table-column>
          <el-table-column prop="wage_amount" label="发薪金额" width="100"></el-table-column>
          <el-table-column prop="report_type" label="发薪类型" width="100"></el-table-column>
          <el-table-column prop="is_advanced" label="是否垫付" width="100"></el-table-column>
          <el-table-column prop="collection_date" label="垫付预计回款日期" width="180"></el-table-column>
          <el-table-column prop="remark" label="备注" min-width="300" show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="create_at" label="报备时间" width="180"></el-table-column>
          <el-table-column prop="apply_status_no" label="状态" width="180" fixed="right">
            <template scope="scope">
              <div slot="reference">
                <el-tag v-if="scope.row.apply_status_no=='待确认'">{{ scope.row.apply_status_no }}</el-tag>
                <el-tag type="success" v-if="scope.row.apply_status_no=='已确认'">{{ scope.row.apply_status_no }}</el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-warp" v-if="paydayReportList.length">
         <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pagination.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </div>
    </div>
    <el-dialog title="新建发薪报备" :visible.sync="dialogPaydayReport">
      <el-form :model="paydayRepotyForm">
        <el-form-item label="发薪日期" :label-width="formLabelWidth">
          <el-date-picker
            v-model="paydayRepotyForm.paydayDates"
            :picker-options="dialogPaydayPickerOptions"
            format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期"
            @change="getPaydayDates">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="发薪金额" :label-width="formLabelWidth">
          <el-input v-model="paydayRepotyForm.amount" type="number" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="发薪类型" :label-width="formLabelWidth">
          <el-select v-model="paydayRepotyForm.paydayType" placeholder="发薪类型">
            <el-option
              v-for="item in dialogPaydayTypeList"
              :key="item.id"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否垫付" :label-width="formLabelWidth">
          <el-select v-model="paydayRepotyForm.isAdvances" placeholder="是否垫付">
            <el-option
              v-for="item in advancesList"
              :key="item.id"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <template v-if="paydayRepotyForm.isAdvances==1">
          <el-form-item label="垫付预计回款日期" :label-width="formLabelWidth">
            <el-date-picker
              v-model="paydayRepotyForm.returnedMoney"
              :picker-options="dialogPaydayPickerOptions"
              type="date"
              placeholder="选择日期"
              @change="getReturnedMoney">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="客户逾期欠款金额" :label-width="formLabelWidth">
            <el-input v-model="paydayRepotyForm.overdueArrearsAmount" type="number" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="客户未逾期欠款金额" :label-width="formLabelWidth">
            <el-input v-model="paydayRepotyForm.arrearsAmount" type="number" auto-complete="off"></el-input>
          </el-form-item>
        </template>
        <el-form-item label="备注" :label-width="formLabelWidth">
          <el-input v-model="paydayRepotyForm.remark" type="textarea" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="toggleDialog('dialogPaydayReport')">取 消</el-button>
        <el-button type="primary" @click="submitPaydayRepotyBtn">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as util from '../assets/js/util.js'
import permission from '../directives/permission.js'
let $ = require("jquery")

export default {
  name: 'PaydayReport',
  components: {
  },
  directives: {permission},
  data() {
    return {
      team_id:util.getLocalStorage('projectStorageInfo').team_id,
      project_id:util.getLocalStorage('projectStorageInfo').project_id,
      paydayPickerOptions:{
        disabledDate(time) {
          let curDate = (new Date()).getTime();
          let five = 5 * 24 * 3600 * 1000;
          let fiveDaysBefore = curDate - five;
          let fiveDaysAfter = curDate + five;
          return time.getTime() > fiveDaysAfter || time.getTime() < fiveDaysBefore;
        }
      },
      dialogPaydayPickerOptions:{
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      pannelData:{
        "wage_report_total": 0, //'工资报备总金额',
        "wage_report_used": 0,  //'工资报备已发放金额',
        "wage_report_balance": 0,  //'工资报备余额',
        "supplier_report_total": 0,  //'供应商报备总金额',
        "supplier_report_used": 0,  //'供应商报备已发放金额',
        "supplier_report_balance": 0  //'供应商报备余额',
      },
      searchData:{
        paydayDates:[],
        reportDates:[],
        paydayType:0,
        status:0
      },
      tableHeight:120,
      paydayTypeList:[
        {id:1,value:0,label:'不限'},
        {id:2,value:1,label:'人员工资'},
        {id:3,value:2,label:'供应商费用'}
      ],
      paydayStatusList:[
        {id:1,value:0,label:'全部'},
        {id:2,value:1,label:'待确认'},
        {id:3,value:2,label:'已确认'}
      ],
      paydayReportList: [],
      pagination:{
        currentPage:1,
        page_size:10,
        page_no:1,
        total:0
      },
      dialogPaydayReport:false,
      formLabelWidth: '180px',
      paydayRepotyForm:{
        paydayDates:'',
        amount:'',
        paydayType:'',
        isAdvances:'',
        returnedMoney:'',
        overdueArrearsAmount:'',
        arrearsAmount:'',
        remark:''
      },
      dialogPaydayTypeList:[
        {id:1,value:'1',label:'人员工资'},
        {id:2,value:'2',label:'供应商费用'}
      ],
      advancesList:[
        {id:1,value:'1',label:'是'},
        {id:2,value:'2',label:'否'}
      ],
      verifyPaydayReportTips:{
        paydayDates:'请选择发薪日期',
        amount:'请填写发薪金额',
        isLegalNum:'金额需保留两位小数,且大于等于0',
        paydayType:'请选择发薪类型',
        isAdvances:'请选择是否垫付',
        returnedMoney:'请选择垫付预计回款日期',
        overdueArrearsAmount:'请填写客户逾期欠款金额',
        arrearsAmount:'请填写客户未逾期欠款金额'
      }
    }
  },
  computed: {
  },
  watch: {
    '$route'() {
      this.init();
    }
  },
  //获取权限
  created() {
    
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id;
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id;
      console.log('initttttttttttttttttttttttttt');
      let datee=[this.initPaydayDates(-5),this.initPaydayDates(5)];
      this.$set(this.searchData,'paydayDates', datee)
      
      this.getPannelData();
      this.getPaydayReportList();
    },
    //初始化发薪报备的日期
    initPaydayDates(AddDayCount){
      let dd = new Date();
      dd.setDate(dd.getDate()+AddDayCount);
      // let y = dd.getFullYear();
      // let m = (dd.getMonth()+1)<10?"0"+(dd.getMonth()+1):(dd.getMonth()+1);//获取当前月份的日期，不足10补0
      // let d = dd.getDate()<10?"0"+dd.getDate():dd.getDate();//获取当前几号，不足10补0
      return dd;
    },
    //发薪报备列表
    getPaydayReportList() {
      let params={
        team_id:this.team_id,
        project_id:this.project_id,
        page_size:this.pagination.page_size,
        page_no:this.pagination.page_no,
      };
      let {paydayDates,reportDates,paydayType,status}=this.searchData;
      let s_wage_date=paydayDates&&paydayDates.length?this.formatDate(paydayDates[0]):'';
      let e_wage_date=paydayDates&&paydayDates.length?this.formatDate(paydayDates[1]):'';
      let s_report_time=reportDates&&reportDates.length?this.formatDate(reportDates[0]):'';
      let e_report_time=reportDates&&reportDates.length?this.formatDate(reportDates[1]):'';
      let searchParams={
        s_wage_date,
        e_wage_date,
        s_report_time,
        e_report_time,
        report_type:paydayType,
        apply_status_no:status
      };
      util.ajax({
        url: '/wage/report/list',
        type: 'GET',
        data: {...params,...searchParams},
        success: (res) => {
          if (res && res.errno == 0&&res.data.list) {
            this.paydayReportList=res.data.list;
            this.pagination.total=res.data.total_num;
            this.tableHeight=res.data.list.length?'350':'120';
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });

        },
        noNetwork: () => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    handleSizeChange(size){
      this.initPagination();
      this.pagination.page_size=size;
      this.getPaydayReportList();
    },
    handleCurrentChange(currentPage){
      console.log(currentPage);
      this.pagination.page_no=currentPage;
      this.getPaydayReportList();
    },
    searchPaydayDates(e){
      // if(e){
      //   let times=e.split('至');
      //   this.searchData.paydayDates=times;
      // }else{
      //   // this.searchData.paydayDates=[];
      // }
      this.initPagination();
      this.getPaydayReportList();
    },
    searchReportDates(e){
      // if(e){
      //   let times=e.split('至');
      //   this.searchData.reportDates=times;
      // }else{
      //   this.searchData.reportDates=[];
      // }
      this.initPagination();
      this.getPaydayReportList();
    },
    searchPaydayType(){
      this.initPagination();
      this.getPaydayReportList();
    },
    searchSubmit(){
      this.getPaydayReportList();
    },
    getPannelData(){
      let params={
        team_id:this.team_id,
        project_id:this.project_id,
      };
      util.ajax({
        url: '/wage/report/statistic',
        type: 'GET',
        data: params,
        success: (res) => {
          if (res && res.errno == 0) {
            this.pannelData=res.data;
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });

        },
        noNetwork: () => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    createPaydayReport(){
      this.toggleDialog('dialogPaydayReport');
    },
    getPaydayDates(e){
      // this.paydayRepotyForm.paydayDates=e;
    },
    getReturnedMoney(e){
      // console.log('eeeeeeeeeeeeeeeeeeeeeeeeeee',e);
      // this.paydayRepotyForm.returnedMoney=e;
    },
    getReportDates(e){
      console.log(e);
    },
    submitPaydayRepotyBtn(){
      this.verifyPaydayReport().then(_=>{
        let params=this.formatParams(this.paydayRepotyForm);
        return this.sendFormData(params);
      }).then(_=>{
        this.initPagination();
        this.getPannelData();
        this.getPaydayReportList();
        this.clearFormData();
        this.toggleDialog('dialogPaydayReport');
      }).catch(err=>{
        this.$message({
          showClose: true,
          message: this.verifyPaydayReportTips[err]||err,
          type: 'warning'
        });
      });
    },
    sendFormData(params){
      const that=this;
      return new Promise((reslove,reject)=>{
          util.ajax({
          url: '/wage/report/create',
          type: 'POST',
          data: params,
          success: (res) => {
            if (res && res.errno == 0) {
              that.$message({
                showClose: true,
                message: '新建发薪报备成功',
                type: 'warning'
              });
              reslove();
            } else {
              reject(res.errmsg);
            }
          },
          error: (xhr, status) => {
            reject('提交失败，请重试！');
          },
          noNetwork: () => {
            reject('网络连接失败，请检查网络');
          }
        })
      })
    },
    formatParams(params){
      let that=this;
      let newParams=[params];
      newParams=newParams.map((v,i)=>{
        let wage_date=this.formatDate(v.paydayDates);
        let collection_date=v.isAdvances==1?this.formatDate(v.returnedMoney):'';
        return {
          team_id:that.team_id,
          project_id:that.project_id,
          wage_date,
          wage_amount:v.amount,
          report_type:v.paydayType,
          is_advanced:v.isAdvances,
          collection_date,
          overdue_amount:v.isAdvances==1?v.overdueArrearsAmount:'',
          not_overdue_amount:v.isAdvances==1?v.arrearsAmount:'',
          remark:v.remark
        }
      })
      return newParams[0];
    },
    verifyPaydayReport(){
      return new Promise((reslove,reject)=>{
        console.log(this.paydayRepotyForm);
        const {paydayDates,amount,paydayType,isAdvances,returnedMoney,overdueArrearsAmount,arrearsAmount}=this.paydayRepotyForm;
        if(!paydayDates||(paydayDates.length&&!paydayDates[0])){
          reject('paydayDates');
          return
        };
        if(!amount){
          reject('amount');
          return
        };
        if(amount&&!this.isLegalNum(amount,'amount')){
          reject('isLegalNum');
          return
        };
        if(!paydayType){
          reject('paydayType');
          return
        };
        if(!isAdvances){
          reject('isAdvances');
          return
        }
        if(isAdvances==1){
          if(!returnedMoney||(returnedMoney.length&&!returnedMoney[0])){
            reject('returnedMoney');
            return
          };
          if(!overdueArrearsAmount){
            reject('overdueArrearsAmount');
            return
          };
          if(overdueArrearsAmount&&!this.isLegalNum(overdueArrearsAmount)){
            reject('isLegalNum');
            return
          };
          if(!arrearsAmount){
            reject('arrearsAmount');
            return
          };
          if(arrearsAmount&&!this.isLegalNum(arrearsAmount)){
            reject('isLegalNum');
            return
          };
        }
        reslove();
      })
    },
    //格式化时间
    formatDate(dat){
      //获取年月日，时间
      let year = dat.getFullYear();
      let mon = (dat.getMonth()+1) < 10 ? "0"+(dat.getMonth()+1) : dat.getMonth()+1;
      let data = dat.getDate()  < 10 ? "0"+(dat.getDate()) : dat.getDate();
      let hour = dat.getHours()  < 10 ? "0"+(dat.getHours()) : dat.getHours();
      let min =  dat.getMinutes()  < 10 ? "0"+(dat.getMinutes()) : dat.getMinutes();
      let seon = dat.getSeconds() < 10 ? "0"+(dat.getSeconds()) : dat.getSeconds();
      let newDate = year +"-"+ mon +"-"+ data;
      return newDate;
    },
    toggleDialog(dialogName){
      this[dialogName]=!this[dialogName]
    },
    clearFormData(){
      this.paydayRepotyForm={
        paydayDates:'',
        amount:'',
        paydayType:'',
        isAdvances:'',
        returnedMoney:'',
        overdueArrearsAmount:'',
        arrearsAmount:'',
        remark:''
      }
    },
    isLegalNum(digital,type){
      if(digital<0){
        return false;
      }
      if(type=='amount'&&digital==0){
        return false;
      }
      digital=digital+'';
      const index=digital.indexOf('.');
      if(index>-1){
        return !(digital.substring(index+1)&&digital.substring(index+1).length>2);
      }
      return true;
    },
    initPagination(){
      this.pagination.currentPage=1;
      this.pagination.page_no=1;
    },
  }
}

</script>
<style src='../assets/css/PaydayReport.css'></style>
<style src='../assets/css/base.css'></style>
