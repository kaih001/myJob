<template>
  <div id="memberInvitation">
      <div class="invit-wapper">
          <h2><b @click="gotoBackMemberAdmin">人员管理</b>&nbsp;<i class="icon-arrow-right"></i>&nbsp;<span>邀请加入</span></h2>
          <h3>邀请人员</h3>
          <div class="myform">
              <el-form label-width="84px" class="demo-ruleForm" :model="ruleForm" ref="ruleForm">
                  <el-form-item label="加入到：">
                      <el-select :class="{'error-tip':isError}" @change="groupChang" v-model="ruleForm.belongGroup" no-match-text="不存在该小组" filterable placeholder="请选择">
                          <el-option
                            v-for="item in allGroup"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id">
                          </el-option>
                      </el-select>
                      <span v-if="isError" class="error-text">请选择所属小组</span>
                  </el-form-item>
                  <el-form-item  class="lis-div" label="需填写项：" prop="belongGroup" v-if="allFieldList.length != 0">
                      <p>请选择除姓名、手机号以外需填写的信息</p>
                      <div class="sels">
                          <el-checkbox-group v-model="checkboxGroup">                       
                              <el-checkbox-button :class="'width_'+item.name.length" v-for="item in allFieldList" :label="item.id" :key="item.id" :disabled="item.selected == 1 && item.not_be_off == 1">{{item.name === '出生年月' ? '年龄' : item.name}}<i class="select_icon"></i></el-checkbox-button>
                              <el-button v-if="current_user_role_id==3" type="primary" plain class="el-checkbox-button__inner" @click="handleDialogCustomField">自定义选项</el-button>
                          </el-checkbox-group>
                      </div>
                  </el-form-item>
                  <el-form-item>
                      <el-button type="primary" class="btn2 invitmember-btn" @click="invitmember">开始邀请</el-button>
                  </el-form-item>
              </el-form>
          </div>
      </div>
      <!-- 弹窗————邀请 -->
      <div class="dialog-invit">
          <el-dialog
            title="邀请"
            :visible.sync="dialogInvit"
            size="tiny">
            <div class="dialogInvitform">
                <h3>二维码邀请</h3>
                <div class="ewm">
                    <dl>
                        <dt>
                            <canvas id="canvas"></canvas>
                        </dt>
                        <dd>右键复制二维码，保存或者分享到微信</dd>
                    </dl>
                </div>
                <!-- <div class="myinput">
                    <label for="">复制链接邀请:</label><br>
                    <input readonly = "readonly" type="text" v-model="ruleForm.link" value="ruleForm.link" id="input">
                    <el-button type="primary" class="btn2 copybtn" @click="copyContent">复制链接</el-button>
                </div> -->
            </div>
        </el-dialog>
      </div>
      <!-- 弹窗————自定义字段 -->
      <div class="custom-field">
        <el-dialog title="自定义选项" :visible.sync="dialogCustomField">
            <el-form :model="customFieldForm" style="padding:30px 20px;">
              <el-form-item label="选项名称" :label-width="formLabelWidth">
                <el-input v-model="customFieldForm.name" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="选项类型" :label-width="formLabelWidth">
                <el-select v-model="customFieldForm.region" placeholder="请选择字段类型">
                  <el-option label="文本" value="SingleText"></el-option>
                  <el-option label="图片" value="Imageview"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="handleDialogCustomField">取 消</el-button>
              <el-button type="primary" @click="submitCustomField">确 定</el-button>
            </div>
        </el-dialog>
      </div>
  </div>
</template>
<script>
  import * as util from '../assets/js/util.js'
  import GroupUtil from '../assets/js/GroupUtil.js'
  import QRCode from 'qrcode'
  import formFields from '../assets/js/formFields.js'

  export default{
    name: 'memberInvitation',
    components:{
    },
    data:function(){
      return{
          team_id:'',
          project_id:'',
          isError:false,
          dialogInvit:false,
          ruleForm:{
              belongGroup:'',
              link:''
          },
          checkboxGroup: [],
          allFieldList:[],
          allGroup:[],
          allSelect:[],
          formLabelWidth: '120px',
          dialogCustomField:false,
          customFieldForm: {
            name: '',
            region: '',
          },
          current_user_role_id:window.localStorage.getItem('current_user_role_id')
      }

    },
    computed:{

    },
    mounted: function () {   
    
    },
    watch: {
      
    },
    methods:{
      init (){
          this.team_id = util.getLocalStorage('projectStorageInfo').team_id
          this.project_id = util.getLocalStorage('projectStorageInfo').project_id
          //获取小组列表
          this.getGroupList()
      },
      //获取必填项列表
      extraFieldList(groupId){
          util.ajax({
            url:'/group/extra_info_field',
            type:'GET',
            data:{
                team_id: this.team_id,
                project_id: this.project_id,
                group_id:groupId
            },
            timeout:10000,
            success:(obj) => {
              // debugger;
              this.allFieldList = [];
              this.checkboxGroup = [];
              if(obj && obj.errno == 0){
                let {base_list,form_list}=obj.data;
                this.allFieldList = [...base_list,...form_list];
                this.allFieldList.forEach( (i) => {
                  if(i.selected == 1){
                      this.checkboxGroup.push(i.id)
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
      },
      //获取小组列表
      getGroupList(){
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
                // console.log(obj)
                if(obj && obj.errno == 0){
                    let group = new GroupUtil(obj.data) // 小组列表--select
                    this.allGroup = group.formatGroup(group.group) 
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
      //返回人员管理列表
      gotoBackMemberAdmin(){
          this.$router.replace('memberadmin')
      },
      //切换选中
      groupChang(){
        if(this.ruleForm.belongGroup){
            this.isError = false
        }
        //获取必填项列表
        this.extraFieldList(this.ruleForm.belongGroup)
      },
      //打开/关闭自定义信息dialog
      handleDialogCustomField(){
        this.clearCustomField();
        this.toggleDialogCustomField('dialogCustomField');
      },
      //提交自定义字段
      submitCustomField(){
        this.validityCustomField().then(res=>{
          let formInfo=formFields[this.customFieldForm.region];
          formInfo.info.title=this.customFieldForm.name;
          util.ajax({
            url:'/form/v2',
            type:'POST',
            data:{
              team_id: this.team_id,
              project_id: this.project_id,
              title:this.customFieldForm.name,
              desc:'这是一个描述',
              format_info:JSON.stringify([formInfo]),
              group_list: JSON.stringify([this.ruleForm.belongGroup])
            },
            timeout:10000,
            success:(obj) => {
                if(obj && obj.errno == 0){
                    this.clearCustomField();
                    this.toggleDialogCustomField('dialogCustomField');
                    this.extraFieldList(this.ruleForm.belongGroup)
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
              //网络超时
              this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
            }
          })
        }).catch(err=>{
          let errorMsg={
            'name':'请输入字段名称',
            'region':'请选择字段类型'
          };
          this.$message({
            showClose: true,
            message: errorMsg[err],
            type: 'warning'
          });
        })
      },
      //验证自定义信息合法性
      validityCustomField(){
        return new Promise((reslove,reject)=>{
          this.customFieldForm.name=this.customFieldForm.name.replace(/\s*/g,"");
          if(!this.customFieldForm.name){
            reject('name')
          }
          if(!this.customFieldForm.region){
            reject('region')
          }
          reslove();
        })
      },
      //清空自定义信息
      clearCustomField(){
        this.customFieldForm= {
          name: '',
          region: '',
        };
      },
      //关闭/打开自定义信息弹框
      toggleDialogCustomField(dialogName){
        this[dialogName] = !this[dialogName];
      },
      //生成二维码
      useqrcode(code_link){
          let canvas = document.getElementById('canvas')
          this.ruleForm.link = code_link
          QRCode.toCanvas(canvas, code_link, function (error) {
              // console.error(error)
          });
      },
      //复制链接
      copyContent(){
          var Url2=document.getElementById("input")
          Url2.select();
          document.execCommand("Copy");
          this.$message({
            showClose: true,
            message: '复制成功',
            type: 'warning'
          });
      },
      //获取邀请链接和二维码链接
      getCodeLink(group_id){
          util.ajax({
            url:'/group/qrcode_link',
            type:'GET',
            data:{
                group_id: group_id,
                team_id: this.team_id,
                project_id : this.project_id,
                type:2
            },
            timeout:10000,
            success:(obj) => {
                // console.log(obj)
                if(obj && obj.errno == 0){
                    this.useqrcode(obj.data.qrcode_url_link);
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
      //开始邀请
      invitmember(formName){
          if(!this.ruleForm.belongGroup){
              this.isError = true
              return
          }
          let sortGroup = [];
          let required_from_info = [];
          this.allFieldList.map((index, elem)=>{
            if(this.checkboxGroup.indexOf(index.id) != -1&&index.form!=1){
              sortGroup.push(index.id)
            }
            if(this.checkboxGroup.indexOf(index.id) != -1&&index.form==1){
              required_from_info.push(index.id)
            }
          })

          util.ajax({
              url:'/group/required_info_field/set',
              type:'GET',
              data:{
                  team_id: this.team_id,
                  project_id: this.project_id,
                  required_user_info:sortGroup,
                  required_form_info:required_from_info,
                  group_id: this.ruleForm.belongGroup
              },
              timeout:10000,
              success:(obj) => {
                  // console.log(obj)
                  if(obj && obj.errno == 0){
                      this.dialogInvit = true
                      this.getCodeLink(this.ruleForm.belongGroup)
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
                //网络超时
                this.$message({
                  showClose: true,
                  message: '网络连接失败，请检查网络',
                  type: 'warning'
                });
              }
            })
          // if(this.checkboxGroup.length != 0){
          //     util.ajax({
          //       url:'/group/required_info_field/set',
          //       type:'GET',
          //       data:{
          //           team_id: this.team_id,
          //           project_id: this.project_id,
          //           required_user_info:this.checkboxGroup
          //       },
          //       timeout:10000,
          //       success:(obj) => {
          //           // console.log(obj)
          //           if(obj && obj.errno == 0){
          //               this.dialogInvit = true
          //               this.getCodeLink(this.ruleForm.belongGroup)
          //           }
          //       },   
          //       error: (xhr, status) => {
          //           this.$message({
          //             showClose: true,
          //             message: '网络连接失败，请检查网络',
          //             type: 'warning'
          //           });
          //       },
          //       noNetwork: () => {
          //         //网络超时
          //         this.$message({
          //           showClose: true,
          //           message: '网络连接失败，请检查网络',
          //           type: 'warning'
          //         });
          //       }
          //     })
          // }else{
          //     this.dialogInvit = true
          //     this.getCodeLink(this.ruleForm.belongGroup)
          // }
      }
    },
    created(){
      this.init()
    }
  }
</script>

<style  src='../assets/css/invitmember.css'></style>

