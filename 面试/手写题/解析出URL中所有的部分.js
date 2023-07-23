function queryUrl(url = "") {
  let queryStr = url.substring(url.indexOf("?") + 1);
  let queryArr = queryStr.split("&");
  let queryObj = {};
  for (let i = 0, len = queryArr.length; i < len; i++) {
    let queryCur = queryArr[i];
    let arr = queryCur.split("=");
    queryObj[arr[0]] = arr[1];
  }
  return queryObj;
}
function queryUrl1(url) {
  return new URL(url);
}
function queryUrl12(url) {
  let parmasUrl = url.split("?")[1];
  let parmasArr = parmasUrl.split("&");
  let parmasObj = {};
  for (let item of parmasArr) {
    let key = item.split("=")[0];
    let value = item.split("=")[1];
    parmasObj[key] = value;
  }
  return parmasObj;
}
const url = "https://www.baidu.com/path/to/index?age=12&name=kk&heal=true";
// console.log(queryUrl(url));
// console.log(queryUrl(url).searchParams.get("age"));
console.log(queryUrl12(url));
