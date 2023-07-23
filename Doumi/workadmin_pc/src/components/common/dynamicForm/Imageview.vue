<template>
  <div class="image-view-wrap">
    <div class="image_box">
      <div class="images" v-for="(image,index) in images">
        <div class="img preview-img" :style="'background-image:url('+image+');'" @click="imgPreview(index, images)">
          <div class="close" @click.stop="delImage(index)"></div>
        </div>
      </div>
      <div class="add_img" :style="images.length>=5?'opacity:.5;':''">
        <label :for="'sel_img'+number" @click="addPic" :style="images.length>=5||!isUpload?'cursor: not-allowed;':''"></label>
          <input :id="'sel_img'+number" type="file" :disabled="images.length>=5||!isUpload" @change="onFileChange" accept=".jpeg,.png,.jpg">
      </div>
    </div>
    <!--
    <ElUploadInvite 
      :limitCount="5" 
      :width="255"
      :projectId="projectId"
      :teamid="teamid" 
      ref="uploadRef" 
      :elTips="elTips" 
      @getNewFileListFun="getNewFileListFun" 
      :fileListValue="contractFile">
    </ElUploadInvite> 
    <-->
    <!--
    <ElUpload 
      :limitCount="5" 
      :width="255" 
      ref="uploadRef" 
      :elTips="elTips" 
      @getNewFileListFun="getNewFileListFun" 
      :fileListValue="contractFile">
    </ElUpload>  
    <-->
  </div>
</template>

<script>
import $ from 'jquery'
import * as util from '@/assets/js/util.js'
// import ElUploadInvite from "../../ElUploadInvite";
// import ElUpload from "../../ElUpload";
export default {
  name: "",
  components: {
    // ElUploadInvite,
    // ElUpload
  },
  props: {
    item: {
      type: Object,
      default: {},
    },
    number:{
      type:Number,
      default:0
    }
    
  },
  data() {
    return {
      isUpload:true,
      images: this.item.info&&this.item.info.value.length&&this.item.info.value||[],
    }
  },
  computed: {
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    addPic () {
      if(this.images.length>=5){
        this.$message({
            showClose: true,
            message: '最多上传5张图片',
            type: 'warning'
        });
      }
    },
    imgPreview(index, list){
      window.open('https://cdn.doumistatic.com/' + list[index], '_blank');
    },
		delImage(index){
			this.images.splice(index, 1)
		},
    onFileChange (e) {
      this.isUpload=false;
      var imgs=['image/jpeg','image/jpg','image/png'];
			var form_data = new FormData()
			var file_data = $("#sel_img"+this.number).prop("files")[0]
			form_data.append("team_id", util.getLocalStorage('projectStorageInfo').team_id);
			form_data.append("project_id", util.getLocalStorage('projectStorageInfo').project_id);
			form_data.append("file", file_data);
			$('#sel_img'+this.number).val('')
      console.log('bbbbbbbb',file_data);
      if(!imgs.includes(file_data.type)){
        this.isUpload=true;
        this.$message({
          showClose: true,
          message: '只支持上传图片',
          type: 'warning'
        });
        return
      }
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
            this.isUpload=true;
            if(obj && obj.errno == 0){
              let tempObj = {}
              tempObj.src = 'https://cdn.doumistatic.com/'+obj.data.url
              tempObj.msrc = 'https://cdn.doumistatic.com/'+obj.data.thumbUrl
              let image = new Image();
              image.src = 'https://cdn.doumistatic.com/'+obj.data.url
              image.onload = function(){
                tempObj.w = image.width
                tempObj.h = image.height
              }
              this.images.push(tempObj.src)
              this.$emit('changeComponent', {
                number: this.number,
                value: this.images,
                item:this.item
              })
              this.$message({
                showClose: true,
                message: '上传成功',
                type: 'success'
              });
            }else{
                this.$message({
                  showClose: true,
                  message: '图片不能大于5M',
                  type: 'warning'
                });
            }
			   	},   
			   	error: (xhr, status) => {
            this.isUpload=true;
            this.$message({
              showClose: true,
              message: '图片不能大于5M',
              type: 'warning'
            });
          },
			   	noNetwork: () => {
            this.isUpload=true;
			     	//网络超时
			     	this.$message({
			       		showClose: true,
			       		message: '网络连接失败，请检查网络',
			       		type: 'warning'
			     	});
			   	}                  
			})
		},
    // 获取上传成功的文件信息
    // getNewFileListFun:util.debounce(function(fileListValue){
    //   console.log("上传成功的图片----", fileListValue);
    //   this.uploadValue.url.push(fileListValue[0].url);
    //   fileListValue.forEach((v,i)=>{
    //     this.uploadValue.initialData.push({url:v.url,name:v.name})
    //   })
    //   // this.uploadValue.initialData=fileListValue;
    //   this.$emit('changeComponent', {
    //     number: this.number,
    //     value: this.uploadValue,
    //     item:this.item
    //   })
    // },500)
  }
}
</script>

<style scoped>
.image-view-wrap .image_box .images .img{
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
.image-view-wrap .image_box .images .img .close{
	position: absolute;
	top: -8px;
	right: -8px;
	width: 16px;
	height: 16px;
	border-radius: 8px;
	background: url(../../../assets/imgs/close.svg) no-repeat center;
}
.image-view-wrap .add_img{
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
.image-view-wrap .add_img:after{
	content: '';
	position:absolute;
	top:30px;
	left:17px;
	width:28px;
	height:3px;
	border-radius: 2px;
	background-color: #e0e6ed;
}
.image-view-wrap .add_img:before{
	content: '';
	position:absolute;
	top:18px;
	left:29px;
	width:3px;
	height:28px;
	border-radius: 2px;
	background-color: #e0e6ed;
}
.image-view-wrap .add_img>label{
	position: absolute;
	top:-1px;
	left:-1px;
	width:64px;
	height:64px;
	cursor: pointer;
	z-index: 9999;
}
.image-view-wrap .add_img input{
	width:0;
	height:0;
	opacity: 0;
}
</style>
