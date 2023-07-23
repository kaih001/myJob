Promise.myAll = function (arr) {
  return new Promise((resolve, reject) => {
    let arrCount = 0;
    let arrIndex = 0;
    let resoCount = 0;
    let result = [];
    for (const key of arr) {
      arrCount += 1;
      Promise.resolve(key).then((v) => {
        result[arrIndex++] = v;
        resoCount += 1;
        if (resoCount === arrCount) {
          resolve(result);
        }
      });
    }
    if (arrCount === 0) {
      resolve(result);
    }
  });
};
Promise.myAll([1, 2, 3, Promise.resolve(99), Promise.reject(0)])
  .then((v) => {
    console.log(v);
  })
  .catch((err) => {
    console.log("out-catch", err);
  });
