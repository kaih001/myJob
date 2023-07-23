<template>
  <div class="single-text-wrap" v-if="item.info">
    <el-input v-model="singleText" placeholder="请输入内容"></el-input>
  </div>
</template>

<script>
import * as util from '@/assets/js/util.js'
export default {
  name: "",
  components: {},
  props: {
    item: {
      type: Object,
      default: {},
    },
    number:{
      type:Number,
      default:0
    }
    
  },
  data() {
    return {
      singleText:this.item.info&&this.item.info.value
    }
  },
  computed: {
  },
  watch: {
    singleText(v, o) {
      this.debounceHandle(v);
    }
  },
  mounted() {
  },
  methods: {
    debounceHandle:util.debounce(function(v){
      this.singleText=this.singleText.replace(/\s*/g,"");
      this.$emit('changeComponent', {
        number: this.number,
        value: this.singleText,
        item:this.item
      })
    },500)
  }
}
</script>

<style>

</style>
