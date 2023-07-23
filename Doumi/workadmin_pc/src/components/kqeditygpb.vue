<template>
	<div class="kqeditygpb">
  		<div class="kqeditygpb_top">
  			<breadcrumb>
  			    <router-link to="kqaddmin" replace>考勤管理</router-link>
  			    <router-link to="kqtasklist">考勤规则管理</router-link>
  			    <router-link to="">员工自主排班</router-link>
  			</breadcrumb>
  		</div>
  		<div class="kqeditygpb_main">
  			<div class="kqeditygpb_do">
	  			<h2 class="page_title">排班任务</h2>
	  			<div class="ygpb_operation">
	  				<div class="search_select">
	  					<el-form label-width="40px">
			                <div class="from-item-list">
			                    <el-form-item label="日期：">
			                        <el-date-picker 
			                            v-model="pickerchoose_date"
			                            type="date"
			                            placeholder="选择日期"
										value-format="yyyy-MM-dd"
			                            style="width:150px"
			                            @change="pickerChange"
			                            :editable="false">
			                        </el-date-picker>
			                    </el-form-item>
			                </div>
			                <div class="from-item-list" v-if="false">
			                    <el-form-item label="地点：" style="float:left">
			                        <el-select v-model="addr_select" class="mystatus" style="width:220px" >
			                          <template v-for="item in workAddrList">
			                              <el-option
			                                :key="item.id"
			                                :label="item.name + '（' + item.address + '）'"
			                                :value="item.id">
			                              </el-option>
			                          </template>
			                        </el-select>
			                    </el-form-item>
			                </div>
				            <el-button type="primary" class="seach-btn" v-if="false"  style="float:left:margin-left:16px;" @click="searchpb">搜 索</el-button>
							<div class="btn-item addMember" @click="createPbFn">
								<i class="add_icon"></i>
								<el-button type="text">新建排班任务</el-button>
							</div>
	  					</el-form>
	  				</div>
	  			</div>
  			</div>
  			<div class="ygpb_list" v-loading="ygpbListLoading">
                <el-table :data="ygpbList" border  style="width: 100%" :height="tableHeight" empty-text="暂无数据"  v-loading.body="false"  @row-click="getpeoplelist">
                    <el-table-column prop="project_name"  label="项目名称" show-overflow-tooltip min-width="120"></el-table-column>
                    <el-table-column prop="attendance_time" label="考勤时间"  width="130"></el-table-column>
                    <el-table-column prop="apply_num" label="报名人数/需求人数" width="150">
                        <template slot-scope="scope">
                        	<div>
                           		<span style="color:#f26f4f;">{{scope.row.apply_num}}</span><span>/{{scope.row.people_num}}</span>
                        	</div>
                        </template>                    	
                    </el-table-column>
                    <el-table-column prop="position" label="工作地点" min-width="180" show-overflow-tooltip>
                    	<template slot-scope="scope">
                    		<span class="addressinfo">{{scope.row.position_name + '（' + scope.row.position + '）'}}</span>
                    	</template>
                    </el-table-column>
                    <el-table-column prop="position_id" label="有效时间" width="120">
                    	<template slot-scope="scope">
                    			<div v-for="items in scope.row.publish_date">{{items}}</div>
                    	</template>
                    </el-table-column>
                    <el-table-column prop="send_status" label="发布状态" width="90" filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag :type=" 'primary' + scope.row.send_status" close-transition>{{ scope.row.send_status == 0 ? '未发布' : '已发布'}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status_no" label="操作" width="120" filter-placement="bottom-end">
                        <template slot-scope="scope">
                        	<div class="operation_orw">
                        		<template v-if="scope.row.send_status == 0">
		                            <div class="operation_item" @click.stop="release(scope.row)" >发布</div>
		                            <div  @click.stop="editygpbfn(scope.row)" >修改</div>
                        		</template>
                        		<template v-else>
	                            	<div   @click.stop="release(scope.row)" >发布</div>
                        		</template>
                        	</div>
                        </template>
                    </el-table-column>
                </el-table>  
                <el-pagination
                v-if="ygpbList.length > 0"
                @current-change="handleSizeChange"
                :current-page.sync="page_no"
                :page-size="page_size"
                layout="total, prev, pager, next"
                :total="total">
              </el-pagination>
  			</div>
  		</div>
	  <div class="kqygpb-dialog createygpb ygpb_mask" v-loading="createloading">
	      <el-dialog 
	        title="新建排班任务" 
	        :visible.sync="createshoworhide"
	        @close="resetForm('createygpb','createshoworhide')"
	        size="tiny">  
			<el-form :model="createygpb" label-width="125px" :rules="rules" ref="createygpb">
				<el-form-item label="需求人数" prop="number">
					<el-input v-model="createygpb.number" auto-complete="off"  placeholder="请输入" style="width: 254px"></el-input>
				</el-form-item>
				<el-form-item label="考勤时间" prop="time">
					<el-select v-model="createygpb.time" placeholder="请选择" style="width:254px" >
						<el-option v-for="item in workTimeList"  :label="item.name + '班次 (' + item.start_time + '-' + (item.cross == 1 ? '次日' :'') + item.end_time + ')'  " :key="item.id"  :value="item.id" >
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="工作地点" prop="addr" class="approve_uid">
					<el-select v-model="createygpb.addr" placeholder="请选择" style="width:254px">
						<el-option v-for="item in workAddrList"  :label="item.name + '（'+ item.address+ '）'  " :key="item.id"  :value="item.id" style="width:254px;">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
	        <div slot="footer" class="dialog-footer">
	            <el-button class="cancel" @click="resetForm('createygpb','createshoworhide')">取 消</el-button>
	            <el-button type="primary" class="confirm" @click="addcreatefirm('createygpb')">确 定</el-button>
	        </div>
	      </el-dialog>
	  </div>
	  <div class="kqygpb-dialog createygpb ygpb_mask" >
	      <el-dialog 
	        title="修改排班" 
	        :visible.sync="editshoworhide"
	        @close="resetForm('editygpb','editshoworhide')"
	        size="tiny">  
			<el-form :model="editygpb" label-width="125px" :rules="rules" ref="editygpb">
				<el-form-item label="需求人数" prop="number">
					<el-input v-model.number="editygpb.number" auto-complete="off"  placeholder="请输入" style="width: 254px"></el-input>
				</el-form-item>
				<el-form-item label="考勤时间" prop="time">
					<el-select v-model="editygpb.time" placeholder="请选择" style="width:254px" >
						<el-option v-for="item in workTimeList"  :label="item.name + '班次 (' + item.start_time + '-' + (item.cross == 1 ? '次日' :'')+ item.end_time + ')'  " :key="item.id"  :value="item.id" >
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="工作地点" prop="addr" class="approve_uid">
					<el-select v-model="editygpb.addr" placeholder="请选择" style="width:254px" >
						<el-option v-for="item in workAddrList"  :label="item.name + '（'+ item.address+ '）'  " :key="item.id"  :value="item.id" style="width:254px;">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
	        <div slot="footer" class="dialog-footer">
	            <el-button class="cancel" @click="resetForm('editygpb','editshoworhide')">取 消</el-button>
	            <el-button type="primary" class="confirm" @click="addeditfirm('editygpb')">确 定</el-button>
	        </div>
	      </el-dialog>
	  </div>
	  <div class="kqygpb-dialog ygpb_mask releaseygpb" >
	      <el-dialog 
	        title="发布排班" 
	        :visible.sync="releaseshoworhide"
	        @close="resetForm('releaseygpb','releaseshoworhide')"
	        size="tiny">  
			<el-form :model="releaseygpb" :rules="rules" ref="releaseygpb">
				<p class="release_prompt">员工可选择排班任务的日期范围：</p>
				<el-form-item label="" prop="kqDateDay">
					<el-date-picker 
						v-model="releaseygpb.kqDateDay" 
						range-separator="至"
						:clearable="false"
						type="daterange" 
						placeholder="请选择日期范围"
						:picker-options="pbbegintime"
						:editable="false"
						value-format="yyyy-MM-dd"
						style="width:304px;margin-left: 40px;"
						>
					</el-date-picker>
				</el-form-item>
				<p class="release_prompt">注：排班发布后不可修改！</p>
			</el-form>
	        <div slot="footer" class="dialog-footer">
	            <el-button class="cancel" @click="resetForm('releaseygpb','releaseshoworhide')">取 消</el-button>
	            <el-button type="primary" class="confirm" @click="addreleasefirm('releaseygpb')">确 定</el-button>
	        </div>
	      </el-dialog>
	  </div>
	</div>
</template>
<script>

import * as util from '../assets/js/util.js'
import breadcrumb from '@/components/common/breadcrumb';
export default{
  	name: 'kqeditygpb',
  	components:{
        breadcrumb,
    },
      watch: {
        '$route' (form,to) {
        	if(form.name == 'Project') return;
        	this.$router.replace('kqtasklist')
        },
      },
    data(){
        var testempty = (rule,value,callback) => {
            if(!value) {
                return callback(new Error(rule.field == 'time' ? '请选择日期' : '请选择工作地点' ));
            }else{
                callback();
            }
        };
        var checknum = function(rule,value,callback){
        	var value = +value == 0 ?  'error' : +value
        	var patrn = /^[0-9]*$/;
        	if(!patrn.test(value)){
                return callback(new Error('请输入大于0的整数'));
        	}else{
                callback();
            }
        }
        var testStartTime = (rule,value,callback) => {
            var sumDays = ''
            if(!value) {
                return callback(new Error('请选择日期'));
            }else{
                sumDays = util.DateDiff(util.formatData1(value[0]),util.formatData1(value[1]))
                if(sumDays > 365){
                    return callback(new Error('时间跨度不能超过1年'));
                }else{
                    callback();
                }
            }
        };
    	return{
    		tableHeight:0,//table高度
    		ygpbListLoading:true,
    		createshoworhide:false,//新建排班mask开关
    		releaseshoworhide:false,//发布排班mask开关
    		switchcheck:true,
    		editshoworhide:false,
    		createloading:false,
    		choose_date:'',
    		pickerchoose_date:'',
    		sfsfsfsfdsf:'',
    		addr_select:'',
    		page_size:20,
    		total:0,
    		page_no:1,
    		ygpbList:[],
    		createygpb:{addr:'',number:'',time:''},
    		editygpb:{addr:'',number:'',time:''},
    		releaseygpb:{kqDateDay:''},
            begintime:{
              disabledDate(time) {
                return time.getTime() < Date.now();
              }          
            },
            pbbegintime:{
              disabledDate(time) {
                return time.getTime() <= Date.now();
              }          
            },
    		rules:{ 
                time:[
                  { required: true, message:'请选择考勤时间',trigger: 'change' },
                  { required: true, message:'请选择考勤时间',trigger: 'blur' },
                ],
                number:[
                    {  required: true,validator: checknum, trigger: 'blur' }
                ],
                addr:[
                  { required: true, message:'请选择工作地点',trigger: 'change' },
                  { required: true, message:'请选择工作地点',trigger: 'blur' },
                ],
                kqDateDay:[
                    { validator: testStartTime, trigger: 'change',required: true }
                ]

            },
            workAddrList:[],
    		workTimeList:[],
    	}
    },
    methods:{
    	init(){
      		this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      		this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      		this.task_id = util.getLocalStorage('kqpb_task_id')
      		this.pickerchoose_date = util.formatData1(new Date());
      		this.choose_date = util.formatData1(new Date())
      		// console.log(this.task_id)
      		//获取排班列表
      		this.getKqList()
    		this.getTableHeight();
    		//获取排班时间
    		this.getTaskList();
    		//获取地址考勤列表
    		this.getAddrList()
    	},
    	//获取考勤列表
    	getKqList(){
    		this.ygpbListLoading = true;
	    	util.ajax({
	    		url:'/attendance/attendance_task_autonomy_list_pc',
	    		data:{
	    			project_id:this.project_id,
	    			team_id:this.team_id,
	    			task_id:this.task_id,
	    			choose_date:this.choose_date,
	    			page_size:20,
	    			page:this.page_no
	    		},
	    		type:'POST',
	    		success:(res)=>{
	    			this.ygpbListLoading = false;
	    			if(res.errno == 0){
	    				this.ygpbList = res.data.list;
	    				this.total = +res.data.page_data.total;
	    			}else{
	    			    this.$message({
	    			      showClose: true,
	    			      message: res.errmsg,
	    			      type: 'warning'
	    			    });

	    			}
	    		},
				error: (xhr, status) => {
	    			this.ygpbListLoading = false;
				  
				},
				noNetwork: () => {
	    			this.ygpbListLoading = false;
				    // 网络超时
				    this.$message({
				      showClose: true,
				      message: '网络连接失败，请检查网络',
				      type: 'warning'
				    });
				}
	    	})
    	},

        handleSizeChange(){
      		this.getKqList()
        },
        getTableHeight(){
            this.tableHeight =  window.innerHeight - 282;
        },
        resetForm(formName,type) {
          this.$refs[formName].resetFields();
          this[type] = false
        },
        createPbFn(){
        	this.createshoworhide = true;
        },
        release(row){
        	//0 or 1判断是否是已发布过，限制发布时间，0为未发布
        	let disTime = row.last_publish_date == 0 ? Date.now() :row.last_publish_date  * 1000;
            this.pbbegintime.disabledDate = (time)=>{
                return time.getTime() <= disTime;
             };
        	this.releaseshoworhide = true;
        	this.editygpb.addr = row.position_id+'';
        	this.editygpb.time = row.schedule_id + '';
        	this.editygpb.number = row.people_num;
        	this.autonomy_task_id = row.autonomy_task_id;
        },
        editygpbfn(row){
        	this.editygpb.addr = row.position_id+'';
        	this.editygpb.time = row.schedule_id + '';
        	this.editygpb.number = row.people_num;
        	this.editshoworhide = true;
        	this.autonomy_task_id = row.autonomy_task_id;
        },
        //新建排班
        addcreatefirm(formName){          
        	this.$refs[formName].validate((valid) => {
				if (valid) {
					if(!this.switchcheck) return;
	            	this.switchcheck = false;
	            	util.ajax({
	            		url:'/attendance/attendance_task_autonomy_add',
	            		data:{
	            			project_id:this.project_id,
	            			team_id:this.team_id,
	            			task_id:this.task_id,
	            			schedule_id:this.createygpb.time,
	            			position_id:this.createygpb.addr,
	            			people_num:this.createygpb.number,
	            			choose_date:this.choose_date,
	            		},
	            		type:'POST',
	            		success:(res)=>{
	            			this.switchcheck = true;
	            			if(res.errno == 0){
			    			    this.$message({
			    			      showClose: true,
			    			      message: '新建成功',
			    			      type: 'success'
			    			    });
			    			    this.createshoworhide = false;
			    			    this.page_no = 1;
			    			    this.getKqList()
	            			}else{
			    			    this.$message({
			    			      showClose: true,
			    			      message: res.errmsg,
			    			      type: 'warning'
			    			    });

	            			}
	            		},
		    			error: (xhr, status) => {
	            			this.switchcheck = true;
		    			  
		    			},
		    			noNetwork: () => {
	            			this.switchcheck = true;
		    			    // 网络超时
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
        //编辑排班
        addeditfirm(formName){          
        	this.$refs[formName].validate( (valid) => {
	            if (valid) {
					if(!this.switchcheck) {return};
	            	this.switchcheck = false;
	            	util.ajax({
	            		url:'/attendance/attendance_task_autonomy_update',
	            		data:{
	            			project_id:this.project_id,
	            			team_id:this.team_id,
	            			autonomy_task_id:this.autonomy_task_id,
	            			task_id:this.task_id,
	            			schedule_id:this.editygpb.time,
	            			position_id:this.editygpb.addr,
	            			people_num:this.editygpb.number,
	            			choose_date:this.choose_date,
	            		},
	            		type:'POST',
	            		success:(res)=>{
	            			this.switchcheck = true;
	            			if(res.errno == 0){
	            				this.editshoworhide = false;
			    			    this.$message({
			    			      showClose: true,
			    			      message: '修改成功',
			    			      type: 'success'
			    			    });
			    			    this.page_no = 1;
			    			    this.getKqList()

	            			}else{
			    			    this.$message({
			    			      showClose: true,
			    			      message: res.errmsg,
			    			      type: 'warning'
			    			    });

	            			}
	            		},
		    			error: (xhr, status) => {
	            			this.switchcheck = true;
		    			  
		    			},
		    			noNetwork: () => {
	            			this.switchcheck = true;
		    			    // 网络超时
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
        //发布排班
        addreleasefirm(formName){ 
        	this.$refs[formName].validate((valid) => {
	            if (valid) {
					if(!this.switchcheck) return;
	            	this.switchcheck = false;
	            	var start_date = util.formatData1(this.releaseygpb.kqDateDay[0]);
	            	var  end_date = util.formatData1(this.releaseygpb.kqDateDay[1]);
		        	util.ajax({
		        		url:'/attendance/attendance_task_autonomy_publish',
		        		data:{
		        			project_id:this.project_id,
		        			team_id:this.team_id,
		        			task_id:this.task_id,
		        			autonomy_task_id:this.autonomy_task_id,
		        			start_date:start_date,
		        			end_date:end_date
		        		},
		        		type:'POST',
		        		success:(res)=>{
	            			this.releaseshoworhide = false;
	            			this.switchcheck = true;
		        			if(res.errno == 0){
			    			    this.$message({
			    			      showClose: true,
			    			      message: '发布成功',
			    			      type: 'success'
			    			    });
			    			    this.page_no = 1;
			    			    this.getKqList()
		        			}else{
			    			    this.$message({
			    			      showClose: true,
			    			      message: res.errmsg,
			    			      type: 'warning'
			    			    });

		        			}
		        		},
		    			error: (xhr, status) => {
	            			this.switchcheck = true;
		    			  
		    			},
		    			noNetwork: () => {
		    			    // 网络超时
	            			this.switchcheck = true;
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
        //获取考勤时间
        getTaskList(){
        	util.ajax({
        		url:'/attendance/task_schedule',
        		data:{
        			project_id:this.project_id,
        			team_id:this.team_id,
        			task_id:this.task_id,
        		},
        		type:'POST',
        		success:(res)=>{
        			if(res.errno == 0){
        				this.workTimeList = res.data;
        			}else{
	    			    this.$message({
	    			      showClose: true,
	    			      message: res.errmsg,
	    			      type: 'warning'
	    			    });

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
        //获取考勤地点
        getAddrList(){
        	util.ajax({
        		url:'/attendance/attendance_task_position_list',
        		data:{
        			project_id:this.project_id,
        			team_id:this.team_id,
        			task_id:this.task_id,
        		},
        		type:'GET',
        		success:(res)=>{
        			if(res.errno == 0){
        				this.workAddrList = res.data;
        			}else{
	    			    this.$message({
	    			      showClose: true,
	    			      message: res.errmsg,
	    			      type: 'warning'
	    			    });

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
        pickerChange(){
        	this.page_no = 1;
      		this.choose_date = util.formatData1(this.pickerchoose_date);
      		this.getKqList()
        },
        getpeoplelist(row,ev,column){
        	if(column.label == '操作') return false;
        	var ygpbmemberdata = {
        		autonomy_task_id:row.autonomy_task_id,
        		choose_date:this.choose_date,
        		send_status:row.send_status
        	}
            util.setLocalStorage('ygpbmemberdata', ygpbmemberdata, 60*60*24)
            this.$router.replace('kqpbmemberlist')
        }
    },
	created(){
		this.init()
	},

}
</script>
<style>
	.kqeditygpb{
		padding: 0 20px;
	}
	.kqeditygpb .kqeditygpb_top{
	    height: 50px;
	    border-bottom: 1px solid #e0e6ed;
	}
	.kqeditygpb .search_select .from-item-list {
	    float: left;
	    margin-right: 13px;
	}
	.kqeditygpb .search_select .el-form-item__label {
	    padding: 11px 0;
	    float: left;
	    color: #5e6d82;
	    font-size: 12px;
	}
	.kqeditygpb .page_title{
		font-size: 16px;
		margin-bottom: 24px;
		color: #475669;
	}
	.kqeditygpb  .kqeditygpb_do{
		padding:24px 0 16px 0;
	}
	.kqeditygpb .btn-item {
	    color: #69e;
	    cursor: pointer;
	    float: right;
	}
	.kqeditygpb .add_icon{
		display: block;
		width: 13px;
		height: 13px;
		margin-right: 6px;
		float: left;
		margin-top: 10px;
		background-image:url(../assets/imgs/shareIcon/add_hover.svg);
	}
	.kqeditygpb  .el-tag--primary0{
		width: 52px;
		height: 24px;
		border-radius: 2px;
		background-color: rgba(247, 165, 0, 0.08);
		border: solid 1px #fde0a5;
		font-size: 12px;
		color: #f7a500;
	 }
	.kqeditygpb  .el-tag--primary1{
		width: 52px;
		height: 24px;
		border-radius: 2px;
		background-color: rgba(99, 180, 93, 0.07);
		border: solid 1px rgba(99, 180, 93, 0.35);
		color: #70cb6a;
		font-size: 12px;
	}
	.kqeditygpb .el-table th, .kqeditygpb .el-table td {
	    height: 36px;
	}
	.kqeditygpb  .el-table--border th,.kqeditygpb .el-table td,.kqeditygpb .el-table th.is-leaf {
	    border-right: 1px solid #e0e6ed;
	}
	.kqeditygpb .el-pagination button:hover{
	    color: #69e;
	}
	.kqeditygpb .ygpb_list .el-pagination button.disabled {
	    background-color: #eff2f7;
	    color: #d3dce6
	}
	.kqeditygpb .ygpb_operation .el-form-item {
	    margin-bottom: 0px;
	}
	.kqeditygpb .el-pagination{
	    text-align: right;
	    padding: 10px 0 0;
	}
	.kqeditygpb .page .el-pagination button, .el-pagination span {
	    font-size: 10px;
	    line-height: 28px;
	    min-width: 22px;
	  }
	  .el-form:after{
	  	content: '';
	  	display: block;
	  	clear: both;
	  }
	.kqeditygpb .ygpb_mask .el-dialog__body{
		margin-top:30px;
		padding-bottom: 14px;
	}
	.kqeditygpb .ygpb_mask .el-dialog--tiny{
		width: 420px;
	}
	.kqeditygpb .ygpb_mask .el-form-item__label{
		color: #475669;
	}
	.kqeditygpb .ygpb_mask .el-form-item{
		margin-bottom: 16px;
	}
	.kqeditygpb .ygpb_mask .el-form-item__label{
		padding: 11px 30px 11px 0;
	}
	.kqeditygpb .el-dialog__footer{
		border-top: 1px solid #e0e6ed;
		padding: 15px 20px;
	}
	.kqeditygpb .release_prompt{
		font-size: 13px;
		color: #99A9BF;
		margin: 0 0 16px 40px;
	}
	.kqeditygpb .operation_orw:after{
		display: block;
		content: '';
		clear: both;
	}
	.kqeditygpb .operation_orw div{
		position: relative;
		padding:0 8px; 
		float: left;
		font-size: 12px;
		color: #6699EE;
		cursor: pointer;
	}
	.kqeditygpb .operation_orw div:active {
	    color: #517ed6;
	}
	.kqeditygpb .operation_orw .operation_item:after{
		position: absolute;
		right: 0;
		top: 7px;
		display:block;
		content: '';
		width: 1px;
		height: 10px;
		background-color: #E0E6ED;
	}
	.kqeditygpb .el-form-item__error{
	    position: static;
		margin-bottom: -7px;
	}
	.kqeditygpb .releaseygpb .el-form-item__error{
		margin-left: 40px;
	}
	.kqeditygpb .el-form-item.is-required .el-form-item__label:before{
		content: '';
	}
	.kqeditygpb .el-table--border td{
	    border-right: 0;
	}
	.kqeditygpb .createygpb .el-scrollbar{
		width: 254px;
	}
	.kqeditygpb .el-table__row:hover {
	    background-color: #f7f7f9;
	    cursor: pointer;
	}

</style>