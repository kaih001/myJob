<template>
	<div class="projectset">
  	<div class="header-title">
  	  <h2>项目设置</h2>
  	</div>
  	<div class="project_main">
  		<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="117px">
				<el-form-item label="项目名称" prop="name">
			  	<el-input v-model="ruleForm.name" placeholder='请输入' style="width:360px;"></el-input>
				</el-form-item>
				<el-form-item label="开始日期" prop="start_date">
			    <el-date-picker 
						disabled
		        v-model="ruleForm.start_date"
		        type="date"
		        placeholder="选择日期"
		        style="width: 100%;"
		        :editable="false"
		        :picker-options="startPickerOptions">
			    </el-date-picker>
				</el-form-item>
				<el-form-item label="结束日期" prop="end_date">
			    <el-date-picker 
		        v-model="ruleForm.end_date"
		        type="date"
		        placeholder="选择日期"
		        style="width: 100%;"
		        :editable="false"
		        :picker-options="endPickerOptions">
			    </el-date-picker>
				</el-form-item>
				<el-form-item label="项目归属" prop="teamAscription">
			    <el-select v-model="ruleForm.teamAscription" style="width:100%;" class="mystatus" disabled>
		        <template v-for="team in ruleForm.teamArr">
		          <el-option :label="team.team_name" :key="team.team_id" :value="team.team_id"></el-option>
		        </template>
			    </el-select>
				</el-form-item>
				<el-form-item label="城市选择" prop="city_id">
			    <el-select v-model="ruleForm.city_id" filterable placeholder="请选择" style="width:100%;">
			      <template v-for="item in ruleForm.addressArr">
		          <el-option :label="item.short_name" :key="item.city_id" :value="item.city_id"></el-option>
			      </template>
			    </el-select>
				</el-form-item>
				<el-form-item label="项目类型" prop="type">
			    <el-select v-model="ruleForm.type" placeholder="请选择项目类型" style="width:100%;" class="mystatus" disabled>
		        <template v-for="item in ruleForm.typeArr">
            	<el-option :label="item.name" :key="item.id" :value="item.id"></el-option>
		        </template>
			    </el-select>
				</el-form-item>
				<el-form-item label="合作企业" prop="relate_team_id" style="margin-bottom:30px;">
			    <el-select :popper-class="showResult?'dbl_type':'dbl_type hide'" clearable filterable remote :remote-method="inputFn" @change="changeFn" v-model="ruleForm.relate_team_id" placeholder="通过企业负责人手机号搜索企业" style="width:100%;" class="mystatus" :no-data-text="noDataText" :loading="!searchEnd" :disabled="ruleForm.relate_team_can_edit == 0">
		        <template v-for="item in ruleForm.relate_team_arr">
	            <el-option :label="item.team_name" :key="item.team_id" :value="item.team_id">
	              <p class='p1'>{{item.team_name}}</p>
	              <p class='p2'>负责人：{{item.name}}（{{item.mobile}}）</p>
	            </el-option>
		        </template>
			    </el-select>
				</el-form-item>
  			<el-form-item label="" prop="" style="margin-bottom:67px;">
					<el-button type="primary" @click="validateProjectSet">保 存</el-button>
				</el-form-item>
  		</el-form>
  	</div>
	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

export default {
	name: 'ProjectSet',
	data () {
		var checkName = (rule, value, callback) => {
			if(!value){
				callback(new Error('请输入项目名称'))
			}else if(value.length>20){
				callback(new Error('项目名称不能超过20字'))
			}else{
				callback()
			}
		}
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
				let _time = util.formatData(this.ruleForm.start_date,value) 
				// 获取今天的日期
				var date = new Date();
				var seperator1 = "-";
				var month = date.getMonth() + 1;
				var strDate = date.getDate();
				if (month >= 1 && month <= 9) {
						month = "0" + month;
				}
				if (strDate >= 0 && strDate <= 9) {
						strDate = "0" + strDate;
				}
    		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        /*计算开始时间-结束时间的总天数*/
        var sumDays = util.DateDiff(currentdate,_time.e)
        // console.log(_time)
	    }
	    if (!value) {
	      return callback(new Error('请选择结束日期'));
	    }else if(value < this.ruleForm.start_date){
	      return callback(new Error('结束时间不能小于开始时间'));
	    }else if(sumDays > 366){
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
		var testAddress = (rule,value,callback) => {
	    if (!value) {
	      return callback(new Error('请选择项目城市'));
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
		var testRelate_team_id = (rule,value,callback) => {
	    // console.log(this.team_id)
	    // console.log(value)
	    if (this.team_id == value) {
	      return callback(new Error('不能选择当前所在企业'));
	    }else{
	      callback();
	    }
		};
  	return {
  		team_id: 0,
  		project_id: 0,
    	ruleForm: {
    		name: '',
    		start_date: util.getStampFromDateStr(new Date()),
    		end_date: '',
    		teamAscription: '',
    		teamArr: [],//企业列表
    		city_name:'',
    		city_id: '',
    		addressArr:[], //所有地区城市选项列表
    		type: '',// 项目类型
    		typeArr: [],
        relate_team_id: '',//合作企业
        relate_team_arr: [
        	// {
        	// 	"team_id": "789",
        	// 	"team_name": "测试公司123",
        	// 	"mobile": "15010078636",
        	// 	"name": "liujiaqi"
        	// }
        ],
        relate_team_can_edit: 1,
    	},
    	rules: {
    		name: [
    			{ validator: checkName, required: true, trigger: 'blur' },
    		],
    		start_date: [
    			{ validator: testStartTime, required: true, trigger: 'change' },
    		],
    		end_date: [
    			{ validator: testEndTime, required: true, trigger: 'change' },
    		],
    		teamAscription: [
    			{ validator: testAscriptionTime, required: true, trigger: 'change' },
    		],
    		city_id: [
    			{ validator: testAddress, required: true, trigger: 'change' },
    		],
    		type: [
    			{ validator: testTypeTime, required: true, trigger: 'change' },
    		],
    		relate_team_id: [
    			{ validator: testRelate_team_id },
    		],
    	},
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
    	searchEnd: true,
    	showResult: false,
    	noDataText: '您查找的企业不存在',
  	}
	},
	methods: {
  	init() {
  		this.team_id = util.getLocalStorage('projectStorageInfo').team_id
  		this.project_id = util.getLocalStorage('projectStorageInfo').project_id
    	this.getProjectInfo()
    	// this.getUserTeam()
    	this.getAddressData()
			// this.getProjectType()
		},
  	getProjectInfo() {
  		this.ruleForm.relate_team_id = ''
			util.ajax({
				url: '/project/info/get',
				type:'GET',
				data: {
					team_id: this.team_id,
					project_id: this.project_id
				},
				success: (res) => {
					console.log('获取项目设置')
					console.log(res)
					if(res&&res.errno==0){
						this.ruleForm.name = res.data.name
						this.ruleForm.start_date = new Date(util.getStampFromDate(res.data.start_date))
						this.ruleForm.end_date = new Date(util.getStampFromDate(res.data.end_date))
						this.ruleForm.teamAscription = res.data.team_name
						this.ruleForm.city_name = res.data.city_name
						this.ruleForm.city_id = res.data.city_id
						this.ruleForm.type = res.data.project_name
						this.ruleForm.relate_team_can_edit = res.data.relate_team_can_edit

						if(res.data.relate_team_id != 0){
							this.ruleForm.relate_team_arr = [{
			      		"team_id": res.data.relate_team_id,
			      		"team_name": res.data.relate_team_name,
			      		"mobile": '',
			      		"name": ""
			      	}]
			      	setTimeout(() => {
								this.ruleForm.relate_team_id = res.data.relate_team_id
							},0)
						}

						// {
						// 	name: '',
						// 	start_date: util.getStampFromDateStr(new Date()),
						// 	end_date: '',
						// 	teamAscription: '',
						// 	teamArr: [],//企业列表
						// 	address:'',
						// 	addressArr:[], //所有地区城市选项列表
						// 	type: '',// 项目类型
						// 	typeArr: [],
					 //    relate_team_id: '',//合作企业
						// },
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
          console.log('获取项目归属列表')
          console.log(obj)
          if(obj && obj.errno == 0){
            this.ruleForm.teamArr = obj.data
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
              this.ruleForm.relate_team_arr = [result.data]
              // this.ruleForm.relate_team_arr[0].team_name = result.data.team_name ? result.data.team_name : '未知企业'
              // this.ruleForm.relate_team_arr = [
              //   {
              //     "team_id": "123",
              //     "team_name": "测试公司",
              //     "mobile": "15010078636",
              //     "name": "liujiaqi"
              //   }
              // ]
            }else if(result.errno == 12017){
              this.ruleForm.relate_team_arr = []
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
  	    this.ruleForm.relate_team_arr = []
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
  	validateProjectSet(){
  		this.$refs['ruleForm'].validate((valid) => {
				if (valid) {
					// alert('submit!');
					this.saveProjectSetFn()
				} else {
					console.log('error submit!!');
					return false;
				}
			});
  	},
  	saveProjectSetFn(){
  		let ajaxData = {
  			team_id : this.team_id,
  			project_id : this.project_id,
  			name : this.ruleForm.name,
  			start_date : util.getLocalTime(new Date(this.ruleForm.start_date).getTime(), 'yyyy-MM-dd'),
  			end_date : util.getLocalTime(new Date(this.ruleForm.end_date).getTime(), 'yyyy-MM-dd'),
  			city_id : this.ruleForm.city_id,
  		}
  		this.ruleForm.addressArr.forEach((obj) => {
  			if(obj.city_id == this.ruleForm.city_id){
  				ajaxData.city_name = this.ruleForm.city_name = obj.short_name
  			}
  		})
  		if(this.ruleForm.relate_team_can_edit == 1){//只有可修改合作企业时才传relate_team_id
  			ajaxData.relate_team_id = this.ruleForm.relate_team_id
  		}
  		// console.log(ajaxData)
  		// return
	    util.ajax({
	      url:'/project/info/update',
	      type:'POST',
	      data: ajaxData,
	      timeout:10000,
	      success:(obj) => {
	        if(obj && obj.errno == 0){
	        	let info = util.getLocalStorage('projectStorageInfo')
	        	info.name = this.ruleForm.name
	        	util.setLocalStorage('projectStorageInfo', info)
	          this.$message({
	            showClose: true,
	            message: '保存成功',
	            type: 'success'
	          });
	          setTimeout(() => {
	        		window.location.reload()
	          },1000)
	        }else{
	        	this.$message({
	        	  showClose: true,
	        	  message: obj.errmsg,
	        	  type: 'warning'
	        	});
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
  	}
	},
	mounted() {
  	this.init()
	},
	watch: {
	  '$route' (to, from) {
	    // 对路由变化作出响应...
      this.init()
	  }
	}
}
</script>

<style>
.projectset .project_main .el-form-item__content{
	width: 360px;
}
.projectset .project_main .el-radio__label{
	padding-left: 10px;
}
.projectset .project_main .el-form-item{
	margin-bottom: 30px;
}
.projectset .project_main .el-form-item .el-form-item__label{
	text-align: left;
	text-indent: 23px;
}
.projectset .project_main .el-form-item.is-required .el-form-item__label{
	position: relative;
}
.projectset .project_main .el-form-item.is-required .el-form-item__label:before{
	content: "";
	color: #ffaa00;
	/*margin-right: 8px;*/
	display: block;
	width: 7px;
	height: 7px;
	background: url(../assets/imgs/x_icon.svg) no-repeat center left;
	color: #ffaa00;
	position: absolute;
	left: 0px;
	top: 14px;
}

/*合作企业 下拉框样式*/
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
<style scoped>
.projectset{
	padding: 0 20px;
}
.projectset .header-title{
    padding:16px 0;
    overflow: hidden;
    border-bottom: 1px solid #e0e6ed;
}
.projectset .header-title h2{
    font-size: 16px;
    font-weight: 700;
    text-align: left;
    color: #475568;
    line-height: 1.4;
}
.projectset .project_main{
	padding-top: 30px;
}
</style>
