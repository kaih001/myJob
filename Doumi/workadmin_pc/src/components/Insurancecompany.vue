<template>
  	<div id="Insurancecompany" class="insurancecompany">
        <div class="banner"></div>
        <div class="wapper">
            <div class="wap">
                <div class="bdiv">
                    <!-- <div class="btxt">价值150元保险&nbsp;<b></b>&nbsp;&nbsp;提供风险保障</div> -->
                    <div class="btxt">价值10万元风险保障，护您无忧！</div>
                </div>
                <a href="javascript:;" class="btn" @click="immediatelyReceive">立即领取</a>
                <div class="checkbox">
                    <el-checkbox v-model="insuranceChecked">我已阅读并同意</el-checkbox><a class="notice" @click="gotoInsurancetxt">《投保须知》</a>
                </div>
            </div>
            <div class="content">
                <div class="first">
                    <span class="line"></span>
                    <h2><span>1</span>企业用工保是什么？</h2>
                    <p>企业用工保是专为灵活用工企业提供的一种意外保险申报服务，按天投保，节省企业费用.拥有多种意外
险套餐，为用工人员提供全方位的风险保障.</p>
                </div>
                <div class="second">
                    <span class="line"></span>
                    <h2><span>2</span>企业用工保有什么优势？</h2>
                    <div class="blocks">
                        <dl>
                            <dt><img src="../assets/imgs/insurance/chengben.svg" alt=""></dt>
                            <dd>一天一投保，节约成本</dd>
                        </dl>
                        <dl>
                            <dt><img src="../assets/imgs/insurance/renshu.svg" alt=""></dt>
                            <dd>无门槛，无最低人数限制</dd>
                        </dl>
                        <dl>
                            <dt><img src="../assets/imgs/insurance/shengli.svg" alt=""></dt>
                            <dd>智能自动投保，省心省力</dd>
                        </dl>
                        <dl>
                            <dt><img src="../assets/imgs/insurance/baozhang.svg" alt=""></dt>
                            <dd>提供风险保障，为企业免除后顾之忧</dd>
                        </dl>
                    </div>
                </div>
                <div class="third">
                    <h2><span>3</span>体验规则</h2>
                    <ul>
                        <li><b></b>每个用户只能领取一次体验套餐；</li>
                        <li><b></b>企业用工保体验使用有效期为6个月，过期则失效并无法体验；</li>
                        <li><b></b>企业用工保的体验时间以领取时间开始计时；</li>
                        <li><b></b>领取的保险套餐不予兑现；</li>
                        <li><b></b>最终解释权归斗米所有；</li>
                    </ul>
                    <a href="https://doumi.kf5.com/hc/kb/article/1035528/" target="_blank">点击查看如何使用？</a>
                </div>
            </div>
        </div>

        <!--领取弹框-->
        <div class="receivePop">
            <el-dialog
              title="立即领取"
              :visible.sync="dialogVisible"
              size="tiny">
              <div class="cout">
                  <template v-if="success"><img src="../assets/imgs/insurance/s.svg" alt=""><span>领取保险成功！</span></template>
                  <template v-if="fail"><img src="../assets/imgs/insurance/j.svg" alt=""><span>{{msg}}</span></template>
              </div>
              <span slot="footer" class="dialog-footer" v-if="errno != 25031">
                <a href="https://doumi.kf5.com/hc/kb/article/1035528/" target="_blank"><el-button>查看如何使用</el-button></a>
                <el-button type="primary" @click="gotoProject"><a href="javascript:;" target="_blank" class="tiyan">去体验</a></el-button>
              </span>
              <span slot="footer" class="dialog-footer" v-else>
                <el-button type="primary" @click="dialogVisible=false"><a href="javascript:;" target="_blank" class="tiyan">确定</a></el-button>
              </span>
            </el-dialog>
        </div>

  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

export default {
  	name: 'Insurancecompany',
  	data () {
    	return {
            insuranceChecked:true,
            dialogVisible: false,
            success:false,
            fail:false,
            team_id:0,
            msg:'',
            errno: 0,
    	}
  	},
  	methods: {
    	init() {
            this.getTeamId()
    	},
        getTeamId(cb){
            //获取当前登录用户的team_id
            util.ajax({
                url:'/user/info',
                type:'GET',
                data:{
                    team_id:0,
                    project_id:0
                },
                timeout:10000,
                success:(obj) => {
                    // console.log(obj)
                    if(obj && obj.errno == 0){
                         this.team_id = obj.data.team_id
                         if(cb) cb()
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
        //前往投保须知详情页
        gotoInsurancetxt(){
            window.open(window.location.href.split('#')[0]+'#'+'/insurancetxt')
        },
        //前往项目列表首页
        gotoProject(){
            window.open(window.location.href.split('#')[0]+'#'+'/project')
        },
        immediatelyReceive(){
            // this.dialogVisible = true
            if(this.insuranceChecked == false){
                this.$message({
                    showClose: true,
                    message: '还未同意投保须知',
                    type: 'warning'
                });
                return
            }
            if(this.team_id){
                console.log(1)
                this.submit()
            }else{
                console.log(2)
                this.getTeamId(this.submit)
            }
        },
        submit(){
            util.ajax({
                url:'/insurance/insurance_giving/receive',
                type:'POST',
                data:{
                    team_id:this.team_id,
                    source:0
                },
                timeout:10000,
                success:(obj) => {
                    // console.log('领取保险')
                    // console.log(obj)
                    if(obj && obj.errno == 0){
                        this.dialogVisible = true
                        if(obj.data.status == true){
                            this.success = true
                            this.fail = false
                        }
                    }else{
                        this.dialogVisible = true
                        this.success = false
                        this.fail = true
                        this.msg = obj.errmsg
                        this.errno = obj.errno
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
        }
  	},
  	mounted() {
    	this.init()
        document.title = '企业用工保'
  	},
  	watch: {
  	  '$route' (to, from) {
  	    // 对路由变化作出响应...
        this.init()
  	  }
  	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#Insurancecompany .wap .checkbox .el-checkbox__inner{
    margin-top: -4px;
    background-color: #5674CC;
}
#Insurancecompany .wap .checkbox .el-checkbox__inner:hover,
#Insurancecompany .wap .checkbox .el-checkbox__input.is-focus .el-checkbox__inner{
    border-color: #fff;
}
#Insurancecompany .wap .checkbox .el-checkbox__input.is-checked .el-checkbox__inner{
    background-color: #ffffff; 
    border-color: #ffffff; 
}
#Insurancecompany .el-checkbox__inner::after{
    border-color:#5574CB;
}
/*#Insurancecompany .wap .checkbox .el-checkbox__inner{border:none;}*/
#Insurancecompany .wap .checkbox .el-checkbox__label{
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 1.2px;
}
#Insurancecompany .wap .checkbox a{
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 1.2px;
    cursor: pointer;
    border-bottom: 1px solid #fff;
    display: inline-block;
    line-height: 18px;
    font-weight: bold;
}
#Insurancecompany .receivePop .el-dialog--tiny{
    width: 400px;
}
#Insurancecompany .receivePop .el-dialog .el-dialog__header{padding: 30px 20px 0;margin-bottom: 30px;}
#Insurancecompany .receivePop .el-dialog__body{padding: 0 40px;}
#Insurancecompany .receivePop .el-dialog__body .cout img{
    float: left;
}
#Insurancecompany .receivePop .el-dialog__body .cout {overflow: hidden;}
#Insurancecompany .receivePop .el-dialog__body .cout span{
    float: left;
    font-size: 14px;
    color: #5E6D82;
    letter-spacing: 0;
    text-align: left;
    line-height: 40px;
    margin-left: 16px;
}
#Insurancecompany .receivePop .el-dialog__footer{
    padding: 30px 20px 20px 20px;
}
#Insurancecompany .receivePop .el-button--default{
    color: #616C72;
    margin-right:5px;
}
#Insurancecompany .receivePop .el-button--default:hover{
    color: #6699ee;
}
#Insurancecompany .receivePop .tiyan{
    color: #ffffff;
    font-size: 14px;
}
</style>
<style scoped>
#Insurancecompany{
    background-color: #f8f8f8;
}
.banner{
    width: 100%;
    min-width: 1000px;
    height: 358px;
    margin: 0 auto;
    background: #5574CB url(../assets/imgs/insurance/banner.svg) no-repeat center center;
}

.wapper{
    width: 1000px;
    margin: 0 auto;
    position: relative;
    background: #ffffff;
}
.wapper .wap{
    height: 230px;
    position: absolute;
    left: -4px;
    top: -232px;
}
.wapper .wap .bdiv{
    width: 410px;
    height: 38px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.21);
    border-radius: 2px;
    line-height: 38px;
    text-align: center;
}
.wapper .wap .btxt{
    font-size: 22px;
    color: #FFFFFF;
    letter-spacing: 2.2px;
    line-height: 40px;
    position: relative;
}
.wapper .wap .btxt b{
    width: 6px;
    height: 6px;
    border-radius: 6px;
    display: inline-block;
    background: #ffffff;
    position: absolute;
    top: 18px;
}
.wapper .wap a.btn{
    display: block;
    width: 152px;
    height: 50px;
    line-height: 50px;
    background: #FFFFFF;
    /*border: 2px solid #FFFFFF;*/
    border-radius: 2px;
    font-size: 20px;
    color: #6886DA;
    letter-spacing: 1px;
    text-align: center;
    position: absolute;
    right: 0px;
    bottom: 97px;
    font-weight: bold;
}
.wapper .wap a.btn:hover{
    opacity: .8;
}
.wapper .wap .checkbox{
    position: absolute;
    right: 0px;
    bottom: 53px;
}
.wapper .content{
    padding: 66px 80px;
    overflow: hidden;
}
.wapper .content>div{
    position: relative;
}
.wapper .content .line{
    position: absolute;
    left: 12px;
    top:24px;
    width:2px;
    height: 100%;
    background-color: #f0f0f0;
}
.wapper .content .first {
    padding-bottom: 64px;
}
.wapper .content .first:before{
    content: '';
    position: absolute;
    left: 12px;
    top:-66px;
    width:2px;
    height: 62px;
    background-color: #f0f0f0;
}
.wapper .content h2{
    font-size: 20px;
    color: #4B4B4B;
    letter-spacing: 0.83px;
    font-weight: bold;
}
.wapper .content .first h2{
    margin-bottom: 24px;
}
.wapper .content h2 span{
    float: left;
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 24px;
    background: #ffffff;
    border: 2px solid #707070;
    font-size: 14px;
    color: #707070;
    letter-spacing: 1.05px;
    margin-top: -4px;
    margin-right: 25px;
}
.wapper .content .first p{
    font-size: 16px;
    color: #707070;
    letter-spacing: 1.2px;
    line-height: 30px;
    margin-left: 50px;
    font-weight: bold;
}
.wapper .content .second{
    padding-bottom: 17px;
}
.wapper .content .second .blocks{
    overflow: hidden;
    margin-left: 50px;
}
.wapper .content .second h2{
    margin-bottom: 40px;
}
.wapper .content .second .blocks dl{
    width: 50%;
    height: 46px;
    line-height: 46px;
    float: left;
    margin-bottom: 33px;
}
.wapper .content .second .blocks dt{
    float: left;
    width: 46px;
    height: 46px;
    margin-right: 20px;
}
.wapper .content .second .blocks dd{
    float: left;
    font-size: 16px;
    color: #707070;
    letter-spacing: 1.2px;
}
.wapper .content .third{
    /*margin-top: 17px;*/
}
.wapper .content .third h2{
    margin-bottom: 23px;
}
.wapper .content .third ul {
    overflow: hidden;
    margin-left: 54px;
    clear: both;
    margin-bottom: 24px;
}
.wapper .content .third ul li{
    font-size: 16px;
    color: #707070;
    letter-spacing: 1.2px;
    line-height: 26px;
}
.wapper .content .third ul li b{
    display: block;
    width: 7px;
    height: 7px;
    border-radius: 7px;
    background: #4B4B4B;
    float: left;
    margin-top: 10px;
    margin-right: 8px;
}
.wapper .content .third a{
    font-size: 16px;
    color: #6699EE;
    letter-spacing: 0;
    margin-left: 54px;
}











</style>
