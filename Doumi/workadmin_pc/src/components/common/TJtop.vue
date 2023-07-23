<template>
  	<div class="tjtop">
        <div class="top">
            <div class="title">{{title}}</div>
            <div class="sel_date" v-if="show_sel_date">
                <el-date-picker
                    v-model="date.date"
                    type="daterange"
                    align="right"
                    placeholder="选择日期范围"
                    :editable="false"
                    :clearable="false"
                    @change="changeDateFn"
                    :picker-options="pickerOptions">
                </el-date-picker>
            </div>
            <div class="sel_date" v-if="show_sel_post">
              <el-select v-model="postId" placeholder="全部职位" @change="changePostFn" style="width:242px;margin:0 13px 0 23px;">
                <el-option
                  v-for="item in postIds"
                  :key="item.id"
                  :label="item.title"
                  :value="item">
                </el-option>
              </el-select>
            </div>
        </div>
  	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'

export default {
  	name: 'TJtop',
  	data () {
    	return {
    		pickerOptions: {
    		    shortcuts: [
    		        
    		    ],
    		    disabledDate(time) {
    		    	return time.getTime() > Date.now() - 24 * 3600 * 1000 || time.getTime() < Date.now() - 365 * 24 * 3600 * 1000
    		    },
    		    onPick({ maxDate, minDate }) {
    		    	if(minDate && maxDate === null){
    		    		this.disabledDate = (time) => {
    		    			return time.getTime() > Date.now() - 24 * 3600 * 1000 || time.getTime() < Date.now() - 365 * 24 * 3600 * 1000 || time.getTime() < minDate.getTime() || time.getTime() > minDate.getTime() + 30 * 24 * 3600 * 1000
    		    		}
    		    	}else{
    		    		this.disabledDate = (time) => {
    		    			return time.getTime() > Date.now() - 24 * 3600 * 1000 || time.getTime() < Date.now() - 365 * 24 * 3600 * 1000
    		    		}
    		    	}
    		    }
    		},
        postId: '',
        postIds: this.post_ids || []
    	}
  	},
  	props: [ 'title', 'show_sel_date', 'show_sel_post', 'post_ids', 'date', 'shortcuts', 'monthNum' ],
  	methods: {
    	init() {
            
    	},
      changeDateFn(){
        // console.log(this.date)
        this.$emit('dateChange')
      },
      changePostFn(post) {
        this.$emit('postChange', post)
      }
  	},
  	mounted() {
  		this.pickerOptions.shortcuts.push(...this.shortcuts)
  		//初始化日历组件 快捷项
  		let date = new Date()
  		let year = date.getFullYear()
  		let month = Number(date.getMonth()+1)
  		let month_num = this.monthNum > 12 ? 12 : this.monthNum
  		for(let i = month-1; i >= month-month_num; i --){
  		    let num = 30
  		    switch(i){
  		        case 2: case -10:
  		            num = (year%4==0&&year%100!=0) || (year%4==0&&year%100==0&&year%400==0) ? 29 : 28
  		        break;
  		        case 1: case 3: case 5: case 7: case 8: case 10: case 12: case -11: case -9: case -7: case -5: case -4: case -2: case 0:
  		            num = 31
  		        break;
  		        case 4: case 6: case 9: case 11: case -8: case -6: case -3: case -1:
  		            num = 30
  		        break;
  		    }
  		    let tempObj = {
  		        text: i > 0 ? year+'-'+i : year-1 + '-' + (i+12),
  		        onClick(picker) {
  		            let start = new Date(year,i-1,1);
  		            let end = new Date(year,i-1,num);
  		            picker.$emit('pick', [start, end]);
  		        }
  		    }
  		    this.pickerOptions.shortcuts.push(tempObj)
  		}
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

<style>

</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tjtop .top{
    height: 64px;
    border-bottom: 1px solid #e0e6ed;
}
.tjtop .top .title{
    float: left;
    height: 64px;
    line-height: 64px;
    font-size: 16px;
    font-weight: bold;
    color: #475669;
}
.tjtop .top .sel_date{
    float: right;
    margin-top: 14px;
}
</style>
