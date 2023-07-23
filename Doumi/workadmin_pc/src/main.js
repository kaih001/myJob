// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import 'babel-polyfill'

import Vue from 'vue'
import store from './store/index'

//import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

import App from './App'
import router from './router'

import hevueImgPreview from 'hevue-img-preview'
Vue.use(hevueImgPreview)

// import VuePreview from 'vue-preview'
// Vue.use(VuePreview)

import { VueTracker } from '@doumi/tracker'
Vue.use(VueTracker)


//Vue.use(ElementUI)

Vue.config.productionTip = false


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
	store:store,
  template: '<App/>',
  components: { App }
})

Vue.component('my-item-zh', {
	functional: true,
	render: function (h, ctx) {
	  var item = ctx.props.item;
	  if(item.status == -1){
	     return h('div', ctx.data, [
	        h('div', { attrs: { class: 'seach-empty' } }, [item.value]),
	      ]); 
	  }else{
	    return h('li', ctx.data, [
	      h('div', { attrs: item.status == -1 ? { class: 'seach-empty' } : { class: 'name' } }, [item.value]),
	      h('span', { attrs: item.status == '已结束' ? { class: 'addr' } : ''}, [item.status])
	    ]);
	  }
	},
	props: {
	  item: { type: Object, required: true }
	}
});


