<template>
  <!-- 包括公共的顶部和侧边栏 -->
  <div class="applications" @click="closeProjectList">
    <!-- 顶部导航 -->
    <div class="title">
      <div class="left_back" @click="goBack">
        <i class="el-icon-arrow-left"></i>项目
      </div>
      <div class="line"></div>
      <div class="project_name" @click.stop="changeProjectName(null)">
        {{ project_name }}<span class="project_id">ID:{{ project_id }}</span
        ><i
          class="el-icon-caret-bottom"
          :class="{ show: show_project_list }"
        ></i>
      </div>
      <!-- 项目列表-下拉选择 -->
      <div class="project_list" v-show="show_project_list" @click.stop>
        <el-input
          v-model="search_project"
          placeholder="项目名称/ID"
          class="search_input"
        ></el-input>
        <div class="projects_title">进行中的项目</div>
        <div class="project_items">
          <template v-for="item in project_list_search">
            <div class="project_item" @click.stop="changeProjectName(item)">
              <div
                class="item_icon"
                :style="'background-image:url(' + item.logo + ');'"
              ></div>
              <div class="item_name" :title="item.name">{{ item.name }}</div>
              <div class="item_select" v-if="item.project_id == project_id">
                <i class="el-icon-check"></i>
              </div>
            </div>
          </template>
          <div class="noresult" v-if="!project_list_search.length">
            抱歉，没有找到该项目~
          </div>
        </div>
      </div>
      <userlogin :team-id="team_id"></userlogin>
    </div>
    <!-- 侧边栏和右侧主体内容 -->
    <div class="main">
      <div class="side_bar" :class="{ hide: hide_side_bar }" style="overflow:auto">
        <div class="side_bar_title">
          项目管理
          <div class="lines" @click="showSideBar">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
        </div>
        <div class="side_bar_items">
          <template v-for="app in app_list">
            <template>
              <div
                class="side_bar_item"
                :class="{
                  select: cur_app_id == app.app_id,
                  dep_num: app.app_id == '998',
                }"
                v-if="!hide_side_bar"
                @click="gotoApplication(app.app_id)"
              >
                <div
                  class="side_bar_item_icon"
                  :class="'app_icon_' + app.app_id"
                ></div>
                <div
                  class="departure_number"
                  v-show="departureNumber != 0 && app.app_id == '998'"
                >
                  {{ departureNumber }}
                </div>
                {{ app.app_name }}
              </div>
              <el-tooltip
                :enterable="false"
                transition="none"
                v-else
                effect="dark"
                :content="app.app_name"
                placement="right"
              >
                <div
                  class="side_bar_item hide_side_bar"
                  :class="{
                    select: cur_app_id == app.app_id,
                    dep_num: app.app_id == '998',
                  }"
                  @click="gotoApplication(app.app_id)"
                >
                  <div
                    class="side_bar_item_icon"
                    :class="'app_icon_' + app.app_id"
                  ></div>
                  <div
                    class="departure_number departure_number_icon"
                    v-show="departureNumber != 0 && app.app_id == '998'"
                  >
                    {{ departureNumber }}
                  </div>
                </div>
              </el-tooltip>
            </template>
            <!-- <template v-if="app.app_id==1">
              <div class="side_bar_item" :class="{'select': cur_app_id==1}" v-if="!hide_side_bar" @click="gotoApplication(app.app_id)">
                <div class="side_bar_item_icon kqgl"></div>
                {{app.app_name}}
              </div>
              <el-tooltip :enterable="false" transition="none" v-else effect="dark" :content="app.app_name" placement="right">
                <div class="side_bar_item hide_side_bar" :class="{'select': cur_app_id==1}" @click="gotoApplication(app.app_id)">
                  <div class="side_bar_item_icon kqgl"></div>
                </div>
              </el-tooltip>
            </template> -->
          </template>
        </div>
      </div>
      <!-- 二级路由入口 -->
      <!-- 子组件统一触发triggerAppFun 调用父组件方法 this.$emit('triggerAppFun',{funName:'departure_number'})-->
      <div class="routerView" :class="{ changeView: hide_side_bar }" style="height: calc(100vh - 60px)">
        <!-- <router-view
          class="kqaddmin_in"
          @triggerAppFun="triggerAppFun"
        ></router-view> -->
        <router-view
          @triggerAppFun="triggerAppFun"
        ></router-view>
      </div>
      <div class="clear"></div>
    </div>
  </div>
</template>

<script>
let $ = require("jquery");
// console.log($)

import * as util from "@/assets/js/util.js";

import Userlogin from "@/components/common/Userlogin";

export default {
  name: "applications",
  components: {
    Userlogin,
  },
  data() {
    return {
      team_id: 0,
      project_id: 0,
      project_name: "",
      show_project_list: false,
      hide_side_bar: false,
      search_project: "",
      window_pre_width: "", //窗口改变前的宽度
      project_list: [],
      app_list: [],
      cur_app_id: 0,
      project_type: "",
      is_premium_user: false,
      departureNumber: 0,
    };
  },
  computed: {
    project_list_search() {
      if (this.search_project) {
        let tempArr = [];
        this.project_list.forEach((obj) => {
          if (
            obj.name.indexOf(this.search_project) > -1 ||
            obj.project_id.indexOf(this.search_project) > -1
          ) {
            tempArr.push(obj);
          }
        });
        return tempArr;
      } else {
        return this.project_list;
      }
    },
  },
  methods: {
    init() {
      $(".side_bar").height($(window).height() - 60);
      $(".kqaddmin_in").height($(window).height() - 60);
      $(".routerView").height($(window).height() - 60);
      // util.setLocalStorage('applications_width',$('.applications').width())
      //滚动条至顶部
      $(window).scrollTop(0);
      //刷新页面 保持对应sidebar
      this.changeSideBar();
      //商保类型用户，通过企服登录用户
      let is_premium_user = util.getLocalStorage("is_premium_user");
      // console.log(is_premium_user);
      this.is_premium_user = is_premium_user == 1 ? true : false;
      //根据屏幕宽度 侧边栏 隐藏与否
      if ($(window).width() < 750) {
        this.hide_side_bar = true;
      }
      window.onresize = () => {
        $(".side_bar").height($(window).height() - 60);
        $(".kqaddmin_in").height($(window).height() - 60);
        $(".routerView").height($(window).height() - 60);
        // console.log($(window).width())
        if (this.window_pre_width < $(window).width()) {
          //放大
          if ($(window).width() > 1000) {
            this.hide_side_bar = false;
          }
        } else {
          //缩小
          if ($(window).width() < 750) {
            this.hide_side_bar = true;
          }
        }
        this.window_pre_width = $(window).width();
      };

      //获取用户信息
      // console.log(util.getLocalStorage('projectStorageInfo'))
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_name = util.getLocalStorage("projectStorageInfo").name;
      this.project_id = this.$route.params.projectId;
      document.title = this.project_name;
      this.getpermission();
      // console.log(this.project_id)
      //获取项目列表
      this.getProjectListData();
      //获取应用列表
      this.getAppList();
      //获取当前项目是否是全职项目
      this.getProjectType();
    },
    //获取当前项目是否是全职项目
    getProjectType() {
      util.ajax({
        url: "/project/overview",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
        },
        success: (res) => {
          //console.log(res)
          if (res && res.errno == 0) {
            this.project_type = res.data.list.project_type;
            window.localStorage.setItem('isNxProject', JSON.stringify(res.data.list.is_nx_project));
            window.localStorage.setItem('current_user_role_id', res.data.list.current_user_role_id);
            console.log('set--is_nx_project', res.data.list.is_nx_project)
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {},
      });
    },
    // 获取项目列表
    getProjectListData() {
      util.ajax({
        url: "/project/list/get",
        type: "GET",
        data: {
          team_id: this.team_id || 0,
          status: 1, //状态 1-进行中，2-停止, 0-所有(包括进行中和停止)
          page_no: "", //不传或空:取全量， 非空:从1开始(页码)
          view_type: util.getLocalStorage("viewtype"),
          page_size: "", //  不传或空:取全量， 非空:行数(大于0的整数)
        },
        timeout: 10000,
        success: (obj) => {
          // console.log('项目列表')
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.project_list = obj.data.list;
          }
          // ajax_getting = false;
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    //获取权限
    getpermission(){
      util.ajax({
        url:'/permission/application',
        type:'GET',
        data:{
          team_id:this.team_id,
          project_id:this.project_id,
          project_id: 0,
        },
        timeout:10000,
        success:(obj) => {
          if(obj && obj.errno == 0){
            // this.$store.commit('permission/setPermission',obj.data)
          }
        },
        error: (xhr, status) => {
          //网络超时
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
    getAppList(cb) {
      util.ajax({
        url: "/cloud/project/bar",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
        },
        success: (res) => {
          if (res.errno == 0) {
            console.log("applist-------------",res.data.result);
            this.app_list = res.data.result;
            
            console.log(this.app_list);
            if (cb) cb();
            this.departure_number();
          }
        },
        error: (xhr, status) => {
          console.log(xhr);
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    changeProjectName(item) {
      // console.log(item)

      if (item) {
        if (item.identity != 999999) {
          this.show_project_list = !this.show_project_list;
          this.project_id = item.project_id;
          this.project_name = item.name;
          document.title = this.project_name;
          this.team_id = item.team_id;
          //切换项目后 缓存的信息需要更新
          util.setLocalStorage("projectStorageInfo", item);

          //获取应用列表
          this.getAppList(() => {
            // 切换项目后如果需要跳回上级(某级)页面 在此配置
            let path = location.href.split("/").pop();
            path = path.indexOf("?") ? path.split("?")[0] : path;
            util.ajax({
              url: "/project/overview",
              type: "GET",
              data: {
                team_id: this.team_id,
                project_id: this.project_id,
              },
              success: (res) => {
                // debugger
                //console.log(res)
                if (res && res.errno == 0) {
                  this.project_type = res.data.list.project_type;
                  console.log("----------------------",this.app_list);
                  console.log(path);
                  if (
                    path === "customerconfirmpage" ||
                    path === "newcreatmail" ||
                    path === "kqConfirm" ||
                    path === "fullTimeConfirm" ||
                    path === "fullTimeCreatMail"
                  ) {
                    //客户确认
                    let isOK = this.app_list.some((item) => {
                      return item.app_id == 13;
                    });
                    if (isOK) {
                      //如果有对应应用  跳当前应用主页  否则跳 项目概览
                      if (this.project_type == 3) {
                        this.$router.push(
                          "/project/" + this.project_id + "/fullTimeConfirm"
                        );
                      } else {
                        this.$router.push(
                          "/project/" + this.project_id + "/customerconfirmpage"
                        );
                      }
                    } else {
                      this.$router.push(
                        "/project/" + this.project_id + "/overviews"
                      );
                    }
                  } else if (path === "kqeditpb" || path === "kqsettask") {
                    //考勤
                    this.$router.push(
                      "/project/" + this.project_id + "/kqtasklist"
                    );
                  }else if (path === "projectdetail") {
                    //考勤
                    this.$router.push(
                      "/project/" + this.project_id + "/overviews"
                    );
                  } else if (path === "positionmap" || path === "positionset") {
                    //位置上报
                    this.$router.push(
                      "/project/" + this.project_id + "/positionmap"
                    );
                  } else if (
                    path === "membererror" ||
                    path === "invitationmember" ||
                    path === "memberset" ||
                    path === "memberinfo"
                  ) {
                    //人员管理
                    this.$router.push(
                      "/project/" + this.project_id + "/memberadmin"
                    );
                  } else if (
                    path === "InsuranceMer" ||
                    path === "InsuranceM" ||
                    path === "InsuranceS" ||
                    path === "newLaborInsurance" ||
                    path === "insuranceAddPerson" ||
                    path === "insuranceReductPerson"
                  ) {
                    //保险
                    let isOK = this.app_list.some((item) => {
                      return item.app_id == 5;
                    });
                    if (isOK) {
                      //如果有对应应用  跳当前应用主页  否则跳 项目概览
                      // let finalPath = '/project/' + this.project_id + (path === "newLaborInsurance" || path === "insuranceAddPerson" ||path==="insuranceReductPerson")?path:'/insuranceMer'
                      //   this.$router.push(finalPath)

                      let finalPath =
                        path === "newLaborInsurance" ||
                        path === "insuranceAddPerson" ||
                        path === "insuranceReductPerson"
                          ? "/newLaborInsurance"
                          : "/insuranceMer";

                      let projectId = this.project_id;
                      let name = "/project/" + projectId + finalPath
                      this.$router.push({
                        path:name,
                        query: {
                          from: "insurancePlan",
                        },
                      });
                      // this.$router.push(
                      //   "/project/" + this.project_id + finalPath
                      // );
                    } else {
                      this.$router.push(
                        "/project/" + this.project_id + "/overviews"
                      );
                    }
                  } 
                  // else if (
                  //   path === "ssDetails" ||
                  //   path === "socialSecurity"
                  // ) {
                  //   // 社保管理
                  //   let isOK = this.app_list.some((item) => {
                  //     return item.app_id == 20;
                  //   });
                  //   // console.log(isOK)
                  //   if (isOK) {
                  //     //如果有对应应用  跳当前应用主页  否则跳 项目概览
                  //     this.$router.push(
                  //       "/project/" + this.project_id + "/socialSecurity"
                  //     );
                  //   } else {
                  //     this.$router.push(
                  //       "/project/" + this.project_id + "/overviews"
                  //     );
                  //   }
                  // } 
                  else if (
                    path === "ssTab" || path === "ssSafing"
                  ) {
                    // 社保管理
                    let isOK = this.app_list.some((item) => {
                      return item.app_id == 20;
                    });
                    // console.log(isOK)
                    if (isOK) {
                      //如果有对应应用  跳当前应用主页  否则跳 项目概览
                      this.$router.push(
                        "/project/" + this.project_id + "/ssTab"
                      );
                    } else {
                      this.$router.push(
                        "/project/" + this.project_id + "/overviews"
                      );
                    }
                  } 
                  else if (path === "projectset") {
                    //项目设置
                    let isOK = this.app_list.some((item) => {
                      return item.app_id == 999;
                    });
                    if (isOK) {
                      //如果有对应应用  跳当前应用主页  否则跳 项目概览
                      this.$router.push(
                        "/project/" + this.project_id + "/projectset"
                      );
                    } else {
                      this.$router.push(
                        "/project/" + this.project_id + "/overviews"
                      );
                    }
                  } else if (path === "KqeditRanking") {
                    this.$router.push(
                      "/project/" + this.project_id + "/" + "kqaddmin"
                    );
                  } else if (path === "DepartureManage") {
                    let isOK = this.app_list.some((item) => {
                      return item.app_id == 998;
                    });
                    if (isOK) {
                      this.$router.push(
                        "/project/" + this.project_id + "/" + "DepartureManage"
                      );
                    } else {
                      this.$router.push(
                        "/project/" + this.project_id + "/overviews"
                      );
                    }
                  }else if(path === "PaydayReport"){
                    let isOK = this.app_list.some((item) => {
                      return item.app_id == 23;
                    });
                    if (isOK) {
                      this.$router.push(
                        "/project/" + this.project_id + "/" + "PaydayReport"
                      );
                    } else {
                      this.$router.push(
                        "/project/" + this.project_id + "/overviews"
                      );
                    }
                  }else {
                    //通用----切换项目后原地址刷新
                    this.$router.push(
                      "/project/" + this.project_id + "/" + path
                    );
                  }
                }
              },
              error: (xhr, status) => {},
              noNetwork: () => {},
            });
          });
        } else {
          this.$message({
            showClose: true,
            message: "普通成员无权限访问。",
            type: "warning",
          });
        }
      } else {
        this.show_project_list = !this.show_project_list;
      }
    },
    closeProjectList() {
      // console.log(evt)
      if (this.show_project_list) {
        this.show_project_list = false;
      }
    },
    showSideBar() {
      this.hide_side_bar = !this.hide_side_bar;
      if (!this.hide_side_bar) {
        $(".fixedbar").width(window.innerWidth - 200 + "px");
      } else {
        $(".fixedbar").width(window.innerWidth - 56 + "px");
      }
    },
    goBack() {
      this.$router.push("/project");
    },
    gotoApplication(app_id) {
      console.log(app_id, 89888);
      //获取当前项目是否是全职项目
      this.departure_number();
      this.getProjectType();
      this.cur_app_id = app_id;
      switch (+app_id) {
        case 0:
          this.$router.replace("overviews");
          break;
        case 1:
          this.$router.replace("kqaddmin");
          break;
        case 2:
          this.$router.replace("positionmap");
          break;
        case 6:
          this.$router.replace("PayrollAccounting");
          break;
        case 10:
          this.$router.replace("memberadmin");
          break;
        case 13:
          if (this.project_type == 3) {
            this.$router.replace("fullTimeConfirm");
          } else {
            this.$router.replace("customerconfirmpage");
          }
          // this.$router.replace('customerconfirmpage')
          break;
        case 5:
          if (this.is_premium_user === false) {
            this.$router.replace("InsuranceMer");
          } else {
            this.$router.replace("newLaborInsurance");
          }
          break;
        case 20:
          // this.$router.replace("socialSecurity");
          this.$router.replace("ssTab");
          break;
        case 22:
          this.$router.replace("salary");
          break;
        case 23:
          this.$router.replace("PaydayReport");
          break;
        case 999:
          this.$router.replace("projectset");
          break;
        case 998:
          this.$router.replace("DepartureManage");//salaryadvances
          break;
        case 24:
          this.$router.replace("salaryadvances");
          break;
      }
    },
    changeSideBar() {
      let cur_route = location.href;
      console.log('cur_route===', cur_route)
      //当前页面刷新时判断对应哪个路由
      if (cur_route.indexOf("overviews") >= 0) {
        //项目概览
        // alert(1)
        this.cur_app_id = 0;
      } else if (
        cur_route.indexOf("kqaddmin") >= 0 ||
        cur_route.indexOf("kqtasklist") >= 0 ||
        cur_route.indexOf("kqeditpb") >= 0 ||
        cur_route.indexOf("kqsettask") >= 0 ||
        cur_route.indexOf("kqeditygpb") >= 0 ||
        cur_route.indexOf("kqpbmemberlist") >= 0 ||
        cur_route.indexOf("KqeditRanking") >= 0
      ) {
        //考勤管理
        // alert(2)
        this.cur_app_id = 1;
      } else if (
        cur_route.indexOf("positionmap") >= 0 ||
        cur_route.indexOf("positiondetails") >= 0 ||
        cur_route.indexOf("positionset") >= 0
      ) {
        //位置上报
        this.cur_app_id = 2;
      } else if (
        cur_route.indexOf("PayrollAccounting") >= 0 ||
        cur_route.indexOf("PaylistDetail") >= 0 ||
        cur_route.indexOf("CreateEditPayroll") >= 0 ||
        cur_route.indexOf("setpayroll") >= 0 ||
        cur_route.indexOf("EditPayrollDeduct") >= 0
      ) {
        //工资核算
        this.cur_app_id = 6;
      } else if (
        cur_route.indexOf("memberadmin") >= 0 ||
        cur_route.indexOf("membererror") >= 0 ||
        cur_route.indexOf("memberset") >= 0 ||
        cur_route.indexOf("memberinfo") >= 0 ||
        cur_route.indexOf("invitationmember") >= 0 || 
        cur_route.indexOf("ssSafing?from=memberadmin") >= 0
      ) {
        //人员管理
        this.cur_app_id = 10;
      } else if (
        cur_route.indexOf("customerconfirmpage") >= 0 ||
        cur_route.indexOf("newcreatmail") >= 0 ||
        cur_route.indexOf("newDailywage") >= 0 ||
        cur_route.indexOf("kqConfirm") >= 0 ||
        cur_route.indexOf("fullTimeCreatMail") >= 0 ||
        cur_route.indexOf("fullTimeConfirm") >= 0
      ) {
        //客户确认
        this.cur_app_id = 13;
      } else if (
        cur_route.indexOf("InsuranceM") >= 0 ||
        cur_route.indexOf("InsuranceS") >= 0 ||
        cur_route.indexOf("InsuranceMer") >= 0 ||
        cur_route.indexOf("newLaborInsurance") >= 0 ||
        cur_route.indexOf("insuranceAddPerson") >= 0 ||
        cur_route.indexOf("insuranceReductPerson") >= 0
      ) {
        //用工保险
        this.cur_app_id = 5;
      } 
      // else if (
      //   cur_route.indexOf("socialSecurity") >= 0 ||
      //   cur_route.indexOf("ssDetails") >= 0
      // ) {
      //   this.cur_app_id = 20;
      // } 
      else if (
        cur_route.indexOf("ssTab") >= 0 ||
        cur_route.indexOf("ssDetails") >= 0
      ) {
        this.cur_app_id = 20;
      } 
      else if (cur_route.indexOf("projectset") >= 0) {
        //项目设置
        this.cur_app_id = 999;
      } else if (cur_route.indexOf("DepartureManage") >= 0) {
        //项目设置
        this.cur_app_id = 998;
      }
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-03-20
     * @example
     * @param    {[type]}   data [{funName:'departure_number',data:{}}]
     * @return   {[type]}        [description]
     * @description     子组件 传参方法this.$emit('triggerAppFun',{funName:'departure_number'})
     */
    triggerAppFun(data) {
      this[data.funName]();
    },
    departure_number() {
      util.ajax({
        url: "/leaveapply/get/apply_count",
        type: "GET",
        data: {
          project_id: this.project_id,
        },
        success: (res) => {
          if (res.errno == 0) {
            if (!isNaN(+res.data.count)) {
              this.departureNumber =
                +res.data.count <= 99 ? +res.data.count : "99+";
            } else {
              this.departureNumber = 0;
            }
            console.log(this.departureNumber);
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
  },
  mounted() {
    this.init();

    console.log("application--", this.cur_app_id);
  },
  watch: {
    $route(to, from) {
      // 对路由变化作出响应...
      // 路由变化时 保证sidebar当前选中项不变
      console.log('12345')
      this.changeSideBar();
      this.getProjectType();
    },
  },
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当钩子执行前，组件实例还没被创建
    next((vm) => {
      vm.search_project = "";
      vm.init();
    });
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.clear {
  clear: both;
}
.applications {
  background-color: #fff;
  width: 100%;
}
@media screen and (max-width: 1000px) {
  .applications {
    width: 1000px;
  }
}
/*顶部导航*/
.title {
  position: relative;
  width: 100%;
  height: 60px;
  background-color: #383c49;
  /*box-shadow: 0 8px 4px 0 rgba(242, 242, 242, 0.5);*/
}
.title .line {
  float: left;
  width: 1px;
  height: 60px;
  background-color: #2d313d;
}
.title .left_back {
  width: 85px;
  height: 60px;
  float: left;
  cursor: pointer;
  font-size: 16px;
  color: #bfbfbf;
}
.title .left_back:hover {
  background-color: #2d313d;
}
.title .left_back .el-icon-arrow-left {
  color: #bfbfbf;
  margin: 22px 0 0 20px;
  font-size: 16px;
  /*vertical-align: middle;
  text-align: center;*/
}

.title .project_name {
  float: left;
  font-size: 16px;
  color: #bfbfbf;
  font-weight: normal;
  font-style: normal;
  /*font-family: 'PingFangSC';*/
  font-stretch: normal;
  line-height: 46px;
  text-indent: 16px;
  cursor: pointer;
  position: relative;
}
.title .project_name .project_id {
  position: absolute;
  left: 0px;
  top: 18px;
  font-size: 12px;
  color: #bfbfbf;
}
.title .project_name i {
  margin-left: 6px;
  text-indent: 0px;
  font-size: 10px;
  transition: all ease 0.3s;
  color: #bfbfbf;
}
.title .project_name i.show {
  transform-origin: 50% 50%;
  transform: rotate(180deg);
}
.title .project_list {
  position: absolute;
  left: 12px;
  top: 62px;
  z-index: 99999;
  width: 348px;
  /*height: 379px;*/
  padding-bottom: 12px;
  border-radius: 2px;
  background-color: #ffffff;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.04), 0 2px 4px 0 rgba(0, 0, 0, 0.12);
  border: solid 1px #d3dce6;
}
.title .project_list .search_input {
  width: 326px;
  margin: 12px 12px 16px 12px;
}

.title .project_list .projects_title {
  width: 326px;
  height: 17px;
  font-size: 12px;
  line-height: 1;
  color: #8492a6;
  border-bottom: 1px solid #e0e6ed;
  margin-left: 12px;
}
.title .project_list .project_items {
  width: 348px;
  height: 280px;
  overflow: auto;
}
.title .project_list .project_items .noresult {
  width: 100%;
  height: 100%;
  line-height: 280px;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  text-align: center;
  color: #c0ccda;
}
.title .project_list .project_items .project_item {
  width: 348px;
  height: 56px;
}
.title .project_list .project_items .project_item:hover {
  background-color: #f5f5f5;
}
.title .project_list .project_items .project_item .item_icon {
  float: left;
  width: 36px;
  height: 36px;
  margin: 10px 12px;
  /*outline: 1px solid red;*/
  /*background-image: url(../assets/Avatar.svg);*/
  background-size: contain;
}
.title .project_list .project_items .project_item .item_name {
  float: left;
  width: 245px;
  height: 56px;
  line-height: 56px;
  color: #475568;
  font-size: 14px;
  font-weight: normal;
  text-indent: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title .project_list .project_items .project_item .item_select {
  float: left;
  width: 43px;
  height: 56px;
}
.title .project_list .project_items .project_item .item_select i {
  color: #f5974e;
  margin: 20px 11px;
}
/*侧边栏和右侧主体内容*/
.main {
  width: 100%;
  /*height:840px;*/
}
/*侧边栏*/
.main .side_bar {
  /*background-color: pink;*/
  position: absolute;
  z-index: 99;
  background-color: #fff;
  float: left;
  width: 200px;
  /*height: 840px;*/
  box-sizing: border-box;
  border-right: 1px solid #e0e6ed;
  transition: 0.2s ease;
}
/*收起side_bar时的样式*/
.main .side_bar.hide {
  width: 56px;
  overflow: hidden;
}
.main .side_bar.hide .side_bar_title,
.main .side_bar.hide .side_bar_items .side_bar_item {
  font-size: 0px;
}
.main .side_bar.hide .side_bar_title .lines {
  margin: -33px 16px 19px 0;
}

.main .side_bar .side_bar_title {
  width: 100%;
  height: 52px;
  line-height: 52px;
  text-indent: 20px;
  font-size: 14px;
  font-weight: 500;
  font-style: normal;
  font-stretch: normal;
  color: #475568;
  overflow: hidden;
}
.main .side_bar .side_bar_title .lines {
  float: right;
  width: 20px;
  height: 14px;
  margin: 19px 16px 19px 0;
  cursor: pointer;
}
.main .side_bar .side_bar_title .lines:hover .line {
  background-color: #6699ee;
}
.main .side_bar .side_bar_title .lines .line {
  width: 20px;
  height: 2px;
  background-color: #d7d7d7;
  margin-bottom: 4px;
}
.main .side_bar .side_bar_items {
  width: 100%;
  overflow: hidden;
  transition: width 0.2s ease;
}
.main .side_bar .side_bar_items .side_bar_item {
  width: 197px;
  /*width:100%;*/
  overflow: hidden;
  height: 50px;
  border-right: 2px solid transparent;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 50px;
  text-indent: 16px;
  color: #5d6c82;
  cursor: pointer;
}
.main .side_bar .side_bar_items .side_bar_item.hide_side_bar {
  width: 100%;
}
.main .side_bar .side_bar_items .side_bar_item:hover {
  background-color: #f4f4f4;
}
.main .side_bar .side_bar_items .side_bar_item.select {
  border-right: 2px solid #6699ee;
  background-color: #f4f4f4;
  color: #6699ee;
  font-weight: 600;
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon {
  float: left;
  width: 16px;
  height: 16px;
  margin: 17px 0 17px 20px;
  /*outline: 1px solid red;*/
  background-size: contain;
}
/*添加新应用后 在此配置图标*/
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_0 {
  background-image: url(../assets/imgs/applications/xmgl.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_0 {
  background-image: url(../assets/imgs/applications/xmgl_hover.svg);
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_1 {
  background-image: url(../assets/imgs/applications/kqgl.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_1 {
  background-image: url(../assets/imgs/applications/kqgl_hover.svg);
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_6 {
  background-image: url(../assets/imgs/applications/payroll_accounting.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_6 {
  background-image: url(../assets/imgs/applications/payroll_accounting_hover.svg);
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_23 {
  background-image: url(../assets/imgs/applications/paydayreport.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_23 {
  background-image: url(../assets/imgs/applications/paydayreport-active.svg);
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_10 {
  background-image: url(../assets/imgs/applications/member_addmin.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_10 {
  background-image: url(../assets/imgs/applications/member_addmin_hover.svg);
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_22 {
  background-image: url(../assets/imgs/applications/salary_icon.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_22 {
  background-image: url(../assets/imgs/applications/salary_icon_hover.svg);
}

.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_13 {
  background-image: url(../assets/imgs/applications/khconfirm_icon.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_13 {
  background-image: url(../assets/imgs/applications/khconfirm_icon_hover.svg);
}

.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_2 {
  background-image: url(../assets/imgs/applications/position.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_2 {
  background-image: url(../assets/imgs/applications/position_hover.svg);
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_5 {
  background-image: url(../assets/imgs/applications/insurance_icon.svg);
  background-size: 18px 18px;
  width: 18px;
  height: 18px;
  margin: 15px 0 15px 20px;
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_5 {
  background-image: url(../assets/imgs/applications/insurance_icon_hover.svg);
  background-size: 18px 18px;
  width: 18px;
  height: 18px;
  margin: 15px 0 15px 20px;
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_2 {
  height: 18px;
  width: 16px;
  margin: 16px 0 16px 20px;
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item
  .side_bar_item_icon.app_icon_999 {
  width: 17px;
  background-image: url(../assets/imgs/applications/project_set.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_999 {
  background-image: url(../assets/imgs/applications/project_set_hover.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item
  .side_bar_item_icon.app_icon_998 {
  width: 16px;
  height: 20px;
  background-size: 100% 100%;
  background-image: url(../assets/imgs/applications/departure_icon.svg);
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_998 {
  background-size: 100% 100%;
  background-image: url(../assets/imgs/applications/departure_icon_atc.svg);
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_20 {
  background-image: url(../assets/imgs/applications/shebao.svg);
  width: 20px;
  height: 20px;
  margin: 17px 0px 12px 17px;
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_20 {
  background-image: url(../assets/imgs/applications/shebao_hover.svg);
}
.main .side_bar .side_bar_items .side_bar_item .side_bar_item_icon.app_icon_24 {
  background-image: url(../assets/imgs/applications/wage.svg);
  width: 20px;
  height: 20px;
  margin: 17px 0px 12px 17px;
}
.main
  .side_bar
  .side_bar_items
  .side_bar_item.select
  .side_bar_item_icon.app_icon_24 {
  background-image: url(../assets/imgs/applications/wage-active.svg);
}
/*二级路由入口*/
.main .routerView {
  /*background-color: yellow;*/
  box-sizing: border-box;
  /*width:100%;*/
  /*height:840px;*/
  margin-left: 200px;
  transition: 0.2s ease;
  overflow: auto;
}
.main .routerView.changeView {
  margin-left: 56px;
}
.main .routerView .kqaddmin_in {
  overflow: auto;
}
.dep_num {
  position: relative;
}
.dep_num .departure_number {
  position: absolute;
  top: 5px;
  right: 12px;
  background-color: #f56c6c;
  text-indent: 0px;
  border-radius: 10px;
  color: #fff;
  display: inline-block;
  font-size: 12px;
  height: 17px;
  line-height: 17px;
  width: 30px;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #fff;
}
.dep_num .departure_number p {
  display: block;
  margin: auto;
}
.dep_num .departure_number_icon {
  right: 0;
}
</style>
