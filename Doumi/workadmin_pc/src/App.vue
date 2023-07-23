<template>
  <div id="app">
    <div class="header" v-if="$route.path === '/project' || $route.path.indexOf('/statistics')>=0 || $route.path.indexOf('/insurancetxt')>=0">
      <el-row class="header-nav">
          <div class="logo">
              <h1></h1>
          </div>
          <ul class="navlist" v-if="is_premium_user === false">
              <li :class="{'active': activeNav === 'home_page'}" @click="changeNav('home_page')">{{bannerData.home_page}}</li>
              <li :class="{'active': activeNav === 'recruit'}" @click="changeNav('recruit')">{{bannerData.recruit}}</li>
              <li :class="{'active': activeNav === 'resume'}" @click="changeNav('resume')">{{bannerData.resume}}</li>
              <li :class="{'active': activeNav === 'project'}" @click="changeNav('project')">{{bannerData.project}}</li>
              <li :class="{'active': activeNav === 'statistics'}" @click="changeNav('statistics')">{{bannerData.statistics}}</li>
              <!-- <li :class="{'active': activeNav === 'outsourcing'}" @click="changeNav('outsourcing')">{{bannerData.outsourcing}}</li> -->
              <li :class="{'active': activeNav === 'team'}" @click="changeNav('team')">{{bannerData.team}}</li>
              <li :class="{'active': activeNav === 'propstore','hot':true}" @click="changeNav('propstore')">{{bannerData.propstore}}</li>
          </ul>
          <!-- 右边用户展示部分——引入组件 -->
          <userlogin :team-id="team_id"></userlogin>
          <div class="phone">
            合作热线：<span>010-57977077</span>  
          </div>
        </el-row>
      </div>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    
  </div>
</template>

<script>
    /**
     *  引入组件 以及 组件接口(Action)
     *  example : import Somecomponents from 'components/Somecomponents/Somecomponents'
     */
    import * as util from './assets/js/util.js'
    import Userlogin from '@/components/common/Userlogin'


    export default{
      name: 'app',
      components:{
          Userlogin
      },
      data:function(){
        return{
            activeNav: 'home_page',
            bannerData:{},
            is_premium_user:false,
            team_id:0,
        }
      },
      computed:{

      },
      methods:{
        init (){
          this.team_id = document.URL.split('=')[1] || 0;
          this.is_premium_user = util.getLocalStorage('is_premium_user') == 1 ? true : false;
          this.reNav()
          this.getBannerData()
        },
        //不同用户角色获取不同banner条
        getBannerData(){
          console.log(this.team_id,9999)
            let url = location.href;
            if(url.indexOf('CustomerConfirms') != -1 || url.indexOf('CustomerRefused') != -1 || url.indexOf('protocol') != -1 ) return;
            util.ajax({
                url:'/cloud/banner/get',
                type:'GET',
                data:{
                    team_id:this.team_id,
                    project_id:0
                },
                timeout:10000,
                success:(obj) => {
                    console.log('banner/get')
                    console.log(obj)
                    if(obj && obj.errno == 0){
                        this.bannerData = obj.data.setting_data;
                        // console.log('team_id='+obj.data.setting_data.user.team_id)
                        // util.setLocalStorage('projectStorageInfo',{team_id: obj.data.setting_data.user.team_id})
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
        //返回首页
        changeNav(lab){
          this.activeNav = lab
          if(lab === 'home_page'){
            location.href = "https://vip.doumi.com/home/"
          }else if(lab === 'project'){
            this.$router.push('/project')
          }else if(lab === 'team'){
            location.href = "https://vip.doumi.com/employer/company/edit"
          }else if(lab === 'statistics'){
            this.$router.push('/statistics')
          }else if(lab === 'outsourcing'){
            location.href = "https://vip.doumi.com/zhaopin/"
          }else if(lab === 'recruit'){
            location.href = 'https://vip.doumi.com/managecenter/';
          }else if(lab === 'resume'){
            location.href = 'https://vip.doumi.com/vipcloud/resume/allresume/untreated';
          }else if(lab === 'propstore'){
            location.href = 'https://vip.doumi.com/propstore/index';
          }
        },
        reNav() {
          let cur_route = location.href
          //当前页面刷新时判断对应nav
          if(cur_route.indexOf('#/project')>=0||cur_route.indexOf('#/insurancetxt')>=0){//项目
            this.activeNav = 'project'
          }else if(cur_route.indexOf('#/statistics')>=0){//统计
            this.activeNav = 'statistics'
          }
        }
      },
      created(){
        this.init()
        //断网
          let t = this
          window.addEventListener("offline", function(e) {
              t.$message({
                showClose: true,
                message: '当前无网络，请检查网络是否连接正常',
                type: 'warning'
              });
          })  
          // //联网
          window.addEventListener("online", function(e) {}) 
      },
      watch:{
        '$route' () {
          this.reNav()
          _hmt.push(['_trackPageview', location.href.split('#')[1]]);
        },
      }
    }
</script>

<style>
@import './assets/css/reset.css';
  #app {
    font-family: "PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    /*color: #2c3e50;*/
  }
  .header{
    min-width:1000px;
    background-color:#383C49;
    font-size: 14px;
    box-shadow: 0 8px 4px 0 rgba(242, 242, 242, 0.5);
  }
  .header-nav{
    /*width:1200px; */
    height: 60px; 
    margin-left: 13px;
    background-color:#383C49;
  }
  /*@media screen and (max-width: 1200px) {
      .header-nav{
        width:1000px;
        height: 60px;
        background-color:#383C49;
      }
  }*/
  .header-nav .logo{
    /*width: 148px;*/
    float: left;
    height: 60px;
    margin-right: 38px;
  }
  .header-nav .logo h1{
    float: left;
    width: 153px;
    height: 30px;
    margin-top:15px;
    background: url(./assets/imgs/logo.svg) no-repeat center;
  }
  .header-nav ul.navlist{
    float: left;
  }
  .header-nav ul.navlist li{
      float: left;
      font-size: 16px;
      color: #bfbfbf;
      margin: 0 22px;
      line-height: 60px;
      cursor: pointer;
      position: relative;
  }
  /*.header-nav ul.navlist li:hover,*/
  .header-nav ul.navlist li.active{
    color: #ffffff;
    font-weight: 500;
  }
  .header-nav ul.navlist li.hot:after{
    content: '';
    position: absolute;
    width: 16px;
    height: 10px;
    top: 10px;
    right: -16px;
    background: url(assets/imgs/hot.png) no-repeat center;
  }
  .header-nav .phone{
    float: right;
    margin-right: 14px;
    height: 60px;
    line-height: 60px;
    color: #999;
    font-size: 14px;
  }
  .header-nav .phone>span{
    color: #ffa928;
    font-size: 16px;
    font-weight: 700;
    font-family: arial;
    font-style: italic;
  }

::-webkit-scrollbar{
	width:10px;
	height:10px;
}
::-webkit-scrollbar-track{
	background: rgb(239, 239, 239);
	border-radius:2px;
}
::-webkit-scrollbar-thumb{
	background: #bfbfbf;
	border-radius:3px;
}
::-webkit-scrollbar-thumb:hover{
	background: #383c49;
}
/* ::-webkit-scrollbar-corner{
	background: #179a16;
} */
</style>
