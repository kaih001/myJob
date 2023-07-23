// call
Function.prototype.myCall = function (context, ...args) {
  context.fn = this;
  const result = context.fn(...args);
  delete context.fn;
  return result;
};
Function.prototype.myCall1 = function (context, ...args) {
  context.fn = this;
  const result = context.fn(...args);
  delete context.fn;
  return result;
};

// apply
Function.prototype.myApply = function (obj, arr) {
  let result;
  obj.fn = this;
  if (!arr) {
    return obj.fn();
  } else {
    result = obj.fn(...arr);
  }
  delete obj.fn;
  return result;
};
Function.prototype.myApply1 = function (obj, arr = []) {
  obj.fn = this;
  const result = obj.fn(...arr);
  delete obj.fn;
  return result;
};

// bind
Function.prototype.myBind = function (obj, ...args) {
  const self = this;
  return function () {
    self.apply(obj);
  };
};
Function.prototype.myBind1 = function (context, ...args) {
  const self = this;
  return function () {
    const params = Array.from(arguments);
    return self.apply(context, [...args, ...params]);
  };
};

const obj = {
  value: 2,
};
function fn(a = 0, b = 0, c, d, e) {
  // console.log("a", a);
  // console.log("b", b);
  // console.log("b", c);
  // console.log("b", d);
  // console.log("b", e);
  console.log("fn...", this.value);
  return {
    a,
    b,
    c,
    d,
    e,
    value: this.value,
  };
}
// console.log(fn.myCall(obj, 2, 3));
// console.log(fn.myCall1(obj, 2, 3));
// console.log(fn.myApply(obj, [4, 5]));
// console.log(fn.myApply1(obj));
const f = fn.myBind1(obj, 1, 2);
console.log(f(6, 7, 8));
