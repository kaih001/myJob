<template>
  <div class="kqsettask">
    <div class="settask_top">
      <breadcrumb>
        <router-link to="kqaddmin" replace>考勤管理</router-link>
        <router-link to="kqtasklist">考勤规则管理</router-link>
        <router-link to="">{{
          isNewTask ? "添加规则" : "修改规则"
        }}</router-link>
      </breadcrumb>
    </div>
    <div class="settask_main">
      <div class="settask_title">
        <h2>{{ isNewTask ? "添加规则" : "修改规则" }}</h2>
      </div>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px">
        <el-form-item label="规则名称" prop="name" id="gzmc">
          <el-input v-model="ruleForm.name" placeholder="请输入" style="width: 468px"></el-input>
        </el-form-item>
        <el-form-item label="考勤方式" prop="kq_type" :style="ruleForm.kq_type == 2 ? 'margin-bottom:19px;' : ''" id="kqfs">
          <el-radio :disabled="!isNewTask || naixue_kaoqin_type" class="radio" v-model="ruleForm.kq_type"
            :label="0">固定时间</el-radio>
          <el-radio :disabled="!isNewTask || naixue_kaoqin_type" class="radio" v-model="ruleForm.kq_type"
            :label="1">弹性时间</el-radio>
          <el-radio :disabled="!isNewTask" class="radio" v-model="ruleForm.kq_type" :label="2">排班</el-radio>
          <!-- <el-radio :disabled="!isNewTask || naixue_kaoqin_type" class="radio" v-model="ruleForm.kq_type" :label="3">员工自主排班</el-radio> -->
          <div class="kq_type_main">
            <span class="arrow" v-show="ruleForm.kq_type == 0" style="left: 38px"></span>
            <span class="arrow" v-show="ruleForm.kq_type == 1" style="left: 168px"></span>
            <span class="arrow" v-show="ruleForm.kq_type == 2" style="left: 285px"></span>
            <span class="arrow" v-show="ruleForm.kq_type == 3" style="left: 420px"></span>
            <template v-if="ruleForm.kq_type == 0">
              <div class="main_title">
                <span style="font-size: 14px; color: #5e6d82; margin-right: 13px">工作时段</span>
                注：固定上下班时间，最多可添加3个时间段
              </div>
              <div class="all_timearea">
                <div class="selecttimeinterval" v-for="(item, index) in times_list">
                  <div class="start">
                    <el-time-picker style="width: 180px" placeholder="起始时间" :clearable="false" :editable="false"
                      v-model="item.start_time" @change="startChange(item)" format="HH:mm" :picker-options="{
                          selectableRange: startRange(item.end_time),
                        }">
                    </el-time-picker>
                  </div>
                  <div class="line">-</div>
                  <div class="end">
                    <el-time-picker style="width: 180px" placeholder="结束时间" :clearable="false" :editable="false"
                      v-model="item.end_time" @change="endChange(item)" :format="formatEndtime(item)" :picker-options="{
                          selectableRange: endRange(item.start_time),
                        }">
                    </el-time-picker>
                  </div>
                  <template v-if="isNewTask">
                    <el-tooltip :enterable="false" class="item" effect="dark" content="至少保留一个工作时段" placement="top"
                      v-if="times_list.length <= 1">
                      <div class="delate undel"></div>
                    </el-tooltip>
                    <div class="delate" v-else @click="delTimeFn(index)"></div>
                  </template>
                  <template v-if="!isNewTask">
                    <el-tooltip :enterable="false" class="item" effect="dark" content="不可以删除已生效的时段" placement="top">
                      <div class="delate undel"></div>
                    </el-tooltip>
                  </template>
                </div>
              </div>
              <div class="addtime" v-if="isNewTask && times_list.length < 3 && !isCross()">
                <div class="add_item" @click="addTimeFn">添加时段</div>
              </div>
              <div class="addtime" v-else-if="isCross()">
                <!-- <el-tooltip :enterable="false" class="item" effect="dark" content="最多添加3个时段" placement="top"> -->
                <div class="add_item" style="opacity: 0.5; cursor: not-allowed">
                  添加时段
                </div>
                <!-- </el-tooltip> -->
              </div>
              <div class="addtime" v-else>
                <el-tooltip :enterable="false" class="item" effect="dark" content="最多添加3个时段" placement="top">
                  <div class="add_item" style="opacity: 0.5; cursor: not-allowed">
                    添加时段
                  </div>
                </el-tooltip>
              </div>
            </template>
            <template v-if="ruleForm.kq_type == 1">
              <div class="main_title">
                注：不要求上下班时间，工作时间足够即算正常
              </div>
              <div class="setworktime">
                <span style="color: #5e6d82; font-size: 14px">每天最短工作时间</span>
                <el-select v-model="worktime" placeholder="请选择" style="width: 110px; margin: 0 13px 0 23px">
                  <el-option v-for="item in 47" :key="(item + 1) / 2" :label="(item + 1) / 2" :value="(item + 1) / 2">
                  </el-option>
                </el-select>
                <span style="color: #99a9bf; font-size: 14px">小时</span>
              </div>
              <div class="main_title">
                注：之前打卡记为昨天打卡，之后打卡记为今天打卡
              </div>
              <div class="setworktime">
                <span style="color: #5e6d82; font-size: 14px">开始时间</span>
                <el-time-select style="width: 166px; margin: 0 13px 0 23px" v-model="kqStartT" :editable="false"
                  :clearable="false" :picker-options="{
                      start: '00:00',
                      step: '00:30',
                      end: '12:00',
                    }">
                </el-time-select>
              </div>
            </template>
            <template v-if="ruleForm.kq_type == 2">
              <div class="main_title">
                <span style="font-size: 14px; color: #5e6d82; margin-right: 13px">按日期排班</span>
                注：设置班次，最多30个班次
              </div>
              <div class="all_timearea">
                <div class="selecttimeinterval" v-for="(item, index) in bc_list">
                  <div class="name">{{ item.name }}班次</div>
                  <div class="start">
                    <el-time-picker style="width: 153px" placeholder="起始时间" :clearable="false" :editable="false"
                      v-model="item.start_time" @change="startChange(item)" format="HH:mm" :picker-options="{
                          selectableRange: startRange(item.end_time),
                        }">
                    </el-time-picker>
                    <!-- <span style="margin:0 5px;color:#beccda;">-</span> -->
                  </div>
                  <div class="line">-</div>
                  <div class="end">
                    <el-time-picker style="width: 153px" placeholder="结束时间" :clearable="false" :editable="false"
                      v-model="item.end_time" @change="endChange(item)" :format="formatEndtime(item)" :picker-options="{
                          selectableRange: endRange(item.start_time),
                        }">
                    </el-time-picker>
                  </div>
                  <template v-if="isNewTask">
                    <el-tooltip :enterable="false" class="item" effect="dark" content="至少保留一个班次" placement="top"
                      v-if="bc_list.length <= 1">
                      <div class="delate undel"></div>
                    </el-tooltip>
                    <div class="delate" v-else @click="delTimeFn(index)"></div>
                  </template>
                  <template v-if="!isNewTask">
                    <el-tooltip :enterable="false" class="item" effect="dark" content="不可以删除已生效的班次" placement="top"
                      v-if="item.id != 0">
                      <div class="delate undel"></div>
                    </el-tooltip>
                    <div class="delate" v-else @click="delTimeFn(index)"></div>
                  </template>
                </div>
              </div>
              <div class="addtime" v-if="bc_list.length < 30">
                <div class="add_item" @click="addTimeFn">添加班次</div>
              </div>
              <div class="addtime" v-else>
                <el-tooltip :enterable="false" class="item" effect="dark" content="最多添加30个班次" placement="top">
                  <div class="add_item" style="opacity: 0.5; cursor: not-allowed">
                    添加班次
                  </div>
                </el-tooltip>
              </div>
            </template>
            <template v-if="ruleForm.kq_type == 3">
              <div class="main_title">
                <span style="font-size: 14px; color: #5e6d82; margin-right: 13px">按日期排班</span>
                注：设置班次，最多30个班次
              </div>
              <div class="all_timearea">
                <div class="selecttimeinterval" v-for="(item, index) in bc_list">
                  <div class="name">{{ item.name }}班次</div>
                  <div class="start">
                    <el-time-picker style="width: 153px" placeholder="起始时间" :clearable="false" :editable="false"
                      v-model="item.start_time" @change="startChange(item)" format="HH:mm" :picker-options="{
                          selectableRange: startRange(item.end_time),
                        }">
                    </el-time-picker>
                    <!-- <span style="margin:0 5px;color:#beccda;">-</span> -->
                  </div>
                  <div class="line">-</div>
                  <div class="end">
                    <el-time-picker style="width: 153px" placeholder="结束时间" :clearable="false" :editable="false"
                      v-model="item.end_time" @change="endChange(item)" :format="formatEndtime(item)" :picker-options="{
                          selectableRange: endRange(item.start_time),
                        }">
                    </el-time-picker>
                  </div>
                  <template v-if="isNewTask">
                    <el-tooltip :enterable="false" class="item" effect="dark" content="至少保留一个班次" placement="top"
                      v-if="bc_list.length <= 1">
                      <div class="delate undel"></div>
                    </el-tooltip>
                    <div class="delate" v-else @click="delTimeFn(index)"></div>
                  </template>
                  <template v-if="!isNewTask">
                    <el-tooltip :enterable="false" class="item" effect="dark" content="不可以删除已生效的班次" placement="top"
                      v-if="item.id != 0">
                      <div class="delate undel"></div>
                    </el-tooltip>
                    <div class="delate" v-else @click="delTimeFn(index)"></div>
                  </template>
                </div>
              </div>
              <div class="addtime" v-if="bc_list.length < 31">
                <div class="add_item" @click="addTimeFn">添加班次</div>
              </div>
              <div class="addtime" v-else>
                <el-tooltip :enterable="false" class="item" effect="dark" content="最多添加30个班次" placement="top">
                  <div class="add_item" style="opacity: 0.5; cursor: not-allowed">
                    添加班次
                  </div>
                </el-tooltip>
              </div>
            </template>
          </div>
        </el-form-item>
        <el-form-item label="考勤范围" prop="selected_members_groups" id="kqfw" v-if="ruleForm.kq_type != 3"
          style="margin-bottom: 21px">
          <div class="g_m_wrap" @click="openGroupSelecter" :style="!ruleForm.selected_members_groups.length ? 'height:36px;' : ''
            ">
            <div class="g_m_item" v-for="item in ruleForm.selected_members_groups">
              <div class="item_icon" :class="{ item_icon_p: item.selType === 'peple' }"></div>
              <div class="item_name">{{ item.name }}</div>
            </div>
            <!-- <div class="add_item" v-if="!ruleForm.selected_members_groups.length">请添加</div> -->
            <div class="add_item">请添加</div>
          </div>
          <select-member-group-multi title="添加考勤范围" ref="profile" :all-groups="all_groups"
            :selected-members-groups="ruleForm.selected_members_groups"
            v-on:confirmGroupSelecter="confirmGroupSelecter"></select-member-group-multi>
        </el-form-item>
        <el-form-item label="考勤日期" prop="date" style="margin-bottom: 19px"
          v-if="ruleForm.kq_type == 1 || ruleForm.kq_type == 0" id="kqrq">
          <div class="work_date">
            <el-date-picker v-model="start_date" :editable="false" :clearable="false" type="date" placeholder="开始日期"
              style="width: 150px" :picker-options="startOptions">
            </el-date-picker>
            <span style="color: #beccda; margin: 0 6px">-</span>
            <el-date-picker v-model="end_date" :editable="false" :clearable="false" type="date" placeholder="结束日期"
              style="width: 150px" :picker-options="endOptions">
            </el-date-picker>
          </div>
          <div class="work_week" v-if="end_date">
            <span class="arrow"></span>
            <ul class="work_week_wrap">
              <li class="week_item" :class="[item.select == 1 ? 'checked' : '']" v-for="item in work_week"
                @click="item.select = item.select == 1 ? 0 : 1">
                {{ item.name }}
              </li>
            </ul>
          </div>
        </el-form-item>
        <el-form-item label="打卡方式" prop="punch_type">
          <el-radio class="radio" v-model="ruleForm.punch_type" :label="0">GPS打卡</el-radio>
          <el-radio class="radio" v-model="ruleForm.punch_type" :label="1">WIFI打卡</el-radio>
        </el-form-item>
        <template v-if="ruleForm.punch_type == 0">
          <!-- <el-form-item label="考勤范围" prop="punch_range">
            <el-input v-model="ruleForm.punch_range" style="width: 90px"></el-input>
            米之内为员工正常打卡地点
          </el-form-item> -->
          <el-form-item label="考勤地点" prop="addr">
            <div class="addr_tip">不在指定地点附近打卡将记为异常，可不设置</div>
            <div class="addr_wrap">
              <div class="addrs">
                <div class="addr_item" v-for="(item, index) in selected_addrs">
                  <div class="addr_icon"></div>
                  <div class="addr_name">{{ item.name }}</div>
                  <div class="addr_poi">{{ item.address }}</div>
                  <div class="addr_del" @click="delSelectedAddrFn(index, 'GPS')"></div>
                </div>
              </div>
              <div class="add_addr">
                <div class="add_item" @click="selectAddrFn('GPS')">
                  添加考勤地点
                </div>
              </div>
            </div>
            <!-- 选择地点弹窗 -->
            <div class="select_addr">
              <el-dialog title="选择地点" :visible.sync="dialogSelectAddr" @open="selectAddrOpen('GPS')">
                <div class="select_addr_main" v-loading="loading">
                  <div class="main_top">
                    <i class="el-icon-search"></i>
                    <el-input v-model="kqAddrFilterText" placeholder="搜索考勤地点" style="width: 248px"
                      :icon="kqAddrFilterText ? 'circle-cross' : ''"
                      :on-icon-click="clearFilterText('kqAddrFilterText')"></el-input>
                    <div class="add_item" @click="newAddrFn(false)">
                      添加新地点
                    </div>
                  </div>
                  <div class="main_table">
                    <div class="table_title">
                      <div class="checkbox" style="width: 40px; padding-left: 12px">
                        <el-checkbox v-model="all_selected" @change="changeAllSel('GPS')"></el-checkbox>
                      </div>
                      <div style="width: 98px; border-right: 1px solid #e0e6ed">
                        地点名称
                      </div>
                      <div style="
                          width: 320px;
                          border-right: 1px solid #e0e6ed;
                          padding: 0 17px;
                        ">
                        详细地址
                      </div>
                      <div style="width: 100px; padding: 0 17px">操作</div>
                    </div>
                    <div class="table_body">
                      <div class="table_item" v-for="item in all_addrs" v-if="item.workplace_name
                          .toUpperCase()
                          .indexOf(kqAddrFilterText.toUpperCase()) > -1 ||
                        item.address_name
                          .toUpperCase()
                          .indexOf(kqAddrFilterText.toUpperCase()) > -1
                        ">
                        <div class="checkbox">
                          <el-checkbox v-model="item.selected"></el-checkbox>
                        </div>
                        <el-tooltip :enterable="false" effect="dark" :content="item.workplace_name" placement="top"
                          :open-delay="1000">
                          <div class="pos_name">{{ item.workplace_name }}</div>
                        </el-tooltip>
                        <el-tooltip :enterable="false" effect="dark" :content="item.address_name" placement="top"
                          :open-delay="1000">
                          <div class="pos_addr">{{ item.address_name }}</div>
                        </el-tooltip>
                        <div class="pos_edit">
                          <el-button type="text" @click="newAddrFn(item)">编辑</el-button>
                        </div>
                      </div>
                      <div class="empty_text" v-if="!all_addrs.length">
                        没有考勤地点
                      </div>
                      <div class="empty_text" v-if="computedSearchResult()">
                        未搜到相关地点
                      </div>
                    </div>
                    <!-- <el-table
                        ref="multipleTable"
                        :data="all_addrs_search"
                        @selection-change="handleSelectionChange"
                        empty-text="暂无考勤地点"
                        height="307"
                        style="width: 100%">
                        <el-table-column
                            type="selection"
                            width="29">
                          </el-table-column>
                        <el-table-column
                          class-name="pos_name"
                            prop="workplace_name"
                            label="地点名称"
                            width="110">
                        </el-table-column>
                        <el-table-column
                          class-name="pos_addr"
                            prop="address_name"
                            label="详细地址"
                            width="320">
                        </el-table-column>
                        <el-table-column
                            prop="operation"
                            width="100"
                            label="操作">
                            <template scope="scope">
                                    <el-button
                                      @click.native.prevent="editAddr(scope)"
                                      type="text"
                                      size="small">
                                      编辑
                                    </el-button>
                                  </template>
                        </el-table-column>
                    </el-table> -->
                  </div>
                </div>
                <div class="select_addr_foot">
                  <div class="btns">
                    <el-button @click="dialogSelectAddr = false">取 消</el-button>
                    <el-button type="primary" @click="comfirmSelectAddrFn">确 定</el-button>
                  </div>
                </div>
              </el-dialog>
            </div>
            <!-- 添加新地点弹窗 -->
            <div class="new_addr">
              <el-dialog :title="new_addr.title" :visible.sync="dialogNewAddr" @open="openNewAddrFn">
                <div class="new_addr_main">
                  <div class="main_top">
                    <i class="el-icon-search"></i>
                    <el-input v-model="searchAddrFilterText" placeholder="搜索地点名称" style="width: 312px"
                      :icon="searchAddrFilterText ? 'circle-cross' : ''" :on-icon-click="clearFilterText2"
                      @change="searchAddrFn" @focus="searchAddrFn"></el-input>
                  </div>
                  <div class="search_result" v-if="searchAddrResultList.length">
                    <div class="result_item" v-for="item in searchAddrResultList" @click="clickAddrResultFn(item)">
                      <div class="item_name">{{ item.name }}</div>
                      <div class="item_addr">{{ item.address }}</div>
                    </div>
                  </div>
                  <div class="map_wrap" id="container"></div>
                  <div class="fix_position" @click="fixPosition(null)"></div>
                  <div class="big_small">
                    <div class="big" @click="toBigFn"></div>
                    <div style="
                        height: 1px;
                        width: 24px;
                        margin-left: 4px;
                        background-color: #e0e6ed;
                      "></div>
                    <div class="small" @click="toSmallFn"></div>
                  </div>
                  <div class="form_wrap">
                    <el-form :model="new_addr" :rules="rules" ref="new_addr" label-width="90px">
                      <el-form-item label="地点名称" prop="workplace_name">
                        <el-input v-model="new_addr.workplace_name" placeholder="请输入地点名称" style="width: 238px"></el-input>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
                <div class="new_addr_foot">
                  <div class="btns">
                    <el-button @click="closeDialog('dialogNewAddr')">取 消</el-button>
                    <el-button type="primary" @click="validateNewAddr('GPS')">确 定</el-button>
                  </div>
                </div>
              </el-dialog>
            </div>
          </el-form-item>
        </template>
        <template v-else-if="ruleForm.punch_type == 1">
          <el-form-item label="设置WIFI">
            <div class="addr_tip">不设置指定WIFI信号，将不可打卡，必须设置</div>
            <div class="addr_wrap">
              <div class="addrs">
                <div class="addr_item" v-for="(item, index) in selected_wifi_info">
                  <div class="addr_icon"></div>
                  <div class="addr_name">{{ item.mac_name }}</div>
                  <div class="addr_poi">{{ item.mac_address }}</div>
                  <!-- <div class="addr_del" @click="delSelectedAddrFn(index, 'WIFI')"></div> -->
                </div>
              </div>
              <div class="add_addr">
                <div class="add_item" @click="selectAddrFn('WIFI')">
                  添加WIFI信息
                </div>
              </div>
            </div>
            <!-- 选择WIFI信息 -->
            <div class="select_addr">
              <el-dialog title="选择WIFI" :visible.sync="dialogChooseWifi" @open="selectAddrOpen('WIFI')">
                <div class="select_addr_main" v-loading="loading">
                  <div class="main_top">
                    <i class="el-icon-search" style="visibility: hidden"></i>
                    <el-input v-model="kqWifiFilterText" placeholder="搜索MAC地址" style="width: 248px; visibility: hidden"
                      :icon="kqWifiFilterText ? 'circle-cross' : ''"
                      :on-icon-click="clearFilterText('kqWifiFilterText')"></el-input>
                    <div class="add_item" @click="addMacId('add')">
                      添加新MAC地址
                    </div>
                  </div>
                  <div class="main_table">
                    <div class="table_title">
                      <div class="checkbox" style="width: 40px; padding-left: 12px">
                        <el-checkbox v-model="all_wifi_selected" @change="changeAllSel('WIFI')"></el-checkbox>
                      </div>
                      <div style="width: 98px; border-right: 1px solid #e0e6ed">
                        Mac名称
                      </div>
                      <div style="width: 320px;border-right: 1px solid #e0e6ed;padding: 0 17px;">
                        Mac地址
                      </div>
                      <div style="width: 100px; padding: 0 17px">操作</div>
                    </div>
                    <div class="table_body">
                      <template v-if="wifi_info.length">
                        <div class="table_item" v-for="(item, index) in wifi_info">
                          <div class="checkbox">
                            <el-checkbox v-model="item.selected" :disabled="item.disabled"></el-checkbox>
                          </div>
                          <el-tooltip :enterable="false" effect="dark" :content="item.mac_name" placement="top"
                            :open-delay="1000">
                            <div class="pos_name">{{ item.mac_name }}</div>
                          </el-tooltip>
                          <el-tooltip :enterable="false" effect="dark" :content="item.mac_address" placement="top"
                            :open-delay="1000">
                            <div class="pos_addr">{{ item.mac_address }}</div>
                          </el-tooltip>
                          <div class="pos_edit">
                            <el-button type="text" @click="addMacId('editWifi', item)">编辑</el-button>
                          </div>
                        </div>
                      </template>
                      <div class="empty_text" v-else>没有设置WIFI信息</div>
                    </div>
                  </div>
                </div>
                <div class="select_addr_foot">
                  <div class="btns">
                    <el-button @click="closeDialog('dialogChooseWifi')">取 消</el-button>
                    <el-button type="primary" @click="comfirmSelectWifi">确 定</el-button>
                  </div>
                </div>
              </el-dialog>
            </div>
          </el-form-item>
        </template>
        <el-form-item label="考勤填写项" prop="kqfield" style="margin-bottom: 23px">
          <set-require-field :require_field_origin="require_field"></set-require-field>
        </el-form-item>
        <el-form-item label="考勤通知" prop="kq_notice">
          <el-radio class="radio" v-model="ruleForm.kq_notice" :label="0">提交时不需要通知</el-radio>
          <el-radio class="radio" v-model="ruleForm.kq_notice" :label="2">提交考勤发通知</el-radio>
          <el-radio class="radio" v-model="ruleForm.kq_notice" :label="1">仅异常时通知</el-radio>
        </el-form-item>
        <el-form-item label="是否允许补卡" prop="is_allow_punch">
          <el-radio class="radio" v-model="ruleForm.is_allow_punch" :label="1">允许</el-radio>
          <el-radio class="radio" v-model="ruleForm.is_allow_punch" :label="0">不允许</el-radio>
        </el-form-item>
        <el-form-item label="" prop="" style="margin-bottom: 67px">
          <el-button type="primary" @click="validateKqSet">{{
            isNewTask && (ruleForm.kq_type == 2 || ruleForm.kq_type == 3)
            ? "保存并开始排班"
            : "保存设置"
          }}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 添加WIFI信息 -->
    <el-dialog title="添加WIFI信息" :visible.sync="dialogWifi">
      <div class="wifi-body">
        <el-form :model="ruleFormWifi" :rules="rulesWifi" ref="ruleFormWifi">
          <el-form-item label="MAC地址（例：0e:06:87:05:4i:1c）" prop="mac_address">
            <el-input v-model="ruleFormWifi.mac_address" placeholder="请输入MAC地址"></el-input>
          </el-form-item>
          <el-form-item label="MAC名称（例：doumi-office）" prop="mac_name">
            <el-input v-model="ruleFormWifi.mac_name" placeholder="请输入MAC名称"></el-input>
          </el-form-item>
        </el-form>
        <div class="wifi-tips" style="padding-top: 5px;">
          <h3 class="tips-title">Mac地址获取方式：请向公司IT人员询问BSSID地址</h3>
        </div>
      </div>
      <span slot="footer">
        <el-button @click="closeDialog('dialogWifi')">取 消</el-button>
        <el-button type="primary" @click="validateNewAddr('WIFI')">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import $ from "jquery";
import * as util from "../assets/js/util.js";

import breadcrumb from "@/components/common/breadcrumb";
import SelectMemberGroupMulti from "@/components/common/SelectMemberGroupMulti";
import SetRequireField from "@/components/common/SetRequireField";

import p_icon1 from "@/assets/imgs/position/p_icon1.svg";
// import location_icon from '@/assets/imgs/position/location.svg'

let map,
  geolocation,
  placeSearch,
  citycode,
  marker,
  geocoder,
  infoWindow,
  point;
export default {
  name: "kqsettask",
  components: {
    breadcrumb,
    SelectMemberGroupMulti,
    SetRequireField,
  },
  data () {
    let _this = this;
    var checkName = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入规则名称"));
        document.getElementById("kqfs").scrollIntoView(false);
      } else if (value.length > 20) {
        callback(new Error("考勤规则名称不能超过20个字"));
        document.getElementById("kqfs").scrollIntoView(false);
      } else {
        callback();
      }
    };
    var checkMembersGroups = (rule, value, callback) => {
      if (!this.ruleForm.selected_members_groups.length) {
        document.getElementById("kqfs").scrollIntoView(false);
        callback(new Error("请选择参与小组或人员"));
      } else {
        callback();
      }
    };
    var checkTimesList = (rule, value, callback) => {
      // console.log(rule)
      // console.log(value)
      // console.log(callback)
      if (this.ruleForm.kq_type == 0) {
        //固定 后一时段必须在前一时段之后
        if (this.times_list[1]) {
          if (
            new Date(
              2000,
              1,
              1,
              util.getLocalTime(this.times_list[1].start_time.getTime(), "HH"),
              util.getLocalTime(this.times_list[1].start_time.getTime(), "mm")
            ).getTime() <=
            new Date(
              2000,
              1,
              1,
              util.getLocalTime(this.times_list[0].end_time.getTime(), "HH"),
              util.getLocalTime(this.times_list[0].end_time.getTime(), "mm")
            ).getTime() ||
            this.times_list[0].cross == 1
          ) {
            // this.$message({
            // 	showClose: true,
            // 	message: '后一时间段开始时间必须在上一时间段之后',
            // 	type: 'warning'
            // });
            document.getElementById("kqfs").scrollIntoView(false);
            // return false
            callback(new Error("后一时间段开始时间必须在上一时间段之后"));
          } else {
            if (this.times_list[2]) {
              if (
                new Date(
                  2000,
                  1,
                  1,
                  util.getLocalTime(
                    this.times_list[2].start_time.getTime(),
                    "HH"
                  ),
                  util.getLocalTime(
                    this.times_list[2].start_time.getTime(),
                    "mm"
                  )
                ).getTime() <=
                new Date(
                  2000,
                  1,
                  1,
                  util.getLocalTime(
                    this.times_list[1].end_time.getTime(),
                    "HH"
                  ),
                  util.getLocalTime(
                    this.times_list[1].end_time.getTime(),
                    "mm"
                  )
                ).getTime() ||
                this.times_list[0].cross == 1 ||
                this.times_list[1].cross == 1
              ) {
                // this.$message({
                // 	showClose: true,
                // 	message: '后一时间段开始时间必须在上一时间段之后',
                // 	type: 'warning'
                // });
                document.getElementById("kqfs").scrollIntoView(false);
                // return false
                callback(new Error("后一时间段开始时间必须在上一时间段之后"));
              } else {
                callback();
              }
            } else {
              callback();
            }
          }
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    var checkDate = (rule, value, callback) => {
      if (this.ruleForm.kq_type != 2 && this.ruleForm.kq_type != 3) {
        if (!(this.start_date && this.end_date)) {
          document.getElementById("kqrq").scrollIntoView(false);
          callback(new Error("请设置考勤日期"));
        } else {
          let week = this.work_week.every((obj) => {
            return obj.select == 0;
          });
          if (week) {
            callback(new Error("请设置工作日"));
            document.getElementById("kqrq").scrollIntoView(false);
          } else {
            callback();
          }
        }
      } else {
        callback();
      }
    };
    var checkRang = (rule, value, callback) => {
      var reg = /^[1-9]*[1-9][0-9]*$/gi;
      if (!value) {
        callback(new Error("请输入打卡范围"));
      } else if (!reg.test(value)) {
        callback(new Error("请输入大于0的数字"));
      } else {
        callback();
      }
    };
    var checkSSID = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请输入WIFI名称"));
      } else {
        callback();
      }
    };
    var checkBSSID = (rule, value, callback) => { // var macRegex = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;
    var macRegex = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;
      if (!value) {
        callback(new Error("请输入路由器的Mac地址"));
      } else if (!macRegex.test(value)) {
        callback(new Error("请输入合法的Mac地址"));
      } else {
        callback();
      }
    };
    return {
      team_id: 0,
      project_id: 0,
      task_id: 38216,
      isNewTask: true,
      ruleForm: {
        name: "",
        selected_members_groups: [],
        kq_type: 0,
        date: true,
        addr: [],
        kqfield: [],
        kq_notice: 0,
        punchingMode: 1,
        is_allow_punch: 0, // 是否允许补卡
        // punch_range: 0, // 考勤范围
        punch_type:0, //打卡方式 0：GPS 1：WIFI
      },
      rules: {
        name: [{ validator: checkName, required: true, trigger: "blur" }],
        // selected_members_groups: [
        // 	{ validator: checkMembersGroups, required: true, }
        // ],
        kq_type: [{ validator: checkTimesList, required: true }],
        date: [{ validator: checkDate, required: true }],
        // addr: [
        // 	{ required: false}
        // ],
        // kqfield: [
        // 	{ type: 'array', required: false }
        // ],
        // kq_notice: [
        // 	{ required: true, message: '请选择活动资源', trigger: 'change' }
        // ],
        workplace_name: [
          { required: true, message: "请输入地点名称", trigger: "blur" },
          // { min: 1, max: 15, message: '长度在1到15个字符', trigger: 'blur' }
        ],
        kq_rang: [{ validator: checkRang, required: true, trigger: "blur" }],
      },
      //考勤范围
      all_groups: [],
      //考勤方式
      times_list: [
        //固定
        {
          start_time: new Date(2000, 1, 1, 9, 0),
          end_time: new Date(2000, 1, 1, 18, 0),
          cross: 0,
        },
      ],
      worktime: 8, //弹性
      kqStartT: "00:00", //考勤开始时间
      bc_list: [
        //排班
        {
          id: "",
          name: "A",
          start_time: new Date(2000, 1, 1, 9, 0),
          end_time: new Date(2000, 1, 1, 18, 0),
          cross: 0,
        },
      ],
      //考勤日期
      start_date: new Date(),
      end_date: "",
      startOptions: {
        disabledDate (time) {
          if (_this.end_date) {
            return (
              time.getTime() < Date.now() - 8.64e7 ||
              time.getTime() > _this.end_date.getTime()
            );
          } else {
            return time.getTime() < Date.now() - 8.64e7;
          }
        },
      },
      endOptions: {
        disabledDate (time) {
          if (_this.start_date) {
            return (
              time.getTime() < Date.now() - 8.64e7 ||
              time.getTime() <
              util.getStampFromDate(
                util.getLocalTime(_this.start_date.getTime(), "yyyy-MM-dd")
              )
            );
          } else {
            return time.getTime() < Date.now() - 8.64e7;
          }
        },
      },
      work_week: [
        {
          name: "周一",
          select: 1,
        },
        {
          name: "周二",
          select: 1,
        },
        {
          name: "周三",
          select: 1,
        },
        {
          name: "周四",
          select: 1,
        },
        {
          name: "周五",
          select: 1,
        },
        {
          name: "周六",
          select: 1,
        },
        {
          name: "周日",
          select: 1,
        },
      ], //选择周几
      //考勤地点
      dialogSelectAddr: false,
      loading: false, //点击编辑时loading
      kqAddrFilterText: "",
      all_addrs: [
        // {
        // 	workplace_id: 0,
        // 	workplace_name: "酒店的",
        // 	address_name: "北京市海淀区东北旺南路八维研修学院北京市海淀区东北旺南路八维研修学院",
        // 	workplace_name_py: ''
        // }
      ],
      all_selected: false, //全选按钮
      selected_addrs: [],
      dialogNewAddr: false,
      new_addr: {
        isNew: 1,
        title: "",
        workplace_name: "",
        workplace_init_name: "",
        address_name: "",
        workplace_id: "",
      },
      searchAddrFilterText: "",
      searchAddrResultList: [],
      // WIFI 相关
      dialogWifi: false,
      dialogChooseWifi: false,
      isEditWifi: false,
      selected_wifi_info: [
      ],
      wifi_info: [],
      all_wifi_selected: false,
      all_wifi_disabled:false,
      kqWifiFilterText: "", // 按照wifi名称搜索
      ruleFormWifi: {
        mac_name: "",
        mac_address: "",
      },
      rulesWifi: {
        mac_name: [{ validator: checkSSID, required: true, trigger: "blur" }],
        mac_address: [{ validator: checkBSSID, required: true, trigger: "blur" }],
      },
      //考勤填写项
      require_field: [],
      require_field_formid: 0,
      naixue_project_kaoqin_value: false,
      naixue_kaoqin_type: false,
    };
  },
  computed: {
    // all_addrs_search() {
    // 	if(this.kqAddrFilterText){
    // 		let tempArr = []
    // 		this.all_addrs.forEach((obj) => {
    // 			if(obj.workplace_name.indexOf(this.kqAddrFilterText)>-1){
    // 				tempArr.push(obj)
    // 			}
    // 		})
    // 		return tempArr
    // 	}else{
    // 		return this.all_addrs
    // 	}
    // }
  },
  watch: {
    // 	'all_addrs': {
    // 		handler: (newval) => {
    // 	let lab = newval.every((obj) => {
    // 		return obj.selected == true
    // 	})
    // 	// console.log(lab)
    // 	_this.all_selected = lab
    // },
    // deep: true
    // 	}
  },
  methods: {
    init () {
      // 获取考勤方式
      this.naixue_project_kaoqin_value =
        window.localStorage.getItem("naixue_project_kaoqin") || false;
      if (this.naixue_project_kaoqin_value) {
        this.ruleForm.kq_type = 2;
        this.naixue_kaoqin_type = true;
      }
      //获取用户信息
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.task_id = util.getLocalStorage("kqpb_task_id");
      // console.log(this.task_id)
      //判断是新建还是修改
      if (this.task_id == 0) {
        this.isNewTask = true;
      } else {
        this.isNewTask = false;
        //获取已设置的信息
        this.getTaskInfo();
      }
      //获取可选择范围
      this.getMemberGroup();
      //获取可选的考勤地点
      this.getAllAddrs();
      // 获取可选的WIFI列表
      this.getWifiList();
      this.$watch(
        "all_addrs",
        (newval) => {
          // console.log(newval)
          let lab = false;
          if (newval.length) {
            lab = newval.every((obj) => {
              if (this.kqAddrFilterText) {
                if (
                  obj.workplace_name
                    .toUpperCase()
                    .indexOf(this.kqAddrFilterText.toUpperCase()) > -1 ||
                  obj.address_name
                    .toUpperCase()
                    .indexOf(this.kqAddrFilterText.toUpperCase()) > -1
                ) {
                  return obj.selected == true;
                } else {
                  return true;
                }
              } else {
                return obj.selected == true;
              }
            });
          } else {
            lab = false;
          }
          // console.log(lab)
          this.all_selected = lab;
        },
        { deep: true }
      );
      this.$watch(
        "wifi_info",
        (newval) => {
          // console.log(newval)
          let lab = false;
          if (newval.length) {
            lab = newval.every((obj) => {
              return obj.selected == true;
            });
          } else {
            lab = false;
          }
          // console.log(lab)
          this.all_wifi_selected = lab;
          this.all_wifi_disabled = lab;
        },
        { deep: true }
      );
      this.$watch("kqAddrFilterText", (newval) => {
        let lab = false;
        if (newval) {
          let res = this.all_addrs.some((obj) => {
            return (
              obj.workplace_name.toUpperCase().indexOf(newval.toUpperCase()) >
              -1 ||
              obj.address_name.toUpperCase().indexOf(newval.toUpperCase()) > -1
            );
          });
          if (res) {
            //有搜索结果
            lab = this.all_addrs.every((obj) => {
              if (
                obj.workplace_name.toUpperCase().indexOf(newval.toUpperCase()) >
                -1 ||
                obj.address_name.toUpperCase().indexOf(newval.toUpperCase()) >
                -1
              ) {
                return obj.selected == true;
              } else {
                return true;
              }
            });
          } else {
            lab = false;
          }
        } else {
          lab = this.all_addrs.every((obj2) => {
            return obj2.selected == true;
          });
        }
        // console.log(lab)
        this.all_selected = lab;
      });
      this.$watch("ruleForm.kq_type", (newval) => {
        // console.log(newval)
        this.$refs.ruleForm.validateField("kq_type");
      });
    },
    //获取考情设置信息
    getTaskInfo () {
      util.ajax({
        url: "/attendance/attendance_task_info",
        type: "GET",
        data: {
          task_id: this.task_id, //"38053""38216"
          team_id: this.team_id,
          project_id: this.project_id,
        },
        success: (res) => {
          console.log("已设置的考勤信息");
          console.log(res);
          if (res && res.errno == 0) {
            //规则名称
            this.ruleForm.name = res.data.name;
            //考勤范围
            if (res.data.participant_group) {
              res.data.participant_group.forEach((obj) => {
                let tempObj = {};
                tempObj.id = obj.id;
                tempObj.name = obj.name;
                tempObj.selType = "group";
                this.ruleForm.selected_members_groups.push(tempObj);
              });
            }
            if (res.data.participant_user) {
              res.data.participant_user.forEach((obj) => {
                let tempObj = {};
                tempObj.id = obj.id;
                tempObj.name = obj.name;
                tempObj.selType = "peple";
                this.ruleForm.selected_members_groups.push(tempObj);
              });
            }
            //考勤方式
            this.ruleForm.kq_type = Number(res.data.work_type);
            if (this.ruleForm.kq_type == 0) {
              //固定
              this.times_list = [];
              res.data.work_time_range.forEach((obj) => {
                let tempObj = {};
                tempObj.start_time = new Date(
                  2000,
                  1,
                  1,
                  obj.start.time.split(":")[0],
                  obj.start.time.split(":")[1]
                );
                tempObj.start_id = obj.start.id;
                tempObj.end_time = new Date(
                  2000,
                  1,
                  1,
                  obj.end.time.split(":")[0],
                  obj.end.time.split(":")[1]
                );
                tempObj.end_id = obj.end.id;
                tempObj.cross = obj.cross;
                this.times_list.push(tempObj);
              });
            } else if (this.ruleForm.kq_type == 1) {
              this.worktime = Number(res.data.work_time_length);
              let date = res.data.today_begin;
              let s =
                String(date / 60).split(".")[0] < 10
                  ? `0${String(date / 60).split(".")[0]}`
                  : String(date / 60).split(".")[0];
              let e = String(date / 60).split(".")[1] ? "30" : "00";
              this.kqStartT = `${s}:${e}`;
            } else if (
              this.ruleForm.kq_type == 2 ||
              this.ruleForm.kq_type == 3
            ) {
              //排班
              this.bc_list = res.data.schedule_list;
              this.bc_list.forEach((obj) => {
                obj.start_time = new Date(
                  2000,
                  1,
                  1,
                  obj.start_time.split(":")[0],
                  obj.start_time.split(":")[1]
                );
                obj.end_time = new Date(
                  2000,
                  1,
                  1,
                  obj.end_time.split(":")[0],
                  obj.end_time.split(":")[1]
                );
              });
            }
            //考勤日期
            if (res.data.work_week && res.data.work_week.start_date) {
              //现在只有一种时间方式
              this.start_date = new Date(
                util.getStampFromDate(res.data.work_week.start_date)
              );
              this.end_date = new Date(
                util.getStampFromDate(res.data.work_week.end_date)
              );
              this.work_week.forEach((obj) => {
                obj.select = 0;
              });
              res.data.work_week.week.forEach((obj) => {
                this.work_week[obj - 1].select = 1;
              });
            }
            //考勤地点
            this.selected_addrs = res.data.position;
            // mac地址信息
            this.selected_wifi_info = res.data.mac;
            //考勤填写项
            this.require_field = res.data.require_field;
            this.require_field_formid = res.data.require_field_formid;
            //考勤通知notice_type
            this.ruleForm.kq_notice = Number(res.data.notice_type);
            this.ruleForm.is_allow_punch = parseFloat(res.data.is_allow_punch)
             // 打卡方式
            this.ruleForm.punch_type = parseFloat(res.data.punch_type)
          }
        },
        error: (xhr, status) => { },
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
    validateKqSet () {
      // if(!this.ruleForm.name){
      // 	this.$message({
      // 	  	showClose: true,
      // 	  	message: '规则名称不能为空',
      // 	  	type: 'warning'
      // 	});
      // 	document.getElementById("gzmc").scrollIntoView(false)
      // 	return false
      // }
      // if(this.ruleForm.name.length>20){
      // 	this.$message({
      // 	  	showClose: true,
      // 	  	message: '考勤规则名称不能超过20个字',
      // 	  	type: 'warning'
      // 	});
      // 	document.getElementById("gzmc").scrollIntoView(false)
      // 	return false
      // }
      // if(!this.ruleForm.selected_members_groups.length){//考勤范围
      // 	this.$message({
      // 	  	showClose: true,
      // 	  	message: '请选择参与小组或人员',
      // 	  	type: 'warning'
      // 	});
      // 	document.getElementById("kqfw").scrollIntoView(false)
      // 	return false
      // }
      // 	if(this.ruleForm.kq_type == 0){//固定 后一时段必须在前一时段之后
      // 		if(this.times_list[1]){
      // if(new Date(2000,1,1,util.getLocalTime(this.times_list[1].start_time.getTime(), 'HH'),util.getLocalTime(this.times_list[1].start_time.getTime(), 'mm')).getTime() <= new Date(2000,1,1,util.getLocalTime(this.times_list[0].end_time.getTime(), 'HH'),util.getLocalTime(this.times_list[0].end_time.getTime(), 'mm')).getTime()){
      // 	this.$message({
      // 		showClose: true,
      // 		message: '后一时间段开始时间必须在上一时间段之后',
      // 		type: 'warning'
      // 	});
      // 				document.getElementById("kqfs").scrollIntoView(false)
      // 	return false
      // }
      // 		}
      // 		if(this.times_list[2]){
      // 			if(new Date(2000,1,1,util.getLocalTime(this.times_list[2].start_time.getTime(), 'HH'),util.getLocalTime(this.times_list[2].start_time.getTime(), 'mm')).getTime() <= new Date(2000,1,1,util.getLocalTime(this.times_list[1].end_time.getTime(), 'HH'),util.getLocalTime(this.times_list[1].end_time.getTime(), 'mm')).getTime()){
      // 				this.$message({
      // 					showClose: true,
      // 					message: '后一时间段开始时间必须在上一时间段之后',
      // 					type: 'warning'
      // 				});
      // 				document.getElementById("kqfs").scrollIntoView(false)
      // 				return false
      // 			}
      // 		}
      // 	}
      // 	if(this.ruleForm.kq_type != 2){
      // 		if(!(this.start_date&&this.end_date)){
      // 			this.$message({
      // 	showClose: true,
      // 	message: '请设置考勤日期',
      // 	type: 'warning'
      // });
      // 			document.getElementById("kqrq").scrollIntoView(false)
      // return false
      // 		}
      // 		let week = this.work_week.every((obj) =>{
      // 			return obj.select == 0
      // 		})
      // 		if(week){
      // 			this.$message({
      // 	showClose: true,
      // 	message: '请设置工作日',
      // 	type: 'warning'
      // });
      // 			document.getElementById("kqrq").scrollIntoView(false)
      // return false
      // 		}
      // 	}
      // return true
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          // alert('submit!');
          this.saveKqSetFn();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    saveKqSetFn () {
      // if(!this.validateKqSet()) return
      let ajaxData = {
        team_id: this.team_id,
        project_id: this.project_id,
        name: this.ruleForm.name,
        participant_group: [],
        participant_user: [],
        position: [],
        work_type: this.ruleForm.kq_type,
        work_time_range: [],
        work_time_length: this.worktime,
        today_begin:
          Number(this.kqStartT.split(":")[0] * 60) +
          Number(this.kqStartT.split(":")[1]),
        schedule_list: [],
        work_date_type: 1,
        require_field: this.require_field,
        notice_type: this.ruleForm.kq_notice,
        is_allow_punch: parseFloat(this.ruleForm.is_allow_punch),
        checkparticapant: 1,
        mac: [],
        punch_type:this.ruleForm.punch_type
      };
      if (this.ruleForm.kq_type != 2 && this.ruleForm.kq_type != 3) {
        ajaxData.work_week = {
          start_date: util.getLocalTime(
            this.start_date.getTime(),
            "yyyy-MM-dd"
          ),
          end_date: util.getLocalTime(this.end_date.getTime(), "yyyy-MM-dd"),
          week: [],
        };
        this.work_week.forEach((obj, index) => {
          if (obj.select == 1) {
            ajaxData.work_week.week.push(index + 1);
          }
        });
      }
      this.ruleForm.selected_members_groups.forEach((obj) => {
        if (obj.selType === "peple") {
          ajaxData.participant_user.push(obj.id);
        } else if (obj.selType === "group") {
          ajaxData.participant_group.push(obj.id);
        }
      });
      this.selected_addrs.forEach((obj) => {
        ajaxData.position.push(obj.id);
      });
      if(this.ruleForm.punch_type == 1){
        if(this.selected_wifi_info.length == 0){
          this.$message({
            showClose: true,
            message: "请添加WIFI信息",
            type: "success",
          });
          return
        }
        this.selected_wifi_info.forEach((obj) => {
          ajaxData.mac.push(obj.mac_id)
        })
      }
      
      if (this.ruleForm.kq_type == 0) {
        this.times_list.forEach((obj) => {
          if (this.isNewTask) {
            let tempObj = {};
            tempObj.start_time = util.getLocalTime(
              obj.start_time.getTime(),
              "HH:mm"
            );
            tempObj.end_time = util.getLocalTime(
              obj.end_time.getTime(),
              "HH:mm"
            );
            tempObj.cross = obj.cross;
            ajaxData.work_time_range.push(tempObj);
          } else {
            let tempObj = {};
            tempObj.start = {
              id: obj.start_id,
              time: util.getLocalTime(obj.start_time.getTime(), "HH:mm"),
            };
            tempObj.end = {
              id: obj.end_id,
              time: util.getLocalTime(obj.end_time.getTime(), "HH:mm"),
            };
            tempObj.cross = obj.cross;
            ajaxData.work_time_range.push(tempObj);
          }
        });
      }
      if (this.ruleForm.kq_type == 2 || this.ruleForm.kq_type == 3) {
        this.bc_list.forEach((obj) => {
          let tempObj = {};
          // console.log(obj.start_time.getTime())
          tempObj.id = obj.id;
          tempObj.name = obj.name;
          tempObj.start_time = util.getLocalTime(
            obj.start_time.getTime(),
            "HH:mm"
          );
          tempObj.end_time = util.getLocalTime(obj.end_time.getTime(), "HH:mm");
          tempObj.cross = obj.cross;
          ajaxData.schedule_list.push(tempObj);
        });
      }
      let url = "";
      if (this.isNewTask) {
        url = "/attendance/attendance_task/add";
        this.ajax(url, ajaxData);
      } else {
        url = "/attendance/attendance_task/update";
        ajaxData.task_id = this.task_id;
        ajaxData.require_field_formid = this.require_field_formid;
        this.$confirm(
          "修改考勤规则当日生效，当日将按照新的规则执行，是否确定修改？",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
          }
        )
          .then(() => {
            this.ajax(url, ajaxData);
          })
          .catch(() => {
            // this.$message({
            //     type: 'info',
            //     message: '取消'
            // });
          });
      }
    },
    ajax (url, ajaxData) {
      console.log(ajaxData);
      util.ajax({
        url: url,
        type: "POST",
        data: ajaxData,
        success: (res) => {
          console.log("保存设置");
          console.log(res);

          if (res && res.errno == 0) {
            this.$message({
              showClose: true,
              message: "保存成功",
              type: "success",
            });
            if (
              this.isNewTask &&
              (this.ruleForm.kq_type == 2 || this.ruleForm.kq_type == 3)
            ) {
              util.setLocalStorage(
                "kqpb_task_id",
                res.data.task_id,
                60 * 60 * 24
              );
              this.ruleForm.kq_type == 2
                ? this.$router.replace("kqeditpb")
                : this.$router.replace("kqeditygpb");
            } else {
              this.$router.replace("kqtasklist");
            }
          } else {
            this.$confirm(
              "考勤小组、人员与其他考勤规则冲突，确定将其拉至该考勤规则？",
              "提示",
              {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
              }
            )
              .then(() => {
                ajaxData.checkparticapant = 0;
                this.ajax(url, ajaxData);
              })
              .catch(() => {
                // this.$message({
                //     type: 'info',
                //     message: '取消'
                // });
              });
          }
        },
        error: (xhr, status) => { },
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
    getMemberGroup () {
      //获取可选择小组和人员列表
      util.ajax({
        url: "/group/node_data_tree",
        type: "GET",
        data: {
          group_id: 0,
          team_id: this.team_id,
          project_id: this.project_id,
        },
        success: (res) => {
          // console.log('小组和人员列表')
          // console.log(res)
          if (res && res.errno == 0) {
            this.all_groups = res.data;
          }
        },
        error: (xhr, status) => { },
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
    getAllAddrs () {
      util.ajax({
        url: "/workplace/list/get",
        type: "GET",
        data: {
          // group_id: 0,
          team_id: this.team_id,
          project_id: this.project_id,
        },
        success: (res) => {
          // console.log('项目下所有工作地点')
          // console.log(res)
          if (res && res.errno == 0) {
            res.data.forEach((obj) => {
              obj.selected = false;
            });
            this.all_addrs = res.data;
          }
        },
        error: (xhr, status) => { },
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
    getWifiList () {
      // setTimeout(() => {
      //   this.wifi_info = [
      //     { id: 1, mac_name: "doumi-office", mac_address: "00:00:00:00" },
      //     { id: 2, mac_name: "doumi-office1", mac_address: "00:00:00:00" },
      //     { id: 3, mac_name: "doumi-office2", mac_address: "00:00:00:00" },
      //   ];
      // }, 1000)
      // return
      util.ajax({
        url: "/workplace/mac/list",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
        },
        success: (res) => {

          const that = this;
          if (res && res.errno == 0) {
            const data = res.data;
            // if (that.selected_wifi_info.length) {
            //   data.forEach((obj1) => {
            //     obj1.selected = false;
            //     that.selected_wifi_info.forEach((obj2) => {
            //       if (obj2.mac_id == obj1.mac_id) {
            //         obj1.selected = true;
            //       }
            //     });
            //   });
            // } else {
            //   data.forEach((obj) => {
            //     obj.selected = false;
            //   });
            // }
            data.forEach((obj) => {
              obj.selected = false;
            });
            this.wifi_info = data;
            console.log('getWifiListgetWifiListgetWifiList', this.wifi_info)
          }
        },
        error: (error) => {

        },
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
    //显示选择范围组件
    openGroupSelecter () {
      this.$refs.profile.openGroupSelecter();
    },
    //选择范围 点击确定回调
    confirmGroupSelecter (val) {
      console.log(val);
      this.ruleForm.selected_members_groups = val;
      this.$refs.ruleForm.validateField("selected_members_groups");
    },
    startRange (end_time) {
      // if(!end_time) return '00:00:00 - 23:59:59'
      // if(this.ruleForm.kq_type == 0){
      // 	// end_time = end_time.getTime() - 60*60*1000
      // 	return [
      // 		'00:00:00 - ' + util.getLocalTime(end_time.getTime() - 60*1000,'HH:mm') + ':00',
      // 		util.getLocalTime(end_time.getTime() + 60*1000,'HH:mm') + ':00' + ' - 23:59:59'
      // 	]
      // }else if(this.ruleForm.kq_type == 2){
      // 	// end_time = end_time.getTime() - 30*60*1000
      // 	return [
      // 		'00:00:00 - ' + util.getLocalTime(end_time.getTime() - 60*1000,'HH:mm') + ':00',
      // 		util.getLocalTime(end_time.getTime() + 60*1000,'HH:mm') + ':00' + ' - 23:59:59'
      // 	]
      // }
      // // return '00:00:00 - ' + util.getLocalTime(end_time,'HH:mm') + ':00'
    },
    endRange (start_time) {
      // if(!start_time) return '00:00:00 - 23:59:59'
      // if(this.ruleForm.kq_type == 0){
      // 	// start_time = start_time.getTime() + 60*60*1000
      // 	return [
      // 		'00:00:00 - ' + util.getLocalTime(start_time.getTime() - 60*1000,'HH:mm') + ':00',
      // 		util.getLocalTime(start_time.getTime() + 60*1000,'HH:mm') + ':00' + ' - 23:59:59'
      // 	]
      // }else if(this.ruleForm.kq_type == 2){
      // 	// start_time = start_time.getTime() + 30*60*1000
      // 	return [
      // 		'00:00:00 - ' + util.getLocalTime(start_time.getTime() - 60*1000,'HH:mm') + ':00',
      // 		util.getLocalTime(start_time.getTime() + 60*1000,'HH:mm') + ':00' + ' - 23:59:59'
      // 	]
      // }
      // // return util.getLocalTime(start_time,'HH:mm') + ':00' + ' - 23:59:59'
    },
    formatEndtime (item) {
      // console.log(item)
      // console.log(item.start_time.toString().substr(16))
      // console.log(item.end_time.toString().substr(16))
      if (
        item.start_time.toString().substr(16) <
        item.end_time.toString().substr(16)
      ) {
        item.cross = 0;
        return "HH:mm";
      } else {
        item.cross = 1;
        return "次日HH:mm";
      }
    },
    startChange (item) {
      if (
        item.start_time.toString().substr(16) ==
        item.end_time.toString().substr(16)
      ) {
        item.start_time = new Date(item.start_time.getTime() - 60 * 1000);
      }
    },
    endChange (item) {
      if (
        item.start_time.toString().substr(16) ==
        item.end_time.toString().substr(16)
      ) {
        item.end_time = new Date(item.end_time.getTime() + 60 * 1000);
      }
    },
    isCross () {
      return this.times_list.some((obj) => {
        return obj.cross == 1;
      });
    },
    //添加固定时段/班次
    addTimeFn () {
      if (this.ruleForm.kq_type == 0) {
        this.times_list.push({
          start_time: new Date(2000, 1, 1, 9, 0),
          end_time: new Date(2000, 1, 1, 18, 0),
        });
      } else if (this.ruleForm.kq_type == 2 || this.ruleForm.kq_type == 3) {
        this.bc_list.push({
          id: 0,
          name: "",
          start_time: new Date(2000, 1, 1, 9, 0),
          end_time: new Date(2000, 1, 1, 18, 0),
        });
        let banci=[]
        let oth=['AA','BB','CC','DD']
        for (let i = 0; i < 26; i++) {
          // console.log(String.fromCharCode(65 + i));
          banci.push(String.fromCharCode(65 + i))
        };
        const b=[...banci,...oth]
        this.bc_list.forEach((obj, index) => {
          obj.name = b[index]
          // switch (index) {
          //   case 0:
          //     obj.name = "A";
          //     break;
          //   case 1:
          //     obj.name = "B";
          //     break;
          //   case 2:
          //     obj.name = "C";
          //     break;
          //   case 3:
          //     obj.name = "D";
          //     break;
          //   case 4:
          //     obj.name = "E";
          //     break;
          //   case 5:
          //     obj.name = "F";
          //     break;
          //   case 6:
          //     obj.name = "G";
          //     break;
          //   case 7:
          //     obj.name = "H";
          //     break;
          //   case 8:
          //     obj.name = "I";
          //     break;
          //   case 9:
          //     obj.name = "J";
          //     break;
          // }
        });
      }
    },
    //删除固定时段/班次
    delTimeFn (index) {
      if (this.ruleForm.kq_type == 0) {
        this.times_list.splice(index, 1);
        this.$refs.ruleForm.validateField("kq_type");
      } else if (this.ruleForm.kq_type == 2 || this.ruleForm.kq_type == 3) {
        this.bc_list.splice(index, 1);
        this.bc_list.forEach((obj, index) => {
          switch (index) {
            case 0:
              obj.name = "A";
              break;
            case 1:
              obj.name = "B";
              break;
            case 2:
              obj.name = "C";
              break;
            case 3:
              obj.name = "D";
              break;
            case 4:
              obj.name = "E";
              break;
            case 5:
              obj.name = "F";
              break;
            case 6:
              obj.name = "G";
              break;
            case 7:
              obj.name = "H";
              break;
            case 8:
              obj.name = "I";
              break;
            case 9:
              obj.name = "J";
              break;
          }
        });
      }
    },
    //删除已选择的地点
    delSelectedAddrFn (index, type) {
      if (type === "GPS") {
        this.selected_addrs.splice(index, 1);
      } else if (type === "WIFI") {
        this.selected_wifi_info.splice(index, 1);
      }
    },
    //选择地点弹窗
    selectAddrFn (type) {
      if (type === "GPS") {
        this.kqAddrFilterText = "";
        this.dialogSelectAddr = true;
      } else if (type === "WIFI") {
        this.kqWifiFilterText = "";
        this.dialogChooseWifi = true;
      }
    },
    //选择地点弹窗 打开时回调
    selectAddrOpen (type) {
      if (type === "GPS") {
        this.all_addrs.forEach((obj1) => {
          obj1.selected = false;
          this.selected_addrs.forEach((obj2) => {
            if (obj2.id == obj1.workplace_id) {
              obj1.selected = true;
            }
          });
        });
      } else if (type === "WIFI") {
        console.log('wifir',this.wifi_info)
        console.log('wifir',this.selected_wifi_info)
        this.wifi_info.forEach((obj1) => {
          obj1.selected = false;
          this.selected_wifi_info.forEach((obj2) => {
            if (obj2.mac_id == obj1.mac_id) {
              obj1.selected = true;
              obj1.disabled = true;
            }
          });
        });
      }
    },
    //全选
    changeAllSel (type) {
      if (type === "GPS") {
        this.handleGpsSinSelected();
      } else {
        this.handleWifiSinSelected();
      }
    },
    handleGpsSinSelected () {
      if (!this.all_selected) {
        this.all_addrs.forEach((obj) => {
          if (this.kqAddrFilterText) {
            //如果有搜索关键字，只对符合筛选条件的进行操作
            if (
              obj.workplace_name
                .toUpperCase()
                .indexOf(this.kqAddrFilterText.toUpperCase()) > -1 ||
              obj.address_name
                .toUpperCase()
                .indexOf(this.kqAddrFilterText.toUpperCase()) > -1
            ) {
              obj.selected = false;
            }
          } else {
            obj.selected = false;
          }
        });
      } else {
        this.all_addrs.forEach((obj) => {
          if (this.kqAddrFilterText) {
            if (
              obj.workplace_name
                .toUpperCase()
                .indexOf(this.kqAddrFilterText.toUpperCase()) > -1 ||
              obj.address_name
                .toUpperCase()
                .indexOf(this.kqAddrFilterText.toUpperCase()) > -1
            ) {
              obj.selected = true;
            }
          } else {
            obj.selected = true;
          }
        });
      }
    },
    handleWifiSinSelected () {
      if (!this.all_wifi_selected) {
        this.wifi_info.forEach((obj) => {
          obj.selected = false;
        });
      } else {
        this.wifi_info.forEach((obj) => {
          obj.selected = true;
        });
      }
    },
    // 单选
    changeSinSel (index, item) {
      this.wifi_info.map((v) => {
        this.$set(v, 'selected', v.id == item.id ? !item.selected : item.selected)
        // v.selected = v.id == item.id?!item.selected:item.selected;
        return v;
      });

      // this.wifi_info[index].selected = !item.selected
      this.$set(this.wifi_info[index], 'selected', true)
      console.log('eeeeee', item)
      this.$forceUpdate()
    },
    clearFilterText (type) {
      this[type] = "";
    },
    clearFilterText2 () {
      this.searchAddrFilterText = "";
      this.searchAddrResultList = [];
    },
    //选择地点  点击确定
    comfirmSelectAddrFn () {
      // console.log(this.all_addrs)
      this.selected_addrs = [];
      this.all_addrs.forEach((obj) => {
        if (obj.selected) {
          let tempObj = {};
          tempObj.id = obj.workplace_id;
          tempObj.name = obj.workplace_name;
          tempObj.address = obj.address_name;
          this.selected_addrs.push(tempObj);
        }
      });
      console.log(this.selected_addrs);
      this.dialogSelectAddr = false;
    },
    // 选择WIF
    comfirmSelectWifi () {
      console.log('wifiinf', this.wifi_info)
      this.closeDialog('dialogChooseWifi')
      this.selected_wifi_info = this.wifi_info.filter(v => {
        return v.selected
      })
    },
    computedSearchResult () {
      if (this.all_addrs.length && this.kqAddrFilterText) {
        let lab = this.all_addrs.every((obj) => {
          return obj.workplace_name.indexOf(this.kqAddrFilterText) < 0;
        });
        return lab;
      }
      return false;
    },
    //点击添加新地点
    newAddrFn (old_addr) {
      if (window.navigator.onLine != true) {
        this.$message({
          showClose: true,
          message: "网络连接失败，请检查网络",
          type: "warning",
        });
        return;
      }
      // this.loading = true
      if (this.$refs["new_addr"] && this.$refs["new_addr"].resetFields)
        this.$refs["new_addr"].resetFields();
      // console.log(old_addr)
      if (old_addr) {
        //获取地点详细信息
        util.ajax({
          url: "/workplace/details/get",
          type: "GET",
          data: {
            workplace_ids: JSON.stringify([old_addr.workplace_id]),
            team_id: this.team_id,
            project_id: this.project_id,
          },
          success: (res) => {
            console.log("工作地点详请");
            console.log(res);
            if (res && res.errno == 0) {
              this.new_addr.workplace_name = res.data[0].workplace_name;
              this.new_addr.workplace_init_name =
                res.data[0].workplace_init_name;
              this.new_addr.address_name = res.data[0].address_name;
              this.new_addr.workplace_id = res.data[0].workplace_id;
              this.new_addr.lng = res.data[0].lng;
              this.new_addr.lat = res.data[0].lat;
              this.new_addr.isNew = 0;
              this.new_addr.title = "编辑地点";

              this.dialogNewAddr = true;
            }
          },
          error: (xhr, status) => {
            this.loading = false;
            // 网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
          noNetwork: () => {
            this.loading = false;
            // 网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
        });
      } else {
        this.new_addr.workplace_name = "";
        this.new_addr.workplace_init_name = "";
        this.new_addr.address_name = "";
        this.new_addr.lng = 0;
        this.new_addr.lat = 0;
        this.new_addr.isNew = 1;
        this.new_addr.title = "添加新地点";

        this.dialogNewAddr = true;
      }
    },
    //添加新地点弹窗出现时的回调
    openNewAddrFn () {
      setTimeout(() => {
        let _this = this;
        this.clearFilterText2();
        //加载地图，调用浏览器定位服务
        // map = new BMap.Map('container');
        // point = new BMap.Point(116.404, 39.925);  // 创建点坐标
        // map.centerAndZoom(point, 18);                 // 初始化地图，设置中心点坐标和地图级别
        // map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
        infoWindow = new BMap.InfoWindow("", {
          // isCustom: true,  //使用自定义窗体
          // autoMove: true,
          title: "",
          // offset: new BMap.Pixel(0, -30)
        });
        this.fixPosition(
          (data) => {
            // this.loading = false
            // 充值位置
            // point = new BMap.Point(data.point.lng, data.point.lat);  // 创建点坐标
            // map.centerAndZoom(point, 12);
            console.log("---zheli");
            //如果是编辑地点 视图转到上次保存位置
            if (_this.new_addr.lng) {
              //清楚上一个maker
              // if (marker) map.remove(marker)
              if (marker) map.clearOverlays();
              //新建maker
              let pt = new BMap.Point(_this.new_addr.lng, _this.new_addr.lat);
              marker = new BMap.Marker(pt, {
                // icon: p_icon1,
                // position: [_this.new_addr.lng, _this.new_addr.lat],
                // title: provinces[i].name,
                // map: map
              });
              map.addOverlay(marker);
              //视图转换
              // map.setZoomAndCenter(16, [_this.new_addr.lng, _this.new_addr.lat])
              map.setViewport({
                center: pt,
                zoom: 18,
              });
              marker.addEventListener("click", function (e) {
                let content =
                  '<div style="width:232px;background-color:#fff;padding:12px 12px 10px 12px;box-sizing:border-box;position:relative;box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);"><p style="font-size: 13px;color:#1f2d3d;margin-bottom:4px;">' +
                  _this.new_addr.workplace_init_name +
                  '</p><p style="font-size: 12px;color:#8492a6;line-height:17px;">' +
                  _this.new_addr.address_name +
                  '</p><div style="width:14px;height:14px;background-color:#fff;position:absolute;left:113px;bottom: -6px;transform:rotate(-45deg);box-shadow: -1px 1px 2px 0 rgba(170, 172, 173, 0.5);"></div></div>';
                e.target.content = content;
                infoWindow.setContent(e.target.content);
                map.openInfoWindow(infoWindow, pt);
              });

              // AMap.service('AMap.Geocoder',function(){//回调函数
              //     //实例化Geocoder
              //     geocoder = new AMap.Geocoder({
              //         city: citycode//城市，默认：“全国”
              //     });
              //     //TODO: 使用geocoder 对象完成相关功能
              //     geocoder.getAddress([_this.new_addr.lng, _this.new_addr.lat], function(status, result) {
              //         if (status === 'complete' && result.info === 'OK') {
              //            //获得了有效的地址信息:
              //            //即，result.regeocode.formattedAddress
              //            console.log(result)
              //         }else{
              //            //获取地址失败
              //         }
              //     });
              // })
              // infoWindow = new BMap.InfoWindow({
              //   isCustom: true,
              //   content: '<div style="width:232px;background-color:#fff;padding:12px 12px 10px 12px;box-sizing:border-box;position:relative;box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);"><p style="font-size: 13px;color:#1f2d3d;margin-bottom:4px;">' + _this.new_addr.workplace_init_name + '</p><p style="font-size: 12px;color:#8492a6;line-height:17px;">' + _this.new_addr.address_name + '</p><div style="width:14px;height:14px;background-color:#fff;position:absolute;left:113px;bottom: -6px;transform:rotate(-45deg);box-shadow: -1px 1px 2px 0 rgba(170, 172, 173, 0.5);"></div></div>',
              //   // position: [_this.new_addr.lng, _this.new_addr.lat],
              //   // offset: new BMap.Pixel(0, -42),
              // })
              // // infoWindow.open(map, [_this.new_addr.lng, _this.new_addr.lat])
              // map.openInfoWindow(infoWindow, pt);
            }
          },
          (data) => {
            //定位失败回调
            console.log("定位失败");
            console.log(data);

            this.loading = false;
            // 网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          }
        );
      }, 0);
    },
    //定位
    fixPosition (onComplete, onError) {
      // map.plugin('AMap.Geolocation', () => {
      //   geolocation = new AMap.Geolocation({
      //     enableHighAccuracy: true,//是否使用高精度定位，默认:true
      //     timeout: 10000,          //超过10秒后停止定位，默认：无穷大
      //     showButton: false,
      //     // buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
      //     // zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
      //     // buttonPosition:'RB',
      //     // buttonOffset: new AMap.Pixel(16, 96),
      //     // buttonDom: '<div style="width:32px;height:32px;background:#fff url('+location_icon+') center no-repeat;box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);border-radius: 2px;"></div>',
      //   });
      //   map.addControl(geolocation);
      //   geolocation.getCurrentPosition();
      //   map.setZoom(16)
      //   AMap.event.addListener(geolocation, 'complete', (data) => {
      //     // console.log('定位成功')
      //     citycode = data.addressComponent.citycode
      //     if (onComplete) onComplete(data)
      //   });//返回定位信息
      //   AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
      // });

      // 添加定位控件
      // let geolocationControl = new BMap.GeolocationControl();
      // geolocationControl.enableAutoLocation = true;
      // geolocationControl.showAddressBar = false;
      // map.addControl(geolocationControl);
      // geolocationControl.location();
      // // map.setZoom(18)
      // geolocationControl.addEventListener("locationSuccess", function (e) {
      //   console.log('eeeeeee=====', e)
      //   // 定位成功事件
      //   // var address = '';
      //   // address += e.addressComponent.province;
      //   // address += e.addressComponent.city;
      //   // address += e.addressComponent.district;
      //   // address += e.addressComponent.street;
      //   // address += e.addressComponent.streetNumber;
      //   // alert("当前定位地址为：" + address);
      //   if (onComplete) onComplete(e)
      // });
      // geolocationControl.addEventListener("locationError", function (e) {
      //   // 定位失败事件
      //   onError(e);
      // });
      // 百度地图定位
      // let _this = this;
      map = new BMap.Map("container");
      point = new BMap.Point(116.331398, 39.897445);
      map.centerAndZoom(point, 18);
      map.enableScrollWheelZoom(true);
      geolocation = new BMap.Geolocation();
      // 开启SDK辅助定位
      geolocation.enableSDKLocation();
      geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
          // let transResult = _this.translate(r.point);
          console.log("您的位置：" + r.point.lng + "," + r.point.lat, r);
          var mk = new BMap.Marker(r.point);
          map.addOverlay(mk);
          map.panTo(r.point);
          if (onComplete) onComplete(r);
        } else {
          alert("failed" + this.getStatus());
        }
      });
      // function myFun(result) {
      //   var cityName = result.name;
      //   map.setCenter(cityName);
      //   alert("当前定位城市:" + cityName);
      // }
      // var myCity = new BMap.LocalCity();
      // myCity.get(myFun);
    },
    translate (point) {
      let convertor = new BMap.Convertor();
      var pointArr = [];
      pointArr.push(point);
      convertor.translate(pointArr, 1, 5, function (data) {
        if (data.status === 0) {
          console.log("data=============", data);
          return data;
        }
      });
    },
    //搜索地点
    searchAddrFn () {
      let _this = this;
      // AMap.service(["AMap.PlaceSearch"], function () {
      //   placeSearch = new AMap.LocalSearch({ //构造地点查询类
      //     pageCapacity: 10,
      //     // pageIndex: 1,
      //     city: citycode, //城市
      //     // map: map,
      //     // panel: "panel"
      //   });
      //   //关键字查询
      //   if (_this.searchAddrFilterText) {
      //     placeSearch.search(_this.searchAddrFilterText, (status, result) => {
      //       // console.log(status)
      //       // console.log(result)
      //       if (status === 'complete' && result.poiList.pois.length) {
      //         _this.searchAddrResultList = result.poiList.pois
      //       } else {
      //         _this.searchAddrResultList = []
      //       }
      //     })
      //   } else {
      //     _this.searchAddrResultList = []
      //   }
      // });
      var options = {
        onSearchComplete: (results) => {
          if (local.getStatus() == BMAP_STATUS_SUCCESS) {
            console.log("results===", results, results.getCurrentNumPois());
            // 判断状态是否正确
            var s = [];
            for (var i = 0; i < results.getCurrentNumPois(); i++) {
              // s.push(results.getPoi(i).title + ", " + results.getPoi(i).address);
              s.push({
                // city: results.getPoi(i).city,
                name: results.getPoi(i).title,
                address: results.getPoi(i).address,
                location: results.getPoi(i).point,
              });
            }
            _this.searchAddrResultList = s;
            console.log(
              "searchAddrResultList===========",
              _this.searchAddrResultList
            );
          } else {
            _this.searchAddrResultList = [];
          }
        },
      };
      var local = new BMap.LocalSearch(map, options);
      // local.search("公园");
      local.search(_this.searchAddrFilterText);
    },
    // 点击下拉框选项跳转
    clickAddrResultFn (poi) {
      let old_name = this.new_addr.workplace_name; //未知原因 下句代码会保存原来的name
      if (this.$refs["new_addr"] && this.$refs["new_addr"].resetFields)
        this.$refs["new_addr"].resetFields();
      //清空搜索结果 赋值
      this.searchAddrResultList = [];
      this.searchAddrFilterText = poi.name;
      this.new_addr.workplace_name = old_name ? old_name : poi.name;
      this.new_addr.workplace_init_name = poi.name;
      this.new_addr.address_name = poi.address;
      this.new_addr.lng = poi.location.lng;
      this.new_addr.lat = poi.location.lat;
      // console.log([poi.location.lng,poi.location.lat])
      //清楚上一个maker
      // if (marker) map.remove(marker)
      //新建maker
      // marker = new AMap.Marker({
      //   icon: p_icon1,
      //   position: [poi.location.lng, poi.location.lat],
      //   // title: provinces[i].name,
      //   map: map
      // });
      // //视图转换
      // map.setZoomAndCenter(16, [poi.location.lng, poi.location.lat])
      if (marker) map.clearOverlays();
      //新建maker
      let pt = new BMap.Point(poi.location.lng, poi.location.lat);
      marker = new BMap.Marker(pt, {});
      map.addOverlay(marker);
      //视图转换
      map.setViewport({
        center: pt,
        zoom: 18,
      });
      marker.addEventListener("click", function (e) {
        let content =
          '<div style="width:232px;background-color:#fff;padding:12px 12px 10px 12px;box-sizing:border-box;position:relative;box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);"><p style="font-size: 13px;color:#1f2d3d;margin-bottom:4px;">' +
          poi.name +
          '</p><p style="font-size: 12px;color:#8492a6;line-height:17px;">' +
          poi.address +
          '</p><div style="width:14px;height:14px;background-color:#fff;position:absolute;left:113px;bottom: -6px;transform:rotate(-45deg);box-shadow: -1px 1px 2px 0 rgba(170, 172, 173, 0.5);"></div></div>';
        e.target.content = content;
        infoWindow.setContent(e.target.content);
        map.openInfoWindow(infoWindow, pt);
      });
      // infoWindow.setContent('<div style="width:232px;background-color:#fff;padding:12px 12px 10px 12px;box-sizing:border-box;position:relative;box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);"><p style="font-size: 13px;color:#1f2d3d;margin-bottom:4px;">'+this.new_addr.workplace_name+'</p><p style="font-size: 12px;color:#8492a6;line-height:17px;">'+this.new_addr.address_name+'</p><div style="width:14px;height:14px;background-color:#fff;position:absolute;left:113px;bottom: -6px;transform:rotate(-45deg);box-shadow: -1px 1px 2px 0 rgba(170, 172, 173, 0.5);"></div></div>')
      // infoWindow.setPosition([poi.location.lng,poi.location.lat])

      // infoWindow = new AMap.InfoWindow({
      //   isCustom: true,
      //   content: '<div style="width:232px;background-color:#fff;padding:12px 12px 10px 12px;box-sizing:border-box;position:relative;box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);"><p style="font-size: 13px;color:#1f2d3d;margin-bottom:4px;">' + this.new_addr.workplace_init_name + '</p><p style="font-size: 12px;color:#8492a6;line-height:17px;">' + this.new_addr.address_name + '</p><div style="width:14px;height:14px;background-color:#fff;position:absolute;left:113px;bottom: -6px;transform:rotate(-45deg);box-shadow: -1px 1px 2px 0 rgba(170, 172, 173, 0.5);"></div></div>',
      //   // position: [_this.new_addr.lng, _this.new_addr.lat],
      //   offset: new AMap.Pixel(0, -42),
      // })
      // infoWindow.open(map, [poi.location.lng, poi.location.lat])
    },
    validateNewAddr (type) {
      if (type === "GPS") {
        if (!this.new_addr.address_name) {
          this.$message({
            showClose: true,
            message: "请通过搜索选择工作地点",
            type: "warning",
          });
          return;
        }
        this.$refs["new_addr"].validate((valid) => {
          if (valid) {
            this.comfirmNewAddrFn();
          } else {
            return false;
          }
        });
      } else if (type === "WIFI") {
        this.$refs["ruleFormWifi"].validate((valid) => {
          if (valid) {
            this.isEditWifi ? this.confirmEditMacid() : this.confirmAddMacId();
          }
        });
      }
    },
    closeDialog (type) {
      this[type] = false;
      return;
      if (type === "GPS") {
        this.dialogNewAddr = false;
      } else if (type === "WIFI") {
        this.dialogChooseWifi = false;
      }
    },
    comfirmNewAddrFn () {
      if (this.new_addr.isNew == 1) {
        //保存新建
        util.ajax({
          url: "/workplace/create",
          type: "POST",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            address: JSON.stringify({
              lat: this.new_addr.lat,
              lng: this.new_addr.lng,
              addr: this.new_addr.address_name,
              addr_name: this.new_addr.workplace_name,
              addr_init_name: this.new_addr.workplace_init_name,
              code: "", //地点代码,
              province: "", //省
              city: "", //市
              district: "", //区
            }),
          },
          success: (res) => {
            // console.log('新建工作地点')
            // console.log(res)
            if (res && res.errno == 0) {
              if (res.data[0].create_status) {
                this.all_addrs.unshift({
                  workplace_name: this.new_addr.workplace_name,
                  workplace_init_name: this.new_addr.workplace_init_name,
                  address_name: this.new_addr.address_name,
                  workplace_id: res.data[0].workplace_id,
                  selected: true,
                });
                this.dialogNewAddr = false;
              }
            }
          },
          error: (xhr, status) => {
            // 网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
          noNetwork: () => {
            // 网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
        });
      } else {
        // console.log(this.new_addr.workplace_id)
        //保存更改
        util.ajax({
          url: "/workplace/modify",
          type: "POST",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            workplace_id: this.new_addr.workplace_id,
            address: JSON.stringify({
              lat: this.new_addr.lat,
              lng: this.new_addr.lng,
              addr: this.new_addr.address_name,
              addr_name: this.new_addr.workplace_name,
              addr_init_name: this.new_addr.workplace_init_name,
              code: "", //地点代码,
              province: "", //省
              city: "", //市
              district: "", //区
            }),
          },
          success: (res) => {
            // console.log('修改工作地点')
            // console.log(res)
            if (res && res.errno == 0) {
              if (res.data[0].modify_status) {
                this.all_addrs.forEach((obj) => {
                  if (obj.workplace_id == this.new_addr.workplace_id) {
                    obj.workplace_name = this.new_addr.workplace_name;
                    obj.workplace_init_name = this.new_addr.workplace_init_name;
                    obj.address_name = this.new_addr.address_name;
                    obj.workplace_id = this.new_addr.workplace_id;
                  }
                });

                this.dialogNewAddr = false;
              }
            }
          },
          error: (xhr, status) => {
            // 网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
          noNetwork: () => {
            // 网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
        });
      }
    },
    confirmAddMacId () {
      const { mac_name, mac_address } = this.ruleFormWifi;
      util.ajax({
        url: "/workplace/create/mac",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          mac_name,
          mac_address:mac_address.toLocaleLowerCase()
        },
        success: (res) => {
          if (res && res.errno == 0) {
            this.$message({
              showClose: true,
              message: "添加成功",
              type: "success",
            });
            this.closeDialog('dialogWifi');
            this.getWifiList();
          }else{
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: "success",
            });
          }
        },
        error: (error) => {
          this.$message({
            showClose: true,
            message: error,
            type: "success",
          });
        },
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
    confirmEditMacid () {
      const { mac_name, mac_address, mac_id } = this.ruleFormWifi;
      util.ajax({
        url: "/workplace/mac/modify",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          mac_name,
          mac_address:mac_address.toLocaleLowerCase(),
          mac_id
        },
        success: (res) => {
          if (res && res.errno == 0) {
            this.$message({
              showClose: true,
              message: "修改成功",
              type: "success",
            });
            this.closeDialog('dialogWifi');
            this.getWifiList();
          }else{
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: "success",
            });
          }
        },
        error: (error) => { 
          this.$message({
            showClose: true,
            message: error,
            type: "success",
          });
        },
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
    toBigFn () {
      map.zoomIn();
    },
    toSmallFn () {
      map.zoomOut();
    },
    addMacId (type, item = {}) {
      this.dialogWifi = true;
      this.isEditWifi = type ==='editWifi';
      if (type == "add") {
        this.ruleFormWifi = {
          mac_name: "",
          mac_address: "",
        }
      } else if (type === "editWifi") {
        this.ruleFormWifi = {
          mac_name: item.mac_name,
          mac_address: item.mac_address,
          mac_id: item.mac_id
        }
      }
    },
  },
  mounted () {
    this.init();
  },
  beforeDestroy () {
    localStorage.removeItem("naixue_project_kaoqin");
  },
  // watch: {
  //   '$route' (to, from) {
  //     // 对路由变化作出响应...
  //      this.init()
  //   }
  // }
};
</script>

<style>
.kqsettask .settask_main .el-radio__label {
  padding-left: 10px;
}

.kqsettask .settask_main .el-form-item {
  margin-bottom: 30px;
}

.kqsettask .settask_main .el-form-item .el-form-item__label {
  text-align: left;
  text-indent: 23px;
}

.kqsettask .settask_main .el-form-item.is-required .el-form-item__label {
  position: relative;
}

.kqsettask .settask_main .el-form-item.is-required .el-form-item__label:before {
  content: "";
  color: #ffaa00;
  /*margin-right: 8px;*/
  display: block;
  width: 7px;
  height: 7px;
  background: url(../assets/imgs/x_icon.svg) no-repeat center left;
  color: #ffaa00;
  position: absolute;
  left: 0px;
  top: 14px;
}

.kqsettask .settask_main .new_addr .form_wrap .el-form-item {
  margin-bottom: 24px;
}

.kqsettask .settask_main .new_addr .form_wrap .el-form-item .el-form-item__content {
  margin-left: 90px !important;
}

.kqsettask .settask_main .new_addr .form_wrap .el-form-item .el-form-item__label {
  text-align: right;
  text-indent: 0px;
}

.kqsettask .settask_main .el-radio+.el-radio {
  margin-left: 41px;
}

.kqsettask .settask_main .select_addr .el-dialog {
  width: 640px;
}

.kqsettask .settask_main .new_addr .el-dialog {
  width: 741px;
}

.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input {
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
}

.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input__inner {
  padding-left: 36px;
  border: none;
}

.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input__inner:hover,
.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input__icon:hover+.el-input__inner,
.kqsettask .settask_main .new_addr .new_addr_main .main_top .el-input__inner:focus {
  border: none !important;
}

.kqsettask .settask_main .select_addr .select_addr_main .el-input__inner {
  padding-left: 36px;
}

.kqsettask .settask_main .select_addr .select_addr_main .main_table .table_body .table_item .pos_edit .el-button>span {
  font-size: 12px;
}

/*.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table .cell{
	white-space: nowrap;
	padding-right: 10px;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table-column--selection .cell{
	padding-left: 11px;
	padding-right: 0;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .pos_name .cell{
	padding-left: 10px;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__header-wrapper th{
	height: 36px;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__header-wrapper th.pos_name,
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__header-wrapper th.pos_addr{
	border-right: 1px solid #e0e6ed;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__body-wrapper td{
	height: 43px;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__body-wrapper td.pos_name .cell{
	font-size: 13px;
	color: #1f2d3d;
}
.kqsettask .settask_main .select_addr .select_addr_main .main_table .el-table__body-wrapper td.pos_addr .cell{
	font-size: 12px;
	color: #8492a6;
}*/
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.kqsettask {
  padding: 0 20px;
}

.kqsettask .settask_top {
  height: 50px;
  border-bottom: 1px solid #e0e6ed;
}

.kqsettask .settask_main {
  /*margin:8px 0 16px;*/
}

.kqsettask .settask_main .settask_title {
  height: 70px;
}

.kqsettask .settask_main .settask_title h2 {
  float: left;
  line-height: 70px;
  font-size: 16px;
  font-weight: 500;
  font-style: normal;
  color: #475568;
}

/*考勤范围*/
.kqsettask .settask_main .g_m_wrap {
  width: 468px;
  /*height: 36px;*/
  padding: 5px 11px 0;
  border-radius: 1px;
  border: 1px solid #e0e6ed;
  box-sizing: border-box;
  cursor: pointer;
}

.kqsettask .settask_main .el-form-item.is-error.is-required .g_m_wrap {
  border: 1px solid #ff6600;
}

.kqsettask .settask_main .g_m_wrap:after {
  content: "";
  display: block;
  clear: both;
}

.kqsettask .settask_main .g_m_wrap:hover {
  border: 1px solid #c0ccda;
}

.kqsettask .settask_main .add_item {
  float: left;
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  color: #6699ee;
  background: url(../assets/imgs/shareIcon/add_hover.svg) left no-repeat;
  text-indent: 18px;
  cursor: pointer;
}

.kqsettask .settask_main .add_item:active {
  color: #517ed6;
}

.kqsettask .settask_main .g_m_wrap .g_m_item {
  float: left;
  display: flex;
  /*width: 94px;*/
  height: 24px;
  box-sizing: border-box;
  border-radius: 2px;
  background-color: #f3f8ff;
  border: solid 1px #d4e5ff;
  margin: 0 6px 5px 0;
}

.kqsettask .settask_main .g_m_wrap .g_m_item .item_icon {
  width: 26px;
  /*background: url(../assets/imgs/peple_ico.svg)  no-repeat center;*/
  background: url(../assets/imgs/group_ico.svg) no-repeat center;
}

.kqsettask .settask_main .g_m_wrap .g_m_item .item_icon.item_icon_p {
  background: url(../assets/imgs/peple_ico.svg) no-repeat center;
}

.kqsettask .settask_main .g_m_wrap .g_m_item .item_name {
  flex: 1;
  line-height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #6699ee;
  padding-right: 6px;
}

/*考勤方式*/
.kqsettask .settask_main .kq_type_main {
  position: relative;
  width: 468px;
  /*height: 120px;*/
  background-color: #f7f9fc;
  border-top: 1px solid #e7eef6;
  margin-top: 14px;
}

.kqsettask .settask_main .arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 1px solid transparent;
  border-top: 1px solid #e7eef6;
  border-right: 1px solid #e7eef6;
  background-color: #f7f9fc;
  transform: rotate(-45deg);
  left: 38px;
  top: -5px;
}

.kqsettask .settask_main .kq_type_main .main_title {
  height: 14px;
  line-height: 14px;
  font-size: 14px;
  color: #99a9bf;
  text-indent: 20px;
  margin-top: 26px;
}

.kqsettask .settask_main .kq_type_main .all_timearea {
  padding: 0 20px;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval {
  height: 68px;
  border-bottom: 1px solid #e8edf2;
  padding: 16px 0;
  box-sizing: border-box;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval>div {
  float: left;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .name {
  width: 54px;
  font-size: 14px;
  color: #5e6d82;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .line {
  width: 28px;
  color: #beccda;
  text-align: center;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .start,
.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .end {}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .delate {
  width: 40px;
  height: 36px;
  background: url(../assets/imgs/delate.svg) no-repeat 15px center;
  cursor: pointer;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .delate:hover {
  background: url(../assets/imgs/delate_hover.svg) no-repeat 15px center;
}

.kqsettask .settask_main .kq_type_main .all_timearea .selecttimeinterval .delate.undel {
  background: url(../assets/imgs/delate_disabled.svg) no-repeat 15px center;
}

.kqsettask .settask_main .kq_type_main .addtime {
  height: 24px;
  padding: 14px 196px;
  /*cursor: pointer;*/
}

.kqsettask .settask_main .kq_type_main .setworktime {
  height: 36px;
  padding: 16px 20px;
}

/* wifi考勤弹窗 */
.wifi-body {
  width: 100%;
  box-sizing: border-box;
  padding: 20px 10px;
}

.wifi-tips {
  padding-top: 20px;
}

.wifi-body .tips-title {
  font-size: 14px;
  color: #48576a;
  margin-bottom: 8px;
}

.wifi-body .tips {
  font-size: 12px;
  color: #99a9bf;
  line-height: 28px;
  padding-left: 10px;
}

/*考勤日期*/
.kqsettask .settask_main .work_week {
  position: relative;
  width: 468px;
  height: 130px;
  background-color: #f7f9fc;
  border-top: 1px solid #e7eef6;
  margin-top: 22px;
}

.kqsettask .settask_main .work_week .work_week_wrap {
  padding: 24px 0 0 20px;
  box-sizing: border-box;
}

.kqsettask .settask_main .work_week .work_week_wrap:after {
  content: "";
  display: block;
  clear: both;
}

.kqsettask .settask_main .work_week li.week_item {
  position: relative;
  width: 80px;
  height: 35px;
  line-height: 33px;
  background-color: #fff;
  border-radius: 1px;
  border: solid 1px #e0e6ed;
  text-align: center;
  color: #1f2d3d;
  font-size: 14px;
  display: block;
  float: left;
  margin-right: 7px;
  margin-bottom: 16px;
  cursor: pointer;
  box-sizing: border-box;
}

.kqsettask .settask_main .work_week li.week_item:hover {
  color: #6699ee;
  border-color: #6699ee;
}

.kqsettask .settask_main .work_week li.checked {
  border-color: #6699ee;
  color: #6699ee;
}

.kqsettask .settask_main .work_week li.checked:after {
  position: absolute;
  top: 0;
  right: -1px;
  content: "";
  display: block;
  width: 20px;
  height: 20px;
  background: url(../assets/imgs/checkbox_cd.svg) no-repeat;
}

/*考勤地点*/
.kqsettask .settask_main .addr_tip {
  width: 468px;
  font-size: 14px;
  color: #99a9bf;
  margin-bottom: 7px;
}

.kqsettask .settask_main .addr_wrap {
  width: 468px;
  background-color: #f7f9fc;
}

.kqsettask .settask_main .addr_wrap .addrs {
  padding: 0 20px;
  box-sizing: border-box;
  max-height: 312px;
  overflow: auto;
}

.kqsettask .settask_main .addr_wrap .addr_item {
  display: flex;
  height: 52px;
  border-bottom: 1px solid #e8edf2;
  box-sizing: border-box;
}

.kqsettask .settask_main .addr_wrap .addr_item>div {
  line-height: 51px;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_icon {
  width: 25px;
  background: url(../assets/imgs/coor.svg) left center no-repeat;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_name {
  max-width: 373px;
  font-size: 14px;
  color: #1f2d3d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_poi {
  flex: 1;
  font-size: 13px;
  color: #5e6d82;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-indent: 10px;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_del {
  width: 30px;
  background: url(../assets/imgs/delate.svg) no-repeat 10px center;
  cursor: pointer;
}

.kqsettask .settask_main .addr_wrap .addr_item>div.addr_del:hover {
  background: url(../assets/imgs/delate_hover.svg) no-repeat 10px center;
}

.kqsettask .settask_main .addr_wrap .add_addr {
  height: 24px;
  padding: 14px 5px;
  display: flex;
  justify-content: center;
  /*cursor: pointer;*/
}

/*考勤地点弹窗*/
.kqsettask .settask_main .select_addr_main {
  padding: 34px 40px 24px;
  border-bottom: 1px solid #e0e6ed;
}

.kqsettask .settask_main .new_addr_main .main_top {
  position: absolute;
  z-index: 999999;
  top: 47px;
  left: 36px;
}

.kqsettask .settask_main .select_addr_main .main_top {
  position: relative;
  margin-bottom: 10px;
}

.kqsettask .settask_main .new_addr_main .main_top>i.el-icon-search,
.kqsettask .settask_main .select_addr_main .main_top>i.el-icon-search {
  position: absolute;
  z-index: 999;
  top: 11px;
  left: 12px;
  font-size: 16px;
  color: #e0e6ed;
}

.kqsettask .settask_main .new_addr_main .main_top .add_item,
.kqsettask .settask_main .select_addr_main .main_top .add_item {
  float: right;
  margin: 6px 2px;
}

.kqsettask .settask_main .select_addr_main .main_table {
  width: 560px;
  /*height: 307px;*/
  box-sizing: border-box;
  border: 1px solid #e0e6ed;
}

.kqsettask .settask_main .select_addr_main .main_table .table_title {
  width: 560px;
  height: 36px;
  box-sizing: border-box;
  border-bottom: 1px solid #e0e6ed;
  background-color: #edeef2;
  display: flex;
}

.kqsettask .settask_main .select_addr_main .main_table .table_title>div {
  line-height: 36px;
  font-size: 12px;
  font-weight: 600;
  color: #475669;
  box-sizing: border-box;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body {
  height: 270px;
  overflow: auto;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .empty_text {
  line-height: 270px;
  text-align: center;
  font-size: 16px;
  color: #c0ccda;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item {
  display: flex;
  border-bottom: 1px solid #e0e6ed;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item>div {
  box-sizing: border-box;
  line-height: 42px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item .checkbox {
  width: 40px;
  padding-left: 12px;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item .pos_name {
  width: 98px;
  padding: 0 17px 0 0;
  font-size: 13px;
  color: #1f2d3d;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item .pos_addr {
  width: 320px;
  padding: 0 17px;
  font-size: 12px;
  color: #8492a6;
}

.kqsettask .settask_main .select_addr_main .main_table .table_body .table_item .pos_edit {
  width: 100px;
  padding: 0 17px;
}

.kqsettask .settask_main .new_addr_foot,
.kqsettask .settask_main .select_addr_foot {
  height: 68px;
}

.kqsettask .settask_main .new_addr_foot .btns,
.kqsettask .settask_main .select_addr_foot .btns {
  float: right;
  margin: 16px 20px;
}

.kqsettask .settask_main .new_addr_main {
  position: relative;
  padding: 30px 20px 0px;
  border-bottom: 1px solid #e0e6ed;
}

.kqsettask .settask_main .new_addr_main .search_result {
  position: absolute;
  z-index: 999999;
  left: 36px;
  top: 84px;
  width: 312px;
  max-height: 241px;
  background-color: #fff;
  overflow: auto;
  padding-bottom: 8px;
  box-sizing: border-box;
}

.kqsettask .settask_main .new_addr_main .search_result .result_item {
  display: flex;
  height: 32px;
  line-height: 32px;
  padding: 0 28px 0 16px;
  box-sizing: border-box;
  cursor: pointer;
}

.kqsettask .settask_main .new_addr_main .search_result .result_item:hover {
  background-color: #f5f5f5;
}

.kqsettask .settask_main .new_addr_main .search_result .result_item .item_name {
  font-size: 13px;
  color: #1f2d3d;
}

.kqsettask .settask_main .new_addr_main .search_result .result_item .item_addr {
  flex: 1;
  text-indent: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #99a9bf;
}

.kqsettask .settask_main .new_addr_main .map_wrap {
  height: 356px;
  margin-bottom: 16px;
}

.kqsettask .settask_main .new_addr_main .big_small {
  position: absolute;
  z-index: 999;
  right: 36px;
  top: 306px;
  width: 32px;
  height: 64px;
  border-radius: 2px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
  cursor: pointer;
}

.kqsettask .settask_main .new_addr_main .fix_position {
  position: absolute;
  z-index: 999;
  right: 36px;
  top: 258px;
  height: 32px;
  width: 32px;
  background: #fff url(../assets/imgs/position/location.svg) center no-repeat;
  box-shadow: 0 1px 2px 0 rgba(170, 172, 173, 0.5);
  cursor: pointer;
}

.kqsettask .settask_main .new_addr_main .big_small .big {
  height: 31px;
  background: url(../assets/imgs/position/big.svg) center no-repeat;
}

.kqsettask .settask_main .new_addr_main .big_small .small {
  height: 32px;
  background: url(../assets/imgs/position/small.svg) center no-repeat;
}

/*考勤填写项*/

/*考勤通知*/
</style>
