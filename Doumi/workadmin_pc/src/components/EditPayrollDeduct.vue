<template>
    <div id="PayListDetail" v-loading="fullscreenLoading" :style="{height:PayListDetailHeight}">
        <div class="kq-wapper">
            <div class="headertitle clearfix">
                <h2 class="fl"><span @click="goPayrollList">工资核算</span> <i class="icon-arrow-right"></i> <span @click="eidtPayroll(1)">{{this.page_data.general.order_name}}</span> <i class="icon-arrow-right"></i> {{this.page_data.general.order_name}} 工资扣发</h2> 
            </div>
            <div class="kq-header">
                <div class="kq-tab">                    
                    <h2>结算记录 ({{page_data.detail.list.length}}人)</h2>
                    <div class="kq-count-day" v-if="project_type == 3">
                        <el-table :data="page_data.detail.list" border empty-text="暂无数据">
                            <el-table-column prop="user_name" fixed show-overflow-tooltip label="姓名" width="110"></el-table-column>
                            <el-table-column prop="mobile" label="手机号" width="120" ></el-table-column>
                            <el-table-column prop="id_number" label="身份证号" width="170" ></el-table-column>
                            <el-table-column prop="actual_work_days" label="实际出勤" width="90"></el-table-column>
                            <el-table-column prop="overtime_days" label="加班天数" width="90"></el-table-column>
                            <el-table-column prop="base_wage" label="基本工资"  :formatter="formatter" width="90"></el-table-column>
                            <el-table-column prop="overtime_wage" label="加班费" :formatter="formatter" width="90"></el-table-column>
                            <el-table-column prop="merit_wage" label="绩效"  :formatter="formatter" width="90"></el-table-column>
                            <el-table-column prop="subsidy_wage" label="补贴" :formatter="formatter" width="90"></el-table-column>
                            <el-table-column prop="other_wage" label="薪酬其他" :formatter="formatter" width="90"></el-table-column>
                            <el-table-column prop="income_tax" label="当月个税" :formatter="formatter" width="90" ></el-table-column>
                            <el-table-column prop="personal_last_month_ss_real" label="当月社保" :formatter="formatter" width="90"></el-table-column>
                            <el-table-column label="实发工资" width="90">
                                <template slot-scope="scope">
                                    <span>{{scope.row.total_wage/100 || 0}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="pay_status" v-if="page_data.general.payment_method != 2 && project_type == 3 " label="提现状态" width="90">
                                <template slot-scope="scope">
                                    <template v-if="scope.row.fail_reason">
                                        <el-tooltip class="item" effect="dark" :content="scope.row.fail_reason" placement="top-start">
                                            <span class="operation_pay">{{scope.row.pay_status_text}}</span>
                                        </el-tooltip>
                                    </template>
                                    <template v-else>
                                        <span class="operation_pay">{{scope.row.pay_status_text}}</span>
                                    </template>
                                </template>
                            </el-table-column>
                            <el-table-column prop="remark" show-overflow-tooltip label="备注"  width="200"></el-table-column>
                            <el-table-column label="评价" class-name="tableevaluation" width="200">
                              <template slot-scope="scope">
                              <div  class="evaluation-div">
                                  <i v-bind:class="['el-icon-star-on', itemindex < scope.row.comment_star ? 'selected-star' : '' ]" v-for="(item,itemindex) in foreachStar" :key="itemindex"></i>
                              </div>
                              </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div class="kq-count-day" v-else>
                        <div v-if="pay_type != 2 && page_data.action_no.action_no == 4" class="select-person">
                            <el-form :inline="true" :model="searchPerson" class="demo-form-inline">
                                <el-form-item label="人员：">
                                    <el-input v-model="searchPerson.user" placeholder="姓名/手机号"></el-input>
                                </el-form-item>
                                <el-form-item label="是否完成支付">
                                    <el-select v-model="searchPerson.paySataus">
                                        <el-option label="不限" value=""></el-option>
                                        <el-option label="否" value="0"></el-option>
                                        <el-option label="是" value="1"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-form>
                        </div>
                        <div class="kq-table-day yf-payrolllist">
                            <el-table :data="page_data.detail.list" border  style="width: 100%" empty-text="暂无数据"  :row-class-name="tableRowClassName">
                                <el-table-column prop="user_name" show-overflow-tooltip :label="pay_type && pay_type == 2 ? '供应商姓名' : '姓名'" width="110" class-name="tablefirst"></el-table-column>
                                <el-table-column prop="mobile" show-overflow-tooltip :label="pay_type && pay_type == 2 ? '供应商手机号' : '手机号'" width="120" ></el-table-column>
                                <template v-if="pay_type && pay_type == 2 ">
                                </template>
                                <template v-else>
                                    <el-table-column :prop="page_data.detail.base_wage_unit == 0 ? 'all_days' : 'total_time'" :label="page_data.detail.base_wage_unit == 0 ? '出勤天数' : '出勤工时' " width="90" ></el-table-column>
                                </template>
                                <template v-if="pay_type && pay_type == 2 ">
                                    <el-table-column prop="base_wage" show-overflow-tooltip label="供应商费用(元)" width="120" :formatter="formatter"></el-table-column>
                                </template>
                                <template v-else>
                                    <el-table-column prop="base_wage" v-if="pay_type && pay_type == 1" show-overflow-tooltip label="奖金(元)" width="120" :formatter="formatter"></el-table-column>
                                    <el-table-column prop="base_wage" v-else show-overflow-tooltip label="基本工资(元)" width="120" :formatter="formatter"></el-table-column>
                                </template>
                                <template v-if="pay_type && pay_type == 2 ">
                                    <el-table-column show-overflow-tooltip label="支付方式" width="100">
                                      <template slot-scope="scope">
                                          <span v-if="scope.row.pay_type == 1">线上支付</span>
                                          <span v-if="scope.row.pay_type == 2">线下支付</span>
                                      </template>
                                    </el-table-column>
                                </template>
                                
                                <el-table-column :prop="item.field" show-overflow-tooltip :label="item.name+ '(元)'" width="100" v-for="(item,index) in extra_pay" :formatter="formatter" :key="index"></el-table-column>
                                <el-table-column prop="total_wage" show-overflow-tooltip label="合计" width="100" :formatter="formatter"></el-table-column>

                                <template v-if="pay_type != 2 && page_data.action_no.action_no == 4">
                                    <el-table-column 
                                        prop="paid_wage" 
                                        label="已发放金额" 
                                        width="120" 
                                        :formatter="formatter" 
                                        :render-header="renderHeadQueIcon">
                                    </el-table-column>
                                    <el-table-column  
                                        label="本次发放金额" 
                                        :render-header="renderHeadQueIcon"
                                        width="140" 
                                        :formatter="formatter"
                                        >
                                        <template slot-scope="scope">
                                            <input  
                                                v-model="scope.row.current_wage" 
                                                :class="['el-input__inner',scope.row.signerr ?  'signerr-sty' : '' ]" 
                                                autocomplete="off" 
                                                type="text" 
                                                rows="2" 
                                                :disabled="scope.row.is_finish_payment == 1"
                                                validateevent="true" 
                                                :controls="false">
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="is_finish_payment" label="是否完成支付" :render-header="renderHeadQueIcon" width="150">
                                        <template slot-scope="scope">
                                            <span>{{scope.row.is_finish_payment == 1 ? '是' : '否'}}</span>
                                        </template>
                                    </el-table-column>
                                </template>                               
                                <el-table-column show-overflow-tooltip min-width="120" label="备注" v-if="pay_type != 2 && page_data.action_no.action_no == 4">
                                    <template slot-scope="scope">
                                        <input v-model="scope.row.remark"    class="el-input__inner remark_input" autocomplete="off" type="text" rows="2" validateevent="true"  placeholder="请输入"></template>
                                </el-table-column>
                                <el-table-column v-else prop="remark" show-overflow-tooltip min-width="120" label="备注" ></el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <p style="padding:15px 10px;color:#8492a6;font-size:12px;" v-if="pay_type && pay_type == 2">注：超7000的费用结算请项目经理/执行走线下支付流程</p>
                </div>
            </div>
      </div>
      <div class="fixedbar">
          <div v-if="project_type == 2 || project_type == 4">
          </div>
          <div v-else>
            <template v-if="page_data.action_no.action_no == 4">
                <template v-if="project_type == 1 || project_type == 5">
                    <div class="payroll-scope" >
                      <div class="submit payroll-scoperight " style="margin-right: 10px;background: #ccc" @click="eidtPayroll(1)">
                        <p>取 消</p>
                      </div>
                      <div class="submit payroll-scoperight " @click="eidtPayroll(2)">
                        <p>保 存</p>
                      </div>
                    </div>
                </template>
            </template>
          </div>
      </div>
  </div>
</template>
<script>
  import * as util from '../assets/js/util.js' 
  let $ = require("jquery")
  export default{
    data: function(){
      return{ 
        dialogTableprotocol:false,
        submitObj:'',
        pay_type:'',
        showaddPersonnelbtn:true,
        to_user_id:'',
        widthdrawUserPay:'',
        PayListDetailHeight:0,
        showwithdraw:false, 
        fixedbarwidth:0,
        transform:false,
        showsetexit:false,
        startDate:'',
        endDate:'',
        fullscreenLoading:true,
        showsetdel:false,
        btnDisable:false,
        extra_pay:[],
        showrejected:false,
        foreachStar:[1,2,3,4,5],
        payTypeDiaText:'',//全职选择的支付方式
        team_id: 0,
        project_id: 0,
        user_id: 0,
        order_id: 0,
        export_wage_order:false,
        setting_wage_order:false,
        page_data: {
            "general": {
                "order_name": "",
                "total_wage": 0,
                "start_date": 0,//时间戳
                "end_date": 0,
                "status_no": -1 //工资单状态 0：草稿 1：已提交，待审批 2：通过 3：驳回 -1：删除
            },
            "approve": {
                "approve_flag": 0, //0不展示 1展示
                "create_uid": 0,
                "approve_uid": 0,
                "approve_user_name": "", //审批人
                "action_id": 0,
                "remark": "",
                "create_date": "",
                "create_at": ""
            },
            "detail": {
                "detail_exist": 0, //0:不展示详情栏 1：展示详情栏
                "base_wage_unit": "0", //0：元/天 1：元/小时
                "list": [
             
                ]
            },
            "action_no": {
                "action_no": 0 //不同角色的操作码 0:无操作 1:继续编辑 2:重新编辑 3:进行通过或驳回的操作
            }
        },
        payrollform:{
            remark:''
        },
        rules:{
            remark:[
                {max: 1000, message: '长度在 1000 个字符以下', trigger: 'blur' }
            ],
        },
        project_type:'',  //  项目类型  1||5 兼职   3 全职   2 供应商
        current_user_role_id:'',   // 当前用户的角色 id
        unSignListData:[],   // 未签署电子合同协议的用户
        payTypeDia:false,
        payTypeDiaText:'',
        searchPerson:{
            user:'',
            paySataus:''
        },
        btnDisable:false,
      }
    },
    vuex: {
      getters: {

      },
      actions: {

      }
    },

    watch:{
    },
    methods: {
        /**
         * 初始化
         * @method init
         * @public
         * @return {Null} void
         */
        init (){
          // alert(location.href)
          this.fixedbarwidth =(window.innerWidth - 200) + 'px'
          this.PayListDetailHeight = $('.side_bar').height() + 'px';
          this.team_id = util.getLocalStorage('projectStorageInfo').team_id
          this.project_id = util.getLocalStorage('projectStorageInfo').project_id
          this.order_id = document.URL.split('=')[1]   
          this.pay_type = util.getLocalStorage('savePayDetail') && util.getLocalStorage('savePayDetail').type
          // console.log(util.getLocalStorage('savePayDetail'))
          // window.localStorage.removeItem('savePayDetail')
          if(!this.team_id){
              this.$router.push('overviews'); 
              this.fullscreenLoading = false;
            return false;
          }
          this.getpermission();
          this.getData()
          this.getOverview()
        },
        //获取工资单详情
        getData(){
          util.ajax({
              url:'/wage/order_user/detail',
              type:'GET',
              data:{
                  team_id: this.team_id,
                  project_id: this.project_id,
                  order_id: this.order_id
              },
              timeout:10000,
              success:(result) => {
                if(result&&result.errno == 0){
                  let data = result.data;
                  this.page_data = data;
                  this.page_data.detail.list.map((lab,i) =>{
                    //signerr 标记本次发放金额输入框 true则显示红色
                    this.page_data.detail.list[i].signerr = false;
                    //current_wage 服务器下发单位为分，为了方便编辑展示为元
                    this.page_data.detail.list[i].current_wage = (+this.page_data.detail.list[i].current_wage)/100
                  })
                  this.is_allow_withholds = data.general.is_allow_withholds;
                  if(data.detail.list.length == 0){
                    util.ajax({
                      url:'/wage/component/get',
                      type:'GET',
                      data:{
                          team_id: this.team_id,
                          project_id: this.project_id,
                      },
                      timeout:10000,
                      success:(result) => {
                        if(result&&result.errno == 0){
                          let dataS = result.data.setting_data;
                          this.fullscreenLoading = false;
                          this.startDate = util.getLocalTime(this.page_data.general.start_date*1000,'yyyy-MM-dd') + '~ ' 
                          this.endDate = util.getLocalTime(this.page_data.general.end_date*1000,'yyyy-MM-dd')
                        }else{
                          this.alertinfo(result.errmsg);
                        }
                      },
                      error: (xhr, status) => {
                          this.alertinfo('服务器异常');
                      },
                      noNetwork: () => {
                          this.alertinfo('网络连接失败，请检查网络');
                      }
                    })
                  }else{
                      this.extra_pay = data.detail.list[0].extra_pay;
                      data.detail.list.map((elem,i) =>{
                          let extra_pay = elem.extra_pay;
                          data.detail.list[i].all_days = data.detail.list[i].normal_days+data.detail.list[i].abnormal_days
                          extra_pay.map(function(elem, n) {
                              data.detail.list[i][extra_pay[n].field] = extra_pay[n].value || '';
                          });
                          delete data.detail.list[i].extra_pay;
                      });
                      this.fullscreenLoading = false;
                      this.startDate = util.getLocalTime(this.page_data.general.start_date*1000,'yyyy-MM-dd') + '~ ' 
                      this.endDate = util.getLocalTime(this.page_data.general.end_date*1000,'yyyy-MM-dd')
                  }
                }else{
                  this.alertinfo(result.errmsg);
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
        renderHeadQueIcon(h, {column}) {
            return h(
                'el-tooltip',
                {
                  props: {
                    content: (function() {
                      let label = column.label
                      switch (label) {
                        case '已发放金额':
                          return '已发放金额是本工资单中已经给该名员工发放的金额总和'
                          break
                        case '本次发放金额':
                          return "本次发放金额，是本次支付需要给该员工发放的金额，可以编辑调整，金额需要小于等于‘合计’减‘已发放金额"
                          break
                        case '是否完成支付':
                          return "若该名员工本工资单中的金额已经全部支付状态为'是'，未全部支付则状态为'否'"
                          break
                      }
                    })(),
                    placement: 'top'
                  },
                  domProps: {
                    innerHTML: column.label + '<i class="dm-icon-question"></i>'
                  }
                },
                [h('span')]
              )
        },
        clickTableHead(val) {
            console.log(val);
        },
        /**
         * It's a magic function
         * @Author   YF
         * @DateTime 2020-09-02
         * @example
         * @description 搜索人员
         * @return   {[type]}   [description]
         */
        onSearchPerson(){

        },
        /**
         * It's a magic function
         * @Author   YF
         * @DateTime 2020-09-02
         * @description 编辑或者保存工资单，只有在兼职工资单可触发
         * @return   {[type]}   [description]
         */
        eidtPayroll(type){
            if(type == 1){
              let PaylistDetail = 'PaylistDetail?order_id=' + this.order_id;
              this.$router.push(PaylistDetail)
            }else{
                let tableList = this.page_data.detail.list;
                let signerr = false;
                let isNum = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
                for(let i = 0; i < tableList.length; i++){
                    tableList[i].signerr = false;
                    let current_wage = tableList[i].current_wage.toString();
                    if(current_wage === ''){
                        tableList[i].signerr = true;
                        signerr = true;
                        continue;
                    }
                    //是否为两位小数
                    if(current_wage != 0 && !isNum.test(current_wage)){
                        //标记本次发放金额输入框 true则显示红色
                        tableList[i].signerr = true;
                        signerr = true;
                        continue;
                    }
                    //是否为099 形式
                    if(current_wage != 0 && current_wage.indexOf('0') == 0 && current_wage.indexOf('.') != 1){
                        tableList[i].signerr = true;
                        signerr = true;
                        continue;
                    }
                    //小于等于【合计】减【已发放金额】
                    if(tableList[i].current_wage > ((tableList[i].total_wage - tableList[i].paid_wage)/100)){
                        tableList[i].signerr = true;
                        signerr = true;
                        continue;
                    }
                }
                this.page_data.detail.list = JSON.parse(JSON.stringify(this.page_data.detail.list))
                if(signerr){
                    this.alertinfo('本次发放金额填写有误，请检查')
                    return;
                }else{
                    this.submitDataFn()
                }
            }
        },
        submitDataFn(){
          if(this.btnDisable)return;
          this.btnDisable = true; 
            this.fullscreenLoading = true;
            let submitData = {wage_bar:[],wage_order:{}}
            let tableList = this.page_data.detail.list;
            let current_total_wage = 0 ;
            for(let i = 0; i < tableList.length; i++){
                submitData.wage_bar.push({
                    user_id:tableList[i].user_id,
                    user_name:tableList[i].user_name,
                    base_wage:tableList[i].base_wage,
                    current_wage:tableList[i].current_wage  * 100,
                    remark:tableList[i].remark
                });
                current_total_wage += (tableList[i].current_wage  * 100);
            }
            submitData.wage_order.order_id = this.order_id;
            submitData.wage_order.current_total_wage = current_total_wage;
            util.ajax({
              url:'/wage/order_user_child/save',
              type:'POST',
              data:{
                team_id: this.team_id,
                project_id: this.project_id,
                order_id: this.order_id,
                wage_info:JSON.stringify(submitData)
              },
              timeout:10000,
              success:(obj) => {
                this.btnDisable = false;
                if(obj && obj.errno == 0){
                  this.alertinfo('编辑成功','success');
                  let PaylistDetail = 'PaylistDetail?order_id=' + this.order_id;
                  this.$router.push(PaylistDetail)
                }else{
                  this.alertinfo(obj.errmsg);
                }
              },
              error: (xhr, status) => {
                this.btnDisable = false;
                this.alertinfo('网络连接失败，请检查网络');
              },
              noNetwork: () => {
                this.btnDisable = false;
                //网络超时
                this.alertinfo('网络连接失败，请检查网络');
              }
            })     
        },
        //工资单位变为元
        formatter(row,column){
          return (+row[column.property])/100
        },
        //返回列表
        goPayrollList(){
            this.$router.replace('PayrollAccounting')
        },
        //
        getpermission(){
          util.ajax({
            url:'/permission/application',
            type:'GET',
            data:{
              team_id: this.team_id,
              project_id: this.project_id,
              application_id: 6
            },
            timeout:10000,
            success:(obj) => {
              if(obj && obj.errno == 0){
                obj.data.forEach( (o) => {
                  if(o.id_name == 'export_wage_order'){
                     this.export_wage_order = true
                  }
                  if(o.id_name == 'setting_wage_order'){
                    this.setting_wage_order = true;
                  }
                })
              }
            },
            error: (xhr, status) => {
              this.alertinfo('网络连接失败，请检查网络');
            },
            noNetwork: () => {
              //网络超时
              this.alertinfo('网络连接失败，请检查网络');
            }
          })          
        },
        // 显示错误信息
        alertinfo(text,type){
          this.btnDisable = false; 
          this.fullscreenLoading = false;
          this.$message({
            showClose: true,
            message: text,
            type: type || 'warning',
          });
        },
        getOverview(){
          util.ajax({
            url:'/project/overview',
            type:'GET',
            data:{
                team_id: this.team_id,
                project_id : this.project_id
            },
            timeout:10000,
            success:(obj) => {
              if(obj && obj.errno == 0){
                this.project_type = obj.data.list.project_type
                this.current_user_role_id = obj.data.list.current_user_role_id
              }
            },   
            error: (xhr, status) => {
             
            },
            noNetwork: () => {
             
            }
          })
        },
        //过滤搜索
        tableRowClassName: function (row, index) {
            if(this.is_allow_withholds != 1) return '';
            if(this.searchPerson.paySataus === ''){
                if ((row.user_name + row.mobile).indexOf(this.searchPerson.user) !== -1) {
                  return '';
                }
                return 'hidden-row';
            }else{
                if ((row.user_name + row.mobile).indexOf(this.searchPerson.user) !== -1 && row.is_finish_payment == this.searchPerson.paySataus) {
                  return '';
                }
                return 'hidden-row';
            }
        },
    },
    created(){
        this.init();
    }
  }
</script>

<style  src='../assets/css/PayListDetail.css'></style>
<style  src='../assets/css/base.css'></style>
<style scope>
    
.applications{
    overflow-y:hidden;
}
</style>
