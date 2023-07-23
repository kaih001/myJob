import { createStore } from "@mpxjs/core";

const SET_LOCATION = "SET_LOCATION";
const SET_LOCATION_CITY = "SET_LOCATION_CITY";
const SET_SELECTED_CITY = "SET_SELECTED_CITY";
const SET_CITIES = "SET_CITIES";
const SET_DISTRICTS = "SET_DISTRICTS";
const SPREAD_CITIES = "SPREAD_CITIES";

export default createStore({
  state: {
    longitude: "", // - 经度
    latitude: "", // - 维度
    districts: [{ label: "全城", value: 0 }], // - 当前城市下的区列表
    cities: [], // - 城市列表
    locationCity: {
      // - 当前定位城市
      id: "",
      name: "",
      domain: "",
      parent_id: "",
    },
    selectedCity: wx.getStorageSync("selectedCity") || {
      // - 当前选择的城市
      id: "",
      name: "",
      domain: "",
    },
    allCityList: [],
  },
  getters: {
    currentCity(state) {
      return state.selectedCity.id !== ""
        ? state.selectedCity
        : state.locationCity;
    },
    flatAllCityList(state) {
      let temp = [];
      for (const item of state.allCityList) {
        temp = [...temp, ...item.cities];
      }
      return temp;
    },
  },
  mutations: {
    [SET_LOCATION](state, { longitude, latitude }) {
      state.longitude = longitude;
      state.latitude = latitude;
    },
    [SET_SELECTED_CITY](state, { id, name, domain }) {
      const selectedCity = { ...state.selectedCity, id, name, domain };
      wx.setStorageSync("selectedCity", selectedCity);
      state.selectedCity = selectedCity;
    },
    [SET_LOCATION_CITY](state, { locationCity }) {
      state.locationCity = { ...state.locationCity, ...locationCity };
    },
    [SET_CITIES](state, { cities }) {
      let temp = [];
      for (const item of cities) {
        temp = [...temp, ...item.cities];
      }
      state.cities = temp; //将所有的城市平铺展开放到一个同级数组里
    },
    [SET_DISTRICTS](state, { cities }) {
      const currentCity = state.selectedCity.id
        ? state.selectedCity
        : state.locationCity;
      const currentCityInfo =
        cities && cities.find((x) => +x.city_id === +currentCity.id);
      const districts = (currentCityInfo ? currentCityInfo.districts : []).map(
        (x) => ({ label: x["short_name"], value: x["district_id"] })
      );
      state.districts = [{ label: "全城", value: 0 }, ...districts];
    },
    /**
     * 将所有的城市平铺展开放到一个同级数组里
     * @param {Array} cities - 接口获取或者从存储拿的城市数据
     */
    [SPREAD_CITIES](state, { cities }) {
      state.allCityList = cities;
    },
  },
  actions: {
    async updateCitiesAndDistricts({ state, getters, commit }) {
      const app = getApp();
      const cities = await app.getAllCityList(); //有层级关系的城市
      commit("SPREAD_CITIES", { cities });
      commit("SET_CITIES", { cities });
      commit("SET_DISTRICTS", { cities:state.cities });
    },
  },
});
