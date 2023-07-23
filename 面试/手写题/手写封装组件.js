// 参考:https://juejin.cn/post/6991861340428042270#heading-16
function query() {
  let value = 1;
  const where = function (callback) {
    console.log(value);
    value++;
    return this;
  };
  const sortBy = function () {
    console.log(value);
    return this;
  };
  return {
    where,
    sortBy,
  };
}
query().where().sortBy();
