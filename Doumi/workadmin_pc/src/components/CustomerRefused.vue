<template>
  <div class="customer_Refused" :style="{height:heightMain+ 'px'}">
    <div class="customer_bg">
      <div class="customer_blue">
      </div>
      <div class="customer_white">
      </div>
    </div>
    <div class="customer_mask" >
      <div class="mask_main">
        <div  v-show="showmain">
          <h2>请详细说明问题原因，我们会尽快通知负责人跟您沟通</h2>
          <i class="line"></i>
          <div class="num_ipt">
            <textarea placeholder="请输入拒绝原因（5-200字）" v-model="textarea" maxlength="200"  :class="{errorbr:errorbr}" @input="changCode"></textarea>
          </div>
          <p class="text_lg"><span class="error" v-show="showerrormg">{{message}}</span><span>{{textarea.length}}</span>/200</p>
          <a href="javascript:;" @click="confirmCode">确 认</a>
        </div>
        <div class="success_main" v-show="!showmain">
          <i class="success_ico"></i>
          <p class="success_info">{{statustext}}</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
  import * as util from '../assets/js/util.js'
  let $ = require("jquery")

  export default{
      name: 'memberAdmin',
      components:{

      },
      data:function(){
        return{
          showerror:false,
          message:'',
          inputIndex:'',
          textarea:'',
          errorbr:false,
          showerrormg:false,
          showmain:true,
          statustext:''
        }

      },
      computed:{

      },
      watch: {
        
      },
      methods:{
        init (){
          this.team_id = this.GetQueryString('team_id')
          this.confirm_id = this.GetQueryString('confirm_id') 
          this.project_id = this.GetQueryString('project_id')
          this.heightMain = window.innerHeight;
          util.ajax({
              url:'/confirmmail/feedback',
              type:'POST',
              data:{
                    team_id: this.team_id,
                    project_id:this.project_id,
                    confirm_id:this.confirm_id,
                    confirm_flag:3,
                    remark:'',
                    code:''
              },
              timeout:10000,
              success:(obj) => {
                if(obj.errno== 0){
                  this.showmain = obj.data.row.status_no == 0 ? true : false;
                  if(obj.data.row.status_no == 1){
                    this.statustext = '确认成功'
                  }else if(obj.data.row.status_no == 2){
                    this.statustext = '问题已反馈'
                  }

                }else{
                  this.$message({
                      showClose: true,
                      message: obj.errmsg,
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
                this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络',
                    type: 'warning'
                });
              }
          })
        },
        GetQueryString(name){
           var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
           var r = ('?'+window.location.href.split('?')[1]).substr(1).match(reg);
           if(r!=null)return  unescape(r[2]); return null;
        },
        changCode(){
          if(this.textarea && this.textarea.length >= 5){
            this.errorbr = false;
            this.showerrormg = false;
          }
        },
        confirmCode(){
          if(!this.textarea){
            this.message = '请输入拒绝原因';
            this.errorbr = true;
            this.showerrormg = true;
          }else if(this.textarea.length < 5){
            this.message = '请输入5-200字的问题原因';
            this.errorbr = true;
            this.showerrormg = true;
          }else{
            util.ajax({
                url:'/confirmmail/feedback',
                type:'POST',
                data:{
                    team_id: this.team_id,
                    project_id:this.project_id,
                    confirm_id:this.confirm_id,
                    confirm_flag:2,
                    remark:this.textarea,
                    code:''
                },
                timeout:10000,
                success:(obj) => {
                  if(obj.errno== 0){
                    this.showmain =false;
                    this.errorbr = false;
                    this.statustext ='问题已反馈'
                  }else{
                    this.message = obj.errmsg;
                    this.errorbr = true;
                    this.showerrormg = true;
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
                  this.$message({
                      showClose: true,
                      message: '网络连接失败，请检查网络',
                      type: 'warning'
                  });
                }
            })
          }
          
        },
      },
      created(){
        document.title = '客户拒绝-斗米工作助手'
        this.init()

      },
    }
</script>
<style scope>
.success_main{
  width: 100%;
}
::-webkit-input-placeholder {
    color:    #c0ccda;
}
:-moz-placeholder { 
    color:    #c0ccda;
}
::-moz-placeholder {
    color:    #c0ccda;
}
:-ms-input-placeholder {
    color:    #c0ccda;
}
.success_main i{
  display: block;
  width: 100px;
  height: 100px;
  background: url(../assets/imgs/customer/customer_success.svg) no-repeat;
  background-size: 100% 100%;
  margin:125px  auto 32px;
}
.success_info{
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  color: #475669;
}
  button,
  input[type=button],
  input[type=reset],
  input[type=submit] {
      -webkit-appearance: button;
      -webkit-user-select: none;
      cursor: pointer;
  }

  button[disabled],
  input[disabled] {
      cursor: default;
  }

  button::-moz-focus-inner,
  input::-moz-focus-inner {
      border: 0 none;
      padding: 0;
  }

  input[type=checkbox],
  input[type=radio] {
      box-sizing: border-box;
  }

  input[type=search] {
      -webkit-appearance: textfield;
      -moz-box-sizing: content-box;
      -webkit-box-sizing: content-box;
      box-sizing: content-box;
  }

  input[type=search]::-webkit-search-cancel-button,
  input[type=search]::-webkit-search-decoration {
      -webkit-appearance: none;
  }
  input,textarea {
      outline: none;
      -webkit-appearance: none; 
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
  input:-webkit-autofill,
  textarea:-webkit-autofill,
  select:-webkit-autofill {
      box-shadow: 0 0 0 999px #fff inset;
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
      -webkit-appearance: none;
  }

  textarea {
      overflow: auto;
      vertical-align: top;
      resize: vertical;
  }
  html,body{
    width: 100% ;
  }
  #app{
    height: 100%;
    width: 100%;
  }
  .customer_Refused{
    position: relative;
    height: 100%;
    width: 100%;
  }
  .customer_Refused .customer_bg{
    width: 100%;
    height: 100%;
  }
  .customer_Refused .customer_blue{
    width: 100%;
    height: 50%;
    background-image: -webkit-linear-gradient(219deg, #72a1d2, #8fbdff, #83baf9);
    background-image: -o-linear-gradient(219deg, #72a1d2, #8fbdff, #83baf9);
    background-image: linear-gradient(309deg, #72a1d2, #8fbdff, #83baf9);
  }
  .customer_Refused .customer_white{
    height: 50%;
    width: 100%;
    background-color: #fff;
  }
   .customer_Refused  .customer_mask{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
   .customer_Refused  .mask_main{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
    width: 760px;
    height: 470px;
    overflow: hidden;
    border-radius: 6px;
    background-color: #ffffff;
    margin: auto;
  }
   .customer_Refused  .mask_main h2{
    font-size: 18px;
    color: #5e6d82;
    text-align:center;
    margin-top: 40px;
  }
   .customer_Refused  .mask_main .line{
    position: relative;
    display: block;
    width: 6px;
    height: 6px;
    background-color: #e0e6ed;
    border-radius: 3px;
    -webkit-border-radius: 3px;
    margin:41px auto;
  }
  .customer_Refused   .mask_main .line:before{
    position: absolute;
    top: 1px;
    right: 25px;
    display: block;
    content: '';
    width: 160px;
    border-style: solid;
    border-width: 1px;
    border-image-source: linear-gradient(to right, rgba(255, 255, 255, 0.0), rgba(0, 0, 0, 0.07));
    border-image-slice: 1;

  }
  .customer_Refused   .mask_main .line:after{
    position: absolute;
    top: 1px;
    left: 25px;
    width: 160px;
    display: block;
    content: '';
    border-style: solid;
    border-width: 1px;
    border-image-source: linear-gradient(to left, rgba(255, 255, 255, 0.0), rgba(0, 0, 0, 0.07));
    border-image-slice: 1;
  } 
  .customer_Refused   .num_ipt{
    display: flex;
    width: 600px;
    margin: auto;
    justify-content: space-between;
  }
  .customer_Refused   .num_ipt textarea{
    display: block;
    width: 598px;
    height: 135px;
    border-radius: 4px;
    background-color: rgba(32, 53, 128, 0.01);
    border: solid 1px rgba(32, 53, 128, 0.16);
    font-size: 16px;
    margin: auto;
    color: #c0ccda;
    padding: 16px;
  }
  .customer_Refused   .num_ipt textarea:focus{
    background-color: rgba(32, 53, 128, 0.01);
    border: solid 1px #6699ee;

  }
  .customer_Refused   .mask_main a{
    display: block;
    width: 256px;
    height: 50px;
    border-radius: 4px;
    background-color: #6699ee;
    border: solid 1px rgba(32, 53, 128, 0.16);
    letter-spacing: 0.3px;
    text-align: center;
    color: #ffffff;
    font-size: 16px;
    line-height: 50px;
    margin: 33px auto 48px;
  }
  .customer_Refused .mask_main a:after{
    display: block;
    content: '';
    width: 230px;
    height: 1px;
    margin: -6px auto;
    box-shadow: 0 7px 10px 4px rgba(124, 167, 255, 0.44);
  }
  .customer_Refused   .mask_main a:hover{
    background-color: #8bb1f2;
    border-color: #8bb1f2;
  }
   .customer_Refused  .mask_main a:active{
    background-color: #6699ee;
    border-color: #6699ee;
  }
  .customer_Refused   .text_lg{
    color: #c0ccda;
    text-align: right;
    padding-right: 77px;
    margin-top: 8px;
    font-size: 16px;
  }
  .customer_Refused   .text_lg span{
    font-size: 16px;
    color: #99a9bf;
  }
  .customer_Refused   .text_lg .error{    
    text-align: left;
    display: inline-block;
    width: 556px;
    color: #f26a4b
  }
  .customer_Refused   .num_ipt .errorbr{
    border-color: #f26a4b;
  }
</style>

