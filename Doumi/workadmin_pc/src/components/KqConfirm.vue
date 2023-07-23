<template>
    <div id="PayListDetail" class="kqconfirm" v-loading="evaluationLoading">
        <div class="kq-wapper">
            <div class="headertitle clearfix">
                <h2 class="fl"><span @click="goBack">客户确认</span> <i class="icon-arrow-right"></i> {{row.subject}}</h2> 
            </div>
        </div>
        <div v-loading="fullscreenLoading">
            <div class="tabs">
                <p><span :class="{'is-active':isactive === 1}" @click="isactive = 1">邮件信息</span><span :class="{'is-active':isactive === 2}" @click="isactive = 2">考勤明细</span></p>
                <i :style="{'transform':isactive == 1 ? 'translateX(0px)': 'translateX(72px)'}" class="active-bar"></i>
            </div>
            <div class="email_info" v-show="isactive === 1">
                <ul class="email_list">
                    <li><span class="email_label">确认状态：</span><i :class="'stauts_ico' + row.status_no"></i><span class="email_status">{{statusinfo[+row.status_no]}}</span><a href="javascript:;" class="email_edit" v-if="row.action_no != 1" @click="emailDoing">{{row.action_no == 2 ? '重新发送' : '修改'}}</a></li>
                    <li  v-if="row.status_no == 2"><span class="email_label">拒绝原因：</span><span class="email_des">{{row.remark}}</span></li>
                    <li><span class="email_label">发送日期：</span><span class="email_des">{{row.send_at}}</span></li>
                    <li><span class="email_label">考勤周期：</span><span class="email_des">{{row.start_date}} 至 {{row.end_date}}</span></li>
                    <li><span class="email_label">确认人：</span><span class="email_des">{{row.confirm_user_email}}</span></li>
                    <li v-if="row.copy_user_email.length > 0"><span class="email_label">抄送：</span><span class="email_des">{{row.copy_user_email+''}}</span></li>
                </ul>
                <div class="email_content">
                    <div class="email_contenttext"  v-html="row.content"></div>
                </div>
                <div class="email_down">
                    <i class="des_icon"></i>
                    <p class="des">附件</p>
                    <i class="excel_icon"></i>
                    <p class="email_attachment">{{row.attach_name}}</p>
                    <i class="down_icon"></i>
                    <a class="down" :href="row.attach_url_origin">下载</a>
                </div>
            </div>
            <div class="kqdetail_info" v-show="isactive === 2">
                <div class="tab-seach">
                  <div class="seach-input">
                     <i class="el-icon-search" @click="seachkeyword"></i>
                        <el-input
                            popper-class="my-autocomplete"
                            v-model="seachInput"
                            custom-item="my-item-zh"
                            :trigger-on-focus="false"
                            placeholder="输入姓名/手机号进行搜索"
                            class="projectSeach"
                            >
                        </el-input>
                  </div>
                </div>
                <p class="table_head">打卡率：<span>{{row.punch_rate}}</span>考勤人数：<span>{{row.man_number}}人</span>  考勤人天：<span>{{row.attend_man_day}}天</span></p>
                <template>
                  <el-table
                    :data="confirmList"
                    style="width: 100%"
                    show-summary
                    :summary-method="getSummaries"
                    :height="tableHeight"
                    max-height="250">
                    <el-table-column
                      prop="user_name"
                      label="姓名"
                      width="100">
                    </el-table-column>
                    <el-table-column
                        label="人员来源"
                        label-class-name="border"
                        min-width="120"
                        v-if="is_nx_project"
                        >
                        <template slot-scope="scope">
                            {{scope.row.worker_source}}
                        </template>
                    </el-table-column>
                    <el-table-column
                      prop="mobile"
                      label="手机号"
                      width="120">
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
                      prop="work_date"
                      label="工作日期"
                      >
                    </el-table-column>
                    <el-table-column
                      prop="real_wage"
                      label="实发工资"
                      >
                    </el-table-column>
                    <el-table-column
                      prop="service_fee"
                      label="服务费">
                    </el-table-column>
                    <el-table-column
                      prop="taxation"
                      label="税费">

                    </el-table-column>
                    <el-table-column
                      prop="confirm_cost"
                      label="总确认费用"
                      >
                    </el-table-column>
                    <el-table-column
                      label="打卡情况"
                      width="120"
                      prop="is_punch"
                      >
                      <template slot-scope="scope">
                        <el-tag :type=" +scope.row.is_punch == 1 ? 'already' : 'not'" close-transition>{{+scope.row.is_punch == 1 ? '已打卡' : '未打卡'}}</el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                <el-pagination
                    @current-change="handleSizeChange"
                    :current-page.sync="page_no"
                    :page-size="page_size"
                    layout="total, prev, pager, next"
                    :total="total">
                </el-pagination>
                </template>
        </div>
            
        </div>
        <!-- 重新发送 -->
        <div class="export-dialog checkconfirm">
            <el-dialog
                title="提示"
                top="35%"
                :visible.sync="showsetdel"
                v-loading="evaluationLoading"
                @close="btnDisable = showsetdel = false"
                size="tiny">
                    <span>是否重新发送确认邮件给{{row.confirm_user_email}}</span>
                    <span slot="footer" class="dialog-footer">
                    <el-button class="cancel" @click="btnDisable = showsetdel = false">取 消</el-button>
                    <el-button type="primary" class="confirm" @click="confirSendEmail">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>
<script>
    import * as util from '../assets/js/util.js' 
    let $ = require("jquery")
    export default{
        data: function(){
            return{
                total:0,
                page_size:10,
                page_no:1,
                seachInput:'',
                fullscreenLoading:true,
                activeName: 'second',
                isactive:1,
                confirmList: [],
                statusinfo:['未确认','已确认','拒绝确认','审核通过','','已支付'],
                sum: {},
                evaluationLoading:false,
                row: {copy_user_email:[]},
                innerHeight:0,
                total_page:1,
                showsetdel:false,
                btnDisable:false,
                sendBeginTime:0,
                is_nx_project: false
            }
        },
        vuex: {
            getters: {
            },
            actions: {

            }
        },

        watch:{
            '$route' (to,from) {
                if(to.path.split('/').length>2){
                    this.$router.push('newcreatmail')
                }
            },
        },
        methods:{
            init(){
                this.fullscreenLoading = false
                this.team_id = util.getLocalStorage('projectStorageInfo').team_id
                this.project_id = util.getLocalStorage('projectStorageInfo').project_id;
                this.confirm_id = this.GetQueryString('confirm_id');
                this.tableHeight = window.innerHeight - 295;
                util.ajax({
                    url: '/confirm/mail/info',
                    type:'GET',
                    data: {
                        team_id:this.team_id,
                        project_id:this.project_id,
                        confirm_id:this.confirm_id
                    },
                    success: (res) => {
                        if(res.errno == 0){
                            this.row = res.data.row;
                            let downUrlAr = res.data.row.attach_url_origin.split('/');
                            this.row.attach_name = downUrlAr[downUrlAr.length -1];
                        }else{
                            this.$message({
                                showClose: true,
                                message:res.errmsg ,
                                type: 'warning'
                            });
                        }
                    },
                    error: (xhr, status) => {
                        this.$message({
                            showClose: true,
                            message: '请求失败请重试',
                            type: 'warning'
                        });
                      this.fullscreenLoading = false;
                      
                    },
                    noNetwork: () => {
                        this.$message({
                            showClose: true,
                            message: '网络连接失败，请检查网络',
                            type: 'warning'
                        });
                      this.fullscreenLoading = false;
                    }
                })
                this.getPageList('/confirm/detail/list');
                $(document).on('keyup',this.inputKeyUp)
                setTimeout(()=>{
                    let TabDom = document.getElementsByTagName('table')[0];
                        TabDom.style.width = '100%';
                        TabDom.attributes.width = '100%'
                },10)
            },
            GetQueryString(name){
               var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
               var r = ('?'+window.location.href.split('?')[1]).substr(1).match(reg);
               if(r!=null)return  unescape(r[2]); return null;
            },
            getPageList(url,type){
                let data = {
                        team_id:this.team_id,
                        project_id:this.project_id,
                        confirm_id:this.confirm_id,
                        page_no:this.page_no,
                        page_size:this.page_size
                    };
                if(type == 'seach'){
                    data.search_term = this.seachInput;
                }
                util.ajax({
                    url: url,
                    type:'GET',
                    data: data,
                    success: (res) => {
                        if(res.errno == 0){
                            res.data.list.map((index, elem)=>{
                                index.real_wage = index.real_wage/100;
                                index.service_fee = index.service_fee/100;
                                index.taxation = index.taxation/100;
                                index.confirm_cost = index.confirm_cost/100;
                            })
                            this.sum = res.data.sum;
                            this.confirmList = res.data.list;
                            this.total = res.data.total_row;
                        }else{
                            this.$message({
                                showClose: true,
                                message:res.errmsg ,
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
                      this.fullscreenLoading = false;
                      
                    },
                    noNetwork: () => {
                        this.$message({
                            showClose: true,
                            message: '网络连接失败，请检查网络',
                            type: 'warning'
                        });
                      this.fullscreenLoading = false;
                    }
                })

            },
            goBack(){
                this.$router.replace('customerconfirmpage')
            },
            handleClick(tab, event) {
                console.log(tab, event);
            },
            getSummaries(param) {
                const { columns, data } = param;
                const sums = [];
                columns.forEach((column, index) => {
                    if (index === 0) {
                        sums[index] = '汇总';
                        return;
                    }
                    if(column.property.indexOf('punch') != -1){
                        sums[index] = this.sum['punch_rate'] + '已打卡'|| ''
                    }else{
                        let num = this.sum['total_' + column.property]/100;
                        sums[index] = isNaN(num) ? '' : num
                    }
                });
                return sums;
            },
            handleSizeChange(val){
                this.page_no = val;
                if(this.seachype){
                    this.getPageList('/confirm/detail/user','seach')
                }else{
                    this.getPageList('/confirm/detail/list');
                }
            },
            seachkeyword(){
                this.seachype = true;
                this.page_no = 1;
                if(!this.seachInput){
                    this.getPageList('/confirm/detail/list');
                }else{
                    this.getPageList('/confirm/detail/user','seach')
                }
            },
            confirSendEmail(){
                this.showsetdel = false;

                this.evaluationLoading = true;
                util.ajax({
                    url: '/confirmmail/resend',
                    type:'GET',
                    data: {
                        confirm_id:this.confirm_id,
                        team_id:this.team_id,
                        project_id:this.project_id,
                    },
                    success: (res) => {
                        this.evaluationLoading = false;
                        this.showsetdel = false;
                        if(res.errno == 0){
                        this.sendBeginTime = +(new Date())
                            this.$message({
                                showClose: true,
                                message: '重新发送成功',
                                type: 'success'
                            });
                        }else{
                            this.$message({
                                showClose: true,
                                message: res.errmsg,
                                type: 'warning'
                            });
                        }
                    },
                    error: (xhr, status) => {
                        this.showsetdel = false;
                        this.$message({
                            showClose: true,
                            message: '网络连接失败，请检查网络',
                            type: 'warning'
                        });
                      this.evaluationLoading = false;
                      
                    },
                    noNetwork: () => {
                        this.showsetdel = false;
                        this.$message({
                            showClose: true,
                            message: '网络连接失败，请检查网络',
                            type: 'warning'
                        });
                      this.evaluationLoading = false;
                    }
                })
            },
            emailDoing(){
                if(this.row.status_no == 0){
                    let newSendTime = +(new Date());
                    if(newSendTime - this.sendBeginTime < 180000 ){
                        this.$message({
                            showClose: true,
                            message: '操作过于频繁，请于3分钟后再次尝试重新发送',
                            type: 'warning'
                        });

                    }else{
                        this.showsetdel = true;
                    }
                }else{
                    this.$router.replace('newcreatmail?confirm_id='+this.confirm_id)
                }
            },
            inputKeyUp(event){
                let keycode = event.which || event.keyCode;
                if(keycode === 13){
                    this.seachkeyword()
                }
            }
        },
        created(){
            this.init();

            $(window).on('resize',()=>{
              this.tableHeight = window.innerHeight - 280;     
            })
        },
        mounted() {
            this.is_nx_project = JSON.parse(window.localStorage.getItem('isNxProject'));
            console.log('this.is_nx_project===kqConfirm', this.is_nx_project)
        }
    }
</script>

<style  src='../assets/css/PayListDetail.css'></style>
<style scope>
.kqconfirm .stauts_ico1{
  display: inline-block;
  width: 12px;
  height: 15px;
  background:url(../assets/imgs/payListDetail/through.svg) no-repeat;
  background-size: 12px;
  vertical-align: middle;

}
.kqconfirm .stauts_ico5{
  display: inline-block;
  width: 12px;
  height: 15px;
  background:url(../assets/imgs/payListDetail/through.svg) no-repeat;
  background-size: 12px;
  vertical-align: middle;

}
.kqconfirm .stauts_ico2{
  display: inline-block;
  width: 12px;
  height: 15px;
  background:url(../assets/imgs/payListDetail/failure.svg) no-repeat;
  background-size: 12px;
  vertical-align: middle;

}
.kqconfirm .stauts_ico3{
  display: inline-block;
  width: 12px;
  height: 15px;
  background:url(../assets/imgs/payListDetail/through.svg) no-repeat;
  background-size: 12px;
  vertical-align: middle;

}
.kqconfirm .stauts_ico0{
  display: inline-block;
  width: 12px;
  height: 15px;
  background:url(../assets/imgs/payListDetail/toAudit.svg) no-repeat;
  background-size: 12px;
  vertical-align: middle;

}
.kqconfirm .excel_icon{
    height: 16px;
    width: 15px;
    display: block;
    border-radius: 2px;
    background:url(../assets/imgs/EXCEL.png) no-repeat;
    background-size: 15px 16px;
    margin:0 10px 0 36px;
}
.kqconfirm .des_icon{
    height: 16px;
    width: 15px;
    display: block;
    border-radius: 2px;
    background:url(../assets/imgs/fujian.svg) no-repeat;
    background-size: 15px 16px;
    margin-right: 5px;
}
.kqconfirm .down_icon{
    height: 16px;
    width: 15px;
    display: block;
    border-radius: 2px;
    background:url(../assets/imgs/xiazai.svg) no-repeat;
    background-size: 15px 16px;
    margin-right: 5px;

}
.kqconfirm .el-pagination{
    text-align: right;
}
.kqconfirm .table_head span{
    margin-right: 10px;
}
.kqconfirm .tab-seach{
    position:absolute;
    right: 0;
    top: -13px;
    width: 235px;
}
.kqconfirm .tab-seach .el-input__inner{
    width: 235px;
}
.kqconfirm .inline-input{
    width: 348px;
    height: 36px;
    line-height: 36px;
    position: relative;
}
.kqconfirm .el-icon-search{
    position: absolute;
    right: 0;
    top: 0;
    display: block;
    width: 40px;
    height: 36px;
    font-size: 18px;
    z-index: 3;
    color: #c0ccda;
    font-weight: normal;
    text-align: center;
    line-height: 36px;
}
.kqconfirm .el-icon-search:hover{
    cursor:pointer;
    color: #8bb1f2;
}
.kqconfirm .el-icon-search:active{
    cursor:pointer;
    color: #6699ee;
}
.kqconfirm .kqdetail_info .table_head{
    font-size: 14px;
    color:#8492a6;
    margin-bottom: 20px;
}
.kqconfirm .el-table__footer-wrapper .el-table_1_column_1 .cell{
    font-size: 14px;
    font-weight: 600;
}
.kqconfirm .el-tag--already{
    width: 52px;
    height: 24px;
    border-radius: 2px;
    background-color: rgba(99, 180, 93, 0.07);
    border: solid 1px rgba(99, 180, 93, 0.35);
    font-size: 12px;
    color: #70cb6a;
}
.kqconfirm .el-tag--not{
    width: 52px;
    height: 24px;
    border-radius: 2px;
    background-color: rgba(242, 106, 75, 0.05);
    border: solid 1px rgba(242, 106, 75, 0.27);
    font-size: 12px;
    text-align: center;
    color: #f58369;
}
.kqconfirm .icon-arrow-right{
    display: inline-block;
    width: 10px;
    height: 10px;
    background: url(../assets/imgs/payListDetail/arrow_right.svg)  no-repeat;
    background-size: 100% 100%;
    background-position-y: 0px;
}
.kqconfirm .el-table__footer-wrapper tbody td, .kqconfirm .el-table__header-wrapper tbody td{

}
.kqconfirm .el-table th{
    background-color:#edeef1;
}
.kqconfirm .el-table .cell, .el-table th>div{
    padding-left: 16px;
    padding-right: 0;
    font-size: 12px;
    color:#475669;
}
.kqconfirm .el-table td, .kqconfirm .el-table th{
    height: 36px;
}
.kqconfirm .el-table th>.cell{
    font-size: 13px;
}
.main #PayListDetail.kqconfirm .kq-wapper{
    padding:16px 20px 0;
}
.kqconfirm .tabs{
    margin: 30px 20px 0 20px;
}
.kqconfirm .tabs span:hover{
    cursor: pointer;
    color: #1f2d3d;
}
.kqconfirm .tabs span.is-active{
    color: #6699ee;
}
.kqconfirm .tabs span{
    font-size: 14px;
    margin-right: 16px;
    color: #8492a6;
}
.kqconfirm .tabs .active-bar{
    display: block;
    width: 56px;
    height: 3px;
    background-color:#6699ee;
    margin-top: 11px;
    transition:transform .3s;
}
.kqconfirm .applications{
    overflow-y:hidden;
}
.kqconfirm .email_info{
    margin:0 20px;
    margin-top: 30px;
}
.kqconfirm .email_list ul{

}
.kqconfirm .email_list li{
    font-size: 13px;
    margin-top: 16px;
    
}
.kqconfirm .email_list li .email_status{
    color: #1f2d3d;
    font-size: 13px;
    margin: 0 30px 0 10px;
}
.kqconfirm .email_list li .email_label{
    display: inline-block;
    width: 65px;
    color: #99a9bf;
    margin-right: 5px;
}
.kqconfirm .email_list li .email_des{
    color: #475669;
    display: block;
    margin-left: 70px;
    margin-top: -14px;
    line-height: 15px;
}
.kqconfirm .email_list li .email_edit{
    color: #6699ee;
    font-size: 13px;
}
.kqconfirm .email_list li .email_edit:active{
    color: #517ed6;
}
.kqconfirm .email_content{
    margin-top: 30px;
    padding: 20px;
    background-color: #f7f9fc;
    border-radius: 10px;
}
.kqconfirm .email_content p{
    font-size: 14px;
    color: #475669;
    width: 100%;
    line-height: 1.71;
}
.email_contenttext{
    width: 100%;
    line-height: 1.71;
    word-wrap:break-word;
    overflow: hidden;
    overflow-x: auto;
}
.email_contenttext td,.email_contenttext th{
    border:1px solid #E0E6ED;
}
.kqconfirm .email_title{
    margin-bottom: 16px;
}
.kqconfirm .email_down{
    height: 42px;
    border-radius: 6px;
    background-color: #ffffff;
    border: solid 1px #edf1f5;
    display: flex;
    padding:0 20px;
    align-items:center;
    margin: 30px 0 20px;
}
.kqconfirm .email_attachment{
    flex-grow:2;
    font-size: 14px;
    color: #5e6d82;
}
.kqconfirm .email_down .des{
    font-size: 12px;
    color: #5e6d82
}
.kqconfirm .email_down .down{
    font-size: 12px;
    color: #6699ee
}
.kqconfirm .kqdetail_info{
    position: relative;
    margin: 32px 20px 20px;
}
.kqconfirm .kqdetail_info .el-table td{
    border-right: none;
    text-align: left;
}
.kqconfirm .kqdetail_info .el-table th.is-leaf{
    border-right: 1px solid #e0e6ed;
}
.main #PayListDetail.kqconfirm .kq-wapper{
    overflow-y: auto;
}
</style>
