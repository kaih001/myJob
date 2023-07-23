//前端 JavaScript 获取字符串中重复次数最多的字符
// 参考:https://juejin.cn/post/6977685978420871181
// 方法一:
function wordCount(testStr) {
  // 获取各个字符及其重复次数的映射对象
  let wordsObj = {};
  for (let index = 0; index < testStr.length; index++) {
    const word = testStr[index];
    word in wordsObj ? wordsObj[word]++ : (wordsObj[word] = 1);
  }

  // 获取最大的重复次数
  let maxNum = 0;
  for (const word in wordsObj) {
    const num = wordsObj[word];
    if (num >= maxNum) {
      maxNum = num;
    }
  }

  // 获取最大重复次数对应的字符，并输出结果
  for (const word in wordsObj) {
    const num = wordsObj[word];
    if (num === maxNum) {
      console.log(`重复次数最多的字符是：${word}，重复次数为：${maxNum}`);
    }
  }
}
// 方法二
function wordCount1() {
  const testStr =
    "bianchengsanmei,xuexiyouqudezhishi,jieshiyouqudepengyou,suzaoyouqudelinghun.ii";

  // 将字符串转为数组并排序
  const testStrArr = testStr.split("").sort();
  let startIndex = 0;
  let endIndex = 1;
  let maxNum = 0;
  let validWords = {};

  // 使用指针法，获取最大重复次数及最大次数对应的字符数组
  while (startIndex < testStrArr.length) {
    // startIndex 和 endIndex 位置的字符不同
    if (testStrArr[startIndex] !== testStrArr[endIndex]) {
      // 计算 startIndex 和 endIndex 之间的字符个数
      const rangeNum = endIndex - startIndex;
      if (rangeNum > maxNum) {
        maxNum = rangeNum;
        // 如果出现了新的最大次数，则给存放符合条件字符的数组重新赋值
        validWords = {};
        validWords[testStrArr[startIndex]] = rangeNum;
      } else if (rangeNum === maxNum) {
        validWords[testStrArr[startIndex]] = rangeNum;
      }
      startIndex = endIndex;
    }
    endIndex++;
  }

  // 打印结果
  for (const key in validWords) {
    console.log(`重复次数最多的是：${key}，重复次数为：${validWords[key]}`);
  }
  // for (let index = 0; index < validWords.length; index++) {
  //   const word = validWords[index];
  //   console.log(`重复次数最多的是：${word}，重复次数为：${maxNum}`);
  // }
}
// wordCount(testStr);
wordCount1();
