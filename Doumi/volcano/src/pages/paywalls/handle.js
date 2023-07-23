import mpx, { createPage } from "@mpxjs/core";
import util from "~/utils/util";
import api from "~/utils/api";
import cityStore from "~/store/city";
import globalDataStore from "~/store/globalData";
import loginPath from "~/pages/login/login?resolve";
import basicInfoFirstPath from "~/pages/basicInfoFirst/basicInfoFirst?resolve";

const app = getApp();
const pageSize = 10; // 分页大小

let canNextRequest = true;
let scrollThrottle = () =>console.log(`Pages wait for injection after rendering`); // 内容区域滚动的节流

createPage({
  // -------------------------------------------------------------------------
  // 页面初始数据
  // -------------------------------------------------------------------------

  data: {
    page: 1,
    listData: [],
    locationData: {},
    showNoMore: false,
    showButtomLoading: false,
    showErrorTemp: false,
    showDistance: true,
    scrollTop: 0,
    cacheScrollTop: 0,
    errorType: "",
    isNewOpenId: true, // true: 新openid    false: 不是新的openid
    reqid: "-",
    filterQuery: {},
    isIpx: "",
    refreshing: false,
    nomore: false,
    navHeaderHeight: util.wxNavBarHeight() + util.wxStatusBarHeight(),
  },

  computed: {
    ...globalDataStore.mapState(["isBindPhone", "isJumpBasicInfo"]),
    ...cityStore.mapGetters(["currentCity"]),
    ...cityStore.mapState({
      searchQuery(state) {
        const { longitude, latitude, locationCity, selectedCity } = state;

        return {
          page: this.page,
          pageSize,
          citydomain: locationCity.domain,
          lng: longitude,
          lat: latitude,
          city_id: selectedCity.id || locationCity.id,
          district_id: "",
          job_type: 0,
          sex: 0, // - 性别: 0全部 1男 2女
          identity: 0, // - 身份: 0全部 1学生 3非学生
          sort: 0, // - 默认推荐排序
          // more: 'y,z',
          job_date_type: 0, // - 0全部 1兼职 2全职
          open_id: app.globalData.openId,
          ...this.filterQuery,
        };
      },
    }),
  },

  watch: {
  },

  // -------------------------------------------------------------------------
  // 小程序生命周期
  // -------------------------------------------------------------------------

  onLoad(options) {
    const { isIpx } = app.globalData;
    let isNewOpenId = true;
    const userScene = wx.getLaunchOptionsSync()["scene"];
    wx.getStorage({
      key: "isNewOpenId",
      success(res) {
        if (!res.data) {
          isNewOpenId = !isNewOpenId;
        }
      },
    });
    this.setData({
      isIpx,
      isNewOpenId,
    });
    this.page = 1;
    canNextRequest = true;

    if (this.listData.length === 0) {
      this.showErrorTemp = false;
    }
  },

  onShow() {
  },

  async onReady() {
    // 确保有城市信息再去请求数据
    const hasCityInfo = await this.__initCityInfo();
    if (hasCityInfo) await this.__renderPage();
    setTimeout(() => this.init(), 800); // 延迟一会执行
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    app.globalData.fromMinePage = false;
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
    },

    async onContactPhoneNumber(e) {
      let { id, query, item } = e.detail;
      if(!id){
        wx.showToast({title:'该职位无效！',icon:'none'})
        return
      }
      // 查询是否已经消耗积分
      const res = await util.getData(`client/score/sub/record/${id}`, {}, 'GET')
      let { code,data} = res.data;
      if(code==1001){
        //查询剩余积分
        const points = await util.getData('client/score/myscore', {}, 'GET')
        let { my_score } = points.data.data;
        if(my_score==0){
            wx.showToast({
              title: '积分不足,请下载斗米app赚取积分',
              icon: 'none',
              mask: true,
              duration: 1500
            })
          return
        }else{
          //消耗积分
          const points = await util.getData(`client/score/subscore/${id}/2`)
          // 查询消耗积分后获取的电话
          const res = await util.getData(`client/score/sub/record/${id}`, {}, 'GET')
          let { code,data} = res.data;
          wx.makePhoneCall({
            phoneNumber: data.tel,
            success:async ()=>{
            },
            fail:()=>{
              wx.showToast({
                title: '获取电话失败',
                icon: 'none',
                mask: true,
                duration: 1500
              })
            }
          })
        }
      }else{
        wx.makePhoneCall({
            phoneNumber: data.tel,
            success:async ()=>{
            },
            fail:()=>{
              // wx.showToast({
              //   title: '获取电话失败',
              //   icon: 'none',
              //   mask: true,
              //   duration: 1500
              // })
            }
          })
      }
    },

    // 下拉刷新
    bindPullDownRefresh() {
      this.refreshing = true;

      let update = setTimeout(() => {
        clearTimeout(update);
        this.updateDataInCity();
        this.refreshing = false;
        this.nomore = false;
      }, 400);
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
      if (value == 3) {
        wx.navigateTo({ url: `../paywall/paywall` });
        return;
      }
    },



    // 页面上拉触底事件的处理函数
    bindLoadMore() {
      if (canNextRequest && !this.showErrorTemp) {
        canNextRequest = false;
        this.__getListData();
      }
      this.refreshing = true;
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

      this.scrollTop = scrollTop;
      setTimeout(() => (this.cacheScrollTop = scrollTop), 0); // 给scrollTop重新赋值
    },

    // 职位列表的点击
    bindItemClick({
      currentTarget: {
        dataset: { ca_kw, id },
      },
    }) {
      const from = this.__getFrom();
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
        // this.$refs.dialog.hideDialog();
        try {
          if (!this.isJumpBasicInfo) {
            // 冷启动时后登录态下未去过简历引导页, 检查简历是否完善, 不完善的跳转简历引导
            const resumeStatus = await this.__checkResumeInfo();
            if (resumeStatus === "complete") this.__renderPage();
          }
        } catch (err) {
          app.showErrorPageHandler(err);
        }
      } else {
        if (this.listData.length === 0) this.__renderPage();
      }
    },

    /**
     * 初始化数据并渲染页面
     */
    async __renderPage() {
      try {
        const p1 = this.__getListData(); // 获取列表数据
        await Promise.all([p1]);

      } catch (err) {
        app.showErrorPageHandler(err);
      }
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
     * 获取列表数据
     */
    async __getListData(page = this.page) {
      const { cityInfo, locationData } = app.globalData;
      this.locationData = locationData;
      this.showErrorTemp = false;
      this.page = page;


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
      let pagess={
        page: this.page,
        pageSize:pageSize,
      }
      const allParams = { ...arithmeticParams, ...dropParams,...pagess }

      try {
        const res = await util.getData(
          `client/linggonglist?citydomain=${cityInfo.domain}`,
          allParams,
          "POST"
        );
        console.log('ddddddddddd',res);

        let { data, shareData, last_page, current_page } = res.data.data;

        // data = data.map((x) => {
        //   const tags = [x.payment_type_str, ...x.welfare_tag];
        //   x.tags = [
        //     { color: "#6FA0FF", text: "新", show: x.is_new },
        //     { color: "#FF8066", text: "急聘", show: x.is_jipin },
        //     { color: "#FF7F0F", text: "自营", show: x.is_ziying },
        //     { color: "#54B2F4", text: "名企", show: x.is_mingqi },
        //     ...tags.map((x) => ({ color: "", text: x, show: true })), // - 月结和福利标签
        //   ];
        //   return x;
        // });

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
