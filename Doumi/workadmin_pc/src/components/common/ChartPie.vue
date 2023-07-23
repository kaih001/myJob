<template>
  	<div class="chartpie">
		<div class="chart_pie_main" :id="id"></div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
import echarts from 'echarts'

export default {
  	name: 'Chartpie',
  	data () {
    	return {
    		myChart: null,
    	}
  	},
  	props: [ 'id', 'name', 'data', 'color' ],
  	computed: {

  	},
  	methods: {
    	init() {
            //基于准备好的dom，初始化echarts实例
            this.myChart = echarts.init(document.getElementById(this.id));
            this.initEcharts()
    	},
    	// 绘制图表
    	initEcharts(series) {
    		let _this = this
			this.myChart.setOption({
				color: this.color,
				tooltip: {
					// confine: true,//是否将 tooltip 框限制在图表的区域内。
					// position: function (point, params, dom, rect, size) {
					//      return [point[0], point[1]];
					// },
					padding: [12, 12],
			        trigger: 'item',
			        backgroundColor: 'rgba(31,45,61,.7)',
			        formatter: function (params, ticket, callback) {
			        	// console.log(params)
			        	let str = '<div style="font-size:12px;font-weight:bold;line-height:16px;color:#fff;margin-bottom:4px;">' + params.seriesName + '</div>'
			        	str += '<div style="height:16px;line-height:16px;font-size:12px;color:#fff;">' + params.data.name + '：' + params.data.value + '（' + params.percent + '%）</div>'
			        	return str
			        }
			    },
			    series: [
			        {
			            name: this.name,
			            type:'pie',
			            radius: ['50%', '88%'],
			            avoidLabelOverlap: false,
			            label: {
			                normal: {
			                    show: false,
			                    position: 'center'
			                },
			                emphasis: {
			                    show: true,
			                    textStyle: {
			                        fontSize: '13',
			                        fontWeight: 'bold'
			                    }
			                }
			            },
			            labelLine: {
			                normal: {
			                    show: false
			                }
			            },
			            // itemStyle: {
			            // 	normal: {
			            // 		color: function(params){
			            // 			// console.log(params)
			            // 			switch (params.dataIndex){
			            // 				case 0:
			            // 					return 'red'
			            // 				break;
			            // 				case 1: 
			            // 					return 'blue'
			            // 				break;
			            // 				case 2: 
			            // 					return 'yellow'
			            // 				break;
			            // 			}
			            // 			return 'block'
			            // 		}
			            // 	}
			            // },
			            // data:[
			            //     {value:335, name:'直接访问'},
			            //     {value:310, name:'邮件营销'},
			            //     {value:234, name:'联盟广告'},
			            //     {value:134, name:'加盟服务'},
			            //     {value:434, name:'只能互联'},
			            //     {value:135, name:'视频广告'},
			            //     {value:1548, name:'搜索引擎'}
			            // ],
			            data: this.data
			        }
			    ]
			})
    	},
  	},
  	mounted() {
    	this.init()
  	},
	watch: {
	  	'data' () {
      		this.initEcharts()
	  	}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chartpie{
	margin: 0 auto;
	width: 180px;
	height:180px;
}
.chartpie .chart_pie_main{
	width:180px;
	height:180px;
}
</style>
