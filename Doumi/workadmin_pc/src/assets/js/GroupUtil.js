class GroupUtil {
  constructor (group){
    // 小组源数据
    this.group = group
    // 保存所有小组的一维数组
    this.allGroupList = []
    this.allMemberList = []

    this._addRequireAttr(this.group)
  }
  /**
   * [addRequireAttr 给数据结构添加必要的参数 path 和 isSelect]
   * @param {[Array]} group   [小组]
   * @param {[Array]} pathArr [小组路径]
   */
  _addRequireAttr (group, pathArr){
    group.forEach((o, i, a) => {
      group[i].path = pathArr 
                            ? pathArr.concat({name: group[i].name, id: group[i].id}) 
                            : [{name: '全部', id: -1}, {name: group[i].name, id: group[i].id}]
            group[i].isSelect = false
      if(o.children.length > 0){
        this._addRequireAttr(o.children, group[i].path)
      }
    })
  }

  /**
   * [formatMember 抽取所有小组成员为一维数组]
   * @param  {[Array]} group [小组源数据]
   */
  formatMember (group){
    let allMemberList = []
    let _formatMember = (group)=>{
      group.forEach((o, i, a) => {
        o.memberList.forEach((member) => {
          member.group_name = o.name
        })
        allMemberList = allMemberList.concat(o.memberList)
        if(o.children.length > 0){
          _formatMember(o.children)
        }
      })
    }
    _formatMember(group)
    return allMemberList
  }
  /**
   * [formatGroup 抽取所有小组及子小组为一维数组]
   * @param  {[Array]} group [小组源数据]
   */
  formatGroup (group){
    let allGroupList = []
    let _formatGroup = (group) =>{
      group.forEach((o, i, a) => {
        let groupItem = {}
        groupItem.all = o
        groupItem.id = o.id
        groupItem.name = o.name
        groupItem.memberList = o.memberList
        if(o.action){
          groupItem.action = o.action
        }
        allGroupList.push(groupItem)
        if(o.children.length > 0){
          _formatGroup(o.children)
        }
      })
    }
    _formatGroup(group)
    return allGroupList
  }

  /**
   * [findGroup 根据小组名字查找小组]
   * @param  {[String]} groupName [小组名字]
   * @return {[Array]}           [符合条件的数组]
   */
  findGroupByName (groupName){
    return this.allGroupList.filter((o, i, a) => {
      if(o.name.indexOf(groupName) > -1){
        return true
      }
    })
  }

  /**
   * [findGroup 根据小组Id查找小组]
   * @param  {[String]} groupName [小组名字]
   * @return {[Array]}           [符合条件的数组]
   */
  findGroupById (groupId){
    return this.allGroupList.filter((o, i, a) => {
      if(o.id == groupId){
        return true
      }
    })[0]
  }

    /**
     * 删除小组
     * @param  {[type]} parentArray [description]
     * @param  {[type]} childArray  [description]
     * @return {[type]}             [description]
     */
    removeArrarItem (parentArray, childArray){
      childArray.forEach((o, i, a) => {
        if(parentArray.indexOf(o) > -1){
          let index = parentArray.indexOf(o)
          parentArray.splice(index, 1)
        }
      })
      return parentArray
    }

    /**
     * 添加数组
     * @param {[type]} parentArray [description]
     * @param {[type]} childArray  [description]
     */
    addArrarItem (parentArray, childArray){
      childArray.forEach((o, i, a) => {
        if(parentArray.indexOf(o) == -1){
          parentArray.push(o)
        }
      })
      return parentArray
    }
}

export default GroupUtil