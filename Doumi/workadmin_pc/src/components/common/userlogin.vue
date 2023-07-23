<template>
  <div class="userlogin">
      <div class="userlogin-list">
          <div class="tab-list-right">
              <!-- <div class="user-img" :class="{'user-img-def':!info.logo}">
                <img :src="info.logo" v-if="info.logo">
              </div> -->
              <div class="user-list">
                  <h3 @click.stop="userHandleSelect">
                    <span>{{info.name}}</span> 
                    <i class="user_down" :class="{'show':isOpen}"></i>
                    <!-- <i class="el-icon-caret-top" v-if="top" style="margin-left:8px;"></i> -->
                  </h3>
                  <ul class="ul-list" id="ulList">
                      <li @click.stop="myWallet" v-show="false"><a href="javascript:;">我的钱包</a></li>
                      <li><a href="https://doumi.kf5.com/hc/" target="_blank">使用帮助</a></li>
                      <li @click.stop="loginOut"><a href="javascript:;">退出</a></li>
                  </ul>
              </div>
          </div>
       <!--    <el-menu class="el-menu-demo" mode="horizontal" menu-trigger="click" @select="handleSelect" @open.prevent="open" @close.prevent="close">
            <div class="tab-list-right">
              <div class="user-img">
                <img :src="info.logo">
              </div>
              <div class="user-list">
                <el-submenu index="5">
                  <template slot="title">{{info.name}}</template>
                  <el-menu-item class="li-hover" index="5-1">我的钱包</el-menu-item>
                  <el-menu-item class="li-hover" index="5-2"><a href="https://doumi.kf5.com/hc/" target="_blank">使用帮助</a></el-menu-item>
                  <el-menu-item class="li-hover" index="5-3">退出</el-menu-item>
                </el-submenu>
              </div>
          </div>
        </el-menu> -->
      </div>

      <div class="loginout">
          <el-dialog
            title="提示"
            :visible.sync="dialogVisible"
            size="tiny">
            <span>禁用考勤任务后，员工将无法继续在此考勤任务下打
卡，是否确认禁用</span>
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="confirmSignOut">确 定</el-button>
            </span>
          </el-dialog>
      </div>
  </div>
</template>

<script>
    import * as util from '@/assets/js/util.js'
    let $ = require("jquery")
    
    export default{
      name: 'userlogin',
      components:{

      },

      props:['teamId'],
      data:function(){
        return{
            top:false,
            bottom:true,
            isOpen:false,
            dialogVisible: false,
            is_premium_user:false,
            info:{
              logo:'',
              name:''
            }
        }
      },
      computed:{

      },
      methods:{
        init (){
            this.getBannerData()

        },
        //我的钱包
        myWallet(){
            this.bottom = true
            this.top = false
            this.isOpen = false
        },
        //退出
        loginOut(){
            this.bottom = true
            this.top = false
            this.isOpen = false
            this.is_premium_user = util.getLocalStorage('is_premium_user') == 1 ? true : false;
            window.localStorage.removeItem('is_premium_user');
            if(this.is_premium_user === true){
              location.href = 'https://qifu.doumi.com/sea/api/1.0/client/v1/user/logout?dmclient=pcweb';
            }else{
              location.href = 'https://vip.doumi.com/employer/user/logout';
            }
            //退出 弹出二次确认弹窗
            // this.dialogVisible = true
        },
        userHandleSelect(){
            if(this.bottom){
                this.bottom = false
                this.top = true
                this.isOpen = true
            }else{
                this.bottom = true
                this.top = false
                this.isOpen = false
            }
        },
        confirmSignOut(){
          //清楚cookie 返回 vip.doumi.com

          this.dialogVisible = false
          // var keys=document.cookie.match(/[^=;]+(?=\=)/g); 
          // if(keys){ 
          //   console.log(keys)
          //   for (var i = keys.length; i--;){
          //     document.cookie=keys[i]+'=0;expires=' + new Date(0).toUTCString() +';path=/;domain=.vip.doumi.com'
          //   }
          // } 
          // location.href="http://vip.doumi.com"
        },
        //不同用户角色获取不同banner条
        getBannerData(){
            util.ajax({
                url:'/cloud/banner/get',
                type:'GET',
                data:{
                    team_id:this.teamId,
                    project_id:0
                },
                timeout:10000,
                success:(obj) => {
                    // console.log(obj)
                    if(obj && obj.errno == 0){
                        this.info.logo = obj.data.setting_data.user.logo.thumb_url
                        this.info.name = obj.data.setting_data.user.name
                        this.is_premium_user = obj.data.is_premium_user;
                        util.setLocalStorage('currLoginUserId',obj.data.setting_data.user.user_id)
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
        handleSelect(key, keyPath) {
            // console.log(key, keyPath)
            if(key === '5-3'){
              //退出 弹出二次确认弹窗
              // this.dialogVisible = true
            }
        }
      },
      created(){
          this.init()
      },
      mounted(){
        let that = this
        $(window).click(() => {
            that.bottom = true
            that.top = false
            that.isOpen = false
        })
      }
    }
</script>

<style>
  .userlogin{
    float: right;
  }
  .userlogin-list{
    float: right;
    height: 60px;
    line-height: 60px;
  }
  .tab-list-right{cursor: pointer;position: relative;}
  .tab-list-right .user-img{
    float: left;
    width: 30px;
    height: 30px;
    margin-top: 15px;
    /*background-image: url('../../assets/imgs/avatar.png');*/
    background-size: contain;
    border-radius: 30px;
    overflow:hidden;
    background-color: #808A9A;
  } 
  .tab-list-right .user-img-def{
    float: left;
    width: 30px;
    height: 30px;
    margin-top: 15px;
    background-image: url('../../assets/imgs/avatar.png');
    background-size: contain;
    border-radius: 30px;
    overflow:hidden;
    background-color: #808A9A;
  } 
  .userlogin .user-img img{
      display: block;
      width: 26px;
      height: 26px;
      margin: 0 auto;
      margin-top: 2px;
      border-radius: 26px;
  }
  .userlogin .user-list{
    min-width: 100px;
    box-sizing: border-box;
    padding-right: 20px;
    height: 58px;
    float: right;
    border: 1px solid transparent;
  }
  .userlogin .user-list:hover{
    border: 1px solid #262e3b;
    border-bottom: 1px solid transparent;
  }
  .userlogin .user-list h3{
      font-size: 14px;
      color: #bfbfbf;
  }
  .userlogin .user-list h3 span{
      font-size: 14px;
      color: #bfbfbf;
      margin-left: 20px;
      margin-right: -3px;
  }
  /*.userlogin .user-list h3 span:hover{color: #ffffff;}*/
  .userlogin .user-list .ul-list{
      display: none;
      min-width: 100%;
      box-sizing: border-box;
      /*width: 120px;*/
      /*padding: 11px 0px 11px 0px;*/
      background-color: #383c49;
      /*box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.04), 0 2px 4px 0 rgba(0, 0, 0, 0.12);*/
      border: solid 1px #262e3b;
      border-top: none;
      /*border-radius: 2px;*/
      position: absolute;
      right: 0px;
      top: 60px;
      z-index: 999999999;
      text-align:left;
      transition: all ease .3s;
  }
  .userlogin .user-list:hover .ul-list{
    display: block;
  }
  .userlogin .user-list .ul-list li{
      height: 38px;
      line-height: 38px;
      padding: 0 20px;
  }
   .userlogin .user-list .ul-list li a{
      display: block;
      color: #bfbfbf;
      font-size: 14px;
   }
   .userlogin .user-list .ul-list li:hover{
      background-color: #262e3b;
   }
  .userlogin .user_down{
    display: inline-block;
    width: 8px;
    height: 5px;
    background: url(../../assets/imgs/user_down.svg) no-repeat center;
    margin:0 0 2px 5px;
  }
  .userlogin .is-reverse{
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }
  .userlogin .user-list i{
    transition: all ease .3s;
    color:#bfbfbf;
  }
  .userlogin .user-list:hover i{
    transform-origin:50% 50%;
    transform: rotate(180deg);
  }

 

  /*.userlogin .el-menu-item, .el-submenu__title{color:#e0e6ed;padding: 0 20px 0 16px;}
  .userlogin .el-menu-item.is-active{color: #fff}
  .userlogin .el-submenu.is-active .el-submenu__title, .el-menu--horizontal .el-submenu .el-submenu__title, .el-menu--horizontal>.el-menu-item{border-bottom:none;}
  .userlogin .el-menu--horizontal .el-menu-item:hover, .el-menu--horizontal .el-submenu__title:hover{background-color:#42495c;}
  .userlogin .el-menu--horizontal>.el-menu-item:hover, .el-menu--horizontal .el-submenu__title:hover{border-bottom:none;color: #fff;}
  .userlogin .el-menu--horizontal .el-submenu>.el-menu{left: -37px;top: 62px;z-index: 9999;}
  .userlogin .user-list .el-menu{width: 120px;}
  .userlogin .user-list li{text-align:left;}
  .userlogin .user-list li a{font-size: 14px;}
  .userlogin .user-list .li-hover{color: #475568;}
  .userlogin .user-list .li-hover:hover{background-color: #f5f5f5}
  .userlogin .user-list .el-menu--horizontal .el-submenu .el-menu-item{line-height: 44px;}
  .userlogin .loginout .el-dialog{width: 400px;height: 213px;}
  .userlogin .loginout .el-dialog__header{padding: 30px 20px 0 20px;}
  .userlogin .loginout .el-dialog__title{font-size: 18px;color: #606c73}
  .userlogin .loginout .el-dialog__body{padding: 27px 40px 30px 40px;}
  .userlogin .loginout .el-dialog__body span{font-size: 14px;color: #5e6d82;line-height: 1.57;}
  .userlogin .loginout .el-dialog__footer .el-button{padding: 10px 21.5px;border-radius:1px;}
  .userlogin .el-menu--horizontal .el-submenu .el-submenu__icon-arrow{margin-left: 8px;margin-top: 0px;color: #858c9e} */
</style>
