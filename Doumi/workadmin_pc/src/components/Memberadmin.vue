<template>
  <div id="memberAdmin" style="margin: 0 0 20px 0">
    <div class="member-wapper">
      <!-- 分组管理组件 -->
      <h2>人员管理</h2>
      <!-- <template v-if="admins.creatGroupPre == true"> -->
      <groupmgt
        v-if="!admins.groupLeaderFlag && !admins.AdminUserFlag"
        v-on:closeDialog='closeDialog'
        :creat-group-pre="admins.creatGroupPre"
        :project_auto_clean="admins.project_auto_clean"
      ></groupmgt>
      <!-- </template> -->
      <!--  -->
      <select-group-multi
        ref="profile"
        :all-groups="all_groups"
        v-on:confirmGroupSelecter="confirmGroupSelecter"
      ></select-group-multi>
      <!-- 搜索 -->
      <div class="seach-cout">
        <el-form label-width="40px" style="display:flex;flex-wrap:wrap;">
          <div class="from-item-list">
            <el-form-item label="小组：">
              <el-button
                class="group"
                style="width:135px;background: #fff;color: #1f2d3d;text-align: left;border-radius: 2px;"
                @click="openGroupSelecter"
                v-if="selected_groups.length != 0"
              >已选{{selected_groups.length}}个小组<i
                  class="el-icon-caret-bottom"
                  style="position: absolute; right: 12px;top: 14px;color: #d3dce6;"
                ></i></el-button>
              <el-button
                class="group"
                style="width:135px;background: #fff;color: #1f2d3d;text-align: left;border-radius: 2px;"
                @click="openGroupSelecter"
                v-else
              >全部<i
                  class="el-icon-caret-bottom"
                  style="position: absolute; right: 12px;top: 14px;color: #d3dce6;"
                ></i></el-button>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-form-item label="状态：">
              <el-select
                v-model="fromData.statusValue"
                class="mystatus"
                style="width:100px"
              >
                <template v-for="item in statusArr">
                  <el-option
                    :key="item.id"
                    :label="item.text"
                    :value="item.id"
                  >
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
          </div>
          <div class="from-item-list">
            <el-form-item label="人员：">
              <el-autocomplete
                popper-class="my-autocomplete2"
                style="width:135px;"
                v-model="fromData.member"
                :fetch-suggestions="querySearch"
                custom-item="my-item-zh"
                :trigger-on-focus="false"
                placeholder="姓名/手机号"
                @select="handleSelect"
              >
              </el-autocomplete>
            </el-form-item>
          </div>
          <div class="from-item-list mystation"  v-if="is_nx_project">
            <el-form-item label="人员来源：">
              <el-select
                v-model="fromData.source_from_value"
                class="mystatus"
                style="width:100px"
              >
                <template v-for="item in source_from">
                  <el-option
                    :key="item.id"
                    :label="item.text"
                    :value="item.id"
                  >
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
          </div>

          <!---mystation-->
          <div class="from-item-list mystation">
            <el-form-item label="岗位-城市：">
              <el-select
                v-model="fromData.stationCity"
                class="mystatus"
                style="width:135px"
                filterable
              >
                <template v-for="item in stationArr">
                  <el-option
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  >
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
          </div>
          <div
            class="from-item-list"
            v-if="admins.changeProtocolStatusPre == true"
          >
            <el-form-item label="合同：">
              <el-select
                v-model="fromData.protocolStatus"
                class="mystatus"
                style="width:100px"
              >
                <el-option
                  key="签订中"
                  label="签订中"
                  value="0"
                ></el-option>
                <el-option
                  key="已签订"
                  label="已签订"
                  value="1"
                ></el-option>
                <el-option
                  key="未签订"
                  label="未签订"
                  value="-1"
                ></el-option>
                <el-option
                  key="已过期"
                  label="已过期"
                  value="4"
                ></el-option>
                <el-option
                  key="未下发"
                  label="未下发"
                  value="5"
                ></el-option>
                <el-option
                  key="全部"
                  label="全部"
                  value=""
                ></el-option>
              </el-select>
            </el-form-item>
          </div>

          <div class="from-item-list">
            <el-form-item label="供应商：" label-width="50px">
              <el-autocomplete
                popper-class="my-autocomplete2"
                style="width:135px;"
                v-model="fromData.supplierName"
                :fetch-suggestions="querySearchSupplier"
                custom-item="my-item-zh"
                :trigger-on-focus="false"
                placeholder="姓名/手机号"
                @select="handleSelect"
              >
              </el-autocomplete>
            </el-form-item>
          </div>
          <div
            class="from-item-list mystation2"
            v-if="project_type==3||project_type==7"
          >
            <el-form-item label="社保状态：">
              <el-select
                v-model="fromData.insurance_status"
                class="mystatus"
                style="width:120px"
              >
                <el-option v-for="(item,index) in insurance_status_list" :key="index" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div
            class="from-item-list mystation2"
            v-if="project_type==3||project_type==7"
          >
            <el-form-item label="公积金状态：">
              <el-select
                v-model="fromData.fund_status"
                class="mystatus"
                style="width:120px"
              >
                <el-option v-for="(item,index) in fund_status_list" :key="index" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div
            class="from-item-list mystation2"
            v-if="project_type==3||project_type==7"
          >
            <el-form-item label="社保供应商：">
              <el-select
                v-model="fromData.supplier_name"
                class="mystatus"
                style="width:120px"
                clearable
              >
                <el-option v-for="(item, index) in searchData.supplier" :label="item" :key="index" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div
            class="from-item-list"
          >
            <el-form-item label="角色：">
              <el-select
                v-model="fromData.identity"
                class="mystatus"
                style="width:120px"
              >
                <el-option
                  key="全部"
                  label="全部"
                  value="-1"
                ></el-option>
                <el-option
                  key="普通成员"
                  label="普通成员"
                  value="999999"
                ></el-option>
                <el-option
                  key="组长"
                  label="组长"
                  value="3"
                ></el-option>
                <el-option
                  key="管理员"
                  label="管理员"
                  value="2"
                ></el-option>
                <el-option
                  key="超级管理员"
                  label="超级管理员"
                  value="1"
                ></el-option>

              </el-select>
            </el-form-item>
          </div>

          <div class="from-item-list">
            <el-button
              type="primary"
              @click="seachMember(0)"
              class="seach-btn"
            >搜 索</el-button>
          </div>

          <div class="from-item-list" v-if="project_type == 3">
            <el-button
              type="primary"
              @click="seachMember(1)"
            >15天内合同到期人员</el-button>
          </div>

        </el-form>
        <el-form label-width="40px">
          <div class="from-item-list" v-if="!admins.groupLeaderFlag">
            <el-form-item
              label="操作："
              style="margin-bottom: 10px;"
              v-if="admins.moveGroupPre == true || admins.removeMemberPre == true || is_open_supplier == 1"
            >
              <template v-if="admins.moveGroupPre == true && !admins.AdminUserFlag">
                <el-button
                  v-if="isdisabled1"
                  type="primary"
                  :disabled="true"
                  class="move-btn disabled"
                >移动到</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="move-btn default"
                  @click="moveGroup"
                >移动到</el-button>
              </template>
              <template v-if="admins.removeMemberPre == true && !admins.AdminUserFlag">
                <el-button
                  v-if="isdisabled2"
                  type="primary"
                  :disabled="true"
                  class="sign-btn disabled"
                >标记为离职</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="sign-btn default"
                  @click="resetQuit"
                >标记为离职</el-button>
              </template>
              <template v-if="admins.deleteMemberPre == true">
                <el-button
                  v-if="isdisabled3"
                  type="primary"
                  :disabled="true"
                  class="move-btn disabled"
                >删除</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="move-btn default"
                  @click="deleteQuit"
                >删除</el-button>
              </template>

              <template v-if="admins.changeStationPre == true && is_open_supplier == 1">
                <el-button
                  v-if="isdisabled2 || fromData.statusValue == 0"
                  type="primary"
                  :disabled="true"
                  class="sign-btn station disabled"
                >调整关系</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="sign-btn station default"
                  @click="adjustFiliation"
                >调整关系</el-button>
              </template>
              <template v-if="admins.changeStationCityPre == true">
                <el-button
                  v-if="isdisabled2"
                  type="primary"
                  :disabled="true"
                  class="sign-btn station disabled"
                >选择岗位</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="sign-btn station default"
                  @click="selectStation"
                >选择岗位</el-button>
              </template>
              <template v-if="showSetMaintainerBtn == true">
                <el-button
                  v-if="isdisabled2"
                  type="primary"
                  :disabled="true"
                  class="sign-btn station disabled"
                >设置维护人</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="sign-btn station default"
                  @click="handleShowSetMaintainerDialog"
                >设置维护人</el-button>
              </template>
              <template v-if="isSuperAdmin == 1 || isSuperAdmin == 2 || isSuperAdmin == 3 || isSuperAdmin == 4">
                <el-button
                  v-if="isdisabled2"
                  type="primary"
                  :disabled="true"
                  class="sign-btn disabled"
                >设置投保职位</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="sign-btn default"
                  @click="handleInsureJobDialog"
                >设置投保职位</el-button>
              </template>
              <!-- <template>
                              <el-button v-if="isdisabled1" type="primary" :disabled="true" class="move-btn disabled">调整关系</el-button>
                              <el-button v-else type="primary" class="move-btn default" @click="adjustFiliation">调整关系</el-button>
                          </template> -->

              <template v-if="project_type == 3">
                <el-button
                  v-if="isdisabled2"
                  type="primary"
                  :disabled="true"
                  class="sign-btn station disabled"
                  style="width:112px!important"
                >批量签署合同</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="sign-btn station default"
                  style="width:112px!important"
                  @click="checkBatchSingUser"
                >批量签署合同</el-button>
                <el-popover
                  class="sign_tip_item mg_l"
                  placement="top-start"
                  title=""
                  width="300"
                  trigger="hover">
                  <div class="sign_tip_div">
                    员工必须在伯乐中有对应的入职邀约才可下发合同，邀约需满足如下条件：<br/>
                    1.手机号一致<br/>
                    2.邀约职位绑定SaaS项目一致<br/>
                    3.邀约状态需要入职或入职后状态<br/>
                  </div>
                  <i  slot="reference" class="el-icon-warning id-no-err"></i>
                </el-popover>
              </template>
              <template v-if="project_type == 3||project_type == 7">
                <el-button
                  v-if="isdisabled2"
                  type="primary"
                  :disabled="true"
                  class="sign-btn station disabled"
                  style="width:112px!important"
                >上社保</el-button>
                <el-button
                  v-else
                  type="primary"
                  class="sign-btn station default"
                  style="width:112px!important"
                  @click="goSocialSecurity"
                >上社保</el-button>
              </template>
            </el-form-item>
          </div>
          <div class="someTips">
            <div class="ssText" v-if="project_type == 3||project_type == 7">
              有{{addition_amount}}个员工的社保待增员，有{{reduce_amount}}个员工的社保待减员
            </div>
            <div class="buttons" v-if="!admins.groupLeaderFlag">
              <div
                class="btn-item"
                @click="goSocialSecurityBanch"
                v-if="project_type == 3||project_type == 7"
              >
                <i class="export-icon"></i>
                <el-button type="text">批量上社保</el-button>
              </div>
              <div
                class="btn-item addMember"
                @click="addMember('add')"
                v-if="admins.addMemberPre == true && !admins.AdminUserFlag"
              >
                <i class="add_icon"></i>
                <el-button type="text">添加人员</el-button>
              </div>
              <div
                class="btn-item inviMember"
                @click="inviteToJoin"
                v-if="admins.inviMemberPre == true && !admins.AdminUserFlag"
              >
                <i class="invite_icon"></i>
                <el-button type="text">邀请加入</el-button>
              </div>
              <div
                class="btn-item inviMember"
                @click="renewQRcode"
                v-if="isShowRenewQRcode"
              >
                <i class="invite_icon"></i>
                <el-button type="text">合同续签码</el-button>
              </div>
              <div class="btn-item import" @click="mbImport" v-if="admins.importMemberPre == true && !admins.AdminUserFlag">
                  <i class="import-icon"></i>
                  <el-button type="text">批量导入</el-button>
              </div>
              <div
                class="btn-item export"
                @click="exportMemberList"
                v-if="admins.exportMemberPre == true"
              >
                <i class="export-icon"></i>
                <el-button type="text">导出</el-button>
              </div>
              <div
                class="btn-item"
                style="margin: 0 0 0 10px"
                @click="showAllExportList"
              >
                <i class="export-icon"></i>
                <el-button type="text">查看导出列表</el-button>
              </div>
            </div>
          </div>
        </el-form>
      </div>
      <!-- 人员管理表单 -->
      <div class="from-member">
        <el-table
          :data="tableData.user_info.user_list"
          tooltip-effect="dark"
          style="width: 100%"
          border
          :height="winHeight"
          @cell-click="getUserInfo"
          @header-click="clickMore"
          v-loading.body="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="!admins.groupLeaderFlag"
            type="selection"
            className="noclick"
            fixed
            width="55"
          >
          </el-table-column>
          <el-table-column
            label="头像/姓名"
            show-overflow-tooltip
            label-class-name="border"
            width="130"
          >
            <template slot-scope="scope">
              <span class="user-name">
                <img
                  v-if="scope.row.logo"
                  :src="scope.row.logo"
                  class="user-img"
                  alt=""
                >
                <img
                  v-else
                  src="../assets/imgs/shareIcon/default_img.png"
                  class="user-img"
                  alt=""
                >
                {{ scope.row.real_name }}
              </span>
              <!--  <img v-if="scope.row.logo" :src="scope.row.logo" class="user-img" alt="">
                        <img v-else src="../assets/imgs/shareIcon/default_img.png" class="user-img" alt="">
                        <span class="user-name"></span> -->
            </template>
          </el-table-column>
          <el-table-column
            label="人员来源"
            label-class-name="border"
            min-width="120"
            v-if="is_nx_project"
          >
            <template slot-scope="scope">
              {{scope.row.worker_source}}
            </template>
          </el-table-column>
          <el-table-column
            label="性别"
            label-class-name="border"
            min-width="80"
          >
            <template slot-scope="scope">
              <el-icon name="gender"></el-icon>
              <span v-if="scope.row.gender == 1">男</span>
              <span v-if="scope.row.gender == 2">女</span>
            </template>
          </el-table-column>
          <el-table-column
            label="手机号"
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <el-icon name="mobile"></el-icon>
              <el-popover
                placement="top"
                title=""
                width="150"
                trigger="hover">
                <span style="margin-left:35px">{{scope.row.mobile}}</span>
                <span slot="reference">{{scope.row.mobile.substr(0,3)+"****"+scope.row.mobile.substr(7)}}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            label="身份证号"
            label-class-name="border"
            min-width="150"
          >
            <template slot-scope="scope">
              <el-icon name="idnumber"></el-icon>
              <el-popover
                placement="top"
                title=""
                width="150"
                trigger="hover">
                <span style="margin-left:10px">{{scope.row.idnumber}}</span>
                <span slot="reference">{{scope.row.idnumber.substr(0,3)+"****"+scope.row.idnumber.substr(14)}}</span>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column
            label="角色"
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <el-icon name="identity"></el-icon>
              <span>{{ scope.row.identity_str }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="所属小组"
            show-overflow-tooltip
            label-class-name="border"
            min-width="150"
          >
            <template slot-scope="scope">
              <el-icon name="group"></el-icon>
              <span>{{ scope.row.group_name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="所属供应商"
            show-overflow-tooltip
            label-class-name="border"
            v-if="is_open_supplier == 1 ? true : false"
            min-width="150"
          >
            <template slot-scope="scope">
              <el-icon name="group"></el-icon>
              <span>{{ scope.row.supplier_name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="维护人"
            label-class-name="border"
            min-width="120"
          >
            <template slot-scope="scope">
              <el-icon name="identity"></el-icon>
              <span>{{ scope.row.visit_user_name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-for="i in showStationName"
            :key="i"
            label="岗位"
            show-overflow-tooltip
            label-class-name="border"
            min-width="150"
          >
            <template slot-scope="scope">
              <el-icon name="group"></el-icon>
              <span>{{ scope.row.station_name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="入职日期"
            show-overflow-tooltip
            label-class-name="border"
            min-width="150"
          >
            <template slot-scope="scope">
              <el-icon name="entry_date"></el-icon>
              <span>{{ scope.row.entry_date }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="showLeaveDate"
            label="离职日期"
            show-overflow-tooltip
            label-class-name="border"
            min-width="150"
          >
            <template slot-scope="scope">
              <el-icon name="leave_date"></el-icon>
              <span>{{ scope.row.leave_date }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-for="i in showProrocolStatus"
            :key="i"
            label="合同"
            label-class-name="border"
            min-width="100"
          >
            <template slot-scope="scope">
              <el-tag
                type="gray"
                v-if="scope.row.protocol_status == 0"
              >签订中</el-tag>
              <el-tag
                type="success"
                v-if="scope.row.protocol_status == 1"
              >已签订</el-tag>
              <el-tag
                type="danger"
                v-if="scope.row.protocol_status == -1"
              >未签订</el-tag>
              <el-tag
                type="danger"
                v-if="scope.row.protocol_status == 4"
              >已过期</el-tag>
              <el-tag
                type="info"
                v-if="scope.row.protocol_status == 5"
              >未下发</el-tag>
              <el-popover  v-if="scope.row.protocol_status == 5"
                class="sign_tip_item"
                placement="top-start"
                title=""
                width="300"
                trigger="hover">
                <div class="sign_tip_div">
                  员工必须在伯乐中有对应的入职邀约才可下发合同，邀约需满足如下条件：<br/>
                  1.手机号一致<br/>
                  2.邀约职位绑定SaaS项目一致<br/>
                  3.邀约状态需要入职或入职后状态<br/>
                </div>
                <i  slot="reference" class="el-icon-warning id-no-err"></i>
              </el-popover>
            </template>
          </el-table-column>
          <!-- <el-table-column
            label="社保状态"
            show-overflow-tooltip
            label-class-name="border"
            min-width="150"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.leave_date || 'zzzz' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="公积金状态"
            show-overflow-tooltip
            label-class-name="border"
            min-width="150"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.leave_date || 'zzzz' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="社保供应商"
            show-overflow-tooltip
            label-class-name="border"
            min-width="150"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.leave_date || 'zzzz' }}</span>
            </template>
          </el-table-column> -->
          <el-table-column
            label=""
            id="9999"
            fixed="right"
            label-class-name="more"
            class-name="border-left"
            width="32"
          >
          </el-table-column>
          <div v-for="item in tableData.header.show_custom_field" :key="item.id">
            <el-table-column
              :label="item.show_text"
              show-overflow-tooltip
              min-width="150"
              label-class-name="border"
            >
              <template slot-scope="scope">
                <template v-if="item.field_key === 'gender'">
                  <span v-if="scope.row[item.field_key] == 1">男</span>
                  <span v-if="scope.row[item.field_key] == 2">女</span>
                  <span v-if="scope.row[item.field_key] == 0"></span>
                </template>
                <template v-else>
                  <span>{{ scope.row[item.field_key] }}</span>
                </template>
              </template>
            </el-table-column>
          </div>
        </el-table><!-- v-if="isshow"-->
        <div
          class="select-list"
          @click.stop
          id="selectList"
          v-if="isshow"
        >
          <div class="select-cont">
            <el-form>
              <template v-for="(i,index) in tableData.header.custom_field">
                <el-checkbox
                  :checked="i.is_selected == 1 ? true : false "
                  v-model="i.is_selected"
                  :label="i.show_text"
                  true-label="1"
                  false-label="0"
                  :key="index"
                ></el-checkbox>
              </template>
            </el-form>
          </div>
          <div class="seach-foot">
            <el-button
              type="primary"
              class="confirm"
              @click="selConfirm"
            >确 定</el-button>
          </div>
        </div>
      </div>
      <!-- 分页组件 -->
      <div
        class="page"
        v-if="tableData.user_info.total_page != 0"
      >
        <div class="block">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentPageChange"
            :current-page.sync="currentPage"
            :page-size="20"
            layout="total, prev, pager, next"
            :page-count="tableData.user_info.total_page"
            :total="tableData.user_info.total_num"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <!-- 弹窗————批量导入 -->
    <div class="dialog-import">
      <el-dialog
        title="批量导入"
        :visible.sync="dialogImport"
        @close="cancelImport('ruleForm')"
        size="tiny"
      >
        <div class="title">
          <span>按照标准模板导入人员</span>
          <a
            href="javascript:;"
            @click="importExel"
          >下载模板</a>
        </div>
        <div
          class="myform"
          v-loading.body="loadingImport"
        >
          <el-form
            :model="ruleForm"
            :rules="rules"
            method="POST"
            ref="ruleForm"
            class="demo-ruleForm"
          >
            <el-form-item
              label="文件中的成员将被导入至:"
              prop="importValue"
              label-position="top"
            >
              <el-select
                v-model="ruleForm.importValue"
                filterable
                placeholder="请选择活动区域"
                class="mystatus"
              >
                <el-option
                  v-for="item in allGroupList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <h4>上传要导入的excel：</h4>
            <div class="upload-box">
              <form
                action=""
                id="upfile"
                enctype="multipart/form-data"
              >
                <a
                  href="javascript:;"
                  class="file"
                  :class="{'disabled_file':file_text}"
                >点击上传
                  <input
                    type="file"
                    name=""
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    @change="onChange"
                    id="upfile1"
                    :disabled="file_text ? true : false"
                  >
                </a>
              </form>
              <p
                class="file_text"
                v-if="file_text"
              ><i class="file_icon"></i>{{file_text}}<i
                  class="file_close"
                  @click="fileClose"
                ></i></p>
              <div
                style="width:340px;"
                v-if="file_speed"
              >
                <div class="speed-div">
                  <span :style="'width:'+speed+'%'"></span>
                </div>
              </div>

            </div>
          </el-form>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            @click="cancelImport('ruleForm')"
            class="btn1"
          >取 消</el-button>
          <el-button
            type="primary"
            @click="submitImport('ruleForm')"
            class="btn2"
          >导 入</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 弹窗————添加人员 -->
    <div class="dialog-addmember">
      <el-dialog
        :title="addmemberTitle"
        :visible.sync="dialogAddMembe"
        @close="resetFormMember('ruleForm')"
        size="small"
      >
        <div
          class="myformAdd"
          id="asd"
        >
          <el-form
            :model="ruleForm"
            :rules="rules"
            ref="ruleForm"
            label-width="90px"
            class="demo-ruleForm"
          >
            <el-form-item
              label="手机号"
              prop="mobile"
            >
              <el-input
                v-if="ruleForm.disabled && ruleForm.disabled == 1"
                :disabled="true"
                v-model="ruleForm.mobile"
                @blur="inputBlur"
                placeholder="请输入"
              ></el-input>
              <el-input
                v-else
                v-model="ruleForm.mobile"
                @blur="inputBlur"
                placeholder="请输入"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="姓名"
              prop="real_name"
            >
              <el-input
                v-model="ruleForm.real_name"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1||ruleForm.real_name_auth==1"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="设置角色"
              prop="identity"
            >
              <el-select
                v-model="ruleForm.identity == 1 ? '超级管理员' : ruleForm.identity"
                :disabled="ruleForm.identity == 1"
                placeholder="请选择"
                class="mystatus"
                @change="identityChangeFn"
              >
                <el-option
                  v-for="item in roleArr"
                  :key="item.identity_id"
                  :label="item.identity_name"
                  :value="item.identity_id"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="所属小组"
              prop="group_id"
            >
              <el-select
                v-model="ruleForm.group_id"
                filterable
                placeholder="请选择"
                prop="group_id"
                class="mystatus"
                :disabled="ruleForm.identity == 1"
              >
                <el-option
                  v-for="item in allGroupList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="性别"
              class="gender"
              v-show="!isadd"
            >
              <el-select
                v-model="ruleForm.gender"
                placeholder="请选择"
                :disabled="ruleForm.identity == 1||ruleForm.real_name_auth==1"
                class="mystatus"
              >
                <el-option
                  label="男"
                  value="1"
                ></el-option>
                <el-option
                  label="女"
                  value="2"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="身份证号"
              class="IDNumber"
              id="sfz"
              v-show="!isadd"
            >
              <el-input
                v-model="ruleForm.idnumber"
                :class="{'error_idnumber':idnumberReg}"
                :disabled="ruleForm.identity == 1||ruleForm.real_name_auth==1"
                placeholder="请输入"
              ></el-input>
              <span
                v-if="idnumberReg&&ruleForm.idnumber"
                class="error_idnumber_text"
              >请输入正确的身份证号码</span>
            </el-form-item>
            <el-form-item
              label="身份证号"
              class="IDNumber"
              id="sfz"
              prop="idnumber"
              v-if="isadd&&ishas == 1&&ruleForm.identity != 2"
            >
              <el-input
                v-model="ruleForm.idnumber"
                :class="{'error_idnumber':idnumberReg}"
                :disabled="ruleForm.identity == 1||ruleForm.real_name_auth==1"
                placeholder="请输入"
              ></el-input>
              <span
                v-if="idnumberReg&&ruleForm.idnumber"
                class="error_idnumber_text"
              >请输入正确的身份证号码</span>
            </el-form-item>
            <!-- <el-form-item label="即时配送">
                        <el-switch on-text="" off-text="" v-model="ruleForm.station_value"></el-switch>
                      </el-form-item> -->
            <el-form-item
              label="设为供应商"
              class="station_style"
              v-show="ruleForm.identity == 3 && is_open_supplier == 1 ? true : false"
            >
              <el-switch
                on-text=""
                off-text=""
                on-value="1"
                off-value="0"
                on-color="#6097e4"
                off-color="#c0ccda"
                v-model="ruleForm.station_value"
              >
              </el-switch>
            </el-form-item>

            <!-- <template v-if="!isadd"> -->
            <el-form-item
              v-show="!isadd"
              label="身高(cm)"
              class="gender"
              id="sg"
            >
              <el-input
                v-model="ruleForm.height"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
                :class="{'error_idnumber':heightReg}"
              ></el-input>
              <span
                v-if="heightReg"
                class="error_idnumber_text"
              >请输入数字</span>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="体重(kg)"
              class="gender"
              prop="weight"
              id="tz"
            >
              <el-input
                v-model="ruleForm.weight"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
                :class="{'error_idnumber':weightReg}"
              ></el-input>
              <span
                v-if="weightReg"
                class="error_idnumber_text"
              >请输入数字</span>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="出生年月"
              class="IDNumber"
            >
              <el-date-picker
                v-model="ruleForm.birthday"
                type="month"
                style="width:251px;"
                :editable="false"
                :disabled="ruleForm.identity == 1||ruleForm.real_name_auth==1"
                placeholder="选择日期"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="居住地点"
              class="IDNumber"
            >
              <el-cascader
                class="my-address"
                :options="options"
                v-model="selectedOptions"
                :disabled="ruleForm.identity == 1"
                style="width:252px;"
                placeholder="选择地点"
                change-on-select
              ></el-cascader>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="详细地址"
              class="IDNumber"
            >
              <el-input
                v-model="ruleForm.datail_address"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="学历"
              class="gender"
            >
              <el-select
                v-model="ruleForm.degree"
                :disabled="ruleForm.identity == 1"
                placeholder="请选择"
                class="mystatus"
              >
                <el-option
                  v-for="item in degreeArr"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="学校"
              class="gender"
            >
              <el-input
                v-model="ruleForm.school"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="专业"
              class="gender"
            >
              <el-input
                v-model="ruleForm.specialty"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="毕业时间"
              class="IDNumber"
            >
              <el-date-picker
                v-model="ruleForm.graduate_date"
                type="month"
                :editable="false"
                style="width:251px;"
                :disabled="ruleForm.identity == 1"
                placeholder="选择日期"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              label="开户行全称"
              class="bankUserName"
            >
              <el-input
                v-model="ruleForm.bank_info"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="银行卡号"
              class="IDNumber"
            >
              <el-input
                v-model="ruleForm.bank_card_number"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="银行卡开户名"
              class="bankUserName"
            >
              <el-input
                v-model="ruleForm.bank"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="入职日期"
              class="IDNumber"
            >
              <el-date-picker
                v-model="ruleForm.entry_date"
                type="date"
                :editable="false"
                style="width:251px;"
                :disabled="ruleForm.identity == 1"
                placeholder="选择日期"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              label="离职日期"
              class="IDNumber"
              v-show="showLeaveDate&&!isadd"
            >
              <el-date-picker
                v-model="ruleForm.leave_date"
                type="date"
                :editable="false"
                style="width:251px;"
                :disabled="ruleForm.identity == 1"
                placeholder="选择日期"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="人员编号"
              class="IDNumber"
            >
              <el-input
                v-model="ruleForm.personnel_number"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="紧急联系人姓名"
              class="IDNumber"
            >
              <el-input
                v-model="ruleForm.emergency_contact_person"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="紧急联系人手机号"
              class="IDNumber"
            >
              <el-input
                v-model="ruleForm.personnel_number"
                placeholder="请输入"
                :disabled="ruleForm.identity == 1"
              ></el-input>
            </el-form-item>
            <el-form-item
              v-show="!isadd"
              label="备注信息"
              class="desc"
            >
              <el-input
                type="textarea"
                placeholder="请输入"
                :disabled="ruleForm.project_remark.length == 1000 ? true : false || ruleForm.identity == 1"
                v-model="ruleForm.project_remark"
              ></el-input>
            </el-form-item>
            <el-form-item v-show="!isadd">
              <div class="size-num">
                <span>{{ruleForm.project_remark.length}}/1000</span>
              </div>
            </el-form-item>
            <el-form-item label="身份证照片" v-if="false">
              <elUpload :width="255" :limitCount="2" ref="uploadRef" :elTips="elTips" @getNewFileListFun="getNewFileListFun2" :fileListValue="contractFile2"></elUpload>  
            </el-form-item>
            <template v-if="customFields.length>0">
              <el-form-item :label="item.name" v-for="(item, number) in customFields" :key="item.id">
                <component 
                  :is="item.type" 
                  :item="item" 
                  :number="number"
                  @changeComponent="changeComponentHandle">
                </component>
              </el-form-item>
            </template>
            <!-- </template> -->
          </el-form>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            @click="resetFormMember('ruleForm')"
            class="btn1"
          >取 消</el-button>
          <el-button
            type="success"
            @click="handleDialogCustomField('open')"
            class="btn2"
          >自定义选项 </el-button>
          <el-button
            type="primary"
            @click="submitFormMember('ruleForm')"
            class="btn2"
          >确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 弹窗————自定义字段 -->
    <div class="dialog-addmember">
      <el-dialog title="自定义选项" :visible.sync="dialogCustomField">
        <div class="myformCus">
          <el-form :model="customFieldForm" label-width="90px">
            <el-form-item label="选项名称">
              <el-input v-model="customFieldForm.name" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="选项类型">
              <el-select v-model="customFieldForm.region" placeholder="请选择字段类型">
                <el-option label="文本" value="SingleText"></el-option>
                <el-option label="图片" value="Imageview"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleDialogCustomField('cancel')">取 消</el-button>
          <el-button type="primary" @click="submitCustomField">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <!-- 弹窗————个人详细信息 -->
    <div class="dialog-info dialog-addmember">
      <el-dialog
        title="详细信息"
        :visible.sync="dialogInfo"
        @close="closeMemberInfoDialog"
        size="tiny"
      >
        <div
          class="myform"
          v-loading.body="loadingInfo"
        >
          <el-form
            label-width="84px"
            class="demo-ruleForm"
            :rules="rules"
          >
            <el-form-item
              label="手机号"
              v-if="userInfoForm.mobile"
              prop="mobile"
            >
              <p>{{userInfoForm.mobile}}</p>
            </el-form-item>
            <el-form-item
              label="姓名"
              v-if="userInfoForm.real_name"
              prop="real_name"
            >
              <p>{{userInfoForm.real_name}}</p>
            </el-form-item>
            <el-form-item
              label="设置角色"
              v-if="userInfoForm.identity_str"
              prop="identity"
            >
              <p>{{userInfoForm.identity_str}}</p>
            </el-form-item>
            <el-form-item
              label="所属小组"
              v-if="userInfoForm.group_name"
              prop="group_id"
            >
              <p>{{userInfoForm.group_name}}</p>
            </el-form-item>
            <el-form-item
              label="性别"
              class="gender"
              v-if="userInfoForm.gender"
            >
              <p>{{userInfoForm.gender}}</p>
            </el-form-item>
            <el-form-item
              label="身份证号"
              class="IDNumber"
              v-if="userInfoForm.idnumber"
            >
              <p>{{userInfoForm.idnumber}}</p>
            </el-form-item>
            <el-form-item
              label="身高(cm)"
              class="gender"
              v-if="userInfoForm.height && userInfoForm.height != 0"
            >
              <p>{{userInfoForm.height}}</p>
            </el-form-item>
            <el-form-item
              label="体重(kg)"
              class="gender"
              v-if="userInfoForm.weight && userInfoForm.weight != 0"
            >
              <p>{{userInfoForm.weight}}</p>
            </el-form-item>
            <el-form-item
              label="出生年月"
              class="gender"
              v-if="userInfoForm.birthday && userInfoForm.birthday != 0"
            >
              <p>{{userInfoForm.birthday}}</p>
            </el-form-item>
            <el-form-item
              label="居住地点"
              class="IDNumber"
              v-if="userInfoForm.address"
            >
              <p>{{userInfoForm.address}}</p>
            </el-form-item>
            <el-form-item
              label="详细地址"
              class="IDNumber"
              v-if="userInfoForm.datail_address"
            >
              <p>{{userInfoForm.datail_address}}</p>
            </el-form-item>
            <el-form-item
              label="学历"
              class="gender"
              v-if="userInfoForm.degree && userInfoForm.degree != 0"
            >
              <p>{{userInfoForm.degree_name}}</p>
            </el-form-item>
            <el-form-item
              label="学校"
              class="gender"
              v-if="userInfoForm.school"
            >
              <p>{{userInfoForm.school}}</p>
            </el-form-item>
            <el-form-item
              label="专业"
              class="gender"
              v-if="userInfoForm.specialty"
            >
              <p>{{userInfoForm.specialty}}</p>
            </el-form-item>
            <el-form-item
              label="毕业时间"
              class="IDNumber"
              v-if="userInfoForm.graduate_date && userInfoForm.graduate_date != 0"
            >
              <p>{{userInfoForm.graduate_date}}</p>
            </el-form-item>
            <el-form-item
              label="银行卡开户名"
              class="bankUserName"
              v-if="userInfoForm.bank"
            >
              <p style="margin-top: 10px;">{{userInfoForm.bank}}</p>
            </el-form-item>
            <el-form-item
              label="开户行全称"
              class="bankUserName"
              v-if="userInfoForm.bank_info"
            >
              <p style="margin-top: 10px;">{{userInfoForm.bank_info}}</p>
            </el-form-item>

            <el-form-item
              label="银行卡号"
              class="IDNumber"
              v-if="userInfoForm.bank_card_number && userInfoForm.bank_card_number != 0"
            >
              <p>{{userInfoForm.bank_card_number}}</p>
            </el-form-item>
            <el-form-item
              label="入职日期"
              class="IDNumber"
              v-if="userInfoForm.entry_date && userInfoForm.entry_date != 0"
            >
              <p>{{userInfoForm.entry_date}}</p>
            </el-form-item>
            <el-form-item
              label="离职日期"
              class="IDNumber"
              v-if="userInfoForm.leave_date && userInfoForm.leave_date != 0 && showLeaveDate"
            >
              <p>{{userInfoForm.leave_date}}</p>
            </el-form-item>
            <el-form-item
              label="人员编号"
              class="IDNumber"
              v-if="userInfoForm.personnel_number"
            >
              <p>{{userInfoForm.personnel_number}}</p>
            </el-form-item>
            <el-form-item
              label="备注信息"
              class="desc"
              v-if="userInfoForm.remark"
            >
              <p>{{userInfoForm.remark}}</p>
            </el-form-item>
          </el-form>
        </div>
        <div
          v-if="!admins.editPre "
          style="height:24px;"
        ></div>
        <span
          slot="footer"
          class="dialog-footer"
          v-if="admins.editPre && admins.edit_Pre"
        >
          <el-button
            @click="reEmploy"
            class="btn1"
            v-if="admins.editPre && fromData.statusValue == -1"
          >重新录用</el-button>
          <el-button
            @click="resetQuit('string')"
            class="btn1"
            v-if="admins.editPre && fromData.statusValue != -1"
          >标记为离职</el-button>
          <el-button
            type="primary"
            @click="updateMemberInfo"
            class="btn2"
            v-if="admins.editPre"
          >修 改</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 弹窗————小组移动选择 -->
    <div class="dialog-group-select">
      <el-dialog
        title="移动到"
        class="size-dialog"
        :visible.sync="dialogGroupSelect"
        size="tiny"
      >
        <h3>选择小组：</h3>
        <div class="selectForm">
          <div class="all_search">
            <i class="el-icon-search"></i>
            <el-input
              :icon='filterText?"circle-cross":""'
              :on-icon-click="clearFilterText"
              placeholder="搜索小组"
              v-model="filterText"
            >
            </el-input>
          </div>
          <div class="all_main">
            <el-tree
              ref="all_groups"
              node-key="id"
              :highlight-current='true'
              :check-strictly="true"
              :data="all_groups"
              :props="defaultProps"
              @node-click="handleNodeClick"
              :filter-node-method="filterNode"
              :default-expand-all="true"
            >
            </el-tree>
          </div>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-popover
            ref="popover"
            placement="top"
            width="160"
            v-model="visible2"
          >
            <p>是否确定移动到该小组？</p>
            <div style="text-align: right; margin: 0">
              <el-button
                size="mini"
                type="text"
                @click="visible2 = false"
              >取消</el-button>
              <el-button
                type="primary"
                size="mini"
                @click="moveGroupConfirmBtn"
              >确定</el-button>
            </div>
          </el-popover>

          <el-button
            class="btn1"
            @click="moveGroupCancelBtn"
          >取 消</el-button>
          <el-button
            class="btn2"
            type="primary"
            v-popover:popover
            v-show="currSelectMoveGroup"
          >确 定</el-button>
          <el-button
            class="btn2"
            type="primary"
            @click="alert"
            v-show="!currSelectMoveGroup"
          >确 定</el-button>
        </span>

      </el-dialog>
    </div>

    <!-- 弹窗————调整关系 -->
    <div class="dialog-group-select">
      <el-dialog
        title="调整供应商关系"
        class="size-dialog"
        @close="changeStationGroupCancelBtn"
        :visible.sync="dialogStationSelect"
        size="tiny"
      >
        <h3>选择供应商：</h3>
        <div
          class="station"
          style="position: relative;"
        >
          <el-select
            :class="{'error-tip':isError}"
            v-model="currSelectStationGroup"
            filterable
            placeholder="请选择"
            style="width:100%;height:150px;"
            @change="onchangeStation"
          >
            <el-option
              v-for="item in all_supplier"
              :key="item.baxian_user_id"
              :label="item.real_name + item.mobile"
              :value="item.baxian_user_id"
            >
              <span style="float: left">{{ item.real_name + item.mobile }}</span>
              <span
                style="float: right;color: #8492a6; font-size: 13px"
                v-if="item.supper && item.supper == 'yes'"
              >超级管理员</span>
            </el-option>
          </el-select>
          <span
            v-if="isError"
            class="error-text"
          >请选择供应商</span>
        </div>
        <p style="margin-bottom: 10px;color: #8492a6;">把用户调整到超管名下表示该用户与供应商的关系解除</p>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="btn1"
            @click="changeStationGroupCancelBtn"
          >取 消</el-button>
          <el-button
            class="btn2"
            type="primary"
            @click="commitChangeStatinGroup"
          >确 定</el-button>
        </span>

      </el-dialog>
    </div>

    <!-- 添加成员——生成二维码弹窗 -->
    <div class="dialog-invit">
      <el-dialog
        title="供应商二维码"
        :visible.sync="dialogInvit"
        size="tiny"
      >
        <div class="dialogInvitform">
          <div class="ewm">
            <dl>
              <dt>
                <canvas id="canvas"></canvas>
              </dt>
              <dd>请保存，用于供应商邀请人员</dd>
            </dl>
          </div>
        </div>
      </el-dialog>
    </div>

    <!-- 弹层————设置维护人 -->
    <div class="dialog-group-select">
      <el-dialog
        title="设置维护人"
        class="size-dialog"
        :visible.sync="setMaintainerDialog"
        size="small"
      >
        <div class="maintainer-box">
          <el-row>
            <el-col :span="4">
              <div style="line-height:36px;text-align:center;">维护人</div>
            </el-col>
            <el-col :span="20">
              <el-autocomplete
                class="maintainerInput"
                v-model="currentMaintainer"
                :fetch-suggestions="querySearchMaintainer"
                placeholder="请输入维护人邮箱"
                @select="handleSelectMaintainer"
              ></el-autocomplete>
            </el-col>
          </el-row>
        </div>
        <el-row>
          <div class="maintainerTip">
            设置为维护人后，该员工后续的回访跟进需要由该维护人负责
          </div>
        </el-row>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="btn1"
            @click="handleCloseMaintainerDialog"
          >取 消</el-button>
          <el-button
            class="btn2"
            type="primary"
            @click="commitSetMaintainer"
          >确 定</el-button>
        </span>

      </el-dialog>
    </div>
    <!-- 弹层————选择岗位城市 -->
    <div class="dialog-group-select">
      <el-dialog
        title="提示"
        class="size-dialog"
        @close="cancelBtn"
        :visible.sync="dialogStationCitySelect"
        size="tiny"
      >
        <h3>选择岗位：</h3>
        <div
          class="station"
          style="position: relative;"
        >
          <el-select
            v-model="currSelectStation"
            filterable
            placeholder="请选择"
            style="width:100%;height:150px;"
          >
            <el-option
              v-for="item in stationArr"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="btn1"
            @click="cancelBtn"
          >取 消</el-button>
          <el-button
            class="btn2"
            type="primary"
            @click="commitChangeStatinCity"
          >确 定</el-button>
        </span>

      </el-dialog>
    </div>

    <!-- 弹层————设置投保职位 -->
    <div class="dialog-group-select">
      <el-dialog
        title="提示"
        class="size-dialog"
        @close="cancelBtn2"
        :visible.sync="dialogInsureJobsSelect"
        size="tiny"
      >
        <h3>选择投保职位：</h3>
        <div
          class="station"
          style="position: relative;"
        >
          <el-select
            v-model="insureJobsValue"
            filterable
            placeholder="请选择"
            style="width:100%;height:50px;"
          >
            <el-option
              v-for="item in insureJobs"
              :key="item.id"
              :label="item.post_title"
              :value="item.post_code"
            >
            </el-option>
          </el-select>
          <div class="personnelScopeWrap">
            <p class="ps_title">选择设置人员范围：</p>
            <el-radio-group v-model="insurance_scope">
              <p class="ps_raio"><el-radio :label="1">设置当前勾选的人员</el-radio></p>
              <p class="ps_raio"><el-radio :label="2" :disabled="isSuperAdmin!==3">设置全部无投保职位的人员</el-radio></p>
              <p class="ps_raio"><el-radio :label="3" :disabled="isSuperAdmin!==3">设置全部人员（将更新项目下所有人员的投保职位）</el-radio></p>
            </el-radio-group>
            <div class="ps_tips">
              <p>注：</p>
              <p>1.投保职位用于泰康雇主责任险投保，若项目投保渠道为泰康则人员必须设置投保职位才可正常投保</p>
              <p>2.只有超级管理员才可选择设置全部无投保人员或设置全部人员</p>
            </div>
          </div>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="btn1"
            @click="cancelBtn2"
          >取 消</el-button>
          <el-button
            class="btn2"
            type="primary"
            @click="insureJobsSure"
          >确 定</el-button>
        </span>

      </el-dialog>
    </div>

    <!-- 弹层————批量设置离职 -->
    <div class="leave_dialog">
      <el-dialog
        title="标记离职"
        :visible.sync="dialogLeave"
        @close="canceldialogLeave"
      >
        <div class="dialog_main">
          <div class="leave_item">
            <div class="item_left">离职日期</div>
            <div class="item_right">
              <el-date-picker
                v-model="leave_data.leave_date"
                style="width:268px;"
                :editable="false"
                :clearable="false"
                type="date"
                placeholder="选择日期"
              >
              </el-date-picker>
            </div>
          </div>
          <div class="leave_item">
            <div class="item_left">离职原因</div>
            <div class="item_right">
              <el-radio-group
                v-model="leave_data.change_radio"
                @change="changeLeaveTpye"
              >
                <el-radio-button
                  :label="o.leave_type"
                  v-for="o in leave_data.reasonArr"
                  :key="o.id"
                  :class="{'my-margin':o.leave_type === '被动离职'}"
                ></el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div
            class="leave_item"
            v-if="leave_data.change_radio"
          >
            <div class="item_left">详细原因</div>
            <div
              class="item_right"
              style="width:265px;height:auto;"
            >
              <template v-if="leave_data.currSelectLeavelist.length">
                <el-radio-group v-model="leave_data.detail_reason">
                  <el-radio-button
                    :label="i.reason"
                    v-for="i in leave_data.currSelectLeavelist"
                    :key="i.id"
                    class="my-radio-button"
                  ></el-radio-button>
                </el-radio-group>
              </template>
              <template v-else>
                <el-input
                  type="textarea"
                  style="width:268px;"
                  :rows="3"
                  resize='none'
                  placeholder="请输入"
                  v-model="leave_data.leave_reason"
                >
                </el-input>
              </template>
            </div>
          </div>
          <template v-if="project_type==3||project_type==7">
            <div class="leave_item" v-if="leave_data.change_radio&&leave_data.currSelectLeavelist.length">
              <div class="item_left">上传附件</div>
              <div class="item_right" style="width:255px;height:auto;line-height:36px">
                <elUpload :width="255" :limitCount="5" ref="uploadRef" :elTips="elTips" @getNewFileListFun="getNewFileListFun" :fileListValue="contractFile"></elUpload>
              </div>
            </div>
          </template>
        </div>
        <div class="dialog_foot">
          <div class="btns">
            <el-button @click="canceldialogLeave">取 消</el-button>
            <el-button
              type="primary"
              @click="postAjaxQuit"
            >确 定</el-button>
          </div>
        </div>
      </el-dialog>
    </div>

    <!-- 批量签署合同弹窗 -->
    <div class="protocol_dialog dialog-batch-protocol">
        <el-dialog title="批量签署合同" :visible.sync="dialogBatchProtocol" @close="resetForm('ruleForm2')">
            <div class="protocol-attention">注意：请确认批量签署合同员工的签署信息一致！</div>
            <div class="myform">
              <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-width="90px" class="demo-ruleForm">
                <el-form-item label="岗位城市" prop="id">
                  <el-select v-model="ruleForm2.id" @change="changeStationFn" placeholder="请选择" class="mystatus" filterable>
                    <el-option v-for="item in stationList" :key="item.id" :label="item.name" :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="生效日期" prop="start_date">
                  <el-date-picker v-model="ruleForm2.start_date" type="date" style="width:251px;" :editable="false" :clearable="false" :picker-options="startOptions" placeholder="选择日期">
                  </el-date-picker>
                </el-form-item>
                <el-form-item label="结束日期" prop="end_date">
                  <el-date-picker v-model="ruleForm2.end_date" type="date" style="width:251px;" :editable="false" :clearable="false" :picker-options="endOptions" placeholder="选择日期">
                  </el-date-picker>
                </el-form-item>
                <el-form-item label="试用期" prop="probation">
                  <el-input v-model="ruleForm2.probation" placeholder="请输入" style="width:209px;"></el-input>
                  <span style="float:right;font-family: 'PingFangSC-Regular';font-size: 14px;color: #8492A6;">个月</span>
                </el-form-item>
                <el-form-item label="门店" prop="store" v-if="is_show_shop">
                  <el-select v-model="ruleForm2.store" @change="changeStationFn" placeholder="请选择" class="mystatus" filterable>
                    <el-option v-for="item in storeList" :key="item.id" :label="item.company_name" :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="岗位" prop="jobStation" v-if="is_show_shop">
                  <el-select v-model="ruleForm2.jobStation" @change="changeStationFn" placeholder="请选择" class="mystatus" filterable>
                    <el-option v-for="item in jobStationList" :key="item.id" :label="item.company_name" :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>

            <span slot="footer" class="dialog-footer">
              <el-button @click="resetForm('ruleForm2')" class="btn1">取 消</el-button>
              <el-button type="primary" :disabled="submitDisabled" @click="submitProtocol('ruleForm2')" class="btn2">发 送</el-button>
            </span>
        </el-dialog>
    </div>
    <!-- 弹窗————合同续签码 -->
    <div class="dialog-addmember">
      <el-dialog
        :title="renewQRcodeTitle"
        :visible.sync="renewQRcodeDialog"
        size="tiny"
      >
      <div class="dialog-section">
        <div class="QRcode-container">
          <canvas id="QRcanvas"></canvas>
        </div>
        <el-button type="primary" @click="exportCanvasAsPNG('QRcanvas','续签码')"  class="QRcode-download">保存二维码</el-button>
      </div>
      </el-dialog>
    </div>
    <!-- 导出进度提示 -->
    <el-dialog
      title="导出提示"
      :visible.sync="progressDialog"
      size="tiny"
      :show-close="false"
      :close-on-click-modal="false"
      class="progressWrap">
      <!-- <div class="circleWrap">
        <el-progress type="circle" :percentage="percentage" v-if="percentage == 0"></el-progress>
        <el-progress type="circle" :percentage="percentage" v-if="percentage !== 0 && percentage !== 100"></el-progress>
        <el-progress type="circle" :percentage="percentage" status="success" v-if="percentage == 100"></el-progress>
      </div> -->
      <div class="progressMes" :class="[percentage == 100?'green':'']">{{progressInfo}}</div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sureClose" :disabled="canClosed">关 闭</el-button>
      </span>
    </el-dialog>
    <!-- 查看导出列表 -->
    <el-dialog title="导出列表" :visible.sync="dialogExportVisible" top="10vh" class="dialogSubAccount">
      <el-table :data="exportData">
        <el-table-column property="file_name" label="文件名称" width="350"></el-table-column>
        <el-table-column property="create_at" label="导出时间" width="160"></el-table-column>
        <el-table-column property="" label="操作" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="downLoadFile(scope.row.file_url)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination_wrap" slot="footer">
        <el-pagination
          background
          @current-change="export_handleCurrentChange"
          :current-page.sync="export_currentPage"
          :page-size="export_pageSize"
          layout="total, prev, pager, next"
          :total="export_total_num">
        </el-pagination>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import * as util from "../assets/js/util.js";
import GroupUtil from "../assets/js/GroupUtil.js";
import formFields from '../assets/js/formFields.js'
import Groupmgt from "@/components/common/Groupmgt";
import SingleText from '@/components/common/dynamicForm/SingleText'
import Imageview from '@/components/common/dynamicForm/Imageview'
import elUpload from "./ElUpload";
import SelectGroupMulti from "@/components/common/SelectGroupMulti";
import QRCode from "qrcode";
import {elUploadMixin} from "../mixins/elUploadMixin.js";
import mixinAll from '../mixins/searchMixin.js'
let mixinInstance = new mixinAll({
    list_type: 1
})

let $ = require("jquery");
let reg = /^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/;
let idnumberReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
let interval;
let numberReg = /^\d+(\.\d+)?$/;

export default {
  name: "memberAdmin",
  components: {
    Groupmgt,
    SelectGroupMulti,
    elUpload,
    SingleText,
    Imageview
  },
  mixins: [elUploadMixin, mixinInstance],
  data: function() {
    var phoneReg = (rule, value, callback) => {
      if (value) {
        if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(value)) {
          return callback(new Error("请输入正确的手机号"));
        }
      }
      if (!value) {
        return callback(new Error("请输入手机号"));
      } else {
        callback();
      }
    };
    var nameReg = (rule, value, callback) => {
      var nReg = /[^\u4E00-\u9FA5\·]/;
      if (value) {
        if (nReg.test(value)) {
          return callback(new Error("姓名不能包含特殊字符"));
        } else {
          callback();
        }
      }
      if (!value) {
        return callback(new Error("请输入姓名"));
      } else {
        callback();
      }
    };
    var roleReg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请选择角色"));
      } else {
        callback();
      }
    };
    var importGroupReg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请选择小组"));
      } else {
        callback();
      }
    };
    var importValueReg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请选择小组"));
      } else {
        callback();
      }
    };
    var probationReg = (rule, value, callback) => {
      if (value && numberReg.test(value)) {
        callback();
      } else {
        return callback(new Error('请输入试用期'));
      }
    };
    return {
      searchData: {},
      leave_data: {
        leave_date: new Date(),
        leave_reason: "",
        change_radio: "",
        detail_reason: "",
        reasonArr: [],
        currSelectLeavelist: []
      },
      admins: {
        removeMemberPre: false,
        deleteMemberPre: false,
        addMemberPre: false,
        inviMemberPre: false,
        creatGroupPre: false,
        project_auto_clean: false,
        exportMemberPre: false,
        importMemberPre: false,
        moveGroupPre: false,
        editPre: false,
        edit_Pre: false,
        changeStationPre: false,
        changeStationCityPre: false,
        changeProtocolStatusPre: false,
        groupLeaderFlag: false,
        AdminUserFlag: false
      },
      isError: false,
      dialogLeave: false, //标记离职弹窗
      dialogStationCitySelect: false,
      dialogInsureJobsSelect: false, // 设置投保职位
      dialogStationSelect: false,
      dialogInvit: false,
      setMaintainerDialog: false, // 设置维护人弹层是否展示
      is_open_supplier: 0,
      visible2: false,
      loadingImport: false,
      isshow: false, // 控制table--title 更多展示
      isdisabled1: true, // 操作--禁止移动状态
      isdisabled2: true, // 操作--禁止移动状态
      isdisabled3:true, //  操作--禁止删除状态
      dialogImport: false, //弹窗--批量导入
      dialogAddMembe: false, // 弹窗--添加人员
      dialogGroupSelect: false, //弹窗--移动小组
      dialogInfo: false, //弹窗--个人信息
      loading: false,
      loadingInfo: false,
      isadd: false, //判断当前操作是添加还是编辑
      idnumberReg: false,
      heightReg: false,
      weightReg: false,
      disabled_group: false,
      pream: 1,
      winHeight: "",
      team_id: "",
      project_id: "",
      curr_login_user_id: "",
      selected_groups: [],
      seachData: "",
      seachSupplierData: "",
      /*人员列表表格相关部分*/
      tableData: {
        // table表格数据
        header: {
          show_custom_field: [],
          custom_field: []
        },
        user_info: {
          user_list: [],
          total_num: "",
          total_page: ""
        }
      },
      page_no: 1,
      currentPage: 1, // 分页--当前显示页码
      currSelectMemberData: "", //复选框--当前选择的人员数据
      fromData: {
        // 关于from表单数据
        member: "", //人员搜索
        statusValue: 1, // 状态
        currSeachRester: "",
        stationCity: "", // 岗位-城市
        protocolStatus: "", // 合同状态
        filterProtocolDate: 0,
        supplierName: "",  // 供应商
        identity:'-1', //角色
        insurance_status: 7,  //社保状态
        fund_status: 7,  //公积金状态
        supplier_name: '',  //供应商名称
        source_from_value: -1  //人员来源
      },
      ss_status_arr: [
        {
          id: 0,
          text: "全部"
        },
        {
          id: 1,
          text: "待增员"
        },
        {
          id: 2,
          text: "增员中"
        },
        {
          id: 3,
          text: "参保中"
        },
        {
          id: 4,
          text: "已参保"
        },
        {
          id: 5,
          text: "减员中"
        },
        {
          id: 6,
          text: "已减员"
        },
      ],
      stationArr: [],
      insureJobs: [],
      insurance_scope: 1,
      restaurants: [],
      states: [],
      statusArr: [
        {
          id: -3,
          text: "全部"
        },
        {
          id: 1,
          text: "在职"
        },
        {
          id: -1,
          text: "离职"
        },
        {
          id: -2,
          text: "删除"
        }
      /*  {
          id: 0,
          text: "未激活"
        }*/
      ],
      source_from: [
        {
          id: -1,
          text: "不限"
        },
        {
          id: 1,
          text: "斗米招聘"
        },
        {
          id: 2,
          text: "挂靠"
        },
      ],
      import_exel: "",
      fileList3: [],
      file_text: "",
      speed: 60,
      file_speed: false,
      /*弹窗--添加人员相关部分*/
      addmemberTitle: "添加人员",
      ruleForm: {
        mobile: "",
        real_name: "",
        group_id: "",
        identity: "",
        birthday: "",
        gender: "",
        height: "",
        weight: "",
        idnumber: "",
        address: "",
        datail_address: "",
        school: "",
        personnel_number: "",
        graduate_date: "",
        entry_date: "",
        leave_date: "",
        degree: "",
        specialty: "",
        bank: "",
        bank_info: "",
        bank_card_number: "",
        project_remark: "",
        station_value: 0,
        importValue: "", //导出数据值
        emergency_contact_person:'',
      },
      rules: {
        mobile: [{ required: true, validator: phoneReg, trigger: "blur" }],
        real_name: [{ required: true, validator: nameReg, trigger: "change" }],
        group_id: [
          { required: true, message: "请选择所属小组", trigger: "change" }
        ],
        identity: [{ required: true, validator: roleReg, trigger: "change" }],
        idnumber: [
          { required: true, message: "请输入身份证号码", trigger: "change" }
        ],
        importGroup: [{ validator: importGroupReg, trigger: "change" }],
        importValue: [{ validator: importValueReg, trigger: "change" }]
      },
      degreeArr: [
        { id: 1, name: "初中及以下" },
        { id: 2, name: "高中" },
        { id: 3, name: "大专" },
        { id: 4, name: "本科" },
        { id: 5, name: "硕士" },
        { id: 6, name: "博士及以上" }
      ],
      memberOldInfo: "", // 存放添加人员时输入手机号，已注册过的人员自动带出数据信息
      select_group_id: "",
      allGroupList: [], //所有小组列表--select下拉框选择
      roleArr: [], // 所有角色列表
      /*弹窗————个人信息*/
      userInfoForm: {},
      /*弹窗————移动小组*/
      filterText: "", //移动小组--搜索检索关键字
      currSelectMoveGroup: "", //当前选择的移动小组
      all_groups: [], // 分组管理--tree树形小组数据
      defaultProps: {
        //分组管理--树形小组数据--默认值
        children: "children",
        label: "name"
      },
      selectedOptions: [],
      options: [],
      showLeaveDate: false,
      showStationName: [],
      showProrocolStatus: [],
      ishas: 0,
      all_supplier: [],
      currSelectStationGroup: "", //当前选择的供应商小组
      currSelectStation: "", //选择的城市岗位
      insureJobsValue: '',  // 选择投保职位的值
      seach_station_id: "",
      seach_station_city_id: "",
      user_list: [],
      currentMaintainer: "", // 设置维护人时的选中的维护人
      mgmt_user_id: "", //设置维护人时的选中的维护人ID
      showSetMaintainerBtn: false, // 是否展示 设置维护人按钮的标识
      project_type:0,  // 项目类型  3为全职  其他兼职
      dialogBatchProtocol:false, //批量签署合同弹窗
      stationList : [], //签约岗位城市
      storeList: [],
      jobStationList: [],
      submitDisabled: false,
      initProtocolForm:{
        id: '',
        city_id: '',
        city_name: '',
        station_id: '', //岗位
        show_id: '',
        station_name: '',
        start_date: new Date(),
        end_date: new Date(),
        probation: '', //试用期
        store: '',
        jobStation: '',
        wage_day: '', //发工资日期
      },
      ruleForm2: {

      },
      rules2: {
        id: [
          { required: true, message: '请选择岗位城市', trigger: 'change' }
        ],
        city_id: [
          { required: true, message: '请选择工作地点', trigger: 'change' }
        ],
        start_date: [
          { required: true, message: '请选择生效日期', type: 'object', trigger: 'change' }
        ],
        end_date: [
          { required: true, message: '请选择结束日期', type: 'object', trigger: 'change' }
        ],
        probation: [
          { required: true, validator: probationReg, message: '请输入试用期', trigger: 'change' }
        ],
        store: [
          { required: true, message: '请选择门店', trigger: 'change' }
        ],
        jobStation: [
          { required: true, message: '请选择岗位', trigger: 'change' }
        ],
      },
      //弹窗--续签码
      renewQRcodeTitle:'合同续签码',
      renewQRcodeDialog:false,
      isShowRenewQRcode:false,
      is_nx_project: false,
      //添加人员-自定义表单
      customFieldForm: {
        name: '',
        region: '',
      },
      dialogCustomField:false,
      customFields:[],
      submitCustomFields:[],
      // 查看导出进程
      timer: null,
      progressInfo: '',
      percentage: 0,
      progressDialog: false,
      canClosed: false,
      // 查看导出列表
      dialogExportVisible: false,
      exportData: [],
      export_total_num: 0,
      export_currentPage: 1,
      export_pageSize: 20,
      insurance_status_list: [
        {name: '待增员', value: 0},
        {name: '增员中', value: 1},
        {name: '参保中', value: 2},
        {name: '已参保', value: 3},
        {name: '待减员', value: 4},
        {name: '减员中', value: 5},
        {name: '已减员', value: 6},
        {name: '全部', value: 7},
      ],
      fund_status_list: [
        {name: '待增员', value: 0},
        {name: '增员中', value: 1},
        {name: '参保中', value: 2},
        {name: '已参保', value: 3},
        {name: '待减员', value: 4},
        {name: '减员中', value: 5},
        {name: '已减员', value: 6},
        {name: '全部', value: 7},
      ],
      addition_amount: 0,
      reduce_amount: 0,
      is_show_shop: false
    };
  },
  computed: {},
  watch: {
    filterText(val) {
      this.$refs.all_groups.filter(val);
    },
    $route() {
      this.init();
    }
  },
  methods: {
    closeDialog() {
      this.selected_groups = util.getLocalStorage("origin_selected_groups");
      this.getMemberList();
    },
    init() {
      util.setLocalStorage("origin_selected_groups", []);
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.curr_login_user_id = util.getLocalStorage("currLoginUserId");
      //获取人员列表
      this.getMemberList();
      //添加人员---获取角色列表
      this.getRoleList();
      this.handleShowMaintainerBtn();
      // this.getPermissions();
      this.getAddressListData();
      //检查当前项目是否已经开启供应商费用结算
      this.isOpenCostSettlement();
      //获取岗位-城市列表
      this.getStationCityList();
      this.getLeaveReason();
      // 获取当前项目是否是全职项目
      this.getProjectType();
      // 获取增员减员数量
      this.getApplyAmount();
    },
    // 上社保
    goSocialSecurity() {
      console.log('this.currSelectMemberData===', this.currSelectMemberData)
      if(this.currSelectMemberData.length === 1) {
        window.localStorage.setItem('selectedMemberObj', JSON.stringify(this.currSelectMemberData))
        this.$router.push(`ssSafing?from=memberadmin`)
      } else {
        this.$message({
          showClose: true,
          message: '只能勾选一人上社保',
          type: 'warning'
        });
      }
    },
    // 批量上保险
    goSocialSecurityBanch() {
      this.$router.push(`ssTab?tab=2&from=ry`)
    },
    // 获取增减员数量
    getApplyAmount() {
      util.ajax({
        url: "/fulltimess/member_exhibition/staff_apply_amount",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: obj => {
          // console.log(JSON.stringify(obj))
          if (obj && obj.errno == 0) {
            this.addition_amount = obj.data.addition_amount;
            this.reduce_amount = obj.data.reduce_amount;
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
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
          console.log('getProjectType',res)
          if (res && res.errno == 0) {
            this.project_type = res.data.list.project_type;
            this.ruleForm2 = this.initProtocolForm
            this.isSuperAdmin = res.data.list.current_user_role_id;   // 3是项目超级管理员
            this.is_show_shop = res.data.list.is_show_shop;
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {},
      });
    },

    // 批量签署验证
    checkBatchSingUser(){
      this.user_list = [];
      this.currSelectMemberData.forEach(item => {
        this.user_list.push(item.user_id);
      });

      console.log('this.user_list',this.user_list)
      util.ajax({
        url: '/protocol/batch/pre_add',
        type: 'POST',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          user_id: JSON.stringify(this.user_list),
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
              this.getStationList();
              this.dialogBatchProtocol = true;
              console.log('this.is_show_shop===', this.is_show_shop)
              if(this.is_show_shop) {
                this.getEmployercompanyFun()
              }
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
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
    // 调取获取门店和岗位接口
    getEmployercompanyFun(){
      util.ajax({
        url: '/user/employercompany',
        type: 'POST',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          type: 1,
          page_no: 1,
          page_size: 1000
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            console.log('obj===', obj)
            this.storeList = obj.data.shop_list
            this.jobStationList = obj.data.station_list
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
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
    // 重置批量签署表单
    resetForm(formName) {
      this.dialogBatchProtocol = false
      this.ruleForm2 = this.initProtocolForm
    },

    // 批量签署
    submitProtocol(formName) { //批量签署合同确认
        this.$refs[formName].validate((valid) => {
        if (valid) {
          let curStation = this.stationList.filter((item) => {
            return item.id == this.ruleForm2.id
          })[0]
          console.log('curStation',curStation)
          this.submitDisabled = true;
          let _data = {
            team_id: this.team_id,
            project_id: this.project_id,
            user_id: JSON.stringify(this.user_list),
            city_id: curStation.city_id,
            city_name: curStation.city_name,
            station_id: curStation.station_id,
            station_name: curStation.station_name,
            start_date: util.getLocalTime(this.ruleForm2.start_date.getTime(), 'yyyy-MM-dd'),
            end_date: util.getLocalTime(this.ruleForm2.end_date.getTime(), 'yyyy-MM-dd'),
            probation: this.ruleForm2.probation,
            shop_id: this.ruleForm2.store,
            shop_station_id: this.ruleForm2.jobStation,
            wage_day: this.ruleForm2.wage_day || 10,
          }
          console.log('_data',_data)
          util.ajax({
            url: '/protocol/batch/add',
            type: 'POST',
            data: _data,
            timeout: 10000,
            success: (obj) => {
              if (obj && obj.errno == 0) {
                this.$message({
                  showClose: true,
                  message: '成功发送，等待员工签订',
                  type: 'success'
                });
                this.dialogBatchProtocol = false
                this.submitDisabled = false;
                this.page_no = 1;
                this.getMemberList();
              } else {
                this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: 'warning'
                });
                this.submitDisabled = false;
              }
            },
            error: (xhr, status) => {
              this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
              this.submitDisabled = false;
            },
            noNetwork: () => {
              //网络超时
              this.$message({
                showClose: true,
                message: '网络连接失败，请检查网络',
                type: 'warning'
              });
              this.submitDisabled = false;
            }
          })
        }
      })
    },
    // 获取岗位城市列表
    getStationList(cb) {
      util.ajax({
        url: '/project/station/get',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          format: 0 //1
        },
        timeout: 10000,
        success: (obj) => {
          // console.log('岗位列表')
          if (obj && obj.errno == 0) {
            obj.data.forEach((item) => {
              item.id = item.station_id + item.city_id
              item.name = item.station_name + '-' + item.city_name
            })
            this.stationList = obj.data
            console.log(this.stationList)
            if (cb) cb()
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
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
    // 批量签署岗位城市变动
    changeStationFn(curStationId) {
      if (!curStationId) return
      let curStation = this.stationList.filter((item) => {
        return item.id == curStationId
      });
      console.log(curStation)
      if (!curStation.length) return
      this.ruleForm2.city_id = ''
      this.ruleForm2.probation = ''
      this.ruleForm2.store = ''
      this.ruleForm2.jobStation = ''
      this.ruleForm2.start_date = new Date()
      this.ruleForm2.end_date = new Date()

      this.getStationInfo(curStation[0])
    },
    // 获取项目职位信息
    getStationInfo(curr) {
      this.submitDisabled = false
      util.ajax({
        url: '/protocol/crm/get',
        type: 'POST',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          station_id: curr.station_id,
          city_id: curr.city_id,
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            if (obj.data == '') {
              obj.data.start_date = ''
              obj.data.end_date = ''
              obj.data.probation = ''
              obj.data.store = ''
              obj.data.jobStation = ''
              obj.data.wage_day = ''
              this.ruleForm2.end_date = new Date()
            } else {
              this.ruleForm2.end_date = new Date(obj.data.end_date * 1000)
            }
            this.ruleForm2.start_date = new Date()
            this.ruleForm2.probation = obj.data.probation || ''
            this.ruleForm2.store = obj.data.store || ''
            this.ruleForm2.jobStation = obj.data.jobStation || ''
            this.ruleForm2.wage_day = obj.data.wage_day || ''
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: 'warning'
            });
            if (obj.errno == 29014) { //合同过期
              this.submitDisabled = true
            }
          }
        },
        error: (xhr, status) => {
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

    createStateFilter(queryString) {
      return state => {
        return (
          state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    // 获取岗位-城市列表
    getStationCityList() {
      util.ajax({
        url: "/project/station/get",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          format: 0
        },
        timeout: 10000,
        success: obj => {
          if (obj && obj.errno == 0) {
            obj.data.forEach(item => {
              item.id = item.station_id + item.city_id;
              item.name = item.station_name + "-" + item.city_name;
            });
            this.stationArr = obj.data;
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    // 获取投保职位
    getInsureJobsList() {
      util.ajax({
        url: "/insurance/post/list",
        type: "GET",
        // data: {},
        timeout: 10000,
        success: obj => {
          console.log('insure----obj===', obj)
          if (obj && obj.errno == 0) {
            this.insureJobs = obj.data;
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //获取人员列表
    getMemberList() {
      setTimeout(() => {
        $(".el-table__body-wrapper").scrollTop(0);
      });
      let showLevel = 1;
      let curr_select_group = [];
      if (this.fromData.statusValue === 0) {
        showLevel = 0;
      } else if (this.fromData.statusValue == 1) {
        showLevel = 1;
      } else if (this.fromData.statusValue == -1) {
        showLevel = -1;
      }else if (this.fromData.statusValue == -2) {
        showLevel = -2;
      }else if (this.fromData.statusValue == -3) {
        showLevel = -3;
      }
      if (this.selected_groups.length != 0) {
        this.selected_groups.forEach(i => {
          curr_select_group.push(i.id);
        });
      } else {
        curr_select_group = "";
      }
      if (this.pream == 1) {
        this.loading = true;
      }
      let _data = {
        team_id: this.team_id,
        project_id: this.project_id,
        group_id: JSON.stringify(curr_select_group), //4142
        show_level: showLevel,
        page_no: this.seachData != "" ? "" : this.page_no,
        page_size: this.seachData != "" ? "" : 20,
        user_id: this.seachData,
        is_comment: 0,
        show_range_field: 1,
        station_id: "" || this.seach_station_id,
        station_city_id: "" || this.seach_station_city_id,
        protocol_status: this.fromData.protocolStatus,
        filter_protocol_date: this.fromData.filterProtocolDate,
        supplier_id: this.seachSupplierData,
        identity: this.fromData.identity,
        worker_source: this.fromData.source_from_value,
        insurance_status: this.fromData.insurance_status,
        fund_status: this.fromData.fund_status,
        supplier_name: this.fromData.supplier_name,
      };
      console.log(_data);
      util.ajax({
        url: "/group/batch/member_exhibition",
        type: "GET",
        data: _data,
        timeout: 10000,
        success: obj => {
          console.log("人员列表");
          console.log(obj);
          this.loading = false;
          if (obj && obj.errno == 0) {
            if (this.fromData.statusValue == -1) {
              this.showLeaveDate = true;
            } else {
              this.showLeaveDate = false;
            }
            // console.log(obj.data.user_info.user_list[0].hasOwnProperty('station_name'))
            // console.log(obj.data.user_info.user_list[0].hasOwnProperty('protocol_status'))
            if (
              obj.data.user_info.user_list[0] &&
              obj.data.user_info.user_list[0].hasOwnProperty("station_name")
            ) {
              //判断是否显示岗位字段
              this.showStationName = [1];
            } else {
              this.showStationName = [];
            }
            if (
              obj.data.user_info.user_list[0] &&
              obj.data.user_info.user_list[0].hasOwnProperty("protocol_status")
            ) {
              //判断是否显示合同字段
              this.showProrocolStatus = [1];
            } else {
              this.showProrocolStatus = [];
            }
            // if(obj.data.user_info.user_list.length <= 0){
            //   obj.data.header.show_custom_field = []
            // }
            this.tableData = obj.data;
          } else {
            // this.$message({
            //     showClose: true,
            //     message: obj.errmsg,
            //     type: 'warning'
            // });
          }
        },
        error: (xhr, status) => {
          this.loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          this.loading = false;
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //获取小组列表
    getGroupList() {
      util.ajax({
        url: "/group/select_list",
        type: "GET",
        data: {
          group_id: 0,
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.all_groups = obj.data; // 小组结构
            //获取动态表单列表
            // this.customFields=obj.data.form_list.filter(v=>{
            //   return v.type=='SingleText'||v.type=='Imageview' 
            // });
            // console.log('customFields>>',this.customFields);
            //初始化动态表单数据
            // this.initCustomFields(obj.data.form_list);
            let cacheGroupList = obj.data;
            let group = new GroupUtil(cacheGroupList);
            this.allGroupList = group.formatGroup(group.group); //所有小组，不分结构
            if (this.dialogImport) {
              this.ruleForm.importValue = obj.data.base[0].id;
            }
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //根据小组列表获取动态表单
    getCustomFields(group_id){
      util.ajax({
        url: "/form/group/list2",
        type: "GET",
        data: {
          group_id,
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            let data=obj.data;
            // debugger
            //获取动态表单列表
            if(data.length==0){
              this.submitCustomFields=[];
              this.customFields=[];
              return;
            }
            this.customFields=data.filter(v=>{
              return v.type=='SingleText'||v.type=='Imageview' 
            });
            //初始化动态表单数据
            this.initCustomFields(data);
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //初始化动态表单
    initCustomFields(data){
      let newData=data.filter(v=>{
        return v.type=='SingleText'||v.type=='Imageview' 
      });
      console.log('ggggg',newData);
      if(this.submitCustomFields.length>0){
        newData.map((v,i)=>{
          let o=this.submitCustomFields.find((e,index)=>{
            return e.form_id==v.field;
          });
          if(o){
            v.info.value=o.info[0].info.value;
          }
          return v;
        })
      }
      this.submitCustomFields=newData.map((v,i)=>{
        return {
          "form_id":v.field,
          "info":[
            {
              "id":v.id,
              "type":v.type,
              "name":v.name,
              "info":{...v.info}
            }
          ]
        }
      })
      console.log('submitCustomFieldssubmitCustomFieldssubmitCustomFields',this.submitCustomFields);
      return
      // if(this.submitCustomFields.length>0){
      //   let o=this.getArrDifSameValue(this.submitCustomFields,newData)
      //   let obj={
      //     "form_id":o.field,
      //     "info":[
      //       {
      //         "id":o.id,
      //         "type":o.type,
      //         "name":o.name,
      //         "info":{...o.info}
      //       }
      //     ]
      //   }
      //   // this.submitCustomFields.forEach((v,i)=>{
      //   //   let o=newData.find((e,index)=>{
      //   //     return e.id!=v.id;
      //   //   });
      //   //   if(o){
      //   //     obj={
      //   //       "id":o.id,
      //   //       "info":[
      //   //         {
      //   //           "id":"",
      //   //           "type":o.type,
      //   //           "name":o.name,
      //   //           "info":{...o.info}
      //   //         }
      //   //       ]
      //   //     }
      //   //   }
      //   // })
      //   this.submitCustomFields.push(obj)
      // }else{
      //   this.submitCustomFields=newData.map((v,i)=>{
      //     return {
      //       "form_id":v.field,
      //       "info":[
      //         {
      //           "id":v.id,
      //           "type":v.type,
      //           "name":v.name,
      //           "info":{...v.info}
      //         }
      //       ]
      //     }
      //   })
      // }
      // console.log('dddd?????????',this.submitCustomFields);
    },
    //合并新增的自定义选项
    getArrDifSameValue(arr1,arr2){
      var result = {};
      for(var i = 0; i < arr2.length; i++){
          var obj = arr2[i];
          var id = obj.id;
          var isExist = false;
          for(var j = 0; j < arr1.length; j++){
              var aj = arr1[j];
              var n = aj.id;
              if(n == id){
                  isExist = true;
                  break;
              }
          }
          if(!isExist){
              result=obj;
          }
      }
      return result;
    },
    //获取角色列表
    getRoleList() {
      util.ajax({
        url: "/group/select_identity_list",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: obj => {
          if (obj && obj.errno == 0) {
            this.roleArr = obj.data;
          } else {
            // this.$message({
            //     showClose: true,
            //     message: obj.errmsg,
            //     type: 'warning'
            // });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //搜索--小组选择--调取公共组件
    openGroupSelecter() {
      //获取小组列表
      this.getGroupList();
      this.$refs.profile.openGroupSelecter();
    },
    confirmGroupSelecter(val) {
      this.selected_groups = val;
    },
    changeComponentHandle(e){
      console.log('组件改变时候的值》》》》》》',e);
      let {number,value,item}=e;
      let fields={
        "form_id":item.field,
        "info":[
            {
                "id":item.id,
                "type":item.type,
                "name":item.name,
                "info":{...item.info,value}
            }
        ]
      };
      this.submitCustomFields[number]=fields;
      console.log('需要提交的值》》》》》》',this.submitCustomFields);
    },
    /*********************人员列表部分*********************/
    //表单全选操作或单选复选款操作
    handleSelectionChange(val) {
      this.currSelectMemberData = val;
      if (val.length) {
        if (this.fromData.statusValue == -1) {
          this.isdisabled1 = false;
          this.isdisabled2 = true;
          this.isdisabled3 = false;
        } else if(this.fromData.statusValue == -2) {
          this.isdisabled1 = true;
          this.isdisabled2 = true;
          this.isdisabled3 = true;
        }else {
          this.isdisabled1 = false;
          this.isdisabled2 = false;
          this.isdisabled3 = false;
        }
      } else {
        this.isdisabled1 = true;
        this.isdisabled2 = true;
        this.isdisabled3 = true;
      }
    },
    //弹窗----查看个人信息
    getUserInfo(row, column, cell, event) {
      this.userInfoForm = "";
      if (column.className !== "noclick") {
        this.$router.replace({
          path: "memberinfo",
          query: {
            id: row.user_id,
            e: this.admins.edit_Pre && row.identity_id != 1 ? 1 : 0
          }
        });
        // this.$router.replace('memberinfo')
        return;
        this.dialogInfo = true;
        this.currSelectMemberData = row;
        this.loadingInfo = true;
        util.ajax({
          url: "/group/member_info",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            user_id: row.user_id,
            fields: ""
          },
          timeout: 10000,
          success: obj => {
            console.log("人员详细信息");
            console.log(obj);
            this.loadingInfo = false;
            if (obj && obj.errno == 0) {
              this.degreeArr.forEach(i => {
                if (i.id == obj.data.degree) {
                  obj.data.degree_name = i.name;
                }
              });
              this.userInfoForm = obj.data;
              if (obj.data.identity != 1) {
                this.admins.editPre = true;
              } else {
                this.admins.editPre = false;
              }
            } else {
              this.$message({
                showClose: true,
                message: obj.errmsg,
                type: "warning"
              });
            }
          },
          error: (xhr, status) => {
            this.loadingInfo = false;
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          },
          noNetwork: () => {
            this.loadingInfo = false;
            //网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          }
        });
      }
    },
    /*分页操作*/
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`);
    },
    handleCurrentPageChange(val) {
      this.page_no = val;
      this.getMemberList();
    },
    /******************弹窗————设置维护人*******************/
    // 获取用户角色来是否显示设置维护人按钮
    handleShowMaintainerBtn() {
      util.ajax({
        url: "/visit/get_user_role",
        type: "GET",
        data: {
          project_id: this.project_id,
          dmclient: "pcweb"
        },
        timeout: 10000,
        success: obj => {
          if (obj && obj.errno == 0) {
            let res = obj.data.identity;
            if (res == "1" || res == "2") {
              this.showSetMaintainerBtn = true;
            }
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    handleShowSetMaintainerDialog() {
      this.user_list = [];
      let msgPre = false;
      this.currSelectMemberData.forEach(item => {
        if (
          item.identity_id == 1 ||
          item.identity_id == 2 ||
          item.identity_id == 3
        ) {
          msgPre = true;
        }
        this.user_list.push(item.user_id);
      });
      if (msgPre) {
        this.$message({
          showClose: true,
          message: "只有普通成员才可被设置为维护人",
          type: "warning"
        });
      } else {
        this.setMaintainerDialog = true;
      }
      // this.setMaintainerDialog = true;
    },
    // 设置投保职位
    handleInsureJobDialog() {
      this.dialogInsureJobsSelect = true
      this.getInsureJobsList()
    },
    // 获取设置人
    querySearchMaintainer(queryString, cb) {
      if (!queryString) {
        cb([]);
        return;
      }
      this.currentMaintainer = "";
      util.ajax({
        url: "/visit/get_visit_user",
        type: "GET",
        data: {
          dmclient: "pcweb",
          email: queryString
        },
        timeout: 10000,
        success: obj => {
          if (obj && obj.errno == "0") {
            let strArr = [];
            obj.data.forEach(o => {
              let str = {
                value: o.email + " " + o.fullname,
                mgmt_user_id: o.mgmt_user_id
              };
              strArr.push(str);
            });
            if (strArr.length == 0) {
              strArr.push({ value: "无搜索结果", status: "-1" });
            }
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
              // 调用 callback 返回建议列表的数据
              cb(strArr);
            }, 1000 * Math.random());
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    handleCloseMaintainerDialog() {
      this.currentMaintainer = "";
      setTimeout(() => {
        this.setMaintainerDialog = false;
      }, 50);
    },
    handleSelectMaintainer(item) {
      this.mgmt_user_id = item.mgmt_user_id;
    },
    // 提交设置人
    commitSetMaintainer() {
      if (!this.mgmt_user_id) {
        this.$message({
          showClose: true,
          message: "请从列表中选择维护人",
          type: "warning"
        });
        return
      }
      let _user_id_list = [];
      this.currSelectMemberData.forEach(o => {
        _user_id_list.push(o.user_id);
      });
      util.ajax({
        url: "/visit/set_visit_user",
        type: "POST",
        data: {
          project_id: this.project_id,
          mgmt_user_id: this.mgmt_user_id,
          user_id: _user_id_list,
          dmclient: "pcweb"
        },
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.currentMaintainer = "";
            setTimeout(() => {
              this.setMaintainerDialog = false;
            }, 50);

            this.getMemberList();
            this.$message({
              showClose: true,
              message: "设置成功",
              type: "success"
            });
          } else {
            this.$message.error(obj.errmsg);
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    /******************弹窗————选择岗位-城市*******************/

    selectStation() {
      this.dialogStationCitySelect = true;
    },
    commitChangeStatinCity() {
      console.log(this.currSelectStation);
      let _user_id_list = [];
      let _station_id = "";
      let _station_city_id = "";
      this.stationArr.forEach(i => {
        if (i.id == this.currSelectStation) {
          _station_id = i.station_id;
          _station_city_id = i.city_id;
        }
      });
      this.currSelectMemberData.forEach(o => {
        _user_id_list.push(o.user_id);
      });
      util.ajax({
        url: "/project/station/set",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          station_id: _station_id,
          city_id: _station_city_id,
          user_id_list: _user_id_list.join(",")
        },
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.dialogStationCitySelect = false;
            this.currSelectStation = "";
            this.getMemberList();
            this.$message({
              showClose: true,
              message: "修改成功",
              type: "success"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    // 确定投保职位
    insureJobsSure() {
      this.user_list = [];
      this.currSelectMemberData.forEach(item => {
        this.user_list.push(item.user_id);
      });
      console.log('this.user_list',this.user_list)
      // console.log('----11', this.team_id, this.project_id, '33', this.insureJobsValue, this.insurance_scope, this.user_list)
      if(!this.insureJobsValue) {
        this.$message({
          showClose: true,
          message: "投保职位不存在",
          type: "error"
        });
        return
      }
      util.ajax({
        url: "/group/set_insurance_post",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          user_id: JSON.stringify(this.user_list),
          post_code: this.insureJobsValue,
          insurance_scope: this.insurance_scope
        },
        timeout: 10000,
        success: obj => {
          if (obj && obj.errno == 0) {
            this.dialogInsureJobsSelect = false;
            this.insureJobsValue = "";
            this.getMemberList();
            this.$message({
              showClose: true,
              message: "设置成功",
              type: "success"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    cancelBtn() {
      this.dialogStationCitySelect = false;
      this.currSelectStation = "";
    },
    cancelBtn2() {
      this.dialogInsureJobsSelect = false;
      this.insureJobsValue = "";
      this.insurance_scope = 1;
    },
    /******************弹窗————调整关系*******************/
    adjustFiliation() {
      this.dialogStationSelect = true;
      this.isOpenCostSettlement();
    },
    commitChangeStatinGroup() {
      if (!this.currSelectStationGroup) {
        this.isError = true;
        return;
      }
      let user_id_list = [];
      this.currSelectMemberData.forEach(i => {
        user_id_list.push(i.user_id);
      });
      util.ajax({
        url: "/group/change_supplier_relation",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          supplier_id: this.currSelectStationGroup,
          user_id_list: user_id_list.toString()
        },
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.dialogStationSelect = false;
            this.$message({
              showClose: true,
              message: "修改成功",
              type: "success"
            });
            this.getMemberList();
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.dialogStationSelect = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          this.dialogStationSelect = false;
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //弹窗---取消按钮
    changeStationGroupCancelBtn() {
      this.dialogStationSelect = false;
      this.currSelectStationGroup = "";
    },
    onchangeStation() {
      if (this.currSelectStationGroup != "") {
        this.isError = false;
      }
    },
    /*******************弹窗————移动小组部分***************/
    //移动小组按钮
    moveGroup() {
      //获取小组列表
      this.show = false;
      this.filterText = "";
      this.getGroupList();
      this.currSelectMoveGroup = "";
      //判断可否移动s
      for (let i = 0, lg = this.currSelectMemberData.length; i < lg; i++) {
        if (
          this.currSelectMemberData[i].identity_id == 1 ||
          this.currSelectMemberData[i].identity_id == 2
        ) {
          this.$message({
            showClose: true,
            message: "超级管理员或管理员不可被移动小组",
            type: "warning"
          });
          return;
        }
      }
      this.dialogGroupSelect = true;
      this.popover = true;
    },
    //弹窗---树形小组--选择小组操作
    handleNodeClick(data) {
      this.currSelectMoveGroup = data;
    },
    //弹窗---过滤小组函数
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    //弹窗---清楚搜索小组关键字
    clearFilterText() {
      this.filterText = "";
    },
    //弹窗---移动小组--确认按钮
    moveGroupConfirmBtn() {
      let moveUserIdArr = [];
      this.currSelectMemberData.forEach(o => {
        moveUserIdArr.push(o.user_id);
      });
      util.ajax({
        url: "/group/batch/member_change_relations",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          group_id: this.currSelectMoveGroup.id,
          user_id: JSON.stringify(moveUserIdArr)
        },
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            if (obj.data.change_status == true) {
              this.dialogGroupSelect = false;
              this.visible2 = false;
              this.getMemberList();
              this.$message({
                showClose: true,
                message: "移动成功!",
                type: "success"
              });
            }
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
      // this.$confirm('是否将已选人员移动到'+this.currSelectMoveGroup.name+'小组', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消'
      // }).then(() => {

      // }).catch(() => {

      // });
    },
    //弹窗---取消按钮
    moveGroupCancelBtn() {
      this.dialogGroupSelect = false;
      this.currSelectMoveGroup = "";
    },
    alert() {
      this.$message({
        showClose: true,
        message: "请选择小组!",
        type: "warning"
      });
      return;
    },
    /********************弹窗----详细信息********************/
    //重新录用
    reEmploy() {
      util.ajax({
        url: "/group/member/re_employ",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          group_id: this.currSelectMemberData.group_id,
          user_ids: "[" + this.currSelectMemberData.user_id + "]"
        },
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            if (obj.data.change_status == true) {
              this.$message({
                showClose: true,
                message: "重新录用成功",
                type: "success"
              });
              this.dialogInfo = false;
              this.getMemberList();
            }
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //批量编辑和单个编辑-标记离职
    resetQuit() {
      if(this.project_type==3||this.project_type==7){
        if(this.currSelectMemberData.length>1){
          this.$message({
            showClose: true,
            message: "全职项目需上传离职相关文件，故不支持多选",
            type: "warning"
          });
          return false;
        }
      }
      this.user_list = [];
      let leavePre = false;
      let msgPre = false;
      this.currSelectMemberData.forEach(item => {
        if (item.user_id == this.curr_login_user_id) {
          leavePre = true;
          return;
        }
        if (item.identity_id == 1) {
          msgPre = true;
        }
        this.user_list.push(item.user_id);
      });

      if (leavePre) {
        this.$message({
          showClose: true,
          message: "不可标记自己为离职",
          type: "warning"
        });
      } else if (msgPre) {
        this.$message({
          showClose: true,
          message: "超级管理员不可被标记离职",
          type: "warning"
        });
      } else {
        this.dialogLeave = true;
      }

      // let user_list = []
      // if(type === 'array'){
      //     for(let i = 0,lg = this.currSelectMemberData.length;i<lg;i++){
      //       console.log(this.currSelectMemberData[i].user_id)
      //         if(this.currSelectMemberData[i].user_id == this.curr_login_user_id){
      //             this.$message({
      //               showClose: true,
      //               message: '不可标记自己为离职',
      //               type: 'warning'
      //             });
      //             return;
      //         }else if(this.currSelectMemberData[i].identity_id == 1){
      //             this.$message({
      //               showClose: true,
      //               message: '超级管理员不可被标记离职',
      //               type: 'warning'
      //             });
      //             return;
      //         }
      //         user_list.push(this.currSelectMemberData[i].user_id)
      //     }
      //     this.$confirm('将选中人员标记为离职？', '提示', {
      //       confirmButtonText: '确定',
      //       cancelButtonText: '取消'
      //     }).then(() => {
      //         this.postAjaxQuit(user_list,type)
      //     }).catch(() => {

      //     });

      // }else{
      //     if(this.currSelectMemberData.user_id == this.curr_login_user_id){
      //         this.$message({
      //           showClose: true,
      //           message: '不可标记自己为离职',
      //           type: 'warning'
      //         });
      //         return;
      //     }
      //     user_list = this.currSelectMemberData.user_id
      //     this.postAjaxQuit(user_list,type)
      // }
    },
    //批量操作离职人员
    postAjaxQuit(user_list) {
      let timestr = this.leave_data.leave_date.getTime();
      let _cur_reason_id = "";
      let _cur_reason = "";
      let _data = "";
      let uploadData={};
      if (this.leave_data.change_radio == "") {
        this.$message({
          showClose: true,
          message: "请选择离职原因",
          type: "warning"
        });
        return false;
      }
      if (this.leave_data.change_radio === "其他") {
        this.contractFile=[];
        if (this.leave_data.leave_reason == "") {
          this.$message({
            showClose: true,
            message: "请填写详细原因",
            type: "warning"
          });
          return false;
        }
      } else {
        if (this.leave_data.detail_reason == "") {
          this.$message({
            showClose: true,
            message: "请选择详细原因",
            type: "warning"
          });
          return false;
        }
        if((this.project_type==3||this.project_type==7)&&this.contractFile.length==0){
          this.$message({
            showClose: true,
            message: "请上传相关附件",
            type: "warning"
          });
          return false;
        }
      }

      this.leave_data.currSelectLeavelist.forEach(i => {
        if (i.reason === this.leave_data.detail_reason) {
          _cur_reason_id = i.reason_id;
          _cur_reason = i.reason;
        }
      });

      //处理上传的附件
      if(this.project_type==3||this.project_type==7){
        const resignationDocument=this.contractFile.map((v,i)=>{
          return{
            file:v.url
          }
        })
        uploadData={
          resignation_document:JSON.stringify(resignationDocument)
        }
      }
      _data = {
        team_id: this.team_id,
        project_id: this.project_id,
        user_id: JSON.stringify(this.user_list),
        reason_id: _cur_reason_id,
        leave_reason: _cur_reason || this.leave_data.leave_reason,
        leave_date: util.getLocalTime(timestr, "yyyyMMdd"),
        ...uploadData
      };
      util.ajax({
        url: "/group/batch/member_remove",
        type: "POST",
        data: _data,
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          this.leave_loading = false;
          if (obj && obj.errno == 0) {
            if (obj.data.remove_status == true) {
              this.$message({
                message: "成功标记为离职",
                type: "success"
              });
              this.dialogLeave = false;
              this.leave_data.leave_reason = "";
              this.leave_data.change_radio = "";
              this.leave_data.detail_reason = "";
              this.leave_data.leave_date = new Date();
              this.getMemberList();
            }
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.leave_loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.leave_loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },

    //批量删除人员
    deleteQuit() {
      this.user_list = [];
      let leavePre = false;
      let msgPre = false;
      this.currSelectMemberData.forEach(item => {
        if (item.user_id == this.curr_login_user_id) {
          leavePre = true;
          return;
        }
        //非普通成员不能删除；
        if (item.identity_id != 999999) {
          msgPre = true;
        }
        this.user_list.push(item.user_id);
      });

      if (leavePre) {
        this.$message({
          showClose: true,
          message: "不可标记自己为删除",
          type: "warning"
        });
      } else if (msgPre) {
        this.$message({
          showClose: true,
          message: "普通成员才可被删除",
          type: "warning"
        });
      } else {
        //this.dialogLeave = true;
         this.$confirm('删除后该员工将不存在，确认删除吗？', '提示', {
          confirmButtonText: '确定',
           cancelButtonText: '取消'
         }).then(() => {
           console.log('delete postAjaxDelete')
             this.postAjaxDelete()
         }).catch(() => {

         });
      }

    },
    //批量操作人员删除
    postAjaxDelete() {
      console.log('delete memeber222222 start')
      let _data = "";
      _data = {
        team_id: this.team_id,
        project_id: this.project_id,
        user_id: JSON.stringify(this.user_list),
      };
      console.log('delete memeber')
      console.log(_data)
      util.ajax({
        url: "/group/batch/member_delete",
        type: "POST",
        data: _data,
        timeout: 10000,
        success: obj => {
          // console.log(obj)
         // this.leave_loading = false;
          if (obj && obj.errno == 0) {
            if (obj.data.remove_status == true) {
              this.$message({
                message: "成功标记为删除",
                type: "success"
              });

              this.getMemberList();
            }
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          //this.leave_loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          //this.leave_loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },

    //离职原因切换操作
    changeLeaveTpye() {
      this.leave_data.reasonArr.forEach(item => {
        if (this.leave_data.change_radio === item.leave_type) {
          this.leave_data.currSelectLeavelist = item.list;
        }
      });
      this.contractFile=[];
      if(this.leave_data.change_radio=='主动离职'){
        this.elTips="请上传辞职书，上传的单个文件不能大于5M"
      }else if(this.leave_data.change_radio=='被动离职'){
        this.elTips="上传离职协议/仲裁裁决书,单个文件不能大于5M"
      }
      
    },
    //获取离职原因
    getLeaveReason() {
      util.ajax({
        url: "/group/batch/member_remove_reason",
        type: "GET",
        timeout: 10000,
        success: obj => {
          if (obj && obj.errno == 0) {
            this.leave_data.reasonArr = obj.data;
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //离职取消
    canceldialogLeave() {
      this.dialogLeave = false;
      this.leave_data.leave_reason = "";
      this.leave_data.change_radio = "";
      this.leave_data.detail_reason = "";
      this.leave_data.leave_date = new Date();
      this.contractFile=[];
    },
    // postAjaxQuit(user_list,type){
    //     util.ajax({
    //         url:'/group/batch/member_remove',
    //         type:'POST',
    //         data:{
    //           team_id:this.team_id,
    //           project_id:this.project_id,
    //           user_id:JSON.stringify(user_list)
    //         },
    //         timeout:10000,
    //         success:(obj) => {
    //             // console.log(obj)
    //             if(obj && obj.errno == 0){
    //                 if(obj.data.remove_status == true){
    //                   this.$message({
    //                     message: '成功标记为离职',
    //                     type: 'success'
    //                   });
    //                   if(type === 'array'){

    //                   }else{
    //                       this.dialogInfo = false
    //                   }
    //                 }
    //                 this.getMemberList()
    //             }else{
    //                 this.$message({
    //                     showClose: true,
    //                     message: obj.errmsg,
    //                     type: 'warning'
    //                 });
    //             }
    //         },
    //         error: (xhr, status) => {
    //             this.$message({
    //                 showClose: true,
    //                 message: '网络连接失败，请检查网络',
    //                 type: 'warning'
    //             });
    //         },
    //         noNetwork: () => {
    //           //网络超时
    //           this.$message({
    //             showClose: true,
    //             message: '网络连接失败，请检查网络',
    //             type: 'warning'
    //           });
    //         }
    //       })
    // },
    //修改个人信息按钮
    updateMemberInfo() {
      //获取小组列表
      setTimeout(() => {
        $("#asd").scrollTop(0);
      });
      this.getGroupList();
      this.pream = 22222;
      this.dialogInfo = false;
      this.dialogAddMembe = true;
      // if(this.fromData.statusValue == -1){
      //     this.isadd = true
      // }else{
      this.isadd = false;
      // }
      this.addmemberTitle = "修改人员信息";
      let curr_identity = "";
      let curr_degree = "";
      this.roleArr.forEach(item => {
        if (this.userInfoForm.identity == item.identity_id) {
          curr_identity = item.identity_id;
        }
      });
      this.degreeArr.forEach(i => {
        if (i.id == this.userInfoForm.degree) {
          curr_degree = i.name;
        }
      });
      this.disabled_group = true;
      this.ruleForm = {
        user_id: this.userInfoForm.user_id,
        mobile: this.userInfoForm.mobile,
        real_name: this.userInfoForm.real_name,
        group_id: this.userInfoForm.group_id,
        identity: curr_identity
          ? curr_identity
          : this.userInfoForm.identity_str,
        birthday:
          this.userInfoForm.birthday && this.userInfoForm.birthday != 0
            ? this.userInfoForm.birthday
            : "",
        gender: this.userInfoForm.gender,
        height:
          this.userInfoForm.height && this.userInfoForm.height != 0
            ? this.userInfoForm.height
            : "",
        weight:
          this.userInfoForm.weight && this.userInfoForm.weight != 0
            ? this.userInfoForm.weight
            : "",
        idnumber: this.userInfoForm.idnumber,
        address: this.userInfoForm.province
          ? this.userInfoForm.province.short_name
          : "",
        datail_address: this.userInfoForm.datail_address || "",
        school: this.userInfoForm.school || "",
        personnel_number: this.userInfoForm.personnel_number || "",
        graduate_date:
          this.userInfoForm.graduate_date &&
          this.userInfoForm.graduate_date != 0
            ? this.userInfoForm.graduate_date
            : "",
        entry_date:
          this.userInfoForm.entry_date && this.userInfoForm.entry_date != 0
            ? this.userInfoForm.entry_date
            : "",
        leave_date:
          this.userInfoForm.leave_date && this.userInfoForm.leave_date != 0
            ? this.userInfoForm.leave_date
            : "",
        degree:
          this.userInfoForm.degree && this.userInfoForm.degree != 0
            ? curr_degree
            : "",
        specialty: this.userInfoForm.specialty || "",
        bank: this.userInfoForm.bank || "",
        bank_info: this.userInfoForm.bank_info || "",
        bank_card_number: this.userInfoForm.bank_card_number || "",
        project_remark: this.userInfoForm.remark,
        disabled: 1,
        type: 1,
        real_name_auth: this.userInfoForm.real_name_auth
      };
      // console.log(this.ruleForm)
      if (this.userInfoForm.province_id) {
        this.selectedOptions.push(this.userInfoForm.province_id);
        this.selectedOptions.push(this.userInfoForm.city_id);
        this.selectedOptions.push(this.userInfoForm.district_id);
      }
    },
    /*******************弹窗————添加人员********************/
    //点击添加人员按钮时清除已有的数据及ruleForm重新赋值
    addMember() {
      setTimeout(() => {
        $("#asd").scrollTop(0);
      });
      this.ruleForm = {
        mobile: "",
        real_name: "",
        group_id: "",
        identity: "",
        birthday: "",
        gender: "",
        height: "",
        weight: "",
        idnumber: "",
        address: "",
        datail_address: "",
        school: "",
        personnel_number: "",
        graduate_date: "",
        entry_date: "",
        degree: "",
        specialty: "",
        bank: "",
        bank_info: "",
        bank_card_number: "",
        project_remark: "",
        station_value: 0,
        emergency_contact_person:'',
        emergency_contact_person_mobile:''
      };
      this.customFields=[];
      this.submitCustomFields=[];
      this.dialogAddMembe = true;
      this.isadd = true;
      this.addmemberTitle = "添加人员";
      this.selectedOptions = [];
      //检查当前项目是否已经开启供应商费用结算
      // this.isOpenCostSettlement()
      //获取小组列表
      this.getGroupList();
      //根据企业是否开通实名认证、电子协议、兼职保险判断是否需要填写身份证号
      this.judge_ishas();
    },
    isOpenCostSettlement() {
      util.ajax({
        url: "/group/check_supplier_cost",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: obj => {
          if (obj && obj.errno == 0) {
            this.is_open_supplier = obj.data.is_open_supplier;
            console.log('this.is_open_supplier===', this.is_open_supplier)
            if (obj.data.is_open_supplier == 1) {
              obj.data.supplier_list[0].supper = "yes";
              this.all_supplier = obj.data.supplier_list;
            }
            // this.is_open_supplier = obj.data.is_open_supplier
            // obj.data.supplier_list[0].supper = 'yes'
            // this.all_supplier = obj.data.supplier_list
            // console.log(this.all_supplier)
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    judge_ishas() {
      util.ajax({
        url: "/team/idCard/is/need",
        type: "GET",
        data: {
          team_id: this.team_id
        },
        timeout: 10000,
        success: obj => {
          console.log(obj);
          if (obj && obj.errno == 0) {
            this.ishas = obj.data.is_has;
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //手机号失去焦点校验是否注册过，是--直接带出用户信息，否--继续填写
    inputBlur(value) {
      if (!reg.test(this.ruleForm.mobile)) {
        return;
      }
      setTimeout(() => {
        if (this.dialogAddMembe == false) {
          return;
        }
        util.ajax({
          url: "/user/register/info",
          type: "POST",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            mobile: this.ruleForm.mobile,
            idcard_security: 1 //身份证安全模式 默认为0 如果需要隐藏身份证号中间几位，传1
          },
          timeout: 10000,
          success: obj => {
            // console.log('已注册人员信息')
            console.log(obj);
            if (obj && obj.errno == 0) {
              if (obj.data == "") {
                return;
              }
              if (obj.data) {
                this.memberOldInfo = obj.data;
                this.isadd = true;
                let curr_identity = "";
                if (obj.data.identity == 1) {
                  curr_identity = 1;
                } else {
                  this.roleArr.forEach(item => {
                    if (obj.data.identity == item.identity_id) {
                      curr_identity = item.identity_id;
                    }
                  });
                }
                if (!obj.data.identity) {
                  this.disabled_group = true;
                }
                let degree_name = "";
                this.degreeArr.forEach(i => {
                  if (i.id == obj.data.degree) {
                    degree_name = i.name;
                  }
                });
                this.idnumber_old = obj.data.idnumber;
                this.ruleForm = {
                  user_id: obj.data.id,
                  mobile: obj.data.mobile,
                  real_name: obj.data.real_name,
                  group_id: obj.data.group_id,
                  identity: curr_identity
                    ? curr_identity
                    : obj.data.identity_str,
                  gender: obj.data.gender == 0 ? "" : obj.data.gender,
                  idnumber: obj.data.idnumber,
                  height: obj.data.height == 0 ? "" : obj.data.height,
                  weight: obj.data.weight == 0 ? "" : obj.data.weight,
                  birthday: obj.data.birthday == 0 ? "" : obj.data.birthday,
                  address: obj.data.address,
                  datail_address: obj.data.datail_address,
                  degree: obj.data.degree == 0 ? "" : degree_name,
                  school: obj.data.school,
                  personnel_number: obj.data.personnel_number,
                  graduate_date:
                    obj.data.graduate_date == 0 ? "" : obj.data.graduate_date,
                  entry_date: obj.data.entry_date,
                  specialty: obj.data.specialty,
                  bank: obj.data.bank,
                  bank_info: obj.data.bank_info,
                  bank_card_number: obj.data.bank_card_number,
                  project_remark: obj.data.remark,
                  disabled: 1,
                  real_name_auth: obj.data.real_name_auth,
                  station_value: 0
                };
                if (obj.data.province_id) {
                  this.selectedOptions.push(obj.data.province_id);
                  this.selectedOptions.push(obj.data.city_id);
                  this.selectedOptions.push(obj.data.district_id);
                }
              }
            }
          },
          error: (xhr, status) => {
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          }
        });
      }, 300);
    },
    identityChangeFn() {
      // console.log(this.ruleForm.identity)
      if (this.isadd && this.ishas) {
        if (this.ruleForm.identity == 2) {
          this.ruleForm.idnumber = this.idnumber_old;
        }
      }
    },
    //提交按钮--添加人员
    submitFormMember(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let _data = "";
          let _url = "";
          let curr_identity_id = "";
          let gender_id = "";
          let degree_id = "";
          // console.log(this.idnumber_old)
          // console.log(this.ruleForm.idnumber)
          if (this.ruleForm.idnumber !== this.idnumber_old) {
            if (
              this.ruleForm.idnumber &&
              !idnumberReg.test(this.ruleForm.idnumber)
            ) {
              this.idnumberReg = true;
              document.getElementById("sfz").scrollIntoView();
              return;
            } else {
              this.idnumberReg = false;
            }
          } else {
            this.idnumberReg = false;
          }
          if (this.ruleForm.height) {
            if (!numberReg.test(this.ruleForm.height)) {
              this.heightReg = true;
              document.getElementById("sg").scrollIntoView();
              return;
            } else {
              this.heightReg = false;
            }
          } else {
            this.heightReg = false;
          }
          if (this.ruleForm.weight) {
            if (!numberReg.test(this.ruleForm.weight)) {
              document.getElementById("tz").scrollIntoView();
              this.weightReg = true;
              return;
            } else {
              this.weightReg = false;
            }
          } else {
            this.weightReg = false;
          }

          if (this.ruleForm.identity == "管理员") {
            curr_identity_id = 2;
          } else if (this.ruleForm.identity == "组长") {
            curr_identity_id = 3;
          } else {
            curr_identity_id = this.ruleForm.identity;
          }

          if (this.ruleForm.gender === "男") {
            gender_id = 1;
          } else if (this.ruleForm.gender === "女") {
            gender_id = 2;
          } else {
            gender_id = this.ruleForm.gender;
          }

          if (!numberReg.test(this.ruleForm.degree)) {
            this.degreeArr.forEach(i => {
              if (this.ruleForm.degree == i.name) {
                degree_id = i.id;
              }
            });
          } else {
            degree_id = this.ruleForm.degree;
          }
          if (this.isadd == true) {
            _url = "/group/member_add";
            _data = {
              team_id: this.team_id,
              project_id: this.project_id,
              source: 3, //1二维码 2微信邀请 3手动添加 4团队成员 5通讯录
              user_list: JSON.stringify([
                {
                  user_name: this.ruleForm.real_name,
                  phone: this.ruleForm.mobile,
                  identity: curr_identity_id,
                  group_id: this.ruleForm.group_id,
                  gender: gender_id,
                  idnumber: this.ruleForm.idnumber,
                  address: "",
                  province_id: this.selectedOptions[0],
                  city_id: this.selectedOptions[1],
                  district_id: this.selectedOptions[2],
                  datail_address: this.ruleForm.datail_address,
                  birthday: this.ruleForm.birthday
                    ? util.formatData2(this.ruleForm.birthday)
                    : "",
                  bank: this.ruleForm.bank,
                  bank_card_number: this.ruleForm.bank_card_number,
                  bank_info: this.ruleForm.bank_info,
                  degree: degree_id,
                  entry_date: this.ruleForm.entry_date
                    ? util.formatData1(this.ruleForm.entry_date)
                    : "",
                  graduate_date: this.ruleForm.graduate_date
                    ? util.formatData2(this.ruleForm.graduate_date)
                    : "",
                  height: this.ruleForm.height,
                  personnel_number: this.ruleForm.personnel_number,
                  school: this.ruleForm.school,
                  specialty: this.ruleForm.specialty,
                  weight: this.ruleForm.weight,
                  remark: this.ruleForm.project_remark,
                  type: this.ruleForm.type ? "1" : "2",
                  is_supplier: this.ruleForm.station_value,
                  emergency_contact_person:this.ruleForm.emergency_contact_person,
                  emergency_contact_person_mobile:this.ruleForm.emergency_contact_person_mobile

                }
              ])
            };
          } else {
            _url = "/group/member_edit";
            _data = {
              team_id: this.team_id,
              project_id: this.project_id,
              user_id: this.ruleForm.user_id,
              user_name: this.ruleForm.real_name,
              phone: this.ruleForm.mobile,
              identity: curr_identity_id,
              group_id: this.ruleForm.group_id,
              gender: gender_id,
              idnumber: this.ruleForm.idnumber,
              address: "",
              province_id: this.selectedOptions[0],
              city_id: this.selectedOptions[1],
              district_id: this.selectedOptions[2],
              datail_address: this.ruleForm.datail_address,
              birthday: this.ruleForm.birthday
                ? util.formatData2(this.ruleForm.birthday)
                : "",
              bank: this.ruleForm.bank,
              bank_card_number: this.ruleForm.bank_card_number,
              bank_info: this.ruleForm.bank_info,
              degree: degree_id,
              entry_date: this.ruleForm.entry_date
                ? util.formatData1(this.ruleForm.entry_date)
                : "",
              leave_date: this.ruleForm.leave_date
                ? util.formatData1(this.ruleForm.leave_date)
                : "",
              graduate_date: this.ruleForm.graduate_date
                ? util.formatData2(this.ruleForm.graduate_date)
                : "",
              height: this.ruleForm.height,
              personnel_number: this.ruleForm.personnel_number,
              school: this.ruleForm.school,
              specialty: this.ruleForm.specialty,
              weight: this.ruleForm.weight,
              emergency_contact_person:this.ruleForm.emergency_contact_person,
              emergency_contact_person_mobile:this.ruleForm.emergency_contact_person_mobile,
              remark: this.ruleForm.project_remark
            };
          }
          // let isPass=this.verifyCustomFields(this.submitCustomFields)
          // if(isPass.length){
          //   this.$message({
          //     showClose: true,
          //     message: "请完善相关信息",
          //     type: "warning"
          //   });
          //   return;
          // }
          _data.form_list=JSON.stringify(this.submitCustomFields)
          console.log('555',_data);
          util.ajax({
            url: _url,
            type: "POST",
            data: _data,
            timeout: 10000,
            success: obj => {
              if (obj && obj.errno == 0) {
                // this.$message({
                //     showClose: true,
                //     message: '保存成功',
                //     type: 'success'
                // });
                this.dialogAddMembe = false;
                this.getMemberList();
                if (this.ruleForm.station_value == 1) {
                  this.dialogInvit = true;
                  this.getCodeLink(obj.data.group_id, obj.data.supplier_id);
                }
              }else if(obj && obj.errno == 38000){
                  this.$alert(obj.errmsg, '提示', {
                    confirmButtonText: '确定',
                    type: 'warning',
                    callback: action => {
                      console.log('action添加人员===', action)
                    }
                  })
                } else {
                this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: "warning"
                });
              }
            },
            error: (xhr, status) => {
              this.$message({
                showClose: true,
                message: "网络连接失败，请检查网络",
                type: "warning"
              });
            },
            noNetwork: () => {
              //网络超时
              this.$message({
                showClose: true,
                message: "网络连接失败，请检查网络",
                type: "warning"
              });
            }
          });
        } else {
          console.log("error submit!!");
          setTimeout(() => {
            $("#asd").scrollTop(0);
          });
          return false;
        }
      });
    },
    //自定义选项
    handleDialogCustomField(type){
      if(!this.ruleForm.group_id&&type=='open'){
        this.$message({
          showClose: true,
          message: '请先选择所属小组',
          type: 'warning'
        });
        return;
      }
      this.clearCustomField();
      this.toggleDialogCustomField('dialogCustomField');
    },
    //提交自定义字段
    submitCustomField(){
      this.validityCustomField().then(res=>{
        let formInfo=formFields[this.customFieldForm.region];
        formInfo.info.title=this.customFieldForm.name;
        util.ajax({
          url:'/form/v2',
          type:'POST',
          data:{
            team_id: this.team_id,
            project_id: this.project_id,
            title:this.customFieldForm.name,
            desc:'这是一个描述',
            format_info:JSON.stringify([formInfo]),
            group_list: JSON.stringify([this.ruleForm.group_id])
          },
          timeout:10000,
          success:(obj) => {
              if(obj && obj.errno == 0){
                  this.clearCustomField();
                  this.toggleDialogCustomField('dialogCustomField');
                  this.getCustomFields(this.ruleForm.group_id)
              }else{
                  this.$message({
                    showClose: true,
                    message: obj.errmsg,
                    type: 'warning'
                  });
              }
          },   
          error: (xhr, status) => {
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
      }).catch(err=>{
        let errorMsg={
          'name':'请输入字段名称',
          'region':'请选择字段类型'
        };
        this.$message({
          showClose: true,
          message: errorMsg[err],
          type: 'warning'
        });
      })
    },
    //验证自定义信息合法性
    validityCustomField(){
      return new Promise((reslove,reject)=>{
        this.customFieldForm.name=this.customFieldForm.name.replace(/\s*/g,"");
        if(!this.customFieldForm.name){
          reject('name')
        }
        if(!this.customFieldForm.region){
          reject('region')
        }
        reslove();
      })
    },
    //清空自定义信息
    clearCustomField(){
      this.customFieldForm= {
        name: '',
        region: '',
      };
    },
    //关闭/打开自定义信息弹框
    toggleDialogCustomField(dialogName){
      this[dialogName] = !this[dialogName];
    },
    //校验动态表单的必填值
    verifyCustomFields(data){
      return data.filter((v,i)=>{
        return v.info[0].info.value==''&&!!v.info[0].info.required
      })
    },
    getCodeLink(group_id, supplier_id) {
      util.ajax({
        url: "/group/qrcode_link",
        type: "GET",
        data: {
          group_id: group_id,
          team_id: this.team_id,
          project_id: this.project_id,
          invite_user_id: supplier_id,
          type: 2
        },
        timeout: 10000,
        success: obj => {
          console.log(obj);
          if (obj && obj.errno == 0) {
            this.useqrcode(obj.data.qrcode_url_link);
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //生成二维码
    useqrcode(code_link) {
      let canvas = document.getElementById("canvas");
      this.ruleForm.link = code_link;
      QRCode.toCanvas(canvas, code_link, function(error) {
        // console.error(error)
      });
    },
    //生成续签码
    updateQRcode(){
      util.ajax({
        url: "/protocol/renew_code/get",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: obj => {
          console.log(obj);
          if (obj && obj.errno == 0) {
            // this.useqrcode(obj.data.qrcode_url_link);
            let canvas = document.getElementById("QRcanvas");
            QRCode.toCanvas(canvas, obj.data.code_url, function(error) {
              // console.error(error)
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //判断是否显示续签码按钮
    renewCodeStatus(){
      util.ajax({
        url: "/project/protocol_renew_code/status",
        type: "GET",
        data: {
          project_id: this.project_id,
        },
        timeout: 10000,
        success: obj => {
          this.isShowRenewQRcode=obj.data.status
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    exportCanvasAsPNG(id, fileName) {

        var canvasElement = document.getElementById(id);

        var MIME_TYPE = "image/png";

        var imgURL = canvasElement.toDataURL(MIME_TYPE);

        var dlLink = document.createElement('a');
        dlLink.download = fileName;
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

        document.body.appendChild(dlLink);
        dlLink.click();
        document.body.removeChild(dlLink);
    },
    //取消按钮
    resetFormMember(formName) {
      this.idnumberReg = false;
      this.heightReg = false;
      this.weightReg = false;
      this.$refs[formName].resetFields();
      this.dialogAddMembe = false;
      this.pream = 1;
      this.selectedOptions = [];
    },
    closeMemberInfoDialog() {
      this.getMemberList();
    },
    //邀请加入--跳转页面
    inviteToJoin() {
      this.$router.replace("invitationmember");
    },
    //续签码,取消和关闭续签码弹窗
    renewQRcode(){
      this.updateQRcode()
      this.renewQRcodeDialog=!this.renewQRcodeDialog
    },
    /******************弹窗————批量导入上传*******************/
    //获取模板下载地址
    mbImport() {
      this.dialogImport = true;
      util.ajax({
        url: "/group/tmp/upload",
        type: "GET",
        data: {},
        timeout: 10000,
        success: obj => {
          if (obj && obj.errno == 0) {
            this.import_exel = obj.data;
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
      //获取小组列表
      this.getGroupList();
    },
    //下载模板
    importExel() {
      location.href = this.import_exel;
    },
    onChange() {
      let that = this;
      if ($("#upfile")) {
        var file_data = $("#upfile1").prop("files")[0];
        this.file_text = file_data["name"];
        this.file_speed = true;
        if (file_data["size"] / 1024 / 1024 > 1) {
          this.$message({
            showClose: true,
            message: "文件大小不能超过 1MB!",
            type: "warning"
          });
          return;
        }
        interval = setInterval(function() {
          if (that.speed != 100) {
            that.speed += 40;
          } else {
            that.file_speed = false;
            clearInterval(interval);
            return;
          }
        }, 1000);
      }
    },
    fileClose() {
      this.file_text = "";
      this.file_speed = false;
      this.speed = 60;
      document.getElementById("upfile").reset();
      clearInterval(interval);
    },
    //上传提交
    submitImport(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.file_text == "") {
            this.$message({
              showClose: true,
              message: "选择你要导入的文件",
              type: "warning"
            });
            return;
          }
          this.loadingImport = true;
          var form_data = new FormData();
          var file_data = $("#upfile1").prop("files")[0];
          form_data.append("team_id", this.team_id);
          form_data.append("project_id", this.project_id);
          form_data.append("group_id", this.ruleForm.importValue);
          form_data.append("import_file", file_data);
          $.ajax({
            url:
              util.host +
              "/sea/api/1.0/client/v1/group/batch/member_import?dmclient=pcweb&X-Doumi-Agent=weixinqy",
            type: "POST",
            data: form_data,
            processData: false,
            contentType: false,
            xhrFields: {
              withCredentials: true
            },
            timeout: 10000,
            success: obj => {
              // console.log(obj)
              this.dialogImport = false;
              if (obj && obj.errno == 0) {
                this.loadingImport = false;
                if (obj.data.error_list.length == 0) {
                  this.$message({
                    message: "导入成功",
                    type: "success"
                  });

                  this.page_no = 1;
                  this.currentPage = 1;
                  this.getMemberList();
                }
                if (obj.data.error_list.length > 0) {
                  util.setLocalStorage("memberErrorList", obj.data);
                  this.$router.replace("membererror");
                }
                document.getElementById("upfile").reset();
              }else if(obj && obj.errno == 38000){
                this.$alert(obj.errmsg, '提示', {
                  confirmButtonText: '确定',
                  type: 'warning',
                  callback: action => {
                    console.log('action批量导入===', action)
                  }
                })
                this.loadingImport = false;
                document.getElementById("upfile").reset();
              } else {
                this.loadingImport = false;
                this.$message({
                  message: obj.errmsg,
                  type: "warning"
                });
                document.getElementById("upfile").reset();
              }
            },
            error: (xhr, status) => {
              this.loadingImport = false;
              document.getElementById("upfile").reset();
              this.$message({
                showClose: true,
                message: "网络连接失败，请检查网络",
                type: "warning"
              });
            },
            noNetwork: () => {
              this.loadingImport = false;
              document.getElementById("upfile").reset();
              //网络超时
              this.$message({
                showClose: true,
                message: "网络连接失败，请检查网络",
                type: "warning"
              });
            }
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    cancelImport(formName) {
      this.$refs[formName].resetFields();
      this.dialogImport = false;
      this.file_text = "";
      this.file_speed = false;
      this.speed = 60;
      clearInterval(interval);
      document.getElementById("upfile").reset();
    },
    sureClose() {
      this.progressDialog = false;
    },
    //导出列表
    exportMemberList() {
      // let group_id_arr = [];
      // if(this.selected_groups.length > 0){
      //   this.selected_groups.forEach(function(item){
      //     group_id_arr.push(item.id)
      //   })
      // }
      // let group_ids = group_id_arr.toString()
      if (navigator.onLine) {
        this.percentage = 0;
        this.progressInfo = '';
        this.progressDialog = true;
        this.canClosed = true;
        // 导出接口参数----搜索项参数
        if (this.fromData.stationCity) {
          this.stationArr.forEach(i => {
            if (i.id == this.fromData.stationCity) {
              this.seach_station_id = i.station_id;
              this.seach_station_city_id = i.city_id;
            }
          });
        }
        if (this.states.length != 0) {
          if (
            !this.fromData.currSeachRester.user_id &&
            this.states[0].status == -1 &&
            this.fromData.member
          ) {
            this.tableData.user_info.user_list = [];
            return false;
          }
          if (!this.fromData.member && !this.fromData.supplierName) {
            this.seachData = 0;
            this.seachSupplierData = 0;
            // this.getMemberList();
            // return false;
          }
          if (
            this.fromData.currSeachRester.user_id == -1 &&
            this.states[0].status == -1
          ) {
            this.seachData = 0;
            this.seachSupplierData = 0;
            // this.getMemberList();
            // return false;
          }
        }
        if (!this.fromData.currSeachRester.user_id && this.states) {
          let searchDataArr = [];
          let searchSupplierDataArr = [];
          this.states.forEach(o => {
            if (o.hasOwnProperty("user_id")) {
              searchDataArr.push(o.user_id);
            }
            if (o.hasOwnProperty("supplier_id")) {
              searchSupplierDataArr.push(o.supplier_id);
            }
          });
          if (searchDataArr.length > 0) {
            this.seachData = searchDataArr;
          }
          if (searchSupplierDataArr.length > 0) {
            this.seachSupplierData = searchSupplierDataArr;
          } else {
            this.seachSupplierData = "";
          }
          // this.getMemberList();
          // return false;
        }
        
        if (
          this.fromData.currSeachRester.user_id &&
          this.states &&
          this.fromData.currSeachRester.user_id != -1
        ) {
          this.seachData = this.fromData.currSeachRester.user_id;
          // this.getMemberList();
          // return false;
        }
        if (!this.fromData.member) {
          this.seachData = 0;
          // this.getMemberList();
          // return false;
        }
        // ----处理导出接口需要的参数
        let showLevel = 1;
        let curr_select_group = [];
        if (this.fromData.statusValue === 0) {
          showLevel = 0;
        } else if (this.fromData.statusValue == 1) {
          showLevel = 1;
        } else if (this.fromData.statusValue == -1) {
          showLevel = -1;
        }else if (this.fromData.statusValue == -2) {
          showLevel = -2;
        }else if (this.fromData.statusValue == -3) {
          showLevel = -3;
        }
        if (this.selected_groups.length != 0) {
          this.selected_groups.forEach(i => {
            curr_select_group.push(i.id);
          });
        } else {
          curr_select_group = "";
        }
        let _data = {
          team_id: this.team_id,
          project_id: this.project_id,
          group_id: JSON.stringify(curr_select_group), //4142
          show_level: showLevel,
          // page_no: this.seachData != "" ? "" : this.page_no,
          // page_size: this.seachData != "" ? "" : 20,
          user_id: this.seachData,
          // is_comment: 0,
          // show_range_field: 1,
          station_id: "" || this.seach_station_id,
          station_city_id: "" || this.seach_station_city_id,
          protocol_status: this.fromData.protocolStatus,
          // filter_protocol_date: this.fromData.filterProtocolDate,
          supplier_id: this.seachSupplierData,
          identity: this.fromData.identity,
          worker_source: this.fromData.source_from_value,
          insurance_status: this.fromData.insurance_status,
          fund_status: this.fromData.fund_status,
          supplier_name: this.fromData.supplier_name,
        };
        console.log('_data===', _data);
        util.ajax({
          url: "/group/export_member_v2",
          type: "GET",
          data: _data,
          timeout: 10000,
          success: obj => {
            console.log(obj, '导出obj===');
            this.loading = false;
            if (obj && obj.errno == 0) {
              this.getCurrProgress();
            } else {
              this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: 'warning'
              });
            }
          },
          error: (xhr, status) => {
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          }
        });
        // let href =
        //   "/sea/api/1.0/client/v1/group/export_member?dmclient=pcweb&team_id=" +
        //   this.team_id +
        //   "&project_id=" +
        //   this.project_id +
        //   "&group_ids=" + group_ids +
        //   "&type=2" + "&show_level=" + this.fromData.statusValue + "&group_ids=" + this.fromData.member+ "&worker_source=" + this.fromData.source_from_value + "&group_ids=" + this.fromData.stationCity + "&protocolStatus=" + this.fromData.protocolStatus + "&supplier_id=" + this.fromData.supplierName + "&identity=" + this.fromData.identity;
        // util.locationHref(href);
      } else {
        this.$message({
          showClose: true,
          message: "网络连接失败，请检查网络",
          type: "warning"
        });
      }
    },
    // 获取导出结果
    getCurrProgress() {
      let data = {
        project_id: this.project_id,
      };
      util.ajax({
        url: '/group/export_member_getresult',
        type: 'GET',
        data: data,
        timeout: 1000 * 10 * 60,
        success: (res) => {
          // console.log('查询导入进程===', res);
          if (res.errno == 0 && res.data.end_time == 0) {
            this.progressInfo = "正在处理数据中，请耐心等待~";
            // let _time = 0;
            //   this.timer = setInterval(() => {
            //     _time++;
            //     if (_time > 199) {
            //       clearInterval(this.timer)
            //     };
            setTimeout(()=> {
              this.getCurrProgress();
            }, 1500)
              // }, 1000)
          } else if(res.errno == 0 && res.data.end_time > 0 && res.data.file_url){
            // console.log('jieshu===', Date())
            this.percentage = 100;
            this.progressInfo = "导出完成";
            window.location.href = res.data.file_url;
            this.canClosed = false;
          } else {
            this.canClosed = false;
            this.progressDialog = false;
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'error'
            });
          }
        },
        error: (xhr, status) => {
          this.canClosed = false;
          this.progressDialog = false;
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        },
        noNetwork: () => {
          this.canClosed = false;
          this.progressDialog = false;
          //网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    // 查看导出列表
    showAllExportList() {
      this.dialogExportVisible = true;
      this.exportList();
    },
    /**************table--title点击更多操作*****************/
    clickMore(column, event) {
      event.stopPropagation();
      if (column.labelClassName === "more") {
        if (this.isshow) {
          this.isshow = false;
        } else {
          this.isshow = true;
        }
      }
    },
    /*table--title点击确定按钮操作*/
    selConfirm() {
      let curSelectArr = [];
      let postAjaxCurr = [];
      this.tableData.header.custom_field.forEach(item => {
        if (item.is_selected == 1) {
          curSelectArr.push(item);
        }
      });
      curSelectArr.forEach(o => {
        postAjaxCurr.push(o.id);
      });
      util.ajax({
        url: "/group/member/list/show/setting",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          show_field: postAjaxCurr
        },
        timeout: 10000,
        success: obj => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.getMemberList();
            this.tableData.header.show_custom_field = curSelectArr;
            this.isshow = false;
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        },
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    /*********************人员搜索****************/
    //人员检索
    querySearch(queryString, cb) {
      if (queryString) {
        this.fromData.currSeachRester = "";
        this.states = [];
        util.ajax({
          url: "/group/member_search",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            group_id: "",
            keyword: queryString,
            page_no: "",
            page_size: ""
          },
          timeout: 10000,
          success: obj => {
            if (obj && obj.errno == 0) {
              let strArr = [];
              obj.data.list.forEach(o => {
                let str = "";
                str = {
                  value: o.user_name,
                  group_name: o.group_name,
                  group_id: o.group_id,
                  user_id: o.user_id
                };
                strArr.push(str);
              });
              this.restaurants = strArr;
              var results = queryString
                ? this.restaurants.filter(this.createFilter(queryString))
                : this.restaurants;
              if (results.length == 0) {
                results.push({ value: "无搜索结果", status: "-1" });
              }
              this.states = results;
              clearTimeout(this.timeout);
              this.timeout = setTimeout(() => {
                // 调用 callback 返回建议列表的数据
                cb(results);
              }, 1000 * Math.random());
            } else {
              this.$message({
                showClose: true,
                message: obj.errmsg,
                type: "warning"
              });
            }
          },
          error: (xhr, status) => {
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          }
        });
      }
    },
    // 供应商检索
    querySearchSupplier(queryString, cb) {
      if (queryString) {
        this.fromData.currSeachRester = "";
        this.states = [];
        util.ajax({
          url: "/group/supplier_search",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            group_id: "",
            keyword: queryString,
            page_no: "",
            page_size: ""
          },
          timeout: 10000,
          success: obj => {
            if (obj && obj.errno == 0) {
              let strArr = [];
              obj.data.list.forEach(o => {
                let str = {
                  value:       o.supplier_name,
                  group_name:  o.group_name,
                  group_id:    o.group_id,
                  supplier_id: o.supplier_id
                };
                strArr.push(str);
              });
              this.restaurants = strArr;
              var results = queryString
                ? this.restaurants.filter(this.createFilter(queryString))
                : this.restaurants;
              if (results.length == 0) {
                results.push({ value: "无搜索结果", status: "-1" });
              }
              this.states = results;
              clearTimeout(this.timeout);
              this.timeout = setTimeout(() => {
                // 调用 callback 返回建议列表的数据
                cb(results);
              }, 1000 * Math.random());
            } else {
              this.$message({
                showClose: true,
                message: obj.errmsg,
                type: "warning"
              });
            }
          },
          error: (xhr, status) => {
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          },
          noNetwork: () => {
            //网络超时
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning"
            });
          }
        });
      }
    },
    createFilter(queryString) {
      return restaurant => {
        return (
          restaurant.value.toLowerCase() ||
          restaurant.value.indexOf(queryString) > -1
        );
      };
    },
    //搜索建议列表选择赋值
    handleSelect(item) {
      if (item.status == -1) {
        this.fromData.member = "";
        this.fromData.currSeachRester = "";
      } else {
        this.fromData.currSeachRester = item;
      }
    },

    //搜索按钮
    seachMember(filterProtocolDate) {
      this.fromData.filterProtocolDate = filterProtocolDate;
      this.page_no = 1;
      this.currentPage = 1;

      console.log(this.states)

      if (this.fromData.stationCity) {
        this.stationArr.forEach(i => {
          if (i.id == this.fromData.stationCity) {
            this.seach_station_id = i.station_id;
            this.seach_station_city_id = i.city_id;
          }
        });
      }
      if (this.states.length != 0) {
        if (
          !this.fromData.currSeachRester.user_id &&
          this.states[0].status == -1 &&
          this.fromData.member
        ) {
          this.tableData.user_info.user_list = [];
          return false;
        }
        if (!this.fromData.member && !this.fromData.supplierName) {
          this.seachData = 0;
          this.seachSupplierData = 0;
          this.getMemberList();
          return false;
        }
        if (
          this.fromData.currSeachRester.user_id == -1 &&
          this.states[0].status == -1
        ) {
          this.seachData = 0;
          this.seachSupplierData = 0;
          this.getMemberList();
          return false;
        }
      }
      if (!this.fromData.currSeachRester.user_id && this.states) {
        let searchDataArr = [];
        let searchSupplierDataArr = [];
        this.states.forEach(o => {
          if (o.hasOwnProperty("user_id")) {
            searchDataArr.push(o.user_id);
          }
          if (o.hasOwnProperty("supplier_id")) {
            searchSupplierDataArr.push(o.supplier_id);
          }
        });
        if (searchDataArr.length > 0) {
          this.seachData = searchDataArr;
        }
        if (searchSupplierDataArr.length > 0) {
          this.seachSupplierData = searchSupplierDataArr;
        } else {
          this.seachSupplierData = "";
        }
        this.getMemberList();
        return false;
      }
      if (
        this.fromData.currSeachRester.user_id &&
        this.fromData.currSeachRester.user_id != -1
      ) {
        this.seachData = this.fromData.currSeachRester.user_id;
        this.getMemberList();
        return false;
      }
      if (
        this.fromData.currSeachRester.user_id &&
        this.states &&
        this.fromData.currSeachRester.user_id != -1
      ) {
        this.seachData = this.fromData.currSeachRester.user_id;
        this.getMemberList();
        return false;
      }
      if (!this.fromData.member) {
        this.seachData = 0;
        this.getMemberList();
        return false;
      }

      // if(this.fromData.currSeachRester == '' || this.fromData.member == ''){
      //     this.seachData = ''
      //     this.getMemberList()
      // }else if(this.fromData.member != '' && this.fromData.currSeachRester != ''){
      //     this.seachData = this.fromData.currSeachRester.user_id
      //     this.getMemberList()
      // }
    },
    //获取权限
    getPermissions() {
      this.admins.removeMemberPre = false;//离职
      this.admins.deleteMemberPre = false;//删除
      this.admins.addMemberPre = false;
      this.admins.inviMemberPre = false;
      this.admins.creatGroupPre = false;
      this.admins.project_auto_clean = false;
      this.admins.exportMemberPre = false;
      this.admins.importMemberPre = false;
      this.admins.moveGroupPre = false;
      this.admins.edit_Pre = false;
      this.admins.changeStationPre = false;
      this.admins.changeStationCityPre = false;
      this.admins.changeProtocolStatusPre = false;
      util.ajax({
        url: "/permission/application",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          application_id: 0
        },
        timeout: 10000,
        success: obj => {
          console.log("1111111111", this.is_nx_project);
          console.log('this.admins.AdminUserFlag===application', this.admins.AdminUserFlag);
          console.log("1111111111", 'obj');
          console.log(obj);
          if (obj && obj.errno == 0) {
            obj.data.forEach(i => {
              if (i.id_name == "remove_group_member") {
                this.admins.removeMemberPre = true;
              } else if (i.id_name == "delete_group_member") {
                this.admins.deleteMemberPre = true;
              } else if (i.id_name == "add_group_member") {
                this.admins.addMemberPre = true;
              } else if (i.id_name == "show_handle_invite") {
                this.admins.inviMemberPre = true;
              } else if (i.id_name == "create_group") {
                this.admins.creatGroupPre = true;
              } else if (i.id_name == "project_auto_clean") {
                this.admins.project_auto_clean = true;
              } else if (i.id_name == "export_member") {
                this.admins.exportMemberPre = true;
              } else if (i.id_name == "import_member") {
                this.admins.importMemberPre = true;
              } else if (i.id_name == "move_user_group") {
                this.admins.moveGroupPre = true;
              } else if (i.id_name == "editPre") {
                this.admins.edit_Pre = true;
              } else if (i.id_name == "change_supplier_relation") {
                this.admins.changeStationPre = true;
              } else if (i.id_name == "change_station_city") {
                this.admins.changeStationCityPre = true;
              } else if (i.id_name == "show_protocol_status_condition") {
                this.admins.changeProtocolStatusPre = true;
              } else if (i.id_name == "naixue_saas_project_ids_group") {
                this.admins.groupLeaderFlag = true;
                console.log('99999999999---', 999999999)
                console.log('-----111', 111)
              } else if (i.id_name == "naixue_saas_project_ids_admin") {
                this.admins.AdminUserFlag = true;
              }
            });
            if(this.is_nx_project) {
              this.admins.exportMemberPre = true;
            }
            console.log('this.admins.AdminUserFlag--', this.admins.AdminUserFlag)
            console.log('this.admins.groupLeaderFlag==', this.admins.groupLeaderFlag);
            console.log(this.admins.groupLeaderFlag,this.admins.moveGroupPre,  this.admins.removeMemberPre,'!!!');
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    //获取地区列表
    getAddressListData() {
      util.ajax({
        url: "/common/geography/get",
        type: "GET",
        data: {
          team_id: 0,
          project_id: 0
        },
        timeout: 10000,
        success: obj => {
          // console.log(JSON.stringify(obj))
          if (obj && obj.errno == 0) {
            this.options = obj.data;
            this.options.forEach(prov => {
              prov.label = prov.short_name;
              delete prov.short_name;
              prov.value = prov.province_id;
              delete prov.province_id;
              prov.children = prov.child;
              delete prov.child;
              prov.children.forEach(city => {
                city.label = city.short_name;
                delete city.short_name;
                city.value = city.city_id;
                delete city.city_id;
                city.children = city.child;
                delete city.child;
                city.children.forEach(distr => {
                  distr.label = distr.short_name;
                  delete distr.short_name;
                  distr.value = distr.district_id;
                  delete distr.district_id;
                });
              });
            });
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    downLoadFile(file) {
      if(file) {
        window.location.href = file;
      } else {
        this.$message({
          showClose: true,
          message: '文件下载出了问题',
          type: "warning"
        });
      }
    },
    export_handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
      this.export_currentPage = val;
      this.exportList();
    },
    exportList() {
      util.ajax({
        url: "/group/export_member_list",
        type: "GET",
        data: {
          project_id: this.project_id,
          page_no: this.export_currentPage,
          page_size: this.export_pageSize,
          type: 1,
        },
        timeout: 10000,
        success: obj => {
          // console.log(JSON.stringify(obj))
          if (obj && obj.errno == 0) {
            this.exportData = obj.data.list;
            this.export_total_num = Number(obj.data.total_count) || 0;
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning"
            });
          }
        },
        error: (xhr, status) => {},
        noNetwork: () => {
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning"
          });
        }
      });
    },
    getIsNxProject() {
      setTimeout(()=> {
        this.is_nx_project = JSON.parse(window.localStorage.getItem('isNxProject'));
        console.log('this.is_nx_project===getIsNxProject', this.is_nx_project)
        this.getPermissions()
      }, 800)
    },
  },
  created() {},
  mounted() {
    this.init();
    this.renewCodeStatus()
    console.log(123);
    let that = this;
    $(window).click(() => {
      that.isshow = false;
    });
    let oldH = $(window).height();
    this.winHeight = $(window).height() - 300 - 10;
    $(window).resize(function() {
      that.winHeight = $(window).height() - 300 - 10;
      if ($(window).height() == oldH) {
        that.winHeight = $(window).height() - 300 - 10;
      }
    });
    this.getIsNxProject();
  },
  watch: {
    $route(to, from) {
      this.getIsNxProject();
    },
    "ruleForm.group_id"(){
      console.log('changeeeee');
      this.getCustomFields(this.ruleForm.group_id)
    },
  },
};
</script>

<style  src='../assets/css/member.css'></style>
<style>
#memberAdmin .leave_dialog .el-dialog {
  width: 420px;
}
#memberAdmin .leave_dialog .el-radio-button__inner {
  border-radius: 2px;
  border-left: none;
  border: 1px solid #bfcbd9;
}
#memberAdmin
  .leave_dialog
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  box-shadow: none;
}
#memberAdmin .leave_dialog .my-margin {
  margin: 0 15.5px !important;
}

#memberAdmin .leave_dialog .my-radio-button {
  margin-right: 10px;
  margin-bottom: 10px;
}
#memberAdmin .leave_dialog .dialog_main {
  padding: 30px 40px;
}
#memberAdmin .protocol_dialog .dialog_foot,
#memberAdmin .leave_dialog .dialog_foot {
  height: 68px;
}
#memberAdmin .protocol_dialog .dialog_foot .btns,
#memberAdmin .leave_dialog .dialog_foot .btns {
  float: right;
  margin: 16px 20px;
}
#memberAdmin .protocol_dialog .dialog_main .leave_item,
#memberAdmin .leave_dialog .dialog_main .leave_item {
  height: 36px;
  margin-bottom: 16px;
}
#memberAdmin .protocol_dialog .dialog_main .leave_item .item_left,
#memberAdmin .leave_dialog .dialog_main .leave_item .item_left {
  float: left;
  font-family: "PingFangSC-Regular";
  font-size: 14px;
  color: #475669;
  line-height: 36px;
  padding-right: 16px;
}
#memberAdmin .protocol_dialog .dialog_main .leave_item .item_right,
#memberAdmin .leave_dialog .dialog_main .leave_item .item_right {
  float: left;
  height: 36px;
}
#memberAdmin .leave_dialog .item_left {
  /*width:49px;*/
  width: 56px;
  padding-right: 15px;
  font-family: "PingFangSC-Regular";
  font-size: 12px;
  color: #475669;
  line-height: 20px;
}

#memberAdmin .dialog-batch-protocol .el-dialog{
  width:420px;
}
#memberAdmin .dialog-batch-protocol .el-dialog__body{
  padding: 27px 40px 0px 38px;
}
#memberAdmin .dialog-batch-protocol .myform{
    width: 381px;
    height: 250px;
    padding: 5px 40px 5px 0;
    overflow-y: auto;
    box-sizing: border-box;
}
#memberAdmin .dialog-batch-protocol .el-form-item{
  margin-bottom: 16px;
  width: 342px;
}
#memberAdmin .dialog-batch-protocol .el-dialog__footer{
  border-top: 1px solid #e0e6ed;
    padding: 16px 20px 16px 0;
}
#memberAdmin .dialog-batch-protocol .protocol-attention{
  color: #6699ee;
  font-size: 14px;
  margin-bottom: 20px;
}
#memberAdmin .dialog-section{
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding-bottom:40px;
}
#memberAdmin .QRcode-container{
  width: 200px;
  height: 200px;
}
#memberAdmin .QRcode-download{
  margin: 20px auto 20px;
}
.applications .station .personnelScopeWrap .ps_raio .el-radio .el-radio__label {
  color: #8492a6;
}
</style>
<style scoped>
.el-loading-spinner .circular {
  margin-left: -20px;
}
.maintainer-box {
  padding: 20px;
}
.maintainerInput {
  width: 100%;
}
.maintainerTip {
  padding-bottom: 30px;
  line-height: 20px;
}
.maintainerTip::before {
  content: "*";
  color: #ff0000;
  position: relative;
  top: 2px;
}
.sign_tip_item{
    color: red;
    cursor: pointer;
    float:right;
}
.sign_tip_item.mg_l{
  margin-left:5px;
}
.sign_tip_div{
  font-size:14px;
  line-height: 18px;
}
.personnelScopeWrap {
  margin:0 0 10px 0;
}
.ps_title {
  line-height: 20px;
  font-size: 14px;
  color: #8492a6;
  margin-bottom: 16px;
}
.ps_raio {
  margin: 5px 0;
}
.ps_tips {
  margin: 16px 0 0 0;
}
.ps_tips p {
  line-height: 20px;
  font-size: 14px;
  color: #8492a6;
  margin-bottom: 3px;
}
</style>