<template>
    <div id="positionDetails" v-loading.body="pLoading">
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
            <div class="set-buttons" v-if="admins.sign_export">
            	<div class="btn-item export" @click="positionDialogVisible = true" :style="admins.invisible_man?'margin-right:0px;':''">
                  <i class="export-icon"></i>
                  <el-button type="text">导出报表</el-button>
              	</div>
              	<div class="btn-item set" @click="setPosition" v-if="!admins.invisible_man">
                  <i class="setico_svg"></i>
                  <el-button type="text">设置</el-button>
              	</div>
            </div>
    	</div>
    	<div class="count" >
    		  <div class="left">
    			   <h3 @click="goBack"><i class="el-icon-arrow-left" style="font-weight:600;"></i> 返回</h3>
             <ul v-if="personalInfo.sign_list.length">
                <li :class="{'deleted': personalInfo.member_status == -1}">
                    <img :src="personalInfo.sign_avatar" alt="" v-if="personalInfo.sign_avatar">
                    <div class="noavatar" v-else></div>
                    <div class="info">
                        <h4>{{personalInfo.sign_name}}</h4>
                        <h5>上报{{personalInfo.sign_count}}次</h5>
                    </div>
                </li>
              </ul>
              <div class="overflow-y" id="my-list">
                <div class="dl-list" v-for="(item,index) in personalInfo.sign_list">
                  <template v-if="item.sign_type == 0">
                    <dl @click="clickOpenDetails(index,item)">
                      <dt><img src="../assets/imgs/position/icon_list.svg" alt=""><i>{{computedIndex(item.create_at)}}</i></dt>
                      <dd>
                          <h4>{{item.form_data[0].value.addr_name}}</h4>
                          <h5>{{getLocalTime(item.create_at*1000)}}</h5>
                          <i class="el-icon-caret-bottom"></i>
                      </dd>
                    </dl>
                    <div class="items-details">
                        <template v-for="prem in item.form_data">
                            <div class="items" v-if="prem.type === 'Location'">
                                <h5>{{prem.title}}：</h5>
                                <p>{{prem.value.addr_name}}</p>
                                <p>{{prem.value.addr}}</p>
                            </div>
                            <div class="items" v-if="prem.type === 'SingleText'">
                                <h5>{{prem.title}}：</h5>
                                <p>{{prem.value||'未填写'}}</p>
                            </div>
                            <div class="items" v-if="prem.type === 'TextArea'">
                                <h5>{{prem.title}}：</h5>
                                <p>{{prem.value||'未填写'}}</p>
                            </div>
                            <div class="items" v-if="prem.type === 'Number'">
                                <h5>{{prem.title}}：</h5>
                                <p>{{prem.value||'未填写'}}</p>
                            </div>
                            <div class="items" v-if="prem.type === 'Select'">
                                <h5>{{prem.title}}：</h5>
                                <p>{{prem.value||'未填写'}}</p>
                            </div>
                            <div class="items" v-if="prem.type === 'Date'">
                                <h5>{{prem.title}}：</h5>
                                <p>{{prem.value||'未填写'}}</p>
                            </div>
                            <div class="items" v-if="prem.type === 'Imageview'">
                                <h5 v-if="prem.title">{{prem.title}}：</h5>
                                <div class="imgs" v-if="prem.pic_list.length">
                                    <!-- <template v-for="(pic,index) in prem.value.thumb_url">
                                        <img @click="bigImg(index,prem.value.url)" :src="pic" alt="">
                                    </template> -->
                                    <template v-for="(pic,index) in prem.pic_list">
                                        <img class="preview-img" @click="bigImg(index,prem.pic_list)" :src="pic.msrc" alt="">
                                    </template>
                                </div>
                                <p v-else>未填写</p>
                            </div>
                        </template>
                    </div>
                  </template>
                  <template v-else>
                    <dl style="cursor:auto;">
                      <dt style="margin-top:25px;"><img src="../assets/imgs/position/p_icon2.svg" alt=""></dt>
                      <dd>
                          <h4>扫码签到</h4>
                          <h5>{{getLocalTime(item.create_at*1000)}}</h5>
                          <!-- <i class="el-icon-caret-bottom"></i> -->
                      </dd>
                    </dl>
                  </template>
                </div>
              </div>
              <div class="empty" v-show="personalInfo.sign_list.length == 0">
                <span>暂无签到记录</span>
              </div>
    		  </div>
    	    <div class="right">
            <div id="container"></div>
            <div class="btns">
              <a href="javascript:;" class="big" @click="mapBig"><img src="../assets/imgs/position/big.svg" alt=""></a>
              <span class="line"></span>
              <a href="javascript:;" class="small" @click="mapSmall"><img src="../assets/imgs/position/small.svg" alt=""></a>
            </div>
          </div>
      </div>
    	
      <!-- 导出弹窗 -->
      <div class="position-dialog">
        <el-dialog
        title="导出报表"
        :visible.sync="positionDialogVisible"
        @close="resetForm('ruleForm')"
        size="tiny">
        <div class="my-form">
            <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="73px">
              <el-form-item label="开始日期" prop="start_time">
                  <el-date-picker
                    v-model="ruleForm.start_time"
                    :clearable="false"
                    :editable="false"
                    type="date"
                    placeholder="请选择">
                  </el-date-picker>
              </el-form-item>
              <el-form-item label="结束日期" prop="end_time">
                  <el-date-picker
                    v-model="ruleForm.end_time"
                    :clearable="false"
                    :editable="false"
                    type="date"
                    placeholder="请选择">
                  </el-date-picker>
              </el-form-item>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetForm('ruleForm')">取 消</el-button>
          <el-button type="primary" @click="positionDialogSubmint('ruleForm')">确 定</el-button>
        </span>
      </el-dialog>
      </div>

    </div>
  
</template>

<script>
  import * as util from '../assets/js/util.js'
  import SelectMemberGroupMulti from '@/components/common/SelectMemberGroupMulti'
  import pDefaultIcon from '@/assets/imgs/position/p_icon1.svg'
  import pSelectIcon from '@/assets/imgs/position/select.svg'
  let $ = require("jquery")
  let date = new Date()
  let today = util.formatData1(date)
  let map = ''
  let infoWindow = ''
  let lnglats = ''
  let marker = ''
  let showDate = []

  export default{
      name: 'positionDetails',
      components:{
      	SelectMemberGroupMulti
      },
      data:function(){
        var startTime = (rule,value,callback) => {
            if(!value) {
                return callback(new Error('请选择开始时间'));
            }else{
                if(value.getTime()<new Date().getTime()-365*24*60*60*1000){
                    return callback(new Error('不能选择1年以前的日期'));
                }else{
                        callback();
                }
            } 
        };
        var endTime = (rule,value,callback) => {
            var sumDays = ''
            if(!value) {
                return callback(new Error('请选择结束时间'));
            }else{
                if(util.getStampFromDateStr(new Date()) < util.getStampFromDateStr(value)){
                    return callback(new Error('不能选择当日以后的日期'));
                }else{
                    sumDays = util.DateDiff(util.formatData1(this.ruleForm.start_time),util.formatData1(value))
                    if(util.getStampFromDateStr(this.ruleForm.start_time) > util.getStampFromDateStr(value)){
                      return callback(new Error('结束时间不能小于开始时间'));
                    }else if(sumDays > 30){
                      return callback(new Error('导出时间范围不能超过一个月'));
                    }else{
                      callback();
                    }
                }
            }
        };
        return{
            pickerOptions: {
              disabledDate(time) {
                return time.getTime() > Date.now();
              }
            },
          	admins:{
          		sign_export:false,
                invisible_man: false
          	},
            pLoading:false,
            positionDialogVisible:false,
            isOpen:false,
            currInfoData:'',
            oldMarker:[],
            team_id:'',
            project_id:'',
            all_groups:[],
            selected_members_groups:[],
            pmtime:'',
            oldTime:'',
            personalInfo:{
                sign_avatar:'',
                sign_name:'',
                sign_count:'',
                sign_list:[],
                member_status: 0
            },
            ruleForm:{
              start_time: new Date(),
              end_time: new Date(),
            },
            rules: {  //日期验证规则
                start_time: [
                    { validator: startTime, trigger: 'change' }
                ],
                end_time:[
                    { validator: endTime, trigger: 'change' }
                ]
            }
        }
      },
      computed:{

      },
      watch: {
         
      },
      methods:{
        init (){
            $('.count').height($(window).height() - 60 - 54)
            $(window).resize(() => {
                $('.count').height($(window).height() - 60 - 54)
            })
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id

            //因为位置监控首页的头部部分和详情页的头部部分保持一致，估做如下操作即可
            this.currInfoData = util.getLocalStorage('currInfoData')
            if(this.currInfoData){ //如果缓存有值，则取缓存里的数据展示;
                this.selected_members_groups = this.currInfoData.selected_members_groups
                this.pmtime = this.currInfoData.pmtime
                this.oldTime = this.currInfoData.pmtime
                this.admins.sign_export = this.currInfoData.sign_export
                this.admins.invisible_man = this.currInfoData.invisible_man
                this.all_groups = this.currInfoData.all_groups
            }
            setTimeout(() => {
              this.getPersonalInfo()
            },0)
        },
        bigImg(index,list){
            let option = {
              bgOpacity: .8,
              // escKey: false,
              fullscreenEl: false,
              shareEl: false,
              showAnimationDuration: 0,
              hideAnimationDuration: 0
            }
            console.log(list)
            console.log(index)
            console.log(list[index])
            setTimeout(() => {
              this.$preview.open(index, list, option)
              $('.pswp').css('z-index', 9999998)
            },100)
        },
        mapBig(){
          map.zoomIn()
        },
        mapSmall(){
          map.zoomOut()
        },
        computedIndex(create_at){
          return showDate.indexOf(create_at)+1
        },
        //地图上坐标展示
        getMap(strData){
            map = new AMap.Map("container", {
                resizeEnable: true,
                zoom: 10
            });
            infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});
            lnglats = [];
            showDate = []
            strData.sign_list.forEach( (obj1,index) => {
                if(obj1.sign_type == 0){
                  showDate.push(obj1.create_at)
                  obj1.form_data.forEach( (obj2) => {
                      if(obj2.type === "Location"){
                          lnglats.push([obj2.value.lng,obj2.value.lat])
                      }
                  })
                }else{//扫码签到 不打点

                }
            })
            for (var i = 0; i < lnglats.length; i++) {
                marker = new AMap.Marker({
                    position: lnglats[i],
                    content:'<div class="pDefaultIcon" style="background:url('+pDefaultIcon+') no-repeat center bottom;width: 36px;height:47px;line-height:54px;text-align:center;color:#ffffff;font-size:13px;font-weight:600;">'+(i+1)+'</div>',
                    map: map,
                    offset: new AMap.Pixel(-2, -47)
                });
                marker.content = this.getLocalTime(showDate[i]*1000);
                marker.index = i;
                marker.on('click', this.markerClick);
                marker.emit('click', {target: marker});
                this.oldMarker.push(marker)
            }
            
            map.setFitView();
            map.zoomOut();
        },
        //地图上坐标点击操作
        markerClick(e) {
            
            if(e.target.pre && e.target.pre == 99){
              // console.log(e.target.lnglat)
              map.setCenter([e.target.lnglat.lng,e.target.lnglat.lat])
                infoWindow.setContent(e.target.content);
                infoWindow.open(map, e.target.getPosition());
                $('.pDefaultIcon').removeClass('pSelectIcon')
                // $('.pDefaultIcon').eq(e.target.index).addClass('pSelectIcon')
                $('.amap-marker').css({
                  'z-index': 100
                })
                $('.pDefaultIcon').each(function(){
                  if(e.target.index+1 == $(this).text()){
                    $(this).addClass('pSelectIcon')
                    $(this).parent().parent().css({
                      'z-index': 120
                    })
                  }
                })
            }
            if(e.lnglat){
              // console.log(e.lnglat)
                map.setCenter([e.lnglat.lng,e.lnglat.lat])
                infoWindow.setContent(e.target.content);
                infoWindow.open(map, e.target.getPosition());
                $('.pDefaultIcon').removeClass('pSelectIcon')
                // $('.pDefaultIcon').eq(e.target.index).addClass('pSelectIcon')
                $('.amap-marker').css({
                  'z-index': 100
                })
                $('.pDefaultIcon').each(function(){
                  if(e.target.index+1 == $(this).text()){
                    $(this).addClass('pSelectIcon')
                    $(this).parent().parent().css({
                      'z-index': 120
                    })
                  }
                })
                if($('.dl-list dl').find('.el-icon-caret-bottom').eq(e.target.index).hasClass('show')){
                    
                }else{
                    $('.dl-list dl').find('i').removeClass('show')
                    $('.dl-list dl').removeClass('background')
                    $('.dl-list dl').find('.el-icon-caret-bottom').eq(e.target.index).addClass('show')
                    $('.dl-list dl').eq(e.target.index).addClass('background')
                    $('.items-details').slideUp(200)
                    $('.items-details').eq(e.target.index).slideDown(200)
                }
            }
        },
        //导出确定按钮
        positionDialogSubmint(formName){
          this.$refs[formName].validate((valid) => {
            if (valid) {
              util.isOnline(() => {
                  let href='/sea/api/1.0/client/v1/sign/project/exportsign?dmclient=pcweb&team_id='+this.team_id+'&project_id='+this.project_id+'&start_date='+util.getStampFromDateStr(this.ruleForm.start_time)+'&end_date='+util.getStampFromDateStr(this.ruleForm.end_time)+'&userid_list='
                  util.locationHref(href)   
                  this.$message({
                      showClose: true,
                      message: '导出成功',
                      type: 'success'
                  });
                  this.positionDialogVisible = false
              }, () => {
                  this.$message({
                      showClose: true,
                      message: '网络连接失败，请检查网络',
                      type: 'warning'
                  });
              })
            } else {
              console.log('error submit!!');
              return false;
            }
          });
        },
        resetForm(formName){
          this.$refs[formName].resetFields();
          this.positionDialogVisible = false
        },
        //去往设置位置监控页
        setPosition(){
          this.$router.replace('positionset')
        },
        //左侧详情列表展开、收起操作，相对应在地图上的展示操作
        clickOpenDetails(index,item){
          // console.log(item)
            index = showDate.indexOf(item.create_at)
            this.oldMarker[index].offset = new AMap.Pixel(-2, -47)
            this.oldMarker[index].content = this.getLocalTime(item.create_at*1000)
            this.oldMarker[index].index = index;
            this.oldMarker[index].pre = '99';
            this.oldMarker[index].lnglat = {
              lng: item.form_data[0].value.lng,
              lat: item.form_data[0].value.lat
            };
            this.oldMarker[index].on('click', this.markerClick);
            this.oldMarker[index].emit('click', {target: this.oldMarker[index]});
            // console.log(index)
           
            if($('.dl-list dl').find('.el-icon-caret-bottom').eq(index).hasClass('show')){
                $('.dl-list dl').find('i').removeClass('show')
                $('.dl-list dl').removeClass('background')
                $('.items-details').eq(index).slideUp(200)
                map.clearInfoWindow();
                $('.pDefaultIcon').removeClass('pSelectIcon')
            }else{
                $('.dl-list dl').find('i').removeClass('show')
                $('.dl-list dl').removeClass('background')
                $('.dl-list dl').find('.el-icon-caret-bottom').eq(index).addClass('show')
                $('.dl-list dl').eq(index).addClass('background')
                $('.items-details').slideUp(200)
                $('.items-details').eq(index).slideDown(200)
            }
        },
        //获取用户位置监控详情信息
        getPersonalInfo(){
            this.pLoading = true
            util.ajax({
                url: '/sign/manager/statistics/singlesign',
                type:'GET',
                data: {
                    team_id: this.team_id,
                    project_id: this.project_id,
                    sign_userid: this.currInfoData.currUserInfo.user_id,
                    date:this.pmtime ? this.pmtime : today
                },
                success: (res) => {
                    console.log('位置上报个人详情')
                    console.log(res)
                    this.pLoading = false
                    if(res&&res.errno==0){
                        marker = ''
                        this.personalInfo.sign_avatar = res.data.sign_avatar
                        this.personalInfo.sign_name = res.data.sign_name
                        this.personalInfo.sign_count = res.data.sign_count
                        this.personalInfo.member_status = res.data.member_status
                        res.data.sign_list.forEach((obj1, att_index) => {
                          obj1.form_data = obj1.form_data ? obj1.form_data : []
                          obj1.form_data.forEach((obj2) => {
                            if(obj2.type === 'Imageview'){
                              obj2.pic_list = []
                              obj2.value.url.forEach((url, index) => {
                                let tempObj = {}
                                tempObj.src = url
                                tempObj.msrc = obj2.value.thumb_url[index]
                                let image = new Image();
                                image.src = url
                                image.onload = function(){
                                  tempObj.w = image.width
                                  tempObj.h = image.height
                                }
                                obj2.pic_list.push(tempObj)
                              })
                            }
                          })
                        })
                        this.personalInfo.sign_list = res.data.sign_list
                        this.getMap(res.data)
                    }else{
                        this.pLoading = false
                        this.$message({
                          showClose: true,
                          message: res.errmsg,
                          type: 'warning'
                        });
                    }
                },
                error: (xhr, status) => {
                    this.pLoading = false
                    this.$message({
                      showClose: true,
                      message: '网络连接失败，请检查网络',
                      type: 'warning'
                    });
                },
                noNetwork: () => {
                    // 网络超时
                    this.pLoading = false
                    this.$message({
                      showClose: true,
                      message: '网络连接失败，请检查网络',
                      type: 'warning'
                    });
                }
            })
        },
        //日期格式化“分秒”
        getLocalTime(timestr){
            return util.getLocalTime(timestr, 'HH:mm')
        },
        //时间搜索--展示对应时间下的显示内容
        onPmTimeChange(val){
        	this.pmtime = val
          lnglats = []
          marker = ''
          this.oldMarker = []
          $('.dl-list dl').find('i').removeClass('show')
          $('.dl-list dl').removeClass('background')
          $('.items-details').slideUp(200)
          this.getPersonalInfo()
        },
        //返回操作--因为头部部分和位置监控首页要保持一致，估做如下操作即可
        goBack(){
          let backInfoData = {
            pmtime:this.pmtime,
            selected_members_groups:this.selected_members_groups
          }
          util.setLocalStorage('backInfoData',backInfoData)
          this.$router.replace('positionmonitor')
          
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
            let backInfoData = {
                pmtime:this.pmtime,
                selected_members_groups:this.selected_members_groups
            }
            util.setLocalStorage('backInfoData',backInfoData)
            this.$router.replace('positionmonitor') 
        }
      },
      mounted() {
          this.init()
      }
    }
</script>

<style>
/* 地图 */
.amap-info-close{
  display: none;
}
.pSelectIcon{
   background:url(../assets/imgs/position/select.svg) no-repeat !important;
   width: 36px !important;
   height:47px !important;
   line-height:32px !important;
   padding-left:1px !important;
   text-align:center !important;
   color:#ffffff !important;
   font-size:13px !important;
   font-weight:600 !important;
   z-index: 99999 !important;
}
.amap-simple-marker-position-point{display: none!important;}
.my-svg-marker{
    width: 30px;
    height: 36px;
    display: block;
    background: url(../assets/imgs/position/select.svg) no-repeat;
}
#positionDetails .amap-info-content{
    width: 88px;
    height: 45px;
    background-color: #ffffff;
    box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
    border:none;
    padding:0;
    line-height: 45px;
    text-align: center;
    font-size: 15px;
    color: #1f2d3d;
}
#positionDetails .amap-info-sharp{
  background-image:url(../assets/imgs/position/sj_icon.svg);
  background-repeat: no-repeat;
  width: 13px;
  height: 10px;
}
#positionDetails .time .el-input__inner{height: 28px;}
#positionDetails .top-div .set-buttons .btn-item span{font-size: 13px;}
#positionDetails .el-dialog--tiny{width: 400px;}
#positionDetails .my-form{
  padding: 0 40px;
  margin-top: 40px;
  margin-bottom: 40px;
}
#positionDetails .position-dialog .my-form .el-form-item{margin-bottom: 16px;}
#positionDetails .position-dialog .my-form .el-date-editor.el-input{width: 248px;}
#positionDetails .position-dialog .my-form .el-form-item__label{text-align: left;}
#positionDetails .position-dialog .el-dialog__footer{
  border-top: 1px solid #e0e6ed;
  padding-top: 16px;
}
#positionDetails .position-dialog .el-form-item__error{
  position: static;
  margin-bottom: -7px;
}
</style>
<style scoped>
.top-div{
	padding: 0 20px;
	height: 54px;
	line-height: 54px;
	background-color: #ffffff;
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
	background-image:url(../assets/imgs/shareIcon/export.svg);
	position: absolute;
  left: -16px;
  top: 20px;
}
.setico_svg{
	position: absolute;
  left: -16px;
  top: 20px;
}

.count{
	position: relative;
  clear: both;
}
.count .left{
  float: left;
  width: 220px;
  height: 100%;
  background-color: #fafafa;
  box-shadow: 2px 2px 4px 0 rgba(225, 225, 225, 0.5);
  overflow-y: auto;
  position: relative;
  z-index: 1;
}
.count .right{
  float: right;
  height: 100%;
  width: calc(100% - 220px);
  position: relative;
}
.count .right #container{
  height: 100%;
  width: 100%;
  float: right;
}
.count .right .btns{
  width: 32px;
  height: 61px;
  background:#ffffff;
  position: absolute;
  right: 16px;
  bottom: 16px;
  border-radius: 2px;
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
  z-index: 99;
  padding: 1.5px 0;
}
.count .right .btns a{
  display: block;
  height: 30px;
  width: 32px;
  margin: 0 auto;
}
.count .right .btns a img{
  display: block;
  margin: 0 auto;
  padding-top: 8px;

}
.count .right .btns .line{
  margin: 0 auto;
  display: block;
  width: 24px;
  height: 1px;
  background-color: #e0e6ed;
}
.count .left .empty{
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: 45px;
  margin-left: -50px;
}
.count .left .empty span{
  font-size: 16px;
  color: #c0ccda;
}
.count .left h3{
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  color: #6699ee;
  cursor: pointer;
  height: 46px;
  line-height: 46px;
  padding: 0 20px;
}
.count .left .overflow-y{
  width: 220px;
  overflow-y: auto;
  height: calc(100% - 46px - 71px);
  overflow-x:hidden;
}
/*@media screen and (max-width: 1200px) {
  .count .left .overflow-y{
    height: 75%;
  }
}
@media screen and (max-width: 1100px) {
  .count .left .overflow-y{
    height: 72%;
  }
}
@media screen and (max-width: 1000px) {
  .count .left .overflow-y{
    height: 72%;
  }
}
@media screen and (max-width: 900px) {
  .count .left .overflow-y{
    height: 68%;
  }
}*/
.count .left ul,dl{
  height: 70px;
  padding: 0 20px;
  position: relative;
  cursor: pointer;
  border-bottom: 1px solid #e0e6ed;
}
.count .left dl.background{background-color: #ffffff;}
.count .left dl:hover{background-color: #ffffff;}
.count .left ul li{
    position: relative;
}
.count .left ul li.deleted:after{
    content: '已离职';
    display: block;
    position: absolute;
    width: 36px;
    height: 36px;
    background-color: #000;
    opacity: .5;
    left: 0;
    top: 16px;
    font-size: 10px;
    color:#fff;
    border-radius: 50%;
    line-height: 36px;
    text-align: center;
}
.count .left ul li img{
  width: 36px;
  height: 36px;
  border-radius: 36px;
  float: left;
  margin-top: 16px;
  margin-right: 14px;
}
.count .left ul li .noavatar{
  width: 36px;
  height: 36px;
  float: left;
  margin-top: 16px;
  margin-right: 14px;
  background: url(../assets/imgs/avatar.png) no-repeat center;
  background-size: contain;
}

.count .left ul li .info,dl dd{
  float: left;
}
.count .left ul li .info h4{
  font-size: 14px;
  color: #475568;
  margin-bottom: 8px;
  margin-top: 18px;
}
.count .left ul li .info h5,dl dd h5{
  clear: both;
  font-size: 12px;
  line-height: 1.33;
  text-align: left;
  color: #99a9bf;
}
.count .left dl{
  height: 60px;
}
.count .left dl dt{
  float: left;
  margin-top: 17px;
  margin-right: 9px;
  position: relative;
}
.count .left dl dt i{
  position: absolute;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #ffffff;
  top: 5px;
  /*left: 7.5px;*/
  left: 50%;
  transform: translateX(-50%);
}
.count .left dl dd {position: relative;}
.count .left dl dd h4{
  font-size: 14px;
  color: #475568;
  margin-bottom: 4px;
  margin-top: 16px;
  width: 131px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.count .left dl dd i{
  font-size: 10px;
  color: #c0ccda;
  position: absolute;
  right: -18px;
  top: 25px;
}
.count .left .dl-list{
  position: relative;
}
.count .left .dl-list .items-details{
    background-color: #ffffff;
    width: 180px;
    padding: 12px 20px 0px 20px;
    display: none;
    overflow: hidden;
    border-bottom: 1px solid #e0e6ed;
}
.count .left .dl-list .items-details .items{
  margin-bottom: 12px;
}
.count .left .dl-list .items-details .items h5{
  font-size: 12px;
  text-align: left;
  color: #99a9bf;
  margin-bottom: 6px;
}
.count .left .dl-list .items-details .items p{
  font-size: 12px;
  text-align: left;
  color: #475568;
  line-height: 20px;
}
.count .left .dl-list .items-details .items .imgs{overflow: hidden;}
.count .left .dl-list .items-details .items .imgs img{
  width: 52px;
  height: 52px;
  float: left;
  margin: 6px 4px;
  cursor: pointer;
}
.count .left .dl-list .is-reverse{
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
 .count .left .dl-list i{
  transition: all ease .3s;
}
.count .left .dl-list i.show{
  transform-origin:50% 50%;
  transform: rotate(180deg);
}

  /*大图预览插件*/
.pswp{
  z-index: 9999999;
}

</style>

