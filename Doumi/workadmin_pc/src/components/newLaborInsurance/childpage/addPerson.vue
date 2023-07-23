<template>
  <div class="insurance-addperson">
    <div class="kq-wapper">
      <div class="headertitle clearfix">
        <h2 class="fl"><span @click="goInsurance">用工保险</span> <i class="icon-arrow-right"></i> 添加投保人</h2>
      </div>
      <div class="addPerson-info">
        <p style="color: #FFA928;">月单和日单雇主险当天16：00之前投保，T＋1生效；当天16：00以后投保，T＋2生效；日单意外险当天23：40之前投保，当天生效，23：40之后投保，T＋1生效；</p>
      </div>
      <div class="person_main">
        <el-form :model="ruleForm"  ref="ruleForm" label-width="117px" class="addPerson-form">
          <el-form-item label="选择投保人"  class="addperson-item">
            <div class="g_m_wrap" @click="openGroupSelecter">
              <div class="g_m_item" v-for="item in ruleForm.personList">
                <div class="item_icon" :class="{'item_icon_p': item.selType === 'peple'}"></div>
                <div class="item_name">{{item.name}}</div>
              </div>
              <div class="add_item">请添加</div>
            </div>
            <select-member-group-multi title="选择投保人" ref="profile" :all-groups="all_groups" :selected-members-groups="ruleForm.personList" v-on:confirmGroupSelecter="confirmGroupSelecter"></select-member-group-multi>
            <p class="person-total">共选择了<span style="color: #FF7878;">{{PeronnelIdList.length}}</span>个人</p>
          </el-form-item>
          <el-form-item label="投保方案" :class="{'plan-select-item':true,'plan-select-item-def':policyPrice == '' }" >
            <el-select v-model="ruleForm.adv_name" filterable placeholder="请选择" style="width:100%;" @change="changePlan">
              <template v-for="item in packageList">
                <el-option :label="item.adv_name" :key="item.id" :value="item.adv_name"></el-option>
              </template>
            </el-select>
            <p class="plan-info" v-if="policyPrice != ''">
                方案价格：<span style="color: #FF7878;">{{policyPrice}}</span> {{unit}}
            </p>
          </el-form-item>

          <!-- :picker-options="startPickerOptionsMonth" -->
          <el-form-item  v-show="dayOrMonth === 2" label="起保日期" class="el-form-item-zd">
            <el-date-picker  
              v-model="ruleForm.beginDate" 
              type="date" 
              @change="dataChange"
              placeholder="选择日期" 
              style="width: 100%;" 
              :clearable="false"
              :editable="false"
              >
            </el-date-picker>
            <p class="button-info">注：默认购买起保日期所在的当月，下月会提前3天提示是否自动续保</p>
          </el-form-item>
          <!-- :picker-options="startPickerOptionsDay" -->
          <el-form-item v-show="onlineOrOffLine === 1 && dayOrMonth === 1" label="选择日期" >
            <el-date-picker
              placeholder="选择日期"
              @change="dataScopeChange"
              style="width: 100%;" 
              :editable="false" 
              :clearable="false"
              v-model="ruleForm.dateScope"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <!-- :picker-options="startPickerOptionsDay2" -->
          <el-form-item v-show="onlineOrOffLine === 2 && dayOrMonth === 1" label="选择日期" >
            <el-date-picker
              placeholder="选择日期"
              @change="dataScopeChange"
              style="width: 100%;" 
              :editable="false" 
              :clearable="false"
              v-model="ruleForm.dateScope2"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="工种" >
            <el-input v-model="ruleForm.workType" placeholder='工种的填入尽可能靠近职位类别表哦，如不知道请询问客服' ></el-input>
          </el-form-item>
          <el-form-item label="职位类别" >
            <el-select v-model="ruleForm.jobType" style="width:100%;" class="mystatus">
              <template v-for="team in jobTypeList">
                <el-option :label="team.name" :key="team.id" :value="team.id"></el-option>
              </template>
            </el-select>
            <p class="download-excel" v-if="downLoad">下载职位类别表：<a :href="downLoad" :download="downLoadName">{{downLoadName}}</a></p>
            <p class="button-info">工种和职位类别关系到后期理赔，请慎重选择，无法确认请联系客服</p>
          </el-form-item>
          <el-form-item label="" prop="" style="margin-bottom:67px;" class="item-btn-main">
            <el-button class="cancel-btn" @click="goInsurance">取 消</el-button>
            <el-button type="primary" class="save-btn" :disabled="disBtn" @click="savaPersonFn">保 存</el-button>
            <div class="save-message" v-show="amount != 0 && amount != NaN">
              <p>本次投保金额{{amount}}元{{amount < balance ? '' : '，当前剩余' + balance + '元，余额不足，请充值！'}}</p>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
import SelectMemberGroupMulti from '@/components/common/SelectMemberGroupMulti'

export default {
  name: 'ProjectSet',
  components: {
    SelectMemberGroupMulti,
  },
  data() {
    return {
      downLoad:'',
      disBtn:false,
      all_groups:[],
      selMonthDays:0,//月投保方案 天数
      selNamDays:0,// 月投保 当月总天数
      selDayDays:0,// 日投保方案 天数
      amount:'',//总金额
      balance:100,//可用余额
      start_dateD:'',//按日开始日期
      end_dateD:'',//按日结束日期
      start_dateM:'',//按月开始日期
      end_dateM:'',//按月结束日期
      ruleForm: {
        personList: [],
        adv_name: '',
        beginDate: '',
        workType: '',
        jobType: '',
        dateScope:'',
        dateScope2:''
      },
      downLoadName:'',//下载文件名
      packageList:[],//保险方案
      policyPrice:0,//选中的价格
      dayOrMonth:3,//按日or按月投保 1 日 2 月
      jobTypeList: [
        { name: '一类', id: 1, }, 
        { name: '二类', id: 2, },
        { name: '三类', id: 3, },
        { name: '四类', id: 4, },
        { name: '五类', id: 5, },
        { name: '五类以上', id: 6}
      ],
      startPickerOptionsDay: { // 按日起保线上日期 限制
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      startPickerOptionsMonth: { // 按月起保日期 限制
        disabledDate(time) {
          let todDayHours = new Date().getHours();
          if(todDayHours < 16){
            return time.getTime() < Date.now();
          }else{
            return time.getTime() < (Date.now() +  8.64e7);
          }
        }
      },
      startPickerOptionsDay2: { // 按日投保下线 限制
        disabledDate(time) {
          let todDayHours = new Date().getHours();
          if(todDayHours < 16){
            return time.getTime() < Date.now();
          }else{
            return time.getTime() < (Date.now() +  8.64e7);
          }
        }
      },
      unit:'',
      PeronnelIdList:[],
    }
  },
  methods: {
    init() {
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      this.getPackage()
      this.getMemberGroup()
      this.getBalance()
    },
    getBalance(){
      util.ajax({
        url:'/insurance/query/adv_balance',
        type:'GET',
        data:{
         project_id:this.project_id,
         adv_type:35,
         team_id:this.team_id
        },
        timeout:10000,
        success:(result) => {
          if(result&&result.errno == 0){
            this.balance =result.data.surplus_num / 100;
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
    getPackage(){
      util.ajax({
        url:'/insurance/query/adv_buy_list',
        type:'POST',
        data:{
         project_id:this.project_id,
         charge_type:40,
         team_id:this.team_id
        },
        timeout:10000,
        success:(result) => {
          if(result&&result.errno == 0){
            if(result.data &&  result.data instanceof Array){
              for(let i = 0; i < result.data.length; i ++ ){
                this.packageList.push({
                  id:result.data[i].id,
                  adv_name:result.data[i].adv_name,
                  unit:result.data[i].ext.unit,
                  price:result.data[i].ext.price,
                  date_type:result.data[i].ext.date_type,
                  line_type:result.data[i].ext.line_type,
                })
              }
            }
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
    getMemberGroup() {
      //获取可选择小组和人员列表
      util.ajax({
        url: '/group/node_data_tree',
        type: 'GET',
        data: {
          group_id: 0,
          team_id: this.team_id,
          project_id: this.project_id
        },
        success: (res) => {
          // console.log('小组和人员列表')
          // console.log(res)
          if (res && res.errno == 0) {
            this.all_groups = res.data
          }
        },
        error: (xhr, status) => {

        },
        noNetwork: () => {
          // 网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    savaPersonFn(){
      let checkFormSt = this.checkFormFn() || false;
      if(!checkFormSt) return;
      this.disBtn = true;
      let start_date,end_date;
      if(this.dayOrMonth == 2){
        start_date = this.start_dateM;
        end_date = this.end_dateM;
      }else if(this.dayOrMonth == 1){
        end_date = this.end_dateD;
        start_date = this.start_dateD;
      }
      util.ajax({
        url: '/insurance/audit/create',
        type: 'POST',
        data: {
          insurance_plan: this.ruleForm.adv_name,
          total_amount:this.amount,
          start_date:start_date,
          end_date:end_date,
          work_type:this.ruleForm.workType,
          job_category:this.ruleForm.jobType,
          insurance_user_ids:this.PeronnelIdList,
          team_id: this.team_id,
          project_id: this.project_id
        },
        success: (res) => {
          this.disBtn = false;
          if (res && res.errno == 0) {
            this.$message({
              showClose: true,
              message: '添加成功',
              type: 'success'
            });
            this.goInsurance()
          }else{
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
            this.disBtn = false;

        },
        noNetwork: () => {
            this.disBtn = false;
          // 网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })


    },
    checkFormFn(){
      if(this.ruleForm.personList.length  == 0){
        this.$message({
          showClose: true,
          message: '请选择投保人！',
          type: 'warning'
        });
        return;
      };
      if(!this.ruleForm.adv_name){
        this.$message({
          showClose: true,
          message: '请选择投保方案！',
          type: 'warning'
        });
        return;
      };
      if(this.dayOrMonth == 1 && this.selDayDays == 0){
        this.$message({
          showClose: true,
          message: '请选择日期',
          type: 'warning'
        });
        return;
      };
      if(this.dayOrMonth == 2 && this.selMonthDays == 0){
        this.$message({
          showClose: true,
          message: '请选择起保日期',
          type: 'warning'
        });
        return;
      };
      if(!this.ruleForm.workType){
        this.$message({
          showClose: true,
          message: '请填写工种！',
          type: 'warning'
        });
        return;
      };
      if(!this.ruleForm.jobType){
        this.$message({
          showClose: true,
          message: '请选择职位类别',
          type: 'warning'
        });
        return;
      };
      return true;

    },
    //选择范围 点击确定回调
    confirmGroupSelecter(val) {
      console.log(val)
      this.ruleForm.personList = val          
      let peronnelList = [],
          newPeronnelList = [],
          PeronnelIdList = [];
      for(let i = 0 ,lg = val.length; i < lg; i++){
        peronnelList = peronnelList.concat(val[i].PeronnelList)
      }
      //util.setLocalStorage('origin_selected_groups', this.origin_selected_groups)
      for(let n = 0, lt = peronnelList.length; n < lt ; n++){
        if(PeronnelIdList.indexOf(peronnelList[n].user_id) === -1){
          PeronnelIdList = PeronnelIdList.concat(peronnelList[n].user_id)
          newPeronnelList = newPeronnelList.concat(peronnelList[n])
        }
      }
      this.PeronnelIdList = PeronnelIdList;
      this.premiumPriceCal()
    },
    //人员选择
    openGroupSelecter() {
      this.$refs.profile.openGroupSelecter()
    },
    //投保方案
    changePlan(){
      this.beginDate = '';
      this.dateScope = '';
      this.dateScope2 = '';
      for(let i = 0; i < this.packageList.length; i++){
        if(this.ruleForm.adv_name == this.packageList[i].adv_name){
          this.unit = this.packageList[i].unit;
          this.dayOrMonth = this.packageList[i].date_type  == 1 ? 1 : 2;//1 日单，2 月单
          this.onlineOrOffLine = this.packageList[i].line_type  == 1 ? 1 : 2;//1 线上，2 线下
          this.policyPrice = this.packageList[i].price;
        }
      }
      console.log(this.dayOrMonth,8999999)
      console.log(this.onlineOrOffLine,8999999)
      if(this.ruleForm.adv_name.indexOf('SDGZ') != -1 && this.ruleForm.adv_name.indexOf('SDGZD') == -1){
        this.downLoad = 'http://g1-img-storage-02.dns.doumi.com:8083/16,622af36fafc9.xls';
        this.downLoadName = '史带雇主险职位类别';
      }else if(this.ruleForm.adv_name.indexOf('RSYI') != -1){
        this.downLoad = 'http://g1-img-storage-02.dns.doumi.com:8083/22,622bb28c8dd5.xls';
        this.downLoadName = '人寿意外险职位类别';
      }else if(this.ruleForm.adv_name.indexOf('SDYW') != -1){
        this.downLoad = 'http://g1-img-storage-01.dns.doumi.com:8083/15,622c3d0cd20d.xls';
        this.downLoadName = '史带意外险职位类别';
      }else if(this.ruleForm.adv_name.indexOf('SDGZD') != -1){
        this.downLoad = 'http://g1-img-storage-02.dns.doumi.com:8083/16,622af36fafc9.xls';
        this.downLoadName = '史带雇主险职位类别';
      }else{
        this.downLoad = '';
      }
      this.premiumPriceCal()
    },
    //面包屑返回
    goInsurance() {
      this.$router.replace('newLaborInsurance')
    },
    //按日选择日期
    dataScopeChange(val){
      if(val){
          this.timeval = val;
          let start_date = val.split('至')[0],
              end_date = val.split('至')[1];
          this.start_dateD = start_date;
          this.end_dateD = end_date;
          //选择的天数
          this.selDayDays = (new Date(end_date).getTime() - new Date(start_date).getTime())/(1000*60*60*24) + 1;
          console.log(this.selDayDays,'selDayDays')
          this.premiumPriceCal()
      }
    },
    //按月投保
    dataChange(val){
      let DateObj = new Date(val);
      this.selNamDays =  new Date(DateObj.getFullYear(),DateObj.getMonth()+1,0).getDate();//当月 满月天数
      this.selMonthDays = this.selNamDays  - new Date(val).getDate() + 1;//当月选择的天数
      let thisMonth = DateObj.getFullYear() + '-' + (DateObj.getMonth()+1);
      this.start_dateM = thisMonth + '-' + new Date(val).getDate();
      this.end_dateM = thisMonth + '-' + this.selNamDays;
      console.log(this.selNamDays,'selNamDays')
      console.log(this.selMonthDays,'selMonthDays')
      this.premiumPriceCal()
    },
    //计算保费价格
    premiumPriceCal(){
      if(this.dayOrMonth == 1){
        //按日
        this.amount = (this.selDayDays * this.policyPrice * this.PeronnelIdList.length).toFixed(2);;
      }else if(this.dayOrMonth == 2){
        //按月
        let dj = 0;
        if(this.selNamDays == 0){
          dj = 0;
        }else{
          dj = this.policyPrice/this.selNamDays * this.selMonthDays
        }
        this.amount = ( dj * this.PeronnelIdList.length).toFixed(2);

      }
    }
  },
  mounted() {
    this.init()
  },
  watch: {
    '$route'(to, from) {
      // 对路由变化作出响应...
      this.init()
    }
  }
}

</script>
<style src='@/assets/css/base.css'></style>
<style src='@/assets/css/addperson.css'></style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
