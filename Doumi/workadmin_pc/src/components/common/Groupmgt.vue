<template>
  <div id="groupMgt">
      <span v-if="project_auto_clean" class="groupMgtBtns set_btn" @click="gotoSetup"><i class="group_icon"></i>&nbsp;&nbsp;设置</span>
      <span v-if="creatGroupPre" class="groupMgtBtns" @click="dialogAddGroup(0)"><i class="group_icon"></i>&nbsp;&nbsp;分组管理</span>
      <!-- 弹窗————分组管理-->
      <div class="dialog-group">
          <el-dialog
            title="分组管理"
            class="size-dialog"
            :visible.sync="dialogVisible"
            @close="closeForm"
            size="small">
            <div class="mybox">
                <div class="select-group">
                    <h4>选择小组</h4>
                    <div class="left">
                        <div class="all_search">
                          <i class="el-icon-search"></i>
                          <el-input
                            :icon='filterTextS?"circle-cross":""'
                            :on-icon-click="clearFilterText"
                            placeholder="搜索小组名称"
                            v-model="filterTextS">
                          </el-input>
                        </div>
                        <div class="all_main">
                            <el-tree 
                              ref="allGroups" 
                              :data="allGroups"  
                              :props="defaultProps" 
                              @node-click="handleNodeClick"
                              node-key="id"  
                              :default-expand-all="true"
                              :highlight-current="true"
                              :filter-node-method="filterNode"
                              :expand-on-click-node="false"
                              :render-content="renderContent">  
                            </el-tree>
                        </div>
                    </div>
                </div>
                <div class="edit-group">
                    <h4>编辑信息</h4>
                    <div class="right">
                        <span class="empty" v-if="isEmpty">{{empty_text}}</span>
                        <el-form :model="fromData" :rules="rules" ref="fromData" label-width="70px" v-else  v-loading="loadingEditGroup">
                            <el-form-item label="小组名称" prop="currGroupName">
                                <el-input v-model="fromData.currGroupName" placeholder="请输入"></el-input>
                            </el-form-item>
                            <el-form-item label="上级小组" prop="prevGroupId">
                              <el-select v-model="fromData.prevGroupId"  class="mystatus"  no-match-text="不存在该小组" filterable placeholder="请选择">
                                  <el-option
                                    v-for="item in allSelectGroupList"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id">
                                  </el-option>
                              </el-select>
                            </el-form-item>
                            <el-form-item label="组长" v-if='fromData.groupLeader.length>2'>
                              <el-select v-model="fromData.groupLeader"  class="mystatus2 myinput myicons" no-match-text="项目内无该成员" multiple filterable placeholder="请选择">
                                  <el-option
                                    v-for="item in allSelectMemberList"
                                    :key="item.user_id"
                                    :label="item.nick_name"
                                    :value="item.user_id">
                                  </el-option>
                              </el-select>
                            </el-form-item>
                            <el-form-item label="组长" v-else>
                              <el-select v-model="fromData.groupLeader"  class="mystatus2 myinput" no-match-text="项目内无该成员" multiple filterable placeholder="请选择">
                                  <el-option
                                    v-for="item in allSelectMemberList"
                                    :key="item.user_id"
                                    :label="item.nick_name"
                                    :value="item.user_id">
                                  </el-option>
                              </el-select>
                            </el-form-item>

                            <div style="margin-top:40px;" v-if='fromData.groupLeader.length>2'>
                                <el-form-item>
                                    <el-button class="btn1" @click="resetForm('fromData')">重 置</el-button>
                                    <el-button class="btn2" type="primary" @click="submitForm('fromData')">保 存</el-button>
                                </el-form-item>
                            </div>
                            <div style="margin-top:60px;" v-else>
                                <el-form-item>
                                    <el-button class="btn1" @click="resetForm('fromData')">重 置</el-button>
                                    <el-button class="btn2" type="primary" @click="submitForm('fromData')">保 存</el-button>
                                </el-form-item>
                            </div>
                        </el-form>
                    </div>
                </div>
            </div>
            
          </el-dialog>
      </div>
  </div>
  
</template>

<script>
  import * as util from '@/assets/js/util.js'
  import GroupUtil from '@/assets/js/GroupUtil.js'
  let $ = require("jquery")
  let id = 1000
  export default{
      name: 'groupMgt',
      components:{

      },
      props: [ 'creatGroupPre', 'project_auto_clean'],
      data:function(){
        var currGroupNameReg = (rule,value,callback) => {
            if (!value) {
              return callback(new Error('小组名称不能为空'));
            }else{
              callback();
            }
        };
        var prevGroupReg = (rule,value,callback) => {
            if (!value) {
              return callback(new Error('请选择上级小组'));
            }else{
              callback();
            }
        };
        var groupLeaderReg = (rule,value,callback) => {
            if (!value) {
              return callback(new Error('请选择小组组长'));
            }else{
              callback();
            }
        };
        return{
            team_id:'',
            project_id:'',
            empty_text:'请选择小组',
            isEmpty:true,
            loadingEditGroup:false,
            dialogVisible:false, // 弹窗--分组管理
            isChangeRole:true,
            filterTextS:'',  // //过滤小组关键字
            baseId:1000,  
            allGroups: [],
            defaultProps: {  //分组管理--树形小组数据--默认值
              children: 'children',
              label: 'name'
            },
            newData:'',
            leaders:[],
            fromData:{    // 关于from表单数据
                currGroupId:'',
                currGroupName:'',
                prevGroupId:'',
                prevGroupName:'',
                groupLeader:'',

            },
            allSelectGroupList:[],
            allSelectMemberList:[],
            rules: {  //表单验证
                currGroupName: [
                    { validator: currGroupNameReg, trigger: 'change' }
                ],
                prevGroupId: [
                    { validator: prevGroupReg, trigger: 'change' }
                ],
                groupLeader: [
                    { validator: groupLeaderReg, trigger: 'change' }
                ]
            }
        }
      },
      computed:{

      },
      watch: {
        filterTextS(val) {
          this.$refs.allGroups.filter(val);
        },
        dialogVisible(val){
          if(!val){
            this.$emit('closeDialog')
          }
        }
      },
      methods:{
        init (){

            
        },
        //获取所有人员列表
        getGroupMemberList(){
            this.allSelectMemberList = []
            util.ajax({
                url:'/group/node_tree',
                type:'GET',
                data:{
                    team_id:this.team_id,
                    project_id: this.project_id,
                    type_id:0,
                    start_date:'',
                    end_date:''
                },
                timeout:10000,
                success:(obj) => {
                    if(obj && obj.errno == 0){
                        let group = new GroupUtil(obj.data) // 小组列表--select
                        let mall = group.formatMember(obj.data)
                        let newarr = []
                        mall.forEach( (m) => {
                            if(m.identity == 1){
                                return
                            }else{
                                newarr.push(m)
                            }
                        })
                        this.allSelectMemberList = newarr
                        // this.allSelectMemberList = group.formatMember(obj.data)
                        // console.log(this.allSelectMemberList)
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
                  //网络超时
                  this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络',
                    type: 'warning'
                  });
                }
            })
        },
        //获取小组列表
        dialogAddGroup(curG){ 
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id
            util.ajax({
              url:'/group/select_list',
              type:'GET',
              data:{
                  group_id:curG,
                  team_id: this.team_id,
                  project_id: this.project_id
              },
              timeout:10000,
              success:(obj) => {
                  // console.log(obj)
                  if(curG){
                      this.loadingEditGroup = false
                  }
                  if(obj && obj.errno == 0){
                      if(curG == 0){
                          this.dialogVisible = true
                          this.empty_text = '请选择小组'
                      }
                      if(curG){
                          let s_arr = []
                          let group = new GroupUtil(obj.data) // 小组列表--select
                          group.formatGroup(group.group).forEach( (item) => {
                              if(item.all.isShow == false){
                                  return
                              }else{
                                  s_arr.push(item)
                              }
                          })
                          this.allSelectGroupList = s_arr
                          
                      }else{
                          obj.data[0].notdelete = 99
                          this.allGroups = obj.data// 小组结构tree
                      }
                  }

              },   
              error: (xhr, status) => {
                  this.loadingEditGroup = false
                  this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络',
                    type: 'warning'
                  });
              },
              noNetwork: () => {
                this.loadingEditGroup = false
                //网络超时
                this.$message({
                  showClose: true,
                  message: '网络连接失败，请检查网络',
                  type: 'warning'
                });
              }
            })
            if(!curG){
              this.getGroupMemberList()
            }
        },
        /*添加小组及删除小组操作*/
        renderContent:function(createElement, { node, data, store }) {  
            var self = this;  
            if(data.notdelete && data.notdelete == 99){
                return createElement('span', [  
                  createElement('span', node.label),  
                  createElement('span', {attrs:{  
                      class:'operationBtns',
                      style:""  
                  }},[  
                      createElement('i',{attrs:{  
                          class:"add-iocn",
                          style:'float:left'  
                      },on:{  
                          click:function(e) {  
                              e.stopPropagation()
                              util.ajax({
                                  url:'/group/create',
                                  type:'POST',
                                  data:{
                                    team_id: self.team_id,
                                    project_id: self.project_id,
                                    parent_id : data.id,
                                    group_name: '未命名',
                                  },
                                  timeout:10000,
                                  success:(obj) => {
                                      // console.log(obj)
                                      if(obj && obj.errno == 0){
                                          store.append({ id: obj.data, name: '未命名', children: [] }, data);
                                      }else{
                                          self.$message({
                                            showClose: true,
                                            message: obj.errmsg,
                                            type: 'warning'
                                          });
                                      }
                                  },   
                                  error: (xhr, status) => {
                                      self.$message({
                                        showClose: true,
                                        message: '网络连接失败，请检查网络',
                                        type: 'warning'
                                      });
                                  },
                                  noNetwork: () => {
                                    //网络超时
                                    self.$message({
                                      showClose: true,
                                      message: '网络连接失败，请检查网络',
                                      type: 'warning'
                                    });
                                  }
                              })
                          }  
                      }},"")
                  ]),  
              ]);  
            }else{
                return createElement('span', [  
                    createElement('span', node.label),  
                    createElement('span', {attrs:{  
                        class:'operationBtns',
                        style:""  
                    }},[  
                        createElement('i',{attrs:{  
                            class:"add-iocn",
                            style:'float:left'  
                        },on:{  
                            click:function(e) {  
                                e.stopPropagation()
                                // console.info("点击了节点" + data.id + "的添加按钮");
                                util.ajax({
                                    url:'/group/create',
                                    type:'POST',
                                    data:{
                                      team_id: self.team_id,
                                      project_id: self.project_id,
                                      parent_id : data.id,
                                      group_name: '未命名',
                                    },
                                    timeout:10000,
                                    success:(obj) => {
                                        // console.log(obj)
                                        if(obj && obj.errno == 0){
                                            store.append({ id: obj.data, name: '未命名', children: [] }, data);
                                        }else{
                                            self.$message({
                                              showClose: true,
                                              message: obj.errmsg,
                                              type: 'warning'
                                            });
                                        }
                                    },   
                                    error: (xhr, status) => {
                                        self.$message({
                                          showClose: true,
                                          message: '网络连接失败，请检查网络',
                                          type: 'warning'
                                        });
                                    },
                                    noNetwork: () => {
                                      //网络超时
                                      self.$message({
                                        showClose: true,
                                        message: '网络连接失败，请检查网络',
                                        type: 'warning'
                                      });
                                    }
                                })
                            }  
                        }},""),  
                        createElement('i',{attrs:{  
                            class:"line",
                            style:''  
                        }},""), 
                        createElement('i',{attrs:{  
                            class:"delete-icon",
                            style:'color:#99a9bf;float:left;' 
                        },on:{  
                            click:function(e) {  
                                e.stopPropagation()
                                // console.info("点击了节点" + data.id + "的删除按钮"); 
                                util.ajax({
                                  url:'/group/descendant_empty',
                                  type:'POST',
                                  data:{
                                    team_id: self.team_id,
                                    project_id: self.project_id,
                                    group_id : data.id
                                  },
                                  timeout:10000,
                                  success:(obj) => {
                                      if(obj.errno == 0){
                                        self.$confirm('是否确认删除该小组', '提示', {
                                            confirmButtonText: '确定',
                                            cancelButtonText: '取消'
                                        }).then(() => {
                                           util.ajax({
                                              url:'/group/delete',
                                              type:'POST',
                                              data:{
                                                team_id: self.team_id,
                                                project_id: self.project_id,
                                                group_id : data.id
                                              },
                                              timeout:10000,
                                              success:(obj) => {
                                                  // console.log(obj)
                                                  self.isEmpty = true
                                                  self.empty_text = '请选择小组'
                                                  if(obj && obj.errno == 0){
                                                     store.remove(data);
                                                     let arr = util.getLocalStorage('origin_selected_groups')
                                                     arr.forEach( (i,o) => {
                                                        if(data.id == i.id){
                                                            arr.splice(o,1)
                                                        }
                                                     })
                                                     util.setLocalStorage('origin_selected_groups', arr)
                                                  }else{
                                                      self.$message({
                                                        showClose: true,
                                                        message: obj.errmsg,
                                                        type: 'warning'
                                                      });
                                                  }
                                              },   
                                              error: (xhr, status) => {
                                                  self.$message({
                                                    showClose: true,
                                                    message: '网络连接失败，请检查网络',
                                                    type: 'warning'
                                                  });
                                              },
                                              noNetwork: () => {
                                                //网络超时
                                                self.$message({
                                                  showClose: true,
                                                  message: '网络连接失败，请检查网络',
                                                  type: 'warning'
                                                });
                                              }
                                            }) 
                                          }).catch(() => {
                                                    
                                          });
                                      }else if(obj.errno == '11014'){
                                          self.$message({
                                            showClose: true,
                                            message: '需要先删除小组下的成员和小组，再删除该小组',
                                            type: 'warning'
                                          });
                                      }
                                  },   
                                  error: (xhr, status) => {
                                      self.$message({
                                        showClose: true,
                                        message: '网络连接失败，请检查网络',
                                        type: 'warning'
                                      });
                                  },
                                  noNetwork: () => {
                                    //网络超时
                                    self.$message({
                                      showClose: true,
                                      message: '网络连接失败，请检查网络',
                                      type: 'warning'
                                    });
                                  }
                                }) 
                            }  
                        }},""),  
                    ]),  
                ]);  
            }
        },
        //弹窗---过滤小组函数
        filterNode(value, data) {
          if (!value) return true;
          return data.name.indexOf(value) !== -1;
        },
        //弹窗---树形小组操作
        handleNodeClick(data){
          if(data.notdelete && data.notdelete == 99){
              this.isEmpty = true
              this.empty_text = '根目录不允许编辑'
              return
          }
          this.newData = ''
          this.fromData.groupLeader = []
          this.loadingEditGroup = true
          util.ajax({
              url:'/group/info',
              type:'GET',
              data:{
                team_id: this.team_id,
                project_id: this.project_id,
                group_id : data.id
              },
              timeout:10000,
              success:(obj) => {
                  // console.log(obj)
                  if(obj && obj.errno == 0){
                      this.newData = obj.data
                      this.isEmpty = false
                      this.fromData.currGroupId = obj.data.id
                      this.fromData.currGroupName = obj.data.name
                      this.fromData.prevGroupId = obj.data.pid
                      this.fromData.prevGroupName = obj.data.parent_name
                      if(obj.data.leader.length > 0){
                          obj.data.leader.forEach( (i) => {
                              this.fromData.groupLeader.push(i.user_id)
                          })
                      }
                      this.dialogAddGroup(obj.data.id)

                  }else{
                      self.$message({
                        showClose: true,
                        message: obj.errmsg,
                        type: 'warning'
                      });
                  }
              },   
              error: (xhr, status) => {
                  this.loadingEditGroup = false
                  this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络',
                    type: 'warning'
                  });
              },
              noNetwork: () => {
                this.loadingEditGroup = false
                //网络超时
                this.$message({
                  showClose: true,
                  message: '网络连接失败，请检查网络',
                  type: 'warning'
                });
              }
          }) 
        },
        //弹窗---清楚搜索小组关键字
        clearFilterText(){
          this.filterTextS = ''
        },
        /*确定*/
        submitForm(formName) {
          this.$refs[formName].validate((valid) => {
            this.newData={
                team_id: this.team_id,
                project_id : this.project_id,
                group_id: this.fromData.currGroupId,
                group_name: this.fromData.currGroupName,
                parent_id: this.fromData.prevGroupId,
                leader: this.fromData.groupLeader,
                submit:99
            }
            if (valid) {
                util.ajax({
                    url:'/group/edit',
                    type:'GET',
                    data:{
                        team_id: this.team_id,
                        project_id : this.project_id,
                        group_id: this.fromData.currGroupId,
                        group_name: this.fromData.currGroupName,
                        parent_id: this.fromData.prevGroupId,
                        group_leader: this.fromData.groupLeader.join(',')
                    },
                    timeout:10000,
                    success:(obj) => {
                        // console.log(obj)
                        if(obj && obj.errno == 0){
                            this.$message({
                              showClose: true,
                              message: '保存成功！',
                              type: 'warning'
                            });
                            util.ajax({
                              url:'/group/select_list',
                              type:'GET',
                              data:{
                                  group_id:0,
                                  team_id: this.team_id,
                                  project_id: this.project_id
                              },
                              timeout:10000,
                              success:(obj) => {
                                  if(obj && obj.errno == 0){
                                      obj.data[0].notdelete = 99
                                      this.allGroups = obj.data// 小组结构tree
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
                                //网络超时
                                this.$message({
                                  showClose: true,
                                  message: '网络连接失败，请检查网络',
                                  type: 'warning'
                                });
                              }
                            })
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
                      //网络超时
                      this.$message({
                        showClose: true,
                        message: '网络连接失败，请检查网络',
                        type: 'warning'
                      });
                    }
                }) 

            } else {
              console.log('error submit!!');
              return false;
            }
          });
        },
        /*重置*/
        resetForm(formName) {
          this.$refs[formName].resetFields();
          console.log(this.newData)
          this.fromData.groupLeader = []
          if(this.newData.submit && this.newData.submit == 99){
              this.fromData.currGroupId = this.newData.group_id
              this.fromData.currGroupName = this.newData.group_name
              this.fromData.prevGroupId = this.newData.parent_id
              this.fromData.prevGroupName = this.newData.parent_name
              this.fromData.groupLeader = this.newData.leader
          }else{
              this.fromData.currGroupId = this.newData.id
              this.fromData.currGroupName = this.newData.name
              this.fromData.prevGroupId = this.newData.pid
              this.fromData.prevGroupName = this.newData.parent_name
              this.newData.leader.forEach( (i) => {
                  this.fromData.groupLeader.push(i.user_id)
              })
          }
          
          
        },
        //关闭弹窗
        closeForm(){
            this.isEmpty = true
            util.getLocalStorage('origin_selected_groups')
            // this.$refs[formName].resetFields();
        },
        //获取权限
        getPermissions2(){
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id
             util.ajax({
                url:'/permission/application',
                type:'GET',
                data:{
                    team_id: this.team_id,
                    project_id: this.project_id,
                    application_id:0
                },
                timeout:10000,
                success:(obj) => {
                    // console.log(JSON.stringify(obj))
                    if(obj && obj.errno == 0){
                        obj.data.forEach ( (i) => {
                            if(i.id_name == 'set_user_role'){ 
                                this.isChangeRole = false;
                            }
                        })
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
        gotoSetup(){
          this.$router.replace('memberset')
        }
      },
      created(){
          this.init()
          this.getPermissions2()
      }
    }

</script>


<style  src='../../assets/css/groupmgt.css'></style>
<style>
  .set_btn{
    margin-left: 26px;
  }
  .set_btn .group_icon{
    background:url(../../assets/imgs/set.svg)!important;
  }
</style>
