let formFields = {
  //单行文本
  SingleText: {
    id: "",
    type: "SingleText",
    name: "单行文字",
    info: {
      title: "",
      tip: "",
      value: "",
      identification: "",
      required: "1",
      check_guide: {
        max: "",
        min: "",
        checkType: "",
      },
    },
    order: "",
  },
  //图片
  Imageview: {
    id: "",
    type: "Imageview",
    name: "图片",
    info: {
      title: "",
      tip: "",
      // value: {
      //   url: [],
      //   thumb_url: [],
      // },
      value: [],
      identification: "",
      example_img: {
        url: [],
        thumb_url: [],
      },
      required: "1",
      can_choose_picture: "0",
      check_guide: {
        max: "",
        min: "",
      },
    },
    order: "",
  },
};
export default formFields;
