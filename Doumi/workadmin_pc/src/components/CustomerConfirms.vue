<template>
  <div class="customer_confirm" :style="{height:heightMain+ 'px'}">
    <div class="customer_bg">
      <div class="customer_blue">
      </div>
      <div class="customer_white">
      </div>
    </div>
    <div class="customer_mask" >
      <div class="mask_main" v-bind:style="{height:maskHeight + 'px',width:'360px'}">
        <div v-show="showmain">
          <h2>请输入邮件中的验证码进行确认</h2>
          <i class="line"></i>
          <div class="num_ipt" style="width:314px">
            <input type="text" class="code_input" maxlength="1" @input="changCode($event.target.value,$event.target,0)" @keyup="keyupfn($event.target,0,$event.which)">
            <input type="text" class="code_input"  maxlength="1"  @input="changCode($event.target.value,$event.target,1)" @keyup="keyupfn($event.target,1,$event.which)">
            <input type="text" class="code_input"  maxlength="1" @input="changCode($event.target.value,$event.target,2)" @keyup="keyupfn($event.target,2,$event.which)">
            <input type="text" class="code_input"  maxlength="1" @input="changCode($event.target.value,$event.target,3)" @keyup="keyupfn($event.target,3,$event.which)">
          </div>
          <a href="javascript:;" @click="confirmCode">确 认</a>
          <p class="error_msg" v-show="showerror"><i class="error_ico"></i>{{message}}</p>
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
          maskHeight:406,
          showerror:false,
          message:'',
          inputIndex:'',
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
          setTimeout(function(){
            $('.code_input').first().focus()
          },10)
        },
        GetQueryString(name){
           var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
           var r = ('?'+window.location.href.split('?')[1]).substr(1).match(reg);
           if(r!=null)return  unescape(r[2]); return null;
        },
        changCode(val,target,index){
          let newVal = val.replace(/\D/g,'');
          target.value = newVal;
          this.maskHeight = 406;
          this.showerror = false;
          this.inputIndex = index;
          if(newVal && index != 3){
            if($('.code_input').eq(index+1).val()) return;
            $('.code_input').eq(index+1).focus()
          }
        },
        confirmCode(){
          let inpDom = $('.code_input'),
              code =  inpDom.eq(0).val() +inpDom.eq(1).val() + inpDom.eq(2).val() + inpDom.eq(3).val();
          if(code.length < 4){
            this.maskHeight = 456;
            this.showerror = true;
            this.message = '验证码错误'
            return;
          }
          util.ajax({
              url:'/confirmmail/feedback',
              type:'POST',
              data:{
                  team_id: this.team_id ,
                  project_id:this.project_id,
                  confirm_id:this.confirm_id,
                  confirm_flag:1,
                  remark:'',
                  code:code

              },
              timeout:10000,
              success:(obj) => {
                if(obj.errno == 0){
                  this.showerror = false;
                  this.showmain = false;
                  this.maskHeight = 406;
                  this.statustext = '确认成功'
                }else{
                  this.maskHeight = 456;
                  this.showerror = true;
                  this.message = obj.errmsg
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
        keyupfn(target,index,keycode){
          let val = target.value;
          this.inputIndex = index;
          if(keycode === 37){
            if(index > 0){
              $('.code_input').eq(index - 1).focus()
            }
          }else if(keycode === 39){
            if(index < 3){
              $('.code_input').eq(index + 1).focus()
            }
          }
        }
      },
      created(){
        document.title = '客户验证码确认-斗米工作助手'
        this.init()

      },
    }
</script>
<style scope>
.customer_confirm .success_main{
  width: 100%;

}
.customer_confirm .success_main i{
  display: block;
  width: 100px;
  height: 100px;
  background: url(../assets/imgs/customer/customer_success.svg) no-repeat;
  background-size: 100% 100%;
  margin:125px  auto 32px;
}
.customer_confirm .success_info{
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
  input {
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
 .customer_confirm #app{
    height: 100%;
    width: 100%;
  }
  .customer_confirm .customer_confirm{
    position: relative;
    height: 100%;
    width: 100%;
  }
  .customer_confirm .customer_bg{
    width: 100%;
    height: 100%;
  }
  .customer_confirm .customer_blue{
    width: 100%;
    height: 50%;
    background-image: -webkit-linear-gradient(219deg, #72a1d2, #8fbdff, #83baf9);
    background-image: -o-linear-gradient(219deg, #72a1d2, #8fbdff, #83baf9);
    background-image: linear-gradient(309deg, #72a1d2, #8fbdff, #83baf9);
  }
  .customer_confirm .customer_white{
    height: 50%;
    width: 100%;
    background-color: #fff;
  }
  .customer_confirm .customer_mask{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .customer_confirm .mask_main{
    position: absolute;
    top: 150px;
    left: 0;
    right: 0;
    -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
    width: 360px;
    overflow: hidden;
    border-radius: 6px;
    background-color: #ffffff;
    margin: auto;
  }
  .customer_confirm .mask_main h2{
    font-size: 18px;
    color: #5e6d82;
    text-align:center;
    margin-top: 40px;
  }
  .customer_confirm .mask_main .line{
    position: relative;
    display: block;
    width: 6px;
    height: 6px;
    background-color: #e0e6ed;
    border-radius: 3px;
    -webkit-border-radius: 3px;
    margin:41px auto;
  }
  .customer_confirm .mask_main .line:before{
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
  .customer_confirm .mask_main .line:after{
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
  .customer_confirm .num_ipt{
    display: flex;
    width: 314px;
    margin: auto;
    justify-content: space-between;
  }
  .customer_confirm .num_ipt input{
    width: 65px;
    height: 65px;
    border-radius: 4px;
    -webkit-border-radius: 4px;
    background-color: rgba(32, 53, 128, 0.01);
    border: solid 1px rgba(32, 53, 128, 0.16);
    font-size: 36px;
    text-align: center;
    caret-color:#6699ee;
    color: #6699ee;
  }
  .customer_confirm .num_ipt input:focus{
    background-color: rgba(32, 53, 128, 0.01);
    border: solid 1px #6699ee;

  }
  .customer_confirm .mask_main a{
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
    margin: 56px auto 0;
  }
  .customer_confirm .mask_main a:after{
    display: block;
    content: '';
    width: 230px;
    height: 1px;
    margin: -6px auto;
    box-shadow: 0 7px 10px 4px rgba(124, 167, 255, 0.44);
  }
  .customer_confirm .mask_main a:hover{
    background-color: #8bb1f2;
    border-color: #8bb1f2;
  }
  .customer_confirm .mask_main a:active{
    background-color: #6699ee;
    border-color: #6699ee;
  }
  .customer_confirm .mask_main .error_msg{
    width: 100%;
    height: 64px;
    line-height: 64px;
    margin-top:69px;
    border-top: solid 1px  rgba(32, 53, 128, 0.16);
    background-color: rgba(32, 53, 128, 0.01);
    font-size: 14px;
    color: #ff7663;
    text-align: center;
  }
  .customer_confirm .error_msg .error_ico{
    display: inline-block;
    width: 18px;
    height: 22px;
    margin-right: 6px;
    background:url(../assets/imgs/customer/customer_error.svg) no-repeat;
    background-size: 18px;
    vertical-align: middle;
  }
</style>