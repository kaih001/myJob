<template>
	<div class="KqeditRanKing">
  		<div class="KqeditRanKing_top">
  			<breadcrumb>
  			    <router-link to="kqaddmin" replace>考勤管理</router-link>
  			    <router-link to="">编辑排行规则</router-link>
  			</breadcrumb>
  		</div>
  		<div class="KqeditRanKing_main">
  			<div class="KqeditRanKing_title">
  				<h2>编辑排行规则</h2>
  			</div>
  			<el-form :model="setRankData" >
  			  	<el-form-item prop="">
  			  		<p class="forme_lableText forme_lableText_bef">是否开启考勤排行榜</p>	
					<el-radio class="radio" v-model="setRankData.attendance_rank_status" :label="'1'">开启</el-radio>
					<el-radio class="radio" v-model="setRankData.attendance_rank_status" :label="'0'">关闭</el-radio>
				</el-form-item>
        <template v-if="setRankData.attendance_rank_status == 1">
    			<el-form-item  prop="">
    			  <p class="forme_lableText forme_lableText_bef">异常出勤（迟到、早退、地点异常、工时短缺）是否也计入出勤数量</p>
  					<el-radio class="radio" v-model="setRankData.abnormal_attendance" :label="'1'">是</el-radio>
  					<el-radio class="radio" v-model="setRankData.abnormal_attendance" :label="'0'">否</el-radio>
  				</el-form-item>
    			  <el-form-item  prop="">
    			  	<p class="forme_lableText forme_lableText_bef">设置榜单统计周期</p>
  					<el-radio class="radio" v-model="setRankData.attendance_rank_cycle" :label="'2'">周</el-radio>
  					<el-radio class="radio" v-model="setRankData.attendance_rank_cycle" :label="'1'">月</el-radio>
  				</el-form-item>
  		  	<el-form-item  prop="" class="setRanklast-el-form-item">
  		  		<p class="forme_lableText ">设置榜单激励奖金,多条激励，奖金叠加</p>
  		  		<div class="kqeditRank_main">
  		  			<div class="kqeditRank_list"  v-for=" (item,index) in setRankData.rule_list">
  		  				<div class="kqeditRank_day">
  		  					<span>考勤满</span>
  		  					<el-input placeholder="请输入" type="number" style="width: 70px;height:36px;"  v-model="item.delta_time" @blur="timeChange($event,index)"></el-input>
  		  					<span>天</span>
  		  				</div>
  		  				<div  class="kqeditRank_money">
  		  					<span>奖励</span>
  		  					<el-input placeholder="请输入" type="number" style="width: 70px;height:36px;" v-model="item.reward_amount"  @blur="amountChange($event,index)"></el-input>
  		  					<span>元</span>
  		  				</div>
  		  				<div  class="kqeditRank_operation">
  		  					<i class="add" @click="addRankList"></i>
  		  					<i class="del" @click="delRankList(index)" v-if="setRankData.rule_list.length > 1"></i>
  		  				</div>
  		  			</div>
  		  		</div>
  				</el-form-item>
        </template>
  			<el-form-item label="" prop="" style="margin-bottom:67px;">
					<el-button type="primary" @click="validateKqSet">保存</el-button>
				</el-form-item>
			</el-form>
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
    	return{
    		setRankData:{
				attendance_rank_status:'1',
				abnormal_attendance:'1',
				attendance_rank_cycle:'2',
	    		rule_list:[
	    			{
	    				id:'',
	    				delta_time:'',
	    				reward_amount:''

	    			}
	    		],
    		},
        checkSwitch:true,
			rules: {
				name: [
				],
			}
    	}
    },
    methods:{
    	init(){
      		this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      		this.project_id = util.getLocalStorage('projectStorageInfo').project_id;
      		this.getKqSetRank()

    	},
    	getKqSetRank(){
        	util.ajax({
        		url:'/reward/reward_rule/get',
        		data:{
        			project_id:this.project_id,
        			team_id:this.team_id,
        		},
        		type:'GET',
        		success:(res)=>{
        			if(res.errno == 0){
        				this.setRankData = res.data;
        				this.setRankData.rule_list = res.data.rule_list.length == 0 ? [{id:'',delta_time:'',reward_amount:''}] : res.data.rule_list;
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
    	validateKqSet(){
        this.dableSw = true;
        if(!this.dableSw) return;
        if(!this.checkSwitch){
          this.checkSwitch = true
          return;
        } 
        this.dableSw = false;
        	util.ajax({
        		url:'/reward/reward_rule/update',
        		data:{
        			project_id:this.project_id,
        			team_id:this.team_id,
        			attendance_rank_status:this.setRankData.attendance_rank_status,
        			attendance_rank_cycle:this.setRankData.attendance_rank_cycle,
        			abnormal_attendance:this.setRankData.abnormal_attendance,
        			reward_rule:this.setRankData.rule_list
        		},
        		type:'GET',
        		success:(res)=>{
              this.dableSw = true;
        			if(res.errno == 0){
	    			    this.$message({
	    			      showClose: true,
	    			      message: '修改成功',
	    			      type: 'success'
	    			    });
            			this.$router.replace('Kqaddmin')
        			}else{
	    			    this.$message({
	    			      showClose: true,
	    			      message: res.errmsg,
	    			      type: 'warning'
	    			    });

        			}
        		},
    			error: (xhr, status) => {
              this.dableSw = true;
              this.$message({
                showClose: true,
                message: '提交失败',
                type: 'warning'
              });
    			},
    			noNetwork: () => {
    			    // 网络超时
              this.dableSw = true;
    			    this.$message({
    			      showClose: true,
    			      message: '网络连接失败，请检查网络',
    			      type: 'warning'
    			    });
    			}
        	})
    	},
    	addRankList(){
    		if(this.setRankData.rule_list.length === 10){
			    this.$message({
			      showClose: true,
			      message: '奖励规则最多10条',
			      type: 'warning'
			    });
			    return;
    		}
    		this.setRankData.rule_list.push({id:'',delta_time:'',reward_amount:''})
    	},
    	delRankList(index){
    		if(this.setRankData.rule_list.length === 1)return
    		this.setRankData.rule_list.splice(index,1)
    	},
    	amountChange(ev,index){
        this.checkSwitch = true;
        if(ev.target.value == ''){
          this.setRankData.rule_list[index].reward_amount = ev.target.value = '';
          this.checkSwitch = false;
        }
    		let re = /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/,
    			val = +ev.target.value;
    		if(val == '') return;
    		if(!re.test(val) && val){
			    this.$message({
			      showClose: true,
			      message: '请输入正确的金额',
			      type: 'warning'
			    });
  				this.setRankData.rule_list[index].reward_amount = ev.target.value = '';
          this.checkSwitch = false;
    		}else{
				  this.setRankData.rule_list[index].reward_amount = ev.target.value = +val.toFixed(2)
    		}

    	},
    	timeChange(ev,index){
        this.checkSwitch = true;
    		let re =  /^[+]{0,1}(\d+)$/,
    			val = ev.target.value;
        if(ev.target.value === ''){
          this.setRankData.rule_list[index].delta_time = ev.target.value = ''
          this.checkSwitch = false;
        }
    		if(!re.test(val) && val){
			    this.$message({
			      showClose: true,
			      message: '考勤满天数应为正整数',
			      type: 'warning'
			    });
			    this.setRankData.rule_list[index].delta_time = ev.target.value = ''
          this.checkSwitch = false;
    		}
        if(this.setRankData.attendance_rank_cycle == 1){
  				if(val > 31){
				    this.$message({
				      showClose: true,
				      message: '不能超过考勤周期的最长天数',
				      type: 'warning'
				    });
				    this.setRankData.rule_list[index].delta_time = ev.target.value = '';
            this.checkSwitch = false;
  				}
        }else{
      		if(val > 7){
  			    this.$message({
  			      showClose: true,
  			      message: '不能超过考勤周期的最长天数',
  			      type: 'warning'
  			    });
  			    this.setRankData.rule_list[index].delta_time =  ev.target.value=  '';
            this.checkSwitch = false;
      		}
        }

    	},

    },
	created(){
		this.init()
	},

}
</script>
<style type="text/css">
	.KqeditRanKing input::-webkit-outer-spin-button,
	.KqeditRanKing input::-webkit-inner-spin-button {
	    -webkit-appearance: none !important;
	    margin: 0;
	}
	.KqeditRanKing .KqeditRanKing_main .KqeditRanKing_title h2{
		line-height:70px;
		font-size: 16px;
		font-weight: 500;
		font-style: normal;
		color: #475568;
	}
	.KqeditRanKing{
		padding: 0 20px;
	}
	.KqeditRanKing .KqeditRanKing_top{
	    height: 50px;
	    border-bottom: 1px solid #e0e6ed;
	}
	p.forme_lableText {
	    font-size: 14px;
	    color: #5E6D82;
	    letter-spacing: 0;
	    line-height: 14px;
     	margin-bottom: 5px;
	}
	.kqeditRank_list>div{
		float: left;
	}
	.kqeditRank_list:after{
		display: block;
		content: '';
		clear: both;
	}
	.KqeditRanKing .kqeditRank_main {
	    margin-top: 20px;
	}
	.KqeditRanKing .kqeditRank_list {
	    margin-bottom: 24px;
	}
	.KqeditRanKing .el-form-item{
		margin-bottom: 42px;
	}
	.KqeditRanKing .setRanklast-el-form-item{
		margin-bottom: 8px;
	}
	.KqeditRanKing .el-form{
		padding-left: 31px;
	}
	.KqeditRanKing .kqeditRank_list span{
		font-size: 14px;
		color: #1F2D3D;
	}
	.KqeditRanKing .kqeditRank_day,.KqeditRanKing .kqeditRank_money{
		margin-right: 24px;
	}
	.kqeditRank_list .el-input{
		margin: 0 8px 0 12px;
	}
	.kqeditRank_operation .add{
	    display: inline-block;
	    width: 16px;
	    height: 16px;
	    margin-right: 3px;
	    background-image:url(../assets/imgs/shareIcon/add_hover.svg);    
	    background-repeat: no-repeat;
     	background-size: 100%;
	    vertical-align: middle;
	    cursor: pointer;
	}
	.kqeditRank_operation .add:hover{
	    background-image:url(../assets/imgs/shareIcon/add_hover.svg);    
	}
	.kqeditRank_operation .del{
	    display: inline-block;
	    width: 16px;
	    height: 16px;
	    margin-left: 13px;
		background:url(../assets/imgs/delate_hover.svg) no-repeat right center;
     	background-size: 100%;
	    vertical-align: middle;
	    cursor: pointer;
	}

  .KqeditRanKing_main .forme_lableText_bef:before{
    content: '';
    display: block;
    width: 7px;
    height: 7px;
    background: url(../assets/imgs/x_icon.svg) no-repeat center left;
    color: #ffaa00;
    position: absolute;    
    left: -24px;
    top: 3px;
  }
  .KqeditRanKing_main .el-radio__label{
    padding-left:10px;
  }
  .KqeditRanKing_main .el-radio+.el-radio{
    margin-left: 40px;
  }
</style>