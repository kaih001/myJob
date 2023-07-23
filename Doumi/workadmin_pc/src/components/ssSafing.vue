<template>
  <div id="Newcreatmail" class="ssSafingWrap">
    <div class="c-top">
      <breadcrumb>
        <router-link to="ssTab" replace>社保管理</router-link>
        <router-link to="">上保险</router-link>
      </breadcrumb>
    </div>
    <div class="newCreatCount">
      <div class="steps">
        <el-steps :active="stepActive" align-center>
          <el-step title="选择参保人及险种"></el-step>
          <el-step title="填写基本信息"></el-step>
          <el-step title="核对并提交"></el-step>
        </el-steps>
      </div>
      <!-- 第一步：填写内容 -->
      <div class="step1_form" v-show="step1_form">
        <el-form :model="formStep1" :rules="rules" ref="formStep1" label-width="150px" label-position="right">
          <el-form-item label="手机号码" prop="phone">
            <!-- <el-select v-model="formStep1.phone" placeholder="请选择" style="width:50%;" filterable remote :remote-method="phoneRemoteMethod" :loading="loading">
              <el-option v-for="item in phone_list" :label="item.name" :key="item.id" :value="item.id"></el-option>
            </el-select> -->
            <el-input v-model="formStep1.phone" style="width:50%;" @blur="inputBlur(formStep1.phone)" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="fullname">
            <el-input v-model="formStep1.fullname" style="width:50%;" placeholder="请输入" :disabled="canInput"></el-input>
          </el-form-item>
          <el-form-item label="身份证号码" prop="idCard">
            <el-input v-model="formStep1.idCard" style="width:50%;" placeholder="请输入" :disabled="canInput"></el-input>
          </el-form-item>
          <el-form-item label="选择参保地" prop="insuredPlace">
            <el-select v-model="formStep1.insuredPlace" filterable placeholder="请选择" style="width:50%;" @change="cityFormat">
              <el-option v-for="item in insured_place_list" :label="item.short_name" :key="item.city_id" :value="item.city_id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="参保区县">
            <el-select v-model="formStep1.districtCounty" filterable placeholder="请选择" style="width:50%;" clearable @change="districtCountyFormat">
              <el-option v-for="item in districtCounty_list" :label="item.short_name" :key="item.district_id" :value="item.district_id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择保险" prop="ssOrFund">
            <el-checkbox-group v-model="formStep1.ssOrFund">
              <el-checkbox label="社保" name="ssType"></el-checkbox>
              <el-checkbox label="公积金" name="fundType"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="margin: 10px auto;" @click="next('formStep1')">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 第二步：填写基本信息 -->
      <div class="step2_form" v-show="step2_form">
        <el-form :model="formStep2" :rules="rules2" ref="formStep2" label-width="150px" label-position="right">
          <div v-if="ssMessShow">
            <div class="ssOrFundTitle">社保基本信息</div>
            <el-form-item label="社保参保地" prop="">
              {{formStep1.insuredPlaceName || '北京市'}}
            </el-form-item>
            <el-form-item label="社保参保区县" prop="" v-if="formStep1.districtCountyName">
              {{formStep1.districtCountyName}}
            </el-form-item>
            <el-form-item label="社保参保方式" prop="ssInsureType">
              <el-radio-group v-model="formStep2.ssInsureType">
                <el-radio v-for="(value,key) in searchData.insurance_type" :key="key" :label="value" name=""></el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="社保开始缴纳月" prop="ssMonth">
              <span v-if="formStep2.ssInsureType == '新参/转入'">
                <el-date-picker v-model="formStep2.ssMonth" type="month" placeholder="选择月" :picker-options="ssMonthOptions">
                </el-date-picker>
              </span>
              <span v-else>
                <el-date-picker v-model="formStep2.ssMonth" type="month" placeholder="选择月" :picker-options="ssMonthOptions2">
                </el-date-picker>
              </span>
            </el-form-item>
            <el-form-item label="参保身份" prop="identity">
              <el-select v-model="formStep2.identity" placeholder="请选择" style="width:50%;">
                <el-option v-for="(value,key) in searchData.insurance_identity" :key="key" :label="value" :value="key"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="参保档位" prop="gear" v-if="formStep1.insuredPlaceName == '深圳' || formStep1.insuredPlaceName == '深圳市'">
              <el-select v-model="formStep2.gear" placeholder="请选择" style="width:50%;">
                <el-option v-for="(value,key) in searchData.insurance_rank" :key="key" :label="value" :value="key"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="社保申报工资" prop="ssWages">
              <el-input v-model="formStep2.ssWages" style="width:50%;" placeholder="请输入"></el-input>
            </el-form-item>
          </div>
          <div v-if="fundMessShow">
            <div class="ssOrFundTitle">公积金基本信息</div>
            <el-form-item label="公积金参保地" prop="">
              {{formStep1.insuredPlaceName || '北京市'}}
            </el-form-item>
            <el-form-item label="公积金参保区县" prop="" v-if="formStep1.districtCountyName">
              {{formStep1.districtCountyName}}
            </el-form-item>
            <el-form-item label="公积金参保方式" prop="fundInsureType">
              <el-radio-group v-model="formStep2.fundInsureType">
                <el-radio v-for="(value,key) in searchData.insurance_type" :key="key" :label="value" name=""></el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="公积金开始缴纳月" prop="fundMonth">
              <span v-if="formStep2.fundInsureType == '新参/转入'">
                <el-date-picker v-model="formStep2.fundMonth" type="month" placeholder="选择月" format="yyyy-MM" :picker-options="ssMonthOptions">
                </el-date-picker>
              </span>
              <span v-else>
                <el-date-picker v-model="formStep2.fundMonth" type="month" placeholder="选择月" format="yyyy-MM" :picker-options="ssMonthOptions2">
                </el-date-picker>
              </span>
            </el-form-item>
            <el-form-item label="公积金企业比例" prop="companyRatio">
              <el-input v-model="formStep2.companyRatio" style="width:50%;" placeholder="仅能填写0.05-0.12之间的数据"></el-input>
            </el-form-item>
            <el-form-item label="公积金个人比例" prop="personalRatio">
              <el-input v-model="formStep2.personalRatio" style="width:50%;" placeholder="仅能填写0.05-0.12之间的数据"></el-input>
            </el-form-item>
            <el-form-item label="公积金申报工资" prop="fundWages">
              <el-input v-model="formStep2.fundWages" style="width:50%;" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="公积金账号" prop="fundNumber">
              <el-input v-model="formStep2.fundNumber" style="width:50%;" maxlength="50" placeholder="请输入"></el-input>
            </el-form-item>
          </div>
          <el-form-item>
            <el-button style="margin: 10px 50px 30px 0;" @click="step2_prev('formStep2')">上一步</el-button>
            <el-button type="primary" style="margin: 10px auto;" @click="next2('formStep2')">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 第三步 -->
      <div class="step1_form" v-show="step3_form">
        <div class="ssOrFundTitle">核对校验</div>
        <el-table
          :data="tableData3"
          height="250"
          border
          style="width: 100%">
          <el-table-column prop="month" label="开始缴纳月" width="180">
            <template scope="{row}">
              {{row.month}}
            </template>
          </el-table-column>
          <el-table-column prop="real_name" label="人员姓名" width="180"></el-table-column>
          <el-table-column prop="idnumber" label="身份证号" width="180"></el-table-column>
          <el-table-column prop="city_name" label="参保市县" width="180"></el-table-column>
          <el-table-column prop="insurance_rank" label="参保档位" width="180" v-if="showInsRank">
            <template scope="{row}">
              {{insurance_rank_filter(row.insurance_rank)}}
            </template>
          </el-table-column>
          <el-table-column prop="insurance_type" label="社保参保类型" width="180">
            <template scope="{row}">
              {{ssFundTypeFilter(row.insurance_type)}}
            </template>
          </el-table-column>
          <el-table-column prop="social_security" label="社保申报工资" width="180"></el-table-column>
          <el-table-column prop="fund_type" label="公积金参保类型" width="180">
            <template scope="{row}">
              {{ssFundTypeFilter(row.fund_type)}}
            </template>
          </el-table-column>
          <el-table-column prop="fund_social_security" label="公积金申报工资" width="180"></el-table-column>
          <el-table-column prop="enterprise_fund" label="公积金企业比例" width="180"></el-table-column>
          <el-table-column prop="personal_fund" label="公积金个人比例" width="180"></el-table-column>
          <el-table-column prop="provident_fund_account" label="公积金账号" width="180"></el-table-column>
        </el-table>
        <div>
          <el-button style="margin: 30px 50px 30px 0;" @click="step3_prev">上一步</el-button>
          <el-button type="primary"  @click="submitFun">提交并申报</el-button>
        </div>
      </div>
    </div>
    <div class="el-loading-mask custom-mask" v-show="DailogLoading">
      <div class="el-loading-spinner">
        <svg viewBox="25 25 50 50" class="circular">
          <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
        </svg>
        <p class="el-loading-text">正在提交，请等待</p>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
import breadcrumb from '@/components/common/breadcrumb'
import mixinAll from '../mixins/searchMixin.js'
let mixinInstance = new mixinAll({
    list_type: 0
})
export default {
  name: 'Newcreatmail',
  components: {
    breadcrumb
  },
  mixins:[mixinInstance],
  data() {
    let phoneReg = (rule, value, callback) => {
      const reg = /^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/;
      if (!value) {
        return callback(new Error('请填写手机号码'));
      } else if(!reg.test(value)){
        return callback(new Error('请填写正确的手机号码'));
      }else {
        callback();
      }
    };
    let companyRatioReg = (rule, value, callback) => {
      const reg = /^\d+(?=\.{0,1}\d+$|$)/;
      if (!value) {
        return callback(new Error('请填写公积金企业比例'));
      } else if(!reg.test(value) || (value<0.05 || value>0.12)){
        return callback(new Error('仅能填写0.05-0.12之间的数据'));
      }else {
        callback();
      }
    };
    let personalRatioReg = (rule, value, callback) => {
      const reg = /^\d+(?=\.{0,1}\d+$|$)/;
      if (!value) {
        return callback(new Error('请填写公积金个人比例'));
      } else if(!reg.test(value) || (value<0.05 || value>0.12)){
        return callback(new Error('仅能填写0.05-0.12之间的数据'));
      }else {
        callback();
      }
    };
    let ssWagesReg = (rule, value, callback) => {
      const reg = /^(\d+|\d+\.\d{1,2})$/;
      if (!value) {
        return callback(new Error('请填写社保申报工资'));
      } else if(!reg.test(value)){
        return callback(new Error('工资得大于0，可最多保留两位小数'));
      }else {
        callback();
      }
    };
    let fundWagesReg = (rule, value, callback) => {
      const reg = /^(\d+|\d+\.\d{1,2})$/;
      if (!value) {
        return callback(new Error('请填写公积金申报工资'));
      } else if(!reg.test(value)){
        return callback(new Error('工资得大于0，可最多保留两位小数'));
      }else {
        callback();
      }
    };
    return {
      searchData: {},
      insured_place_list: [],
      districtCounty_list: [],
      team_id: '',
      project_id: '',
      project_name: '',
      winHeight: '',
      stepActive: 1, // 第一步默认贞
      step1_form: true, // 第一步：填写内容
      step2_form: false,  //第二步：核对数据
      phone_list: [],
      formStep1: {
        phone: '',
        userId: '',
        fullname: '',
        idCard: '',
        insuredPlace: '',       // 参保地城市id
        insuredPlaceName: '',   //参保地城市名字
        districtCounty: '',
        districtCountyName: '',
        ssOrFund: []
      },
      ssMessShow: false,
      fundMessShow: false,
      formStep2: {
        ssInsureType: '',
        ssMonth: '',
        identity: '',
        gear: '',
        ssWages: '',
        fundInsureType: '',    // 公积金
        fundMonth: '',
        companyRatio: '',
        personalRatio: '',
        fundWages: '',
        fundNumber: '',
      },
      ssMonthOptions: {
        // el-date-picker禁用当月之前的月份
        disabledDate:  (time) => {
          return time.getTime() <= Date.now() - 8.64e7
        }
      },
      ssMonthOptions2: {
        // el-date-picker禁用当月和当月之后的月份
        disabledDate(time) {
          const date = new Date()
          const year = date.getFullYear()
          let month = date.getMonth() + 1
          if (month >= 1 && month <= 9) {
            month = '0' + month
          }
          const currentdate = year.toString() + month.toString()
          const timeyear = time.getFullYear()
          let timemonth = time.getMonth() + 1
          if (timemonth >= 1 && timemonth <= 9) {
            timemonth = '0' + timemonth
          }
          const timedate = timeyear.toString() + timemonth.toString()
          return currentdate <= timedate
        }
      },
      rules: {
        phone: [
          { required: true, validator: phoneReg, trigger: 'change' }
        ],
        fullname: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        idCard: [
          { required: true, message: '请输入身份证号码', trigger: 'blur' },
          // { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        insuredPlace: [
          { required: true, message: '请选择参保地', trigger: 'change' },
        ],
        ssOrFund: [
          { type: 'array', required: true, message: '请至少选择一个保险', trigger: 'change' }
        ],
      },
      rules2: {
        ssInsureType: [
          { required: true, message: '请选择社保参保方式', trigger: 'change' }
        ],
        ssMonth: [
          { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
        ],
        identity: [
          { required: true, message: '请选择参保身份', trigger: 'change' },
        ],
        gear: [
          { required: true, message: '请选择参保档位', trigger: 'change' },
        ],
        ssWages: [
          { required: true, validator: ssWagesReg, trigger: 'blur' }
        ],
        fundInsureType: [
          { required: true, message: '请选择公积金参保方式', trigger: 'change' }
        ],
        fundMonth: [
          { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
        ],
        companyRatio: [
          { required: true, validator: companyRatioReg, trigger: 'blur' },
        ],
        personalRatio: [
          { required: true, validator: personalRatioReg, trigger: 'blur' }
        ],
        fundWages: [
          { required: true, validator: fundWagesReg, trigger: 'blur' }
        ],
        // fundNumber: [
        //   { required: true, message: '请填写公积金账号', trigger: 'blur' }
        // ],
      },
      tableData3: [],
      DailogLoading:false,
      selectedMemberObj: {},
      userRelatedMess: {},       //手机号码输入完失焦搜索结果
      canInput: false,
      showInsRank: false
    }
  },
  methods: {
    init() {
      this.winHeight = window.innerHeight - 340;
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      this.project_name = util.getLocalStorage('projectStorageInfo').name
      // console.log('this.team_id===', this.team_id)
      // console.log('this.project_id===', this.project_id)
      if(window.localStorage.getItem('selectedMemberObj')) {
        const selectedMemberArr = JSON.parse(window.localStorage.getItem('selectedMemberObj'))
        this.selectedMemberObj = selectedMemberArr[0]
        this.formStep1.phone = this.selectedMemberObj.mobile
        // this.formStep1.userId = this.selectedMemberObj.user_id
        // this.formStep1.fullname = this.selectedMemberObj.nick_name
        // this.formStep1.idCard = this.selectedMemberObj.idnumber
        this.inputBlur(this.formStep1.phone)
        // console.log('phone===', this.formStep1.phone)
      }
    },
    next(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.stepActive++
          this.step1_form = false
          this.step2_form = true
          this.resetSomeValues()
        } else {
            return false;
        }
      })
    },
    resetSomeValues() {
      if(this.formStep1.ssOrFund.indexOf('社保') > -1) {
        this.ssMessShow = true
      } else {
        this.ssMessShow = false
        //取消社保之后重置社保基本信息
        this.formStep2.ssInsureType = ''
        this.formStep2.ssMonth = ''
        this.formStep2.identity = ''
        this.formStep2.gear = ''
        this.formStep2.ssWages = ''
      }
      if(this.formStep1.ssOrFund.indexOf('公积金') > -1) {
        this.fundMessShow = true
      } else {
        this.fundMessShow = false
        //取消公积金之后重置公积金基本信息
        this.formStep2.fundInsureType = ''
        this.formStep2.fundMonth = ''
        this.formStep2.companyRatio = ''
        this.formStep2.personalRatio = ''
        this.formStep2.fundWages = ''
        this.formStep2.fundNumber = ''
      }
    },
    step2_prev(formName) {
      this.$refs[formName].resetFields()
      this.stepActive--
      if (this.stepActive < 1) this.stepActive = 1;
      this.step1_form = true
      this.step2_form = false
    },
    next2(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.stepActive++
          this.step1_form = false
          this.step2_form = false
          this.step3_form = true
          const step3Data = [];
          const rowObj = this.handleSubmitData();
          const rowObj0 = JSON.parse(JSON.stringify(rowObj));
          const rowObj1 = JSON.parse(JSON.stringify(rowObj));
          const rowObj2 = JSON.parse(JSON.stringify(rowObj));
          if(rowObj['fund_month_date'] && rowObj['month_date'] && (rowObj['fund_month_date'] !== rowObj['month_date'])) {
            
            // 置空公积金字段
            rowObj1.month = rowObj['month_date']
            rowObj1.city_name = rowObj['fund_city_name']
            // rowObj1.fund_city_id = ''
            // rowObj1.fund_city_name = ''
            rowObj1.fund_type = ''
            rowObj1.fund_month_date = ''
            rowObj1.enterprise_fund = ''
            rowObj1.personal_fund = ''
            rowObj1.fund_social_security = ''
            rowObj1.provident_fund_account = ''
            // 置空社保字段
            rowObj2.month = rowObj['fund_month_date']
            rowObj2.city_name = rowObj['insurance_city_name']
            // rowObj2.insurance_city_id = ''
            // rowObj2.insurance_city_name = ''
            rowObj2.month_date = ''
            rowObj2.insurance_type = ''
            rowObj2.insurance_identity = ''
            rowObj2.insurance_rank = ''
            rowObj2.social_security = ''
            step3Data.push(rowObj1)
            step3Data.push(rowObj2)
          } else {
            if(rowObj['month_date']) {
              rowObj0.month = rowObj0['month_date']
            } else if(rowObj['fund_month_date']) {
              rowObj0.month = rowObj0['fund_month_date']
            }
            rowObj0.city_name = rowObj0['insurance_city_name']
            step3Data.push(rowObj0)
          }
          if(rowObj['insurance_city_name'] == '深圳' || rowObj['insurance_city_name'] == '深圳市') {
            this.showInsRank = true
          } else {
            this.showInsRank = false
          }
          console.log('step3Data====', step3Data)
          this.tableData3 = step3Data
        } else {
          return false;
        }
      })
    },
    // 处理提交参数
    handleSubmitData() {
      const {phone, userId, fullname, idCard, insuredPlace,districtCounty, districtCountyName, insuredPlaceName, ssOrFund} = this.formStep1
      const {ssInsureType, ssMonth, identity, gear, ssWages, fundInsureType, fundMonth, companyRatio, personalRatio, fundWages, fundNumber} = this.formStep2
      const dataParams = {
        saas_project_id: this.project_id,
        project_name: this.project_name,
        user_id: userId,
        real_name: fullname,
        mobile: phone,
        idnumber: idCard,
        month_date: ssMonth?util.formatData2(ssMonth):'',
        insurance_city_id: insuredPlace,             // 社保缴纳城市id
        insurance_city_name: insuredPlaceName,   // 社保缴纳城市名称	
        insurance_type: this.handleJFtype(ssInsureType),
        insurance_identity: identity,   
        insurance_rank: gear,           //参保档位
        social_security: ssWages,
        fund_city_id: insuredPlace,               // 公积金缴纳城市id
        fund_city_name: insuredPlaceName,
        fund_type: this.handleJFtype(fundInsureType),
        fund_month_date: fundMonth?util.formatData2(fundMonth):'',
        enterprise_fund: companyRatio,
        personal_fund: personalRatio,
        fund_social_security: fundWages,
        provident_fund_account: fundNumber,
        is_district: 0
      }
      // 判断区县是否有值
      if(districtCounty) {
        dataParams.insurance_city_id = districtCounty
        dataParams.insurance_city_name = districtCountyName
        dataParams.fund_city_id = districtCounty
        dataParams.fund_city_name = districtCountyName
        dataParams.is_district = 1
      }
      console.log('dataParams===', dataParams)
      return dataParams;
    },
    // 核对数据的上一步
    step3_prev(){
      this.stepActive--
      if (this.stepActive < 1) this.stepActive = 1;
      this.step1_form = false
      this.step2_form = true
      this.step3_form = false
    },
    // 提交申报
    submitFun() {
      const dataParams = this.handleSubmitData()
      // return false
      util.ajax({
        url: '/fulltimess/soloaddss',
        data: dataParams,
        type: 'POST',
        success: (res) => {
          if (res.errno == 0) {
            this.$message({
              showClose: true,
              message: '上保险成功',
              type: 'success'
            });
            this.$router.push(`/project/${this.project_id}/ssTab?tab=2`)
          } else if(res.errno == '39000'){
            let errTips = res.data[0].errmsg
            this.$message({
              showClose: true,
              message: errTips,
              type: 'warning'
            });
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
          console.log('xhr==', xhr)
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
    // 手机号失焦搜索
    inputBlur(phone) {
      let reg = /^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/;
      if (phone == '') {
        return;
      }
      if (!reg.test(phone)) {
        this.$message({
          showClose: true,
          message: '手机号输入有误',
          type: 'warning'
        });
        return;
      }
      setTimeout(() => {
        util.ajax({
          url:'/group/user/info/get',
          type:'GET',
          data:{
            keyword: phone,
            project_id: this.project_id,
            is_ss_fund_opt: 1
          },
          timeout:10000,
          success:(res) => {
            if(res.errno == '0'){
              this.userRelatedMess = res.data
              if(res.data.mobile) {
                this.formStep1.userId = this.userRelatedMess.id
                this.formStep1.fullname = this.userRelatedMess.real_name
                this.formStep1.idCard = this.userRelatedMess.idnumber
                this.formStep1.insuredPlace = this.userRelatedMess.station_city_id
                this.canInput = true
              } else {
                this.formStep1.userId = ''
                this.formStep1.fullname = ''
                this.formStep1.idCard = ''
                this.formStep1.insuredPlace = ''
                this.formStep1.districtCounty = ''
                this.canInput = false
              }
            } else {
              this.$message({
                showClose: true,
                message: res.errmsg,
                type: 'warning'
              });
            }
          },
          error: (xhr, status) => {
              // console.log(xhr)
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
          }
        })
      }, 100)
    },
    
    cityFormat (cityId) {
      if(cityId) {
        this.insuredCityChange()
        this.insured_place_list.forEach(item=> {
          if(cityId == item.city_id) {
            this.formStep1.insuredPlaceName = item.short_name
          }
        })
      }
    },
    districtCountyFormat(countyId) {
      this.formStep1.districtCountyName = ''
      if(countyId) {
        this.districtCounty_list.forEach(item=> {
          if(countyId == item.district_id) {
            this.formStep1.districtCountyName = item.short_name
          }
        })
      }
    },
    handleJFtype (value) {
      if(value) {
        for(let key in this.searchData.insurance_type) {
          if(value == this.searchData.insurance_type[key]){
            return key
          }
        }
      } else {
        return ''
      }
    },
    // 参保类型数字转换成汉字
    ssFundTypeFilter(value) {
      if(value) {
        for(let key in this.searchData.insurance_type) {
          if(value == key){
            return this.searchData.insurance_type[key]
          }
        }
      } else {
        return value
      }
    },
    insurance_rank_filter(value) {
      if(value) {
        for(let key in this.searchData.insurance_rank) {
          if(value == key){
            return this.searchData.insurance_rank[key]
          }
        }
      } else {
        return value
      }
    },
    insuredCityChange() {
      this.formStep1.districtCounty = ''
      this.districtCounty_list = []
      if(!this.formStep1.insuredPlace) {
        return
      }
      const data = {
        city_id: this.formStep1.insuredPlace
      };
      util.ajax({
        url: '/common/district/get',
        data: data,
        type: 'GET',
        success: (res) => {
          if (res.errno == '0') {
            this.districtCounty_list = res.data
            console.log('this.districtCounty_list===', this.districtCounty_list)
          } else {
            this.$message({
              message: res.errmsg,
              type: "error",
            });
          }
        },
        error: (xhr, status) => {
          console.log('xhr==', xhr)
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
    // ssDateFun() {
    //   if(this.formStep2.ssInsureType == '新参/转入') {
    //     console.log('新参')
    //     return  (time) => {
    //       return time.getTime() <= Date.now() - 8.64e7
    //     }
    //   }
    // }
  },
  mounted() {
    this.init();
    $(window).on('resize', () => {
      this.winHeight = window.innerHeight - 350;
    })
  },
  watch: {
    '$route'(to, from) {
      // 对路由变化作出响应...
      this.init()
    },
    'formStep2.ssInsureType'(newVal,oldVal) {
      console.log('newVal==', newVal)
      if(newVal) {
        this.formStep2.ssMonth = ''
      }
    },
    'formStep2.fundInsureType'(newVal,oldVal) {
      console.log('newVal==', newVal)
      if(newVal) {
        this.formStep2.fundMonth = ''
      }
    },
  },
  filters:{
    
  },
  beforeRouteLeave(to, from, next) {
    // console.log('离开=====')
    window.localStorage.removeItem('selectedMemberObj')
    next()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#Newcreatmail .newCreatCount .el-step__head.is-text.is-finish {
  background-color: #6699ee;
  border-color: #6699ee;
  font-weight: bold;
  font-size: 14px;
}
#Newcreatmail .newCreatCount .el-step__title.is-finish {
  color: #6699ee;
  font-size: 12px;
  font-weight: bold;
  margin-left: 5px;
}
#Newcreatmail .newCreatCount .el-step__head.is-text.is-process {
  background-color: #c0ccda;
  border-color: #c0ccda;
  font-weight: bold;
  font-size: 14px;
}
#Newcreatmail .newCreatCount .el-step__title.is-process {
  font-weight: bold;
  color: #99a9bf;
  font-size: 12px;
  margin-left: 5px;
}
#Newcreatmail .newCreatCount .el-step__head.is-text.is-wait {
  border-color: #c0ccda;
  color: #c0ccda;
  font-weight: bold;
  font-size: 14px;
}
#Newcreatmail .newCreatCount .el-step__title.is-wait {
  font-weight: bold;
  color: #99a9bf;
  font-size: 12px;
  margin-left: 5px;
}

</style>
<style scoped>
.ssSafingWrap {
  padding: 0 20px 0 20px!important;
}
.steps {
  margin: 50px 0 20px 50px;
}
.ssOrFundTitle {
  font-size: 18px;
  margin: 20px 10px;
}
.breadcrumb {
  float: none!important;
}
.breadcrumb .wraper a {
  font-size: 14px!important;
}
</style>