<template>
    <div id="positionMonitor" v-loading.body="pLoading">
        <!-- <position-header></position-header> -->
    	<div class="top-div">
    		<h1>位置监控</h1>
    		<div class="sel_item">
				<span>筛选：</span>
				<el-button @click="openGroupSelecter" class="select_member" style="position:relative;min-width:121px;text-align: left;height:28px;line-height: 6px;padding-left:10px;padding-right:33px;">{{selected_members_groups.length ? computedMemberGroup() : '全部人员'}}<i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 8px;color: #d3dce6;"></i></el-button>
			</div>
			<select-member-group-multi
                title="人员范围"
                ref="profile"
                :all-groups="all_groups"
                :selected-members-groups="selected_members_groups"
                v-on:confirmGroupSelecter="confirmGroupSelecter"
            ></select-member-group-multi>
            <div class="time">
            	<el-date-picker 
	                v-model="pmtime"
	                @change="onPmTimeChange"
	                type="date"
	                placeholder="选择日期"
	                style="width:131px;margin-left:12px;"
	                :picker-options="pickerOptions"
	                :clearable="false"
	                :editable="false">
	            </el-date-picker>
            </div>
            <div class="set-buttons" v-if="admins.sign_export">
            	<div class="btn-item export" @click="positionDialogVisible = true" :style="admins.invisible_man?'margin-right:0px;':''">
                  <i class="export-icon"></i>
                  <el-button type="text">导出报表</el-button>
              	</div>
              	<div class="btn-item set" @click="setPosition" v-if="!admins.invisible_man">
                  <i class="setico_svg"></i>
                  <el-button type="text">设置</el-button>
              	</div>
            </div>
            <div class="isOpenPositionTip" v-if="isOpenPosition">
            	<p>更多功能，点击这里进行</p>
            	<p>设置哦！</p>
            	<a href="javascript:;" @click="closeTip">知道了</a>
            </div>
    	</div>
    	<div class="count">
    		<div class="left" id="leftDiv">
    			<h2>已上报&nbsp;&nbsp;&nbsp;<b>{{sign_count}}</b><span>/{{post_user_id.length}}</span></h2>
    			<div class="member-list"> 
    				<template v-for="item in signListData">
    					<dl @click="gotoDetails(item)">
	    					<dt :class="{'deleted': item.member_status == -1}">
	    						<img :src="item.avatar" alt="" v-if="item.avatar">
	    						<div class="noavatar" v-else></div>
	    					</dt>
	    					<dd>
	    						<h3><span>{{item.name}}</span>上报{{item.today_sign_count}}次</h3>
	    						<h4>最近上报：{{getLocalTime(item.sign_time*1000)}}</h4>
	    						<i class="el-icon-arrow-right" style="font-weight:600;"></i>
	    					</dd>
	    				</dl>
    				</template>
    			</div>
    			<div class="empty" v-show="signListData.length == 0">
    				<span>暂无已上报人员</span>
    			</div>
    		</div>
    		<div class="right">
    			<div id="container">
    			</div>
    			<div class="btns">
					<a href="javascript:;" class="big" @click="mapBig"><img src="../assets/imgs/position/big.svg" alt=""></a>
					<span class="line"></span>
					<a href="javascript:;" class="small" @click="mapSmall"><img src="../assets/imgs/position/small.svg" alt=""></a>
				</div>
    		</div>
    	</div>

    	<!-- 导出弹窗 -->
    	<div class="position-dialog">
    		<el-dialog
			  title="导出报表"
			  :visible.sync="positionDialogVisible"
			  @close="resetForm('ruleForm')"
			  size="tiny">
			  <div class="my-form">
			  		<el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="73px">
						  <el-form-item label="开始日期" prop="start_time">
						    	<el-date-picker
							      v-model="ruleForm.start_time"
							      :clearable="false"
							      :editable="false"
							      type="date"
							      placeholder="请选择">
							    </el-date-picker>
						  </el-form-item>
						  <el-form-item label="结束日期" prop="end_time">
						    	<el-date-picker
							      v-model="ruleForm.end_time"
							      :clearable="false"
							      :editable="false"
							      type="date"
							      placeholder="请选择">
							    </el-date-picker>
						  </el-form-item>
			  		</el-form>
			  </div>
			  <span slot="footer" class="dialog-footer">
			    <el-button @click="resetForm('ruleForm')">取 消</el-button>
			    <el-button type="primary" @click="positionDialogSubmint('ruleForm')">确 定</el-button>
			  </span>
			</el-dialog>
    	</div>

    	<!-- 未开启定位弹层提示 -->
    	<div class="dialog-backgroud" v-if="dialogPositionIsOpen && !admins.invisible_man && admins.sign_export">
    		<div class="positionIsOpen-dialog">
				<div class="tip-text">
				  	<p>开启后可收集员工地理位置并实时查看</p>
				</div>
				<div @click="openPosition">
		  			<el-button class="openbtn">开 启</el-button>
		  		</div>
    		</div>
    	</div>
    </div>
  
</template>

<script>
  import * as util from '../assets/js/util.js'
  import SelectMemberGroupMulti from '@/components/common/SelectMemberGroupMulti'
  import PositionHeader from '@/components/common/PositionHeader'
  import pDefaultIcon from '@/assets/imgs/position/p_icon3.svg'
  let $ = require("jquery")
  let date = new Date()
  let today = util.formatData1(date)
  let map = ''

  export default{
      name: 'positionMonitor',
      components:{
      	SelectMemberGroupMulti,
        PositionHeader
      },
      data:function(){
      	var startTime = (rule,value,callback) => {
            if(!value) {
                return callback(new Error('请选择开始时间'));
            }else{
            	if(value.getTime()<new Date().getTime()-365*24*60*60*1000){
            		return callback(new Error('不能选择1年以前的日期'));
            	}else{
               		callback();
            	}
            } 
        };
        var endTime = (rule,value,callback) => {
        	var sumDays = ''
            if(!value) {
                return callback(new Error('请选择结束时间'));
            }else{
            	if(util.getStampFromDateStr(new Date()) < util.getStampFromDateStr(value)){
            		return callback(new Error('不能选择当日以后的日期'));
            	}else{
    		    	sumDays = util.DateDiff(util.formatData1(this.ruleForm.start_time),util.formatData1(value))
    		    	if(util.getStampFromDateStr(this.ruleForm.start_time) > util.getStampFromDateStr(value)){
    					return callback(new Error('结束时间不能小于开始时间'));
    				}else if(sumDays > 30){
    					return callback(new Error('导出时间范围不能超过一个月'));
    				}else{
    					callback();
    				}
            	}
            } 
        };
        return{
        	pickerOptions: {
	          disabledDate(time) {
	            return time.getTime() > Date.now();
	          }
	        },
        	admins:{
        		sign_export:false,
        		invisible_man: false
        	},
        	pLoading:false,
        	positionDialogVisible:false,
        	dialogPositionIsOpen:false,
        	isOpenPosition:false,
            team_id:'',
            project_id:'',
            all_groups:[],
            selected_members_groups:[],
            pmtime: new Date(),
            key_time:'',
            sign_count:'',
            sumCount:'',
            post_user_id:[],
            userid_list:[],
            back_list_id:[],
            signListData:[],
            ruleForm:{
            	start_time: new Date(),
            	end_time: new Date(),
            },
            rules: {  //日期验证规则
                start_time: [
                    { validator: startTime, trigger: 'change' }
                ],
                end_time:[
                    { validator: endTime, trigger: 'change' }
                ]
            },
            require_field: [],//保存已设置字段信息
        }
      },
      computed:{

      },
      methods:{
        init (){
            $('.count').height($(window).height() - 60 - 54)
            $(window).resize(() => {
                $('.count').height($(window).height() - 60 - 54)
            })
        	this.team_id = util.getLocalStorage('projectStorageInfo').team_id
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id
            //从位置监控详情页返回时取缓存里数据，从而判断搜索条件显示内容，如有返回数据则显示返回数据，否则显示空（即默认显示时的状态）
            if(util.getLocalStorage('backInfoData')){
            	this.back_list_id = []
            	this.pmtime = util.getLocalStorage('backInfoData').pmtime
            	this.selected_members_groups = util.getLocalStorage('backInfoData').selected_members_groups
            	if(this.selected_members_groups){
            		this.selected_members_groups.forEach((obj) => {
		                if(obj.selType === 'group'){
		                    obj.PeronnelList.forEach( (o) => {
		                    	this.back_list_id.push(o.user_id)
		                    })
		                }else{
		                    this.back_list_id.push(obj.id)
		                }
		            })
            	}
            }
            util.setLocalStorage('backInfoData','') //清楚从位置监控详情页返回的数据
            this.permission() //获取权限
            this.getMemberGroup() //获取人员小组列表数据
            this.getUserAdminMember() //获取当前用户下级所有人员的user_id
            //获取设置信息数据
            this.getSetting()
        },
        //获取设置信息数据
        getSetting(){
            util.ajax({
                url: '/sign/project/setting',
                type:'GET',
                data: {
                    team_id: this.team_id,
                    project_id: this.project_id
                },
                success: (res) => {
                	// console.log('位置上报已设置信息')
                 //    console.log(res)
                    if(res&&res.errno==0){
                    	this.require_field = res.data.setting_data.require_field
                    	// console.log(this.require_field)
                    	if(res.data.setting_data.pop_tip == 1){
                    		this.dialogPositionIsOpen = true
                    	}else{
                    		this.dialogPositionIsOpen = false
                    	}
                    }else{
                        this.$message({
                          showClose: true,
                          message: res.errmsg,
                          type: 'warning'
                        });
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
                    // 网络超时
                    this.$message({
                      showClose: true,
                      message: '网络连接失败，请检查网络',
                      type: 'warning'
                    });
                }
            })
        },
        mapBig(){
        	map.zoomIn()
        },
        mapSmall(){
        	map.zoomOut()
        },
        //获取地图，然后在地图上标识所有人员足迹
        getMap(){
        	 this.pLoading = true
        	 util.ajax({
	            url: '/sign/manager/map/all',
	            // type:'GET',
	            type:'POST',
	            data: {
	              	'team_id': this.team_id,
                    'project_id': this.project_id,
                    'date':this.pmtime ? util.formatData1(this.pmtime) : today,
                    'userid_list':JSON.stringify(this.post_user_id)
	            },
	            success: (res) => {
	            	// console.log(res)
	            	this.pLoading = false
	                if(res&&res.errno==0){
					    map = new AMap.Map('container',{
					    	resizeEnable: true,
					        zoom:10,
					        center: [116.397428, 39.90923]
					    });
						var markers = []; 
					    map.clearMap();  // 清除地图覆盖物
	                	res.data.list.forEach( (obj1) => {
	                		obj1.sign_list.forEach( (obj2) => {
	                			obj2.form_data.forEach( (obj3) => {
	                				if(obj3.type === "Location"){
	                					var marker;
					                	var icon = new AMap.Icon({
					    					image: pDefaultIcon,
					    					size: new AMap.Size(26, 32)
					    				});
					    				var lngLat = new AMap.LngLat(obj3.value.lng, obj3.value.lat)
					    				marker = new AMap.Marker({
					    					icon: icon,
					    					position: lngLat,
					    					offset: new AMap.Pixel(-12,-12),
					    					zIndex: 101,
					    					title: '',
					    					map: map
					    				});
					    				markers.push(marker);
	                				}
	                			})
	                		})
	                	})
	                	map.setFitView();
	                }
	            },
	            error: (xhr, status) => {
	              	this.pLoading = false
	              	// this.$message({
	               //    showClose: true,
	               //    message: '网络连接失败，请检查网络',
	               //    type: 'warning'
	               //  });
	            },
	            noNetwork: () => {
	                // 网络超时
	                this.pLoading = false
	                this.$message({
	                  showClose: true,
	                  message: '网络连接失败，请检查网络',
	                  type: 'warning'
	                });
	            }
	          })
        },
        //导出确定按钮
        positionDialogSubmint(formName){
        	this.$refs[formName].validate((valid) => {
		        if (valid) {
		          	util.isOnline(() => {
		                let href='/sea/api/1.0/client/v1/sign/project/exportsign?dmclient=pcweb&team_id='+this.team_id+'&project_id='+this.project_id+'&start_date='+util.getStampFromDateStr(this.ruleForm.start_time)+'&end_date='+util.getStampFromDateStr(this.ruleForm.end_time)+'&userid_list='
		                console.log(href)
		                util.locationHref(href)   
		                this.$message({
		                    showClose: true,
		                    message: '导出成功',
		                    type: 'success'
		                });
		                this.positionDialogVisible = false
		            }, () => {
		                this.$message({
		                    showClose: true,
		                    message: '网络连接失败，请检查网络',
		                    type: 'warning'
		                });
		            })
		        } else {
		            console.log('error submit!!');
		            return false;
		        }
	       	});
        },
        resetForm(formName){
        	this.$refs[formName].resetFields();
        	this.positionDialogVisible = false
        },
        //去往设置位置监控页
        setPosition(){
        	this.$router.replace('positionset')
        },
        //去往详情页
        gotoDetails(info){
        	let currInfoData = {
        		sign_export:this.admins.sign_export,
        		invisible_man:this.admins.invisible_man,
        		currUserInfo:info,
        		pmtime:this.pmtime,
        		selected_members_groups:this.selected_members_groups,
        		all_groups:this.all_groups
        	}
            let scrollTop = $('#leftDiv').scrollTop()
            util.setLocalStorage('app_scroll_top', scrollTop)
        	//因为详情页的头部部分要和首页的头部部分保持一致，估做如下操作即可
        	util.setLocalStorage('currInfoData',currInfoData)
        	this.$router.replace('positiondetails')
        },
        //时间日期切换
        onPmTimeChange(val){
        	this.pmtime = val
        	this.getMemberSignList()
        },
        //日期格式化“分秒”
        getLocalTime(timestr){
            return util.getLocalTime(timestr, 'HH:mm')
        },
        //获取人员签到数据列表
        getMemberSignList(){
        	if(this.back_list_id.length > 0){
        		this.post_user_id = this.back_list_id
        	}else if(this.userid_list.length > 0){
        		this.post_user_id = this.userid_list
        	}else{
        		if(this.selected_members_groups.length){
        			this.signListData = []
        			this.sign_count = 0
        			this.post_user_id = []
        			map.clearMap();  // 清除地图覆盖物
        			map.setZoomAndCenter(10,[116.397428, 39.90923])
        			return
        		}else{
        			this.post_user_id = this.sumCount
        		}
        	}
        	this.post_user_id = [...new Set(this.post_user_id)]
        	// console.log(this.post_user_id)
        	//获取地图坐标点
            this.getMap()
        	util.ajax({
	            url: '/sign/manager/statistics',
	            type:'POST',
	            // type:'GET',
	            data: {
	              	team_id: this.team_id,
                    project_id: this.project_id,
                    userid_list: JSON.stringify(this.post_user_id),
                    date: this.pmtime ? util.formatData1(this.pmtime) : today,
                    page: 1,
                    page_size: 100000,
                    key_time: this.key_time
	            },
	            success: (res) => {
	            	// console.log(res)
	                if(res&&res.errno==0){
	                	this.sign_count = res.data.count
	                    this.key_time = res.data.key_time
	                    this.signListData = res.data.list
	                    this.back_list_id = []
                        let scrollTop = util.getLocalStorage('app_scroll_top')
                        if(scrollTop && scrollTop > 0){
                            setTimeout(() => {
                                $('#leftDiv').scrollTop(scrollTop)
                            },0)
                            
                            util.setLocalStorage('app_scroll_top', null)
                        }
	                }
	            },
	            error: (xhr, status) => {
	              	// this.$message({
	               //    showClose: true,
	               //    message: '网络连接失败，请检查网络',
	               //    type: 'warning'
	               //  });
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
        //获取当前用户下级所有人员的user_id
        getUserAdminMember(){
        	util.ajax({
	            url: '/group/member_id_list',
	            type:'GET',
	            data: {
	                team_id: this.team_id,
                    project_id: this.project_id
	            },
	            success: (res) => {
	            	// console.log(res)
	                if(res&&res.errno==0){
	                    this.userid_list = res.data_info.valid_user_id
	                    this.sumCount = res.data_info.valid_user_id
	                    this.getMemberSignList()
	                }else{
	                	this.$message({
		                  showClose: true,
		                  message: res.errmsg,
		                  type: 'warning'
		                });
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
	                // 网络超时
	                this.$message({
	                  showClose: true,
	                  message: '网络连接失败，请检查网络',
	                  type: 'warning'
	                });
	            }
	        })
        },
        //显示组件--选择人员
        openGroupSelecter(){
            this.$refs.profile.openGroupSelecter()
        },
        //显示组件--选择人员返回数据显示操作
        computedMemberGroup(){
            let members = 0,
            groups = 0
            this.selected_members_groups.forEach((obj) => {
                if(obj.selType === 'group'){
                    groups++
                }else{
                    members++
                }
            })
            if(groups == 0){
                return `已选${members}人`
            }else if(members == 0){
                return `已选${groups}组`
            }else{
                return `已选${groups}组、${members}人`
            }
        },
        //点击确定后执行的函数
        confirmGroupSelecter(val){
            this.userid_list = []
            this.selected_members_groups = val
            this.selected_members_groups.forEach((obj) => {
                if(obj.selType === 'group'){
                    obj.PeronnelList.forEach( (o) => {
                    	this.userid_list.push(o.user_id)
                    })
                }else{
                    this.userid_list.push(obj.id)
                }
            })
            this.getMemberSignList()
        },
        //获取可选择小组和人员列表
        getMemberGroup(){
          util.ajax({
            url: '/group/node_data_tree',
            type:'GET',
            data: {
              group_id: 0,
              team_id: this.team_id,
              project_id: this.project_id
            },
            success: (res) => {
                if(res&&res.errno==0){
                    this.all_groups = res.data
                }
            },
            error: (xhr, status) => {
              	// 网络超时
		        this.$message({
		          showClose: true,
		          message: '网络连接失败，请检查网络',
		          type: 'warning'
		        });
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
        //获取权限
        permission(){
        	this.admins.sign_export = false
	        this.admins.invisible_man = false
        	util.ajax({
	            url: '/permission/application',
	            type:'GET',
	            data: {
	                team_id: this.team_id,
                    project_id: this.project_id,
                    application_id: 2
	            },
	            success: (res) => {
	            	console.log('权限信息')
	            	console.log(res)
	                if(res&&res.errno==0){
	                    res.data.forEach( (item) => {
	                    	if(item.id_name === 'sign_export'){
	                    		this.admins.sign_export = true
	                    	}
	                    	if(item.id_name === 'invisible_man'){
	                    		this.admins.invisible_man = true
	                    	}
	                    })
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
        openPosition(){
        	this.dialogPositionIsOpen = false
        	this.isOpenPosition = true
        	// console.log(this.require_field)
        	// return
        	this.require_field[0].info.tune_distance = 500
        	//开启位置上报
        	util.ajax({
        	    url: '/sign/project/deal',
        	    type:'POST',
        	    data:{
        	    	team_id: this.team_id,
        	    	project_id: this.project_id,
        	    	switch: 1,
        	    	require_field: JSON.stringify(this.require_field),
        	    	remind_time: []
        	    },
        	    success: (res) => {
        	        // console.log(res)
        	        if(res&&res.errno==0){
        	            // if(res.data.set_result == true){
        	            //     this.$message({
        	            //       showClose: true,
        	            //       message: '设置成功',
        	            //       type: 'success'
        	            //     });
        	            // }
        	        }else{
        	            this.$message({
        	              showClose: true,
        	              message: res.errmsg,
        	              type: 'warning'
        	            });
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
        	        // 网络超时
        	        this.$message({
        	          showClose: true,
        	          message: '网络连接失败，请检查网络',
        	          type: 'warning'
        	        });
        	    }
        	})
        },
        closeTip(){
        	this.isOpenPosition = false
        }
      },   
      mounted() {
        this.init()
      },
      watch: {
  	  	'$route' (to, from) {
  	    	// 对路由变化作出响应...
  	    	this.admins.sign_export = false
  	    	this.admins.invisible_man = false
  	    	this.pLoading = false
  	    	this.positionDialogVisible = false
  	    	this.dialogPositionIsOpen = false
  	    	this.isOpenPosition = false
        	this.init();
  	  	}
      }
    }
</script>

<style>
/* 地图 */
.amap-icon img{
	width: 28px;
    height: 32px;
}
#positionMonitor .time .el-input__inner{height: 28px;}
#positionMonitor .top-div .set-buttons .btn-item span{font-size: 13px;}
#positionMonitor .el-dialog--tiny{width: 400px;}
#positionMonitor .my-form{
	padding: 0 40px;
	margin-top: 40px;
	margin-bottom: 40px;
}
#positionMonitor .position-dialog .my-form .el-form-item{margin-bottom: 16px;}
#positionMonitor .position-dialog .my-form .el-date-editor.el-input{width: 248px;}
#positionMonitor .position-dialog .my-form .el-form-item__label{text-align: left;}
#positionMonitor .position-dialog .el-dialog__footer{
	border-top: 1px solid #e0e6ed;
	padding-top: 16px;
}
#positionMonitor .position-dialog .el-form-item__error{
  position: static;
  margin-bottom: -7px;
}
</style>
<style scoped>
.top-div{
	padding: 0 20px;
	height: 54px;
	line-height: 54px;
	background-color: #ffffff;
	position: relative;
	/*overflow: hidden;*/
	box-shadow: 3px 0 4px 0 rgba(198, 201, 207, 0.5);
	border-bottom: 1px solid #e0e6ed;
}
.top-div h1{
	font-size: 16px;
  	font-weight: 600;
  	text-align: left;
  	color: #475568;
  	float: left;
}
.top-div .sel_item{
	float: left;
	margin-left: 136px;
}
.top-div .sel_item span{
	font-size: 13px;
    color: #5e6d82;
}
.top-div .sel_item .el-button--default.select_member span{
	font-size: 13px;
	color: #1f2d3d;
}
.top-div .sel_item .el-button--default.select_member:hover{
	border: 1px solid #c0ccda;
	color: #1f2d3d;
}
.top-div .sel_item .el-button--default.select_member:active,
.top-div .sel_item .el-button--default.select_member:focus{
	border: 1px solid #6699EE;
}
.top-div .time{float: left;}
.top-div .set-buttons{float: right;}
.top-div .set-buttons .btn-item{
	float: left;
	position: relative;
}
.top-div .set-buttons .export{
	margin-right: 30px;
}
.top-div .set-buttons .export .export-icon{
	display: block;
	width: 12px;
	height: 12px;
	background-image:url(../assets/imgs/shareIcon/export.svg);
	position: absolute;
    left: -16px;
    top: 20px;
}
/* 未开启定位气泡提示 */
.top-div .isOpenPositionTip{
	width: 156px;
  	height: 61px;
  	background-image:url(../assets/imgs/position/kow.svg);
  	position: absolute;
  	right: 8px;
    top: 48px;
  	z-index: 99;
  	padding: 18px 16px;
}
.top-div .isOpenPositionTip p{
	font-size: 14px;
  	line-height: 1.43;
  	text-align: left;
  	color: #ffffff;
}
.top-div .isOpenPositionTip a{
	display: block;
	float: right;
	width: 56px;
  	height: 24px;
  	line-height: 24px;
  	border-radius: 16px;
  	background-color: #ffffff;
  	box-shadow: 0 2px 4px 0 #ffa18c;
  	font-size: 13px;
  	text-align: center;
  	color: #f5974e;
}
.dialog-backgroud{
	width: 100%;
	height: 100%;
	background-color: #000000;
	background-color:rgba(0,0,0,0.5);
	position: fixed;
	right: 0px;
	top: 60px;
	z-index: 2;
}
#positionMonitor .positionIsOpen-dialog{
	width: 278px;
    height: 116px;
	margin-left: 45%;
    margin-top: 15%;
	background:url(../assets/imgs/position/bj_tip.svg) no-repeat;
	position: relative;
}
#positionMonitor .positionIsOpen-dialog .tip-text{
	width: 192px;
    line-height: 21px;
    position: absolute;
    left: 51px;
    top: 44px;
}
#positionMonitor .positionIsOpen-dialog .tip-text p{
	font-size: 16px;
  	text-align: left;
  	color: #ffffff;
}
#positionMonitor .positionIsOpen-dialog .openbtn{
	width: 120px;
	height: 38px;
	border-radius: 89px;
	background-color: #ffffff;
	font-size: 16px;
    text-align: center;
    color: #f5974e;
    position: absolute;
    left: 50%;
    bottom: -85px;
    margin-left: -50px;
}
#positionMonitor .positionIsOpen-dialog .el-button{
	border: solid 1px #ffffff!important;
}
#positionMonitor .positionIsOpen-dialog .el-button:hover{
	border: solid 1px #ffffff!important;
}


.setico_svg{
	position: absolute;
    left: -16px;
    top: 20px;
}

.count{
	width: 100%;
	position: relative;
	clear: both;
}
.count .left{
  float: left;
  width: 220px;
  height: 100%;
  background-color: #fafafa;
  box-shadow: 2px 2px 4px 0 rgba(225, 225, 225, 0.5);
  overflow-y: auto;
  position: relative;
  z-index: 1;
}
.count .right{
    float: right;
    height: 100%;
    width: calc(100% - 220px);
    position: relative;
}
.count .right #container{
  height: 100%;
  width: 100%;
  float: right;
}
.count .right .btns{
	width: 32px;
	height: 61px;
	background:#ffffff;
	position: absolute;
	right: 16px;
	bottom: 16px;
	border-radius: 2px;
	box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
	/*z-index: 99;*/
	padding: 1.5px 0;
}
.count .right .btns a{
	display: block;
	height: 30px;
	width: 32px;
	margin: 0 auto;
}
.count .right .btns a img{
	display: block;
	margin: 0 auto;
	padding-top: 8px;

}
.count .right .btns .line{
	margin: 0 auto;
	display: block;
	width: 24px;
    height: 1px;
    background-color: #e0e6ed;
}
.count .left .empty{
	position: absolute;
	left: 50%;
	top: 50%;
	margin-left: -56px;
}
.count .left .empty span{
	font-size: 16px;
    color: #c0ccda;
}
.count .left h2{
	padding: 0 20px;
	height: 49px;
	line-height: 49px;
	font-size: 14px;
    font-weight: 600;
    text-align: left;
    color: #475568;
    border-bottom: 1px solid #e0e6ed;
}
.count .left h2 span{
   color: #99a9bf;
   font-weight: normal;
   font-size: 14px;
}
.count .left h2 b{
   color: #5e6d82;
   font-size: 14px;
}
.count .left .member-list dl{
	height: 70px;
	border-bottom: 1px solid #e0e6ed;
	padding: 0 20px;
	position: relative;
	cursor: pointer;
}
.count .left .member-list dl:hover{background-color: #ffffff;}
.count .left .member-list dl dt{
	width: 36px;
	height: 36px;
	border-radius: 36px;
	float: left;
	margin-top: 16px;
	margin-right: 14px;
	position: relative;
}
.count .left .member-list dl dt.deleted:after{
	content: '已离职';
	display: block;
	position: absolute;
	width: 36px;
	height: 36px;
	background-color: #000;
	opacity: .5;
	left: 0;
	top: 0;
	font-size: 10px;
	color:#fff;
	border-radius: 50%;
	line-height: 36px;
	text-align: center;
}
.count .left .member-list dl dt img{
	width: 36px;
	height: 36px;
	border-radius: 36px;
}
.count .left .member-list dl dt .noavatar{
	width: 36px;
	height: 36px;
	background: url(../assets/imgs/avatar.png) no-repeat center;
	background-size: contain;
}
.count .left .member-list dl dd{
	float: left;
}
.count .left .member-list dl dd h3{
	font-size: 12px;
	color: #5e6d82;
	margin-bottom: 8px;
	margin-top: 18px;
}
.count .left .member-list dl dd h3 span{
	display: block;
	width: 57px;
	color: #475568;
	font-size: 14px;
	margin-right: 5px;
	overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    float: left;
}
.count .left .member-list dl dd h4{
	clear: both;
	font-size: 12px;
  	line-height: 1.33;
  	text-align: left;
  	color: #99a9bf;
}
.count .left .member-list dl dd i{
	position: absolute;
	right: 12px;
	top: 30px;
	color: #c0ccda;
	font-size: 12px;
}

</style>

