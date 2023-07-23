<template>
  <div id="PayListDetail" v-loading="fullscreenLoading" :style="{height:PayListDetailHeight}">
    <div class="kq-wapper">
      <div class="headertitle clearfix">
        <h2 class="fl"><span @click="goPayrollList">工资核算</span> <i class="icon-arrow-right"></i> {{this.page_data.general.order_name}}</h2>
        <template v-if="pay_type && pay_type == 2"></template>
        <template v-else>
          <h3 class="fr frlast" @click="delPayroll" v-if="page_data.general.status_no==0 || page_data.general.status_no==1 || page_data.general.status_no==3"><i class="deleteico_svg"></i>删除</h3>
        </template>
        <h3 class="fr frfirst" @click="exportPayroll()" v-if="export_wage_order"><i class="cexportico_svg"></i>导出</h3>
      </div>
      <div class="kq-header">
        <div class="kq-tab clearfix">
          <h2>基本信息</h2>
          <div class="paystatus fl">
            <p class="labletitel"><em>发薪方式</em><span class="statusinfo" style="color:red">{{payment_type_name}}</span></p>
            <p class="labletitel">
              <em>状态</em><span class="statusinfo " v-if="page_data.general.status_no==0">草稿<i class="thedraftico_svg"></i></span><span class="statusinfo statusicoload" v-if="page_data.general.status_no==1">待审批<i
                  class="toauditico_svg"></i></span><span class="statusinfo " v-if="page_data.general.status_no==2">审批通过<i class="throughico_svg"></i></span><span class="statusinfo " v-if="page_data.general.status_no==3">审批驳回<i
                  class="failureico_svg"></i></span><span class="statusinfo statusicoload" v-if="page_data.general.status_no==4">支付中<i class="toauditico_svg"></i></span><span class="statusinfo " v-if="page_data.general.status_no==5">已支付<i
                  class="throughico_svg"></i></span><span class="statusinfo " v-if="page_data.general.status_no==6">支付异常<i class="failureico_svg"></i></span>
                  <span class="statusinfo " v-if="page_data.general.status_no==7">部分支付<i class="toauditico_svg"></i></span>
            </p>
            <p class="labletitel"><em>结算周期</em><span class="statusinfo ">{{startDate}}{{endDate}}</span></p>
            <p class="labletitel"><em>提交人</em><span class="statusinfo">{{create_user_name}}</span></p>
            <p class="labletitel" v-if="$route.query.ifConfirmEmail =='false' && wage_name"><em>关联工资单</em><span class="statusinfo" style="cursor:pointer;text-decoration: underline"
                @click="goDet(wage_order_id)">{{wage_name + '-' + wage_total_wage}}</span></p>
            <p class="labletitel" v-if="$route.query.ifConfirmEmail =='false' && remarks"><em>备注</em><span class="statusinfo" style="line-height:18px">{{remarks}}</span></p>
            <p class="labletitel" v-if="$route.query.ifConfirmEmail =='false' && fileList.length>0"><em>附件展示</em>
              <span class="statusinfo" style="display:inline-block;margin-left:-8px;">
                <elUpload ref="uploadRef" :fileListValue="fileList" :isDet="true" :isDisabled="true"></elUpload>
              </span>
            </p>
            <p class="labletitel" v-if="page_data.general.payment_method != 0">
              <em>支付方式</em>
              <span class="statusinfo">{{page_data.general.payment_method == '1' ? '支付宝支付' : '线下支付' }}</span>
            </p>
          </div>
          <div class="payroll_info fr">
            <el-dropdown trigger="click" @visible-change="visibleChange">
              <div class="combined_pay">
                <span class="moneylabe">总金额：</span>
                <span class="money"><i>￥</i>{{page_data.general.total_wage/100}}</span>
                <i class="el-icon-caret-bottom el-icon--right clickSjBtn" :class="[transform ? 'transformR' : 'transformL']"></i>
              </div>
              <ul slot="dropdown" class="el-dropdown-menu payListDrop" :class="{'cssHeight':!transform}" :style="{display: !transform ? 'none' : 'block' }">
                <div v-if="pay_type && pay_type == 2">
                  <li class="el-dropdown-menu__item"><span class="lablel">供应商费用</span><span class="labler">￥{{page_data.general.base_wage/100}}</span></li>
                </div>
                <div v-else>
                  <li class="el-dropdown-menu__item" v-if="pay_type && pay_type == 1"><span class="lablel">奖金</span><span class="labler">￥{{page_data.general.base_wage/100}}</span></li>
                  <li class="el-dropdown-menu__item" v-else><span class="lablel">基本工资</span><span class="labler">￥{{page_data.general.base_wage/100}}</span></li>
                </div>
                <li class="el-dropdown-menu__item" v-for=" (item,index) in this.extra_pay" :key="index"><span class="lablel">{{item.name}}</span><span
                    class="labler">￥{{page_data.general[item.field] ? page_data.general[item.field]/100 : 0}}</span></li>
              </ul>
            </el-dropdown>
          </div>
        </div>
        <div class="kq-tab" v-if="page_data.approve.approve_flag == 1">
          <h2>操作记录</h2>
          <div :class="['operation-record' ,'clearfix', index == 0 ? 'recordfirst' : 'operation-recordsSatr']" v-for="(item ,index) in page_data.approve.approve_log" :key="index">
            <i class="action_id1 action_idstatus" v-if="item.action_id == 1"></i>
            <i class="action_id2 action_idstatus" v-if="item.action_id == 2 || item.action_id == 4"></i>
            <i class="action_id3 action_idstatus" v-if="item.action_id == 3 || item.action_id == 5"></i>
            <div class="left-time fl">
              <p>{{item.create_date}}</p>
              <span>{{item.create_at}}</span>
            </div>
            <div class="right-info fl" v-if="pay_type && pay_type == 2">
              <p class="operation-status" v-if="item.action_id == 1">{{item.create_user_name}} 提交了供应商费用给 {{item.approve_user_name}} 审批</p>
              <p class="operation-status" v-if="item.action_id == 2">{{item.approve_user_name}} 审批通过了 {{item.create_user_name}}提交的工资单</p>
              <p class="operation-status" v-if="item.action_id == 3">{{item.approve_user_name}} 审批驳回了 {{item.create_user_name}}提交的工资单</p>
              <p class="operation-status" v-if="item.action_id == 4">{{item.approve_user_name}} 已支付了供应商费用</p>
              <p class="operation-status" v-if="item.action_id == 5">{{item.approve_user_name}} 支付失败了 {{item.create_user_name}}提交的工资单</p>
              <p class="operation-des" v-if="item.remark"><span>备注：</span>{{item.remark}}</p>
            </div>
            <div class="right-info fl" v-else>
              <p class="operation-status" v-if="item.action_id == 1">{{item.create_user_name}} 提交了工资单给 {{item.approve_user_name}} 审批</p>
              <p class="operation-status" v-if="item.action_id == 2">{{item.approve_user_name}} 审批通过了 {{item.create_user_name}}提交的工资单</p>
              <p class="operation-status" v-if="item.action_id == 3">{{item.approve_user_name}} 审批驳回了 {{item.create_user_name}}提交的工资单</p>
              <p class="operation-status" v-if="item.action_id == 4">{{item.approve_user_name}} 已支付了工资单</p>
              <p class="operation-status" v-if="item.action_id == 5">{{item.approve_user_name}} 支付失败了 {{item.create_user_name}}提交的工资单</p>
              <p class="operation-des" v-if="item.remark"><span>备注：</span>{{item.remark}}</p>
            </div>
          </div>
        </div>
        <div class="kq-tab">
          <h2>结算记录 ({{page_data.detail.list.length}}人)</h2>
          <!-- 全职列表 -->
          <div class="kq-count-day" v-if="project_type == 3">
            <div v-if="pay_type != 2 && ['0','1','2','3'].indexOf(page_data.general.status_no) === -1" class="select-person">
              <el-form :inline="true" :model="searchPerson" class="demo-form-inline">
                <el-form-item label="人员：">
                  <el-input v-model="searchPerson.user" placeholder="姓名/手机号"></el-input>
                </el-form-item>
                <el-form-item label="提现状态">
                  <el-select v-model="searchPerson.withdrawStatus">
                    <el-option label="不限" value="-1"></el-option>
                    <el-option label="提现失败" value="提现失败"></el-option>
                    <el-option label="提现成功" value="提现成功"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="是否已暂扣">
                  <el-select v-model="searchPerson.payStatus">
                    <el-option label="不限" value=""></el-option>
                    <el-option label="否" value="1"></el-option>
                    <el-option label="是" value="0"></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>            
            <el-table :data="page_data.detail.list" border empty-text="暂无数据" :row-class-name="tableRowClassName">
              <el-table-column prop="user_name" fixed show-overflow-tooltip label="姓名" width="110"></el-table-column>
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
              <el-table-column prop="mobile" label="手机号" width="120">
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
              <el-table-column prop="id_number" label="身份证号" width="170">
                 <template slot-scope="scope">
                  <el-icon name="id_number"></el-icon>
                  <el-popover
                    placement="top"
                    title=""
                    width="150"
                    trigger="hover">
                    <span style="margin-left:10px">{{scope.row.id_number}}</span>
                    <span slot="reference">{{scope.row.id_number.substr(0,3)+"****"+scope.row.id_number.substr(14)}}</span>
                  </el-popover>
                </template>
              </el-table-column>
              <el-table-column prop="actual_work_days" label="实际出勤" width="90"></el-table-column>
              <el-table-column prop="overtime_days" label="加班天数" width="90"></el-table-column>
              <el-table-column prop="base_wage" label="工资" :formatter="formatter" width="90"></el-table-column>
              <el-table-column prop="overtime_wage" label="加班费" :formatter="formatter" width="90"></el-table-column>
              <el-table-column prop="merit_wage" label="绩效" :formatter="formatter" width="90"></el-table-column>
              <el-table-column prop="bonus" label="奖金" :formatter="formatter" width="90"></el-table-column>
              <el-table-column prop="welfare" label="福利" :formatter="formatter" width="90"></el-table-column>
              <el-table-column prop="subsidy_wage" label="补贴" :formatter="formatter" width="90"></el-table-column>
              <el-table-column prop="deduction" label="扣费" :formatter="formatter" width="90"></el-table-column>
              <el-table-column prop="other_wage" label="薪酬其他" :formatter="formatter" width="90"></el-table-column>
              <el-table-column prop="income_tax" label="当月个税" :formatter="formatter" width="90"></el-table-column>
              <!-- <el-table-column prop="personal_last_month_ss_real" label="当月社保" :formatter="formatter" width="90"></el-table-column> -->
              <el-table-column prop="personal_last_month_ss_real" label="五险一金（个人）" :formatter="formatter" width="180"></el-table-column>
              <el-table-column label="实发工资" width="90">
                <template slot-scope="scope">
                  <span>{{scope.row.total_wage/100 || 0}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="pay_status" v-if="page_data.general.payment_method != 2 && project_type == 3 " label="提现状态" width="90">
                <template slot-scope="scope">
                  <template v-if="scope.row.fail_reason && scope.row.pay_status != 100">
                    <el-tooltip class="item" effect="dark" :content="scope.row.fail_reason" placement="top-start">
                      <span class="operation_pay">{{scope.row.pay_status_text}}</span>
                    </el-tooltip>
                  </template>
                  <template v-else>
                    <span class="operation_pay">{{scope.row.pay_status_text}}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column prop="is_finish_payment" label="是否已暂扣" width="150">
                <template slot-scope="scope" v-if="['0','1','2','3'].indexOf(page_data.general.status_no) === -1 ">
                  <span>{{scope.row.is_finish_payment == 0 ? '是' : '否'}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="remark" show-overflow-tooltip label="备注" width="200"></el-table-column>
              <el-table-column label="评价" class-name="tableevaluation" width="200">
                <template slot-scope="scope">
                  <div class="evaluation-div">
                    <i v-bind:class="['el-icon-star-on', itemindex < scope.row.comment_star ? 'selected-star' : '' ]" v-for="(item,itemindex) in foreachStar"></i>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <!-- 兼职列表 -->
          <div class="kq-count-day" v-else>
            <div v-if="pay_type != 2 && page_data.action_no.action_no != 1 " class="select-person">
              <el-form :inline="true" :model="searchPerson" class="demo-form-inline">
                <el-form-item label="人员：">
                  <el-input v-model="searchPerson.user" placeholder="姓名/手机号"></el-input>
                </el-form-item>
                <el-form-item label="是否完成支付">
                  <el-select v-model="searchPerson.payStatus">
                    <el-option label="不限" value=""></el-option>
                    <el-option label="否" value="0"></el-option>
                    <el-option label="是" value="1"></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
            <div class="kq-table-day yf-payrolllist">
              <el-table :data="page_data.detail.list" border style="width: 100%" empty-text="暂无数据" :row-class-name="tableRowClassName">
                <el-table-column prop="user_name" show-overflow-tooltip :label="pay_type && pay_type == 2 ? '供应商姓名' : '姓名'" width="110" class-name="tablefirst"></el-table-column>
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
                <el-table-column prop="mobile" show-overflow-tooltip :label="pay_type && pay_type == 2 ? '供应商手机号' : '手机号'" width="120">
                  <template slot-scope="scope">
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
                <template v-if="pay_type && pay_type == 2 ">
                  <el-table-column prop="base_wage" show-overflow-tooltip label="供应商费用(元)" width="120" :formatter="formatter"></el-table-column>
                  <el-table-column show-overflow-tooltip label="支付方式" width="100">
                    <template slot-scope="scope">
                      <span v-if="scope.row.pay_type == 1">线上支付</span>
                      <span v-if="scope.row.pay_type == 2">线下支付</span>
                    </template>
                  </el-table-column>
                </template>
                <template v-else>
                  <el-table-column :prop="memberDataList.base_wage_unit == 0 ? 'all_days' : 'total_time'" :label="memberDataList.base_wage_unit == 0 ? '出勤天数' : '出勤工时' " width="90"></el-table-column>
                  <el-table-column prop="base_wage" v-if="pay_type && pay_type == 1" show-overflow-tooltip label="奖金(元)" width="120" :formatter="formatter"></el-table-column>
                  <el-table-column prop="base_wage" v-else show-overflow-tooltip label="基本工资(元)" width="120" :formatter="formatter"></el-table-column>
                </template>
                <el-table-column :prop="item.field" show-overflow-tooltip :label="item.name+ '(元)'" width="100" v-for="(item,index) in extra_pay" :formatter="formatter" :key="index"></el-table-column>
                <el-table-column prop="total_wage" show-overflow-tooltip label="合计" width="100" :formatter="formatter"></el-table-column>
                <template v-if="pay_type != 2 && page_data.action_no.action_no != 1">
                  <el-table-column prop="paid_wage" label="已发放金额" width="120" :formatter="formatter" :render-header="renderHeadQueIcon">
                  </el-table-column>
                  <el-table-column label="本次发放金额" :render-header="renderHeadQueIcon" width="140" prop="current_wage" :formatter="formatter">
                  </el-table-column>
                  <el-table-column prop="is_finish_payment" label="是否完成支付" :render-header="renderHeadQueIcon" width="150">
                    <template slot-scope="scope">
                      <span>{{scope.row.is_finish_payment == 1 ? '是' : '否'}}</span>
                    </template>
                  </el-table-column>
                </template>
                <!-- 兼职增加提现状态 -->
                <el-table-column prop="pay_status" v-if="page_data.general.payment_method != 2 && !hasPaymentType" label="提现状态" width="90">
                <template slot-scope="scope">
                  <template v-if="scope.row.fail_reason && scope.row.pay_status != 100">
                    <el-tooltip class="item" effect="dark" :content="scope.row.fail_reason" placement="top-start">
                      <span class="operation_pay">{{scope.row.pay_status_text}}</span>
                    </el-tooltip>
                  </template>
                  <template v-else>
                    <span class="operation_pay">{{scope.row.pay_status_text}}</span>
                  </template>
                </template>
                </el-table-column>
                <!-- <el-table-column prop="is_finish_payment" label="是否已暂扣" width="150">
                  <template slot-scope="scope" v-if="['0','1','2','3'].indexOf(page_data.general.status_no) === -1 ">
                    <span>{{scope.row.is_finish_payment == 0 ? '是' : '否'}}</span>
                  </template>
                </el-table-column> -->

                <el-table-column label="评价" class-name="tableevaluation" width="185">
                  <template slot-scope="scope">
                    <div class="evaluation-div">
                      <i v-bind:class="['el-icon-star-on', itemindex < scope.row.comment_star ? 'selected-star' : '' ]" v-for="(item,itemindex) in foreachStar"></i>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="remark" show-overflow-tooltip min-width="120" label="备注"></el-table-column>
                <template v-if="refund.length > 0 ">
                  <el-table-column v-if="pay_type && pay_type == 2" show-overflow-tooltip fixed="right" label="操作">
                    <template slot-scope="scope">
                      <template v-if="scope.row.is_large_amount == 1 || scope.row.pay_type == 2">
                      </template>
                      <template v-else>
                        <span class="operation_pay" @click="withdrawPay(scope.row.user_name,scope.row.user_id,(scope.row.total_wage/100).toFixed(2))" v-if="scope.row.is_allow_refund == 1">撤回</span>
                      </template>
                    </template>
                  </el-table-column>
                  <el-table-column v-else show-overflow-tooltip fixed="right" label="操作">
                    <template slot-scope="scope">
                      <span class="operation_pay" @click="withdrawPay(scope.row.user_name,scope.row.user_id,(scope.row.total_wage/100).toFixed(2))" v-if="scope.row.is_allow_refund == 1">撤回</span>
                    </template>
                  </el-table-column>
                </template>
              </el-table>
            </div>
          </div>
          <p style="padding:15px 10px;color:#8492a6;font-size:12px;" v-if="pay_type && pay_type == 2">注：超7000的费用结算请项目经理/执行走线下支付流程</p>
        </div>
      </div>
      <div class="export-dialog checkconfirm alertjected">
        <el-dialog title="驳回原因" top="35%" :visible.sync="showrejected" @close="resetForm('rejected')" size="tiny">
          <el-form :model="payrollform" label-width="41px" :rules="rules" ref="rejected">
            <el-form-item label="原因" prop="remark">
              <el-input v-model="payrollform.remark" auto-complete="off" type="textarea" placeholder="请输入驳回原因"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button class="cancel" @click="resetForm('rejected')">取 消</el-button>
            <el-button type="primary" class="confirm" @click="checkconfirm('rejected')">确 定</el-button>
          </div>
        </el-dialog>
      </div>
      <!-- 删除 -->
      <div class="export-dialog checkconfirm">
        <el-dialog title="提示" top="35%" :visible.sync="showsetdel" @close="btnDisable = showsetdel = false" size="tiny">
          <span>确认将{{this.page_data.general.order_name}}删除？删除后不可恢复</span>
          <span slot="footer" class="dialog-footer">
            <el-button class="cancel" @click="btnDisable = showsetdel = false">取 消</el-button>
            <el-button type="primary" class="confirm" @click="confirmdel">确 定</el-button>
          </span>
        </el-dialog>
      </div>
      <!-- 导出 -->
      <div class="export-dialog checkconfirm">
        <el-dialog title="提示" top="35%" :visible.sync="showsetexit" @close="showsetexit = false" size="tiny">
          <span>是否确认导出{{this.page_data.general.order_name}}</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="showsetexit = false" class="cancel">取 消</el-button>
            <el-button type="primary" @click="confirmexit" class="confirm">确 定</el-button>
          </span>
        </el-dialog>
      </div>
      <!-- 撤回 -->
      <div class="export-dialog checkconfirm">
        <el-dialog title="提示" top="35%" :visible.sync="showwithdraw" @close="withdraw = false" size="tiny">
          <span>是否将该笔发给{{this.widthdrawUserPay}}元工资撤回至项目资金？（注：若多次发放只会撤回上一次发放的金额）</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="showwithdraw = false" class="cancel">取 消</el-button>
            <el-button type="primary" @click="confirmwithdraw" class="confirm">确 定</el-button>
          </span>
        </el-dialog>
      </div>
      <!-- 支付方式确实 -->
      <div class="export-dialog checkconfirm">
        <el-dialog title="提示" top="35%" :visible.sync="payTypeDia" @close="payTypeDia = false" size="tiny">
          <span>{{payTypeDiaText == 'alipay' ? '确认用'+payment_type_name+'支付？' : '确认走线下支付流程？'}}</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="payTypeDia = false" class="cancel">取 消</el-button>
            <el-button type="primary" @click="confirmDiaPay" class="confirm">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
    
    <div class="fixedbar" v-if="isReport==1">
      <div class="payroll-scope" v-if="page_data.action_no.action_no == 3 && Number(page_data.approve.approve_uid) > 0">
        <div class="save payroll-scoperight" @click="showrejected = true">
          <p>驳 回</p>
        </div>
        <div class="submit payroll-scoperight" @click="rejectedconfirm(1)">
          <p>通 过</p>
        </div>
      </div>
      <div v-show="pay_type != 2">
        <div class="payroll-scope" v-if="page_data.action_no.action_no == 1 || page_data.action_no.action_no == 2">
          <div class="submit payroll-scoperight" @click="ContinueEdit()">
            <p>{{page_data.action_no.action_no == 1 ? '继续编辑' : '重新编辑'}}</p>
          </div>
        </div>
      </div>
      <!-- 项目类型project_type：1：外包兼职 2：居间全职 3：外包全职 4：居间全职 5：外包兼职 6：居间兼职"-->
      <div v-if="project_type == 2 || project_type == 4">
        <div class="payroll-scope" v-if="page_data.action_no.action_no == 4">
          <div class="submit payroll-scoperight" @click="rejectedconfirm(2)">
            <p>支 付</p>
          </div>
        </div>
      </div>
      <div v-else>
        <template v-if="page_data.action_no.action_no == 4">
          <template v-if="project_type == 1 || project_type == 5">
            <div class="zf_tips">
              <span style="font-size:16px;">请注意：当前支付方式是{{payment_type_name}}</span>
            </div>
            <div class="payroll-scope">
              <div class="save payroll-scoperight edit-deduct"  style="margin-right: 10px;" @click="eidtPayroll()">
                <p>编 辑</p>
              </div>
              <div class="submit payroll-scoperight " @click="postCheckPayWay">
                <p>支 付</p>
              </div>
            </div>
          </template>
          <template v-if="project_type == 3 && page_data.general.can_pay==1">
            <div class="payroll-scope" v-if="page_data.general.crm_pay_type == 1 ">
              <div class="submit payroll-scoperight " style="margin-right: 10px;" @click="pickPayWay('alipay')">
                <p>支付</p>
              </div>
              <div class="submit payroll-scoperight " style="background-color: #ccc">
                <p>线下支付</p>
              </div>
            </div>
            <div class="payroll-scope" v-if="page_data.general.crm_pay_type == 2">
              <div class="submit payroll-scoperight " @click="pickPayWay('offline')">
                <p>线下支付</p>
              </div>
              <div class="submit payroll-scoperight " style="margin-right: 10px;background-color: #ccc">
                <p>支付宝支付</p>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
    <div class="fixedbar" v-if="isReport==0">
      <div class="report-warp">
        <div class="report-tips">当前项目发薪报备的可支付{{wage_order_type==1?'人员工资':'供应商费用'}}不足，请进行发薪报备</div>
        <el-button type="primary" @click="goPaydayReport()">发薪报备</el-button>
      </div>
    </div>
    <div class="protocol-dialog">
      <el-dialog title="提示" :visible.sync="dialogTableprotocol" size="tiny" :before-close="handleClose = false">
        <div>
          <div>
            <p style="color:red;font-size:16px;margin-bottom:8px">请注意：当前支付方式是{{payment_type_name}}</p>
          </div>
          <div>
            <div  v-if="unSignListData.length>0">
              <div>
                <span v-for="(i,index) in unSignListData" >{{i.real_name}}
                  <i v-if="index === unSignListData.length - 1"></i>
                  <i v-else>、</i></span>
              </div>
              <div>
                <span>未签订合同</span>
              </div>
            </div>

            <div v-if="unSyncListData.length>0" style="margin-top:10px">
              <div>
                <span v-for="(i,index) in unSyncListData">{{i.real_name}}
                  <i v-if="index === unSyncListData.length - 1"></i>
                  <i v-else>、</i></span>
              </div>
              <div>
                <span>发薪信息未同步成功</span>
              </div>
            </div>
            <div style="margin-top:10px">
                <span>是否暂扣人员工资，继续支付其他人员工资？</span>
            </div>



          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button class="cancel" @click="dialogTableprotocol = false">再想想</el-button>
          <el-button type="primary" @click="rejectedconfirm(2)">继续支付其他人员工资</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import * as util from '../assets/js/util.js'
import elUpload from "./ElUpload";
let $ = require("jquery")
const paymentTypes = [0,2];
export default {
  components: {
    elUpload
  },
  data: function () {
    var inputchange = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入驳回原因'));
      } else if (this.payrollform.name.length < 5) {
        return callback(new Error('原因不能超过5字'));
      } else {
        callback();
      }
    };
    return {
      dialogTableprotocol: false,
      submitObj: '',
      pay_type: '',
      refund: [],
      showaddPersonnelbtn: true,
      to_user_id: '',
      widthdrawUserPay: '',
      PayListDetailHeight: 0,
      showwithdraw: false,
      fixedbarwidth: 0,
      transform: false,
      showsetexit: false,
      startDate: '',
      endDate: '',
      wage_order_id: '',
      order_list: [],
      wage_name: '',
      wage_total_wage: '',
      remarks: '',
      fileList: [],
      payment_type_name: '',
      payment_type: -1,
      fullscreenLoading: true,
      showsetdel: false,
      btnDisable: false,
      extra_pay: [],
      showrejected: false,
      foreachStar: [1, 2, 3, 4, 5],
      payTypeDiaText: '', //全职选择的支付方式
      team_id: 0,
      project_id: 0,
      create_user_name: '',
      user_id: 0,
      order_id: 0,
      memberDataList: { base_wage_unit: '', },
      export_wage_order: false,
      setting_wage_order: false,
      page_data: {
        "general": {
          "order_name": "",
          "total_wage": 0,
          "start_date": 0, //时间戳
          "end_date": 0,
          "status_no": -1 //工资单状态 0：草稿 1：已提交，待审批 2：通过 3：驳回 -1：删除
        },
        "approve": {
          "approve_flag": 0, //0不展示 1展示
          "create_uid": 0,
          "create_user_name": "", //创建者
          "approve_uid": 0,
          "approve_user_name": "", //审批人
          "action_id": 0,
          "remark": "",
          "create_date": "",
          "create_at": ""
        },
        "detail": {
          "detail_exist": 0, //0:不展示详情栏 1：展示详情栏
          "base_wage_unit": "0", //0：元/天 1：元/小时
          "list": [

          ]
        },
        "action_no": {
          "action_no": 0 //不同角色的操作码 0:无操作 1:继续编辑 2:重新编辑 3:进行通过或驳回的操作
        }
      },
      payrollform: {
        remark: ''
      },
      rules: {
        remark: [
          { max: 1000, message: '长度在 1000 个字符以下', trigger: 'blur' }
        ],
      },
      project_type: '', //  项目类型  1||5 兼职   3 全职   2 供应商
      current_user_role_id: '', // 当前用户的角色 id
      unSignListData: [], // 未签署电子合同协议的用户
      unSyncListData: [], // 未同步的用户
      payTypeDia: false,
      payTypeDiaText: '',
      pay_statusList: {
        label0: '待处理',
        label10: '明细已核对,待发',
        label20: '工资发放中',
        label50: '工资发放成功',
        label60: '待提现',
        label70: '提现中',
        'label100': '提现完成',
        'label-1': '作废',
        'label-4': '工资发放失败',
        'label-5': '提现失败'
      },
      searchPerson: {
        user: '',
        payStatus: '',
        withdrawStatus: '-1'
      },
      is_nx_project: false,
      isReport:0,
      wage_order_type:0,
      payment_on_off:0
      // unSignListLength: 0
    }
  },
  vuex: {
    getters: {

    },
    actions: {

    }
  },
  computed: {
    hasPaymentType(){
      return paymentTypes.some((v)=>v==this.payment_type)
    }
  },
  watch: {
    '$route'(to, from) {
      // if (to.path.split('/').length > 2) {
      //   this.$router.push('PayrollAccounting')
      // }
      // console.log('to===', to)
      this.init();
      this.getIsNxProject();
    },
  },
  methods: {
    tableRowClassName: function (row, index) {

      if (this.searchPerson.payStatus === '') {

        if (this.searchPerson.withdrawStatus === '-1') {

          if ((row.user_name + row.mobile).indexOf(this.searchPerson.user) !== -1) {

            return '';
          }
          return 'hidden-row';

        } else {

          if ((row.user_name + row.mobile).indexOf(this.searchPerson.user) !== -1 && row.pay_status_text == this.searchPerson.withdrawStatus) {
            return '';
          }

          return 'hidden-row';
        }

      } else {

        if (this.searchPerson.withdrawStatus === '-1') {

          if ((row.user_name + row.mobile).indexOf(this.searchPerson.user) !== -1 && row.is_finish_payment == this.searchPerson.payStatus) {
            return '';
          }
          return 'hidden-row';
        } else {
          if ((row.user_name + row.mobile).indexOf(this.searchPerson.user) !== -1 &&
            row.is_finish_payment == this.searchPerson.payStatus &&
            row.pay_status_text == this.searchPerson.withdrawStatus) {
            return '';
          }
          return 'hidden-row';

        }
      }

    },

    /**
     * 初始化
     * @method init
     * @public
     * @return {Null} void
     */
    init() {
      // alert(location.href)
      this.fixedbarwidth = (window.innerWidth - 200) + 'px'
      this.PayListDetailHeight = $('.side_bar').height() + 'px';
      if(util.getLocalStorage('projectStorageInfo') && util.getLocalStorage('projectStorageInfo').team_id) {
        this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      }
      if(util.getLocalStorage('projectStorageInfo') && util.getLocalStorage('projectStorageInfo').project_id) {
        this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      }
      console.log('===', document.URL.split('?')[1].split('&')[0].split('=')[1])
      if(document.URL.split('?')[1].split('&')[0].split('=')[1]) {
        this.order_id = document.URL.split('?')[1].split('&')[0].split('=')[1]
      }
      // 从审核页跳转过来
      if (this.$route.query.from) {
        this.team_id = this.$route.query.team_id;
        this.project_id = this.$route.query.project_id;
        this.order_id = this.$route.query.order_id;
      }
      this.pay_type = util.getLocalStorage('savePayDetail') && util.getLocalStorage('savePayDetail').type
      console.log(this.pay_type, 'pay_type')
      // console.log(util.getLocalStorage('savePayDetail'))
      // window.localStorage.removeItem('savePayDetail')
      if (!this.team_id) {
        this.$router.push('overviews');
        this.fullscreenLoading = false;
        return false;
      }
      this.getpermission();
      this.getData()
      this.getOverview()
      this.isReportCheck();
    },
    //获取工资单详情
    getData() {
      util.ajax({
        url: '/wage/order_user/detail',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          order_id: this.order_id
        },
        timeout: 60000,
        success: (result) => {
          if (result && result.errno == 0) {
            let data = result.data,
              memberDataList = data.detail.list
            for (let i = 0, lg = data.detail.list.length; i < lg; i++) {
              data.detail.list[i].refundbln = true;
            }
            this.page_data = data;
            console.log(JSON.stringify(this.page_data.general.status_no), 'status_no')
            console.log(JSON.stringify(this.page_data.action_no.action_no), 'action_no')
            this.refund = data.header.refund ? [1] : [];
            this.child_order_id = data.general.child_order_id || '';
            this.memberDataList.base_wage_price = data.detail.base_wage_price; //暂定
            this.memberDataList.base_wage_unit = data.detail.base_wage_unit;
            // 关联工资单备注附件展示
            this.wage_order_id = data.general.wage_order_id;
            this.order_list = data.general.order_list;
            this.wage_name = data.general.wage_name;
            this.wage_total_wage = data.general.wage_total_wage;
            this.remarks = data.general.remarks;
            this.payment_type_name = data.general.payment_type_name;
            this.payment_type = data.general.payment_type;
            console.log('this.payment_type==', this.payment_type)
            this.page_data.approve.approve_uid = data.approve.approve_uid;
            if (data.general.enclosure && JSON.parse(data.general.enclosure).length > 0) {
              this.fileList = JSON.parse(data.general.enclosure);
            }
            if (memberDataList.length == 0) {
              util.ajax({
                url: '/wage/component/get',
                type: 'GET',
                data: {
                  team_id: this.team_id,
                  project_id: this.project_id,
                },
                timeout: 10000,
                success: (result) => {
                  if (result && result.errno == 0) {
                    extra_config = []
                    let dataS = result.data.setting_data,
                      extra_config = dataS.extra_config;
                    this.memberDataList.base_wage_price = dataS.base_wage_price;
                    this.memberDataList.base_wage_unit = dataS.base_wage_unit;
                    this.memberDataList.extra_config = dataS.extra_config;
                    extra_config.map((elem, index) => {
                      if (elem.select == 1) {
                        this.extra_pay.push({ name: elem.name, field: elem.field });
                      }
                    });
                    this.create_user_name = this.page_data.approve.create_user_name;
                    this.memberDataList.list = memberDataList;
                    this.fullscreenLoading = false;
                    this.startDate = util.getLocalTime(this.page_data.general.start_date * 1000, 'yyyy-MM-dd') + '~ '
                    this.endDate = util.getLocalTime(this.page_data.general.end_date * 1000, 'yyyy-MM-dd')
                  } else {
                    this.alertinfo(result.errmsg);
                  }
                },
                error: (xhr, status) => {
                  this.alertinfo('服务器异常');
                },
                noNetwork: () => {
                  this.alertinfo('网络连接失败，请检查网络');
                }
              })
            } else {
              this.extra_pay = memberDataList[0].extra_pay;
              this.memberDataList.extra_config = this.extra_pay;
              this.memberDataList.extra_config.map((elem, n) => {
                this.memberDataList.extra_config[n].select = 1;
              });
              this.create_user_name = this.page_data.approve.create_user_name;
              memberDataList.map((elem, i) => {
                let extra_pay = elem.extra_pay;
                memberDataList[i].all_days = memberDataList[i].normal_days + memberDataList[i].abnormal_days
                extra_pay.map(function (elem, n) {
                  memberDataList[i][extra_pay[n].field] = extra_pay[n].value || '';
                });
                delete memberDataList[i].extra_pay;
              });
              this.memberDataList.list = memberDataList;
              this.fullscreenLoading = false;
              this.startDate = util.getLocalTime(this.page_data.general.start_date * 1000, 'yyyy-MM-dd') + '~ '
              this.endDate = util.getLocalTime(this.page_data.general.end_date * 1000, 'yyyy-MM-dd')
            }
          } else {
            this.alertinfo(result.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo('服务器异常');
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络');
        }
      })
    },
    isReportCheck() {
      util.ajax({
        url: '/wage/report/check',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          wage_order_id: this.order_id
        },
        timeout: 60000,
        success: (result) => {
          if (result && result.errno == 0) {
            this.isReport=result.data.status;
            this.wage_order_type=result.data.type;
          } else {
            this.alertinfo(result.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo('服务器异常');
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络');
        }
      })
    },
    goPaydayReport(){
      this.$router.push("PaydayReport");
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.showrejected = false;
    },
    goDet(id) {
      // console.log('location====', window.location, window.location.href.split('?').indexOf)
      // return
      const url = 'PaylistDetail?order_id=' + id + '&ifConfirmEmail=false';
      this.$router.replace(url)
    },
    renderHeadQueIcon(h, { column }) {
      return h(
        'el-tooltip', {
        props: {
          content: (function () {
            let label = column.label
            switch (label) {
              case '已发放金额':
                return '已发放金额是本工资单中已经给该名员工发放的金额总和'
                break
              case '本次发放金额':
                return "本次发放金额，是本次支付需要给该员工发放的金额，可以编辑调整，金额需要小于等于‘合计’减‘已发放金额；提现失败不允许支付剩余金额"
                break
              case '是否完成支付':
                return "若该名员工本工资单中的金额已经全部支付状态为'是'，未全部支付则状态为'否'"
                break
            }
          })(),
          placement: 'top'
        },
        domProps: {
          innerHTML: column.label + '<i class="dm-icon-question"></i>'
        }
      },
        [h('span')]
      )
    },
    checkconfirm(formName, action_no) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.rejectedconfirm(0)
        } else {
          return false;
        }
      });
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-09-02
     * @example
     * @description 搜索人员
     * @return   {[type]}   [description]
     */
    onSearchPerson() {
      console.log(3333333333)
      //this.page_data.detail.list = JSON.parse(JSON.stringify(this.page_data.detail.list))
      // util.ajax({
      //     url:'/wage/order_user/detail',
      //     type:'GET',
      //     data:{
      //         team_id: this.team_id,
      //         project_id: this.project_id,
      //         order_id: this.order_id
      //     },
      //     timeout:10000,
      //     success:(result) => {
      //       if(result&&result.errno == 0){
      //         let list = data.detail.list;

      //       }else{
      //         this.alertinfo(result.errmsg);
      //       }
      //     },
      //     error: (xhr, status) => {
      //         this.alertinfo('服务器异常');
      //     },
      //     noNetwork: () => {
      //         this.alertinfo('网络连接失败，请检查网络');
      //     }
      // })
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-09-02
     * @description 编辑或者保存工资单，只有在兼职工资单可触发
     * @return   {[type]}   [description]
     */
    eidtPayroll() {
      let PaylistDetail = 'EditPayrollDeduct?order_id=' + this.order_id;
      this.$router.push(PaylistDetail)
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-06-04
     * @example
     * @param    {[string]}   qz_pay_type [alipay or offline]
     * @description   支付类型支付宝支付或者线下支付
     */
    pickPayWay(qz_pay_type) {
      this.payTypeDiaText = qz_pay_type;
      this.payTypeDia = true;
    },
    //确定支付
    confirmDiaPay() {
      this.postCheckPayWay()
    },
    postCheckPayWay() {
      let user_id = []
      this.page_data.detail.list.forEach((item) => {
        user_id.push(item.user_id)
      })
      console.log(user_id)
      util.ajax({
        url: '/protocol/check/sign',
        type: 'POST',
        data: {
          project_id: this.project_id,
          user_id: user_id,
          payment_type: this.payment_type
        },
        timeout: 10000,
        success: (result) => {
          if (result && result.errno == 0) {
            this.unSignListData = []
            this.unSyncListData = []
            let str = []
            // this.unSignListLength = result.data.un_sign_user_list.length;
            if (result.data.un_sign_user_list.length || result.data.un_sync_user_list.length) {
              this.unSignListData = result.data.un_sign_user_list
              this.unSyncListData = result.data.un_sync_user_list
              this.dialogTableprotocol = TextTrackCue
            } else {
              const text = this.payment_type_name;
              this.$alert(`当前支付方式：${text}`, '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  if(action == 'confirm') { 
                    this.rejectedconfirm(2)
                  }
                }
              });
            }
          }
        },
        error: (xhr, status) => {
          this.alertinfo('服务器异常');
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络');
        }
      })
    },
    /**
     * It's a magic function
     * @Author   YF
     * @DateTime 2020-06-04
     * @example
     * @param    {[number]}   action_no [0:未通过 1:通过 2：支付]
     * @param    {[string]}   pay_type      [支付方式 alipay or offline]
     * @return   {[type]}             [description]
     */
    rejectedconfirm(action_no) {
      let qz_pay_type = this.payTypeDiaText;
      if (this.btnDisable) return;
      this.btnDisable = true;
      this.fullscreenLoading = true;
      let newTab
      if (action_no == 2 && !qz_pay_type && this.hasPaymentType) {
        newTab = window.open('', '_blank');
      }
      util.ajax({
        url: '/wage/approve/order',
        type: 'POST',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          payment_method: qz_pay_type == 'alipay' ? 1 : 2,
          order_id: this.order_id,
          action_no: action_no,
          child_order_id: this.child_order_id || '',
          remark: this.payrollform.remark || ''
        },
        timeout: 10000,
        success: (result) => {
          this.btnDisable = false;
          if (result && result.errno == 0) {
            if (action_no == 0) {
              this.alertinfo('审批驳回完成', 'success');
              this.showrejected = false
              this.init();
            } else if (action_no == 1) {
              this.alertinfo('审批通过完成', 'success');
              this.init();
            } else if (action_no == 2) {
              this.fullscreenLoading = false;
              if (qz_pay_type == 'alipay' || 'offline' == qz_pay_type || !this.hasPaymentType) {
                this.payTypeDia = false;
                this.dialogTableprotocol = false
                this.init();
              } else {
                newTab.location = result.data.jump_url;
              }
            }
          } else {
            if (qz_pay_type == 'alipay' || 'offline' == qz_pay_type || !this.hasPaymentType) {
              this.payTypeDia = false;
            } else {
              if (action_no == 2) {
                newTab.close()
              }
            }
            this.alertinfo(result.errmsg);
          }
        },
        error: (xhr, status) => {
          if (qz_pay_type == 'alipay' || 'offline' == qz_pay_type || !this.hasPaymentType) {
            this.payTypeDia = false;
          } else {
            if (action_no == 2) {
              newTab.close()
            }
          }
          this.btnDisable = false;
          this.alertinfo('服务器异常');
          //widget.toast('服务器异常') 
        },
        noNetwork: () => {
          if (qz_pay_type == 'alipay' || 'offline' == qz_pay_type || !this.hasPaymentType) {
            this.payTypeDia = false;
          } else {
            if (action_no == 2) {
              newTab.close()
            }
          }
          if (action_no == 2) {
            newTab.close()
          }
          this.btnDisable = false;
          this.alertinfo('网络连接失败，请检查网络');
        }
      })
    },
    //继续编辑
    ContinueEdit() {
      let locatData = {};
      util.setLocalStorage('locatData', '')
      if (this.project_type == 3) {
        locatData.start_date = util.getLocalTime(this.page_data.general.start_date * 1000, 'yyyy-MM-dd');
        locatData.end_date = util.getLocalTime(this.page_data.general.end_date * 1000, 'yyyy-MM-dd')
        locatData.add_user_flag = 0;
        locatData.team_id = this.team_id;
        locatData.project_id = this.project_id;
        locatData.approve_uid = this.page_data.approve.approve_uid;
        locatData.audit_flag = this.audit_flag;
        locatData.order_name = this.page_data.general.order_name
        locatData.confirm_id = this.page_data.general.confirm_id;
        locatData.pay_flag = this.pay_flag;
        locatData.mark_days = this.memberDataList.mark_days
        locatData.base_wage = this.memberDataList.base_wage
        locatData.pay_type = this.pay_type
        locatData.project_type = this.project_type
        locatData.current_user_role_id = this.current_user_role_id;
        // 关联工资单备注附件展示
        if (this.wage_order_id) {
          locatData.relationPayroll = this.wage_order_id;
          locatData.relationPayrollList = this.order_list;
          locatData.remarks = this.remarks;
          locatData.contractFile = this.fileList;
        }
        util.setLocalStorage('locatData', locatData)
        let memberDataList = JSON.stringify(this.memberDataList)
        util.setLocalStorage('memberDataList', memberDataList)
        this.$router.push('fullTimeCreateEditPayroll?order_id=' + this.order_id)
      } else {
        locatData.start_date = util.getLocalTime(this.page_data.general.start_date * 1000, 'yyyy-MM-dd');
        locatData.end_date = util.getLocalTime(this.page_data.general.end_date * 1000, 'yyyy-MM-dd')
        locatData.order_name = this.page_data.general.order_name
        locatData.approve_uid = this.page_data.approve.approve_uid;
        locatData.add_user_flag = 0;
        locatData.team_id = this.team_id;
        locatData.project_id = this.project_id;
        locatData.audit_flag = this.audit_flag;
        locatData.confirm_id = this.page_data.general.confirm_id;
        locatData.pay_flag = this.pay_flag;
        locatData.mark_days = this.memberDataList.mark_days
        locatData.base_wage = this.memberDataList.base_wage
        locatData.pay_type = this.pay_type
        // 关联工资单备注附件展示
        if (this.wage_order_id) {
          locatData.relationPayroll = this.wage_order_id;
          locatData.relationPayrollList = this.order_list;
          locatData.remarks = this.remarks;
          locatData.contractFile = this.fileList;
        }
        util.setLocalStorage('locatData', locatData)
        let memberDataList = JSON.stringify(this.memberDataList)
        util.setLocalStorage('memberDataList', memberDataList)
        this.$router.push('CreateEditPayroll?order_id=' + this.order_id)
      }
    },
    //删除工资单
    delPayroll() {
      this.showsetdel = true;
    },
    confirmdel() {
      if (this.btnDisable) return;
      this.btnDisable = true;
      util.ajax({
        url: '/wage/order_user/delete',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          order_id: this.order_id
        },
        timeout: 10000,
        success: (result) => {
          if (result && result.errno == 0) {
            this.alertinfo('删除成功', 'success');
            setTimeout(function () {
              history.go(-1)
            }, 100)
          } else {
            this.alertinfo(result.errmsg);
            this.btnDisable = false;
          }
        },
        error: (xhr, status) => {
          this.alertinfo('服务器异常');
          this.btnDisable = false;
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络');
          this.btnDisable = false;
        }
      })
    },
    //导出工资单
    exportPayroll() {
      this.showsetexit = true
    },
    confirmexit() {

      //姓名/手机号
      this.searchPerson.user
      //是否暂扣 1 是 0 否
      this.searchPerson.payStatus
      //提现状态
      let withdrawStatus = -100;
      switch (this.searchPerson.withdrawStatus) {
        case '提现成功':
          withdrawStatus = 100;
          break;
        case '提现失败':
          withdrawStatus = -5;
          break;
      }
      this.showsetexit = false
      let href = '/sea/api/1.0/client/v1/wage/order/export?team_id=' + this.team_id + '&dmclient=pcweb&project_id=' + this.project_id + '&order_ids=[' + this.order_id + ']&from_type=1' + '&user_info=' + this.searchPerson.user + '&pay_status=' + this.searchPerson.payStatus + '&withdraw_status=' + withdrawStatus;
      util.locationHref(href)
    },
    //撤回
    withdrawPay(username, user_id, total_wage) {
      this.to_user_id = user_id;
      this.widthdrawUserPay = username + '的' + total_wage;
      this.showwithdraw = true;
    },
    //撤回工资单
    confirmwithdraw() {
      if (this.btnDisable) return;
      this.btnDisable = true;
      util.ajax({
        url: '/wallet/pay/withdraw',
        type: 'POST',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          wage_order_id: this.order_id,
          to_user_id: this.to_user_id,
          client_type: 1
        },
        timeout: 10000,
        success: (result) => {
          this.btnDisable = false;
          if (result && result.errno == 0) {
            this.alertinfo('撤回成功', 'success');
            location.reload();
          } else {
            this.alertinfo(result.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo('网络连接失败，请检查网络');
          this.btnDisable = false;
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络');
          this.btnDisable = false;
        }
      })
      this.showwithdraw = false;
    },
    //工资单位变为元
    formatter(row, column) {
      return (+row[column.property]) / 100
    },
    //返回列表
    goPayrollList() {
      this.$router.replace('PayrollAccounting')
    },
    //
    visibleChange(bln) {
      ;
      this.transform = bln
    },
    getpermission() {
      util.ajax({
        url: '/permission/application',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          application_id: 6
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            obj.data.forEach((o) => {
              if (o.id_name == 'export_wage_order') {
                this.export_wage_order = true
              }
              if (o.id_name == 'setting_wage_order') {
                this.setting_wage_order = true;
              }
            })
          }
        },
        error: (xhr, status) => {
          this.alertinfo('网络连接失败，请检查网络');
        },
        noNetwork: () => {
          //网络超时
          this.alertinfo('网络连接失败，请检查网络');
        }
      })
    },
    // 显示错误信息
    alertinfo(text, type) {
      this.btnDisable = false;
      this.fullscreenLoading = false;
      this.$message({
        showClose: true,
        message: text,
        type: type || 'warning',
      });
    },
    getOverview() {
      util.ajax({
        url: '/project/overview',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.payment_on_off=obj.data.list.payment_on_off;
            this.project_type = obj.data.list.project_type
            console.log(this.project_type, 'project_type')
            this.current_user_role_id = obj.data.list.current_user_role_id
          }
        },
        error: (xhr, status) => {

        },
        noNetwork: () => {

        }
      })
    },
    getIsNxProject() {
      setTimeout(()=> {
        this.is_nx_project = JSON.parse(window.localStorage.getItem('isNxProject'));
        console.log('this.is_nx_project===', this.is_nx_project)
      }, 800)
    }
  },
  created() {
    this.init();
    console.log('this.$route', this.$route.query.ifConfirmEmail)
  },
  mounted() {
    this.getIsNxProject();
  }
}

</script>
<style src='../assets/css/PayListDetail.css'></style>
<style src='../assets/css/base.css'></style>
<style scope>
.applications {
  overflow-y: hidden;
}
</style>
