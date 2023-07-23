function joSort(arr) {
  return arr.sort((a, b) => {
    if ((a % 2 === 0 && b % 2 === 0) || (a % 2 === 1 && b % 2 === 1)) {
      return a - b;
    }
    if (a % 2 === 1 && b % 2 === 0) {
      return -1;
    }
    if (a % 2 === 0 && b % 2 === 1) {
      return 1;
    }
  });
}
const arr = [3, 2, 1, 4, 8, 7];
console.log(joSort(arr));
