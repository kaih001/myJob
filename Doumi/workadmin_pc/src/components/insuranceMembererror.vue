<template>
  <div id="memberAdmin">
      <div class="member-wapper member-error">
          <el-button type="primary" class="btn2 goback" @click="gotoBack">返 回</el-button>
          <h4 class="error-text">该表格共<b>{{total_num}}</b>人，有<span>{{memberErrorListData.length}}</span>条数据错误，请修改后重新上传</h4>
          <!-- 人员管理表单 -->
          <div class="from-member">
              <el-table 
                :data="memberErrorListData" 
                tooltip-effect="dark" 
                :height="winHeight"
                style="width: 100%">
                    <el-table-column
                      label="行数"
                      label-class-name="border"
                      width="65">
                      <template slot-scope="scope">
                        <el-icon name="line_number"></el-icon>
                        <span>{{ scope.row.line_number }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="姓名"
                      label-class-name="border"
                      show-overflow-tooltip
                      width="90">
                      <template slot-scope="scope">
                        <el-icon name="real_name"></el-icon>
                        <span>{{ scope.row.real_name }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="手机号"
                      label-class-name="border"
                      width="120">
                      <template slot-scope="scope">
                        <el-icon name="mobile"></el-icon>
                        <span>{{ scope.row.mobile }}</span>
                      </template>
                    </el-table-column>
                    <el-table-column
                      label="错误原因"
                      label-class-name="border">
                      <template slot-scope="scope">
                        <el-icon name="errors"></el-icon>
                        <span class="error-reason">{{ scope.row.errors }}</span>
                      </template>
                    </el-table-column>
              </el-table>
          </div>
      </div>
  </div>
  
</template>

<script>
  import * as util from '../assets/js/util.js'
  let $ = require("jquery")

  export default{
      name: 'memberAdmin',
      components:{

      },
      data:function(){
        return{
            memberErrorListData: [],
            total_num:'',
            winHeight:''
        }

      },
      computed:{

      },
      watch: {
        
      },
      methods:{
        init (){
            this.memberErrorListData = util.getLocalStorage('insuranceMembererror').error_list
            this.total_num = util.getLocalStorage('insuranceMembererror').total_detail_num
        },
        gotoBack(){
            this.$router.replace('insuranceMer')
        }
      },
      created(){
          this.init()

      },
      mounted() {
          let that = this
          let oldH = $(window).height()
          this.winHeight = $(window).height() - 180
          $(window).resize(function() {
              that.winHeight = $(window).height() - 180
              if($(window).height() == oldH){
                  that.winHeight = $(window).height() - 180
              }
          });
      }
    }
</script>

<style  src='../assets/css/member.css'></style>

