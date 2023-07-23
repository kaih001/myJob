<template>
  	<div class="SelectMemberGroupMulti">
    	<!-- 选择小组弹窗 -->
      <div class="select_group">
        <el-dialog :title="title" :visible.sync="showGroupSelecter" :close-on-press-escape="false" >
          <div class="select_group_main">
            <div class="all_groups_box">
              <p class="title">选择小组或成员</p>
              <div class="all_search">
                <i class="el-icon-search"></i>
                <el-input
                  :icon='filterText?"circle-cross":""'
                  :on-icon-click="clearFilterText"
                  placeholder="搜索小组或成员"
                  v-model="filterText">
                </el-input>
              </div>
              <div class="all_main">
                <el-tree
                  :expand-on-click-node="false"
                  :default-expand-all="true"
                  :data="allGroups"
                  :props="defaultProps"
                  @node-click="handleNodeClick"
                  :filter-node-method="filterNode"
                  id="selectgroup"
                  ref="allGroups"
                  :render-content="renderContent"
                  empty-text="暂无数据"
                  >
                </el-tree>
              </div>
            </div>
            <div class="selected_groups_box">
              <p class="title">已选择的小组或成员</p>
              <div class="sel_main">
                <template v-for="(item, index) in origin_selected_groups">
                  <div class="sel_item" @click="unSelectGroup(index)">
                    <p :title="item.name"><em :class=" 'saas-icon-'+item.selType "></em>{{item.name}}</p>
                    <i class="el-icon-close"></i>
                  </div>
                </template>
              </div>
            </div>
            <i class="arrow"></i>
          </div>
          <div class="select_group_foot">
            <div class="btns">
              <el-button @click="showGroupSelecter = false" class="cancel">取消</el-button>
              <el-button style="background-color:#6699ee;color:#fff;" @click="confirmGroupSelecter" class="confirm">确定</el-button>
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
  	name: 'SelectMemberGroupMulti',
  	data () {
    	return {
    		showGroupSelecter: false,
    		filterText: '',
    		defaultProps: {
  				children: 'children',
  				label: 'name',
          status:'status'
    		},
    		origin_selected_groups: [],//上次选择的小组，在缓存中，如需清空，直接清空缓存即可
    		// selectedGroups: []
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
  	props:['title','allGroups','selectedMembersGroups','disabledGroups'],
  	watch: {
  		filterText(val) {
  		  // console.log(this.$refs)
  		  this.$refs.allGroups.filter(val);
  		},
  	},
  	methods: {
    	init() {
      
    	},
      renderContent(h, { node, data, store }) {
          if(data.children){
            return (<span class="treeLable">
                <i class="saas-icon-group"></i><span>{node.label}</span>
              </span>)
          }else{
              return (<span class="treeLable">
                <i class="saas-icon-peple"></i><span>{node.label}</span>
              </span>)          
          }
      },
    	clearFilterText(){
        this.filterText = ''
    	},
    	//点击左侧小组列表时  切换右侧 是否选取
    	handleNodeClick(data) {
  			//console.log(JSON.stringify(data))
        if(this.disabledGroups){
          if(data.children && data.children.length  == 0) return;
        }
        let dataid = data.id || data.user_id;
        for(let i = 0; i < this.origin_selected_groups.length; i++){
          if(this.origin_selected_groups[i].id === dataid){
            this.origin_selected_groups.splice(i,1)
            return
          }
        };
        let PeronnelList = [];
        //递归遍历树形结构，将当前选择的树形结构的人添加到一个数组[{},{}]
        let getPersonnelList = (node) => {
          if(node.children && node.children.length > 0){
            for(let i = 0 ,lg=node.children.length; i < lg; i++){
              if(node.children[i].render_flag === 2){
                PeronnelList.push(node.children[i])
              }else{
                getPersonnelList(node.children[i])
              }
            }
          }else{
            if(node.render_flag === 1)return;
              PeronnelList.push(node);
          }
        };
        let selType;
        if(data.children){
          selType = 'group';
        }else{
          selType = 'peple'
        }
        getPersonnelList(data)
        this.origin_selected_groups.push({selType:selType,id:dataid, name: data.name,PeronnelList:PeronnelList})
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
  			// util.setLocalStorage('origin_selected_groups', this.origin_selected_groups)
  			// this.selectedGroups = this.origin_selected_groups
  			this.$emit('confirmGroupSelecter', this.origin_selected_groups);
      },
      openGroupSelecter(){
  			this.filterText = ''
  			this.showGroupSelecter = true
  			// this.origin_selected_groups = util.getLocalStorage('origin_selected_groups') || []
        this.origin_selected_groups = JSON.parse(JSON.stringify(this.selectedMembersGroups))

        // setTimeout(() => {
        //     $('.el-tree>.el-tree-node>.el-tree-node__content>span').addClass('expanded')
        //     $('.el-tree>.el-tree-node>.el-tree-node__children').css({
        //         'display': 'block'
        //     })
        // },500)
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
.SelectMemberGroupMulti .select_group .el-dialog{
  width:640px;
  height:524px;
}
.SelectMemberGroupMulti .select_group .el-dialog .el-dialog__header{
  line-height: 1;
}
.SelectMemberGroupMulti .select_group .el-tree{
  height: 100%;
  overflow-y: auto;
  border: 1px solid #e0e6ed;
  box-sizing: border-box;
}
.SelectMemberGroupMulti .select_group .el-tree-node__content{
  color:#475669;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.SelectMemberGroupMulti .select_group .el-tree-node__content:hover{
  background-color: #f5f5f5;
}
.SelectMemberGroupMulti .select_group .el-tree-node__content .el-tree-node__expand-icon{
  border-radius: 3px;
}
.SelectMemberGroupMulti .select_group .el-input__inner{
  border: 1px solid #e0e6ed!important;
  border-bottom: none!important;
  border-radius: 2px;
  padding: 3px 32px 3px 32px;
}
.SelectMemberGroupMulti .select_group .el-input__inner:hover,
.SelectMemberGroupMulti .select_group .el-input__icon:hover + .el-input__inner{
  border: 1px solid #e0e6ed!important;
  border-bottom: none!important;
  border-radius: 2px;
  padding: 3px 32px 3px 32px;
}
/*.SelectMemberGroupMulti .select_group .el-input__inner::-webkit-input-placeholder {
  color: #c0ccda; 
} 
.SelectMemberGroupMulti .select_group .el-input__inner:-moz-placeholder {
  color: #c0ccda; 
} 
.SelectMemberGroupMulti .select_group .el-input__inner::-moz-placeholder {
  color: #c0ccda; 
} 
.SelectMemberGroupMulti .select_group .el-input__inner:-ms-input-placeholder {
  color: #c0ccda; 
} */
.SelectMemberGroupMulti .select_group .all_search i.el-icon-search{
  position: absolute;
  z-index: 999;
  top:12px;
  left: 12px;
  font-size:14px;
  color:#e0e6ed;
}
.clear{
  clear:both;
}

.SelectMemberGroupMulti .saas-icon-group{
  display: inline-block;
  width: 16px;
  height: 17px;
  background: url(../../assets/imgs/group_ico.svg)  no-repeat;
  background-size: 100% 100%;
    background-position-y: -1px;
    vertical-align: middle;
}
.SelectMemberGroupMulti .saas-icon-peple{
  display: inline-block;
  width: 16px;
  height: 18px;
  background: url(../../assets/imgs/peple_ico.svg)  no-repeat;
  background-size: 100% 100%;
  background-position-y: -1px;
  vertical-align: middle;
}
.SelectMemberGroupMulti .treeLable>i {
    margin: 0 7px 0 2px;
}
.SelectMemberGroupMulti .treeLable>span {
    font-size: 14px;
    color: #475669;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*选择小组弹窗*/
.SelectMemberGroupMulti .select_group{

}
.SelectMemberGroupMulti .select_group .select_group_main{
  position: relative;
  height: 415px;
  /*width:100%;*/
  box-sizing: border-box;
  border-bottom: 1px solid #e0e6ed;
  padding: 23px 40px 0;
}
.SelectMemberGroupMulti .select_group .select_group_main .arrow{
  position: absolute;
  top:206px;
  left:315px;
  /*font-size: 25px;*/
  /*color:#e0e6ed;*/
  width:13px;
  height:19px;
  background-image: url(../../assets/imgs/kqaddmin/arrow.svg);
}
.SelectMemberGroupMulti .select_group .select_group_main .all_groups_box{
  float: left;
  width:248px;
}
.SelectMemberGroupMulti .select_group .select_group_main .title{
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  font-weight: normal;
  font-style: normal;
  text-align: center;
  color: #8492a6;
}
.SelectMemberGroupMulti .select_group .select_group_main .all_groups_box .all_search{
  height: 36px;
  position: relative;
}
.SelectMemberGroupMulti .select_group .select_group_main .all_groups_box .all_main{
  height: 292px;
  overflow-y: auto;
  border-radius: 2px;
}
.SelectMemberGroupMulti .select_group .select_group_main .selected_groups_box{
  float: right;
  width:248px;
}
.SelectMemberGroupMulti .select_group .select_group_main .selected_groups_box .sel_main{
  height: 328px;
  overflow-y: auto;
  border:1px solid #e0e6ed;
  border-radius: 2px;
  /*padding: 6px 0;*/
  box-sizing: border-box;
}
.SelectMemberGroupMulti .select_group .select_group_main .selected_groups_box .sel_main .sel_item{
  position: relative;
  height: 36px;
  background-color: #f5f5f5;
  margin: 6px 6px;
  cursor: pointer;
}
.SelectMemberGroupMulti .select_group .select_group_main .selected_groups_box .sel_main .sel_item p{
  float: left;
  height: 36px;
  width: 200px;
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
.SelectMemberGroupMulti .select_group .select_group_main .selected_groups_box .sel_main .sel_item p em{
  margin-right: 7px;
}
.SelectMemberGroupMulti .select_group .select_group_main .selected_groups_box .sel_main .sel_item i{
  position: absolute;
  top:12px;
  right: 15px;
  font-size: 8px;
  font-weight: bold;
  color:#6699ee;
}
.SelectMemberGroupMulti .select_group .select_group_foot{
  height:68px;
  /*background-color: pink;*/
}
.SelectMemberGroupMulti .select_group .select_group_foot .btns{
  float: right;
  margin:16px 20px;
}
.SelectMemberGroupMulti .select_group .select_group_foot .btns .el-button{
  border-radius: 1px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  text-align: center;
  color: #475568;
  letter-spacing: 5px;
  padding: 10px 10px 10px 14px;
  border:1px solid #e0e6ed;
}
.SelectMemberGroupMulti .select_group .select_group_foot .btns .el-button:hover{
  color:#6699ee;
  border:1px solid #6699ee;
}
.SelectMemberGroupMulti .select_group .select_group_foot .btns .el-button:active{
  color:#517ed6;
  border:1px solid #517ed6;
}
.SelectMemberGroupMulti .select_group .select_group_foot .btns .el-button.confirm{
  border:1px solid #6699ee;
}
.SelectMemberGroupMulti .select_group .select_group_foot .btns .el-button.confirm:hover{
  background-color: #8bb1f2!important;
  border:1px solid #8bb1f2;
}
.SelectMemberGroupMulti .select_group .select_group_foot .btns .el-button.confirm:active{
  background-color: #517ed6!important;
  border:1px solid #517ed6;
}

.SelectMemberGroupMulti .select_group .select_group_foot .btns .el-button span{
  font-size: 14px;
}

</style>
