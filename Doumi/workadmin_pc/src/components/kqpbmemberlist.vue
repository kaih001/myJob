<template>
	<div class="kqpbmemberlist">
  		<div class="kqpbmemberlist_top">
  			<breadcrumb>
  			    <router-link to="kqaddmin" replace>考勤管理</router-link>
  			    <router-link to="kqtasklist">考勤规则管理</router-link>
  			    <router-link to="kqeditygpb">员工自主排班</router-link>
  			    <router-link to="" >人员列表</router-link>
  			</breadcrumb>
  		</div>
  		<div class="kqpbmemberlist_main">
  			<div class="kqpbmemberlist_do">
	  			<h2 class="page_title">人员列表</h2>
	  			<div class="ygpb_operation">
	  				<p>日期：{{choose_date}}</p>
					<div class="btn-item addMember" @click="addmerber" v-if="send_status == 1 && delMerSwitch">
						<i class="add_icon"></i>
						<el-button type="text">添加员工</el-button>
					</div>
	  			</div>
  			</div>
  			<div class="ygpb_list" v-loading="ygpbMerLoading">
                <el-table :data="ygpbList" border  style="width: 100%" :height="tableHeight" empty-text="暂无人员报名"  v-loading.body="false">
                    <el-table-column prop="user_name"  label="姓名" show-overflow-tooltip min-width="80"></el-table-column>
                    <el-table-column prop="apply_source" label="途径"  min-width="80"></el-table-column>
                    <el-table-column prop="attendance_time" label="工作时间" min-width="120"></el-table-column>
                    <el-table-column prop="position" label="工作地点" min-width="200" show-overflow-tooltip>
                    	<template slot-scope="scope">
                    		<span class="addressinfo">{{scope.row.position_name + '（' + scope.row.position + '）'}}</span>
                    	</template>
                    </el-table-column>
                    <el-table-column prop="status_no" label="操作" min-width="150" filter-placement="bottom-end">
                        <template slot-scope="scope">
                        	<div class="operation_orw">
	                            <div class="operation_item" @click="deleMember(scope.row.user_id,scope.row.attendance_time)" v-if="delMerSwitch">删除</div>
	                            <div class="operation_item" style="color:#5E6D82"  v-else>删除</div>
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
		<div class="export-dialog checkconfirm">
			<el-dialog
			title="提示"
			top="35%"
			:visible.sync="delemembermk"
			@close="delemembermk = false"
			size="tiny">
				<span style="font-size:14px;color:#5e6d82">删除人员后，该工作时间会减少1人，请慎重！</span>
				<span slot="footer" class="dialog-footer">
					<el-button @click="delemembermk = false" class="cancel">取 消</el-button>
					<el-button type="primary" @click="confirmdel"  class="confirm">确 定</el-button>
				</span>
			</el-dialog>
		</div>

        <select-member-group-multi
			title="人员范围"
			ref="profile"
			:all-groups="all_groups"
			:selected-members-groups="selected_members_groups"
			:disabled-groups="true"
			v-on:confirmGroupSelecter="confirmGroupSelecter"
        ></select-member-group-multi>
	</div>
</template>
<script>

	import * as util from '../assets/js/util.js'
import breadcrumb from '@/components/common/breadcrumb';
import SelectMemberGroupMulti from '@/components/common/SelectMemberGroupMulti'
export default{
  	name: 'kqeditygpb',
  	components:{
        breadcrumb,
	    SelectMemberGroupMulti
    },
	watch: {
		'$route' (form,to) {
        	if(form.name == 'Project') return;
			this.$router.replace('kqtasklist')
		},
	},
    data(){
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
    		tableHeight:0,//table高度
    		choose_date:'',
    		ygpbMerLoading:true,
    		delemembermk:false,
    		addrlist:[{value:1,label:2}],
    		pbtime:'',
    		addr_select:'',
    		page_size:20,
    		total:0,
    		ruleForm:{kqDateDay:'',},
    		page_no:1,
    		send_status:1,
    		ygpbList:[],
    		createygpb:{addr:'',number:'',time:''},
    		rules:{ 
    			time:[
                    { validator: testStartTime, trigger: 'change',required: true }
                ]
            },
            AddrList:[{user_id:1,real_name:'sdfdf'}],
            all_groups:[],
            delMerSwitch:false,
	        selected_members_groups:[], 
    	}
    },
    methods:{
    	init(){
	       	this.team_id = util.getLocalStorage('projectStorageInfo').team_id
        	this.project_id = util.getLocalStorage('projectStorageInfo').project_id
        	this.autonomy_task_id = util.getLocalStorage('ygpbmemberdata').autonomy_task_id
        	this.choose_date = util.getLocalStorage('ygpbmemberdata').choose_date
        	this.send_status = util.getLocalStorage('ygpbmemberdata').send_status
        	this.delMerSwitch = (new Date(this.choose_date)).getTime() < new Date(new Date().setHours(0, 0, 0, 0)) ? false : true;
    		this.getTableHeight();
            this.getpeopleList()
        	//获取人员小组列表数据
    	},
    	getpeopleList(){
    		this.ygpbMerLoading = true;
	    	util.ajax({
	    		url:'/attendance/attendance_task_autonomy_user_list',
	    		data:{
	    			project_id:this.project_id,
	    			team_id:this.team_id,
	    			choose_date:this.choose_date,
	    			autonomy_task_id:this.autonomy_task_id,
	    			page:this.page_no,
	    			page_size:20
	    		},
	    		type:'POST',
	    		success:(res)=>{
    				this.ygpbMerLoading = false;
	    			this.releaseshoworhide = false;
	    			this.switchcheck = true;
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
    				this.ygpbMerLoading = false;
	    			this.switchcheck = true;
				  
				},
				noNetwork: () => {
				    // 网络超时
    				this.ygpbMerLoading = false;
	    			this.switchcheck = true;
				    this.$message({
				      showClose: true,
				      message: '网络连接失败，请检查网络',
				      type: 'warning'
				    });
				}
	    	})

    	},
        handleSizeChange(){
            this.getpeopleList()
        },
        getTableHeight(){
            this.tableHeight =  window.innerHeight - 245;
        },
        resetForm(formName) {
          this.$refs[formName].resetFields();
          this.createdialogVisible = false
        },
        deleMember(id,work_time){
        	this.user_id = id;
        	this.attendance_time = work_time;
        	this.delemembermk = true;
        },
        confirmdel(){
          if(!this.switchcheck)return;
          this.switchcheck = false;
          util.ajax({
            url: '/attendance/attendance_task_autonomy_user_del',
            type:'GET',
            data: {
	            user_id:this.user_id,
	            choose_date: this.choose_date,
	            autonomy_task_id: this.autonomy_task_id,
	            project_id: this.project_id,
	            team_id:this.team_id,
	            attendance_time:this.attendance_time
            },
            timeout:10000,
            success: (res) => {
          		this.switchcheck = true;
                if(res&&res.errno==0){
        			this.delemembermk = false;
	                this.$message({
	                  showClose: true,
	                  message: '删除成功',
	                  type: 'success'
	                });
            		this.getpeopleList()
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
        		this.delemembermk = false;
              
            },
            noNetwork: () => {
                // 网络超时
          		this.switchcheck = true;
        		this.delemembermk = false;
                this.$message({
                  showClose: true,
                  message: '网络连接失败，请检查网络',
                  type: 'warning'
                });
            }
          });
        },
        addmerber(){
            this.getMemberGroup();
        },
        getMemberGroup(){
          util.ajax({
            url: '/attendance/attendance_task_autonomy_add_user_list',
            type:'GET',
            data: {
              choose_date: this.choose_date,
              team_id: this.team_id,
              project_id: this.project_id,
              autonomy_task_id:this.autonomy_task_id
            },
            timeout:10000,
            success: (res) => {
                if(res&&res.errno==0){
                    this.all_groups = res.data;
            		this.$refs.profile.openGroupSelecter();
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
        //---点击确定后执行的函数
        confirmGroupSelecter(val){
          if(!this.switchcheck)return;
          this.switchcheck = false;
          //this.addPerLoading = true;
          //this.clearFilterText()
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
          let dif = '';
          //console.log(JSON.stringify(newPeronnelList))
          //this.selected_groups = this.origin_selected_groups
          for(let m = 0,th = newPeronnelList.length;m < th;m++){
            for(let t = 0,ng = this.ygpbList.length;t < ng;t++){
              if(newPeronnelList[m].user_id == this.ygpbList[t].user_id) {
                dif += newPeronnelList[m].user_id + ',';
                break;
              }
            }
          }
          let newDif = [],
          	groupAr = [];
          for(let q = 0,tn = newPeronnelList.length;q < tn;q++){
            if(dif.indexOf(newPeronnelList[q].user_id) == -1){
              newDif.push(newPeronnelList[q].user_id)
            }
            // if(groupAr.indexOf(newPeronnelList[q].group_id) == -1){
            // 	groupAr.push(newPeronnelList[q].group_id)
            // 	console.log(newPeronnelList[q].group_id)
            // }
          }
          if(newDif.length === 0){
            this.switchcheck = true;
            return;
          };
	    	util.ajax({
	    		url:'/attendance/attendance_task_autonomy_add_user',
	    		data:{
	    			project_id:this.project_id,
	    			team_id:this.team_id,
	    			autonomy_task_id:this.autonomy_task_id,
	    			participant_user:newDif,
	    			choose_date:this.choose_date
	    		},
	    		type:'POST',
	    		success:(res)=>{
	    			this.releaseshoworhide = false;
	    			this.switchcheck = true;
	    			if(res.errno == 0){
	    			    this.$message({
	    			      showClose: true,
	    			      message: '添加人员成功',
	    			      type: 'success'
	    			    });
	    				this.page_no = 1;
            			this.getpeopleList()
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
        },
    },
	created(){
		this.init()
	},

}
</script>
<style>
	.kqpbmemberlist{
		padding: 0 20px;
	}
	.kqpbmemberlist .kqpbmemberlist_top{
	    height: 50px;
	    border-bottom: 1px solid #e0e6ed;
	}
	.kqpbmemberlist .page_title{
		font-size: 16px;
		margin-bottom: 24px;
		color: #475669;
	}
	.kqpbmemberlist  .kqpbmemberlist_do{
		padding:24px 0 16px 0;
	}
	.kqpbmemberlist .btn-item {
	    color: #69e;
	    cursor: pointer;
	    float: right;
	}
	.kqpbmemberlist .add_icon{
		display: block;
		width: 13px;
		height: 13px;
		margin-right: 6px;
		float: left;
		margin-top: 10px;
		background-image:url(../assets/imgs/shareIcon/add_hover.svg);
	}
	.kqpbmemberlist .el-table th, .kqeditygpb .el-table td {
	    height: 36px;
	}
	.kqpbmemberlist .el-table__row:hover{background-color: #f7f7f9;cursor: pointer;}
	.kqpbmemberlist  .el-table--border th,.kqeditygpb .el-table th.is-leaf {
	    border-right: 1px solid #e0e6ed;
	}
	.kqpbmemberlist .el-pagination button:hover{
	    color: #69e;
	}
	.kqpbmemberlist .ygpb_list .el-pagination button.disabled {
	    background-color: #eff2f7;
	    color: #d3dce6
	}
	.kqpbmemberlist .ygpb_operation:after{
		display:block;
		content: '';
		clear: both;
	}
	.kqpbmemberlist .ygpb_operation p {
	    float: left;
	    font-size: 14px;
		color: #1F2D3D;
	}
	.kqpbmemberlist .btn-item{
	    color: #69e;
	    cursor: pointer;
	    float: right;
	}
    .kqpbmemberlist .add_icon{
		display: block;
		width: 13px;
		height: 13px;
		margin-right: 6px;
		float: left;
		margin-top: 10px;
		background-image:url(../assets/imgs/shareIcon/add_hover.svg);
	}
	.kqpbmemberlist .el-pagination{
	    text-align: right;
	    padding: 10px 0 0;
	}
	.kqpbmemberlist .page .el-pagination button, .el-pagination span {
	    font-size: 10px;
	    line-height: 28px;
	    min-width: 22px;
	  }
	 .kqpbmemberlist .el-form:after{
	  	content: '';
	  	display: block;
	  	clear: both;
	  }
	.kqpbmemberlist .ygpb_mask .el-dialog__body{
		margin-top:30px;
		padding-bottom: 14px;
	}
	.kqpbmemberlist .ygpb_mask .el-form-item__label{
		color: #475669;
	}
	.kqpbmemberlist .ygpb_mask .el-form-item{
		margin-bottom: 16px;
	}
	.kqpbmemberlist .ygpb_mask .el-form-item__label{
		padding: 11px 30px 11px 0;
	}
	.kqpbmemberlist .el-dialog__footer{
		border-top: 1px solid #e0e6ed;
		padding: 15px 20px;
	}
	.kqpbmemberlist .release_prompt{
		font-size: 13px;
		color: #99A9BF;
		margin: 0 0 16px 40px;
	}
	.operation_orw:after{
		display: block;
		content: '';
		clear: both;
	}
	.operation_orw div{
		position: relative;
		padding:0 8px; 
		float: left;
		font-size: 12px;
		color: #6699EE;
		cursor: pointer;
	}
	.operation_orw div:active {
	    color: #517ed6;
	}
	.kqpbmemberlist .checkconfirm .el-dialog--tiny{
	  width: 400px;
	}
	.kqpbmemberlist .checkconfirm .el-dialog__header{
	    padding: 24px 20px 0;
	}
	.kqpbmemberlist .checkconfirm  .el-dialog__body{
	  padding: 30px 40px;
	}
	.alertjected .el-dialog__body{
	  border-bottom:1px solid #e0e6ed
	  
	}
	.kqpbmemberlist .checkconfirm .el-form-item__content{
	  width: 246px;
	}
	.kqpbmemberlist .checkconfirm  .el-form-item{
	  margin-bottom: 0;
	}
	.kqpbmemberlist .checkconfirm  .el-dialog__footer{
	  padding: 16px 20px;
	}
	.kqpbmemberlist .checkconfirm .el-dialog__footer{
		border:none;
	}

	.kqpbmemberlist .el-table--border td{
	    border-right: 0;
	}
</style>