<template>
  <div id="Newcreatmail">
    <div class="c-top">
      <breadcrumb>
        <router-link to="fullTimeConfirm" replace>客户确认</router-link>
        <router-link to="">新建确认邮件</router-link>
      </breadcrumb>
    </div>
    <div class="newCreatCount">
      <div class="steps">
        <el-steps :active="stepActive" align-center>
          <el-step title="填写内容"></el-step>
          <el-step title="核对数据"></el-step>
          <el-step title="发送预览"></el-step>
        </el-steps>
      </div>
      <!-- 第一步：填写内容 :disabled="kywayradio == 1"-->
      <div class="step1_form" v-show="step1_form">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="180px" label-position="left">
          <el-form-item label="确认方式" v-if="confirm_method == 1" class="confirm_method">
            <el-radio-group v-model="kywayradio">
              <el-radio :label="0">发送邮件</el-radio>
              <el-radio :label="1">上传线下确认邮件截图</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="确认人" prop="confirmPerson">
            <el-select v-model="ruleForm.confirmPerson" filterable placeholder="请选择" style="width:67.7%;" no-data-text="未关联客户邮箱，请联系销售进行关联" :disabled="kywayradio == 1">
              <el-option v-for="item in confirmPersonOptions" :key="item.confirm_user_name" :label="item.confirm_user_name+'('+item.confirm_user_email+')'" :value="item.confirm_user_email">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="抄送人" class="mysend-item">
            <div class="senddiv" :class="{'error_border':sendMailReg}">
              <div class="mytags">
                <div class="success_mail">
                  <template v-for="(item,index) in successMailList">
                    <div class="emailTxt" @dblclick="onClickSuccessEmail(index,'success')">{{item}}</div>
                  </template>
                </div>
                <div class="error_mail">
                  <template v-for="(item,index) in errorMailList">
                    <div class="emailTxt_error" @dblclick="onClickErrorEmail(index,'error')">{{item}}</div>
                  </template>
                </div>
              </div>
              <div class="addr_text" style="width:100%;">
                <input type="text" class="emailinput" style="width:100%;" v-model="ruleForm.sendPersonEmail" v-if="successMailList.length != 0 || errorMailList.length != 0">
                <input type="text" class="emailinput " style="width:100%;" v-model="ruleForm.sendPersonEmail" v-else placeholder="请输入">
              </div>
            </div>
            <span class="error_border_txt" v-if="sendMailReg">{{sendMailRegTxt}}</span>
          </el-form-item>
          <el-form-item label="考勤月份" prop="kq_month">
            <el-select v-model="ruleForm.kq_month" filterable placeholder="请选择" style="width:67.7%;" @change="confirmTypeChangeFn">
              <el-option v-for="item in kqMonthOption" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="是否计算社保" prop="is_calculate_ss">
              <el-radio v-model="ruleForm.is_calculate_ss" label="1">是</el-radio>
              <el-radio v-model="ruleForm.is_calculate_ss" label="0">否</el-radio>
          </el-form-item> -->
          <el-form-item label="是否计算社保成本" prop="is_calculate_social_security_cost">
            <el-radio-group v-model="ruleForm.is_calculate_social_security_cost" @change="clearExcel">
              <el-radio  :label="1">是</el-radio>
              <el-radio  :label="0">否</el-radio>
            </el-radio-group>
              
          </el-form-item>
          <el-form-item label="邮件主题" prop="mailTheme">
            <el-input v-model="ruleForm.mailTheme" style="width:67.7%;" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="邮件正文" v-show="kywayradio == 0">
            <div class="editor_div">
              <div id="editor" :class="{'error_border':sendMailTxt}">
              </div>
              <input type="text" placeholder="请输入" class="placeholder_tip">
            </div>
            <span class="error_border_txt" v-if="sendMailTxt" style="margin-top:5px;">请输入邮件正文</span>
          </el-form-item>
          <!-- 上传客户确认邮件截图 -->
          <el-form-item label="邮件正文" class="upload-img" v-show="kywayradio == 1">
            <p>请上传确认邮件正文截图，邮件截图中需要包含确认人、总金额及结算人数等关键信息</p>
            <div class="upload-imgmain">
              <el-upload :action="uploadimgurl" list-type="picture-card" :with-credentials="true" :data="{'team_id':team_id,'project_id':project_id}" :on-remove="handleRemove" :accept="'image/*'" :file-list="file_list" :class="'uploadimg_cent'" :on-change="uploadimgchange">
                <i class="el-icon-plus"></i>
              </el-upload>
            </div>
            <span class="error_border_txt" v-if="screenshots" style="margin-top:5px;bottom:-30px">请上传线下确认邮件截图</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="margin-top: 10px;" @click="next('ruleForm')">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 第二步：核对数据 -->
      <div class="step2_form" v-show="step2_form">
        <!--上传文件-->
        <div class="upload" v-show="upload_page">
          <el-upload class="upload-demo" drag v-loading="uploadLoading" :with-credentials='true' :http-request="onUpload" :action="actionUploadUrl" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>&nbsp;点击上传</em>
              <div class="el-upload__tip" slot="tip">可上传项目组制定的确认Excel模板，也可以
                <a href="javascript:;" @click.stop="uploadTemplate">下载标准模板</a>
              </div>
            </div>
          </el-upload>
          <el-button style="margin-top: 30px;" type="primary" @click="prev">上一步</el-button>
        </div>
        <!--上传文件之后列表展示-->
        <div class="myUploadDataList" v-if="uploadDataList_page">
          <div class="errorDataList" :class="{'successDataList':isSuccess}">
            <div class="myTop">
              <h2 v-if="isError">本次导入<span> {{errorObj.sum}} </span>条&nbsp;&nbsp;文件中包含 <span>{{errorObj.err_sum}}</span> 条错误信息
                <el-button class="exportErr" type="primary" size="small" @click="ExportErrData">报错导出</el-button>
                <form action="" id="upfile" enctype="multipart/form-data">
                  <a href="javascript:;" class="file">重新上传
                    <input type="file" name="" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" @change="onChangeUpfile('error')" id="upfile1">
                  </a>
                </form>
              </h2>
              <div class="successtop" v-if="isSuccess">
                <h3>上传成功</h3>
                <form action="" id="upfile2" enctype="multipart/form-data">
                  <a href="javascript:;" class="file">重新上传
                    <input type="file" name="" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" @change="onChangeUpfile('success')" id="upfile22">
                  </a>
                </form>
              </div>
              
              <!-- 分页组件 -->
              <div class="page" v-if="numtotal != 0">
                <div class="block">
                  <el-pagination @current-change="handleCurrentPageChange" :current-page.sync="currentPage" :page-size="page_size" layout="total, prev, pager, next" :total="numtotal">
                  </el-pagination>
                </div>
              </div>
            </div>
            <!--错误形式的列表展示-->
            <div class="errorTable" v-if="isError">
              <el-table tooltip-effect="dark" style="width: 100%" :height="winHeight" :data="errorObj.error_list" v-loading="againUploadLoading" border>
                <el-table-column label="姓名" width="78" prop="real_name" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="人员来源" prop="real_name" min-width="120" v-if="is_nx_project" show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{scope.row.worker_source}}
                  </template>
                </el-table-column>
                <el-table-column label="手机号" width="115" prop="mobile" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="身份证号" width="130" prop="id_no" show-overflow-tooltip>
                </el-table-column>
                <el-table-column width="80" label="城市" prop="city_name" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="实际出勤" width="100" prop="actual_work_days">
                </el-table-column>
                <el-table-column label="应出勤天数" width="100" prop="total_work_days">
                </el-table-column>
                <el-table-column label="加班天数" width="100" prop="overtime_days">
                </el-table-column>
                <el-table-column label="工资" width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.base_wage || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="加班费" width="80">
                  <template slot-scope="scope">
                    <span>{{scope.row.overtime_wage || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="绩效" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.merit_wage || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="奖金" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.bonus || 0}}</span>
                  </template>
                </el-table-column>
                 <el-table-column label="福利" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.welfare || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="补贴" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.subsidy_wage || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="扣费" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.deduction || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="薪酬其他" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.other_wage || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="上月已付社保" width="180">
                  <template slot-scope="scope">
                    <span>{{scope.row.personal_last_month_ss_prepay || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="应纳税工资" width="180">
                  <template slot-scope="scope">
                    <span>{{scope.row.remain_payable || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="五险一金（公司）" width="180">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_last_month_ss_real || 0}}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column label="企业社保实际">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_last_month_ss_real/100 || 0}}</span>
                  </template>
                </el-table-column> -->
                <el-table-column label="企业社保预付" width="180">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_this_month_ss_prepay || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="企业社保补退" width="180">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_ss_bt || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="personal_last_month_ss_real" label="五险一金（个人）" width="180">
                  <template slot-scope="scope">
                    <span>{{scope.row.personal_last_month_ss_real || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="other_fee_adjustments" label="其他费用调整" width="180">
                  <template slot-scope="scope">
                    <span>{{scope.row.other_fee_adjustments || 0}}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="enterprise_last_month_ss_prepay" label="企业社保预付">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_last_month_ss_prepay/100 || 0}}</span>
                  </template>
                </el-table-column> -->
                <!-- <el-table-column label="企业费用调整">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_fee_adjust/100 || 0}}</span>
                  </template>
                </el-table-column> -->
                <el-table-column label="服务费" width="100" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span>{{scope.row.service_fee || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="税费" width="100" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span>{{scope.row.taxation_fee || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="总费用" width="100" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span>{{scope.row.total_amount || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column width="180" label="错误原因">
                  <template slot-scope="scope">
                    <p v-for="item in scope.row.error">
                      {{item.err_txt}}
                    </p>
                  </template>
                </el-table-column>
              </el-table>
              <el-button style="margin-top: 30px;" type="primary" @click="prev">上一步</el-button>
            </div>
            <!--正确形式的列表展示-->
            <div class="successTable" v-if="isSuccess">
              <el-table tooltip-effect="dark" style="width: 100%" :height="winHeight" :data="successObj.success_list" show-summary :summary-method="getSummaries" v-loading="againUploadLoading" border>
                <el-table-column label="姓名" width="78" prop="real_name" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="人员来源" prop="real_name" min-width="120" v-if="is_nx_project" show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{scope.row.worker_source}}
                  </template>
                </el-table-column>
                <el-table-column label="手机号" width="115" prop="mobile" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="身份证号" width="130" prop="id_no" show-overflow-tooltip>
                </el-table-column>
                <el-table-column width="100" label="城市" prop="city_name" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="实际出勤" width="100" prop="actual_work_days">
                </el-table-column>
                <el-table-column label="应出勤天数" width="100" prop="total_work_days">
                </el-table-column>
                <el-table-column label="加班天数" width="100" prop="overtime_days">
                </el-table-column>
                <el-table-column label="工资" prop="base_wage" width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.base_wage/100 || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="加班费" prop="overtime_wage" width="80">
                  <template slot-scope="scope">
                    <span>{{scope.row.overtime_wage/100 || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="绩效" prop="merit_wage" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.merit_wage/100 || 0}}</span>
                  </template>
                </el-table-column>
                 <el-table-column label="奖金" prop="bonus" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.bonus/100 || 0}}</span>
                  </template>
                </el-table-column>
                 <el-table-column label="福利" prop="welfare" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.welfare/100 || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="补贴" prop="subsidy_wage" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.subsidy_wage/100 || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="扣费" prop="deduction" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.deduction/100 || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="薪酬其他" prop="other_wage" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.other_wage/100 || 0}}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column label="上月已付社保" width="180" prop="personal_last_month_ss_prepay">
                  <template slot-scope="scope">
                    <span>{{scope.row.personal_last_month_ss_prepay/100 || 0}}</span>
                  </template>
                </el-table-column> -->
                <el-table-column label="应纳税工资" width="180" prop="remain_payable">
                  <template slot-scope="scope">
                    <span>{{scope.row.remain_payable/100 || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="五险一金（公司）" width="180" prop="enterprise_last_month_ss_real">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_last_month_ss_real/100 || 0}}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="enterprise_last_month_ss_real" label="企业社保实际">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_last_month_ss_real/100 || 0}}</span>
                  </template>
                </el-table-column> -->
                <el-table-column prop="enterprise_this_month_ss_prepay" width="180" label="企业社保预付">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_this_month_ss_prepay/100 || 0}}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="enterprise_ss_bt" label="企业社保补退" width="180">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_ss_bt/100 || 0}}</span>
                  </template>
                </el-table-column> -->
                <el-table-column label="五险一金（个人）" width="180" prop="personal_last_month_ss_real">
                  <template slot-scope="scope">
                    <span>{{scope.row.personal_last_month_ss_real/100 || 0}}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="enterprise_fee_adjust" label="企业费用调整">
                  <template slot-scope="scope">
                    <span>{{scope.row.enterprise_fee_adjust/100 || 0}}</span>
                  </template>
                </el-table-column> -->
                <el-table-column label="其他费用调整" width="180" prop="other_fee_adjustments" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span>{{scope.row.other_fee_adjustments/100 || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="服务费" width="100" prop="service_fee" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span>{{scope.row.service_fee/100 || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="税费" prop="taxation_fee" width="100" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span>{{scope.row.taxation_fee/100 || 0}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="总费用" prop="total_amount" width="100" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span>{{scope.row.total_amount/100 || 0}}</span>
                  </template>
                </el-table-column>
              </el-table>
              <el-button style="margin-top: 30px;" @click="prev">上一步</el-button>
              <el-button type="primary" style="margin-top: 30px;" @click="next_success">下一步</el-button>
            </div>
          </div>
        </div>
      </div>
      <!--第三步：发送预览-->
      <div class="step3_form" v-show="step3_form">
        <div class="sendPreview">
          <h1>{{step1Obj.theme}}</h1>
          <h2>确认人：<span>{{step1Obj.email}}</span></h2>
          <h2 style="margin-top:8px;" v-if="step1Obj.send_mail && step1Obj.send_mail.length != 0">抄送：&nbsp;&nbsp;
            <span v-for="(item,index) in step1Obj.send_mail">{{item}} <i v-if="index != step1Obj.send_mail.length - 1">;</i></span>
          </h2>
          <div class="send_content">
            <div class="s_text" v-html="step1Obj.text"></div>
          </div>
          <div class="download">
            <h4><i></i>附件</h4>
            <h5><i></i>{{attach_name}}</h5>
            <a class="down" :href="sendData.confirm_file_url">下载</a>
          </div>
          <div class="download" v-if="sendData.prepay_file_url">
            <h4><i></i>附件</h4>
            <h5><i></i>{{attach_name}}（预缴）</h5>
            <a class="down" :href="sendData.prepay_file_url">下载</a>
          </div>
          <div class="download" v-if="sendData.real_file_url">
            <h4><i></i>附件</h4>
            <h5><i></i>{{attach_name}}（实缴）</h5>
            <a class="down" :href="sendData.real_file_url">下载</a>
          </div>
          <div class="down-tip">
            <p v-if="kywayradio == 0">发送时会将附件中对内展示的字段进行删除</p>
          </div>
        </div>
        <el-button style="margin-top: 40px;" @click="sendPrev">上一步</el-button>
        <el-button type="primary" style="margin-top: 40px;" @click="sendMail" v-if="kywayradio == 0">没问题，立即发送</el-button>
        <el-button type="primary" style="margin-top: 40px;" @click="sendMail" v-else>提交给运营审核</el-button>
      </div>
    </div>
    <!-- 弹窗————邀请 -->
    <div class="el-loading-mask custom-mask" v-show="loading">
      <div class="el-loading-spinner">
        <svg viewBox="25 25 50 50" class="circular">
          <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
        </svg>
        <p class="el-loading-text">正在删除对内展示字段</p>
      </div>
    </div>
    <!--上传列表中有离职人员的弹层提示-->
    <div class="dialog-invit dialog-quit">
      <el-dialog title="检测到离职人员" :visible.sync="dialogQuit" size="tiny">
        <div class="dialogQuitform">
          <p>离职人员共<span>{{lizhiarr.length}}</span>人，是否继续下一步或重新导入</p>
          <div style="max-height: 218px; overflow-y: auto;">
            <template>
              <el-table :data="lizhiarr" style="width: 100%">
                <el-table-column prop="number" label="序号" width="80">
                </el-table-column>
                <el-table-column prop="name" label="姓名" width="80">
                </el-table-column>
                <el-table-column prop="mobile" label="手机号">
                </el-table-column>
              </el-table>
            </template>
          </div>
        </div>
        <div slot="footer">
          <el-button @click="dialogQuit = false">重新导入</el-button>
          <el-button type="primary" @click="next_success('continue')">继 续</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
import breadcrumb from '@/components/common/breadcrumb'
import QRCode from 'qrcode'
var E = require('wangeditor')
let reg = /^([a-zA-Z0-9]+[_|\_\w-_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_\w-_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
let editor = null
let sumDays = ''


export default {
  name: 'Newcreatmail',
  components: {
    breadcrumb
  },
  data() {
    var confirmPersonReg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择确认人邮箱'));
      } else {
        callback();
      }
    };
    var confirmTypeReg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择考勤模板'));
      } else {
        callback();
      }
    };
    var weektimeReg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择考勤月份'));
      } else {
        callback();
      }
    };
    var mailThemeReg = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入邮件主题'));
      } else {
        callback();
      }
    };
    return {
      tableQuitData: [],
      team_id: '',
      project_id: '',
      winHeight: '',
      dialogQuit: false,
      uploadLoading: false,
      againUploadLoading: false,
      loading: false,
      isRightEmail: false, //是否是正确邮箱
      stepActive: 1, // 第一步默认贞
      step1_form: true, // 第一步：填写内容
      step2_form: false, //第二步：核对数据
      step3_form: false, // 第三步：发送预览
      sendMailReg: false, //验证抄送人邮箱是否为空或者是否正确
      sendMailRegTxt: '', //校验邮箱文案
      sendMailTxt: false, //验证邮件正文
      upload_page: true, // 第二步：上传---默认true
      uploadDataList_page: false, //第二步：上传之后列表展示
      testLength: 1,
      // confirmPersonOptions:[{'confirm_user_name':'王斌','confirm_user_email':'wangbin2@doumi.com'}],  // 第一步：填写内容中确认人的列表数据
      confirmPersonOptions: [], // 第一步：填写内容中确认人的列表数据
      ruleForm: { // 第一步：form表单数据
        confirmPerson: '',
        confirmType: '',
        sendPersonEmail: '',
        kq_month: '',
        mailTheme: '',
        mailText: '',
        emailTxt: '',
        is_calculate_social_security_cost:1
        // is_calculate_ss:'0'
      },
      // kqMonthOption:[
      //   {value:'2019-04',label:'2019-04'},
      //   {value:'2019-05',label:'2019-05'},
      //   {value:'2019-06',label:'2019-06'},
      //   {value:'2019-07',label:'2019-07'},
      //   {value:'2019-08',label:'2019-08'},
      //   {value:'2019-09',label:'2019-09'},
      //   {value:'2019-10',label:'2019-10'},
      //   {value:'2019-11',label:'2019-11'}
      // ],
      kqMonthOption: '',
      //第一步：form表单相关校验
      rules: {
        confirmPerson: [
          { validator: confirmPersonReg, trigger: 'change' }
        ],
        confirmType: [
          { validator: confirmTypeReg, trigger: 'change' }
        ],
        kq_month: [
          { validator: weektimeReg, trigger: 'change' }
        ],
        mailTheme: [
          { validator: mailThemeReg, trigger: 'change' }
        ]
      },
      successMailList: [], // 第一步：输入正确抄送人数据列表
      errorMailList: [], //第一步：输入错误抄送人数据列表
      toolTipText: '',
      myUploadData: { //第二步：上传数据传送服务端的data
        team_id: '',
        project_id: '',
        wage_excel: ''
      },
      actionUploadUrl: '', //第二步：上传action的URL地址
      //第二步：上传之后列表--错误展示
      dialogInvit: false,
      isError: false,
      isSuccess: true,
      link: '',
      errorObj: {
        sum: '',
        err_sum: '',
        error_list: []
      },
      //第二步：上传之后列表--正确展示
      successObj: {
        success_list: []
      },
      lizhiarr: [],
      postConfirmSecondData: {},
      //第三步：发送预览
      file_name: '',
      step1Obj: {},
      step2Obj: {},
      confirm_id: '',
      dialogImageUrl: '',
      dialogVisible: false,
      uploadimgurl: util.host + '/sea/api/1.0/client/v1/common/upload?dmclient=pcweb&X-Doumi-Agent=weixinqy',
      uploadImgList: [],
      upImgFileList: [], //上传图列表
      screenshots: false,
      confirm_method: 0,
      file_list: [],
      confirmPersonEmail: '', //修改确认人邮件
      // usingemail:'wangbin2@doumi.com',
      usingemail: 'wbquanzhi@doumi.com',
      currentPage: 1,
      numtotal: 0,
      page_size: 1000,
      sendData: '',
      attach_name: '',
      confirm_method: 0, //确认方式
      kywayradio: 0, //确认方式
      is_nx_project: false
    }
  },
  watch:{
  },
  methods: {
    ExportErrData(){
        let confirm_type = 3
        let exportUrl = util.host+'/sea/api/1.0/client/v1/confirmmail/wage_excel/exporterrdata?dmclient=pcweb&X-Doumi-Agent=weixinqy&team_id='+this.team_id+'&project_id='+this.project_id+'&confirm_type='+confirm_type
        console.log('exportUrl',exportUrl)
        location.href = exportUrl
      },
    handleRemove(file, fileList) {
      this.upImgFileList = fileList;
      if (fileList.length >= 3) {
        $('.el-upload--picture-card').css('display', 'none')
      } else {
        $('.el-upload--picture-card').css('display', 'inline-block')
      }
    },
    uploadimgchange(file, fileList) {
      this.upImgFileList = fileList;
      if (fileList.length > 0) this.screenshots = false;
      if (fileList.length >= 3) {
        $('.el-upload--picture-card').css('display', 'none')
      };
    },
    init() {
      this.winHeight = window.innerHeight - 350;
      this.team_id = util.getLocalStorage('projectStorageInfo').team_id
      this.project_id = util.getLocalStorage('projectStorageInfo').project_id
      this.actionUploadUrl = util.host + '/sea/api/1.0/client/v1/ss/confirm/upload?dmclient=pcweb&X-Doumi-Agent=weixinqy'
      //从crm获取确认人列表数据
      this.getConfirmerData()
      this.confirm_id = document.URL.split('=')[1];
      this.getPreMonth();
    },
    clearExcel(){
      this.step2_form= false;
      this.upload_page= true; // 第二步：上传---默认true
      this.uploadDataList_page= false; //第二步：上传之后列表展示
      this.myUploadData= { //第二步：上传数据传送服务端的data
        team_id: '',
        project_id: '',
        wage_excel: ''
      };
      //第二步：上传之后列表--错误展示
      this.dialogInvit= false;
      this.isError= false;
      this.isSuccess= true;
      this.errorObj= {
        sum: '',
        err_sum: '',
        error_list: []
      }
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      //console.log(JSON.stringify(param))
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计';
          return;
        }
        // 工资 base_wage  加班费 overtime_wage  绩效 merit_wage 补贴 subsidy_wage 薪酬其他 other_wage 上月已付社保 personal_last_month_ss_prepay  剩余应付薪酬 remain_payable 企业社保实际 enterprise_last_month_ss_real 企业社保预付 enterprise_this_month_ss_prepay 企业社保补退 enterprise_ss_bt 企业费用调整 enterprise_fee_adjust 服务费 service_fee 税费 taxation_fee 总费用 total_amount
        // ///////////
        console.log(column.property)
        switch (column.property) {
          case 'base_wage':
            sums[index] = this.successObj['list_total']['base_wage_total'];
            break;
          case 'overtime_wage':
            sums[index] = this.successObj['list_total']['overtime_wage_total'];
            break;
          case 'merit_wage':
            sums[index] = this.successObj['list_total']['merit_wage_total'];
            break;
          case 'subsidy_wage':
            sums[index] = this.successObj['list_total']['subsidy_wage_total'];
            break;
          case 'other_wage':
            sums[index] = this.successObj['list_total']['other_wage_total']
            break;
          case 'personal_last_month_ss_prepay':
            sums[index] = this.successObj['list_total']['personal_last_month_ss_prepay_total']
            break;
          case 'remain_payable':
            sums[index] = this.successObj['list_total']['remain_payable_total']
            break;
          case 'enterprise_last_month_ss_real':
            sums[index] = this.successObj['list_total']['enterprise_last_month_ss_real_total']
            break;
          case 'enterprise_this_month_ss_prepay':
            sums[index] = this.successObj['list_total']['enterprise_this_month_ss_prepay_total']
            break;
          case 'enterprise_ss_bt':
            sums[index] = this.successObj['list_total']['enterprise_ss_bt_total']
            break;
          case 'enterprise_fee_adjust':
            sums[index] = this.successObj['list_total']['enterprise_fee_adjust_total']
            break;
          case 'service_fee':
            sums[index] = this.successObj['list_total']['service_fee_total']
            break;
          case 'taxation_fee':
            sums[index] = this.successObj['list_total']['taxation_fee_total']
            break;
          case 'total_amount':
            sums[index] = this.successObj['list_total']['total_amount_total']
            break;
        }
      })
      console.log(JSON.stringify(sums))
      return sums
    },



    getPreMonth(date, monthNum) {
      let time = new Date();
      let currMonth = util.getLocalTime(time, 'yyyy-MM')
      let prevMonth1 = this.getPreMonthByDate(currMonth,1)
      let prevMonth2 = this.getPreMonthByDate(currMonth,2)
      this.kqMonthOption = [{ value: currMonth, label: currMonth }, { value: prevMonth1, label: prevMonth1 }, { value: prevMonth2, label: prevMonth2 }]
    },
    getPreMonthByDate(date, monthNum) {
      let dateArr = date.split('-');
      let year = dateArr[0]; //获取当前日期的年份
      let month = dateArr[1]; //获取当前日期的月份
      let year2 = year;
      let month2 = parseInt(month) - monthNum;
      if (month2 <= 0) {
        let absM = Math.abs(month2);
        year2 = parseInt(year2) - Math.ceil(absM / 12 == 0 ? 1 : parseInt(absM) / 12);
        month2 = 12 - (absM % 12);
      }
      if (month2 < 10) {
        month2 = '0' + month2;
      }
      let t2 = year2 + '-' + month2;
      return t2;
    },


    /**
     *
     * 第三步：发送预览
     *
     ***/
    //没问题，立即发送--按钮操作
    sendMail() {
      this.loading = true
      let _data = {
        team_id: this.team_id,
        project_id: this.project_id,
        month: this.step1Obj.kq_month.replace('-', ''),
        confirm_user_name: this.step1Obj.name,
        confirm_user_email: this.step1Obj.email2,
        copy_user_email: this.step1Obj.send_mail,
        subject: this.step1Obj.theme,
        content: this.step1Obj.text,
        data: JSON.stringify(this.sendData),
        picture: this.step1Obj.imgurl,
        confirm_way: this.kywayradio,
        // is_calculate_ss : this.ruleForm.is_calculate_ss,
        is_calculate_social_security_cost:this.ruleForm.is_calculate_social_security_cost
      }
      console.log(_data)
      util.ajax({
        url: '/ss/confirm/mail/send',
        type: 'POST',
        data: _data,
        timeout: 180000,
        success: (obj) => {
          this.loading = false
          if (obj && obj.errno == 0) {
            this.$message({
              showClose: true,
              message: '发送成功',
              type: 'success'
            });
            this.$router.replace('fullTimeConfirm')
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
          this.loading = false
        },
        noNetwork: () => {
          this.loading = false
          //网络超时
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    sendPrev() {
      if (this.stepActive-- < 1) this.stepActive = 2;
      this.step1_form = false
      this.step2_form = true
      this.step3_form = false
    },
    /***
     *
     * 第二步：
     * 核对数据
     *
     ***/
    //第一次上传---拖拽上传或者选择文件成功之后的回调
    onUpload(file) {
      this.errorObj.error_list = [];
      this.successObj.success_list = [];
      this.uploadLoading = true
      this.file_name = file.file.name
      var form_data = new FormData()
      form_data.append("team_id", this.team_id);
      form_data.append("project_id", this.project_id);
      form_data.append("month", this.step1Obj.kq_month.replace('-', ''));
      form_data.append("wage_excel", file.file);
      // form_data.append("is_calculate_ss", this.ruleForm.is_calculate_ss);
      form_data.append("is_calculate_social_security_cost",this.ruleForm.is_calculate_social_security_cost)

      $.ajax({
        url: file.action,
        type: 'POST',
        data: form_data,
        processData: false,
        contentType: false,
        xhrFields: {
          withCredentials: true
        },
        timeout: 180000,
        success: (obj) => {
          this.uploadLoading = false
          if (obj && obj.errno == 0) {
            if (obj.data.error_list && obj.data.error_list.length != 0) {
              this.upload_page = false
              this.uploadDataList_page = true
              this.isError = true
              this.isSuccess = false
              this.numtotal = obj.data.error_list.length;
              this.tablelist = obj.data.error_list;
              this.errorObj = obj.data;
              this.errorObj.error_list = this.tablelist.slice(0, this.page_size)
            } else if (obj.data.success_list && obj.data.success_list.length != 0) {
              this.upload_page = false
              this.uploadDataList_page = true
              this.isError = false
              this.isSuccess = true
              this.numtotal = obj.data.success_list.length;
              this.tablelist = obj.data.success_list;
              this.successObj = obj.data;
              this.successObj.success_list = this.tablelist.slice(0, this.page_size)
            } else {
              this.$message({
                showClose: true,
                message: '上传文件内容为空，请填写后重新上传',
                type: 'warning'
              });
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
          this.uploadLoading = false
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        },
        noNetwork: () => {
          this.uploadLoading = false
          this.$message({
            showClose: true,
            message: '网络连接失败，请检查网络',
            type: 'warning'
          });
        }
      })
    },
    //重新上传文件
    onChangeUpfile(type) {
      this.errorObj.error_list = [];
      this.successObj.success_list = [];
      this.againUploadLoading = true
      let that = this
      var currObj = ''
      if (type == 'error') {
        currObj = $("#upfile")
      } else {
        currObj = $("#upfile2")
      }
      if (currObj) {
        var form_data = new FormData()
        var file_data = ''
        if (type == 'error') {
          file_data = $("#upfile1").prop("files")[0]
        } else {
          file_data = $("#upfile22").prop("files")[0]
        }
        form_data.append("team_id", this.team_id);
        form_data.append("project_id", this.project_id);
        form_data.append("month", this.step1Obj.kq_month.replace('-', ''));
        form_data.append("wage_excel", file_data);
        // form_data.append("is_calculate_ss", this.ruleForm.is_calculate_ss);
        form_data.append("is_calculate_social_security_cost",this.ruleForm.is_calculate_social_security_cost)

        this.file_name = file_data.name
        $.ajax({
          url: util.host + '/sea/api/1.0/client/v1/ss/confirm/upload?dmclient=pcweb&X-Doumi-Agent=weixinqy',
          type: 'POST',
          data: form_data,
          processData: false,
          contentType: false,
          xhrFields: {
            withCredentials: true
          },
          timeout: 180000,
          success: (obj) => {
            this.againUploadLoading = false
            if (obj && obj.errno == 0) {
              if (obj.data.error_list && obj.data.error_list.length != 0) {
                this.isError = true
                this.isSuccess = false
                this.numtotal = obj.data.error_list.length;
                this.tablelist = obj.data.error_list;
                this.errorObj = obj.data;
                this.errorObj.error_list = this.tablelist.slice(0, this.page_size)
              } else if (obj.data.success_list && obj.data.success_list.length != 0) {
                this.isError = false
                this.isSuccess = true
                this.numtotal = obj.data.success_list.length;
                this.tablelist = obj.data.success_list;
                this.successObj = obj.data;
                this.successObj.success_list = this.tablelist.slice(0, this.page_size)
              } else {
                this.isError = true
                this.isSuccess = false
                this.errorObj = obj.data
                this.$message({
                  showClose: true,
                  message: '上传文件内容为空，请填写后重新上传',
                  type: 'warning'
                });
              }
              if (type == 'error') {
                document.getElementById("upfile").reset()
              } else {
                document.getElementById("upfile2").reset()
              }
              // document.getElementById("upfile").reset()
              // document.getElementById("upfile2").reset()
            } else {
              this.$message({
                showClose: true,
                message: obj.errmsg,
                type: 'warning'
              });
              // document.getElementById("upfile").reset()
              // document.getElementById("upfile2").reset()
              if (type == 'error') {
                document.getElementById("upfile").reset()
              } else {
                document.getElementById("upfile2").reset()
              }
            }
          },
          error: (xhr, status) => {
            this.againUploadLoading = false
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
            if (type == 'error') {
              document.getElementById("upfile").reset()
            } else {
              document.getElementById("upfile2").reset()
            }
            // document.getElementById("upfile").reset()
            // document.getElementById("upfile2").reset()
          },
          noNetwork: () => {
            this.againUploadLoading = false
            this.$message({
              showClose: true,
              message: '网络连接失败，请检查网络',
              type: 'warning'
            });
            if (type == 'error') {
              document.getElementById("upfile").reset()
            } else {
              document.getElementById("upfile2").reset()
            }
            // document.getElementById("upfile").reset()
            // document.getElementById("upfile2").reset()
          }
        })
      } else {
        this.againUploadLoading = false
      }
    },
    //下载模板
    uploadTemplate() {
      if (navigator.onLine) {
        util.locationHref(`/sea/api/1.0/client/v1/ss/confirm/template/download?dmclient=pcweb&X-Doumi-Agent=weixinqy&project_id=${this.project_id}&team_id=${this.team_id}`)
      } else {
        this.$message({
          showClose: true,
          message: '网络连接失败，请检查网络',
          type: 'warning'
        });
      }
    },
    //文件上传之后错误列表的相关页面展示
    //生成二维码
    useqrcode(code_link) {
      let canvas = document.getElementById('canvas')
      this.link = code_link
      QRCode.toCanvas(canvas, code_link, function(error) {
        console.error(error)
      });
    },
    //复制链接
    copyContent() {
      var Url2 = document.getElementById("input")
      Url2.select();
      document.execCommand("Copy");
      this.$message({
        showClose: true,
        message: '复制成功',
        type: 'warning'
      });
    },
    //文件长传之后正确列表的相关页面展示
    //第二步：核对数据  上一步按钮操作
    prev() {
      if (this.stepActive-- < 1) this.stepActive = 1;
      this.step1_form = true
      this.step2_form = false
      if (editor.txt.text()) {
        $('.placeholder_tip').css('display', 'none')
      }
    },
    //第二步：核对数据  下一步按钮操作
    next_success(prem) {
      ;
      this.postConfirmSecondData = {
        baxian_user_id: this.successObj.baxian_user_id,
        doumi_user_id: this.successObj.doumi_user_id,
        team_id: this.successObj.team_id,
        project_id: this.successObj.project_id,
        month: this.successObj.month,
        attach_url_origin: this.successObj.attach_url_origin,
        list_total: this.successObj.list_total,
        success_list_r_key: this.successObj.success_list_r_key,
        signature: this.successObj.signature,
      };
      if (prem == 'continue') {
        this.postConfirmSecond()
      } else {
        this.lizhiarr = []
        this.successObj.success_list.forEach((m, i) => {
          if (m.is_out == -1) {
            m.number = i
            this.lizhiarr.push(m)
          }
        })
        if (this.lizhiarr.length != 0) {
          this.dialogQuit = true
          return
        } else {
          this.postConfirmSecond()
        }
      }
    },
    postConfirmSecond() {
      util.ajax({
        url: '/ss/confirm/excel/second',
        type: 'POST',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          month: this.step1Obj.kq_month.replace('-', ''),
          // is_calculate_ss : this.ruleForm.is_calculate_ss,
          is_calculate_social_security_cost:this.ruleForm.is_calculate_social_security_cost,
          data: JSON.stringify(this.postConfirmSecondData)
        },
        timeout: 180000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.sendData = obj.data
            let downUrlAr = obj.data.attach_url_origin.split('/');
            this.attach_name = downUrlAr[downUrlAr.length - 1];
            // console.log(this.attach_name)
            if (this.stepActive++ > 2) this.stepActive = 1;
            this.step1_form = false
            this.step2_form = false
            this.step3_form = true
            this.dialogQuit = false
          } else {
            this.$message({
              showClose: true,
              message: '操作频繁，请稍后再试',
              type: 'warning'
            });
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '服务器异常',
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
    /**
     *
     * 第一步：填写内容
     *
     ***/
    confirmTypeChangeFn() {
      this.upload_page = true
      this.uploadDataList_page = false
    },
    //第一步：填写内容  下一步按钮操作
    next(formName) {
      this.$refs[formName].validate((valid) => {
        if (!editor.txt.text() && this.kywayradio == 0) {
          this.sendMailTxt = true
          return
        } else {
          this.sendMailTxt = false
        }
        if (this.errorMailList.length > 0) {
          this.sendMailReg = true
          this.sendMailRegTxt = '请输入正确的邮箱'
          return
        } else {
          this.sendMailReg = false
          this.sendMailRegTxt = ''
        }
        if (this.upImgFileList.length === 0 && this.kywayradio == 1) {
          this.screenshots = true;
          return;  
        }
        if (valid) {
          if (this.stepActive++ > 2) this.stepActive = 1;
          let c_name = ''
          let c_email = ''
          this.confirmPersonOptions.forEach((i) => {
            if (i.confirm_user_email == this.ruleForm.confirmPerson) {
              c_email = i.confirm_user_name + '(' + this.ruleForm.confirmPerson + ')'
              c_name = i.confirm_user_name
            }
          })
          console.log('aaaa',this.ruleForm.is_calculate_social_security_cost)
          // return
          this.step1Obj = {
            name: c_name,
            email: c_email,
            email2: this.ruleForm.confirmPerson,
            send_mail: this.successMailList,
            kq_month: this.ruleForm.kq_month,
            theme: this.ruleForm.mailTheme,
            // is_calculate_ss:this.ruleForm.is_calculate_ss,
            is_calculate_social_security_cost:this.ruleForm.is_calculate_social_security_cost
          }
          if (this.kywayradio == 1) {
            let emailHtml = '',
              imgList = [],
              imgDataHtml = '',
              imgUrl = [];
            this.upImgFileList.map((val, index) => {
              let imgWh = val.response.data.image_info ? (val.response.data.image_info[0] > 664 ? '664px' : val.response.data.image_info[0] || '664px') : '664px';
              emailHtml += '<img src="https://cdn.doumistatic.com/' + val.response.data.url + '" width="' + imgWh + '"style="margin:0 auto 20px;display:block"/>'
              imgList.push({ name: index + 'img', url: 'https://cdn.doumistatic.com/' + val.response.data.url, response: val.response })
              imgUrl.push('https://cdn.doumistatic.com/' + val.response.data.url)

            });
            imgDataHtml = '<p style="display:none">imgDataHtml' + JSON.stringify(imgList) + 'imgDataHtml</p>'
            this.step1Obj.text = emailHtml + imgDataHtml
            this.step1Obj.imgurl = imgUrl
          } else {
            this.step1Obj.text = editor.txt.html()
          }
          this.step1_form = false
          this.step2_form = true
          this.step3_form = false
          console.log(this.step1Obj)
        } else {
          console.log('error submit!!');
          return false;
        }
      })
    },
    //抄送人邮箱操作
    appendMailTag(type, ev) {

      let mailVal = '';

      if (type == 'copy') {
        var emvalue = ev.originalEvent.clipboardData.getData('text/plain');
        mailVal = emvalue.replace(/\ +/g, ';')
        mailVal = mailVal.replace(/；/g, ';')
        mailVal = mailVal.replace(/\r\n/g, ";")
        mailVal = mailVal.replace(/\n/g, ";")
        mailVal = mailVal.replace(/，/g, ';')
        mailVal = mailVal.replace(/,/g, ';')
        let mailAr = [];
        mailAr = mailVal.split(';');
        mailAr.map((val, index) => {
          console.log(val)
          if (!reg.test(val)) {
            if (val.trim() != '') {
              this.errorMailList.push(val.trim())
            }
          } else {
            this.successMailList.push(val.trim())
          }

        })
        this.ruleForm.sendPersonEmail = ''
        this.sendMailReg = false
        this.sendMailRegTxt = ''
        $('.emailinput').css('width', 70)
        $('.addr_text').css('width', 70)
        setTimeout(() => {
          ev.target.value = ''
          this.ruleForm.sendPersonEmail = ''
        }, 10)
      } else {
        mailVal = this.ruleForm.sendPersonEmail.replace(';', '')
        mailVal = mailVal.replace(',', '')
        mailVal = mailVal.replace('，', '')
        if (!reg.test(mailVal)) {
          if (!mailVal) {
            this.ruleForm.sendPersonEmail = ''
            this.sendMailReg = false
            this.sendMailRegTxt = ''
            return;
          };
          this.errorMailList.push(mailVal.trim())
          this.ruleForm.sendPersonEmail = ''
          this.sendMailReg = false
          this.sendMailRegTxt = ''
          $('.emailinput').css('width', 70)
          $('.addr_text').css('width', 70)
          return
        } else {
          this.successMailList.push(mailVal.trim())
          this.ruleForm.sendPersonEmail = ''
          this.sendMailReg = false
          this.sendMailRegTxt = ''
          $('.emailinput').css('width', 70)
          $('.addr_text').css('width', 70)
        }
      }
    },
    removeMailTag() {
      if (!this.ruleForm.sendPersonEmail) {
        if (this.errorMailList.length != 0 && this.successMailList.length == 0) {
          this.errorMailList.pop();
          return
        }
        if (this.successMailList.length != 0 && this.errorMailList.length == 0) {
          this.successMailList.pop();
          return
        }
        if (this.successMailList.length != 0 && this.errorMailList.length != 0) {
          this.errorMailList.pop();
          return
        }
      }
    },
    getConfirmerData() {
      util.ajax({
        url: '/confirm/client',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id
        },
        timeout: 60000,
        success: (obj) => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.person_list = obj.data.person_list
            this.confirmPersonOptions = this.person_list;
            this.confirm_method = +obj.data.confirm_method || 1;
            this.kywayradio = +obj.data.confirm_method;
            if (this.confirm_id && this.confirm_id != '') {
              $('.placeholder_tip').css('display', 'none')
              $('.emailinput').css('width', '70px')
              $('.addr_text').css('width', '70px')
              this.geiMailInfo()
            }
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '服务器异常',
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
    onClickSuccessEmail(index, pre) {
      this.successMailList.splice(index, 1);
    },
    onClickErrorEmail(index, pre) {
      this.errorMailList.splice(index, 1);
    },
    //获取邮件信息
    geiMailInfo() {
      util.ajax({
        url: '/confirm/mail/info',
        type: 'GET',
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          confirm_id: this.confirm_id
        },
        timeout: 60000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.ruleForm.confirmPerson = obj.data.row.confirm_user_email;
            this.confirmPersonEmail = obj.data.row.confirm_user_email;
            this.successMailList = obj.data.row.copy_user_email;
            this.ruleForm.weektime = [obj.data.row.start_date, obj.data.row.end_date];
            this.ruleForm.mailTheme = obj.data.row.subject;
            if (this.kywayradio == 0) {
              editor.txt.text(obj.data.row.content)
            } else {
              if (obj.data.row.content.indexOf('imgDataHtml') != -1) {
                let imgData = obj.data.row.content.split('imgDataHtml');
                this.file_list = JSON.parse(imgData[1])
                this.upImgFileList = JSON.parse(imgData[1]);
                if (this.file_list.length >= 3) {
                  $('.el-upload--picture-card').css('display', 'none')
                }
              } else {
                editor.txt.text(obj.data.row.content)
                this.kywayradio = 0;
              }
            }
            editor.$textElem.attr('contenteditable', false)
            editor.$textElem.attr('contenteditable', true)
          }
        },
        error: (xhr, status) => {
          this.$message({
            showClose: true,
            message: '服务器异常',
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
    handleCurrentPageChange() {
      if (this.errorObj.error_list.length > 0) {
        this.errorObj.error_list = this.tablelist.slice((this.currentPage - 1) * this.page_size, this.currentPage * this.page_size)
      } else {
        this.successObj.success_list = this.tablelist.slice((this.currentPage - 1) * this.page_size, this.currentPage * this.page_size)
      }
    },
    getIsNxProject() {
      setTimeout(()=> {
        this.is_nx_project = JSON.parse(window.localStorage.getItem('isNxProject'));
        console.log('this.is_nx_project===', this.is_nx_project)
      }, 800)
    }
  },
  mounted() {
    this.getIsNxProject();
    setTimeout(function() {
      $('.w-e-menu').css('z-index', '1000')
      $('.w-e-text-container').css('z-index', '1000')
    }, 500)
    /*第一步：抄送人多个邮箱相关操作*/
    $('.senddiv').mouseover(() => {
      if ($('.senddiv').hasClass('border_color')) {
        $('.senddiv').removeClass('senddiv_hover')
        return
      } else {
        $('.senddiv').addClass('senddiv_hover')
      }
    })
    $('.senddiv').mouseout(() => {
      $('.senddiv').removeClass('senddiv_hover')
    })
    $('.emailinput').focus(() => {
      $('.senddiv').addClass('border_color')
    })
    $('.emailinput').blur(() => {
      $('.senddiv').removeClass('border_color')
      if (this.errorMailList.length == 0 && this.successMailList.length == 0) {
        $('.emailinput').css('width', '100%')
        $('.addr_text').css('width', '100%')
      }
      if (!this.ruleForm.sendPersonEmail) {
        return
      }
      this.appendMailTag()
    })
    $('.emailinput').keyup(() => {
      $('.emailinput').css('width', 70 + (this.ruleForm.sendPersonEmail.length * 10))
      $('.addr_text').css('width', 70 + (this.ruleForm.sendPersonEmail.length * 10))
    })

    $('.emailinput').keyup((e) => {
      // console.log(e)
      let keyCode = e.keyCode
      switch (keyCode) {
        case 32: // 空格键
          this.appendMailTag()
          break
        case 186: //分号键
          this.appendMailTag()
          break
        case 8: //删除键
          this.removeMailTag()
          break
        case 13: //回车键
          this.appendMailTag()
          break
        case 188: //逗号
          this.appendMailTag()
          break
        default:
          break
      }
    })
    $('.emailinput').on('paste', (event) => {
      this.appendMailTag('copy', event)
    })
    $('.placeholder_tip').focus(() => {
      $('.placeholder_tip').css('display', 'none')
    })
    $('.placeholder_tip').blur(() => {
      if (editor.txt.text()) {
        $('.placeholder_tip').css('display', 'none')
      } else {
        $('.placeholder_tip').css('display', 'block')
      }
    })
    // 创建富文本编辑器
    editor = new E('#editor')
    // 富文本自定义菜单配置
    editor.customConfig.menus = [
      'bold',
      'foreColor',
      'table'
    ]
    editor.customConfig.onfocus = function() {
      $('.placeholder_tip').css('display', 'none')
    }
    editor.customConfig.onblur = function(html) {
      if (editor.txt.text()) {
        $('.placeholder_tip').css('display', 'none')
      } else {
        $('.placeholder_tip').css('display', 'block')
      }
    }
    editor.create()
    // 禁用编辑功能
    editor.$textElem.attr('contenteditable', false)
    // 开启编辑功能
    editor.$textElem.attr('contenteditable', true)

    this.init()

    $(window).on('resize', () => {
      this.winHeight = window.innerHeight - 350;
    })
  },
  watch: {
    '$route'(to, from) {
      // 对路由变化作出响应...
      this.init()
      this.getIsNxProject();
    },
    kywayradio: function(val) {
      if (val == 1) {
        this.confirmPersonEmail = this.ruleForm.confirmPerson;
        this.confirmPersonOptions = [{ confirm_user_name: '在职管理部门', confirm_user_email: this.usingemail }];
        this.ruleForm.confirmPerson = this.usingemail;
        //xiangmuyunying
      } else {
        this.confirmPersonOptions = this.person_list;
        this.ruleForm.confirmPerson = this.confirmPersonEmail == this.usingemail ? '' : this.confirmPersonEmail || '';
      }
    }
  }
}

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#Newcreatmail .newCreatCount .el-step__head.is-text.is-finish {
  background-color: #6699ee;
  border-color: #6699ee;
  font-weight: bold;
  font-size: 14px;
}

#Newcreatmail .newCreatCount .el-step__title.is-finish {
  color: #6699ee;
  font-size: 12px;
  font-weight: bold;
  margin-left: 5px;
}

#Newcreatmail .newCreatCount .el-step__head.is-text.is-process {
  background-color: #c0ccda;
  border-color: #c0ccda;
  font-weight: bold;
  font-size: 14px;
}

#Newcreatmail .newCreatCount .el-step__title.is-process {
  font-weight: bold;
  color: #99a9bf;
  font-size: 12px;
  margin-left: 5px;
}

#Newcreatmail .newCreatCount .el-step__head.is-text.is-wait {
  border-color: #c0ccda;
  color: #c0ccda;
  font-weight: bold;
  font-size: 14px;
}

#Newcreatmail .newCreatCount .el-step__title.is-wait {
  font-weight: bold;
  color: #99a9bf;
  font-size: 12px;
  margin-left: 5px;
}

#Newcreatmail .newCreatCount .step1_form .el-icon-loading {
  display: none;
}

#Newcreatmail .newCreatCount .step2_form .el-table th {
  height: 36px;
}

#Newcreatmail .newCreatCount .step2_form .el-table--border th,
.el-table td,
.el-table th.is-leaf {
  border-right: 1px solid #e0e6ed;
}

#Newcreatmail .newCreatCount .step2_form .el-progress-bar__inner {
  background-color: #6699ee;
}

#Newcreatmail .newCreatCount .step2_form .el-table--enable-row-hover .el-table__body tr:hover>td {
  background-color: #f7f7f9
}


/* 第二步：核对数据--上传 */
#Newcreatmail .newCreatCount .step2_form .upload {
  width: 70%;
}

#Newcreatmail .newCreatCount .step2_form .el-upload {
  width: 100%
}

#Newcreatmail .newCreatCount .step2_form .el-upload-dragger {
  width: 100%;
  height: 220px;
  border-color: #e0e6ed;
  background-color: #f7f9fc;
}

#Newcreatmail .newCreatCount .step2_form .el-upload-dragger .el-icon-upload {
  margin: 53px 0 20px;
}

#Newcreatmail .newCreatCount .step2_form .el-upload-dragger .el-upload__text {
  color: #99a9bf;
}

#Newcreatmail .newCreatCount .step2_form .el-upload-dragger .el-upload__text em {
  color: #6699ee;
  font-size: 14px;
}

#Newcreatmail .newCreatCount .step2_form .el-upload-dragger .el-upload__text em:active {
  color: #517ed6;
}

#Newcreatmail .newCreatCount .step2_form .el-upload__tip {
  text-align: center;
  color: #99a9bf;
  font-size: 12px;
  margin-top: 16px;
}

#Newcreatmail .newCreatCount .step2_form .el-upload__tip a {
  color: #6699ee;
  font-size: 12px;
}

#Newcreatmail .newCreatCount .step2_form .el-upload__tip a:active {
  color: #517ed6;
}

#Newcreatmail .newCreatCount .step2_form .uploadExplain {
  margin-top: 40px;
}

#Newcreatmail .newCreatCount .step2_form .uploadExplain h2 {
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  color: #5e6d82;
  margin-bottom: 10px;
}

#Newcreatmail .newCreatCount .step2_form .uploadExplain p {
  font-size: 14px;
  line-height: 1.71;
  text-align: left;
  color: #99a9bf;
}

#Newcreatmail .newCreatCount .step2_form .uploadExplain img {
  margin-top: 16px;
}

#Newcreatmail .newCreatCount .step2_form .el-upload-list {
  display: none;
}

#Newcreatmail .newCreatCount .step2_form .el-table--border td {
  border-right: none;
}

/* 邀请加入 */
#Newcreatmail .dialog-invit .el-dialog--tiny {
  width: 470px;
}

#Newcreatmail .dialog-quit .el-dialog--tiny {
  width: 420px;
}

#Newcreatmail .dialog-quit .dialogQuitform p {
  font-size: 14px;
  color: #8492A6;
  letter-spacing: 0;
  margin-bottom: 12px;
}

#Newcreatmail .dialog-quit .dialogQuitform p span {
  color: #ffaa00;
  font-weight: bold;
}

#Newcreatmail .dialog-quit .dialogQuitform .el-table th {
  height: 36px;
}

#Newcreatmail .dialog-quit .dialogQuitform .el-table--enable-row-hover .el-table__body tr:hover>td {
  background-color: #f7f7f9;
}

#Newcreatmail .dialog-quit .el-dialog__footer {
  padding: 15px 20px 17px;
}

#Newcreatmail .dialog-invit .el-dialog__body {
  padding: 30px 40px 50px 40px;
}


#Newcreatmail .dialog-quit .el-dialog__body {
  padding: 30px 40px 25px 40px;
  border-bottom: 1px solid #E5EBF1;
}

#Newcreatmail .dialog-invit .el-form-item {
  margin-left: 2px;
}

#Newcreatmail .dialog-invit h3 {
  font-size: 14px;
  line-height: 1.14;
  color: #1f2d3d;
  text-align: center;
  margin-bottom: 8px;
}

#Newcreatmail .dialog-invit .ewm {
  width: 225px;
  height: 200px;
  margin: 0 auto;
  /*margin-bottom: 32px;*/
}

#Newcreatmail .dialog-invit .ewm dl dt {
  width: 160px;
  height: 160px;
  background: #eeeeee;
  margin: 0 auto;
  margin-bottom: 8px;
}

#Newcreatmail .dialog-invit .ewm dl dt #canvas {
  width: 160px !important;
  height: 160px !important;
}

#Newcreatmail .dialog-invit .ewm dl dd {
  font-size: 13px;
  line-height: 1.23;
  color: #8492a6;
  text-align: center;
}

#Newcreatmail .dialog-invit .el-form-item__label {
  font-size: 14px;
  color: #8492a6;
}

#Newcreatmail .dialog-invit .el-form-item__content {
  width: 290px;
  position: relative;
}

#Newcreatmail .dialog-invit .myinput .btn2 {
  position: absolute;
  right: 0px;
  top: 27px;
}

#Newcreatmail .dialog-invit .myinput {
  position: relative;
}

#Newcreatmail .dialog-invit .myinput label {
  font-size: 14px;
  color: #8492a6;
}

#Newcreatmail .dialog-invit .myinput input {
  margin-top: 12px;
  height: 36px;
  line-height: 36px;
  border: 1px solid #e0e6ed;
  width: 260px;
  padding: 0 15px;
  color: #1f2d3d;
  font-size: 14px;
  border-radius: 2px;
}

#Newcreatmail .dialog-invit .myinput input:hover {
  border-color: #c0ccda
}

#Newcreatmail .dialog-invit .myinput input:focus {
  border-color: #6699EE;
}

#Newcreatmail .invitmember-btn,
.copybtn {
  margin-left: 0px !important;
  width: 88px !important;
}

/* 富文本编辑 */
#Newcreatmail .newCreatCount .step1_form .editor_div {
  width: 67.7%;
  margin-bottom: 5px;
  position: relative;
}

#Newcreatmail .newCreatCount .step1_form #editor {
  width: 100%;
}

#Newcreatmail .newCreatCount .step1_form #editor .w-e-toolbar {
  background-color: #eff1f3 !important;
  border: 1px solid #e0e6ed !important;
  height: 32px;
  line-height: 22px;
}

#Newcreatmail .newCreatCount .step1_form #editor .w-e-text-container {
  border: 1px solid #e0e6ed !important;
  border-top: none !important;
  height: 208px !important;
}

#Newcreatmail .newCreatCount .step1_form #editor .w-e-text p {
  font-size: 14px;
}

#Newcreatmail .newCreatCount .step1_form #editor .w-e-text p.placeholder_txt {
  color: #99a9bf !important;
}

#Newcreatmail .w-e-toolbar .w-e-menu i {
  color: #99A9BF;
}

#Newcreatmail .w-e-toolbar .w-e-menu:hover i {
  color: #6699ee;
}

#Newcreatmail .w-e-toolbar .w-e-active i {
  color: #517ed6
}

#Newcreatmail .w-e-toolbar .w-e-active:hover i {
  color: #6699ee;
}

#Newcreatmail .w-e-text-container .w-e-panel-container {
  left: 23%;
}

#Newcreatmail .w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button {
  color: #6699ee;
}

#Newcreatmail .w-e-text-container .w-e-panel-container {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.10);
}

.mysend-item {
  position: relative;
}

.el-picker-panel {
  z-index: 99999 !important;
}

#Newcreatmail .sendPreview .send_content .s_text table {
  margin: 16px 0 0 0;
}

#Newcreatmail .sendPreview .send_content .s_text tbody {
  border: 1px solid #e0e6ed;
}

#Newcreatmail .sendPreview .send_content .s_text tbody tr {
  border-bottom: 1px solid #e0e6ed;
}

#Newcreatmail .sendPreview .send_content .s_text tbody td {
  border-right: 1px solid #e0e6ed;
  padding: 7.5px 0;
}

#Newcreatmail .sendPreview .send_content .s_text tbody th {
  border-right: 1px solid #e0e6ed;
  padding: 7.5px 0;
}

#Newcreatmail .step3_form .el-loading-mask {
  width: 70%;
}

.placeholder_tip {
  width: 90%;
  border: none;
  outline: none;
  height: 30px;
  line-height: 30px;
  margin-left: 10px;
  position: absolute;
  left: 0px;
  top: 35px;
}

.upload-img p {
  font-size: 14px;
  color: #99a9bf;
}

.upload-imgmain {
  margin-top: 14px;
}

.upload-imgadd {
  position: relative;
  height: 140px;
  width: 140px;
  border: solid 1px #e0e6ed;
  cursor: pointer;
}

.upload-imgadd i {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  height: 140px;
  width: 140px;
  background: url(../assets/imgs/add_imgison.svg) no-repeat;
  background-size: 100% 100%;
}

.upload-imginput {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
  opacity: 0;
}


.upload-imgmain .el-upload--picture-card {
  height: 140px;
  width: 140px;
  border: none;
  border-radius: 2px;
}

.upload-imgmain .el-upload--picture-card:hover {
  border-color: #e0e6ed;
}

.upload-imgmain .el-icon-plus:before {
  content: '';
}

.upload-imgmain .el-icon-plus {
  display: block;
  height: 140px;
  width: 140px;
  background: url(../assets/imgs/add_imgison.svg) no-repeat;
  background-size: 100% 100%;
  border: none;
}

.upload-imgmain .el-upload-list--picture-card .el-upload-list__item {
  width: 140px;
  height: 140px;
  border: none;
  border-radius: 2px;
  margin: 0 20px 0 0;
}

.upload-imgmain .el-icon-check:before {
  content: "";
}

.upload-imgmain .el-upload-list--picture-card .el-upload-list__item-status-label {
  height: 0;
  width: 0;
}

.upload-imgmain .el-icon-delete2 {
  position: relative;
  display: block;
  width: 22px;
  height: 24px;
  background: url(../assets/imgs/delete_imgicon.svg) no-repeat;
  background-size: 100% 100%;
  margin: 47px auto 0;
}

.upload-imgmain .el-icon-delete2:before {
  display: block;
  position: absolute;
  bottom: -21px;
  left: -59px;
  width: 140px;
  font-size: 14px;
  text-align: center;
  content: '删除图片'
}

.upload-imgmain .deleteUptext {
  font-size: 14px;
  color: #fff;
  text-align: content
}

.el-form-item.confirm_method {
  margin-bottom: 13px;
}

.confirm_method .el-radio__label {
  padding-left: 10px;
}

.confirm_method .el-radio+.el-radio {
  margin-left: 32px;
}

</style>
<style scoped>
#Newcreatmail {
  padding: 0 20px;
}

#Newcreatmail .c-top {
  height: 54px;
  line-height: 20px;
  border-bottom: 1px solid #e0e6ed;
  margin-bottom: 30px;
}

.newCreatCount .steps {
  margin-left: 10px;
  margin-bottom: 20px;
}



/* 填写内容 */
.step1_form {
  padding: 0 4px;
}

/* 抄送人 */
#Newcreatmail .newCreatCount .step1_form .senddiv {
  width: 65.9%;
  height: auto;
  padding: 0px 0.8%;
  border: 1px solid #e0e6ed;
  border-radius: 2px;
  overflow: hidden;
  float: left;
  position: relative;
}

#Newcreatmail .newCreatCount .step1_form .senddiv_hover {
  border-color: #c0ccda;

}

#Newcreatmail .newCreatCount .step1_form .border_color {
  border-color: #6699ee;
}

#Newcreatmail .newCreatCount .step1_form .senddiv .addr_text {
  float: left;
  overflow: hidden;
  outline: none;
  height: 34px;
}

#Newcreatmail .newCreatCount .step1_form .senddiv .addr_text input {
  -webkit-appearance: none;
  border: none;
  outline: none;
  font-size: 14px;
}

#Newcreatmail .newCreatCount .step1_form .senddiv .mytags {}

#Newcreatmail .newCreatCount .step1_form .senddiv .mytags .emailTxt {
  float: left;
  padding: 0 6px;
  height: 26px;
  line-height: 26px;
  margin-right: 5px;
  background-color: #f3f7ff;
  border: solid 1px #d4e4ff;
  margin-top: 3px;
  font-size: 14px;
  color: #1f2d3d;
  border-radius: 2px;
}

#Newcreatmail .newCreatCount .step1_form .senddiv .mytags .emailTxt_error {
  float: left;
  padding: 0 6px;
  height: 26px;
  line-height: 26px;
  margin-top: 5px;
  font-size: 14px;
  color: #1f2d3d;
}

#Newcreatmail .newCreatCount .step1_form .error_border {
  border: 1px solid #ff6600;
  margin-bottom: 6px;
}

#Newcreatmail .newCreatCount .step1_form .error_border_txt {
  color: #ff6600;
  font-size: 12px;
  position: absolute;
  left: 0px;
  bottom: -23px;

}

.emailinput::-webkit-input-placeholder {
  color: #99a9bf;
  font-size: 14px;
}

.emailinput:-moz-placeholder {
  color: #99a9bf;
  font-size: 14px;
}

.emailinput::-moz-placeholder {
  color: #99a9bf;
  font-size: 14px;
}

.emailinput:-ms-input-placeholder {
  color: #99a9bf;
  font-size: 14px;
}

.placeholder_tip::-webkit-input-placeholder {
  color: #99a9bf;
  font-size: 14px;
}

.placeholder_tip:-moz-placeholder {
  color: #99a9bf;
  font-size: 14px;
}

.placeholder_tip::-moz-placeholder {
  color: #99a9bf;
  font-size: 14px;
}

.placeholder_tip:-ms-input-placeholder {
  color: #99a9bf;
  font-size: 14px;
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
  content: '';
  display: block;
  clear: both;
}

.errorDataList .myTop h2 a.file:hover {
  border: 1px solid #8BB1F2;
  color: #8BB1F2;
}

.errorDataList .myTop h2 a.file:active {
  border: 1px solid #517ED6;
  color: #517ED6;
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
  content: '';
  display: block;
  clear: both;
}

.successtop {}

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
  border: 1px solid #8BB1F2;
  color: #8BB1F2;
}

.successDataList .myTop a.file:active {
  border: 1px solid #517ED6;
  color: #517ED6;
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

/* 第三步：发送预览 */
/*.step1_form, .step2_form, .step3_form{
  margin-bottom: 50px;
}*/
.step1_form,
.step3_form {
  margin-bottom: 50px;
}

.sendPreview h1 {
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  color: #475669;
  margin-bottom: 16px;
  width: 68%;
  line-height: 24px;
}

.sendPreview h2 {
  font-size: 13px;
  line-height: 1.54;
  text-align: left;
  color: #99a9bf;
}

.sendPreview h2 span {
  font-size: 13px;
  line-height: 1.54;
  text-align: left;
  color: #475669;
}

.sendPreview .send_content {
  width: 66.7%;
  padding: 20px 20px 20px 20px;
  background-color: #f7f9fc;
  border-radius: 10px;
  margin-bottom: 30px;
  margin-top: 24px;
  overflow: auto;
}

.sendPreview .send_content h3 {
  font-size: 14px;
  text-align: left;
  color: #475669;
  margin-bottom: 16px;
}

.sendPreview .send_content .s_text p {
  font-size: 14px;
  line-height: 1.71;
  text-align: left;
  color: #475669;
}

.sendPreview .send_content .s_text {
  font-size: 14px;
  line-height: 1.71;
  color: #475669;
}

.sendPreview .download {
  width: 64.8%;
  padding: 0 20px 0 40px;
  height: 42px;
  line-height: 42px;
  border-radius: 6px;
  background-color: #ffffff;
  border: solid 1px #edf1f5;
  margin-bottom: 16px;
}

.sendPreview .download h4 {
  float: left;
  font-size: 12px;
  font-weight: 500;
  color: #5e6d82;
  margin-right: 60px;
  position: relative;
}

.sendPreview .download h4 i {
  display: block;
  width: 15px;
  height: 13px;
  background: url(../assets/imgs/mail/fujian.svg);
  position: absolute;
  left: -22px;
  top: 14px;
}

.sendPreview .download h5 {
  font-size: 14px;
  text-align: left;
  color: #5e6d82;
  position: relative;
  float: left;
}

.sendPreview .download h5 i {
  display: block;
  width: 15px;
  height: 16px;
  background: url(../assets/imgs/EXCEL_icon.svg);
  position: absolute;
  left: -23px;
  top: 13px;
}

.sendPreview .download a {
  float: right;
  font-size: 12px;
  font-weight: 500;
  color: #6699ee;
  position: relative;
}

.sendPreview .download a i {
  display: block;
  width: 13px;
  height: 13px;
  background: url(../assets/imgs/mail/xiazai.svg);
  position: absolute;
  left: -16px;
  top: 15px
}

.sendPreview .down-tip {
  width: 70%;
}

.sendPreview .down-tip p {
  width: 250px;
  font-size: 12px;
  line-height: 1.17;
  color: #99a9bf;
  float: right;
  text-align: right;
  background: url(../assets/imgs/mail/tip.svg) no-repeat left center;
}

.kqway {
  display: flex;
}

.kqway .wayemail {
  font-size: 14px;
  color: #1f2d3d;
  margin-right: 32px;
  cursor: pointer;
}

.kqway .wayemail i {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border: solid 1px #e0e6ed;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 10px;

}

.kqway .set-thisway i {
  position: relative;
  background-color: #6699ee;
}

.kqway .set-thisway i:after {
  position: absolute;
  top: 5px;
  left: 5px;
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  background-color: #ffffff;
  border-radius: 50%;
}

.upload-imgmain .uploadimg_cent {
  height: 140px;
}

.step3_form .down {
  font-size: 12px;
  color: #6699ee;
  float: right;
}

.el-form-item.confirm_method {
  margin-bottom: 13px;
}

.confirm_method .el-radio__label {
  padding-left: 10px;
}

.confirm_method .el-radio+.el-radio {
  margin-left: 32px;
}
.exportErr{
  margin-left: 10px;
  float: right;
}
</style>
