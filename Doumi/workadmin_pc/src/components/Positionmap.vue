<template>
  <div id="positionMap" v-loading.body="pLoading">
    <div class="head">
      <h1>位置监控</h1>
      <div class="sel_item">
        <span>筛选：</span>
        <el-button @click="openGroupSelecter" class="select_member" style="position:relative;min-width:121px;text-align: left;height:28px;line-height: 6px;padding-left:10px;padding-right:33px;">
          {{selected_members_groups.length ? computedMemberGroup() : '全部人员'}}<i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 8px;color: #d3dce6;"></i></el-button>
      </div>
      <select-member-group-multi title="人员范围" ref="profile" :all-groups="all_groups" :selected-members-groups="selected_members_groups" v-on:confirmGroupSelecter="confirmGroupSelecter"></select-member-group-multi>
      <div class="time">
        <el-date-picker v-model="pmtime" @change="onPmTimeChange" type="date" placeholder="选择日期" style="width:131px;margin-left:12px;" :picker-options="pickerOptions" :clearable="false" :editable="false">
        </el-date-picker>
      </div>
      <div class="set-buttons" v-if="admins.sign_export">
        <div class="btn-item export" @click="positionDialogVisible = true">
          <i class="export-icon"></i>
          <el-button type="text">导出报表</el-button>
        </div>
        <div class="btn-item set" @click="setPosition" v-if="!admins.invisible_man">
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
    <!-- 内容部分 -->
    <div class="myCount">
      <!-- 左侧人员列表部分 -->
      <div class="left" id="leftDiv">
        <h2>已上报&nbsp;&nbsp;&nbsp;<b>{{alreadyMum}}</b><span>/{{sumCount}}</span></h2>
        <div class="member-list" id="memberList">
          <template v-for="item in alreadySignListData">
            <dl @click="showCurrentUserDetails(item,'')" :class="{'curr-selest-active':isSelectCurrentUser == item.user_id}">
              <dt :class="{'deleted': item.member_status == -1}">
                <img :src="item.logo.thumb_url" alt="" v-if="item.logo.thumb_url">
                <div class="noavatar" v-else></div>
              </dt>
              <dd>
                <h3><span>{{item.user_name}}</span>上报{{item.num}}次</h3>
                <h4>最近签到：{{item.create_at}}</h4>
              </dd>
            </dl>
          </template>
        </div>
        <div class="empty" v-show="alreadySignListData.length == 0">
          <span>暂无已上报人员</span>
        </div>
      </div>
      <!-- 右侧地图部分 -->
      <div class="right">
        <div id="container" ref="container"></div>
        <div class="look-all" @click="lookAllSign" v-if="isLookAll">查看全部</div>
        <div class="pop" @mouseenter="enter" @mouseleave="leave" v-if="ishowPop">
          <a href="javascript:;"><img src="../assets/imgs/position/pop.svg" alt=""></a>
          <div class="pop_hover">
            <img src="../assets/imgs/position/pop_text.svg" alt="">
          </div>
        </div>
        <div class="btns">
          <a href="javascript:;" class="big" @click="mapBig"><img src="../assets/imgs/position/big.svg" alt=""></a>
          <span class="line"></span>
          <a href="javascript:;" class="small" @click="mapSmall"><img src="../assets/imgs/position/small.svg" alt=""></a>
        </div>
      </div>
    </div>

    <!-- 未开启定位弹层提示 -->
    <template v-if="dialogPositionIsOpen && positionTrajectory">
      <div class="dialog-backgroud" v-if="!admins.invisible_man && admins.sign_export">
        <div class="positionIsOpen-dialog">
          <div class="tip-text">
            <p>开启后可收集员工地理位置并实时查看</p>
          </div>
          <div @click="openPosition">
            <el-button class="openbtn">开 启</el-button>
          </div>
        </div>
      </div>
    </template>

    <!-- 导出弹窗 -->
    <div class="position-dialog">
      <el-dialog title="导出报表" :visible.sync="positionDialogVisible" @close="resetForm('ruleForm')" size="tiny">
        <div class="my-form">
          <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="73px">
            <el-form-item label="开始日期" prop="start_time">
              <el-date-picker v-model="ruleForm.start_time" :clearable="false" :editable="false" type="date" placeholder="请选择">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="结束日期" prop="end_time">
              <el-date-picker v-model="ruleForm.end_time" :clearable="false" :editable="false" type="date" placeholder="请选择">
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
import MapLoader from '../assets/js/AMap'
import SelectMemberGroupMulti from '@/components/common/SelectMemberGroupMulti'
import pDefaultIcon from '@/assets/imgs/position/pd_icon.svg'
import pDefaultIconNum from '@/assets/imgs/position/pd_num.svg'
import pSelectIcon from '@/assets/imgs/position/pd_num_hover.svg'
import traceIocn1 from '@/assets/imgs/position/traceIocn1.svg'
import traceIocn2 from '@/assets/imgs/position/traceIocn2.svg'
import traceIocn3 from '@/assets/imgs/position/traceIocn3.svg'
import traceIocn4 from '@/assets/imgs/position/traceIocn4.svg'
import traceIocn5 from '@/assets/imgs/position/traceIocn5.svg'
let $ = require("jquery")
let $this = this
let map = ''
let infoWindow = ''
let details_field1 = ''
let details_field3 = ''
let details_field4 = ''
let details_field5 = ''
let details_field6 = ''
let details_field7 = ''
let details_myimgs = ''
let details_myinfo = ''
let alldels = ''
let showdels = ''
let alldata = ''
let count = ''
let fieldlist2 = ''
let pic_list = []
let big_num = 0
let timer = ''
let ajax_getting = false
let contenthtml = []
let convertor = null

export default {
  name: 'positionMap',
  components: {
    SelectMemberGroupMulti
  },
  data: function () {
    var startTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择开始时间'));
      } else {
        if (value.getTime() < new Date().getTime() - 365 * 24 * 60 * 60 * 1000) {
          return callback(new Error('不能选择1年以前的日期'));
        } else {
          callback();
        }
      }
    };
    var endTime = (rule, value, callback) => {
      var sumDays = ''
      if (!value) {
        return callback(new Error('请选择结束时间'));
      } else {
        if (util.getStampFromDateStr(new Date()) < util.getStampFromDateStr(value)) {
          return callback(new Error('不能选择当日以后的日期'));
        } else {
          sumDays = util.DateDiff(util.formatData1(this.ruleForm.start_time), util.formatData1(value))
          console.log(sumDays)
          if (util.getStampFromDateStr(this.ruleForm.start_time) > util.getStampFromDateStr(value)) {
            return callback(new Error('结束时间不能小于开始时间'));
          } else if (sumDays > 31) {
            return callback(new Error('导出时间范围不能超过一个月'));
          } else {
            callback();
          }
        }
      }
    };
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      admins: {
        sign_export: false,
        invisible_man: false
      },
      ishowPop: false,//是否显示图列
      isLookAll: false,//查看全部按钮
      pLoading: false,
      positionTrajectory: false,//是否开启轨迹地图
      positionDialogVisible: false,  // 导出弹层
      dialogPositionIsOpen: false, //是否开启位置上报
      isOpenPosition: false,  //是否开启引导方块--右上角
      isSelectCurrentUser: false, // 左侧列表是否选中状态
      team_id: '',
      project_id: '',
      /*小组人员选择*/
      all_groups: [],
      selected_members_groups: [],
      list: [],
      /*日期时间控件选择*/
      pmtime: new Date(),
      /*导出*/
      ruleForm: {
        start_time: new Date(),
        end_time: new Date(),
      },
      rules: {  //日期验证规则
        start_time: [
          { validator: startTime, trigger: 'change' }
        ],
        end_time: [
          { validator: endTime, trigger: 'change' }
        ]
      },
      require_field: [],//保存已设置字段信息
      userid_list: [], //当前项目下所有人员的user_id
      allUserId: [],  //当前项目下所有人员的user_id---用于选择小组人员时使用
      post_user_id: [],  //当前项目下所有人员的user_id
      sumCount: '',  //上报总人数
      alreadyMum: '',
      key_time: '', //缓存时间戳
      allSignMemberData: [], // 所有地图上的成员的足迹和轨迹上报点的经纬度
      alreadySignListData: [], // 已经上报的人数
      page_no: 1,
      page_size: 40,
    }
  },
  computed: {

  },
  watch: {

  },
  methods: {
    translate(point) {
      convertor = new BMap.Convertor();
      var pointArr = [];
      pointArr.push(point);
      convertor.translate(pointArr, 1, 5, function (data) {
        if (data.status === 0) {
          console.log('data=============', data);
        }
      })
    },
    init(AMap) {
      $this = this
      //初始化地图
      // 	map = new AMap.Map("container", {
      // 	resizeEnable: true,
      // 	zoom:11
      // });
      // //初始化地图自定义窗体
      // infoWindow = new AMap.InfoWindow({
      // 	isCustom: true,  //使用自定义窗体
      // 	autoMove:true,
      // 	offset: new AMap.Pixel(0, -30)
      // });
      map = new BMap.Map("container");          // 创建地图实例 
      var point = new BMap.Point(116.404, 39.925);  // 创建点坐标 
      map.centerAndZoom(point, 12);                 // 初始化地图，设置中心点坐标和地图级别
      map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
      var scaleCtrl = new BMap.ScaleControl();  // 添加比例尺控件
      map.addControl(scaleCtrl);
      // var zoomCtrl = new BMap.ZoomControl();  // 添加缩放控件
      // map.addControl(zoomCtrl);
      // console.log('zoomCtrl========', zoomCtrl)
      //初始化地图自定义窗体
      infoWindow = new BMap.InfoWindow('', {
        // isCustom: true,  //使用自定义窗体
        // autoMove: true,
        title: '签到位置',
        // offset: new BMap.Pixel(0, -30)
      });
      // console.log('map=======', map)
      $('.myCount').height($(window).height() - 60 - 60)
      $(window).resize(() => {
        $('.myCount').height($(window).height() - 60 - 60)
      })
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      //获取设置信息数据
      this.getSetting()
      //获取人员小组列表数据
      this.getMemberGroup()
      //获取权限 
      this.permission()
      //获取当前用户下级所有人员的user_id
      // this.getUserAdminMemberId()
      //获取所辖项目成员的位置上报点和轨迹上报点地图概览
      this.getAllMemberSignMap()
      $('#memberList').scroll(function () {
        clearTimeout(timer)
        timer = setTimeout(function () {
          var scrollTop = $('#memberList').scrollTop()
          var scrollHeight = $('#memberList').height();
          var scrollWhole = Math.max(scrollHeight - scrollTop);
          if (scrollWhole < 10) {
            $this.page_no++
            if (ajax_getting) {
              return
            } else {
              $this.getAllMemberAlready($this.page_no, 'scrollMore')
            }
          }
        }, 200)
      })
    },
    //展示图裂说明--左下角
    enter() {
      if ($('.pop_hover').css('display') === 'none') {
        $('.pop_hover').fadeIn()
      } else {
        $('.pop_hover').fadeOut()
      }
    },
    leave() {
      $('.pop_hover').fadeOut()
    },
    mapBig() {
      console.log('zoomIn==', map)
      map.zoomIn()
    },
    mapSmall() {
      map.zoomOut()
    },
    //---查看全部
    lookAllSign() {
      // map.clearMap();  // 清除地图覆盖物
      map.clearOverlays();
      this.isLookAll = false
      this.isSelectCurrentUser = false
      this.showAllSign()
    },
    //---查看大图
    bigImg() {
      let myimgs = $('.myimgs')
      let allImg = $('.pic img')
      for (var i = 0; i < allImg.length; i++) {
        let tempObj = {}
        tempObj.imgIndex = i
        tempObj.src = allImg[i].dataset.url
        tempObj.msrc = allImg[i].dataset.thumb_url
        let image = new Image();
        image.src = allImg[i].dataset.url
        image.onload = function () {
          tempObj.w = image.width
          tempObj.h = image.height
          pic_list.push(tempObj)
        }
        allImg[i].onclick = function () {
          let option = {
            bgOpacity: .8,
            // escKey: false,
            fullscreenEl: false,
            shareEl: false,
            showAnimationDuration: 0,
            hideAnimationDuration: 0
          }
          setTimeout(() => {
            pic_list.sort(sortId);
            function sortId(a, b) {
              return a.imgIndex - b.imgIndex
            }
            let url = this.getAttribute('data-url')
            let index = ''
            if (myimgs.length == 1) {
              pic_list.forEach((obj, i) => {
                if (obj.src == url) {
                  index = i
                }
              })
              console.log(index)
              console.log(pic_list)
              $this.$preview.open(parseInt(index), pic_list, option)
            } else {
              pic_list.forEach((obj, i) => {
                if (obj.src == url) {
                  obj.imgIndex = i
                  index = obj.imgIndex
                }
              })
              console.log(index)
              console.log(pic_list)
              $this.$preview.open(parseInt(index), pic_list, option)
            }
          }, 100)
          $('.pswp').css('z-index', 9999998)
          //  let url = this.getAttribute('data-url')
          //  let index = ''
          //  // let index = this.getAttribute('data-index')
          //  let option = {
          //    bgOpacity: .8,
          //    // escKey: false,
          //    fullscreenEl: false,
          //    shareEl: false,
          //    showAnimationDuration: 0,
          //    hideAnimationDuration: 0
          //  }
          //  let tempArr = []
          //  if(myimgs.length == 1){
          //  	pic_list.forEach((obj,i) => {
          //   	if(obj.src == url){
          //   		index = i
          //   	}
          //   })
          // console.log(index)
          //   console.log(pic_list)
          // $this.$preview.open(parseInt(index),pic_list, option)
          //  }else{
          //  	pic_list.forEach((obj,i) => {
          //   	if(obj.src == url){
          //   		obj.imgIndex = i
          //   		index = obj.imgIndex
          //   	}
          //   })
          // console.log(index)
          //   console.log(pic_list)
          // $this.$preview.open(parseInt(index),pic_list, option)
          //  }


          // if(myimgs.length == 1){
          // 	 pic_list.forEach((obj,i) => {
          // 	 	index = i
          //  	// if(obj.src == url){
          //  	// 	obj.imgIndex = i
          //  	// 	index = obj.imgIndex
          //  	// }
          //  })
          // 	 console.log(index)
          //  console.log(pic_list)
          // 	 $this.$preview.open(parseInt(index),pic_list, option)
          // }else{
          // 	pic_list.forEach((obj,i) => {
          //  	if(obj.src == url){
          //  		obj.imgIndex = i
          //  		index = obj.imgIndex
          //  	}
          //  })
          //  console.log(index)
          //  console.log(pic_list)
          // 	$this.$preview.open(parseInt(index),pic_list, option)
          // }
          // $('.pswp').css('z-index', 9999998)
        }
      }
    },
    //---当地图自定义窗口是上报位置信息的展示---当出现多次上报信息的时候
    getHtmlMore(data) {
      // console.log(data)
      data.sign_list.reverse().forEach((obj1, index) => {
        obj1.form_data.forEach((obj2) => {
          if (obj2.type === 'Location') {
            details_field1 = '<div class="info-title"><p>' + obj2.value.addr_name + '(' + obj2.value.addr + ')</p><i id="close_icon" class="close_icon el-dialog__close el-icon el-icon-close"></i></div>'
            fieldlist2 += '<div class="info-list" data-index="' + index + '" data-user-id="' + data.user_info.user_id + '" data-signtime="' + obj1.create_at + '" data-address="' + obj2.value.addr_name + '(' + obj2.value.addr + ')' + '"><h2>' + data.user_info.user_name + '<span>' + obj1.create_at + '</span><i class="el-icon-arrow-right"></i></h2></div>'
          }
        })
      })
      setTimeout(() => {
        let all = $('.info-list')
        for (var i = 0; i < all.length; i++) {
          all[i].onclick = function () {
            details_field6 = ''
            details_field7 = ''
            details_field1 = ''
            details_field3 = ''
            details_field4 = ''
            details_field5 = ''
            details_myinfo = ''
            count = ''
            details_myimgs = ''
            let currUserId = this.getAttribute('data-user-id')
            let currAddress = this.getAttribute('data-address')
            let currSigntime = this.getAttribute('data-signtime')
            let currIndex = this.getAttribute('data-index')
            let _index = $(this).index()
            $('.info-list').slideUp(100)
            $('.showdels').slideDown(100)
            setTimeout(() => {
              $this.bigImg()
            }, 100)

            if (_index == currIndex) {
              let clickCurrentInfo = {
                sign_list: [data.sign_list[currIndex]],
                user_info: data.user_info
              }
              $this.getHtmlOnce(clickCurrentInfo, 'details_list')


            }
            let str = ''
            for (var j = 0; j < contenthtml.length; j++) {
              str += contenthtml[j]
            }
            $('.showdels').html(details_myinfo + str)
            // data.sign_list.forEach((obj1)=>{
            // 	if(_index== currIndex){
            // 		console.log(obj1)
            // 		let clickCurrentInfo = {
            // 			sign_list:[obj1],
            // 			user_info:data.user_info
            // 		}
            // 		$this.getHtmlOnce(clickCurrentInfo,'details_list')
            // 	}
            // })

            // $('.showdels').html(details_myinfo+details_field3+details_field4+details_field5+details_field6+details_field7+details_myimgs)
          }
        }


      }, 1000)
    },
    //---当地图自定义窗口是上报位置信息的展示---当只有一次上报信息的时候
    getHtmlOnce(data, type_page) {
      // console.log(data)
      contenthtml = []
      let arr = []
      if (type_page == 'index') {
        arr = data.sign
      } else if (type_page == 'details') {
        arr = data.sign_list
      } else if (type_page == 'details_list') {
        arr = data.sign_list
      }
      arr.forEach((obj1) => {
        obj1.form_data.forEach((obj2) => {
          switch (obj2.type) {
            case "Location":
              details_field1 = '<div class="info-title"><p>' + obj2.value.addr_name + '(' + obj2.value.addr + ')</p><i id="close_icon" class="close_icon el-dialog__close el-icon el-icon-close"></i></div>'
              break;
            case "SingleText":
              if (obj2.value) {
                details_field3 = '<div data-class="details_field3" class="details_field3"><span class="title">' + obj2.title + ':' + '</span><p>' + obj2.value + '</p></div>'
              } else {
                details_field3 = '<div data-class="details_field3" class="details_field3"><span class="title">' + obj2.title + ':' + '</span><p style="color:#99A9BF">未填写</p></div>'
              }
              contenthtml.push(details_field3)
              break;
            case "TextArea":
              if (obj2.value) {
                details_field4 = '<div  data-class="details_field4" class="details_field4"><span class="title">' + obj2.title + ':' + '</span><p>' + obj2.value + '</p></div>'
              } else {
                details_field4 = '<div data-class="details_field4" class="details_field4"><span class="title">' + obj2.title + ':' + '</span><p style="color:#99A9BF">未填写</p></div>'
              }
              contenthtml.push(details_field4)
              break;
            case "Number":

              if (obj2.value) {
                details_field5 = '<div data-class="details_field5" class="details_field5"><span class="title">' + obj2.title + ':' + '</span><p>' + obj2.value + '</p></div>'
              } else {
                details_field5 = '<div data-class="details_field5" class="details_field5"><span class="title">' + obj2.title + ':' + '</span><p style="color:#99A9BF">未填写</p></div>'
              }
              contenthtml.push(details_field5)
              break;
            case "Select":
              if (obj2.value) {
                details_field6 = '<div data-class="details_field6" class="details_field6"><span class="title">' + obj2.title + ':' + '</span><p>' + obj2.value + '</p></div>'
              } else {
                details_field6 = '<div data-class="details_field6" class="details_field6"><span class="title">' + obj2.title + ':' + '</span><p style="color:#99A9BF">未填写</p></div>'
              }
              contenthtml.push(details_field6)
              break;
            case "Date":
              if (obj2.value) {
                details_field7 = '<div data-class="details_field7" class="details_field7"><span class="title">' + obj2.title + ':' + '</span><p>' + obj2.value + '</p></div>'
              } else {
                details_field7 = '<div data-class="details_field7" class="details_field7"><span class="title">' + obj2.title + ':' + '</span><p style="color:#99A9BF">未填写</p></div>'
              }
              contenthtml.push(details_field7)
              break;
            case "Imageview":
              var imgdiv = ''
              pic_list = []
              big_num = 0
              for (var i = 0; i < obj2.value.url.length; i++) {
                //            	let tempObj = {}
                // tempObj.imgIndex = i
                // tempObj.src = obj2.value.url[i]
                // tempObj.msrc = obj2.value.thumb_url[i]
                // let image = new Image();
                // image.src = obj2.value.url[i]
                // image.onload = function(){
                // 	tempObj.w = image.width
                // 	tempObj.h = image.height
                // 	pic_list.push(tempObj)
                // 	big_num ++
                // 	if(big_num == obj2.value.url.length){
                // 		$this.bigImg()
                // 	}
                // }
                imgdiv += '<div class="pic"><img data-thumb_url="' + obj2.value.thumb_url[i] + '" data-url="' + obj2.value.url[i] + '" class="preview-img" data-index="' + i + '" src="' + obj2.value.thumb_url[i] + '" alt="" /></div>'
              }
              if (obj2.value.url.length != 0) {
                details_myimgs = '<div class="myimgs"><span class="title" >' + obj2.title + ':' + '</span><div class="imgbox">' + imgdiv + '</div></div>'
                contenthtml.push(details_myimgs)
              }
              break;
          }
          if (type_page == 'details' || type_page == 'details_list') {
            details_myinfo = '<div class="user-info"><h2>' + data.user_info.user_name + '<span class="user-time" >' + obj1.create_at + '</span></h2></div>'
          } else {
            if (this.isLookAll == true) {
              details_myinfo = '<div class="user-info"><h2>' + obj1.user_name + '<span class="user-time" >' + obj1.create_at + '</span></h2></div>'
            } else {
              details_myinfo = '<div class="user-info"><h2 style="height:24px;line-height:24px;"><em>' + obj1.user_name + '</em><b class="time-left" >' + obj1.create_at + '</b> <span style="margin-top:0px;" class="more-btn">更多位置</span></h2></div>'
            }
          }
        })
      })

    },
    //---当地图上自定义窗口是轨迹信息时的展示
    showTraceList(data, type_page) {
      //console.log(data)
      data.forEach((item) => {
        if (type_page == 'more') {
          details_field1 = '<div class="info-title trace-title" style="width:255px;"><p>' + item.poi_name + '</p><i id="close_icon" class="close_icon el-dialog__close el-icon el-icon-close"></i></div>'
          details_myinfo = '<div class="user-info" style="margin-bottom:10px;"><h2><em>' + item.user_name + '</em><b class="time-left" >' + item.start_time + '</b> <span class="more-btn" style="margin-right: 0px;">更多位置</span></h2></div>'
        } else {
          details_field1 = '<div class="info-title trace-title"><p>' + item.poi_name + '</p><i id="close_icon" class="close_icon el-dialog__close el-icon el-icon-close"></i></div>'
          details_myinfo = '<div class="user-info" style="margin-bottom:10px;"><h2>' + item.user_name + '<span class="user-time" >' + item.start_time + '</span></h2></div>'
        }
        if (item.trace_type == 1) {
          alldels = '<div class="alldels tracedels">' + details_myinfo + '<p style="height:32px;line-height:32px;">起点：' + item.start_time + '，电量：' + item.battery_remain + '</p></div>'
        } else if (item.trace_type == 2) { //停留
          alldels = '<div class="alldels tracedels">' + details_myinfo + '<p>停留：' + item.start_time + '-' + item.end_time + '，停留：' + item.time_length + '，电量：' + item.battery_remain + '</p></div>'
        } else if (item.trace_type == 3) { //离线
          alldels = '<div class="alldels tracedels">' + details_myinfo + '<p style="height:32px;line-height:32px;">离线：' + item.start_time + '，电量：' + item.battery_remain + '</p></div>'
        } else if (item.trace_type == 4) { //上线
          alldels = '<div class="alldels tracedels">' + details_myinfo + '<p style="height:32px;line-height:32px;">上线：' + item.start_time + '，电量：' + item.battery_remain + '</p></div>'
        } else if (item.trace_type == 5) { //终点
          alldels = '<div class="alldels tracedels">' + details_myinfo + '<p style="height:32px;line-height:32px;">终点：' + item.start_time + '，电量：' + item.battery_remain + '</p></div>'
        } else {
          if (type_page == 'more') {
            alldels = '<div class="alldels tracedels" style="padding: 13px 22px 8px 22px;">' + details_myinfo + '</div>'
          }
        }
      })
    },
    //---展示当前用户的地图打点及轨迹信息
    showCurrentUserDetails(item, type_page) {
      // map.clearMap();  // 清除地图覆盖物
      map.clearOverlays();
      details_myimgs = ''
      this.isLookAll = true
      this.isSelectCurrentUser = item.user_id
      let that = this
      let marker = ''
      let marker2 = ''
      if (type_page == 'more') {
        let newitem = ''
        if (item.flag == 1) {
          newitem = {
            user_name: item.sign[0].user_name,
            user_id: item.sign[0].user_id,
            create_at: item.sign[0].create_at,
            form_data: item.sign[0].form_data,
            flag: item.flag
          }
        } else {
          newitem = {
            user_name: item.trace[0].user_name,
            user_id: item.trace[0].user_id,
            flag: item.flag
          }
        }
        item = newitem
      }
      util.ajax({
        url: '/sign/map/user',
        type: 'GET',
        data: {
          'team_id': this.team_id,
          'project_id': this.project_id,
          'date': util.formatData1(this.pmtime),//'2018-01-15',//util.formatData1(this.pmtime),
          'user_id': item.user_id,
          'map_type': 1
        },
        timeout: 10000,
        success: (res) => {
          if (res && res.errno == 0) {
            //所有上报打点
            let zIndex = ''
            let allSignList = res.data.sign_list
            // console.log('allSignList======', allSignList)
            let pt = null;
            for (var i = 0; i < allSignList.length; i++) {
              for (var k = 0; k < res.data.trace_list.length; k++) {
                if (res.data.trace_list[k].trace_type != 0) {
                  if (allSignList[i].lng + allSignList[i].lat == res.data.trace_list[k].lng + res.data.trace_list[k].lat) {
                    zIndex = 999
                  }
                }
              }
              // console.log('vvvvvvvvv=======', allSignList[i].lng)
              pt = new BMap.Point(allSignList[i].lng, allSignList[i].lat);
              marker = new BMap.Marker(pt, {
                content: '<div class="pDefaultIcon" style="background:url(' + pDefaultIconNum + ') no-repeat center bottom;width: 30px;height:35px;line-height:29px;text-align:center;color:#ffffff;font-size:13px;font-weight:600;"">' + (i + 1) + '</div>',
                // map: map,
                // zIndex: zIndex,
                // offset: new BMap.Pixel(-17, -25),
                // position: [allSignList[i].lng, allSignList[i].lat]
              });
              marker.index = i;
              marker.currentItem = allSignList[i]
              marker.content = ''
              marker.adds = allSignList[i].poi_name
              marker.lngs = allSignList[i].lng + allSignList[i].lat
              map.addOverlay(marker);
              let label = new BMap.Label(i + 1, { offset: new BMap.Size(20, 20) });
              label.setStyle({
                background: '#FFD700',
                padding: '3px',
                color: '#fff',
                fontWeight: 'bold',
                border: 'none'
              });
              marker.setLabel(label);
              marker.addEventListener('click', function (e) {
                console.log(e)
                details_field3 = ''
                details_field4 = ''
                details_field5 = ''
                details_field6 = ''
                details_field7 = ''
                details_field1 = ''
                details_myinfo = ''
                alldels = ''
                count = ''
                fieldlist2 = ''
                showdels = ''
                alldata = ''
                contenthtml = []
                let repeatArr = []
                allSignList.forEach((item) => {
                  // if(e.target.currentItem.poi_name == item.poi_name){
                  // 	repeatArr.push(item)
                  // 	console.log(item)
                  // }
                  if (e.target.lngs == item.lng + item.lat) {
                    // console.log(item)
                    repeatArr.push(item)
                  }
                })
                let currentData = {
                  sign_list: repeatArr,
                  user_info: item
                }
                if (repeatArr.length == 1) {
                  that.getHtmlOnce(currentData, 'details')
                  let str = ''
                  for (var j = 0; j < contenthtml.length; j++) {
                    str += contenthtml[j]
                  }
                  // $('.showdels').html(details_myinfo+str)

                  // alldels = '<div class="alldels">'+details_myinfo+details_field3+details_field4+details_field5+details_field6+details_field7+details_myimgs+'</div>'
                  alldels = '<div class="alldels">' + details_myinfo + str + '</div>'
                  count = details_field1 + '<div class="info-content">' + alldels + '</div>' + '<div class="icons"><i class="sj_icon" style="margin-left:-12px;"></i></div>'
                  e.target.content = count
                  console.log('12345')
                  infoWindow.setContent(e.target.content);
                  map.openInfoWindow(infoWindow, e.target.getPosition());
                  setTimeout(() => {
                    $('#close_icon').click(function (event) {
                      map.closeInfoWindow();
                      $('.pDefaultIcon').removeClass('pSelectIconNum')
                    })
                    $this.bigImg()
                  }, 100)
                } else {
                  that.getHtmlMore(currentData)

                  let str = ''
                  for (var j = 0; j < contenthtml.length; j++) {
                    str += contenthtml[j]
                  }
                  showdels = '<div class="showdels"></div>'
                  alldata = '<div class="alldata">' + fieldlist2 + showdels + '</div>'
                  count = details_field1 + '<div class="info-content">' + alldata + '</div>' + '<div class="icons"><i class="sj_icon" style="margin-left:-12px;"></i></div>'
                  e.target.content = count
                  //关闭信息窗体
                  setTimeout(() => {
                    $('#close_icon').click(function (event) {
                      if ($('.showdels').css('display') === 'none') {
                        // map.clearInfoWindow();
                        map.closeInfoWindow();
                        $('.pDefaultIcon').removeClass('pSelectIconNum')
                      } else {
                        $('.info-list').slideDown(100)
                        $('.showdels').slideUp(100)
                      }
                    })


                  }, 100)
                }
                if (e.lnglat) {
                  map.setCenter([e.lnglat.lng, e.lnglat.lat])
                  infoWindow.setContent(e.target.content);
                  infoWindow.open(map, e.target.getPosition());
                  $('.traceIocnDefault').removeClass('activeIcon1')
                  $('.traceIocnDefault').removeClass('activeIcon2')
                  $('.traceIocnDefault').removeClass('activeIcon3')
                  $('.traceIocnDefault').removeClass('activeIcon4')
                  $('.traceIocnDefault').removeClass('activeIcon5')
                  $('.pDefaultIcon').removeClass('pSelectIconNum')
                  $('.amap-marker').css({
                    'z-index': 100
                  })
                  $('.pDefaultIcon').each(function () {
                    if (e.target.index + 1 == $(this).text()) {
                      $(this).addClass('pSelectIconNum')
                      $(this).parent().parent().css({
                        'z-index': 120
                      })
                    }
                  })
                }
              })

            }

            //所有轨迹打点
            let trace_list = res.data.trace_list
            let icon = ''
            let offset = ''
            let lineArr = []
            let arr_null = []
            let arr = []
            let polyline = ''
            let isHas = false
            let prem = []

            //轨迹点之间连线描绘
            for (let i = 0; i < trace_list.length - 1; i++) {
              if (trace_list[i].trace_type == 3 || trace_list[i + 1].trace_type == 4) {
                if (trace_list[i + 1].trace_type == 4) {
                  lineArr.push([trace_list[i].lng, trace_list[i].lat])
                }
                isHas = true
                polyline = new BMap.Polyline({
                  path: lineArr,          //设置线覆盖物路径
                  strokeColor: "#63bd9f",//"#8b8f96" "#70c2a6", //线颜色
                  strokeOpacity: 1,       //线透明度
                  strokeWeight: 6,        //线宽
                  strokeStyle: "solid",   //线样式 dashed /solid
                  showDir: true,
                  isOutline: true,
                  borderWeight: 1,
                  outlineColor: '#41997B',
                  lineJoin: 'bevel',
                  strokeDasharray: [10, 5] //补充线样式
                });
                polyline.setMap(map)
                lineArr = []
                polyline = new BMap.Polyline({
                  path: [[trace_list[i].lng, trace_list[i].lat], [trace_list[i + 1].lng, trace_list[i + 1].lat]],          //设置线覆盖物路径
                  strokeColor: "#8b8f96",//"#8b8f96" "#70c2a6", //线颜色
                  strokeOpacity: 1,       //线透明度
                  strokeWeight: 3,        //线宽
                  strokeStyle: "dashed",   //线样式 dashed /solid
                  lineJoin: 'bevel',
                  // zIndex: 51,
                  strokeDasharray: [10, 5] //补充线样式
                });
                polyline.setMap(map)
              } else {
                lineArr.push([trace_list[i].lng, trace_list[i].lat])
                if (i == trace_list.length - 2) {
                  lineArr.push([trace_list[i + 1].lng, trace_list[i + 1].lat])
                  polyline = new BMap.Polyline({
                    path: lineArr,          //设置线覆盖物路径
                    strokeColor: "#70c2a6",//"#8b8f96" "#70c2a6", //线颜色
                    strokeOpacity: 1,       //线透明度
                    strokeWeight: 6,        //线宽
                    strokeStyle: "solid",   //线样式 dashed /solid
                    showDir: true,
                    isOutline: true,
                    borderWeight: 1,
                    outlineColor: '#4a9e81',
                    lineJoin: 'bevel',
                    strokeDasharray: [10, 5] //补充线样式
                  });
                  polyline.setMap(map);
                }
              }
              // if(trace_list[i].trace_type == 3){
              // 	isHas = true
              // 	let de = []
              //     de.push([trace_list[i+1].lng,trace_list[i+1].lat])
              //     de.push([trace_list[i].lng,trace_list[i].lat])
              // 	polyline = new BMap.Polyline({
              //         path: de,          //设置线覆盖物路径
              //         strokeColor: "#8b8f96",//"#8b8f96" "#70c2a6", //线颜色
              //         strokeOpacity: 1,       //线透明度
              //         strokeWeight: 3,        //线宽
              //         strokeStyle: "dashed",   //线样式 dashed /solid
              //         lineJoin:'bevel',
              //         zIndex: 51,
              //         strokeDasharray: [10, 5] //补充线样式
              //     });
              //     polyline.setMap(map);
              // }
              // if(trace_list[i].trace_type == 4){
              // 	isHas = true
              // 	console.log(lineArr)
              // 	polyline = new BMap.Polyline({
              //         path: lineArr,          //设置线覆盖物路径
              //         strokeColor: "#63bd9f",//"#8b8f96" "#70c2a6", //线颜色
              //         strokeOpacity: 1,       //线透明度
              //         strokeWeight: 6,        //线宽
              //         strokeStyle: "solid",   //线样式 dashed /solid
              //         showDir:true,
              //         isOutline:true,
              //         borderWeight:1,
              //         outlineColor:'#41997B',
              //         lineJoin:'bevel',
              //         strokeDasharray: [10, 5] //补充线样式
              //     });
              //     polyline.setMap(map);
              //     let de = []
              //     de.push([trace_list[i-1].lng,trace_list[i-1].lat])
              //     de.push([trace_list[i].lng,trace_list[i].lat])
              // 	polyline = new BMap.Polyline({
              //         path: de,          //设置线覆盖物路径
              //         strokeColor: "#8b8f96",//"#8b8f96" "#70c2a6", //线颜色
              //         strokeOpacity: 1,       //线透明度
              //         strokeWeight: 3,        //线宽
              //         strokeStyle: "dashed",   //线样式 dashed /solid
              //         lineJoin:'bevel',
              //         zIndex: 51,
              //         strokeDasharray: [10, 5] //补充线样式
              //     });
              //     polyline.setMap(map);
              //     // lineArr.push([trace_list[i].lng,trace_list[i].lat])
              // }else{
              // 	lineArr.push([trace_list[i].lng,trace_list[i].lat])
              // }
            }
            // if(!isHas){
            // 	polyline = new BMap.Polyline({
            //         path: lineArr,          //设置线覆盖物路径
            //         strokeColor: "#70c2a6",//"#8b8f96" "#70c2a6", //线颜色
            //         strokeOpacity: 1,       //线透明度
            //         strokeWeight: 6,        //线宽
            //         strokeStyle: "solid",   //线样式 dashed /solid
            //         showDir:true,
            //         isOutline:true,
            //         borderWeight:1,
            //         outlineColor:'#4a9e81',
            //         lineJoin:'bevel',
            //         strokeDasharray: [10, 5] //补充线样式
            //     });
            //     polyline.setMap(map);
            // }

            for (var i = 0; i < trace_list.length; i++) {
              if (trace_list[i].trace_type == 0) {
                arr_null.push(trace_list[i])
              } else {
                arr.push(trace_list[i])
              }
            }
            for (var i = 0; i < arr.length; i++) {
              for (var j = i + 1; j < arr.length;) {
                if (arr[i].lng + arr[i].lat == arr[j].lng + arr[j].lat && arr[i].trace_type == arr[j].trace_type) {
                  if (arr[i].start_time > arr[j].start_time) {
                    arr.splice(j, 1)
                  } else {
                    arr.splice(i, 1)
                  }
                } else {
                  j++
                }
              }
            }
            // let pt = null;
            for (var j = 0; j < arr.length; j++) {
              if (arr[j].trace_type == 1) { // 起点
                icon = traceIocn1
                offset = new BMap.Pixel(-15, -33)
              } else if (arr[j].trace_type == 2) { //停留
                icon = traceIocn2
                offset = new BMap.Pixel(-20, -35)
              } else if (arr[j].trace_type == 3) { //离线
                icon = traceIocn3
                offset = new BMap.Pixel(-18, -35)
              } else if (arr[j].trace_type == 4) { //上线  
                icon = traceIocn4
                offset = new BMap.Pixel(-18, -35)
              } else if (arr[j].trace_type == 5) { //终点
                icon = traceIocn5
                offset = new BMap.Pixel(-15, -33)
              }
              pt = new BMap.Point(arr[j].lng, arr[j].lat);
              marker2 = new BMap.Marker(pt, {
                content: '<div class="pDefaultIcon traceIocnDefault" data-index="' + j + '" style="background:url(' + icon + ') no-repeat center bottom;width: 30px;height:40px;line-height:29px;text-align:center;color:#ffffff;font-size:13px;font-weight:600;"></div>',
                // map: map,
                // offset: offset,
                // position: [arr[j].lng, arr[j].lat]
              });
              marker2.index = j;
              marker2.currentItem = arr[j]
              marker2.content = ''
              map.addOverlay(marker2);
              marker2.addEventListener('click', function (e) {
                //console.log(e)
                details_field1 = ''
                details_myinfo = ''
                alldels = ''
                count = ''
                let traceArr = {
                  battery_remain: e.target.currentItem.battery_remain,
                  end_time: e.target.currentItem.end_time,
                  lat: e.target.currentItem.lat,
                  lng: e.target.currentItem.lng,
                  poi_name: e.target.currentItem.poi_name,
                  start_time: e.target.currentItem.start_time,
                  time_length: e.target.currentItem.time_length,
                  trace_type: e.target.currentItem.trace_type,
                  user_id: item.user_id,
                  user_name: item.user_name,
                }
                that.showTraceList([traceArr], '')
                count = details_field1 + '<div class="info-content  info-content-trace">' + alldels + '</div>' + '<div class="icons"><i class="sj_icon"></i></div>'
                e.target.content = count

                setTimeout(() => {
                  $('#close_icon').click(function (event) {
                    map.clearInfoWindow();
                    $('.traceIocnDefault').removeClass('activeIcon1')
                    $('.traceIocnDefault').removeClass('activeIcon2')
                    $('.traceIocnDefault').removeClass('activeIcon3')
                    $('.traceIocnDefault').removeClass('activeIcon4')
                    $('.traceIocnDefault').removeClass('activeIcon5')
                    $('.pDefaultIcon').removeClass('pSelectIconNum')
                  })
                })
                if (e.lnglat) {
                  map.setCenter([e.lnglat.lng, e.lnglat.lat])
                  infoWindow.setContent(e.target.content);
                  infoWindow.open(map, e.target.getPosition());
                  $('.pDefaultIcon').removeClass('pSelectIconNum')
                  $('.traceIocnDefault').removeClass('activeIcon1')
                  $('.traceIocnDefault').removeClass('activeIcon2')
                  $('.traceIocnDefault').removeClass('activeIcon3')
                  $('.traceIocnDefault').removeClass('activeIcon4')
                  $('.traceIocnDefault').removeClass('activeIcon5')
                  $('.amap-marker').css({
                    'z-index': 100
                  })
                  for (var i = 0; i < $('.traceIocnDefault').length; i++) {
                    if (e.target.index == $('.traceIocnDefault').eq(i).attr('data-index')) {
                      if (e.target.currentItem.trace_type == 1) { //起点
                        $('.traceIocnDefault').eq(i).addClass('activeIcon1')
                      } else if (e.target.currentItem.trace_type == 2) { //停留
                        $('.traceIocnDefault').eq(i).addClass('activeIcon2')
                      } else if (e.target.currentItem.trace_type == 3) { //离线
                        $('.traceIocnDefault').eq(i).addClass('activeIcon3')
                      } else if (e.target.currentItem.trace_type == 4) { //上线
                        $('.traceIocnDefault').eq(i).addClass('activeIcon4')
                      } else if (e.target.currentItem.trace_type == 5) { //终点
                        $('.traceIocnDefault').eq(i).addClass('activeIcon5')
                      }
                      $('.traceIocnDefault').eq(i).parent().parent().css({
                        'z-index': 120
                      })
                    }
                  }
                }
              })
              // map.setFitView();
            }

            // map.setFitView();
            map.setViewport({
              center: pt,
              zoom: 18
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
    //---在地图上打点
    showAllSign() {
      // map.clearMap();  // 清除地图覆盖物
      map.clearOverlays();
      // map.setZoom(12)
      this.isLookAll = false
      let that = this
      let marker = ''
      let lastLng = this.allSignMemberData
      // console.log('lastLng======', lastLng)
      for (var i = 0; i < lastLng.length; i++) {
        for (var j = i + 1; j < lastLng.length;) {
          if (lastLng[i].lng + lastLng[i].lat == lastLng[j].lng + lastLng[j].lat) {
            lastLng.splice(j, 1)
          } else {
            j++
          }
        }
      }
      // console.log('lastLng======222', lastLng)
      let pt = null;
      for (var i = 0; i < lastLng.length; i++) {
        pt = new BMap.Point(lastLng[i].lng, lastLng[i].lat);
        marker = new BMap.Marker(pt, {
          content: '<div class="pDefaultIcon" data-index="' + i + '" style="background:url(' + pDefaultIcon + ') no-repeat center bottom;width: 30px;height:47px;line-height:54px;text-align:center;color:#ffffff;font-size:13px;font-weight:600;""></div>',
          // map: map,
          // offset: new BMap.Pixel(-17, -40),
          // position: [lastLng[i].lng, lastLng[i].lat]
        });
        console.log('marker====', marker)
        marker.index = i
        marker.content = ''
        marker.currentItem = lastLng[i]
        marker.adds = lastLng[i].lng + lastLng[i].lat
        map.addOverlay(marker);
        // let label = new BMap.Label(i + 1, { offset: new BMap.Size(20, 20) });
        // label.setStyle({
        //   background: '#FFD700',
        //   padding: '3px',
        //   color: '#fff',
        //   fontWeight: 'bold',
        //   border: 'none'
        // });
        // marker.setLabel(label);
        marker.addEventListener('click', function (e) {
          // console.log('e=================', e);
          alldels = ''
          count = ''
          details_myimgs = ''
          contenthtml = []
          util.ajax({
            url: '/sign/dot/detail',
            type: 'GET',
            data: {
              'team_id': that.team_id,
              'project_id': that.project_id,
              'flag': e.target.currentItem.flag,
              'id': e.target.currentItem.id
            },
            timeout: 10000,
            success: (res) => {
              // console.log(res, '==================')
              // return;
              if (res && res.errno == 0) {
                if (res.data.flag == 1) {
                  that.getHtmlOnce(res.data, 'index')
                  let str = ''
                  for (var j = 0; j < contenthtml.length; j++) {
                    str += contenthtml[j]
                  }
                  alldels = '<div class="alldels">' + details_myinfo + str + '</div>'
                  count = details_field1 + '<div class="info-content">' + alldels + '</div>' + '<div class="icons"><i class="sj_icon" style="margin-left:-12px;"></i></div>'
                } else if (res.data.flag == 2) {
                  that.showTraceList(res.data.trace, 'more')
                  count = details_field1 + '<div class="info-content">' + alldels + '</div>' + '<div class="icons"><i class="sj_icon" style="margin-left:-12px;"></i></div>'
                }
                e.target.content = count
                console.log('e==', e)
                setTimeout(() => {
                  $('#close_icon').click(function (event) {
                    map.closeInfoWindow();
                    $('.pDefaultIcon').removeClass('pSelectIcon')
                  })
                  $('.more-btn').on('click', function () {
                    that.showCurrentUserDetails(res.data, 'more')
                  });
                  $this.bigImg()
                }, 100)
                // if (Object.keys(e.lnglat).length) {
                console.log('zzzz')
                // map.setCenter([e.lnglat.lng, e.lnglat.lat])
                infoWindow.setContent(e.target.content);
                // infoWindow.open(map, e.target.getPosition());
                map.openInfoWindow(infoWindow, e.target.getPosition());
                $('.pDefaultIcon').removeClass('pSelectIcon')
                $('.amap-marker').css({
                  'z-index': 100
                })
                for (var i = 0; i < $('.pDefaultIcon').length; i++) {
                  if (e.target.index == $('.pDefaultIcon').eq(i).attr('data-index')) {
                    $('.pDefaultIcon').eq(i).addClass('pSelectIcon')
                    $('.pDefaultIcon').eq(i).parent().parent().css({
                      'z-index': 120
                    })
                  }
                }
                // }
              } else {
                that.$message({
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
              that.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
            }
          })
        })
        // map.setFitView();
        map.setViewport({
          center: pt,
          zoom: 18
        })
      }
    },
    //---获取位置和轨迹已上报人员数据
    getAllMemberAlready(page_no, type) {
      //console.log(page_no)
      util.ajax({
        url: '/sign/position_trace/already',
        type: 'GET',
        data: {
          'team_id': this.team_id,
          'project_id': this.project_id,
          'date': util.formatData1(this.pmtime),//'2018-01-15',//util.formatData1(this.pmtime),
          'key_time': this.key_time,
          'page_no': page_no,
          'page_size': this.page_size,
          'user_id_list': JSON.stringify(this.post_user_id) || [],
          'map_type': 1
        },
        timeout: 10000,
        success: (res) => {
          //console.log(res)
          if (res && res.errno == 0) {
            if (type == 'scrollMore') {
              if (res.data.list.length == 0) {
                ajax_getting = true
                return
              } else {
                res.data.list.forEach((item) => {
                  this.alreadySignListData.push(item)
                })
                ajax_getting = false
              }
            } else {
              this.alreadySignListData = res.data.list
            }

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
    //---获取所辖项目成员的位置上报点和轨迹上报点地图概览
    getAllMemberSignMap() {
      this.pLoading = true
      if (this.userid_list.length > 0) {
        this.post_user_id = this.userid_list
      } else {
        this.post_user_id = this.allUserId
      }
      this.post_user_id = [...new Set(this.post_user_id)]
      //console.log(this.post_user_id)
      util.ajax({
        url: '/sign/map/overview',
        type: 'GET',
        data: {
          'team_id': this.team_id,
          'project_id': this.project_id,
          'date': util.formatData1(this.pmtime),//'2018-01-15',//util.formatData1(this.pmtime),
          'user_id_list': JSON.stringify(this.post_user_id) || [],
          'map_type': 1
        },
        timeout: 10000,
        success: (res) => {
          //console.log(res)
          this.pLoading = false
          if (res && res.errno == 0) {
            this.key_time = res.data.key_time
            this.allSignMemberData = res.data.list
            this.sumCount = res.data.absence_user_num + res.data.already_user_num
            this.alreadyMum = res.data.already_user_num
            //获取位置和轨迹已上报人员数据
            this.getAllMemberAlready(this.page_no, '')
            this.showAllSign()
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'warning'
            });
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
    //---获取当前用户下级所有人员的user_id
    getUserAdminMemberId() {
      util.ajax({
        url: '/group/member_id_list',
        type: 'GET',
        data: {
          'team_id': this.team_id,
          'project_id': this.project_id
        },
        timeout: 10000,
        success: (res) => {
          if (res && res.errno == 0) {
            if (res.data_info.valid_user_id.length > 0) {
              this.userid_list = res.data_info.valid_user_id
              this.allUserId = res.data_info.valid_user_id
              this.sumCount = res.data_info.valid_user_id.length
              //获取所辖项目成员的位置上报点和轨迹上报点地图概览
              this.getAllMemberSignMap()
            }
          } else {
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
    /*导出相关内容*/
    //---确认
    positionDialogSubmint(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          util.isOnline(() => {
            let href = '/sea/api/1.0/client/v1/sign/project/exportsign?dmclient=pcweb&team_id=' + this.team_id + '&project_id=' + this.project_id + '&start_date=' + util.getStampFromDateStr(this.ruleForm.start_time) + '&end_date=' + util.getStampFromDateStr(this.ruleForm.end_time) + '&userid_list='
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
    //---取消
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.positionDialogVisible = false
    },
    //---去往设置位置监控页
    setPosition() {
      this.$router.replace('positionset')
    },
    //---时间日期切换
    onPmTimeChange(val) {
      this.pmtime = val
      this.checked = true
      this.list = []
      this.page_no = 1
      //获取所辖项目成员的位置上报点和轨迹上报点地图概览
      this.getAllMemberSignMap()

    },
    /*导航---小组人员选择组件*/
    //---显示组件--选择人员
    openGroupSelecter() {
      this.$refs.profile.openGroupSelecter()
    },
    //---显示组件——选择人员返回数据显示操作
    computedMemberGroup() {
      let members = 0,
        groups = 0
      this.selected_members_groups.forEach((obj) => {
        if (obj.selType === 'group') {
          groups++
        } else {
          members++
        }
      })
      if (groups == 0) {
        return `已选${members}人`
      } else if (members == 0) {
        return `已选${groups}组`
      } else {
        return `已选${groups}组、${members}人`
      }
    },
    //---点击确定后执行的函数
    confirmGroupSelecter(val) {
      this.page_no = 1
      this.userid_list = []
      this.list = []
      this.selected_members_groups = val
      this.selected_members_groups.forEach((obj) => {
        if (obj.selType === 'group') {
          obj.PeronnelList.forEach((o) => {
            this.userid_list.push(o.user_id)
          })
        } else {
          this.userid_list.push(obj.id)
        }
      })
      //获取所辖项目成员的位置上报点和轨迹上报点地图概览
      this.getAllMemberSignMap()
    },
    //---获取可选择小组和人员列表
    getMemberGroup() {
      util.ajax({
        url: '/group/node_data_tree',
        type: 'GET',
        data: {
          group_id: 0,
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: (res) => {
          if (res && res.errno == 0) {
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
    //---获取权限 
    permission() {
      this.admins.sign_export = false
      this.admins.invisible_man = false
      util.ajax({
        url: '/permission/application',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          application_id: 2
        },
        timeout: 10000,
        success: (res) => {
          if (res && res.errno == 0) {
            res.data.forEach((item) => {
              if (item.id_name == 'sign_export') {
                console.log(item.id_name)
                this.admins.sign_export = true
              }
              if (item.id_name == 'invisible_man') {
                console.log(item.id_name)
                this.admins.invisible_man = true
              }
            })
            console.log(this.admins.sign_export)
            console.log(this.admins.invisible_man)
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
    /*引导弹层*/
    //---确认开启按钮
    openPosition() {
      this.dialogPositionIsOpen = false
      this.isOpenPosition = true
      this.require_field[0].info.tune_distance = 500
      //开启位置上报
      util.ajax({
        url: '/sign/project/deal',
        type: 'POST',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          switch: 1,
          trace_switch: 0,
          require_field: JSON.stringify(this.require_field),
          remind_time: []
        },
        timeout: 10000,
        success: (res) => {
          //console.log(res)
          if (res && res.errno == 0) {

          } else {
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
    //---关闭弹层
    closeTip() {
      this.isOpenPosition = false
    },
    //日期格式化“分秒”
    getLocalTime(timestr) {
      return util.getLocalTime(timestr, 'HH:mm')
    },
    //获取设置信息数据
    getSetting() {
      util.ajax({
        url: '/sign/project/setting',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: (res) => {
          //console.log(res)
          if (res && res.errno == 0) {
            this.require_field = res.data.setting_data.require_field
            if (res.data.setting_data.pop_tip == 1) {
              this.dialogPositionIsOpen = true
              this.positionTrajectory = true
            } else {
              this.dialogPositionIsOpen = false
              this.positionTrajectory = false
            }
            if (res.data.setting_data.trace_switch == 1) {
              this.ishowPop = true
            } else {
              this.ishowPop = false
            }
          } else {
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
    // MapLoader().then(AMap => {
    //   this.init(AMap)
    // // })
    this.$nextTick(()=>{
      const bodyHeight = document.body.clientHeight;
      const refContainer = this.$refs.container;
      refContainer.style.height = bodyHeight - 120 + 'px';
      // console.log('refContainer===', bodyHeight, refContainer, refContainer.offsetHeight)
      setTimeout(() => {
        this.init()
      }, 100);
    })
    // this.translate()
  },
  beforeDestroy() {
    // map && map.destroy();
  },
  watch: {
    '$route'(to, from) {
      // 对路由变化作出响应...
      // MapLoader().then(AMap => {
      //   this.init(AMap)
      // })
      // this.init()
    }
  }
}
</script>

<style>
/* 地图 */
.amap-info-close {
  display: none;
}
.activeIcon1 {
  background: url(../assets/imgs/position/traceIocn1_active.svg) no-repeat !important;
  width: 30px !important;
  height: 40px !important;
}
.activeIcon2 {
  background: url(../assets/imgs/position/traceIocn2_active.svg) no-repeat !important;
  width: 37px !important;
  height: 40px !important;
}
.activeIcon3 {
  background: url(../assets/imgs/position/traceIocn3_active.svg) no-repeat !important;
  width: 37px !important;
  height: 40px !important;
}
.activeIcon4 {
  background: url(../assets/imgs/position/traceIocn4_active.svg) no-repeat !important;
  width: 37px !important;
  height: 40px !important;
}
.activeIcon5 {
  background: url(../assets/imgs/position/traceIocn5_active.svg) no-repeat !important;
  width: 30px !important;
  height: 40px !important;
}
/* 地图点标记样式 */
.pSelectIcon {
  background: url(../assets/imgs/position/pd_icon_hover.svg) no-repeat !important;
  width: 31px !important;
  height: 47px !important;
  line-height: 32px !important;
  padding-left: 1px !important;
  text-align: center !important;
  color: #ffffff !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  z-index: 99999 !important;
  margin-top: 10px !important;
}
.pSelectIconNum {
  background: url(../assets/imgs/position/pd_num_hover.svg) no-repeat !important;
  width: 35px !important;
  height: 40px !important;
  line-height: 37px !important;
  padding-left: 1px !important;
  text-align: center !important;
  color: #ffffff !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  z-index: 99999 !important;
  margin-top: -7px !important;
  margin-left: -3px !important;
}
.amap-simple-marker-position-point {
  display: none !important;
}
#positionMap .amap-info-content {
  padding: 0px;
}
/*#positionMap .amap-info{
	position: absolute !important;
    left: 463px !important;
    top: 360px !important;
}*/

#positionMap .amap-info-outer,
.amap-menu-outer {
  border: none;
  box-shadow: none;
}

/* 地图自定义框样式 */

/* 地图自定义框----头部 */
#positionMap .info-title {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
#positionMap .info-title,
.details_field1 {
  width: 255px;
  padding: 12px 15px 12px 40px;
  font-size: 12px;
  font-weight: bold;
  text-align: left;
  color: #1f2d3d;
  letter-spacing: 1px;
  background: #ffffff url(../assets/imgs/position/l_icon.svg) no-repeat 14px
    center;
  position: relative;
  box-shadow: 0.5px 0px 2px 0 rgba(170, 172, 173, 0.5);
  margin: 0 auto;
}
#positionMap .trace-title {
  width: 205px;
  margin: 0 auto;
  background: #ffffff url(../assets/imgs/position/2_icon.svg) no-repeat 14px
    center;
}
#positionMap .info-title p,
.details_field1 p {
  margin-left: 6px;
  margin-right: 22px;
  line-height: 16px;
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
#positionMap .info-title .close_icon,
.details_field1 .close_icon {
  position: absolute;
  right: 16px;
  top: 16px;
  color: #c0ccda;
  cursor: pointer;
  display: none;
}
#positionMap .info-title .close_icon:hover {
  color: #6699ee;
}
#positionMap .details_field1 .close_icon:hover {
  color: #6699ee;
}
/* 地图自定义框---内容部分 */
#positionMap .info-content {
  width: 310px;
  max-height: 265px;
  /*border-top: 1px solid #eeeeee;*/
  background: #ffffff;
  overflow-y: auto;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
  margin: 0 auto;
}
#positionMap .info-content-trace {
  width: 260px;
  margin: 0 auto;
}
#positionMap .info-content h2 {
  font-size: 14px;
  font-weight: 600;
  color: #475669;
}
#positionMap .info-content h2 em {
  font-size: 14px;
  font-weight: 600;
  color: #475669;
}
#positionMap .info-content h2 span {
  float: right;
  font-size: 14px;
  color: #99a9bf;
  font-weight: normal;
  margin-right: 20px;
}
#positionMap .info-content-trace h2 span {
  float: right;
  font-size: 14px;
  color: #99a9bf;
  font-weight: normal;
  margin-right: 0px;
}
#positionMap .info-content h2 b {
}
#positionMap .info-content h2 .time-left {
  font-size: 14px;
  color: #475669;
  margin-left: 12px;
  font-weight: normal;
}
#positionMap .info-content h2 .more-btn {
  display: block;
  width: 58px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  border-radius: 2px;
  border: solid 1px #6699ee;
  font-size: 12px;
  font-weight: normal;
  color: #6699ee;
  /*margin-top: -5px;*/
}
#positionMap .info-content h2 .more-btn:hover {
  border: solid 1px #8bb1f2;
  color: #8bb1f2;
}
#positionMap .info-content h2 .more-btn:active {
  border: solid 1px #517ed6;
  color: #517ed6;
}
#positionMap .info-content p {
  color: #5e6d82;
  line-height: 1.3;
  width: 210px;
  float: left;
}
/*内容列表样式*/
#positionMap .info-content .info-list {
  height: 44px;
  line-height: 44px;
  border-bottom: 1px solid #eeeeee;
  padding: 0 10px 0 24px;
  position: relative;
  cursor: pointer;
}
#positionMap .info-content .info-list:last-child {
  border-bottom: none;
}
#positionMap .info-content .info-list .el-icon-arrow-right {
  position: absolute;
  right: 17px;
  top: 16px;
  width: 8px;
  height: 12.5px;
  color: #c0ccda;
}
/* 内容展开详情样式 */
#positionMap .info-content .showdels {
  display: none;
  padding: 12px 0px 12px 22px;
  background: #ffffff;
}
#positionMap .info-content .field1,
.field2,
.field3,
.field4,
.field5,
.field6,
.field7 {
  overflow: hidden;
  margin-top: 10px;
}
#positionMap .info-content .details_field1,
.details_field2,
.details_field3,
.details_field4,
.details_field5,
.details_field6,
.details_field7 {
  overflow: hidden;
  margin-top: 13px;
}
/*#positionMap .info-content .showdels .user-info{margin-bottom: 10px;}*/
/*#positionMap .info-content .showdels .user-info h2 span{margin-right: 0}*/
#positionMap .info-content .showdels span.title {
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
#positionMap .info-content .showdels p {
  float: left;
  width: auto;
  margin-right: 20px;
  line-height: 1.33;
}
#positionMap .info-content .myimgs {
  overflow: hidden;
  margin-top: 10px;
}
#positionMap .info-content .myimgs .imgbox {
  width: 193px;
  float: left;
}
#positionMap .info-content .myimgs .imgbox .pic {
  float: left;
  width: 58px;
  height: 60px;
  margin: 0 6px 6px 0;
}
#positionMap .info-content .myimgs .imgbox .pic img {
  width: 58px;
  height: 60px;
  cursor: pointer;
}

#positionMap .info-content .alldels {
  padding: 13px 0px 18px 22px;
  background: #ffffff;
}
#positionMap .info-content .tracedels {
  font-size: 14px;
  font-weight: normal;
  color: #5e6d82;
  line-height: 19px;
  text-align: left;
  overflow: hidden;
  padding: 13px 22px 18px 22px;
}
#positionMap .info-content .tracedels p {
  font-size: 14px;
  color: #5e6d82;
  width: 100%;
  float: left;
}
/*#positionMap .info-content .alldels .user-info{margin-bottom: 10px;}*/
#positionMap .info-content .alldels span.title {
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
#positionMap .icons {
  position: relative;
  width: 310px;
  height: 13px;
}
#positionMap .icons .sj_icon {
  display: block;
  position: absolute;
  left: 50%;
  margin-left: -13px;
  bottom: 1px;
  background-image: url(../assets/imgs/position/sj_icon2.svg);
  background-repeat: no-repeat;
  width: 24px;
  height: 13px !important;
  display: none;
}

#positionMap .el-checkbox__label {
  vertical-align: middle;
  padding-left: 8px;
  color: #5e6d82;
}
#positionMap .time {
  float: left;
}
#positionMap .time .el-input__inner {
  height: 28px;
}
#positionMap .set-buttons .btn-item span {
  font-size: 13px;
}

/* 导出弹层 */
#positionMap .el-dialog--tiny {
  width: 400px;
}
#positionMap .my-form {
  padding: 0 40px;
  margin-top: 40px;
  margin-bottom: 40px;
}
#positionMap .position-dialog .my-form .el-form-item {
  margin-bottom: 16px;
}
#positionMap .position-dialog .my-form .el-date-editor.el-input {
  width: 248px;
}
#positionMap .position-dialog .my-form .el-form-item__label {
  text-align: left;
}
#positionMap .position-dialog .el-dialog__footer {
  border-top: 1px solid #e0e6ed;
  padding-top: 16px;
}
#positionMap .position-dialog .el-form-item__error {
  position: static;
  margin-bottom: -7px;
}
</style>
<style scoped>
.myCount {
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
.myCount .right {
  float: right;
  height: 100%;
  width: calc(100% - 220px);
  position: relative;
}
.myCount .right .look-all {
  z-index: 99;
  position: absolute;
  left: 16px;
  top: 14px;
  width: 68px;
  height: 36px;
  line-height: 36px;
  border-radius: 6px;
  background: #ffffff url('../assets/imgs/position/lookall_icon.svg') no-repeat
    12px center;
  padding-left: 34px;
  box-shadow: 3px 0 4px 0 rgba(198, 201, 207, 0.5);
  font-size: 14px;
  color: #6699ee;
  cursor: pointer;
}
.myCount .right .look-all:hover {
  color: #8bb1f2;
}
.myCount .right .look-all:active {
  color: #517ed6;
}
.myCount .right #container {
  height: 100%;
  width: 100%;
  float: right;
}
.myCount .right .pop {
  width: 32px;
  height: 30px;
  background: #ffffff;
  position: absolute;
  z-index: 999;
  right: 16px;
  bottom: 102px;
  border-radius: 2px;
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
}
.myCount .right .pop a {
  display: block;
  width: 18px;
  height: 18px;
  margin: 0 auto;
}
.myCount .right .pop a img {
  display: block;
  margin: 0 auto;
  padding-top: 6px;
}
.myCount .right .pop .pop_hover {
  position: absolute;
  right: 35px;
  bottom: -78px;
  display: none;
}
.myCount .right .btns {
  width: 32px;
  height: 61px;
  background: #ffffff;
  position: absolute;
  right: 16px;
  bottom: 30px;
  border-radius: 2px;
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
  z-index: 999;
  padding: 1.5px 0;
}
.myCount .right .btns a {
  display: block;
  height: 30px;
  width: 32px;
  margin: 0 auto;
}
.myCount .right .btns a img {
  display: block;
  margin: 0 auto;
  padding-top: 8px;
}
.myCount .right .btns .line {
  margin: 0 auto;
  display: block;
  width: 24px;
  height: 1px;
  background-color: #e0e6ed;
}

/* 地图内容部分---左边列表 */
.myCount {
  width: 100%;
  position: relative;
  clear: both;
}
.myCount .left {
  float: left;
  width: 220px;
  height: 100%;
  background-color: #fafafa;
  box-shadow: 2px 2px 4px 0 rgba(225, 225, 225, 0.5);

  position: relative;
  z-index: 1;
}
.myCount .left h2 {
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
.myCount .left .member-list {
  margin-top: 49px;
  height: 90%;
  overflow-y: auto;
}
.myCount .left h2 span {
  color: #99a9bf;
  font-weight: normal;
  font-size: 14px;
}
.myCount .left h2 b {
  color: #5e6d82;
  font-size: 14px;
}
.myCount .left .member-list dl {
  height: 60px;
  border-bottom: 1px solid #eeeeee;
  padding: 0 15px 0 20px;
  position: relative;
  cursor: pointer;
}
.myCount .left .member-list .curr-selest-active {
  background: #ffffff;
}
.myCount .left .member-list dl:hover {
  background-color: #ffffff;
}
.myCount .left .member-list dl dt {
  width: 36px;
  height: 36px;
  border-radius: 36px;
  float: left;
  margin-top: 12px;
  margin-right: 14px;
  position: relative;
}
.myCount .left .member-list dl dt.deleted:after {
  content: '已离职';
  display: block;
  position: absolute;
  width: 36px;
  height: 36px;
  background-color: #000;
  opacity: 0.7;
  left: 0;
  top: 0;
  font-size: 10px;
  color: #fff;
  border-radius: 50%;
  line-height: 36px;
  text-align: center;
}
.myCount .left .member-list dl dt img {
  width: 36px;
  height: 36px;
  border-radius: 36px;
}
.myCount .left .member-list dl dt .noavatar {
  width: 36px;
  height: 36px;
  background: url(../assets/imgs/avatar.png) no-repeat center;
  background-size: contain;
}
.myCount .left .member-list dl dd {
  float: left;
}
.myCount .left .member-list dl dd h3 {
  font-size: 12px;
  color: #5e6d82;
  margin-bottom: 8px;
  margin-top: 12px;
}
.myCount .left .member-list dl dd h3 span {
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
.myCount .left .member-list dl dd h4 {
  clear: both;
  font-size: 12px;
  line-height: 1.33;
  text-align: left;
  color: #99a9bf;
}
.myCount .left .empty {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -56px;
}
.myCount .left .empty span {
  font-size: 16px;
  color: #c0ccda;
}

/* 头部导航 */
.head {
  padding: 0 20px;
  height: 54px;
  line-height: 54px;
  background-color: #ffffff;
  position: relative;
  box-shadow: 3px 0 4px 0 rgba(198, 201, 207, 0.5);
  border-bottom: 1px solid #e0e6ed;
}
.head h1 {
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  color: #475568;
  float: left;
}
.head .sel_item {
  float: left;
  margin-left: 136px;
}
.head .sel_item span {
  font-size: 13px;
  color: #5e6d82;
}
.head .sel_item .el-button--default.select_member span {
  font-size: 13px;
  color: #1f2d3d;
}
.head .sel_item .el-button--default.select_member:hover {
  border: 1px solid #c0ccda;
  color: #1f2d3d;
}
.head .sel_item .el-button--default.select_member:active,
.head .sel_item .el-button--default.select_member:focus {
  border: 1px solid #6699ee;
}
.head .checkbox {
  float: left;
  margin-left: 34px;
}
.head .set-buttons {
  float: right;
}
.head .set-buttons .btn-item {
  float: left;
  position: relative;
}
.head .set-buttons .export {
  margin-right: 30px;
}
.head .set-buttons .export .export-icon {
  display: block;
  width: 12px;
  height: 12px;
  background-image: url(../assets/imgs/shareIcon/export.svg);
  position: absolute;
  left: -16px;
  top: 21px;
}
.head .set-buttons .setico_svg {
  position: absolute;
  left: -16px;
  top: 20px;
}
/* 未开启位置监控弹层 */
.dialog-backgroud {
  width: 100%;
  height: 100%;
  background-color: #000000;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  right: 0px;
  top: 60px;
  z-index: 99;
}
#positionMap .positionIsOpen-dialog {
  width: 278px;
  height: 116px;
  margin-left: 45%;
  margin-top: 15%;
  background: url(../assets/imgs/position/bj_tip2.svg) no-repeat;
  position: relative;
}
#positionMap .positionIsOpen-dialog .tip-text {
  width: 192px;
  line-height: 21px;
  position: absolute;
  left: 44px;
  top: 35px;
}
#positionMap .positionIsOpen-dialog .tip-text p {
  font-size: 16px;
  text-align: left;
  color: #ffffff;
  text-shadow: 0 1px 1px rgba(246, 153, 78, 0.5);
}
#positionMap .positionIsOpen-dialog .openbtn {
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
  line-height: 6px;
}
#positionMap .positionIsOpen-dialog .el-button {
  border: solid 1px #ffffff !important;
}
#positionMap .positionIsOpen-dialog .el-button:hover {
  border: solid 1px #ffffff !important;
}
.head .isOpenPositionTip {
  width: 170px;
  height: 79.4px;
  background-image: url(../assets/imgs/position/kow2.svg);
  position: absolute;
  right: 8px;
  top: 48px;
  z-index: 99;
  padding: 18px 9px 12px 9px;
}
.head .isOpenPositionTip p {
  width: 168px;
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: normal;
  text-align: justify;
  color: #ffffff;
  text-shadow: 0 1px 1px #f6994e;
  margin-left: 6px;
}
.head .isOpenPositionTip a {
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
.pswp {
  z-index: 9999999;
}
</style>
<style >
/* .BMap_bubble_top {
  display: none!important;;
} */
.BMap_bubble_title {
  font-size: 16px;
}
</style>

