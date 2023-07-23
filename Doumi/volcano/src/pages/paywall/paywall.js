import mpx, { createPage } from "@mpxjs/core";
import util from "~/utils/util";
import api from "~/utils/api";
// import commonApi from '~/interface/common'
import cityStore from "~/store/city";
import globalDataStore from "~/store/globalData";
import loginPath from "~/pages/login/login?resolve";
import basicInfoFirstPath from "~/pages/basicInfoFirst/basicInfoFirst?resolve";

const app = getApp();
const pageSize = 10; // 分页大小
const IS_COLLECTED = "is_collected";

let canNextRequest = true;
let scrollThrottle = () =>
  console.log(`Pages wait for injection after rendering`); // 内容区域滚动的节流

createPage({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------

  data: {
    filterHeight: 0,
    isScrollY: true,
    refreshing: false,
    showErrorTemp: false,
    errorType: '',
    listData: [],
  },

  computed: {
  },

  watch: {
  },

  // -------------------------------------------------------------------------
  // 小程序生命周期
  // -------------------------------------------------------------------------
  onLoad(options){},

  onShow() {

  },

  async onReady() {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
  },

  /**
   * 分享
   */
  onShareAppMessage(res) {
  },

  methods: {
    // -------------------------------------------------------------------------
    // 页面bind的事件
    // -------------------------------------------------------------------------

    bindPageClick() {
      this.__hideCollectCard();
    },

    // 下拉刷新
    bindPullDownRefresh() {
      this.refreshing = true;

      let update = setTimeout(() => {
        clearTimeout(update);
        // this.updateDataInCity();
        this.refreshing = false;
        this.nomore = false;
      }, 400);
    },

    clickToggleENV() {
      util.showLoading();
      this.__getZoneData();
      this.__getListData(1);
    },

    // 收集formid完成时触发
    // bindCollectComplate ({ detail: { formId } }) {
    //   const param = {
    //     formId,
    //     openId: app.globalData.openId,
    //     pushType: 12
    //   }
    //   commonApi.collectFormid(param)
    //   this.theFormId = formId
    // },

    bindNavChange({ detail: { label, value } }) {
      // 兼容付费专区
      console.log(value);
      return;
      this.filterQuery["job_date_type"] = value;
      this.$refs.dmFilter.shrink();
      this.$refs.dmFilter
        .updateJobList(value, true) // - 更新职位选项数据
        .catch((err) => app.showErrorPageHandler(err));
      this.__postPv();
    },

    bindFilterShow() {
      this.isScrollY = false;
    },

    bindFilterHide() {
      this.isScrollY = true;
    },

    async bindFilterReset() {
      // await this.__getListData(1)
    },
    bindCloseSendMsg() {
      this.isShowSendMsg = false;
    },

    // 订阅消息
    bindSendMsg() {
      const city_id = this.currentCity.id;
      let tmpIds = this.tmpIds;
      let paramsTmpIds = [];
      const that = this;
      const theTime = new Date().getDate();
      wx.requestSubscribeMessage({
        tmplIds: tmpIds,
        async success(res) {
          if (res[tmpIds[0]] === "accept" || res[tmpIds[1]] === "accept") {
            if (res[tmpIds[0]] === "accept" && res[tmpIds[1]] === "accept") {
              that.bindCloseSendMsg();
              wx.setStorageSync("isindexSendMsg", theTime);
              paramsTmpIds = tmpIds;
            } else if (res[tmpIds[0]] === "accept") {
              paramsTmpIds = tmpIds.splice(0, 1);
              wx.setStorageSync("theTmpIds", tmpIds);
              that.tmpIds = tmpIds;
            } else {
              paramsTmpIds = tmpIds.splice(1, 1);
              wx.setStorageSync("theTmpIds", tmpIds);
              that.tmpIds = tmpIds;
            }
            if (tmpIds.length === 0) {
              wx.setStorageSync("isindexSendMsg", theTime);
              that.bindCloseSendMsg();
            }
            // this.__sendTemplateIds()
            const params = {
              open_id: app.globalData.openId,
              city_id: city_id,
              template_ids: paramsTmpIds,
            };
            try {
              await util.getData("collect/subscribemsg", params, "POST");
            } catch (err) {
              console.log(err);
            }
          } else {
          }
        },
        fail(res) {
          switch (res.errCode) {
            case 10002:
              util.showToast("网络链接错误，请检查网络状态");
              break;
            case 10003:
              util.showToast("网络链接错误，请检查网络状态");
              break;
            case 20004:
              that.bindCloseSendMsg();
              wx.setStorageSync("isindexSendMsg", theTime);
              break;
          }
        },
      });
    },

    bindFilterConfirm({ detail }) {
      this.page = 1;

      for (const [key, value] of Object.entries(detail.value)) {
        if (key === "job_type") {
          this.filterQuery[key] = value[0] ? value[0].value : "0";
        } else {
          this.filterQuery[key] = value.toString();
        }
      }
      // - 选择离我最近时隐藏距离
      this.showDistance = ~~this.filterQuery.sort !== 1;
      this.__getListData();
    },

    bindTracker({ detail: { append = "" } }) {
      this.__postEv(append);
    },
    bindZizhi() {
      mpx.navigateTo({ url: `../ziZhiMiddle/ziZhiMiddle` });
    },

    // 跳转至聚合页
    bingtGoToPrefecture(e) {
      const from =
        "yyw_" +
        e.currentTarget.dataset.index +
        "_" +
        e.currentTarget.dataset.dmalog;
      this.__postEv(
        `@ca_from=yyw_${e.currentTarget.dataset.index}_${e.currentTarget.dataset.dmalog}@from=${from}`,
        null,
        true
      );

      let data = this.zoneData[e.currentTarget.dataset.index];
      let params = [];
      let path = e.currentTarget.dataset.path;
      let cityID = this.currentCity.id;
      params.push(
        `source=yyw_${e.currentTarget.dataset.index}_${e.currentTarget.dataset.title}`,
        `from=${from}`
      );

      let keys = Object.keys(data.query);
      for (let key of keys) {
        params.push(`${key}=${data.query[key]}`);
      }
      if (data.app_id.length === 0) {
        wx.navigateTo({
          url: `${path}?city_id=${cityID}&${params.join("&")}`,
        });
      } else if (data.app_id.length > 0) {
        // 其他小程序的app_id不为空，跳转到其他的小程序
        if (data.path.length > 0) {
          wx.navigateToMiniProgram({
            appId: data.app_id,
            path: `${path}?${params.join("&")}`,
          });
        } else {
          wx.navigateToMiniProgram({ appId: data.app_id });
        }
      }
    },

    // 点击关闭关注公众号组件
    bindCloseOfficial() {
      this.isShowOfficial = false;
      wx.setStorageSync("isShowOffcial", false);
    },

    // 授权手机号登录 并且 `投简历`
    async bindGetPhoneNumberAndApply(e) {
      try {
        // 允许手机号授权
        await app.getPhoneNumber(e);
      } catch (err) {
        // 拒绝手机号授权
      }
      // 允许授权后进行多时间多地点选择或者进入极速报名或者报名成功
      // 拒接授权后进行多时间多地点选择或者进入极速报名
      this.$refs.applyPopup.init(this.cacheJobData.id);
    },

    // 登录组件手机号授权反馈
    async bindGetPhoneNumberCallBack(e) {
      await app.getPhoneNumber(e);
      this.init();
      this.__postEv(
        "@atype=click@ca_name=doumi@ca_source=h5@ca_from=login_success@from=wechat"
      );
    },

    // 账号登录
    bindAccountLogin() {
      wx.navigateTo({ url: `${loginPath}?callbackName=init` });
    },

    // x号关闭授权弹框
    bindGoBasic() {
      setTimeout(() => wx.navigateTo({ url: basicInfoFirstPath }), 300);
    },

    // 点击返回顶部并刷新
    bindBackTop() {
      this.__postEv(`@atype=click@ca_name=doumi@ca_source=h5@ca_from=refresh`);
      this.isUpdateIconShow = true;
      this.$refs.pullRefreshView.reSetScrollTop();
      // this.setData({ scrollTop: 0 })
      this.__getListData(1);
      this.updateIconRotate = true;
    },

    // 页面上拉触底事件的处理函数
    bindLoadMore() {
      if (canNextRequest && !this.showErrorTemp) {
        canNextRequest = false;
        this.__getListData();
      }
      this.refreshing = true;
      this.isUpdateIconShow = true;
    },

    closeBottomPlace() {
      this.refreshing = false;
    },

    // 监听scroll-view滚动
    bindScroll(evt) {
      const { windowHeight } = wx.getSystemInfoSync();
      const innerHeight = windowHeight - this.topHeight;
      let { scrollTop } = evt.detail;

      scrollThrottle();

      if (scrollTop > this.cacheScrollTop || scrollTop === innerHeight) {
        // 向下滚动
        if (this.isNewOpenId) this.__newOpenIdCome();
      } else {
        // 向上滚动
      }

      // 滚动时刷新按钮变透明
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => (this.isUpdateIconShow = true), 100);

      this.scrollTop = scrollTop;
      setTimeout(() => (this.cacheScrollTop = scrollTop), 0); // 给scrollTop重新赋值

      wx.$tracker.emit("scroll", evt); // 曝光埋点监听
    },

    // 职位列表的点击
    bindItemClick({
      currentTarget: {
        dataset: { ca_kw, id },
      },
    }) {
      const from = this.__getFrom();
      this.__postEv(
        `@ca_from=post_list@from=${from}@post_id=${id}@ca_kw=${ca_kw}@reqid=${this.reqid}`,
        null,
        true
      );
    },

    /*
     * 首页 `投简历` 按钮相关操作
     * 相关报名逻辑放到了 applyPopup 组件中
     */
    bindApplyData(id, { detail: { formId } }) {
      const from = this.__getFrom();
      this.__postEv(
        `@ca_from=list_resumes@from=${from}_max@post_id=${id}@reqid=${this.reqid}`,
        null,
        true
      );
      if (this.isBindPhone) {
        this.$refs.applyPopup.init(id);
      } else {
        this.cacheJobData = { id };
      }
    },

    // -------------------------------------------------------------------------
    // 页面方法, 双下划线开头表示私有方法, 供内部调用
    // -------------------------------------------------------------------------

    /**
     * 数据初始化
     */
    async init() {
      // 无网络结束向下运行
      const res = await mpx.getNetworkType();
      if (res.networkType === "none") {
        return wx.showToast({ title: "您似乎没有连接到网络喔~", icon: "none" });
      }

      if (this.isBindPhone) {
        // 已登录
        this.$refs.dialog.hideDialog();
        try {
          this.__showCollectCard();
          if (!this.isJumpBasicInfo) {
            // 冷启动时后登录态下未去过简历引导页, 检查简历是否完善, 不完善的跳转简历引导
            const resumeStatus = await this.__checkResumeInfo();
            if (resumeStatus === "complete") this.__renderPage();
          }
        } catch (err) {
          app.showErrorPageHandler(err);
        }
      } else {
        this.$refs.dialog.showDialog();
        if (this.listData.length === 0) this.__renderPage();
      }
    },

    /**
     * 初始化数据并渲染页面
     */
    async __renderPage() {
      try {
        const p1 = this.__getListData(); // 获取列表数据
        const p2 = this.__getZoneData(1); // 获取专区模块数据
        await Promise.all([p1, p2]);

        this.__postPv();

        // 面试提醒优先于签到提醒
        const isShowInterviewBox = await this.$refs.dmInterviewPop.check(); // 检查面试提醒
        if (!isShowInterviewBox) this.$refs.dmSurveyPop.check(); // 检查签到提醒
      } catch (err) {
        app.showErrorPageHandler(err);
      }
    },

    // - 重新选择城市后刷新数据
    async updateDataInCity() {
      this.filterQuery["district_id"] = "";
      this.__getZoneData();
      await this.__getListData(1);
    },

    /**
     * 初始化城市数据
     */
    async __initCityInfo() {
      try {
        // 地理位置授权
        await app.checkAuthAndGetLocation();
        await app.getCityInfo();
        cityStore.dispatch("updateCitiesAndDistricts");
        return Promise.resolve(true);
      } catch (err) {
        if (err === "noLocation") {
          if (cityStore.getters.currentCity.id === "") {
            // 拒绝定位后并且没有选择过城市跳转到城市选择页
            wx.reLaunch({ url: "../citySelector/citySelector" });
            return Promise.resolve(false);
          } else {
            // 拒绝定位且选择过城市
            return Promise.resolve(true);
          }
        } else {
          app.showErrorPageHandler(err);
        }
      }
    },

    __hideCollectCard() {
      if (!this.isCollected) {
        this.isCollected = true;
        wx.setStorageSync(IS_COLLECTED, true);
      }
    },

    __showCollectCard() {
      const isCollected = wx.getStorageSync(IS_COLLECTED);
      if (!isCollected) this.isCollected = false;
    },

    __postPv(dmch = "/jianzhi/index") {
      const listTypeOpt = { list_type: this.__getTrackListType() };

      if (app.globalData.locationData) {
        const { longitude, latitude } = app.globalData.locationData;
        api.setLog(1, dmch, { ...listTypeOpt, longitude, latitude });
      } else {
        api.setLog(1, dmch, listTypeOpt);
      }
    },

    __postEv(append = "", ...args) {
      if (!args[0]) args[0] = { list_type: this.__getTrackListType() };
      api.setLog(
        2,
        `@atype=click@ca_name=doumi@ca_source=h5${append}`,
        ...args
      );
    },

    __getFrom() {
      const jobDateType = this.__getTrackListType().replace("tz", "");
      return `postlist_sy_${jobDateType}`;
    },

    __getTrackListType() {
      const jobDateType = ~~this.filterQuery["job_date_type"];
      const listType =
        jobDateType === 0 ? "tuijian" : jobDateType === 1 ? "jztz" : "qztz";
      return listType;
    },

    /**
     * 检查报名成功的职位并添加 `已投递` 状态
     * 通常用于在首页点击 `投简历` 或者 `在详情页报名成功后`,返回首页时执行检查
     */
    __checkAppliedJob() {
      if (wx.appliedIds.length === 0 && wx.calcelApplyIds.length === 0) return;

      this.listData.forEach((x) => {
        if (wx.appliedIds.some((xx) => +xx.id === +x.id)) {
          x.is_applied = true;
        } else if (wx.calcelApplyIds.some((xx) => +xx.id === +x.id)) {
          x.is_applied = false;
        }
      });
    },

    // 判断是否为新的openId
    async __newOpenIdCome() {
      this.isNewOpenId = false;
      const params = {
        open_id: app.globalData.openId,
        user_from: this.options.from,
      };
      try {
        const res = await util.getData("scroll/push", params, "POST");
        const { code, msg } = res.data;

        if (code === 1002) {
          wx.setStorage({
            key: "isNewOpenId",
            data: false,
          });
        } else if (code === 1000) {
          wx.setStorage({
            key: "isNewOpenId",
            data: false,
          });
        } else {
          console.log(msg);
        }
      } catch (err) {
        console.log(err);
      }
    },

    /**
     * 获取专区模块数据
     */
    async __getZoneData() {
      try {
        const res = await util.getData(
          `client/indexmeta?citydomain=${this.currentCity.domain}`
        );
        const { code, data } = res.data;

        if (code === 1000) {
          this.zoneData = data.operation;
        }
      } catch (err) {
        app.showErrorPageHandler(err);
      }
    },

    /**
     * 获取列表数据
     */
    async __getListData(page = this.page) {
      const { cityInfo, locationData } = app.globalData;
      this.locationData = locationData;
      this.showErrorTemp = false;
      this.page = page;
      if (this.page > 1) {
        // DMC-3304翻页加载ev埋点
        this.__postEv(`@ca_from=nextpage@pn=${this.page}`);
      }

      const baseParams = this.searchQuery;
      const deviceInfo = wx.getSystemInfoSync();
      const arithmeticParams = {
        exposure_ids: wx.exposureIds || [],
        click_ids: wx.clickIds || [],
        applied_ids: wx.appliedIds || [],
        device_info: {
          platform: deviceInfo.platform, // 平台 android ios
          manufacturer: deviceInfo.brand, // 厂商
          model: deviceInfo.model, // 型号
          version: deviceInfo.system, // android版本
          ip: "", // ip地址
          isp: "", // 运营商
          ram: 0, // 内存
          soc: "", // SOC
        },
      };
      const dropIds = arithmeticParams.exposure_ids.map((x) => x.id.toString());
      const dropParams = {
        // - 用于帖子降权显示的参数
        posts_exposed: dropIds,
        posts_removed: dropIds,
      };
      const isRecommendSort = ~~baseParams.sort === 0; // - 是否是推荐排序
      const allParams = isRecommendSort
        ? { ...baseParams, ...arithmeticParams, ...dropParams }
        : baseParams;

      try {
        const res = await util.getData(
          `client/list?citydomain=${cityInfo.domain}`,
          allParams,
          "POST"
        );
        let { data, shareData, last_page, current_page } = res.data.data;

        data = data.map((x) => {
          const tags = [x.payment_type_str, ...x.welfare_tag];
          x.tags = [
            { color: "#6FA0FF", text: "新", show: x.is_new },
            { color: "#FF8066", text: "急聘", show: x.is_jipin },
            { color: "#FF7F0F", text: "自营", show: x.is_ziying },
            { color: "#54B2F4", text: "名企", show: x.is_mingqi },
            ...tags.map((x) => ({ color: "", text: x, show: true })), // - 月结和福利标签
          ];
          return x;
        });

        let listData = this.listData;

        if (res.data.code === 1000) {
          this.reqid = res.data.cityInfo.reqid;
          if (data.length > 0) {
            canNextRequest = true;

            if (this.page === 1) {
              this.showButtomLoading = true;
              this.shareData = shareData;
              this.$refs.pullRefreshView.reSetScrollTop();
              listData = data;
            } else {
              listData = [...this.listData, ...data];
            }

            if (last_page === 1 || current_page === last_page) {
              canNextRequest = false;
              this.showNoMore = true;
              this.showButtomLoading = false;
            } else {
              // 可以加载下一页
              this.page++;
            }
          } else if (data.length === 0) {
            canNextRequest = false;
            if (this.page === 1) {
              this.showErrorTemp = true;
              this.errorType = "noData";
              return (this.listData = []);
            } else {
              this.showNoMore = true;
              this.showButtomLoading = false;
            }
          }
          this.showErrorTemp = false;
          this.refreshing = false;
          this.errorType = "";
          this.listData = listData;
          this.$nextTick(() => this.__initTracker());
          // isRecommendSort && wx.$cleanAllIds()
        } else {
          canNextRequest = true;
          this.page === 1
            ? app.showErrorPageHandler(res.data)
            : app.showErrorToastHandler(res.data);
        }
      } catch (err) {
        if (err === "offline") this.listData = [];
        canNextRequest = true;
        app.showErrorPageHandler(err);
      }
      this.updateIconRotate = false;
    },

    /**
     * 检查简历信息是否全
     */
    async __checkResumeInfo() {
      try {
        const res = await util.getData("profile/uncompletedx");
        const { data, code } = res.data;
        if (code === 1000) {
          if (data.length > 0) {
            // - 存在需要补充简历信息的字段, 跳转B流程补充信息引导页
            this.bindGoBasic();
          } else {
            return Promise.resolve("complete");
          }
        } else {
          return Promise.resolve("complete");
        }
      } catch (err) {
        return Promise.reject(err);
      }
    },

    /**
     * 曝光埋点初始化
     */
    __initTracker() {
      const { from } = this.options;
      wx.$tracker
        .trackExposure("/jianzhi/index", {
          el: { list: ".dm-list" },
          dmalog: (list) => {
            list = JSON.stringify(list);
            return `@atype=scroll@ca_name=doumi@ca_source=h5@from=${from}@ca_from=post_list@show_post_id=${list}`;
          },
        })
        .success((arg) => console.log("曝光埋点发起成功: ", arg))
        .fail((err) => console.warn("曝光埋点发起失败: ", err));
    },
  },
});
