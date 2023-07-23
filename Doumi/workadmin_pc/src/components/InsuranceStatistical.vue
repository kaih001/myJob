<template>
	<div class="insuranceS">
  		<div class="kqtask_top">
            <breadcrumb>
                <router-link to="insuranceMer" replace>用工保险</router-link>
                <router-link to="">保单统计</router-link>
            </breadcrumb>
  		</div>
        <div class="kq-seach-form">
            <el-form label-width="65px" :rules="rules"  ref="ruleForm" :model="ruleForm">
                <div class="from-item-list">
                    <el-form-item label="日期范围："  prop="memberDate">
                        <el-date-picker 
                            type="daterange"
                            placeholder="选择日期"
                            range-separator="至"
                            style="width:225px"
                            v-model="ruleForm.memberDate"
                            value-format="yyyy-MM-dd"
                            @change="datachange"
                            :editable="false">
                        </el-date-picker>
                    </el-form-item>
                </div>
                <div class="from-item-list member">
                    <el-form-item label="人员：" label-width="40px" >
                      <el-autocomplete
					popper-class="insuranceSsearch"
					style="width:135px;"
                    v-model="memberS"
                    :fetch-suggestions="querySearch"
                    custom-item="my-item-zh"
                    :trigger-on-focus="false"
                    placeholder="姓名/手机号"
                    @select="handleSelect">
                    </el-autocomplete>
                    </el-form-item>
                </div>
                <div class="from-item-list">
                    <el-form-item label="投保结果：" style="float:left">
                        <el-select  class="mystatus" style="width:106px" v-model="status">
                          <template v-for="item in stateOptionsDay">
                              <el-option
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                          </template>
                        </el-select>
                    </el-form-item>
                    <el-button type="primary" class="seach-btn" style="float:left:margin-left:16px;" @click="searchlist">搜 索</el-button>
                </div>
            </el-form>
        </div>
        <div class="insurance_info">
        	<p>总成功人次：<span >{{success_num}}</span>总失败人次：{{error_num}}</p>
            <div class="export">
                <h3 @click="exportexcle"><i class="export-icon"></i><span>导出报表</span></h3>
            </div>
        </div>
		<div class="insurance_table">
			<div class="from-member">
				<el-table 
				tooltip-effect="dark" 
				style="width: 100%" 
				border
                :data="insuranceDataList"
				:height="tableHeight"
				v-loading.body="loading">
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
					  label="所属小组"
					  label-class-name="border"
					  show-overflow-tooltip
					  min-width="150">
					  <template slot-scope="scope">
					    <el-icon name="group_name"></el-icon>
					    <span>{{scope.row.group_name}}</span>
					  </template>
					</el-table-column>
                    <el-table-column
                      label="投保日期"
                      show-overflow-tooltip
                      label-class-name="border"
                      min-width="150">
                      <template slot-scope="scope">
                        <el-icon name="entry_date"></el-icon>
                        <span>{{scope.row.insurance_date.split(' ')[0]}}</span>
                      </template>
                    </el-table-column>
					<el-table-column
					  label="投保来源"
					  label-class-name="border"
					  show-overflow-tooltip
					  min-width="150">
					  <template slot-scope="scope">
					    <el-icon name="idnumber"></el-icon>
					    <span>{{scope.row.source == 0 ? '其他' : (scope.row.source == 1 ? '手动添加':(scope.row.source == 2?'考勤添加':(scope.row.source == 3 ? '上报地点' : scope.row.source == 4?'二维码签到':(scope.row.source == 5?'批量添加':'批量邀请')))) }}</span>
					  </template>
					</el-table-column>
                    <el-table-column prop="status_no" label="投保结果" show-overflow-tooltip width="110" filter-placement="bottom-end" >
                        <template slot-scope="scope">
                            <el-tag :type=" 'primary' + scope.row.status" close-transition>{{viewTypeShow['label'+scope.row.status]}}</el-tag>
                        </template>
                    </el-table-column>
					<el-table-column
					  label="失败原因"
					  label-class-name="border"
					  show-overflow-tooltip
					  min-width="150">
					  <template slot-scope="scope">
					    <el-icon name="idnumber"></el-icon>
					    <span>{{scope.row.err_msg}}</span>
					  </template>
					</el-table-column>
					<el-table-column
					  label="投保渠道"
					  label-class-name="border"
					  show-overflow-tooltip
					  min-width="150">
					  <template slot-scope="scope">
					    <el-icon name="idnumber"></el-icon>
					    <span>{{scope.row.insurance_source}}</span>
					  </template>
					</el-table-column>
					<el-table-column
					  label="理赔电话"
					  label-class-name="border"
					  show-overflow-tooltip
					  min-width="150">
					  <template slot-scope="scope">
					    <el-icon name="idnumber"></el-icon>
					    <span>{{scope.row.insurance_source_contact}}</span>
					  </template>
					</el-table-column>
          <el-table-column
					  label="操作"
					  label-class-name="border"
					  show-overflow-tooltip
					  min-width="150">
            <template slot-scope="scope">
              <el-button v-if="scope.row.status == 2" class="down_policy" size="mini" round @click="downPolicy(scope.row)">下载保单</el-button>
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
	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '../assets/js/util.js'

import breadcrumb from '@/components/common/breadcrumb'
var date = new Date()
var ckprck = true;
var today = util.getStampFromDateStr(date)
var date2 = new Date(date)
date2.setDate(date.getDate())
var end_timees = util.getStampFromDateStr(date2)
export default {
  	name: 'kqtasklist',
    components:{
        breadcrumb
    },
  	data () {
        var testStartTime = (rule,value,callback) => {
            var sumDays = ''
            if(!value || !value[0]) {
                ckprck = true;
                callback();
            }else{
                sumDays = util.DateDiff(util.formatData1(value[0]),util.formatData1(value[1]))
                if(sumDays > 30){
                    ckprck = false;
                    return callback(new Error('时间跨度不能超过30天'));
                }else{
                    ckprck = true;
                    callback();
                }
            }
        };
    	return {
            team_id: 0,
            project_id: 0,
            stateOptionsDay:[
            	{value:2,label:'全部'},
            	{value:1,label:'成功'},
            	{value:0,label:'失败'},
            ],
            viewTypeShow:{
                'label-1':'失败',
                'label0':'默认',
                'label1':'投保中',
                'label2':'成功',
                'label3':'成功'
            },
            loading:false,
            total_page:2,
            currentPage:1,//当前分页
            winHeight:'',
            memberS:'',//搜索人
            tableHeight:0,
            ruleForm:{memberDate:[today,end_timees]},
            status:2,
            select_user_id:'',
            rules: {
                memberDate: [
                    { validator: testStartTime, trigger: 'change',required: true }
                ],
            },
            success_num:'',
            error_num:'',
            insuranceDataList:[],
            page_no:1,
            totallist:0
    	}
  	},
  	methods: {
    	init() {
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id;
            this.tabbtnwidth = $('.insurance_lifirst').width();
            this.ut_date = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
            this.end_date = this.ut_date;
            this.tableHeight = window.innerHeight - 279;
            this.getInitList()
    	},
    	//切换tab 技术tab宽度移动并加载数据
    	tabclick(index,event){
    		this.tabbtnwidth = $(event.target).width()
    		this.tabactive = !this.tabactive;
    		index === 1 ? this.tabbtnleft = 0 : this.tabbtnleft = 178.94 - this.tabbtnwidth;
    	},
    	//获取初始化列表
    	getInitList(){
            if(!ckprck) return;
            util.ajax({
                url:'/insurance/statistics/detail',
                type:'GET',
                data:{
                    team_id: this.team_id,
                    project_id: this.project_id,
                    ut_date:this.ut_date,
                    end_date:this.end_date,
                    search_user_id:this.select_user_id,
                    status:this.status,
                    page_no:this.page_no,
                    page_size:20,
                },
                timeout:10000,
                success:(result) => {
                    console.log('保单统计列表')
                    console.log(result)
                    if(result.errno == 0){
                        this.insuranceDataList = result.data.list;
                        this.totallist = result.data.search_num
                        this.success_num = result.data.total_success_num;
                        this.error_num = result.data.total_error_num;
                    }else{
                        this.insuranceDataList = [];
                        this.totallist =0;
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
        //搜索人员列表
        searchlist(){
            this.page_no = 1;
            this.currentPage = 1;
            this.getInitList()
        },
        //表单全选操作或单选复选款操作
        /*分页操作*/
        handleSizeChange(val) {
            // console.log(`每页 ${val} 条`);
        },
        handleCurrentPageChange(val) {
            this.page_no = val
            this.getInitList()
        },
        //人员搜索
        querySearch(queryString, cb){
          //console.log(queryString);
            if(queryString){
                this.select_user_id = ''
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
                        this.alertinfo('网络连接失败，请检查网络')
                    },
                    noNetwork: () => {
                      //网络超时
                        this.alertinfo('网络连接失败，请检查网络')
                    }
                })
            }
        },
        handleSelect(item){
          // console.log(item)
          if(item.status == -1){
              this.memberS = ''
              this.select_user_id = -1
          }else{
              this.select_user_id = item.user_id
          }
        },
        createFilter(queryString) {
            return (restaurant) => {
              return (restaurant.value.toLowerCase() || restaurant.value.indexOf(queryString) > -1);
            };
        },
        datachange(val){
            if(val){
                this.timeval = val;
                let ut_date = val.split('至')[0],
                    end_date = val.split('至')[1];
                this.ut_date = (new Date(ut_date).getTime()-28800000)/ 1000;
                this.end_date = (new Date(end_date).getTime()-28800000)/ 1000;
            }else{
                this.timeval = '';
                this.ut_date = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
                this.end_date = this.ut_date;
            }
        },
        exportexcle(){
            if(this.insuranceDataList.length  === 0){
                this.alertinfo('当前选择范围内无保单记录，请重新选择范围再导出!')
                return;

            };
            this.page_no = ''
            if(!ckprck) return;
            let ut_date,
                end_date;
            if(this.timeval){
                ut_date = this.timeval.split('至')[0],
                end_date = this.timeval.split('至')[1];
            }else{
                ut_date = util.formatData1(new Date(this.ut_date * 1000));
                end_date = util.formatData1(new Date(this.ut_date* 1000));
            }
            util.locationHref('/sea/api/1.0/client/v1/insurance/history/export?dmclient=pcweb&X-Doumi-Agent=weixinqy&team_id=' +  this.team_id + '&project_id='+this.project_id + '&start_time=' +ut_date+'&end_time='+end_date+'&search_user_id='+this.select_user_id+'&type=2'+'&status='+this.status);
        },
        // 显示错误信息
        alertinfo(text,type){
          this.$message({
            showClose: true,
            message: text,
            type: type || 'warning',
          });
        },
        // 下载保单
        downPolicy(row){
          if(row.down_policy_url.length > 0){
            location.href = row.down_policy_url;
          }
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
<style  src='../assets/css/insuranceS.css'></style>