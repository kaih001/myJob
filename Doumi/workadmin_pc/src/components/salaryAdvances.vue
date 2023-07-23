<template>
  <div id="SalaryWrapper">
    <div class="customer-wapper">
      <h1>工资预支</h1>
      <div class="mytabs">
        <el-tabs v-model="activeTabName" @tab-click="tabsClick">
          <el-tab-pane label="应发工资" name="0">
            <div class="notConfirmTableList" id="notConfirmId">
              <div class="search-pannel">
                <el-row>
                  <!-- <el-col :span="8">
                            <label>姓名/手机号：</label>
                            <el-input
                              v-model="searchData1.nameOrPhone"
                              placeholder="姓名/手机号"
                              @change="searchNameOrPhone"
                            ></el-input>
                          </el-col> -->
                  <el-col :span="8">
                    <label>姓名/手机号：</label>
                    <el-autocomplete
                      popper-class="my-autocomplete2"
                      style="width: 135px"
                      v-model="nameOrPhone1"
                      :fetch-suggestions="querySearch"
                      custom-item="my-item-zh"
                      :trigger-on-focus="true"
                      placeholder="姓名/手机号"
                      @select="handleSelect"
                    >
                    </el-autocomplete>
                  </el-col>
                  <el-col :span="8">
                    <label>工作日期：</label>
                    <el-date-picker
                      v-model="searchData1.workDate"
                      range-separator="至"
                      type="daterange"
                      placeholder="选择日期范围"
                      @change="searchWorkDate"
                    >
                    </el-date-picker>
                  </el-col>
                </el-row>
              </div>
              <div class="operate-pannel">
                <div class="">
                  <el-button type="primary" @click="addPaySalary"
                    >添加应发工资</el-button
                  >
                  <el-button type="primary" @click="uploadPaySalary"
                    >上传应发工资</el-button
                  >
                  <el-button type="primary" @click="deletePaySalary"
                    >删除</el-button
                  >
                </div>
              </div>
              <el-table
                tooltip-effect="dark"
                style="width: 100%"
                :height="winHeight"
                :data="salaryTableData"
                @selection-change="handleWageelectionChange"
                empty-text="暂无数据"
                border
              >
                <el-table-column
                  type="selection"
                  width="55"
                  :selectable="isSlected"
                >
                </el-table-column>
                <el-table-column
                  label="姓名"
                  prop="user_name"
                  width="120"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column
                  label="手机号"
                  prop="mobile"
                  show-overflow-tooltip
                  width="150"
                >
                  <template slot-scope="scope">
                    <el-icon name="mobile"></el-icon>
                    <el-popover
                      placement="top"
                      title=""
                      width="150"
                      trigger="hover"
                    >
                      <span style="margin-left: 35px">{{
                        scope.row.mobile
                      }}</span>
                      <span slot="reference">{{
                        scope.row.mobile
                          ? scope.row.mobile.substr(0, 3) +
                            "****" +
                            scope.row.mobile.substr(7)
                          : ""
                      }}</span>
                    </el-popover>
                  </template>
                </el-table-column>
                <el-table-column
                  label="工作日期"
                  prop="work_date_text"
                  show-overflow-tooltip
                  width="220"
                >
                </el-table-column>
                <el-table-column
                  label="工作量"
                  prop="workload"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column
                  label="申请预支金额"
                  prop="amount"
                  show-overflow-tooltip
                  width="150"
                >
                </el-table-column>
                <el-table-column
                  label="本月正常发薪日"
                  prop="pay_date_text"
                  show-overflow-tooltip
                  width="180"
                >
                </el-table-column>
                <el-table-column
                  label="当前状态"
                  prop="listing_status_text"
                  show-overflow-tooltip
                  width="180"
                >
                </el-table-column>
              </el-table>
              <!-- 分页组件 -->
              <div class="page">
                <div class="block">
                  <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentPageChange"
                    :current-page.sync="pagination1.currentPage"
                    :page-size="pagination1.pageSize"
                    layout="total, prev, pager, next"
                    :total="parseInt(pagination1.total_num)"
                  >
                  </el-pagination>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="员工申请列表" name="1">
            <div class="confirmTableList" id="confirmId">
              <div class="search-pannel">
                <el-row>
                  <!-- <el-col :span="8">
                              <label>姓名/手机号：</label>
                              <el-input
                                v-model="searchData2.nameOrPhone"
                                placeholder="姓名/手机号"
                              ></el-input>
                            </el-col> -->
                  <el-col :span="8">
                    <label>姓名/手机号：</label>
                    <el-autocomplete
                      popper-class="my-autocomplete2"
                      style="width: 135px"
                      v-model="nameOrPhone2"
                      :fetch-suggestions="querySearch"
                      custom-item="my-item-zh"
                      :trigger-on-focus="true"
                      placeholder="姓名/手机号"
                      @select="handleSelect2"
                    >
                    </el-autocomplete>
                  </el-col>
                  <el-col :span="8">
                    <label>当前状态：</label>
                    <el-select
                      v-model="searchData2.status"
                      placeholder="请选择"
                      @change="searchListingStatus"
                    >
                      <el-option
                        v-for="item in listingStatusList"
                        :key="item.id"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                  </el-col>
                  <el-col :span="8">
                    <label>申请日期：</label>
                    <el-date-picker
                      v-model="searchData2.applyDate"
                      range-separator="至"
                      type="daterange"
                      placeholder="选择日期范围"
                      @change="searchApplyDate"
                    >
                    </el-date-picker>
                  </el-col>
                </el-row>
              </div>
              <div class="operate-pannel">
                <!-- <div class="">
                  当前有<i class="nums">{{ applyApprovalNums }}</i
                  >条待审批
                </div> -->
                <div class="">
                  <!-- <el-button type="primary" @click="audit('5')"
                    >审批通过</el-button
                  >
                  <el-button type="primary" @click="audit('3')"
                    >审批拒绝</el-button
                  > -->
                  <el-button type="primary" @click="exportApplyData"
                    >导出数据</el-button
                  >
                </div>
              </div>
              <el-table
                tooltip-effect="dark"
                style="width: 100%"
                :height="winHeight"
                :data="applyTableData"
                empty-text="暂无数据"
                @selection-change="handleApplyelectionChange"
                border
              >
                <!-- <el-table-column
                  type="selection"
                  width="55"
                  fixed="left"
                  :selectable="isApplySlected"
                >
                </el-table-column> -->
                <el-table-column
                  label="姓名"
                  prop="user_name"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column
                  label="手机号"
                  prop="mobile"
                  show-overflow-tooltip
                  width="150"
                >
                  <template slot-scope="scope">
                    <el-icon name="mobile"></el-icon>
                    <el-popover
                      placement="top"
                      title=""
                      width="150"
                      trigger="hover"
                    >
                      <span style="margin-left: 35px">{{
                        scope.row.mobile
                      }}</span>
                      <span slot="reference">{{
                        scope.row.mobile
                          ? scope.row.mobile.substr(0, 3) +
                            "****" +
                            scope.row.mobile.substr(7)
                          : ""
                      }}</span>
                    </el-popover>
                  </template>
                </el-table-column>
                <el-table-column
                  label="申请预支金额"
                  prop="advance_amount"
                  show-overflow-tooltip
                  width="150"
                >
                </el-table-column>
                <el-table-column
                  label="申请日期"
                  prop="create_at"
                  show-overflow-tooltip
                  width="200"
                >
                </el-table-column>
                <el-table-column
                  label="当前状态"
                  prop="listing_status_txt"
                  show-overflow-tooltip
                  width="150"
                >
                </el-table-column>
                <el-table-column
                  label="利息"
                  prop="interest_amount"
                  show-overflow-tooltip
                  width="200"
                >
                  <template slot-scope="scope">
                    <div>{{ scope.row.interest_amount }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  label="实际到账"
                  prop="actual_amount"
                  show-overflow-tooltip
                  width="130"
                >
                </el-table-column>
                <!-- <el-table-column
                  label="是否到钱包"
                  prop="is_wallet"
                  show-overflow-tooltip
                  width="130"
                >
                  <template slot-scope="scope">
                    <div>{{ scope.row.is_wallet == 0 ? "否" : "是" }}</div>
                  </template>
                </el-table-column> -->
                <el-table-column
                  label="是否提现"
                  prop="is_withdraw"
                  show-overflow-tooltip
                  width="130"
                >
                  <template slot-scope="scope">
                    <div>{{ scope.row.is_withdraw == 0 ? "否" : "是" }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  label="还款金额"
                  prop="repayment_amount"
                  show-overflow-tooltip
                  width="130"
                >
                </el-table-column>
                <el-table-column
                  label="还款时间"
                  prop="repayment_at"
                  show-overflow-tooltip
                  width="130"
                >
                </el-table-column>
                <!-- <el-table-column
                  align="center"
                  label="操作"
                  width="70"
                  fixed="right"
                >
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      size="small"
                      @click="audit(scope.row)"
                      >审核</el-button
                    >
                  </template>
                </el-table-column> -->
              </el-table>
              <!-- 分页组件 -->
              <div class="page">
                <div class="block">
                  <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentPageChange"
                    :current-page.sync="pagination2.currentPage"
                    :page-size="pagination2.pageSize"
                    layout="total, prev, pager, next"
                    :total="parseInt(pagination2.total_num)"
                  >
                  </el-pagination>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div id="addSalaryDialogWrapper">
      <el-dialog
        title="添加应发工资"
        :visible.sync="dialogVisible"
        @close="resetForm('ruleForm')"
        size="small"
      >
        <div class="">
          <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
            <el-form-item
              label="手机号码："
              :label-width="formLabelWidth"
              prop="phoneNumer"
            >
              <el-input
                placeholder="请输入手机号"
                v-model="ruleForm['phoneNumer']"
                @blur="inputBlur"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="姓名："
              :label-width="formLabelWidth"
              prop="name"
            >
              <el-input
                placeholder="请输入姓名"
                v-model="ruleForm['name']"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item
              label="应发工资："
              :label-width="formLabelWidth"
              prop="paySalary"
            >
              <el-input
                placeholder="请输入应发工资"
                v-model="ruleForm['paySalary']"
              ></el-input>
              <div
                style="color: red; line-height: 22px"
                v-show="advancePayment"
              >
                可预支工资为：{{ advancePayment }}
              </div>
            </el-form-item>
            <el-form-item
              label="工作量："
              :label-width="formLabelWidth"
              prop="workCount"
            >
              <el-input
                placeholder="请输入工作量"
                v-model="ruleForm['workCount']"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="工作日期："
              :label-width="formLabelWidth"
              prop="workDate"
            >
              <el-date-picker
                v-model="ruleForm['workDate']"
                type="daterange"
                placeholder="选择日期"
                range-separator="至"
                style="width: 100%"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item
              label="本月正常发薪日："
              :label-width="formLabelWidth"
              prop="payDate"
            >
              <el-date-picker
                v-model="ruleForm['payDate']"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                :picker-options="pickerOptions"
              >
              </el-date-picker>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button class="cancel" @click="resetForm('ruleForm')"
            >取 消</el-button
          >
          <el-button type="primary" class="confirm" @click="confirm('ruleForm')"
            >确 定</el-button
          >
        </div>
      </el-dialog>
      <el-dialog
        title="批量传应发工资"
        :visible.sync="dialogAddVisible"
        @close="toggleUpload('cancel')"
      >
        <div class="upload-wrapper" v-show="upload_page">
          <el-upload
            class="upload-demo"
            ref="elUpload"
            drag
            v-loading="uploadLoading"
            :with-credentials="true"
            :http-request="onUpload"
            :action="actionUploadUrl"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或<em>&nbsp;点击上传</em>
              <div class="el-upload__tip" slot="tip">
                可上传确认的Excel模板，也可以
                <a
                  href="https://down.doumistatic.com/22/62c8a7cd5a14/payable.xls"
                  download="payable"
                  @click.stop="stopPre"
                  >下载标准模板</a
                >
              </div>
            </div>
          </el-upload>
        </div>
        <div class="upload-result" v-show="uploadResult_page">
          <!--错误形式的列表展示-->
          <div class="errorDataList" v-show="isError">
            <div class="myTop">
              <h2>
                本次导入<span> {{ errorObj.sum }} </span
                >条&nbsp;&nbsp;文件中包含
                <span>{{ errorObj.err_sum }}</span> 条错误信息
                <form action="" id="upfile" enctype="multipart/form-data">
                  <a href="javascript:;" class="file"
                    >重新上传
                    <input
                      type="file"
                      name=""
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      @change="onChangeUpfile('error')"
                      id="upfile1"
                    />
                  </a>
                </form>
              </h2>
            </div>
            <div class="errorTable">
              <el-table
                tooltip-effect="dark"
                style="width: 100%"
                :height="winHeight"
                :data="errorObj.error_list"
                v-loading="againUploadLoading"
                border
              >
                <el-table-column
                  label="姓名"
                  prop="real_name"
                  width="150"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column
                  label="手机号"
                  prop="mobile"
                  width="150"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column
                  label="工作日期"
                  prop="work_date"
                  width="250"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column
                  label="工作量"
                  width="150"
                  prop="workload"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column
                  label="应发工资"
                  width="150"
                  prop="amount"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column
                  label="本月正常发薪日"
                  prop="pay_date"
                  width="150"
                  show-overflow-tooltip
                >
                </el-table-column>
                <el-table-column label="错误原因" width="300">
                  <template slot-scope="scope">
                    <p v-for="item in scope.row.error" style="color: red">
                      {{ item.err_txt }}&nbsp;&nbsp;&nbsp;
                      <br />
                    </p>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <!--正确形式的列表展示-->
          <div class="successDataList" v-show="isSuccess">
            <div class="myTop">
              <div class="successtop">
                <h3>上传成功</h3>
                <!-- <p>打卡率：<em>{{successObj.clock_rate}}%</em>&nbsp;&nbsp;考勤人数：<em>{{successObj.count}}</em>人&nbsp;&nbsp;考勤人天：<em>{{successObj.days}}</em>天</p> -->
                <form action="" id="upfile2" enctype="multipart/form-data">
                  <a href="javascript:;" class="file"
                    >重新上传
                    <input
                      type="file"
                      name=""
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      @change="onChangeUpfile('success')"
                      id="upfile22"
                    />
                  </a>
                </form>
              </div>
            </div>
            <div class="successTable">
              <el-table
                tooltip-effect="dark"
                style="width: 100%"
                :height="winHeight"
                :data="successObj.success_list"
                v-loading="againUploadLoading"
                border
              >
                <el-table-column label="姓名" width="78" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span :class="{ weight: scope.row.name == '合计' }">{{
                      scope.row.name
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="人员来源"
                  label-class-name="border"
                  min-width="120"
                  v-if="is_nx_project"
                >
                  <template slot-scope="scope">
                    {{ scope.row.worker_source }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="手机号"
                  width="115"
                  prop="mobile"
                  show-overflow-tooltip
                >
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button class="cancel" @click="toggleUpload('cancel')"
            >取 消</el-button
          >
          <el-button type="primary" class="confirm" @click="toggleUpload('ok')"
            >确 定</el-button
          >
        </div>
      </el-dialog>
      <el-dialog
        title="审核拒绝"
        :visible.sync="auditDialog"
        @close="resetFormAudit('-5')"
        size="small"
      >
        <div class="">
          <el-input
            type="textarea"
            v-model="auditReason"
            placeholder="请输入拒绝原因"
          ></el-input>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button class="cancel" @click="resetFormAudit('-5')"
            >取 消</el-button
          >
          <el-button type="primary" class="confirm" @click="auditConfirm('-5')"
            >确 定</el-button
          >
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import * as util from "@/assets/js/util.js";
let reg = /^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/;
let reg1 = /^[0-9]+.?[0-9]*/;
let reg3 = /^([0-9]{1}|^[1-9]{1}\d{1,15})(\.\d{1,2})?$/;
// 测试项目：3425
export default {
  name: "Salaryadvances",
  data: function () {
    var testWorkDate = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请选择工作日期"));
      } else {
        callback();
      }
    };
    var testPayDate = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请选择本月正常发薪日"));
      } else {
        callback();
      }
    };
    var testPhoneNumer = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入手机号"));
      } else {
        callback();
      }
    };
    var testName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("未获取到手机号归属的姓名"));
      } else {
        callback();
      }
    };
    var testPaySalary = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入应发工资"));
      } else if (!reg1.test(value)) {
        return callback(new Error("请输入数字"));
      } else if (parseFloat(value) <= 0) {
        return callback(new Error("请输入大于0的数字"));
      } else if (parseFloat(value) > 5000) {
        return callback(new Error("请输入小于或者等于5000的数字"));
      } else if (!reg3.test(parseFloat(value))) {
        return callback(new Error("请输入小数点后最多两位的数字"));
      } else {
        callback();
      }
    };
    var testWorkCount = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请输入工作量"));
      } else if (!reg1.test(value)) {
        return callback(new Error("请输入数字"));
      } else if (parseFloat(value) <= 0) {
        return callback(new Error("请输入大于0的数字"));
      } else {
        callback();
      }
    };
    return {
      pickerOptions: {
        disabledDate(v) {
          const curDate = new Date().getTime();
          const three = 60 * 60 * 1000 * 24 * 90;
          const threeMoths = curDate + three;
          return (
            v.getTime() < new Date().getTime() - 86400000 ||
            v.getTime() > threeMoths - 86400000
          );
        },
      },
      team_id: "",
      project_id: "",
      activeTabName: "0", //0：应发工资 1：员工申请列表
      winHeight: "",
      formLabelWidth: "150px",
      applyTableData: [],
      salaryTableData: [],
      // 应发工资
      nameOrPhone1: "",
      searchData1: {
        nameOrPhone: "",
        workDate: [],
        currSeachRester: "",
      },
      pagination1: {
        pageSize: 20,
        total_num: 0,
        currentPage: 1,
        page_no: 1,
      },
      nameOrPhone2: "",
      searchData2: {
        nameOrPhone: "",
        applyDate: [],
        status: "-1",
        currSeachRester: "",
      },
      pagination2: {
        pageSize: 20,
        total_num: 0,
        currentPage: 1,
        page_no: 1,
      },
      applyApprovalNums: 0,
      listingStatusList: [
        {
          id: "-1",
          label: "全部",
          value: "-1",
        },
        {
          id: "0",
          label: "申请中",
          value: "0",
        },
        {
          id: "5",
          label: "申请通过",
          value: "5",
        },
        {
          id: "-5",
          label: "申请拒绝",
          value: "-5",
        },
      ],
      // 添加应发工资弹框
      dialogVisible: false,
      ruleForm: {
        phoneNumer: "",
        name: "",
        paySalary: "",
        workCount: "",
        workDate: "",
        payDate: "",
      },
      rules: {
        workDate: [{ validator: testWorkDate, trigger: "change" }],
        payDate: [{ validator: testPayDate, trigger: "change" }],
        phoneNumer: [{ validator: testPhoneNumer, trigger: "blur" }],
        name: [{ validator: testName, trigger: "blur" }],
        paySalary: [{ validator: testPaySalary, trigger: "blur" }],
        workCount: [{ validator: testWorkCount, trigger: "blur" }],
      },
      // 批量上传应发工资
      dialogAddVisible: false,
      uploadResult_page: false, // 上传之后的列表展示/隐藏
      upload_page: true, // 上传按钮展示/隐藏
      uploadLoading: false,
      againUploadLoading: false,
      actionUploadUrl:
        util.host +
        "/sea/api/1.0/client/v1/wage/payable/upload?dmclient=pcweb&X-Doumi-Agent=weixinqy",
      errorObj: {
        sum: 0,
        err_sum: 0,
        error_list: [],
      },
      //第二步：上传之后列表--正确展示
      successObj: {
        success_list: [],
      },
      isError: false,
      isSuccess: false,
      numtotal: 0,
      page_size: 10000,
      auditSelectList: [],
      wageSelectedList: [],
      auditDialog: false,
      auditReason: "",
      wageUserId: "",
    };
  },
  mounted() {
    this.init();
    $(window).on("resize", () => {
      this.winHeight = window.innerHeight - 220;
    });
  },
  computed: {
    advancePayment() {
      const amount = util.accMul(this.ruleForm["paySalary"], 0.8);
      const formatAmount = util.formatAmount(amount, 2);
      return amount && formatAmount;
    },
  },
  watch: {
    $route(to, from) {
      // 对路由变化作出响应...
      this.init();
    },
  },
  methods: {
    init() {
      this.winHeight = window.innerHeight - 220;
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.getData();
      this.getApplyData();
    },
    //获取员工申请数据列表
    getApplyData() {
      setTimeout(() => {
        $(".el-table__body-wrapper").scrollTop(0);
      });
      let _data = {
        team_id: this.team_id,
        project_id: this.project_id,
        user_id: this.searchData2.nameOrPhone || "0",
        start_date: this.searchData2.applyDate[0] || "",
        end_date: this.searchData2.applyDate[1] || "",
        listing_status: this.searchData2.status,
        page_no: this.pagination2.page_no,
        page_size: this.pagination2.pageSize,
      };
      // console.log('getApplyData>>>>>',_data)
      // return
      util.ajax({
        url: "/wage/advance/list",
        type: "POST",
        data: _data,
        timeout: 10000,
        success: (obj) => {
          console.log("obj>>>>>>", obj);
          if (obj.errno == "0") {
            this.applyTableData = obj.data.list;
            this.applyApprovalNums = obj.data.applyCount;
            this.pagination2.total_num = obj.data.total_num;
          }
        },
        error: (xhr, status) => {
          this.alertinfo("获取数据失败");
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
    stopPre() {
      return false;
    },
    //获取应发工资数据列表
    getData() {
      setTimeout(() => {
        $(".el-table__body-wrapper").scrollTop(0);
      });
      let _data = {
        team_id: this.team_id,
        project_id: this.project_id,
        baxian_user_id: this.searchData1.nameOrPhone || "0",
        page_no: this.pagination1.page_no,
        page_size: this.pagination1.pageSize,
        start_date: this.searchData1.workDate[0] || "",
        end_date: this.searchData1.workDate[1] || "",
      };
      util.ajax({
        url: "/wage/payable/list",
        type: "POST",
        data: _data,
        timeout: 10000,
        success: (obj) => {
          console.log("obj22222>>>>>>", obj);
          this.salaryTableData = obj.data.list;
          this.pagination1.total_num = obj.data.total_num;
        },
        error: (xhr, status) => {
          this.alertinfo("获取数据失败");
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
    //tab切换
    tabsClick(tab, event) {
      this.activeTabName = tab.name;
      if (tab.name == 0) {
        this.getData();
      } else {
        this.getApplyData();
      }
    },
    isSlected(row, index) {
      return row.listing_status == "0";
    },
    isApplySlected(row) {
      return row.listing_status == "0";
    },
    searchNameOrPhone: util.debounce(function () {
      console.log(this.searchData1.nameOrPhone);
    }, 500),
    //人员检索
    querySearch(queryString, cb) {
      console.log("eeeeeeeeeeeeee1111", queryString);
      if (queryString) {
        if (this.activeTabName == 0) {
          this.searchData1.nameOrPhone = "";
        } else {
          this.searchData2.nameOrPhone = "";
        }
        util.ajax({
          url: "/group/member_search",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            group_id: "",
            keyword: queryString,
            page_no: "",
            page_size: "",
          },
          timeout: 10000,
          success: (obj) => {
            if (obj && obj.errno == 0) {
              let strArr = [];
              obj.data.list.forEach((o) => {
                let str = "";
                str = {
                  value: o.user_name,
                  group_name: o.group_name,
                  group_id: o.group_id,
                  user_id: o.user_id,
                };
                strArr.push(str);
              });
              var results = queryString
                ? strArr.filter(this.createFilter(queryString))
                : strArr;
              if (results.length == 0) {
                results.push({ value: "无搜索结果", status: "-1" });
              }
              clearTimeout(this.timeout);
              this.timeout = setTimeout(() => {
                // 调用 callback 返回建议列表的数据
                cb(results);
              }, 1000 * Math.random());
            } else {
              this.$message({
                showClose: true,
                message: obj.errmsg,
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
      } else {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          // 调用 callback 返回建议列表的数据
          cb([{ value: "无搜索结果", status: "-1" }]);
        }, 1000 * Math.random());
        if (this.activeTabName == 0) {
          this.getData();
        } else {
          this.getApplyData();
        }
      }
    },
    //搜索建议列表选择赋值
    handleSelect(item) {
      if (item.status == -1) {
        this.searchData1.nameOrPhone = "";
      } else {
        this.searchData1.nameOrPhone = item.user_id;
      }
      this.getData();
    },
    //搜索建议列表选择赋值
    handleSelect2(item) {
      if (item.status == -1) {
        this.searchData2.nameOrPhone = "";
      } else {
        this.searchData2.nameOrPhone = item.user_id;
      }
      this.getApplyData();
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (
          restaurant.value.toLowerCase() ||
          restaurant.value.indexOf(queryString) > -1
        );
      };
    },
    searchWorkDate() {
      this.searchData1.workDate[0] = this.searchData1.workDate[0]
        ? this.getLocalTime(this.searchData1.workDate[0])
        : null;
      this.searchData1.workDate[1] = this.searchData1.workDate[1]
        ? this.getLocalTime(this.searchData1.workDate[1])
        : null;
      this.getData();
    },
    searchApplyDate() {
      this.searchData2.applyDate[0] = this.searchData2.applyDate[0]
        ? this.getLocalTime(this.searchData2.applyDate[0])
        : null;
      this.searchData2.applyDate[1] = this.searchData2.applyDate[1]
        ? this.getLocalTime(this.searchData2.applyDate[1])
        : null;
      this.getApplyData();
    },
    exportApplyData() {
      let user_id = this.searchData2.currSeachRester
        ? this.searchData2.currSeachRester.user_id
        : 0;
      let start_date = this.searchData2.applyDate[0] || "";
      let end_date = this.searchData2.applyDate[1] || "";
      let listing_status = this.searchData2.status;
      let href =
        "/sea/api/1.0/client/v1/wage/advance/export?team_id=" +
        this.team_id +
        "&dmclient=pcweb&project_id=" +
        this.project_id +
        "&user_id=" +
        user_id +
        "&start_date=" +
        start_date +
        "&end_date=" +
        end_date +
        "&listing_status=" +
        listing_status;
      util.locationHref(href);
      return;
      let data = {
        team_id: this.team_id,
        project_id: this.project_id,
        user_id: this.searchData2.currSeachRester
          ? this.searchData2.currSeachRester.user_id
          : 0,
        start_date: this.searchData2.applyDate[0] || "",
        end_date: this.searchData2.applyDate[1] || "",
        listing_status: this.searchData2.status,
      };
      util.ajax({
        url: "/wage/advance/export",
        type: "POST",
        data: data,
        timeout: 10000,
        success: (obj) => {
          console.log("obj>>>>>>", obj);
        },
        error: (xhr, status) => {
          this.alertinfo("导出数据失败");
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
    // 添加应付工资
    addPaySalary() {
      this.dialogVisible = true;
    },
    //手机号失去焦点校验是否注册过，是--直接带出用户信息，否--继续填写
    inputBlur(value) {
      if (!reg.test(this.ruleForm.phoneNumer)) {
        //ruleForm['phoneNumer']
        return;
      }
      setTimeout(() => {
        if (this.dialogVisible == false) {
          return;
        }
        util.ajax({
          url: "/user/register/info",
          type: "POST",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            mobile: this.ruleForm.phoneNumer,
            idcard_security: 1, //身份证安全模式 默认为0 如果需要隐藏身份证号中间几位，传1
          },
          timeout: 10000,
          success: (obj) => {
            // console.log('已注册人员信息')
            console.log(obj);
            if (obj && obj.errno == 0) {
              if (obj.data == "") {
                return;
              }
              if (obj.data) {
                this.ruleForm.name = obj.data.real_name;
                this.wageUserId = obj.data.id;
              }
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
      }, 300);
    },
    // 上传应发工资
    uploadPaySalary() {
      this.dialogAddVisible = true;
    },
    toggleUpload() {
      this.$refs["elUpload"].clearFiles();
      document.getElementById("upfile").reset();
      this.dialogAddVisible = false;
      this.resetOnUpload();
      this.getData();
    },
    //第一次上传---拖拽上传或者选择文件成功之后的回调
    onUpload(file) {
      this.errorObj.error_list = [];
      this.uploadLoading = true;
      var form_data = new FormData();
      form_data.append("team_id", this.team_id);
      form_data.append("project_id", this.project_id);
      form_data.append("payable_excel", file.file);
      $.ajax({
        url: file.action,
        type: "POST",
        data: form_data,
        processData: false,
        contentType: false,
        xhrFields: {
          withCredentials: true,
        },
        timeout: 180000,
        success: (obj) => {
          this.uploadLoading = false;
          if (obj.errno == "0") {
            this.$message({
              showClose: true,
              message: "上传成功",
              type: "warning",
            });
            this.$refs["elUpload"].clearFiles();
            this.dialogAddVisible = false;
            this.resetOnUpload();
            this.getData();
          } else {
            if (obj.data.error_list && obj.data.error_list.length > 0) {
              this.upload_page = false;
              this.uploadResult_page = true;
              this.isError = true;
              this.errorObj = obj.data;
            } else {
              this.$message({
                showClose: true,
                message: obj.errmsg,
                type: "warning",
              });
            }
          }
        },
        error: (xhr, status) => {
          this.uploadLoading = false;
          this.$message({
            showClose: true,
            message: "请求失败，请刷新重试！",
            type: "warning",
          });
        },
        noNetwork: () => {
          this.uploadLoading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    //重新上传文件
    onChangeUpfile(type) {
      // document.getElementById("upfile").reset();
      this.errorObj.error_list = [];
      this.againUploadLoading = true;
      var currObj = "";
      if (type == "error") {
        currObj = $("#upfile");
      } else {
        currObj = $("#upfile2");
      }
      if (currObj) {
        var form_data = new FormData();
        var file_data = "";
        if (type == "error") {
          file_data = $("#upfile1").prop("files")[0];
        } else {
          file_data = $("#upfile22").prop("files")[0];
        }
        console.log("file", file_data);
        form_data.append("team_id", this.team_id);
        form_data.append("project_id", this.project_id);
        form_data.append("payable_excel", file_data);
        $.ajax({
          url: this.actionUploadUrl,
          type: "POST",
          data: form_data,
          processData: false,
          contentType: false,
          xhrFields: {
            withCredentials: true,
          },
          timeout: 180000,
          success: (obj) => {
            this.againUploadLoading = false;
            document.getElementById("upfile").reset();
            if (obj.errno == "0") {
              this.$message({
                showClose: true,
                message: "上传成功",
                type: "warning",
              });
              this.$refs["elUpload"].clearFiles();
              this.dialogAddVisible = false;
              this.resetOnUpload();
              this.getData();
            } else {
              if (obj.data.error_list && obj.data.error_list.length > 0) {
                this.upload_page = false;
                this.uploadResult_page = true;
                this.isError = true;
                this.errorObj = obj.data;
              } else {
                this.$message({
                  showClose: true,
                  message: obj.errmsg,
                  type: "warning",
                });
              }
            }
          },
          error: (xhr, status) => {
            this.againUploadLoading = false;
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
          noNetwork: () => {
            this.againUploadLoading = false;
            this.$message({
              showClose: true,
              message: "网络连接失败，请检查网络",
              type: "warning",
            });
          },
        });
      } else {
        this.againUploadLoading = false;
      }
    },
    // 重置上传数据
    resetOnUpload() {
      this.isError = false;
      this.upload_page = true;
      this.errorObj.error_list = [];
      this.errorObj.sum = 0;
      this.errorObj.err_sum = 0;
      this.uploadResult_page = false;
    },
    //下载模板
    uploadTemplate() {
      // window.Location.href = `https://down.doumistatic.com/19/62c7e3926f30/payable.xls`;
      window.Location.href = `https://down.doumistatic.com/22/62c8a7cd5a14/payable.xls`;
      // if(navigator.onLine){//day_or_month 1 2/月
      //   util.locationHref(`/sea/api/1.0/client/v1/confirmmail/downloadexceltemplet?dmclient=pcweb&X-Doumi-Agent=weixinqy&project_id=${this.project_id}&day_or_month=${this.ruleForm.confirmType}&start_date=${this.step1Obj.date_start}&end_date=${this.step1Obj.date_end}`)
      // }else{
      //   this.$message({
      //       showClose: true,
      //       message: '网络连接失败，请检查网络',
      //       type: 'warning'
      //   });
      // }
    },
    // 删除
    deletePaySalary() {
      if (this.wageSelectedList.length == 0) {
        this.$message({
          showClose: true,
          message: "请选择要删除的数据",
          type: "warning",
        });
        return;
      }
      let payable_wage_ids = this.wageSelectedList.join(",");
      let _data = {
        team_id: this.team_id,
        project_id: this.project_id,
        payable_wage_ids,
      };
      util.ajax({
        url: "/wage/payable/delete",
        type: "POST",
        data: _data,
        timeout: 10000,
        success: (obj) => {
          console.log("obj>>>>>>", obj);
          if (obj.errno == "0") {
            this.alertinfo("请求成功");
            this.searchData1.page_no = 1;
            this.getData();
          } else {
            this.alertinfo(obj.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo("请求失败");
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
    // 申请审核
    audit(type) {
      if (this.auditSelectList.length == 0) {
        this.$message({
          showClose: true,
          message: "请选择要审核的数据",
          type: "warning",
        });
        return;
      }
      if (type == 5) {
        this.$confirm(
          "审批通过后，预支的工资会直接进入用户的钱包，确认通过吗？",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
          .then(() => {
            this.auditHandle(type);
          })
          .catch(() => {});
      } else {
        this.auditDialog = true;
      }
    },
    // 申请列表选择
    handleApplyelectionChange(val) {
      console.log(val);
      this.auditSelectList = [];
      val &&
        val.forEach((v) => {
          this.auditSelectList.push(v.id);
        });
      console.log("ddddd", this.auditSelectList);
    },
    handleWageelectionChange(val) {
      console.log(val);
      this.wageSelectedList = [];
      val &&
        val.forEach((v) => {
          this.wageSelectedList.push(v.id);
        });
      console.log("ddddd", this.wageSelectedList);
    },
    // 审批通过/拒绝
    auditHandle(type) {
      if (this.auditSelectList.length == 0) {
        return;
      }
      let approve_id = this.auditSelectList.join(",");
      let _data = {
        team_id: this.team_id,
        project_id: this.project_id,
        approve_id,
        action: type,
        reason: this.auditReason,
      };
      util.ajax({
        url: "/wage/advance/approve",
        type: "POST",
        data: _data,
        timeout: 10000,
        success: (obj) => {
          console.log("obj>>>>>>", obj);
          if (obj.errno == "0") {
            this.alertinfo("请求成功");
            this.getApplyData();
          } else {
            this.alertinfo(obj.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo("请求失败");
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
    resetFormAudit() {
      this.auditReason = "";
      this.auditDialog = false;
    },
    auditConfirm(type) {
      if (!this.auditReason) {
        this.alertinfo("请填写拒绝原因");
        return;
      }
      this.auditDialog = false;
      this.auditHandle(type);
    },
    // 显示错误信息
    alertinfo(text, type) {
      this.$message({
        showClose: true,
        message: text,
        type: type || "warning",
      });
    },

    //分页
    handleCurrentPageChange(val) {
      if (this.activeTabName == "0") {
        this.pagination1.page_no = val;
        this.getData();
      } else {
        this.pagination2.page_no = val;
        this.getApplyData();
      }
    },
    /*分页操作*/
    handleSizeChange(val) {},
    //导出确认按钮
    confirm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const workDateStart = util.formatData1(this.ruleForm.workDate[0]);
          const workDateEnd = util.formatData1(this.ruleForm.workDate[1]);
          let data_ = {
            team_id: this.team_id,
            project_id: this.project_id,
            baxian_user_id: this.wageUserId,
            work_date: workDateStart + "至" + workDateEnd, //ruleForm['workDate']
            pay_date: util.formatData1(this.ruleForm.payDate),
            amount: this.ruleForm.paySalary,
            workload: this.ruleForm.workCount, // 导出类型参数
          };
          // console.log("forrrrrr", data_);
          // return;
          util.ajax({
            url: "/wage/payable/create",
            type: "POST",
            data: data_,
            timeout: 10000,
            success: (obj) => {
              console.log("添加工资失败...", obj);
              if (obj && obj.errno == 0) {
                this.dialogVisible = false;
                this.pagination1.page_no = 1;
                this.getData();
              } else {
                //网络超时
                const msgerr = obj.data.error_list
                  ? obj.data.error_list.join(",")
                  : "请求失败";
                this.$message({
                  showClose: true,
                  message: msgerr,
                  type: "warning",
                });
              }
            },
            error: (xhr, status) => {
              //网络超时
              this.$message({
                showClose: true,
                message: "服务端接口报错",
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
        }
      });
    },
    searchListingStatus(v) {
      console.log("vvvvv", this.searchData2.status);
      this.pagination2.page_no = 1;
      this.getApplyData();
    },
    //取消
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.dialogVisible = false;
    },
    //日期格式化“分秒”
    getLocalTime(timestr) {
      return util.getLocalTime(timestr, "yyyy-MM-dd");
    },
    //获取权限
    getPermissions() {
      util.ajax({
        url: "/permission/application",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          application_id: 0,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning",
            });
          }
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
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#SalaryWrapper .customer-wapper .el-tabs__item {
  color: #8492a6;
}
#SalaryWrapper .customer-wapper .el-tabs__item.is-active {
  color: #6699ee;
}
#SalaryWrapper .customer-wapper .el-tabs__active-bar {
  background-color: #6699ee;
}
#SalaryWrapper .customer-wapper .el-table td {
  border-right: none;
}
#SalaryWrapper .customer-wapper .el-table .is-center {
  border-left: 1px solid #e0e6ed;
  border-right: 1px solid #e0e6ed;
}
#SalaryWrapper .customer-wapper .el-table th {
  height: 36px;
}
#SalaryWrapper .customer-wapper .el-table--border th,
.el-table td,
.el-table th.is-leaf {
  border-right: 1px solid #e0e6ed;
}
#SalaryWrapper
  .customer-wapper
  .el-table--enable-row-hover
  .el-table__body
  tr:hover
  > td {
  background-color: #f7f7f9;
}
#SalaryWrapper .customer-wapper .el-table__empty-text {
  font-size: 16px;
  color: #c0ccda;
}
#SalaryWrapper .customer-wapper .el-input {
  width: 235px;
}
#addSalaryDialogWrapper .el-dialog__body {
  padding: 30px 20px;
}
</style>
<style scoped>
.customer-wapper {
  padding: 16px 20px 0 20px;
  overflow: hidden;
}
.customer-wapper h1 {
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  color: #475568;
  margin-bottom: 8px;
  line-height: 1.4;
}
.customer-wapper h1 .new-build-mail {
  cursor: pointer;
  float: right;
  color: rgb(102, 153, 238);
  font-size: 13px;
  font-weight: normal;
}
.customer-wapper h1 .daily_mr {
  margin-right: 10px;
}
.customer-wapper h1 .new-build-mail .addIcon {
  display: block;
  width: 13px;
  height: 13px;
  float: left;
  margin-right: 6px;
  margin-top: 2px;
  background-image: url(../assets/imgs/shareIcon/add_hover.svg);
}
/* 分页 */
.page {
  float: right;
}
/* 进度条 */
.progress_bar {
  width: 20px;
  height: 6px;
  border-radius: 100px;
  background: #e5e9f2;
  vertical-align: middle;
  float: left;
  margin-top: 10px;
}
.progress_bar .green {
  height: 6px;
  border-radius: 100px;
  background-color: #8dd256;
}
.progress_bar .red {
  height: 6px;
  border-radius: 100px;
  background-color: #f56c54;
}
.progress_bar .yellow {
  height: 6px;
  border-radius: 100px;
  background-color: #fec622;
}
.progress_text {
  font-size: 12px;
  color: #475669;
  float: left;
  margin-left: 5px;
}
.search-pannel {
  margin: 20px 0;
}
.operate-pannel {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 20px 0 10px;
}
.nums {
  color: red;
}
/* 批量上传数据 */
.upload-wrapper {
}
.upload-demo {
  text-align: center;
}
.upload-result {
  margin-top: 20px;
}
/* 核对数据---错误列表展示 */
.errorDataList .myTop {
  margin-bottom: 14px;
  height: 32px;
}
.errorDataList .myTop h2 {
  height: 32px;
  padding-left: 26px;
  line-height: 32px;
  font-size: 14px;
  color: #8492a6;
  float: left;
  background: url(../assets/imgs/mail/error_tip.svg) no-repeat left center;
}
.errorDataList .myTop h2 span {
  font-weight: 600;
  color: #5e6d82;
}
.isJoinButton {
  font-size: 12px;
  color: #6699ee;
  /*margin-left: 16px;*/
}
.errorDataList .myTop h2 #upfile {
  float: right;
  margin-left: 7px;
  margin-top: 3px;
}
.errorDataList .myTop h2 a.file {
  position: relative;
  display: block;
  float: right;
  width: 64px;
  height: 24px;
  line-height: 24px;
  background: #ffffff;
  border: 1px solid #6699ee;
  overflow: hidden;
  color: #6699ee;
  text-decoration: none;
  text-indent: 0;
  border-radius: 2px;
  font-size: 12px;
  text-align: center;
  margin-left: 10px;
}
.errorDataList .myTop {
  content: "";
  display: block;
  clear: both;
}
.errorDataList .myTop h2 a.file:hover {
  border: 1px solid #8bb1f2;
  color: #8bb1f2;
}
.errorDataList .myTop h2 a.file:active {
  border: 1px solid #517ed6;
  color: #517ed6;
}
.errorDataList .myTop h2 a.file input {
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
}

.successDataList .myTop {
  height: 32px;
  margin-bottom: 14px;
}
.successDataList .myTop:after {
  content: "";
  display: block;
  clear: both;
}
.successtop {
}
.successDataList .myTop h3 {
  height: 32px;
  padding-left: 26px;
  line-height: 32px;
  font-size: 14px;
  color: #8492a6;
  float: left;
  background: url(../assets/imgs/mail/success_tip.svg) no-repeat left center;
}
.successDataList .myTop p {
  float: left;
  font-size: 14px;
  color: #8492a6;
  line-height: 32px;
  margin-left: 24px;
}
.successDataList .myTop p em {
  font-weight: 600;
  color: #5e6d82;
  font-size: 14px;
}
.successDataList .myTop #upfile2 {
  float: left;
  margin-left: 7px;
  margin-top: 3px;
}
.successDataList .myTop a.file {
  position: relative;
  display: block;
  float: right;
  width: 64px;
  height: 24px;
  line-height: 24px;
  background: #ffffff;
  border: 1px solid #6699ee;
  overflow: hidden;
  color: #6699ee;
  text-decoration: none;
  text-indent: 0;
  border-radius: 2px;
  font-size: 12px;
  text-align: center;
  margin-left: 10px;
}
.successDataList .myTop a.file:hover {
  border: 1px solid #8bb1f2;
  color: #8bb1f2;
}
.successDataList .myTop a.file:active {
  border: 1px solid #517ed6;
  color: #517ed6;
}
.successDataList .myTop a.file input {
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
}
.clockOk {
  display: block;
  width: 52px;
  height: 24px;
  line-height: 24px;
  border-radius: 2px;
  background-color: rgba(99, 180, 93, 0.07);
  border: solid 1px rgba(99, 180, 93, 0.35);
  font-size: 12px;
  text-align: center;
  color: #70cb6a;
}
.clockNo {
  display: block;
  width: 52px;
  height: 24px;
  line-height: 24px;
  border-radius: 2px;
  background-color: rgba(242, 106, 75, 0.05);
  border: solid 1px rgba(242, 106, 75, 0.27);
  font-size: 12px;
  text-align: center;
  color: #f58369;
}
.weight {
  font-weight: bold;
  color: #475669;
  font-size: 14px;
}
</style>
