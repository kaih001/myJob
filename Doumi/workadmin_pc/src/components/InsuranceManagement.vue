<template>
	<div class="insuranceM">
  		<div class="kqtask_top">
            <breadcrumb>
                <router-link to="insuranceMer" replace>用工保险</router-link>
                <router-link to="">保险人员管理</router-link>
            </breadcrumb>
  		</div>
  		<div class="insurance_tab">
  			<ul>
  				<li class="insurance_lifirst" @click="tabclick(1,$event)" :class="{'active':tabactive}">{{'在保(' + normalNum + ')'}}</li>
  				<li @click="tabclick(2,$event)" :class="{'active':!tabactive}">{{'已失效('+ invalidNum +')'}}</li>
  			</ul>
  			<i class="tab_btnline" :style="{'width':tabbtnwidth + 'px',left:tabbtnleft+'px'}"></i>
  		</div>
		<el-form label-width="55px" class="insuranceoparation">
			<div class="from-item-list from-item-list1">
			  <el-form-item label="操作：" style="margin-bottom: 16px;" v-show="tabactive">
			      <el-button  type="primary" :disabled="onmember" class="move-btn disabled" @click="ckedittime">修改投保日期</el-button>
			      <el-button  type="primary" :disabled="onmember" class="sign-btn default" @click="cksetfail">置为失效</el-button>	
			  </el-form-item>
			  <el-form-item label="操作：" style="margin-bottom: 16px;" v-show="!tabactive">
			      <el-button  type="primary" :disabled="offmember" class="move-btn disabled" @click="againset">重新投保</el-button>
			      <el-button  type="primary" :disabled="offmember"  class="sign-btn default" @click="delset">删除</el-button>	
			  </el-form-item>
			</div>
			<div class="from-item-list from-item-list2">
				<el-form-item label="人员：">
					<el-autocomplete
					popper-class="insuranceMsearch"
					style="width:135px;"
                    v-model="memberS"
                    :fetch-suggestions="querySearch"
                    custom-item="my-item-zh"
                    :trigger-on-focus="false"
                    placeholder="姓名/手机号"
                    @select="handleSelect">
					</el-autocomplete>
					<el-button type="primary" @click="seachMember" class="seach-btn">搜 索</el-button>
				</el-form-item>
			</div>
		</el-form>
		<!-- 人员 -->
		<div>
			<div class="from-member">
				<el-table 
                :height="tableHeight"
				tooltip-effect="dark" 
				empty-text="暂无数据"
				style="width: 100%" 
				border
				:data="insuranceDataList"
				v-loading="loading"
				@selection-change="handleSelectionChange">
					<el-table-column
					  type="selection"
					  className="noclick"
					  width="50">
					</el-table-column>
					<el-table-column
					  label="头像/姓名"
					  show-overflow-tooltip
					  label-class-name="border"
					  width="130">
					  <template slot-scope="scope">
					      <span class="user-name">
					        <img v-if="scope.row.logo.thumb_url" :src="scope.row.logo.thumb_url" class="user-img" alt="">
					        <img v-else src="../assets/imgs/shareIcon/default_img.png" class="user-img" alt="">
					        {{scope.row.name}}
					      </span>
					  </template>
					</el-table-column>
					<el-table-column
					  label="手机号"
					  label-class-name="border"
					  show-overflow-tooltip
					  prop="mobile"
					  min-width="120">
						<template slot-scope="scope">
              <el-icon name="mobile"></el-icon>
              <el-popover
                placement="top"
                title=""
                width="150"
                trigger="hover">
                <span style="margin-left:35px">{{scope.row.mobile}}</span>
                <span slot="reference">{{scope.row.mobile.substr(0,3)+"****"+scope.row.mobile.substr(7)}}</span>
              </el-popover>
            </template>
					</el-table-column>
					<el-table-column
					  label="身份证号"
					  label-class-name="border"
					  show-overflow-tooltip
					  min-width="150">
						 <template slot-scope="scope">
              <el-icon name="id_number"></el-icon>
              <el-popover
                placement="top"
                title=""
                width="150"
                trigger="hover">
                <span style="margin-left:10px">{{scope.row.id_number}}</span>
                <span slot="reference">{{scope.row.id_number.substr(0,3)+"****"+scope.row.id_number.substr(14)}}</span>
              </el-popover>
            </template>
					</el-table-column>
					<el-table-column
                      v-if="tabactive"
					  label="投保开始日期"
					  show-overflow-tooltip
					  label-class-name="border"
					  min-width="150">
					  <template slot-scope="scope">
					    <el-icon name="entry_date"></el-icon>
					    <span>{{scope.row.start_time}}</span>
					  </template>
					</el-table-column>
					<el-table-column
					  label="投保失效日期"
					  show-overflow-tooltip
					  label-class-name="border"
					  min-width="150">
					  <template slot-scope="scope">
					    <el-icon name="entry_date"></el-icon>
					    <span>{{scope.row.end_time}}</span>
					  </template>
					</el-table-column>
				</el-table>
			</div>
			<!-- 分页组件 -->
			<div class="page" v-if="totallist != 0">
				<div class="block">
					<el-pagination
					@current-change="handleCurrentPageChange"
					:current-page.sync="currentPage"
					:page-size="20"
					layout="total, prev, pager, next"
					:total="totallist">
					</el-pagination>
				</div>
			</div>
		</div>
         <!-- 修改投保日期 -->
		<div class="export-dialog edittime">
			<el-dialog 
			v-loading="eidtloading"
			title="修改投保日期" 
			:visible.sync="showedittime"
			@close="resetForm('edittimeform')"
			size="tiny">  
				<el-form :model="edittimeform" label-width="97px" :rules="rules" ref="edittimeform">
					<el-form-item label="保险时间" prop="time">
						<el-date-picker 
						v-model="edittimeform.time" 
	      				range-separator="至"
						type="daterange" 
						:editable="false"
						style="width:248px"
						:picker-options="endtime"
						placeholder="选择日期范围">
						</el-date-picker>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button class="cancel" @click="resetForm('edittimeform')">取 消</el-button>
					<el-button type="primary" class="confirm" @click="editconfirm('edittimeform')">确 定</el-button>
				</div>
			</el-dialog>
		</div>
         <!-- 重新投保 -->
		<div class="export-dialog edittime">
			<el-dialog 
			title="重新投保" 
			:visible.sync="showagaintime"
			@close="resetForm('againtimeform')"
			size="tiny">  
				<el-form :model="againtimeform" label-width="97px" :rules="rules" ref="againtimeform">
					<el-form-item label="保险时间" prop="time">
					<el-date-picker 
					v-model="againtimeform.time" 
					type="daterange" 
                    range-separator="至"
					:editable="false"
					style="width:248px"
					:picker-options="endtime"
					placeholder="选择日期范围">
					</el-date-picker>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button class="cancel" @click="resetForm('againtimeform')">取 消</el-button>
					<el-button type="primary" class="confirm" @click="againconfirm('againtimeform')">确 定</el-button>
				</div>
			</el-dialog>
		</div>
         <!-- 删除 -->
		<div class="export-dialog maskconfirm">
			<el-dialog
			title="提示"
			top="35%"
			:visible.sync="showsetdel"
			@close="showsetdel = false"
			size="tiny">
				<span>删除后的人将从失效列表中移除!</span>
				<span slot="footer" class="dialog-footer">
				<el-button class="cancel" @click="showsetdel = false">取 消</el-button>
				<el-button type="primary" class="confirm" @click="delconfirm">确 定</el-button>
				</span>
			</el-dialog>
		</div>
         <!-- 失效 -->
		<div class="export-dialog maskconfirm">
			<el-dialog
			title="提示"
			top="35%"
			:visible.sync="showfail"
			@close="showfail = false"
			size="tiny">
				<span>确定后选中人员保险将失效，是否确定置为失效？</span>
				<span slot="footer" class="dialog-footer">
				<el-button class="cancel" @click="showfail = false">取 消</el-button>
				<el-button type="primary" class="confirm" @click="failconfirm">确 定</el-button>
				</span>
			</el-dialog>
		</div>
	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '../assets/js/util.js'

import breadcrumb from '@/components/common/breadcrumb'

export default {
  	name: 'kqtasklist',
    components:{
        breadcrumb
    },
  	data () {
  		var testStartTime = (rule,value,callback) => {
            var sumDays = ''
            if(!value || !value[0]) {
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
    	return {
            team_id: 0,
            project_id: 0,
            invisible_man:[1],
            tabactive:true,
            tabbtnwidth:0,
            tabbtnleft:0,
            eidtloading:false,
            total_page:2,
            currentPage:1,//当前分页
            memberS:'',//搜索人员
            onmember:true,//在保人员操作
            offmember:true,//失效人员操作
            showedittime:false,//修改投保日期
            edittimeform:{time:''},
            againtimeform:{time:''},
            endtime:{
              disabledDate(time) {
                return time.getTime() < new Date(new Date().setHours(0, 0, 0, 0));
              }          
            },
            rules: {  //日期验证规则
                time: [
                    { validator: testStartTime, trigger: 'change',required: true }
                ],
            },
            showsetdel:false,//显示删除
            showagaintime:false,//显示重新投保
            showfail:false,//显示置为失效
            insuranceDataList:[],
            invalidNum:'',
            normalNum:'',
            page_no:1,
            loading:true,
            totallist:0,
            tableHeight:0,
    	}
  	},
  	methods: {
    	init() {
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id;
            this.tableHeight = window.innerHeight - 316;
            this.tabbtnwidth = $('.insurance_lifirst').width();
            this.getInsuranceMemberList()
            this.tabwidith = $('.insurance_tab ul').width()
    	},
    	//切换tab 技术tab宽度移动并加载数据
    	tabclick(index,event){
            console.log(this.tabwidith)
    		if($(event.target).hasClass('active')) return;
            this.loading = true;
    		this.tabbtnwidth = $(event.target).width()
    		this.tabactive = !this.tabactive;
    		index === 1 ? this.tabbtnleft = 0 : this.tabbtnleft = this.tabwidith - this.tabbtnwidth + 16;
    		this.memberS = '';
    		this.page_no = 1;
    		this.getInsuranceMemberList()
    	},
    	//获取保险人列表
    	getInsuranceMemberList(user_id){
        	this.onmember = true;
        	this.offmember = true;
        	this.currSelectMemberData = [];
            util.ajax({
                url:'/insurance/users/list/get',
                type:'GET',
                data:{
                    team_id: this.team_id,
                    project_id: this.project_id,
                    page_no:this.page_no,
                    page_size:20,
                    search_user_id:user_id || ''
                },
                timeout:10000,
                success:(result) => {
                	this.loading = false;
                	if(result.errno == 0){
                		if(!user_id){
                			this.invalidNum = result.data[1].num.invalid_num;
                			this.normalNum = result.data[1].num.normal_num;
                		}
                		if(this.tabactive){
                			this.insuranceDataList = result.data[0].list.normal
                            this.totallist = user_id ? +result.data[1].num.search_normal_num : +result.data[1].num.normal_num;
                		}else{
                			this.insuranceDataList = result.data[0].list.invalid
                            this.totallist = result.data.search_num
                            this.totallist = user_id ? +result.data[1].num.search_invalid_num : +result.data[1].num.invalid_num;
                		}
                	}else{
                  		this.alertinfo(result.errmsg)
                	}
                },
                error: (xhr, status) => {
                  this.alertinfo('网络连接失败，请检查网络')
                },
                noNetwork: () => {
                  this.alertinfo('网络连接失败，请检查网络')
                }
            })
    	},
    	//搜索
    	seachMember(){
    		this.page_no = 1;
            this.currentPage = 1;
            if(!this.memberS){
                this.select_user_id = ''
            }
    		this.getInsuranceMemberList(this.select_user_id)
    	},
        //表单全选操作或单选复选款操作
        handleSelectionChange(val) {
            this.currSelectMemberData = val;
            if(val.length){
            	this.onmember = false;
            	this.offmember = false;
            }else{
            	this.onmember = true;
            	this.offmember = true;
            }
        },
        /*分页操作*/
        handleCurrentPageChange() {
            this.page_no = this.currentPage
            this.getInsuranceMemberList()
        },
        //人员搜索
        querySearch(queryString, cb){
            this.select_user_id = ''
            if(queryString){
                this.states = []
                util.ajax({
                    url:'/group/member_search',
                    type:'GET',
                    data:{
                        team_id:this.team_id,
                        project_id:this.project_id,
                        group_id:'',
                        keyword:queryString,
                        page_no:'',
                        page_size:''
                    },
                    timeout:10000,
                    success:(obj) => {
                        // console.log(obj)
                        if(obj && obj.errno == 0){
                            let strArr = []
                            obj.data.list.forEach((o) => {
                                let str = ''
                                str = { 
                                  "value": o.user_name, 
                                  "group_name":o.group_name,
                                  "group_id": o.group_id,
                                  "user_id":o.user_id
                                }
                                strArr.push(str)
                            })
                            this.restaurants = strArr
                            var results = queryString ? this.restaurants.filter(this.createFilter(queryString)) : this.restaurants;
                            if(results.length == 0){
                                results.push({'value':'无搜索结果','status':'-1'})
                            }
                            this.states = results
                            clearTimeout(this.timeout);
                            this.timeout = setTimeout(() => {
                              // 调用 callback 返回建议列表的数据
                              cb(results);
                            }, 1000 * Math.random());
                            
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
        handleSelect(item){
          if(item.status == -1){
              this.memberS = ''
              this.select_user_id = -1

          }else{
              this.select_user_id = item.user_id
          }
        },
        //修改投保时间
        ckedittime(){
        	this.showedittime = true;
        },
        //置为失效
        cksetfail(){
        	this.showfail = true;
        },
        //确认失效
        failconfirm(){
        	let insured_ids = [],
        		time;
        	this.currSelectMemberData.map((val,index) => {
        		insured_ids.push(val.user_id) 
        	})
            util.ajax({
                url:'/insurance/users/del',
                type:'GET',
                data:{
                    team_id: this.team_id,
                    project_id: this.project_id,
                    insured_ids:JSON.stringify(insured_ids),
                    status:-1
                },
                timeout:10000,
                success:(result) => {
                	if(result.errno == '0'){
    					this.getInsuranceMemberList()
                		this.showfail = false;
                        this.alertinfo('置为失效成功','success')
                	}else{
                  		this.alertinfo(result.errmsg)
                	}
                },
                error: (xhr, status) => {
                  this.alertinfo('网络连接失败，请检查网络')
                },
                noNetwork: () => {
                  this.alertinfo('网络连接失败，请检查网络')
                }
            })

        },
        //确定删除
        delconfirm(){
        	let insured_ids = [],
        		time;
        	this.currSelectMemberData.map((val,index) => {
        		insured_ids.push(val.user_id) 
        	})
            util.ajax({
                url:'/insurance/users/del',
                type:'GET',
                data:{
                    team_id: this.team_id,
                    project_id: this.project_id,
                    insured_ids:JSON.stringify(insured_ids),
                    status:-4
                },
                timeout:10000,
                success:(result) => {
                	this.loading = false;
                	if(result.errno == '0'){
                        this.alertinfo('操作成功','success')
    					this.getInsuranceMemberList()
                		this.showsetdel = false;
                	}else{
                  		this.alertinfo(result.errmsg)
                	}
                },
                error: (xhr, status) => {
                  this.alertinfo('网络连接失败，请检查网络')
                },
                noNetwork: () => {
                  this.alertinfo('网络连接失败，请检查网络')
                }
            })

        },
        createFilter(queryString) {
            return (restaurant) => {
              return (restaurant.value.toLowerCase() || restaurant.value.indexOf(queryString) > -1);
            };
        },
        //确认修改
        editconfirm(formName){
	        this.$refs[formName].validate((valid) => {
	        	if(valid){
		        	let insured_ids = [],
		        		time;
		        	this.currSelectMemberData.map((val,index) => {
		        		insured_ids.push(val.user_id) 
		        	})
		    		time = {
		    			status:2,
		    			start_date:(this.edittimeform.time[0].getTime()+ '').substr(0,10),
		    			end_date:(this.edittimeform.time[1].getTime()+ '').substr(0,10),
		    			week:['1','2','3','4','5','6','7'],
		    		}
			        util.ajax({
			            url:'/insurance/users/time/edit',
			            type:'GET',
			            data:{
			                team_id: this.team_id,
			                project_id: this.project_id,
			                insured_ids:JSON.stringify(insured_ids),
	                    	time:JSON.stringify(time),
			            },
			            timeout:10000,
			            success:(result) => {
			            	this.loading = false;
			            	if(result.errno == '0'){
			            		this.page_no = 1;
                                this.showedittime = false;
    							this.getInsuranceMemberList()
			             		this.alertinfo('修改投保日期成功!','success')
			            	}
			            },
			            error: (xhr, status) => {
                            this.alertinfo('网络连接失败，请检查网络')
			            },
			            noNetwork: () => {
			              this.alertinfo('网络连接失败，请检查网络')
			            }
			        })

	        	}
	        })

        },
        //取消修改
        resetForm(formName) {
          this.$refs[formName].resetFields();
          this.showedittime = false;
          this.showagaintime = false;
        },
        //点击重新投保
        againset(){
        	this.showagaintime = true;
        },
        //确认重新投保
        againconfirm(formName){
	        this.$refs[formName].validate((valid) => {
	        	if(valid){
		        	let insured_ids = [],
		        		time;
		        	this.currSelectMemberData.map((val,index) => {
		        		insured_ids.push(val.user_id) 
		        	})
	        		time = {
	        			status:2,
	        			start_date:(this.againtimeform.time[0].getTime()+ '').substr(0,10),
	        			end_date:(this.againtimeform.time[1].getTime()+ '').substr(0,10),
	        			week:['1','2','3','4','5','6','7'],
	        		}
			        util.ajax({
			            url:'/insurance/users/time/edit',
			            type:'GET',
			            data:{
			                team_id: this.team_id,
			                project_id: this.project_id,
			                insured_ids:JSON.stringify(insured_ids),
	                    	time:JSON.stringify(time),
			            },
			            timeout:10000,
			            success:(result) => {
			            	this.loading = false;
			            	if(result.errno == '0'){
			            		this.page_no = 1;
    							this.getInsuranceMemberList()
			             		this.alertinfo('重新投保成功','success')
			             		this.showagaintime = false;
			            	}
			            },
			            error: (xhr, status) => {
                            this.alertinfo('网络连接失败，请检查网络')
			            },
			            noNetwork: () => {
			              this.alertinfo('网络连接失败，请检查网络')
			            }
			        })

	        	}
	        })

        },
        //删除
        delset(){
        	this.showsetdel = true;
        },
        // 显示错误信息
        alertinfo(text,type){
          this.$message({
            showClose: true,
            message: text,
            type: type || 'warning',
          });
        },
  	},
  	mounted() {
    	this.init()
  	},
  	watch: {
  	  '$route' (to, from) {
  	    // 对路由变化作出响应...
        this.init();
  	  }
  	}
}
</script>
<style src="../assets/css/insuranceM.css"></style>