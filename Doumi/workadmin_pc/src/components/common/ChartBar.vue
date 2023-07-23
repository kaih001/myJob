<template>
  	<div class="chartbar">
        <div class="bar_cont">
			<div class="chart_bar_main" :id="id"></div>
        </div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
import echarts from 'echarts'

export default {
  	name: 'ChartBar',
  	data () {
    	return {
    		myChart: null,
    	}
  	},
  	props: [ 'id', 'type', 'xData', 'yData' ],
  	computed: {

  	},
  	methods: {
    	init() {
            //基于准备好的dom，初始化echarts实例
            this.myChart = echarts.init(document.getElementById(this.id));
            //获取图表数据
            this.initEcharts()
    	},
    	// 绘制图表
    	initEcharts() {
    		let _this = this

    		if(this.type == 1){
    			let dataShadow = []
    			for (var i = 0; i < this.yData.length; i++) {
    			    dataShadow.push(parseInt(Math.max(...this.xData)*1.1/100+1)*100);
    			}

    			let height = this.yData.length * 30 + 20
    			$('#'+this.id).height(height)
    			this.myChart.resize({
    				height: height,
    			})

    			this.myChart.setOption({
    				tooltip : {
    					show: false,
    			    },
    			    grid: {
    			    	height: height,
    			    	top: 0,
    			        left: 0,
    			        right: 0,
    			        containLabel: true
    			    },
    			    xAxis : [
    			        {
    			            type : 'value',
    			            show: false,
    			            axisLine: {
    			            	lineStyle: {
    			            		color: '#f0f2f4'
    			            	}
    			            }
    			        }
    			    ],
    			    yAxis : [
    			        {
    			            type : 'category',
    			            inverse: true,//反向坐标轴
    			            axisLine: {
    			            	lineStyle: {
    			            		color: '#f0f2f4'
    			            	}
    			            },
    			            axisTick : {
    			            	show: false,
    			            },
    			            axisLabel: {
                                interval: 0,
    			            	textStyle: {
    			            		color: '#5e6d82',
    			            		fontSize: 13,
    			            	},
    			            	formatter: (obj) => {
    			            		// console.log(obj)
    			            		obj = obj.split('&&&')[0]
    			            		if(obj.length>12){
    			            			return obj.substr(0,12)+'...'
    			            		}
    			            		return obj
    			            	}
    			            },
    			            data : this.yData
    			        }
    			    ],
    			    series : [
    			    	{ // For shadow
			                type: 'bar',
			                itemStyle: {
			                    normal: {
			                    	color: 'rgba(0,0,0,0.05)'
			                    }
			                },
			                data: dataShadow,
			                animation: false
			            },
    			        {
    			            name:'利润',
    			            type:'bar',
    			            // barWidth: 16,
    			            barMinHeight: 2,
			                barGap:'-100%',
    			            barCategoryGap: '14',
    			            label: {
    			                normal: {
    			                    show: true,
    			                    position: 'right',
    			                    color: '#6699ee',
    			                    fontSize: 13,
    			                    verticalAlign: 'middle',
    			                    offset: [1,-2]
    			                }
    			            },
    			            itemStyle: {
    			            	normal: {
    			            		color: '#85AFF5'
    			            	}
    			            },
    			            data: this.xData
    			        }
    			    ]
    			})
    		}else if(this.type == 2){//百分比类型
    			let dataShadow = []
    			for (var i = 0; i < this.yData.length; i++) {
    			    dataShadow.push(100);
    			}

    			let height = this.yData.length * 40 + 20
    			$('#'+this.id).height(height)
    			this.myChart.resize({
    				height: height,
    			})

    			this.myChart.setOption({
    				tooltip : {
    					show: false,
    			    },
    			    grid: {
    			    	height: height,
    			    	top: 0,
    			        left: 0,
    			        right: 38,
    			        containLabel: true
    			    },
    			    xAxis : [
    			        {
    			            type : 'value',
    			            show: false,
    			            axisLine: {
    			            	lineStyle: {
    			            		color: '#f0f2f4'
    			            	}
    			            }
    			        }
    			    ],
    			    yAxis : [
    			        {
    			            type : 'category',
    			            inverse: true,//反向坐标轴
    			            axisLine: {
    			            	lineStyle: {
    			            		color: '#f0f2f4'
    			            	}
    			            },
    			            axisTick : {
    			            	show: false,
    			            },
    			            axisLabel: {
    			            	textStyle: {
    			            		color: '#5e6d82',
    			            		fontSize: 13,
    			            	},
    			            	formatter: (obj) => {
    			            		// console.log(obj)
    			            		obj = obj.split('&&&')[0]
    			            		if(obj.length>12){
    			            			return obj.substr(0,12)+'...'
    			            		}
    			            		return obj
    			            	}
    			            },
    			            data : this.yData
    			        }
    			    ],
    			    series : [
    			    	{ // For shadow
			                type: 'bar',
			                itemStyle: {
			                    normal: {
			                    	color: 'rgba(0,0,0,0.05)'
			                    }
			                },
			                data: dataShadow,
			                animation: false,
			            },
    			        {
    			            name:'利润',
    			            type:'bar',
    			            // barWidth: 24,
    			            barMinHeight: 2,
			                barGap:'-100%',
    			            barCategoryGap: '16',
    			            label: {
    			                normal: {
    			                    show: true,
    			                    position: 'right',
    			                    color: '#6699ee',
    			                    fontSize: 13,
    			                    verticalAlign: 'middle',
    			                    offset: [1,-2],
    			                    formatter: (obj) => {
    			                    	// console.log(obj.value)
    			                    	return obj.value + '%'
    			                    }
    			                }
    			            },
    			            itemStyle: {
    			            	normal: {
    			            		color: '#85AFF5'
    			            	}
    			            },
    			            data: this.xData
    			        }
    			    ]
    			})
    		}

    		this.myChart.off('click')//防止多次注册
    		this.myChart.on('click', (params) => {
    			// console.log(params)
    			// console.log(params.name.split(',')[1])
    			let par = params.name.split('&&&')[1]+''
                if(par && par !== 'null' && par !== 'undefined'){
    				this.$emit('clickFn', {department_id: params.name.split('&&&')[1], department_name: params.name.split('&&&')[0]})
    			}

    		})
    	},
  	},
  	mounted() {
    	this.init()
  	},
  	watch: {
  	  'xData' () {
        this.initEcharts()
  	  }
  	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chartbar .bar_cont{
	width:100%;
	position: relative;
	overflow: hidden;
}
.chartbar .bar_cont .chart_bar_main{
	width:100%;
	height:300px;
	overflow: hidden;
}
</style>
