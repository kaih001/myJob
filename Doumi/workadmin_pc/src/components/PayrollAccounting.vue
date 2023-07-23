<template>
  <div id="PayrollAccounting" class="yf-payrollaccounting">
    <div class="kq-wapper ">
      <div class="head-titledo">
        <h2>
          工资核算
          <span style="margin:0 10px 0 20px;font-weight:500;color:red;font-size:16px;">当前支付方式：{{payTypeName}}</span>
        </h2>
        <div class="pannel-warp" v-if="payment_on_off==1">
          <div class="pannel-label">当前可支付人员工资金额：</div>
          <div class="pannel-amount">{{pannelData.wage_report_balance}}</div>
          <div class="pannel-label">当前可支付供应商费用金额：</div>
          <div class="pannel-amount">{{pannelData.supplier_report_balance}}</div>
          <a @click="goPaydayReport">去发薪报备</a>
        </div>
        <div class="createSet" style="padding-top:5px;">
          <a href="javascript:;" class="create first " @click="createPayroll" v-if="create_wage_order"><i class="createico_svg"></i>新建工资单</a>
          <a href="javascript:;" class="set" @click="setPayroll" v-if="settin_payroll && project_type != 3"><i class="setico_svg"></i>设置</a>
          <!-- 全职 -->
          <template v-if="ifConfirmEmail && project_type == 3">
            <div class="export-dialog createPayrollalert confirmPaycollalert">
              <el-dialog title="新建工资单全职" :visible.sync="createdialogVisible" @close="resetForm('payrollform')" size="tiny">
                <el-form :model="payrollform" label-width="97px" :rules="rules" ref="payrollform">
                  <el-form-item label="客户确认" prop="confirm_id" class="approve_uid">
                    <el-select v-model="payrollform.confirm_id" placeholder="请选择审核通过的客户确认" style="width:292px">
                      <el-option v-for="item in confirmList" :label="item.subject" :key="item.confirm_id" :value="item.confirm_id"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- <el-form-item> -->
                  <el-checkbox-group>
                    <!-- <p name="type" class="confirm_info_flag">客户确认对应结算单进行过垫付或资金分配后才可创建工资单</p> -->
                    <p name="type" class="confirm_info_flag">系统会根据客户确认考勤自动生成工资单</p>
                  </el-checkbox-group>
                  <!-- </el-form-item> -->
                </el-form>
                <div slot="footer" class="dialog-footer">
                  <el-button class="cancel" @click="resetForm('payrollform')">取 消</el-button>
                  <el-button type="primary" class="confirm" @click="addPayrollconfirm('payrollform')">确 定</el-button>
                </div>
              </el-dialog>
            </div>
          </template>
          <template v-else>
            <div class="export-dialog createPayrollalert" v-if="!ifConfirmEmail && isOpenBaseWage == false && is_open_supplier == false">
              <el-dialog title="新建工资单" :visible.sync="createdialogVisible" @close="resetForm('payrollform')" size="tiny">
                <el-form :model="payrollform" label-width="97px" :rules="rules" ref="payrollform">
                  <el-form-item label="工资单名称" prop="order_name">
                    <el-input v-model="payrollform.order_name" auto-complete="off" placeholder="例如：引导组工资单" style="width: 292px"></el-input>
                  </el-form-item>
                  <el-form-item label="类型" prop="order_type">
                    <el-select v-model="payrollform.order_type" auto-complete="off" placeholder="请选择类型" style="width: 292px">
                      <el-option v-for="item in payrollform.type_list" :label="item.name" :key="item.id" :value="item.id"></el-option>
                    </el-select>
                    <p style="color:red;font-size:12px;line-height:16px" v-if="payrollform.order_type === 1">
                      请备注里填写谁代领了谁的工资，金额多少
                    </p>
                  </el-form-item>
                  <el-form-item label="核算周期" prop="kqDateDay">
                    <el-date-picker v-model="payrollform.kqDateDay" :clearable="false" type="daterange" :editable="false" style="width:292px" :picker-options="endtime" placeholder="选择日期范围">
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item label="审批人" prop="approve_uid" class="approve_uid">
                    <el-select v-model="payrollform.approve_uid" placeholder="请选择" style="width:292px" disabled>
                      <el-option v-for="item in payrollform.regionlist" :label="item.user_id == 0 ? item.real_name : item.real_name + '' + item.identity_str + '' " :key="item.user_id" :value="item.user_id"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="关联工资单" prop="relationPayroll">
                    <el-select v-model="payrollform.relationPayroll" placeholder="请关联对应撤回金额的工资单" style="width:292px" filterable>
                      <el-option v-for="item in payrollform.relationPayrollList" :label="item.name+'-'+item.total_wage/100" :key="item.id" :value="item.id"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="备注" prop="remarks">
                    <el-input type="textarea" :rows="3" maxlength="200" placeholder="请输入备注" v-model="payrollform.remarks">
                    </el-input>
                  </el-form-item>
                  <el-form-item label="附件" prop="contractFile" ref="elUploadItem">
                    <elUpload ref="uploadRef" @getNewFileListFun="getNewFileListFun" :fileListValue="payrollform.contractFile"></elUpload>
                  </el-form-item>
                  <el-form-item style="margin-bottom:0">
                    <el-checkbox-group v-model="payrollform.add_user_flag">
                      <el-checkbox label="自动添加核算周期内的出勤人员" name="type" class="add_user_flag"></el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                  <el-button class="cancel" @click="resetForm('payrollform')">取 消</el-button>
                  <el-button type="primary" class="confirm" @click="addPayrollconfirm('payrollform')">确 定</el-button>
                </div>
              </el-dialog>
            </div>
            <div class="export-dialog createPayrollalert confirmPaycollalert" v-if="ifConfirmEmail && isOpenBaseWage == false && is_open_supplier == false">
              <el-dialog title="新建工资单" :visible.sync="createdialogVisible" @close="resetForm('payrollform')" size="tiny">
                <el-form :model="payrollform" label-width="97px" :rules="rules" ref="payrollform">
                  <el-form-item label="客户确认" prop="confirm_id" class="approve_uid">
                    <el-select v-model="payrollform.confirm_id" placeholder="请选择审核通过的客户确认" style="width:292px">
                      <el-option v-for="item in payrollform.regionlist" :label="item.subject" :key="item.confirm_id" :value="item.confirm_id"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- <el-form-item> -->
                  <el-checkbox-group>
                    <p name="type" class="confirm_info_flag">客户确认对应结算单进行过垫付或资金分配后才可创建工资单</p>
                    <p name="type" class="confirm_info_flag">系统会根据客户确认考勤自动生成工资单</p>
                  </el-checkbox-group>
                  <!-- </el-form-item> -->
                </el-form>
                <div slot="footer" class="dialog-footer">
                  <el-button class="cancel" @click="resetForm('payrollform')">取 消</el-button>
                  <el-button type="primary" class="confirm" @click="addPayrollconfirm('payrollform')">确 定</el-button>
                </div>
              </el-dialog>
            </div>
            <div class="export-dialog createPayrollalert confirmPaycollalert" v-if="ifConfirmEmail && isOpenBaseWage == true && is_open_supplier == false">
              <el-dialog title="新建工资单" :visible.sync="createdialogVisible" @close="resetForm('payrollform')" size="tiny">
                <el-form :model="payrollform" label-width="97px" :rules="rules" ref="payrollform">
                  <el-form-item label="工资类型" class="approve_uid" style="padding-left: 9px;">
                    <el-select v-model="payrollform.pay_type" style="width:292px;margin-left:-9p;">
                      <template v-for="item in payrollform.paytypeArr">
                        <el-option :key="item.id" :label="item.text" :value="item.id">
                        </el-option>
                      </template>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="城市岗位" prop="address" class="approve_uid" v-show="payrollform.pay_type == 1">
                    <el-select v-model="payrollform.address" placeholder="请选择" style="width:292px;" @change="getMonthList">
                      <template v-for="item in payrollform.addr_mont">
                        <el-option :label="item.name" :key="item.name" :value="item.name"></el-option>
                      </template>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="奖励月份" prop="month" class="approve_uid" v-show="payrollform.pay_type == 1">
                    <el-select v-model="payrollform.month" placeholder="请选择" style="width:292px;" :disabled="payrollform.address == '' ? true : false">
                      <template v-for="m in payrollform.monthArrList">
                        <el-option :label="m.date" :key="m.id" :value="m.id"></el-option>
                      </template>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="客户确认" prop="confirm_id" class="approve_uid" v-show="payrollform.pay_type == 0">
                    <el-select v-model="payrollform.confirm_id" placeholder="请选择审核通过的客户确认" style="width:292px">
                      <el-option v-for="item in payrollform.regionlist" :label="item.subject" :key="item.confirm_id" :value="item.confirm_id"></el-option>
                    </el-select>
                  </el-form-item>
                  <!-- <el-form-item> -->
                  <el-checkbox-group>
                    <p name="type" class="confirm_info_flag" v-if="payrollform.pay_type == 0">客户确认对应结算单进行过垫付或资金分配后才可创建工资单</p>
                    <p name="type" class="confirm_info_flag" v-if="payrollform.pay_type == 0">系统会根据客户确认考勤自动生成工资单</p>

                    <p name="type" class="confirm_info_flag" v-if="payrollform.pay_type == 1">系统根据已发过工资客户确认考勤记录，生成当月满足奖金条件且未发放过人员工资单</p>
                  </el-checkbox-group>
                  <!-- </el-form-item> -->
                </el-form>
                <div slot="footer" class="dialog-footer">
                  <el-button class="cancel" @click="resetForm('payrollform')">取 消</el-button>
                  <!-- <el-button type="primary" class="confirm" @click="addPayrollconfirm('payrollform')">确 定</el-button> -->
                  <el-button type="primary" class="confirm" @click="addPayrollconfirm('address','month','confirm_id')">确 定</el-button>
                </div>
              </el-dialog>
            </div>
            <!--客户确认 开启供应商费用结算-->
            <div class="export-dialog createPayrollalert confirmPaycollalert" v-if="ifConfirmEmail && isOpenBaseWage == false && is_open_supplier == true">
              <el-dialog title="新建工资单" :visible.sync="createdialogVisible" @close="resetForm('payrollform')" size="tiny">
                <el-form :model="payrollform" label-width="97px" :rules="rules" ref="payrollform">
                  <el-form-item label="工资类型" class="approve_uid" style="padding-left: 9px;">
                    <el-select v-model="payrollform.pay_type" style="width:292px;margin-left: -9px" @change="onChangeType">
                      <template v-for="item in payrollform.paytypeArr">
                        <el-option :key="item.id" :label="item.text" :value="item.id">
                        </el-option>
                      </template>
                    </el-select>
                  </el-form-item>
                  <!-- 当 pay_type 为供应商费用时-->
                  <div v-if="payrollform.pay_type == 2">
                    <el-form-item label="城市岗位" prop="address2" class="approve_uid">
                      <el-select v-model="payrollform.address2" placeholder="请选择" style="width:292px;" @change="getMonthList">
                        <template v-for="item in payrollform.addr_mont2">
                          <el-option :label="item.city_name+'-'+item.demand_post_name" :key="item.city_name+'-'+item.demand_post_name" :value="item.city_name+'-'+item.demand_post_name"></el-option>
                        </template>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="客户确认" prop="confirm_id2" class="approve_uid">
                      <el-select v-model="payrollform.confirm_id2" placeholder="请选择审核通过的客户确认" style="width:292px" @change="confirmIdChange">
                        <el-option v-for="item in payrollform.regionlist2" :label="item.subject" :key="item.id" :value="item.id"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                  <div v-else>
                    <el-form-item label="客户确认" prop="confirm_id" class="approve_uid" v-if="payrollform.pay_type == 0">
                      <el-select v-model="payrollform.confirm_id" placeholder="请选择审核通过的客户确认" style="width:292px">
                        <el-option v-for="item in payrollform.regionlist" :label="item.subject" :key="item.confirm_id" :value="item.confirm_id"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                  <!-- <el-form-item> -->
                  <el-checkbox-group>
                    <p name="type" class="confirm_info_flag" v-if="payrollform.pay_type == 0">客户确认对应结算单进行过垫付或资金分配后才可创建工资单</p>
                    <p name="type" class="confirm_info_flag" v-if="payrollform.pay_type == 0">系统会根据客户确认考勤自动生成工资单</p>
                    <p name="type" class="confirm_info_flag" style="color:red;font-size:16px" v-if="payrollform.pay_type == 0">当前支付方式：{{payTypeName}}</p>
                  </el-checkbox-group>
                  <!-- </el-form-item> -->
                </el-form>
                <div slot="footer" class="dialog-footer">
                  <el-button class="cancel" @click="resetForm('payrollform')">取 消</el-button>
                  <!-- <el-button type="primary" class="confirm" @click="addPayrollconfirm('payrollform')">确 定</el-button> -->
                  <el-button v-if="payrollform.pay_type == 2" type="primary" class="confirm" @click="addPayrollconfirm2('address2','confirm_id2')">确 定</el-button>
                  <el-button v-else type="primary" class="confirm" @click="addPayrollconfirm3('confirm_id')">确 定</el-button>
                </div>
              </el-dialog>
            </div>
            <div class="export-dialog createPayrollalert confirmPaycollalert" v-if="ifConfirmEmail && isOpenBaseWage == true && is_open_supplier == true">
              <el-dialog title="新建工资单" :visible.sync="createdialogVisible" @close="resetForm('payrollform')" size="tiny">
                <el-form :model="payrollform" label-width="97px" :rules="rules" ref="payrollform">
                  <el-form-item label="工资类型" class="approve_uid" style="padding-left: 9px;">
                    <el-select v-model="payrollform.pay_type" style="width:292px;margin-left:-9px;">
                      <template v-for="item in payrollform.paytypeArr">
                        <el-option :key="item.id" :label="item.text" :value="item.id">
                        </el-option>
                      </template>
                    </el-select>
                  </el-form-item>
                  <div v-if="payrollform.pay_type == 2">
                    <el-form-item label="城市岗位" prop="address2" class="approve_uid">
                      <el-select v-model="payrollform.address2" placeholder="请选择" style="width:292px;" @change="getMonthList">
                        <template v-for="item in payrollform.addr_mont2">
                          <el-option :label="item.city_name+'-'+item.demand_post_name" :key="item.city_name+'-'+item.demand_post_name" :value="item.city_name+'-'+item.demand_post_name"></el-option>
                        </template>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="客户确认" prop="confirm_id2" class="approve_uid">
                      <el-select v-model="payrollform.confirm_id2" placeholder="请选择审核通过的客户确认" style="width:292px" @change="confirmIdChange">
                        <el-option v-for="item in payrollform.regionlist2" :label="item.subject" :key="item.id" :value="item.id"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                  <div v-else>
                    <el-form-item label="城市岗位" prop="address" class="approve_uid" v-show="payrollform.pay_type == 1">
                      <el-select v-model="payrollform.address" placeholder="请选择" style="width:292px;" @change="getMonthList">
                        <template v-for="item in payrollform.addr_mont">
                          <el-option :label="item.name" :key="item.name" :value="item.name"></el-option>
                        </template>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="奖励月份" prop="month" class="approve_uid" v-show="payrollform.pay_type == 1">
                      <el-select v-model="payrollform.month" placeholder="请选择" style="width:292px;" :disabled="payrollform.address == '' ? true : false">
                        <template v-for="m in payrollform.monthArrList">
                          <el-option :label="m.date" :key="m.id" :value="m.id"></el-option>
                        </template>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="客户确认" prop="confirm_id" class="approve_uid" v-show="payrollform.pay_type == 0">
                      <el-select v-model="payrollform.confirm_id" placeholder="请选择审核通过的客户确认" style="width:292px">
                        <el-option v-for="item in payrollform.regionlist" :label="item.subject" :key="item.confirm_id" :value="item.confirm_id"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                  <!-- <el-form-item> -->
                  <el-checkbox-group>
                    <p name="type" class="confirm_info_flag" v-if="payrollform.pay_type == 0">客户确认对应结算单进行过垫付或资金分配后才可创建工资单</p>
                    <p name="type" class="confirm_info_flag" v-if="payrollform.pay_type == 0">系统会根据客户确认考勤自动生成工资单</p>
                    <p name="type" class="confirm_info_flag" v-if="payrollform.pay_type == 1">系统根据已发过工资客户确认考勤记录，生成当月满足奖金条件且未发放过人员工资单</p>
                  </el-checkbox-group>
                  <!-- </el-form-item> -->
                </el-form>
                <div slot="footer" class="dialog-footer">
                  <el-button class="cancel" @click="resetForm('payrollform')">取 消</el-button>
                  <!-- <el-button type="primary" class="confirm" @click="addPayrollconfirm('payrollform')">确 定</el-button> -->
                  <el-button v-if="payrollform.pay_type == 2" type="primary" class="confirm" @click="addPayrollconfirm2('address2','confirm_id2')">确 定</el-button>
                  <el-button v-else type="primary" class="confirm" @click="addPayrollconfirm('address','month','confirm_id')">确 定</el-button>
                </div>
              </el-dialog>
            </div>
          </template>
        </div>
      </div>
      <div class="kq-header addlemnt">
        <div class="kq-tab">
          <div class="kq-record">
            <div class="kq-seach-form">
              <el-form label-width="40px" :rules="rules" :model="searchlist">
                <div class="from-item-list member">
                  <el-form-item label="名称：">
                    <el-input v-model="searchlist.order_keyword" clearable auto-complete="off" style="width:185px;" placeholder="请输入工资单名称"></el-input>
                  </el-form-item>
                </div>
                <div class="from-item-list member">
                  <el-form-item label="提交人：" label-width="50px">
                    <el-autocomplete popper-class="payrollAsearch" style="width:155px;" v-model="memberDay" :fetch-suggestions="querySearch" custom-item="my-item-zh" :trigger-on-focus="false" placeholder="姓名/手机号" @select="handleSelect">
                    </el-autocomplete>
                  </el-form-item>
                </div>
                <div class="from-item-list">
                  <el-form-item label="状态：">
                    <el-select style="width:150px" v-model="view_type" placeholder="请选择">
                      <el-option v-for="item in viewType" :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div class="from-item-list memberDayC">
                  <el-form-item label="人员：" label-width="50px">
                    <el-autocomplete popper-class="payrollAsearch" style="width:155px;" v-model="memberDayC" :fetch-suggestions="querySearch" custom-item="my-item-zh" :trigger-on-focus="false" placeholder="姓名/手机号" @select="handleSelectC">
                    </el-autocomplete>
                  </el-form-item>
                </div>
                <div class="from-item-list is_split" v-if="project_type == 3">
                  <el-form-item label="是否暂扣：" label-width="60px">
                    <el-select style="width:188px" v-model="is_split" placeholder="请选择">
                      <el-option v-for="item in splitType" :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div class="from-item-list no-margin-right" @click="getTableDataRecord">
                  <el-button type="primary" class="confirm">搜 索</el-button>
                </div>
              </el-form>
            </div>
            <div class="kq-handle-form" style="margin-bottom:10px;" v-if="!!show_batch_payment&&identity==1">
              <el-button type="primary" style="margin-left:0;" @click="payWithholding">批量支付暂扣工资</el-button>
              <el-button type="primary" style="margin-left:0;" @click="payResultDown">支付结果下载</el-button>
            </div>
            <div class="kq-table-record">
              <el-table :data="payrollInfo.list" border style="width: 100%" :height="tableHeight" empty-text="暂无数据" @row-click="goToPayDetail" v-loading.body="loading">
                <el-table-column prop="order_name" label="名称" fixed show-overflow-tooltip min-width="160"></el-table-column>
                <el-table-column prop="payment_type_name" label="支付方式" show-overflow-tooltip min-width="160">
                  <template slot-scope="scope">
                    <span style="">{{scope.row.payment_type_name}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status_no" label="状态" min-width="110" filter-placement="bottom-end">
                  <template slot-scope="scope">
                    <el-tag :type=" 'primary' + scope.row.status_no" close-transition>{{viewTypeShow['label'+scope.row.status_no]}}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="is_split" label="是否暂扣" min-width="100" filter-placement="bottom-end" v-if="project_type == 3">
                  <template slot-scope="scope">
                    <el-icon name="type"></el-icon>
                    <span v-if="scope.row.is_split_payment == 1">是</span>
                    <span v-if="scope.row.is_split_payment== 0">否</span>
                  </template>
                </el-table-column>
                <el-table-column prop="start_dateandend_date" label="结算日期范围" :formatter="formatterdate" min-width="190"></el-table-column>
                <el-table-column label="工资类型" min-width="100">
                  <template slot-scope="scope">
                    <el-icon name="type"></el-icon>
                    <span v-if="scope.row.type == 0">人员工资</span>
                    <span v-if="scope.row.type == 1">补助奖金</span>
                    <span v-if="scope.row.type == 2">供应商费用</span>
                    <span v-if="scope.row.type == 3">全职工资</span>
                  </template>
                </el-table-column>
                <el-table-column prop="create_user" label="提交人" min-width="100"></el-table-column>
                <el-table-column prop="approve_user" label="审批人" min-width="100"></el-table-column>
                <el-table-column prop="bar_num" label="结算人数" min-width="100"></el-table-column>
                <el-table-column :prop="item" :label="tableHeaderLabel[item] + '(元)'" min-width="120" v-for="item in tableHeader" :key="item" :formatter="formatter"></el-table-column>
                <el-table-column prop="paid_wage" :formatter="formatter" label="已支付金额" min-width="100"></el-table-column>
              </el-table>
              <el-pagination @current-change="handleSizeChange" :current-page.sync="searchlist.page_no" :page-size="searchlist.page_size" layout="total, prev, pager, next" :total="total">
              </el-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 批量支付暂扣工资弹窗 -->
  </div>
</template>
<script>
import * as util from '../assets/js/util.js'
import elUpload from "./ElUpload";
let $ = require("jquery")

let date = new Date()
let today = util.getStampFromDateStr(date)
var date2 = new Date(date)
date2.setDate(date.getDate() - 6)
let end_timees = util.getStampFromDateStr(date2)
let start_date = ''
let end_date = ''
let downloadUrl = ''
let ajax_getting = false
let finished = false

export default {
  name: 'PayrollAccounting',
  components: {
    elUpload
  },
  data() {
    var testStartTime = (rule, value, callback) => {
      var sumDays = ''
      if (!value) {
        return callback(new Error('请选择日期'));
      } else {
        sumDays = util.DateDiff(util.formatData1(value[0]), util.formatData1(value[1]))
        if (sumDays > 30) {
          return callback(new Error('时间跨度不能超过30天'));
        } else {
          callback();
        }
      }
    };
    var testPayType = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择工资类型'));
      } else {
        callback();
      }
    };
    const self = this;
    const validatorFile = function (rule, value, callback) {
      if (value.length == 0) {
        callback(new Error('请上传附件'))
      } else {
        // if (value.length > 0) {
        //   setTimeout(()=> {
        //     self.$refs.elUploadItem.clearValidate();
        //   },500)
        // }
        callback();
      }
    };
    return {
      payrollform: {
        order_name: '',
        order_type: -1,
        type_list: [],
        regionlist: [],
        regionlist2: [],
        select_user_id: '',

        select_c_user_id: '',
        approve_uid: '-1',
        relationPayroll: '',
        relationPayrollList: [],
        remarks: '',
        kqDateDay: [today, today], //初始化时间(按日)--默认选择当前日期
        add_user_flag: true,
        confirm_id: '',
        address: '',
        confirm_id2: '',
        address2: '',
        addressArr: [],
        month: '',
        monthArr: [],
        pay_type: 0,
        paytypeArr: [

        ],
        addr_mont: [],
        addr_mont2: [],
        monthArrList: []
      },
      confirmList: [],
      is_open_supplier: false, //是否开启供应商费用结算
      isPay: true,
      isBonus: false,
      tableHeight: 0,
      memberDay: '',
      memberDayC: '',
      is_split: -1,
      loading: true,
      options4Day: [],
      payrollInfo: {},
      seachMemberListP: '',
      createdialogVisible: false, //显示新建工资单
      endtime: {
        disabledDate(time) {
          return time.getTime() >= Date.now();
        }
      },
      min_id: 0,
      total: 0,
      settin_payroll: false,
      create_wage_order: false,
      task_id: '',
      kqTaskOptions: [],
      tableHeader: [],
      tableHeaderLabel: [],
      tab_index: 0,
      activeName: '按日统计',
      team_id: '',
      ruleForm: {
        kqDateDay: [today, today], //初始化时间(按日)--默认选择当前日期
      },
      rules: { //日期验证规则
        kqDateDay: [
          { validator: testStartTime, trigger: 'change', required: true }
        ],
        order_name: [
          { required: true, message: '请输入工资单名称', trigger: 'blur' },
          { min: 1, max: 15, message: '工资单名称应为1-15个字符', trigger: 'blur' }
        ],
        order_type: [
          { required: true, message: '请选择类型' },
        ],
        pay_type: [
          { validator: testPayType, trigger: 'change', required: true }
        ],
        approve_uid: [
          { required: true, message: '请选择审批人', trigger: 'change' },
          { required: true, message: '请选择审批人', trigger: 'blur' },
        ],
        relationPayroll: [
          { required: true, message: '请关联对应撤回金额的工资单', trigger: 'change' },
          { required: true, message: '请关联对应撤回金额的工资单', trigger: 'blur' },
        ],
        remarks: [
          { required: true, message: '请输入备注', trigger: 'blur' },
        ],
        contractFile: [
          { required: true, validator: validatorFile, trigger: 'change' },
        ],
        confirm_id: [
          { required: true, message: '请选择客户确认邮件' }
          // { required: true, message:'请选择客户确认邮件',trigger: 'blur' },
        ],
        address: [
          { required: true, message: '请选择城市岗位' }
          // { required: true, message:'请选择城市岗位',trigger: 'blur' },
        ],
        confirm_id2: [
          { required: true, message: '请选择客户确认邮件' }
          // { required: true, message:'请选择客户确认邮件',trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请选择城市岗位' }
          // { required: true, message:'请选择城市岗位',trigger: 'blur' },
        ],
        month: [
          { required: true, message: '请选择奖励月份' }
          // { required: true, message:'请选择奖励月份',trigger: 'blur' },
        ]
      },
      project_id: '',
      group_id: 0,
      states: [],
      user_id: 0,
      status_id: 0,
      view_type: -1,
      searchlist: {
        create_uid: '',
        c_user_id: 0,
        view_type: '',
        order_keyword: '',
        page_no: 1,
        page_size: 20,
      },
      viewType: [ //状态列表数据--按日
        {
          label: '全部',
          value: -1
        },
        {
          label: '草稿',
          value: 0
        },
        {
          label: '待审批',
          value: 1
        },
        {
          label: '审批驳回',
          value: 3
        },
        {
          label: '审批通过',
          value: 2
        },
        {
          label: '已支付',
          value: 5
        },
        {
          label: '支付异常',
          value: 6
        }
      ],

      viewTypeShow: {
        label0: '草稿',
        label1: '待审批',
        label2: '审批通过',
        label3: '审批驳回',
        label4: '支付中',
        label5: '已支付',
        label6: '支付异常',
        label7: '部分支付',
      },
      setViewType: '全部',
      splitType: [ //是否暂扣
        {
          label: '不限',
          value: -1
        },
        {
          label: '否',
          value: 0
        },
        {
          label: '是',
          value: 1
        }
      ],
      ifConfirmEmail: false, //是否是支持客户确认
      isOpenBaseWage: false, //是否有商费用客户确认
      role_id: '',
      station_id: '',
      city_id: '',
      currentChangeStationData: [],
      currentChangeSubject: '',
      project_type: '', // 项目类型：1：外包兼职 2：居间全职 3：外包全职 4：居间全职 5：外包兼职 6：居间兼职",
      current_user_role_id: '',
      payTypeName: '',
      pannelData:{
        "wage_report_total": 0, //'工资报备总金额',
        "wage_report_used": 0,  //'工资报备已发放金额',
        "wage_report_balance": 0,  //'工资报备余额',
        "supplier_report_total": 0,  //'供应商报备总金额',
        "supplier_report_used": 0,  //'供应商报备已发放金额',
        "supplier_report_balance": 0  //'供应商报备余额',
      },
      payment_on_off:0,
      show_batch_payment:'0',//是否展示批量支付暂扣工资按钮
      identity:'1'//角色1：超管
    }
  },
  computed: {

  },
  watch: {
    '$route'() {
      this.init();
      //location.reload()
    },
    filterText(val) {
      // console.log(this.$refs)
      this.$refs.all_groups.filter(val);
    }
  },
  methods: {
    init() {
      //获取权限
      this.loading = true;

      window.localStorage.removeItem('ifConfirmEmail')
      $('#PayrollAccounting .kq-wapper').height(window.innerHeight - 60)
      this.tableHeight = window.innerHeight - 255;
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      this.show_batch_payment=util.getLocalStorage('projectStorageInfo').show_batch_payment
      this.identity=util.getLocalStorage('projectStorageInfo').identity
      console.log('aaaaaaaaashow_batch_payment',util.getLocalStorage('projectStorageInfo').identity);

      // this.payrollform.addressArr = util.getLocalStorage('addressArr')
      this.getOverview()
      this.getpermission()
      if (!this.team_id) {
        this.$router.push('overviews');
        this.loading = false;
        return false;
      }

      this.searchlist.team_id = this.team_id;
      this.searchlist.project_id = this.project_id;
      this.searchlist.view_type = this.view_type === '全部' ? '-1' : this.view_type

      this.getPayrollList();
      this.getPannelData();
      util.ajax({
        url: '/application/vision/area',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          show_all: 1
        },
        timeout: 10000,
        success: (result) => {
          // console.log(result)
          if (result && result.errno == 0) {
            let Ar = result.data.result;
            for (let i = 0, lg = Ar.length; i < lg; i++) {
              if (Ar[i].app_id == '13') {
                this.ifConfirmEmail = true;
                util.setLocalStorage('ifConfirmEmail', 'true')
              }
            }
          } else {
            // this.alertinfo(result.errmsg)
          }
        },
        error: (xhr, status) => {
          this.alertinfo('服务器异常')
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络')
        }
      })
    },
    confirmIdChange(val) {
      this.payrollform.regionlist2.forEach((item) => {
        if (val == item.id) {
          this.currentChangeStationData = item.station_list
          this.currentChangeSubject = item.subject
        }
      })
    },
    //获取工资单列表
    getPayrollList() {
      if (this.states.length != 0) {
        if (!this.select_user_id && this.states[0].status == -1 && this.memberDay && !this.select_c_user_id) {
          this.payrollInfo.list = []
          this.searchlist.create_uid = ''
          this.loading = false;
          return
        }
        if (!this.memberDay) {
          this.user_id = ''
        }
        if (this.select_user_id == -1 && this.states[0].status == -1) {
          this.searchlist.create_uid = ''
        }
      }

      if (this.select_user_id && this.select_user_id != -1) {
        this.searchlist.create_uid = this.select_user_id
      }

      if (this.select_c_user_id && this.select_c_user_id != -1) {
        this.searchlist.c_user_id = this.select_c_user_id
      }

      if (!this.memberDay) {
        this.searchlist.create_uid = ''
      }
      if (!this.memberDayC) {
        this.searchlist.c_user_id = ''
      }

      if (!this.memberDayC) {
        this.searchlist.c_user_id = ''
      }
      this.searchlist.is_split = this.is_split
      //console.log(this.view_type)
      util.ajax({
        url: '/wage/cloud/order_list',
        type: 'GET',
        data: this.searchlist,
        success: (res) => {
          // console.log(res)
          if (res && res.errno == 0) {
            let tableHeader = [],
              data = res.data;
            for (let m in data.header) {
              if (m == 'order_name' || m == 'status_no' || m == 'start_date' || m == 'end_date' || m == 'create_user' || m == 'bar_num' || m == 'approve_user') continue;
              tableHeader.push(m);
            }
            this.tableHeader = tableHeader;
            this.tableHeaderLabel = data.header;
            this.payrollInfo = data;
            this.total = +data.total_num || 0;
            this.loading = false;
          } else {
            // this.$message({
            //     showClose: true,
            //     message: res.errmsg,
            //     type: 'warning'
            // });
            this.loading = false;
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
          this.loading = false;

        },
        noNetwork: () => {
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
          this.loading = false;
        }
      })
    },
    getPannelData(){
      let params={
        team_id:this.team_id,
        project_id:this.project_id,
      };
      util.ajax({
        url: '/wage/report/statistic',
        type: 'GET',
        data: params,
        success: (res) => {
          if (res && res.errno == 0) {
            this.pannelData=res.data;
          } else {
            this.$message({
              showClose: true,
              message: res.errmsg,
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
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    goPaydayReport(){
      this.$router.replace("PaydayReport");
    },
    getAddressList() {
      util.ajax({
        url: '/confirm/encourage/list',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: (result) => {
          // console.log(result)
          if (result && result.errno == 0) {
            this.isOpenBaseWage = true
            // this.isOpenBaseWage = false
            this.payrollform.addr_mont = result.data
          } else {
            this.isOpenBaseWage = false
          }

          // console.log(this.isOpenBaseWage)
        },
        error: (xhr, status) => {
          this.alertinfo('服务器异常')
        },
        noNetwork: () => {
          this.alertinfo('网络连接失败，请检查网络')
        }
      })
      this.isOpenCostSettlement()
    },
    getMonthList(value) {
      if (this.payrollform.pay_type == 2) {
        this.payrollform.addr_mont2.forEach((item) => {
          if (value == item.city_name + '-' + item.demand_post_name) {
            this.station_id = item.demand_post_id
            this.city_id = item.city_id
          }
        })
      }

      this.payrollform.addr_mont.forEach((item) => {
        if (value == item.name) {
          this.payrollform.monthArrList = item.date
        }
      })
    },
    isOpenCostSettlement() {
      util.ajax({
        url: '/group/check_supplier_cost',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.payrollform.paytypeArr = []
            // obj.data.is_open_supplier = 0
            this.is_open_supplier = obj.data.is_open_supplier == 1 ? true : false
            this.payrollform.addr_mont2 = obj.data.charge_rule
            this.role_id = obj.data.role_id
            // console.log(this.payrollform.addr_mont2)
            this.payrollform.paytypeArr = []
            this.payrollform.pay_type = 0
            if (this.isOpenBaseWage && obj.data.is_open_supplier == 1) {
              this.payrollform.paytypeArr.push({ id: 0, text: '人员工资' }, { id: 1, text: '补助奖金' }, { id: 2, text: '供应商费用' })
            } else if (!this.isOpenBaseWage && obj.data.is_open_supplier == 1) {
              this.payrollform.paytypeArr.push({ id: 0, text: '人员工资' }, { id: 2, text: '供应商费用' })
            } else {
              this.payrollform.paytypeArr.push({ id: 0, text: '人员工资' }, { id: 1, text: '补助奖金' })
            }
            // console.log(this.payrollform.paytypeArr)
            // console.log(this.payrollform.pay_type)
            // console.log('isOpenBaseWage-------'+this.isOpenBaseWage)
            // console.log('is_open_supplier------'+this.is_open_supplier)
            // console.log(this.payrollform.paytypeArr)

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
    // 获取上传成功的文件信息
    getNewFileListFun(fileListValue) {
      console.log('上传成功的图片----', fileListValue);
      this.payrollform.contractFile = fileListValue;
    },
    //新建工资单弹出
    createPayroll() {
      console.log('----', )
      // this.ifConfirmEmail = false
      this.payrollform = {
        order_name: '',
        order_type: '',
        type_list: [],
        regionlist: [],
        regionlist2: [],
        select_user_id: '',
        approve_uid: '-1',
        relationPayroll: '',
        relationPayrollList: [],
        remarks: '',
        contractFile: [],
        kqDateDay: [today, today], //初始化时间(按日)--默认选择当前日期
        add_user_flag: true,
        confirm_id: '',
        address: '',
        confirm_id2: '',
        address2: '',
        addressArr: [],
        month: '',
        monthArr: [],
        pay_type: 0,
        paytypeArr: [],
        addr_mont: [],
        addr_mont2: [],
        monthArrList: []
      }
      if (this.ifConfirmEmail) {
        this.getAddressList()
        //获取未结算供应商费用客户确认列表----人员工资
        setTimeout(() => {
          util.ajax({
            url: '/confirm/list/status',
            type: 'GET',
            data: {
              team_id: this.team_id,
              project_id: this.project_id,
              status_no: 3,
              filter_no: 1
            },
            timeout: 10000,
            success: (result) => {
              if (result && result.errno == 0) {
                this.payrollform.regionlist = result.data.list
                this.createdialogVisible = true;
              } else {
                this.alertinfo(result.errmsg)
              }
            },
            error: (xhr, status) => {
              this.alertinfo('服务器异常')
            },
            noNetwork: () => {
              this.alertinfo('网络连接失败，请检查网络')
            }
          })
          // 供应商费用客户确认列表
          util.ajax({
            url: '/confirm/list/status_by_supplier_charge',
            type: 'GET',
            data: {
              team_id: this.team_id,
              project_id: this.project_id
            },
            timeout: 10000,
            success: (result) => {
              // console.log(result)
              if (result && result.errno == 0) {
                this.payrollform.regionlist2 = result.data.list
              } else {
                this.alertinfo(result.errmsg)
              }
            },
            error: (xhr, status) => {
              this.alertinfo('服务器异常')
            },
            noNetwork: () => {
              this.alertinfo('网络连接失败，请检查网络')
            }
          })
        }, 500)

      } else {
        // 无客户确认情况下----审批人选项
        util.ajax({
          url: '/wage/approve_user/area',
          type: 'GET',
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
          },
          timeout: 10000,
          success: (result) => {
            console.log(result, '----类型')
            if (result && result.errno == 0) {
              this.pay_flag = result.data.pay_flag;
              this.audit_flag = result.data.audit_flag;
              // if (result.data.pay_flag == 1) {
              //   result.data.list.unshift({ user_id: '0', real_name: '无需审批', identity_str: '无需审批' })
              // } else {
              //   if (result.data.audit_flag == 1) {
              //     result.data.list.unshift({ user_id: '0', real_name: '无需审批', identity_str: '无需审批' })
              //   }
              // }
              this.payrollform.regionlist = result.data.list;
              this.payrollform.relationPayrollList = result.data.order_list;
              this.payrollform.type_list = result.data.type_list;
              //this.payrollform.region = result.data.list[0].user_id
              //console.log(JSON.stringify(result))
              this.createdialogVisible = true;
            } else {
              this.alertinfo(result.errmsg)
            }
          },
          error: (xhr, status) => {
            this.alertinfo('服务器异常')
          },
          noNetwork: () => {
            this.alertinfo('网络连接失败，请检查网络')
          }
        })
      }
    },
    //搜索
    getTableDataRecord() {
      this.loading = true;
      this.searchlist.view_type = this.view_type === '全部' ? '0' : this.view_type
      this.getPayrollList();
    },
    // 显示错误信息
    alertinfo(text, type) {
      this.$message({
        showClose: true,
        message: text,
        type: type || 'warning',
      });
    },
    //确定新建工资单弹层操作
    confirmEmailFunc() {
      let sumDays = util.DateDiff(util.formatData1(this.ruleForm.kqDateDay[0]), util.formatData1(this.ruleForm.kqDateDay[1]))
      let locatData = {};
      for (let i = 0, lg = this.payrollform.regionlist.length; i < lg; i++) {
        if (this.payrollform.regionlist[i].confirm_id === this.payrollform.confirm_id) {
          this.payrollform.confirmemail = this.payrollform.regionlist[i];
          break;
        }
      }
      if (this.payrollform.pay_type == 0) {
        locatData.pay_type = this.payrollform.pay_type;
        locatData.start_date = util.formatData1(this.payrollform.confirmemail.start_date);
        locatData.end_date = util.formatData1(this.payrollform.confirmemail.end_date);
        locatData.order_name = this.payrollform.confirmemail.subject;
        locatData.confirm_id = this.payrollform.confirmemail.confirm_id;
        locatData.team_id = this.team_id;
        locatData.approve_uid = 0;
        locatData.pay_flag = 0;
        locatData.audit_flag = 0;
        locatData.project_id = this.project_id;
      } else if (this.payrollform.pay_type == 1) {
        let date = ''
        this.payrollform.addr_mont.forEach((m) => {
          m.date.forEach((d) => {
            if (d.id == this.payrollform.month) {
              date = d.date
            }
          })
        })
        locatData.pay_type = this.payrollform.pay_type;
        locatData.team_id = this.team_id;
        locatData.project_id = this.project_id;
        locatData.approve_uid = 0;
        locatData.pay_flag = 0;
        locatData.audit_flag = 0;
        locatData.address_name = this.payrollform.address
        locatData.encourage_rule_id = this.payrollform.month
        locatData.date = date
        locatData.newcreat = true
      } else {
        locatData.pay_type = this.payrollform.pay_type;
        locatData.team_id = this.team_id;
        locatData.project_id = this.project_id;
        locatData.approve_uid = 0;
        locatData.pay_flag = 0;
        locatData.audit_flag = 0;
        locatData.order_name = this.currentChangeSubject;
        locatData.address_name = this.payrollform.address2
        locatData.confirm_id = this.payrollform.confirm_id2;
        locatData.newcreat = true
        locatData.encourage_rule_id = this.role_id
        locatData.station_id = this.station_id
        locatData.city_id = this.city_id
      }
      // console.log(locatData)
      if (this.payrollform.pay_type == 2) {
        util.setLocalStorage('locatData', locatData)
        window.localStorage.removeItem('memberDataList')
        this.$router.push('CreateEditPayrollCost')
        // if(this.currentChangeStationData.length == 0){
        //     this.alertinfo('城市岗位与客户确认的城市岗位不匹配，请重新选择！')
        // }else{
        //     this.currentChangeStationData.forEach( (item) => {
        //         if(item.job_city_id == this.city_id && item.job_station_id == this.station_id){
        //             util.setLocalStorage('locatData',locatData)
        //             window.localStorage.removeItem('memberDataList')
        //             this.$router.push('CreateEditPayrollCost')
        //         }else{
        //             this.alertinfo('城市岗位与客户确认的城市岗位不匹配，请重新选择！')
        //         }
        //     })
        // }
      } else {
        util.setLocalStorage('locatData', locatData)
        window.localStorage.removeItem('memberDataList')
        this.$router.push('CreateEditPayroll')
      }

    },
    addPayrollconfirm3(comf3) {
      this.$alert(`当前支付方式：${this.payTypeName}`, '提示', {
        confirmButtonText: '确定',
        callback: action => {
          console.log('action===', action);
          if(action == 'confirm') {
            this.$message({
              type: 'warning',
              message: `当前支付方式: ${ this.payTypeName }`
            });
            this.$refs['payrollform'].validateField(comf3, (valid) => {
              if (valid != '') {
                return false;
              } else {
                //
              }
            })
            this.confirmEmailFunc()
          }
        }
      });
    },
    addPayrollconfirm2(addr2, comf2) {
      this.$refs['payrollform'].validateField(addr2, (valid) => {
        if (valid != '') {
          return false;
        } else {
          // 
        }
      })
      this.$refs['payrollform'].validateField(comf2, (valid) => {
        if (valid != '') {
          return false;
        } else {
          // 
        }
      })
      if (this.payrollform.address2 != '' && this.payrollform.confirm_id2 != '') {
        console.log('刚才成功了all')
        this.confirmEmailFunc()
      }


    },

    //确定新建工资单
    addPayrollconfirm(addr, mont, comf) {
      // console.log(this.ifConfirmEmail)
      if (this.isOpenBaseWage == true) {
        if (this.ifConfirmEmail) {
          if (this.payrollform.pay_type == 0) {
            this.$refs['payrollform'].validateField(comf, (valid) => {
              if (valid != '') {
                return false;
              } else {
                this.confirmEmailFunc()
              }
            })
          } else {
            this.$refs['payrollform'].validateField(addr, (valid) => {
              if (valid != '') {
                return false;
              } else {
                // this.confirmEmailFunc()
              }
            })
            this.$refs['payrollform'].validateField(mont, (valid) => {
              if (valid != '') {
                return false;
              } else {
                // 
              }
            })
          }
          if (this.payrollform.address != '' && this.payrollform.month != '') {
            this.confirmEmailFunc()
          }
        } else {
          this.$refs['payrollform'].validate((valid) => {
            if (valid) {
              let locatData = {};
              locatData.start_date = util.formatData1(this.payrollform.kqDateDay[0]);
              locatData.end_date = util.formatData1(this.payrollform.kqDateDay[1]);
              locatData.order_name = this.payrollform.order_name;
              locatData.approve_uid = this.payrollform.approve_uid;
              locatData.add_user_flag = this.payrollform.add_user_flag;
              locatData.team_id = this.team_id;
              locatData.pay_flag = this.pay_flag;
              locatData.audit_flag = this.audit_flag;
              locatData.project_id = this.project_id;
              util.setLocalStorage('locatData', locatData)
              window.localStorage.removeItem('memberDataList')
              this.$router.push('CreateEditPayroll?order_id=0')
            } else {
              return false;
            }
          })
        }
      } else {
        // 新建工资单应该走这里逻辑
        console.log('新建工资单应该走这里逻辑=====')
        this.$refs['payrollform'].validate((valid) => {
          console.log('valid===',valid, this.payrollform)
          if (valid) {
            if (this.ifConfirmEmail) {
              let locatData = {};
              if (this.project_type == 3) {
                for (let i = 0, lg = this.confirmList.length; i < lg; i++) {
                  if (this.confirmList[i].confirm_id === this.payrollform.confirm_id) {
                    this.payrollform.confirmemail = this.confirmList[i];
                    break;
                  }
                }
                locatData.order_name = this.payrollform.confirmemail.subject;
                locatData.confirm_id = this.payrollform.confirmemail.confirm_id;
                locatData.team_id = this.team_id;
                locatData.approve_uid = 0;
                locatData.pay_flag = 0;
                locatData.audit_flag = 0;
                locatData.project_id = this.project_id;
                locatData.project_type = this.project_type
                locatData.current_user_role_id = this.current_user_role_id
                util.setLocalStorage('locatData', locatData)
                window.localStorage.removeItem('memberDataList')
                this.$router.push('fullTimeCreateEditPayroll?order_id=0')
              } else {
                for (let i = 0, lg = this.payrollform.regionlist.length; i < lg; i++) {
                  if (this.payrollform.regionlist[i].confirm_id === this.payrollform.confirm_id) {
                    this.payrollform.confirmemail = this.payrollform.regionlist[i];
                    break;
                  }
                }
                locatData.start_date = util.formatData1(this.payrollform.confirmemail.start_date);
                locatData.end_date = util.formatData1(this.payrollform.confirmemail.end_date);
                locatData.order_name = this.payrollform.confirmemail.subject;
                locatData.confirm_id = this.payrollform.confirmemail.confirm_id;
                locatData.team_id = this.team_id;
                locatData.approve_uid = 0;
                locatData.pay_flag = 0;
                locatData.audit_flag = 0;
                locatData.project_id = this.project_id;
                locatData.project_type = this.project_type
                util.setLocalStorage('locatData', locatData)
                window.localStorage.removeItem('memberDataList')
                console.log(locatData)
                this.$router.push('CreateEditPayroll')
              }
            } else {
              console.log('然后再走这里')
              let locatData = {};
              //locatData.start_date = (new Date(this.payrollform.kqDateDay[0])).getTime()/1000,
              //locatData.end_date = (new Date(this.payrollform.kqDateDay[1])).getTime()/1000,
              locatData.start_date = util.formatData1(this.payrollform.kqDateDay[0]);
              locatData.end_date = util.formatData1(this.payrollform.kqDateDay[1]);
              locatData.order_name = this.payrollform.order_name;
              locatData.approve_uid = this.payrollform.approve_uid;
              // 保存关联工资单-备注-附件等结果值
              locatData.relationPayroll = this.payrollform.relationPayroll;       //关联结算单的id
              locatData.relationPayrollList = this.payrollform.relationPayrollList;
              locatData.remarks = this.payrollform.remarks;
              locatData.contractFile = this.payrollform.contractFile;
              locatData.order_name = this.payrollform.order_name;
              locatData.order_type = this.payrollform.order_type;

              locatData.add_user_flag = this.payrollform.add_user_flag;
              locatData.team_id = this.team_id;
              locatData.pay_flag = this.pay_flag;
              locatData.audit_flag = this.audit_flag;
              locatData.project_id = this.project_id;
              locatData.project_type = this.project_type
              util.setLocalStorage('locatData', locatData)
              window.localStorage.removeItem('memberDataList')
              this.$router.push('CreateEditPayroll?order_id=0')
              //location.href = 'CreateEditPayroll'
            }
          } else {
            // console.log('error submit!!');
            return false;
          }
        });
      }
    },
    //取消新建
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.createdialogVisible = false
    },
    selectMember(item) {
      if (item.user_id) {
        this.states.forEach((o) => {
          if (o.user_id == item.user_id) {
            this.user_id = o.user_id
          }
        })
        this.states = []
        this.seachMemberListP = ''
      }
    },
    classNameAttribute(row, index) {
      if (this.tab_index == 0 || this.tab_index == 2) {
        return row.status.normal == 1 ? '' : 'unn'
      }
    },
    //切换状态时选择的状态id
    selectStateId(value) {
      this.status_id = value
    },
    selectTaskId(value) { },
    handleSizeChange() {
      this.loading = true;
      this.getPayrollList()
    },
    formatterdate(row) {
      return row.start_date + ' ~ ' + row.end_date
    },
    //前往设置工资单
    setPayroll() {
      this.$router.push('setpayroll')
    },
    //前往工资单详情
    goToPayDetail(row) {
      // console.log(row)
      // let PaylistDetail = 'PaylistDetail?order_id=' + row.order_id + '&type='+row.type;
      util.setLocalStorage('savePayDetail', row);
      let PaylistDetail = 'PaylistDetail?order_id=' + row.order_id + '&ifConfirmEmail=' + this.ifConfirmEmail;
      this.$router.push(PaylistDetail)
    },
    //
    formatter(row, column) {
      return row[column.property] / 100
    },
    //人员搜索
    querySearch(queryString, cb) {
      //console.log(queryString);
      if (queryString) {
        this.states = []
        util.ajax({
          url: '/group/member_search',
          type: 'GET',
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            group_id: '',
            keyword: queryString,
            page_no: '',
            page_size: ''
          },
          timeout: 10000,
          success: (obj) => {
            // console.log(obj)
            if (obj && obj.errno == 0) {
              let strArr = []
              obj.data.list.forEach((o) => {
                let str = ''
                str = {
                  "value": o.user_name,
                  "group_name": o.group_name,
                  "group_id": o.group_id,
                  "user_id": o.user_id
                }
                strArr.push(str)
              })
              this.restaurants = strArr
              var results = queryString ? this.restaurants.filter(this.createFilter(queryString)) : this.restaurants;
              if (results.length == 0) {
                results.push({ 'value': '无搜索结果', 'status': '-1' })
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
    handleSelect(item) {
      // console.log(item)
      if (item.status == -1) {
        this.memberDay = ''
        this.select_user_id = -1

      } else {
        this.select_user_id = item.user_id
      }

    },

    handleSelectC(item) {
      // console.log(item)
      if (item.status == -1) {
        this.memberDayC = ''
        this.select_c_user_id = -1

      } else {
        this.select_c_user_id = item.user_id
      }

    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase() || restaurant.value.indexOf(queryString) > -1);
      };
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
            // console.log(JSON.stringify(obj.data))
            this.settin_payroll = false
            obj.data.forEach((o) => {
              if (o.id_name == 'pc_wage_componet') {
                this.settin_payroll = true
              }
              if (o.id_name == 'create_wage_order') {
                this.create_wage_order = true;
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
            this.project_type = obj.data.list.project_type
            this.current_user_role_id = obj.data.list.current_user_role_id
            this.payTypeName = obj.data.list.payment_type_name;
            this.payment_on_off=obj.data.list.payment_on_off;
            if (this.project_type == 3) {
              this.getConfirmList()
            }
          }
        },
        error: (xhr, status) => {

        },
        noNetwork: () => {

        }
      })
    },
    // 3408 外包全职下的客户确认列表
    getConfirmList() {
      util.ajax({
        url: '/ss/confirm/list',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          status: 1,
          page: 1,
          page_size: 999,
          filter_no: 1
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.confirmList = obj.data.list
          }
        },
        error: (xhr, status) => {

        },
        noNetwork: () => {

        }
      })
    },
    //批量支付暂扣工资
    payWithholding(){
      this.$confirm('是否支付项目下所有暂扣人员工资?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.confirmPayWithholding();
      }).catch((err) => {
        // this.$message({
        //   type: 'info',
        //   message: err
        // });          
      });
    },
    confirmPayWithholding(){
      util.ajax({
        url: '/wage/payment/unfinished_order',
        type: 'POST',
        data: {
          team_id:this.team_id,
          project_id:this.project_id,
        },
        success: (res) => {
          if(res.errno=='0'){
            this.$message({
              showClose: true,
              message: '操作成功，支付中，稍后请点击下载批量支付结果前往下载页面',
              type: 'success'
            });
            this.getPayrollList();
          }else{
            this.$message({
              showClose: true,
              message: res.errmsg,
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
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    //支付结果下载
    payResultDown(){
      let PayResultDown = 'PayResultDown';
      this.$router.push(PayResultDown)
    }
  },
  //获取权限
  created() {
    this.init()
  },
  mounted() {
    /*table分页--下拉加载*/
    let that = this

  }
}

</script>
<style src='../assets/css/PayrollAccounting.css'></style>
<style src='../assets/css/base.css'></style>
