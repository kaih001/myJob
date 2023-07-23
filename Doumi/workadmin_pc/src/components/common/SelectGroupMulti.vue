<template>
  	<div class="SelectGroupMulti">
    	<!-- 选择小组弹窗 -->
    	<div class="select_group">
    	  <el-dialog title="选择小组" :visible.sync="showGroupSelecter" :close-on-press-escape="false">
    	    <div class="select_group_main">
    	      <div class="all_groups_box">
    	        <p class="title">选择小组</p>
    	        <div class="all_search">
    	          <i class="el-icon-search"></i>
    	          <el-input
    	            :icon='filterText?"circle-cross":""'
    	            :on-icon-click="clearFilterText"
    	            placeholder="搜索小组"
    	            v-model="filterText">
    	          </el-input>
    	        </div>
    	        <div class="all_main">
    	          <el-tree
    	            :expand-on-click-node="false"
    	            :data="allGroups"
    	            :props="defaultProps"
    	            @node-click="handleNodeClick"
    	            :filter-node-method="filterNode"
    	            ref="allGroups"
    	            :default-expand-all="true"
                  empty-text="暂无数据"
    	          ></el-tree>
    	        </div>
    	      </div>
    	      <div class="selected_groups_box">
    	        <p class="title">已选择的小组</p>
    	        <div class="sel_main">
    	          <template v-for="(item, index) in origin_selected_groups">
    	            <div class="sel_item" @click="unSelectGroup(index)">
    	              <p :title="item.name">{{item.name}}</p>
    	              <i class="el-icon-close"></i>
    	            </div>
    	          </template>
    	        </div>
    	      </div>
    	      <i class="arrow"></i>
    	    </div>
    	    <div class="select_group_foot">
    	      <div class="btns">
    	        <el-button @click="showGroupSelecter = false">取消</el-button>
    	        <el-button class="confirm" style="background-color:#6699ee;color:#fff;" @click="confirmGroupSelecter">确定</el-button>
    	      </div>
    	    </div>
    	  </el-dialog>
    	</div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

export default {
  	name: 'SelectGroupMulti',
  	data () {
    	return {
    		showGroupSelecter: false,
      		filterText: '',
      		defaultProps: {
				children: 'children',
				label: 'name'
      		},
      		origin_selected_groups: [],//上次选择的小组，在缓存中，如需清空，直接清空缓存即可
      		selectedGroups: []
    	}
  	},
  	// props: {
  	// 	allGroups: {
  	// 		default: function(){
  	// 			return []
  	// 		}
  	// 	},
  	// 	selectedGroups: {
  	// 		default: function(){
  	// 			return []
  	// 		}
  	// 	}
  	// },
  	props:['allGroups'],
  	watch: {
  		filterText(val) {
  		  // console.log(this.$refs)
  		  this.$refs.allGroups.filter(val);
  		},
  	},
  	methods: {
    	init() {
      
    	},
    	clearFilterText(){
          	this.filterText = ''
    	},
    	//点击左侧小组列表时  切换右侧 是否选取
    	handleNodeClick(data) {
			// console.log(data);
			for(let i = 0; i < this.origin_selected_groups.length; i++){
				if(this.origin_selected_groups[i].id == data.id){
					this.origin_selected_groups.splice(i,1)
					return
				}
			}
			this.origin_selected_groups.push({id: data.id, name: data.name})
    	},
    	//过滤小组函数
    	filterNode(value, data) {
    	  if (!value) return true;
    	  return data.name.indexOf(value) !== -1;
    	},
    	//反选择小组
        unSelectGroup(index){
          	this.origin_selected_groups.splice(index,1)
        },
        confirmGroupSelecter(){
			this.showGroupSelecter = false
			util.setLocalStorage('origin_selected_groups', this.origin_selected_groups)
			this.selectedGroups = this.origin_selected_groups
			this.$emit('confirmGroupSelecter', this.selectedGroups);
        },
        openGroupSelecter(){
			this.filterText = ''
			this.showGroupSelecter = true
			this.origin_selected_groups = util.getLocalStorage('origin_selected_groups') || []
          
        },
  	},
  	mounted() {
    	this.init()
  	},
  	// watch: {
  	//   '$route' (to, from) {
  	//     // 对路由变化作出响应...
  	//     console.log(to.params.projectId)
  	//   }
  	// }
}
</script>
<style>
/*选择小组 ---  部分已应用考勤详情重置样式（弹窗头部样式）*/
.SelectGroupMulti .select_group .el-dialog{
	width:640px;
	height:524px;
}
.SelectGroupMulti .select_group .el-tree{
	height: 100%;
	overflow-y: auto;
	border: 1px solid #e0e6ed;
	box-sizing: border-box;
}
.SelectGroupMulti .select_group .el-tree-node__content{
	color:#475669;
}
.SelectGroupMulti .select_group .el-tree-node__content:hover{
	background-color: #f5f5f5;
}
.SelectGroupMulti .select_group .el-tree-node__content .el-tree-node__expand-icon{
	border-radius: 3px;
}
.SelectGroupMulti .select_group .el-input__inner{
	border: 1px solid #e0e6ed!important;
	border-bottom: none!important;
	border-radius: 2px;
	padding: 3px 10px 3px 32px;
}
.SelectGroupMulti .select_group .all_search i.el-icon-search{
	position: absolute;
	z-index: 999;
	top:11px;
	left: 12px;
	font-size:16px;
	color:#e0e6ed;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*选择小组弹窗*/
.SelectGroupMulti .select_group{

}
.SelectGroupMulti .select_group .select_group_main{
  position: relative;
  height: 415px;
  /*width:100%;*/
  box-sizing: border-box;
  border-bottom: 1px solid #e0e6ed;
  padding: 23px 40px 0;
}
.SelectGroupMulti .select_group .select_group_main .arrow{
  position: absolute;
  top:206px;
  left:315px;
  /*font-size: 25px;*/
  /*color:#e0e6ed;*/
  width:13px;
  height:19px;
  background-image: url(../../assets/imgs/kqaddmin/arrow.svg);
}
.SelectGroupMulti .select_group .select_group_main .all_groups_box{
  float: left;
  width:248px;
}
.SelectGroupMulti .select_group .select_group_main .title{
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  font-weight: normal;
  font-style: normal;
  text-align: center;
  color: #8492a6;
}
.SelectGroupMulti .select_group .select_group_main .all_groups_box .all_search{
  height: 36px;
  position: relative;
}
.SelectGroupMulti .select_group .select_group_main .all_groups_box .all_main{
  height: 292px;
  overflow-y: auto;
  border-radius: 2px;
}
.SelectGroupMulti .select_group .select_group_main .selected_groups_box{
  float: right;
  width:248px;
}
.SelectGroupMulti .select_group .select_group_main .selected_groups_box .sel_main{
  height: 328px;
  overflow-y: auto;
  border:1px solid #e0e6ed;
  border-radius: 2px;
  /*padding: 6px 0;*/
  box-sizing: border-box;
}
.SelectGroupMulti .select_group .select_group_main .selected_groups_box .sel_main .sel_item{
  height: 36px;
  background-color: #f5f5f5;
  margin: 6px 6px;
  cursor: pointer;
}
.SelectGroupMulti .select_group .select_group_main .selected_groups_box .sel_main .sel_item p{
  float: left;
  height: 36px;
  width: 207px;
  line-height: 36px;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  color: #475669;
  text-indent: 12px;
  background-color: #f5f5f5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.SelectGroupMulti .select_group .select_group_main .selected_groups_box .sel_main .sel_item i{
  font-size: 8px;
  font-weight: bold;
  float: right;
  margin:15px 14px 0 0;
  color:#6699ee;
}
.SelectGroupMulti .select_group .select_group_foot{
  height:68px;
  /*background-color: pink;*/
}
.SelectGroupMulti .select_group .select_group_foot .btns{
  float: right;
  margin:16px 20px;
}
.SelectGroupMulti .select_group .select_group_foot .btns .el-button{
  border-radius: 2px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  text-align: center;
  color: #475568;
  letter-spacing: 5px;
  padding: 10px 10px 10px 14px;
  border:1px solid #e0e6ed;
}
.SelectGroupMulti .select_group .select_group_foot .btns .el-button:hover{
  color:#6699ee;
  border:1px solid #6699ee;
}
.SelectGroupMulti .select_group .select_group_foot .btns .el-button:active{
  color:#517ed6;
  border:1px solid #517ed6;
}
.SelectGroupMulti .select_group .select_group_foot .btns .el-button.confirm{
  border:1px solid #6699ee;
}
.SelectGroupMulti .select_group .select_group_foot .btns .el-button.confirm:hover{
  background-color: #8bb1f2!important;
  border:1px solid #8bb1f2;
}
.SelectGroupMulti .select_group .select_group_foot .btns .el-button.confirm:active{
  background-color: #517ed6!important;
  border:1px solid #517ed6;
}
.SelectGroupMulti .select_group .select_group_foot .btns .el-button span{
  font-size: 14px;
}
</style>
