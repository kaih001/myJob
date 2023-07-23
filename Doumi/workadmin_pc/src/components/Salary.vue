<template>
  <div class="projectset">
    <div class="header-title">
      <h2>工资条</h2>
    </div>
    <div class="project_main">
      <img
        class="image"
        src="https://cdn.doumistatic.com/233,01fafac09e6441bf.png"
        alt=""
      />
      <div class="btn" @click="goSalary">跳转到工资条</div>
    </div>
  </div>
</template>
<script>
import * as util from "../assets/js/util.js";
export default {
  data: function () {
    return {
      salary: "mvp",
    };
  },
  computed: {},
  vuex: {},
  watch: {},
  methods: {
    goSalary() {
      window.open("//qifu.doumi.com/salary/homepage/upload?from=saas");
    },
  },
  created() {},
};
</script>

<style scope>
.projectset {
  padding: 0 20px;
}
.projectset .header-title {
  padding: 16px 0;
  overflow: hidden;
  border-bottom: 1px solid #e0e6ed;
}
.projectset .header-title h2 {
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  color: #475568;
  line-height: 1.4;
}
.projectset .project_main {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 100px;
}
.projectset .project_main .image {
  margin-bottom: 30px;
  width: 300px;
  height: 200px;
}
.projectset .project_main .btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 210px;
  height: 40px;
  background: #6699ee;
  border-radius: 2px;
  font-family: PingFangSC-Medium;
  font-size: 14px;
  color: #ffffff;
}
.projectset .project_main .btn:hover{
  cursor:pointer;
}
</style>
