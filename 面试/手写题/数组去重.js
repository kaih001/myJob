var array = [1, 2, 1, 1, "1"];
// 方法一: 暴力循环
function unique(arr) {
  let res = [];
  for (var i = 0, arrLen = arr.length; i < arrLen; i++) {
    for (var j = 0, resLen = res.length; j < resLen; j++) {
      if (arr[i] === res[j]) {
        break;
      }
    }
    if (j === resLen) {
      res.push(arr[i]);
    }
  }
  return res;
}
// 方法二: indexof
function unique1(arr) {
  let res = [];
  for (var i = 0, arrLen = arr.length; i < arrLen; i++) {
    if (res.indexOf(arr[i]) == -1) {
      res.push(arr[i]);
    }
  }
  return res;
}
// 方法三: filter
function unique2(array) {
  var res = array.filter(function (item, index, array) {
    return array.indexOf(item) === index;
  });
  return res;
}
// 方法四: Object键值对(过滤掉全部)
function unique3(arr) {
  var obj = {};
  return arr.filter((item) => {
    return obj.hasOwnProperty(typeof item + JSON.stringify(item))
      ? false
      : (obj[typeof item + JSON.stringify(item)] = true);
  });
}

const arr = [1, 2, 1, 1, "1"];
var array = [
  1,
  1,
  "1",
  "1",
  null,
  null,
  undefined,
  undefined,
  new String("1"),
  new String("1"),
  /a/,
  /a/,
  NaN,
  NaN,
  0,
  -0,
  "0",
  "-0",
];
// console.log(unique(arr));
// console.log(unique1(arr));
// console.log(unique2(arr));
console.log(unique3(array));
