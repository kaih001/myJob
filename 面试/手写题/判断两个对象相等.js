/**
 * Quick object check - this is primarily used to tell
 * objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}
function isEqual(obj1 = {}, obj2 = {}) {
  const isObject = (obj) =>
    Object.prototype.toString.call(obj) === "[object Object]";
  // 如果两个都不是对象
  if (!(isObject(obj1) && isObject(obj2))) {
    return false;
  }
  // 循环对比对象属性值是否相等
  for (const key in obj1) {
    if (obj1.hasOwnProperty.call(obj2, key)) {
      if (isObject(obj1[key]) && isObject(obj2[key])) {
        return isEqual(obj1[key], obj2[key]);
      } else if (obj1[key] !== obj2[key]) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}
/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual(a, b) {
  if (a === b) return true;
  const isObjectA = isObject(a);
  const isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a);
      const isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return (
          a.length === b.length &&
          a.every((e, i) => {
            return looseEqual(e, b[i]);
          })
        );
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        return (
          keysA.length === keysB.length &&
          keysA.every((key) => {
            return looseEqual(a[key], b[key]);
          })
        );
      } else {
        /* istanbul ignore next */
        return false;
      }
    } catch (e) {
      /* istanbul ignore next */
      return false;
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
}
function looseEqual1(a, b) {
  if (a === b) {
    return true;
  }
  const isObjectA = isObject(a);
  const isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return (
      keysA.length === keysB.length &&
      keysA.every((key) => {
        return looseEqual(a[key], b[key]);
      })
    );
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
}
function looseEqual2(a, b) {
  if (a === b) {
    return true;
  }
  const isObjectA = isObject(a);
  const isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return (
      keysA.length === keysB.length &&
      keysA.every((key) => {
        return looseEqual2(a[key], b[key]);
      })
    );
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
}

const obj1 = {
  a: 2,
  b: 3,
  c: 3,
  d: function t() {},
};
const obj2 = {
  a: 2,
  b: 3,
  c: 3,
  d: function t() {},
};
// console.log(isEqual(obj1, obj2));
// console.log(looseEqual(obj1, obj2));
console.log(looseEqual1(obj1, obj2));
