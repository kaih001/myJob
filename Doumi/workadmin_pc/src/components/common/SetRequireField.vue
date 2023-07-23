<template>
	<div class="setrequirefield">
		<div class="kqfields" id="items">
			<div class="kqfield_item" :class="{'dragitem': item.type !== 'Location'}" v-for="(item, index) in require_field">
				<div class="kqfield_icon glyphicon-move" v-if="item.type !== 'Location'"></div>
				<div class="kqfield_name">{{item.info.title}} {{item.info.required == 1 ? '（必填）' : ''}}</div>
				<div class="kqfield_edit" @click="showNewKqfieldDialog(item, index)"></div>
				<div class="kqfield_del" v-if="item.type !== 'Location'" @click="delKqfieldFn(index)"></div>
			</div>
		</div>
		<div class="add_kqfield" style="padding: 14px 190px;">
			<div class="add_item" @click="showNewKqfieldDialog('new')">添加填写项</div>
		</div>
		<div class="new_kqfield">
			<el-dialog :title="new_kqfield.index==-1?'添加填写项':'编辑填写项'" :visible.sync="dialogNewKqfield">
				<div class="new_kqfield_main" :style="new_kqfield.type === 'Select'?'max-height:378px;overflow:auto;':''">
					<el-form :model="new_kqfield" :rules="rules" ref="new_kqfield" label-width="87px" style="width:340px;">
					  	<el-form-item label="类型" prop="type">
					    	<el-select v-model="new_kqfield.type" placeholder="请选择" :disabled="new_kqfield.index != -1" @change="changeType">
					    	    <el-option
									v-for="item in kqfield_types"
									:disabled="item.value === 'Location'"
									:key="item.value"
									:label="item.label"
									:value="item.value">
					    	    </el-option>
					    	</el-select>
					  	</el-form-item>
					  	<el-form-item label="标题" prop="title">
					    	<el-input v-model="new_kqfield.title" placeholder='请输入' style="width:253px;"></el-input>
					  	</el-form-item>
					  	<el-form-item label="提示语" prop="tip" :style="new_kqfield.type !== 'Select'&&new_kqfield.type !== 'Imageview'?'margin-bottom:7px;':''">
					    	<el-input
								type="textarea"
								resize="none"
								:rows="3"
								placeholder="请输入提示语"
								v-model="new_kqfield.tip">
					    	</el-input>
					  	</el-form-item>
					  	<el-form-item label="选项" prop="options" v-if="new_kqfield.type === 'Select'" style="margin-bottom:10px;">
					    	<div class="options">
					    		<div class="option" v-for="(option, index) in new_kqfield.options">
					    			<div>
					    				<el-input v-model="option.value" placeholder='请输入选项' style="width:219px;" @blur='checkInputFn'></el-input>
					    			</div>
					    			<div class="del_icon">
					    				<el-tooltip :enterable="false" effect="dark" content="至少保留2个选项" placement="top" v-if="new_kqfield.options.length<=2">
					    					<div class="del_in" :class="{'undel':new_kqfield.options.length<=2}" @click="delOptionFn(index)"></div>
					    				</el-tooltip>
					    				<div class="del_in" v-else :class="{'undel':new_kqfield.options.length<=2}" @click="delOptionFn(index)"></div>
					    			</div>
					    			<div class="err_msg">请输入选项</div>
					    		</div>
					    		<!-- <div class="add_option"></div> -->
					    	</div>
					    	<div class="add_option">
					    		<div class="add_item" @click="addOptionFn">添加选项</div>
					    	</div>
					  	</el-form-item>
					  	<el-form-item label="示例图片" prop="example_img" v-if="new_kqfield.type === 'Imageview'" style="margin-bottom:0px;">
							<div class="image_box">
							    <div class="images" v-for="(image,index) in images">
							    	<div class="img preview-img" :style="'background-image:url('+image.msrc+');'" @click="imgPreview(index, images)">
							    		<div class="close" @click.stop="delImage(index)"></div>
							    	</div>
							      	<!-- <ul>
							        	<li v-for="(image,index) in images" :key="index">
							          		<img :src="image" @click='delImage($index)' />
							          		<a href="#" style="position: absolute;" @click='delImage($index)'>
							            		<span class="glyphicon glyphicon-remove"></span>
							         	 	</a>
							        	</li>
							      	</ul> -->
							    </div>
							    <div class="add_img" :style="images.length>=5?'opacity:.5;':''">
							    	<label for="sel_img" @click="addPic" :style="images.length>=5?'cursor: not-allowed;':''"></label>
							        <input id="sel_img" type="file" :disabled="images.length>=5" @change="onFileChange" accept=".jpeg,.png,.jpg">
							    </div>
							</div>
					  	</el-form-item>
					  	<el-form-item label="" prop="" :style="new_kqfield.type === 'Imageview'?'margin-bottom:0px;':''">
					  		<div class="otherset">
					  			<div class="set1" v-if="new_kqfield.type !== 'Location'">
					    			<el-checkbox v-model="new_kqfield.required">必填</el-checkbox>
					  			</div>
					  			<template v-else>
  						  			<div class="set1">
  						    			<el-checkbox v-model="new_kqfield.position_tune">允许微调</el-checkbox>
  						  			</div>
  						  			<div class="set2">
  						  				<span style="padding:0 10px 0 22px;font-size:12px;color:#8492a6;">范围</span>
  				  						<el-select v-model="new_kqfield.tune_distance" :disabled="!new_kqfield.position_tune">
  				  				    	    <el-option
  				  								v-for="item in tune_distances"
  				  								:key="item.value"
  				  								:label="item.label"
  				  								:value="item.value">
  				  				    	    </el-option>
  				  				    	</el-select>
  						  				<span style="padding-left:3px;font-size:12px;color:#99a9bf;">米</span>
  						  			</div>
					  			</template>
					  		</div>
					  	</el-form-item>
					  	<el-form-item label="" prop=""  v-if="new_kqfield.type === 'Imageview'">
					  		<div class="otherset">
					  			<div class="set1">
					    			<el-checkbox v-model="new_kqfield.can_choose_picture">允许选择相册图片</el-checkbox>
					  			</div>
					  		</div>
					  	</el-form-item>
						<el-form-item  v-if="new_kqfield.type === 'Imageview'" label="最少上传">
							<el-select v-model="new_kqfield.check_guide.min" :value="1" >
								<el-option v-for="(item,index) in 5" :key="index" :label="item" :value="item"></el-option>
							</el-select>
					  	</el-form-item>
					</el-form>
				</div>
				<div class="new_kqfield_foot">
					<div class="btns">
						<el-button @click="dialogNewKqfield = false">取 消</el-button>
						<el-button type="primary" @click="vialid">确 定</el-button>
					</div>
				</div>
			</el-dialog>
		</div>
	</div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
import Sortable from 'sortablejs'

export default {
  	name: 'setrequirefield',
  	data () {
    	return {
    		images: [],
    		// image: '',
      		dialogNewKqfield: false,
      		rules: {
      			title: [
      				{ required: true, message: '请输入标题', trigger: 'blur' },
      				{ min: 1, max: 20, message: '长度在 3 到 5 个字符', trigger: 'blur' }
      			],
      			// options: [
      			// 	{ required: true, message: '请输入选项'}
      			// ],
      		},
      		new_kqfield: {
      			index: -1,
      			type: 'SingleText',
      			title: '',
      			tip: '',
      			options: [//下拉选项
      				{
      					value: ''
      				},
      				{
      					value: ''
      				}
      			],
      			example_img: {
		  			url: [],
		  			thumb_url: []
				},
				check_guide: {
					min: 1	
				},
		  		can_choose_picture: false,
      			required: true,
      			position_tune: false,
      			tune_distance: 500,
      		},
      		kqfield_types: [
      			{
		          value: 'SingleText',
		          label: '单行文字'
		        },
      			{
		          value: 'TextArea',
		          label: '多行文字'
		        },
      			{
		          value: 'Number',
		          label: '数字'
		        },
      			{
		          value: 'Select',
		          label: '下拉选项'
		        },
      			{
		          value: 'Date',
		          label: '日期'
		        },
      			{
		          value: 'Imageview',
		          label: '图片'
		        },
      			{
		          value: 'Location',
		          label: '位置'
		        }
      		],
      		tune_distances: [
      			{
		          value: 100,
		          label: '100'
		        },
      			{
		          value: 200,
		          label: '200'
		        },
      			{
		          value: 500,
		          label: '500'
		        },
      			{
		          value: 1000,
		          label: '1000'
		        },
      			{
		          value: 1500,
		          label: '1500'
		        },
      		],
      		dialogBigPic: true,
			  // require_field: []
    	}
  	},
  	props: ['require_field_origin'],
  	computed: {
  		require_field() {
  			if(!this.require_field_origin.length){
				this.require_field_origin.push({
				    "id": '',
				    "type": "Location",
				    "name": "位置",
				    "info": {
				        "title": "位置",
				        "value": {
				            "lat": "",
				            "lng": "",
				            "addr": "",
				            "addr_name": ""
				        },
				        "tune_distance":500,
				        "tip": "",
				        "required": 1
				    },
				    order: 1
				})
  			}
  			return this.require_field_origin

  		}
	  },
  	methods: {
	   	addPic () {
	     	if(this.images.length>=5){
     			this.$message({
     		  		showClose: true,
     		  		message: '最多设置5张示例图片',
     		  		type: 'warning'
     			});
	     	}
	   	},
	   	imgPreview(index, list){
	   		let option = {
	   		  	bgOpacity: .8,
	   		  	// escKey: false,
	   		  	fullscreenEl: false,
	   		  	shareEl: false,
	   		  	showAnimationDuration: 0,
	   		  	hideAnimationDuration: 0
	   		}
	   		setTimeout(() => {
	   		  	this.$preview.open(index, list, option)
	   		  	$('.pswp').css('z-index', 9999998)
	   		},100)
	   	},
		delImage(index){
			this.images.splice(index, 1)
			this.new_kqfield.example_img.thumb_url.splice(index, 1)
			this.new_kqfield.example_img.url.splice(index, 1)
		},
		onFileChange (e) {
			
			var form_data = new FormData()
			var file_data = $("#sel_img").prop("files")[0]
			form_data.append("team_id", util.getLocalStorage('projectStorageInfo').team_id);
			form_data.append("project_id", util.getLocalStorage('projectStorageInfo').project_id);
			form_data.append("file", file_data);
			$('#sel_img').val('')
			$.ajax({
			   	url:util.host+'/sea/api/1.0/client/v1/common/upload?dmclient=pcweb&X-Doumi-Agent=weixinqy',
			   	type:'POST',
			   	data:form_data,
			   	processData:false,
			   	contentType:false,            
			   	xhrFields:{
			     	withCredentials:true
			   	},
			   	timeout:10000,
			   	success:(obj) => {
			       	console.log(obj)
			       	if(obj && obj.errno == 0){
			           	this.new_kqfield.example_img.thumb_url.push(obj.data.thumbUrl)
			           	this.new_kqfield.example_img.url.push(obj.data.url)

			           	
						let tempObj = {}
						tempObj.src = 'https://cdn.doumistatic.com/'+obj.data.url
						tempObj.msrc = 'https://cdn.doumistatic.com/'+obj.data.thumbUrl
						let image = new Image();
						image.src = 'https://cdn.doumistatic.com/'+obj.data.url
						image.onload = function(){
							tempObj.w = image.width
							tempObj.h = image.height
						}
						this.images.push(tempObj)

						this.$message({
					  		showClose: true,
					  		message: '上传成功',
					  		type: 'success'
						});
			       	}else{
			           	this.$message({
		             		showClose: true,
		             		message: '上传失败，请重试',
		             		type: 'warning'
			           	});
			       	}
			   	},   
			   	error: (xhr, status) => {

			   	},
			   	noNetwork: () => {
			     	//网络超时
			     	this.$message({
			       		showClose: true,
			       		message: '网络连接失败，请检查网络',
			       		type: 'warning'
			     	});
			   	}                  
			})
		},
    	init() {
      		// this.require_field = this.require_field_origin
      		let that = this
      		Sortable.create(items, {
      		    handle: '.glyphicon-move',
      		    animation: 100,
      		    onEnd: function (evt){
      		        console.log(evt.oldIndex)
      		        console.log(evt.newIndex)
      		        let tempObj = that.require_field[evt.oldIndex+1]
      		        that.require_field.splice(evt.oldIndex+1, 1)
      		        that.require_field.splice(evt.newIndex+1, 0, tempObj)
      		        $(evt.item).remove()
      		        $(evt.from).find('.kqfield_item').eq(evt.oldIndex).after(evt.item)
      		        that.require_field.forEach((obj, index) => {
      		        	obj.order = index + 1
      		        })
      		    },
      		    draggable: ".dragitem",
      		})
		},
    	showNewKqfieldDialog(item, index){
    		// console.log(item)
    		if(this.$refs['new_kqfield']&&this.$refs['new_kqfield'].resetFields) this.$refs['new_kqfield'].resetFields();
    		if(item !== 'new'){
    			this.new_kqfield.index = index
    			this.new_kqfield.id = item.id
    			this.new_kqfield.type = item.type
    			this.new_kqfield.title = item.info.title
    			this.new_kqfield.tip = item.info.tip
    			this.new_kqfield.required = item.info.required == 1 ? true : false
    			if(item.type === 'Select'){
    				this.new_kqfield.options = []
    				item.info.options.forEach((obj) => {
    					this.new_kqfield.options.push({
    						value: obj
    					})
    				})
    			}else if(item.type === 'Location'){
    				this.new_kqfield.position_tune = item.info.tune_distance == 0 ? false : true
      				this.new_kqfield.tune_distance = this.new_kqfield.position_tune ? Number(item.info.tune_distance) : 500
    			}else if(item.type === 'Imageview'){
    				this.new_kqfield.can_choose_picture = item.info.can_choose_picture == 1 ? true : false
    				this.new_kqfield.example_img.url = item.info.example_img.url
    				this.new_kqfield.example_img.thumb_url = item.info.example_img.thumb_url
    				this.new_kqfield.check_guide.min = item.info.check_guide.min
    				this.images = []
    				this.new_kqfield.example_img.url.forEach((obj1, index) => {
    					if(obj1.indexOf('https://cdn.doumistatic.com/') > -1){//路径统一去掉域名
    						this.new_kqfield.example_img.url[index] = this.new_kqfield.example_img.url[index].substr(28)
    						this.new_kqfield.example_img.thumb_url[index] = this.new_kqfield.example_img.thumb_url[index].substr(28)
    					}
    					let tempObj = {}
    					tempObj.src = 'https://cdn.doumistatic.com/'+this.new_kqfield.example_img.url[index]
    					tempObj.msrc = 'https://cdn.doumistatic.com/'+this.new_kqfield.example_img.thumb_url[index]
    					let image = new Image();
    					image.src = 'https://cdn.doumistatic.com/'+this.new_kqfield.example_img.thumb_url[index]
    					image.onload = function(){
    						tempObj.w = image.width
    						tempObj.h = image.height
    					}
    					this.images.push(tempObj)
    				})
    			}
    		}else{
    			this.images = []
    			this.new_kqfield = {
		  			index: -1,
		  			id: '',
		  			type: 'SingleText',
		  			title: '',
		  			tip: '',
		  			options: [//下拉选项
		  				{
		  					value: ''
		  				},
		  				{
		  					value: ''
		  				}
		  			],
		  			example_img: {
			  			url: [],
			  			thumb_url: []
					},
					check_guide: {
						min:1
					},
			  		can_choose_picture: false,
		  			required: true,
		  			position_tune: false,
		  			tune_distance: 500,
		  		}
    		}
    		this.dialogNewKqfield = true
    	},
    	changeType(val){
    		// console.log(val)
    	},
    	vialid(){
			this.$refs['new_kqfield'].validate((valid) => {
				if (valid) {
					this.comfirmNewFieldFn()
				} else {
					return false
				}
			});
    	},
    	comfirmNewFieldFn(){
    		console.log(123)
    		let tempObj = {
    			info:{}
    		}
    		tempObj.id = this.new_kqfield.id
    		tempObj.type = this.new_kqfield.type
    		switch(this.new_kqfield.type){
    			case 'SingleText':
    				tempObj.name = '单行文字'
    			    break;
    			case 'TextArea':
    				tempObj.name = '多行文字'
    			    break;
    			case 'Number':
    				tempObj.name = '数字'
    			    break;
    			case 'Select':
    				tempObj.name = '下拉选项'
    			    break;
    			case 'Date':
    				tempObj.name = '日期'
    			    break;
    			case 'Location':
    				tempObj.name = '位置'
    			    break;
    			case 'Imageview':
    				tempObj.name = '图片'
    			    break;
    		}
    		tempObj.info.title = this.new_kqfield.title
    		tempObj.info.tip = this.new_kqfield.tip
    		tempObj.info.value = ''
			tempObj.info.required = this.new_kqfield.required ? 1 : 0
			if(this.new_kqfield.type === 'Select'){
				let tempArr = []
				for(let i = 0;i < this.new_kqfield.options.length;i ++){
					if(!this.new_kqfield.options[i].value){
						// this.$message({
						//   	showClose: true,
						//   	message: '请输入选项',
						//   	type: 'warning'
						// });
						this.checkInputFn()
						return
					}
					tempArr.push(this.new_kqfield.options[i].value)
				}
				//判断是否有重复选项
				let set = new Set(tempArr)
				if(set.size != tempArr.length){
				    this.$message({
				      	showClose: true,
				      	message: '请勿输入相同选项',
				      	type: 'warning'
				    });
				    return
				}
				tempObj.info.options = tempArr
			}else if(this.new_kqfield.type === 'Location'){
				tempObj.info.value = {
                    "lat": "",
                    "lng": "",
                    "addr": "",
                    "addr_name": ""
                },
                tempObj.info.tune_distance = this.new_kqfield.position_tune ? this.new_kqfield.tune_distance : 0
			}else if(this.new_kqfield.type === 'Imageview'){
				tempObj.info.example_img = JSON.parse(JSON.stringify(this.new_kqfield.example_img))
				tempObj.info.can_choose_picture = this.new_kqfield.can_choose_picture ? 1 : 0
				tempObj.info.check_guide = {min:this.new_kqfield.check_guide.min}
			}
    		if(this.new_kqfield.index == -1){
    			this.require_field.push(tempObj)
    		}else{
    			this.require_field.splice(this.new_kqfield.index, 1, tempObj)
    		}
    		this.require_field.forEach((obj, index) => {
    			obj.order = index + 1
    		})
    		this.dialogNewKqfield = false
    		console.log(tempObj)
    	},
    	addOptionFn(){
    		this.new_kqfield.options.push({
				value: ''
			})
    	},
    	checkInputFn(){
    		this.new_kqfield.options.forEach((option, index) => {
    			if(!option.value){
    				$('.setrequirefield .option').eq(index).addClass('err')
    				return false
    			}else{
    				$('.setrequirefield .option').eq(index).removeClass('err')
    				return true
    			}
    		})
    	},
    	delOptionFn(index){
    		if(this.new_kqfield.options.length > 2){
    			this.new_kqfield.options.splice(index, 1)
    		}
    	},
    	delKqfieldFn(index){
    		this.require_field.splice(index, 1)
    	},
    	handlePictureCardPreview(){

    	},
    	handleRemove(){

    	},
    	uploadImgSuccessFn(response, file, fileList){
    		console.log(response)
    	},
    	uploadImgErrorFn(err, file, fileList){
    		console.log(err)
    	}
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

<style>
.setrequirefield .new_kqfield .el-dialog{
	width: 420px;
}
.setrequirefield .new_kqfield .el-form-item .el-form-item__label{
	text-align: left;
    text-indent: 15px;
}
.setrequirefield .new_kqfield .el-form-item.is-required .el-form-item__label{
	position: relative;
}
.setrequirefield .new_kqfield .el-form-item.is-required .el-form-item__label:before{
	content: "";
	color: #ffaa00;
	/*margin-right: 8px;*/
	display: block;
	width: 7px;
	height: 7px;
	background: url(../../assets/imgs/x_icon.svg) no-repeat center left;
	color: #ffaa00;
	position: absolute;
	left: 0px;
	top: 14px;
}
.setrequirefield .new_kqfield .el-form-item{
	margin-bottom: 16px;
}
.setrequirefield .new_kqfield .el-form-item .el-form-item__content{
	margin-left: 87px!important;
}
.setrequirefield .new_kqfield .el-form-item .el-form-item__content .el-form-item__error{
	position: static;
	margin-bottom: -7px;
}
.setrequirefield .new_kqfield .new_kqfield_main .el-select{
	width: 253px;
}
.setrequirefield .new_kqfield .new_kqfield_main .otherset .set1 .el-checkbox__label{
	padding-left: 12px;
	font-size: 14px;
	color: #8492a6;
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option.err .el-input__inner{
	border: solid 1px #ff6600!important;
}
.setrequirefield .new_kqfield .new_kqfield_main .otherset .set2 .el-select{
	width: 80px;
}
.setrequirefield .new_kqfield .new_kqfield_main .otherset .set2 .el-select .el-input__inner{
	height: 30px;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.setrequirefield{
	width:468px;
	background-color: #f7f9fc;
}
.setrequirefield .kqfields{
	padding: 0 20px;
	box-sizing: border-box;
	max-height: 312px;
	overflow: auto;
}
.setrequirefield .kqfield_item{
	display: flex;
	height: 52px;
	border-bottom: 1px solid #e8edf2;
	box-sizing: border-box;
	background-color: #f7f9fc;
}
.setrequirefield .kqfield_item>div{
	line-height: 51px;
}
.setrequirefield .kqfield_item>div.kqfield_icon{
	width:25px;
	background:url(../../assets/imgs/drag.svg) no-repeat left center;
	cursor: move;
}
.setrequirefield .kqfield_item>div.kqfield_icon:hover{
	background:url(../../assets/imgs/drag_hover.svg) no-repeat left center;
}
.setrequirefield .kqfield_item>div.kqfield_name{
	flex: 1;
	font-size: 14px;
	color: #5e6d82;
}
.setrequirefield .kqfield_item>div.kqfield_edit{
	width: 43px;
	background:url(../../assets/imgs/editbig.svg) no-repeat right center;
	cursor: pointer;
}
.setrequirefield .kqfield_item>div.kqfield_edit:hover{
	background:url(../../assets/imgs/editbig_hover.svg) no-repeat right center;
}
.setrequirefield .kqfield_item>div.kqfield_del{
	width: 43px;
	background:url(../../assets/imgs/delate.svg) no-repeat right center;
	cursor: pointer;
}
.setrequirefield .kqfield_item>div.kqfield_del:hover{
	background:url(../../assets/imgs/delate_hover.svg) no-repeat right center;
}
.setrequirefield .add_kqfield{
	height: 24px;
	padding: 14px 183px;
	/*cursor: pointer;*/
}
.setrequirefield .add_item{
	float:left;
	height: 24px;
	line-height: 24px;
	font-size: 14px;
	color: #6699ee;
	background:url(../../assets/imgs/shareIcon/add_hover.svg) left no-repeat;
	text-indent: 18px;
	cursor: pointer;
}
.setrequirefield .add_item:active{
	color:#517ed6;
}
.setrequirefield .new_kqfield .new_kqfield_main{
	margin-top: 30px;
	padding: 0 40px;
	border-bottom: 1px solid #e0e6ed;
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option{
	position:relative;
	display: flex;
	margin-bottom: 16px;
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option:last-child{
	margin-bottom: 5px;
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option.err{
	margin-bottom: 23px; 
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option.err:last-child{
	margin-bottom: 16px; 
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option .del_icon{
	flex: 1;
	/*background: url(../../assets/imgs/delate.svg) no-repeat right center;*/
	/*cursor: pointer;*/
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option .del_icon .del_in{
	width: 18px;
	height: 18px;
	background: url(../../assets/imgs/delate.svg) no-repeat right center;
	cursor: pointer;
	margin:9px 0 8px 15px;
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option .del_icon .del_in:hover{
	background: url(../../assets/imgs/delate_hover.svg) no-repeat right center;
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option .del_icon .del_in.undel{
	background: url(../../assets/imgs/delate_disabled.svg) no-repeat right center;
	cursor: not-allowed;
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option .err_msg{
	display: none;
}
.setrequirefield .new_kqfield .new_kqfield_main .options .option.err .err_msg{
	display: block;
	position:absolute;
	left: 0;
	top: 40px;
	line-height: 1;
	font-size: 12px;
	color: #ff6600;
}

.setrequirefield .new_kqfield .new_kqfield_main .image_box{
	
}
.setrequirefield .new_kqfield .new_kqfield_main .image_box .images{
	
}
.setrequirefield .new_kqfield .new_kqfield_main .image_box .images .img{
	float: left;
	position: relative;
	width: 64px;
	height: 64px;
	border-radius: 2px;
	/*background-color: #e0e6ed;*/
	background-size: cover;
	background-position: center;
	box-sizing: border-box;
	margin: 0 16px 16px 0;
}
.setrequirefield .new_kqfield .new_kqfield_main .image_box .images .img .close{
	position: absolute;
	top: -8px;
	right: -8px;
	width: 16px;
	height: 16px;
	border-radius: 8px;
	background: url(../../assets/imgs/close.svg) no-repeat center;
}
.setrequirefield .new_kqfield .new_kqfield_main .image_box .add_img{
	float: left;
	position:relative;
	width:64px;
	height:64px;
	border-radius: 2px;
	background-color: #ffffff;
	border: solid 1px #e0e6ed;
	box-sizing: border-box;
	cursor: pointer;
}
.setrequirefield .new_kqfield .new_kqfield_main .image_box .add_img:after{
	content: '';
	position:absolute;
	top:30px;
	left:17px;
	width:28px;
	height:3px;
	border-radius: 2px;
	background-color: #e0e6ed;
}
.setrequirefield .new_kqfield .new_kqfield_main .image_box .add_img:before{
	content: '';
	position:absolute;
	top:18px;
	left:29px;
	width:3px;
	height:28px;
	border-radius: 2px;
	background-color: #e0e6ed;
}
.setrequirefield .new_kqfield .new_kqfield_main .image_box .add_img>label{
	position: absolute;
	top:-1px;
	left:-1px;
	width:64px;
	height:64px;
	cursor: pointer;
	z-index: 9999;
}
.setrequirefield .new_kqfield .new_kqfield_main .image_box .add_img input{
	width:0;
	height:0;
	opacity: 0;
}

.setrequirefield .new_kqfield .new_kqfield_main .otherset{
	display: flex;
}
.setrequirefield .new_kqfield .new_kqfield_main .otherset .set1{
	
}
.setrequirefield .new_kqfield .new_kqfield_main .otherset .set2{
	flex: 1;
}

.setrequirefield .new_kqfield .new_kqfield_foot{
  height:68px;
}
.setrequirefield .new_kqfield .new_kqfield_foot .btns{
  float: right;
  margin:16px 20px;
}



.sortable-chosen{
    -webkit-box-shadow:0 1px 6px 0 #e3e8ef;
    -moz-box-shadow:0 1px 6px 0 #e3e8ef;
    -ms-box-shadow:0 1px 6px 0 #e3e8ef;
    -o-box-shadow:0 1px 6px 0 #e3e8ef;
    box-shadow:0 1px 6px 0 #e3e8ef;
}
</style>
