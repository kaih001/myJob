<template>
  <div class="Notdefined">
    <div>404 not defined</div>
  </div>
</template>

<script>
import $ from 'jquery'
import * as util from '../assets/js/util.js'


// 基于准备好的dom，初始化echarts实例
let myChart = null

export default {
  name: 'Notdefined',
  data () {
    return {
      
    }
  },
  methods: {
    init() {
      
    },
    
  },
  mounted() {
    this.init()
  },
  // watch: {
  //   '$route' (to, from) {
  //     // 对路由变化作出响应...
  //     console.log(to.params.projectId)
  //   }
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.Notdefined div{
  font-size: 30px;
  margin-top: 100px;
  text-align: center;
}
</style>
