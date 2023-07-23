<template>
  	<div class="statistics">
    	<div class="main">
    	  	<div class="side_bar">
				<el-menu :default-active="cur_app_id" class="el-menu-vertical-demo" @select="handleSelect">
					<!-- <el-submenu index="1">
						<template slot="title"><i class="icon zhptj"></i>招聘统计</template>
						<el-menu-item index="1-1">招聘概览</el-menu-item>
					</el-submenu> -->
					<el-menu-item index="1-1"><i class="icon zhptj"></i>招聘统计</el-menu-item>
					<el-menu-item index="3-1"><i class="icon xmtj"></i>项目统计</el-menu-item>
					<!-- <el-menu-item index="2"><i class="icon zhhtj"></i>账号活跃统计</el-menu-item> -->
					<el-submenu index="4">
						<template slot="title"><i class="icon tctj"></i>套餐统计</template>
						<el-menu-item index="4-1">直聘通统计</el-menu-item>
					</el-submenu>
				</el-menu>
    	  	</div>
	  		<!-- 二级路由入口 -->
	  		<div class="routerView" style="box-sizing:border-box">
	    		<router-view class="statistic"></router-view>
	  		</div>
    	  	<div class="clear"></div>
    	</div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

export default {
  	name: 'Statistics',
  	data () {
    	return {
    		// cur_app_id: '1-1',
    		cur_app_id: ''
    	}
  	},
  	methods: {
    	init() {
      		$('.side_bar').height($(window).height()-60)
      		// $('.statistic').height($(window).height()-60)
      		$('.routerView').height($(window).height()-60)
      		// util.setLocalStorage('applications_width',$('.applications').width())
      		//滚动条至顶部
      		$(window).scrollTop(0)
      		//刷新页面 保持对应sidebar
      		this.changeSideBar()
      		
      		window.onresize = () => {
				$('.side_bar').height($(window).height()-60)
				// $('.statistic').height($(window).height()-60)
				$('.routerView').height($(window).height()-60)
      		}
    	},
    	handleSelect(key, keyPath) {
			// console.log(key, keyPath)
			this.cur_app_id = key
			switch(key) {
				case '1-1':
					this.$router.push('tjrecruit')
				break;
				case '2':
					this.$router.push('tjactive')
				break;
				case '3-1':
					this.$router.push('tjproject')
				break;
				case '4-1':
					this.$router.push('tjpackage')
					
				break;
			}
		},
		changeSideBar(){
			let cur_route = location.href
			//当前页面刷新时判断对应哪个路由
			if(cur_route.indexOf('tjrecruit')>=0){//招聘概览
			  this.cur_app_id = '1-1'
			}else if( cur_route.indexOf('tjactive')>=0 ){//账号活跃统计
			  this.cur_app_id = '2'
			}else if( cur_route.indexOf('tjproject')>=0 ){//项目统计--概览
			  this.cur_app_id = '3-1'
			}else if( cur_route.indexOf('tjpackage')>=0 ){//直聘通统计
			  this.cur_app_id = '4-1'
			}
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
  		document.title = '报表统计'
		// 在渲染该组件的对应路由被 confirm 前调用
		// 不！能！获取组件实例 `this`
		// 因为当钩子执行前，组件实例还没被创建
		next(vm => {
			vm.init()
		})
  	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
/*修改element-ui样式*/
.statistics .el-menu{
	background-color: #fff;
}
.statistics .side_bar>.el-menu>.el-menu-item.is-active:after{
	content: '';
	width:2px;
	height: 50px;
	position: absolute;
	right: 0;
	top:0;
	background: #6699ee;
}
.statistics .el-menu .el-menu-item,
.statistics .el-menu .el-submenu__title{
	height: 50px;
	line-height: 50px;
	padding: 0 20px!important;
}
.statistics .el-menu .el-menu-item,
.statistics .el-menu .el-submenu .el-submenu__title{
	color: #5e6d82;
	text-indent: 32px;
}
.statistics .el-menu .el-menu-item:hover,
.statistics .el-menu .el-submenu .el-submenu__title:hover{
	background-color: #f5f5f5;
}
.statistics .el-menu .el-menu-item.is-active,
.statistics .el-menu .el-submenu.is-active .el-submenu__title{
	color: #6699ee;
	font-weight: bold;
}
.statistics .el-menu .el-menu-item.is-active{
	background-color: #f5f5f5;
}
.statistics .el-menu .el-submenu .el-submenu__title .el-submenu__icon-arrow{
	color: #c0ccda;
	text-indent: 0;
}
</style>
<style scoped>
/*侧边栏和右侧主体内容*/
.statistics{
	min-width: 1000px;
}
.statistics .main{
  width:100%;
  /*height:840px;*/
}
/*侧边栏*/
.statistics .main .side_bar{
  /*background-color: pink;*/
  position: absolute;
  z-index: 99;
  background-color: #fff;
  float: left;
  width:200px;
  /*height: 840px;*/
  box-sizing: border-box;
  border-right: 1px solid #e0e6ed;
  /*transition: .2s ease ;*/
	overflow: auto;
}

.statistics .el-menu .el-menu-item .icon,
.statistics .el-menu .el-submenu .el-submenu__title .icon{
	position: absolute;
	top:17px;
	left: 20px;
	width: 16px;
	height: 16px;
}

/*添加侧边栏项目时在此配置图标*/
/*有二级时*/
.statistics .el-menu .el-submenu .el-submenu__title .zhptj{
	background: url(../assets/imgs/statistic/zhptj.svg) center no-repeat;
}
.statistics .el-menu .el-submenu.is-active .el-submenu__title .zhptj{
	background: url(../assets/imgs/statistic/zhptj_hover.svg) center no-repeat;
}
.statistics .el-menu .el-submenu .el-submenu__title .xmtj{
	background: url(../assets/imgs/statistic/xmtj.svg) center no-repeat;
}
.statistics .el-menu .el-submenu.is-active .el-submenu__title .xmtj{
	background: url(../assets/imgs/statistic/xmtj_hover.svg) center no-repeat;
}
.statistics .el-menu .el-submenu .el-submenu__title .tctj{
	background: url(../assets/imgs/statistic/tctj.svg) center no-repeat;
}
.statistics .el-menu .el-submenu.is-active .el-submenu__title .tctj{
	background: url(../assets/imgs/statistic/tctj_hover.svg) center no-repeat;
}
/*无二级时*/
.statistics .el-menu .el-menu-item .zhhtj{
	background: url(../assets/imgs/statistic/zhhtj.svg) center no-repeat;
}
.statistics .el-menu .el-menu-item.is-active .zhhtj{
	background: url(../assets/imgs/statistic/zhhtj_hover.svg) center no-repeat;
}
.statistics .el-menu .el-menu-item .zhptj{
	background: url(../assets/imgs/statistic/zhptj.svg) center no-repeat;
}
.statistics .el-menu .el-menu-item.is-active .zhptj{
	background: url(../assets/imgs/statistic/zhptj_hover.svg) center no-repeat;
}
.statistics .el-menu .el-menu-item .xmtj{
	background: url(../assets/imgs/statistic/xmtj.svg) center no-repeat;
}
.statistics .el-menu .el-menu-item.is-active .xmtj{
	background: url(../assets/imgs/statistic/xmtj_hover.svg) center no-repeat;
}
/*140 170 175 175 124*/

/*二级路由入口*/
.statistics .main .routerView{
  background-color: #fff;
  box-sizing: border-box;
  /*width:100%;*/
  /*height:840px;*/
  margin-left:200px;
  /*transition: .2s ease ;*/
}
.statistics .main .routerView .statistic{
  /* height: 100%; */
  overflow: auto;
}
</style>
