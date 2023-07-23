<template>
  <div class="ssTab_wrap">
    <h1 class="ss_title">社保管理</h1>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="预缴名单" name="1">
        <SocialSecurity ref="socialSecurityRef"></SocialSecurity>
      </el-tab-pane>
      <el-tab-pane label="在保名单" name="2">
        <ssTabIn ref="ssTabInRef"></ssTabIn>
      </el-tab-pane>
      <el-tab-pane label="停保名单" name="3">
        <ssTabStop ref="ssTabStopRef"></ssTabStop>
      </el-tab-pane>
      <el-tab-pane label="账单管理" name="4">
        <ssTabBill ref="ssTabBillRef"></ssTabBill>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as util from "../assets/js/util.js";
import SocialSecurity from './SocialSecurity.vue';
import ssTabIn from './ssTabIn.vue';
import ssTabStop from './ssTabStop.vue';
import ssTabBill from './ssTabBill.vue';
export default {
  name: "",
  components: {
    SocialSecurity,
    ssTabIn,
    ssTabStop,
    ssTabBill
  },
  props: {},
  data() {
    return {
      activeName: '1'
    }
  },
  computed: {

  },
  watch: {

  },
  mounted() {
    this.project_id = util.getLocalStorage('projectStorageInfo').project_id
    if(this.$route.query.tab){
      const tab = this.$route.query.tab
      this.activeName = tab
    }
  },
  methods: {
    handleClick(tab, event) {
      this.$router.push(`/project/${this.project_id}/ssTab?tab=${tab.name}`)
      if(tab.name === '1') {
        this.$refs.socialSecurityRef.init();
      } else if(tab.name === '2') {
        this.$refs.ssTabInRef.init();
      } else if(tab.name === '3') {
        this.$refs.ssTabStopRef.init();
      } else if(tab.name === '4') {
        this.$refs.ssTabBillRef.init();
      }
    }
  },
}
</script>

<style scoped>
.ssTab_wrap {
  padding: 16px 20px 0 20px;
  margin: 0 0 20px 0;
}
.ss_title {
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  color: #475568;
  margin: 0 0 15px 0;
}

</style>
<style>
.ssTab_wrap .el-tabs__active-bar {
  background-color: #6699ee;
}
</style>
