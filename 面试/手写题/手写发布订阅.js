// 参考:https://juejin.cn/post/7052637219084828680#heading-8
class Observer {
  constructor() {
    this.messsage = {};
  }
  $on(type, callback) {
    if (!this.messsage[type]) {
      this.messsage[type] = [];
    }
    this.messsage[type].push(callback);
  }
  $emit(type) {
    if (!this.messsage[type]) {
      return;
    }
    this.messsage[type].forEach((element) => {
      element();
    });
  }
  $off(type, callback) {
    if (!this.messsage[type]) {
      return;
    }
    if (callback) {
      this.messsage[type] = this.messsage[type].filter((v, i) => {
        return v !== callback;
      });
    } else {
      this.messsage[type] = undefined;
    }
  }
}

class Observer {
  constructor() {
    this.messsage = {};
  }
  $on(type, callback) {
    if (!this.messsage[type]) {
      this.messsage[type] = [];
    }
    this.messsage[type].push(callback);
  }
  $emit(type) {
    if (!this.messsage[type]) {
      return;
    }
    this.messsage[type].forEach((callback) => {
      callback();
    });
  }
  $off(type, callback) {
    if (!this.messsage[type]) {
      return;
    }
    if (callback) {
      this.messsage[type] = this.messsage[type].filter((item) => {
        return item !== callback;
      });
      return;
    }
    this.messsage[type] = undefined;
  }
}
