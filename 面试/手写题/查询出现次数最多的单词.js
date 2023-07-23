// 查询出现次数最多的单词
// 参考:https://juejin.cn/post/7194615651242082341
function fn() {
  let article = " hello word hello come的喂 come的喂 come的喂";
  let newArticle = article.trim();
  let match = newArticle.match(/[a-zA-Z]+/gi);
  let wordLength,
    word,
    max = 0,
    maxWord = [];
  for (let i = 0; i < match.length; i++) { 
    word = new RegExp("" + match[i] + "", "g");
    console.log("word", word);
    wordLength = article.match(word).length;
    if (wordLength == max) {
      max = wordLength;
      maxWord.push(match[i]);
    } else if (wordLength > max) {
      max = wordLength;
      maxWord = [];
      maxWord[0] = match[i];
    }
  }
  maxWord = [...new Set([...maxWord])];
  console.log(`出现次数最多的单词是：${maxWord}。次数为：${max}`);
}
fn();
