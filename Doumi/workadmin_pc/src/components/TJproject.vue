<template>
  	<div class="tjproject">
        <tjtop
            title="概览"
            :show_sel_date="false"
            :date="date"
            :shortcuts="shortcuts"
            :month-num="12"
            @dateChange="dateChange"
        ></tjtop>
        <div class="main_data">
            <template v-for="item in statistics_num">
                <div v-if="item.type == 'ongoingProjectsNum'">
                    <p class="num">{{item.num}}</p>
                    <p class="name">
                        <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                            <div slot="content">当前状态处于进行中的项目总和</div>
                            <span>进行中项目</span>
                        </el-tooltip>
                    </p>
                </div>
                <div v-if="item.type == 'newProjectsNum'">
                    <p class="num">{{item.num}}<span :class="{'up': item.ratio==='up', 'down': item.ratio==='down'}">{{item.increaseInLoopRatio}}%</span></p>
                    <p class="name">
                        <el-tooltip :enterable="false" transition="none" effect="dark" content="30日内，新增的项目总和" placement="bottom">
                            <span>30日新增项目</span>
                        </el-tooltip>
                    </p>
                </div>
                <div v-if="item.type == 'activeProjectsNum'">
                    <p class="num">{{item.num}}<span :class="{'up': item.ratio==='up', 'down': item.ratio==='down'}">{{item.increaseInLoopRatio}}%</span></p>
                    <p class="name">
                        <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                            <div slot="content">30日内，活跃的项目总和</div>
                            <span>30日活跃项目</span>
                        </el-tooltip>
                    </p>
                </div>
            </template>
        </div>
        <div class="chart" v-loading="!getStatistics_end">
            <div class="table_title">
                <div class="title">30日趋势</div>
            </div>
            <div class="legend_wrap">
                <div class="tabs_wrap">
                    <el-tabs v-model="tabs1" @tab-click="handleClick1">
                        <el-tab-pane label="新增项目" name="1-1"></el-tab-pane>
                        <el-tab-pane label="活跃项目" name="1-2"></el-tab-pane>
                        <el-tab-pane label="新增员工" name="1-3"></el-tab-pane>
                        <el-tab-pane label="出勤员工" name="1-4"></el-tab-pane>
                        <el-tab-pane label="位置上报人数" name="1-5"></el-tab-pane>
                        <el-tab-pane label="投保人数" name="1-6"></el-tab-pane>
                        <el-tab-pane label="支付工资" name="1-7"></el-tab-pane>
                    </el-tabs>
                </div>
                <div class="legends">
                    <div class="legend"><span style="background:#84aef5;"></span>{{legend1}}</div>
                </div>
            </div>
            <chart-line
                id="chart_line_1"
                :xData="xData1"
                :yData="yData1"
            ></chart-line>
        </div>
        <div class="chart" v-loading="!getStatistics_end||!getDepartmentDataEnd" style="margin-bottom:80px;">
            <div class="table_title">
                <div class="title">30日项目分布</div>
                <div class="btns">
                    <el-radio-group v-model="radio" @change="radioChangeFn">
                        <el-radio-button label="按城市"></el-radio-button>
                        <el-radio-button label="按部门"></el-radio-button>
                    </el-radio-group>
                </div>
            </div>
            <div class="legend_wrap">
                <div class="tabs_wrap">
                    <el-tabs v-model="tabs2" @tab-click="handleClick2">
                        <el-tab-pane label="活跃项目" name="2-1"></el-tab-pane>
                        <el-tab-pane label="新增项目" name="2-2"></el-tab-pane>
                    </el-tabs>
                </div>
                <div class="legends">
                    <div class="legend"><span style="background:#84aef5;"></span>{{legend2}}</div>
                </div>
            </div>
            <div class="breadcrumb_wrap" v-if="radio === '按部门'">
                <breadcrumb>
                    <template v-for="breadcrumb in breadcrumbs">
                        <a href="javascript:;" @click='changeBreadcrumbFn(breadcrumb.department_id)'>{{breadcrumb.department_name}}</a>
                    </template>
                </breadcrumb>
            </div>
            <chart-bar
                id="chart_bar_1"
                type="1"
                :xData="xData2"
                :yData="yData2"
                @clickFn="chartDataChangeFn"
            ></chart-bar>
            <div class="tip_nodata" v-if="!yData2.length">暂无数据</div>
        </div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

import tjtop from '@/components/common/TJtop'
import breadcrumb from '@/components/common/breadcrumb'
import ChartLine from '@/components/common/ChartLine'
import ChartBar from '@/components/common/ChartBar'

export default {
  	name: 'TJproject',
    components: {
        tjtop,
        breadcrumb,
        ChartLine,
        ChartBar
    },
  	data () {
    	return {
            team_id: 0,
            date: {
                // date:[new Date().setTime(new Date().getTime() - 3600 * 1000 * 24 * 7), new Date().setTime(new Date().getTime() - 3600 * 1000 * 24)]
            },
            // 传入组件的 自定义快捷项
            shortcuts: [
                // {
                //     text: '最近一周',
                //     onClick(picker) {
                //         const end = new Date();
                //         const start = new Date();
                //         start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                //         end.setTime(end.getTime() - 3600 * 1000 * 24);
                //         picker.$emit('pick', [start, end]);
                //     }
                // },
                
            ],
            statistics_num: [
                {
                    "type": "ongoingProjectsNum",
                    "num": '--'
                },
                {
                    "type": "newProjectsNum",
                    "num": '--',
                    "increaseInLoopRatio": '--'
                },
                {
                    "type": "activeProjectsNum",
                    "num": '--',
                    "increaseInLoopRatio": '--'
                }
            ],
            getStatistics_end: false,
            getDepartmentDataEnd: true,
            statistics: [],
            xData1: [],//日期
            yData1: [
                // {
                //     name: '录用',
                //     data: [1,2,3,4,5,6,7],
                //     color: '#7fc25d'
                // },
                // {
                //     name: '通过初筛',
                //     data: [7,6,5,4,3,2,1],
                //     color: '#86b0f6'
                // }
            ],
            xData2: [],
            yData2: [],
            tabs1: '1-1',
            tabs2: '2-1',
            legend1: '新增项目数',
            legend2: '活跃项目数',
            radio: '按城市',
            breadcrumbs: [
                // {
                //     department_id: 0,
                //     department_name: '全部'
                // }
            ],
    	}
  	},
  	methods: {
    	init() {
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id;
            
            this.getStatistics()
            this.getStatisticsNum()
            
    	},
        dateChange() {
            console.log(this.date)
        },
        handleClick1(tab, event){
            // console.log(tab, event)
            // console.log(tab.name)
            // this.tabs1 = tab.name
            let index = 0
            let name = '新增员工数'

            switch(tab.name){
                case '1-1':
                    index = 2
                    this.legend1 = name = '新增项目数'
                break;
                case '1-2':
                    index = 3
                    this.legend1 = name = '活跃项目数'
                break;
                case '1-3':
                    index = 4
                    this.legend1 = name = '新增员工数'
                break;
                case '1-4':
                    index = 5
                    this.legend1 = name = '出勤人数'
                break;
                case '1-5':
                    index = 6
                    this.legend1 = name = '上报人数'
                break;
                case '1-6':
                    index = 7
                    this.legend1 = name = '投保人数'
                break;
                case '1-7':
                    index = 8
                    this.legend1 = name = '支付金额'
                break;
            }

            let tempX = []
            let tempY = [{
                name: name,
                data: [],
                color: '#79a8f6'
            }]
            this.statistics[index].detail.forEach((obj) => {
                tempX.push(util.getLocalTime(obj.x*1000, 'yyyy-MM-dd'))
                tempY[0].data.push(Number(obj.y))
            })
            // console.log(tempX)
            // console.log(tempY)
            this.xData1 = tempX
            this.yData1 = tempY
        },
        handleClick2(tab, event){
            // console.log(tab, event)
            // console.log(tab.name)
            // console.log(this.radio)

            if(this.radio === '按城市'){
                let index = 0
                let tempX = []
                let tempY = []
                if(tab.name === '2-1'){
                    index = 1
                    this.legend2 = '活跃项目数'
                }else if(tab.name === '2-2'){
                    index = 0
                    this.legend2 = '新增项目数'
                }
                
                this.statistics[index].detail.forEach((obj) => {
                    tempX.push(Number(obj.y))
                    tempY.push(obj.x)
                })
                this.xData2 = tempX
                this.yData2 = tempY
            }else if(this.radio === '按部门'){
                if(tab.name === '2-1'){
                    this.legend2 = '活跃项目数'
                }else if(tab.name === '2-2'){
                    this.legend2 = '新增项目数'
                }
                let lab = tab.name === '2-1' ? 2 : 1
                this.getDepartmentData(0, lab)

                // if(tab.name === '2-1'){
                //     this.legend2 = '活跃项目数'
                //     index = 3
                // }else if(tab.name === '2-2'){
                //     index = 2
                //     this.legend2 = '新增项目数'
                // }
                // this.breadcrumbs = [{
                //     department_id: this.statistics[index].detail[0].id,
                //     department_name: this.statistics[index].detail[0].name || '暂无部门名称'
                // }]
                // this.statistics[index].detail.forEach((obj) => {
                //     tempX.push(Number(obj.num))
                //     tempY.push(obj.name+'&&&'+obj.id)
                // })
            }
            
        },
        radioChangeFn(val){
            // console.log(val)
            this.breadcrumbs = []
            this.handleClick2({name: this.tabs2})
        },
        chartDataChangeFn(data){//柱状图点击
            console.log(data)
            this.breadcrumbs.push({
                department_id: data.department_id,
                department_name: data.department_name
            })
            let lab = this.tabs2 === '2-1' ? 2 : 1
            
            this.getDepartmentData(data.department_id, lab)
        },
        getDepartmentData(department_id, lab){
            console.log(department_id,lab)
            this.getDepartmentDataEnd = false
            util.ajax({
                url: '/team/statistics/department/get',
                type:'GET',
                data: {
                    team_id: this.team_id,
                    department_id: department_id,
                    type: lab
                },
                success: (res) => {
                    console.log('30日项目分布(按部门)')
                    console.log(res)
                    if(res.errno == 0){
                        //第一次请求来的 根部门 放入 面包屑数组
                        if(!this.breadcrumbs.length){
                            this.breadcrumbs.push({
                                department_id: 0,
                                department_name: res.data.name
                            })
                        }
                        let tempX = []
                        let tempY = []
                        res.data.departmentList.forEach((obj) => {//循环子部门数据
                            tempX.push(Number(obj.num))
                            tempY.push(obj.name+'&&&'+obj.id)
                        })
                        res.data.userList.forEach((obj) => {//循环当前部门下人员
                            tempX.push(Number(obj.num))
                            tempY.push(obj.name)
                        })
                        this.xData2 = tempX
                        this.yData2 = tempY
                    }
                    this.getDepartmentDataEnd = true
                },
                error: (xhr, status) => {
                    this.getDepartmentDataEnd = true
                    console.log(xhr)
                },
                noNetwork: () => {
                    this.getDepartmentDataEnd = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络',
                        type: 'warning'
                    });
                }
            })
        },
        changeBreadcrumbFn(id){
            for(let i = 0;i < this.breadcrumbs.length;i ++){
                if(this.breadcrumbs[i].department_id == id && i+1<this.breadcrumbs.length){//删除当前点击之后的 并且 点击的不是最后一个
                    // console.log(id)
                    this.breadcrumbs.splice(i+1)
                    //请求对应部门数据
                    let lab = this.tabs2 === '2-1' ? 2 : 1
                    this.getDepartmentData(id, lab)
                    break
                }
            }
        },
        getStatistics(){
            // this.statistics_num = [
            //     {
            //         "type": "ongoingProjectsNum",
            //         "num": '--'
            //     },
            //     {
            //         "type": "newProjectsNum",
            //         "num": '--',
            //         "increaseInLoopRatio": '--'
            //     },
            //     {
            //         "type": "activeProjectsNum",
            //         "num": '--',
            //         "increaseInLoopRatio": '--'
            //     }
            // ]
            this.getStatistics_end = false
            util.ajax({
                url: '/team/statistics/get',
                type:'GET',
                data: {
                    team_id: this.team_id,
                },
                timeout: 20000,
                success: (res) => {
                    console.log('其他所有数据')
                    console.log(res)
                    //30日趋势
                    this.statistics = res.data
                    let tempX1 = []
                    let tempY1 = [{
                        name: '新增项目数',
                        data: [],
                        color: '#79a8f6'
                    }]
                    this.statistics[2].detail.forEach((obj) => {
                        tempX1.push(util.getLocalTime(obj.x*1000, 'yyyy-MM-dd'))
                        tempY1[0].data.push(Number(obj.y))
                    })
                    // console.log(tempX1)
                    // console.log(tempY1)
                    this.xData1 = tempX1
                    this.yData1 = tempY1

                    //30日项目分布--按城市--活跃
                    let tempX2 = []
                    let tempY2 = []
                    this.statistics[1].detail.forEach((obj) => {
                        tempX2.push(Number(obj.y))
                        tempY2.push(obj.x)
                    })
                    this.xData2 = tempX2
                    this.yData2 = tempY2

                    this.getStatistics_end = true
                },
                error: (xhr, status) => {
                    this.getStatistics_end = true
                    console.log(xhr)
                },
                noNetwork: () => {
                    this.getStatistics_end = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络',
                        type: 'warning'
                    });
                }
            })
        },
        getStatisticsNum(){
            this.statistics_num = [
                {
                    "type": "ongoingProjectsNum",
                    "num": '--'
                },
                {
                    "type": "newProjectsNum",
                    "num": '--',
                    "increaseInLoopRatio": '--'
                },
                {
                    "type": "activeProjectsNum",
                    "num": '--',
                    "increaseInLoopRatio": '--'
                }
            ]
            util.ajax({
                url: '/team/statistics/num/get',
                type:'GET',
                data: {
                    team_id: this.team_id,
                },
                success: (res) => {
                    // console.log('核心指标')
                    // console.log(res)
                    // res.data = [
                    //     {
                    //         "type": "ongoingProjectsNum",
                    //         "num": 123
                    //     },
                    //     {
                    //         "type": "newProjectsNum",
                    //         "num": 456,
                    //         "increaseInLoopRatio": 0.34234
                    //     },
                    //     {
                    //         "type": "activeProjectsNum",
                    //         "num": 789,
                    //         "increaseInLoopRatio": -0.231173
                    //     }
                    // ]
                    res.data.forEach((obj) => {
                        if(obj.increaseInLoopRatio !== undefined){
                            obj.ratio = obj.increaseInLoopRatio > 0 ? 'up' : 'down'
                            obj.increaseInLoopRatio = Math.abs(obj.increaseInLoopRatio*100).toFixed(2)
                        }
                    })
                    this.statistics_num = res.data
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
        }
  	},
  	mounted() {
    	this.init()
  	},
  	// watch: {
   //      '$route' (to, from) {
   //          // 对路由变化作出响应...
   //          this.init()
   //      }
  	// }
}
</script>

<style>
.tjproject .chart .tabs_wrap .el-tabs__header{
    margin: 12px 0 0;
    border-bottom: none;
}
.tjproject .chart .tabs_wrap .el-tabs__header .el-tabs__active-bar{
    background-color: #6699ee;
}
.tjproject .chart .tabs_wrap .el-tabs__header .el-tabs__item{
    color: #5e6d82;
    padding: 0 8px;
}
.tjproject .chart .tabs_wrap .el-tabs__header .el-tabs__item.is-active{
    color: #6699ee;
    font-weight: bold;
}
.tjproject .chart .table_title .btns .el-radio-button__inner{
    padding: 6px 14px;
    font-size: 13px;
    color: #8492a6;
    /*border-color: #e0e6ed;*/
}
.tjproject .chart .table_title .btns .el-radio-button__orig-radio:checked+.el-radio-button__inner{
    color: #fff;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tjproject{
    padding: 0 20px;
}

.tjproject .main_data{
    display: flex;
    height: 151px;
}
.tjproject .main_data>div{
    margin-right: 47px;
}
.tjproject .main_data>div .num{
    font-family: 'SFUIDisplay';
    font-size: 32px;
    line-height: 38px;
    color: #475669;
    margin-top: 44px;
}
.tjproject .main_data>div .num>span{
    display: inline-block;
    height: 13px;
    line-height: 12px;
    text-indent: 14px;
    margin-left: 8px;
    font-size: 12px;
    color: #8492a6;
}
.tjproject .main_data>div .num>span.up{
    background: url(../assets/imgs/statistic/up.svg) left center no-repeat;
}
.tjproject .main_data>div .num>span.down{
    background: url(../assets/imgs/statistic/down.svg) left center no-repeat;
}
.tjproject .main_data>div .name{
    font-size: 12px;
    line-height: 17px;
    color: #8492a6;
    margin-top: 8px;
}

.tjproject .chart .table_title{
    border-bottom: 1px solid #e0e6ed;
}
.tjproject .chart .table_title:after{
    content: '';
    display: block;
    clear:both;
}
.tjproject .chart .table_title .title{
    float: left;
    line-height: 27px;
    font-size: 16px;
    font-weight: bold;
    color: #475669; 
    margin-bottom: 14px;
}
.tjproject .chart .table_title .btns{
    float: left;
    margin-left: 16px;
}
.tjproject .chart .table_title .right{
    float: right;
    height: 27px;
    line-height: 27px;
    /*margin-bottom: 14px;*/
}
.tjproject .chart .table_title .right>span{
    display: inline-block;
    text-indent: 19px;
    font-size: 14px;
    font-weight: 500;
    color: #6699ee;
}
.tjproject .chart .table_title .right>span.download{
    background: url(../assets/imgs/statistic/download.svg) left center no-repeat;
    margin-right: 13px;
    cursor: pointer;
}
.tjproject .chart .table_title .right>span.download:active{
    color: #517ed6;
}
.tjproject .chart .table_title .right>span.help{
    position: relative;
    background: url(../assets/imgs/statistic/help.svg) left center no-repeat;
}
.tjproject .chart .table_title .right>span.help:after{
    content: '';
    position: absolute;
    width: 100%;
    height: 10px;
    top:22px;
    right: 0;
}
.tjproject .chart .table_title .right>span.help .help_tip{
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
.tjproject .chart .table_title .right>span.help:hover .help_tip{
    display: block;
}
.tjproject .chart .table_title .right>span.help .help_tip:after{
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
.tjproject .chart .table_title .right>span.help .help_tip .help_tip_title{
    height: 46px;
    line-height: 46px;
    font-size: 13px;
    font-weight: bold;
    color: #99a9bf;
    text-indent: 0;
    border-bottom:1px solid #e0e6ed;
    margin-bottom: 16px;
}
.tjproject .chart .table_title .right>span.help .help_tip>p{
    color: #5e6d82;
    font-weight: 350;
    font-size: 12px;
    line-height: 22px;
    text-indent: 0;
    margin-bottom:12px;
}
.tjproject .chart .table_title .right>span.help .help_tip>p:nth-of-type(2n){
    background: #f5f7f9;
}
.tjproject .chart .table_title .right>span.help .help_tip>p>span{
    color: #5e6d82;
    font-weight: bold;
}

.tjproject .chart .breadcrumb_wrap{
    height: 28px;
    /*padding-top: 7px;*/
}
.tjproject .chart .breadcrumb_wrap .breadcrumb{
    padding:0;
}
.tjproject .chart .breadcrumb_wrap .breadcrumb .wraper a{
    font-weight: normal;
}
.tjproject .chart .breadcrumb_wrap .breadcrumb .wraper a:last-child{
    color: #99a9bf;
}
.tjproject .chart .legend_wrap{
    height: 65px;
    line-height: 18px;
    margin-bottom: 12px;
}
/*.tjproject .chart .legend_wrap .left{
    float: left;
    font-size: 13px;
    color: #99a9bf;
    margin-top: 24px;
}
.tjproject .chart .legend_wrap .left>span{
    font-size: 14px;
    font-weight: 500;
    color: #5e6d82;
    margin-left: 5px;
}*/
.tjproject .chart .tabs_wrap{
    float: left;
}
.tjproject .chart .legends{
    float: right;
    height: 18px;
    margin-top: 24px;
}
.tjproject .chart .legends .legend{
    font-size: 12px;
    color: #5e6d82;
    float: left;
    margin-left: 16px;
}
.tjproject .chart .legends .legend>span{
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
}
.tjproject .chart .tip{
    height: 50px;
}
.tjproject .chart .tip_nodata{
    height: 200px;
    line-height: 140px;
    text-align: center;
    font-size: 14px;
    color: #c0ccda;
}
.tjproject .chart .tip p{
    font-size: 12px;
    text-align: center;
    color: #99a9bf;
}

.tjproject .chart .table_wrap{
    margin-top:16px;
}
.tjproject .chart .table_wrap .pagination_wrap{
    float: right;
    margin-bottom: 40px;
}
.tjproject .chart .table_wrap .pagination_wrap{
    content: '';
    display: block;
    clear:all;
}
.tjproject .chart .table_wrap .pagination_wrap .pagination{
    float: right;
}
.tjproject .chart .table_wrap .pagination_wrap .total{
    float: right;
    margin: 10px 10px 0 0;
    font-size: 13px;
    color: #5e6d82;
    line-height: 28px;
}
</style>
