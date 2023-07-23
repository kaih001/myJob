<template>
  	<div class="tjactive">
        <tjtop
            title="账号活跃统计"
            :show_sel_date="true"
            :date="date"
            :shortcuts="shortcuts"
            :month-num="12"
            @dateChange="dateChange"
        ></tjtop>
        <div class="main_data">
            <!-- <div>
                <p class="num">19471</p>
                <p class="name">历史累计报名量</p>
            </div> -->
            <div>
                <p class="num">{{account_active_info.loginAccountNums}}<span :class="{'up': account_active_info.loginAccountNumsChangePercent>0, 'down': account_active_info.loginAccountNumsChangePercent<=0}">{{account_active_info.loginAccountNumsChangePercent}}%</span></p>
                <p class="name">
                    <el-tooltip :enterable="false" transition="none" effect="dark" content="所选时段内，访问斗米后台账号数量" placement="bottom">
                        <span>登录账号数</span>
                    </el-tooltip>
                </p>
            </div>
            <div>
                <p class="num">{{account_active_info.averageLoginNums}}<span :class="{'up': account_active_info.averageLoginNumsChangePercent>0, 'down': account_active_info.averageLoginNumsChangePercent<=0}">{{account_active_info.averageLoginNumsChangePercent}}%</span></p>
                <p class="name">
                    <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                        <div slot="content">所选时段内，平均每个账号访问了斗<br/>米后台次数</div>
                        <span>人均登录次数</span>
                    </el-tooltip>
                </p>
            </div>
            <div>
                <p class="num">{{account_active_info.activeAccountRatio}}%<span :class="{'up': account_active_info.activeAccountRatioChangePercent>0, 'down': account_active_info.activeAccountRatioChangePercent<=0}">{{account_active_info.activeAccountRatioChangePercent}}%</span></p>
                <p class="name">
                    <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                        <div slot="content">所选时段内，访问斗米后台账号占总<br/>账号比例</div>
                        <span>活跃账号占比</span>
                    </el-tooltip>
                </p>
            </div>
        </div>
        <div class="chart" v-loading="!getLogin_nums_end">
            <div class="table_title">
                <div class="title">人均登录次数</div>
                <div class="right">
                    <!-- <span class="download" @click="exportData('login_nums')">下载数据</span> -->
                    <span class="help">帮助
                        <div class="help_tip">
                            <div class="help_tip_title">数据指标说明</div>
                            <p><span>人均登录次数：</span>每日平均公司内每个账号访问斗米后台次数。</p>
                        </div>
                    </span>
                </div>
            </div>
            <div class="breadcrumb_wrap">
                <breadcrumb>
                    <template v-for="breadcrumb in breadcrumbs">
                        <a href="javascript:;" @click='changeBreadcrumbFn(breadcrumb.department_id)'>{{breadcrumb.department_name}}</a>
                    </template>
                </breadcrumb>
            </div>
            <chart-bar
                id="chart_bar_1"
                type="1"
                :xData="xData"
                :yData="yData"
                @clickFn="chartDataChangeFn"
            ></chart-bar>
            <div class="tip" v-if="yData.length">
                <p>注：只展示TOP10，更多数据请下载查看</p>
            </div>
            <div class="tip_nodata" v-else>暂无数据</div>
        </div>
        <div class="chart" v-loading="!getAccount_data_end">
            <div class="table_title">
                <div class="title">账号数据</div>
                <div class="right">
                    <span class="download" @click="exportData('account_data')">下载数据</span>
                    <span class="help">帮助
                        <div class="help_tip">
                            <div class="help_tip_title">数据指标说明</div>
                            <p><span>登录次数：</span>所选时段内，每个人的访问斗米后台次数。</p>
                            <p><span>日均登录次数：</span>所选时段内，每个人每日平均访问斗米后台次数。</p>
                        </div>
                    </span>
                </div>
            </div>
            <div class="table_wrap" v-loading="!isLoad">
                <el-table
                    :data="curTableData"
                    border
                    style="width: 100%"
                    height="443"
                    @sort-change="sortChangeFn"
                >
                    <el-table-column
                        prop="user_name"
                        label="姓名"
                        min-width="182">
                    </el-table-column>
                    <el-table-column
                        prop="department_name"
                        label="部门"
                        sortable="custom"
                        min-width="286">
                    </el-table-column>
                    <el-table-column
                        prop="nums"
                        label="登录次数"
                        min-width="158">
                    </el-table-column>
                    <el-table-column
                        prop="average_nums"
                        label="日均登录次数"
                        sortable="custom"
                        min-width="158">
                    </el-table-column>
                </el-table>
                <div class="pagination_wrap">
                    <div class="pagination">
                        <el-pagination
                            @current-change="handleCurrentChange"
                            :current-page.sync="currentPage"
                            :page-size="10"
                            layout="prev, pager, next"
                            :total="allTableData.length">
                        </el-pagination>
                    </div>
                    <div class="total">共 {{allTableData.length}} 条</div>
                </div>
            </div>
        </div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

import tjtop from '@/components/common/TJtop'
import breadcrumb from '@/components/common/breadcrumb'
import ChartBar from '@/components/common/ChartBar'

export default {
  	name: 'TJactive',
    components: {
        tjtop,
        breadcrumb,
        ChartBar
    },
  	data () {
    	return {
            team_id: 0,
            department_id: 0,
            date: {
                date:[new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 7), new Date().setTime(new Date().getTime() - 3600 * 1000 * 24)]
            },
            // 传入组件的 自定义快捷项
            shortcuts: [
                {
                    text: '最近一周',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        end.setTime(end.getTime() - 3600 * 1000 * 24);
                        picker.$emit('pick', [start, end]);
                    }
                },
                
            ],
            xData: [],
            yData: [],
            breadcrumbs: [
                // {
                //     department_id: 0,
                //     department_name: '全部'
                // }
            ],
            account_active_info: {
                "loginAccountNums": '--',
                "loginAccountNumsChangePercent": '--',
                "averageLoginNums": '--',
                "averageLoginNumsChangePercent": '--',
                "activeAccountRatio": '--',
                "activeAccountRatioChangePercent": '--'
            },//核心指标
            // login_nums: [],//人均登录次数
            curTableData: [],//账号数据--当前页
            allTableData: [],//账号数据--所有
            isLoad: false,//账号数据是否加载完毕
            currentPage: 1,
            getLogin_nums_end: false,
            getAccount_data_end: false,
    	}
  	},
  	methods: {
    	init() {
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id;
            
            this.getAccount_active_info()//核心指标
            this.getLogin_nums()//人均登录次数
            this.getAccount_data()//账号数据
    	},
        getAccount_active_info(){
            this.account_active_info = {
                "loginAccountNums": '--',
                "loginAccountNumsChangePercent": '--',
                "averageLoginNums": '--',
                "averageLoginNumsChangePercent": '--',
                "activeAccountRatio": '--',
                "activeAccountRatioChangePercent": '--'
            }
            util.ajax({
                url: '/stats/account_active_info',
                type:'GET',
                data: {
                    team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                },
                success: (res) => {
                    // console.log('核心指标')
                    // console.log(res)
                    if(res.errno == 0 && res.data.loginAccountNums !== undefined){
                        // this.account_active_info = res.data
                        // 格式化数据
                        this.account_active_info = {
                            loginAccountNums: res.data.loginAccountNums,
                            loginAccountNumsChangePercent: Math.abs(res.data.loginAccountNumsChangePercent*100).toFixed(2),
                            averageLoginNums: res.data.averageLoginNums == 0 ? 0 : (res.data.averageLoginNums/1).toFixed(1),
                            averageLoginNumsChangePercent: Math.abs(res.data.averageLoginNumsChangePercent*100).toFixed(2),
                            activeAccountRatio: res.data.activeAccountRatio == 0 ? 0 : (res.data.activeAccountRatio/1*100).toFixed(1),
                            activeAccountRatioChangePercent: Math.abs(res.data.activeAccountRatioChangePercent*100).toFixed(2)
                        }
                    }
                },
                error: (xhr, status) => {
                    console.log(xhr)
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
        getLogin_nums(){
            // this.login_nums = []
            this.getLogin_nums_end = false
            util.ajax({
                url: '/stats/login_nums',
                type:'GET',
                data: {
                    team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                    department_id: this.department_id,
                },
                success: (res) => {
                    // console.log('人均登录次数')
                    // console.log(res)
                    if(res.errno == 0){
                        //第一次请求来的 根部门 放入 面包屑数组
                        if(!this.breadcrumbs.length){
                            this.breadcrumbs.push({
                                department_id: 0,
                                department_name: res.data.cur.name
                            })
                        }

                        let tempX = [Number(res.data.cur.nums).toFixed(1)]
                        let tempY = [res.data.cur.name]//当前部门数据
                        res.data.sub.forEach((obj) => {//循环子部门数据
                            tempX.push(Number(obj.nums).toFixed(1))
                            tempY.push(obj.name+'&&&'+obj.department_id)
                        })
                        this.xData = tempX
                        this.yData = tempY
                    }
                    this.getLogin_nums_end = true
                },
                error: (xhr, status) => {
                    console.log(xhr)
                    this.getLogin_nums_end = true
                },
                noNetwork: () => {
                    this.getLogin_nums_end = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络',
                        type: 'warning'
                    });
                }
            })
        },
        getAccount_data() {
            this.getAccount_data_end = false
            util.ajax({
                url: '/stats/account_data',
                type:'GET',
                data: {
                    team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                },
                success: (res) => {
                    // console.log('账号数据')
                    // console.log(res)
                    if(res.errno == 0){
                        this.allTableData = res.data
                        this.curTableData = this.allTableData.slice(this.currentPage*10-10,this.currentPage*10)
                        this.isLoad = true
                    }
                    this.getAccount_data_end = true
                },
                error: (xhr, status) => {
                    this.getAccount_data_end = true
                    console.log(xhr)
                },
                noNetwork: () => {
                    this.getAccount_data_end = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络',
                        type: 'warning'
                    });
                }
            })
        },
        dateChange() {
            console.log(this.date)
            this.getAccount_active_info()//核心指标
            this.getLogin_nums()//人均登录次数
            this.getAccount_data()//账号数据
        },
        handleCurrentChange() {
            console.log(this.currentPage)
            this.curTableData = this.allTableData.slice(this.currentPage*10-10,this.currentPage*10)
        },
        sortChangeFn({ column, prop, order }){
            // console.log(column)
            // console.log(prop)
            // console.log(order)
            if(prop === 'department_name'){
                this.allTableData.sort((a,b) => {
                    // console.log(a)
                    // console.log(a.department_name.localeCompare(b.department_name))
                    if(order === 'ascending'){
                        return a.department_name.localeCompare(b.department_name)
                    }else if(order === 'descending'){
                        return - a.department_name.localeCompare(b.department_name)
                    }
                })
            }else if(prop === 'average_nums'){
                this.allTableData.sort((a,b) => {
                    if(order === 'ascending'){
                        return a.average_nums - b.average_nums
                    }else if(order === 'descending'){
                        return b.average_nums - a.average_nums
                    }
                })
            }

            this.curTableData = this.allTableData.slice(this.currentPage*10-10,this.currentPage*10)
        },
        chartDataChangeFn(data){
            // console.log(data)
            this.department_id = data.department_id
            this.breadcrumbs.push({
                department_id: data.department_id,
                department_name: data.department_name
            })
            this.getLogin_nums()
        },
        changeBreadcrumbFn(id){
            for(let i = 0;i < this.breadcrumbs.length;i ++){
                if(this.breadcrumbs[i].department_id == id && i+1<this.breadcrumbs.length){//删除当前点击之后的 并且 点击的不是最后一个
                    // console.log(id)
                    this.breadcrumbs.splice(i+1)
                    //请求对应部门数据
                    this.department_id = id
                    this.getLogin_nums()
                    break
                }
            }
        },
        exportData(url){
            // console.log(url)
            let downloadUrl = util.host + '/sea/api/1.0/client/v1/stats/'+url+'?dmclient=pcweb&team_id='+this.team_id+'&begin_date='+util.getLocalTime(this.date.date[0], 'yyyy-MM-dd')+'&end_date='+util.getLocalTime(this.date.date[1], 'yyyy-MM-dd')+'&export=1'
            location.href = downloadUrl
        },
  	},
  	mounted() {
    	this.init()
  	},
  	// watch: {
  	//   '$route' (to, from) {
  	//     // 对路由变化作出响应...
   //      this.init()
  	//   }
  	// }
}
</script>
<style>
.tjactive .el-table__body-wrapper{
    overflow: hidden;
}
.tjactive .el-table td, .tjactive .el-table th{
    height: 40px;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tjactive{
    padding: 0 20px;
}

.tjactive .main_data{
    display: flex;
    height: 151px;
}
.tjactive .main_data>div{
    margin-right: 47px;
}
.tjactive .main_data>div .num{
    font-family: 'SFUIDisplay';
    font-size: 32px;
    line-height: 38px;
    color: #475669;
    margin-top: 44px;
}
.tjactive .main_data>div .num>span{
    display: inline-block;
    height: 13px;
    line-height: 12px;
    text-indent: 14px;
    margin-left: 8px;
    font-size: 12px;
    color: #8492a6;
}
.tjactive .main_data>div .num>span.up{
    background: url(../assets/imgs/statistic/up.svg) left center no-repeat;
}
.tjactive .main_data>div .num>span.down{
    background: url(../assets/imgs/statistic/down.svg) left center no-repeat;
}
.tjactive .main_data>div .name{
    font-size: 12px;
    line-height: 17px;
    color: #8492a6;
    margin-top: 8px;
}

.tjactive .chart .table_title{
    border-bottom: 1px solid #e0e6ed;
}
.tjactive .chart .table_title:after{
    content: '';
    display: block;
    clear:both;
}
.tjactive .chart .table_title .title{
    float: left;
    line-height: 27px;
    font-size: 16px;
    font-weight: bold;
    color: #475669; 
    margin-bottom: 14px;
}
.tjactive .chart .table_title .btns{
    float: left;
    margin-left: 16px;
}
.tjactive .chart .table_title .right{
    float: right;
    height: 27px;
    line-height: 27px;
    /*margin-bottom: 14px;*/
}
.tjactive .chart .table_title .right>span{
    display: inline-block;
    text-indent: 19px;
    font-size: 14px;
    font-weight: 500;
    color: #6699ee;
}
.tjactive .chart .table_title .right>span.download{
    background: url(../assets/imgs/statistic/download.svg) left center no-repeat;
    margin-right: 13px;
    cursor: pointer;
}
.tjactive .chart .table_title .right>span.download:active{
    color: #517ed6;
}
.tjactive .chart .table_title .right>span.help{
    position: relative;
    background: url(../assets/imgs/statistic/help.svg) left center no-repeat;
}
.tjactive .chart .table_title .right>span.help:after{
    content: '';
    position: absolute;
    width: 100%;
    height: 10px;
    top:22px;
    right: 0;
}
.tjactive .chart .table_title .right>span.help .help_tip{
    display: none;
    position: absolute;
    z-index: 9999;
    right:0;
    top:29px;
    width: 313px;
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.07);
    border: solid 1px #e0e6ed;
    padding: 0 20px 8px;
}
.tjactive .chart .table_title .right>span.help:hover .help_tip{
    display: block;
}
.tjactive .chart .table_title .right>span.help .help_tip:after{
    content: '';
    position: absolute;
    right:16px;
    top:-5px;
    width: 7px;
    height: 7px;
    background: #fff;
    border-top: solid 1px #e0e6ed;
    border-right: solid 1px #e0e6ed;
    transform: rotate(-45deg)
}
.tjactive .chart .table_title .right>span.help .help_tip .help_tip_title{
    height: 46px;
    line-height: 46px;
    font-size: 13px;
    font-weight: bold;
    color: #99a9bf;
    text-indent: 0;
    border-bottom:1px solid #e0e6ed;
    margin-bottom: 16px;
}
.tjactive .chart .table_title .right>span.help .help_tip>p{
    color: #5e6d82;
    font-weight: 350;
    font-size: 12px;
    line-height: 22px;
    text-indent: 0;
    margin-bottom:12px;
}
.tjactive .chart .table_title .right>span.help .help_tip>p:nth-of-type(2n){
    background: #f5f7f9;
}
.tjactive .chart .table_title .right>span.help .help_tip>p>span{
    color: #5e6d82;
    font-weight: bold;
}

.tjactive .chart .breadcrumb_wrap{
    height: 50px;
    padding-top: 7px;
}
.tjactive .chart .breadcrumb_wrap .breadcrumb{
    padding-top: 13px;
}
.tjactive .chart .breadcrumb_wrap .breadcrumb .wraper a{
    font-weight: normal;
}
.tjactive .chart .breadcrumb_wrap .breadcrumb .wraper a:last-child{
    color: #99a9bf;
}
.tjactive .chart .legend_wrap{
    height: 65px;
    line-height: 18px;
}
.tjactive .chart .legend_wrap .left{
    float: left;
    font-size: 13px;
    color: #99a9bf;
    margin-top: 24px;
}
.tjactive .chart .legend_wrap .left>span{
    font-size: 14px;
    font-weight: 500;
    color: #5e6d82;
    margin-left: 5px;
}
.tjactive .chart .legends{
    float: right;
    height: 18px;
    margin-top: 24px;
}
.tjactive .chart .legends .legend{
    font-size: 12px;
    color: #5e6d82;
    float: left;
    margin-left: 16px;
}
.tjactive .chart .legends .legend>span{
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
}
.tjactive .chart .tip{
    height: 50px;
}
.tjactive .chart .tip_nodata{
    height: 200px;
    line-height: 140px;
    text-align: center;
    font-size: 14px;
    color: #c0ccda;
}
.tjactive .chart .tip p{
    font-size: 12px;
    text-align: center;
    color: #99a9bf;
}

.tjactive .chart .table_wrap{
    margin-top:16px;
}
.tjactive .chart .table_wrap .pagination_wrap{
    float: right;
    margin-bottom: 40px;
}
.tjactive .chart .table_wrap .pagination_wrap{
    content: '';
    display: block;
    clear:all;
}
.tjactive .chart .table_wrap .pagination_wrap .pagination{
    float: right;
}
.tjactive .chart .table_wrap .pagination_wrap .total{
    float: right;
    margin: 10px 10px 0 0;
    font-size: 13px;
    color: #5e6d82;
    line-height: 28px;
}
</style>
