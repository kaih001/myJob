<template>
  	<div class="memberset">
      <div class="memberset_top">
        <breadcrumb>
            <router-link to="memberadmin" replace>人员管理</router-link>
            <router-link to="">设置</router-link>
        </breadcrumb>
      </div>
      <div class="memberset_main">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
          <el-form-item label="自动清理" prop="auto_clean_no" style="margin-bottom:0px;">
            <p class="tip">开启后，自动清理掉项目中一定天数未工作的人员</p>
            <el-radio class="radio" v-model="ruleForm.auto_clean_no" :label="1">开启</el-radio>
            <el-radio class="radio" v-model="ruleForm.auto_clean_no" :label="0">关闭</el-radio>
          </el-form-item>
          <el-form-item v-if="ruleForm.auto_clean_no==1" label="清理周期" prop="clean_cycle" style="margin-bottom:0px;margin-top:20px;">
            <el-select v-model="ruleForm.clean_cycle" filterable placeholder="请选择" style="width:209px;">
              <el-option label="7天内未工作" :key="7" :value="7"></el-option>
              <el-option label="15天内未工作" :key="15" :value="15"></el-option>
              <el-option label="30天内未工作" :key="30" :value="30"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="" style="margin-bottom:67px;margin-top:40px;">
            <el-button type="primary" @click="save">保 存</el-button>
          </el-form-item>
        </el-form>
      </div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

import breadcrumb from '@/components/common/breadcrumb'

export default {
  	name: 'Memberset',
    components:{
        breadcrumb
    },
  	data () {
    	return {
        team_id: 0,
        project_id: 0,
        task_id: 38216,
        isNewTask: true,
        ruleForm: {
          auto_clean_no: 0,
          clean_cycle: 15,
        },
        rules: {

        }
    	}
  	},
  	methods: {
    	init() {
        this.team_id = util.getLocalStorage('projectStorageInfo').team_id
        this.project_id = util.getLocalStorage('projectStorageInfo').project_id

        this.getData()
    	},
      getData(){
        util.ajax({
          url: '/project/auto_clean/get',
          type:'GET',
          data: {
            team_id: this.team_id,
            project_id: this.project_id
          },
          success: (res) => {
            // console.log('获取人员管理设置')
            // console.log(res)
            if(res&&res.errno==0){
              this.ruleForm.auto_clean_no = Number(res.data.auto_clean_no)
              this.ruleForm.clean_cycle = Number(res.data.clean_cycle)
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
      save() {
        util.ajax({
          url: '/project/auto_clean/update',
          type:'POST',
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            auto_clean_no: this.ruleForm.auto_clean_no,
            clean_cycle: this.ruleForm.clean_cycle
          },
          success: (res) => {
            // console.log('保存人员管理设置')
            // console.log(res)
            if(res&&res.errno==0){
              this.$message({
                showClose: true,
                message: '保存成功',
                type: 'success'
              });
            }else{
              this.$message({
                showClose: true,
                message: res.errmsg,
                type: 'warning'
              });
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
      }
  	},
  	mounted() {
    	this.init()
  	},
  	watch: {
  	  '$route' (to, from) {
  	    // 对路由变化作出响应...
        this.init()
  	  }
  	}
}
</script>

<style>
.memberset .memberset_main .el-form-item .el-form-item__label{
  text-align: left;
  /*text-indent: 0px;*/
  color: #5E6D82;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.memberset{
  padding: 0 20px;
}
.memberset .memberset_top{
  height:50px;
  border-bottom: 1px solid #e0e6ed;
}

.memberset .memberset_main{
  margin-top: 29px;
}
.memberset .memberset_main .tip{
  font-family: 'PingFangSC-Regular';
  font-size: 14px;
  color: #99A9BF;
  letter-spacing: 0;
  height: 34px;
  line-height: 36px;
}
</style>
