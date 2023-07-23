<template>
  <div id="project" class="projcet">
      <!-- 项目列表 -->
      <div class="wapper">
          <div class="top-container">
              <div class="item_switch" @mouseover="OverItemSelName" @mouseout="OutItemSelName">
                <h2 :class="{hoverh2:hoverTment}">{{itemSelName}}<i :class="{hoverIcon:hoverTment}" v-if="project_of_team || project_of_department"></i></h2>
                <div class="item_list" v-show="ifSHowItemList" >
                  <ul v-if="project_of_team || project_of_department">
                    <li v-if="project_of_team" @click="changeItemSelName('企业项目',2)">企业项目</li>
                    <li v-if="project_of_department" @click="changeItemSelName('本部门项目',1)">本部门项目</li>
                    <li @click="changeItemSelName('我参与的项目',0)">我参与的项目</li>
                  </ul>
                </div>
              </div>
              <div class="tab-nav"  >
                  <el-tabs v-model="activeName" @tab-click="tabHandleClick" class="tab-div"  >
                        <!--内容部分——全部-->
                      <el-tab-pane label="全部" name="first" class="tab-title" value="1" >
                          <div class="tab-content">
                              <div class="cont-list" :class="{'heightEmpty':projectAllData.length == 0}">
                                  <div v-show="isAddProjectBtn || projectAllData.length == 0" class="add-project" @click="addProjectClick()">
                                      <span><i class="el-icon-plus"></i></span>
                                  </div>
                                  <template v-for="item in projectAllData">
                                      <dl @click="gotoProjectDetails(item)">
                                          <!-- <dt><div class="item_icon"></div></dt> -->
                                          <dt><img :src="item.logo" alt=""></dt>
                                          <dd>
                                              <template v-if="item.out_project==1">
                                                <h3><span>外部</span>{{item.name}}</h3>
                                                <h4>所属企业：{{item.pro_name}}</h4>
                                              </template>
                                              <template v-else>
                                                <h3>{{item.name}}</h3>
                                                <h4>负责人：{{item.manager}}</h4>
                                              </template>
                                              <h5>{{item.start_date}}~{{item.end_date}} 
                                                <template v-if="item.out_project!=1">
                                                  <i v-if="item.top == 1" @click.stop="onIsTopClick(item.team_id,item.top,item.project_id)" class="el-icon-star-on"></i>
                                                  <i v-else class="el-icon-star-off" @click.stop="onIsTopClick(item.team_id,item.top,item.project_id)"></i>
                                                </template>
                                                <span v-if="item.status == 3" class="end-tip">已结束</span>
                                              </h5>
                                          </dd>
                                        </dl>
                                  </template>
                                </div>
                          </div>
                      </el-tab-pane>
                      <!--内容部分——进行中-->
                      <el-tab-pane label="进行中" name="second" class="tab-title" value="2">
                          <div class="tab-content">
                            <div class="cont-list" :class="{'heightEmpty':projectConductData.length == 0}">
                                <div v-show="isAddProjectBtn || projectConductData.length == 0" class="add-project" @click="addProjectClick()">
                                    <span><i class="el-icon-plus"></i></span>
                                </div>
                                <template v-for="(item,index) in projectConductData" >
                                    <dl @click="gotoProjectDetails(item)" :id="`listItem${index}`">
                                        <!-- <dt><div class="item_icon"></div></dt> -->
                                        <dt><img :src="item.logo" alt=""></dt>
                                        <dd>
                                            <template v-if="item.out_project==1">
                                              <h3><span>外部</span>{{item.name}}</h3>
                                              <h4>所属企业：{{item.pro_name}}</h4>
                                            </template>
                                            <template v-else>
                                              <h3>{{item.name}}</h3>
                                              <h4>负责人：{{item.manager}}</h4>
                                            </template>
                                            <h5>{{item.start_date}}~{{item.end_date}} 
                                              <template v-if="item.out_project!=1">
                                                <i v-if="item.top == 1" @click.stop="onIsTopClick(item.team_id,item.top,item.project_id)" class="el-icon-star-on"></i>
                                                <i v-else class="el-icon-star-off" @click.stop="onIsTopClick(item.team_id,item.top,item.project_id)"></i>
                                              </template>
                                                <!-- <span v-if="item.status == 3" class="end-tip">已结束</span> -->
                                            </h5>
                                        </dd>
                                    </dl>
                                </template>
                              </div>
                          </div>
                      </el-tab-pane>
                       <!--内容部分——已结束-->
                      <el-tab-pane label="已结束" name="third" class="tab-title" value="3">
                          <div class="tab-content">
                            <div class="empty-page" v-if="projectEndData.length == 0">
                                <dl>
                                    <dt><img src="../assets/imgs/empty-icon.png" alt=""></dt>
                                    <dd>暂无已结束项目</dd>
                                </dl>
                            </div>
                            <div class="cont-list">
                                <template v-for="item in projectEndData">
                                    <dl @click="gotoProjectDetails(item)">
                                        <!-- <dt><div class="item_icon"></div></dt> -->
                                        <dt><img :src="item.logo" alt=""></dt>
                                        <dd>
                                            <template v-if="item.out_project==1">
                                              <h3><span>外部</span>{{item.name}}</h3>
                                              <h4>所属企业：{{item.pro_name}}</h4>
                                            </template>
                                            <template v-else>
                                              <h3>{{item.name}}</h3>
                                              <h4>负责人：{{item.manager}}</h4>
                                            </template>
                                            <h5>{{item.start_date}}~{{item.end_date}} 
                                              <template v-if="item.out_project!=1">
                                                <i v-if="item.top == 1" @click.stop="onIsTopClick(item.team_id,item.top,item.project_id)" class="el-icon-star-on"></i>
                                                <i v-else class="el-icon-star-off"  @click.stop="onIsTopClick(item.team_id,item.top,item.project_id)"></i>
                                              </template>
                                                <span v-if="item.status == 3" class="end-tip">已结束</span>
                                            </h5>
                                        </dd>
                                    </dl>
                                </template>
                            </div>
                          </div>
                      </el-tab-pane>
                  </el-tabs>
              </div>
              <div class="tab-seach">
                  <div class="seach-input">
                     <i class="el-icon-search"></i>
                       <!--  <el-select v-model="seachInput" popper-class="select-option" no-data-text="无搜索结果" @change="gotoProjectDetails" filterable="" remote placeholder="请输入关键词" :remote-method="remoteMethod">
                            <el-option 
                                v-for="item in options4" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                                <span style="float: left">{{ item.label }}</span>
                                <span style="float: right; width:44px;height:20px;line-height:20px!important;text-align:center;border-radius: 2px; border: solid 1px #e0e6ed;font-size: 12px;color: #99a9bf;margin-right: 10px;" v-if="item.status == 3">已结束</span>
                            </el-option> -->
                            <el-autocomplete
                                popper-class="my-autocomplete"
                                v-model="seachInput"
                                :fetch-suggestions="querySearch"
                                custom-item="my-item-zh"
                                :trigger-on-focus="false"
                                placeholder="项目名称/ID"
                                class="projectSeach"
                                width="238"
                                @select="gotoProjectDetails">
                            </el-autocomplete>
                        </el-select>
                  </div>
              </div>
          </div>
      </div>
      <!-- 新建项目弹窗 -->
      <div class="popup">
          <!--需要验证-->
          <el-dialog title="创建项目" :visible.sync="dialogFormVisible" custom-class="popup-dialog-create" @close="resetForm('ruleForm')">
            <div class="el-dialog__body_wrap"  v-loading="loading_kq_detail">
              <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="74px">
                  <div class="dialog-item">
                      <el-form-item label="项目名称" :label-width="formLabelWidth" prop="name" class="require">
                          <el-input v-model="ruleForm.name" auto-complete="off" placeholder="请输入项目名称"></el-input>
                      </el-form-item>
                      <el-form-item label="开始日期" prop="startValue" class="require">
                          <el-date-picker 
                              v-model="ruleForm.startValue"
                              type="date"
                              placeholder="选择日期"
                              style="width: 100%;"
                              :editable="false"
                              :picker-options="startPickerOptions">
                          </el-date-picker>
                      </el-form-item>
                      <el-form-item label="结束日期" prop="endValue" class="require">
                          <el-date-picker 
                              v-model="ruleForm.endValue"
                              type="date"
                              placeholder="选择日期"
                              style="width: 100%;"
                              :editable="false"
                              :picker-options="endPickerOptions">
                          </el-date-picker>
                      </el-form-item>
                      <el-form-item label="项目归属" :label-width="formLabelWidth" prop="teamAscription" class="require">
                          <el-select v-model="ruleForm.teamAscription"  @change="changeValue_team_id" style="width:100%;" class="mystatus">
                              <template v-for="team in ruleForm.teamArr">
                                  <el-option :label="team.team_name" :key="team.team_id" :value="team.team_id"></el-option>
                              </template>
                          </el-select>
                      </el-form-item>
                      <el-form-item label="城市选择" :label-width="formLabelWidth" prop="address" class="require">
                          <el-select v-model="ruleForm.address" filterable placeholder="请选择" style="width:100%;">
                            <template v-for="item in ruleForm.addressArr">
                                <el-option :label="item.short_name" :key="item.city_id" :value="item.city_id"></el-option>
                            </template>
                          </el-select>
                      </el-form-item>
                      <el-form-item label="项目类型" :label-width="formLabelWidth" prop="type" class="require">
                          <el-select v-model="ruleForm.type"  @change="changeValue_type_id" placeholder="请选择项目类型" style="width:100%;" class="mystatus">
                              <template v-for="item in ruleForm.typeArr">
                                  <el-option :label="item.name" :key="item.id" :value="item.id"></el-option>
                              </template>
                          </el-select>
                      </el-form-item>


                      <el-form-item label="投保渠道" :label-width="formLabelWidth" prop="insuranceSource" class="require"  v-if="!is_premium_user">
                          <el-select v-model="ruleForm.insuranceSource" placeholder="请选择默认投保渠道" style="width:100%;" class="mystatus">
                              <template v-for="item in ruleForm.insuranceSourceArr">
                                  <el-option :label="item.name" :key="item.id" :value="item.id"></el-option>
                              </template>
                          </el-select>
                      </el-form-item>

                      <el-form-item label="合作企业" :label-width="formLabelWidth" prop="relate_team_id">
                          <el-select :popper-class="showResult?'dbl_type':'dbl_type hide'" clearable filterable remote :remote-method="inputFn" @change="changeFn" v-model="ruleForm.relate_team_id" placeholder="通过企业负责人手机号搜索企业" style="width:100%;" class="mystatus" :no-data-text="noDataText" :loading="!searchEnd">
                              <template v-for="item in ruleForm.compArr">
                                  <el-option :label="item.team_name" :key="item.team_id" :value="item.team_id">
                                    <p class='p1'>{{item.team_name}}</p>
                                    <p class='p2'>负责人：{{item.name}}（{{item.mobile}}）</p>
                                  </el-option>
                              </template>
                          </el-select>
                      </el-form-item>
                      <el-form-item label="合同主体" :label-width="formLabelWidth" prop="businessSubject" class="require"  >
                        <el-select v-model="ruleForm.businessSubject" placeholder="请选择合同主体" style="width:100%;" class="mystatus" @change="businessChange">
                          <template v-for="item in ruleForm.business_subject">
                              <el-option :label="item.name" :key="item.id" :value="item.id"></el-option>
                          </template>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="合同类型" :label-width="formLabelWidth" prop="contractType" class="require" v-if="contractTypeShow">
                        <el-radio-group v-model="ruleForm.contractType" @change="typeChange">
                          <el-radio v-for="(item,index) in ruleForm.contract_type" :label="item.id" :key="index">{{item.name}}</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      <el-form-item label="发薪主体" :label-width="formLabelWidth" prop="paySubject" class="require">
                        <el-select v-model="ruleForm.paySubject" placeholder="请选择发薪主体" style="width:100%;" class="mystatus" :disabled="payDisabled">
                          <template v-for="item in ruleForm.payment_subject_opt">
                            <el-option :label="item.name" :key="item.id" :value="item.id"></el-option>
                          </template>
                        </el-select>
                      </el-form-item>
                      <div>
                        <p class="formTips" v-html="selectTip"></p>
                      </div>
                  </div>
              </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
              <el-button  @click="resetForm('ruleForm')">取 消</el-button>
              <el-button  type="primary" @click="submitForm('ruleForm')">确 定</el-button>
            </div>
          </el-dialog>
      </div>
      <div class="el-loading-mask projectloading" v-show="loading" style="width: 1200px;top: 156px;margin: auto"><div class="el-loading-spinner"><svg viewBox="25 25 50 50" class="circular"><circle cx="50" cy="50" r="20" fill="none" class="path"></circle></svg><!----></div></div>

    
    <!-- 保险领取弹层 -->
    <div class="popupInsurance">
        <el-dialog title="" :visible.sync="dialogInsurance" custom-class="popup-dialog">
            <!-- 未领取保险 -->
            <div class="insurance_page" v-show="insurancePagePop">
                <p>有效期6个月</p>
                <div class="insurance-num">{{insurancenum}}</div>
                <div class="checkeddiv">
                     <el-checkbox v-model="insuranceChecked">我已阅读并同意</el-checkbox><a @click="gotoInsurancetxt" class="notice">《投保须知》</a>
                </div>
                <div class="ins-btn" @click="insuranceReceive">
                    <a href="#"><span>领取<br>保险</span></a>
                </div>
                <div class="close-btn" @click="dialogInsurance = false"></div>
            </div>
            <!-- 领取成功 -->
            <div class="receive_success" v-show="successPop">
                <div class="success_txt">
                    <p>保险领取成功！快去使用吧~</p>
                    <a href="https://doumi.kf5.com/hc/kb/article/1035528/ " target="_blank" class="lookbtn">查看如何投保</a>
                </div>
                <div class="close-btn" @click="dialogInsurance = false"></div>
            </div>
        </el-dialog>

    </div>      

  </div>
  
</template>
 
<script>
  import * as util from '../assets/js/util.js'
  let $ = require("jquery")

  let stop=true;//触发开关，防止多次调用事件 
  let datas = ''
  let page = 1
  let page_size = 20
  let date = new Date()
  let today = util.getStampFromDateStr(date)
  let select_team_id = ''
  let select_type_id = ''
  let status = 1
  let timer = null
  let innerHeight = window.innerHeight;
  let ajax_getting = false

  export default{
    name: 'project',
    components:{

    },
    data:function(){
      var testName = (rule, value, callback) => {
          if (!value) {
            return callback(new Error('请输入项目名称'));
          }else if(this.ruleForm.name.length > 20){
            return callback(new Error('项目名称不能超过20字'));
          }else{
            callback();
          }
      };
      var testStartTime = (rule,value,callback) => {
          if (!value) {
            return callback(new Error('请选择开始日期'));
          }else{
            callback();
          }
      };
      var testEndTime = (rule,value,callback) => {
          if(value){
              /*时间格式化*/
              let _time = util.formatData(this.ruleForm.startValue,value) 
              /*计算开始时间-结束时间的总天数*/
              var sumDays = util.DateDiff(_time.s,_time.e)
              // console.log(_time)
          }
          if (!value) {
              return callback(new Error('请选择结束日期'));
          }else if(value < this.ruleForm.startValue){
              return callback(new Error('结束时间不能小于开始时间'));
          }else if(sumDays > 365){
              return callback(new Error('开始时间和结束时间不能超过一年'));
          }else{
            callback();
          }
      };
      var testAscriptionTime = (rule,value,callback) => {
          if (!value) {
            return callback(new Error('请选择项目归属'));
          }else{
            callback();
          }
      };
      var testTypeTime = (rule,value,callback) => {
          if (!value) {
            return callback(new Error('请选择项目类型'));
          }else{
            callback();
          }
      };

      var testInsuranceSourceTime = (rule,value,callback) => {
          if (!value) {
            return callback(new Error('请选择默认投保渠道类型'));
          }else{
            callback();
          }
      };
      var testContractSubject = (rule,value,callback) => {
          if (!value) {
            return callback(new Error('请选择合同主体'));
          }else{
            callback();
          }
      };
      var testContractType = (rule,value,callback) => {
          if (!value) {
            return callback(new Error('请选择合同类型'));
          }else{
            callback();
          }
      };
      var testPaySubject = (rule,value,callback) => {
          if (!value) {
            return callback(new Error('请选择发薪主体'));
          }else{
            callback();
          }
      };
      var testAddress = (rule,value,callback) => {
          if (!value) {
            return callback(new Error('请选择项目城市'));
          }else{
            callback();
          }
      };
      var testRelate_team_id = (rule,value,callback) => {
          // console.log(this.team_id)
          // console.log(value)
          if (this.team_id == value) {
            return callback(new Error('不能选择当前所在企业'));
          }else{
            callback();
          }
      };

      return{
          is_premium_user:false,            
          dialogInsurance:false,
          insurancePagePop:true,
          successPop:false,
          insuranceChecked:true,
          loading_kq_detail: true,
          loading: true,
          searchEnd: true,
          showResult: false,
          noDataText: '您查找的企业不存在',
          insurancenum:0,
          restaurants: [],
          options4: [],
          seachInput: '',//搜索input
          list: [],
          states: [],
          restaurants: [],
          activeName: 'second',  // 3个tab切换默认选中第一个即‘全部’
          isAddProjectBtn:true,  // 控制添加按钮是否显示（判断用户是否有此添加项目权限）
          projectAllData:[],// 全部项目列表数据
          projectConductData:[],  // 正在进行中的项目数据
          projectEndData:[],    // 已经结束的项目数据
          dialogFormVisible: false,  //点击添加按钮控制弹层
          ruleForm: {  //  弹窗里边的所有数据
              name: '',    // 项目名称
              startValue: today,  // 开始时间
              endValue:'',    // 结束时间
              teamAscription: '', // 项目归属
              team_id: '', // 项目归属
              type: '',    // 项目类型
              select_team_id:'',
              address:'',
              teamArr:[], // 项目归属选项列表
              relate_team_id: '',//合作企业
              compArr: [],//合作企业列表
              typeArr:[],   // 项目类型选项列表
              addressArr:[], //所有地区城市选项列表
              insuranceSourceArr:[
                  // {id:1,name:'太保'},
                  {id:2,name:'史带'},
                  {id:3,name:'泰康'},
              ],
              business_subject:[],
              contract_type: [],
              payment_subject_opt:[],
              insuranceSource:'',
              businessSubject:'', 
              contractType: 1,
              paySubject: ''       // 发薪主体
          },
          payment_subject: {},
          payDisabled: false,
          contractTypeShow: true,
          formTips:{},
          selectTip:'',
          busiRestIdArr: [],     //去除天津至诚优聘的id集合
          formLabelWidth: '74px',  // 控制input的宽度
          startPickerOptions: {   // 开始时间选项
            disabledDate(time) {
              return time.getTime() < Date.now() - 8.64e7;
            }
          },
          endPickerOptions: {  // 结束时间选项
            disabledDate(time) {
              return time.getTime() < Date.now() - 8.64e7;
            }
          },
          rules: {  //验证规则
            name: [
                { validator: testName, trigger: 'blur' }
            ],
            startValue: [
                { validator: testStartTime, trigger: 'change' }
            ],
            endValue: [
                { validator: testEndTime, trigger: 'change' }
            ],
            teamAscription: [
              { validator: testAscriptionTime, trigger: 'change' }
            ],
            type: [
              { validator: testTypeTime, trigger: 'change' }
            ],
            insuranceSource: [
              { validator: testInsuranceSourceTime, trigger: 'change' }
            ],
            businessSubject: [
              { validator: testContractSubject, trigger: 'change' }
            ],
            contractType: [
              { validator: testContractType, trigger: 'change' }
            ],
            paySubject: [
              { validator: testPaySubject, trigger: 'change' }
            ],
            address:[
              { validator: testAddress, trigger: 'change' }
            ],
            relate_team_id:[
              { validator: testRelate_team_id, }
            ]
          },
          project_of_department:false,//部门的项目
          project_of_team:false,//企业的项目
          itemSelName:'',
          ifSHowItemList:false,
          view_type:0,
          team_id:0,
          hoverTment:false,
          statusNum:1,
          suggestions:function(){},
      }

    },
    computed:{

    },
    mounted() {

    },
    methods:{
      init (){
          /*
          *  获取项目列表
          *  项目列表包括了正在进行中的项目和已结束项目
          *  默认传0即获取全部项目
          **/
          this.getProjectDataFront()
        //  setTimeout(()=>{
        //    this.initDriver()
        //  },500)
          // this.getProjectListData(1)
          /**
          *  获取用户企业列表
          *  来判断当前用户是否有权添加项目
          *  用户有企业，则有权添加项目。否则，无权添加
          **/
          this.getUserTeam()
          //获取项目类型列表数据
          this.getProjectType()
          // 默认下拉加载进行中的项目
          this.loadingMore(1)
          //获取所有地区城市列表
          this.getAddressData()
          //检测是否保险礼包未领取接口
          this.isInsuranceReceive()

          this.is_premium_user = util.getLocalStorage('is_premium_user') == 1 ? true : false;
          this.getCreateOption()
      },
      // 获取创建项目配置
      getCreateOption(){
          util.ajax({
              url:'/project/create_option/get',
              type:'POST',
              data:{},
              timeout:10000,
              success:(obj) => {
                  if(obj && obj.errno == 0){
                    this.ruleForm.business_subject = obj.data.business_subject;
                    this.ruleForm.contract_type = obj.data.contract_type;
                    this.payment_subject = obj.data.payment_subject;
                    this.formTips = obj.data.tips;
                    const busiIdArr = obj.data.business_subject.map(item=>item.id)
                    // console.log('busiIdArr==', busiIdArr)
                    const flag = obj.data.business_subject.find(item=> item.name == '天津致诚优聘人力资源服务有限公司')
                    if(flag) {
                      const idx = busiIdArr.indexOf(flag.id)
                      busiIdArr.splice(idx, 1)
                    }
                    // console.log('busiIdArr2==', busiIdArr)
                    this.busiRestIdArr = [...busiIdArr]
                  }
              },
              error: (xhr, status) => {

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
      },
      // 合同主体切换
      businessChange(busiValue) {
        // console.log('busiValue==', busiValue)
        if(busiValue) {
          const business_arr = this.busiRestIdArr
          const contractType = this.ruleForm.contractType
          const key = busiValue+'_'+ contractType
          // console.log('contractType==', contractType)
          if(business_arr.indexOf(busiValue) > -1 && contractType) {
            this.contractTypeShow = true
            this.ruleForm.payment_subject_opt = this.payment_subject[key].opt
            this.ruleForm.paySubject = this.payment_subject[key].default
            this.payDisabled = !this.payment_subject[key].modify
            this.selectTip = this.formTips[key]
          } else if( busiValue == 4 ) {
            this.contractTypeShow = false
            this.ruleForm.contractType = 0      //当为4时合同类型值修改为0 
            this.ruleForm.payment_subject_opt = this.payment_subject['4'].opt
            this.ruleForm.paySubject = this.payment_subject['4'].default
            this.payDisabled = !this.payment_subject['4'].modify
            this.selectTip = this.formTips['4']
          } else {
            this.contractTypeShow = true
            this.ruleForm.payment_subject_opt = []
            this.ruleForm.paySubject = ''
            this.payDisabled = false
            this.selectTip = ''
          }
        }
      },
      // 合同类型切换
      typeChange(tvalue) {
        // console.log('tvalue===', this.ruleForm.businessSubject, tvalue)
        const business_arr = this.busiRestIdArr
        const business_value = this.ruleForm.businessSubject
        const key = business_value+'_'+ tvalue
        if(business_arr.indexOf(business_value) > -1 && tvalue) {
          this.ruleForm.payment_subject_opt = this.payment_subject[key].opt
          this.ruleForm.paySubject = this.payment_subject[key].default
          this.payDisabled = !this.payment_subject[key].modify
          this.selectTip = this.formTips[key]
        } else {
          this.ruleForm.payment_subject_opt = []
          this.ruleForm.paySubject = ''
          this.payDisabled = false
          this.selectTip = ''
        }
        // console.log(key, 'payment_subject_opt=', this.ruleForm.payment_subject_opt)
      },
      initDriver() {
        const driver = new Driver();
        driver.highlight({
          element: '#listItem0',
          popover: {
            title: '测试项目',
            description: '点击测试项目体验功能',
            position: 'right', // 可以使用 `top`, `left`, `right`, `bottom`
            closeBtnText: "关闭",
            animate: true,
            opacity: 0.2,
          }
        });
        // driver.highlight('#listItem0');
      },
      //检测是否保险礼包未领取接口
      isInsuranceReceive(){
          if(this.team_id == 0){
              return
          }
          util.ajax({
              url:'/insurance/insurance_giving/check',
              type:'POST',
              data:{
                  team_id:this.team_id
              },
              timeout:10000,
              success:(obj) => {
                  if(obj && obj.errno == 0){
                      if(obj.data.status == true){
                          this.dialogInsurance = true
                          this.insurancenum = obj.data.num
                      }else{
                          this.dialogInsurance = false
                      }
                  }
              },
              error: (xhr, status) => {

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
      },
      //领取保险
      insuranceReceive(){
          if(this.insuranceChecked == false){
            this.$message({
                showClose: true,
                message: '还未同意投保须知',
                type: 'warning'
            });
            return
          }
          util.ajax({
              url:'/insurance/insurance_giving/receive',
              type:'POST',
              data:{
                  team_id:this.team_id,
                  source:1
              },
              timeout:10000,
              success:(obj) => {
                  // console.log(obj)
                  if(obj && obj.errno == 0){
                      if(obj.data.status == true){
                          this.insurancePagePop = false
                          this.successPop = true
                      }
                  }
              },
              error: (xhr, status) => {

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
      },
      //前往投保须知详情页
      gotoInsurancetxt(){
          window.open(window.location.href.split('#')[0]+'#'+'/insurancetxt')
      },
      //切换项目范围
      changeItemSelName(itemname,view_type){
        page = 1
        this.seachInput = ''
        this.suggestions([]);
        this.loading = true;
        this.itemSelName = itemname;
        this.ifSHowItemList = false;
        this.view_type = view_type;
        this.getProjectListData(this.statusNum)
      },
      OverItemSelName(a,b){
        this.ifSHowItemList = true;
        if(this.project_of_team || this.project_of_department){
          this.hoverTment = true;
        }
      },
      OutItemSelName(a,b){
        this.ifSHowItemList = false;
        this.hoverTment = false;
      },
      //获取所有地区城市列表
      getAddressData(){
        util.ajax({
            url:'/common/city/all',
            type:'GET',
            data:{},
            timeout:10000,
            success:(obj) => {
                if(obj && obj.errno == 0){
                    this.ruleForm.addressArr = obj.data.sort((a, b) => a.pinyin.localeCompare(b.pinyin, 'zh-Hans-CN', {sensitivity: 'accent'}))
                    util.setLocalStorage('addressArr',this.ruleForm.addressArr)
                }
            },
            error: (xhr, status) => {
              
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
      },
      //获取权限
      getpermission(){
        util.ajax({
            url:'/user/info',
            type:'GET',
            data:{
              team_id:0,
              project_id: 0,
            },
            timeout:10000,
            success:(obj) => {
                if(obj && obj.errno == 0){
                  //console.log(JSON.stringify(obj.data))
                  this.team_id = obj.data.team_id || 0;
                  if(this.team_id == 0){
                    this.view_type = 0;
                    this.itemSelName = '我参与的项目';
                    this.init();
                    return;
                  }
                  util.ajax({
                      url:'/permission/application',
                      type:'GET',
                      data:{
                        team_id:this.team_id,
                        project_id: 0,
                      },
                      timeout:10000,
                      success:(obj) => {
                          if(obj && obj.errno == 0){
                            //console.log(JSON.stringify(obj.data))
                              obj.data.forEach( (o) => {
                                  if(o.id_name == 'project_of_department'){
                                      this.project_of_department = true
                                      this.view_type = 1;
                                      this.itemSelName = '本部门项目'
                                  }
                                  if(o.id_name == 'project_of_team'){
                                      this.project_of_team = true
                                      this.view_type = 2;
                                      this.itemSelName = '企业项目'
                                  }
                              })
                            if(!this.project_of_team && !this.project_of_department){
                                this.itemSelName = '我参与的项目';
                            }
                            this.init()
                          }
                      },
                      error: (xhr, status) => {
                        //网络超时
                        this.$message({
                          showClose: true,
                          message: '网络连接失败，请检查网络',
                          type: 'warning'
                        });
                          
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
                }
            },
            error: (xhr, status) => {
              //网络超时
              this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
                
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
      },
      //获取项目类型列表数据
      getProjectType (){
          util.ajax({
              url:'/project/type/get',
              type:'GET',
              data:{
                  team_id : 0//fixme
              },
              timeout:10000,
              success:(obj) => {
                  if(obj && obj.errno == 0){
                      this.ruleForm.typeArr = obj.data
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
      /*切换3个tab相对应的显示内容区*/
      tabHandleClick(tab, event) {
          this.loading = true;
          if(tab.index == 0){
              status = 0
              this.statusNum = 0;
          }else if(tab.index == 1){
              status = 1
              this.statusNum = 1;
          }else {
              status = 2
              this.statusNum = 2;
          }
          this.loadingMore(status)
          this.getProjectListData(status)
      },
      // 获取用户企业列表
      getUserTeam (){
          util.ajax({
              url:'/team/list/simple',
              type:'GET',
              data:{
                  team_id:0,
                  project_id:0
              },
              timeout:10000,
              success:(obj) => {
                // console.log(obj)
                  if(obj && obj.errno == 0){
                      if(obj.data.length > 0){
                          this.isAddProjectBtn = true
                          this.ruleForm.teamArr = obj.data
                      }else{
                          this.isAddProjectBtn = false
                      }
                  }
              },
              error: (xhr, status) => {
                  
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
      },
      // 获取列表之前调取的接口
      getProjectDataFront() {
        util.ajax({
              url:'/project/default/create',
              type:'GET',
              data:{
                team_id:this.team_id,
              },
              timeout:10000,
              success:(obj) => {
                  console.log('创建项目', obj)
                  if(obj && obj.errno == 0){
                    console.log('创建项目成功===')
                    this.getProjectListData(1)
                  }else{
                    console.log('创建项目失败===')
                  }
              },
              error: (xhr, status) => {

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
      },
      // 获取项目列表
      getProjectListData (status){
        // console.log(status)
          util.ajax({
              url:'/project/list/get',
              type:'GET',
              data:{
                  team_id:this.team_id,
                  status:status,   //状态 1-进行中，2-停止, 0-所有(包括进行中和停止)
                  page_no:page,  //不传或空:取全量， 非空:从1开始(页码)
                  page_size:page_size,  //  不传或空:取全量， 非空:行数(大于0的整数)
                  view_type:this.view_type
              },
              timeout:10000,
              success:(obj) => {
                  console.log('项目列表')
                  console.log(obj)
                  if(obj && obj.errno == 0){
                      if(status == 0){
                          this.projectAllData = []
                          this.projectAllData = obj.data.list
                      }else if(status == 1){
                          this.projectConductData = []
                          this.projectConductData = obj.data.list
                      }else{
                          this.projectEndData = []
                          this.projectEndData = obj.data.list
                      }
                      
                  }else{
                      $(window).unbind('scroll');
                  }
                  ajax_getting = false;
                  this.loading = false;
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
      //去往项目详情
      gotoProjectDetails(item) {
        if(item.status == -1){
            this.seachInput = ''
            return false
        }else{
            if(item.identity != 999999){
                this.seachInput = ''
                util.setLocalStorage('projectStorageInfo',item)
                util.setLocalStorage('viewtype',this.view_type)
                this.$router.push('/project/'+item.project_id)
                // window.open(location.href+'/'+item.project_id)
            }else{
                this.$message({
                  showClose: true,
                  message: '普通成员无权限访问。',
                  type: 'warning'
                });
            }
        }
      },
/************搜索部分开始——————搜索--可根据名称、拼音进行搜索******************************/
      querySearch(queryString, cb) {
        // console.log(queryString)
        if(queryString){
            util.ajax({
                url:'/project/search',
                type:'GET',
                data:{
                    search_str:queryString,
                    status:0,
                    page_no:'',
                    page_size:'',
                    view_type:this.view_type,
                    team_id:this.team_id
                },
                timeout:10000,
                success:(obj) => {
                    if(obj && obj.errno == 0){
                        let strArr = []
                        obj.data.list.forEach((o) => {
                            let str = ''
                            str = { 
                              "name":o.name,
                              "value": o.name, 
                              "status": o.status == 3 ? '已结束' : '',
                              "team_id":o.team_id,
                              "project_id":o.project_id,
                              "identity":o.identity 
                            }
                            strArr.push(str)
                        })
                        this.restaurants = strArr
                        // console.log(JSON.stringify(strArr))
                        var results = queryString ? this.restaurants.filter(this.createFilter(queryString)) : this.restaurants;
                        if(results.length == 0){
                            results.push({'value':'无搜索结果','status':'-1'})
                        }
                        clearTimeout(this.timeout);
                        this.suggestions = cb;
                        this.timeout = setTimeout(() => {
                          // 调用 callback 返回建议列表的数据
                          cb(results);
                        }, 1000 * Math.random());
                        
                    }
                },
                error: (xhr, status) => {
                    
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
        }
      },
      createFilter(queryString) {
          return (restaurant) => {
            return (restaurant.value.toLowerCase() || restaurant.value.indexOf(queryString) > -1);
          };
      },
/**********************************搜索部分结束***********************************************/
      //置顶操作
      onIsTopClick (curr_team_id,curr_top_status,curr_project_id){
          let allData = []
          if(status == 0){
              allData = this.projectAllData
          }else if(status == 1){
              allData = this.projectConductData
          }else{
              allData = this.projectEndData
          }
          allData.forEach ( (item) => {
              if(item.project_id == curr_project_id){
                  let _action = curr_top_status == 1 ? 0 : 1; //1-置顶，0-取消置顶
                  util.ajax({
                      url:'/project/top/set',
                      type:'POST',
                      data:{
                          team_id: curr_team_id, 
                          project_id: curr_project_id,
                          action: _action  // 1-置顶，0-取消置顶
                      },
                      timeout:10000,
                      success:(obj) => {
                          // console.log(obj)
                          if(obj && obj.errno == 0){
                              if(curr_top_status == 1){
                                  item.top = 0
                              }else{
                                  item.top = 1
                              }
                          }
                      },
                      error: (xhr, status) => {
                          
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
              }
          })
      },
/**************************新建项目弹窗操作——————提交表单**********************************/
      // 新建弹窗
      addProjectClick(formName){
          this.loading_kq_detail = true
          util.ajax({
              url:'/user/info',
              type:'GET',
              data:{
                  team_id: 0,//默认为0
                  project_id : 0//默认为0
              },
              timeout:10000,
              success:(result) => {
                this.loading_kq_detail = false
                  // console.log(result)
                  if(result.errno == 0){
                      if(result.data.team_id != ''){
                          this.ruleForm.teamAscription = result.data.team_id//result.data.team_name
                          this.ruleForm.team_id = result.data.team_id
                      }
                  }
              },
              error: (xhr, status) => {
                  this.loading_kq_detail = false
                  // console.log(xhr)
              },
              noNetwork: () => {
                this.loading_kq_detail = false
                //网络超时
                this.$message({
                  showClose: true,
                  message: '网络连接失败，请检查网络',
                  type: 'warning'
                });
              }
          })
          this.dialogFormVisible = true
          if(this.ruleForm.name || this.ruleForm.endValue || this.ruleForm.select_team_id || this.ruleForm.type){
              this.ruleForm.name = ''
              this.ruleForm.endValue = ''
              this.ruleForm.select_team_id = ''
              this.ruleForm.type = ''
          }
      },
      // 获取当前选择的项目类型的type_id
      changeValue_type_id(value){
          select_type_id = value
      },
      inputFn(val){//合作企业 输入时调用
        this.showResult = false
        let isValid = /^1[345678]\d{9}$/.test(val)
        if(isValid){
          this.showResult = true
          this.searchEnd = false

          util.ajax({
              url:'/team/info/search',
              type:'GET',
              data:{
                  team_id: this.team_id,
                  mobile: val
              },
              timeout:10000,
              success:(result) => {
                  console.log('手机号查询企业')
                  console.log(result)
                  this.searchEnd = true
                  if(result.errno == 0){
                    this.ruleForm.compArr = [result.data]
                    // this.ruleForm.compArr = [
                    //   {
                    //     "team_id": "123",
                    //     "team_name": "测试公司",
                    //     "mobile": "15010078636",
                    //     "name": "liujiaqi"
                    //   }
                    // ]
                  }else if(result.errno == 12017){
                    this.ruleForm.compArr = []
                    this.noDataText = '您查找的企业不存在'
                  }
              },
              error: (xhr, status) => {
                this.searchEnd = true
                  // console.log(xhr)
              },
              noNetwork: () => {
                this.searchEnd = true
                //网络超时
                this.$message({
                  showClose: true,
                  message: '网络连接失败，请检查网络',
                  type: 'warning'
                });
              }
          })
        }else{
          this.ruleForm.compArr = []
          if(val.length>=11){
            this.showResult = true
            this.noDataText = '请输入正确的手机号'
          }
        }
      },
      changeFn(){
        this.$refs['ruleForm'].validateField('relate_team_id')
        console.log(this.ruleForm)
      },
      // 获取当前选择的项目归属team_id
      changeValue_team_id(value){
          // let reg = /^\+?[1-9][0-9]*$/;　　//正整数 
          // if(reg.test(value)){
          //     select_team_id = this.ruleForm.team_id
          //     return
          // }else{
          //     select_team_id = value
          //     this.ruleForm.team_id = ''
          //     return
          // }
          select_team_id = value
      },
      //确定
      submitForm(formName) {
        // console.log(this.ruleForm)
        this.$refs[formName].validate((valid) => {
          if (valid) {
              /*时间格式化*/
              let address_item = ''
              let _time = util.formatData(this.ruleForm.startValue,this.ruleForm.endValue) 
              this.ruleForm.addressArr.forEach( (item)=>{
                if(item.city_id == this.ruleForm.address){
                  address_item = item
                }
              })
              let _data = {
                  team_id: select_team_id,
                  project_name: this.ruleForm.name,
                  project_type: select_type_id,
                  start_date: _time.s,
                  end_date: _time.e,
                  city_id:address_item.city_id,
                  city_name:address_item.short_name,
                  relate_team_id: this.ruleForm.relate_team_id,
                  insurance_source: this.ruleForm.insuranceSource,
                  business_subject: this.ruleForm.businessSubject,
                  contract_type: this.ruleForm.contractType,
                  payment_subject: this.ruleForm.paySubject,
              }
              console.log('验证通过_data', _data)
              // return
              util.ajax({
                  url:'/project/create',
                  type:'POST',
                  data:_data,
                  timeout:10000,
                  success:(obj) => {
                      if(obj && obj.errno == 0){
                          this.$message({
                            showClose: true,
                            message: '创建成功',
                            type: 'success'
                          });
                          this.getProjectListData(status)
                          this.$refs[formName].resetFields();
                          // 重置合同类型和发薪主体
                          this.payDisabled = false
                          this.contractTypeShow = true
                          this.ruleForm.contractType = 1
                          this.dialogFormVisible = false
                      // }else if(obj.errno == 30101){
                      //   this.$message({
                      //     showClose: true,
                      //     message: obj.errmsg,
                      //     type: 'warning'
                      //   });
                      }else if(obj && obj.errno == 38000){
                        this.$alert(obj.errmsg, '提示', {
                          confirmButtonText: '确定',
                          type: 'warning',
                          callback: action => {
                            console.log('action===', action)
                          }
                        })
                      }else{
                        this.$message({
                          showClose: true,
                          message: obj.errmsg,
                          type: 'warning'
                        });
                      }
                  },
                  error: (xhr, status) => {
                      
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
          } else {
              // console.log('error submit!!');
              return false;
          }
        });
      },
      //取消
      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.payDisabled = false
        this.contractTypeShow = true
        this.ruleForm.contractType = 1
        this.dialogFormVisible = false
      },
      // 下拉加载更多
      loadingMore(curr_tab_index){
          this.loading = true
          if(curr_tab_index == 0){
              page = 1
              this.scrollMore(page,curr_tab_index)
          }else if(curr_tab_index == 1){
              page = 1
              this.scrollMore(page,curr_tab_index)
          }else{
              page = 1
              this.scrollMore(page,curr_tab_index)
          }
      },
      scrollMore(curr_page,curr_tab_index){
          let that = this
          $(window).scroll(function() {
              clearTimeout(timer)
              timer = setTimeout(function() {
                  // var scrollTop = $(document.body).scrollTop();　
                  var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
                  var scrollHeight = $('body').height();　
                  var windowHeight = innerHeight;
                  var scrollWhole = Math.max(scrollHeight - scrollTop - windowHeight);
                  if (scrollWhole < 100) {
                      if (ajax_getting) {
                        return false;
                      } else {
                        ajax_getting = true;
                      }
                      page ++
                      if(curr_tab_index == 0){
                          status = 0
                          if(that.projectAllData.length != 0){
                              that.postAjaxMore(page,status,curr_tab_index)
                          }
                      }else if(curr_tab_index == 1){
                          status = 1
                          if(that.projectConductData.length != 0){
                              that.postAjaxMore(page,status,curr_tab_index)
                          }
                      }else{
                          status = 2
                          if(that.projectEndData.length != 0){
                              that.postAjaxMore(page,status,curr_tab_index)
                          }
                      }
                  }

              },200)
          })
      },
      postAjaxMore(_cur_page,_cur_status,_cur_tab_index){
          util.ajax({
              url:'/project/list/get',
              type:'GET',
              data:{
                  team_id:this.team_id,
                  status:_cur_status,   //状态 1-进行中，2-停止, 0-所有(包括进行中和停止)
                  page_no:_cur_page,  //不传或空:取全量， 非空:从1开始(页码)
                  page_size:page_size,  //  不传或空:取全量， 非空:行数(大于0的整数)
                  view_type:this.view_type
              },
              timeout:10000,
              success:(obj) => {
                this.loading = false
                  // console.log(obj)
                  if(obj && obj.errno == 0){
                      if(obj.data.list.length == 0){
                            page = 1
                            return false
                      }
                      if(_cur_tab_index == 0){
                          obj.data.list.forEach( (item) => {
                              this.projectAllData.push(item)
                          })
                      }else if(_cur_tab_index == 1){
                          obj.data.list.forEach( (item) => {
                              if(item.expire != 1){
                                this.projectConductData.push(item)
                              }
                          })
                      }else{
                          obj.data.list.forEach( (item) => {
                              if(item.expire == 1){
                                  this.projectEndData.push(item)
                              }
                          })
                      }
                  }else{
                      $(window).unbind('scroll');
                  }
                  ajax_getting = false;
              },
              error: (xhr, status) => {
                  this.loading = false
              },
              noNetwork: () => {
                this.loading = false
                //网络超时
                this.$message({
                  showClose: true,
                  message: '网络连接失败，请检查网络',
                  type: 'warning'
                });
              }
          })
      }
    },
    created(){

        this.getpermission();

    },   
    // adsadsadsad
    beforeRouteEnter (to, from, next) {
      document.title = '用工管理'
      // 在渲染该组件的对应路由被 confirm 前调用
      // 不！能！获取组件实例 `this`
      // 因为当钩子执行前，组件实例还没被创建
      let scrollTop = util.getLocalStorage('app_scroll_top')
      // console.log('取')
      // console.log(scrollTop)
      if(scrollTop){
        setTimeout(() => {
          $(window).scrollTop(scrollTop)
          util.setLocalStorage('app_scroll_top', null)
        },0)
      }
      
      next()
      // next(vm => vm.getProjectListData(vm.statusNum))
    },
    beforeRouteLeave(to, from, next){
      let scrollTop = $(window).scrollTop()
      util.setLocalStorage('app_scroll_top', scrollTop)
      // console.log('存')
      // console.log(scrollTop)
      next()
      // this.$store.commit('SAVE_POSITION', position) //离开路由时把位置存起来
    }
  }
</script>

<style  src='../assets/css/project.css'></style>
<style>
  .dbl_type.hide{
    display: none;
  }
  .dbl_type .el-select-dropdown__list{
    padding:0;
  }
  .dbl_type .el-select-dropdown__item.hover,
  .dbl_type .el-select-dropdown__item.selected{
    background-color: #fff;
  }
  .dbl_type .el-select-dropdown__item{
    height: 62px;
    padding:12px;
    width:300px;
  }
  .dbl_type .el-select-dropdown__item .p1{
    font-size: 14px;
    color: #1F2D3D;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dbl_type .el-select-dropdown__item .p2{
    font-size: 13px;
    color: #99A9BF;
    line-height: 18px;
  }
  .dbl_type .el-select-dropdown__empty{
    padding: 24px 0;
  }
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    /* 保险领取 */
#project .popupInsurance .el-dialog{
    background: none;
    box-shadow: none;
    top: 30% !important;
}
#project .popupInsurance .el-dialog__body{
    border-bottom:none;
}
#project .popupInsurance .el-dialog__headerbtn{display: none;}
#project .popupInsurance .el-dialog__header,#project .popupInsurance .el-dialog__body{
    padding:0 0 0 0 ;
}

/* 领取保险成功 */
#project .popupInsurance .receive_success{
    width: 280px;
    height: 280px;
    margin: 0 auto;
    background: url(../assets/imgs/insurance/insurance_success.svg) no-repeat;
    position: relative;
}
#project .popupInsurance .receive_success .success_txt{
    width: 280px;
    height: 110px;
    position: absolute;
    left: 0px;
    bottom: 0px;
}
#project .popupInsurance .receive_success .success_txt p{
    font-size: 14px;
    color: #5E6D82;
    letter-spacing: 0;
    text-align: center;
}
#project .popupInsurance .receive_success .success_txt a.lookbtn{
    display: block;
    width: 140px;
    height: 32px;
    line-height: 32px;
    border-radius: 48px;
    margin: 0 auto;
    text-align: center;
    margin-top: 32px;
    font-size: 12px;
    color: #FFFFFF;
    letter-spacing: 0.4px;
    background:  url(../assets/imgs/insurance/button.svg) no-repeat;
}
#project .popupInsurance .receive_success .close-btn{
    width: 32px;
    height: 32px;
    background: url(../assets/imgs/insurance/insurance_close.svg) no-repeat;
    position: absolute;
    right: 0px;
    top: 32px;
    cursor: pointer;
}

/* 未领取保险 */
#project .popupInsurance .insurance_page{
    width: 400px;
    height: 350px;
    margin: 0 auto;
    background: url(../assets/imgs/insurance/insurance_page3.svg) no-repeat;
    position: relative;
}

#project .popupInsurance .insurance_page .close-btn{
    width: 32px;
    height: 32px;
    background: url(../assets/imgs/insurance/insurance_close.svg) no-repeat;
    position: absolute;
    right: 58px;
    top: -37px;
    cursor: pointer;
}
#project .popupInsurance .insurance_page .insurance-num{
    width: 170px;
    height: 35px;
    line-height: 35px;
    position: absolute;
    left: 50%;
    top: 127px;
    margin-left: -83px;
    text-align: center;
    font-size: 24px;
    color: #FFFFFF;
    letter-spacing: 0;
    text-shadow: 0 1px 2px rgba(226,122,41,0.50);
    font-weight: bold;
}
#project .popupInsurance .insurance_page .checkeddiv{
    position: absolute;
    bottom: 105px;
    left: 50%;
    margin-left: -85px;
}
#project .popupInsurance .insurance_page .checkeddiv .el-checkbox__inner{
    width: 14px;
    height: 14px;
}
#project .popupInsurance .insurance_page .checkeddiv .el-checkbox__inner::after{
    height: 6px;
    left: 3px;
}
#project .popupInsurance .insurance_page .checkeddiv .el-checkbox__label{
    font-size: 12px;
    color: #5E6D82;
    letter-spacing: 0;
    line-height: 20px;
}
.insurance_page p{
    position: absolute;
    left: 50%;
    top: 72px;
    margin-left: -28px;
    font-size: 14px;
    color: #5E6D82;
    letter-spacing: 0;
    line-height: 16px;
}
#project .popupInsurance .insurance_page .checkeddiv a.notice{
    font-size: 12px;
    color: #6699EE;
    letter-spacing: 0;
    line-height: 20px;
    cursor: pointer;
}
#project .popupInsurance .insurance_page .ins-btn{
    position: absolute;
    bottom: 10px;
    left: 50%;
    margin-left: -34px;
    width: 68px;
    height: 68px;
    border-radius: 68px;
    background: #ffffff;
}
#project .popupInsurance .insurance_page .ins-btn a{
    display: block;
    width: 60px;
    height:60px;
    text-align: center;
    border: 1px solid #FCAD4A;
    border-radius: 60px;
    margin-top: 3px;
    margin-left: 3px;
}
#project .popupInsurance .insurance_page .ins-btn a span{
    color: #f79e4d;
    font-size: 16px;
    font-weight: bold;
    line-height: 20px;
    margin-top: 9px;
    display: block;
}





</style>
<style scoped>
  .wapper{width:1174px; margin:0 auto;background-color: #ffffff;padding: 0 13px;}
  @media screen and (max-width: 1200px) {
      .wapper{
        width: 974px;
      }
      .tab-content .cont-list dl, .add-project{
        margin-left: 83px;
      }
  }
  /* 头部tab+搜索部分*/
  
  .tab-div{text-align: center;}
  .top-container{
    position: relative;
    padding-top: 19px;
  }
  .tab-seach{
    position: absolute;
    right: 0px;
    top: 39px;
  }
  .inline-input{
    width: 348px;
    height: 36px;
    line-height: 36px;
    position: relative;
  }
  .el-icon-search{
    position: absolute;
    right: 16px;
    top: 9px;
    font-size: 18px;
    z-index: 3;
    color: #c0ccda;
    font-weight: normal;
  }
  /*.el-button:hover{background-color: #8bb1f2;}*/
  /* tab内容部分--项目列表 */
  .tab-content{
    padding: 17px 0 32px 0;
    overflow: hidden;
  }
  .tab-content .cont-list dl, .add-project{
      float: left;
      width: 250px;
      height: 117px;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 2px 8px 0 rgba(203, 211, 221, 0.2);
      -webkit-box-shadow: 0 2px 8px 0 rgba(203, 211, 221, 0.2);
      border: solid 1px rgba(224, 230, 237, 0.8);
      padding: 24px 10px 0 16px;
      margin: 0 7.5px;
      margin-bottom: 30px;
      position: relative;
      z-index: 2;
      overflow: hidden;
      cursor: pointer;
  }
  @media screen and (max-width: 1200px) {
      .tab-content .cont-list dl, .add-project{
          width: 279px;
          height: 116px;
          padding: 24px 10px 0 12px;
          margin: 0 10.5px;
          margin-bottom: 30px;
      }
  }
  .tab-content .cont-list dl dt{
      width: 48px;
      height: 48px;
      border-radius: 48px; 
      float: left;
      margin-right: 14px;
  }
  .tab-content .cont-list dl dt img{width: 48px;height: 48px;border-radius: 48px;}
  .tab-content .cont-list dl dt .item_icon{
    width: 48px;
    height: 48px;
    /*background-image: url(../assets/Avatar.svg);*/
    background-size: contain;
  }
  .tab-content .cont-list dl dd{
    float: left;
    text-align: left;
    width: 180px;
  }
  @media screen and (max-width: 1200px) {
      .tab-content .cont-list dl dd{width: 212px}
  }
  .tab-content .cont-list dl dd h3{
    /*width: 157px;*/
    height: 22px;
    font-size: 16px;
    color: #1f2d3d;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .tab-content .cont-list dl dd h3 span{
    float: left;
    width: 26px;
    height: 16px;
    background: #A9ADB7;
    border-radius: 2px;
    font-family: 'SFUIText-Regular';
    font-size: 11px;
    color: #FFFFFF;
    line-height: 16px;
    text-align: center;
    margin-right: 8px;
  }
  .tab-content .cont-list dl dd h4{
      /*width: 176px;*/
      height: 20px;
      font-size: 14px;
      color: #8492a6;
      margin: 8px 0 25px 0;
  }
  .tab-content .cont-list dl dd h5{
      height: 17px;
      font-size: 12px;
      color: #99a9bf;
  }
  .tab-content .cont-list dl dd h5 .el-icon-star-off, .el-icon-star-on{
    font-size: 17px;
    margin-left: 7px;
    color: #C0CCDA;
  }
  .tab-content .cont-list dl dd h5 .el-icon-star-on {color: #ff9900;}
  .tab-content .cont-list dl dd .end-tip{
    display: inline-block;
    width: 73.5px;
    height: 26.4px;
    transform: rotate(45deg);
    -webkit-transform:rotate(45deg);
    opacity: 0.5;
    background-color: #e0e6ed;
    text-align: center;
    line-height: 24.4px;
    position: absolute;
    left: -22px;
    bottom: 4px;
    z-index: 1;
    font-size: 12px;
    color: #99a9bf;
    color: #99a9bf !important;

  }
  @media screen and (max-width: 1200px) {
      /*.tab-content .cont-list dl dd h3{
        width: 208px;
      }*/
      /*.tab-content .cont-list dl dd h5{width: 212px;}*/
      .tab-content .cont-list dl dd h5 .el-icon-star-off, .el-icon-star-on{font-size: 17px;margin-left: 45px;}
  }
  .tab-content .cont-list dl:hover, .add-project:hover{
    -webkit-box-shadow:0 2px 8px 0 rgba(203, 211, 221, 0.6);;
    box-shadow: 0 2px 8px 0 rgba(203, 211, 221, 0.6);
  }
  
  .add-project{border: dashed 1px #e0e6ed;}
  .add-project span{
      display: block;
      width: 50px;
      height: 50px;
      opacity: 0.4;
      border-radius: 50px;
      background-color: #e0e6ed;
      margin: 0 auto;
      margin-top: 20px;
      text-align: center;
  }
  .el-icon-plus{
    font-size: 24px;
    color: #99a9bf;
    line-height: 50px;
    opacity: 0.8;
  }
  .empty-page{
    text-align: center;
    height: 500px;
    overflow: hidden;
  }
  .empty-page dl{
      width: 180px;
      height: 180px;
      margin: 0 auto;
      margin-top: 150px;
  }
  .empty-page dl dt{
      width: 140px;
      height: 100px;
      margin: 0 auto;
      margin-bottom:32px;
  }
  .empty-page dl dt img{
      display: block;
      width: 140px;
      height: 100px;
      margin: 0 auto;
  }
  .empty-page dl dd{
      font-size: 14px;
      color: #c0ccda;
  }

  .projcet .loading{
    width:100%;
    height:50px;
    /*background: pink;*/
    float: left;
  }
  .heightEmpty{
    height: 500px;
  }
  .item_switch{
    position: relative;
    cursor: pointer;
    margin-bottom: 10px;
    display:inline-block;
  }

  .item_switch h2{
    font-size: 18px;
    color: #1f2d3d;
    cursor: pointer;
  }
  .item_switch h2 i{
    display: inline-block;
    width: 15px;
    height: 10px;
    background: url(../assets/imgs/switch_icon.svg) no-repeat;
    background-size: 100% 100%;
    margin-left: 5px;
    transform: rotate(0deg);
  }
  .item_switch h2 .hoverIcon{
    display: inline-block;
    width: 15px;
    height: 10px;
    background: url(../assets/imgs/switch_hover_icon.svg) no-repeat;
    background-size: 100% 100%;
    margin-left: 5px;
    transform:rotate(180deg);
    margin-bottom: 2px;

  }
  .top-container .item_switch:hover>h2 i{
    transition: all .3s;
  }
  .item_switch .hoverh2{
    color: #6699ee;
  }
  .item_switch .item_list{
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    opacity: 1;
    transition: all .2s;
  }
  .item_switch:hover>.item_list{
    opacity: 1;
  }
  .item_switch ul{
    width: 125px;
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.04), 0 2px 4px 0 rgba(0, 0, 0, 0.12);
    border: solid 1px #e4e9ef;
    list-style: none;
    padding: 6px 0;
    margin-top: 23px;
  }
  .item_switch ul li{
    height: 36px;
    line-height: 36px;
    font-size: 14px;
    color: #475568;
    padding-left: 9px;
  }
  .item_switch ul li:hover{
    background-color: #f5f5f5
  }
  .projectloading.el-loading-mask{
    background-color: rgba(255,255,255,.3);
    position: fixed;
  }
  .formTips {
    line-height: 18px;
    margin-bottom: 10px;
  }
</style>
