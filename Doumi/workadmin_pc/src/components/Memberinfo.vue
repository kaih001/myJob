<template>
  <div class="memberinfo">
    <div class="memberinfo_top">
      <breadcrumb>
        <router-link to="memberadmin" replace>人员管理</router-link>
        <router-link to="">个人信息</router-link>
      </breadcrumb>
    </div>
    <div v-loading="loading">
    </div>

      <div class="memberinfo1">
        <div v-if="member_info.logo && member_info.logo.thumb_url" class="logo" :style="'background-image:url(' + member_info.logo.thumb_url + ');'"></div>
        <div v-else class="logo"></div>
        <div class="info">
          <div class="info1">
            <span class="name">{{ member_info.real_name }}</span>
            <span class="flog">{{ member_info.gender || "未设置性别" }}</span>
            <span class="flog">{{
              member_info.member_status == -1
                ? "离职"
                : member_info.status == 1
                ? "在职"
                : "未激活"
            }}</span>
            <span class="phone">
              <el-popover
                placement="top"
                title=""
                width="150"
                trigger="hover">
                <span style="margin-left:35px">{{member_info.mobile}}</span>
                <span slot="reference" style="font-size:14px">{{member_info.mobile?member_info.mobile.substr(0,3)+"****"+member_info.mobile.substr(7):''}}</span>
              </el-popover>
            </span>
          </div>
          <div class="info2" style="margin-bottom: 3px">
            <span class="job">小组：{{ member_info.group_name }}</span>
            <span class="job">角色：{{ member_info.identity_str }}</span>
            <span class="job" v-if="is_nx_project">人员来源：{{ member_info.worker_source || '-'}}</span>
          </div>
          <div class="info2" v-if="member_info.station_name">
            <span class="job">岗位：{{ member_info.station_name }}</span>
          </div>
        </div>
        <div class="member_btns">
          <el-button type="primary" v-if="edit_Pre == 1" @click="updateMemberInfo">编&nbsp;辑</el-button>
          <el-button type="primary" v-if="edit_Pre == 1 && member_info.member_status == -1" @click="reEmploy">重新录用</el-button>
          <el-button type="primary" v-if="edit_Pre == 1 && member_info.member_status != -1 && !member_info.naixue_saas_project_ids_admin" @click="dialogLeave = true">标记离职</el-button>
          <el-button type="primary" v-if="member_info.is_show_sign_button == 1" @click="checkProtocol">签署合同</el-button>
          <el-popover v-if="member_info.is_show_sign_button == 1" class="sign_tip_item" placement="top-start" title="" width="300" trigger="hover">
            <div class="sign_tip_div">
              员工必须在伯乐中有对应的入职邀约才可签署合同，邀约需满足如下条件：<br />
              1.手机号一致<br />
              2.邀约职位绑定SaaS项目一致<br />
              3.邀约状态需要入职或入职后状态<br />
            </div>
            <i slot="reference" class="el-icon-warning id-no-err"></i>
          </el-popover>
          <!-- <el-button type="primary"  @click="checkProtocol">签署合同</el-button> -->
        </div>
      </div>
      <div class="memberinfo2">
        <div class="section">
          <p class="s_title">员工档案</p>
          <div class="s_item" v-if="member_info.entry_date">
            <div class="item_left">入职时间</div>
            <div class="item_right">{{ member_info.entry_date }}</div>
          </div>
          <div class="s_item" v-if="member_info.personnel_number">
            <div class="item_left">人员编号</div>
            <div class="item_right">{{ member_info.personnel_number }}</div>
          </div>
          <div class="s_item" v-if="member_info.protocol_detail.length > 0" v-for="(item, idx) in member_info.protocol_detail" :key="idx">
            <div class="item_left">{{ item.protocol_name }}</div>
            <div class="item_right">
              {{
                item.protocol_status == 1
                  ? "已签订"
                  : item.protocol_status == -1
                  ? "未签订"
                  : item.protocol_status == 4
                  ? "已过期"
                  : item.protocol_status == 5
                  ? "未下发"
                  : "签订中"
              }}
              <el-popover v-if="item.protocol_status == 5" class="sign_tip_item" placement="top-start" title="" width="300" trigger="hover">
                <div class="sign_tip_div">
                  员工必须在伯乐中有对应的入职邀约才可下发合同，邀约需满足如下条件：<br />
                  1.手机号一致<br />
                  2.邀约职位绑定SaaS项目一致<br />
                  3.邀约状态需要入职或入职后状态<br />
                </div>
                <i slot="reference" class="el-icon-warning id-no-err"></i>
              </el-popover>
              <span class="icon1" v-if="item.is_recall == 1" @click="recallProtocol(item)">撤回</span>
              <span class="icon2" v-if="item.protocol_status == 1 || item.protocol_status == 4" @click="seeProtocol(item)">查看</span>
              <span class="icon3" v-if="item.protocol_status == 1 || item.protocol_status == 4" @click="downloadProtocol(item)">下载</span>
              <span class="icon4" v-if="
                  project_type == 1 &&
                  (item.protocol_status == 1 ||
                    item.protocol_status == 4 ||
                    item.protocol_status == 5)
                " @click="checkResetProtocol(item)">重新签署</span>
            </div>
          </div>
          <div class="s_item" v-if="member_info.remark">
            <div class="item_left">备注信息</div>
            <div class="item_right">{{ member_info.remark }}</div>
          </div>
          <div class="s_item" v-if="member_info.member_status == -1">
            <div class="item_left">离职时间</div>
            <div class="item_right">{{ member_info.leave_date }}</div>
          </div>
          <div class="s_item" v-if="member_info.member_status == -1 && member_info.leave_reason">
            <div class="item_left">离职原因</div>
            <div class="item_right">{{ member_info.leave_reason }}</div>
          </div>
          <div class="s_item" v-if="member_info.status == '1' && isSigned == '1' && current_user_role_id == 3">
            <div class="item_left">在职证明</div>
            <div class="item_right">
              <span class="" style="text-indent:0;margin-left:0" @click="downPdf">
                在职证明下载
              </span>
            </div>
          </div>

          <div class="s_item" v-if="member_info.show_frozen_balance">
            <div class="item_left">当前冻薪金额</div>
            <div class="item_right"> {{member_info.current_frozen_balance}}元
              <span class="icon5" @click="showDialogRefund" v-if="member_info.member_status != 0 && member_info.refund_btn && member_info.current_frozen_balance>0 && !member_info.refund_status">
                退薪
              </span>
              <template v-if="member_info.member_status != 0 && member_info.refund_btn && member_info.refund_status && member_info.refund_status_code==-5">
                  <el-tooltip class="item" effect="dark" :content="member_info.refund_fail_reason" placement="top-end">
                    <span >退薪失败</span>
                  </el-tooltip>
              </template>
              <template v-if="member_info.member_status != 0 && member_info.refund_btn && member_info.refund_status && member_info.refund_status_code!=-5">
                    <span >退薪中</span>
              </template>
                
            </div>

          </div>

          <div class="s_item" v-if="member_info.report_query == 1">
            <div class="item_left">违规信息查询</div>
            <div class="item_right">{{ member_info.report_status_name }}
              <span v-if="member_info.report_status == 3">失败原因：{{member_info.report_fail_reason}}</span>
              <span style="text-indent:0;margin:0 10px;" v-if="member_info.report_status == 2" @click="showFun">
                查看
              </span>
              <span style="text-indent:0;margin:0 10px;" v-if="member_info.report_status == 2" @click="downFun">
                下载
              </span>
              <span style="text-indent:0;margin:0 10px;" v-if="member_info.report_status != 1" @click="tryAgainFun">
                重新查询
              </span>
            </div>
          </div>
        </div>
        <div class="section">
          <p class="s_title">详细信息</p>
          <div class="s_item" v-if="member_info.idnumber">
            <div class="item_left">身份证号</div>
            <div class="item_right">
              <div>
                <el-popover
                  placement="top"
                  title=""
                  width="150"
                  trigger="hover">
                  <span style="margin-left:10px">{{member_info.idnumber}}</span>
                  <span slot="reference" style="font-size:14px">{{member_info.idnumber.substr(0,3)+"****"+member_info.idnumber.substr(14)}}</span>
                </el-popover>
              </div>
            </div>
          </div>
          <div class="s_item" v-if="member_info.height && member_info.height != 0">
            <div class="item_left">身高(cm)</div>
            <div class="item_right">{{ member_info.height }}</div>
          </div>
          <div class="s_item" v-if="member_info.weight && member_info.weight != 0">
            <div class="item_left">体重(kg)</div>
            <div class="item_right">{{ member_info.weight }}</div>
          </div>
          <div class="s_item" v-if="member_info.birthday && member_info.birthday != 0">
            <div class="item_left">出生年月</div>
            <div class="item_right">{{ member_info.birthday }}</div>
          </div>
          <div class="s_item" v-if="member_info.address">
            <div class="item_left">居住地区</div>
            <div class="item_right">{{ member_info.address }}</div>
          </div>
          <div class="s_item" v-if="member_info.datail_address">
            <div class="item_left">居住地址</div>
            <div class="item_right">{{ member_info.datail_address }}</div>
          </div>
          <div class="s_item" v-if="member_info.degree && member_info.degree != 0">
            <div class="item_left">学历</div>
            <div class="item_right">{{ member_info.degree_name }}</div>
          </div>
          <div class="s_item" v-if="member_info.school">
            <div class="item_left">学校</div>
            <div class="item_right">{{ member_info.school }}</div>
          </div>
          <div class="s_item" v-if="member_info.specialty">
            <div class="item_left">专业</div>
            <div class="item_right">{{ member_info.specialty }}</div>
          </div>
          <div class="s_item" v-if="member_info.graduate_date && member_info.graduate_date != 0">
            <div class="item_left">毕业时间</div>
            <div class="item_right">{{ member_info.graduate_date }}</div>
          </div>
          <div class="s_item" v-if="member_info.bank">
            <div class="item_left">银行卡开户行</div>
            <div class="item_right">{{ member_info.bank }}</div>
          </div>
          <div class="s_item" v-if="member_info.bank_info">
            <div class="item_left">开户行全称</div>
            <div class="item_right">{{ member_info.bank_info }}</div>
          </div>
          <div class="s_item" v-if="member_info.bank_card_number">
            <div class="item_left">银行卡号</div>
            <div class="item_right">{{ member_info.bank_card_number }}</div>
          </div>
          <div class="s_item" v-if="member_info.emergency_contact_person">
            <div class="item_left">紧急联系人</div>
            <div class="item_right">
              {{ member_info.emergency_contact_person }}
            </div>
          </div>
          <div class="s_item" v-if="member_info.emergency_contact_person_mobile">
            <div class="item_left">紧急联系人手机号</div>
            <div class="item_right">
              {{ member_info.emergency_contact_person_mobile }}
            </div>
          </div>
          <div class="s_item" v-if="member_info.is_supplier == 1">
            <dl>
              <dt>
                <h3 style="
                    font-family: 'PingFang-SC-Bold';
                    font-size: 16px;
                    color: #475669;
                    line-height: 22px;
                    margin-bottom: 25px;
                  ">
                  供应商二维码
                </h3>
                <p style="color: #475669; font-size: 12px">
                  {{ project_name }}（用于供应商添加成员使用）
                </p>
              </dt>
              <dd style="margin-left: -16px"><canvas id="canvas2"></canvas></dd>
            </dl>
          </div>
        </div>
        <div class="section my_driver_license" v-if="member_info.is_show_driver_license_info">
          <p class="s_title">我的证件 <i class="driver_edit" @click="editMyDriverLicenses('open')">编辑</i></p>
          <div class="s_item">
            <div class='img-list'>
              <template v-for="(v,i) of myDriverLicenses">
                <div class="img-con" v-if="v.src" :key="v.id">
                  <div class="img-text">{{v.title}}</div>
                  <div class="img-warp">
                    <img :src="v.src" @click="previewImg(v.src)" />
                  </div>
                  <div class="add_img">
                    <label :for="'sel_img'+v.id">重新上传</label>
                    <input :id="'sel_img'+v.id" type="file" @change="onFileChange(v,i)" accept=".jpeg,.png,.jpg">
                  </div>
                </div>
              </template>
              <!--
              <div class="img-con" v-if="member_info.driver_license_front">
                <div class="img-text">驾驶证正本</div>
                <img :src="member_info.driver_license_front" @click="previewImg(member_info.driver_license_front)" />
                <div class="img-text">重新上传</div>
              </div>
              <div class="img-con" v-if="member_info.driver_license_back">
                <div class="img-text">驾驶证副页</div>
                <img :src="member_info.driver_license_back" @click="previewImg(member_info.driver_license_back)" />
                <div class="img-text">重新上传</div>
              </div>
              <div class="img-con" v-if="member_info.vehicle_license_front">
                <div class="img-text">行驶证正本</div>
                <img :src="member_info.vehicle_license_front" @click="previewImg(member_info.vehicle_license_front)" />
                <div class="img-text">重新上传</div>
              </div>
              <div class="img-con" v-if="member_info.vehicle_license_back">
                <div class="img-text">行驶证副页</div>
                <img :src="member_info.vehicle_license_back" @click="previewImg(member_info.vehicle_license_back)" />
                <div class="img-text">重新上传</div>
              </div>
              <div class="img-con" v-if="member_info.other_license_image">
                <div class="img-text">其他附件</div>
                <div class="img-warp">
                  <img :src="member_info.other_license_image" @click="previewImg(member_info.other_license_image)" />
                </div>
                <div class="add_img">
                  <label for="sel_img">重新上传</label>
                  <input id="sel_img" type="file" @change="onFileChange" accept=".jpeg,.png,.jpg">
                </div>
              </div>
              <-->
            </div>
          </div>
        </div>
        <div class="section" v-if="detailCustomFields.length>0">
          <p class="s_title">自定义信息</p>
          <template v-for="(item,index) of detailCustomFields">
            <div class="s_item" :key="item.id">
              <div class="item_left">{{item.name}}</div>
              <div class="item_right" v-if="item.type=='Imageview'">
                <div v-for="(v,i) of item.info.value">
                  <a href="javascript:;" @click="preview(v)">{{v}}</a>
                </div>
              </div>
              <div class="item_right" v-else>{{ item.info.value }}</div>
            </div>
          </template>
        </div>
      </div>
    <!-- 标记离职弹窗 -->
    <div class="leave_dialog">
      <el-dialog title="标记离职" :visible.sync="dialogLeave" @close="canceldialogLeave">
        <div class="dialog_main">
          <div class="leave_item">
            <div class="item_left">离职日期</div>
            <div class="item_right">
              <el-date-picker v-model="leave_data.leave_date" style="width: 268px" :editable="false" :clearable="false" type="date" placeholder="选择日期">
              </el-date-picker>
            </div>
          </div>
          <div class="leave_item">
            <div class="item_left">离职原因</div>
            <div class="item_right">
              <el-radio-group v-model="leave_data.change_radio" @change="changeLeaveTpye">
                <el-radio-button :label="o.leave_type" v-for="o in leave_data.reasonArr" :class="{ 'my-margin': o.leave_type === '被动离职' }"></el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="leave_item" v-if="leave_data.change_radio">
            <div class="item_left">详细原因</div>
            <div class="item_right" style="width: 265px; height: auto">
              <template v-if="leave_data.currSelectLeavelist.length">
                <el-radio-group v-model="leave_data.detail_reason">
                  <el-radio-button :label="i.reason" v-for="i in leave_data.currSelectLeavelist" class="my-radio-button"></el-radio-button>
                </el-radio-group>
              </template>
              <template v-else>
                <el-input type="textarea" style="width: 268px" :rows="3" resize="none" placeholder="请输入" v-model="leave_data.leave_reason">
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
            <el-button type="primary" @click="postAjaxQuit">确 定</el-button>
          </div>
        </div>
      </el-dialog>
    </div>
    <!-- 弹窗————编辑信息 -->
    <div class="dialog-addmember">
      <el-dialog title="修改人员信息" :visible.sync="dialogEdit" @close="resetFormMember('ruleForm')" size="small">
        <div class="myformAdd" id="asd">
          <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="90px" class="demo-ruleForm">
            <el-form-item label="手机号" prop="mobile">
              <el-input :disabled="true" v-model="ruleForm.mobile" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="姓名" prop="real_name">
              <el-input v-model="ruleForm.real_name" placeholder="请输入" :disabled="
                  ruleForm.identity == 1 || ruleForm.real_name_auth == 1
                "></el-input>
            </el-form-item>
            <el-form-item label="设置角色" prop="identity">
              <el-select v-model="
                  ruleForm.identity == 1 ? '超级管理员' : ruleForm.identity
                " :disabled="
                  ruleForm.identity == 1 || ruleForm.station_value == 1
                " placeholder="请选择" class="mystatus">
                <el-option v-for="item in roleArr" :key="item.identity_id" :label="item.identity_name" :value="item.identity_id">
                </el-option>
              </el-select>
            </el-form-item>
            <div v-show="
                ruleForm.identity == 3 && is_open_supplier == 1 ? true : false
              ">
              <el-form-item label="设为供应商" class="IDNumber">
                <el-switch on-text="" off-text="" on-value="1" off-value="0" on-color="#6097e4" off-color="#c0ccda" v-model="ruleForm.station_value">
                </el-switch>
              </el-form-item>
            </div>
            <el-form-item label="所属小组" prop="group_id">
              <el-select v-model="ruleForm.group_id" filterable placeholder="请选择" prop="group_id" class="mystatus" :disabled="ruleForm.identity == 1 || ruleForm.is_supplier == 1 || member_info.naixue_saas_project_ids_admin">
                <el-option v-for="item in allGroupList" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="开户行全称" class="bankUserName">
              <el-input v-model="ruleForm.bank_info" placeholder="请输入" :disabled="ruleForm.identity == 1"></el-input>
            </el-form-item>
            <el-form-item label="银行卡号" class="IDNumber">
              <el-input v-model="ruleForm.bank_card_number" placeholder="请输入" :disabled="ruleForm.identity == 1"></el-input>
            </el-form-item>
            <el-form-item label="银行卡开户名" class="bankUserName">
              <el-input v-model="ruleForm.bank" placeholder="请输入" :disabled="ruleForm.identity == 1"></el-input>
            </el-form-item>
            <el-form-item label="身份证号" class="IDNumber" id="sfz">
              <el-input v-model="ruleForm.idnumber" :class="{ error_idnumber: idnumberReg }" :disabled="
                  ruleForm.identity == 1 || ruleForm.real_name_auth == 1
                " placeholder="请输入"></el-input>
              <span v-if="idnumberReg && ruleForm.idnumber" class="error_idnumber_text">请输入正确的身份证号码</span>
            </el-form-item>
            <el-form-item label="岗位" prop="station_id" class="gender">
              <el-select v-model="ruleForm.id" @change="changeStationCityFn" placeholder="请选择" class="mystatus">
                <el-option v-for="item in stationList" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="性别" class="gender">
              <el-select v-model="ruleForm.gender" placeholder="请选择" :disabled="
                  ruleForm.identity == 1 || ruleForm.real_name_auth == 1
                " class="mystatus">
                <el-option label="男" value="1"></el-option>
                <el-option label="女" value="2"></el-option>
              </el-select>
            </el-form-item>
            <!-- <template v-if="!isadd"> -->
            <el-form-item label="身高(cm)" class="gender" id="sg">
              <el-input v-model="ruleForm.height" placeholder="请输入" :disabled="ruleForm.identity == 1" :class="{ error_idnumber: heightReg }"></el-input>
              <span v-if="heightReg" class="error_idnumber_text">请输入数字</span>
            </el-form-item>
            <el-form-item label="体重(kg)" class="gender" prop="weight" id="tz">
              <el-input v-model="ruleForm.weight" placeholder="请输入" :disabled="ruleForm.identity == 1" :class="{ error_idnumber: weightReg }"></el-input>
              <span v-if="weightReg" class="error_idnumber_text">请输入数字</span>
            </el-form-item>
            <el-form-item label="出生年月" class="IDNumber">
              <el-date-picker v-model="ruleForm.birthday" type="month" style="width: 251px" :editable="false" :disabled="
                  ruleForm.identity == 1 || ruleForm.real_name_auth == 1
                " placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="居住地区" class="IDNumber">
              <el-cascader class="my-address" :options="options" v-model="selectedOptions" :disabled="ruleForm.identity == 1" style="width: 252px" placeholder="选择地区" change-on-select></el-cascader>
            </el-form-item>
            <el-form-item label="居住地址" class="IDNumber">
              <el-input v-model="ruleForm.datail_address" placeholder="请输入" :disabled="ruleForm.identity == 1"></el-input>
            </el-form-item>
            <el-form-item label="学历" class="gender">
              <el-select v-model="ruleForm.degree" :disabled="ruleForm.identity == 1" placeholder="请选择" class="mystatus">
                <el-option v-for="item in degreeArr" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="学校" class="gender">
              <el-input v-model="ruleForm.school" placeholder="请输入" :disabled="ruleForm.identity == 1"></el-input>
            </el-form-item>
            <el-form-item label="专业" class="gender">
              <el-input v-model="ruleForm.specialty" placeholder="请输入" :disabled="ruleForm.identity == 1"></el-input>
            </el-form-item>
            <el-form-item label="毕业时间" class="IDNumber">
              <el-date-picker v-model="ruleForm.graduate_date" type="month" :editable="false" style="width: 251px" :disabled="ruleForm.identity == 1" placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="入职日期" class="IDNumber">
              <el-date-picker v-model="ruleForm.entry_date" type="date" :editable="false" style="width: 251px" :disabled="ruleForm.identity == 1" placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="离职日期" class="IDNumber" v-show="member_info.member_status == -1">
              <el-date-picker v-model="ruleForm.leave_date" type="date" :editable="false" style="width: 251px" :disabled="ruleForm.identity == 1" placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="人员编号" class="IDNumber">
              <el-input v-model="ruleForm.personnel_number" placeholder="请输入" :disabled="ruleForm.identity == 1"></el-input>
            </el-form-item>
            <el-form-item label="紧急联系人" class="IDNumber">
              <el-input v-model="ruleForm.emergency_contact_person" placeholder="请输入" :disabled="ruleForm.identity == 1"></el-input>
            </el-form-item>
            <el-form-item label="紧急联系人手机号" class="IDNumber">
              <el-input v-model="ruleForm.emergency_contact_person_mobile" placeholder="请输入" :disabled="ruleForm.identity == 1"></el-input>
            </el-form-item>
            <el-form-item label="备注信息" class="desc">
              <el-input type="textarea" :maxlength="1000" placeholder="请输入" :disabled="ruleForm.identity == 1" v-model="ruleForm.project_remark"></el-input>
            </el-form-item>
            <el-form-item>
              <div class="size-num">
                <span>{{ ruleForm.project_remark.length }}/1000</span>
              </div>
            </el-form-item>
            <template v-if="customFields.length>0">
              <template v-for="(item, number) in customFields">
                <el-form-item :label="item.name" :key="item.id">
                  <component 
                    :is="item.type" 
                    :item="item" 
                    :number="number"
                    @changeComponent="changeComponentHandle"
                  ></component>
                </el-form-item>
              </template>
            </template>
            
            <!-- </template> -->
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetFormMember('ruleForm')" class="btn1">取 消</el-button>
          <el-button type="success" @click="handleDialogCustomField('open')" class="btn2">自定义选项 </el-button>
          <el-button type="primary" @click="submitFormMember('ruleForm')" class="btn2">确 定</el-button>
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
    <!-- 签署合同弹窗 -->
    <div class="protocol_dialog dialog-addmember">
      <el-dialog title="签署合同" :visible.sync="dialogProtocol" @close="resetForm('ruleForm2')">
        <div class="myform">
          <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-width="90px" class="demo-ruleForm">
            <!-- <el-form-item label="岗位" prop="station_id">
                            <el-select v-model="ruleForm2.station_id"  @change="changeStationFn" placeholder="请选择" class="mystatus">
                              <el-option
                                v-for="item in stationList2"
                                :key="item.station_id"
                                :label="item.station_name"
                                :value="item.station_id">
                              </el-option>
                            </el-select>
                        </el-form-item> -->
            <el-form-item label="岗位城市" prop="id">
              <el-select v-model="ruleForm2.id" @change="changeStationFn" placeholder="请选择" class="mystatus" filterable>
                <el-option v-for="item in stationList" :key="item.id" :label="item.name" :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="工作地点" prop="city_id">
                            <el-select v-model="ruleForm2.city_id" @change="getStationInfo(ruleForm2.city_id)" filterable placeholder="请选择" class="mystatus" :disabled="!ruleForm2.station_id">
                              <el-option
                                v-for="item in stationCityList"
                                :key="item.city_id"
                                :label="item.short_name"
                                :value="item.city_id">
                              </el-option>
                            </el-select>
                        </el-form-item> -->
            <el-form-item label="生效日期" prop="start_date">
              <el-date-picker v-model="ruleForm2.start_date" type="date" style="width: 251px" :editable="false" :clearable="false" :picker-options="startOptions" placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="结束日期" prop="end_date">
              <el-date-picker v-model="ruleForm2.end_date" type="date" style="width: 251px" :editable="false" :clearable="false" :picker-options="endOptions" placeholder="选择日期">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="试用期" prop="probation">
              <el-input v-model="ruleForm2.probation" placeholder="请输入" style="width: 209px"></el-input>
              <span style="
                  float: right;
                  font-family: 'PingFangSC-Regular';
                  font-size: 14px;
                  color: #8492a6;
                ">个月</span>
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
    <!-- 修改成员——生成二维码弹窗 -->
    <div class="dialog-invit">
      <el-dialog title="供应商二维码" :visible.sync="dialogInvit" size="tiny">
        <div class="dialogInvitform" style="padding: 30px">
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

    <!-- 重签合同弹窗 -->
    <div class="reset_protocol_dialog">
      <el-dialog title="提示" :visible.sync="dialogResetProtocol" @close="canceldialogResetProtocol">
        <div class="dialog_main">
          <div class="leave_item">
            <div class="item_left">重新签署会将已签署的合同({{protocol_name}})作废并重新发起，是否确定操作</div>
          </div>
        </div>
        <div class="dialog_foot">
          <div class="btns">
            <el-button @click="canceldialogResetProtocol">取 消</el-button>
            <el-button type="primary" @click="resetProtocol">确 定</el-button>
          </div>
        </div>
      </el-dialog>
    </div>


    <!-- 退薪弹窗 -->
    <div class="refund_dialog">
      <el-dialog title="提示" :visible.sync="dialogRefund" @close="cancelRefund">
        <div class="dialog_main">
          <div class="leave_item">
            <div class="item_left">是否确认将冻薪金额重新发放给员工？</div>
          </div>
        </div>
        <div class="dialog_foot">
          <div class="btns">
            <el-button @click="cancelRefund">取 消</el-button>
            <el-button type="primary" @click="refundFrozenBalance">确 定</el-button>
          </div>
        </div>
      </el-dialog>
    </div>

    <!-- 弹窗————编辑我的证件弹窗 -->
    <div class="dialog-addmember">
      <el-dialog title="自定义选项" :visible.sync="dialogMyDriverLicenses">
        <div class="myformCus">
          <el-form :model="myDriverLicensesData" label-width="120px">
            <el-form-item label="驾驶证号">
              <el-input v-model="myDriverLicensesData.driver_license_no" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="车牌号（行驶本）">
              <el-input v-model="myDriverLicensesData.license_plate_no" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="所属人">
              <el-input v-model="myDriverLicensesData.vehicle_owner" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="车牌号(其他证件)">
              <el-input v-model="myDriverLicensesData.other_license_no" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editMyDriverLicenses('cancel')">取 消</el-button>
          <el-button type="primary" @click="submitMyDriverLicenses">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <!-- 打印信用报告 -->
    <div style="height:0px;overflow:hidden">
      <div id="violationDom">
        <violation :user_id="this.member_user_id" :project_id="this.project_id"></violation>
      </div>
    </div>
  </div>
</template>
<script>
import $ from "jquery";
import * as util from "@/assets/js/util.js";
import GroupUtil from "../assets/js/GroupUtil.js";
import formFields from '../assets/js/formFields.js'

import breadcrumb from "@/components/common/breadcrumb";
import QRCode from "qrcode";
import elUpload from "./ElUpload";
import {elUploadMixin} from "../mixins/elUploadMixin.js";
import {htmlToPdfMixin} from "../mixins/htmlToPdfMixin.js";

import SingleText from '@/components/common/dynamicForm/SingleText';
import Imageview from '@/components/common/dynamicForm/Imageview';
import violation from './violation';


// let idnumberReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
let numberReg = /^\d+(\.\d+)?$/;

export default {
  name: "Memberinfo",
  components: {
    breadcrumb,
    elUpload,
    SingleText,
    Imageview,
    violation
  },
  mixins: [elUploadMixin, htmlToPdfMixin],
  data() {
    let _this = this;
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
        return callback(new Error("请选择小组"));
      }
    };
    return {
      team_id: 0,
      project_id: 0,
      project_type: 0,
      member_user_id: 0,
      protocol_id: 0,
      protocol_name: '',
      changeStationPre: false,
      dialogInvit: false,
      loading: true,
      leave_loading: false,
      dialogLeave: false, //标记离职弹窗
      dialogProtocol: false, //签署合同弹窗
      dialogEdit: false, //修改信息弹窗
      dialogResetProtocol: false, //重置合同弹窗
      dialogRefund: false, //退薪弹窗
      edit_Pre: 0, //编辑权限
      is_open_supplier: 0, //是否开启费用结算
      link: "",
      leave_data: {
        leave_date: new Date(),
        leave_reason: "",
        change_radio: "",
        detail_reason: "",
        reasonArr: [],
        currSelectLeavelist: [],
      },
      member_info: {
        logo: {},
      },
      degreeArr: [
        { id: 1, name: "初中及以下" },
        { id: 2, name: "高中" },
        { id: 3, name: "大专" },
        { id: 4, name: "本科" },
        { id: 5, name: "硕士" },
        { id: 6, name: "博士及以上" },
      ],
      ruleForm2: {
        id: "",
        city_id: "",
        city_name: "",
        station_id: "", //岗位
        show_id: "",
        station_name: "",
        start_date: new Date(),
        end_date: new Date(),
        probation: "", //试用期
        store: '',
        jobStation: '',
        wage_day: "", //发工资日期
      },
      rules2: {
        id: [{ required: true, message: "请选择岗位城市", trigger: "change" }],
        city_id: [
          { required: true, message: "请选择工作地点", trigger: "change" },
        ],
        start_date: [
          {
            required: true,
            message: "请选择生效日期",
            type: "object",
            trigger: "change",
          },
        ],
        end_date: [
          {
            required: true,
            message: "请选择结束日期",
            type: "object",
            trigger: "change",
          },
        ],
        probation: [
          {
            required: true,
            validator: probationReg,
            message: "请输入试用期",
            trigger: "change",
          },
        ],
        store: [{ required: true, message: "请选择门店", trigger: "change" }],
        jobStation: [{ required: true, message: "请选择岗位", trigger: "change" }],
      },
      stationList2: [],
      stationList: [
        // {
        //  station_id: "100",
        //  station_name: "100-外呼客服和接听客服0",
        //  citys: [
        //      {
        //          city_id: "12",
        //          city_name: "北京"
        //      },
        //      {
        //          city_id: "12",
        //          city_name: "北京"
        //      },
        //  ]
        // }
      ], //岗位列表
      stationCityList: [], //岗位对应城市列表
      cityStationList: [],
      storeList: [],         // 门店
      jobStationList: [],    // 岗位列表
      submitDisabled: false,
      ruleForm: {
        station_value: "",
        station_city_id: "",
        stationid: "",
        id: "",
        show_id: "", //岗位
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
        emergency_contact_person: "",
        emergency_contact_person_mobile: "",

        importValue: "", //导出数据值
      },
      rules: {
        mobile: [{ required: true, validator: phoneReg, trigger: "blur" }],
        real_name: [{ required: true, validator: nameReg, trigger: "change" }],
        group_id: [
          { required: true, message: "请选择所属小组", trigger: "change" },
        ],
        identity: [{ required: true, validator: roleReg, trigger: "change" }],
        idnumber: [
          { required: true, message: "请输入身份证号码", trigger: "change" },
        ],
        importGroup: [{ validator: importGroupReg, trigger: "change" }],
        importValue: [{ validator: importValueReg, trigger: "change" }],
      },
      protocol_crm: {
        //岗位对应的合同信息
        end_date: "",
        probation: "",
        store: '',
        jobStation: '',
        start_date: "",
        wage_day: "",
      },
      startOptions: {
        disabledDate(time) {
          if (_this.ruleForm2.end_date) {
            return (
              time.getTime() <
              util.getStampFromDate(
                util.getLocalTime(
                  _this.protocol_crm.start_date * 1000,
                  "yyyy-MM-dd"
                )
              ) || time.getTime() > _this.ruleForm2.end_date.getTime()
            );
          } else {
            return (
              time.getTime() <
              util.getStampFromDate(
                util.getLocalTime(
                  _this.protocol_crm.start_date * 1000,
                  "yyyy-MM-dd"
                )
              )
            );
          }
        },
      },
      endOptions: {
        disabledDate(time) {
          if (_this.ruleForm2.start_date) {
            return (
              time.getTime() <
              util.getStampFromDate(
                util.getLocalTime(
                  _this.ruleForm2.start_date.getTime(),
                  "yyyy-MM-dd"
                )
              ) ||
              time.getTime() <
              util.getStampFromDate(
                util.getLocalTime(new Date().getTime(), "yyyy-MM-dd")
              )
            );
          } else {
            return (
              time.getTime() <
              util.getStampFromDate(
                util.getLocalTime(
                  _this.protocol_crm.start_date * 1000,
                  "yyyy-MM-dd"
                )
              )
            );
          }
        },
      },
      allGroupList: [], //所有小组列表--select下拉框选择
      roleArr: [], // 所有角色列表
      idnumberReg: false,
      heightReg: false,
      weightReg: false,
      selectedOptions: [], //选择的地区
      options: [], //地区列表
      project_name: "",
      timer: null,
      pdfLoading: false,
      current_user_role_id: '',
      isSigned: '',    // 是否已签订
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      srcList: [
        'https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg',
        'https://fuss10.elemecdn.com/1/8e/aeffeb4de74e2fde4bd74fc7b4486jpeg.jpeg'
      ],
      is_nx_project: false,
      //自定义表单
      customFieldForm: {
        name: '889',
        region: '',
      },
      detailCustomFields:[],
      customFields:[],
      submitCustomFields:[],
      oGroup_id:'',
      dialogCustomField:false,
      //我的证件
      myDriverLicenses:[
        {id:1,title:'驾驶证正本',uploadText:'重新上传',src:'',type:'driver_license_front'},
        {id:2,title:'驾驶证副页',uploadText:'重新上传',src:'',type:'driver_license_back'},
        {id:3,title:'行驶证正本',uploadText:'重新上传',src:'',type:'vehicle_license_front'},
        {id:4,title:'行驶证副页',uploadText:'重新上传',src:'',type:'vehicle_license_back'},
        {id:5,title:'其他附件',uploadText:'重新上传',src:'',type:'other_license_image'},
      ],
      images:[],
      dialogMyDriverLicenses:false,
      myDriverLicensesData:{
        driver_license_no: '',
        license_plate_no: '',
        vehicle_owner: '',
        other_license_no: '',
      },
      is_show_shop: false
    };
  },
  methods: {
    previewImg(url){
      this.$hevueImgPreview(url)
    },
    init() {
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.member_user_id = util.getQueryString("id");
      this.edit_Pre = util.getQueryString("e");
      this.getMemberInfo();
      this.getRoleList();
      this.getAddressListData();
      this.getGroupList();
      this.getLeaveReason();
      this.getOverview();
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
            this.project_type = obj.data.list.project_type;
            console.log("project_type:" + this.project_type);
            this.current_user_role_id = obj.data.list.current_user_role_id;
          }
        },
        error: (xhr, status) => {
        },
        noNetwork: () => {
        }
      })
    },
    changeLeaveTpye() {
      this.leave_data.reasonArr.forEach((item) => {
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
    getLeaveReason() {
      util.ajax({
        url: "/group/batch/member_remove_reason",
        type: "GET",
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.leave_data.reasonArr = obj.data;
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
    getMemberInfo() {
      this.loading = true;
      util.ajax({
        url: "/group/member_info",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          user_id: this.member_user_id,
          fields: "",
        },
        timeout: 10000,
        success: (obj) => {
          this.loading = false;
          if (obj && obj.errno == 0) {
            let data=obj.data;
            this.is_show_shop = obj.data.is_show_shop;
            this.member_info = data;
            //我的证件
            this.myDriverLicenses=this.myDriverLicenses.map(v=>{
              v.src=this.member_info[v.type]
              return v;
            });
            //获取动态表单数据
            this.detailCustomFields=data.form_list;
            //格式化学历
            this.degreeArr.forEach((i) => {
              if (i.id == data.degree) {
                data.degree_name = i.name;
              }
            });
            //是否已经签订
            this.isSigned = this.member_info.protocol_detail[0]?this.member_info.protocol_detail[0].protocol_status:'';
            console.log("获取人员信息的group_id----" + obj.data.group_id);
            this.group_id=obj.data.group_id
            if (obj.data.is_supplier == 1) {
              this.getCodeLink("", obj.data.group_id);
            }
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {
          this.loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
        noNetwork: () => {
          this.loading = false;
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    onFileChange(v,i){
      // console.log('eeeeee',id);
      console.log('eeeeee',v);
      var imgs=['image/jpeg','image/jpg','image/png'];
			var form_data = new FormData()
			var file_data = $("#sel_img"+v.id).prop("files")[0]
			form_data.append("team_id", util.getLocalStorage('projectStorageInfo').team_id);
			form_data.append("project_id", util.getLocalStorage('projectStorageInfo').project_id);
			form_data.append("file", file_data);
			$('#sel_img'+v.id).val('')
      console.log('bbbbbbbb',file_data);
      if(!imgs.includes(file_data.type)){
        this.$message({
          showClose: true,
          message: '只支持上传图片',
          type: 'warning'
        });
        return
      }
      // return
			$.ajax({
			   	url:util.host+'/sea/api/1.0/client/v1/common/upload/accessory?dmclient=pcweb&X-Doumi-Agent=weixinqy',
			   	type:'POST',
			   	data:form_data,
			   	processData:false,
			   	contentType:false,            
			   	xhrFields:{
			     	withCredentials:true
			   	},
			   	timeout:10000,
			   	success:(obj) => {
            if(obj && obj.errno == 0){
              console.log('>>>>',obj);
              // let tempObj = {}
              let file_url = '//image-inner.doumi.com/'+obj.data.file_url
              // tempObj.msrc = 'https://cdn.doumistatic.com/'+obj.data.thumbUrl
              // let image = new Image();
              // image.src = 'https://cdn.doumistatic.com/'+obj.data.url
              // image.onload = function(){
              //   tempObj.w = image.width
              //   tempObj.h = image.height
              // }
              // this.images.push(tempObj.src)
              this.myDriverLicenses[i].src=file_url;
              this.saveMyDriverLicenses(obj.data.file_url,v.type);
              this.$message({
                showClose: true,
                message: '上传成功',
                type: 'success'
              });
            }else{
                this.$message({
                  showClose: true,
                  message: '图片不能大于5M',
                  type: 'warning'
                });
            }
			   	},   
			   	error: (xhr, status) => {
            this.$message({
              showClose: true,
              message: '图片不能大于5M',
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
    saveMyDriverLicenses(url,type){
      let team_id=util.getLocalStorage('projectStorageInfo').team_id;
      let project_id=util.getLocalStorage('projectStorageInfo').project_id;
      let user_id=this.member_info.user_id;
      let params={
        team_id,
        project_id,
        user_id,
        [type]:url
      };
      console.log('paramsparamsparams',params);
      util.ajax({
        url: '/group/member_edit_driverlicense',
        type: 'POST',
        data: params,
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            console.log('fsfdfdfdf',obj);
          }
        },
        error: (xhr, status) => {
        },
        noNetwork: () => {
        }
      })
    },
    changeComponentHandle(e){
      console.log('eeeeeeeeeeee',e);
      let {number,value,item}=e;
      let fields={
        "id":item.id,
        "info":[
            {
                "id":"",
                "type":item.type,
                "name":item.name,
                "info":{...item.info,value}
            }
        ]
      };
      this.submitCustomFields[number]=fields;
      console.log('>>>>>>',this.submitCustomFields);
    },
    //初始化动态表单
    initCustomFields(data){
      let newData=data.filter(v=>{
        return v.type=='SingleText'||v.type=='Imageview' 
      });
      console.log('ggggg',newData);
      console.log('ggggg',this.submitCustomFields);
      if(this.submitCustomFields.length>0){
        newData.map((v,i)=>{
          let o=this.submitCustomFields.find((e,index)=>{
            return e.id==v.id;
          });

          if(o){
            v.info.value=o.info[0].info.value;
          }
          return v;
        })
      }
      this.submitCustomFields=newData.map((v,i)=>{
        return {
          "id":v.id,
          "info":[
            {
              "id":"",
              "type":v.type,
              "name":v.name,
              "info":{...v.info}
            }
          ]
        }
      })
      console.log('submitCustomFieldssubmitCustomFieldssubmitCustomFields',this.submitCustomFields);
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
    getCodeLink(pre, group_id) {
      // console.log('获取二维码的group_id-----'+group_id)
      util.ajax({
        url: "/group/qrcode_link",
        type: "GET",
        data: {
          group_id: group_id,
          team_id: this.team_id,
          project_id: this.project_id,
          invite_user_id: this.member_info.user_id,
          type: 2,
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.project_name = obj.data.project_name;
            this.useqrcode(pre, obj.data.qrcode_url_link);
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
    //生成二维码
    useqrcode(pre, code_link) {
      let canvas = "";
      if (pre == "edit") {
        canvas = document.getElementById("canvas");
      } else {
        canvas = document.getElementById("canvas2");
      }
      this.ruleForm.link = code_link;
      QRCode.toCanvas(canvas, code_link, function (error) {
        // console.error(error)
      });
    },
    reEmploy() {
      this.loading = true;
      util.ajax({
        url: "/group/member/re_employ",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          group_id: this.member_info.group_id,
          user_ids: "[" + this.member_user_id + "]",
        },
        timeout: 10000,
        success: (obj) => {
          console.log(obj);
          this.loading = false;
          if (obj && obj.errno == 0) {
            if (obj.data.change_status == true) {
              this.$message({
                showClose: true,
                message: "重新录用成功",
                type: "success",
              });
              this.getMemberInfo();
            }
          }else if(obj && obj.errno == 38000){
            this.$alert(obj.errmsg, '提示', {
              confirmButtonText: '确定',
              type: 'warning',
              callback: action => {
                console.log('action重新录用===', action)
              }
            })
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {
          this.loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
        noNetwork: () => {
          //网络超时
          this.loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    canceldialogLeave() {
      this.dialogLeave = false;
      this.leave_data.leave_reason = "";
      this.leave_data.change_radio = "";
      this.leave_data.detail_reason = "";
      this.leave_data.leave_date = new Date();
      this.contractFile=[];
    },

    postAjaxQuit() {
      let timestr = this.leave_data.leave_date.getTime();
      let uploadData={};
      // this.leave_loading = true
      if (this.leave_data.change_radio == "") {
        this.$message({
          showClose: true,
          message: "请选择离职原因",
          type: "warning",
        });
        return false;
      }
      if (this.leave_data.change_radio === "其他") {
        if (this.leave_data.leave_reason == "") {
          this.$message({
            showClose: true,
            message: "请填写详细原因",
            type: "warning",
          });
          return false;
        }
      } else {
        if (this.leave_data.detail_reason == "") {
          this.$message({
            showClose: true,
            message: "请选择详细原因",
            type: "warning",
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
      let _cur_reason_id = "";
      let _cur_reason = "";
      this.leave_data.currSelectLeavelist.forEach((i) => {
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
      // console.log('nnnnnnnnnnn',resignationDocument);
      // return
      util.ajax({
        url: "/group/batch/member_remove",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          user_id: this.member_user_id,
          reason_id: _cur_reason_id,
          leave_reason: _cur_reason || this.leave_data.leave_reason,
          leave_date: util.getLocalTime(timestr, "yyyyMMdd"),
          ...uploadData
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          this.leave_loading = false;
          if (obj && obj.errno == 0) {
            if (obj.data.remove_status == true) {
              this.$message({
                message: "成功标记为离职",
                type: "success",
              });
              this.dialogLeave = false;
              this.leave_data.leave_reason = "";
              this.leave_data.change_radio = "";
              this.leave_data.detail_reason = "";
              this.leave_data.leave_date = new Date();
              this.getMemberInfo();
            }
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {
          this.leave_loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
        noNetwork: () => {
          //网络超时
          this.leave_loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    changecityStationFn(value) {
      // console.log(value)
    },
    changeStationFn(curStationId) {
      console.log(curStationId);

      // if(!curStationId) return
      //       let curStation = this.stationList2.filter((item) => {
      //           return item.station_id == curStationId
      //       });
      //       if(!curStation.length) return
      //       this.ruleForm2.city_id = ''
      //       this.stationCityList = curStation[0].citys

      if (!curStationId) return;
      let curStation = this.stationList.filter((item) => {
        return item.id == curStationId;
      });
      console.log(curStation);
      if (!curStation.length) return;
      // this.ruleForm2.city_id = ''
      this.ruleForm2.city_id = "";
      this.ruleForm2.probation = "";
      this.ruleForm2.store = "";
      this.ruleForm2.jobStation = "";
      this.ruleForm2.start_date = new Date();
      this.ruleForm2.end_date = new Date();
      this.stationCityList = curStation[0].citys;

      // console.log(stationCityList)
      this.getStationInfo(curStation[0]);
    },
    getStationInfo(curr) {
      // console.log(curr)
      this.submitDisabled = false;
      util.ajax({
        url: "/protocol/crm/get",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          station_id: curr.station_id,
          city_id: curr.city_id,
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            if (obj.data == "") {
              obj.data.start_date = "";
              obj.data.end_date = "";
              obj.data.probation = "";
              obj.data.store = "";
              obj.data.jobStation = "";
              obj.data.wage_day = "";
              this.ruleForm2.end_date = new Date();
            } else {
              this.ruleForm2.end_date = new Date(obj.data.end_date * 1000);
            }
            this.setProtocolStartDate();
            this.protocol_crm = obj.data; //保存初始信息
            this.ruleForm2.probation = obj.data.probation || "";
            this.ruleForm2.store = obj.data.store || "";
            this.ruleForm2.jobStation = obj.data.jobStation || "";
            this.ruleForm2.wage_day = obj.data.wage_day || "";
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning",
            });
            if (obj.errno == 29014) {
              //合同过期
              this.submitDisabled = true;
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
    },
    setProtocolStartDate(){
      util.ajax({
        url: "/protocol/get_start_date",
        type: "POST",
        data: {
          project_id: this.project_id,
          user_id: this.member_user_id
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.ruleForm2.start_date = new Date(obj.data.start_date * 1000);
          }else{
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
    },
    resetForm(formName) {
      this.dialogProtocol = false;
      this.$refs[formName].resetFields();
      this.stationCityList = [];
    },
    getStationList(cb) {
      util.ajax({
        url: "/project/station/get",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          format: 0, //1
        },
        timeout: 10000,
        success: (obj) => {
          // console.log('岗位列表')
          if (obj && obj.errno == 0) {
            // obj.data.forEach((obj) => {
            //  obj.city_id = obj.city_id+''
            //  obj.station_id = obj.station_id+''
            // })

            obj.data.forEach((item) => {
              item.id = item.station_id + item.city_id;
              item.name = item.station_name + "-" + item.city_name;
            });
            this.stationList = obj.data;
            console.log(this.stationList);
            // console.log(this.stationList)
            // this.cityStationList = obj.data
            // console.log(this.stationList)
            if (cb) cb();
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
    },
    getStationList2(cb) {
      util.ajax({
        url: "/project/station/get",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          format: 1,
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
            this.stationList2 = obj.data;
            if (cb) cb();
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
    },
    checkProtocol() {
      //是否有生效合同
      this.loading = true;
      util.ajax({
        url: "/protocol/pre_add",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          to_user_id: this.member_user_id,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.getStationList(() => {
              this.preStation();
            });
            // if(this.stationList2.length){
            //  this.preStation()
            // }else{
            //  this.getStationList2(() => {
            //      this.preStation()
            //  })
            // }
            if(this.is_show_shop) {
              this.getEmployercompanyFun()
            }
          } else {
            this.loading = false;
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning",
            });
          }
        },
        error: (xhr, status) => {
          this.loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
        noNetwork: () => {
          //网络超时
          this.loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
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
    preStation() {
      // if(this.member_info.station_id){
      // console.log(this.member_info)
      // console.log(this.member_info.station_id)
      this.ruleForm2.station_id = this.member_info.station_id;
      this.changeStationFn(this.ruleForm2.station_id);
      // console.log(this.ruleForm2.station_id)
      // }else{
      this.loading = false;
      this.dialogProtocol = true;
      // }
    },
    submitProtocol(formName) {
      //签署合同确认
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let curStation = this.stationList.filter((item) => {
            return item.id == this.ruleForm2.id;
          })[0];
          console.log(curStation);
          // let station_name = curStation.station_name
          // let city_name = curStation.citys.filter((item) => {
          //  return item.city_id == this.ruleForm2.city_id
          // })[0].city_name
          // console.log(station_name)
          // console.log(city_name)
          // return
          let _data = {
            team_id: this.team_id,
            project_id: this.project_id,
            to_user_id: this.member_user_id,
            city_id: curStation.city_id,
            city_name: curStation.city_name,
            station_id: curStation.station_id,
            station_name: curStation.station_name,
            start_date: util.getLocalTime(
              this.ruleForm2.start_date.getTime(),
              "yyyy-MM-dd"
            ),
            end_date: util.getLocalTime(
              this.ruleForm2.end_date.getTime(),
              "yyyy-MM-dd"
            ),
            probation: this.ruleForm2.probation,
            shop_id: this.ruleForm2.store,
            shop_station_id: this.ruleForm2.jobStation,
            wage_day: this.ruleForm2.wage_day || 10,
          };
          console.log(_data);
          util.ajax({
            url: "/protocol/add",
            type: "POST",
            data: _data,
            timeout: 10000,
            success: (obj) => {
              if (obj && obj.errno == 0) {
                this.$message({
                  showClose: true,
                  message: "成功发送，等待员工签订",
                  type: "success",
                });
                this.dialogProtocol = false;
                this.getMemberInfo();
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
        }
      });
    },
    recallProtocol(item) {
      //撤回 合同
      util.ajax({
        url: "/protocol/update",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          protocol_id: item.protocol_id,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.$message({
              showClose: true,
              message: "撤回成功",
              type: "success",
            });
            this.getMemberInfo();
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
    },

    canceldialogResetProtocol() {
      this.dialogResetProtocol = false;
      this.protocol_id = 0
    },
    resetProtocol() {
      util.ajax({
        url: "/protocol/reset",
        type: "POST",
        data: {
          protocol_id: this.protocol_id,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.$message({
              showClose: true,
              message: "操作成功",
              type: "success",
            });
            this.dialogResetProtocol = false;
            this.protocol_id = 0
            this.getMemberInfo();
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
    },
    checkResetProtocol(item) {
      //重置 合同
      util.ajax({
        url: "/protocol/reset_check",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          protocol_id: item.protocol_id,
          doumi_user_id: this.member_info.doumi_user_id,
          user_id: this.member_info.user_id,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.dialogResetProtocol = true;
            this.protocol_id = obj.data.protocol_id
            this.protocol_name = obj.data.protocol_name
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
    },
    // 在职证明下载
    downPdf() {
      if (this.member_info.injob_prove_url == -1) {
        if (this.pdfLoading) {
          console.log('正在下载中~~~')
          return
        }
        this.pdfLoading = true;
        this.$message({
          message: '开始下载，请耐心等待~',
          type: 'info'
        });
        // prove_type	证明类型 1辞职申请书  2兼职工作证明 3离职证明-全职 4在职证明-全职
        let prove_type = null;
        if (this.project_type == 3) {
          prove_type = 4;
        } else {
          prove_type = 2;
        }
        // prove_type = 4;
        let data = {
          team_id: this.team_id,
          project_id: this.project_id,
          user_id: this.member_info.user_id,
          prove_type: prove_type
        };
        util.ajax({
          url: '/group/issue_prove',
          type: 'GET',
          data: data,
          timeout: 10000,
          success: (obj) => {
            console.log('离职证明下载===', obj)
            if (obj && obj.errno == 0) {
              setTimeout(() => {
                let _time = 0;
                this.timer = setInterval(() => {
                  _time++;
                  if (_time > 6) {
                    clearInterval(this.timer)
                  };
                  this.issueProveStatusFun(prove_type);
                }, 1500)
              }, 500)
            } else {
              this.pdfLoading = false;
              this.$message({
                message: `${obj.errmsg}`,
                type: 'error'
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
      } else if (this.member_info.injob_prove_url == -2) {
        this.$message({
          message: '正在生成中',
          type: 'info'
        });
      } else {
        let prove_type;
        if (this.project_type == 3) {
          prove_type = 4;
        } else {
          prove_type = 2;
        }
        const injobUrl = this.member_info.injob_prove_url;
        this.downloadProve(prove_type, injobUrl, 0)
      }
    },
    showFun() {
      let routeData = this.$router.resolve(`/violation?userId=${this.member_user_id}&projectId=${this.project_id}`)
      window.open(routeData.href, '_blank');
    },
    downFun() {
      setTimeout(()=> {
        this.getPdf(this.member_info.real_name + '信用报告')
      }, 500)
    },
    tryAgainFun() {
      this.$confirm('二次查询需要扣除费用，确认查询默认认可费用的扣除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          project_id: this.project_id,
          user_id: this.member_info.user_id,
        };
        util.ajax({
          url: '/project/violation_again/get',
          type: 'GET',
          data: data,
          timeout: 1000 * 10 * 60,
          success: (obj) => {
            if (obj.errno == 0) {
              this.getMemberInfo();
            } else {
              this.$message({
                message: `${obj.errmsg}`,
                type: 'info'
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
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消重新查询'
        });          
      });
      
    },
    // 开具证明结果
    issueProveStatusFun(prove_type) {
      let data = {
        team_id: this.team_id,
        project_id: this.project_id,
        user_id: this.member_info.user_id,
        prove_type: prove_type
      };
      util.ajax({
        url: '/group/issue_prove_status',
        type: 'GET',
        data: data,
        timeout: 1000 * 10 * 60,
        success: (obj) => {
          console.log('开具证明结果obj===', obj);
          if (obj.errno == 0) {
            this.pdfLoading = false;
            clearInterval(this.timer);
            this.$message({
              message: '下载成功',
              type: 'success'
            });
            if (obj.data.prove_url) {
              // window.open(obj.data.prove_url, '_blank');
              this.downloadProve(prove_type, obj.data.prove_url, 0)
            };
          } else {
            this.$message({
              message: `${obj.errmsg}`,
              type: 'info'
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
    // pdf格式下载
    downloadProve(prove_type, prove_url, preview) {
      location.href =
        util.host +
        "/sea/api/1.0/client/v1/group/download_prove?dmclient=pcweb&X-Doumi-Agent=weixinqy&preview="+preview+"&prove_type=" +
        prove_type +
        "&prove_url=" +
        prove_url
    },
    seeProtocol(item) {
      // console.log(this.member_info.protocol_sign)
      window.open(
        util.host +
        "/sea/api/1.0/client/v1/protocol/download?dmclient=pcweb&X-Doumi-Agent=weixinqy&preview=1&protocol_order_id=" +
        item.protocol_order_id +
        "&protocol_sign=" +
        item.protocol_sign
      );
    },
    seeNotification(item) {
      // console.log(this.member_info.protocol_sign)
      window.open(
        util.host +
        "/sea/api/1.0/client/v1/protocol/download?dmclient=pcweb&X-Doumi-Agent=weixinqy&preview=1&protocol_order_id=" +
        item.protocol_order_id +
        "&protocol_sign=" +
        item.protocol_sign
      );
    },
    downloadNotification(item) {
      location.href =
        util.host +
        "/sea/api/1.0/client/v1/protocol/download?dmclient=pcweb&X-Doumi-Agent=weixinqy&preview=0&protocol_order_id=" +
        item.protocol_order_id +
        "&protocol_sign=" +
        item.protocol_sign;
    },
    downloadProtocol(item) {
      location.href =
        util.host +
        "/sea/api/1.0/client/v1/protocol/download?dmclient=pcweb&X-Doumi-Agent=weixinqy&preview=0&protocol_order_id=" +
        item.protocol_order_id +
        "&protocol_sign=" +
        item.protocol_sign;
    },
    resetFormMember(formName) {
      this.idnumberReg = false;
      this.heightReg = false;
      this.weightReg = false;
      // this.$refs[formName].resetFields();
      this.dialogEdit = false;
      // this.pream = 1
      this.selectedOptions = [];
    },
    isOpenCostSettlement() {
      util.ajax({
        url: "/group/check_supplier_cost",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            this.is_open_supplier = obj.data.is_open_supplier;
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
    //修改个人信息按钮
    updateMemberInfo() {
      //获取小组列表
      setTimeout(() => {
        $("#asd").scrollTop(0);
      });
      if (!this.stationList.length) {
        this.getStationList(() => {
          this.dialogEdit = true;
        });
      } else {
        this.dialogEdit = true;
      }
      //检查当前项目是否已经开启供应商费用结算
      this.isOpenCostSettlement();
      // this.getGroupList()
      // this.pream = 22222
      let curr_identity = "";
      let curr_degree = "";
      this.roleArr.forEach((item) => {
        if (this.member_info.identity == item.identity_id) {
          curr_identity = item.identity_id;
        }
      });
      this.degreeArr.forEach((i) => {
        if (i.id == this.member_info.degree) {
          curr_degree = i.name;
        }
      });
      this.ruleForm = {
        user_id: this.member_info.user_id,
        mobile: this.member_info.mobile,
        real_name: this.member_info.real_name,
        group_id: this.member_info.group_id,
        identity: curr_identity ? curr_identity : this.member_info.identity_str,
        birthday:
          this.member_info.birthday && this.member_info.birthday != 0
            ? this.member_info.birthday
            : "",
        gender: this.member_info.gender,
        height:
          this.member_info.height && this.member_info.height != 0
            ? this.member_info.height
            : "",
        weight:
          this.member_info.weight && this.member_info.weight != 0
            ? this.member_info.weight
            : "",
        idnumber: this.member_info.idnumber,
        address: this.member_info.province
          ? this.member_info.province.short_name
          : "",
        datail_address: this.member_info.datail_address || "",
        school: this.member_info.school || "",
        personnel_number: this.member_info.personnel_number || "",
        graduate_date:
          this.member_info.graduate_date && this.member_info.graduate_date != 0
            ? this.member_info.graduate_date
            : "",
        entry_date:
          this.member_info.entry_date && this.member_info.entry_date != 0
            ? this.member_info.entry_date
            : "",
        leave_date:
          this.member_info.leave_date && this.member_info.leave_date != 0
            ? this.member_info.leave_date
            : "",
        degree:
          this.member_info.degree && this.member_info.degree != 0
            ? curr_degree
            : "",
        specialty: this.member_info.specialty || "",
        bank: this.member_info.bank || "",
        bank_info: this.member_info.bank_info || "",
        bank_card_number: this.member_info.bank_card_number || "",
        project_remark: this.member_info.remark,
        real_name_auth: this.member_info.real_name_auth,
        id:
          this.member_info.station_city_id == 0
            ? ""
            : this.member_info.station_id + this.member_info.station_city_id,
        station_value: "" + this.member_info.is_supplier + "",
        is_supplier: this.member_info.is_supplier,
        emergency_contact_person: this.member_info.emergency_contact_person,
        emergency_contact_person_mobile:
          this.member_info.emergency_contact_person_mobile,
      };
      // this.customFields=this.detailCustomFields;
      //初始化动态表单数据
      // this.initCustomFields(this.member_info.form_list);
      // console.log(this.ruleForm)
      if (this.member_info.province_id) {
        this.selectedOptions.push(this.member_info.province_id);
        this.selectedOptions.push(this.member_info.city_id);
        this.selectedOptions.push(this.member_info.district_id);
      }
      // this.disabled_group = true
    },
    changeStationCityFn(value) {
      this.stationList.forEach((i) => {
        if (i.id == value) {
          this.ruleForm.stationid = i.station_id;
          this.ruleForm.station_city_id = i.city_id;
        }
      });
    },
    //提交按钮--确认修改
    submitFormMember(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let _data = "";
          let _url = "";
          let curr_identity_id = "";
          let gender_id = "";
          let degree_id = "";
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
            this.degreeArr.forEach((i) => {
              if (this.ruleForm.degree == i.name) {
                degree_id = i.id;
              }
            });
          } else {
            degree_id = this.ruleForm.degree;
          }
          if (!this.ruleForm.stationid) {
            this.changeStationCityFn(this.ruleForm.id);
          }

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
            remark: this.ruleForm.project_remark,
            station_id: this.ruleForm.stationid ? this.ruleForm.stationid : "",
            station_name: "",
            station_city_id: this.ruleForm.station_city_id
              ? this.ruleForm.station_city_id
              : "",
            is_supplier: this.ruleForm.station_value,
            emergency_contact_person: this.ruleForm.emergency_contact_person,
            emergency_contact_person_mobile:
              this.ruleForm.emergency_contact_person_mobile,
          };
          _data.form_list=JSON.stringify(this.submitCustomFields)
          this.stationList.forEach((obj) => {
            if (
              obj.id ==
              this.ruleForm.stationid + this.ruleForm.station_city_id
            ) {
              _data.station_name = obj.station_name;
            }
          });
          console.log(_data);
          console.log('vbvbvbvbvb>>>>>>>',this.submitCustomFields);
          // return
          util.ajax({
            url: _url,
            type: "POST",
            data: _data,
            timeout: 10000,
            success: (obj) => {
              if (obj && obj.errno == 0) {
                this.dialogEdit = false;
                // this.$message({
                //     showClose: true,
                //     message: '保存成功',
                //     type: 'success'
                // });
                this.getMemberInfo();
                this.getGroupList();
                console.log("修改成功返回group_id----" + obj.data.group_id);
                if (this.ruleForm.station_value == 1) {
                  this.dialogInvit = true;
                  this.getCodeLink("edit", obj.data.group_id);
                }
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
    //我的证件
    editMyDriverLicenses(type){
      if(type=='open'){
        let {driver_license_no,license_plate_no,vehicle_owner,other_license_no}=this.member_info;
        this.myDriverLicensesData={
          driver_license_no,
          license_plate_no,
          vehicle_owner,
          other_license_no,
        }
      }else{
        this.clearMyDriverLicenses();
      }
      this.toggleDialogCustomField('dialogMyDriverLicenses');
    },
    submitMyDriverLicenses(){
      this.validityMyDriverLicenses().then(()=>{
        let team_id=util.getLocalStorage('projectStorageInfo').team_id;
        let project_id=util.getLocalStorage('projectStorageInfo').project_id;
        let user_id=this.member_info.user_id;
        let params={
          team_id,
          project_id,
          user_id,
          ...this.myDriverLicensesData
        };
        console.log('paramsparamsparams',params);
        util.ajax({
          url: '/group/member_edit_driverlicense',
          type: 'POST',
          data: params,
          timeout: 10000,
          success: (obj) => {
            if (obj && obj.errno == 0) {
              this.$message({
                showClose: true,
                message: "修改成功",
                type: 'warning'
              });
              this.clearMyDriverLicenses();
              this.toggleDialogCustomField('dialogMyDriverLicenses');
              this.getMemberInfo();
            }
          },
          error: (xhr, status) => {
          },
          noNetwork: () => {
          }
        })
      }).catch(()=>{
        this.$message({
          showClose: true,
          message: "请填写相关证件号码",
          type: 'warning'
        });
      })
    },
    //清空自定义信息
    clearMyDriverLicenses(){
      for(let key in this.myDriverLicensesData){
        if(this.myDriverLicensesData[key]){
          this.myDriverLicensesData[key]=""
        }
      }
    },
    //校验我的证件是否填写
    validityMyDriverLicenses(){
      return new Promise((reslove,reject)=>{
        for(let key in this.myDriverLicensesData){
          this.myDriverLicensesData[key]=this.myDriverLicensesData[key].replace(/\s*/g,"");
          if(this.myDriverLicensesData[key]){
            reslove()
            return
          }
        }
        reject();
      })
    },
    //关闭/打开自定义信息弹框
    toggleDialogCustomField(dialogName){
      this[dialogName] = !this[dialogName];
    },
    //获取小组列表
    getGroupList() {
      util.ajax({
        url: "/group/select_list",
        type: "GET",
        data: {
          group_id: 0,
          team_id: this.team_id,
          project_id: this.project_id,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          if (obj && obj.errno == 0) {
            let cacheGroupList = obj.data;
            let group = new GroupUtil(cacheGroupList);
            this.allGroupList = group.formatGroup(group.group); //所有小组，不分结构
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
          
          if (obj && obj.errno == 0) {
            // debugger
            //获取动态表单列表
            if(obj.data.length==0){
              this.submitCustomFields=[];
              this.customFields=[];
              return;
            }
            this.customFields=obj.data.filter(v=>{
              return v.type=='SingleText'||v.type=='Imageview' 
            });
            if(this.detailCustomFields.length>0){
              this.customFields.map((v,i)=>{
                let o=this.detailCustomFields.find((e,index)=>{
                  return e.field==v.field;
                });
                if(o){
                  v.info.value=o.info.value;
                }
                return v;
              })
            }
            console.log('jsjjsjsj____',this.customFields)
            //初始化动态表单数据
            this.initCustomFields(this.customFields);
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
    //获取角色列表
    getRoleList() {
      util.ajax({
        url: "/group/select_identity_list",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
        },
        timeout: 10000,
        success: (obj) => {
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
    //预览
    preview(url){
      console.log('urlll',url);
      var regs = 'https://cdn.doumistatic.com/';
      var reg = RegExp(regs);
      if(url.match(reg)){
        window.open('https://cdn.doumistatic.com/' + url, '_blank');
        return  
      }
      // return
      // this.$hevueImgPreview(url)
      window.open('//image-inner.doumi.com/' + url, '_blank');
    },
    //获取地区列表
    getAddressListData() {
      util.ajax({
        url: "/common/geography/get",
        type: "GET",
        data: {
          team_id: 0,
          project_id: 0,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(JSON.stringify(obj))
          if (obj && obj.errno == 0) {
            this.options = obj.data;
            this.options.forEach((prov) => {
              prov.label = prov.short_name;
              delete prov.short_name;
              prov.value = prov.province_id;
              delete prov.province_id;
              prov.children = prov.child;
              delete prov.child;
              prov.children.forEach((city) => {
                city.label = city.short_name;
                delete city.short_name;
                city.value = city.city_id;
                delete city.city_id;
                city.children = city.child;
                delete city.child;
                city.children.forEach((distr) => {
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
              type: "warning",
            });
          }
        },
        error: (xhr, status) => { },
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
    showDialogRefund(){
      this.dialogRefund = true;
    },
    cancelRefund(){
      this.dialogRefund= false;
    },
    //退薪
    refundFrozenBalance() {
      this.loading = true;
      util.ajax({
        url: "/wage/frozen_balance/refund",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          user_id: this.member_user_id,
        },
        timeout: 10000,
        success: (obj) => {
          if (obj && obj.errno == 0) {
              this.member_info.refund_status = true;
              this.dialogRefund= false;
              this.$message({
                showClose: true,
                message: "操作成功",
                type: "success",
              });
              this.getMemberInfo();
          } else {
            this.$message({
              showClose: true,
              message: obj.errmsg,
              type: "warning",
            });
          }
          this.loading = false;
        },
        error: (xhr, status) => {
          this.loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
        noNetwork: () => {
          //网络超时
          this.loading = false;
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    getIsNxProject() {
      setTimeout(()=> {
        this.is_nx_project = JSON.parse(window.localStorage.getItem('isNxProject'));
        console.log('this.is_nx_project===', this.is_nx_project)
      }, 800)
    }
  },
  mounted() {
    this.init();
    this.getIsNxProject();
  },
  watch: {
    '$route' (to, from) {
      // 对路由变化作出响应...
      this.init()
      this.getIsNxProject();
    },
    "ruleForm.group_id"(){
      console.log('changeeeee');
      this.getCustomFields(this.ruleForm.group_id)
    },
  }
};
</script>
<style>
.memberinfo .protocol_dialog .el-dialog,
.memberinfo .leave_dialog .el-dialog {
  width: 420px;
}

.memberinfo .reset_protocol_dialog .el-dialog {
  width: 550px;
}

.memberinfo .reset_protocol_dialog .tips {
  font-size: 20px;
}

.memberinfo .refund_dialog .el-dialog {
  width: 420px;
  height: 220px;
}

.memberinfo .dialog-addmember .error_idnumber .el-input__inner {
  border-color: #ff6600;
}

.memberinfo .dialog-addmember .error_idnumber_text {
  color: #ff6600;
  display: block;
}

.memberinfo .el-dialog--tiny {
  width: 420px;
}

.memberinfo .mystatus input {
  border-radius: 2px !important;
  cursor: pointer;
}

.memberinfo .mystatus .el-input__inner:hover {
  border: 1px solid #c0ccda;
}

.memberinfo .mystatus .el-input__inner:focus {
  border: 1px solid #6699ee;
}

.memberinfo .myform .el-select {
  width: 100%;
  /*margin-bottom: 24px;*/
}

/* 弹窗————添加人员 */
.memberinfo .dialog-addmember .myform {
  width: 381px;
  height: 330px;
  padding: 5px 40px 5px 0;
  overflow-y: auto;
  box-sizing: border-box;
}

.memberinfo .dialog-addmember .myformAdd {
  width: 100%;
  height: 450px;
  overflow-y: auto;
  box-sizing: border-box;
}

.memberinfo .dialog-addmember .el-dialog__body {
  padding: 27px 40px 0px 38px;
}

.memberinfo .dialog-addmember .el-form-item__label {
  text-align: left;
}

.memberinfo .dialog-addmember .el-form-item {
  margin-bottom: 16px;
  width: 342px;
}

.memberinfo .dialog-addmember .myformAdd{
  width:100%;
  height: 450px;
  overflow-y: auto;
  box-sizing: border-box;
}
.memberinfo .dialog-addmember .myformAdd .el-form-item{
  width:100%;
}

.memberinfo .dialog-addmember .myform .el-select {
  margin-bottom: 0px;
}

.memberinfo .dialog-addmember .gender .el-form-item__label {
  padding-left: 15px;
}

.memberinfo .dialog-addmember .IDNumber .el-form-item__label {
  padding-left: 13px;
}

.memberinfo .dialog-addmember .bankUserName .el-form-item__label {
  padding-left: 13px;
  line-height: 17px;
  margin-top: -10px;
}

.memberinfo .dialog-addmember .desc {
  margin-bottom: 0;
}

.memberinfo .dialog-addmember .size-num {
  float: right;
  font-size: 12px;
  color: #99a9bf;
  margin: -5px 0 14px 0;
}

.memberinfo .dialog-addmember .el-textarea__inner {
  border-radius: 2px;
  height: 116px;
  border: 1px solid #e0e6ed;
}

.memberinfo .dialog-addmember .desc .el-form-item__label {
  padding-left: 13px;
  margin-top: 0px !important;
}

.memberinfo .dialog-addmember .el-dialog__footer {
  border-top: 1px solid #e0e6ed;
  padding: 16px 20px 16px 0;
}

.memberinfo .dialog-addmember .error_idnumber .el-input__inner {
  border-color: #ff6600;
}

.memberinfo .dialog-addmember .error_idnumber_text {
  color: #ff6600;
  display: block;
  height: 18px;
  margin-top: -8px;
  font-size: 12px;
}

.el-year-table td.current:not(.disabled) .cell {
  background-color: #6699ee !important;
}

.memberinfo .dialog-addmember .my-address .el-input__icon {
  font-size: 12px;
}

.memberinfo .dialog-addmember .my-address .el-cascader__label {
  border: 1px solid #e0e6ed;
  border-radius: 2px;
}

.memberinfo .dialog-addmember .my-address .el-cascader__label:hover {
  border: 1px solid #c0ccda;
  border-radius: 2px;
}

.memberinfo .dialog-addmember .my-address .el-cascader__label:focus {
  border: 1px solid #6699ee;
}

.memberinfo .dialog-addmember .my-address .el-cascader__label:active {
  border: 1px solid #6699ee;
  border-radius: 2px;
}

.el-cascader-menu__item.is-active {
  background-color: #6699ee;
}

.el-cascader-menu__item:hover {
  background-color: #f5f5f5;
}

.memberinfo .el-form-item.is-required .el-form-item__label {
  position: relative;
  padding-left: 15px;
}

.memberinfo .el-form-item.is-required .el-form-item__label:before {
  /*content: "*";*/
  display: block;
  width: 7px;
  height: 7px;
  background: url(../assets/imgs/x_icon.svg) no-repeat center left;
  color: #ffaa00;
  position: absolute;
  left: 0px;
  top: 14px;
}

.memberinfo .leave_dialog .el-radio-button__inner {
  border-radius: 2px;
  border-left: none;
  border: 1px solid #bfcbd9;
}

.memberinfo
  .leave_dialog
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  box-shadow: none;
}

.memberinfo .leave_dialog .my-margin {
  margin: 0 15.5px !important;
}

.memberinfo .leave_dialog .my-radio-button {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.memberinfo {
  padding: 0 20px;
}

.memberinfo .memberinfo_top {
  height: 50px;
  border-bottom: 1px solid #e0e6ed;
}

.memberinfo .memberinfo1 {
  /*height: 60px;*/
  padding: 32px 0;
  border-bottom: 1px solid #e0e6ed;
}

.memberinfo .memberinfo1:after {
  content: '';
  display: block;
  clear: both;
}

.memberinfo .memberinfo1 .left {
  float: left;
}

.memberinfo .memberinfo1 .right {
  float: right;
}

.memberinfo .memberinfo1 .logo {
  float: left;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-image: url(../assets/imgs/avatar.png);
  background-size: contain;
  background-position: center;
  margin-right: 16px;
}

.memberinfo .memberinfo1 .info {
  float: left;
}

.memberinfo .memberinfo1 .info .info1 {
  height: 25px;
  margin: 4px 0 8px;
}

.memberinfo .memberinfo1 .info .info1 > span {
  float: left;
}

.memberinfo .memberinfo1 .info .info1 .name {
  font-family: 'PingFangSC-Semibold';
  font-size: 18px;
  color: #475669;
  line-height: 25px;
  margin-right: 16px;
}

.memberinfo .memberinfo1 .info .info1 .flog {
  border: 1px solid #e0e6ed;
  border-radius: 4px;
  font-family: 'PingFangSC-Regular';
  font-size: 12px;
  color: #5e6d82;
  padding: 4px 7px;
  margin: 2px 8px 1px 0;
}

.memberinfo .memberinfo1 .info .info1 .phone {
  text-indent: 20px;
  line-height: 26px;
  font-family: 'SFProText-Regular';
  font-size: 14px;
  color: #5e6d82;
  background: url(../assets/imgs/phone.svg) no-repeat 8px center;
}

.memberinfo .memberinfo1 .info .info2 .job {
  font-family: 'PingFangSC-Regular';
  font-size: 14px;
  color: #5e6d82;
  margin-right: 15px;
  line-height: 20px;
}

.memberinfo .memberinfo1 .member_btns {
  float: right;
  height: 32px;
  padding: 14px 0;
  margin-right: 10px;
}

.memberinfo .sign_tip_item {
  color: red;
  cursor: pointer;
}
.memberinfo .memberinfo2 .section .s_item .item_right .sign_tip_item {
  color: red;
  cursor: pointer;
}
.sign_tip_div {
  font-size: 14px;
  line-height: 18px;
}
.memberinfo .memberinfo1 .member_btns .el-button--primary {
  width: 88px;
  height: 32px;
  line-height: 0px;
}

.memberinfo .memberinfo2 {
  padding-bottom: 6px;
}

.memberinfo .memberinfo2 .section {
  margin-top: 32px;
}

.memberinfo .memberinfo2 .section .s_title {
  font-family: 'PingFang-SC-Bold';
  font-size: 16px;
  color: #475669;
  line-height: 22px;
  margin-bottom: 25px;
}

.memberinfo .memberinfo2 .section .s_item {
  display: flex;
  margin-bottom: 16px;
}

.memberinfo .memberinfo2 .section .s_item .item_left {
  /*width:49px;*/
  width: 54px;
  padding-right: 15px;
  font-family: 'PingFangSC-Regular';
  font-size: 12px;
  color: #475669;
  line-height: 20px;
}

.item_dubble {
  margin-left: -500px;
}

.memberinfo .memberinfo2 .section .s_item .item_right {
  flex: 1;
  font-family: 'PingFangSC-Regular';
  font-size: 14px;
  color: #1f2d3d;
  line-height: 20px;
}

.memberinfo .memberinfo2 .section .s_item .item_right > span {
  display: inline-block;
  font-family: 'PingFangSC-Regular';
  font-size: 13px;
  color: #6699ee;
  line-height: 20px;
  text-indent: 22px;
  cursor: pointer;
  margin-left: 12px;
}

.memberinfo .memberinfo2 .section .s_item .item_right > span.icon1 {
  background: url(../assets/imgs/recall.svg) left center no-repeat;
}

.memberinfo .memberinfo2 .section .s_item .item_right > span.icon2 {
  background: url(../assets/imgs/see.svg) left center no-repeat;
}
.pleft {
  padding-left: 22px;
}

.memberinfo .memberinfo2 .section .s_item .item_right > span.icon3 {
  text-indent: 22px;
  background: url(../assets/imgs/xiazai.svg) 1px center no-repeat;
}

.memberinfo .memberinfo2 .section .s_item .item_right > span.icon4 {
  text-indent: 22px;
  background: url(../assets/imgs/reset.svg) 1px center no-repeat;
}

.memberinfo .memberinfo2 .section .s_item .item_right > span.icon5 {
  text-indent: 22px;
  background: url(../assets/imgs/reset2.svg) 1px center no-repeat;
}

.memberinfo .memberinfo2 .section .s_item .item_right > span:active {
  color: #517ed6;
}

.memberinfo .reset_protocol_dialog .dialog_main,
.memberinfo .refund_dialog .dialog_main,
.memberinfo .leave_dialog .dialog_main {
  padding: 30px 40px;
}

.memberinfo .protocol_dialog .dialog_foot,
.memberinfo .reset_protocol_dialog .dialog_foot,
.memberinfo .refund_dialog .dialog_foot,
.memberinfo .leave_dialog .dialog_foot {
  height: 68px;
}

.memberinfo .protocol_dialog .dialog_foot .btns,
.memberinfo .reset_protocol_dialog .dialog_foot .btns,
.memberinfo .refund_dialog .dialog_foot .btns,
.memberinfo .leave_dialog .dialog_foot .btns {
  float: right;
  margin: 16px 20px;
}

.memberinfo .protocol_dialog .dialog_main .leave_item,
.memberinfo .reset_protocol_dialog .dialog_main .leave_item,
.memberinfo .refund_dialog .dialog_main .leave_item,
.memberinfo .leave_dialog .dialog_main .leave_item {
  height: 36px;
  margin-bottom: 16px;
}

.memberinfo .protocol_dialog .dialog_main .leave_item .item_left,
.memberinfo .leave_dialog .dialog_main .leave_item .item_left {
  float: left;
  font-family: 'PingFangSC-Regular';
  font-size: 14px;
  color: #475669;
  line-height: 36px;
  padding-right: 16px;
}


.memberinfo .reset_protocol_dialog .dialog_main .leave_item .item_left,
.memberinfo .refund_dialog .dialog_main .leave_item .item_left {
  float: left;
  font-family: 'PingFangSC-Regular';
  font-size: 15px;
  color: #475669;
  line-height: 36px;
  padding-right: 16px;
}

.memberinfo .protocol_dialog .dialog_main .leave_item .item_right,
.memberinfo .reset_protocol_dialog .dialog_main .leave_item .item_right,
.memberinfo .refund_dialog .dialog_main .leave_item .item_right,
.memberinfo .leave_dialog .dialog_main .leave_item .item_right {
  float: left;
  height: 36px;
}

/* 添加成员——生成二维码 */
.memberinfo .dialog-invit .el-dialog--tiny {
  width: 470px;
}

.memberinfo .dialog-invit .el-dialog__body {
  padding: 30px 40px 50px 40px;
}

.memberinfo .dialog-invit .el-form-item {
  margin-left: 2px;
}

.memberinfo .dialog-invit h3 {
  font-size: 14px;
  line-height: 1.14;
  color: #1f2d3d;
  text-align: center;
  margin-bottom: 8px;
}

.memberinfo .dialog-invit .ewm {
  width: 225px;
  height: 200px;
  margin: 0 auto;
  /*margin-bottom: 32px;*/
}

.memberinfo .dialog-invit .ewm dl dt {
  width: 160px;
  height: 160px;
  background: #eeeeee;
  margin: 0 auto;
  margin-bottom: 8px;
}

.memberinfo .dialog-invit .ewm dl dt #canvas {
  width: 160px !important;
  height: 160px !important;
}

.memberinfo .dialog-invit .ewm dl dd {
  font-size: 13px;
  line-height: 1.23;
  color: #8492a6;
  text-align: center;
}
/* 我的证件 */
.my_driver_license .img-list{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
}
.my_driver_license .driver_edit{
  color:#6699ee;
  cursor: pointer;
  display:inline-block;
  font-size:14px;
}
.my_driver_license .img-con{
  display:block;
  margin-right:10px;
  margin-bottom:10px;
}
.my_driver_license .img-warp{
  width:220px;
  height:120px;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
}
.my_driver_license .img-warp img{
  display: block;
  max-width: 100%;
  max-height: 100%;

}
.my_driver_license .img-con .img-text{
  text-align:center;
  font-size: 12px;
  color: #475669;
  line-height: 20px;
}
.my_driver_license .add_img{
  box-sizing: border-box;
  text-align:center;
  cursor: pointer;
}
.my_driver_license .add_img label{
	color:#6699ee;
  cursor: pointer;
}

.my_driver_license .add_img input{
	width:0;
	height:0;
	opacity: 0;
  cursor: pointer;
}

</style>