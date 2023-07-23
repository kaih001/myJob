function elCount(arr) {
  return arr.reduce((pre, cur) => {
    cur in pre ? pre[cur]++ : (pre[cur] = 1);
    return pre;
  }, {});
}
let names = ["Alice", "Bob", "Tiff", "Bruce", "Alice"];
console.log(elCount(names)); //{Alice: 2, Bob: 1, Tiff: 1, Bruce: 1}
