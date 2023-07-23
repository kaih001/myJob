// 大数相乘参考:https://juejin.cn/post/7126425188928847886#heading-2
// 大数相加参考:https://juejin.cn/post/7023043356443803678
function bigAdd(a, b) {
  // 获取两个数大的的那一个长度
  const maxLength = Math.max(a.length, b.length);
  // 用0补齐
  a = a.padStart(maxLength, 0);
  b = b.padStart(maxLength, 0);
  let t = 0; //当前位数上两数相加
  let f = 0; //进位数
  let sum = ""; //总数
  for (let i = maxLength - 1; i >= 0; i--) {
    t = parseInt(a[i]) + parseInt(b[i]) + f;
    f = Math.floor(t / 10);
    sum = (t % 10) + sum;
  }
  if (f == 1) {
    sum = "1" + sum;
  }
  return sum;
}
function bigAdd1(a, b) {
  // 获取两个数中大的那一个
  const maxLength = Math.max(a.length, b.length);
  // 把两个数补齐
  a = a.padStart(maxLength, 0);
  b = b.padStart(maxLength, 0);
  // 初始化相关数据
  let addNums = 0; //两个数每个位数相加值
  let f = 0; //进位数
  let sum = ""; //总数
  // 遍历相加
  for (let i = maxLength - 1; i >= 0; i--) {
    addNums = parseInt(a[i]) + parseInt(b[i]) + f;
    f = Math.floor(addNums / 10);
    sum = (addNums % 10) + sum;
  }
  if (f === 1) {
    sum = "1" + sum;
  }
  return sum;
}
function bigAdd2(a, b) {
  // 获取两个数中比较大的那个数的长度
  const maxLength = Math.max(a.length, b.length);
  // 补齐两个数
  a = a.padStart(maxLength, 0);
  b = b.padStart(maxLength, 0);
  // 初始化数据
  let addNums = 0;
  let f = 0;
  let sum = "";
  for (let i = maxLength - 1; i >= 0; i--) {
    addNums = parseInt(a[i]) + parseInt(b[i]) + f;
    f = Math.floor(addNums / 10);
    sum = (addNums % 10) + sum;
  }
  if (f === 1) {
    sum = "1" + sum;
  }
  return sum;
}

let a = "9007199254740991";
let b = "1234567899999999999";
console.log(bigAdd(a, b));
// console.log(bigAdd1(a, b));
// console.log(bigAdd2(a, b));
