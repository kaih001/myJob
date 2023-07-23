<template>
  <div id="kqaddmin">
      <div class="kq-wapper">
          <h2>考勤管理
            <div style="float:right;">
              <h3 v-show="kqdownload1" class="kq-export" @click="exportDialog">
                <i class="export-icon"></i>
                <span>导出报表</span>
              </h3>
              <h3 v-show="kqdownload2" class="kq-export kqdownload2">
                <i class="el-icon-loading"></i>
                <el-tooltip  popper-class="downloadTip">
                  <div slot="content" style="font-size: 12px;">地址生成中...<br/>并不局限您其他操作</div>
                  <span style="color:#5E6D82">生成下载链接中...</span>
                </el-tooltip>
              </h3>
              <h3 v-show="kqdownload3" class="kq-export kqdownload3" >
                <i class="kqexportIcon"></i>
                <span style="color:#5E6D82">导出完成</span>
                <span style="margin:0 3px;" @click="kqdownloadfuc">下载</span>
                <span @click="kqdownloadcalfuc">取消</span>
              </h3>
              <router-link to="kqtasklist"  style="color:#6699ee;font-weight:normal;font-size:13px;line-height: 1;" class="kaaddminset">考勤规则管理<i class="setico_svg"></i></router-link>
            </div>  
          </h2>
          <div class="kq-header">
                <div class="export-dialog">
                  <!--   <el-dialog
                      title="提示"
                      :visible.sync="dialogVisible2"
                      size="tiny">
                      <span>是否确认导出查询范围内的记录</span>
                      <span slot="footer" class="dialog-footer">
                        <el-button class="cancel" @click="dialogVisible2 = false">取 消</el-button>
                        <el-button class="confirm" type="primary"  @click="confirm">确 定</el-button>
                      </span>
                    </el-dialog> -->
                    <el-dialog 
                      title="考勤导出" 
                      :visible.sync="dialogVisible"
                      @close="resetForm('ruleForm')"
                      size="tiny">
                      <!-- <span>请选择需要导出考勤规则</span> -->
                      <div class="kq-select-div">
                          <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                            <el-form-item label="导出类型" :label-width="formLabelWidth" prop="kqExport">
                                <el-select v-model="ruleForm.kqExport" @change="selectkqExport" style="width:100%;" class="mystatus">
                                  <el-option label="考勤汇总表" value="1"></el-option>
                                  <el-option label="日汇总统计" value="2"></el-option>
                                  <el-option label="打卡明细表" value="3"></el-option>
                                </el-select>
                              </el-form-item>
                              <el-form-item label="开始日期" :label-width="formLabelWidth"  prop="sday">
                                  <el-date-picker 
                                      v-model="ruleForm.sday"
                                      type="date"
                                      placeholder="选择日期"
                                      style="width: 100%;"
                                      :editable="false">
                                  </el-date-picker>
                              </el-form-item>
                              <el-form-item label="结束日期" :label-width="formLabelWidth" prop="eday">
                                  <el-date-picker 
                                      v-model="ruleForm.eday"
                                      type="date"
                                      placeholder="选择日期"
                                      style="width: 100%;"
                                      :editable="false">
                                  </el-date-picker>
                              </el-form-item>
                              <el-form-item v-show='selectIf' label="考勤规则" :label-width="formLabelWidth" prop="kqTask_">
                                  <el-select multiple v-model="ruleForm.kqTask_" @change="selectTaskId_" style="width:100%;">
                                    <el-option
                                      v-for="item in kqTaskOptions"
                                      :key="item.id"
                                      :label="item.name"
                                      :value="item.id">
                                    </el-option>
                                  </el-select>
                              </el-form-item>
                              <el-form-item  v-show='!selectIf' label="考勤规则" :label-width="formLabelWidth" prop="kqTask">
                                  <el-select v-model="ruleForm.kqTask" @change="selectTaskId" style="width:100%;" class="mystatus">
                                    <el-option
                                      v-for="item in kqTaskOptions"
                                      :key="item.id"
                                      :label="item.name"
                                      :value="item.id">
                                    </el-option>
                                  </el-select>
                              </el-form-item>
                             <!--  <el-form-item  prop="kqTask">
                                  <el-select v-model="ruleForm.kqTask" placeholder="请选择" @change="selectTaskId">
                                      <el-option
                                        v-for="item in kqTaskOptions"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id">
                                      </el-option>
                                    </el-select>
                              </el-form-item> -->
                              <el-form-item label="" :label-width="formLabelWidth">
                                <div class="rulesNotes">注：打卡明细表不支持多个考勤规则</div>
                              </el-form-item>
                          </el-form>
                      </div>
                      <div slot="footer" class="dialog-footer">
                          <el-button class="cancel" @click="resetForm('ruleForm')">取 消</el-button>
                          <el-button type="primary" class="confirm" @click="confirm('ruleForm')">确 定</el-button>
                      </div>
                    </el-dialog>
                </div>
                <div class="kq-tab">
                    <el-tabs v-model="activeName" @tab-click="handleClick">
                        <el-tab-pane label="按日统计" name="按日统计">
                            <div class="kq-count-day">
                                <div class="kq-seach-form">
                                    <el-form label-width="40px" :rules="rules" :model="ruleForm">
                                        <div class="from-item-list">
                                            <el-form-item label="日期："prop="kqDateDay">
                                                <el-date-picker 
                                                    v-model="ruleForm.kqDateDay"
                                                    type="date"
                                                    placeholder="选择日期"
                                                    style="width:225px"
                                                    :editable="false">
                                                </el-date-picker>
                                            </el-form-item>
                                        </div>
                                        <div class="from-item-list">
                                            <el-form-item label="小组：">
                                                <el-button @click="openGroupSelecter" class="groupDay group" style="width:175px;background: #fff;color: #1f2d3d;text-align: left;border-radius: 4px;" v-if="selected_groups.length">已选{{selected_groups.length}}个小组<i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 14px;color: #d3dce6;"></i></el-button>
                                                <el-button @click="openGroupSelecter" class="groupDay group" style="width:135px;background: #fff;color: #1f2d3d;text-align: left;border-radius: 4px;" v-else>全部<i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 14px;color: #d3dce6;"></i></el-button>
                                            </el-form-item>
                                        </div>
                                        <div class="from-item-list member">
                                            <el-form-item label="人员：">
                                              <el-autocomplete
                                                popper-class="my-autocomplete2"
                                                style="width:135px;"
                                                v-model="memberDay"
                                                :fetch-suggestions="querySearch"
                                                custom-item="my-item-zh"
                                                :trigger-on-focus="false"
                                                placeholder="姓名/手机号"
                                                @select="handleSelect">
                                            </el-autocomplete>
                                            </el-form-item>
                                        </div>
                                        <div class="from-item-list">
                                            <el-form-item label="状态：" style="float:left">
                                                <el-select v-model="stateDay" class="mystatus" style="width:106px"  @change="selectStateId">
                                                  <template v-for="item in stateOptionsDay">
                                                      <el-option
                                                        :key="item.value"
                                                        :label="item.label"
                                                        :value="item.value">
                                                      </el-option>
                                                  </template>
                                                </el-select>
                                            </el-form-item>
                                            <el-button type="primary" class="seach-btn" @click="getTableDataDay(1)" style="float:left:margin-left:16px;">搜 索</el-button>
                                        </div>
                                    </el-form>
                                   
                                </div>
                                <div class="kq-table-day">
                                    <el-table :data="tableDataDay" border style="width: 100%" :height="winHeight" empty-text="暂无数据" :row-class-name="classNameAttribute"  @row-click="showKqDetailFn" v-loading.body="loadingDay">
                                        <el-table-column prop="name" show-overflow-tooltip label="姓名" width="100" min-width="68"></el-table-column>
                                        <el-table-column prop="group_name" show-overflow-tooltip label="小组" width="186"></el-table-column>
                                        <el-table-column prop="date" label="日期" width="150"></el-table-column>
                                        <el-table-column prop="attend_first_time" label="最早打卡" width="100"></el-table-column>
                                        <el-table-column prop="attend_last_time" label="最晚打卡" width="100"></el-table-column>
                                        <el-table-column prop="attend_count" label="打卡次数" width="100"></el-table-column>
                                        <el-table-column prop="work_time" label="工作时长" width="150"></el-table-column>
                                        <el-table-column prop="status.name" class-name="className"label="状态"></el-table-column>
                                        <!-- <el-table-column width="2" fixed="right"></el-table-column> -->
                                    </el-table>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="按月统计" name="按月统计">
                            <div class="kq-count-month">
                                <div class="kq-seach-form">
                                    <el-form label-width="40px" :rules="rules" :model="ruleForm">
                                        <div class="from-item-list">
                                            <el-form-item label="日期：" prop="kqDateMonth">
                                                <el-date-picker 
                                                  v-model="ruleForm.kqDateMonth" 
                                                  type="daterange" 
                                                  style="width:225px;"
                                                  :editable="false"
                                                  placeholder="选择日期范围">
                                                </el-date-picker>
                                            </el-form-item>
                                        </div>
                                        <div class="from-item-list">
                                            <el-form-item label="小组：">
                                                <el-button @click="openGroupSelecter" class="groupDay group" style="width:135px;background: #fff;color: #1f2d3d;text-align: left;border-radius: 4px;" v-if="selected_groups.length">已选{{selected_groups.length}}个小组<i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 14px;color: #d3dce6;"></i></el-button>
                                                <el-button @click="openGroupSelecter" class="groupDay group" style="width:175px;background: #fff;color: #1f2d3d;text-align: left;border-radius: 4px;" v-else>全部<i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 14px;color: #d3dce6;"></i></el-button>
                                                <!-- </el-select>
                                                </el-select> -->
                                            </el-form-item>
                                        </div>
                                        <div class="from-item-list member">
                                            <el-form-item label="人员：">
                                              <el-autocomplete
                                                  popper-class="my-autocomplete2"
                                                  v-model="memberMonth"
                                                  style="width:135px;"
                                                  :fetch-suggestions="querySearch"
                                                  custom-item="my-item-zh"
                                                  :trigger-on-focus="false"
                                                  placeholder="姓名/手机号"
                                                  @select="handleSelect">
                                              </el-autocomplete>
                                            </el-form-item>
                                        </div>
                                        <div class="from-item-list no-margin-right" @click="getTableDataMonth(1)">
                                            <el-button type="primary">搜 索</el-button>
                                        </div>
                                    </el-form>
                                <!--     <div class="kq-export" @click="exportDialog" v-if="exportPerm">
                                        <h3><i class="export-icon"></i><span>导出报表</span></h3>
                                    </div> -->
                                </div>
                                <div class="kq-table-month">
                                    <el-table :data="tableDataMonth" border style="width: 100%" :height="winHeight" empty-text="暂无数据" @cell-click="cellClick" v-loading.body="loadingM">
                                        <el-table-column :fixed="tableDataMonth.length != 0"  prop="name" label="姓名" width="100" show-overflow-tooltip></el-table-column>
                                        <el-table-column prop="group_name" label="小组" width="186" show-overflow-tooltip></el-table-column>
                                        <el-table-column prop="attend_daycount" label="出勤天数" width="90"></el-table-column>
                                        <template v-for="item in allDateList">
                                             <el-table-column :label="item.label" :prop="item.prop" min-width="90"></el-table-column>
                                        </template>
                                    </el-table>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="打卡记录" name="打卡记录">
                            <div class="kq-record">
                                <div class="kq-seach-form">
                                    <el-form label-width="40px" :rules="rules" :model="ruleForm">
                                        <div class="from-item-list">
                                            <el-form-item label="日期："prop="kqDateRecord">
                                                <el-date-picker 
                                                  v-model="ruleForm.kqDateRecord" 
                                                  type="daterange" 
                                                  style="width:225px"
                                                  :editable="false"
                                                  placeholder="选择日期范围">
                                                </el-date-picker>
                                            </el-form-item>
                                        </div>
                                        <div class="from-item-list">
                                            <el-form-item label="小组：">
                                                <el-button @click="openGroupSelecter" class="groupDay group" style="width:135px;background: #fff;color: #1f2d3d;text-align: left;border-radius: 2px;" v-if="selected_groups.length">已选{{selected_groups.length}}个小组 <i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 14px;color: #d3dce6;"></i></el-button>
                                                <el-button @click="openGroupSelecter" class="groupDay group" style="width:175px;background: #fff;color: #1f2d3d;text-align: left;border-radius: 2px;" v-else>全部<i class="el-icon-caret-bottom" style="position: absolute; right: 12px;top: 14px;color: #d3dce6;"></i></el-button>
                                            </el-form-item>
                                        </div>
                                        <div class="from-item-list member">
                                            <el-form-item label="人员：">
                                              <el-autocomplete
                                                  popper-class="my-autocomplete2"
                                                  v-model="memberRecord"
                                                  style="width:135px;"
                                                  :fetch-suggestions="querySearch"
                                                  :trigger-on-focus="false"
                                                  custom-item="my-item-zh"
                                                  placeholder="姓名/手机号"
                                                  @select="handleSelect"> 
                                              </el-autocomplete>
                                            </el-form-item>
                                        </div>
                                        <div class="from-item-list">
                                            <el-form-item label="状态：" style="float:left">
                                                <el-select v-model="stateRecord" class="mystatus" style="width:105px" placeholder="请选择" @change="selectRecordStateId">
                                                  <el-option
                                                    v-for="item in stateOptionsRecord"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value">
                                                  </el-option>
                                                </el-select>
                                            </el-form-item>
                                            <el-button type="primary" class="seach-btn" @click="getTableDataRecord(1)">搜 索</el-button>
                                        </div>
                                    </el-form>
                                  <!--   <div class="kq-export" @click="exportDialog" v-if="exportPerm">
                                        <h3><i class="export-icon"></i><span>导出报表</span></h3>
                                    </div> -->
                                </div>
                                <div class="kq-table-record">
                                    <el-table :data="tableDataRecord" border style="width: 100%;overflow-x:hidden;":height="winHeight" empty-text="暂无数据" :row-class-name="classNameAttribute" @row-click="showKqDetailFn" v-loading.body="loadingR">
                                       <el-table-column  prop="name" show-overflow-tooltip label="姓名" width="100"></el-table-column>
                                        <el-table-column prop="group_name" label="小组" width="186" show-overflow-tooltip></el-table-column>
                                        <el-table-column prop="date" label="日期" width="150"></el-table-column>
                                        <el-table-column prop="attend_time" label="打卡时间" width="100"></el-table-column>
                                        <el-table-column prop="status.name" class-name="className" label="打卡状态" width="100"></el-table-column>
                                        <el-table-column  label="打卡地点">
                                              <template slot-scope="scope">
                                                  <p style="color: #475568;font-size: 12px;">{{scope.row.attend_addr_name}}</p>
                                                  <p style="font-size: 12px;color: #99a9bf;">{{scope.row.attend_addr}}</p>
                                              </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="考勤排行" name="考勤排行">
                            <div class="kq-record">
                                <div class="kq-seach-form kq-ranking-form">
                                    <el-form label-width="70px">
                                        <div class="from-item-list rankingMain">
                                          <el-form-item label="周期范围："  prop="kqDateRecord" class="rakinpInput">
                                              <el-date-picker 
                                                v-model="rankingTime" 
                                                range-separator="至"
                                                type="daterange"
                                                style="width:220px">
                                              </el-date-picker>
                                          </el-form-item>
                                          <el-form-item label="周期范围：" prop="kqDateRecord" class="rakpingPicker" v-if="attendance_rank_cycle == 2">
                                              <el-date-picker 
                                                @change="weekChange"
                                                v-model="rankingWeek" 
                                                type="week"
                                                format="yyyy-MM-dd"
                                                style="width:240px">
                                              </el-date-picker>
                                          </el-form-item>
                                          <el-form-item label="周期范围：" prop="kqDateRecord" class="rakpingPicker" v-if="attendance_rank_cycle == 1">
                                              <el-date-picker 
                                                @change="monthChange"
                                                v-model="rankingMonth" 
                                                type="month"
                                                format="yyyy-MM-dd"
                                                style="width:240px">
                                              </el-date-picker>
                                          </el-form-item>
                                        </div>
                                    </el-form>
                                    <div class="btn-item editRankingRules" @click="createPhFn" v-if="setKqRanking">
                                      <i class="edit_icon"></i>
                                      <a href="javascript:;">编辑排行规则</a>
                                    </div>
                                </div>
                                <div class="kq-table-record kq-tableranking-list">
                                    <el-table :data="tableKqRankinglist" border style="width: 100%;overflow-x:hidden;":height="RkwinHeight" :empty-text="RkEmptyText"  v-loading.body="loadingRk">
                                       <el-table-column  prop="ranking" show-overflow-tooltip label="名次" ></el-table-column>
                                       <el-table-column  prop="name" show-overflow-tooltip label="姓名" ></el-table-column>
                                        <el-table-column prop="group_name" label="所在小组"  show-overflow-tooltip></el-table-column>
                                        <el-table-column prop="attend_daycount" label="出勤天数（天）" ></el-table-column>
                                        <el-table-column prop="reward_sum" label="奖励金（元）" ></el-table-column>
                                    </el-table>
                                    <el-pagination
                                    v-if="total != 0"
                                    @current-change="handleSizeChange"
                                    :current-page.sync="Rkpage"
                                    :page-size="Rkpage_size"
                                    layout="total, prev, pager, next"
                                    :total="total">
                                  </el-pagination>
                                </div>
                            </div>
                        </el-tab-pane>

                    </el-tabs>
                    
                </div>
          </div>
      </div>
      <!-- 考勤详情弹窗 -->
    <div class="kq_detail">
      <!-- <el-button type="text" @click="showKqDetailFn(358,1838,402,37826,'2017-06-16')">查看考勤打卡记录</el-button> -->
      <el-dialog title="考勤打卡记录" :visible.sync="showKqDetail" :close-on-press-escape="false">
        <div class="user_info">
          <div v-if="kq_detail.extra_info.user_avatar&&kq_detail.extra_info.user_avatar.url" class="avatar" :style="'background-image:url('+kq_detail.extra_info.user_avatar.url+');'"></div>
          <div v-else class="avatar"></div>
          <div class="right_info">
            <p class="user_name">{{kq_detail.extra_info.user_name || '未知人员'}}</p>
            <p class="kq_team">
              <!-- <span>小组：{{kq_detail.extra_info.group_name || '未知小组'}}</span><span class="line"></span><span>所属考勤任务：所属考勤任务：所属考勤任务：所属考勤任务：{{kq_detail.extra_info.task_name}}</span> -->
              小组：{{kq_detail.extra_info.group_name || '未知小组'}}&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;所属考勤任务：{{kq_detail.extra_info.task_name}}
            </p>
          </div>
        </div>
        <div class="kq_info_wrap" v-loading="loading_kq_detail">
          <template v-for="(attendance, index) in kq_detail.attendance_list">
            <div class="kq_info_item">
            <!-- <div class="kq_info_item" v-if="attendance.flog!=-1"> -->
              <div class="kq_date">
                <p>{{attendance.type == 1 ? "上班" : "下班"}}&nbsp;&nbsp;{{attendance.cross == 1 ? "次日" : ""}}{{attendance.require_time}}</p>
                <div class="kq_status">
                  <template v-for="stat in attendance.status">
                    <el-tag :close-transition="true" type="success" v-if="stat.value==1">正常</el-tag>
                    <el-tag :close-transition="true" type="danger" v-else>{{stat.name}}</el-tag>
                  </template>
                  <!-- <el-tag :close-transition="true" type="danger" v-if="attendance.flog==-1">缺卡</el-tag> -->
                </div>
              </div>
              <div class="kq_format">
                <p class="attend_time" v-if="attendance.attend_time">{{attendance.attend_nextday == 1 ? "次日" : ""}}{{attendance.attend_time}}</p>
                <template v-for="format in attendance.form_data">
                  <div class="format_item">
                    <p class="item_title" v-if="(format.type!=='Imageview'&&format.value) || (format.type==='Imageview'&&format.pic_list.length)">{{format.title}}</p>

                    <p class="item_info" v-if="format.type==='Location'">{{format.value.addr_name}}({{format.value.addr}})</p>
                    <p class="view_location" v-if="format.type==='Location'">
                      <span @click="viewLocationFn(kq_detail.attendance_list.task_id, attendance.attendance_id)">查看位置</span>
                    </p>
                    <p class="item_info" v-if="format.type!=='Location'&&format.type!=='Imageview'">{{format.value}}</p>
                    <div class="pic_box" v-if="format.type==='Imageview'">
                      <div class="img" v-for="(pic, index) in format.pic_list">
                        <img
                          class="preview-img"
                          :src="pic.msrc"
                          @click="imgPreview(index, format.pic_list)"
                        >
                      </div>
                      <div class="clear"></div>
                    </div>
                  </div>
                </template>
                <div class="format_item" v-if="attendance.abnormal_reason">
                  <p class="item_title">异常原因</p>
                  <p class="item_info">{{attendance.abnormal_reason}}</p>
                </div>
                <div class="format_item" v-if="!attendance.form_data.length">
                  <p class="item_title">暂无打卡记录</p>
                </div>
                <i class="el-icon-circle-check" style="color:#72ce56;" v-if="attendance.flog==1"></i>
                <i class="el-icon-circle-cross" style="color:#ff7663;" v-if="attendance.flog==0"></i>
                <i class="circle" v-if="attendance.flog==-1"></i>
                <span class="status_line" v-if="index!=kq_detail.attendance_list.length-1"></span>
              </div>
              <div class="clear"></div>
            </div>
          </template>
          <!-- <div class="not_attendance" v-if='!kq_detail.attendance_list.length'>该日无工作安排</div> -->
        </div>
        <div class="kq_detail_foot">
          <div class="toggle_btn">
            <el-button v-if="kq_detail_index>0" class="hover" icon="arrow-left" @click="changeKqDetail(0)"></el-button>
            <el-button v-else icon="arrow-left" type="primary" :disabled="true"></el-button>
            <el-button v-if="kq_detail_index<cur_data.length-1" class="hover" icon="arrow-right" @click="changeKqDetail(1)"></el-button>
            <el-button v-else icon="arrow-right" type="primary" :disabled="true"></el-button>
          </div>
        </div>
        
      </el-dialog>
    </div>
    <div class="kq_detail_location">
      <el-dialog title="考勤位置地图" :visible.sync="showKqDetailLocation" :close-on-press-escape="false">
        <div id="container" class="map_view" v-loading="loading_Attendance_position"></div>
        <div class="big_small">
          <div class="big" @click="toBigFn"></div>
          <div style="height:1px;width:24px;margin-left:4px;background-color:#e0e6ed;"></div>
          <div class="small" @click="toSmallFn"></div>
        </div>
      </el-dialog>
    </div>
    <!-- 选择小组弹窗 -->
    <select-group-multi
      ref="profile"
      :all-groups="all_groups"
      v-on:confirmGroupSelecter="confirmGroupSelecter"
    ></select-group-multi>
    <!-- <div class="select_group">
      <el-dialog title="选择小组" :visible.sync="showGroupSelecter" :close-on-press-escape="false">
        <div class="select_group_main">
          <div class="all_groups_box">
            <p class="title">选择小组</p>
            <div class="all_search">
              <i class="el-icon-search"></i>
              <el-input
                :icon='filterText?"circle-cross":""'
                :on-icon-click="clearFilterText"
                placeholder="搜索小组"
                v-model="filterText">
              </el-input>
            </div>
            <div class="all_main">
              <el-tree
                :expand-on-click-node="false"
                :data="all_groups"
                :props="defaultProps"
                @node-click="handleNodeClick"
                :filter-node-method="filterNode"
                ref="all_groups"
                :default-expand-all="true"
              ></el-tree>
            </div>
          </div>
          <div class="selected_groups_box">
            <p class="title">已选择的小组</p>
            <div class="sel_main">
              <template v-for="(item, index) in origin_selected_groups">
                <div class="sel_item" @click="unSelectGroup(index)">
                  <p :title="item.name">{{item.name}}</p>
                  <i class="el-icon-close"></i>
                </div>
              </template>
            </div>
          </div>
          <i class="arrow"></i>
        </div>
        <div class="select_group_foot">
          <div class="btns">
            <el-button @click="showGroupSelecter = false">取消</el-button>
            <el-button class="confirm" style="background-color:#6699ee;color:#fff;" @click="confirmGroupSelecter">确定</el-button>
          </div>
        </div>
      </el-dialog>
    </div> -->
  </div>
</template>

<script>
    import * as util from '../assets/js/util.js'

    import SelectGroupMulti from '@/components/common/SelectGroupMulti'

    import p_icon1 from '@/assets/imgs/kqaddmin/position_bz.svg'
    import p_icon2 from '@/assets/imgs/kqaddmin/position.svg'

    let $ = require("jquery")
    let date = new Date()
    let today0 = util.formatData1(date)
    let today = util.getStampFromDateStr(date)
    var date2 = new Date(date)
    date2.setDate(date.getDate()-6)
    let end_timees = util.getStampFromDateStr(date2)
    let start_date = ''
    let end_date = ''
    let downloadUrl = ''
    let ajax_getting = false
    let ajax_getting1 = false
    let finished = false
    let cur_column = null//按月统计 点击单元格时 记录当前列
    let map = null
    let marker = null
    let kqdownload1 = true
    let kqdownload2 = false
    let kqdownload3 = false
    let trimeId = null
    export default{
      name: 'kqaddmin',
      components:{
        SelectGroupMulti
      },
      data:function(){
        var testStartTime0 = (rule,value,callback) => {
            if(!value) {
                return callback(new Error('请选择日期'));
            }else{
               callback();
            } 
        };
        var testStartTime = (rule,value,callback) => {
            var sumDays = ''
            if(!value || value[0] == null) {
                return callback(new Error('请选择日期'));
            }else{
                sumDays = util.DateDiff(util.formatData1(value[0]),util.formatData1(value[1]))
                if(sumDays > 31){
                    return callback(new Error('时间跨度不能超过31天'));
                }else{
                    callback();
                }
            } 
        };
        var kqTaskNameTest = (rule,value,callback) => {
            if (!value && !this.selectIf && !this.task_id.length) {
              return callback(new Error('请选择考勤规则'));
            }else{
              callback();
            }
        };
        var kqTaskNameTest_ = (rule,value,callback) => {
            if (!value.length && this.selectIf && !this.task_id_.length) {
              return callback(new Error('请选择考勤规则'));
            }else{
              callback();
            }
        };
        var kqExportType = (rule,value,callback) => {
            if (!value) {
              return callback(new Error('请选择导出类型'));
            }else{
              callback();
            }
        };
        var startTime = (rule,value,callback) => {
            if (!value) {
              return callback(new Error('请选择开始日期'));
            }else{
              callback();
            }
        };
        var endTime = (rule,value,callback) => {
            if(value){
                /*时间格式化*/
                let _time = util.formatData(this.ruleForm.sday,value) 
                /*计算开始时间-结束时间的总天数*/
                var sumDays = util.DateDiff(_time.s,_time.e)
            }
            if (!value) {
                return callback(new Error('请选择结束日期'));
            }else if(value < this.ruleForm.sday){
                return callback(new Error('结束时间不能小于开始时间'));
            }else if(sumDays > 31){
                return callback(new Error('时间跨度不能超过31天'));
            }else{
              callback();
            }
        };
        return{
            startPickerOptions: {   // 开始时间选项
              disabledDate(time) {
                return time.getTime() < Date.now() - 8.64e7;
              }
            },
            endPickerOptions: {  // 结束时间选项
              disabledDate(time) {
                return time.getTime() < Date.now() - 8.64e7;
              }
            },
            formLabelWidth: '74px',  // 控制input的宽度
            loadingDay:false,
            loadingM:false,
            loadingR:false,
            loadingRk:false,
            winHeight:'',
            restaurants:[],
            seachMemberListP:'',
            min_id:0,
            min_id2:0,
            page_size:50,
            exportPerm:false,
            isexport0:false,
            isexport1:false,
            isexport2:false,
            dialogVisible: false,
            dialogVisible2:false,
            kqTaskOptions:[],
            task_id:'',
            task_id_:'',
            exportTypes: '', // 导出类型
            tab_index:0,
            activeName:'按日统计',
            team_id:'',
            project_id:'',
            group_id:0,
            user_id:0,
            select_user_id:'',
            status_id:0,
            list: [],
            states: [],
            ruleForm:{
                sday:'',
                eday:'',
                kqTask:'',
                kqTask_:'',
                kqDateDay: today0, //初始化时间(按日)--默认选择当前日期
                kqDateMonth:[end_timees,today], //初始化时间(按月)--默认选择当前日期
                kqDateRecord:[today,today] //初始化时间(记录)--默认选择当前日期
            },
            groupDay:'', //小组--按日
            groupMonth:'', //小组--按月
            groupRecord:'', //小组--记录
            memberDay:'', // 人员--按日
            memberMonth:'', // 人员--按月
            memberRecord:'', // 人员--记录
            stateDay:'全部',  //状态--按日
            stateRecord:'全部',  //状态--记录
            options4Day: [], //搜索列表option -- 按日
            options4Month: [], //搜索列表option -- 按月
            options4Record: [], //搜索列表option -- 按月
            stateOptionsDay:[  //状态列表数据--按日
              {
                label:'全部',
                value:'全部',
                id:0
              },
              {
                label:'正常',
                value:'正常',
                id:1
              },
              {
                label:'迟到',
                value:'迟到',
                id:2
              },
              {
                label:'早退',
                value:'早退',
                id:3
              },
              {
                label:'工时短缺',
                value:'工时短缺',
                id:4
              },
              {
                label:'地点异常',
                value:'地点异常',
                id:5
              },
              {
                label:'缺卡',
                value:'缺卡',
                id:6
              }
            ],
            stateOptionsRecord:[  //状态列表数据--按日
              {
                label:'全部',
                value:'全部',
                id:0
              },
              {
                label:'正常',
                value:'正常',
                id:1
              },
              {
                label:'迟到',
                value:'迟到',
                id:2
              },
              {
                label:'早退',
                value:'早退',
                id:3
              },
              {
                label:'工时短缺',
                value:'工时短缺',
                id:4
              },
              {
                label:'地点异常',
                value:'地点异常',
                id:5
              },
              {
                label:'缺卡',
                value:'缺卡',
                id:6
              }
            ],
            tableDataDay:[], // 考勤统计表格-按日
            tableDataMonth:[], // 考勤统计表格--按月
            allDateList:[],  // 考勤统计表格--按月--表头数据
            tableDataRecord:[], // 考勤统计表格--打卡记录
            rules: {  //日期验证规则
                kqDateDay: [
                    { validator: testStartTime0, trigger: 'change' }
                ],
                kqDateMonth: [
                    { validator: testStartTime, trigger: 'change' }
                ],
                kqDateRecord: [
                    { validator: testStartTime, trigger: 'change' }
                ],
                kqTask: [
                    { validator: kqTaskNameTest, trigger: 'blur' }
                ],
                kqTask_: [
                    { validator: kqTaskNameTest_, trigger: 'blur' }
                ],
                kqExport: [
                    { validator: kqExportType, trigger: 'change' }
                ],
                sday: [
                    { validator: startTime, trigger: 'change' }
                ],
                eday: [
                    { validator: endTime, trigger: 'change' }
                ],
            },
            showKqDetail: false,//是否显示考勤详情弹窗
            showKqDetailLocation: false,//是否显示考勤位置弹窗
            showGroupSelecter: false,//是否显示选择小组弹窗
            kq_detail: {//考勤详情弹窗数据
              extra_info: {},
              attendance_list: []
            },
            loading_kq_detail: false,
            loading_Attendance_position: false,
            kq_detail_index: 0,//弹窗展示是第几行
            pre_kq_detail_index: 0,//记录上一个是第几行
            cur_data: [],//当前表格数据
            filterText: '',//过滤小组关键字
            all_groups: [],//全部小组
            origin_selected_groups: [],//展示已选小组时所用小组数据
            selected_groups: [],//已选择的小组
            // defaultProps: {
            //   children: 'children',
            //   label: 'name'
            // },
            kqProp:'',
            kqMonthClassArr: [],//按月统计 记录需要加颜色的坐标
            rankingRcope:'',//考勤排行范围
            rankingTime:'',//筛选时间展示
            rankingMonth:'',//排行月选择日期
            rankingWeek:'',//排行周选择日期
            tableKqRankinglist:[],//考勤排行列表
            attendance_rank_cycle:1,//考勤周期2为周 1为月
            Rkpage:1,
            Rkpage_size:100,
            total:0,//总条数
            RkEmptyText:'',//考勤排行列表空态提示
            RkwinHeight:0,//考勤排行table高
            setKqRanking:false,//超管展示设置考勤排行入口
            selectIf:true,//单双选切换,
            kqdownload1:true,
            kqdownload2:false,
            kqdownload3:false,
        }
      },
      computed:{

      },
      watch: {
        // filterText(val) {
        //   // console.log(this.$refs)
        //   this.$refs.all_groups.filter(val);
        // },
        '$route' () {
          this.init();
        },
        kqMonthClassArr(val) {
          // console.log(12312312)
          setTimeout(() => {
            // console.log($('.kq-table-month .el-table__body-wrapper .el-table__body tbody'))
            this.kqMonthClassArr.forEach((obj) => {
              $('.kq-table-month .el-table__body-wrapper .el-table__body tbody tr').eq(obj[0]).find('td').eq(obj[1]+3).css({color: '#ff6600'})
            })
          },100)
        }
      },
      methods:{
        init (){
            //清空缓存的已选择的小组
            util.setLocalStorage('origin_selected_groups', []);
            this.team_id = util.getLocalStorage('projectStorageInfo').team_id;
            this.project_id = util.getLocalStorage('projectStorageInfo').project_id;
            this.kqProp = util.getLocalStorage('kqProp');
            this.activeName = util.getLocalStorage('activeName') == 'kqph' ? '考勤排行' : '按日统计'
            window.localStorage.removeItem('activeName')
            //获取权限;
            this.getpermission();
            // console.log(this.kqProp)
            if(this.kqProp){
                if(this.kqProp.origin === 'Overviews'){
                    this.tab_index = this.kqProp.props.tab
                    if(this.kqProp.props.tab == 0){
                        this.activeName = '按日统计'
                        this.ruleForm.kqDateDay = this.kqProp.props.date
                        this.status_id = this.kqProp.props.status
                        this.stateOptionsDay.forEach( (o) => {
                            if(o.id == this.kqProp.props.status){
                                this.stateDay = o.value
                            }
                        })
                        this.getTableDataDay()
                    }else if(this.kqProp.props.tab == 1){
                        this.activeName = '按月统计'
                        this.getTableDataMonth()
                    }
                    util.setLocalStorage('kqProp',null)
                }
            }
            // console.log(this.activeName)
            if(this.activeName === '按月统计'){
              // 考勤--按月统计
              this.getTableDataMonth()
            }else if(this.activeName === '打卡记录'){
              // //考勤--打卡记录
              this.getTableDataRecord()
            }else if(this.activeName === '考勤排行'){
              this.Rkpage = 1;
              this.tab_index = 3;
                this.getRankingCycle()
            }else{
              //考勤--按日统计
              this.getTableDataDay()
            }
            //获取可选择小组列表
            util.ajax({
              url: '/group/select_list',
              type:'GET',
              data: {
                group_id: 0,
                team_id: this.team_id,
                project_id: this.project_id
              },
              success: (res) => {
                //console.log(JSON.stringify(res))
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
        //考勤--按日统计
        getTableDataDay(exp){
            this.loadingDay = true
            if(!this.ruleForm.kqDateDay){
                this.loadingDay = false
                return
            }
            let group_id_arr = []
            this.selected_groups.forEach((item) =>{
                group_id_arr.push(item.id)
            })
            if(this.tab_index == 0){
                if(exp && exp == 1){
                    if(this.states.length != 0){
                        if(!this.select_user_id && this.states[0].status == -1 && this.memberDay){
                             this.tableDataDay = []
                             this.isexport0 = false
                             this.loadingDay = false
                             this.user_id = 0
                             return
                        }
                        if(!this.memberDay){
                             this.user_id = 0
                        }
                        if(this.select_user_id == -1 && this.states[0].status == -1){
                            this.user_id = 0
                        }
                    }
                    if(!this.select_user_id && this.states){
                        let arr = []
                        this.states.forEach( (o) => {
                            arr.push(o.user_id)
                        })
                        this.user_id = arr
                    }
                    if(this.select_user_id && this.select_user_id != -1){
                        this.user_id = this.select_user_id
                    }
                    if(this.select_user_id && this.states && this.select_user_id != -1){
                        this.user_id = this.select_user_id
                    }
                    if(!this.memberDay){
                        this.user_id = 0
                    }
                    // if(!this.states && !this.select_user_id){
                    //     this.user_id = 0
                    // }
                }
            }
            let _data = {
                  team_id : this.team_id,
                  project_id:this.project_id,
                  date:util.formatData1(this.ruleForm.kqDateDay),
                  group_id:group_id_arr.length ? group_id_arr : this.group_id,
                  user_id:this.user_id,
                  status:this.status_id
              }
            console.log(_data)
            util.ajax({
                url:'/attendance/stats_day',
                type:'GET',
                data:_data,
                timeout:10000,
                success:(obj) => {
                  // console.log(obj)
                    if(obj && obj.errno == 0){
                        if(exp && exp == 1){
                            this.tableDataDay = []
                        }
                        if(obj.data.list.length){
                            this.isexport0 = true
                        }else{
                            this.isexport0 = false
                        }
                        obj.data.list.forEach((o,i) => {
                            o.index = i
                        })
                        this.tableDataDay = obj.data.list
                    }
                    this.loadingDay = false
                },   
                error: (xhr, status) => {
                    this.loadingDay = false
                },
                noNetwork: () => {
                  this.loadingDay = false
                  //网络超时
                  this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络',
                    type: 'warning'
                  });
                }
            })
        },
        addColor() {
          //console.log(this.tableDataMonth)
          setTimeout((obj) => {
            this.tableDataMonth.forEach((obj1,par_index) => {
              obj1.date_data.forEach((obj2,index) => {
                if(obj2.status&&obj2.status!=='正常'){
                  //console.log(par_index,index)
                  $('.kq-table-month .el-table__body-wrapper .el-table__body tbody tr').eq(par_index).find('td').eq(index+3).css({color: '#ff6600'})
                }
              })
              
            })
          },100)
          
        },
        //考勤--按月统计
        getTableDataMonth(exp){
            this.loadingM = true
            if(!this.ruleForm.kqDateMonth){
                this.loadingM = false
                return
            }
            let sumDays = util.DateDiff(util.formatData1(this.ruleForm.kqDateMonth[0]),util.formatData1(this.ruleForm.kqDateMonth[1]))
            if(sumDays > 31){
                this.loadingM = false
                return
            }
            let group_id_arr = []
            this.selected_groups.forEach((item) =>{
                group_id_arr.push(item.id)
            })
            if(this.tab_index == 1){
                if(ajax_getting1 == false){
                    this.min_id = 0
                }
                if(exp && exp == 1 && ajax_getting1 == true){
                    this.min_id = 0
                }
                if(exp && exp == 1){
                    if(this.states.length != 0){
                        if(!this.select_user_id && this.states[0].status == -1 && this.memberMonth){
                             this.tableDataMonth = []
                             this.isexport1 = false
                             this.loadingM = false
                             return
                        }
                        if(!this.memberMonth){
                             this.user_id = 0
                        }
                        if(this.select_user_id == -1 && this.states[0].status == -1){
                            this.user_id = 0
                        }
                    }
                    if(!this.select_user_id && this.states){
                        let arr = []
                        this.states.forEach( (o) => {
                            arr.push(o.user_id)
                        })
                        this.user_id = arr
                    }
                    if(this.select_user_id && this.select_user_id != -1){
                        this.user_id = this.select_user_id
                    }
                    if(this.select_user_id && this.states && this.select_user_id != -1){
                        this.user_id = this.select_user_id
                    }
                    if(!this.memberMonth){
                        this.user_id = 0
                    }
                    // if(!this.states && !this.select_user_id){
                    //     this.user_id = 0
                    // }
                }
            }
            let _data = {
                  team_id : this.team_id,
                  project_id:this.project_id,
                  start_date:util.formatData1(this.ruleForm.kqDateMonth[0]),
                  end_date:util.formatData1(this.ruleForm.kqDateMonth[1]),
                  group_id:group_id_arr.length ? group_id_arr : this.group_id,
                  user_id:this.user_id,
                  min_id:this.min_id,
                  page_size:50
              }
              // console.log(_data)

            util.ajax({
                url:'/attendance/stats_month',
                type:'GET',
                data:_data,
                timeout:10000,
                success:(obj) => {
                  // console.log(obj)
                    if(obj && obj.errno == 0){
                        this.allDateList = []
                       if(exp && exp == 1){
                          this.tableDataMonth = []
                       }
                      obj.data.header.forEach((head, index) => {
                        let tempObj = {}
                        tempObj.label = head
                        tempObj.prop = 'state_'+index
                        this.allDateList.push(tempObj)
                      })
                      obj.data.list.forEach((per, list_index) => {
                        per.date_data.forEach((per_date, index) => {
                          per['state_'+index] = per_date.status
                          // if(per_date.status&&per_date.status!=='正常'){
                          //   let tempArr = [list_index, index]
                          //   this.kqMonthClassArr.push(tempArr)
                          // }
                        })

                      })
                      obj.data.list.forEach((o,i) => {
                          o.index = i
                      })
                      if(obj.data.list.length){
                          this.isexport1 = true
                      }else{
                          this.isexport1 = false
                      }
                      this.tableDataMonth = obj.data.list
                      //遍历所有数据 添加颜色
                      this.addColor()
                      this.min_id = obj.data.min_id
                      if(obj.data.load_more == 0){
                          ajax_getting1 = false
                      }else{
                          ajax_getting1 = true
                      }
                    }
                    this.loadingM = false
                },
                error: (xhr, status) => {
                    this.loadingM = false
                },
                noNetwork: () => {
                  this.loadingM = false
                  //网络超时
                  this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络',
                    type: 'warning'
                  });
                }
            })
        },
        //考勤--打卡记录
        getTableDataRecord(exp){
            this.loadingR = true
            if(!this.ruleForm.kqDateRecord){
                this.loadingR = false
                return
            }
            let sumDays = util.DateDiff(util.formatData1(this.ruleForm.kqDateRecord[0]),util.formatData1(this.ruleForm.kqDateRecord[1]))
            if(sumDays > 31){
                this.loadingR = false
                return
            }
            let group_id_arr = []
            this.selected_groups.forEach((item) =>{
                group_id_arr.push(item.id)
            })
            if(this.tab_index == 2){
                if(ajax_getting == false){
                    this.min_id2 = 0
                }
                if(exp && exp == 1 && ajax_getting == true){
                    this.min_id2 = 0
                }
                if(exp && exp == 1){
                    if(this.states.length != 0){
                        if(!this.select_user_id && this.states[0].status == -1 && this.memberRecord){
                             this.tableDataRecord = []
                             this.isexport2 = false
                             this.loadingR = false
                             return
                        }
                        if(!this.memberRecord){
                             this.user_id = 0
                        }
                        if(this.select_user_id == -1 && this.states[0].status == -1){
                            this.user_id = 0
                        }
                    }
                    if(!this.select_user_id && this.states){
                        let arr = []
                        this.states.forEach( (o) => {
                            arr.push(o.user_id)
                        })
                        this.user_id = arr
                    }
                    if(this.select_user_id && this.select_user_id != -1){
                        this.user_id = this.select_user_id
                    }
                    if(this.select_user_id && this.states && this.select_user_id != -1){
                        this.user_id = this.select_user_id
                    }
                    if(!this.memberRecord){
                        this.user_id = 0
                    }
                    // if(!this.states && !this.select_user_id){
                    //     this.user_id = 0
                    // }
                }
            }
            let _data = {
                  team_id : this.team_id,
                  project_id:this.project_id,
                  start_date:util.formatData1(this.ruleForm.kqDateRecord[0]),
                  end_date:util.formatData1(this.ruleForm.kqDateRecord[1]),
                  group_id:group_id_arr.length ? group_id_arr : this.group_id,
                  user_id:this.user_id,
                  status:this.status_id,
                  min_id:this.min_id,
                  page_size:this.page_size
              }
              // console.log(_data)

            util.ajax({
                url:'/attendance/record',
                type:'GET',
                data:_data,
                timeout:10000,
                success:(obj) => {
                  // console.log(obj)
                    if(obj && obj.errno == 0){
                        if(exp && exp == 1){
                          this.tableDataRecord = []
                        }
                        obj.data.list.forEach((o,i) => {
                            o.index = i
                        })
                        if(obj.data.list.length){
                            this.isexport2 = true
                        }else{
                            this.isexport2 = false
                        }
                        let pa = /.*\((.*)\)/;
                        // obj.data.list.forEach( (o) => {
                        //     if(o.attend_position){
                        //         let str = o.attend_position.split('(')[0]
                        //         let addr = o.attend_position.match(pa)[1]
                        //         o.str = str
                        //         o.addr = addr
                        //     }
                        // })
                        this.tableDataRecord = obj.data.list
                        this.min_id2 = obj.data.min_id
                        if(obj.data.load_more == 0){
                            ajax_getting = false
                        }else{
                            ajax_getting = true
                        }
                    }
                    this.loadingR = false
                },
                error: (xhr, status) => {
                    this.loadingR = false
                },
                noNetwork: () => {
                  this.loadingR = false
                  //网络超时
                  this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络',
                    type: 'warning'
                  });
                }
            })
        },
        //3个tab切换
        handleClick(tab, event){
            this.min_id = 0
            this.min_id2 = 0
            this.tab_index = tab.index
            this.states = []
            this.kq_detail.extra_info = {}
            this.kq_detail.attendance_list = []
            this.selected_groups = []
            this.restaurants = []
            this.select_user_id = ''
            this.group_id = 0
            this.user_id = 0
            this.status_id = 0
            util.setLocalStorage('origin_selected_groups', [])
            if(tab.index == 0){
                //考勤--按日统计
                this.getTableDataDay()
            }else if(tab.index == 1){
                //考勤--按月统计
                this.getTableDataMonth()
            }else if(tab.index == 2){
                //考勤--打卡记录
                this.getTableDataRecord()
            }else if(tab.index == 3){
                //考勤--考勤排行
                this.Rkpage = 1;
                this.getRankingCycle()
            }
        },
        //人员搜索
        querySearch(queryString, cb){
            if(queryString){
                this.select_user_id = ''
                this.states = []
                util.ajax({
                    url:'/group/member_search',
                    type:'GET',
                    data:{
                        team_id:this.team_id,
                        project_id:this.project_id,
                        group_id:'',
                        keyword:queryString,
                        page_no:'',
                        page_size:''
                    },
                    timeout:10000,
                    success:(obj) => {
                        // console.log(obj)
                        if(obj && obj.errno == 0){
                            let strArr = []
                            obj.data.list.forEach((o) => {
                                let str = ''
                                str = { 
                                  "value": o.user_name, 
                                  "group_name":o.group_name,
                                  "group_id": o.group_id,
                                  "user_id":o.user_id
                                }
                                strArr.push(str)
                            })
                            this.restaurants = strArr
                            var results = queryString ? this.restaurants.filter(this.createFilter(queryString)) : this.restaurants;
                            if(results.length == 0){
                                results.push({'value':'无搜索结果','status':'-1'})
                            }
                            this.states = results
                            clearTimeout(this.timeout);
                            this.timeout = setTimeout(() => {
                              // 调用 callback 返回建议列表的数据
                              cb(results);
                            }, 1000 * Math.random());
                            
                        }
                    },
                    error: (xhr, status) => {
                        
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
            }
        },
        createFilter(queryString) {
            return (restaurant) => {
              return (restaurant.value.toLowerCase() || restaurant.value.indexOf(queryString) > -1);
            };
        },
        handleSelect(item){
          // console.log(item)
          if(item.status == -1){
              if(this.tab_index == 0){
                  this.memberDay = ''
                  this.select_user_id = -1
              }else if(this.tab_index == 1){
                  this.memberMonth == ''
                  this.select_user_id = -1
              }else if(this.tab_index == 2){
                  this.memberRecord = ''
                  this.select_user_id = -1
              }
          }else{
              this.select_user_id = item.user_id
          }
        },
        //导出弹窗
        exportDialog(){
          this.alertIsexport()
            // if(this.tab_index == 0){
            //     if(!this.isexport0){
            //         this.$message({
            //           showClose: true,
            //           message: '当前选择范围内无考勤数据，请重新选择范围再导出',
            //           type: 'warning'
            //         });
            //         return
            //     }else{
            //       this.alertIsexport()
            //     }
            // }else if(this.tab_index == 1){
            //     if(!this.isexport1){
            //         this.$message({
            //           showClose: true,
            //           message: '当前选择范围内无考勤数据，请重新选择范围再导出',
            //           type: 'warning'
            //         });
            //         return
            //     }else{
            //       this.alertIsexport()
            //     }
            // }else if(this.tab_index == 2){
            //     if(!this.isexport2){
            //         this.$message({
            //           showClose: true,
            //           message: '当前选择范围内无考勤数据，请重新选择范围再导出',
            //           type: 'warning'
            //         });
            //         return
            //     }else{
            //       this.alertIsexport()
            //     }
            // }
        },
        alertIsexport(){
          if(this.tab_index != 3){
            this.dialogVisible = true
            util.ajax({
                url:'/attendance/attendance_task_list',
                type:'GET',
                data:{
                    team_id:this.team_id,
                    project_id:this.project_id,
                    page:'',
                    page_size:'',
                    max_id:0
                },
                timeout:10000,
                success:(obj) => {
                  // console.log(obj)
                    if(obj && obj.errno == 0){
                        this.kqTaskOptions = obj.data.list
                    }
                },
                error: (xhr, status) => {
                    
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
          }else{
            let start = new Date(this.rankingTime[0]),
                end = new Date(this.rankingTime[1]);
            start.setHours(0, 0, 0, 0)
            end.setHours(0, 0, 0, 0)
            let downloadUrl = '/sea/api/1.0/client/v1/attendance/list?dmclient=pcweb&team_id='+this.team_id+'&project_id='+this.project_id+'&start='+start.getTime()/1000+'&end='+ (end.getTime()/1000 +86400)+'&export='+1+'&page='+this.Rkpage + '&page_size=100'
            this.dialogVisible = false
            util.locationHref(downloadUrl)

          }
          // util.ajax({
          //       url:'/attendance/attendance_task_list',
          //       type:'GET',
          //       data:{
          //           team_id:this.team_id,
          //           project_id:this.project_id
          //       },
          //       timeout:10000,
          //       success:(obj) => {
          //         // console.log(obj)
          //           if(obj && obj.errno == 0){
          //               this.kqTaskOptions = obj.data
          //           }
          //       },
          //       error: (xhr, status) => {
                    
          //       },
          //       noNetwork: () => {
          //         //网络超时
          //         this.$message({
          //           showClose: true,
          //           message: '网络连接失败，请检查网络',
          //           type: 'warning'
          //         });
          //       }
          //   })
            
        },
        downloadUrl(){
            downloadUrl = '/sea/api/1.0/client/v1/attendance/attendance/export2?dmclient=pcweb&team_id='+this.team_id+'&project_id='+this.project_id+'&start_date='+util.formatData1(this.ruleForm.sday)+'&end_date='+util.formatData1(this.ruleForm.eday)+'&export='+1+'&task_id='+this.task_id
            this.dialogVisible = false
            util.locationHref(downloadUrl)  
        },
        //导出确认按钮
        confirm(formName){
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.dialogVisible = false
                    this.kqdownload1 = kqdownload1 =  false
                    this.kqdownload2 = kqdownload2 = true
                    this.kqdownload3 = kqdownload3 = false
                    let data_ = {
                      team_id:this.team_id,
                      project_id:this.project_id,
                      start_date:util.formatData1(this.ruleForm.sday),
                      end_date:util.formatData1(this.ruleForm.eday),
                      task_id:this.selectIf?JSON.stringify(this.task_id_):`["${this.task_id}"]`,
                      type:this.exportTypes, // 导出类型参数
                    }
                    util.ajax({
                        url:'/attendance/attendance/export3',
                        type:'POST',
                        data:data_,
                        timeout:10000,
                        success:(obj) => {
                            if(obj && obj.errno == 0){
                              let key = obj.data.key
                              util.setLocalStorage(`pollingkey${this.project_id}`,key,80000000)
                              let polldata = Object.assign(data_,{key:key,dmclient:'pcweb'})
                              trimeId = setInterval(() => {
                                // 开始轮询
                                util.ajax({
                                  url:'/attendance/attendance/export3',
                                  type:'POST',
                                  data:polldata,
                                  timeout:10000,
                                  success:(obj) => {
                                      if(obj && obj.errno == 0 && obj.data.download_url){
                                        window.clearInterval(trimeId)
                                        this.kqdownload1 = kqdownload1 = false
                                        this.kqdownload2 = kqdownload1 = false
                                        this.kqdownload3 = kqdownload1 = true
                                        util.setLocalStorage(`pollingurl${this.project_id}`,obj.data.download_url,80000000)
                                      }else{
                                        this.kqdownload1 = kqdownload1 = true
                                        this.kqdownload2 = kqdownload2 = false
                                        this.kqdownload3 = kqdownload3 = false
                                        localStorage.removeItem(`pollingurl${this.project_id}`)
                                        localStorage.removeItem(`pollingkey${this.project_id}`)
                                        window.clearInterval(trimeId)
                                        this.$message({
                                          showClose: true,
                                          message: obj.errmsg,
                                          type: 'warning'
                                        });
                                      }
                                  },
                                  error: (xhr, status) => {
                                  window.clearInterval(trimeId)
                                  this.kqdownload1 = kqdownload1 = true
                                  this.kqdownload2 = kqdownload2 = false
                                  this.kqdownload3 = kqdownload3 = false
                                  localStorage.removeItem(`pollingurl${this.project_id}`)
                                  localStorage.removeItem(`pollingkey${this.project_id}`)
                                },
                                noNetwork: () => {
                                  window.clearInterval(trimeId)
                                  this.kqdownload1= kqdownload1 = true
                                  this.kqdownload2 = kqdownload2 = false
                                  this.kqdownload3 = kqdownload3 = false
                                  localStorage.removeItem(`pollingurl${this.project_id}`)
                                  localStorage.removeItem(`pollingkey${this.project_id}`)
                                  //网络超时
                                  this.$message({
                                    showClose: true,
                                    message: '网络连接失败，请检查网络',
                                    type: 'warning'
                                  });
                                }
                              })
                              }, 2000);
                              // ===================================
                            }else{
                              this.kqdownload1 = kqdownload1 = true
                              this.kqdownload2 = kqdownload2 = false
                              this.kqdownload3 = kqdownload3 = false
                              localStorage.removeItem(`pollingurl${this.project_id}`)
                              localStorage.removeItem(`pollingkey${this.project_id}`)
                              window.clearInterval(trimeId)
                              this.$message({
                                showClose: true,
                                message: obj.errmsg,
                                type: 'warning'
                              });
                            }
                        },
                        error: (xhr, status) => {
                          window.clearInterval(trimeId)
                          this.kqdownload1 = kqdownload1 = true
                          this.kqdownload2 = kqdownload2 = false
                          this.kqdownload3 = kqdownload3 = false
                          localStorage.removeItem(`pollingurl${this.project_id}`)
                          localStorage.removeItem(`pollingkey${this.project_id}`)
                        },
                        noNetwork: () => {
                          window.clearInterval(trimeId)
                          this.kqdownload1= kqdownload1 = true
                          this.kqdownload2 = kqdownload2 = false
                          this.kqdownload3 = kqdownload3 = false
                          localStorage.removeItem(`pollingurl${this.project_id}`)
                          localStorage.removeItem(`pollingkey${this.project_id}`)
                          //网络超时
                          this.$message({
                            showClose: true,
                            message: '网络连接失败，请检查网络',
                            type: 'warning'
                          });
                        }
                    })   
                } else {
                  window.clearInterval(trimeId)
                    //console.log('error submit!!');
                    return false;
                }
            });
            // let group_id_arr = []
            // this.selected_groups.forEach((item) =>{
            //     group_id_arr.push(item.id)
            // })
            // // if(this.tab_index == 0){
            // //     downloadUrl = util.host + '/sea/api/1.0/client/v1/attendance/stats_day?dmclient=pcweb&team_id='+this.team_id+'&project_id='+this.project_id+'&start_date='+util.formatData1(this.ruleForm.kqDateDay[0])+'&end_date='+util.formatData1(this.ruleForm.kqDateDay[1])+'&group_id='+(group_id_arr.length ? group_id_arr : this.group_id)+'&user_id='+(this.user_id ? this.user_id : 0)+'&export='+1+'&task_id='+this.task_id+'&status='+this.status_id
            // //     this.dialogVisible2 = false
            // //     location.href = downloadUrl
            // // }else if(this.tab_index == 1){
            // //     downloadUrl = util.host + '/sea/api/1.0/client/v1/attendance/stats_month?dmclient=pcweb&team_id='+this.team_id+'&project_id='+this.project_id+'&start_date='+util.formatData1(this.ruleForm.kqDateMonth[0])+'&end_date='+util.formatData1(this.ruleForm.kqDateMonth[1])+'&group_id='+(group_id_arr.length ? group_id_arr : this.group_id)+'&user_id='+(this.user_id ? this.user_id : 0)+'&export='+1+'&task_id='+this.task_id+'&min_id='+0+'&page_size='+''
            // //    this.dialogVisible2 = false
            // //    location.href = downloadUrl
            // // }else {
            // //     this.$refs[formName].validate((valid) => {
            // //         if (valid) {
            // //             downloadUrl = util.host + '/sea/api/1.0/client/v1/attendance/record?dmclient=pcweb&team_id='+this.team_id+'&project_id='+this.project_id+'&start_date='+util.formatData1(this.ruleForm.kqDateRecord[0])+'&end_date='+util.formatData1(this.ruleForm.kqDateRecord[1])+'&group_id='+(group_id_arr.length ? group_id_arr : this.group_id)+'&user_id='+(this.user_id ? this.user_id : 0)+'&export='+1+'&task_id='+this.task_id+'&min_id='+0+'&page_size='+''+'&status='+this.status_id
            // //             this.$refs[formName].resetFields();
            // //             this.dialogVisible = false
            // //             location.href = downloadUrl
            // //         } else {
            // //             //console.log('error submit!!');
            // //             return false;
            // //         }
            // //     });
                
            // // }     
            //console.log(downloadUrl)
            
        },
        kqdownloadcalfuc(){
          this.kqdownload1= kqdownload1 = true
          this.kqdownload2 = kqdownload2 = false
          this.kqdownload3 = kqdownload3 = false
          localStorage.removeItem(`pollingurl${this.project_id}`)
          localStorage.removeItem(`pollingkey${this.project_id}`)
        },
        kqdownloadfuc(){
          this.kqdownload1= kqdownload1 = true
          this.kqdownload2 = kqdownload2 = false
          this.kqdownload3 = kqdownload3 = false
          let pollingurl = util.getLocalStorage(`pollingurl${this.project_id}`)
          var $eleForm = $("<form method='get'></form>");
          $eleForm.attr("action",pollingurl);
          $(document.body).append($eleForm);
          //提交表单，实现下载
          $eleForm.submit();
          // window.open(pollingurl)
          localStorage.removeItem(`pollingurl${this.project_id}`)
          localStorage.removeItem(`pollingkey${this.project_id}`)
        },
        //取消
        resetForm(formName) {
          this.$refs[formName].resetFields();
          this.dialogVisible = false
        },
         // 按月统计--点击日期单元格事件
        cellClick(row, column, cell, event){
          cur_column = column
            let labelStr = column.label.substring(column.label.length-3,0)
            let str_m = str_m = labelStr.split('/')[0] < 10 ? '0' + labelStr.split('/')[0] : labelStr.split('/')[0]
            let str_d = labelStr.split('/')[1] < 10 ? '0' + labelStr.split('/')[1] : labelStr.split('/')[1]
            // if(labelStr.length == 4){
            //     str_d = labelStr.substring(2,4) < 10 ? '0' + labelStr.substring(2,4) : labelStr.substring(2,4)
            // }else{
            //     str_d = labelStr.substring(2,3) < 10 ? '0' + labelStr.substring(2,3) : labelStr.substring(2,3)
            // }
            let td = str_m + '-' + str_d
            row.date_data.forEach( (o,i) => {
                let tts = util.getStampFromDateStr(new Date(parseInt(o.date) * 1000))
                if(tts.indexOf(td) > -1){
                    row.date = tts
                    row.task_id = o.task_id
                }
            })
            // console.log(row)
            if(column.label == "出勤天数" || column.label == "小组" || column.label == "姓名"){
                return
            }else{
              if(row.task_id != 0){
                // console.log(row.date_data[column.property.split('_')[1]].status)
                if(row.date_data[column.property.split('_')[1]].status){//缺卡也不显示状态  不能点击
                  this.showKqDetailFn(row,event,column)
                }else{
                  row.task_id = undefined
                  if(this.showKqDetail){
                    this.$message({
                      showClose: true,
                      message: '没有更多了',
                      type: 'warning'
                    });
                    this.kq_detail_index = this.pre_kq_detail_index
                  }
                }
              }else{
                row.task_id = undefined
                if(this.showKqDetail){
                  this.$message({
                    showClose: true,
                    message: '没有更多了',
                    type: 'warning'
                  });
                  this.kq_detail_index = this.pre_kq_detail_index
                }
              }
            }
        },
        classNameAttribute(row, index){
            if(this.tab_index == 0 || this.tab_index == 2){
              return row.status.normal == 1 ? '' : 'unn'
            }
        },
        // classNameAttribute2(row, index){
        //   // console.log(row)
        //     let o = ''
        //     row.date_data.forEach((item) => {
        //        if(item.status == '正常'){
        //           o = ''
        //        }else{
        //           o = 'unn'
        //        }
        //     })
        //     return o
        // },
        //切换状态时选择的状态id
        selectStateId(value){
            this.stateOptionsDay.forEach( (o) => {
                if(o.value === value){
                    this.status_id = o.id
                }
            })
        },
        selectRecordStateId(value){
            this.stateOptionsRecord.forEach( (o) => {
                if(o.value === value){
                    this.status_id = o.id
                }
            })
        },
        selectTaskId(value){
            this.task_id = value
        },
        selectTaskId_(value){
            this.task_id_ = value
        },
        // 导出类型
        selectkqExport(value){
          if(value == '3'){
            this.selectIf=false 
          }else{
            this.selectIf=true
          }
          this.exportTypes = value
        },
        getRankingCycle(){
          this.loadingRk = true;
          util.ajax({
            url:'/attendance/cycle/get',
            data:{
              project_id:this.project_id,
              team_id:this.team_id,
            },
            type:'GET',
            success:(res)=>{
              if(res.errno == 0){
                this.attendance_rank_cycle = res.data.attendance_rank_cycle;
                this.getTableRankingTime()
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
        getTableRankingTime(){
          if(this.attendance_rank_cycle == 2){
            let nowDate = util.formatData1(new Date());
            let rankingTime = util.getWeekLastFirst(nowDate)
            if(this.rankingTime[0] == rankingTime[0]){
              this.getTableRankingList()
            }
            this.rankingTime = rankingTime;
            this.rankingWeek = nowDate;
          }else{
              let time = new Date();
              time.setDate(1);
              let FirstDate = util.formatData1(time);
              let rankingTime =  util.getMonthLaskFirst(FirstDate);
              if(this.rankingTime[0] == rankingTime[0]){
                this.getTableRankingList()
              }
              this.rankingTime = rankingTime;
              this.rankingMonth = FirstDate;
          }
        },
        getTableRankingList(){
          this.loadingRk = true;
          let start = new Date(this.rankingTime[0]),
              end = new Date(this.rankingTime[1]);
          start.setHours(0, 0, 0, 0)
          end.setHours(0, 0, 0, 0)
          util.ajax({
            url:'/attendance/list',
            data:{
              project_id:this.project_id,
              team_id:this.team_id,
              start:start.getTime()/1000,
              end:end.getTime()/1000 +86400,
              page:this.Rkpage,
              page_size:100,
              export:0
            },
            type:'GET',
            success:(res)=>{
              this.loadingRk = false;
              if(res.errno == 0){
                this.tableKqRankinglist = res.data.list;
                this.RkEmptyText = '暂无数据';
                this.total = res.data.total || 0;
                if(this.total == 0){
                  this.RkwinHeight = $(window).height() - 245;
                }else{
                  this.RkwinHeight = $(window).height() - 290;
                }
              }else{
                this.tableKqRankinglist = [];
                this.RkwinHeight = $(window).height() - 245;
                if(res.errno  == 21051 || res.errno == 21052){
                  this.RkEmptyText = res.errmsg;
                }else{
                  this.RkEmptyText = '暂无数据';
                  this.$message({
                    showClose: true,
                    message: res.errmsg,
                    type: 'warning'
                  });

                }

              }
            },
            error: (xhr, status) => {
              this.loadingRk = false;
              
            },
            noNetwork: () => {
                // 网络超时
              this.loadingRk = false;
              this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
            }
          })

        },
        weekChange(val){
          this.Rkpage = 1;
          this.rankingTime = util.getWeekLastFirst(val)
          this.getTableRankingList()
        },
        monthChange(val){
          this.Rkpage = 1;
          let time = val.replace(/\s/ig,''),
              timeObj = new Date(time);
          timeObj.setMonth(timeObj.getMonth()+1)
          timeObj.setDate(0)
          let timeLastDate = util.formatData1(timeObj)
          this.rankingTime = [time,timeLastDate]
          this.getTableRankingList()
        },
        createPhFn(){
            util.setLocalStorage('activeName','kqph')
            this.$router.push('KqeditRanking')

        },

        handleSizeChange(){
          this.getTableRankingList()
        },
/******************详情部分*******************/
        //考勤详情弹窗
        showKqDetailFn(row, event, column){
          if(row.task_id !== undefined){
            this.kq_detail = {
              extra_info: {},
              attendance_list: []
            }
          }
          // console.log(row)
          let team_id = this.team_id
          let project_id = this.project_id
          let user_id = row.user_id
          let task_id = row.task_id
          let attendance_id = row.attendance_id
          let date = row.date
          this.showKqDetail = true
          this.kq_detail_index = row.index

          // console.log(task_id)
          // this.cur_data = []//当前表格数据
          if(this.tab_index == 0){
            this.cur_data = this.tableDataDay
          }else if(this.tab_index == 1){
            this.cur_data = this.tableDataMonth
            // console.log(task_id)
            if(task_id === undefined){
              this.cellClick(row,cur_column)
              return
            }
            //无task_id 下一条数据
            // if(task_id === 0){
            //   if(this.kq_detail_index < this.cur_data.length-1){
            //     this.changeKqDetail(1)
            //     return
            //   }
            // }
          }else if(this.tab_index == 2){
            this.cur_data = this.tableDataRecord
          }
          // console.log(date)
          //获取考勤详情
          this.loading_kq_detail = true
          util.ajax({
            url: '/attendance/detail',
            type:'GET',
            data: {
              user_id: user_id,
              team_id: team_id,
              project_id: project_id,
              task_id: task_id,
              date: date
            },
            success: (res) => {
              console.log(res)
              // console.log(task_id)
              if(res&&res.errno==0){
                //按月统计时 用过一次的task_id需要重置为undefined  因为它是加在行上的 下次请求重新获取对应task_id
                if(this.tab_index == 1){
                  this.cur_data[row.index].task_id = undefined
                }
                res.data.date = date.substr(5)
                //如果有attendance_id 则只查看一条考勤记录 遍历找到对应的 删除其他的
                let tempArr = []
                if(attendance_id){
                  res.data.attendance_list.forEach((obj1, att_index) => {
                    if(attendance_id == obj1.attendance_id){
                      tempArr.push(obj1)
                    }
                  })
                  res.data.attendance_list = tempArr
                } 
                
                // console.log(res.data)
                //遍历状态 
                tempArr = []
                res.data.attendance_list.forEach((obj1, att_index) => {
                  //遍历状态
                  // for(let i = 0; i < obj1.status.length; i++){
                    if(obj1.status[0]&&obj1.status[0].value == 1){
                      //正常 只有一个status
                      obj1.flog = 1
                      tempArr.push(obj1)
                    // }else if(obj1.status[0]&&obj1.status[0].value == 6){
                    //   //缺卡  只有一个status
                    //   obj1.flog = -1
                    //   tempArr.push(obj1)
                    }else{
                      //其他异常情况
                      if(!obj1.status[0]){
                        //status是空数组  还没到判定缺卡时间或还没到打卡时间
                        obj1.flog = -1
                        tempArr.push(obj1)
                      }else{
                        obj1.flog = 0
                        tempArr.push(obj1)
                      }
                    }
                  // }
                })
                res.data.attendance_list = tempArr
                // console.log(res.data)
                //遍历图片字段  组装数据
                res.data.attendance_list.forEach((obj1, att_index) => {
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
                          obj2.pic_list.push(tempObj)
                        }
                      })
                    }
                  })
                })
                res.data.attendance_list.task_id = task_id
                this.kq_detail = res.data
                // console.log(res.data)
              }
              setTimeout(() => {
                this.loading_kq_detail = false
              },1000)
            },
            error: (xhr, status) => {
              this.loading_kq_detail = false
            },
            noNetwork: () => {
              this.loading_kq_detail = false
                // 网络超时
                this.$message({
                  showClose: true,
                  message: '网络连接失败，请检查网络',
                  type: 'warning'
                });
            }
          })
        },
        // 查看位置
        viewLocationFn(task_id, attendance_id){
          this.showKqDetailLocation = true
          this.loading_Attendance_position = true
          util.ajax({
            url: '/attendance/attendance_position',
            type:'GET',
            data: {
                team_id: this.team_id,
                project_id: this.project_id,
                attendance_id: attendance_id,
                task_id: task_id,
            },
            success: (res) => {
                console.log('获取考勤坐标和考勤任务坐标')
                console.log(res)
                this.loading_Attendance_position = false
                if(res&&res.errno==0){
                  this.viewMap(res.data)
                }
            },
            error: (xhr, status) => {
                this.loading_Attendance_position = false
                // 网络超时
                this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络',
                    type: 'warning'
                });
            },
            noNetwork: () => {
                this.loading_Attendance_position = false
                // 网络超时
                this.$message({
                    showClose: true,
                    message: '网络连接失败，请检查网络',
                    type: 'warning'
                });
            }
          })
        },
        viewMap(data){
          let _this = this
          //加载地图
          map = new AMap.Map('container', {
              resizeEnable: true
          });
          //清楚上一个maker
          if(marker) map.remove(marker)
          //打卡位置
          marker = new AMap.Marker({
            icon: p_icon2,
            position: [data.attend_position.coordinate.split(',')[0], data.attend_position.coordinate.split(',')[1]],
            offset: new AMap.Pixel(-46,-84),
            // title: provinces[i].name,
            map: map
          });
          //标准位置
          data.task_position.forEach((obj) => {
            marker = new AMap.Marker({
              icon: p_icon1,
              position: [obj.coordinate.split(',')[0], obj.coordinate.split(',')[1]],
              offset: new AMap.Pixel(-43,-73),
              // title: provinces[i].name,
              map: map
            });
          })
          
          // console.log(marker.getOffset())
          //视图转换
          map.setZoomAndCenter(16, [data.attend_position.coordinate.split(',')[0], data.attend_position.coordinate.split(',')[1]])
          map.setFitView();
        },
        toBigFn(){
          map.zoomIn()
        },
        toSmallFn(){
          map.zoomOut()
        },
        //大图预览
        imgPreview(index, list){
          let option = {
            bgOpacity: .8,
            // escKey: false,
            fullscreenEl: false,
            shareEl: false,
            showAnimationDuration: 0,
            hideAnimationDuration: 0
          }
          setTimeout(() => {
            this.$preview.open(index, list, option)
            $('.pswp').css('z-index', 9999998)
          },100)
        },
        // //点击左侧小组列表时  切换右侧 是否选取
        // handleNodeClick(data) {
        //   // console.log(data);
        //   for(let i = 0; i < this.origin_selected_groups.length; i++){
        //     if(this.origin_selected_groups[i].id == data.id){
        //       this.origin_selected_groups.splice(i,1)
        //       return
        //     }
        //   }
        //   this.origin_selected_groups.push({id: data.id, name: data.name})
        // },
        // //反选择小组
        // unSelectGroup(index){
        //   this.origin_selected_groups.splice(index,1)
        // },
        openGroupSelecter(){
          this.$refs.profile.openGroupSelecter()
          // this.filterText = ''
          // this.showGroupSelecter = true
          // this.origin_selected_groups = util.getLocalStorage('origin_selected_groups') || []
          
        },
        confirmGroupSelecter(val){
          this.selected_groups = val
        },
        // //过滤小组函数
        // filterNode(value, data) {
        //   if (!value) return true;
        //   return data.name.indexOf(value) !== -1;
        // },
        //清楚搜索小组关键字
        // clearFilterText(){
        //   // alert(123)
        //   this.filterText = ''
        // },
        changeKqDetail(lab){
          this.pre_kq_detail_index = this.kq_detail_index
          if(lab == 0){
            if(this.kq_detail_index>0){
              this.kq_detail_index --
            }
          }else if(lab == 1){
            if(this.kq_detail_index<this.cur_data.length-1){
              this.kq_detail_index ++
            }
          }
          this.showKqDetailFn(this.cur_data[this.kq_detail_index])
        },
        getpermission(){
          util.ajax({
              url:'/permission/application',
              type:'GET',
              data:{
                team_id: this.team_id,
                project_id: this.project_id,
                application_id: 1
              },
              timeout:10000,
              success:(obj) => {
                  if(obj && obj.errno == 0){
                    this.exportPerm = false;
                      obj.data.forEach( (o) => {
                          if(o.id_name == 'attendance_export'){
                             this.exportPerm = true
                          }
                          if(o.id_name === 'attendance_update_reward_rule'){
                            this.setKqRanking = true;
                          }
                      })
                  }
              },
              error: (xhr, status) => {
                  
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
        }
      },
      created(){
          this.init()
          //获取导出权限
          // todo   判断定时器有没有清除
          let pollingurl = util.getLocalStorage(`pollingurl${this.project_id}`)
          let pollingkey = util.getLocalStorage(`pollingkey${this.project_id}`)
          if(pollingkey && !pollingurl && trimeId){
            this.kqdownload1 = kqdownload1 = false
            this.kqdownload2 = kqdownload2 = true
            this.kqdownload3 = kqdownload3 = false
          }else if(pollingkey && pollingurl){
            this.kqdownload1 = kqdownload1 = false
            this.kqdownload2 = kqdownload2 = false
            this.kqdownload3 = kqdownload3 = true
          }else{
            this.kqdownload1 = kqdownload1 = true
            this.kqdownload2 = kqdownload2 = false
            this.kqdownload3 = kqdownload3 = false
          }         
      },
      mounted(){
        /*table分页--下拉加载*/
        let that = this
        // this.winHeight = $(window).height() - 60 - 200
        // console.log($(window).height())
        // $(window).resize(function() {
        //     that.winHeight = $(window).height() - 60 - 230
        // });
         let oldH = $(window).height()
          this.winHeight = $(window).height() - 60 - 185;
          $(window).resize(function() {
              that.winHeight = $(window).height() - 60 - 230
              if(that.total == 0){
                that.RkwinHeight = $(window).height() - 245;
              }else{
                that.RkwinHeight = $(window).height() - 290;
              }
              if($(window).height() == oldH){
                  that.winHeight = $(window).height() - 60 - 185
              }
          });
        $('.el-table__body-wrapper').scroll(function(){
            if($(this).scrollTop()+150 > that.winHeight/2){
                let t = ''
               if(that.tab_index == 1){
                    if(ajax_getting1 == false){
                      return false
                    }else{
                       t = ajax_getting1
                    }
                }else if(that.tab_index == 2){
                    if(ajax_getting == false){
                        return false
                    }else{
                        t = ajax_getting
                    }
                }
                if (t == true) {
                    if(finished){
                        return false
                    }else{
                        finished = true
                    }
                    let sumDays = ''
                    let _data = ''
                    let _url = ''
                    if(!that.states){
                        that.memberDay = ''
                    }
                    let group_id_arr = []
                    that.selected_groups.forEach((item) =>{
                        group_id_arr.push(item.id)
                    })
                    if(that.tab_index == 1){
                        _url = '/attendance/stats_month'
                        sumDays = util.DateDiff(util.formatData1(that.ruleForm.kqDateMonth[0]),util.formatData1(that.ruleForm.kqDateMonth[1]))
                        if(!that.ruleForm.kqDateMonth){
                            return
                        }
                        if(sumDays > 31){
                           return
                        }
                        _data = {
                            team_id : that.team_id,
                            project_id:that.project_id,
                            start_date:util.formatData1(that.ruleForm.kqDateMonth[0]),
                            end_date:util.formatData1(that.ruleForm.kqDateMonth[1]),
                            group_id:group_id_arr.length ? group_id_arr : that.group_id,
                            user_id:that.user_id ? that.user_id : 0,
                            min_id:that.min_id,
                            page_size:50
                        }
                    }else if(that.tab_index == 2){
                        _url = '/attendance/record'
                        sumDays = util.DateDiff(util.formatData1(that.ruleForm.kqDateRecord[0]),util.formatData1(that.ruleForm.kqDateRecord[1]))
                        if(!that.ruleForm.kqDateRecord){
                            return
                        }
                        if(sumDays > 31){
                           return
                        }
                        _data = {
                            team_id : that.team_id,
                            project_id:that.project_id,
                            start_date:util.formatData1(that.ruleForm.kqDateRecord[0]),
                            end_date:util.formatData1(that.ruleForm.kqDateRecord[1]),
                            group_id:group_id_arr.length ? group_id_arr : that.group_id,
                            user_id:that.user_id ? that.user_id : 0,
                            status:that.status_id,
                            min_id:that.min_id2,
                            page_size:that.page_size
                        }
                    }
                    util.ajax({
                        url:_url,
                        type:'GET',
                        data:_data,
                        timeout:10000,
                        success:(obj) => {
                          console.log(obj)
                            if(obj && obj.errno == 0){
                                finished = false
                                if(obj.data.list.length == 0){
                                    if(that.tab_index == 1){
                                        that.min_id = 0
                                        ajax_getting1 = false
                                        return 
                                    }else if(that.tab_index == 2){
                                        that.min_id2 = 0
                                        ajax_getting = false
                                        return 
                                    }
                                }
                                if(obj.data.load_more == 0){
                                    if(that.tab_index == 1){
                                        ajax_getting1 = false
                                    }else if(that.tab_index == 2){
                                        ajax_getting = false
                                    }
                                }else{
                                    if(that.tab_index == 1){
                                        ajax_getting1 = true
                                    }else if(that.tab_index == 2){
                                        ajax_getting = true
                                    }
                                }
                                obj.data.list.forEach((o,i) => {
                                    o.index = i
                                })
                                if(that.tab_index == 2){
                                    obj.data.list.forEach((o) => {
                                        that.tableDataRecord.push(o)
                                        that.min_id2 = obj.data.min_id
                                    })
                                }
                                if(that.tab_index == 1){
                                    obj.data.list.forEach((per, list_index) => {
                                      per.index = list_index
                                      per.date_data.forEach((per_date, index) => {
                                        per['state_'+index] = per_date.status
                                        // if(per_date.status&&per_date.status!=='正常'){
                                        //   let tempArr = [list_index, index]
                                        //   that.kqMonthClassArr.push(tempArr)
                                        // }
                                      })
                                    })
                                    that.min_id = obj.data.min_id
                                    obj.data.list.forEach( (o) => {
                                        that.tableDataMonth.push(o)
                                    })
                                    that.addColor()
                                }
                            }
                        },
                        error: (xhr, status) => {
                            finished = false
                        },
                        noNetwork: () => {
                          //网络超时
                          that.$message({
                            showClose: true,
                            message: '网络连接失败，请检查网络',
                            type: 'warning'
                          });
                        }
                    })

                } 
            }
        })
      }
    }
</script>


<style  src='../assets/css/kaoqin.css'></style>
<style>

  /*覆盖组件原样式*/
  
    /*考勤详情*/
    #kqaddmin .kaaddminset:active{
      color:#517ed6!important;
    }
  #kqaddmin .kq_detail .el-dialog{
    top:10%!important;
    height:80%;
    width:650px;
    margin-bottom: 0;
  }
  @media screen and (max-height: 675px) {
      #kqaddmin .kq_detail .el-dialog{
        top:50%!important;
        height: 540px;
        margin-top: -270px;
      }
  }
  #kqaddmin .kq_detail .el-dialog__body{
    height:calc(100% - 40px);
  }
  #kqaddmin .kq_detail_location .el-dialog{
    width: 470px;
  }
  #kqaddmin .kq_detail_location .el-dialog .el-dialog__body{
    position: relative;
  }
  #kqaddmin .el-dialog .el-dialog__header{
    padding: 24px 20px 0
  }
  #kqaddmin .el-dialog .el-dialog__header .el-dialog__title{
    font-weight: 500;
  }
  #kqaddmin .el-dialog .el-dialog__header .el-dialog__headerbtn .el-dialog__close{
    /*color:#c0ccda;*/
    font-size: 15px;
  }
  #kqaddmin .el-dialog__body{
    padding: 0;
  }
  #kqaddmin .kq_detail .el-tag{
    float: right;
    height: 17px;
    line-height: 16px;
    border-radius: 2px;
    padding:0 1px;
    margin-right: 3px;
  }
  #kqaddmin .kq_detail .toggle_btn .el-button{
    padding:8px 9px;
    border: 1px solid #e0e6ed;
    color:#c0ccda;
    border-radius: 2px;
  }
  #kqaddmin .kq_detail .toggle_btn .el-button.hover:hover{
    color:#6699ee;
    border: 1px solid #6699ee;
  }
  /*大图预览插件*/
  .pswp{
    z-index: 9999999;
  }
  #kqaddmin .el-icon-loading{
    margin-right: 3px;
  }
</style>
<style scope>
  .clear{
    clear:both;
  }
  /*考勤详情 弹窗*/
  /*头部用户信息*/

  #kqaddmin .kq_detail .user_info{
    box-sizing: border-box;
    width:100%;
    height:78px;
    padding:30px 40px 16px;
    border-bottom: 1px solid #e0e6ed;
  }
  #kqaddmin .kq_detail .user_info .avatar{
    float: left;
    width:32px;
    height:32px;
    border-radius: 50%;
    background-image: url(../assets/imgs/avatar.png);
    /*background-color: red;*/
    background-size: contain;
  }
  #kqaddmin .kq_detail .user_info .right_info{
    float: left;
    width:526px;
    height:32px;
    margin-left: 12px;
  }
  #kqaddmin .kq_detail .user_info .right_info .user_name{
    height:14px;
    line-height: 14px;
    color: #1f2d3d;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 5px;
  }
 /* #kqaddmin .kq_detail .user_info .right_info .kq_team{
    height:12px;
  }*/
  #kqaddmin .kq_detail .user_info .right_info .kq_team{
    display: block;
    float: left;
    height:12px;
    line-height: 12px;
    font-size: 12px;
    color:#5d6c82;
    font-weight: normal;
    width:526px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /*#kqaddmin .kq_detail .user_info .right_info .kq_team span.line{
    width: 1px;
    height: 12px;
    background-color: #c0ccda;
    margin: 0 21px 0 16px;
  }*/
  /*考勤记录 具体信息*/
  #kqaddmin .kq_detail .kq_info_wrap{
    width:100%;
    /*height:525px;*/
    height:calc(100% - 78px - 72px);
    overflow-y: auto;
    box-sizing: border-box;
    /*padding:24px 0 0 40px;*/
    padding-top: 24px;
    /*margin-bottom: 32px;*/
  }
  #kqaddmin .kq_detail .kq_info_wrap .not_attendance{
    font-size: 16px;
    font-weight: normal;
    font-style: normal;
    text-align: center;
    color: #c0ccda;
    vertical-align: middle;
    margin-left: -40px;
    margin-top:140px;
  }
  #kqaddmin .kq_detail .kq_info_item{
    margin-bottom: 24px;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_date{
    float: left;
    text-align: right;
    width:126px;
    height:50px;
    /*background-color: pink;*/
  }
  #kqaddmin .kq_detail .kq_info_item .kq_date p{
    font-size: 14px;
    font-weight: 500;
    font-style: normal;
    font-stretch: normal;
    color: #1f2d3d;
    margin: 3px 0 10px;
    text-indent: 4px;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_date .kq_status{
    height:50px;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format{
    position: relative;
    float: right;
    /*width:470px;*/
    width:424px;
    min-height:50px;
    padding: 0 40px 8px 0;
    border-bottom: 1px solid #e0e6ed;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .attend_time{
    font-size: 18px;
    font-weight: 500;
    font-style: normal;
    color: #f5974e;
    margin-bottom: 5px;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format i{
    position: absolute;
    left:-37px;
    top:2px;
    z-index: 9999;
    background-color: #fff;
    border:2px solid #F4F7FD;
    border-radius:50%;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format i.circle{
    width: 11px;
    height: 11px;
    left:-36px;
    top:2px;
    background: url('../assets/imgs/kqaddmin/circle.svg') center no-repeat;
    border:2px solid transparent;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .status_line{
    position: absolute;
    top:10px;
    left: -29px;
    width:1px;
    height:calc(100% + 24px);
    background-color: #e0e6ed;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .format_item{
    margin-bottom: 16px;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .format_item .item_title{
    /*height: 17px;*/
    line-height: 17px;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    color: #8492a6;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .format_item .item_info{
    /*height: 20px;*/
    line-height: 20px;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    color: #475568;
    margin-top: 4px;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .format_item .view_location{
    height: 17px;
    margin-top: 8px;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .format_item .view_location span{
    float: left;
    text-indent: 20px;
    font-family: 'SFProText';
    font-size: 12px;
    color: #6699ee;
    height: 17px;
    line-height: 17px;
    background: url(../assets/imgs/kqaddmin/location_icon.svg) no-repeat left;
    cursor: pointer;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .format_item .pic_box{
    width:424px;
    /*height:64px;*/
    margin-top: 10px;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .format_item .pic_box .img{
    float: left;
    width:64px;
    height:64px;
    margin: 0 8px 8px 0;
    /*outline: 1px solid red;*/
    overflow: hidden;
    cursor: pointer;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .format_item .pic_box .img img{
    width: 100%;
  }
  #kqaddmin .kq_detail .kq_info_item .kq_format .format_item .pic_box .img:nth-of-type(6n){
    margin-right: 0;
  }
  /*切换按钮*/
  #kqaddmin .kq_detail .kq_detail_foot{
    width:100%;
    height: 72px;
    border-top: 1px solid #e0e6ed;
  }
  #kqaddmin .kq_detail .kq_detail_foot .toggle_btn{
    float: right;
    margin:20px 20px 20px 0;
  }
  #kqaddmin .kq_detail_location .map_view{
    margin: 24px 10px 10px;
    width:450px;
    height: 363px;
  }
  #kqaddmin .kq_detail_location .big_small{
    position: absolute;
    z-index: 999;
    right: 20px;
    bottom: 10px;
    width: 32px;
    height: 64px;
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
    cursor: pointer;
  }
  #kqaddmin .kq_detail_location .big_small .big{
    height: 31px;
    background: url(../assets/imgs/position/big.svg) center no-repeat;
  }
  #kqaddmin .kq_detail_location .big_small .small{
    height: 32px;
    background: url(../assets/imgs/position/small.svg) center no-repeat;
  }
  #kqaddmin .rankingMain{
    position: relative;
    height: 36px;
    width: 350px;
    margin-bottom: 8px;
  }
  #kqaddmin.rakinpInput{
      position: absolute;
    top: 0;
    left: 0;
    z-index: 98;
    display: block;
  }
  #kqaddmin .rakpingPicker{
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    display: block;
    opacity: 0;

  }
  #kqaddmin .btn-item.editRankingRules {
    float: right;
    cursor: pointer;
    margin-top: 22px;
  }
  #kqaddmin .btn-item.editRankingRules .edit_icon{
    display: inline-block;
    width: 13px;
    height: 13px;
    margin-right: 3px;
    background-image:url(../assets/imgs/edit.svg);    
    background-repeat: no-repeat;
    background-position: 0px -1px;
    vertical-align: middle;
  }
  #kqaddmin .btn-item.editRankingRules>a{
    color: rgb(102, 153, 238);
    font-weight: normal;
    font-size: 13px;
    line-height: 1;
  }
  #kqaddmin .btn-item.editRankingRules>a:active{
    color: #517ed6;
  }
  #kqaddmin .kq-table-record .el-pagination{
    float: right;
  }
  #kqaddmin .kq-ranking-form .el-form {
    display: inline-block;
}

.kq-tableranking-list .el-table--enable-row-hover .el-table__body tr:hover>td{
  cursor: default;
}
.rulesNotes{
  font-size: 12px;
  color: #99A9BF;
}
.kqexportIcon{
  width: 14px;
  height: 14px;
  display:block;
  float: left;
  margin-right: 6px;
  background: url(../assets/imgs/kqaddmin/kqexport.svg) no-repeat;
}
</style>
