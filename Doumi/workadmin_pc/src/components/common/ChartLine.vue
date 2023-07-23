<template>
  	<div class="chartline">
        <div class="linear_cont">
			<div class="chart_line_main" :id="id"></div>
        </div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
import echarts from 'echarts'

export default {
  	name: 'ChartLine',
  	data () {
    	return {
    		myChart: null,
    	}
  	},
  	props: [ 'id', 'xData', 'yData' ],
  	computed: {

  	},
  	methods: {
    	init() {
            //基于准备好的dom，初始化echarts实例
            this.myChart = echarts.init(document.getElementById(this.id));
            this.initData()
    	},
    	initData(){
    		let series = []
  			this.yData.forEach((obj1) => {
    			let tempArr1 = []
    			if(typeof obj1.data[0] === 'object'){
    				tempArr1 = obj1.data
    			}else{
    				obj1.data.forEach((obj2, index) => {
    					let tempArr2 = []
    					tempArr2.push(index, obj2, obj2)
    					tempArr1.push(tempArr2)
    				})
    			}
    			if(this.yData.length == 1){
	  				series.push({
		  				name: obj1.name,
		  				type: 'line',
		  				smooth: true,
		  				data: tempArr1,
		  				lineStyle: {
		  					normal: {
		  						color: obj1.color
		  					}
		  				},
		  				itemStyle: {
		  					normal: {
		  						color: obj1.color
		  					}
		  				},
		  				areaStyle: {
			                normal: {
			                    // color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
			                    //     offset: 0,
			                    //     color: 'rgb(220, 233, 251)'
			                    // }, {
			                    //     offset: 1,
			                    //     color: 'rgb(252, 253, 255)'
			                    // }])
			                    color: '#F2F7FF'
			                }
			            },
		  			})
    			}else{
	  				series.push({
		  				name: obj1.name,
		  				type: 'line',
		  				smooth: true,
		  				data: tempArr1,
		  				lineStyle: {
		  					normal: {
		  						color: obj1.color
		  					}
		  				},
		  				itemStyle: {
		  					normal: {
		  						color: obj1.color
		  					}
		  				}
		  			})
    			}
  				
  			})
  			if(series.length){
            	this.initEcharts(series)
  			}
    	},
    	// 绘制图表
    	initEcharts(series) {
    		let _this = this
			this.myChart.setOption({
				title: { 
					// text: '出勤情况',
					textStyle: {
						color: '#475568',
						fontWeight: 700,
						fontSize: 16,
					},
					padding: [19, 20]
				},
				grid: {
					containLabel: true,
					left: 0,
					height:300,
					right:1,
					top: 10
				},
				axisPointer: {
					lineStyle: {
						color: '#c0ccda'
					}
				},
				tooltip: {
					trigger: 'axis',
					enterable: true,
					confine: true,
					// position: function (point, params, dom, rect, size) {
					// 	return [point[0]+10, point[1]+10];
					// },
					position: function (pos, params, dom, rect, size) {
					      // console.log(pos)
					      // console.log(size)
					      // var obj = {top: 30};
					      // obj[[ 'right'][(pos[0] < size.viewSize[0] / 2)]] = 5;
					      // return obj;
					  },
					padding: [16, 16],
					backgroundColor: '#fff',
					borderColor: '#e0e6ed',
					borderWidth: 1,
					extraCssText: 'box-shadow: 0 2px 38px 0 rgba(0, 0, 0, 0.07);line-height:25px;color: #475568;font-size: 12px;font-weight: normal;font-style: normal;font-stretch: normal;',
					textStyle: {
						color: '#475568'
					},
					transitionDuration: .5,
					// formatter:  '{b0}<br/>{a0}: <a href="http://www.baidu.com">{c0}</a><br/>' + '缺勤：' + 10,
					formatter: function (params, ticket, callback) {
						// console.log(params)
						let str = ''
						str += '<div style="font-size:12px;line-height:14px;font-weight:600;color:#475669;margin-bottom:5px;">' + params[0].name + '</div>'
						params.forEach((obj) => {
							str += '<div style="height:17px;line-height:17px;font-size:12px;color:#475669;padding-top:8px;min-width:72px;"><div style="float:left;width:8px;height:8px;border-radius:50%;background:'+obj.color+';margin:4px 8px 5px 0;"></div><div style="float:left;margin-right:11px;">'+obj.seriesName+'</div><div style="font-size:14px;float:left;color:#8492a6;">' + obj.data[2] + '</div></div>'
						})
						return str
					}
				},
				xAxis: {
					splitLine: {
						show: true,
						lineStyle: {
					        color: '#eceff2'
					    }
					},
					axisLine: {
						lineStyle: {
							color: '#e0e6ed',
							width: 2
						}
					},
					type: 'category',
					axisTick: {
						alignWithLabel: true,
							lineStyle: {
							width: 2
						}
					},
					axisLabel: {
						textStyle: {
							color: '#5e6d82',
							fontSize: 13,
						}
					},
					data: this.xData
				},
				yAxis: {
					// min: 1,
					minInterval: 1,
					axisLine: {
						lineStyle: {
							color: '#eceff2',
							width: 1
						}
					},
					axisTick: {
						show: false,
						alignWithLabel: true,
						lineStyle: {
							width: 2
						}
					},
					axisLabel: {
						textStyle: {
							color: '#5e6d82',
							fontSize: 13,
						}
					},
					splitLine: {
						lineStyle: {
					        color: '#eceff2'
					    }
					}
				},
				series: series
			})
			this.load_end = true
    	},
  	},
  	mounted() {
    	this.init()
  	},
	watch: {
	  	'yData' () {
      		this.initData()
	  	}
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chartline .linear_cont{
	width:100%;
	position: relative;
	overflow: hidden;
}
.chartline .linear_cont .chart_line_main{
	width:100%;
	height:360px;
	overflow: hidden;
}
</style>
