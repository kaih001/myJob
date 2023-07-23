<template>
  <div class="kqtasklist">
    <div class="kqtask_top">
        <!-- <div class="breadcrumb">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: 'kqaddmin' }" replace>考勤管理</el-breadcrumb-item>
                <el-breadcrumb-item>考勤规则设置</el-breadcrumb-item>
            </el-breadcrumb>
  	    </div> -->
        <breadcrumb>
            <router-link to="kqaddmin" replace>考勤管理</router-link>
            <router-link to="">考勤规则管理</router-link>
        </breadcrumb>
    </div>
    <div class="kqtask_main">
      <div class="kqtask_title">
        <h2>考勤规则列表</h2>
        <div class="addtask" v-if="show_edit_btn == 1">
          <!-- <el-button type="text" icon="plus">添加考勤规则</el-button> -->
          <div class="add_item" @click="addTaskFn(0)">添加考勤规则</div>
        </div>
      </div>
      <div class="kqtask_table">
        <el-table
          :data="task_list"
          :height="table_height"
          empty-text="暂无考勤规则"
          style="width: 100%"
          :row-class-name="addRowClass"
        >
          <el-table-column
            prop="name"
            :show-overflow-tooltip="true"
            label="考勤规则名称"
            min-width="172"
          >
          </el-table-column>
          <el-table-column
            prop="time"
            label="时间范围"
            :show-overflow-tooltip="true"
            min-width="162"
          >
            <template slot-scope="scope">
              <!-- <template v-if="scope.row.date.start">
                                {{scope.row.date.start.replace(/-/g,'.')}}-{{scope.row.date.end.replace(/-/g,'.')}}
                            </template>
                            <template v-else>
                                长期有效
                            </template> -->
              <template v-if="scope.row.work_type == 0">
                <!-- <el-tooltip :enterable="false" class="item" effect="dark" :content="computedweek(scope.row.work_week)" placement="top"> -->
                <div
                  style="
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                  "
                >
                  {{ computedweek(scope.row.work_week) }}
                </div>
                <!-- </el-tooltip> -->
                <div
                  class="text2"
                  v-for="(item, index) in scope.row.work_time_range"
                >
                  {{ computedTimeRange(item, index) }}
                </div>
              </template>
              <template v-if="scope.row.work_type == 1">
                <!-- <el-tooltip :enterable="false" class="item" effect="dark" :content="computedweek(scope.row.work_week)" placement="top"> -->
                <div
                  style="
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                  "
                >
                  {{ computedweek(scope.row.work_week) }}
                </div>
                <!-- </el-tooltip> -->
                <div class="text2">
                  工作{{ scope.row.work_time_length }}个小时
                </div>
              </template>
              <template v-if="scope.row.work_type == 2">
                <!-- <div>{{computedweek(scope.row.work_week)}}</div> -->
                <div
                  class="text1"
                  v-for="(item, index) in scope.row.task_schedules"
                  v-if="index < 3"
                >
                  {{ computedSchedule(item, index) }}
                </div>
                <div
                  style="
                    font-size: 25px;
                    color: #99a9bf;
                    position: absolute;
                    bottom: 5px;
                  "
                  v-if="scope.row.task_schedules.length > 3"
                >
                  ...
                </div>
              </template>
              <template v-if="scope.row.work_type == 3">
                <!-- <div>{{computedweek(scope.row.work_week)}}</div> -->
                <div
                  class="text1"
                  v-for="(item, index) in scope.row.task_schedules"
                  v-if="index < 3"
                >
                  {{ computedSchedule(item, index) }}
                </div>
                <div
                  style="
                    font-size: 25px;
                    color: #99a9bf;
                    position: absolute;
                    bottom: 5px;
                  "
                  v-if="scope.row.task_schedules.length > 3"
                >
                  ...
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="team" label="参与小组及成员" min-width="123">
            <template slot-scope="scope">
              <!-- {{scope.row.participant_group.length}}个小组，{{scope.row.participant_user.length}}个成员 -->
              {{ computedMember(scope) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="排班方式" min-width="75">
            <template slot-scope="scope">
              {{
                scope.row.work_type == 0
                  ? "固定时间"
                  : scope.row.work_type == 1
                  ? "弹性时间"
                  : scope.row.work_type == 2
                  ? "人员排班"
                  : "员工自主排班"
              }}
            </template>
          </el-table-column>
          <el-table-column
            prop="type"
            label="启用/禁用"
            v-for="(item, index) in invisible_man"
            :key="item"
            min-width="89"
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                @change="
                  changeTaskstatus(scope.row.status, scope.$index, task_list)
                "
                :disabled="show_edit_btn != 1"
                on-value="1"
                off-value="0"
                on-color="#6097e4"
                off-color="#c0ccda"
                on-text=""
                off-text=""
              >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="操作"
            v-for="(item, index) in invisible_man"
            :key="index"
            min-width="163"
          >
            <template slot-scope="scope">
              <template v-if="show_edit_btn == 1">
                <!-- <el-button
                                    v-if="scope.row.work_type == 2"
                                    style="color:#e0e6ed;cursor:auto;"
                                    type="text">
                                    |
                                </el-button> -->
                <el-button
                  @click.native.prevent="addTaskFn(scope.row.id)"
                  type="text"
                  size="small"
                >
                  修改规则
                </el-button>
                <el-button
                  v-if="scope.row.work_type == 2 || scope.row.work_type == 3"
                  style="color: #e0e6ed; cursor: auto"
                  type="text"
                >
                  |
                </el-button>
              </template>
              <template>
                <el-button
                  v-if="scope.row.work_type == 2"
                  @click.native.prevent="editPb(scope.row)"
                  type="text"
                  size="small"
                >
                  排班
                </el-button>
                <el-button
                  v-if="scope.row.work_type == 3"
                  @click.native.prevent="editygPb(scope.row)"
                  type="text"
                  size="small"
                >
                  排班
                </el-button>
                <el-button
                  v-if="show_edit_btn == 1"
                  style="color: #e0e6ed; cursor: auto"
                  type="text"
                >
                  |
                </el-button>
              </template>
              <template v-if="show_edit_btn == 1">
                <el-button
                  @click.native.prevent="delTaskFn(scope.row.id)"
                  type="text"
                  size="small"
                >
                  删除
                </el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import * as util from "../assets/js/util.js";

import breadcrumb from "@/components/common/breadcrumb";

export default {
  name: "kqtasklist",
  components: {
    breadcrumb,
  },
  data() {
    return {
      team_id: 0,
      project_id: 0,
      invisible_man: [1],
      task_list: [
        //  			{
        //                id: 0,
        // name: '',
        //                project_id: 0,
        // date: {
        //                    start: '',
        //                    end: ''
        //                },
        // work_type: '0',
        // status: 1
        //  		    }
      ],
      table_height: 300,
      show_edit_btn: 0,
    };
  },
  methods: {
    init() {
      //初始化表格高度
      this.table_height = $(window).height() - 193;
      //窗口高度变化 表格高度对应变化
      $(window).resize(() => {
        this.table_height = $(window).height() - 193;
      });
      //获取用户信息
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;

      this.getpermission();
      this.getTaskList();
    },
    addTaskFn(lab) {
      if (lab == 0) {
        util.setLocalStorage("kqpb_task_id", 0, 60 * 60 * 24);
      } else {
        util.setLocalStorage("kqpb_task_id", lab, 60 * 60 * 24);
      }
      this.$router.replace("kqsettask");
    },
    delTaskFn(task_id) {
      this.$confirm("确定删除该考勤规则？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          console.log(task_id);
          util.ajax({
            url: "/attendance/attendance_task/delete",
            type: "POST",
            data: {
              team_id: this.team_id,
              project_id: this.project_id,
              task_id: task_id,
            },
            success: (res) => {
              // console.log('删除考勤任务')
              // console.log(res)
              if (res && res.errno == 0) {
                this.$message({
                  showClose: true,
                  message: "删除成功",
                  type: "success",
                });
                this.getTaskList();
              }
            },
            error: (xhr, status) => {},
            noNetwork: () => {
              // 网络超时
              this.$message({
                showClose: true,
                message: "网络连接失败，请检查网络",
                type: "warning",
              });
            },
          });
        })
        .catch(() => {
          // this.$message({
          //     type: 'info',
          //     message: '取消'
          // });
        });
    },
    // 获取考勤任务列表
    getTaskList() {
      util.ajax({
        url: "/attendance/attendance_task_list",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          page_size: 1000,
          max_id: 0,
        },
        success: (res) => {
          console.log("考勤任务列表");
          if (res && res.errno == 0) {
            this.task_list = res.data.list;
            this.show_edit_btn = res.data.page_data.show_edit_btn;
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          // 网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    editPb(row) {
      if (row.status == 1) {
        util.setLocalStorage("kqpb_task_id", row.id, 60 * 60 * 24);
        this.$router.replace("kqeditpb");
      } else {
        this.$message({
          showClose: true,
          message: "该考勤规则已禁用",
          type: "warning",
        });
      }
    },
    editygPb(row) {
      if (row.status == 1) {
        util.setLocalStorage("kqpb_task_id", row.id, 60 * 60 * 24);
        this.$router.replace("kqeditygpb");
      } else {
        this.$message({
          showClose: true,
          message: "该考勤规则已禁用",
          type: "warning",
        });
      }
    },
    changeTaskstatus(status, index, task_list) {
      // console.log(this.task_list[index])
      util.ajax({
        url: "/attendance/attendance_task_status/update",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          task_id: task_list[index].id,
          status: status == 1 ? 1 : 0,
        },
        success: (res) => {
          // console.log(res)
          if (res && res.errno == 0) {
          } else if (res.errmsg == "Project does not exist or offline") {
            task_list[index].status = status == 1 ? 0 : 1;
            this.$message({
              showClose: true,
              message: "项目已结束",
              type: "warning",
            });
          } else {
            task_list[index].status = status == 1 ? 0 : 1;
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          // 网络超时
          task_list[index].status = status == 1 ? 0 : 1;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    computedMember(scope) {
      if (
        scope.row.participant_group.length &&
        scope.row.participant_user.length
      ) {
        return `${scope.row.participant_group.length}个小组，${scope.row.participant_user.length}个成员`;
      } else {
        if (scope.row.participant_group.length) {
          return `${scope.row.participant_group.length}个小组`;
        } else if (scope.row.participant_user.length) {
          return `${scope.row.participant_user.length}个成员`;
        } else {
          return "";
        }
      }
    },
    getpermission() {
      this.invisible_man = [1];
      util.ajax({
        url: "/permission/application",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          application_id: 1,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log('权限信息')
          // console.log(obj)
          if (obj && obj.errno == 0) {
            obj.data.forEach((o) => {
              if (o.id_name === "invisible_man") {
                this.invisible_man = [];
              }
              if (
                o.id_name === "naixue_saas_project_ids_admin" ||
                o.id_name === "naixue_saas_project_ids_group"
              ) {
                window.localStorage.setItem("naixue_project_kaoqin", true);
              }
            });
          }
        },
        error: (xhr, status) => {
          this.alertinfo("网络连接失败，请检查网络");
        },
        noNetwork: () => {
          //网络超时
          this.alertinfo("网络连接失败，请检查网络");
        },
      });
    },
    computedweek(week) {
      // console.log(week)
      let tempStr = "";
      week.forEach((obj) => {
        switch (obj) {
          case "1":
            tempStr += "周一、";
            break;
          case "2":
            tempStr += "周二、";
            break;
          case "3":
            tempStr += "周三、";
            break;
          case "4":
            tempStr += "周四、";
            break;
          case "5":
            tempStr += "周五、";
            break;
          case "6":
            tempStr += "周六、";
            break;
          case "7":
            tempStr += "周日、";
            break;
        }
      });
      // console.log(tempStr)
      return tempStr.substr(0, tempStr.length - 1);
    },
    computedTimeRange(item, index) {
      switch (index) {
        case 0:
          return `时段一：${item.start.time}-${item.cross == 1 ? "次日" : ""}${
            item.end.time
          }`;
          break;
        case 1:
          return `时段二：${item.start.time}-${item.cross == 1 ? "次日" : ""}${
            item.end.time
          }`;
          break;
        case 2:
          return `时段三：${item.start.time}-${item.cross == 1 ? "次日" : ""}${
            item.end.time
          }`;
          break;
      }
    },
    computedSchedule(item, index) {
      switch (index) {
        case 0:
          return `班次A：${item.start_time}-${item.cross == 1 ? "次日" : ""}${
            item.end_time
          }`;
          break;
        case 1:
          return `班次B：${item.start_time}-${item.cross == 1 ? "次日" : ""}${
            item.end_time
          }`;
          break;
        case 2:
          return `班次C：${item.start_time}-${item.cross == 1 ? "次日" : ""}${
            item.end_time
          }`;
          break;
        // case 3:
        //     return `班次D：${item.start_time}-${item.end_time}`
        // break
        // case 4:
        //     return `班次E：${item.start_time}-${item.end_time}`
        // break
        // case 5:
        //     return `班次F：${item.start_time}-${item.end_time}`
        // break
        // case 6:
        //     return `班次G：${item.start_time}-${item.end_time}`
        // break
        // case 7:
        //     return `班次H：${item.start_time}-${item.end_time}`
        // break
        // case 8:
        //     return `班次I：${item.start_time}-${item.end_time}`
        // break
        // case 9:
        //     return `班次J：${item.start_time}-${item.end_time}`
        // break
      }
    },
    addRowClass(row, index) {
      // console.log(row)
      // console.log(index)
      if (row.status == 0) {
        return "disabled";
      } else {
        return "";
      }
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    $route(to, from) {
      // 对路由变化作出响应...
      this.init();
    },
  },
};
</script>

<style>
.kqtasklist .kqtask_title .addtask .el-button span {
  font-size: 13px;
}
.kqtasklist .kqtask_table .el-table__header-wrapper thead th {
  border-right: 1px solid #d3dce6;
}
.kqtasklist .kqtask_table .el-table__body-wrapper tr td {
  cursor: auto !important;
  height: 88px;
}
.kqtasklist .kqtask_table .el-table__body-wrapper tr:hover > td {
  background-color: #fff !important;
}
.kqtasklist .kqtask_table .el-table__body-wrapper tr.disabled td .cell {
  color: #99a9bf;
}
.kqtasklist .kqtask_table .el-table__body-wrapper tr td .cell .text1 {
  line-height: 1.5;
}
.kqtasklist .kqtask_table .el-table__body-wrapper tr.disabled td .cell .text2 {
  color: #c0ccda;
}
.kqtasklist .kqtask_table .el-button span {
  font-size: 12px;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.kqtasklist {
  padding: 0 20px;
}
.kqtasklist .kqtask_top {
  height: 50px;
  border-bottom: 1px solid #e0e6ed;
}
/*.kqtasklist .kqtask_top .breadcrumb{
	padding-top:18px;
}*/
.kqtasklist .kqtask_main {
  margin: 8px 0 16px;
}
.kqtasklist .kqtask_main .kqtask_title {
  height: 54px;
}
.kqtasklist .kqtask_main .kqtask_title h2 {
  float: left;
  line-height: 54px;
  font-size: 16px;
  font-weight: 500;
  font-style: normal;
  color: #475568;
}
.kqtasklist .kqtask_main .kqtask_title .addtask {
  float: right;
  height: 54px;
  /*font-size: 16px;
    font-weight: 500;
    font-style: normal;*/
  /*color: #475568;*/
}
.kqtasklist .kqtask_main .kqtask_title .addtask .add_item {
  height: 24px;
  line-height: 24px;
  margin: 15px 0 15px 0;
  font-size: 13px;
  color: #6699ee;
  background: url(../assets/imgs/shareIcon/add_hover.svg) left no-repeat;
  text-indent: 18px;
  cursor: pointer;
}
.kqtasklist .kqtask_main .kqtask_title .addtask .add_item:active {
  color: #517ed6;
}
.kqtasklist .kqtask_main .text2 {
  color: #99a9bf;
  line-height: 15px;
}
</style>
