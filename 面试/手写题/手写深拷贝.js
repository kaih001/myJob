function deepClone(obj, hash = new WeakMap()) {
  if (obj === null) {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  if (typeof obj !== "object") {
    return obj;
  }
  if (hash.get(obj)) {
    return hash.get(obj);
  }
  let cloneObj = new obj.constructor();
  hash.set(obj, cloneObj);
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  return cloneObj;
}
// function deepClone(obj, hash = new WeakMap()) {
//   // 处理null或者undefined
//   if (obj === null) return obj;
//   // 处理日期类型
//   if (obj instanceof Date) return new Date(obj);
//   // 处理正则类型
//   if (obj instanceof RegExp) return new RegExp(obj);
//   // 普通值或函数不需要深拷贝
//   if (typeof obj !== "object") return obj;
//   // 对象进行深拷贝
//   if (hash.get(obj)) return hash.get(obj);
//   let cloneObj = new obj.constructor();
//   // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
//   hash.set(obj, cloneObj);
//   for (let key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       // 实现一个递归拷贝
//       cloneObj[key] = deepClone(obj[key], hash);
//     }
//   }
//   return cloneObj;
// }

function deepClone1(obj, hash = new WeakMap()) {
  if (obj === null) {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  if (typeof obj !== "object") {
    return obj;
  }
  if (hash.get(obj)) {
    return hash.get(obj);
  }
  let cloneObj = new obj.constructor();
  hash.set(obj, cloneObj);
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone1(obj[key], hash);
    }
  }
  return cloneObj;
}
function deepClone2(obj, hash = new WeakMap()) {
  if (obj === null) {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  if (typeof obj !== "object") {
    return obj;
  }
  if (hash.get(obj)) {
    return hash.get(obj);
  }
  let cloneObj = new obj.constructor();
  hash.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone2(obj[key], hash);
    }
  }
  return cloneObj;
}
let obj = {
  foo: "foo",
  bar: {
    zip: "test",
  },
};
obj.bar.foos = obj;
// const arr = [1, 2, function () {}, null, undefined, true, [3, 4]];

// console.log(deepClone1(obj));
console.log(deepClone2(arr));
