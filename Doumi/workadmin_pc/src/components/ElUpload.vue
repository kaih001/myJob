<template>
  <div class="uploadWrap" :style="{width:width+'px'}">
    <!-- <div class="uploadTitle">附件上传：</div> -->
    <div class="uploadSection">
      <el-upload ref="upload" :class="{hide:hideUpload,hide2:isDet}" :action="actionUrl" :data="uploadData" :name="uploadName" :on-preview="preview" :on-remove="handleRemove" :on-success="uploadImage" :before-upload="beforeUpload"
        :on-error="handleUploadError" :file-list="getFileListValue" :limit="limitCount" :on-change="onChange" accept=".pdf,.bmp,.png,.gif,.jpg,.jpeg" :disabled="isDisabled">
        <div slot="tip" class="el-upload__tip">{{elTips}}</div>
        <el-button size="mini" type="primary" class="uploadBtn">点击上传</el-button>
      </el-upload>
    </div>
  </div>
</template>

<script>
import * as util from '@/assets/js/util.js'
export default {
  name: "",
  components: {},
  props: {
    isDet: {
      type: Boolean,
      default: false,
    },
    fileListValue: {
      type: Array,
      default: () => [],
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    limitCount: {
      type: Number,
      default: 10
    },
    width:{
      type:Number,
      default:300
    },
    elTips:{
      type:String,
      default:'请上传特批支付审核附件，单个文件需要小于5M'
    }
  },
  data() {
    return {
      hideUpload: false,
      actionUrl: util.host+'/sea/api/1.0/client/v1/common/upload/accessory',
      uploadData: {
        dmclient: 'pcweb'
      },
      // uploadName: 'uploadfile_ant',
      uploadName: 'file',
      dialogImageUrl: '',
      dialogVisible: false,
      // fileListValue: [],
      // limitCount: 10
    }
  },
  computed: {
    getFileListValue() {
      // console.log('fileListValue===', this.fileListValue);
      return this.fileListValue || [];
    }
  },
  watch: {
    '$route'(to, from) {
      window.location.reload()
    },
  },
  mounted() {
  },
  methods: {
    preview(file) {
      console.log('file==', file);
      const { status, response } = file;
      if (status == 'success'&& response) {
        const url = response.data.file_url;
        window.open('//image-inner.doumi.com/' + url, '_blank');
      } else {
        window.open('//image-inner.doumi.com/' + file.url, '_blank');
      }
    },
    beforeUpload(file) {
      console.log('this.getFileListValue.length==', this.getFileListValue.length)
      if(this.getFileListValue.length>=10) {
        this.$message({
          message: `最多上传10个附件！`,
          type: 'error'
        });
        return false;
      }
      // const allowType = ['image/jpeg', 'image/png', 'image/jpg', 'image/bmp']
      // let isAllowed = true
      // if (allowType.indexOf(file.type) === -1) {
      //   this.$message.error('只能上传jpg/jpeg/png/bmp格式的图片!')
      //   isAllowed = false
      // }
      // return isAllowed
      console.log('file===', file);
      const url = file.name;
      const suffix = url.substring(url.lastIndexOf("."));
      console.log(suffix, 'suffix')
      if (suffix !== '.pdf' && suffix !== '.png' && suffix !== '.jpg' && suffix !== '.jpeg') {
        this.$message({
          message: '暂不支持该种文件格式上传',
          type: 'error',
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.$message({
          message: '文件过大，最大可上传5M',
          type: 'error'
        });
        return false;
      }
      return true;
    },
    // 上传成功之后
    uploadImage(res, file, fileList) {
      console.log('上传图片成功后res====', res, file, fileList);

      if (res.errno == '0') {
        const data = res.data;
        this.getFileListValue.push({
          url: data.file_url,
          name: data.file_name
        })
      } else {
        this.$message({
          message: `${res.errmsg}`,
          type: 'error'
        });
      }
      // console.log('this.getFileListValue===', this.getFileListValue)

      this.$emit('getNewFileListFun', this.getFileListValue);
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
      const idx = this.getFileListValue.findIndex(item => item.url == file.url);
      if (idx > -1) {
        this.getFileListValue.splice(idx, 1)
      }
      this.hideUpload = fileList.length >= this.limitCount;
    },
    onChange(file, fileList) {
      this.hideUpload = fileList.length >= this.limitCount;
    },
    handleUploadError(err, file, filelist) {
      console.log(err, file, filelist, '---------------err')
      this.$message.error('上传失败');
    },
    clearFilesFun() {
      this.$refs.upload.clearFiles();
      this.hideUpload = false;
      this.isDet = false;
    }
  },
}
</script>

<style>
.uploadWrap {
  display: flex;
  width: 300px;
}
.uploadBtn {
  height: 36px;
  margin-left: 0px!important;
}
.uploadTitle {
  width: 80px;
}
.uploadSection {
  flex: 1;
}
.uploadWrap .el-upload-list {
  margin-top: -10px;
}
.uploadWrap .hide .el-upload {
  display: none;
}
.uploadWrap .hide .el-upload-list {
  margin-left: 0;
}
/* 控制上传文件的宽度 */
.uploadWrap .uploadSection a.el-upload-list__item-name {
  display: block;
  width: 250px;
}
/* 查看 */
.uploadWrap .hide2 .el-upload {
  display: none;
}
.uploadWrap .hide2 .el-upload__tip {
  display: none;
}
.uploadWrap .hide2 .el-upload-list {
  margin-left: 0;
}
/* 详情时的X号隐藏 */
/* .uploadWrap >>> .hide2 .el-icon-close {
  display: none;
}
.uploadWrap >>> .hide2 .el-icon-close-tip {
  display: none;
} */
.uploadWrap .el-upload__tip {
  display: inline-block;
  margin-top: 0 !important;
}
.uploadWrap .el-upload-list__item.is-success.focusing .el-icon-close-tip {
  display: none !important;
}
</style>
