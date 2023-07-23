// 参考：https://blog.csdn.net/pengzonglu7292/article/details/84938910
// 版本一
function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr.splice(pivotIndex, 1)[0];
  let left = [];
  let right = [];
  for (const v of arr) {
    if (v < pivot) {
      left.push(v);
    } else {
      right.push(v);
    }
  }
  return quickSort(left).concat(pivot, quickSort(right));
}
function quickSort1(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr.splice(pivotIndex, 1)[0];
  let left = [];
  let right = [];
  for (const v of arr) {
    if (v < pivot) {
      left.push(v);
    } else {
      right.push(v);
    }
  }
  return quickSort1(left).concat(pivot, quickSort1(right));
}
// const sortArr = quickSort([5, 6, 1, 9, 2, 55, 8]);
// console.log("sortArr", sortArr);

//版本二
const quicksort2 = (s, l, r) => {
  // 0 2
  console.log("要排序的数组：", s);
  if (l < r) {
    var i = l;
    var j = r;
    //哨兵  参照数 a
    var a = s[l];

    while (i < j) {
      // [7, 5, 1]
      while (i < j && s[j] >= a) {
        // 从右至左找小于a的值
        j--;
      }
      console.log("右=》左=>jjj", j);
      console.log("右=》左=>iii", i);

      if (i < j) {
        s[i] = s[j];
        i++;
        console.log("左=》右=》iii", i);
      }
      console.log("右=》左=》sss", s);
      while (i < j && s[i] < a) {
        // 从左至右找大于a的值
        i++;
      }
      console.log("左=》右=》iii", i);

      if (i < j) {
        s[j] = s[i];
        j--;
        console.log("右=》左=》jjj", j);
      }
      console.log("左=》右=》sss", s);
    }
    console.log("基准iii", i);
    s[i] = a;
    console.log("基准sss", s);
    // 递归a 左右两边的子数组
    quicksort2(s, l, i - 1);
    quicksort2(s, i + 1, r);
    return s;
  }
};
// var b = quicksort2([6, 1, 2, 7, 9, 3, 4, 5, 10, 8], 0, 9);
// console.log("bbbbbbbbb", b);

function quickSortV2(arr, left, right) {
  if (left < right) {
    let li = left;
    let ri = right;
    let temp;
    const pivot = arr[li];
    while (li < ri) {
      while (li < ri && arr[ri] >= pivot) {
        ri--;
      }
      if (li < ri) {
        temp = arr[li];
        arr[li] = arr[ri];
        arr[ri] = temp;
        li++;
      }
      while (li < ri && arr[li] < pivot) {
        li++;
      }
      if (li < ri) {
        temp = arr[ri];
        arr[ri] = arr[li];
        arr[li] = temp;
        ri--;
      }
    }
    arr[li] = pivot;
    quickSortV2(arr, left, li - 1);
    quickSortV2(arr, li + 1, right);
    return arr;
  }
}
// var b = quickSortV2([6, 1, 2, 7, 9, 3, 4, 5, 10, 8], 0, 9);
// console.log("bbbbbbbbb", b);

function quickSort3(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    let li = left;
    let ri = right;
    const pivot = arr[li];
    while (li < ri) {
      while (li < ri && arr[ri] >= pivot) {
        ri--;
      }
      if (li < ri) {
        arr[li] = arr[ri];
        li++;
      }
      while (li < ri && arr[li] < pivot) {
        li++;
      }
      if (li < ri) {
        arr[ri] = arr[li];
        ri--;
      }
    }
    arr[li] = pivot;
    quickSort3(arr, left, li - 1);
    quickSort3(arr, li + 1, right);
    return arr;
  }
}
// var b1 = quickSort3([6, 1, 2, 7, 9, 3, 4, 5, 10, 8]);
// console.log(b1);

function quickSortV4(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    let li = left;
    let ri = right;
    const pivot = arr[li];
    while (li < ri) {
      while (li < ri && arr[ri] >= pivot) {
        ri--;
      }
      if (li < ri) {
        arr[li] = arr[ri];
        li++;
      }
      while (li < ri && arr[li] < pivot) {
        li++;
      }
      if (li < ri) {
        arr[ri] = arr[li];
        ri--;
      }
    }
    arr[li] = pivot;
    quickSortV4(arr, left, li - 1);
    quickSortV4(arr, li + 1, right);
    return arr;
  }
}
// const arrV4 = quickSortV4([6, 1, 2, 7, 9, 3, 4, 5, 10, 8]);
// console.log(arrV4);
function quickSortV5(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    let li = left;
    let ri = right;
    let pivot = arr[li];
    while (li < ri) {
      while (li < ri && arr[ri] >= pivot) {
        ri--;
      }
      if (li < ri) {
        arr[li] = arr[ri];
        li++;
      }
      while (li < ri && arr[li] < pivot) {
        li++;
      }
      if (li < ri) {
        arr[ri] = arr[li];
        ri--;
      }
    }
    arr[li] = pivot;
    quickSortV5(arr, left, li - 1);
    quickSortV5(arr, li + 1, right);
    return arr;
  }
}
console.log(quickSortV5([6, 1, 2, 7, 9, 3, 4, 5, 10, 8]));
