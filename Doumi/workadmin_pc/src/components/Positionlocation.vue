<template>
    <div id="positionLocation" v-loading.body="pLoading">
      <div class="head">
          <h1>位置监控</h1>
          <div class="sel_item">
              <span>筛选：</span>
              <el-button  @click="openGroupSelecter"  class="select_member" style="position:relative;min-width:121px;text-align: left;height:28px;line-height: 6px;padding-left:10px;padding-right:33px;">{{selected_members_groups.length ? computedMemberGroup() : '全部人员'}}<i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 8px;color: #d3dce6;"></i></el-button>
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
          <div class="checkbox">
              <el-checkbox @change="onCheckboxChange" v-model="checked">只展示最新位置</el-checkbox>
          </div>
          <div class="set-buttons" v-if="admins.sign_export">
              <div class="btn-item export" @click="positionDialogVisible = true">
                <i class="export-icon"></i>
                <el-button type="text">导出报表</el-button>
              </div>
              <div class="btn-item set" @click="setPosition"  v-if="!admins.invisible_man">
                <i class="setico_svg"></i>
                <el-button type="text">设置</el-button>
              </div>
          </div>
          <div class="isOpenPositionTip" v-if="isOpenPosition">
              <p>已开启位置上报！更多功</p>
              <p>能，点击这里进行设置哦！</p>
              <a href="javascript:;" @click="closeTip">知道了</a>
          </div>
      </div>  

      <div class="myCount" >
          <div class="left" id="leftDiv">
              <h2>已上报&nbsp;&nbsp;&nbsp;<b>{{sign_count}}</b><span>/{{post_user_id.length}}</span></h2>
              <div class="member-list"> 
                  <template v-for="item in signListData">
                      <dl @click="getUserDetails(item)" :class="{'curr-selest-active':isSelect == item.user_id}">
                          <dt :class="{'deleted': item.member_status == -1}">
                              <img :src="item.avatar" alt="" v-if="item.avatar">
                              <div class="noavatar" v-else></div>
                          </dt>
                          <dd>
                              <h3><span>{{item.name}}</span>上报{{item.today_sign_count}}次</h3>
                              <h4>最近上报：{{getLocalTime(item.sign_time*1000)}}</h4>
                          </dd>
                      </dl>
                  </template>
              </div>
              <div class="empty" v-show="signListData.length == 0">
                  <span>暂无已上报人员</span>
              </div>
          </div>

          <div class="right">
            <div id="container"></div>
            <div class="look-all" @click="setMapContent('isLookAllBtn')" v-if="isLookAll">查看全部</div>
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

      <!-- 未开启定位弹层提示 -->
      <div class="dialog-backgroud" v-if="dialogPositionIsOpen && !admins.invisible_man && admins.sign_export">
        <div class="positionIsOpen-dialog">
        <div class="tip-text">
            <p>开启后可收集员工地理位置并实时查看</p>
        </div>
        <div @click="openPosition">
            <el-button class="openbtn">开 启</el-button>
          </div>
        </div>
      </div>

    </div>
  
</template>

<script>
  import * as util from '../assets/js/util.js'
  import SelectMemberGroupMulti from '@/components/common/SelectMemberGroupMulti'
  //import pDefaultIcon from '@/assets/imgs/position/p_icon1.svg'
  import pDefaultIcon from '@/assets/imgs/position/pd_icon.svg'
  import pDefaultIconNum from '@/assets/imgs/position/pd_num_icon.svg'
  import pSelectIcon from '@/assets/imgs/position/pd_icon_hover.svg'
  let $ = require("jquery")
  let date = new Date()
  let today = util.formatData1(date)
  let map = ''
  let infoWindow = ''
  let lnglats = ''
  let marker = ''
  let showDate = []
  let markers = []
  let obj = ''
  let $this =''


  let details_field1 = ''
  let details_field3 = ''
  let details_field4 = ''
  let details_field5 = ''
  let details_field6 = ''
  let details_field7 = ''
  let details_myimgs = ''
  let details_myinfo = ''
  let pic_list = []
  let big_num = 0
  let alldels = ''
  let fieldlist2 = ''
  let count2 = ''
  let count = ''
  var userInfo = ''
  let currUserId = ''
  let currAddress = ''
  let currSigntime = ''

  export default{
      name: 'positionLocation',
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
            team_id:'',
            project_id:'',
            /*顶部导航栏部分*/
            admins:{
                sign_export:false,
                invisible_man: false
            },
            pLoading:false,
            isSelect:false,
            checked: true,
            isLookAll:false,
            positionDialogVisible:false,
            dialogPositionIsOpen:false,
            isOpenPosition:false,
            all_groups:[],
            selected_members_groups:[],
            pmtime: new Date(),
            item:'',
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
            },
            require_field: [],//保存已设置字段信息
             /*内容部分*/
            userid_list:[],
            sign_count:'',
            sumCount:'',
            post_user_id:[],
            signListData:[],
            allUserId:[],
            key_time:'',
            list:[],
            require_field:[],
            mapPoingArray:[]
        }
      },
      computed:{

      },
      watch: {
         
      },
      methods:{
        init (){
            $this = this
            $('.myCount').height($(window).height() - 60 - 60)
            $(window).resize(() => {
                $('.myCount').height($(window).height() - 60 - 60)
            })
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id
            //获取人员小组列表数据
            this.getMemberGroup()
            //获取权限 
            this.permission()
            //获取设置信息数据
            this.getSetting()
            //获取当前用户下级所有人员的user_id
            this.getUserAdminMember() 
        },
        //去往设置位置监控页
        setPosition(){
          this.$router.replace('positionset')
        },
        addClick(){
            let allImg = $('.pic img')
            for(var i=0;i<allImg.length;i++){
              allImg[i].onclick = function(){
                let index = this.getAttribute('data-index')
                let option = {
                  bgOpacity: .8,
                  // escKey: false,
                  fullscreenEl: false,
                  shareEl: false,
                  showAnimationDuration: 0,
                  hideAnimationDuration: 0
                }
                let tempArr = []
                pic_list.forEach((obj,i) => {
                  tempArr[obj.imgIndex] = obj
                })

                console.log('pic_list',tempArr)
                $this.$preview.open(parseInt(index),tempArr, option)
                $('.pswp').css('z-index', 9999998)
              }
            }
        },
        showLastSigin(){
          this.isSelect = ''
          setTimeout(()=>{
            let list = this.signListData
            map.clearMap();  // 清除地图覆盖物
            this.isLookAll = false
            let lastLng = []
            let marker3 = ''
            let field1 = ''
            let field2 = ''
            let field2_span = ''
            let myimgs = ''
            let field3 = ''
            let field4 = ''
            let field5 = ''
            let field6 = ''
            let field7 = ''
            let count = ''
            let fieldlist = ''
            let alldata = ''
            let showdels = ''
            let userInfo = ''
            let newObj = []
            let that = this.mapPoingArray[i]
            let _this = this
            let currUserId = ''
            let currAddress = ''
            let currSigntime = ''
            let arr = []
            let ast = ''
            alldels = ''
            this.signListData.forEach((obj1) =>{
              obj1.form_data.forEach((obj2) =>{
                if(obj2.type === 'Location'){
                  lastLng.push(obj2.value)
                }
              })
            })
            for(var i = 0;i<lastLng.length;i++){
              for(var j = i+1;j<lastLng.length;){
                if(lastLng[i].addr_name+lastLng[i].addr == lastLng[j].addr_name+lastLng[j].addr){
                  lastLng.splice(j,1)
                }else{
                  j++
                }
              }
            }
            for(var i = 0;i<lastLng.length; i++){
              marker3 = new AMap.Marker({
                  content:'<div class="pDefaultIcon" data-index="'+i+'" style="background:url('+pDefaultIcon+') no-repeat center bottom;width: 30px;height:47px;line-height:54px;text-align:center;color:#ffffff;font-size:13px;font-weight:600;""></div>',
                  map: map,
                  offset: new AMap.Pixel(-17, -40),
                  position:[lastLng[i].lng,lastLng[i].lat]  
              });
              marker3.index = i
              marker3.content = ''
              marker3.adds = lastLng[i].addr_name+'('+lastLng[i].addr+')'
              marker3.on('click', function(e){
                fieldlist = ''
                arr = []
                myimgs = ''
                details_myimgs = ''
                list.forEach((obj1)=>{
                  obj1.form_data.forEach((obj2)=>{
                    if(obj2.type === 'Location'){
                      if(e.target.adds == obj2.value.addr_name+'('+obj2.value.addr+')'){
                        arr.push(obj1)
                      }
                    }
                  })
                })
                if(arr.length == 1){
                  $this.getHtmlOnce('',arr)
                  alldels = '<div class="alldels">'+details_myinfo+details_field3+details_field4+details_field5+details_field6+details_field7+details_myimgs+'</div>'
                  count = details_field1 + '<div class="info-content">'+alldels+'</div>'+'<div class="icons"><i class="sj_icon"></i></div>'
                  e.target.content = count
                  setTimeout(()=>{
                    $('#close_icon').click(function(event){
                      map.clearInfoWindow();
                      $('.pDefaultIcon').removeClass('pSelectIcon')

                    })
                    // let allImg = $('.pic img')
                    //   for(var i=0;i<allImg.length;i++){
                    //     allImg[i].onclick = function(){
                    //       let index = this.getAttribute('data-index')
                    //       let option = {
                    //         bgOpacity: .8,
                    //         // escKey: false,
                    //         fullscreenEl: false,
                    //         shareEl: false,
                    //         showAnimationDuration: 0,
                    //         hideAnimationDuration: 0
                    //       }
                    //       var sortBy = function (filed, rev, primer) {
                    //           rev = (rev) ? -1 : 1;
                    //           return function (a, b) {
                    //               a = a[filed];
                    //               b = b[filed];
                    //               if (typeof (primer) != 'undefined') {
                    //                   a = primer(a);
                    //                   b = primer(b);
                    //               }
                    //               if (a < b) { return rev * -1; }
                    //               if (a > b) { return rev * 1; }
                    //               return 1;
                    //           }
                    //       };
                    //       let imgarr = pic_list.sort(sortBy('index', false, parseInt))
                    //       console.log(imgarr)
                    //       $this.$preview.open(parseInt(index),imgarr, option)
                    //       $('.pswp').css('z-index', 9999998)
                    //     }
                    //   }
                  },100)
                }else{
                  count = ''
                  list.forEach((obj1)=>{
                    obj1.form_data.forEach((obj2)=>{
                      if(obj2.type === 'Location'){
                        if(e.target.adds == obj2.value.addr_name+'('+obj2.value.addr+')'){
                          field1= '<div class="info-title"><p>'+obj2.value.addr_name+'('+obj2.value.addr+')</p><i id="close_icon" class="close_icon el-dialog__close el-icon el-icon-close"></i></div>'
                          fieldlist += '<div class="info-list" data-signtime="'+obj1.sign_time+'"  data-user-id="'+obj1.user_id+'" data-address="'+obj2.value.addr_name+'('+obj2.value.addr+')'+'"><h2>'+obj1.name+'<span>'+util.getLocalTime(obj1.sign_time*1000, 'HH:mm')+'</span><i class="el-icon-arrow-right"></i></h2></div>'
                        }
                      }
                    })
                  })
                  setTimeout( () =>{
                    var all = $('.info-list')
                    //关闭信息窗体
                    $('#close_icon').click(function(event){
                        if($('.showdels').css('display') === 'none'){
                           map.clearInfoWindow();
                           $('.pDefaultIcon').removeClass('pSelectIcon')
                        }else{
                          $('.info-list').slideDown(200)
                          $('.showdels').slideUp(200)
                        }
                    })
                    for(var i=0;i<all.length;i++){
                      all[i].onclick = function(){
                          field3 = ''
                          field4 = ''
                          field5 = ''
                          currUserId = this.getAttribute('data-user-id')
                          currAddress = this.getAttribute('data-address')
                          currSigntime = this.getAttribute('data-signtime')
                          $('.info-list').slideUp(100)
                          $('.showdels').slideDown(100)
                           list.forEach( (pre) => {
                            if(pre.user_id == currUserId){
                                pre.form_data.forEach( (str) => {
                                  if(str.type === 'Location'){
                                    if(currAddress === str.value.addr_name+'('+str.value.addr+')' && currSigntime == pre.sign_time){
                                      userInfo = '<div class="user-info"><h2>'+pre.name+'<span class="user-time" >'+util.getLocalTime(pre.sign_time*1000, 'HH:mm')+'</span></h2></div>'
                                      pre.form_data.forEach( (s) => {
                                        switch(s.type){
                                          case "SingleText":
                                            if(s.value){
                                              field3 = '<div class="field3"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field3 = '<div class="field3"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break;
                                          case "TextArea":
                                            if(s.value){
                                              field4 = '<div class="field4"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field4 = '<div class="field4"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break;
                                          case "Number":
                                            if(s.value){
                                              field5 = '<div class="field5"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field5 = '<div class="field5"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break;
                                          case "Select":
                                            if(s.value){
                                              field6 = '<div class="field6"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field6 = '<div class="field6"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break; 
                                          case "Date":
                                            if(s.value){
                                              field7 = '<div class="field7"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field7 = '<div class="field7"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break; 
                                          case "Imageview":
                                            var imgdiv = ''
                                            pic_list = []
                                            big_num = 0
                                            for(var i=0;i<s.value.url.length;i++){
                                              let tempObj = {}
                                              tempObj.imgIndex = i
                                              tempObj.src = s.value.url[i]
                                              tempObj.msrc = s.value.thumb_url[i]
                                              let image = new Image();
                                              image.src = s.value.url[i]
                                              image.onload = function(){
                                                tempObj.w = image.width
                                                tempObj.h = image.height
                                                pic_list.push(tempObj)
                                                big_num ++
                                                if(big_num == s.value.url.length){
                                                  $this.addClick()
                                                }
                                              }
                                              console.log(pic_list)
                                              imgdiv += '<div class="pic"><img data-url="'+s.value.url[i]+'" class="preview-img" data-index="'+i+'" src="'+s.value.thumb_url[i]+'" alt="" /></div>'
                                            }
                                            if(s.value.url.length != 0){
                                              myimgs = '<div class="myimgs"><span class="title" >'+s.title+'</span><div class="imgbox">'+imgdiv+'</div></div>'
                                            }
                                          break; 
                                        }
                                      })
                                      
                                    }
                                  }
                                  
                                })
                            }
                          })
                          $('.showdels').html(userInfo+field3+field4+field5+field6+field7+myimgs)
                          if($('.showdels').show()){
                            // setTimeout(()=>{
                            //   let allImg = $('.pic img')
                            //   for(var i=0;i<allImg.length;i++){
                            //     allImg[i].onclick = function(){
                            //       let index = this.getAttribute('data-index')
                            //       let option = {
                            //         bgOpacity: .8,
                            //         // escKey: false,
                            //         fullscreenEl: false,
                            //         shareEl: false,
                            //         showAnimationDuration: 0,
                            //         hideAnimationDuration: 0
                            //       }
                            //       var sortBy = function (filed, rev, primer) {
                            //           rev = (rev) ? -1 : 1;
                            //           return function (a, b) {
                            //               a = a[filed];
                            //               b = b[filed];
                            //               if (typeof (primer) != 'undefined') {
                            //                   a = primer(a);
                            //                   b = primer(b);
                            //               }
                            //               if (a < b) { return rev * -1; }
                            //               if (a > b) { return rev * 1; }
                            //               return 1;
                            //           }
                            //       };
                            //       let imgarr = pic_list.sort(sortBy('index', false, parseInt))
                            //       console.log(imgarr)
                            //       $this.$preview.open(parseInt(index),imgarr, option)
                            //       $('.pswp').css('z-index', 9999998)
                            //     }
                            //   }
                            // },500)
                          }
                      }
                    }
                  },100)
                  showdels = '<div class="showdels"></div>'
                  alldata = '<div class="alldata">'+fieldlist+showdels+'</div>'
                  count = field1 + '<div class="info-content">'+alldata+'</div>'+'<div class="icons"><i class="sj_icon"></i></div>'
                  e.target.content = count
                }
                if(e.lnglat){
                  map.setCenter([e.lnglat.lng,e.lnglat.lat])
                  infoWindow.setContent(e.target.content);
                  infoWindow.open(map, e.target.getPosition());
                  $('.pDefaultIcon').removeClass('pSelectIcon')
                  $('.amap-marker').css({
                    'z-index': 100
                  })
                  for(var i = 0;i<$('.pDefaultIcon').length;i++){
                    if(e.target.index == $('.pDefaultIcon').eq(i).attr('data-index')){
                      $('.pDefaultIcon').eq(i).addClass('pSelectIcon')
                      $('.pDefaultIcon').eq(i).parent().parent().css({
                        'z-index': 120
                      })
                    }
                  }
                }
              })
            }
            map.setFitView();
          },100)
        },
        getHtmlOnce(item,arr){
          arr.forEach((obj1) => {
            obj1.form_data.forEach((obj2)=>{
              switch(obj2.type){
                case "Location":
                  details_field1= '<div class="info-title"><p>'+obj2.value.addr_name+'('+obj2.value.addr+')</p><i id="close_icon" class="close_icon el-dialog__close el-icon el-icon-close"></i></div>'
                break;
                case "SingleText":
                  if(obj2.value){
                    details_field3 = '<div class="details_field3"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                  }else{
                    details_field3 = '<div class="details_field3"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                  }
                break;
                case "TextArea":
                  if(obj2.value){
                    details_field4 = '<div class="details_field4"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                  }else{
                    details_field4 = '<div class="details_field4"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                  }
                break;
                case "Number":
                  if(obj2.value){
                    details_field5 = '<div class="details_field5"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                  }else{
                    details_field5 = '<div class="details_field5"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                  }
                break;
                case "Select":
                  if(obj2.value){
                    details_field6 = '<div class="details_field6"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                  }else{
                    details_field6 = '<div class="details_field6"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                  }
                break; 
                case "Date":
                  if(obj2.value){
                    details_field7 = '<div class="details_field7"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                  }else{
                    details_field7 = '<div class="details_field7"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                  }
                break; 
                case "Imageview":
                var imgdiv = ''
                pic_list = []
                big_num = 0
                for(var i=0;i<obj2.value.url.length;i++){
                  let tempObj = {}
                  tempObj.imgIndex = i
                  tempObj.src = obj2.value.url[i]
                  tempObj.msrc = obj2.value.thumb_url[i]
                  let image = new Image();
                  image.src = obj2.value.url[i]
                  image.onload = function(){
                    tempObj.w = image.width
                    tempObj.h = image.height
                    pic_list.push(tempObj)
                    big_num ++
                    if(big_num == obj2.value.url.length){
                      $this.addClick()
                    }
                  }
                  
                  console.log(tempObj)
                  imgdiv += '<div class="pic"><img data-url="'+obj2.value.url[i]+'" class="preview-img" data-index="'+i+'" src="'+obj2.value.thumb_url[i]+'" alt="" /></div>'
                }
                if(obj2.value.url.length != 0){
                  details_myimgs = '<div class="myimgs"><span class="title" >'+obj2.title+':'+'</span><div class="imgbox">'+imgdiv+'</div></div>'
                }
                break; 
              }

              if(item && item != 'none'){
                details_myinfo= '<div class="user-info"><h2>'+item.name+'<span class="user-time" >'+util.getLocalTime(obj1.sign_time*1000, 'HH:mm')+'</span></h2></div>'
              }else if(item && item == 'none'){
                details_myinfo = ''
              }else{
                details_myinfo= '<div class="user-info"><h2>'+obj1.name+'<span class="user-time" >'+util.getLocalTime(obj1.sign_time*1000, 'HH:mm')+'</span></h2></div>'
              }
            })
          })
        },
        getHtmlMore(item,arr,showDate){
          arr.forEach((obj1) => {
            obj1.form_data.forEach((obj2)=>{
              if(obj2.type === 'Location'){
                details_field1= '<div class="info-title"><p>'+obj2.value.addr_name+'('+obj2.value.addr+')</p><i id="close_icon" class="close_icon el-dialog__close el-icon el-icon-close"></i></div>'

                fieldlist2 += '<div class="info-list" data-signtime="'+obj1.sign_time+'"  data-user-id="'+obj1.user_id+'" data-address="'+obj2.value.addr_name+'('+obj2.value.addr+')'+'"><h2>'+item.name+'<span>'+util.getLocalTime(obj1.sign_time*1000, 'HH:mm')+'</span><i class="el-icon-arrow-right"></i></h2></div>'
              }
              
            })
          })
          setTimeout(()=>{
            let all = $('.info-list')
            for(var i=0;i<all.length;i++){
              all[i].onclick = function(){
                details_field3 = ''
                details_field4 = ''
                details_field5 = ''
                details_myinfo = ''
                count2 = ''
                currUserId = this.getAttribute('data-user-id')
                currAddress = this.getAttribute('data-address')
                currSigntime = this.getAttribute('data-signtime')
                // $('.info-list').hide()
                // $('.showdels').show()
                $('.info-list').slideUp(100)
                $('.showdels').slideDown(100)
                showDate.forEach((obj1)=>{
                  if(obj1.sign_time == currSigntime){
                    obj1.form_data.forEach((obj2)=>{
                      details_myinfo = '<div class="user-info"><h2>'+item.name+'<span class="user-time" >'+util.getLocalTime(obj1.sign_time*1000, 'HH:mm')+'</span></h2></div>'
                      switch(obj2.type){
                        case "SingleText":
                          if(obj2.value){
                            details_field3 = '<div class="details_field3"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                          }else{
                            details_field3 = '<div class="details_field3"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                          }
                        break;
                        case "TextArea":
                          if(obj2.value){
                            details_field4 = '<div class="details_field4"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                          }else{
                            details_field4 = '<div class="details_field4"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                          }
                        break;
                        case "Number":
                          if(obj2.value){
                            details_field5 = '<div class="details_field5"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                          }else{
                            details_field5 = '<div class="details_field5"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                          }
                        break;
                        case "Select":
                          if(obj2.value){
                            details_field6 = '<div class="details_field6"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                          }else{
                            details_field6 = '<div class="details_field6"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                          }
                        break; 
                        case "Date":
                          if(obj2.value){
                            details_field7 = '<div class="details_field7"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                          }else{
                            details_field7 = '<div class="details_field7"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                          }
                        break; 
                        case "Imageview":
                          var imgdiv = ''
                          pic_list = []
                          big_num = 0
                          for(var i=0;i<obj2.value.url.length;i++){
                            let tempObj = {}
                            tempObj.imgIndex = i
                            tempObj.src = obj2.value.url[i]
                            tempObj.msrc = obj2.value.thumb_url[i]
                            let image = new Image();
                            image.src = obj2.value.url[i]
                            image.onload = function(){
                              tempObj.w = image.width
                              tempObj.h = image.height
                              pic_list.push(tempObj)
                              big_num ++
                              if(big_num == obj2.value.url.length){
                                $this.addClick()
                              }
                            }
                            console.log(pic_list)
                            imgdiv += '<div class="pic"><img data-url="'+obj2.value.url[i]+'" class="preview-img" data-index="'+i+'" src="'+obj2.value.thumb_url[i]+'" alt="" /></div>'
                          }
                          if(obj2.value.url.length != 0){
                            details_myimgs = '<div class="myimgs"><span class="title" >'+obj2.title+':'+'</span><div class="imgbox">'+imgdiv+'</div></div>'
                          }
                        break; 
                      }
                    })
                  }
                })
                $('.showdels').html(details_myinfo+details_field3+details_field4+details_field5+details_field6+details_field7+details_myimgs)
                if($('.showdels').show()){
                  // setTimeout(()=>{
                  //   let allImg = $('.pic img')
                  //   for(var i=0;i<allImg.length;i++){
                  //     allImg[i].onclick = function(){
                  //       let index = this.getAttribute('data-index')
                  //       let option = {
                  //         bgOpacity: .8,
                  //         // escKey: false,
                  //         fullscreenEl: false,
                  //         shareEl: false,
                  //         showAnimationDuration: 0,
                  //         hideAnimationDuration: 0
                  //       }
                  //       var sortBy = function (filed, rev, primer) {
                  //           rev = (rev) ? -1 : 1;
                  //           return function (a, b) {
                  //               a = a[filed];
                  //               b = b[filed];
                  //               if (typeof (primer) != 'undefined') {
                  //                   a = primer(a);
                  //                   b = primer(b);
                  //               }
                  //               if (a < b) { return rev * -1; }
                  //               if (a > b) { return rev * 1; }
                  //               return 1;
                  //           }
                  //       };
                  //       let imgarr = pic_list.sort(sortBy('index', false, parseInt))
                  //       console.log(imgarr)
                  //       $this.$preview.open(parseInt(index),imgarr, option)
                  //       $('.pswp').css('z-index', 9999998)
                  //     }
                  //   }
                  // },500)
                }
              }
            }
          },1000)
        },
        //点击“只显示最新位置”操作；默认进来为最新位置
        onCheckboxChange(pream){
          map.clearMap();  // 清除地图覆盖物
          if(pream && pream == 'isLookAllBtn'){
            if(this.checked){
              map.setZoom(12)
              this.showLastSigin()
            }else{
              this.setMapContent()
            }
          }else if(pream && pream == 777){
            if(this.checked){
              this.showLastSigin()
            }else{
              if(this.list.length == 0){
                this.getMemberMapAll('getAll')
              }else{
                this.setMapContent()
              }
            }
          }else{
            let checkedArr = ''
            if(this.checked){
              if(this.isLookAll && this.isSelect){
                this.signListData.forEach((item) => {
                  if(item.user_id == this.isSelect){
                    checkedArr = item
                  }
                })
                this.getUserDetails(checkedArr)
              }else{
                this.showLastSigin()
              }
            }else{
              if(this.isLookAll && this.isSelect){
                this.list.forEach((item) => {
                  if(item.user_id == this.isSelect){
                    checkedArr = item
                  }
                })
                this.getUserDetails(checkedArr)
              }else{
                if(this.list.length == 0){
                  this.getMemberMapAll('getAll')
                }else{
                  this.setMapContent()
                }
                // this.setMapContent()
              }
            }
          }
        },
        //从右侧列表栏点击个人时，地图重新打点，地图上的点都是当前选择的用户的足迹
        getUserDetails(item){
          // map.clearMap();  // 清除地图覆盖物
          if(this.list.length == 0){
            this.getMemberMapAll(item)
          }else{
            this.clickItemDetalis(item)
          }
        },
        clickItemDetalis(item){
          map.clearMap();  // 清除地图覆盖物
          this.isLookAll = true
          // this.checked = false
          this.item = item
          this.isSelect = item.user_id
          let lngs = []
          let marker2 = ''
          // let details_field1 = ''
          // let details_field3 = ''
          // let details_field4 = ''
          // let details_field5 = ''
          // let details_field6 = ''
          // let details_field7 = ''
          // let details_myimgs = ''
          // let details_myinfo = ''
          let count2 = ''
          alldels = ''
          let showDate = []
          let uqlng = []
          let arr = []
          fieldlist2 = ''
          var alldata = ''
          var showdels = ''
          var userInfo = ''
          let currUserId = ''
          let currAddress = ''
          let currSigntime = ''
          // let pic_list = []
          if(this.checked){
            uqlng.push(item.form_data[0].value)
            for(var k = 0; k<uqlng.length;k++){
              marker2 = new AMap.Marker({
                  content:'<div class="pDefaultIcon" style="background:url('+pDefaultIconNum+') no-repeat center bottom;width: 30px;height:35px;line-height:29px;text-align:center;color:#ffffff;font-size:13px;font-weight:600;"">'+(k+1)+'</div>',
                  map: map,
                  offset: new AMap.Pixel(-17, -25),
                  position:[uqlng[k].lng,uqlng[k].lat]  
              });
              marker2.index = k;
              marker2.content = ''
              marker2.adds = uqlng[k].addr_name+'('+uqlng[k].addr+')'
              marker2.on('click', function(e){
                fieldlist2 = ''
                count2 = ''
                details_myimgs = ''
                item.form_data.forEach((obj2)=>{
                  switch(obj2.type){
                    case "Location":
                      details_field1= '<div class="info-title"><p>'+obj2.value.addr_name+'('+obj2.value.addr+')</p><i id="close_icon" class="close_icon el-dialog__close el-icon el-icon-close"></i></div>'
                    break;
                    case "SingleText":
                      if(obj2.value){
                        details_field3 = '<div class="details_field3"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                      }else{
                        details_field3 = '<div class="details_field3"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                      }
                    break;
                    case "TextArea":
                      if(obj2.value){
                        details_field4 = '<div class="details_field4"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                      }else{
                        details_field4 = '<div class="details_field4"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                      }
                    break;
                    case "Number":
                      if(obj2.value){
                        details_field5 = '<div class="details_field5"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                      }else{
                        details_field5 = '<div class="details_field5"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                      }
                    break;
                    case "Select":
                      if(obj2.value){
                        details_field6 = '<div class="details_field6"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                      }else{
                        details_field6 = '<div class="details_field6"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                      }
                    break; 
                    case "Date":
                      if(obj2.value){
                        details_field7 = '<div class="details_field7"><span class="title">'+obj2.title+':'+'</span><p>'+obj2.value+'</p></div>'
                      }else{
                        details_field7 = '<div class="details_field7"><span class="title">'+obj2.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                      }
                    break; 
                    case "Imageview":
                    var imgdiv = ''
                    pic_list = []
                    big_num = 0
                    for(var i=0;i<obj2.value.url.length;i++){
                      let tempObj = {}
                      tempObj.imgIndex = i
                      tempObj.src = obj2.value.url[i]
                      tempObj.msrc = obj2.value.thumb_url[i]
                      let image = new Image();
                      image.src = obj2.value.url[i]
                      image.onload = function(){
                        tempObj.w = image.width
                        tempObj.h = image.height
                        big_num ++
                        pic_list.push(tempObj)
                        if(big_num == obj2.value.url.length){
                          $this.addClick()
                        }
                      }
                      
                      console.log(tempObj)
                      imgdiv += '<div class="pic"><img data-url="'+obj2.value.url[i]+'" class="preview-img" data-index="'+i+'" src="'+obj2.value.thumb_url[i]+'" alt="" /></div>'
                    }
                    if(obj2.value.url.length != 0){
                      details_myimgs = '<div class="myimgs"><span class="title" >'+obj2.title+':'+'</span><div class="imgbox">'+imgdiv+'</div></div>'
                    }
                    break; 
                  }
                })
                details_myinfo= '<div class="user-info"><h2>'+item.name+'<span class="user-time" >'+util.getLocalTime(item.sign_time*1000, 'HH:mm')+'</span></h2></div>'
                alldels = '<div class="alldels">'+details_myinfo+details_field3+details_field4+details_field5+details_field6+details_field7+details_myimgs+'</div>'
                count2 = details_field1 + '<div class="info-content">'+alldels+'</div>'+'<div class="icons"><i class="sj_icon"></i></div>'
                e.target.content = count2
                setTimeout(()=>{
                  $('#close_icon').click(function(event){
                    map.clearInfoWindow();
                    $('.pDefaultIcon').removeClass('pSelectIconNum')
                  })
                },100)
                
                if(e.lnglat){
                  map.setCenter([e.lnglat.lng,e.lnglat.lat])
                  infoWindow.setContent(e.target.content);
                  infoWindow.open(map, e.target.getPosition());

                  $('.pDefaultIcon').removeClass('pSelectIconNum')
                  $('.amap-marker').css({
                    'z-index': 100
                  })
                  $('.pDefaultIcon').each(function(){
                    if(e.target.index+1 == $(this).text()){
                      $(this).addClass('pSelectIconNum')
                      $(this).parent().parent().css({
                        'z-index': 120
                      })
                    }
                  })
                }
              })
            }
          }else{
            this.list.forEach((obj1)=> {
              if(obj1.user_id == item.user_id){
                  obj1.sign_list.forEach((obj2,i) => {
                  showDate.push(obj2)
                  obj2.form_data.forEach((obj3)=>{
                    if(obj3.type === "Location"){
                      uqlng.push(obj3.value)
                    }
                  })
                })
              }
            })
            for(var i = 0;i<uqlng.length;i++){
              for(var j = i+1;j<uqlng.length;){
                if(uqlng[i].addr_name+uqlng[i].addr == uqlng[j].addr_name+uqlng[j].addr){
                  uqlng.splice(j,1)
                }else{
                  j++
                }
              }
            }
            for(var k = 0; k<uqlng.length;k++){
              marker2 = new AMap.Marker({
                  content:'<div class="pDefaultIcon" style="background:url('+pDefaultIconNum+') no-repeat center bottom;width: 30px;height:35px;line-height:29px;text-align:center;color:#ffffff;font-size:13px;font-weight:600;"">'+(k+1)+'</div>',
                  map: map,
                  offset: new AMap.Pixel(-17, -25),
                  position:[uqlng[k].lng,uqlng[k].lat]  
              });
              marker2.index = k;
              marker2.content = ''
              marker2.adds = uqlng[k].addr_name+'('+uqlng[k].addr+')'
              marker2.on('click', function(e){
                fieldlist2 = ''
                arr = []
                details_myimgs = ''
                showDate.forEach((obj1)=>{
                  obj1.form_data.forEach((obj2) => {
                    if(obj2.type === 'Location'){
                      if(obj2.value.addr_name+'('+obj2.value.addr+')' == e.target.adds){
                        arr.push(obj1)
                      }
                    }
                  })
                })
                if(arr.length == 1){
                  count2 = ''
                  $this.getHtmlOnce(item,arr)
                  alldels = '<div class="alldels">'+details_myinfo+details_field3+details_field4+details_field5+details_field6+details_field7+details_myimgs+'</div>'
                  count2 = details_field1 + '<div class="info-content">'+alldels+'</div>'+'<div class="icons"><i class="sj_icon"></i></div>'
                  e.target.content = count2
                  setTimeout(()=>{
                    $('#close_icon').click(function(event){
                      map.clearInfoWindow();
                      $('.pDefaultIcon').removeClass('pSelectIconNum')
                    })
                  },100)
                  // setTimeout(()=>{
                  //   let allImg = $('.pic img')
                  //   for(var i=0;i<allImg.length;i++){
                  //     allImg[i].onclick = function(){
                  //       let index = this.getAttribute('data-index')
                  //       let option = {
                  //         bgOpacity: .8,
                  //         // escKey: false,
                  //         fullscreenEl: false,
                  //         shareEl: false,
                  //         showAnimationDuration: 0,
                  //         hideAnimationDuration: 0
                  //       }
                  //       var sortBy = function (filed, rev, primer) {
                  //           rev = (rev) ? -1 : 1;
                  //           return function (a, b) {
                  //               a = a[filed];
                  //               b = b[filed];
                  //               if (typeof (primer) != 'undefined') {
                  //                   a = primer(a);
                  //                   b = primer(b);
                  //               }
                  //               if (a < b) { return rev * -1; }
                  //               if (a > b) { return rev * 1; }
                  //               return 1;
                  //           }
                  //       };
                  //       let imgarr = pic_list.sort(sortBy('index', false, parseInt))
                  //       console.log(imgarr)
                  //       $this.$preview.open(parseInt(index),imgarr, option)
                  //       $('.pswp').css('z-index', 9999998)
                  //     }
                  //   }
                  // },500)
                }else{
            
                  $this.getHtmlMore(item,arr,showDate)
                  
                  showdels = '<div class="showdels"></div>'
                  alldata = '<div class="alldata">'+fieldlist2+showdels+'</div>'
                  count2 = details_field1 + '<div class="info-content">'+alldata+'</div>'+'<div class="icons"><i class="sj_icon"></i></div>'
                  e.target.content = count2
                  setTimeout(()=>{
                    $('#close_icon').click(function(event){
                      if($('.showdels').css('display') === 'none'){
                         map.clearInfoWindow();
                         $('.pDefaultIcon').removeClass('pSelectIconNum')
                      }else{
                        $('.info-list').slideDown(100)
                        $('.showdels').slideUp(100)
                        
                      }
                    })
                  },100)
                }
                if(e.lnglat){
                  map.setCenter([e.lnglat.lng,e.lnglat.lat])
                  infoWindow.setContent(e.target.content);
                  infoWindow.open(map, e.target.getPosition());

                  $('.pDefaultIcon').removeClass('pSelectIconNum')
                  $('.amap-marker').css({
                    'z-index': 100
                  })
                  $('.pDefaultIcon').each(function(){
                    if(e.target.index+1 == $(this).text()){
                      $(this).addClass('pSelectIconNum')
                      $(this).parent().parent().css({
                        'z-index': 120
                      })
                    }
                  })
                }
              })
            }
          }
          map.setFitView();
        },
        //在地图上点击足迹标点时展示的内容操作
        setMapContent(pream){
          // map.zoomOut(10);
          if(pream && pream == 'isLookAllBtn'){  //点击按钮时执行
            // this.checked = false
            if(this.checked){
               this.onCheckboxChange('isLookAllBtn')
               return
            }else{
               map.setZoom(11)
               var allList = this.list
            }
          }else{
            var allList = this.list
          }
          map.clearMap();  // 清除地图覆盖物

          this.isLookAll = false
          this.isSelect = ''
          markers = []
          for(var i = 0; i< this.mapPoingArray.length; i++){
            let lg = [this.mapPoingArray[i].form_data[0].value.lng,this.mapPoingArray[i].form_data[0].value.lat]
            marker = new AMap.Marker({
                content:'<div class="pDefaultIcon" data-index="'+i+'" style="background:url('+pDefaultIcon+') no-repeat center bottom;width: 30px;height:47px;line-height:54px;text-align:center;color:#ffffff;font-size:13px;font-weight:600;""></div>',
                map: map,
                offset: new AMap.Pixel(-17, -40),
                position:lg                                           
            });
            marker.index = i;
            marker.addrs = this.mapPoingArray[i].form_data[0].value.addr_name+'('+this.mapPoingArray[i].form_data[0].value.addr+')'
            marker.content = ''
            var field1 = ''
            var field2 = ''
            var field2_span = ''
            var myimgs = ''
            var field3 = ''
            var field4 = ''
            var field5 = ''
            var field6 = ''
            var field7 = ''
            var count = ''
            var fieldlist = ''
            var alldata = ''
            var showdels = ''
            var userInfo = ''
            let newObj = []
            let that = this.mapPoingArray[i]
            let _this = this
            let currUserId = ''
            let currAddress = ''
            let currSigntime = ''
            let once = ''
            marker.on('click', function(e){
              newObj = []
              once = []
              fieldlist = ''
              details_myimgs = ''
              allList.forEach( (obj1) => {
                obj1.sign_list.forEach( (obj2) => {
                  obj2.form_data.forEach( (obj3) => {
                    if(obj3.type === "Location"){
                      if(obj3.value.addr_name + '('+obj3.value.addr+')' == e.target.addrs){
                          newObj.push(obj1)
                          once.push(obj2)
                      }
                    }
                  })
                })
              })
              if($.unique(once).length == 1){
                let onceInfo = ''
                allList.forEach( (obj1) => {
                  obj1.sign_list.forEach( (obj2) => {
                    obj2.form_data.forEach( (obj3) => {
                      if(obj3.type === "Location"){
                        if(obj3.value.addr_name + '('+obj3.value.addr+')' == e.target.addrs){
                            onceInfo = {
                              name:obj1.name,
                              sign_time:obj2.sign_time
                            }
                        }
                      }
                    })
                  })
                })

                $this.getHtmlOnce('none',once)
                details_myinfo= '<div class="user-info"><h2>'+onceInfo.name+'<span class="user-time" >'+util.getLocalTime(onceInfo.sign_time*1000, 'HH:mm')+'</span></h2></div>'
                alldels = '<div class="alldels">'+details_myinfo+details_field3+details_field4+details_field5+details_field6+details_field7+details_myimgs+'</div>'
                count = details_field1 + '<div class="info-content">'+alldels+'</div>'+'<div class="icons"><i class="sj_icon"></i></div>'
                e.target.content = count
                setTimeout(()=>{
                  $('#close_icon').click(function(event){
                    map.clearInfoWindow();
                    $('.pDefaultIcon').removeClass('pSelectIcon')
                  })
                  // if($('.alldels').css('display') == 'block'){
                  //   let allImg = $('.pic img')
                  //   for(var i=0;i<allImg.length;i++){
                  //     allImg[i].onclick = function(){
                  //       let index = this.getAttribute('data-index')
                  //       let option = {
                  //         bgOpacity: .8,
                  //         // escKey: false,
                  //         fullscreenEl: false,
                  //         shareEl: false,
                  //         showAnimationDuration: 0,
                  //         hideAnimationDuration: 0
                  //       }
                  //       var sortBy = function (filed, rev, primer) {
                  //           rev = (rev) ? -1 : 1;
                  //           return function (a, b) {
                  //               a = a[filed];
                  //               b = b[filed];
                  //               if (typeof (primer) != 'undefined') {
                  //                   a = primer(a);
                  //                   b = primer(b);
                  //               }
                  //               if (a < b) { return rev * -1; }
                  //               if (a > b) { return rev * 1; }
                  //               return 1;
                  //           }
                  //       };
                  //       let imgarr = pic_list.sort(sortBy('index', false, parseInt))
                  //       console.log(imgarr)
                  //       $this.$preview.open(parseInt(index), imgarr, option)
                  //       $('.pswp').css('z-index', 9999998)
                  //     }
                  //   }
                  // }
                },100)
              }else{
                for(var j = 0; j < $.unique(newObj).length; j++){
                  newObj[j].sign_list.forEach( (item)=>{
                    item.form_data.forEach((del) =>{
                        if(del.type === 'Location'){
                          if(del.value.addr == that.form_data[0].value.addr && del.value.addr_name == that.form_data[0].value.addr_name){
                              field1= '<div class="info-title"><p>'+del.value.addr_name+'('+del.value.addr+')</p><i id="close_icon" class="close_icon el-dialog__close el-icon el-icon-close"></i></div>'
                              fieldlist += '<div class="info-list" data-signtime="'+item.sign_time+'"  data-user-id="'+newObj[j].user_id+'" data-address="'+del.value.addr_name+'('+del.value.addr+')'+'"><h2>'+newObj[j].name+'<span>'+util.getLocalTime(item.sign_time*1000, 'HH:mm')+'</span><i class="el-icon-arrow-right"></i></h2></div>'
                          }
                        }
                    })
                  })
                }
                setTimeout( () =>{
                  var all = $('.info-list')
                  //关闭信息窗体
                  $('#close_icon').click(function(event){
                    if($('.showdels').css('display') === 'none'){
                       map.clearInfoWindow();
                       $('.pDefaultIcon').removeClass('pSelectIcon')
                    }else{
                      $('.info-list').slideDown(100)
                      $('.showdels').slideUp(100)

                      
                    }
                  })
                  for(var i=0;i<all.length;i++){
                    all[i].onclick = function(){
                        field3 = ''
                        field4 = ''
                        field5 = ''
                        currUserId = this.getAttribute('data-user-id')
                        currAddress = this.getAttribute('data-address')
                        currSigntime = this.getAttribute('data-signtime')
                        // map.clearInfoWindow();
                        // $('.info-list').hide()
                        // $('.showdels').show()
                        $('.info-list').slideUp(100)
                        $('.showdels').slideDown(100)
                         _this.list.forEach( (item) => {
                           if(item.user_id == currUserId){
                              item.sign_list.forEach( (pre) => {
                                pre.form_data.forEach( (str) => {
                                  if(str.type === 'Location'){
                                    if(currAddress === str.value.addr_name+'('+str.value.addr+')' && currSigntime == pre.sign_time){
                                      userInfo = '<div class="user-info"><h2>'+item.name+'<span class="user-time" >'+util.getLocalTime(pre.sign_time*1000, 'HH:mm')+'</span></h2></div>'
                                      pre.form_data.forEach( (s) => {
                                        switch(s.type){
                                          case "SingleText":
                                            if(s.value){
                                              field3 = '<div class="field3"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field3 = '<div class="field3"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break;
                                          case "TextArea":
                                            if(s.value){
                                              field4 = '<div class="field4"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field4 = '<div class="field4"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break;
                                          case "Number":
                                            if(s.value){
                                              field5 = '<div class="field5"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field5 = '<div class="field5"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break;
                                          case "Select":
                                            if(s.value){
                                              field6 = '<div class="field6"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field6 = '<div class="field6"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break; 
                                          case "Date":
                                            if(s.value){
                                              field7 = '<div class="field7"><span class="title">'+s.title+':'+'</span><p>'+s.value+'</p></div>'
                                            }else{
                                              field7 = '<div class="field7"><span class="title">'+s.title+':'+'</span><p style="color:#99A9BF">未填写</p></div>'
                                            }
                                          break; 
                                          case "Imageview":
                                            var imgdiv = ''
                                            pic_list = []
                                            big_num = 0
                                            for(var i=0;i<s.value.url.length;i++){
                                              let tempObj = {}
                                              tempObj.imgIndex = i
                                              tempObj.src = s.value.url[i]
                                              tempObj.msrc = s.value.thumb_url[i]
                                              let image = new Image();
                                              image.src = s.value.url[i]
                                              image.onload = function(){
                                                tempObj.w = image.width
                                                tempObj.h = image.height
                                                pic_list.push(tempObj)
                                                big_num ++
                                                if(big_num == s.value.url.length){
                                                  $this.addClick()
                                                }
                                              }
                                              console.log(pic_list)
                                              imgdiv += '<div class="pic"><img data-url="'+s.value.url[i]+'" class="preview-img" data-index="'+i+'" src="'+s.value.thumb_url[i]+'" alt="" /></div>'
                                            }
                                            if(s.value.url.length != 0){
                                              myimgs = '<div class="myimgs"><span class="title" >'+s.title+':'+'</span><div class="imgbox">'+imgdiv+'</div></div>'
                                            }
                                            
                                          break; 
                                        }
                                      })
                                      
                                    }
                                  }
                                  
                                })
                              })
                           }
                        })
                        $('.showdels').html(userInfo+field3+field4+field5+field6+field7+myimgs)
                        if($('.showdels').show()){
                          // setTimeout(()=>{
                          //   let allImg = $('.pic img')
                          //   for(var i=0;i<allImg.length;i++){
                          //     allImg[i].onclick = function(){
                          //       let index = this.getAttribute('data-index')
                          //       let url = this.getAttribute('data-url')
                          //       console.log(url)
                          //       let option = {
                          //         bgOpacity: .8,
                          //         // escKey: false,
                          //         fullscreenEl: false,
                          //         shareEl: false,
                          //         showAnimationDuration: 0,
                          //         hideAnimationDuration: 0
                          //       }
                          //       var sortBy = function (filed, rev, primer) {
                          //           rev = (rev) ? -1 : 1;
                          //           return function (a, b) {
                          //               a = a[filed];
                          //               b = b[filed];
                          //               if (typeof (primer) != 'undefined') {
                          //                   a = primer(a);
                          //                   b = primer(b);
                          //               }
                          //               if (a < b) { return rev * -1; }
                          //               if (a > b) { return rev * 1; }
                          //               return 1;
                          //           }
                          //       };
                          //       let imgarr = pic_list.sort(sortBy('index', false, parseInt))
                          //       console.log(imgarr)
                          //       $this.$preview.open(parseInt(index),imgarr, option)
                          //       $('.pswp').css('z-index', 9999998)
                          //     }
                          //   }
                          // },500)
                        }
                    }
                  }
                },100)
                showdels = '<div class="showdels"></div>'
                alldata = '<div class="alldata">'+fieldlist+showdels+'</div>'
                count = field1 + '<div class="info-content">'+alldata+'</div>'+'<div class="icons"><i class="sj_icon"></i></div>'
                e.target.content = count
              }
              if(e.lnglat){
                map.setCenter([e.lnglat.lng,e.lnglat.lat])
                infoWindow.setContent(e.target.content);
                infoWindow.open(map, e.target.getPosition());

                $('.pDefaultIcon').removeClass('pSelectIcon')
                $('.amap-marker').css({
                  'z-index': 100
                })
                for(var i = 0;i<$('.pDefaultIcon').length;i++){
                  if(e.target.index == $('.pDefaultIcon').eq(i).attr('data-index')){
                    console.log(e.target.index)
                    console.log(i)
                    $('.pDefaultIcon').eq(i).addClass('pSelectIcon')
                    $('.pDefaultIcon').eq(i).parent().parent().css({
                      'z-index': 120
                    })
                  }
                }
                // if(infoWindow.getIsOpen()){
                //   $('.pDefaultIcon').removeClass('pSelectIcon')
                // }else{
                //   map.setCenter([e.lnglat.lng,e.lnglat.lat])
                //   infoWindow.setContent(e.target.content);
                //   infoWindow.open(map, e.target.getPosition());

                //   $('.pDefaultIcon').removeClass('pSelectIcon')
                //   $('.amap-marker').css({
                //     'z-index': 100
                //   })
                //   for(var i = 0;i<$('.pDefaultIcon').length;i++){
                //     if(e.target.index == i){
                //       $('.pDefaultIcon').eq(i).addClass('pSelectIcon')
                //       $('.pDefaultIcon').eq(i).parent().parent().css({
                //         'z-index': 120
                //       })
                //     }
                //   }
                // }
              }
            });
            
            markers.push(marker);
          }
          map.setFitView();
        },
        addPointOnMap(location){
          var strs = location.split(",");
          var r = /^(-|\+)?\d+\.\d*$/
          if (r.test(strs[0]) == false || r.test(strs[1]) == false) {
            return;
          }
        },
        isEquelPosition(position){
          for (var k = this.mapPoingArray.length - 1; k >= 0; k--) {
            if (this.mapPoingArray[k].form_data[0].value.addr_name == position) {
              return 1;
            }
          }
          return 0;
        },
        //组装请求回来的数据
        parserData(pre){
          lnglats = []
          this.mapPoingArray.splice(0,this.mapPoingArray.length);//清空数组 
          for (var i = this.list.length - 1; i >= 0; i--) {
            var item = this.list[i];
            for (var j = item.sign_list.length - 1; j >= 0; j--) {
              var point = item.sign_list[j];
              if (this.isEquelPosition(point.form_data[0].value.addr_name) == 0) {
                lnglats.push([point.form_data[0].value.lng,point.form_data[0].value.lat])
                this.mapPoingArray.push(point);
                this.addPointOnMap(point.form_data[0].value.lng+','+point.form_data[0].value.lat);
              }
            }
          }
          if(pre){
            this.setMapContent()
          }
        },
        //地图上坐标展示
        getMemberMapAll(pre){
            if(pre){
              this.pLoading = true
            }
            lnglats = []
            util.ajax({
              url: '/sign/manager/map/all',
                type:'POST',
                data: {
                    'team_id': this.team_id,
                    'project_id': this.project_id,
                    'date':util.formatData1(this.pmtime),//this.pmtime,
                    'userid_list':JSON.stringify(this.post_user_id)
                },
                timeout:10000,
                success: (res) => {
                  if(pre){
                    this.pLoading = false
                  }
                  if(res&&res.errno == 0){
                    this.list = res.data.list;
                    this.require_field = res.data.require_field
                    if(pre == 'getAll'){
                      this.parserData(pre)
                    }else{
                      this.parserData()
                      this.clickItemDetalis(pre)
                    }
                    
                    // if (res.data.list.length > 0) {
                    //   this.list = res.data.list;
                    //   this.require_field = res.data.require_field
                    //   map = new AMap.Map("container", {
                    //       resizeEnable: true,
                    //       zoom:11
                    //   });
                    //   this.parserData();
                    //   this.onCheckboxChange(777)
                    // }else{
                    //   map = new AMap.Map("container", {
                    //       resizeEnable: true,
                    //       zoom:11
                    //   });
                    // }
                  }
                },
                error: (xhr, status) => {
                  if(pre){
                    this.pLoading = false
                  }
                },
                noNetwork: () => {
                    if(pre){
                      this.pLoading = false
                    }
                    // 网络超时
                    this.$message({
                      showClose: true,
                      message: '网络连接失败，请检查网络',
                      type: 'warning'
                    });
                }
            })
        },
        mapBig(){
          map.zoomIn()
        },
        mapSmall(){
          map.zoomOut()
        },
        getMemberSignList(){
            this.pLoading = true
            
            if(this.userid_list.length > 0){
                this.post_user_id = this.userid_list
            }else{
                this.post_user_id = this.allUserId
            }
            this.post_user_id = [...new Set(this.post_user_id)]
            //console.log(this.post_user_id)
            util.ajax({
                url: '/sign/manager/statistics',
                type:'POST',
                data: {
                    team_id: this.team_id,
                    project_id: this.project_id,
                    userid_list: JSON.stringify(this.post_user_id),
                    date: util.formatData1(this.pmtime),//this.pmtime,//'2017-12-01',
                    page: 1,
                    page_size: 100000,
                    key_time: this.key_time
                },
                success: (res) => {
                    this.pLoading = false
                    if(res&&res.errno==0){
                        this.sign_count = res.data.count
                        this.key_time = res.data.key_time
                        this.signListData = res.data.list
                        this.onCheckboxChange(777)
                    }
                },
                error: (xhr, status) => {
                  this.pLoading = false
                },
                noNetwork: () => {
                    this.pLoading = false
                    // 网络超时
                    this.$message({
                      showClose: true,
                      message: '网络连接失败，请检查网络',
                      type: 'warning'
                    });
                }
            })
        },
        //时间日期切换
        onPmTimeChange(val){
            this.pmtime = val
            this.checked = true
            this.list = []
            this.getMemberSignList()
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
            this.list = []
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
        //获取当前用户下级所有人员的user_id
        getUserAdminMember(){
            util.ajax({
                url: '/group/member_id_list',
                type:'GET',
                data: {
                    team_id: this.team_id,
                    project_id: this.project_id
                },
                timeout:10000,
                success: (res) => {
                    // console.log(res)
                    if(res&&res.errno==0){
                        if (res.data_info.valid_user_id.length > 0) {
                          this.userid_list = res.data_info.valid_user_id
                          this.allUserId = res.data_info.valid_user_id 
                          this.sumCount = res.data_info.valid_user_id
                          map = new AMap.Map("container", {
                              resizeEnable: true,
                              zoom:11
                          });
                          infoWindow = new AMap.InfoWindow({
                              isCustom: true,  //使用自定义窗体
                              // closeWhenClickMap:true,
                              autoMove:true,
                              offset: new AMap.Pixel(0, -30)
                          });
                          this.getMemberSignList()
                        }else{
                          map = new AMap.Map("container", {
                              resizeEnable: true,
                              zoom:11
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
        //获取权限 
        permission(){
            util.ajax({
                url: '/permission/application',
                type:'GET',
                data: {
                    team_id: this.team_id,
                    project_id: this.project_id,
                    application_id: 2
                },
                timeout:10000,
                success: (res) => {
                    if(res&&res.errno==0){
                        res.data.forEach( (item) => {
                            if(item.id_name === 'sign_export'){
                                this.admins.sign_export = true
                            }
                            if(item.id_name === 'invisible_man'){
                                this.admins.invisible_man = true
                            }
                        })
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
                timeout:10000,
                success: (res) => {
                    console.log(res)
                    if(res&&res.errno==0){
                        this.require_field = res.data.setting_data.require_field
                        if(res.data.setting_data.pop_tip == 1){
                            this.dialogPositionIsOpen = true
                        }else{
                            this.dialogPositionIsOpen = false
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
        openPosition(){
            this.dialogPositionIsOpen = false
            this.isOpenPosition = true
            this.require_field[0].info.tune_distance = 500
            //开启位置上报
            util.ajax({
                url: '/sign/project/deal',
                type:'POST',
                data:{
                    team_id: this.team_id,
                    project_id: this.project_id,
                    switch: 1,
                    require_field: JSON.stringify(this.require_field),
                    remind_time: []
                },
                timeout:10000,
                success: (res) => {
                    console.log(res)
                    if(res&&res.errno==0){
                       
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
        closeTip(){
            this.isOpenPosition = false
        },
        //日期格式化“分秒”
        getLocalTime(timestr){
            return util.getLocalTime(timestr, 'HH:mm')
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
/* 地图 */
.amap-info-close{
  display: none;
}
/* 地图点标记样式 */
.pSelectIcon{
   background:url(../assets/imgs/position/pd_icon_hover.svg) no-repeat !important;
   width: 31px !important;
   height:47px !important;
   line-height:32px !important;
   padding-left:1px !important;
   text-align:center !important;
   color:#ffffff !important;
   font-size:13px !important;
   font-weight:600 !important;
   z-index: 99999 !important;
   margin-top: 10px !important;
}
.pSelectIconNum{
   background:url(../assets/imgs/position/pd_num_icon_hover.svg) no-repeat !important;
   width: 36px !important;
   height:44px !important;
   line-height:37px !important;
   padding-left:1px !important;
   text-align:center !important;
   color:#ffffff !important;
   font-size:13px !important;
   font-weight:600 !important;
   z-index: 99999 !important;
   margin-top: -7px !important;
   margin-left: -3px !important;
}
.amap-simple-marker-position-point{display: none!important;}
#positionLocation .amap-info-content{padding: 0px;}


#positionLocation .amap-info-outer, .amap-menu-outer{border:none;box-shadow:none;}

/* 地图自定义框样式 */

/* 地图自定义框----头部 */
#positionLocation .info-title{
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
#positionLocation .info-title, .details_field1{
    width: 255px;
    padding: 12px 15px 12px 40px;
    font-size: 12px;
    font-weight: bold;
    text-align: left;
    color: #1f2d3d;
    letter-spacing: 1px;
    background: #ffffff url(../assets/imgs/position/l_icon.svg) no-repeat 14px center;
    position: relative;
    box-shadow: 0.5px 0px 2px 0 rgba(170, 172, 173, 0.5);
}
#positionLocation .info-title p, .details_field1 p{
  margin-left:6px;
  margin-right: 22px;
  line-height:16px;
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
#positionLocation .info-title .close_icon, .details_field1 .close_icon{
  position: absolute;
  right: 16px;
  top: 16px;
  color: #c0ccda;
  cursor: pointer;
}
#positionLocation .info-title .close_icon:hover{color: #6699ee;}
#positionLocation .details_field1 .close_icon:hover{color: #6699ee;}
/* 地图自定义框---内容部分 */
#positionLocation .info-content{
    width: 310px;
    max-height: 265px;
    /*border-top: 1px solid #eeeeee;*/
    background: #ffffff;
    overflow-y: auto;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
}
#positionLocation .info-content h2{
    font-size: 14px;
    font-weight: 600;
    color: #475669;
}
#positionLocation .info-content h2 span{
    float: right;
    font-size: 14px;
    color: #99a9bf;
    font-weight:normal;
    margin-right:20px; 
}
#positionLocation .info-content p{ 
  color: #5e6d82;
  line-height: 1.3;
  width: 210px;
  float: left;
}
/*内容列表样式*/
#positionLocation .info-content .info-list{
  height: 44px;
  line-height: 44px;
  border-bottom: 1px solid #eeeeee;
  padding: 0 10px 0 24px;
  position: relative;
  cursor: pointer;
}
#positionLocation .info-content .info-list:last-child{border-bottom: none;}
#positionLocation .info-content .info-list .el-icon-arrow-right{
  position: absolute;
  right: 17px;
  top: 16px;
  width: 8px;
  height: 12.5px;
  color: #c0ccda;
}
/* 内容展开详情样式 */
#positionLocation .info-content .showdels{
  display: none;
  padding: 12px 0px 12px 22px;
  background: #ffffff;
}
#positionLocation .info-content .field1, .field2, .field3, .field4, .field5, .field6, .field7{
    overflow:hidden;
    margin-top: 10px;
}
#positionLocation .info-content .details_field1, .details_field2, .details_field3, .details_field4, .details_field5, .details_field6, .details_field7{
    overflow:hidden;
    margin-top: 10px;
}
/*#positionLocation .info-content .showdels .user-info{margin-bottom: 10px;}*/
/*#positionLocation .info-content .showdels .user-info h2 span{margin-right: 0}*/
#positionLocation .info-content .showdels span.title{
    float: left;
    display: block;
    width: 52px;
    font-size: 12px;
    font-weight: bold;
    line-height: 1.33;
    text-align: left;
    color: #99a9bf;
    margin-right: 4px;
}
#positionLocation .info-content .showdels p{
  float: left;
  /*width: 160px;*/
  margin-right: 20px;
  line-height: 1.33;
}
#positionLocation .info-content .myimgs{overflow:hidden;margin-top: 10px;}
#positionLocation .info-content .myimgs .imgbox{width: 193px; float: left;}
#positionLocation .info-content .myimgs .imgbox .pic{
    float: left;
    width: 58px;
    height: 60px;
    margin: 0 6px 6px 0;
}
#positionLocation .info-content .myimgs .imgbox  .pic img{
  width: 58px;
  height: 60px;
}

#positionLocation .info-content .alldels{
  padding: 12px 0px 12px 22px;
  background: #ffffff;
}
/*#positionLocation .info-content .alldels .user-info{margin-bottom: 10px;}*/
#positionLocation .info-content .alldels span.title{
    float: left;
    display: block;
    width: 52px;
    font-size: 12px;
    font-weight: bold;
    line-height: 1.33;
    text-align: left;
    color: #99a9bf;
    margin-right: 4px;
}

/*倒三角样式*/
#positionLocation .icons{
  position: relative;
  width: 310px;
  height: 13px;
}
#positionLocation .icons .sj_icon{
  display: block;
  position: absolute;
  left: 50%;
  margin-left: -12px;
  bottom: 1px;
  background-image:url(../assets/imgs/position/sj_icon2.svg);
  background-repeat: no-repeat;
  width: 24px;
  height: 13px!important;
}


#positionLocation .el-checkbox__label{vertical-align:middle;padding-left:8px;color: #5e6d82;}
#positionLocation .time {float: left;}
#positionLocation .time .el-input__inner{height: 28px;}
#positionLocation .set-buttons .btn-item span{font-size: 13px;}


/* 导出弹层 */
#positionLocation .el-dialog--tiny{
  width: 400px;
}
#positionLocation .my-form{
  padding: 0 40px;
  margin-top: 40px;
  margin-bottom: 40px;
}
#positionLocation .position-dialog .my-form .el-form-item{margin-bottom: 16px;}
#positionLocation .position-dialog .my-form .el-date-editor.el-input{width: 248px;}
#positionLocation .position-dialog .my-form .el-form-item__label{text-align: left;}
#positionLocation .position-dialog .el-dialog__footer{
  border-top: 1px solid #e0e6ed;
  padding-top: 16px;
}
#positionLocation .position-dialog .el-form-item__error{
  position: static;
  margin-bottom: -7px;
}


</style>
<style scoped>
.myCount{
  position: relative;
  clear: both;
}
/*.myCount .left{
  float: left;
  width: 220px;
  height: 100%;
  background-color: #fafafa;
  box-shadow: 2px 2px 4px 0 rgba(225, 225, 225, 0.5);
  overflow-y: auto;
  position: relative;
  z-index: 1;
}*/
.myCount .right{
  float: right;
  height: 100%;
  width: calc(100% - 220px);
  position: relative;
}
.myCount .right .look-all{
  z-index: 99;
  position: absolute;
  left: 16px;
  top: 14px;
  width: 68px;
  height: 36px;
  line-height:36px;
  border-radius: 6px;
  background: #ffffff url('../assets/imgs/position/lookall_icon.svg') no-repeat 12px center;
  padding-left:34px;
  box-shadow: 3px 0 4px 0 rgba(198, 201, 207, 0.5);
  font-size: 14px;
  color: #6699ee;
  cursor:pointer;
}
.myCount .right .look-all:hover{
  color:#8bb1f2;
}
.myCount .right .look-all:active{
  color:#517ed6;
}
.myCount .right #container{
  height: 100%;
  width: 100%;
  float: right;
}
.myCount .right .btns{
  width: 32px;
  height: 61px;
  background:#ffffff;
  position: absolute;
  right: 16px;
  bottom: 16px;
  border-radius: 2px;
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
  /*z-index: 99;*/
  padding: 1.5px 0;
}
.myCount .right .btns a{
  display: block;
  height: 30px;
  width: 32px;
  margin: 0 auto;
}
.myCount .right .btns a img{
  display: block;
  margin: 0 auto;
  padding-top: 8px;

}
.myCount .right .btns .line{
  margin: 0 auto;
  display: block;
  width: 24px;
  height: 1px;
  background-color: #e0e6ed;
}



/* 地图内容部分---左边列表 */
.myCount{
    width: 100%;
    position: relative;
    clear: both;
}
.myCount .left{
  float: left;
  width: 220px;
  height: 100%;
  background-color: #fafafa;
  box-shadow: 2px 2px 4px 0 rgba(225, 225, 225, 0.5);
  
  position: relative;
  z-index: 1;
}
.myCount .left h2{
    width: 180px;
    padding: 0 20px;
    height: 49px;
    line-height: 49px;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
    color: #475568;
    border-bottom: 1px solid #e0e6ed;
    /*position: fixed;*/
    position: absolute;
    z-index: 999;
    background: #ffffff;
}
.myCount .left .member-list{margin-top: 49px;height: 90%;overflow-y: auto;}
.myCount .left h2 span{
   color: #99a9bf;
   font-weight: normal;
   font-size: 14px;
}
.myCount .left h2 b{
   color: #5e6d82;
   font-size: 14px;
}
.myCount .left .member-list dl{
    height: 60px;
    border-bottom: 1px solid #eeeeee;
    padding: 0 15px 0 20px;
    position: relative;
    cursor: pointer;
}
.myCount .left .member-list .curr-selest-active{background:#ffffff;}
.myCount .left .member-list dl:hover{background-color: #ffffff;}
.myCount .left .member-list dl dt{
    width: 36px;
    height: 36px;
    border-radius: 36px;
    float: left;
    margin-top: 12px;
    margin-right: 14px;
    position: relative;
}
.myCount .left .member-list dl dt.deleted:after{
    content: '已离职';
    display: block;
    position: absolute;
    width: 36px;
    height: 36px;
    background-color: #000;
    opacity: .5;
    left: 0;
    top: 0;
    font-size: 10px;
    color:#fff;
    border-radius: 50%;
    line-height: 36px;
    text-align: center;
}
.myCount .left .member-list dl dt img{
    width: 36px;
    height: 36px;
    border-radius: 36px;
}
.myCount .left .member-list dl dt .noavatar{
    width: 36px;
    height: 36px;
    background: url(../assets/imgs/avatar.png) no-repeat center;
    background-size: contain;
}
.myCount .left .member-list dl dd{
    float: left;
}
.myCount .left .member-list dl dd h3{
    font-size: 12px;
    color: #5e6d82;
    margin-bottom: 8px;
    margin-top: 12px;
}
.myCount .left .member-list dl dd h3 span{
    display: block;
    width: 60px;
    color: #475568;
    font-size: 14px;
    margin-right: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    float: left;
}
.myCount .left .member-list dl dd h4{
    clear: both;
    font-size: 12px;
    line-height: 1.33;
    text-align: left;
    color: #99a9bf;
}
.myCount .left .empty{
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -56px;
}
.myCount .left .empty span{
    font-size: 16px;
    color: #c0ccda;
}











/* 头部导航 */
.head{
    padding: 0 20px;
    height: 54px;
    line-height: 54px;
    background-color: #ffffff;
    position: relative;
    box-shadow: 3px 0 4px 0 rgba(198, 201, 207, 0.5);
    border-bottom: 1px solid #e0e6ed;
}
.head h1{
    font-size: 16px;
    font-weight: 600;
    text-align: left;
    color: #475568;
    float: left;
}
.head .sel_item{
    float: left;
    margin-left: 136px;
}
.head .sel_item span{
    font-size: 13px;
    color: #5e6d82;
}
.head .sel_item .el-button--default.select_member span{
    font-size: 13px;
    color: #1f2d3d;
}
.head .sel_item .el-button--default.select_member:hover{
    border: 1px solid #c0ccda;
    color: #1f2d3d;
}
.head .sel_item .el-button--default.select_member:active,
.head .sel_item .el-button--default.select_member:focus{
    border: 1px solid #6699EE;
}
.head .checkbox{
    float: left;
    margin-left: 34px;
}
.head .set-buttons{float: right;}
.head .set-buttons .btn-item{
    float: left;
    position: relative;
}
.head .set-buttons .export{
    margin-right: 30px;
}
.head .set-buttons .export .export-icon{
    display: block;
    width: 12px;
    height: 12px;
    background-image:url(../assets/imgs/shareIcon/export.svg);
    position: absolute;
    left: -16px;
    top: 21px;
}
.head .set-buttons .setico_svg{
    position: absolute;
    left: -16px;
    top: 20px;
}
/* 未开启位置监控弹层 */
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
#positionLocation .positionIsOpen-dialog{
    width: 278px;
    height: 116px;
    margin-left: 45%;
    margin-top: 15%;
    background:url(../assets/imgs/position/bj_tip2.svg) no-repeat;
    position: relative;
}
#positionLocation .positionIsOpen-dialog .tip-text{
    width: 192px;
    line-height: 21px;
    position: absolute;
    left: 44px;
    top: 35px;
}
#positionLocation .positionIsOpen-dialog .tip-text p{
    font-size: 16px;
    text-align: left;
    color: #ffffff;
    text-shadow: 0 1px 1px rgba(246, 153, 78, 0.5);
}
#positionLocation .positionIsOpen-dialog .openbtn{
    width: 120px;
    height: 36px;
    border-radius: 2px;
    background-color: #ffffff;
    font-size: 16px;
    text-align: center;
    color: #f5974e;
    position: absolute;
    left: 50%;
    bottom: -75px;
    margin-left: -50px;
    line-height:6px;
}
#positionLocation .positionIsOpen-dialog .el-button{
    border: solid 1px #ffffff!important;
}
#positionLocation .positionIsOpen-dialog .el-button:hover{
    border: solid 1px #ffffff!important;
}
.head .isOpenPositionTip{
    width: 170px;
    height: 79.4px;
    background-image:url(../assets/imgs/position/kow2.svg);
    position: absolute;
    right: 8px;
    top: 48px;
    z-index: 99;
    padding: 18px 9px 12px 9px;
}
.head .isOpenPositionTip p{
    width:168px;
    font-size: 14px;
    line-height: 1.43;
    letter-spacing: normal;
    text-align: justify;
    color: #ffffff;
    text-shadow: 0 1px 1px #f6994e;
    margin-left:6px;
}
.head .isOpenPositionTip a{
    display: block;
    margin: 0 auto;
    width: 130px;
    height: 22px;
    line-height: 22px;
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px 0 #ffa18c;
    font-size: 13px;
    text-align: center;
    color: #ffaa00;
    margin-top: 12px;
}




  /*大图预览插件*/
.pswp{
  z-index: 9999999;
}

</style>

