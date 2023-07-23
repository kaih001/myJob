<template>
  <div class="" id="insuranceM">
    <div class="insuranceMer">
      <div class="head-titledo">
        <h2>用工保险</h2>
      </div>
      <div class="insuranceMain">
        <div class="insurancebanner">
          <div class="insuranceBg"></div>
          <div class="termsanchor">
            <div class="termcenter">
              <!-- <a href="javascript:;" @click="showainsuranceterms = true">查看详细保障赔付条款</a>
                <a href="javascript:;" @click="showainsuranceterms = true">投保须知</a>-->
              <div class="termcenter-numbers">
                {{ insurance_source_connect }}
              </div>
            </div>
          </div>
          <div class="insuranceBerImg">
            <img
              src="../assets/imgs/insurance/insurance_banner2.svg"
              height="258"
              width="784"
            />
          </div>
        </div>
        <div class="insuranceCent">
          <div class="Cent_head">
            <div class="head_main">
              <div class="head_mainw">
                <h2 class="head_mainct">保险<br />方案</h2>
                <div class="head_mainset head_mainct">
                  <div class="mainset_title">
                    <h4>{{ insurance_planname }}</h4>
                    <span @click="ckeditplan">修改</span>
                    <template v-if="insurance_planname">
                      <a
                        href="javascript:;"
                        style="color: #475669; font-size: 12px"
                        v-if="num == -1"
                        >（不限量）</a
                      >
                      <a
                        href="javascript:;"
                        style="color: #475669; font-size: 12px"
                        v-else
                        >（剩余{{ num }}人天）</a
                      >
                    </template>
                  </div>
                  <p>{{ insurance_planinfo }}</p>
                </div>
              </div>
            </div>
            <div class="head_main">
              <div class="head_mainw">
                <h2 class="head_mainct">自动<br />投保</h2>
                <div class="head_mainset head_mainct">
                  <el-switch
                    v-model="insurance_autostatus"
                    active-color="#6699ee"
                    inactive-color="#c0ccda"
                    on-text="开"
                    on-color="#6097e4"
                    off-color="#c0ccda"
                    off-text="关"
                    :disabled="false"
                    @change="switchchange"
                    on-value="1"
                    off-value="0"
                  >
                  </el-switch>
                  <p>考勤签到或上报位置后，自动购买当日保险</p>
                </div>
              </div>
            </div>
          </div>
          <div class="insurance_block" v-if="show_insurance_block">
            <div class="block_main add_member">
              <h3>添加投保人</h3>
              <p class="set_memberinfo">
                可通过手动添加或批量扫描二维码添加两种方式添加投保人
              </p>
              <div class="block_set">
                <p @click="ckaddmer"><i class="add_icon"></i>手动添加</p>
                <p class="all_add" @click="ckalladdmer" :class="[insurance_source == '3'?'notClick':'']">
                  <i class="all_add_icon"></i>批量邀请
                </p>
                <p class="all_add" @click="batchAdd">
                  <i class="all_add_icon"></i>批量添加
                </p>
                <p class="all_add" @click="mbImport">
                  <i class="import-icon"></i>批量导入
                </p>
              </div>
            </div>

            <div class="block_main">
              <h3>投保人管理</h3>
              <p class="set_memberinfo">可修改投保日期或删除人员</p>
              <div class="block_set">
                <p @click="ckgotoM"><i class="view_icon"></i>查看人员</p>
              </div>
            </div>
            <div class="block_main">
              <h3>保单统计</h3>
              <p class="set_memberinfo">可查看每日的投保成功与失败明细</p>
              <div class="block_set">
                <p @click="ckgotoS"><i class="statistical_icon"></i>查看统计</p>
              </div>
            </div>
          </div>

          <div class="block_main source_tips" v-if="show_insurance_tips">
            <h3 style="text-align: center;">未关联CRM评估单无法获取投保人，请在CRM评估单绑定项目。</h3>
          </div>


        </div>
      </div>
      <div class="edit_insurance_plan"></div>
      <!-- 弹窗————条款 -->
      <div class="export-dialog insurance-terms">
        <el-dialog
          title="投保须知"
          :visible.sync="showainsuranceterms"
          @close="showainsuranceterms = false"
          size="tiny"
        >
          <div class="radio_plan">
            <div class="insurancecontent">
              <div class="item">
                <h2>一、基本信息</h2>
                <ul class="list_1">
                  <p class="p1">
                    1.1
                    本产品为团体意外险，报备文件编号为太保（备案）[2009]N82号，由中国太平洋财产保险股份有限公司承保。
                  </p>
                </ul>
                <ul class="list_1">
                  <p class="p1">
                    1.2 本产品面向中华人民共和国大陆，不包含港、澳、台地区。
                  </p>
                </ul>
                <ul class="list_1">
                  <p class="p1">
                    1.3
                    本产品所称被保险人，是指与您企业存在劳动关系（包括事实劳动关系）的各种用工形式、各种用工期限的劳动者及其它按国家规定和法定途径审批的劳动者，如没有劳动合同，可用工资打款凭证/劳务合同/考勤记录等能够证明其事实劳动关系证明替代。
                  </p>
                </ul>
              </div>
              <div class="item">
                <h2>二、赔付标准：</h2>
                <ul class="list_1">
                  <p class="p1">
                    2.1 投保年龄：16周岁（含16周岁）至65周岁（含65周岁）
                  </p>
                </ul>
                <ul class="list_1">
                  <p class="p1">2.2 保险范围：</p>
                  <li>意外死亡、伤残：行业10级伤残，最高赔付300000</li>
                  <li>
                    意外医疗：仅限意外医疗，免赔100元后100%，最高赔付30000元
                  </li>
                  <li>附加住院津贴 最多赔付10天，每天50元</li>
                  <li>
                    <b>备注：</b
                    >意外医疗免赔100元后100%指的是：意外医疗每次扣除100元免赔额后，按100%的比例给付意外医疗保险金。
                  </li>
                  <li>
                    伤残等级及赔付比例：人身保险伤残程度划分为一至十级，最重为第一级，最轻为第十级。
                  </li>
                  <li>
                    与人身保险伤残程度等级相对应的保险金给付比例分为十档，伤残程度第一级对应的保险金给付比例为100%，伤残程度第十级对应的保险金给付比例为10%，每级相差10%。
                  </li>
                </ul>
                <ul class="list_1">
                  <p class="p1">2.3 保险期限</p>
                  <li>
                    当日0时至24时，仅承保工作期间内（包括上下班途中）的保险责任。
                  </li>
                </ul>
                <ul class="list_1">
                  <p class="p1">2.4 发生下列情况之一时，灵工保自动终止:</p>
                  <li>套餐使用完毕，未购买或者账户余额不足时；</li>
                  <li>因其他所列条款或者保单上约定的情况而终止。</li>
                </ul>
              </div>
              <div class="item">
                <h2>三、保险责任</h2>
                <ul class="list_1">
                  <p class="p1">
                    在保障期内，您的投保员工遭受意外伤害的，按下列约定给付保险金。其中，意外伤害指以外来的、突发的、非本意的和非疾病的客观事件为直接且单独的原因致使身体受到的伤害。
                  </p>
                </ul>
                <ul class="list_1">
                  <p class="p1">3.1 人身意外伤害保险条款</p>
                  <li>
                    在本保险合同的保险期间内，在特别约定中约定的场景下，被保险人遭受意外伤害，保险人按下列约定给付保险金。
                  </li>
                  <li>
                    本保险合同所称意外伤害，指以外来的、突发的、非故意的和非疾病的客观事件为直接且单独的原因致使被保险人身体受到的伤害。
                  </li>
                </ul>
                <ul class="list_1">
                  <p class="p1">3.2 身故保险责任</p>
                  <li>
                    被保险人自意外伤害发生之日起180日内以该次意外伤害为直接原因身故的，保险人按保险单所载该被保险人意外伤害保险金额给付身故保险金。
                  </li>
                  <li>
                    被保险人因遭受意外伤害事故且自该事故发生日起下落不明，后经中华人民共和国法院宣告死亡的，保险人按保险金额给付身故保险金。但若被保险人被宣告死亡后生还的，保险金申请人应于知道或应当知道被保险人生还后30日内退还保险人给付的身故保险金。
                  </li>
                  <li>
                    被保险人身故或被宣告死亡前保险人已给付本条款约定的残疾保险金的，身故保险金应扣除已给付的残疾保险金。
                  </li>
                </ul>
                <ul class="list_1">
                  <p class="p1">3.3 残疾保险责任:</p>
                  <li>
                    被保险人自意外伤害发生之日起180日内以该次意外伤害为直接原因致本保险合同所附《人身保险伤残评定标准》（中保协发〔2013〕88号）所列残疾之一的，保险人按本保险合同所载的该被保险人意外伤害保险金额及该项残疾所对应的给付比例给付残疾保险金。如自意外伤害发生之日起第180日时治疗仍未结束，按第180日的身体情况进行鉴定，并据此给付残疾保险金。如被保险人的残疾程度不在所附《人身保险伤残评定标准》之列，保险人不承担给付残疾保险金责任。
                  </li>
                  <li>
                    当同一保险事故造成两处或两处以上伤残时，应首先对各处伤残程度分别进行评定，如果几处伤残等级不同，以最重的伤残等级作为最终的评定结论；如果两处或两处以上伤残等级相同，伤残等级在原评定基础上最多晋升一级，最高晋升至第一级。同一部位和性质的伤残，不应采用该标准条文两条以上或者同一条文两次以上进行评定。
                  </li>
                  <li>
                    对于不同保险事故造成的伤残，本次保险事故导致的伤残合并前次伤残可领较严重等级伤残保险金者，按较严重等级标准给付，但前次已给付的伤残保险金（投保前已患或因责任免除事项所致附件所列的伤残视为已给付伤残保险金）应予以扣除。
                  </li>
                  <li>
                    保险人对被保险人所负身故、残疾保险金给付责任以保险单所载被保险人的意外伤害保险金额为限，一次或累计给付的保险金达到意外伤害保险金额时，保险人对被
                    保险人的保险责任终止。
                  </li>
                </ul>
                <!-- <div class="item_2">
                          <h3>人身意外伤害保险条款</h3>
                          <p class="p2">在本保险合同的保险期间内，在特别约定中约定的场景下，被保险人遭受意外伤害，保险人按下列约定给付保险金。</p>
                          <p class="p2">本保险合同所称意外伤害，指以外来的、突发的、非故意的和非疾病的客观事件为直接且单独的原因致使被保险人身体受到的伤害。</p>
                      </div>
                      <div class="item_2">
                          <h3>身故保险责任</h3>
                          <p class="p2">被保险人自意外伤害发生之日起180日内以该次意外伤害为直接原因身故的，保险人按保险单所载该被保险人意外伤害保险金额给付身故保险金。</p>
                          <p class="p2">被保险人因遭受意外伤害事故且自该事故发生日起下落不明，后经中华人民共和国法院宣告死亡的，保险人按保险金额给付身故保险金。但若被保险人被宣告死亡后生还的，保险金申请人应于知道或应当知道被保险人生还后30日内退还保险人给付的身故保险金。</p>
                          <p class="p2">被保险人身故或被宣告死亡前保险人已给付本条款约定的残疾保险金的，身故保险金应扣除已给付的残疾保险金。</p>
                      </div>
                      <div class="item_2">
                          <h3>残疾保险责任</h3>
                          <p class="p2">被保险人自意外伤害发生之日起180日内以该次意外伤害为直接原因致本保险合同所附《人身保险伤残评定标准》（中保协发〔2013〕88号）所列残疾之一的，保险人按本保险合同所载的该被保险人意外伤害保险金额及该项残疾所对应的给付比例给付残疾保险金。如自意外伤害发生之日起第180日时治疗仍未结束，按第180日的身体情况进行鉴定，并据此给付残疾保险金。如被保险人的残疾程度不在所附《人身保险伤残评定标准》之列，保险人不承担给付残疾保险金责任。</p>
                          <p class="p2">当同一保险事故造成两处或两处以上伤残时，应首先对各处伤残程度分别进行评定，如果几处伤残等级不同，以最重的伤残等级作为最终的评定结论；如果两处或两处以上伤残等级相同，伤残等级在原评定基础上最多晋升一级，最高晋升至第一级。同一部位和性质的伤残，不应采用该标准条文两条以上或者同一条文两次以上进行评定。</p>
                          <p class="p2">对于不同保险事故造成的伤残，本次保险事故导致的伤残合并前次伤残可领较严重等级伤残保险金者，按较严重等级标准给付，但前次已给付的伤残保险金（投保前已患或因责任免除事项所致附件所列的伤残视为已给付伤残保险金）应予以扣除。</p>
                      </div>
                      <div class="item_2">
                          <h3>保险人对被保险人所负身故、残疾保险金给付责任以保险单所载被保险人的意外伤害保险金额为限，一次或累计给付的保险金达到意外伤害保险金额时，保险人对被 保险人的保险责任终止。</h3>
                      </div> -->
              </div>
              <div class="item">
                <h2>四、责任免除</h2>
                <ul class="list_1">
                  <p class="p1">
                    4.1
                    因下列原因之一，直接或间接造成被保险人身故、残疾的，保险人不负任何给付保险金责任：
                  </p>
                  <li>对被保险人的故意杀害或伤害；</li>
                  <li>
                    被保险人自致伤害或自杀，但被保险人自杀时为无民
                    事行为能力人的除外；
                  </li>
                  <li>
                    因被保险人挑衅或故意行为而导致的打斗、被袭击或被谋杀；
                  </li>
                  <li>被保险人违法、犯罪或者抗拒依法采取的刑事强制措施；</li>
                  <li>
                    被保险人因疾病导致的伤害，包括但不限于猝死、食物中毒、高原反应、中暑、病毒和细菌感染（意外伤害导致的伤口感染不在此限）；
                  </li>
                  <li>
                    被保险人因妊娠、流产、分娩导致的伤害，但意外伤害所致的流产或分娩不在此限；
                  </li>
                  <li>
                    被保险人因药物过敏、整容手术、内外科手术或其他医疗行为导致的伤害；
                  </li>
                  <li>被保险人未遵医嘱私自服用、涂用、注射药物；</li>
                  <li>
                    被保险人因意外伤害、自然灾害事故以外的原因失踪而被法院宣告死亡的；
                  </li>
                  <li>
                    被保险人从事高风险运动、参加任何职业或半职业体育运动期间；
                  </li>
                  <li>被保险人不遵守机动车辆安全驾驶或乘坐的规定；</li>
                  <li>
                    任何生物、化学、原子能武器，原子能或核能装置所造成的爆炸、灼伤、污染或辐射；
                  </li>
                  <li>恐怖袭击。</li>
                </ul>
                <ul class="list_1">
                  <p class="p1">
                    4.2
                    下列任一情形下，保险人对被保险人身故、残疾不负任何给付保险金责任：
                  </p>
                  <li>被保险人精神失常或精神错乱期间</li>
                  <li>战争、军事行动、暴动或武装叛乱期间；</li>
                  <li>被保险人醉酒或受毒品、管制药物的影响期间；</li>
                  <li>
                    被保险人酒后驾车、无有效驾驶证驾驶或驾驶无有
                    效行驶证的机动车期间。
                  </li>
                </ul>
                <!--  <div class="item_2">
                          <h3>因下列原因之一，直接或间接造成被保险人身故、残疾 的，保险人不负任何给付保险金责任：</h3>
                          <ul class="list_2">
                              <li>投保人对被保险人的故意杀害或伤害；</li>
                              <li>被保险人自致伤害或自杀，但被保险人自杀时为无民 事行为能力人的除外；</li>
                              <li>因被保险人挑衅或故意行为而导致的打斗、被袭击或被谋杀；</li>
                              <li>被保险人违法、犯罪或者抗拒依法采取的刑事强制措施；</li>
                              <li>被保险人因疾病导致的伤害，包括但不限于猝死、食物中毒、高原反应、中暑、病毒和细菌感染（意外伤害导致的伤口感染不在此限）；</li>
                              <li>被保险人因妊娠、流产、分娩导致的伤害，但意外伤害所致的流产或分娩不在此限；</li>
                              <li>被保险人因药物过敏、整容手术、内外科手术或其他医疗行为导致的伤害；</li>
                              <li>被保险人未遵医嘱私自服用、涂用、注射药物；</li>
                              <li>被保险人因意外伤害、自然灾害事故以外的原因失踪而被法院宣告死亡的；</li>
                              <li>被保险人从事高风险运动、参加任何职业或半职业体育运动期间；</li>
                              <li>被保险人不遵守机动车辆安全驾驶或乘坐的规定；</li>
                              <li>任何生物、化学、原子能武器，原子能或核能装置所造成的爆炸、灼伤、污染或辐射；</li>
                              <li>恐怖袭击。</li>
                          </ul>
                      </div>
                      <div class="item_2">
                          <h3>下列任一情形下，保险人对被保险人身故、残疾不负任何给付保险金责任：</h3>
                          <ul class="list_2">
                              <li>被保险人精神失常或精神错乱期间；</li>
                              <li>战争、军事行动、暴动或武装叛乱期间；</li>
                              <li>被保险人醉酒或受毒品、管制药物的影响期间；</li>
                              <li>被保险人酒后驾车、无有效驾驶证驾驶或驾驶无有 效行驶证的机动车期间。</li>
                          </ul>
                      </div> -->
              </div>
              <div class="item">
                <h2>五、服务流程</h2>
                <ul class="list_1">
                  <p class="p1">
                    5.1
                    本产品采用电子保单形式担保，如您或者被保险人填写的信息错误导致保单无法理赔，由您或者被保险人自己承担。
                  </p>
                </ul>
                <ul class="list_1">
                  <p class="p1">5.2 理赔流程</p>
                  <li>
                    保险事故发生后，请致电保险公司理赔服务专线：95500进行报案或理赔咨询，工作时间为每天早8：00-晚19：00。
                  </li>
                  <li>
                    保险公司接到报案后会记录报案人员邮箱地址，并按地址发送用户出险填报资料。
                  </li>
                  <li>
                    报案人收到后，打印，并按照保险公司要求填写。填写完毕后，将报案资料与病历，发票，小票等一切与费用报销相关的票据一并邮寄给保险公司。
                  </li>
                  <li>
                    保险公司在接到完整合规的理赔材料后，会及时有效地向被保险人支付赔款。1万元及以下案件，三个工作日支付赔款；1万元以上案件，五至十个工作日支付赔款。如遇特殊情况，顺延二至三个工作日。
                  </li>
                </ul>
              </div>
              <div class="item">
                <h2>六、其他信息</h2>
                <ul class="list_1">
                  <p class="p1">
                    6.1
                    斗米将严格遵守现行有效的关于个人信息、数据及隐私保护的法律法规，采取充分的技术手段和制度管理，保护您提供的个人信息、数据和隐私不受到非法的泄露或披露给未获授权的第三方，请您放心填写。
                  </p>
                </ul>
              </div>
            </div>
          </div>
        </el-dialog>
      </div>
      <!-- 弹窗————方案 -->
      <div class="export-dialog maskplan">
        <el-dialog
          title="保险方案"
          :visible.sync="showaeditplan"
          @close="showaeditplan = false"
          size="tiny"
        >
          <p class="title_info">根据项目类型判断上岗风险，选择对应方案</p>
          <h3 class="second_title">投保渠道:</h3>

          <div class="second_radio_plan">
            <template>
              <!-- <el-radio v-model="insuranceSource" label="1">太保</el-radio> -->
              <el-radio v-model="insuranceSource" label="2">史带</el-radio>
              <el-radio v-model="insuranceSource" label="3">泰康</el-radio>
            </template>
          </div>

          <p class="second_title_info">
            投保渠道对应方案内容一致,具体选择请咨询交付负责人或商保运营团队
          </p>

          <h3 class="second_title">投保方案:</h3>

          <div class="radio_plan">
            <div
              class="radio_list"
              @click="ckradioplan(item)"
              :key="key"
              v-for="(item, key) in insurance_plan"
            >
              <div
                :class="[
                  'radio_btn',
                  editradioplan == item.plan_id ? 'is-checked' : '',
                ]"
              ></div>
              <div class="radio_info">
                <h4>
                  {{ item.name }}
                  <a
                    href="javascript:;"
                    style="color: #1f2d3d; font-size: 14px"
                    v-if="item.num == -1"
                    >（不限量）</a
                  >
                  <a
                    href="javascript:;"
                    style="color: #1f2d3d; font-size: 14px"
                    v-else
                    >（剩余{{ item.num }}人天）</a
                  >
                </h4>
                <p>{{ item.describe }}</p>
              </div>
            </div>
            <p class="note" v-if="team_id == 10">
              注：如无匹配的职位类型，建议选择方案三
            </p>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button class="cancel" @click="showaeditplan = false"
              >取 消</el-button
            >
            <el-button type="primary" class="confirm" @click="againconfirm" :loading="isLoading"
              >确 定</el-button
            >
          </div>
        </el-dialog>
      </div>
      <!-- 弹窗————批量邀请 -->
      <div class="dialog-invit">
        <el-dialog
          title="批量邀请"
          :visible.sync="showmaskinvitation"
          @close="resetFormmore('insurancetimemore')"
          size="small"
        >
          <div class="dialogInvitform">
            <el-form
              label-width="123px"
              :model="insurancetimemore"
              :rules="rules"
              ref="insurancetimemore"
            >
              <el-form-item label="保险时间：" prop="time">
                <el-date-picker
                  v-model="insurancetimemore.time"
                  type="daterange"
                  :editable="false"
                  range-separator="至"
                  style="width: 305px"
                  :picker-options="starttime"
                  placeholder="选择日期范围"
                  @change="changeTime"
                >
                </el-date-picker>
              </el-form-item>
              <p v-show="timeerror">保险时间范围不超过30天</p>
              <el-form-item label="二维码有效期：" prop="expireType">
                <el-select v-model="expireType" placeholder="请选择" @change="changeSelect">
                  <el-option
                    v-for="item in expireTypeList"
                    :key="item.id"
                    :label="item.label"
                    :value="item.value"
                    >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <div class="ewm">
              <dl>
                <dt>
                  <canvas id="canvas" v-show="showewm"></canvas>
                  <img :src="defaultewm" class="defaultewm" v-show="!showewm" />
                </dt>
                <dd>右键复制二维码，保存或者分享到微信</dd>
              </dl>
            </div>
            <!--  <div class="myinput">
                        <label for="">复制链接邀请:</label><br>
                        <input readonly = "readonly" type="text"  v-model="ewmlink" value="evmlink" id="input">
                        <el-button type="primary" class="btn2 copybtn" :disabled="disabledcopy" @click="copyContent">复制链接</el-button>
                    </div> -->
          </div>
        </el-dialog>
      </div>
      <!-- 弹窗————添加人员 -->
      <div class="dialog-addmember">
        <el-dialog
          title="添加人员"
          :visible.sync="dialogAddMembe"
          @close="resetFormMember('ruleForm')"
          size="tiny"
        >
          <div class="myform" style="width:370px" id="asd" v-loading="loadingAddMembe">
            <el-form
              :model="ruleForm"
              :rules="rules"
              ref="ruleForm"
              label-width="90px"
              class="demo-ruleForm"
            >
              <el-form-item label="手机号" prop="mobile">
                <el-input
                  v-model="ruleForm.mobile"
                  :maxlength="11"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
              <el-form-item label="姓名" prop="real_name">
                <el-input
                  v-model="ruleForm.real_name"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
              <el-form-item label="身份证号" prop="idnumber">
                <el-input
                  v-model="ruleForm.idnumber"
                  :maxlength="18"
                  placeholder="请输入"
                ></el-input>
              </el-form-item>
              <el-form-item label="保险时间" prop="insuranctime">
                <el-date-picker
                  v-model="ruleForm.insuranctime"
                  type="daterange"
                  style="width: 251px"
                  range-separator="至"
                  :picker-options="starttime"
                  :editable="false"
                  placeholder="选择日期"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item label="投保职位" prop="insureJobsValue"  v-if="insuranceSource == '3'">
                  <el-select
                    v-model="ruleForm.insureJobsValue"
                    filterable
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in insureJobs"
                      :key="item.id"
                      :label="item.post_title"
                      :value="item.post_code"
                    >
                    </el-option>
                  </el-select>
              </el-form-item>
            </el-form>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="resetFormMember('ruleForm')" class="btn1"
              >取 消</el-button
            >
            <el-button
              type="primary"
              @click="submitFormMember('ruleForm')"
              class="btn2"
              >确 定</el-button
            >
          </span>
        </el-dialog>
      </div>
      <!--批量添加弹窗 -->
      <el-dialog
        title="批量添加"
        class="size-dialog"
        :visible.sync="batchDialogVisible"
        @close="closeBatch"
        size="small"
      >
        <div class="dialog-content">
          <el-form ref="batchTimeForm">
            <el-form-item label="投保时间：">
              <el-date-picker
                v-model="batchTime"
                type="daterange"
                :placeholder="timePlaceholder"
                @change="changeTime2"
                :picker-options="pickerOptionsDis"
                :clearable="false"
                :default-value="batchTime"
              >
              </el-date-picker>
            </el-form-item>
          </el-form>

          <div class="batch-tree-container">
            <div class="grid-content">
              <div class="batch-title">选择小组或成员</div>
              <div class="batch-tree-content">
                <div class="batch-tree">
                  <i class="el-icon-search"></i>
                  <el-input
                    class="search-input"
                    :icon="filterText ? 'circle-cross' : ''"
                    :on-icon-click="clearFilterText"
                    placeholder="搜索小组或成员"
                    v-model="filterText"
                  >
                  </el-input>

                  <el-tree
                    class="filter-tree"
                    :data="treeData"
                    :props="defaultProps"
                    node-key="id"
                    default-expand-all
                    @node-click="handleNodeClick"
                    :filter-node-method="filterNode"
                    ref="tree2"
                    :render-content="renderContent"
                    :expand-on-click-node="false"
                  >
                  </el-tree>
                </div>
              </div>
              <div class="batch-all-check">
                <el-button size="small" type="primary" @click="checkAllUser()"
                  >全部选择</el-button
                >
              </div>
            </div>
            <div class="grid-icon">
              <i class="el-icon-arrow-right icon-i"></i>
            </div>
            <div class="grid-content">
              <div class="batch-title">已选择成员</div>
              <div class="batch-tree-content">
                <i class="el-icon-search"></i>
                <el-input
                  :icon="filterCheckText ? 'circle-cross' : ''"
                  :on-icon-click="clearfilterCheckText"
                  class="search-input"
                  placeholder="搜索成员"
                  v-model="filterCheckText"
                >
                </el-input>
                <div class="batch-tree">
                  <ul>
                    <li
                      :key="index"
                      v-for="(item, index) in searchMember(filterCheckText)"
                    >
                      <div class="batch-item">
                        <div class="batch-item-left">
                          <i class="user_icon"></i>
                          <span class="batch_user_name">{{ item.name }}</span>
                          <span class="batch_user_name">{{ item.mobile }}</span>
                          <el-tooltip
                            v-if="item.idnumber == ''"
                            class="item"
                            effect="light"
                            content="身份证信息不全"
                            placement="right"
                          >
                            <i class="el-icon-warning id-no-err"></i>
                          </el-tooltip>
                        </div>
                        <i
                          class="el-icon-close close-btn"
                          @click="removeUser(item)"
                        ></i>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="batch-all-clear">
                <el-button size="small" type="primary" @click="removeAllUser()"
                  >全部清除</el-button
                >
              </div>
            </div>
          </div>
          <div class="batch-tips" v-if="insuranceSource == '3'">
            <p>
              注：当前投保渠道是泰康，险种是雇主责任险，要求 <span class="redText">投保人员必须有投保职位</span> ，请在人员管理中设置好要投保人员的投保职位
            </p>
            <p>默认选择成员为在职且有投保职位但当日未上保险的普通成员，无默认选择普通成员时，则当日全部已上保险或由于无投保职位无法投保</p>
          </div>
          <div class="batch-tips" v-else>
            注：默认选择成员为在职但当日未上保险普通成员，无默认选择普通成员时，则当日全部已上保险。
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeBatch">取 消</el-button>
          <el-button
            type="primary"
            :loading="uploadingBatch"
            @click="sureBatch"
            >{{ uploadingBatch ? "添加中" : "确定" }}</el-button
          >
        </span>
      </el-dialog>
      <!-- 批量导入投保人 -->
      <div class="dialog-import">
        <el-dialog
          title="批量导入"
          :visible.sync="dialogImport"
          @close="cancelImport('ruleForm')"
          size="tiny"
        >
          <div class="title">
            <span>按照标准模板导入人员投保</span>
            <a href="javascript:;" @click="importExel">下载模板</a>
          </div>
          <div class="myform" v-loading.body="loadingImport">
            <el-form method="POST" class="demo-ruleForm">
              <h4>上传要导入的excel：</h4>
              <div class="upload-box">
                <form action="" id="upfile" enctype="multipart/form-data">
                  <a
                    href="javascript:;"
                    class="file"
                    :class="{ disabled_file: file_text }"
                    >点击上传
                    <input
                      type="file"
                      name=""
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      @change="onChange"
                      id="upfile1"
                      :disabled="file_text ? true : false"
                    />
                  </a>
                </form>
                <p class="file_text" v-if="file_text">
                  <i class="file_icon"></i>{{ file_text }}<i
                    class="file_close"
                    @click="fileClose"
                  ></i>
                </p>
                <div style="width: 340px" v-if="file_speed">
                  <div class="speed-div">
                    <span :style="'width:' + speed + '%'"></span>
                  </div>
                </div>
              </div>
            </el-form>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="cancelImport('ruleForm')" class="btn1"
              >取 消</el-button
            >
            <el-button
              type="primary"
              @click="submitImport('ruleForm')"
              class="btn2"
              >导 入</el-button
            >
          </span>
        </el-dialog>
      </div>
      <el-dialog
        title="进度提示"
        :visible.sync="progressDialog"
        size="tiny"
        :show-close="false"
        :close-on-click-modal="false"
        class="progressWrap">
        <div class="circleWrap">
          <el-progress type="circle" :percentage="percentage" v-if="percentage == 0"></el-progress>
          <el-progress type="circle" :percentage="percentage" v-if="percentage !== 0 && percentage !== 100"></el-progress>
          <el-progress type="circle" :percentage="percentage" status="success" v-if="percentage == 100"></el-progress>
        </div>
        <div class="progressMes" :class="[percentage == 100?'green':'']">{{progressInfo}}</div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="sureClose" :disabled="canClosed">关 闭</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import * as util from "../assets/js/util.js";
import QRCode from "qrcode";
let reg = /^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/;
let idnumberReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
let interval;
let numberReg = /^\d+(\.\d+)?$/;
export default {
  name: "kqtasklist",
  components: {},
  data() {
    var testStartTime = (rule, value, callback) => {
      var sumDays = "";
      if (!value || !value[0]) {
        return callback(new Error("请选择保险时间"));
      } else {
        sumDays = util.DateDiff(
          util.formatData1(value[0]),
          util.formatData1(value[1])
        );
        if (sumDays > 30) {
          return callback(new Error("时间跨度不能超过30天"));
        } else {
          callback();
        }
      }
    };
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
    var idcardReg = (rule, value, callback) => {
      let code = value;
      if (!value) {
        return callback(new Error("请输入身份证号码"));
      }
      let city = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江 ",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北 ",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏 ",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        91: "国外 ",
      };
      let tip = "";
      let pass = true;
      if (
        !code ||
        !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(
          code
        )
      ) {
        tip = "身份证号格式错误";
        pass = false;
      } else if (!city[code.substr(0, 2)]) {
        tip = "地址编码错误";
        pass = false;
      } else {
        //18位身份证需要验证最后一位校验位
        if (code.length == 18) {
          code = code.split("");
          if (code[17] === "x") code[17] = "X";
          //∑(ai×Wi)(mod 11)
          //加权因子
          let factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
          //校验位
          let parity = [1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2];
          let sum = 0;
          let ai = 0;
          let wi = 0;
          for (let i = 0; i < 17; i++) {
            ai = code[i];
            wi = factor[i];
            sum += ai * wi;
          }
          let last = parity[sum % 11];
          if (parity[sum % 11] != code[17]) {
            tip = "校验位错误";
            pass = false;
          }
        }
      }
      if (!pass) {
        return callback(new Error("请输正确入身份证号码"));
      } else {
        callback();
      }
    };
    return {
      pickerOptionsDis: {
        // 按日起保线上日期 限制
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
      },
      timePlaceholder: this.getNowTime(),
      uploadingBatch: false,
      filterText: "",
      filterCheckText: "", // 已选择成员搜索
      treeData: [],
      personStack: [], //选中的人
      defaultProps: {
        children: "children",
        label: "name",
      },
      batchTime: new Date(), // 投保时间
      team_id: 0,
      project_id: 0,
      num: "",
      insurance_autostatus: 0,
      insurancetimemore: { time: "" },
      showaeditplan: false,
      insurance_planname: "",
      radioplan: 0,
      editradioplan: 0,
      editradioplanNo: 0,
      insuranceSource: 0,
      insurance_source: -1,
      insurance_plan: [],
      ruleForms: { link: "", time: "" },
      loadingAddMembe: false,
      starttime: {
        disabledDate(time) {
          return time.getTime() < new Date(new Date().setHours(0, 0, 0, 0));
        },
      },
      insuranceplan: { plan1: 1 },
      showmaskinvitation: false, //邀请
      dialogAddMembe: false,
      batchDialogVisible: false, // 批量添加人员弹窗是否展示
      ruleForm: {
        mobile: "",
        real_name: "",
        insuranctime: "",
        insureJobsValue: '',  // 选择投保职位的值
        idnumber: "",
      },
      insureJobs: [],
      rules: {
        mobile: [{ required: true, validator: phoneReg, trigger: "blur" }],
        real_name: [{ required: true, validator: nameReg, trigger: "blur" }],
        idnumber: [{ required: true, validator: idcardReg, trigger: "blur" }],
        insuranctime: [
          { required: true, validator: testStartTime, trigger: "change" },
        ],
        insureJobsValue: [
          { required: true, message: '请选择投保职位', trigger: "change" },
        ],
        time: [{ validator: testStartTime, trigger: "change", required: true }],
      },
      idnumberReg: false,
      showainsuranceterms: false,
      ewmlink: "", //二维码链接
      timeerror: false,
      disabledcopy: true,
      defaultewm: require("../assets/imgs/insurance/defaultewm.png"),
      showewm: false,
      insurance_planinfo: "",
      // insurance_source:'',
      insurance_source_connect: "",
      dialogImport: false, //弹窗--批量导入
      // import_exel:
        // "https://work.doumi.com/sea/api/1.0/client/v1/insurance/order/template/download?dmclient=pcweb&X-Doumi-Agent=weixinqy",
      loadingImport: false,
      file_text: "",
      file_speed: false,
      speed: 60,
      timer: null,
      progressInfo: '',
      percentage: 0,
      progressDialog: false,
      canClosed: false,
      expireType:1,
      expireTypeList:[
        {
          id:1,
          label:'无限制',
          value:''
        },
        {
          id:2,
          label:'1天',
          value:1
        },
        {
          id:3,
          label:'3天',
          value:3
        },
        {
          id:4,
          label:'7天',
          value:7
        },
        {
          id:5,
          label:'15天',
          value:15
        },
      ],
      selectTime:null,
      show_insurance_block:false,
      show_insurance_tips:false,
      isLoading: false
    };
  },
  methods: {
    init() {
      this.team_id = util.getLocalStorage("projectStorageInfo").team_id;
      this.project_id = util.getLocalStorage("projectStorageInfo").project_id;
      this.getautostatus();
      this.getinsurancePhone();
      
      this.getinsurancesubject();
    },
    cancelImport(formName) {
      this.dialogImport = false;
      this.dialogImport = false;
      this.file_text = "";
      this.file_speed = false;
      this.speed = 60;
      clearInterval(interval);
      document.getElementById("upfile").reset();
    },
    //下载模板
    importExel() {
      // location.href = this.import_exel;
      location.href = this.insurance_import_template_url;
    },
    mbImport() {
      this.dialogImport = true;
    },
    getNowTime() {
      var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth(); //得到月份
      var date = now.getDate(); //得到日期
      month = month + 1;
      month = month.toString().padStart(2, "0");
      date = date.toString().padStart(2, "0");
      var defaultDate = `${year}-${month}-${date} - ${year}-${month}-${date}`;
      return defaultDate;
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
            type: "warning",
          });
          return;
        }
        interval = setInterval(function () {
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
      this.percentage = 0;
      this.progressInfo = '';
      this.canClosed = true;
      this.loadingImport = true;
      if (this.file_text == "") {
        this.$message({
          showClose: true,
          message: "选择你要导入的文件",
          type: "warning",
        });
        return;
      }
      var form_data = new FormData();
      var file_data = $("#upfile1").prop("files")[0];
      form_data.append("team_id", this.team_id);
      form_data.append("project_id", this.project_id);
      form_data.append("insurance_excel", file_data);
      $.ajax({
        url:
          util.host +
          "/sea/api/1.0/client/v1/insurance/order/excel/import_v2?dmclient=pcweb&X-Doumi-Agent=weixinqy",
        type: "POST",
        data: form_data,
        processData: false,
        contentType: false,
        xhrFields: {
          withCredentials: true,
        },
        timeout: 10000,
        success: (obj) => {
          // console.log(obj)
          this.dialogImport = false;
          if (obj && obj.errno == 0) {
            this.loadingImport = false;
            this.progressDialog = true;
            this.progressInfo = "开始导入，请等待~";
            console.log('kaishi===', Date())
            //setTimeout(() => {
              let _time = 0;
              this.timer = setInterval(() => {
                _time++;
                if (_time > 199) {
                  clearInterval(this.timer)
                };
                this.getCurrProgress();
              }, 1000)
            //}, 1000)
          } else {
            this.loadingImport = false;
            this.$message({
              message: obj.errmsg,
              type: "warning",
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
            type: "warning",
          });
        },
        noNetwork: () => {
          this.loadingImport = false;
          document.getElementById("upfile").reset();
          //网络超时
          this.$message({
            showClose: true,
            message: "网络连接失败，请检查网络",
            type: "warning",
          });
        },
      });
    },
    // 获取上传结果
    getCurrProgress() {
      let data = {
        project_id: this.project_id,
        type: 1
      };
      util.ajax({
        url: '/insurance/order/excel/get_result',
        type: 'GET',
        data: data,
        timeout: 1000 * 10 * 60,
        success: (res) => {
          // console.log('查询导入进程===', res);
          if (res.errno == 0 && res.data.end_time == 0) {
            this.progressInfo = "正在处理数据中，请耐心等待~";
            let percentage = parseInt(
              (res.data.processed_shard_num / res.data.total_shard_num) * 100
            );
            this.percentage = percentage;
          } else if(res.errno == 0 && res.data.end_time > 0){
            console.log('jieshu===', Date())
            clearInterval(this.timer);
            this.percentage = 100;
            this.progressInfo = "导入完成";
            this.canClosed = false;
            if(res.data.error_sum > 0) {
              document.getElementById("upfile").reset();
              util.setLocalStorage("insuranceMembererror", res.data);
              this.$router.replace("insuranceMembererror");
            }
          } else {
            this.canClosed = false;
            this.progressDialog = false;
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'error'
            });
            clearInterval(this.timer);
            document.getElementById("upfile").reset();
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
     // 获取投保结果
    getCurrProgressAdd() {
      let data = {
        project_id: this.project_id,
        type: 2
      };
      util.ajax({
        url: '/insurance/order/excel/get_result',
        type: 'GET',
        data: data,
        timeout: 1000 * 10 * 60,
        success: (res) => {
          // console.log('查询导入进程===', res);
          if (res.errno == 0 && res.data.end_time == 0) {
            this.progressInfo = "正在处理数据中，请耐心等待~";
            let percentage = parseInt(
              (res.data.processed_shard_num / res.data.total_shard_num) * 100
            );
            this.percentage = percentage;
          } else if(res.errno == 0 && res.data.end_time > 0){
            console.log('jieshu===', Date())
            clearInterval(this.timer);
            this.percentage = 100;
            this.progressInfo = "投保完成";
            this.canClosed = false;
            if(res.data.error_sum > 0) {
              // document.getElementById("upfile").reset();
              // util.setLocalStorage("insuranceMembererror", res.data);
              // this.$router.replace("insuranceMembererror");
              this.$message({
                showClose: true,
                message: res.errmsg,
                type: 'error'
              });
            }
          } else {
            this.canClosed = false;
            this.progressDialog = false;
            this.$message({
              showClose: true,
              message: res.errmsg,
              type: 'error'
            });
            clearInterval(this.timer);
            // document.getElementById("upfile").reset();
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
    sureClose() {
      this.progressDialog = false;
    },
    getautostatus() {
      util.ajax({
        url: "/insurance/auto_status/get",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
        },
        timeout: 10000,
        success: (result) => {
          //console.log(JSON.stringify(result))
          if (result.errno == 0 && result.data[0]) {
            this.insurance_autostatus = result.data[0].status;
          } else {
            // this.alertinfo(result.errmsg)
          }
        },
        error: (xhr, status) => {
          this.alertinfo("网络连接失败，请检查网络");
        },
        noNetwork: () => {
          this.alertinfo("网络连接失败，请检查网络");
        },
      });
    },
    //获取保险主体
    //当投保渠道为史带、SaaS项目未关联CRM项目且SaaS项目不在单独配置中时，
    //点击用工保险时提示‘未关联CRM评估单无法获取投保人，不可通过史带投保，请在CRM评估单绑定项目或将投保渠道修改为太保’
    getinsurancesubject(){
        util.ajax({
          url: "/insurance/project/insurance_subject",
          type: "GET",
          data: {
            dmclient: "pcweb",
            team_id: this.team_id,
            project_id: this.project_id,
          },
          timeout: 10000,
          success: (result) => {
            // console.log(result)
            if (result.errno == 0) {
              if(result.data.is_allow){
                this.show_insurance_block =true;
                this.show_insurance_tips =false;
              }else{
                this.show_insurance_block =false;
                this.show_insurance_tips =true;
                this.insurance_autostatus =0;
              }
            } else {
              this.alertinfo(result.errmsg);
            }
          },
          error: (xhr, status) => {
            this.alertinfo("网络连接失败，请检查网络");
          },
          noNetwork: () => {
            this.alertinfo("网络连接失败，请检查网络");
          },
        });
    },
    // 获取保险电话
    getinsurancePhone() {
      util.ajax({
        url: "/insurance/project/insurance_source",
        type: "GET",
        data: {
          dmclient: "pcweb",
          project_id: this.project_id,
        },
        timeout: 10000,
        success: (result) => {
          // console.log(result)
          if (result.errno == 0) {
            this.insurance_source_connect =
              result.data.insurance_source_connect;
            // 为了防止点击切换投保渠道时出现bug
            this.insurance_source = result.data.insurance_source;
            this.insuranceSource = result.data.insurance_source;
            this.insurance_import_template_url = result.data.insurance_import_template_url;
            this.getinsuranceplan(this.insuranceSource);
          } else {
            this.alertinfo(result.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo("网络连接失败，请检查网络");
        },
        noNetwork: () => {
          this.alertinfo("网络连接失败，请检查网络");
        },
      });
    },

    //获取保险方案
    getinsuranceplan(type_source) {
      util.ajax({
        url: "/insurance/strategy/list",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          insurance_source: type_source
        },
        timeout: 10000,
        success: (result) => {
          // console.log(result)
          if (result.errno == 0) {
            // 当投保渠道是太保的时候，投保方案复制为空数组
            if(type_source != 1) {
              this.insurance_plan = result.data;
              this.insurance_plan.map((val, index) => {
                if (val.select == 1) {
                  this.radioplan = val.plan_id;
                  this.insurance_planname = val.name;
                  this.editradioplan = val.plan_id;
                  this.editradioplanNo = val.id_key;
                  this.editinsurance_planname = val.name;
                  this.insurance_planinfo = val.describe;
                  this.num = val.num;
                }
              });
            } else {
              this.insurance_plan = []
            }
          } else {
            // this.alertinfo(result.errmsg)
          }
        },
        error: (xhr, status) => {
          this.alertinfo("网络连接失败，请检查网络");
        },
        noNetwork: () => {
          this.alertinfo("网络连接失败，请检查网络");
        },
      });
    },
    // 获取批量添加的树结构数据
    getTreeData() {
      this.treeData = [];
      this.personStack = [];
      util.ajax({
        url: "/insurance/group_person/get",
        type: "POST",
        data: {
          dmclient: "pcweb",
          team_id: this.team_id,
          project_id: this.project_id,
        },
        timeout: 10000,
        success: (result) => {
          if (result.errno == 0) {
            this.treeData = result.data;
            this.initPersonStack(this.treeData);
          } else {
            this.alertinfo(result.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo("网络连接失败，请检查网络");
        },
        noNetwork: () => {
          this.alertinfo("网络连接失败，请检查网络");
        },
      });
    },
    //弹窗---清楚搜索小组关键字
    clearFilterText() {
      this.filterText = "";
    },
    // 弹窗---清除搜索已选择成员关键字
    clearfilterCheckText() {
      this.filterCheckText = "";
    },
    changeTime2(date) {
      console.log(date);
    },
    renderContent: function (h, { node, data, store }) {
      if (node.data.mobile) {
        if((node.data.post_code && this.insuranceSource == '3') || this.insuranceSource != '3') {
          return (
            <span>
              <i class="user_icon"></i>
              <span style="padding-left: 4px;">{node.data.name}</span>
              <span style="padding-left: 4px;">{node.data.mobile}</span>
            </span>
          );
        } else {
          return (
            <span>
              <i class="user_icon"></i>
              <span style="padding-left: 4px;">{node.data.name}</span>
              <span style="padding-left: 4px;">{node.data.mobile}</span>
              <span style="padding-left: 4px;color:red" >无投保职位</span>
            </span>
          );
        }
      } else {
        return (
          <span>
            <i class="wj_icon"></i>
            <span style="padding-left: 4px;">{node.label}</span>
          </span>
        );
      }
    },
    //保险自动开关
    switchchange(val) {
      console.log(val);
      util.ajax({
        url: "/insurance/auto_status/set",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          status: val,
        },
        timeout: 10000,
        success: (result) => {
          //console.log(JSON.stringify(result))
          if (result.errno == 0) {
          } else {
            this.alertinfo(result.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo("网络连接失败，请检查网络");
        },
        noNetwork: () => {
          this.alertinfo("网络连接失败，请检查网络");
        },
      });
    },
    // 保险方案修改
    ckeditplan() {
      this.showaeditplan = true;
      this.editradioplan = this.radioplan;
    },
    ckalladdmer() {
      if(this.insuranceSource == '3') {
        this.alertinfo('当前投保渠道为泰康，不可使用批量邀请功能', 'warning');
      } else {
        this.showewm = false;
        this.ewmlink = "";
        this.disabledcopy = true;
        this.showmaskinvitation = true;
      }
    },
    //确定修改方案
    againconfirm() {
      this.isLoading = true;
      util.ajax({
        url: "/insurance/strategy/set",
        type: "GET",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          plan_id: this.editradioplanNo,
          insurance_source: this.insuranceSource,
        },
        timeout: 10000,
        success: (result) => {
          //console.log(JSON.stringify(result))
          if (result.errno == 0) {
            // this.getinsuranceplan(this.insuranceSource);
            setTimeout(()=> {
              this.alertinfo("保险方案修改成功！", "success");
              this.radioplan = this.editradioplan;
              this.insurance_planname = this.editinsurance_planname;
              this.insurance_planinfo = this.editinsurance_planinfo;
              this.getinsurancePhone();
              this.getinsurancesubject();
              this.showaeditplan = false;
              this.isLoading = false;
            }, 0)
          } else {
            this.alertinfo(result.errmsg);
          }
        },
        error: (xhr, status) => {
          this.alertinfo("网络连接失败，请检查网络");
          this.isLoading = false;
        },
        noNetwork: () => {
          this.alertinfo("网络连接失败，请检查网络");
          this.isLoading = false;
        },
      });
    },
    //手动添加人员
    ckaddmer() {
      this.dialogAddMembe = true;
      this.getInsureJobsList();
    },
    // 批量添加按钮
    batchAdd() {
      this.getTreeData();
      this.batchDialogVisible = true;
    },
    closeBatch() {
      this.batchDialogVisible = false;
    },
    // 点击确定
    sureBatch() {
      this.percentage = 0;
      this.progressInfo = '';
      this.canClosed = true;
      console.log(this.batchTime);
      console.log(this.personStack);
      let idNums = "";
      let idnumberFlag = false;
      for (let index in this.personStack) {
        let item = this.personStack[index];
        if (item.idnumber == "") {
          idnumberFlag = true;
          break;
        }
        idNums += `${item.id},`;
      }

      if (idnumberFlag) {
        this.alertinfo(
          "您选择的成员中，有部分成员信息不完整（已标记出），请您修改后，重新点击确认！",
          "error"
        );
        return false;
      }
      console.log("idNums", idNums);
      if (idNums.substr(idNums.length - 1, 1) === ",") {
        idNums = idNums.substr(0, idNums.length - 1);
      }

      if (idNums.length == 0) {
        this.alertinfo("请选择需要投保的成员");
        return false;
      }
      let time = {
        status: 2,
        start_date:
          this.batchTime.length > 0
            ? (this.batchTime[0].getTime() + "").substr(0, 10)
            : (this.batchTime.getTime() + "").substr(0, 10),
        end_date:
          this.batchTime.length > 0
            ? (this.batchTime[1].getTime() + "").substr(0, 10)
            : (this.batchTime.getTime() + "").substr(0, 10),
        week: ["1", "2", "3", "4", "5", "6", "7"],
      };
      this.uploadingBatch = true;
      console.log(time);
      // return;
      util.ajax({
        url: "/insurance/order/bulk/create_v2",
        type: "POST",
        data: {
          team_id: this.team_id,
          project_id: this.project_id,
          user_ids: idNums,
          time: JSON.stringify(time),
        },
        timeout: 10000,
        success: (result) => {
          //console.log(JSON.stringify(result))
          if (result.errno == 0) {
            // this.alertinfo("批量添加成功", "success");
            this.progressDialog = true;
            this.progressInfo = "开始添加，请等待~";
            console.log('kaishi===', Date())
            let _time = 0;
            this.timer = setInterval(() => {
              _time++;
              if (_time > 1500) {
                clearInterval(this.timer)
              };
              this.getCurrProgressAdd();
            }, 1000)
            this.closeBatch();
          } else {
            this.alertinfo(result.errmsg);
          }
          this.uploadingBatch = false;
        },
        error: (xhr, status) => {
          this.alertinfo("网络连接失败，请检查网络");
          this.uploadingBatch = false;
        },
        noNetwork: () => {
          this.alertinfo("网络连接失败，请检查网络");
          this.uploadingBatch = false;
        },
      });
    },
    // 将全部人员添加到右侧
    initPersonStack(arr, checkDefault = true) {
      arr.forEach((item, index) => {
        if (item.hasOwnProperty("children")) {
          this.initPersonStack(item.children, checkDefault);
        } else {
          if (checkDefault && !item.default_select) {
            return;
          }
          // if(!item.default_select) return
          this.handleNodeClick(item);
        }
      });
    },
    // 点击树结构的一项,向右侧列表中添加
    handleNodeClick(data) {
      console.log("**");
      console.log(data);
      // return
      // 如果是泰康
      if(this.insuranceSource == '3') {
        if(!data.post_code || (data.post_code && data.post_code == '')) {
          this.alertinfo("无投保职位人员不可投保，请前往人员管理中设置任意投保职位", "warning");
          return
        }
      }
      if (!data.hasOwnProperty("mobile") || !data.mobile) {
        if (data.hasOwnProperty("children")) {
          this.initPersonStack(data.children, false);
        } else {
          this.handleNodeClick(data);
        }
        return;
      }
      if (
        this.personStack.some((item) => {
          return item.id === data.id;
        })
      ) {
        return;
      }
      this.personStack.push(data);
    },
    removeUser(item) {
      let idx = this.personStack.indexOf(item);
      this.personStack.splice(idx, 1);
    },
    // 全部选择
    checkAllUser() {
      this.personStack = [];
      console.log("this.treeData", this.treeData);
      this.treeData.forEach((item, index) => {
        if (item.hasOwnProperty("children")) {
          this.initPersonStack(item.children, false);
        } else {
          this.handleNodeClick(item);
        }
      });
    },
    // 全部清除
    removeAllUser() {
      this.personStack = [];
    },
    inputBlur(value) {},
    //取消修改
    resetForm(formName) {
      this.showedittime = false;
    },
    //取消批量邀请

    resetFormmore(formName) {
      this.$refs[formName].resetFields();
      this.showmaskinvitation = false;
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
    //确定添加
    submitFormMember(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loadingAddMembe = true;
          let insured_info = {
              mobile: this.ruleForm.mobile,
              id_number: this.ruleForm.idnumber,
              name: this.ruleForm.real_name,
              post_code: this.ruleForm.insureJobsValue,
            },
            time = {
              status: 2,
              start_date: (this.ruleForm.insuranctime[0].getTime() + "").substr(
                0,
                10
              ),
              end_date: (this.ruleForm.insuranctime[1].getTime() + "").substr(
                0,
                10
              ),
              week: ["1", "2", "3", "4", "5", "6", "7"],
            };
          util.ajax({
            url: "/insurance/order/one/create",
            type: "GET",
            data: {
              team_id: this.team_id,
              project_id: this.project_id,
              time: JSON.stringify(time),
              insured_info: JSON.stringify(insured_info),
            },
            timeout: 10000,
            success: (result) => {
              this.loadingAddMembe = false;
              if (result.errno == 0) {
                this.alertinfo("手动添加成功", "success");
                this.dialogAddMembe = false;
                this.resetFormMember();
              } else {
                this.alertinfo(result.errmsg);
              }
            },
            error: (xhr, status) => {
              this.loadingAddMembe = false;
              this.alertinfo("网络连接失败，请检查网络");
            },
            noNetwork: () => {
              this.loadingAddMembe = false;
              this.alertinfo("网络连接失败，请检查网络");
            },
          });
        } else {
          // console.log('error submit!!');
          return false;
        }
      });
    },
    //取消添加人员
    resetFormMember(formName) {
      this.$refs[formName].resetFields();
      this.dialogAddMembe = false;
    },
    //批量邀请时间change
    changeTime(val) {
      let starttime = (new Date(val.split("至")[0]).getTime() + "").substr(
          0,
          10
        ),
        endtime = (new Date(val.split("至")[1]).getTime() + "").substr(0, 10),
        time = {
          status: 2,
          start_date: starttime,
          end_date: endtime,
          week: ["1", "2", "3", "4", "5", "6", "7"],
        };
      if (endtime - starttime <= 2592000) {
        this.selectTime=time;
        util.ajax({
          url: "/insurance/order/batch/create",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            time: JSON.stringify(time),
            expireType:this.expireType
          },
          timeout: 10000,
          success: (result) => {
            //console.log(JSON.stringify(result))
            if (result.errno == 0) {
              this.showewm = true;
              this.disabledcopy = false;
              this.useqrcode(result.data[0].code_url);
            } else {
              this.alertinfo(result.errmsg);
            }
          },
          error: (xhr, status) => {
            this.alertinfo("网络连接失败，请检查网络");
          },
          noNetwork: () => {
            this.alertinfo("网络连接失败，请检查网络");
          },
        });
      }
    },
    changeSelect() {
      if(!this.selectTime){
        return
      }
      util.ajax({
          url: "/insurance/order/batch/create",
          type: "GET",
          data: {
            team_id: this.team_id,
            project_id: this.project_id,
            time: JSON.stringify(this.selectTime),
            expireType:this.expireType
          },
          timeout: 10000,
          success: (result) => {
            //console.log(JSON.stringify(result))
            if (result.errno == 0) {
              this.showewm = true;
              this.disabledcopy = false;
              this.useqrcode(result.data[0].code_url);
            } else {
              this.alertinfo(result.errmsg);
            }
          },
          error: (xhr, status) => {
            this.alertinfo("网络连接失败，请检查网络");
          },
          noNetwork: () => {
            this.alertinfo("网络连接失败，请检查网络");
          },
        });
    },
    //生成二维码
    useqrcode(code_link) {
      let canvas = document.getElementById("canvas");
      this.ewmlink = code_link;
      QRCode.toCanvas(canvas, code_link, function (error) {
        // console.error(error)
      });
    },
    //复制链接
    copyContent() {
      var Url2 = document.getElementById("input");
      Url2.select();
      document.execCommand("Copy");
      this.alertinfo("复制成功", "success");
    },
    ckradioplan(index) {
      this.editradioplan = index.plan_id;
      this.editradioplanNo = index.id_key;
      this.editinsurance_planname = index.name;
      this.editinsurance_planinfo = index.describe;
      this.num = index.num;
    },
    ckgotoM() {
      this.$router.push("InsuranceM");
    },
    ckgotoS() {
      this.$router.push("InsuranceS");
    },
    // 显示错误信息
    alertinfo(text, type) {
      this.$message({
        showClose: true,
        message: text,
        type: type || "warning",
      });
    },
    filterNode(value, data) {
      if (!value) return true;
      return (
        data.name.indexOf(value) !== -1 || data.mobile.indexOf(value) !== -1
      );
    },
    // 已选择成员搜索
    searchMember(val) {
      console.log("search", val);
      return this.personStack.filter((item) => {
        if (item.name.includes(val) || item.mobile.includes(val)) {
          return item;
        }
      });
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    insuranceSource(newval, oldval) {
      console.log('newval===', newval)
      this.getinsuranceplan(newval)
    },
    $route(to, from) {
      // 对路由变化作出响应...
      this.init();
    },
    filterText(val) {
      this.$refs.tree2.filter(val);
    },
  },
};
</script>
<style>
.dialog-content {
  padding: 20px 30px;
}
.batch-tree-container {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  height: 340px;
  border: 1px solid #e0e6ed;
}
.batch-right-icon {
  width: 16px;
  height: 16px;
}
.grid-content {
  flex-grow: 1;
  height: 300px;
  width: 294px;
}
.batch-title {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  font-size: 14px;
}
.batch-tree-content {
  height: 275px;
  border: 1px solid #e0e6ed;
  overflow-y: scroll;
  position: relative;
}
.batch-all-check {
  margin-top: 10px;
}
.batch-all-clear {
  margin-top: 10px;
}
.id-no-err {
  margin-left: 5px;
  color: red;
  cursor: pointer;
}
.batch-tree {
  position: relative;
}
.grid-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 100%;
}
.icon-i {
  position: relative;
  top: 10px;
}
.batch-tips {
  margin-top: 20px;
  line-height: 20px;
  font-weight: bold;
}
.batch-item {
  margin: 8px 5px;
  background: #f5f5f5;
  align-items: center;
  padding: 5px;
  display: flex;
  padding: 8px;
  justify-content: space-between;
}
.batch-item-left {
  display: flex;
  align-items: center;
}
.wj_icon {
  display: inline-block;
  vertical-align: middle;
  width: 14px;
  height: 20px;
  line-height: 24px;
  margin-right: 5px;
  font-size: 13px;
  color: #6699ee;
  background: url(../assets/imgs/shareIcon/wj.svg) left no-repeat;
  text-indent: 18px;
  cursor: pointer;
  background-position-y: 1px;
}
.user_icon {
  display: inline-block;
  vertical-align: middle;
  width: 14px;
  height: 20px;
  line-height: 24px;
  margin-right: 5px;
  font-size: 13px;
  color: #6699ee;
  background: url(../assets/imgs/applications/member_addmin_hover.svg) left
    no-repeat;
  text-indent: 18px;
  cursor: pointer;
  background-position-y: 1px;
}
.close-btn {
  color: #669aee;
  cursor: pointer;
}
.batch_user_name {
  margin-left: 4px;
}
.el-tree {
  border: none;
}
.el-icon-search {
  position: absolute;
  z-index: 999;
  top: 11px;
  left: 12px;
  font-size: 16px;
  color: #e0e6ed;
}
.batch-tree-container .search-input {
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: navajowhite;
  border-bottom: 1px solid #e0e6ed;
}
.batch-tree-container .el-input__inner {
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: navajowhite;
  border-bottom: 1px solid #e0e6ed;
  border-radius: 2px;
  padding: 3px 10px 3px 32px;
}
</style>
<style src="../assets/css/insuranceMer.css"></style>
