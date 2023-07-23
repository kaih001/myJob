import { createPage } from "@mpxjs/core";
import util from "../../utils/util";
import api from "../../utils/api";
import globalDataStore from "~/store/globalData";
import basicInfoFirstPath from "~/pages/basicInfoFirst/basicInfoFirst?resolve";
import loginPath from "~/pages/login/login?resolve";
const app = getApp();
const pageSize = 10;
let page = 1;
let canNextRequest = true;
let dmch = "";

createPage({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------

  data: {
    // showDialog: false,
    show: 0,
    options: null,
    showNoMore: false,
    showButtomLoading: false,
    zoneListData: [],
    showErrorTemp: false,
    errorType: "",
    imageHeight: "",
    from: "",
    city_id: "",
    scrollTop: 0,
    isSelect: false,
    filterConfig: null,
    selectData: {
      districtId: "",
      streetId: "",
      jobId: "",
      sortId: "",
      moreId: "",
      sex: "",
      identity: "",
      moreArr: [],
    },
    setScrollTop: 0,
    fillHeight: 0,
    isNear: false, // 点击运行位跳转到聚合页离我最近的标示位,用于selector标签
    reqid: "-",
    navBarTitle: "",
    isIpx: "",
  },
  computed: {
    ...globalDataStore.mapState(["isBindPhone"]),
  },
  watch: {
    // 监听登录状态变化
    isBindPhone(newVal) {
      if (newVal) {
        this.$refs.dialog.hideDialog();
      }
    },
  },
  // -------------------------------------------------------------------------
  // 页面bind的事件
  // -------------------------------------------------------------------------

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { city_id } = options;
    if (options.city_id) {
      this.city_id = city_id;
    }
    if (options.from) {
      this.setData({ from: `&from=${options.from}` });
      api.setCasource("", options.from);
    }

    if (options.sort) {
      this.setData({ isNear: true });
    }

    if (options.scene) {
      const scene = decodeURIComponent(options.scene).split("&");
      scene.forEach((item, index, arr) => {
        if (item.indexOf("c=") > -1) {
          options.category = item.split("=")[1];
        } else if (item.indexOf("s=") > -1) {
          this.selectData.sortId = item.split("=")[1];
        }
      });
    }
    setTimeout(() => {
      if (this.isBindPhone) {
        this.$refs.dialog.hideDialog();
      } else {
        // this.showDialog = true;
        this.$nextTick(() => {
          this.$refs.dialog.showDialog();
        });
      }
    }, 3000);

    this.__initData(options);
    this.renderPage();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 在⽤户当⽇第2次打开⼩程序详情⻚从未弹过弹层时，为⽤户弹出弹层
    let openPrefectureTimes = wx.getStorageSync("openPrefectureTimes");
    let times = parseInt(openPrefectureTimes);
    if (!times) {
      times = 0;
      times += 1;
      wx.setStorageSync("openPrefectureTimes", times);
    } else {
      times += 1;
      wx.setStorageSync("openPrefectureTimes", times);
    }
    if (this.zoneListData.length > 0) {
      this.__initTracker();
    }

    if (dmch !== "") this.__postEv();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    // DMC-3304点击右上角分享按钮ev埋点
    api.setLog(
      2,
      `@atype=click@ca_name=doumi@ca_source=h5@ca_from=share_topright`
    );
    return util.shara(res);
  },

  methods: {
    // 登录组件手机号授权反馈
    async bindGetPhoneNumberCallBack(e) {
      await app.getPhoneNumber(e);
      // this.__postEv('@atype=click@ca_name=doumi@ca_source=h5@ca_from=login_success@from=wechat')
    },
    // 账号登录
    bindAccountLogin() {
      wx.navigateTo({ url: `${loginPath}?callbackName=renderPage` });
    },

    // x号关闭授权弹框
    bindGoBasic() {
      setTimeout(() => wx.navigateTo({ url: basicInfoFirstPath }), 300);
    },
    // 触发筛选处理控制定位逻辑
    select(e) {
      // 处理埋点逻辑
      this.setSelectLog(e);
      if (e.detail.type === "fsClick") {
        this.setData({ isSelect: e.detail.data.isSelect });
      } else {
        if (e.detail.selectType === "close") {
          return this.setData({ isSelect: false });
        } else if (
          e.detail.selectType === "district1" ||
          e.detail.selectType === "more"
        ) {
          return;
        }

        this.setData({
          selectData: e.detail.data,
          showButtomLoading: false,
        });

        page = 1;
        util.showLoading();

        this.__getaggrList();
        this.setData({
          isSelect: e.detail.data.isSelect,
        });
      }
    },
    // 触发筛选处理埋点逻辑
    setSelectLog(e) {
      if (e.detail.type === "fsClick") {
        if (e.detail.data.data === "jobType") {
          api.setLog(
            2,
            `@atype=click@ca_source=h5@ca_name=doumi@ca_from=open_type`
          );
        } else if (e.detail.data.data === "city") {
          api.setLog(
            2,
            `@atype=click@ca_source=h5@ca_name=doumi@ca_from=open_location`
          );
        } else if (e.detail.data.data === "sort") {
          api.setLog(
            2,
            `@atype=click@ca_source=h5@ca_name=doumi@ca_from=open_sort`
          );
        } else if (e.detail.data.data === "select") {
          api.setLog(
            2,
            `@atype=click@ca_source=h5@ca_name=doumi@ca_from=open_option`
          );
        }
      } else {
        if (e.detail.selectType === "job_type" && e.detail.data.jobId !== "") {
          api.setLog(
            2,
            `@atype=click@ca_source=h5@ca_name=doumi@ca_from=choose_type@item=${e.detail.data.jobText}`
          );
        } else if (
          e.detail.selectType === "district" &&
          e.detail.data.districtId !== ""
        ) {
          if (e.detail.data.districtText && e.detail.data.streetText) {
            api.setLog(
              2,
              `@atype=click@ca_source=h5@ca_name=doumi@ca_from=choose_location@item=${app.globalData.cityInfo.name}_${e.detail.data.districtText}_${e.detail.data.streetText}`
            );
          } else {
            api.setLog(
              2,
              `@atype=click@ca_source=h5@ca_name=doumi@ca_from=choose_location@item=${app.globalData.cityInfo.name}_${e.detail.data.districtText}`
            );
          }
        } else if (
          e.detail.selectType === "order" &&
          e.detail.data.sortId !== ""
        ) {
          api.setLog(
            2,
            `@atype=click@ca_source=h5@ca_name=doumi@ca_from=choose_sort@item=${e.detail.data.sortText}`
          );
        } else if (
          e.detail.selectType === "more" &&
          (e.detail.data.moreId.length !== 0 ||
            e.detail.data.identity !== "" ||
            e.detail.data.sex !== "")
        ) {
          api.setLog(
            2,
            `@atype=click@ca_source=h5@ca_name=doumi@ca_from=open_option`
          );
        } else if (e.detail.selectType === "reset") {
          api.setLog(
            2,
            `@atype=click@ca_source=h5@ca_name=doumi@ca_from=reset_option`
          );
        } else if (e.detail.selectType === "complete") {
          var concatStrArr = [];
          if (e.detail.data.sexText) {
            concatStrArr.push(e.detail.data.sexText);
          }
          if (e.detail.data.identityText) {
            concatStrArr.push(e.detail.data.identityText);
          }
          if (e.detail.data.moreId.length !== 0) {
            e.detail.data.moreArr = [];
            e.detail.data.moreId.forEach((item, index, arr) => {
              concatStrArr.push(item.split(",")[1]);
              e.detail.data.moreArr.push(item.split(",")[0]);
            });
            e.detail.data.moreArr = e.detail.data.moreArr.join(",");
          }
          if (concatStrArr.length !== 0) {
            api.setLog(
              2,
              `@atype=click@ca_source=h5@ca_name=doumi@ca_from=choose_option@item=${concatStrArr.join(
                ","
              )}`
            );
          }
        }
      }
    },

    /**
     * 打开地图定位
     */
    goToMap(e) {
      api.setLog(
        2,
        `@atype=click@ca_source=h5@ca_name=doumi@ca_from=go@post_id=${e.currentTarget.dataset.id}`
      );
      wx.openLocation({
        name: e.currentTarget.dataset.addressName,
        latitude: +e.currentTarget.dataset.latitude,
        longitude: +e.currentTarget.dataset.longitude,
        // scale: 28
      });
    },

    /**
     * 返回顶部
     */
    backTop() {
      this.setData({ setScrollTop: 0 });
      wx.pageScrollTo({ setScrollTop: 0 }); // 返回顶部
    },

    loadMore() {
      if (canNextRequest) {
        canNextRequest = false;
        this.__getaggrList();
      }
    },
    /**
     * 专区详情埋点
     */
    bindItemClick({
      currentTarget: {
        dataset: { index, id, label, query },
      },
    }) {
      const from = this.options.from || "direct_visits";

      api.setLog(
        2,
        `@atype=click@ca_name=doumi@from=${from}@ca_source=h5@ca_from=post_list@post_id=${id}@ca_kw=${index}@reqid=${this.reqid}`,
        null,
        true
      );

      wx.$addClickIds(id); // - 缓存算法所需参数

      query = query.replace(/&amp;/g, "&");
      if (label.includes("zhipin")) {
        // - 列表的直聘职位现在都走约面流程
        wx.navigateTo({
          url: `../jobDetailInterview/jobDetailInterview?${query}`,
        });
      } else {
        // - 走普通报名流程
        wx.navigateTo({ url: `../jobDetail/jobDetail?${query}` });
      }
    },

    openAuthSetting() {
      app.setAuthorize().then((res) => this.__showPage());
    },

    async __showPage() {
      page = 1;
      canNextRequest = true;

      util.showLoading();
      this.setData({ showErrorTemp: false });
      this.__setImageHeight();
      this.__getaggrList(); // 获取列表数据

      try {
        const { sort, filter } = this.options;
        const query = util.obj2uri({
          cityId: this.city_id || app.globalData.cityInfo.id,
          sort: sort || this.selectData.sortId,
        });
        const res = await util.getData(
          `client/aggregation/filtermenu?${query}`
        );
        const { data } = res.data;

        if (filter) {
          const showFilterArr = filter.split(",");
          const filterConfig = {};

          showFilterArr.forEach((item) => (filterConfig[item] = data[item]));
          this.setData({
            filterConfig,
            show: ++this.show,
          });
        } else {
          this.setData({
            filterConfig: "",
            show: ++this.show,
          });
        }
      } catch (err) {
        app.showErrorToastHandler(err);
      }
    },

    bindScroll(evt) {
      wx.$tracker.emit("scroll", evt);
    },

    // -------------------------------------------------------------------------
    // 页面方法, 双下划线开头表示私有方法, 供内部调用
    // -------------------------------------------------------------------------

    /**
     * 初始化数据并渲染页面
     */
    async renderPage() {
      try {
        await app.checkAuthAndGetLocation();
        await app.getCityInfo();
        this.__showPage();
        this.__postEv();

        // 面试提醒优先于签到提醒
        const isShowInterviewBox = await this.$refs.dmInterviewPop.check(); // 检查面试提醒
        if (!isShowInterviewBox) this.$refs.dmSurveyPop.check(); // 检查签到提醒
      } catch (err) {
        api.setLog(1, "/jianzhi/position_access");
        app.showErrorPageHandler(err);
      }
    },

    __postEv() {
      if (app.globalData.locationData) {
        const { longitude, latitude } = app.globalData.locationData;
        api.setLog(1, dmch, { longitude, latitude });
      } else {
        api.setLog(1, dmch);
      }
    },

    async __getaggrList() {
      let url = `client/aggregation/post/${this.options.category}`;
      let cityID = this.city_id ? this.city_id : app.globalData.cityInfo.id;
      let query = util.obj2uri({
        city_id: cityID,
        page,
        pageSize,
        district_id: this.selectData.districtId,
        street_id: this.selectData.streetId,
        job_type: this.selectData.jobId,
        sort: this.options.sort || this.selectData.sortId,
        more: this.selectData.moreId,
        sex: this.selectData.sex,
        identity: this.selectData.identity,
        lat: app.globalData.locationData.latitude,
        lng: app.globalData.locationData.longitude,
      });
      try {
        const res = await util.getData(`${url}?${query}`);
        const { code, data, cityInfo } = res.data;

        if (code === 1000) {
          let fillHeight = 0;
          let zoneListData = data.data;

          if (data.data.length < 10 && page === 1 && this.options.topic) {
            const height = Math.round(this.imageHeight);
            fillHeight = `${height}px`;
          }

          if (page !== 1) {
            api.setLog(
              2,
              `@atype=click@ca_source=h5@ca_name=doumi@ca_from=nextpage@pn=${page}`
            );
            zoneListData = [...this.zoneListData, ...data.data];
          }
          this.setData(
            {
              fillHeight,
              show: ++this.show,
              zoneListData,
            },
            () => this.__initTracker()
          );

          if (data.last_page !== 0 && data.data.length >= 10) {
            canNextRequest = true;
            page++;
            this.setData({ showNoMore: false, showButtomLoading: true });
          } else {
            canNextRequest = false;
            this.setData({ showNoMore: true, showButtomLoading: false });
          }

          this.setData({ reqid: cityInfo.reqid });
        } else {
          app.showErrorToastHandler(res.data);
        }

        util.hideLoading();
      } catch (err) {
        app.showErrorPageHandler(err);
      }
    },

    async __initData({ category }) {
      try {
        const res = await util.getData(
          `client/aggregation/post/${category}/info`
        );
        const { code, data } = res.data;

        if (code !== 1000) return app.showErrorToastHandler(res.data);

        this.setData({ options: data });

        if (category === "funny") {
          // - 好玩兼职
          dmch = `/jianzhi/haowanjianzhi/index`;
          wx.setNavigationBarTitle({ title: "好玩兼职" }); // 页面标题为路由参数
          this.setData({ navBarTitle: "好玩兼职" }); // 自定义头部title
        } else if (category === "zhipin") {
          // - 高薪全职
          dmch = `/jianzhi/gaoxinjianzhi/index`;
          wx.setNavigationBarTitle({ title: "高薪全职" }); // 页面标题为路由参数
          this.setData({ navBarTitle: "高薪全职" }); // 自定义头部title
        } else {
          // - 聚合页
          dmch = `/jianzhi/juhe`;
          wx.setNavigationBarTitle({ title: data.title });
          this.setData({ navBarTitle: data.title }); // 自定义头部title
        }
      } catch (err) {
        dmch = `/jianzhi/juhe`;
        app.showErrorToastHandler(err);
      }
    },

    /**
     * 曝光埋点初始化
     */
    __initTracker() {
      const from = this.options.from || "direct_visits";
      wx.$tracker
        .trackExposure(dmch, {
          el: { list: ".dm-list-item" },
          dmalog: (list) => {
            list = JSON.stringify(list);
            return `@atype=scroll@ca_name=doumi@ca_source=h5@from=${from}@ca_from=post_list@show_post_id=${list}`;
          },
        })
        .success((arg) => console.log("曝光埋点发起成功: ", arg))
        .fail((err) => console.warn("曝光埋点发起失败: ", err));
    },

    __setImageHeight() {
      var self = this;
      var $width = 750; // 图片原始宽度
      var $height = 378; // 图片原始高度
      var ratio = $width / $height;
      wx.getSystemInfo({
        success(res) {
          // (屏幕宽度-父元素左右padding总和-图片左右margin总和*图片个数)/图片个数
          var viewWidth = res.windowWidth - 22 - 10;
          var viewHeight = viewWidth / ratio;
          self.setData({
            imageHeight: viewHeight,
          });
        },
      });
    },
  },
});
