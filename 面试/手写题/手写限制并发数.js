const promiseGenerator = (num) => {
  return new Array(num).fill(0).map(
    (item, index) => () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log(index + 1);
          resolve(index);
        }, 1000);
      })
  );
};

const PromiseLimit = (allArr, limit) => {
  if (!Array.isArray(allArr)) throw new Error("不是数组类型");
  function run() {
    if (allArr.length) {
      allArr
        .shift()()
        .then((res) => {
          allArr.length && run();
        });
    }
  }
  for (let i = 0; i < limit; i++) {
    console.log(i)
    run();
  }
};

const proArr = promiseGenerator(8);
console.log(proArr)
PromiseLimit(proArr, 5);
