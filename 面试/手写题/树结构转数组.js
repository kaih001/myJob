function tree2Arr(tree) {
  let arr = [];
  const defs = (tree) => {
    tree.forEach((element) => {
      if (element.children) {
        defs(element.children);
        delete element.children;
      }
      arr.push(element);
    });
  };
  defs(tree);
  return arr;
}
/** 树状形结构数据treeData */
const treeData = [
  {
    id: 2,
    title: "中国",
    parent_id: 0,
    children: [
      {
        id: 3,
        title: "广东省",
        parent_id: 2,
        children: [
          {
            id: 4,
            title: "广州市",
            parent_id: 3,
            children: [{ id: 5, title: "天河区", parent_id: 4 }],
          },
        ],
      },
      { id: 6, title: "湖南省", parent_id: 2 },
    ],
  },
  { id: 1, title: "俄罗斯", parent_id: 0 },
];
const newArr = tree2Arr(treeData);
console.log(newArr);
