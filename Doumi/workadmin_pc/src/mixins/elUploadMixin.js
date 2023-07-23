export const elUploadMixin = {
  data: function () {
    return {
      contractFile: [],
      contractFile2: [],
      elTips: "请上传辞职书，上传的单个文件不能大于5M",
    };
  },
  methods: {
    // 获取上传成功的文件信息
    getNewFileListFun(fileListValue) {
      console.log("上传成功的图片----", fileListValue);
      if (this.contractFile.length > 5) {
        this.$message({
          showClose: true,
          message: "最多上传5个附件",
          type: "warning",
        });
        return;
      }
      this.contractFile = fileListValue;
    },
    // 获取上传成功的文件信息
    getNewFileListFun2(fileListValue) {
      console.log("上传成功的图片----", fileListValue);
      if (this.contractFile.length > 2) {
        this.$message({
          showClose: true,
          message: "最多上传2个照片",
          type: "warning",
        });
        return;
      }
      this.contractFile2 = fileListValue;
    }
  },
};
