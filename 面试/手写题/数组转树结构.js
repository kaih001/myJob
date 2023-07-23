/**
 * 递归转化
 * @param {数组数据} data
 * @param {存放返回结果} result
 * @param {父id} pid
 */
function arr2Tree(data = [], result = [], pid = "") {
  for (let i = 0, dataLen = data.length; i < dataLen; i++) {
    let curData = data[i];
    if (curData.pid === pid) {
      const newItem = { children: [], ...curData };
      result.push(newItem);
      arr2Tree(data, newItem.children, curData.id);
    }
  }
  return result;
}

function arr2Tree1(arr = [], result = [], pid = "") {
  for (const item of arr) {
    if (item.pid === pid) {
      const newData = { children: [], ...item };
      result.push(newData);
      arr2Tree1(arr, newData.children, item.id);
    }
  }
  return result;
}
function arr2Tree2(arr = []) {
  let result = [];
  const idArr = arr.reduce((prev, cur) => {
    prev.push(cur.id);
    return prev;
  }, []);
  const pid = arr.find((v) => {
    return idArr.indexOf(v.pid) == -1;
  })?.pid;
  const fn = (result, parentId) => {
    for (let v of arr) {
      if (v.pid === parentId) {
        const newItem = { children: [], ...v };
        result.push(newItem);
        fn(newItem.children, newItem.id);
      }
    }
  };
  fn(result, pid);
  return result;
}

/** 数组结构数据 */
const data = [
  { id: "01", name: "张大大", pid: "", job: "项目经理" },
  { id: "02", name: "小亮", pid: "01", job: "产品leader" },
  { id: "03", name: "小美", pid: "01", job: "UIleader" },
  { id: "04", name: "老马", pid: "01", job: "技术leader" },
  { id: "05", name: "老王", pid: "01", job: "测试leader" },
  { id: "06", name: "老李", pid: "01", job: "运维leader" },
  { id: "07", name: "小丽", pid: "02", job: "产品经理" },
  { id: "08", name: "大光", pid: "02", job: "产品经理" },
  { id: "09", name: "小高", pid: "03", job: "UI设计师" },
  { id: "10", name: "小刘", pid: "04", job: "前端工程师" },
  { id: "11", name: "小华", pid: "04", job: "后端工程师" },
  { id: "12", name: "小李", pid: "04", job: "后端工程师" },
  { id: "13", name: "小赵", pid: "05", job: "测试工程师" },
  { id: "14", name: "小强", pid: "05", job: "测试工程师" },
  { id: "15", name: "小涛", pid: "06", job: "运维工程师" },
];

// console.log(arr2Tree(data, [], ""));
// console.log(arr2Tree1(data, [], ""));
console.log(arr2Tree2(data));
