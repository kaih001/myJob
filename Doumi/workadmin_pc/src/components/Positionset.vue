<template>
    <div id="positionSet">
        <div class="p-set-top">
            <breadcrumb>
                <router-link to="positionmap" replace>位置监控</router-link>
                <router-link to="">设置</router-link>
            </breadcrumb>
        </div>
        <div class="my-setform">
            <el-form ref="myform" :model="myform" label-width="100px">
				<el-form-item label="位置上报">
					<p class="tip">员工主动上报位置，可通过工作助手APP、微信上报</p>
					<el-radio :label="1" v-model="myform.positionReport">开启</el-radio>
					<el-radio :label="0" v-model="myform.positionReport">关闭</el-radio>
				</el-form-item>
				<div class="set-type">
					<el-form-item label="填写项设置" v-if="myform.positionReport == 1">
					<!--引入必填项组件-->
						<set-require-field
							:require_field_origin="myform.require_field"
						></set-require-field>
					</el-form-item>
				  <el-form-item label="发送提醒时间" v-if="myform.positionReport == 1" style="margin-bottom:30px;">
						<div class="send-time">
							<p>每天指定时间提醒成员上报位置</p>
							<div class="add-time-div">
						      	<div :class="{'border-bottom':myform.timeList.length > 0}">
						          	<div class="time-list" v-for="(item,index) in myform.timeList">
						              	<span class="tit">{{item.timeText+(index+1)}}</span>
						              	<el-time-picker
							                :clearable="false"
							                :editable="false"
							                style="width:312px;margin-bottom:16px;"
							                v-model="item.timeValue"
							                format="HH:mm"
							                :picker-options="{
							                  selectableRange: startRange(item.end_time)
							                }"
							                placeholder="选择时间">
						              	</el-time-picker>
						              	<i class="delateIcon" @click="delateTime(index)"></i>
						          	</div>
						      	</div>
						      	<a href="javascript:;" @click="addTime"><i class="addIcon"></i>添加提醒时间</a>
						  	</div>
						</div>
				  </el-form-item>
				</div>
				<el-form-item label="轨迹监控">
					<p class="tip">员工使用APP时，根据考勤时间自动记录工作轨迹，若无考勤规则默认记录6：00~18：00的轨迹</p>
					<el-radio :label="1" v-model="myform.positionTrajectory">开启</el-radio>
					<el-radio :label="0" v-model="myform.positionTrajectory">关闭</el-radio>
				</el-form-item>
				<el-form-item label="">
					<el-button type="primary" @click="save">保 存</el-button>
				</el-form-item>
            </el-form>
        </div>
    	
    </div>
  
</template>

<script>
  import * as util from '../assets/js/util.js'
  import breadcrumb from '@/components/common/breadcrumb'
  import SetRequireField from '@/components/common/SetRequireField'
  let $ = require("jquery")
  let date = new Date()
  let today = util.formatData1(date)

  export default{
      name: 'positionSet',
      components:{
          breadcrumb,
          SetRequireField
      },
      data:function(){
        return{ 
            wangEditor:'',
            team_id:'',
            project_id:'',
          	myform:{
                positionReport:0,
                positionTrajectory:0,
                timeList:[],
                require_field:''
            }
        }
      },
      computed:{

      },
      watch: {
         
      },
      methods:{
        init (){
        	this.team_id = util.getLocalStorage('projectStorageInfo').team_id
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id
            this.getSetting()
        },
        //保存操作
        save(){
            let timeDate = []
            let isError = true
            this.myform.timeList.forEach((obj) => {
                let tempObj = {}
                if(obj.timeValue.getTime&&obj.timeValue.getTime()){
                  tempObj = obj.timeValue.toString().substr(16,5)
                  timeDate.push(tempObj)
                }else{
                  this.$message({
                    showClose: true,
                    message: '提醒时间不能为空，请选择时间',
                    type: 'warning'
                  });
                  return isError = false
                }
            })
            if(!isError){
               return
            }
            let ajaxData = {
                team_id: this.team_id,
                project_id: this.project_id,
                switch: this.myform.positionReport,
                trace_switch:this.myform.positionTrajectory,
                require_field: JSON.stringify(this.myform.require_field),
                remind_time:timeDate
            }
            // console.log(ajaxData)
            util.ajax({
                url: '/sign/project/deal',
                type:'POST',
                data:ajaxData,
                success: (res) => {
                    // console.log(res)
                    if(res&&res.errno==0){
                        if(res.data.set_result == true){
                            this.$message({
                              showClose: true,
                              message: '设置成功',
                              type: 'success'
                            });
                        }
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
        },
        //获取设置信息数据
        getSetting(){
            util.ajax({
                url: '/sign/project/setting',
                type:'GET',
                data: {
                    team_id: this.team_id,
                    project_id: this.project_id
                },
                success: (res) => {
                    // console.log(res)
                    if(res&&res.errno==0){
                       this.myform.positionReport = Number(res.data.setting_data.switch)
                       this.myform.positionTrajectory = Number(res.data.setting_data.trace_switch)
                       this.myform.require_field = res.data.setting_data.require_field
                       res.data.setting_data.remind_time.forEach( (item,index) => {
                            this.myform.timeList.push({
                                timeText:'提醒时间',
                                timeValue:new Date(2016, 9, 10, item.split(":")[0],item.split(":")[1])
                            })
                       })
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
        },
        //设置提醒时间格式化
        startRange(end_time){
            if(!end_time) return '00:00:00 - 23:59:59'
            end_time = end_time.getTime() - 30*60*1000
            return '00:00:00 - ' + util.getLocalTime(end_time,'HH:mm') + ':00'
        },
        //增加时间操作
        addTime(){
            this.myform.timeList.push({
                timeText:'提醒时间',
                timeValue:new Date(2016, 9, 10, 9, 0)
            })
        },
        //删除时间操作
        delateTime(index){
            this.myform.timeList.splice(index,1)
        }
      },
      mounted() {
          this.init()
      }
    }
</script>

<style>
#positionSet .my-setform .el-form-item__label{text-align: left;}
#positionSet .my-setform .el-radio__label{padding-left: 10px;}
#positionSet .my-setform .el-radio-group .el-radio{margin-right: 20px;}
#positionSet .my-setform .el-date-editor.el-input{float: left;}
#positionSet .my-setform .el-input__icon{cursor: pointer;}
#positionSet .my-setform .el-radio__inner{border: 1px solid #e0e6ed;}
#positionSet .my-setform .el-radio__input.is-checked .el-radio__inner{border-color: #6699ee;}
</style>
<style scoped>
html,body{background: #ffffff;}
#positionSet{
  padding: 0 20px;
  background-color: #ffffff;
}
.p-set-top{
    height: 54px;
    line-height: 20px;
    border-bottom: 1px solid #e0e6ed;
    margin-bottom: 40px;
}

/*发送时间提醒--部分*/
.set-type .send-time p{
  font-size: 14px;
  color: #99a9bf;
  margin-bottom: 8px;
}
.set-type .send-time .add-time-div{
    width: 428px;
    padding: 8px 20px;
    background-color: #f7f9fc;
    border-radius: 1px;
}
.set-type .send-time .add-time-div a{
  font-size: 14px;
  color: #6699ee;
  position: relative;
  margin-left: 184px;
}
.set-type .send-time .add-time-div a:active{color: #517ed6}
.set-type .send-time .add-time-div a i.addIcon{
  display: block;
  width: 13px;
  height: 13px;
  background-image:url(../assets/imgs/shareIcon/add_hover.svg);
  position: absolute;
  left: -18px;
  top: 3px;
}
.set-type .send-time .add-time-div .border-bottom{
  border-bottom: 1px solid #e0e6ed;
  margin-top: 12px;
  margin-bottom: 6px;
}
.set-type .send-time .add-time-div .time-list{
  overflow: hidden;
  position: relative;
}
.set-type .send-time .add-time-div .time-list .tit{
    font-size: 14px;
    text-align: left;
    color: #99a9bf;
    display: block;
    float: left;
    margin-right: 16px;
}
.set-type .send-time .add-time-div .time-list .delateIcon{
  display: block;
  width: 18px;
  height: 19px;
  background-image:url(../assets/imgs/delate.svg);
  position: absolute;
  right: 3px;
  top: 9px;
  cursor: pointer;
}
.set-type .send-time .add-time-div .time-list .delateIcon:hover{
    background-image:url(../assets/imgs/delate_hover.svg);
}
#positionSet .my-setform .tip{
	font-size: 14px;
	font-weight: normal;
	font-style: normal;
	font-stretch: normal;
	letter-spacing: normal;
	text-align: left;
	color: #99a9bf;
}

</style>

