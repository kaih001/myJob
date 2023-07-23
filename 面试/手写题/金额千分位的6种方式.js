// 参考:https://juejin.cn/post/7075531339055202311#heading-3
// 方法一: 数组分割法
function format_with_array(numbers) {
  let arr = (numbers + "").split(".");
  let intPart = arr[0].split("").reverse();
  let floatPart = arr[1];
  let r = "";
  for (let i = 0, len = intPart.length; i < len; i++) {
    const v = intPart[i];
    if (i !== 0 && i % 3 === 0) {
      r = v + "," + r;
    } else {
      r = v + r;
    }
  }
  r = r + (!!floatPart ? "." + floatPart : "");
  return r;
}
function format_with_array1(numbers) {
  // 截取整数部分和小数部分
  const numberArr = (numbers + "").split(".");
  let initPart = numberArr[0].split("").reverse();
  let floatPart = numberArr[1];
  let f = initPart.length % 3;
  let r = "";
  for (let i = 0; i < initPart.length; i++) {
    const v = initPart[i];
    if (i !== 0 && i % 3 === 0) {
      r = v + "," + r;
    } else {
      r = v + r;
    }
  }
  if (f === 1) {
    r = f + r;
  }
  return !!floatPart ? r + "." + floatPart : r;
}
function format_with_array2(numbers) {
  // 取出整数部分和小数部分
  const numArr = (numbers + "").split(".");
  let intPart = numArr[0].split("").reverse();
  let floatPart = numArr[1];
  // 剩余的位数
  let f = intPart % 3;
  let r = "";
  for (let i = 0; i < intPart.length; i++) {
    const v = intPart[i];
    if (i !== 0 && i % 3 === 0) {
      r = v + "," + r;
    } else {
      r = v + r;
    }
  }
  if (f > 0) {
    r = f + r;
  }
  return !!floatPart ? r + "." + floatPart : r;
}
// 方法二: 字符串截取
function format_with_str(nums) {
  // 拆分金额成数组
  const arr = (nums + "").split(".");
  let intPart = arr[0];
  let floatPart = arr[1];
  let f = intPart.length % 3;
  let r = intPart.substring(0, f);
  for (let i = 0; i < Math.floor(intPart.length / 3); i++) {
    r += "," + intPart.substring(f + i * 3, f + (i + 1) * 3);
  }
  if (f === 0) {
    r = r.substring(1);
  }
  return r + (!!floatPart ? "." + floatPart : "");
}
function format_with_str1(nums) {
  // 拆分整数和小数部分
  const numsArr = (nums + "").split(".");
  let intPart = numsArr[0];
  let floatPart = numsArr[1];
  let f = intPart.length % 3;
  let r = intPart.substring(0, f);
  for (let i = 0; i < Math.floor(intPart.length / 3); i++) {
    r += "," + intPart.substring(f + i * 3, f + (i + 1) * 3);
  }
  if (f === 0) {
    r = r.substring(1);
    console.log("ddd", r);
  }
  return !!floatPart ? r + "." + floatPart : r;
}
function format_with_str2(nums) {
  // 获取整数和小数部分
  const numsArr = (nums + "").split(".");
  let intPart = numsArr[0];
  let floatPart = numsArr[1] || "";
  let f = intPart.length % 3;
  let r = intPart.substring(0, f);
  for (let i = 0; i < Math.floor(intPart.length / 3); i++) {
    r = r + "," + intPart.substring(f + i * 3, f + (i + 1) * 3);
  }
  if (f === 0) {
    r = r.substring(1);
  }
  return !!floatPart ? r + "," + floatPart : r;
}
// 方法三:正则
function format_with_regex(number) {
  return !(number + "").includes(".")
    ? // 就是说1-3位后面一定要匹配3位
      (number + "").replace(/\d{1,3}(?=(\d{3})+$)/g, (match) => {
        return match + ",";
      })
    : (number + "").replace(/\d{1,3}(?=(\d{3})+(\.))/g, (match) => {
        console.log("match", match);
        return match + ",";
      });
}
function format_with_regex1(nums) {
  return (nums + "").includes(".")
    ? (nums + "").replace(/\d{1,3}(?=(\d{3})+(\.))/g, (match) => {
        return match + ".";
      })
    : (nums + "").replace(/\d{1,3}(?=(\d{3})+(\.))/g, (match) => {
        return match + ",";
      });
}

const num = 234567893.99;
// console.log(format_with_array(num));
// console.log(format_with_array1(num));
// console.log(format_with_array2(num));
// console.log(format_with_str(num));
// console.log(format_with_str1(num));
// console.log(format_with_str2(num));
// console.log(format_with_regex(num));
console.log(format_with_regex1(num));
