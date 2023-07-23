function flatter(arr) {
  return arr.reduce((prev, cur) => {
    return prev.concat(Array.isArray(cur) ? flatter(cur) : cur);
  }, []);
}
function flatter1(arr) {
  return arr.reduce((prev, cur) => {
    return prev.concat(Array.isArray(cur) ? flatter1(cur) : cur);
  }, []);
}
function flatter2(arr) {
  return arr.reduce((prev, cur) => {
    return prev.concat(Array.isArray(cur) ? flatter2(cur) : cur);
  }, []);
}
const arr = [1, [2, 3], [4, [5, 6, [{ id: 1 }]]]];
// console.log(flatter(arr));
// console.log(flatter1(arr));
console.log(flatter2(arr));
