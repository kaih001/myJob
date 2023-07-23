<template>
    <div id="PositionHeader">
      <div class="top-div">
        <h1>位置监控</h1>
        <div class="sel_item">
        <span>筛选：</span>
        <el-button @click="openGroupSelecter" class="select_member" style="position:relative;min-width:121px;text-align: left;height:28px;line-height: 6px;padding-left:10px;padding-right:33px;">{{selected_members_groups.length ? computedMemberGroup() : '全部人员'}}<i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 8px;color: #d3dce6;"></i></el-button>
      </div>
      <select-member-group-multi
                title="人员范围"
                ref="profile"
                :all-groups="all_groups"
                :selected-members-groups="selected_members_groups"
                v-on:confirmGroupSelecter="confirmGroupSelecter"
            ></select-member-group-multi>
            <div class="time">
              <el-date-picker 
                  v-model="pmtime"
                  @change="onPmTimeChange"
                  type="date"
                  placeholder="选择日期"
                  style="width:131px;margin-left:12px;"
                  :picker-options="pickerOptions"
                  :clearable="false"
                  :editable="false">
              </el-date-picker>
            </div>
           <!--  <div class="set-buttons" v-if="admins.sign_export">
              <div class="btn-item export" @click="positionDialogVisible = true" :style="admins.invisible_man?'margin-right:0px;':''">
                  <i class="export-icon"></i>
                  <el-button type="text">导出报表</el-button>
                </div>
                <div class="btn-item set" @click="setPosition" v-if="!admins.invisible_man">
                  <i class="setico_svg"></i>
                  <el-button type="text">设置</el-button>
                </div>
            </div>
            <div class="isOpenPositionTip" v-if="isOpenPosition">
              <p>更多功能，点击这里进行</p>
              <p>设置哦！</p>
              <a href="javascript:;" @click="closeTip">知道了</a>
            </div> -->
      </div>
    </div>
  
</template>

<script>
  import * as util from '../../assets/js/util.js'
  import SelectMemberGroupMulti from '@/components/common/SelectMemberGroupMulti'
  let $ = require("jquery")

  export default{
      name: 'PositionHeader',
      components:{
        SelectMemberGroupMulti
        
      },
      data:function(){
        return{
            pickerOptions: {
              disabledDate(time) {
                return time.getTime() > Date.now();
              }
            },
            team_id:'',
            project_id:'',
            all_groups:[],
            selected_members_groups:[],
            userid_list:[],
            pmtime: new Date(),
            key_time:'',
        }
      },
      computed:{

      },
      methods:{
        init (){
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id
        },
       //时间日期切换
        onPmTimeChange(val){
          this.pmtime = val
          this.getMemberSignList()
        },
        //日期格式化“分秒”
        getLocalTime(timestr){
            return util.getLocalTime(timestr, 'HH:mm')
        },
        //显示组件--选择人员
        openGroupSelecter(){
            this.$refs.profile.openGroupSelecter()
        },
        //显示组件--选择人员返回数据显示操作
        computedMemberGroup(){
            let members = 0,
            groups = 0
            this.selected_members_groups.forEach((obj) => {
                if(obj.selType === 'group'){
                    groups++
                }else{
                    members++
                }
            })
            if(groups == 0){
                return `已选${members}人`
            }else if(members == 0){
                return `已选${groups}组`
            }else{
                return `已选${groups}组、${members}人`
            }
        },
        //点击确定后执行的函数
        confirmGroupSelecter(val){
            this.userid_list = []
            this.selected_members_groups = val
            this.selected_members_groups.forEach((obj) => {
                if(obj.selType === 'group'){
                    obj.PeronnelList.forEach( (o) => {
                      this.userid_list.push(o.user_id)
                    })
                }else{
                    this.userid_list.push(obj.id)
                }
            })
            this.getMemberSignList()
        },
        //获取可选择小组和人员列表
        getMemberGroup(){
          util.ajax({
            url: '/group/node_data_tree',
            type:'GET',
            data: {
              group_id: 0,
              team_id: this.team_id,
              project_id: this.project_id
            },
            success: (res) => {
              console.log('所有小组')
              console.log(res)
                if(res&&res.errno==0){
                    this.all_groups = res.data
                }
            },
            error: (xhr, status) => {
                // 网络超时
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
            },
            noNetwork: () => {
                // 网络超时
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
      }
    }
</script>
<style scoped>
.top-div{
  padding: 0 20px;
  height: 54px;
  line-height: 54px;
  background-color: #ffffff;
  position: relative;
  /*overflow: hidden;*/
  box-shadow: 3px 0 4px 0 rgba(198, 201, 207, 0.5);
  border-bottom: 1px solid #e0e6ed;
}
.top-div h1{
  font-size: 16px;
    font-weight: 600;
    text-align: left;
    color: #475568;
    float: left;
}
.top-div .sel_item{
  float: left;
  margin-left: 136px;
}
.top-div .sel_item span{
  font-size: 13px;
    color: #5e6d82;
}
.top-div .sel_item .el-button--default.select_member span{
  font-size: 13px;
  color: #1f2d3d;
}
.top-div .sel_item .el-button--default.select_member:hover{
  border: 1px solid #c0ccda;
  color: #1f2d3d;
}
.top-div .sel_item .el-button--default.select_member:active,
.top-div .sel_item .el-button--default.select_member:focus{
  border: 1px solid #6699EE;
}
.top-div .time{float: left;}
.top-div .set-buttons{float: right;}
.top-div .set-buttons .btn-item{
  float: left;
  position: relative;
}
.top-div .set-buttons .export{
  margin-right: 30px;
}
.top-div .set-buttons .export .export-icon{
  display: block;
  width: 12px;
  height: 12px;
  background-image:url(../../assets/imgs/shareIcon/export.svg);
  position: absolute;
    left: -16px;
    top: 20px;
}
/* 未开启定位气泡提示 */
.top-div .isOpenPositionTip{
  width: 156px;
    height: 61px;
    background-image:url(../../assets/imgs/position/kow.svg);
    position: absolute;
    right: 8px;
    top: 48px;
    z-index: 99;
    padding: 18px 16px;
}
.top-div .isOpenPositionTip p{
  font-size: 14px;
    line-height: 1.43;
    text-align: left;
    color: #ffffff;
}
.top-div .isOpenPositionTip a{
  display: block;
  float: right;
  width: 56px;
    height: 24px;
    line-height: 24px;
    border-radius: 16px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px 0 #ffa18c;
    font-size: 13px;
    text-align: center;
    color: #f5974e;
}
.dialog-backgroud{
  width: 100%;
  height: 100%;
  background-color: #000000;
  background-color:rgba(0,0,0,0.5);
  position: fixed;
  right: 0px;
  top: 60px;
  z-index: 2;
}
#positionMonitor .positionIsOpen-dialog{
  width: 278px;
    height: 116px;
  margin-left: 45%;
    margin-top: 15%;
  background:url(../../assets/imgs/position/bj_tip.svg) no-repeat;
  position: relative;
}
#positionMonitor .positionIsOpen-dialog .tip-text{
  width: 192px;
    line-height: 21px;
    position: absolute;
    left: 51px;
    top: 44px;
}
#positionMonitor .positionIsOpen-dialog .tip-text p{
  font-size: 16px;
    text-align: left;
    color: #ffffff;
}
#positionMonitor .positionIsOpen-dialog .openbtn{
  width: 120px;
  height: 38px;
  border-radius: 89px;
  background-color: #ffffff;
  font-size: 16px;
    text-align: center;
    color: #f5974e;
    position: absolute;
    left: 50%;
    bottom: -85px;
    margin-left: -50px;
}
#positionMonitor .positionIsOpen-dialog .el-button{
  border: solid 1px #ffffff!important;
}
#positionMonitor .positionIsOpen-dialog .el-button:hover{
  border: solid 1px #ffffff!important;
}


.setico_svg{
  position: absolute;
    left: -16px;
    top: 20px;
}
</style>

