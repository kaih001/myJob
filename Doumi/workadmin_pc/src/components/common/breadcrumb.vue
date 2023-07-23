<template>
  	<div class="breadcrumb">
    	<div class="wraper">
      <!-- slot插槽内放router-link或者自定义 a 标签；具体使用参照 Kqtasklist-->
    		<slot></slot>
    	</div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

export default {
  	name: 'breadcrumb',
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
   //      this.init()
  	//   }
  	// }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.breadcrumb{
    float: left;
    padding-top:18px;
}
.breadcrumb .wraper{
    
}
.breadcrumb .wraper a{
    font-size: 13px;
    color: #6699ee;
    font-weight: bold;
}
.breadcrumb .wraper a:last-child{
    color: #8492a6;
    cursor: default;
}
.breadcrumb .wraper a:after{
    content: '';
    margin-left: 8px;
    display: inline-block;
    width: 10px;
    height: 10px;
    background: url(../../assets/imgs/payListDetail/arrow_right.svg)  no-repeat;
}
.breadcrumb .wraper a:last-child:after{
    display: none;
}
</style>
