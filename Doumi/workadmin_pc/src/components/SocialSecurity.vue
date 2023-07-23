<template>
	<div class="SocialSecurity">
    <div class="s-wapper">
      <!-- <h2>社保管理</h2> -->
      <div class="search">
        <el-form :inline="true" :model="form" class="demo-form-inline">
          <el-form-item label="月份：">
            <el-date-picker
              v-model="form.month"
              type="month"
              placeholder="选择月">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getSSList('search')">搜 索</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="addbtn" @click="dialogAddS = true">
          <i class="add_icon"></i>
          <el-button type="text">添加</el-button>
      </div>
      <div class="table">
        <el-table
          :data="tableData"
          border
          @cell-click="gotoMemberInfoList"
          style="width: 100%">
          <el-table-column
            type="index"
            label="序号"
            width="80">
          </el-table-column>
          <el-table-column
            prop="month"
            label="缴纳月份">
          </el-table-column>
          <el-table-column
            prop="count"
            label="缴纳人数">
          </el-table-column>
          <el-table-column
            label="状态"
            width="150">
              <template slot-scope="scope">
                <el-tag type="gray" v-if="scope.row.ss_status == 0">草稿</el-tag>
                <el-tag type="success" v-if="scope.row.ss_status == 1">有效</el-tag>
                <el-tag type="danger" v-if="scope.row.ss_status == 2">无效</el-tag>
              </template>
          </el-table-column>
        </el-table>
        <!--分页-->
        <div class="pagination" style="float: right;" v-if="total_num">
          <el-pagination
            background
            @current-change="handleCurrentPageChange"
            :current-page.sync="currentPage"
            :page-size="20"
            layout="total, prev, pager, next"
            :page-count="total_page"
            :total="total_num">
          </el-pagination>
        </div>
      </div>
    </div>

  <!--添加社保 弹层-->
    <div class="dialog-adds">
      <el-dialog
        title="请选择缴纳月份"
        :visible.sync="dialogAddS"
        @close="resetForm('ruleForm')">
          <div>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="60px" class="demo-ruleForm">
              <el-form-item 
                label="年：" 
                prop="year" 
                style="margin-bottom:20px;">
                <el-date-picker
                  v-model="ruleForm.year"
                  @change="selectYear"
                  type="year"
                  style="width:300px;"
                  placeholder="选择年">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="月：" prop="month">
                <el-select v-model="ruleForm.month" placeholder="选择月" style="width:300px;">
                  <el-option :label="i.label" :value="i.value" :key="i.value" :disabled="i.disabled" v-for="i in montharr2"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer footerdiv">
              <el-button @click="resetForm('ruleForm')">取 消</el-button>
              <el-button type="primary" @click="submitForm('ruleForm')">创 建</el-button>
            </span>
          </div>
      </el-dialog>
    </div>

	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

export default {
  	name: 'SocialSecurity',
  	data () {
    	return {
        dialogAddS:false,
        team_id:'',
        project_id:'',
        form:{
          month:''
        },
        tableData:[],
        ruleForm:{
          year:'',
          month:'',
        },
        montharr:[
          {label:'01',value:'01'},
          {label:'02',value:'02'},
          {label:'03',value:'03'},
          {label:'04',value:'04'},
          {label:'05',value:'05'},
          {label:'06',value:'06'},
          {label:'07',value:'07'},
          {label:'08',value:'08'},
          {label:'09',value:'09'},
          {label:'10',value:'10'},
          {label:'11',value:'11'},
          {label:'12',value:'12'}
        ],
        montharr2:[],
        rules: {
          year: [
           {type: 'date', required: true, message: '请选择缴纳年份', trigger: 'change'}
          ],
          month: [
            { required: true, message: '请选择缴纳月份', trigger: 'change' }
          ]
        },
        page_no:1,
        currentPage: 1, // 分页--当前显示页码
        total_num:'',
        total_page:'',
        exist_year_month:[]
    	}
  	},
  	methods: {
    	init() {
        this.team_id = util.getLocalStorage('projectStorageInfo').team_id
        this.project_id = util.getLocalStorage('projectStorageInfo').project_id
        //获取社保列表
        this.getSSList()
    	},
      //去往社保详情列表页
      gotoMemberInfoList(row){
        util.setLocalStorage('currUserInfoData',row)
        this.$router.replace({ path: 'ssDetails', query: {type:'details'}})
      },
      // 创建提交
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            util.getLocalStorage('currUserInfoData','')
            let time = util.getLocalTime(this.ruleForm.year,'yyyy')
            this.$router.replace({ path: 'ssDetails', query: { year: time,month:this.ruleForm.month,type:'creat'}})
          } else {
            // console.log('error submit!!');
            return false;
          }
        });
      },
      //取消
      resetForm(formName) {
          this.dialogAddS = false
          this.$refs[formName].resetFields();
      },
      handleCurrentPageChange(val) {
        this.page_no = val
        this.getSSList()
      },
      selectYear(){
        this.montharr = [
          {label:'01',value:'01'},
          {label:'02',value:'02'},
          {label:'03',value:'03'},
          {label:'04',value:'04'},
          {label:'05',value:'05'},
          {label:'06',value:'06'},
          {label:'07',value:'07'},
          {label:'08',value:'08'},
          {label:'09',value:'09'},
          {label:'10',value:'10'},
          {label:'11',value:'11'},
          {label:'12',value:'12'}
        ]
        this.montharr2 = []
        this.ruleForm.month = ''
        let time = util.getLocalTime(this.ruleForm.year,'yyyy')
        this.exist_year_month.forEach( (o) => {
          if(time == o.year){
            this.montharr.forEach( (m) => {
              o.month_list.forEach( (i) => {
                if(m.value == i){
                  m.disabled = true
                }
              })
            })
          }else{
            this.montharr2 = this.montharr
          }
        })
        this.montharr2 = this.montharr
      },
      getSSList(pre){
        let time = ''
        if(pre){
          this.page_no = 1
          if(this.form.month){
            time = util.getLocalTime(this.form.month,'yyyy-MM')
            time = time.replace('-','')
          }else{
            time = ''
          }
        }else{
          time = ''
        }
        
        util.ajax({
            url:'/ss/list',
            type:'GET',
            data:{
                team_id: this.team_id,
                project_id: this.project_id,
                month:time,
                page:this.page_no,
                page_size:20
            },
            timeout:10000,
            success:(obj) => {
              if(obj && obj.errno == 0){
                  this.tableData = obj.data.list
                  this.total_num = obj.data.total_num
                  this.total_page = obj.data.total_page
                  this.exist_year_month = obj.data.exist_year_month                
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<!-- <style  src='../assets/css/reset.css'></style> -->
<style  src='../assets/css/social.css'></style>
<style scoped>

</style>
