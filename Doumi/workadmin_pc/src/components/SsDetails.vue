<template>
	<div 
    class="SocialSecurity" 
    v-loading="main_loading"
    element-loading-text="上传中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)" style="margin:0 20px">
    <div class="s-wapper">
      <div class="ss_top">
        <breadcrumb>
            <router-link to="ssTab" replace>社保管理</router-link>
            <router-link to="">{{currmonth}}</router-link>
        </breadcrumb>
      </div>
      
      <div class="search">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="人员：">
            <el-autocomplete
                popper-class="my-autocomplete2"
                style="width:135px;"
                v-model="searchForm.member"
                :fetch-suggestions="querySearch"
                custom-item="my-item-zh"
                :trigger-on-focus="false"
                placeholder="姓名/手机号"
                @select="handleSelect">
            </el-autocomplete>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getSSDetalisList('search')">搜 索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="opers both">
        <div>
          <div class="deletebtn"  v-if="status != 1">
            <span>批量操作：</span>
            <el-button type="primary" size="small" :disabled="isdisabled" @click="deleteMember">删 除</el-button>
          </div>
          <div class="operation-btn" >
            <span class="import-btn" v-if="status != 1"><i class="import-icon"></i>导入
              <input type="file" @change="importGroup" id="import-file-excel" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
            </span>
            <span class="export-btn" @click="exportGroup"><i class="export-icon"></i>导出</span>
            <span class="add-btn"  v-if="status != 1"   @click="openGroupSelecter"><i class="add_icon"></i>添加人员</span>
          </div>
        </div>
        
      </div>
      <div class="table">
        <el-table
          :data="membersData"
          border
          :height="winHeight"
          @selection-change="handleSelectionChange"
          style="width: 100%">
          <el-table-column
            type="selection"
            width="50">
          </el-table-column>
          <el-table-column
            type="index"
            label="序号"
            width="80">
          </el-table-column>
          <el-table-column
            prop="real_name"
            label="姓名"
            width="100">
          </el-table-column>
          <el-table-column
            label="性别"
            width="80">
              <template slot-scope="scope">
                <span v-if="scope.row.gender == 2">女</span>
                <span v-if="scope.row.gender == 1">男</span>
              </template>
          </el-table-column>
          <el-table-column
            prop="mobile"
            label="手机号"
            width="150">
          </el-table-column>
          <el-table-column
            prop="idnumber"
            label="身份证号"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            label="岗位-城市"
            show-overflow-tooltip>
              <template slot-scope="scope">
                <span v-if="scope.row.station_name && scope.row.station_city_name">{{scope.row.station_name + '-' + scope.row.station_city_name}}</span>
              </template>
          </el-table-column>
          <el-table-column
            label="合同状态"
            width="100">
              <template slot-scope="scope">
                <el-tag type="gray" v-if="scope.row.protocol_status == 0">未签订</el-tag>
                <el-tag type="success" v-if="scope.row.protocol_status == 1">签订成功</el-tag>
                <el-tag type="warning" v-if="scope.row.protocol_status == 2">撤回</el-tag>
                <el-tag type="primary" v-if="scope.row.protocol_status == 3">签订中</el-tag>
                <el-tag type="danger" v-if="scope.row.protocol_status == 5">过期</el-tag>
              </template>
          </el-table-column>
          <el-table-column
            label="当前状态"
            width="100">
              <template slot-scope="scope">
                <el-tag type="danger" v-if="scope.row.status == -1">离职</el-tag>
                <el-tag type="success" v-if="scope.row.status == 1">在职</el-tag>
              </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="fixedbar" v-if="status != 1">
        <p>总计&nbsp;{{membersData ? membersData.length : 0}}&nbsp;人</p>
        <div class="save" @click="saveMemberInfo">
          <span>保 存</span>
        </div>
      </div>
    </div>
    <!--选择人员 组件-->
    <select-member-group-multi
      title="人员范围"
      ref="profile"
      :all-groups="all_groups"
      :selected-members-groups="selected_members_groups"
      v-on:confirmGroupSelecter="confirmGroupSelecter"
          ></select-member-group-multi>
    
	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
import SelectMemberGroupMulti from '@/components/common/SelectMemberGroupMulti'
import breadcrumb from '@/components/common/breadcrumb'

export default {
  	name: 'SocialSecurity',
    components:{
      SelectMemberGroupMulti,
      breadcrumb
    },
  	data () {
    	return {
        winHeight:'',
        isdisabled:true,
        dialogAddS:false,
        team_id:'',
        project_id:'',
        currmonth:'',
        searchForm:{
          state:'',
          member:''
        },
        membersData:[],
        currSelectionVal:[],
        /*小组人员选择*/
        all_groups:[],
        selected_members_groups:[],
        curmonth:'',
        restaurants:[],
        timeout:'',
        user_id_arr:[],
        participant_group:[],
        participant_user:[],
        all_user_ids:[],
        select_uid:[],
        status:'',
        main_loading:false,
    	}
  	},
  	methods: {
    	init() {
        this.team_id = util.getLocalStorage('projectStorageInfo').team_id
        this.project_id = util.getLocalStorage('projectStorageInfo').project_id
        if(util.getQueryString('type')){
          if(util.getQueryString('type') == 'creat'){
            this.currmonth = util.getQueryString('year')+util.getQueryString('month')
          }else if(util.getQueryString('type') == 'details'){
            console.log(util.getLocalStorage('currUserInfoData'))
            this.status = util.getLocalStorage('currUserInfoData').ss_status
            this.currmonth = util.getLocalStorage('currUserInfoData').month
            //获取社保人员明细记录
            this.getSSDetalisList()
          }
        }
        //获取人员小组列表数据
        this.getMemberGroup()
    	},
      //保存人员列表信息
      saveMemberInfo(){
        let user_ids = []
        console.log(this.select_uid)
        if(this.participant_user.length){
          user_ids = this.participant_user
        }else{
          if(this.membersData && this.membersData.length != 0){
            this.membersData.forEach( (i) => {
              user_ids.push(i.user_id)
            })
          }
        }
        // console.log(user_ids)
        if(!user_ids.length){
          this.$message({
              showClose: true,
              message: '请选择添加人员',
              type: 'warning'
          });
          return
        }
        
        util.ajax({
          url: '/ss/user/new',
          type:'POST',
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            month:this.currmonth,
            user_id:user_ids
          },
          timeout:10000,
          success: (res) => {
              if(res&&res.errno==0){
                console.log('res',res)
                this.$message({
                  showClose: true,
                  message:'添加成功',
                  type: 'success'
                });
                this.participant_user = []
                this.$router.replace('socialSecurity')
              }else{
                this.$message({
                  showClose: true,
                  message:res.errmsg,
                  type: 'warning'
                });
              }
          },
          error: (xhr, status) => {
            
          },
          noNetwork: () => {
              // 网络超时
          }
        })
      },
      //复选框操作
      handleSelectionChange(val){
        this.currSelectionVal = val
        if(val.length){
          this.isdisabled = false
        }else{
          this.isdisabled = true
        }
      },
      //搜索建议列表选择赋值
      handleSelect(val){
        this.user_id_arr.push(val.user_id)
      },
      //人员检索
      querySearch(queryString, cb){
        if(queryString){
          this.user_id_arr = []
          util.ajax({
            url:'/group/member_search',
            type:'GET',
            data:{
                team_id:this.team_id,
                project_id:this.project_id,
                group_id:'',
                keyword:queryString,
                page_no:'',
                page_size:''
            },
            timeout:10000,
            success:(obj) => {
              if(obj && obj.errno == 0){
                  let strArr = []
                  obj.data.list.forEach((o) => {
                      let str = ''
                      str = { 
                        "value": o.user_name, 
                        "group_name":o.group_name,
                        "group_id": o.group_id,
                        "user_id":o.user_id
                      }
                      strArr.push(str)
                  })
                  this.restaurants = strArr
                  var restaurants = this.restaurants;
                  var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
                  // 调用 callback 返回建议列表的数据
                  cb(results)
              }else{
                this.$message({
                    showClose: true,
                    message: obj.errmsg,
                    type: 'warning'
                });
              }
          },
          error: (xhr, status) => {
             
          },
          noNetwork: () => {
            //网络超时
          }
        })
        }
      },
      createFilter(queryString) {
          return (restaurant) => {
            return (restaurant.value.toLowerCase() || restaurant.value.indexOf(queryString) > -1);
          };
      },
      //取消
      resetForm(formName) {
        this.dialogAddS = false
        this.$refs[formName].resetFields();
      },
      handleCurrentPageChange(val) {
        this.getSSDetalisList()
      },
      //获取人员明细列表
      getSSDetalisList(pre){
        if(util.getQueryString('type') == 'creat'){
          return
        }
        if(pre && pre == 'search'){
          if(!this.searchForm.member){
            this.user_id_arr = []
          }
        }
        util.ajax({
          url: '/ss/user/list',
          type:'POST',
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            month:util.getLocalStorage('currUserInfoData').month,
            ss_id:util.getLocalStorage('currUserInfoData').ss_id,
            show_level:this.searchForm.state,
            page_size:'',
            page_no:'',
            user_id:this.user_id_arr
          },
          timeout:10000,
          success: (res) => {
              if(res&&res.errno==0){
                this.membersData = res.data.user_list
              }else{
                this.$message({
                  showClose: true,
                  message:res.errmsg,
                  type: 'warning'
                });
              }
          },
          error: (xhr, status) => {
            
          },
          noNetwork: () => {
              // 网络超时
          }
        })
      },
      //选择人员之后点击确认获取已选择的人员明细列表
      getUsersData(val){
        util.ajax({
          url: '/ss/userinfo/get',
          type:'GET',
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            month:this.currmonth,
            participant_group:this.participant_group,
            participant_user:this.participant_user
          },
          timeout:10000,
          success: (res) => {
            if(res&&res.errno==0){
              if(!res.data.user_list){
                return
              }
              let arr = []
              let user_list = res.data.user_list
              if(this.membersData.length == 0){
                this.membersData = res.data.user_list
              }else{
                let newPeronnelList = [],
                    PeronnelIdList = [];

                for(let n = 0, lt = user_list.length; n < lt ; n++){
                  if(PeronnelIdList.indexOf(user_list[n].user_id) === -1){
                    PeronnelIdList = PeronnelIdList.concat(user_list[n].user_id)
                    newPeronnelList = newPeronnelList.concat(user_list[n])
                  }
                }
                let dif = '';
                for(let m = 0,th = newPeronnelList.length;m < th;m++){
                  for(let t = 0,ng = this.membersData.length;t < ng;t++){
                    if(newPeronnelList[m].user_id == this.membersData[t].user_id) {
                      dif += newPeronnelList[m].user_id + ',';
                      break;
                    }
                  }
                }
                let newDif = [];
                for(let q = 0,tn = newPeronnelList.length;q < tn;q++){
                  if(dif.indexOf(newPeronnelList[q].user_id) == -1){
                    newDif.push(newPeronnelList[q])
                  }
                }
                this.membersData = this.membersData.concat(newDif)
              }
            }else{
              this.$message({
                showClose: true,
                message:res.errmsg,
                type: 'warning'
              });
            }
          },
          error: (xhr, status) => {
            
          },
          noNetwork: () => {
           
          }
        })
      },
      //---点击确定后执行的函数
      confirmGroupSelecter(val){
        // console.log(val)
        this.participant_group = []
        this.participant_user = []
        this.selected_members_groups = val
        this.selected_members_groups.forEach((obj) => {
          if(obj.selType === 'group'){
            this.participant_group.push(obj.id)
            obj.PeronnelList.forEach( (o) => {
              this.participant_user.push(o.user_id)
            })
          }else{
            this.participant_user.push(obj.id)
          }
        })
        this.getUsersData()
      },
      //删除人员--针对表格进行操作
      deleteMember(){
        this.$confirm('确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let user_ids = []
          this.currSelectionVal.forEach( (i) => {
            user_ids.push(i.user_id)
          })
          util.ajax({
            url: '/ss/user/delete',
            type:'POST',
            data: {
              team_id: this.team_id,
              project_id: this.project_id,
              month:this.currmonth,
              ss_id:util.getLocalStorage('currUserInfoData').ss_id,
              user_id:user_ids
            },
            timeout:10000,
            success: (res) => {
              this.$message({
                showClose: true,
                message:'删除成功',
                type: 'success'
              });
              for(let i = 0 ,lg = user_ids.length;i < lg;i++){
                for(let n =0 ,lt = this.membersData.length; n < lt ;n++){
                  if(user_ids[i] === this.membersData[n].user_id){
                    this.membersData.splice(n,1);
                    break;
                  }
                }
              }
            },
            error: (xhr, status) => {
            },
            noNetwork: () => {
            }
          })
        }).catch(() => {
                  
        });
      },
       //---显示组件--选择人员
      openGroupSelecter(){
        this.$refs.profile.openGroupSelecter()
      },
      //---获取可选择小组和人员列表
      getMemberGroup(){
        util.ajax({
          url: '/group/node_data_tree',
          type:'GET',
          data: {
            show_all:1,
            group_id: 0,
            team_id: this.team_id,
            project_id: this.project_id
          },
          timeout:10000,
          success: (res) => {
            if(res&&res.errno==0){
              this.all_groups = res.data
            }
          },
          error: (xhr, status) => {
            
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
      },
      importGroup(){
        var formData = new FormData();
        formData.append('ss_excel', document.querySelector('#import-file-excel').files[0]);
        formData.append('team_id', this.team_id);
        formData.append('project_id', this.project_id);
        formData.append('dmclient', 'pcweb');
        formData.append('ss_id', util.getLocalStorage('currUserInfoData').ss_id);
        formData.append('month', this.currmonth);
        this.main_loading = true;
        $.ajax({
          url: util.host+'/sea/api/1.0/client/v1/ss/user/upload',
          type:'POST',
          data:formData,
          processData: false,   
          contentType: false,       
          xhrFields:{
            withCredentials:true
          },
          timeout:10000,
          success: (res) => {
            if(res.errno == 0){
              this.$message({
                showClose: true,
                message:'上传成功',
                type: 'success'
              });
              this.
            this.getSSDetalisList()
            }else{
              this.$message({
                showClose: true,
                message:res.errmsg,
                type: 'warning'
              });
            }
            document.querySelector('#import-file-excel').value = null;
            this.main_loading = false;
          },
          error: (xhr, status) => {
            document.querySelector('#import-file-excel').value = null;
            this.main_loading = false;
          },
          noNetwork: () => {            
            document.querySelector('#import-file-excel').value = null;
            this.main_loading = false;
          }
        })

      },
      exportGroup(){
        if(navigator.onLine){
            let href='/sea/api/1.0/client/v1/ss/user/export?dmclient=pcweb&team_id='+this.team_id+'&project_id='+this.project_id+'&ss_id=' + util.getLocalStorage('currUserInfoData').ss_id + '&month='+ this.currmonth
            util.locationHref(href)   
        }else{
            this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
            });
        }

      },
  	},
  	mounted() {
    	this.init()
      let that = this
      let oldH = $(window).height()
      this.winHeight = $(window).height() - 300-40
      $(window).resize(function() {
          that.winHeight = $(window).height() - 300-40
          if($(window).height() == oldH){
              that.winHeight = $(window).height() - 300-40
          }
      });
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
<!-- <style  src='../assets/css/reset.css'></style> -->
<style  src='../assets/css/social.css'></style>
<style scoped>

</style>
