<template>
    <div id="PayListDetail" class="setpayroll-main">
        <div class="kq-wapper">
            <div class="headertitle clearfix">
                <h2 class="fl setPayroll-h2"><span class="goPayrollList" @click="goPayrollList">工资核算</span> <i class="icon-arrow-right"></i> <i>设置</i></h2>                
            </div>
        <el-form :inline="true" :model="formInline" class="demo-form-inline" label-width="90px"  :rules="rules" ref="formInline">
            <el-col :span="24" class="clearfix setpayroll">
                <el-form-item label="基本工资单价" prop="base_wage_price" class="fl setfirst">
                    <el-input v-model="formInline.base_wage_price"  style="width: 125px" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item  prop="base_wage_unit" class="fl">
                <el-select v-model="formInline.base_wage_unit"  style="width: 90px;margin-left: 16px">
                    <el-option label="元/天" value="0"></el-option>
                    <el-option label="元/时" value="1"></el-option>
                </el-select>
                <span class="note">注：设置后可根据考勤自动计算工资</span>
            </el-form-item>
            </el-col>
            <el-form-item label="工资构成项" class="payroll_constitute">
                <ul class="payroll_composition">
                    <li class="composition_list disabled">基本工资</li>
                    <li class="composition_list " :class="[item.select == 1 ? 'checked' : '']" v-for="item in formInline.extra_config" @click="item.select= item.select == 1 ? 0 : 1">{{item.name}}</li>
                </ul>
            </el-form-item>
            <el-form-item label="">
                <el-button type="primary" @click="submitForm('formInline')" class="setPayroll_save">保存</el-button>
            </el-form-item>
        </el-form>
        </div>
    </div>
</template>
<script>
    import * as util from '../assets/js/util.js' 
    let $ = require("jquery")
    export default{
        data: function(){
            var inputchange = (rule, value, callback) => {
                if (!value) {
                  return callback(new Error('请输入驳回原因'));
                }else if(this.payrollform.name.length < 5){
                  return callback(new Error('原因不能超过5字'));
                }else{
                  callback();
                }
            };
            var checkPrice = (rule, value, callback) => {
                //console.log(!Number.isInteger(value))
                if(isNaN(value)){
                    return callback(new Error('请输入正确的基本工资'));
                }else if(value < 0 || value > 1000){
                    callback(new Error('基本工资应在0到1000'));
                }else if(value.toString().indexOf('.') != -1 && value.toString().split(".")[1].length > 2){
                    callback(new Error('请保留两位小数'));
                }else{
                    callback();
                }
            };
            return{
                formInline:{
                    base_wage_price:'',
                    base_wage_unit:'',
                    type:['基本工资'],
                    extra_config:[],
                },
                rules:{
                    base_wage_price:[
                        { validator: checkPrice, trigger: 'blur' },

                    ],
                    base_wage_unit:[
                        { required: true, message: '请选择工资计算方式', trigger: 'change' }
                    ]
                }
            }
        },
        computed: {
        },
        vuex: {
        },
        watch:{
            '$route' (to,from) {
                if(to.path.split('/').length>2){
                    this.$router.push('PayrollAccounting')
                }
            },
        },
        methods: {
            init (){
                this.team_id = util.getLocalStorage('projectStorageInfo').team_id
                this.project_id = util.getLocalStorage('projectStorageInfo').project_id
                //获取整体工资单详情
                this.getData()
            },
            getData(){
                util.ajax({
                    url:'/wage/component/get',
                    type:'GET',
                    data:{
                        team_id: this.team_id,
                        project_id: this.project_id
                    },
                    timeout:10000,
                    success:(result) => {
                        if(result&&result.errno == 0){
                            this.formInline.base_wage_price = result.data.setting_data.base_wage_price == 0 ? '' : result.data.setting_data.base_wage_price/100
                            this.formInline.base_wage_unit = result.data.setting_data.base_wage_unit.toString();
                            this.formInline.extra_config = result.data.setting_data.extra_config;
                            //console.log(JSON.stringify(this.formInline.type))
                        }else if(result.errno == 26000){

                        }else{
                            this.alertinfo(result.errmsg)
                        }
                    },
                    error: (xhr, status) => {
                        this.alertinfo('服务器异常')
                    },
                    noNetwork: () => {
                        this.alertinfo('网络连接失败，请检查网络')
                    }
                })
            },
            // 显示错误信息
            alertinfo(text,type){
              this.$message({
                showClose: true,
                message: text,
                type: type || 'warning',
              });
            },
            resetForm(formName) {
              this.$refs[formName].resetFields();
              this.showrejected = false
            },
            submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    console.log(JSON.stringify(this.formInline.extra_config))
                    if (valid) {
                    let ajaxData = {
                        team_id: this.team_id,
                        project_id: this.project_id,
                        base_wage_price: this.formInline.base_wage_price == '' ? '' : (this.formInline.base_wage_price*100).toFixed(2),//基本工资单价数值，精确到分
                        base_wage_unit: this.formInline.base_wage_unit,//基本工资单位 0：元/天 1：元/小时
                        extra_config: JSON.stringify(this.formInline.extra_config)
                    }
                    //保存设置
                    util.ajax({
                        url:'/wage/component/set',
                        type:'POST',
                        data:ajaxData,
                        timeout:10000,
                        success:(result) => {
                            console.log(result)
                            if(result&&result.errno == 0){
                                this.alertinfo('保存成功','success')
                                this.$router.replace('PayrollAccounting')
                            }else{
                                this.alertinfo(result.errmsg)
                            }
                        },
                        error: (xhr, status) => {
                            this.alertinfo('服务器异常')
                        },
                        noNetwork: () => {
                            this.alertinfo('网络连接失败，请检查网络')
                        }
                    })
                    } else {
                        return false;
                    }
                });
            },
            doSubmit(type){//通过或驳回
                if(type){
                    this.showrejected =true;
                }
            },
            //返回列表
            goPayrollList(){
                this.$router.replace('PayrollAccounting')
            },
        },
        created(){

            this.init();
            
        }
    }
</script>

<style  src='../assets/css/PayListDetail.css'></style>
<style scope>
    html,body{
        font-family: PingFang SC;
        background: #fff;
    }
    .setpayroll-main .el-form--inline .el-form-item{
        display: block;
        margin-right: 0;
    }
    .setpayroll-main .el-checkbox+.el-checkbox{
        margin-left: 0;
    }
    .setpayroll-main .el-checkbox__label{
        color: #1f2d3d;
        padding-left: 10px;
    }
    .setpayroll-main .el-button--primary{
        margin-left: 88px;
        width: 65px;
        background-color: #6699ee;
    }
    .setpayroll-main .el-checkbox__inner{
        width: 16px;
        border-radius: 1px;
        height: 16px;
        border-color: #e0e6ed;
    }
    .setpayroll-main .el-checkbox__inner::after{
        top: 0;
        left: 4px;
    }
    .setpayroll-main .el-form-item__label{
        font-size: 12px;
        color: #5e6d82;
    }
    .setpayroll-main .demo-form-inline{
        margin-top: 40px;
    }
    .setpayroll-main .el-input__inner{
        border-color: #e0e6ed;
        border-radius: 2px;
    }
    .note{
        margin-bottom: 8px;
    }
    .setpayroll-main .note{
        font-size: 12px;
        color: #8492a6;
        margin-left: 24px;
    }
    .setpayroll-main .fl{
        float: left;
    }
    .setpayroll-main .kq-wapper>h2>span{
        color: #8492a6
    }
    .setpayroll-main .kq-wapper h2 .goPayrollList{
        cursor: pointer;
    }
    .setpayroll-main .setPayroll_save>span{
        font-size: 14px;
    }
    .setpayroll-main .kq-wapper .setPayroll-h2{
        margin-bottom: 0;
    }
    .setPayroll_save.el-button--primary{
        margin-left: 90px;
    }
    .setpayroll-main .payroll_constitute{
        margin-top: 24px;
    }
    .setpayroll-main .payroll_composition{
        width: 570px;
    }
    .setpayroll-main .payroll_composition:after{
        content: '';
        display: block;
        clear: both;
    }
    .setpayroll-main li.composition_list {
        position: relative;
        width: 85px;
        height: 35px;
        border-radius: 2px;
        border: solid 1px #e0e6ed;
        text-align: center;
        color: #475568;
        font-size: 14px;
        display: block;
        float: left;
        margin-right: 8px;
        margin-bottom: 12px;
        cursor:pointer;
    }
     .setpayroll-main li.composition_list:hover{
        color: #6699ee;
        border-color: #6699ee;
     }
    .setpayroll-main li.checked{
        border-color: #6699ee;
        color: #6699ee;
    }
    .setpayroll-main li.disabled{
        color: #c0ccda;
        border-color: #e0e6ed;
        cursor: default;
    }
    .setpayroll-main li.checked:after{
        position:absolute;
        top:0;
        right:-1px;
        content: '';
        display: block;
        width: 20px;
        height: 20px;
        background:url(../assets/imgs/checkbox_cd.svg) no-repeat;
    }  
    .setpayroll-main li.disabled:after{
        position:absolute;
        top:0;
        right: -1px;
        content: '';
        display: block;
        width: 20px;
        height: 20px;
        background:url(../assets/imgs/checkbox_dis.svg) no-repeat;
    }
    .setpayroll-main li.disabled:hover{
        color: #c0ccda;
        border-color: #e0e6ed;
        cursor:default;
    }
</style>