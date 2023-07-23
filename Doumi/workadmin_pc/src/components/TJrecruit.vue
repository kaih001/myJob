<template>
  	<div class="tjrecruit">
        <tjtop
            title="招聘概览"
            :show_sel_date="true"
            :date="date"
            :shortcuts="shortcuts"
            :month-num="12"
            @dateChange="dateChange"
        ></tjtop>
        <div class="main_data">
            <div>
                <p class="num">{{apply_info.all_apply_num}}</p>
                <p class="name">
                    <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                        <div slot="content">从注册斗米开始，截止当前日期全部<br/>报名量</div>
                        <span>历史累计报名量</span>
                    </el-tooltip>
                </p>
            </div>
            <div>
                <p class="num">{{apply_info.apply_num}}<span :class="{'up': apply_info.cr_apply_num>0, 'down': apply_info.cr_apply_num<=0}">{{apply_info.cr_apply_num=='--'?'--':Math.abs(apply_info.cr_apply_num)}}%</span></p>
                <p class="name">
                    <el-tooltip :enterable="false" transition="none" effect="dark" content="所选时段内，总报名量" placement="bottom">
                        <span>报名量</span>
                    </el-tooltip>
                </p>
            </div>
            <div>
                <p class="num">{{apply_info.expire_apply_rate}}%<span :class="{'up': apply_info.cr_expire_apply_rate>0, 'down': apply_info.cr_expire_apply_rate<=0}">{{apply_info.cr_expire_apply_rate=='--'?'--':Math.abs(apply_info.cr_expire_apply_rate)}}%</span></p>
                <p class="name">
                    <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                        <div slot="content">所选时段内，超过3天未联系占总报<br/>名用户比例</div>
                        <span>过期报名比例</span>
                    </el-tooltip>
                </p>
            </div>
            <div v-if="userInfo_B.role_id != 5 && apply_info.active_account_rate">
                <p class="num">{{apply_info.active_account_rate}}%<span :class="{'up': apply_info.cr_active_account_rate>0, 'down': apply_info.cr_active_account_rate<=0}">{{apply_info.cr_active_account_rate=='--'?'--':Math.abs(apply_info.cr_active_account_rate)}}%</span></p>
                <p class="name">
                    <el-tooltip :enterable="false" transition="none" effect="dark" placement="bottom">
                        <div slot="content">所选时段内，访问斗米后台账号占总<br/>账号比例</div>
                        <span>活跃账号占比</span>
                    </el-tooltip>
                </p>
            </div>
            <div>
                <p class="num">{{apply_info.online_post_num}}<span :class="{'up': apply_info.cr_online_post_num>0, 'down': apply_info.cr_online_post_num<=0}">{{apply_info.cr_online_post_num=='--'?'--':Math.abs(apply_info.cr_online_post_num)}}%</span></p>
                <p class="name">
                    <el-tooltip :enterable="false" transition="none" effect="dark" content="所选时段内，在线展示职位数量" placement="bottom">
                        <span>在线职位数</span>
                    </el-tooltip>
                </p>
            </div>
        </div>
        <div class="chart chart1" v-loading="!getChartDataEnd1">
            <div class="table_title">
                <div class="title">报名量趋势</div>
                <div class="right">
                    <span class="download" @click="showDownload(1)">下载报名量统计</span>
                    <span class="download" @click="showDownload(2)" v-if="userInfo_B.dl_apply_detail==1">下载报名用户信息</span>
                    <span class="help">帮助
                        <div class="help_tip">
                            <div class="help_tip_title">数据指标说明</div>
                            <p><span>总报名人数：</span>每日报名总人次。</p>
                            <p><span>待面试人数：</span>每日标记为通过初筛或者待面试的总人数。</p>
                            <p><span>录用人数：</span>每日标记为录用的人数。</p>
                            <p><span>淘汰人数：</span>每日标记为淘汰或者辞退的总人数。</p>
                            <p><span>过期人数：</span>报名后3天未处理的人数。</p>
                        </div>
                    </span>
                </div>
            </div>
            <div class="download_dialog">
                <!-- 报名统计下载弹窗 -->
                <el-dialog title="报名统计下载" :visible.sync="downloadInfo1.show">
                    <div class="download_dialog_main">
                        <p class="download_tip">请选择报名统计下载时间</p>
                        <div class="radio_wrap">
                            <el-radio class="radio" v-model="downloadInfo1.type" :label="0">按月下载</el-radio>
                            <el-radio class="radio" v-model="downloadInfo1.type" :label="1">按周下载</el-radio>
                        </div>
                        <div class="picker_wrap" v-if="downloadInfo1.type==0">
                            <el-date-picker
                                v-model="downloadInfo1.month_obj"
                                :clearable="false"
                                :editable="false"
                                type="month"
                                format="yyyy年MM月"
                                style="width:304px;"
                                placeholder="选择月"
                                :picker-options="monthOptions"
                            ></el-date-picker>
                        </div>
                        <div class="picker_wrap" v-if="downloadInfo1.type==1">
                            <el-date-picker
                                v-model="downloadInfo1.week_obj"
                                :clearable="false"
                                :editable="false"
                                type="week"
                                format="yyyy年第WW周"
                                placeholder="当前周"
                                style="width:304px;"
                                :picker-options="weekOptions"
                            ></el-date-picker>
                        </div>
                    </div>
                    <div class="download_dialog_foot">
                        <div class="btns">
                            <el-button @click="downloadInfo1.show = false">取 消</el-button>
                            <el-button type="primary" @click="confirmFn1">确 定</el-button>
                        </div>
                    </div>
                </el-dialog>
                <!-- 报名明细下载弹窗 -->
                <el-dialog title="报名明细下载" :visible.sync="downloadInfo2.show">
                    <div class="download_dialog_main">
                        <p class="download_tip">仅支持下载最近30天的报名信息</p>
                        <div class="download_date">
                            <div class="date_item start_date">
                                <span class="label">开始日期</span>
                                <el-date-picker
                                    v-model="downloadInfo2.startDate"
                                    :editable="false"
                                    :clearable="false"
                                    type="date"
                                    placeholder="选择日期"
                                    style="width:304px;"
                                    :picker-options="startOptions">
                                </el-date-picker>
                            </div>
                            <div class="date_item end_date">
                                <span class="label">结束日期</span>
                                <el-date-picker
                                    v-model="downloadInfo2.endDate"
                                    :editable="false"
                                    :clearable="false"
                                    type="date"
                                    placeholder="选择日期"
                                    style="width:304px;"
                                    :picker-options="endOptions">
                                </el-date-picker>
                            </div>
                            <div class="date_item yzm">
                                <span class="label">验证码</span>
                                <el-input v-model="downloadInfo2.code"
                                    placeholder="请输入内容"
                                    style="width:304px;"
                                ></el-input>
                                <span :class="getCodeTime<0?'tip':'tip sent'" @click="getCodeFn">{{getCodeTime<0?'发送手机验证码':getCodeTime+'s后重新发送'}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="download_dialog_foot">
                        <div class="btns">
                            <el-button @click="downloadInfo2.show = false">取 消</el-button>
                            <el-button type="primary" @click="confirmFn2">确 定</el-button>
                        </div>
                    </div>
                </el-dialog>
            </div>
            <div class="legend_wrap">
                <div class="tabs_wrap">
                    <el-tabs v-model="tabs1" @tab-click="handleClick1">
                        <el-tab-pane label="总报名人数" name="1-1"></el-tab-pane>
                        <el-tab-pane label="待面试人数" name="1-2"></el-tab-pane>
                        <el-tab-pane label="录用人数" name="1-3"></el-tab-pane>
                        <el-tab-pane label="淘汰人数" name="1-4"></el-tab-pane>
                        <el-tab-pane label="过期人数" name="1-5"></el-tab-pane>
                    </el-tabs>
                </div>
                <div class="legends">
                    <div class="legend"><span style="background:#84aef5;"></span>{{legend1}}</div>
                </div>
            </div>
            <div class="legend_wrap">
                <div class="left">
                    总计
                    <span style="margin-right:14px;">{{totalNums}}</span>
                    日均
                    <span>{{averageNums}}</span>
                </div>
               <!--  <div class="legends">
                    <div class="legend"><span style="background:#84aef5;"></span>报名量</div>
                </div> -->
            </div>
            <chart-line
                id="chart_line_1"
                :xData="xData1"
                :yData="yData1"
            ></chart-line>
        </div>
        <div class="chart chart2" v-loading="!getChartDataEnd2">
            <div class="table_title">
                <div class="title">报名量分布</div>
                <div class="btns" v-if="userInfo_B.role_id != 5">
                    <el-radio-group v-model="radio1" @change="radioChangeFn1">
                        <el-radio-button label="按城市"></el-radio-button>
                        <el-radio-button label="按部门"></el-radio-button>
                    </el-radio-group>
                </div>
                <div class="right">
                    <span class="download" v-if="radio1 === '按城市'" @click="exportData('downloadapplynumdistributecity')">下载数据</span>
                    <span class="download" v-else @click="exportData('downloadapplynumdistributedept')">下载数据</span>
                    <span class="help">帮助
                        <div class="help_tip">
                            <div class="help_tip_title">数据指标说明</div>
                            <p><span>按城市：</span>按照报名用户所在城市，统计每个城市报名总人次。</p>
                            <p><span>按部门：</span>按照职位发布者所属的部门，统计每个部门下所有职位的报名总人次。</p>
                        </div>
                    </span>
                </div>
            </div>
            <div class="breadcrumb_wrap">
                <breadcrumb v-if="radio1 === '按部门'">
                    <template v-for="breadcrumb in breadcrumbs1">
                        <a href="javascript:;" @click='changeBreadcrumbFn1(breadcrumb.department_id)'>{{breadcrumb.department_name}}</a>
                    </template>
                </breadcrumb>
            </div>
            <chart-bar
                id="chart_bar_1"
                type="1"
                :xData="xData2"
                :yData="yData2"
                @clickFn="chartDataChangeFn2"
            ></chart-bar>
            <div class="tip" v-if="yData2.length">
                <p>注：只展示TOP10，更多数据请下载查看</p>
            </div>
            <div class="tip_nodata" v-else>暂无数据</div>
        </div>
        <div class="chart chart3" v-loading="!getChartDataEnd3">
            <div class="table_title">
                <div class="title">过期报名占比</div>
                <div class="btns" v-if="userInfo_B.role_id != 5">
                    <el-radio-group v-model="radio2" @change="radioChangeFn2">
                        <el-radio-button label="按城市"></el-radio-button>
                        <el-radio-button label="按部门"></el-radio-button>
                    </el-radio-group>
                </div>
                <div class="right">
                    <span class="download" v-if="radio2 === '按城市'" @click="exportData('downloadapplyexpiredratiocity')">下载数据</span>
                    <span class="download" v-else @click="exportData('downloadapplyexpiredratiodept')">下载数据</span>
                    <span class="help">帮助
                        <div class="help_tip">
                            <div class="help_tip_title">数据指标说明</div>
                            <p><span>已过期：</span>用户报名3日内，职位发布者未和用户进行联系。</p>
                            <p><span>未过期：</span>用户报名3日内，职位发布者和报名用户使用电话，短信，在线沟通等方式进行过联系。</p>
                        </div>
                    </span>
                </div>
            </div>
            <div class="breadcrumb_wrap">
                <breadcrumb v-if="radio2 === '按部门'">
                    <template v-for="breadcrumb in breadcrumbs2">
                        <a href="javascript:;" @click='changeBreadcrumbFn2(breadcrumb.department_id)'>{{breadcrumb.department_name}}</a>
                    </template>
                </breadcrumb>
                <div class="legends" style="margin-top:15px;">
                    <div class="legend"><span style="background:#84aef5;"></span>已过期</div>
                    <div class="legend"><span style="background:#dfe4ea;"></span>未过期</div>
                </div>
            </div>
            <chart-bar
                id="chart_bar_2"
                type="2"
                :xData="xData3"
                :yData="yData3"
                @clickFn="chartDataChangeFn3"
            ></chart-bar>
            <div class="tip" v-if="yData3.length">
                <p>注：只展示TOP10，更多数据请下载查看</p>
            </div>
            <div class="tip_nodata" v-else>暂无数据</div>
        </div>
        <div class="chart chart4" v-loading="!getChartDataEnd4">
            <div class="table_title">
                <div class="title">报名转化率</div>
                <div class="right">
                    <span class="help">帮助
                        <div class="help_tip">
                            <div class="help_tip_title">数据指标说明</div>
                            <p><span>录用：</span>职位发布者在斗米后台标记，可以录用的报名用户数量。</p>
                            <p><span>待面试：</span>职位发布者在斗米后台标记，通过简历筛选的报名用户数量。</p>
                            <p><span>未处理：</span>职位发布者未进行任何标记的报名用户数量。</p>
                            <p><span>淘汰：</span>职位发布者在斗米后台标记，不符合要求被淘汰的报名用户数量。</p>
                            <p><span>已取消：</span>取消报名人数。</p>
                        </div>
                    </span>
                </div>
            </div>
            <div class="legend_wrap">
                <div class="legends">
                    <div class="legend"><span style="background:#7fc25d;"></span>录用</div>
                    <div class="legend"><span style="background:#86b0f6;"></span>待面试</div>
                    <div class="legend"><span style="background:#08aabf;"></span>未处理</div>
                    <div class="legend"><span style="background:#ff9a42;"></span>淘汰</div>
                    <div class="legend"><span style="background:#AA70B9;"></span>已取消</div>
                </div>
            </div>
            <chart-line
                id="chart_line_2"
                :xData="xData4"
                :yData="yData4"
            ></chart-line>
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
  	name: 'TJrecruit',
    components: {
        tjtop,
        breadcrumb,
        ChartLine,
        ChartBar
    },
  	data () {
        let _this = this
        let curDate = new Date()
    	return {
            team_id: 0,
            userInfo_B: {
                username: '',  
                role_id: 1,
                department_name: '',
                mobile: '',
                dl_apply_detail: 0,//是否可以下载报名明细
            },
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
            monthOptions: {//选择时间控件 选项
                disabledDate(time) {
                    // console.log(util.getLocalTime(time.getTime(),'yyyy-MM'))
                    return util.getLocalTime(time.getTime(),'yyyy-MM') >= util.getLocalTime(Date.now(),'yyyy-MM') || util.getLocalTime(time.getTime(),'yyyy-MM') < util.getLocalTime(Date.now() - 365*24*3600*1000,'yyyy-MM')
                }
            },
            weekOptions: {//选择时间控件 选项
                firstDayOfWeek: 1,
                disabledDate(time) {
                    // console.log(time)
                    let i = curDate.getDay() == 0 ? 7 : curDate.getDay()
                    // console.log(i)
                    return time.getTime() >= Date.now() - 8.64e7 - (i-1)*24*3600*1000 || time.getTime() < Date.now() - 8.64e7 - 365*24*3600*1000
                }
            },
            downloadInfo1: {
                show: false,
                type: 0,
                week_obj: this.lateWeek(),//选择的日期对象-周
                month_obj: this.lateMonth(),//选择的日期对象-周
                date: ''
            },
            downloadInfo2: {
                show: false,
                startDate: new Date(),
                endDate: new Date(),
                code: ''
            },
            getCodeEnd: true,
            getCodeTime: -1,
            timeInterval: null,
            startOptions: {
                disabledDate(time) {
                    if(_this.downloadInfo2.endDate){
                        return time.getTime() < Date.now() - 8.64e7 - 29*24*60*60*1000 || time.getTime() > _this.downloadInfo2.endDate.getTime()
                    }else{
                        return time.getTime() < Date.now() - 8.64e7 - 29*24*60*60*1000 || time.getTime() > Date.now() - 8.64e7
                    }
                }
            },
            endOptions: {
                disabledDate(time) {
                    if(_this.downloadInfo2.startDate){
                        return time.getTime() < _this.downloadInfo2.startDate.getTime() || time.getTime() > Date.now() - 8.64e7
                    }else{
                        return time.getTime() < Date.now() - 8.64e7 - 29*24*60*60*1000 || time.getTime() > Date.now() - 8.64e7
                    }
                }
            },
            tabs1: '1-1',
            legend1: '总报名人数',
            radio1: '按城市',
            radio2: '按城市',
            getChartDataEnd1: false,
            xData1: [],//日期
            yData1: [
                // {
                //     name: '录用',
                //     data: [1,2,3,4,5,6,7],
                //     color: '#7fc25d'
                // },
                // {
                //     name: '待面试',
                //     data: [7,6,5,4,3,2,1],
                //     color: '#86b0f6'
                // }
            ],
            getChartDataEnd2: false,
            xData2: [],
            yData2: [],
            getChartDataEnd3: false,
            xData3: [],
            yData3: [],
            getChartDataEnd4: false,
            xData4: [],
            yData4: [],
            breadcrumbs1: [
                // {
                //     id: 1,
                //     name: '全部'
                // }
            ],
            breadcrumbs2: [
                // {
                //     id: 1,
                //     name: '全部'
                // }
            ],
            //请求的原始数据
            apply_info: {//核心指标
                "all_apply_num": '--',//历史累计报名
                "apply_num": '--',//报名量
                "cr_apply_num": '--',//报名量变化
                "expire_apply_rate": '--',//过期报名
                "cr_expire_apply_rate": '--',//过期报名变化
                "active_account_rate": '--',//活跃账号比例
                "cr_active_account_rate": '--',//活跃账号变化
                "online_post_num": '--',//在线职位
                "cr_online_post_num": '--'//在线职位变化
            },
            totalNums: 0,
            averageNums: 0,
            apply_nums_tendency: {
                // date: [],//展示日期范围
                // apply_num: [],//总报名人数
                // interview_num: [],//待面试人数
                // hire_num: [],//录用人数
                // eliminate_num: [],//淘汰人数
                // expire_num: [],//过期人数
            },//报名量趋势
            apply_nums_distribute_groupcity: [],//报名量分布(按城市)
            apply_nums_distribute_groupdepartment: [],//报名量分布(按部门)
            apply_dispose_groupcity: [],//过期报名占比(按城市)
            apply_dispose_groupdepartment: [],//过期报名占比(按部门)
            apply_conversion: [],//报名转化率
    	}
  	},
  	methods: {
    	init() {
            console.log('B')
            //请求原始数据
            this.getUserInfo_B()//从B端获取的用户信息
            this.getApply_info()//核心指标
            this.getApply_nums_tendency()//报名量趋势
            // this.getApply_nums_distribute_groupcity()//报名量分布(按城市)
            // this.getApply_nums_distribute_groupdepartment(0)//报名量分布(按部门)
            // this.getApply_dispose_groupcity()//过期报名占比(按城市)
            // this.getApply_dispose_groupdepartment(0)//过期报名占比(按部门)
            // this.getApply_conversion()//报名转化率

            //根据当前窗口高度 请求数据
            let winHeight = $(window).height()
            if(winHeight > $('.chart2').offset().top){
                if(!this.intChart2) {
                    this.chartDataInitFn2()
                }
            }
            if(winHeight > $('.chart3').offset().top){
                if(!this.intChart3) {
                    this.chartDataInitFn3()
                }
            }
            if(winHeight > $('.chart4').offset().top){
                if(!this.intChart4) {
                    this.chartDataInitFn4()
                }
            }
            $('.tjrecruit').scroll(() => {
                let winHeight = $(window).height()
                if(winHeight > $('.chart2').offset().top){
                    if(!this.intChart2) {
                        this.chartDataInitFn2()
                    }
                }
                if(winHeight > $('.chart3').offset().top){
                    if(!this.intChart3) {
                        this.chartDataInitFn3()
                    }
                }
                if(winHeight > $('.chart4').offset().top){
                    if(!this.intChart4) {
                        this.chartDataInitFn4()
                    }
                }
            })
    	},
        lateMonth(){
            let curMonth = util.getLocalTime(Date.now(),'MM')
            // console.log(curMonth)
            for(let i = 1; true ; i ++){//遍历出上个月的最后一天(其实只要是上个月就可以)
                // console.log(util.getLocalTime(Date.now() - 24*3600*1000*i,'MM'))
                if(util.getLocalTime(Date.now() - 24*3600*1000*i,'MM')!=curMonth){
                    return new Date(Date.now() - i*24*3600*1000)
                }
            }
            
        },
        lateWeek(){
            let i = new Date().getDay() == 0 ? 7 : new Date().getDay()
            return new Date(Date.now() - (i+5)*24*3600*1000)//返回上个周二的时间
        },
        getUserInfo_B() {
            util.ajaxB({
                url: '/stat/apply/currentuser',
                type:'POST',
                data: {
                    // team_id: this.team_id,
                    // begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    // end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                },
                success: (res) => {
                    console.log('B端用户信息')
                    console.log(res)
                    if(res.code == 0){
                        this.userInfo_B = res.data
                        this.breadcrumbs1.push({
                            department_id: 0,
                            department_name: res.data.department_name || '当前部门'
                        })
                        this.breadcrumbs2.push({
                            department_id: 0,
                            department_name: res.data.department_name || '当前部门'
                        })
                    }
                },
                error: (xhr, status) => {
                    console.log(xhr)
                },
                noNetwork: () => {
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        },
        getApply_info() {//获取核心指标
            this.apply_info = {//核心指标
                "all_apply_num": '--',//历史累计报名
                "apply_num": '--',//报名量
                "cr_apply_num": '--',//报名量变化
                "expire_apply_rate": '--',//过期报名
                "cr_expire_apply_rate": '--',//过期报名变化
                "active_account_rate": '--',//活跃账号比例
                "cr_active_account_rate": '--',//活跃账号变化
                "online_post_num": '--',//在线职位
                "cr_online_post_num": '--'//在线职位变化
            }
            util.ajaxB({
                url: '/stat/apply/applyinfo',
                type:'POST',
                data: {
                    // team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                },
                success: (res) => {
                    console.log('核心指标')
                    console.log(res)
                    if(res.code == 0){
                        this.apply_info = res.data
                        // 格式化数据
                        // this.apply_info = {
                        //     allApplyNums: res.data.allApplyNums,
                        //     applyNums: res.data.applyNums,
                        //     applyNumsChangePercent: Math.abs(res.data.applyNumsChangePercent*100).toFixed(2),
                        //     expireApplyNumsRatio: res.data.expireApplyNumsRatio == 0 ? 0 : Math.abs(res.data.expireApplyNumsRatio*100).toFixed(1),
                        //     expireApplyNumsRatioChangePercent: Math.abs(res.data.expireApplyNumsRatioChangePercent*100).toFixed(2),
                        //     activeAccountNumsRatio: res.data.activeAccountNumsRatio == 0 ? 0 : Math.abs(res.data.activeAccountNumsRatio*100).toFixed(1),
                        //     activeAccountNumsRatioChangePercent: Math.abs(res.data.activeAccountNumsRatioChangePercent*100).toFixed(2),
                        //     onlinePostNums: res.data.onlinePostNums,
                        //     onlinePostNumsChangePercent: Math.abs(res.data.onlinePostNumsChangePercent*100).toFixed(2)
                        // }

                    }
                },
                error: (xhr, status) => {
                    console.log(xhr)
                },
                noNetwork: () => {
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        },
        handleClick1(tab, event){
            // console.log(tab, event)
            // console.log(tab.name)
            // this.tabs1 = tab.name
            let key = 'apply_num'
            let name = '新增员工数'

            switch(tab.name){
                case '1-1':
                    key = 'apply_num'
                    this.legend1 = name = '总报名人数'
                break;
                case '1-2':
                    key = 'interview_num'
                    this.legend1 = name = '待面试人数'
                break;
                case '1-3':
                    key = 'hire_num'
                    this.legend1 = name = '录用人数'
                break;
                case '1-4':
                    key = 'eliminate_num'
                    this.legend1 = name = '淘汰人数'
                break;
                case '1-5':
                    key = 'expire_num'
                    this.legend1 = name = '过期人数'
                break;
            }

            let totalNums = 0
            let tempX = []
            let tempY = [{
                name: name,
                data: [],
                color: '#79a8f6'
            }]
            this.apply_nums_tendency.forEach((obj) => {
                tempX.push(obj.date_time)
                tempY[0].data.push(Number(obj[key]))
                totalNums += Number(obj[key])
            })

            this.totalNums = totalNums
            this.averageNums = this.apply_nums_tendency.length ? Math.round(totalNums/this.apply_nums_tendency.length) : 0

            this.xData1 = tempX
            this.yData1 = tempY
        },
        getApply_nums_tendency() {//报名量趋势
            // [
            //     {
            //         "date": "2017-11-01",
            //         "nums": 35
            //     }
            // ]
            this.getChartDataEnd1 = false
            util.ajaxB({
                url: '/stat/apply/applynumtendency',
                type:'POST',
                data: {
                    // team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                },
                success: (res) => {
                    console.log('报名量趋势')
                    console.log(res)
                    if(res.code == 0){
                        
                        this.apply_nums_tendency = res.data

                        let totalNums = 0
                        let tempX = []
                        let tempY = [{
                                name: '总报名人数',
                                data: [],
                                color: '#84aef5'
                            }]
                        res.data.forEach((obj) => {
                            tempX.push(obj.date_time)
                            tempY[0].data.push(Number(obj.apply_num))
                            totalNums += Number(obj.apply_num)
                        })

                        this.totalNums = totalNums
                        this.averageNums = res.data.length ? Math.round(totalNums/res.data.length) : 0

                        this.xData1 = tempX
                        this.yData1 = tempY
                    }
                    this.getChartDataEnd1 = true
                },
                error: (xhr, status) => {
                    this.getChartDataEnd1 = true
                    console.log(xhr)
                },
                noNetwork: () => {
                    this.getChartDataEnd1 = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        },
        getApply_nums_distribute_groupcity() {//报名量分布(按城市)
            // [
            //     {
            //         "applyNums": 193,
            //         "cityId": 176,
            //         "cityName": "西安"
            //     }
            // ]
            this.getChartDataEnd2 = false
            util.ajaxB({
                url: '/stat/apply/applynumdistributecity',
                type:'POST',
                data: {
                    // team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                },
                success: (res) => {
                    console.log('报名量分布(按城市)')
                    console.log(res)
                    if(res.code == 0){
                        let tempX = []
                        let tempY = []
                        res.data.forEach((obj) => {
                            tempX.push(Number(obj.apply_num))
                            tempY.push(obj.city_name)
                        })
                        this.xData2 = tempX
                        this.yData2 = tempY
                    }
                    this.getChartDataEnd2 = true
                },
                error: (xhr, status) => {
                    this.getChartDataEnd2 = true
                    console.log(xhr)
                },
                noNetwork: () => {
                    this.getChartDataEnd2 = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        },
        getApply_nums_distribute_groupdepartment(department_id) {//报名量分布(按部门)
            this.getChartDataEnd2 = false
            util.ajaxB({
                url: '/stat/apply/applynumdistributedept',
                type:'POST',
                data: {
                    // team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                    department_id: department_id
                },
                success: (res) => {
                    console.log('报名量分布(按部门)')
                    console.log(res)
                    if(res.code == 0){
                        //第一次请求来的 根部门 放入 面包屑数组
                        // if(!this.breadcrumbs1.length){
                        //     this.breadcrumbs1.push({
                        //         department_id: 0,
                        //         department_name: res.data.cur.name
                        //     })
                        // }

                        let tempX = []
                        let tempY = []
                        res.data.forEach((obj) => {//循环子部门数据
                            tempX.push(Number(obj.apply_num))
                            tempY.push(obj.name+'&&&'+obj.department_id)
                        })
                        // res.data.cur.postList.forEach((obj) => {//循环当前部门下帖子
                        //     tempX.push(Number(obj.nums))
                        //     tempY.push(obj.name)
                        // })
                        this.xData2 = tempX
                        this.yData2 = tempY
                    }
                    this.getChartDataEnd2 = true
                },
                error: (xhr, status) => {
                    this.getChartDataEnd2 = true
                    console.log(xhr)
                },
                noNetwork: () => {
                    this.getChartDataEnd2 = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        },
        getApply_dispose_groupcity(){//过期报名占比(按城市)
            // [
            //     {
            //         "allApplyNums": 28773,
            //         "cityId": 15,
            //         "notContact": 17047,
            //         disposeRatio: 0.123,
            //         "cityName": "重庆"
            //     }
            // ]
            this.getChartDataEnd3 = false
            util.ajaxB({
                url: '/stat/apply/applyexpiredratiocity',
                type:'POST',
                data: {
                    // team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                },
                success: (res) => {
                    console.log('过期报名占比(按城市)')
                    console.log(res)
                    if(res.code == 0){
                        let tempX = []
                        let tempY = []
                        res.data.forEach((obj) => {
                            tempX.push(Math.round(obj.expired_ratio))
                            tempY.push(obj.city_name)
                        })
                        this.xData3 = tempX
                        this.yData3 = tempY
                    }
                    this.getChartDataEnd3 = true
                },
                error: (xhr, status) => {
                    this.getChartDataEnd3 = true
                    console.log(xhr)
                },
                noNetwork: () => {
                    this.getChartDataEnd3 = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        },
        getApply_dispose_groupdepartment(department_id){//过期报名占比(按部门)
            this.getChartDataEnd3 = false
            util.ajaxB({
                url: '/stat/apply/applyexpiredratiodept',
                type:'POST',
                data: {
                    // team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                    department_id: department_id
                },
                success: (res) => {
                    console.log('过期报名占比(按部门)')
                    console.log(res)
                    if(res.code == 0){
                        //第一次请求来的 根部门 放入 面包屑数组
                        // if(!this.breadcrumbs2.length){
                        //     this.breadcrumbs2.push({
                        //         department_id: 0,
                        //         department_name: res.data.cur.name
                        //     })
                        // }

                        let tempX = []
                        let tempY = []
                        res.data.forEach((obj) => {//循环子部门数据
                            tempX.push(Math.round(obj.expired_ratio))
                            tempY.push(obj.name+'&&&'+obj.department_id)
                        })
                        // res.data.cur.postList.forEach((obj) => {//循环当前部门下帖子
                        //     tempX.push(Math.round(obj.ratio*100))
                        //     tempY.push(obj.name)
                        // })
                        this.xData3 = tempX
                        this.yData3 = tempY
                    }
                    this.getChartDataEnd3 = true
                },
                error: (xhr, status) => {
                    this.getChartDataEnd3 = true
                    console.log(xhr)
                },
                noNetwork: () => {
                    this.getChartDataEnd3 = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        },
        getApply_conversion(){//报名转化率
            // [
            //     {
            //         "allApplyNums": 7554,
            //         "date": "2017-11-01",
            //         "hire_num": 702,
            //         "notDispose": 4787,
            //         "passFiltrate": 467,
            //         "weedOut": 1598
            //     }
            // ]
            this.getChartDataEnd4 = false
            util.ajaxB({
                url: '/stat/apply/applyconversion',
                type:'POST',
                data: {
                    team_id: this.team_id,
                    begin_date: util.getLocalTime(this.date.date[0], 'yyyy-MM-dd'),
                    end_date: util.getLocalTime(this.date.date[1], 'yyyy-MM-dd'),
                },
                success: (res) => {
                    console.log('报名转化率')
                    console.log(res)
                    if(res.code == 0){

                        let tempX = []
                        let tempY = [
                            {
                                name: '录用',
                                data: [],
                                color: '#7fc25d'
                            },
                            {
                                name: '待面试',
                                data: [],
                                color: '#86b0f6'
                            },
                            {
                                name: '未处理',
                                data: [],
                                color: '#08aabf'
                            },
                            {
                                name: '淘汰',
                                data: [],
                                color: '#ff9a42'
                            },
                            {
                                name: '已取消',
                                data: [],
                                color: '#AA70B9'
                            }
                        ]
                        res.data.forEach((obj, index) => {
                            tempX.push(obj.date_time)
                            let tempArr0 = []
                            let tempArr1 = []
                            let tempArr2 = []
                            let tempArr3 = []
                            let tempArr4 = []
                            let allApplyNums = obj.hire_num + obj.interview_num + obj.unexamined_num + obj.eliminate_num + obj.cancel_num
                            tempArr0.push(index, obj.hire_num, obj.hire_num+'('+(obj.hire_num/allApplyNums*100).toFixed(1)+'%)')
                            tempY[0].data.push(tempArr0)

                            tempArr1.push(index, obj.interview_num, obj.interview_num+'('+(obj.interview_num/allApplyNums*100).toFixed(1)+'%)')
                            tempY[1].data.push(tempArr1)

                            tempArr2.push(index, obj.unexamined_num, obj.unexamined_num+'('+(obj.unexamined_num/allApplyNums*100).toFixed(1)+'%)')
                            tempY[2].data.push(tempArr2)

                            tempArr3.push(index, obj.eliminate_num, obj.eliminate_num+'('+(obj.eliminate_num/allApplyNums*100).toFixed(1)+'%)')
                            tempY[3].data.push(tempArr3)

                            tempArr4.push(index, obj.cancel_num, obj.cancel_num+'('+(obj.cancel_num/allApplyNums*100).toFixed(1)+'%)')
                            tempY[4].data.push(tempArr4)
                        })
                        this.xData4 = tempX
                        this.yData4 = tempY
                    }
                    this.getChartDataEnd4 = true
                },
                error: (xhr, status) => {
                    this.getChartDataEnd4 = true
                    console.log(xhr)
                },
                noNetwork: () => {
                    this.getChartDataEnd4 = true
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        },
        showDownload(lab){
            if(lab === 1){
                this.downloadInfo1.show = true
            }else if(lab === 2){
                this.downloadInfo2.show = true
            }
        },
        confirmFn1() {
            // console.log(this.downloadInfo1)
            let url = ''
            let parm = ''
            let key = ''
            if(this.downloadInfo1.type == 0){
                url = '/stat/apply/downloadmonthlyapplystat'
                parm = '&month='+util.getLocalTime(this.downloadInfo1.month_obj.getTime(), 'yyyy-MM')
                key = '报名量统计下载（按月）'
            }else{
                url = '/stat/apply/downloadweeklyapplystat'
                parm = '&begin_date='+util.getLocalTime(this.downloadInfo1.week_obj.getTime() - 24*60*60*1000, 'yyyy-MM-dd')+'&end_date='+util.getLocalTime(this.downloadInfo1.week_obj.getTime() + 5*24*60*60*1000, 'yyyy-MM-dd')
                key = '报名量统计下载（按周）'
            }

            // 百度统计
            _hmt.push(['_trackEvent', key])

            let downloadUrl = util.hostB + url + '?dmclient=pcweb' + parm
            location.href = downloadUrl
            this.downloadInfo1.show = false
        },
        confirmFn2() {
            console.log(this.downloadInfo2)
            if(!this.downloadInfo2.code){
                this.$message({
                    showClose: true,
                    message: '请输入验证码',
                    type: 'warning'
                });
                return
            }
            // 验证码校验
            util.ajaxB({
                url: '/stat/apply/verifyphone',
                type:'POST',
                data: {
                    // mobile: this.userInfo_B.mobile,
                    code: this.downloadInfo2.code,
                },
                success: (res) => {
                    console.log('验证码校验')
                    console.log(res)
                    if(res.code == 0){
                        // 百度统计
                        _hmt.push(['_trackEvent', '报名明细下载'])

                        let parm = ''
                        parm = '&begin_date='+util.getLocalTime(this.downloadInfo2.startDate.getTime(), 'yyyy-MM-dd')+'&end_date='+util.getLocalTime(this.downloadInfo2.endDate.getTime(), 'yyyy-MM-dd')
                        let downloadUrl = util.hostB + '/stat/apply/downloadapplydetail?dmclient=pcweb' + parm
                        location.href = downloadUrl
                        this.downloadInfo2.show = false
                    }else{
                        this.$message({
                            showClose: true,
                            message: res.msg,
                            type: 'warning'
                        });
                    }
                },
                error: (xhr, status) => {
                    console.log(xhr)
                },
                noNetwork: () => {
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        },
        getCodeFn() {
            if(this.getCodeTime<0&&this.getCodeEnd){
                // console.log('获取验证码')
                this.getCodeEnd = false
                util.ajaxB({
                    url: '/stat/apply/sendckcode',
                    type:'POST',
                    data: {
                        // mobile: this.userInfo_B.mobile,
                    },
                    success: (res) => {
                        console.log('获取验证码')
                        console.log(res)
                        this.getCodeEnd = true
                        if(res.code == 0){
                            this.getCodeTime = 60
                            this.timeInterval = setInterval(() => {
                                this.getCodeTime --
                                if(this.getCodeTime<0){
                                    clearInterval(this.timeInterval)
                                }
                            }, 1000)
                        }
                    },
                    error: (xhr, status) => {
                        this.getCodeEnd = true
                        console.log(xhr)
                    },
                    noNetwork: () => {
                        //网络超时
                        this.getCodeEnd = true
                        this.$message({
                            showClose: true,
                            message: '网络连接失败，请检查网络。',
                            type: 'warning'
                        });
                    }
                })
            }else{

            }
        },
        exportData(url){
            // console.log(url)
            //百度统计
            let key = ''
            switch(url){
                case 'downloadapplynumdistributecity':
                    key = '报名量分布下载（按城市）'
                break;
                case 'downloadapplynumdistributedept':
                    key = '报名量分布下载（按部门）'
                break;
                case 'downloadapplyexpiredratiocity':
                    key = '过期报名占比下载（按城市）'
                break;
                case 'downloadapplyexpiredratiodept':
                    key = '过期报名占比下载（按部门）'
                break;
            }
            _hmt.push(['_trackEvent', key])
            // return
            let downloadUrl = util.hostB + '/stat/apply/' + url + '?dmclient=pcweb' + '&begin_date=' + util.getLocalTime(this.date.date[0], 'yyyy-MM-dd')+'&end_date='+util.getLocalTime(this.date.date[1], 'yyyy-MM-dd')
            location.href = downloadUrl
        },
        dateChange() {
            // console.log(this.date)
            this.intChart2 = false
            this.intChart3 = false
            this.intChart4 = false
            this.tabs1 = '1-1'
            this.legend1 = '总报名人数'
            this.getApply_info()//核心指标
            this.getApply_nums_tendency()//报名量趋势
        },
        chartDataInitFn2(){
            console.log('报名量分布')
            this.intChart2 = true
            // this.getApply_nums_distribute_groupcity()
            if(this.radio1 === '按城市'){
                this.getApply_nums_distribute_groupcity()
            }else if(this.radio1 === '按部门'){
                this.breadcrumbs1 = [
                    {
                        department_id: 0,
                        department_name: this.userInfo_B.department_name
                    }
                ]
                this.getApply_nums_distribute_groupdepartment(0)
            }
        },
        chartDataInitFn3(){
            console.log('过期报名占比')
            this.intChart3 = true
            // this.getApply_dispose_groupcity()
            if(this.radio2 === '按城市'){
                this.getApply_dispose_groupcity()
            }else if(this.radio2 === '按部门'){
                this.breadcrumbs2 = [
                    {
                        department_id: 0,
                        department_name: this.userInfo_B.department_name
                    }
                ]
                this.getApply_dispose_groupdepartment(0)
            }
        },
        chartDataInitFn4(){
            console.log('报名转化率')
            this.intChart4 = true
            this.getApply_conversion()
        },
        //柱状图点击事件回调
        chartDataChangeFn2(data) {
            // console.log(data)
            this.breadcrumbs1.push({
                department_id: data.department_id,
                department_name: data.department_name
            })
            this.getApply_nums_distribute_groupdepartment(data.department_id)
        },
        chartDataChangeFn3(data) {
            // console.log(data)
            this.breadcrumbs2.push({
                department_id: data.department_id,
                department_name: data.department_name
            })
            this.getApply_dispose_groupdepartment(data.department_id)
        },
        //按城市、按部门 切换 回调
        radioChangeFn1(val) {
            // console.log(val)
            if(val === '按城市'){
                this.getApply_nums_distribute_groupcity()
            }else if(val === '按部门'){
                this.breadcrumbs1 = [
                    {
                        department_id: 0,
                        department_name: this.userInfo_B.department_name
                    }
                ]
                this.getApply_nums_distribute_groupdepartment(0)
            }
        },
        radioChangeFn2(val) {
            // console.log(val)
            if(val === '按城市'){
                this.getApply_dispose_groupcity()
            }else if(val === '按部门'){
                this.breadcrumbs2 = [
                    {
                        department_id: 0,
                        department_name: this.userInfo_B.department_name
                    }
                ]
                this.getApply_dispose_groupdepartment(0)
            }
        },
        //面包屑 点击
        changeBreadcrumbFn1(id){
            for(let i = 0;i < this.breadcrumbs1.length;i ++){
                if(this.breadcrumbs1[i].department_id == id && i+1<this.breadcrumbs1.length){//删除当前点击之后的 并且 点击的不是最后一个
                    // console.log(id)
                    this.breadcrumbs1.splice(i+1)
                    //请求对应部门数据
                    this.getApply_nums_distribute_groupdepartment(id)
                    break
                }
            }
        },
        changeBreadcrumbFn2(id){
            for(let i = 0;i < this.breadcrumbs2.length;i ++){
                if(this.breadcrumbs2[i].department_id == id && i+1<this.breadcrumbs2.length){//删除当前点击之后的 并且 点击的不是最后一个
                    console.log(id)
                    this.breadcrumbs2.splice(i+1)
                    //请求对应部门数据
                    this.getApply_dispose_groupdepartment(id)
                    break
                }
            }
        },
        getUserInfo(){
            util.ajax({
                url:'/cloud/banner/get',
                type:'GET',
                data:{
                    team_id:0,
                    project_id:0
                },
                timeout:10000,
                success:(obj) => {
                    // console.log('用户信息')
                    // console.log(obj)
                    if(obj && obj.errno == 0){
                        this.team_id = obj.data.setting_data.user.team_id
                        // console.log('team_id='+obj.data.setting_data.user.team_id)
                        util.setLocalStorage('projectStorageInfo',{team_id: obj.data.setting_data.user.team_id})
                        this.init()
                    }
                },
                error: (xhr, status) => {
                    
                },
                noNetwork: () => {
                    //网络超时
                    this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络。',
                        type: 'warning'
                    });
                }
            })
        }
  	},
  	mounted() {
    	// this.init()
  	},
  	// watch: {
  	//   '$route' (to, from) {
  	//     // 对路由变化作出响应...
   //      this.init()
  	//   }
  	// },
    beforeRouteEnter (to, from, next) {
        // 在渲染该组件的对应路由被 confirm 前调用
        // 不！能！获取组件实例 `this`
        // 因为当钩子执行前，组件实例还没被创建
        next(vm => {
            vm.getUserInfo()
        })
    }, 
}
</script>

<style>
.tjrecruit .chart .download_dialog .el-dialog{
    width: 470px;
}
.tjrecruit .chart .download_dialog .el-dialog .el-dialog__body .el-radio+.el-radio{
    margin-left: 23px;
}
.tjrecruit .chart .tabs_wrap .el-tabs__header{
    margin: 12px 0 0;
    border-bottom: none;
}
.tjrecruit .chart .tabs_wrap .el-tabs__header .el-tabs__active-bar{
    background-color: #6699ee;
}
.tjrecruit .chart .tabs_wrap .el-tabs__header .el-tabs__item{
    color: #5e6d82;
    padding: 0 8px;
}
.tjrecruit .chart .tabs_wrap .el-tabs__header .el-tabs__item.is-active{
    color: #6699ee;
    font-weight: bold;
}

.tjrecruit .chart .table_title .btns .el-radio-button__inner{
    padding: 6px 14px;
    font-size: 13px;
    color: #8492a6;
    /*border-color: #e0e6ed;*/
}
.tjrecruit .chart .table_title .btns .el-radio-button__orig-radio:checked+.el-radio-button__inner{
    color: #fff;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tjrecruit{
    padding: 0 20px;
}

.tjrecruit .main_data{
    display: flex;
    height: 151px;
}
.tjrecruit .main_data>div{
    margin-right: 47px;
}
.tjrecruit .main_data>div .num{
    font-family: 'SFUIDisplay';
    font-size: 32px;
    line-height: 38px;
    color: #475669;
    margin-top: 44px;
}
.tjrecruit .main_data>div .num>span{
    display: inline-block;
    height: 13px;
    line-height: 12px;
    text-indent: 14px;
    margin-left: 8px;
    font-size: 12px;
    color: #8492a6;
}
.tjrecruit .main_data>div .num>span.up{
    background: url(../assets/imgs/statistic/up.svg) left center no-repeat;
}
.tjrecruit .main_data>div .num>span.down{
    background: url(../assets/imgs/statistic/down.svg) left center no-repeat;
}
.tjrecruit .main_data>div .name{
    font-size: 12px;
    line-height: 17px;
    color: #8492a6;
    margin-top: 8px;
}

.tjrecruit .chart .table_title{
    border-bottom: 1px solid #e0e6ed;
}
.tjrecruit .chart .table_title:after{
    content: '';
    display: block;
    clear:both;
}
.tjrecruit .chart .table_title .title{
    float: left;
    line-height: 27px;
    font-size: 16px;
    font-weight: bold;
    color: #475669; 
    margin-bottom: 14px;
}
.tjrecruit .chart .table_title .btns{
    float: left;
    margin-left: 16px;
}
.tjrecruit .chart .table_title .right{
    float: right;
    height: 27px;
    line-height: 27px;
    /*margin-bottom: 14px;*/
}
.tjrecruit .chart .table_title .right>span{
    display: inline-block;
    text-indent: 19px;
    font-size: 14px;
    font-weight: 500;
    color: #6699ee;
}
.tjrecruit .chart .table_title .right>span.download{
    background: url(../assets/imgs/statistic/download.svg) left center no-repeat;
    margin-right: 13px;
    cursor: pointer;
}
.tjrecruit .chart .table_title .right>span.download:active{
    color: #517ed6;
}
.tjrecruit .chart .table_title .right>span.help{
    position: relative;
    background: url(../assets/imgs/statistic/help.svg) left center no-repeat;
}
.tjrecruit .chart .table_title .right>span.help:after{
    content: '';
    position: absolute;
    width: 100%;
    height: 10px;
    top:22px;
    right: 0;
}
.tjrecruit .chart .table_title .right>span.help .help_tip{
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
.tjrecruit .chart .table_title .right>span.help:hover .help_tip{
    display: block;
}
.tjrecruit .chart .table_title .right>span.help .help_tip:after{
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
.tjrecruit .chart .table_title .right>span.help .help_tip .help_tip_title{
    height: 46px;
    line-height: 46px;
    font-size: 13px;
    font-weight: bold;
    color: #99a9bf;
    text-indent: 0;
    border-bottom:1px solid #e0e6ed;
    margin-bottom: 16px;
}
.tjrecruit .chart .table_title .right>span.help .help_tip>p{
    color: #5e6d82;
    font-weight: 350;
    font-size: 12px;
    line-height: 22px;
    text-indent: 0;
    margin-bottom:12px;
}
.tjrecruit .chart .table_title .right>span.help .help_tip>p:nth-of-type(2n){
    background: #f5f7f9;
}
.tjrecruit .chart .table_title .right>span.help .help_tip>p>span{
    color: #5e6d82;
    font-weight: bold;
}

.tjrecruit .chart .download_dialog .download_dialog_main{
    padding:29px 0 0 45px;
    border-bottom: 1px solid #E5EBF2;
}
.tjrecruit .chart .download_dialog .download_dialog_main .download_tip{
    font-family: 'PingFangSC-Regular';
    font-size: 14px;
    color: #475669;
    margin-bottom: 30px;
}
.tjrecruit .chart .download_dialog .download_dialog_main .radio_wrap{
    margin-bottom: 20px;
}
.tjrecruit .chart .download_dialog .download_dialog_main .picker_wrap{
    margin-bottom: 45px;
}
.tjrecruit .chart .download_dialog .download_dialog_main .download_date{
    padding-bottom: 12px;
}
.tjrecruit .chart .download_dialog .download_dialog_main .download_date .date_item{
    margin-bottom: 20px;
}
.tjrecruit .chart .download_dialog .download_dialog_main .download_date .date_item .label{
    display: inline-block;
    font-family: 'PingFangSC-Regular';
    font-size: 12px;
    color: #475669;
    letter-spacing: 0;
    /*margin-right: 27px;*/
    width: 75px;
}
.tjrecruit .chart .download_dialog .download_dialog_main .download_date .date_item.yzm{
    position: relative;
}
.tjrecruit .chart .download_dialog .download_dialog_main .download_date .date_item.yzm .tip{
    position: absolute;
    right:53px;   
    top:8px;
    line-height: 20px;
    font-family: 'PingFangSC-Medium';
    font-size: 14px;
    color: #6699EE;
    cursor: pointer;
}
.tjrecruit .chart .download_dialog .download_dialog_main .download_date .date_item.yzm .tip.sent{
    color: #99A9BF;
}

.tjrecruit .chart .download_dialog .download_dialog_foot{
  height:68px;
}
.tjrecruit .chart .download_dialog .download_dialog_foot .btns{
  float: right;
  margin:16px 20px;
}

.tjrecruit .chart .tabs_wrap{
    float: left;
}
.tjrecruit .chart .breadcrumb_wrap{
    height: 40px;
    padding-top: 7px;
}
.tjrecruit .chart .breadcrumb_wrap .breadcrumb{
    padding-top: 13px;
}
.tjrecruit .chart .breadcrumb_wrap .breadcrumb .wraper a{
    font-weight: normal;
}
.tjrecruit .chart .breadcrumb_wrap .breadcrumb .wraper a:last-child{
    color: #99a9bf;
}
.tjrecruit .chart .legend_wrap{
    height: 65px;
    line-height: 18px;
}
.tjrecruit .chart .legend_wrap .left{
    float: left;
    font-size: 13px;
    color: #99a9bf;
    margin-top: 24px;
}
.tjrecruit .chart .legend_wrap .left>span{
    font-size: 14px;
    font-weight: 500;
    color: #5e6d82;
    margin-left: 4px;
}
.tjrecruit .chart .legends{
    float: right;
    height: 18px;
    margin-top: 24px;
}
.tjrecruit .chart .legends .legend{
    font-size: 12px;
    color: #5e6d82;
    float: left;
    margin-left: 16px;
}
.tjrecruit .chart .legends .legend>span{
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
}
.tjrecruit .chart .tip{
    height: 50px;
}
.tjrecruit .chart .tip_nodata{
    height: 200px;
    line-height: 140px;
    text-align: center;
    font-size: 14px;
    color: #c0ccda;
}
.tjrecruit .chart .tip p{
    font-size: 12px;
    text-align: center;
    color: #99a9bf;
}
</style>
