<template>
	<div id="createeditpayroll" >
		<div class="kq-wapper">
			<h2><article @click="goPayrollList">工资核算</article> <i class="icon-arrow-right"></i>  <span>{{titlespan}}</span></h2>
			<h1 class="payrolltitle" @click="modifyPayrollFn" ><i class="editico_svg" v-if="!ifConfirmPayroll && !locatData.pay_type == 1"></i>{{locatData.order_name}}</h1>
			<h1 class="payrolltitle" v-if="locatData.pay_type == 1 && locatData.date">{{locatData.address_name+'&nbsp;&nbsp;'+locatData.date}}奖金</h1>
			<h1 class="payrolltitle" v-else>{{locatData.address_name}}</h1>
			<div class="kq-header">
				<div class="kq-export" v-if="!ifConfirmPayroll">
						<h3><span @click="improtWages" v-if="!locatData.pay_type == 1"><i class="import-icon"></i>&nbsp;导入工资单</span><span @click="addPersonnel"><i class="personnel-icon-plus"></i>&nbsp;添加人员</span></h3>
				</div>
				<div class="kq-tab">
					<div class="payroll-delEidt editall-btn"  v-if="!ifConfirmPayroll || locatData.pay_type == 1">
						<span class="operationInfo">批量操作：</span>
						<el-button type="primary"  class="yf-defalut " v-bind:class="editsetlist.length === 0 ? 'disablebtnedit' : 'yf-editblue' "  @click="eidtsetpayroll" v-if="!locatData.pay_type == 1">编 辑</el-button>
						<el-button class="yf-defalut " v-bind:class="editsetlist.length === 0 ? 'disablebtndel' : 'yf-clr' "  @click="delsetlist">删 除</el-button>
					</div>
					<div class="kq-count-day" v-loading="loading">
						<div class="kq-table-day yf-payrolllist">
							<div class="table_main">
								<div class="table1" :style="{left:-tableLeft + 'px'}">
									<table class="payroll_table " cellpadding="0" cellspacing="0" :style="{width:910 + 100 * payrollTheadListList.length + 'px'}">
										<colgroup>
											<col width="150px">
											<col width="120px">
											<col width="90px">
											<col width="100px">
											<col width="100px" v-for="(item,index) in payrollTheadListList" :key="index" >
											<col width="110px">
                      <col width="110px">
											<col width="160px">
											<col min-width="200px">
										</colgroup>
											<thead class="payroll_table_head">
												<tr>
													<th class="head_user_name">
														<span class="el-checkbox__input" :class="[sel_all ? 'is-checked' : '']" @click="selectAll()"><span class="el-checkbox__inner"></span></span>
														<p>供应商姓名</p>
													</th>
													<th class="head_mobile">
														<p>供应商手机</p>
													</th>
													<th class="head_cq"><p>计算人数</p></th>
													<th class="head_base_wage">
														<p>供应商费用(元)</p>
													</th>
													<th v-for="(item,index) in payrollTheadListList" :key="index" class="head_morepay"><p>{{item.name}}(元)</p></th>
													<th class="head_total_wage"><p>合计(元)</p></th>
                          <th class="head_total_wage"><p>合同状态</p></th>
													<th class="head_evaluation"><p>评价</p></th>
													<th class="head_remark"><p>备注</p></th>
												</tr>
											</thead>
									</table>
								</div>
								<div class="table2" :style="{height:tableHeight}" @scroll="tableScroll()" v-show="memberDataList.length > 0">
									<table class="payroll_table " cellpadding="0" cellspacing="0" :style="{width:910+ 100 *payrollTheadListList.length + 'px' }">
										<colgroup>
											<col width="150px">
											<col width="120px">
											<col width="90px">
											<col width="100px">
											<col width="100px" v-for="(item,index) in payrollTheadListList" :key="index" >
											<col width="110px">
                      <col width="110px">
											<col width="160px">
											<col min-width="200px">
										</colgroup>
											<tbody class="payroll_table_body">
												<tr v-for="(item ,index) in memberDataList">
													<td class="body_user_name">
														<span class="el-checkbox__input" :class="[item.select_check ? 'is-checked' : '']" @click="selectThis(item)"><span class="el-checkbox__inner"></span></span><p>{{item.user_name}}</p></td>
													<td class="body_mobile"><p>{{item.mobile}}</p></td>
													<td class="body_cq"><p>{{payrollData.base_wage_unit == 0 ? item.normal_days : item.total_time}}</p></td>
													<td class="body_base_wage" v-if="locatData.pay_type == 1">
														<p  v-if="ifConfirmPayroll">{{item.base_wage}}</p>
													</td>
													<td class="body_base_wage" v-else>
														<input v-if="!ifConfirmPayroll" v-model="item.base_wage" class="el-input__inner" autocomplete="off" type="text" rows="2" validateevent="true" @blur="moneyInput(item,'base_wage','基本工资')" @input="calculateWage" :controls="false">
														<p  v-if="ifConfirmPayroll">{{item.base_wage}}</p>
													</td>
													<td v-for="(pay_item,pay_index) in payrollTheadListList" :key="pay_index" class="body_morepay">
														<input v-model="item[pay_item.field]" class="el-input__inner" autocomplete="off" type="text" rows="2" validateevent="true" :disabled="ifConfirmPayroll"  @blur="moneyInput(item,pay_item.field,pay_item.name)" @input="calculateWage" :controls="false">
													</td>
													<td class="body_total_wage"><p>{{item.total_wage}}</p></td>
                          <td class="body_total_wage"><p>
                            <el-tag
                              type="gray"
                              v-if="item.protocol_status == 0"
                            >签订中</el-tag>
                            <el-tag
                              type="success"
                              v-if="item.protocol_status == 1"
                            >已签订</el-tag>
                            <el-tag
                              type="danger"
                              v-if="item.protocol_status == -1"
                            >未签订</el-tag>
                            <el-tag
                              type="danger"
                              v-if="item.protocol_status == 4"
                            >已过期</el-tag>
                            <el-tag
                              type="info"
                              v-if="item.protocol_status == 5"
                            >未下发</el-tag>
                          </p></td>
													<td class="body_evaluation">
														<div  class="evaluation-div">
																<i v-bind:class="['el-rate__icon' ,ev_index < item.comment_star ? 'el-icon-star-on' : 'el-icon-star-off' ]" v-for="(ev_item,ev_index) in foreachStar" @click="evaluationStar(ev_index,item)" :key="ev_index"></i>
														</div>
													</td>
													<td class="body_remark">
														<input v-model="item.remark" class="el-input__inner remark_input" autocomplete="off" type="text" rows="2" validateevent="true"  placeholder="请输入">
													</td>
												</tr>
											</tbody>
									</table>
								</div>
								<div class="no-datas" v-show="memberDataList.length <= 0">
										<p :style="{lineHeight:ondatas_Height,height:ondatas_Height}">暂无数据</p>
								</div>
							</div>
							<span v-if="locatData.pay_type == 2" style="padding:10px;color:#8492a6;font-size:12px;display:inline-block;">注：超7000的费用结算将在CRM采用公对公或线下支付的形式支付</span>
						</div>
					</div>
				</div>
			</div>
			<!-- 批量编辑弹窗 -->
			<div class="export-dialog editall" v-if="!ifConfirmPayroll">
					<el-dialog
						:title="'批量编辑 ('+ this.editsetlist.length + ')' "
						:visible.sync="showallpayrolledit"
						@close="resetForm('syn_price')"
						size="tiny">
						<el-form :model="syn_price" label-width="80px" :rules="rules"  ref="syn_price">
							<el-form-item label="基本工资" prop="base_wage">
								<el-input v-model="syn_price.base_wage"   auto-complete="off" placeholder="请输入"></el-input>
							</el-form-item>
							<el-form-item :prop="item.field" v-for="(item,index) in payrollTheadListList" :label="item.name" :key="index" >
								<el-input v-model="syn_price[item.field]"   auto-complete="off" placeholder="请输入"></el-input>
							</el-form-item>
							<el-form-item label="备注" prop="remark">
								<el-input v-model="syn_price.remark" auto-complete="off" type="textarea" placeholder="请输入备注"></el-input>
							</el-form-item>
						</el-form>
						<div slot="footer" class="dialog-footer">
								<el-button class="cancel" @click="resetForm('syn_price')">取 消</el-button>
								<el-button type="primary" class="confirm" @click="editPayrollconfirm('syn_price')">确 定</el-button>
						</div>
					</el-dialog>
			</div>
			<!-- 评分弹出 -->
			<div class="export-dialog alertevaluation" v-if="editstar.comment_star">
					<el-dialog
						title="评价"
						:visible.sync="showevaluation"
						:before-close="starresetForm"
						size="tiny">
						<el-form label-width="70px" v-loading="evaluationLoading">
							<el-form-item label="星级评价" prop="">
								<el-col :span="24" class="starparent">
										<i v-bind:class="['el-rate__icon', itemindex < editstar.comment_star ? 'el-icon-star-on' : 'el-icon-star-off' ]" v-for="(item,itemindex) in foreachStar" @click="alertevaluationStar(itemindex)"></i>
								</el-col>
								<span class="evaluation-info">{{star_data[editstar.comment_star - 1].prompt}}</span>
							</el-form-item>
							<el-form-item label="评价标签" prop="">
									<el-col :span="24">
										<ul class="evaluation-tag">
											<li v-for="item in star_data[editstar.comment_star - 1].tag" @click="addevaluation_tag(item,$event)" :class="evaluation_tag.indexOf(item) !== -1 ? 'selecttag' : '' ">{{item}}</li>
										</ul>
									</el-col>
							</el-form-item>
							<el-form-item label="备注" prop="evaluate" class="evaluateText">
								<el-input v-model="evaluate" auto-complete="off" type="textarea" :maxlength="500" placeholder="请输入备注"></el-input>
								<p class="textarealength">{{evaluate.length}}/500</p>
							</el-form-item>
						</el-form>
						<div slot="footer" class="dialog-footer">
								<el-button class="cancel" @click="starresetForm">取 消</el-button>
								<el-button type="primary" class="confirm" @click="submitEvaluation">确 定</el-button>
						</div>
					</el-dialog>
			</div>
			<!-- 删除 -->
			<div class="export-dialog deleteAlert" v-if="!ifConfirmPayroll || locatData.pay_type == 1">
				<el-dialog
					title="提示"
					:visible.sync="showsetdel"
					size="tiny">
					<span>是否删除所选择的人员？</span>
					<span slot="footer" class="dialog-footer">
						<el-button @click="showsetdel = false" class="cancel">取 消</el-button>
						<el-button type="primary" class="confirm"  @click="confirmdel">确 定</el-button>
					</span>
				</el-dialog>
			</div>
			<!-- 修改工资单 -->
			<div class="export-dialog modifyPayrollalert" v-if="!ifConfirmPayroll">
					<el-dialog
						title="修改工资单"
						:visible.sync="showModifyPayroll"
						@close="modifyresetForm('modifyPayrollform')"
						size="tiny">
						<el-form :model="modifyPayrollform" label-width="97px" :rules="rules" ref="modifyPayrollform">
							<el-form-item label="工资单名称" prop="order_name">
								<el-input v-model="modifyPayrollform.order_name" auto-complete="off" placeholder="例如：引导组工资单" style="width:295px" ></el-input>
							</el-form-item>
							<el-form-item label="核算周期" prop="kqDateDay">
									<el-date-picker
										v-model="modifyPayrollform.kqDateDay"
										type="daterange"
										:editable="false"
										style="width:295px"
										:picker-options="endtime"
										placeholder="选择日期范围">
									</el-date-picker>
							</el-form-item>
							<el-form-item label="审批人" class="lastmodifyPayroll" prop="approve_uid">
								<el-select v-model="modifyPayrollform.approve_uid" placeholder="请选择" style="width:295px" >
									<el-option v-for="item in modifyPayrollform.regionlist"  :label="item.user_id == 0 ? item.real_name : item.real_name + '(' + item.identity_str + ')' "  :key="item.user_id"  :value="item.user_id" :class="item.user_id == modifyPayrollform.approve_uid ? 'selected' : '' "></el-option>
								</el-select>
							</el-form-item>
						<el-form-item class="lastmodifyPayroll">
							<el-checkbox-group v-model="modifyPayrollform.add_user_flag" >
								<el-checkbox label="重新添加核算周期内的出勤人员" name="type" class="add_user_flag"></el-checkbox>
								<p class="modifyInfo">注：已有数据会被覆盖</p>
							</el-checkbox-group>
						</el-form-item>
						</el-form>
						<div slot="footer" class="dialog-footer">
								<el-button class="cancel" @click="modifyresetForm('modifyPayrollform')">取 消</el-button>
								<el-button type="primary" class="confirm" @click="modifyPayrollconfirm('modifyPayrollform')">确 定</el-button>
						</div>
					</el-dialog>
			</div>
			<!-- 弹窗————批量导入 -->
			<div class="dialog-import" v-if="!ifConfirmPayroll">
					<el-dialog
						title="批量导入"
						:visible.sync="dialogImport"
						@close="cancelImport"
						top="30%"
						size="tiny">
						<div class="title">
								<span>按照标准模板导入人员</span>
								<a href="javascript:;" @click="importExel">下载模板</a>
						</div>
						<div class="myform" v-loading="importLoading">
								<h4>上传要导入的excel，导入后会覆盖已有工资单内容：</h4>
								<div class="upload-box">
										<form action="" id="upfile" enctype="multipart/form-data">
												<a href="javascript:;" class="file el-button confirm" :class="{disabled_file:file_text}" @click="uploadExcel">点击上传</a>
												<input type="file" name="" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" id="uploadInp" @change="fileOnChange"  style="width: 0;height: 0">
										</form>
										<p class="file_text" v-if="file_text"><i class="file_icon"></i>{{file_text}}<i class="file_close" @click="fileClose"></i></p>
										<div style="width:340px;" v-if="file_speed">
												<div class="speed-div">
														<span :style="'width:'+speed+'%'"></span>
												</div>
										</div>

								</div>
						</div>
						<span slot="footer" class="dialog-footer">
							<el-button @click="cancelImport" class="cancel">取 消</el-button>
							<el-button type="primary" @click="submitImport" class="confirm">导 入</el-button>
						</span>
					</el-dialog>
			</div>
		</div>
		<!-- 选择小组弹窗 -->
		<div class="select_group" v-if="!ifConfirmPayroll">
			<el-dialog title="添加人员" :visible.sync="showAddPersonnel" :close-on-press-escape="false" >
				<div class="select_group_main" v-loading="addPerLoading">
					<div class="all_groups_box">
						<p class="title">选择小组或成员</p>
						<div class="all_search">
							<i class="el-icon-search"></i>
							<el-input
								:icon='filterText?"circle-cross":""'
								empty-text="暂无数据"
								:on-icon-click="clearFilterText"
								placeholder="搜索小组或成员"
								v-model="filterText">
							</el-input>
						</div>
						<div class="all_main">
							<el-tree
								:expand-on-click-node="false"
								:data="all_groups"
								:props="defaultProps"
								@node-click="handleNodeClick"
								:filter-node-method="filterNode"
								id="selectgroup"
								ref="all_groups"
								:render-content="renderContent"
								>
							</el-tree>
						</div>
					</div>
					<div class="selected_groups_box">
						<p class="title">已选择的小组或成员</p>
						<div class="sel_main">
							<template v-for="(item, index) in origin_selected_groups">
								<div class="sel_item" @click="unSelectGroup(index)">
									<p :title="item.name"><em :class=" 'saas-icon-'+item.selType "></em>{{item.name}}</p>
									<i class="el-icon-close"></i>
								</div>
							</template>
						</div>
					</div>
					<i class="arrow"></i>
				</div>
				<div class="select_group_foot">
					<div class="btns">
						<el-button @click="showAddPersonnel = false" class="cancel">取消</el-button>
						<el-button style="background-color:#6699ee;color:#fff;" @click="confirmGroupSelecter" class="confirm personnelconfirm">确定</el-button>
					</div>
				</div>
			</el-dialog>
		</div>
		<div class="fixedbar" >
			<div class="payroll-scope" style="position:relative;">

				<div class="acombined">
					<p class="falst-acombined">合计：<span class="first-acombinedspan">¥{{alla_combined.toFixed(2)}}</span>共计：<span>{{selectTotalPerson}}人</span></p>
					<!-- <p class="secend-acombined">
						<span class="secend-acombinedspan" >基本工资：¥{{all_base_wage.toFixed(2)}}</span>
						<span class="secend-acombinedspan" v-if="locatData.pay_type == 1">奖金：¥{{all_base_wage.toFixed(2)}}</span>
						<span v-for="(item,index) in payrollTheadListList" class="secend-acombinedspan" :key="index">{{item.name}}：¥{{allCombined[item.field].toFixed(2)}}</span>
					</p> -->
				</div>
				<!-- <div class="save payroll-scoperight" >
					<p @click="TheDraft(0)">保存为草稿</p>
				</div> -->
				<div class="submit payroll-scoperight">

					<!-- <template v-if="this.approve_uid == 0 && locatData.pay_type != 1">
						<p v-if="this.pay_flag == 1" @click="submitaudit(2)">完 成</p>
						<p v-if="this.audit_flag == 1 && this.pay_flag != 1"  @click="submitaudit(1)">完 成</p>
					</template> -->
					<p @click="submitaudit(2)">提交审核</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
		import * as util from '../assets/js/util.js'
		//import myTree from '../components/tree.vue'

		let $ = require("jquery")

		let date = new Date()
		let today = util.getStampFromDateStr(date)
		var date2 = new Date(date)
		date2.setDate(date.getDate()-6)
		let end_timees = util.getStampFromDateStr(date2)
		let start_date = ''
		let end_date = ''
		let downloadUrl = ''
		let ajax_getting = false
		let finished = false
				var moneychange = (rule,value,callback) => {
						value = value.toString();
						if(isNaN(value)){
								return callback(new Error('请输入正确的金额'));
						}else if(value < 0 || value > 1000000){
								callback(new Error('基本工资应在0到100万'));
						}else if(value.toString().indexOf('.') != -1 && value.toString().split(".")[1].length > 2){
								callback(new Error('请保留两位小数'));
						}else{
								callback();
						}
				};
		export default{
			name: 'createeditpayroll',
			// components: {
			//   myTree
			// },
			data:function(){
				var testStartTime = (rule,value,callback) => {
						var sumDays = ''
						if(!value) {
								return callback(new Error('请选择日期'));
						}else{
								sumDays = util.DateDiff(util.formatData1(value[0]),util.formatData1(value[1]))
								if(sumDays > 30){
										return callback(new Error('时间跨度不能超过30天'));
								}else{
										callback();
								}
						}
				};
				return{
						sel_all:true,
						tableLeft:0,
						ondatas_Height:false,
						loading:true,
						addPerLoading:false,
						evaluationLoading:false,
						fixedbarwidth:0,
						showevaluation:false,
						filterText:'',
						initstar:0,
						btnDisable:false,
						payrollData:{},
						payrollform:{
							remark:'',
							star:0,
							name:'',
						},
						syn_price:{
							base_wage:'',
							remark:'',},
						payrollTheadListList:[],
						modifyPayrollform:{
							name:'',
							regionlist:[],
							approve_uid:'',
							kqDateDay: [today,today], //初始化时间(按日)--默认选择当前日期
							add_user_flag:false
						},
						endtime:{
							disabledDate(time) {
								return time.getTime() >= Date.now();
							}
						},
						PersonnelList:[],//人员列表
						evaluation_tag:[],//评价标签
						foreachStar:[1,2,3,4,5],
						evaluate:'',
						showallpayrolledit:false,
						showsetdel:false,
						showModifyPayroll:false,
						editsetlist:[],
						editstar:{},
						rules: {  //日期验证规则
								base_wage:[
										{ validator: moneychange, trigger: 'blur' }
								],
								kqDateDay: [
										{ validator: testStartTime, trigger: 'change',required: true, }
								],
								order_name:[
										{ required: true, message: '请输入工资单名称', trigger: 'blur' },
										{ min:1,max:15, message: '工资单名称应为1到15个字符', trigger: 'blur' }
								],
								remark:[

										{max:100, message: '备注不超过100个字符', trigger: 'blur' }
								],
								approve_uid:[
									{ required: true, message:'请选择审批人',trigger: 'change' }
								]
						},

						star_data:[],//评价内容
						min_id:0,
						page_size:50,
						titlespan:'',
						showaddPersonnelbtn:false,
						task_id:'',
						tab_index:0,
						team_id:'',
						project_id:'',
						group_id:0,
						alla_combined:0,
						all_base_wage:0,
						user_id:0,
						status_id:0,


						list: [],
						states: [],
						showAddPersonnel: false,//是否显示选择小组弹窗
						kq_detail: {//考勤详情弹窗数据9
							extra_info: {},
							attendance_list: []
						},
						kq_detail_index: 0,//弹窗展示是第几行
						cur_data: [],//当前表格数据
						filterText: '',//过滤小组关键字
						all_groups: [],//全部小组
						origin_selected_groups: [],//展示已选小组时所用小组数据
						selected_groups: [],//已选择的小组
						defaultProps: {
							children: 'children',
							label: 'name'
						},
						memberData:{},
						memberDataList:[],
						allCombined:{},
						//导入弹出
						dialogImport:false,
						ruleForm:{},
						speed:0,
						file_text:'',
						file_speed:false,
						importLoading:false,
						ifConfirmPayroll:false,
						pay_flag:0,
						approve_uid:0,
						audit_flag:0,
						jiangjin:0,
						infomsg:'',
						d:'',
						pushAjaxData:'',
						selectTotalPerson:'',//选中人员
				}
			},
			watch: {
				'$route' (to,from) {
						if(to.path.split('/').length>2){
								this.$router.push('PayrollAccounting')
						}else{
							this.init();
						}
				},
				filterText(val) {
					// console.log(this.$refs)
					this.$refs.all_groups.filter(val);
				}
			},
			computed: {
				isFolder: function() {
					return this.model.children && this.model.children.length
				}
			},
			filters:{
				currencyDisplay: {
					// model -> view
					// formats the value when updating the input element.
					read: function(val) {
						return '$'+val.toFixed(2)
					},
					// view -> model
					// formats the value when updating the data.
					write: function(val, oldVal) {
						var number = +val.replace(/[^\d.]/g, '')
						return isNaN(number) ? 0 : number
					}
				}
			},
			methods:{
				init (){
						this.loading = true;
						this.fixedbarwidth =(window.innerWidth - 200) + 'px'
						this.locatData = util.getLocalStorage('locatData');
						console.log(this.locatData)
						if(!this.locatData){
								this.$router.push('overviews');
								this.loading = false;
							return false;
						}
						this.team_id = this.locatData.team_id;
						this.project_id = this.locatData.project_id;
						this.order_id = document.URL.split('=')[1];
						this.approve_uid = this.locatData.approve_uid;
						this.ifConfirmPayroll = util.getLocalStorage('ifConfirmEmail') ? true : false;
						this.getUserPermission();
						this.titlespan = '新建工资单'
						if(this.locatData.confirm_id){
							this.getConfirmMemberList(this.locatData.confirm_id)
						}else{
							this.getMemberList()
						}
				},
				//
				tableScroll(){
					this.tableLeft = $('.table2').scrollLeft()
				},
				renderContent(h, { node, data, store }) {
					//console.log(JSON.stringify(data))

						if(data.children){
							return (<span class="treeLable">
									<i class="saas-icon-group"></i><span>{node.label}</span>
								</span>)
						}else{
							return (<span class="treeLable">
								<i class="saas-icon-peple"></i><span>{node.label}</span>
							</span>)
						}
				},
				//监听金额变化
				moneyInput(row,field,name){
					let value = parseFloat(row[field]),
							user_id = row.user_id;
					if(value != value){
						value = '';
						if(row[field] == '')return;
						this.alertinfo(name+'应在0-100万之间!')
					}else{
						if(value > 1000000 || value < 0){
							value = '';
							this.alertinfo(name+'应在0-100万之间!')
						}else{
								let paylist = this.payrollTheadListList,
										alla_combined = 0;
								for(let m = 0,th = paylist.length;m < th; m++ ){
									let thismoney = +row[paylist[m].field];
									if(paylist[m].flag == -1){
										alla_combined += -thismoney;
									}else{
										alla_combined += thismoney;
									}
								}
								alla_combined += +row.base_wage;
							if(value.toString().indexOf('.') != -1 && value.toString().split(".")[1].length > 2){
								if(alla_combined<0){
									this.alertinfo('扣款金额不能超过工资总金额')
									value = '';
								}else{
									this.alertinfo(name+'保留两位小数!')
									value = +value.toFixed(2);
								}
							}else{
								if(alla_combined<0){
									this.alertinfo('扣款金额不能超过工资总金额')
									value = '';
								}else{
									value = value;
								}
							}
						}
					}
					row[field] = value;
					this.calculateWage()
				},

				getConfirmMemberList(confirm_id){
					this.loading = true;
						util.ajax({
							// url: '/confirm/detail/wage',
							url:'/wage/compute/supplier/fees',
							type:'GET',
							data: {
								team_id: this.team_id,
								project_id: this.project_id,
								station_id:this.locatData.station_id,
								city_id:this.locatData.city_id,
								confirm_id:confirm_id,
							},
							success: (res) => {
								if(res&&res.errno==0){
									this.pushAjaxData = res.data
									this.confrimCombinationField(res.data,'cle')
								}else{
									this.alertinfo(res.errmsg)
								}
							},
							error: (xhr, status) => {
								this.loading = false;

							},
							noNetwork: () => {
								this.alertinfo('网络连接失败，请检查网络')
								this.loading = false;
							}
						});
				},
				//新建工资单获取人员列表
				getMemberList(){
					this.loading = true;
					if(this.locatData.newcreat == true){
							util.ajax({
								url: '/confirm/compute/bonus',
								type:'GET',
								data: {
									group_id: 0,
									team_id: this.team_id,
									project_id: this.project_id,
									encourage_rule_id:this.locatData.encourage_rule_id
								},
								success: (res) => {
									// console.log(res)
									if(res&&res.errno==0){
										this.combinationField(res.data,'cle')
									}
								},
								error: (xhr, status) => {
									this.loading = false;

								},
								noNetwork: () => {
									this.alertinfo('网络连接失败，请检查网络')
									this.loading = false;
								}
							});
					}else{
							util.ajax({
								url: '/wage/cloud/user_list',
								type:'GET',
								data: {
									group_id: 0,
									team_id: this.team_id,
									project_id: this.project_id,
									start_date:this.locatData.start_date,
									end_date:this.locatData.end_date,
									add_user_flag:this.locatData.add_user_flag == true ? 1 : 0,
								},
								success: (res) => {
									//console.log(JSON.stringify(res.data.list));
									if(res&&res.errno==0){
										this.combinationField(res.data,'cle')
									}
								},
								error: (xhr, status) => {
									this.loading = false;

								},
								noNetwork: () => {
									this.alertinfo('网络连接失败，请检查网络')
									this.loading = false;
								}
							});
					}

				},
				//组合工资单字段
				combinationField(res,type){
					//base_wage_unit 出勤计算方式，base_wage_price基本工资
					if(this.payrollData.base_wage_unit == undefined){
						this.payrollData.base_wage_unit = res.base_wage_unit;
						this.payrollData.base_wage_price = res.base_wage_price/100;
						this.theadList = res.extra_config;
					}
					let theadList = this.theadList,
							memberList = res.list;
					if(this.payrollData.base_wage_unit == 0){
						this.calculation = 'normal_days'
					}else{
						this.calculation = 'total_time'
					}
					//console.log(JSON.stringify(theadList))
						for(let n =0 ,lt = memberList.length;n < lt;n++){
							let wage_bar = {
								user_id:memberList[n].user_id,
								user_name:memberList[n].user_name || memberList[n].name,
								mobile:memberList[n].mobile,
								comment_star:memberList[n].comment_star,
								remark:memberList[n].remark || '',
								normal_days:this.locatData.pay_type == 1 ? memberList[n].normal_days : memberList[n].normal_days + memberList[n].abnormal_days,
								// normal_days:memberList[n].normal_days + memberList[n].abnormal_days,
								total_time:memberList[n].total_time,
								total_wage:0,
                protocol_status:memberList[n].protocol_status,
								mark_days:memberList[n].mark_days,
								select_check:true,
								jiangjin:memberList[n].bar_total_wage > -1 ? memberList[n].bar_total_wage * memberList.length : memberList[n].base_wage/100
							};
							if(type == 'edit' || type == 'import'){
								wage_bar.base_wage = memberList[n].base_wage/100 || '';
							}else{
								if(this.locatData.pay_type == 1){
									wage_bar.base_wage =  memberList[n].bar_total_wage
								}else{
									let base_wage_price = this.payrollData.base_wage_price * wage_bar[this.calculation],
										new_base_wage_price = base_wage_price.toString().indexOf('.') == -1 ? base_wage_price : base_wage_price.toFixed(2)
								wage_bar.base_wage =  new_base_wage_price == 0 ? '' : new_base_wage_price;
								}

							}
							for(let i = 0,lg = theadList.length;i < lg; i++){
								if(theadList[i].select == 1){
									wage_bar[theadList[i].field] = memberList[n][theadList[i].field]/100 || '';

								};
							};
							if(this.locatData.pay_type == 1){
								this.jiangjin = wage_bar.jiangjin.toFixed(2)
							}
							this.memberDataList.push(wage_bar)
						};
						this.selectTotalPerson = this.memberDataList.length;
						if(type != 'group' && type != 'import'){
							for(let i = 0,lg = theadList.length;i < lg; i++){
								if(theadList[i].select == 1){
									this.payrollTheadListList.push({name:theadList[i].name,field:theadList[i].field,flag:theadList[i].flag,value:theadList[i].value || 0,key:theadList[i].key})
									this.allCombined[theadList[i].field] = 0;
									this.syn_price[theadList[i].field] = '';
									this.rules[theadList[i].field] = [{ validator: moneychange, trigger: 'blur' }]

								};
							};
					}else{
						this.addPerLoading = false;
						this.showAddPersonnel = false;
						this.btnDisable = false;
					}
					this.calculateWage()
					this.loading = false;
					//console.log(JSON.stringify(this.memberDataList))
				},
				//客户邮件确认工资单组合
				confrimCombinationField(res){
					//base_wage_unit 出勤计算方式，base_wage_price基本工资
					this.payrollData.base_wage_unit = 0;
					let theadList = [],
					memberList = res.list;
					//console.log(JSON.stringify(theadList))
						for(let n =0 ,lt = memberList.length;n < lt;n++){
							let wage_bar = {
								user_id:memberList[n].baxian_user_id,
								user_name:memberList[n].user_name || memberList[n].name || memberList[n].real_name,
								mobile:memberList[n].mobile,
								comment_star:memberList[n].comment_star,
								remark:memberList[n].reamark || '',
								normal_days:memberList[n].detail.length,
								total_time:memberList[n].total_time || '',
								total_wage:0,
								select_check:true,
                protocol_status:memberList[n].protocol_status,
							};
							wage_bar.base_wage = memberList[n].supplier_total_wage/100 || '';
							this.memberDataList.push(wage_bar)
						};
					this.selectTotalPerson = this.memberDataList.length;
					this.addPerLoading = false;
					this.showAddPersonnel = false;
					this.btnDisable = false;
					this.calculateWage()
					this.loading = false;

				},
				calculateWage (){
					let dataList = this.memberDataList,
							all_base_wage = 0,
							alla_combined= 0,
							paylist = this.payrollTheadListList;
					for(let c in this.allCombined){
						this.allCombined[c] = 0;
					}
					for(let i = 0,lg = dataList.length;i < lg ; i++){
						let dataI = dataList[i];

						if(dataI.select_check){
							let thistotal_wage = +dataI.base_wage != +dataI.base_wage || +dataI.base_wage < 0 ? 0 : +dataI.base_wage;
							all_base_wage += thistotal_wage;
							for(let n = 0, lt = paylist.length; n < lt; n++){
								let thismoney = +dataI[paylist[n].field];
								thismoney = thismoney != thismoney || thismoney < 0 ? 0 :thismoney
								this.allCombined[paylist[n].field] += thismoney;
								if(paylist[n].flag == -1){
									thistotal_wage += -thismoney;
								}else{
									thistotal_wage += +thismoney;
								}
							}
							dataI.total_wage = thistotal_wage < 0 ? 0 : thistotal_wage.toFixed(2) ;
						}
					};
					this.all_base_wage = all_base_wage;
					for(let m = 0,th = paylist.length;m < th; m++ ){
						let thismoney = +this.allCombined[paylist[m].field];
						thismoney = thismoney != thismoney || thismoney < 0 ? 0 :thismoney
						if(paylist[m].flag == -1){
							alla_combined += -thismoney;
						}else{
							alla_combined += thismoney;
						}
					}
					let Acombined = alla_combined + all_base_wage;
					this.alla_combined = Acombined < 0 ? 0 : Acombined ;
				},
				//全选触发
				selectAll(){
					this.sel_all = !this.sel_all;
					this.memberDataList.map((index, elem) => {
						index.select_check = this.sel_all;
					});
					this.handleSelectionChange()
				},
				//选择列
				selectThis(row){
					row.select_check = !row.select_check;
					let memberDataList = this.memberDataList;
					this.handleSelectionChange()
					for(let i = 0,lg=memberDataList.length;i<lg;i++){
						if(!memberDataList[i].select_check){
							this.sel_all = false;
							return;
						}
					}
					this.sel_all = true;
				},
				getSelectTotalPerson(){
					this.selectTotalPerson = 0;
					let memberDataList = this.memberDataList;
					for(let i = 0,lg=memberDataList.length;i<lg;i++){
						if(memberDataList[i].select_check){
							++this.selectTotalPerson;
						}
					}

				},
				//选中时触发
				handleSelectionChange(){
					this.editsetlist = [];
					let memberDataList = this.memberDataList;
					for(let i = 0,lg=memberDataList.length;i<lg;i++){
						 if(memberDataList[i].select_check){
							this.editsetlist.push(memberDataList[i])
						}
					}
					this.calculateWage()
					this.getSelectTotalPerson()
				},
				//点击评分是触发
				evaluationStar(index,row){
					this.showevaluation = true;
					this.evaluationLoading = true;
					this.initstar = row.comment_star;
					this.evaluation_tag = [];
					if(this.initstar > 0){
						this.receiveEvaluation(this.initstar,row)
					}else{
						this.receiveEvaluation(index + 1,row)
					}
				},
				//点击弹出评分
				alertevaluationStar(index){
					if(this.editstar.comment_star !== index + 1){
						this.evaluation_tag = [];
						this.editstar.comment_star = index + 1;
					};
				},
				//点击评价标签
				addevaluation_tag(tag,event){
					//$(event.target).toggleClass('selecttag');
					let tagLg = this.evaluation_tag.indexOf(tag);
					if(tagLg !== -1){
						this.evaluation_tag.splice(tagLg,1);
					}else{
						this.evaluation_tag.push(tag);
					}
				},
				//获取评价
				receiveEvaluation(star,row){
					this.user_id = row.user_id;
					util.ajax({
							url:'/comment/get',
							type:'GET',
							data:{
									team_id: this.team_id,
									project_id: this.project_id,
									user_id: row.user_id
							},
							timeout:10000,
							success:(obj) => {
									this.evaluationLoading = false;
									if(obj&&obj.errno == 0){
										this.star_data = obj.data.star_data;
										this.editstar = row;
										this.editstar.comment_star = star;
										this.evaluate = obj.data.evaluate;
										this.evaluation_tag = obj.data.tag;
										// if(star === this.initstar){
										//   this.evaluation_tag =["表现出色","形象气质佳","经验丰富"]
										// }
									//console.log(JSON.stringify(obj.data))
									}else if(obj.errno == 4){
										this.showevaluation = false;
										this.alertinfo(obj.errmsg)
									}else{
											//widget.toast(obj.errmsg)
										this.alertinfo(obj.errmsg)
										this.showevaluation = false;
									}
							},
							error: (xhr, status) => {
									this.evaluationLoading = false;
									this.showevaluation = false;
									this.alertinfo('网络连接失败，请检查网络')
							},
							noNetwork: () => {
									this.evaluationLoading = false;
									this.showevaluation = false;
									this.alertinfo('网络连接失败，请检查网络')
							}
					})
				},
				//提交评价
				submitEvaluation(){
					this.evaluationLoading = true;
					if(this.btnDisable)return;
					this.btnDisable = true;
					util.ajax({
							url:'/comment/submit',
							type:'POST',
							data:{
									team_id: this.team_id,
									project_id: this.project_id,
									user_id:this.user_id ,
									star: this.editstar.comment_star,
									tag: this.evaluation_tag,
									evaluate: this.evaluate,
									source: 2,
									app_source:0,
							},
							timeout:10000,
							success:(obj) => {
									this.evaluationLoading = false;
									if(obj&&obj.errno == 0){
										this.showevaluation = false;
										this.alertinfo('提交成功','success')
									}else{
										this.alertinfo(obj.errmsg)
									}
							},
							error: (xhr, status) => {
									this.evaluationLoading = false;
									this.alertinfo('网络连接失败，请检查网络')
							},
							noNetwork: () => {
									this.evaluationLoading = false;
									this.alertinfo('网络连接失败，请检查网络')
							}
					})
				},
				//取消评分
				starresetForm(){
					this.editstar.comment_star = this.initstar;
					this.showevaluation = false;
					this.evaluationLoading = false;
					this.btnDisable = false;
				},
				//批量编辑
				eidtsetpayroll(){
					//console.log(this.editsetlist.length)
					if(this.editsetlist.length == 0){
						return;
					}else{
						for(let i in this.syn_price){
							this.syn_price[i] = '';
						}
						this.showallpayrolledit = true;
					}
				},
				handleClick (data,datas){
				},
				//确定编辑工资单
				editPayrollconfirm(formName){
					//console.log(JSON.stringify(this.editsetlist))
					this.$refs[formName].validate((valid) => {
						if(!valid) return false;
						if('charge' in this.syn_price){
							let allPice = 0;
							for(let i = 0,lg = this.editsetlist.length; i < lg ; i++){
								for(let m in this.syn_price){
									//console.log(!isNaN(this.syn_price[m]))
									if(this.syn_price[m] != '' && m != 'remark'){
										allPice += +this.syn_price[m];
									}else{
										if(m != 'remark'){
											allPice += +this.editsetlist[i][m];
										}
									}
								}
								if(allPice - 2*this.syn_price.charge < 0){
									this.alertinfo(this.editsetlist[i].user_name + '的扣款金额不能超过工资总金额')
									return;
								}
							}
						}
						for(let i = 0,lg = this.editsetlist.length; i < lg ; i++){
							for(let m in this.syn_price){
								//console.log(!isNaN(this.syn_price[m]))
								if(!isNaN(this.syn_price[m]) && this.syn_price[m] != '' && m != 'remark'){
									this.editsetlist[i][m] = this.syn_price[m];
								}else if(m == 'remark' && this.editsetlist[i]['remark'] != undefined){
									this.editsetlist[i]['remark'] = this.syn_price['remark'];
								}
							}
						}
						//console.log(JSON.stringify(this.editsetlist))
						this.calculateWage()
						this.showallpayrolledit = false;
					});
				},
				//取消批量编辑
				resetForm(formName) {
					this.$refs[formName].resetFields();
					this.showallpayrolledit = false;
				},
				//批量删除
				delsetlist(){
					if(this.editsetlist.length == 0){
						return;
					}else{
						this.showsetdel = true
					}
				},
				//确认删除
				confirmdel(){
					if(this.btnDisable)return;
					this.btnDisable = true;
					let editsetlist = this.editsetlist;
					for(let i = 0 ,lg = editsetlist.length;i < lg;i++){
						for(let n =0 ,lt = this.memberDataList.length; n < lt ;n++){
							if(editsetlist[i].user_id === this.memberDataList[n].user_id){
								this.memberDataList.splice(n,1);
								break;
							}
						}
					}
					this.editsetlist= [];
					if(this.memberDataList.length == 0){
						this.sel_all = false;
					}
					this.showsetdel = false;
					this.alertinfo('删除成功','success')
					this.calculateWage();
				},
				//修改工资单
				modifyPayrollFn(){
					if(this.ifConfirmPayroll) return;
					this.modifyPayrollform.kqDateDay = [this.locatData.start_date,this.locatData.end_date];
					this.modifyPayrollform.approve_uid = this.locatData.approve_uid;
					this.modifyPayrollform.add_user_flag = false;
					this.showModifyPayroll = true;
				},
				//获取当前用户权限
				getUserPermission(){
					util.ajax({
							url:'/wage/approve_user/area',
							type:'GET',
							data:{
									team_id: this.team_id,
									project_id: this.project_id
							},
							timeout:10000,
							success:(result) => {
									if(result&&result.errno == 0){
											this.pay_flag = result.data.pay_flag;
											this.audit_flag = result.data.audit_flag;
											if(result.data.pay_flag == 1){
												result.data.list.unshift({user_id:'0',real_name:'无需审批',identity_str:'无需审批'})
											}else{
												if(result.data.audit_flag ==1 ){
													result.data.list.unshift({user_id:'0',real_name:'无需审批',identity_str:'无需审批'})
												}
											}
											for(let i = 0 ,lg = result.data.list.length;i < lg ;i++){
												if(result.data.list[i].user_id == this.locatData.approve_uid){
													this.modifyPayrollform.approve_uid = result.data.list[i].user_id
												}
											}
											this.modifyPayrollform.regionlist = result.data.list;
											this.modifyPayrollform.order_name = this.locatData.order_name;
											this.modifyPayrollform.kqDateDay = [this.locatData.start_date,this.locatData.end_date]
									}else{
										this.alertinfo(result.errmsg)
									}
							},
							error: (xhr, status) => {
								this.alertinfo('服务器异常')
							},
							noNetwork: () => {
								this.alertinfo('网络连接失败，请检查网络')
							}
					})
				},
				//确定修改工资单
				modifyPayrollconfirm(formName){
					this.$refs[formName].validate((valid) => {
						if (valid) {
							this.locatData.order_name = this.modifyPayrollform.order_name;
							this.locatData.start_date = util.formatData1(this.modifyPayrollform.kqDateDay[0]);
							this.locatData.end_date = util.formatData1(this.modifyPayrollform.kqDateDay[1]);
							this.locatData.approve_uid = this.modifyPayrollform.approve_uid;
							this.locatData.add_user_flag = this.modifyPayrollform.add_user_flag;
							if(this.locatData.add_user_flag == true){
								this.memberDataList.splice(0,this.memberDataList.length)
								this.payrollTheadListList.splice(0,this.payrollTheadListList.length)
								this.getMemberList();
								this.showModifyPayroll = false;
							}
							this.showModifyPayroll = false;
						} else {
								// console.log('error submit!!');
								return false;
								this.showModifyPayroll = false;
						}
					});
				},
				//取消修改工资单
				modifyresetForm(formName){
					this.$refs[formName].resetFields();
					this.showModifyPayroll = false
				},
				// 显示错误信息
				alertinfo(text,type){
					this.btnDisable = false;
					this.loading = false;
					this.$message({
						showClose: true,
						message: text,
						type: type || 'warning',
					});
				},
				//添加人员
				addPersonnel(){
					this.showAddPersonnel = true;
					this.addPerLoading = true;
					this.filterText = '' ;
					this.origin_selected_groups = []
					util.ajax({
						url:'/group/node_data_tree',
						data:{
							team_id: this.team_id,
							project_id: this.project_id,
							is_comment:'1',
							show_all:0,
							type_id:'1',
							start_date:this.locatData.start_date,
							end_date:this.locatData.end_date
						},
						timeout:10000,
						success:(obj) => {
								this.addPerLoading = false;
								if(obj&&obj.errno == 0){
									this.all_groups = obj.data;
								}else{
									this.showAddPersonnel = false;
									this.alertinfo(obj.errms)
								}
						},
						error: (xhr, status) => {
								this.addPerLoading = false;
								this.showAddPersonnel = false;
								this.alertinfo('网络连接失败，请检查网络')
						},
						noNetwork: () => {
								this.addPerLoading = false;
								this.showAddPersonnel = false;
								this.alertinfo('网络连接失败，请检查网络')
						}
					})
				},
				//弹出导入弹框
				improtWages(){
					this.dialogImport = true;
				},
				//取消导入人员
				cancelImport(){
					this.dialogImport = false;
					this.file_text = ''
					$('#upfile')[0].reset();
				},
				//取消文件
				fileClose(){
					this.file_text = ''
					$('#upfile')[0].reset();
				},
				//选择文件
				uploadExcel(){
					if(this.file_text) return;
					$('#uploadInp').trigger('click')
				},
				//下载模板
				importExel(){
					let url  = '/sea/api/1.0/client/v1/wage/order/xls_template?dmclient=pcweb&team_id='+this.team_id +'&project_id='+this.project_id
					util.locationHref(url)
				},
				fileOnChange(){
						// console.log(2)
						var file_data = $("#uploadInp").prop("files")[0];
						this.file_text = file_data['name']
						if(file_data['size'] / 1024 / 1024 > 1){
							this.alertinfo('文件大小不能超过 1MB!')
							return
						}
						this.file_speed = true
						let interval = setInterval(()=>{
								if(this.speed  < 100){
									 this.speed+=10
								}else{
										this.file_speed = false
										clearInterval(interval)
										this.speed = 0;
										return
								}
						},50)
				},
				//提交表格
				submitImport(){
						if(this.file_text == ''){
								this.alertinfo('选择你要导入的文件')
								return
						}
						if(this.btnDisable)return;
						this.btnDisable = true;
						this.importLoading = true;
						var form_data = new FormData()
						var file_data = $("#uploadInp").prop("files")[0]
						form_data.append("team_id", this.team_id);
						form_data.append("project_id", this.project_id);
						form_data.append("start_date", this.locatData.start_date);
						form_data.append("end_date", this.locatData.end_date);
						form_data.append("import_file",file_data);
						$.ajax({
							url:util.host+'/sea/api/1.0/client/v1/wage/order/xls_user?dmclient=pcweb',
							type:'POST',
							data:form_data,
							processData:false,
							contentType:false,
							xhrFields:{
								withCredentials:true
							},
							timeout:10000,
							success:(obj) => {
									this.importLoading = false;
									this.btnDisable = false;
									// console.log(obj)
									if(obj && obj.errno == 0){
											if(obj.data.error_list.length == 0){
													this.alertinfo('导入成功')
													this.dialogImport = false
													this.memberDataList = [];
													this.combinationField({list:obj.data.valid_list},'import')
											}
											if(obj.data.error_list.length > 0){
													util.setLocalStorage('memberErrorList',obj.data)
													this.$router.replace('CreateEditError?order_id='+this.order_id)
											}
									}else{
											this.alertinfo(obj.errmsg)
											this.fileClose()
									}
							},
							error: (xhr, status) => {
								this.importLoading = false;
								this.btnDisable = false;
								this.fileClose()
								this.alertinfo('网络连接失败，请检查网络')
							},
							noNetwork: () => {
								this.importLoading = false;
								this.btnDisable = false;
								this.fileClose()
								//网络超时
								this.alertinfo('网络连接失败，请检查网络')
							}
					 });
				},
				//提交
				submitaudit(status_no){
					if(this.selectTotalPerson == 0){
						this.alertinfo('人员不能为空，请先添加人员！')
						return;
					}
					// if(this.alla_combined >= 7000){
					// 	this.alertinfo('本次结算所有供应商费用均超过7000，将在CRM公对公或线下支付的形式支付')
					// 	return;
					// }
					let submitObj = this.dataDtructure(status_no),
					wage_bar = (JSON.parse(submitObj.wage_info)).wage_bar;
					for(let i = 0,lg = wage_bar.length;i < lg;i++){
						if(wage_bar[i].bar_total_wage ==0){
							this.alertinfo('请完善' + wage_bar[i].user_name+'的工资');
							return;
						}
					};
					if(this.btnDisable)return;
					this.btnDisable = true;
					this.loading = true;
					this.dataSubmit(submitObj,status_no)
				},
				//保存草稿
				TheDraft(status_no){
					if(this.selectTotalPerson == 0){
						this.alertinfo('人员不能为空，请先添加人员！')
						return;
					}
					if(this.btnDisable)return;
					this.btnDisable = true;
					this.loading = true;
					let submitObj = this.dataDtructure(status_no)
					this.dataSubmit(submitObj)
				},
				//提交前数据拼接
				dataDtructure(status_no){

					let wage_info= {wage_bar:[],wage_order:{}},
						submitObj = {},
						memberDataList = this.memberDataList,
						payrollTheadListList = this.payrollTheadListList;
					for(let i =0,n = memberDataList.length;i < n;i++){
						if(memberDataList[i].select_check){
							let wage_bar=[],
									extra_pay = [];
							wage_bar = {
								user_id:memberDataList[i].user_id,
								user_name:memberDataList[i].user_name,
								base_wage:(memberDataList[i].base_wage * 100).toFixed(2),
								bar_total_wage:(memberDataList[i].total_wage * 100).toFixed(2),
								remark:memberDataList[i].remark || '',
								extra_pay:extra_pay,
								mark_days:memberDataList[i].mark_days || [],
                protocol_status:memberDataList[i].protocol_status,
							};
							for(let n = 0,lt = payrollTheadListList.length; n < lt ;n++){
								extra_pay[n] = {};
								extra_pay[n].name = payrollTheadListList[n].name;
								extra_pay[n].key = payrollTheadListList[n].key;
								extra_pay[n].select = payrollTheadListList[n].select;
								extra_pay[n].flag = payrollTheadListList[n].flag;
								extra_pay[n].select = 1;
								extra_pay[n].value = (memberDataList[i][payrollTheadListList[n].field]* 100).toFixed(2);
							}
							wage_info.wage_bar.push(wage_bar)
						}
					}
					let sdate = ''
					let edate = ''
					if(this.locatData.pay_type && this.locatData.pay_type == 1){
						if(this.locatData.date){
							this.d = this.locatData.date.replace('年',"-").replace('月',"")
						}
						sdate = util.getMonthLaskFirst(this.d)[0]
						edate = util.getMonthLaskFirst(this.d)[1]
					}
					wage_info.wage_order = {
						order_name:this.locatData.order_name || this.locatData.address_name,
						start_date: this.locatData.start_date || sdate,
						end_date: this.locatData.end_date || edate,
						approve_uid: this.locatData.approve_uid,
						status_no: 1,
						order_total_wage: (this.alla_combined*100).toFixed(2),
						confirm_id:this.locatData.confirm_id || 0
					}

					submitObj.team_id = this.team_id;
					submitObj.project_id = this.project_id;
					submitObj.wage_info = JSON.stringify(wage_info);
					submitObj.order_id = this.order_id || 0;
					submitObj.type = this.locatData.pay_type;
					submitObj.encourage_rule_id = '';
					submitObj.station_id = this.locatData.station_id;
					submitObj.city_id = this.locatData.city_id
					submitObj.charge_list = JSON.stringify(this.pushAjaxData)
					return submitObj;
				},
				//工资单整体数据提交
				dataSubmit(submitObj,status_no){
					// console.log(JSON.stringify(this.pushAjaxData))
					// console.log(JSON.stringify(submitObj))
					util.ajax({
							url:'/wage/order_user/save',
							type:'POST',
							data:submitObj,
							timeout:10000,
							success:(obj) => {
									this.loading = false;
									this.btnDisable = false;
									if(obj&&obj.errno == 0){
										window.localStorage.removeItem('memberDataList')
										window.localStorage.removeItem('locatData')
										window.localStorage.removeItem('savePayDetail')
										this.alertinfo('操作成功','success')
										this.goPayrollList()
										// if(status_no ==2 ){
										// 	let PaylistDetail = 'PaylistDetail?order_id=' +obj.data.order_id;
										// 	this.$router.push(PaylistDetail)
										// 	return;
										// }else{
										// 	this.alertinfo('操作成功','success')
										// 	this.goPayrollList()
										// }
									}else{
										this.alertinfo(obj.errmsg)
									}
							},
							error: (xhr, status) => {
									this.loading = false;
									this.btnDisable = false;
									this.alertinfo('网络连接失败，请检查网络')
							},
							noNetwork: () => {
									this.loading = false;
									this.btnDisable = false;
									this.alertinfo('网络连接失败，请检查网络')
							}
					})
				},
				classNameAttribute2(row, index){
					// console.log(row)
						let o = ''
						row.date_data.forEach((item) => {
							 if(item.status == '正常'){
									o = ''
							 }else{
									o = 'unn'
							 }
						})
						return o
				},
/******************详情部分*******************/
				//点击左侧小组列表时  切换右侧 是否选取
				handleNodeClick(data) {
					//console.log(JSON.stringify(data));
					let dataid = data.id || data.user_id;
					for(let i = 0; i < this.origin_selected_groups.length; i++){
						if(this.origin_selected_groups[i].id === dataid){
							this.origin_selected_groups.splice(i,1)
							return
						}
					};
					let PeronnelList = [];
					//递归遍历树形结构，将当前选择的树形结构的人添加到一个数组[{},{}]
					let getPersonnelList = (node) => {
						if(node.children && node.children.length > 0){
							for(let i = 0 ,lg=node.children.length; i < lg; i++){
								if(node.children[i].render_flag === 2){
									PeronnelList.push(node.children[i])
								}else{
									getPersonnelList(node.children[i])
								}
							}
						}else{
							if(node.render_flag === 1)return;
								PeronnelList.push(node);
						}
					};
					let selType;
					if(data.children){
						selType = 'group';
					}else{
						selType = 'peple'
					}
					getPersonnelList(data)
					this.origin_selected_groups.push({selType:selType,id:dataid, name: data.name,PeronnelList:PeronnelList})
				},
				//反选择小组
				unSelectGroup(index){
					this.origin_selected_groups.splice(index,1)
				},
				openGroupSelecter(){
					this.filterText = ''
					this.showGroupSelecter = true
					this.origin_selected_groups = util.getLocalStorage('origin_selected_groups') || []

				},
				//确定选择
				confirmGroupSelecter(){
					if(this.btnDisable)return;
					this.btnDisable = true;
					this.addPerLoading = true;
					this.clearFilterText()
					let peronnelList = [],
							newPeronnelList = [],
							PeronnelIdList = [];
					for(let i = 0 ,lg = this.origin_selected_groups.length; i < lg; i++){
						peronnelList = peronnelList.concat(this.origin_selected_groups[i].PeronnelList)
					}
					//util.setLocalStorage('origin_selected_groups', this.origin_selected_groups)
					for(let n = 0, lt = peronnelList.length; n < lt ; n++){
						if(PeronnelIdList.indexOf(peronnelList[n].user_id) === -1){
							PeronnelIdList = PeronnelIdList.concat(peronnelList[n].user_id)
							newPeronnelList = newPeronnelList.concat(peronnelList[n])
						}
					}
					let dif = '';
					//console.log(JSON.stringify(newPeronnelList))
					//this.selected_groups = this.origin_selected_groups
					for(let m = 0,th = newPeronnelList.length;m < th;m++){
						for(let t = 0,ng = this.memberDataList.length;t < ng;t++){
							if(newPeronnelList[m].user_id == this.memberDataList[t].user_id) {
								dif += newPeronnelList[m].user_id + ',';
								break;
							}
						}
					}
					let newDif = [];
					for(let q = 0,tn = newPeronnelList.length;q < tn;q++){
						if(dif.indexOf(newPeronnelList[q].user_id) == -1){
							newDif.push(newPeronnelList[q])
						}
					}
					if(newDif.length === 0){
						this.addPerLoading = false;
						this.showAddPersonnel = false;
						this.btnDisable = false;
						return;
					};
					this.sel_all = false;
					this.origin_selected_groups = []
					this.combinationField({list:newDif},'group');
				},
				goPayrollList(){
					this.$router.replace('PayrollAccounting')
				},
				//过滤小组函数
				filterNode(value, data) {
					if (!value) return true;
					return data.name.indexOf(value) !== -1;
				},
				//清楚搜索小组关键字
				clearFilterText(){
					// alert(123)
					this.filterText = ''
				},
			},
			created(){

				$('#createeditpayroll .kq-wapper').height(window.innerHeight - 60)
				this.tableHeight = window.innerHeight -336 + 'px';
				this.PayListDetailHeight = window.innerHeight  + 'px';
				this.ondatas_Height = window.innerHeight -300 + 'px';
					this.init()
				$(window).on('resize',()=>{
					this.tableHeight = window.innerHeight -336 + 'px';
					this.PayListDetailHeight = window.innerHeight  + 'px';
					this.ondatas_Height = window.innerHeight -300 + 'px';
				})
			},
		}
</script>

<style  src='../assets/css/createeditpayroll.css'></style>
<style  src='../assets/css/base.css'></style>

<style>

</style>
