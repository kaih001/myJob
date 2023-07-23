import Vue from 'vue'
import * as util from "@/assets/js/util.js";
import store from '../store';

const getPermission=({id_name,project_id=0,team_id=0})=>{
  return new Promise((relove,reject)=>{
    util.ajax({
      url:'/permission/application',
      type:'GET',
      data:{
        project_id,
        team_id
      },
      timeout:10000,
      success:(obj) => {
          if(obj && obj.errno == 0){
            let data=obj.data.filter((v,i)=>{
              return v.id_name==id_name;
            });
            relove(data);
          }else{
            reject();
          }
      },
      error: (xhr, status) => {
        reject();
      },
      noNetwork: () => {
        //网络超时
        reject();
      }
    })
  })
}

const getStorePermission=(permissionData,id_name)=>{
  return permissionData.filter((v,i)=>{
    return v.id_name==id_name;
  });
}

const permission=Vue.directive('permission', {
  inserted: function (el, binding, vnode) {
    const {id_name,project_id,team_id}=binding.value;
    console.log('ffffffffffffffff',binding);
    // const permissionData=store.state.permission.permissions;
    getPermission({id_name,project_id,team_id}).then(res=>{
      console.log('ddddddddddddd',res);
      if(!res.length){
        el.style.display='none';
      }
    });
    // if(permissionData.length){
    //   const res=getStorePermission(permissionData,id_name);
    //   if(!res.length){
    //     el.style.display='none';
    //   }
    // }else{
    //   getPermission({id_name,project_id,team_id}).then(res=>{
    //     if(!res.length){
    //       el.style.display='none';
    //     }
    //   });
    // }
  }
})

export default permission;