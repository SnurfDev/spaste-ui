<script setup lang="ts">
import { ref, watch } from 'vue'

declare global {
  namespace Prism {
    function highlight(text:string,grammer:Object,language:string):string
    const languages:{[lang:string]:Object}
  }
}

const emit = defineEmits(['code-input'])

let cheight = ref(0);
let cwidth = ref(0);
function highlight(text:string):string {
  return props.language?Prism.highlight(text,window.Prism.languages[props.language],props.language):text;
}
function keyHandler(event:Event) {
  let kv = event as KeyboardEvent;
  let ta = (kv.target as HTMLTextAreaElement)
  if(kv.keyCode==9) {
    kv.preventDefault();
    let ss = ta.selectionStart;
    codeVal.value = (ss?codeVal.value.substring(0,ss):"")+"    "+codeVal.value.substring(ss,codeVal.value.length);

    ta.selectionStart = ss+4;
  }
}
function inputHandler(event:Event) {
  let ta = (event.target as HTMLTextAreaElement)
  ta.rows = codeVal.value.split("\n").length;

  let code = ta.parentNode?.querySelector("code");
  if(code) {
    let rect = code.getBoundingClientRect();
    cwidth.value = rect.width+30;
    cheight.value = rect.height+30;
  }
  emit('code-input',codeVal.value)
}

const props = defineProps({
  value: String,
  language: String,
  disabled: Boolean,
});

let codeVal = ref(props.value??"");

watch(()=>props.value,(f)=>{
  codeVal.value = f??"";
})
</script>

<template>
  <div class="codeArea">
    <slot></slot>
    <pre :class="['language-'+language]" :style="{height:`${cheight}px`,width:`${cwidth}px`}"><code v-html="highlight(codeVal)"></code></pre>
    <textarea v-model="codeVal" @input="inputHandler" @keydown="keyHandler" spellcheck="false" :disabled="disabled" :style="{width:`${cwidth}px`}"></textarea>
  </div>
</template>

<style scoped>
  .codeArea {
    position: relative;
    border: 1px solid var(--text);
    border-radius: 2px;
    overflow: auto;
  }

  pre {
    color: var(--text);
    background-color: var(--background-code);
  }

  pre,textarea {
    position: absolute;
    overflow: hidden;
    top: 0;
    left: 0;
    min-width: 100%;
    min-height: 100%;
    height: fit-content;
    width: fit-content;
    font-size: 15px;
    font-family: monospace;
    line-height: 1;
    padding: 10px;
    margin: 0;
    border: none;
    outline: none;
    box-sizing: border-box;
  }
  code {
    width: fit-content;
    height: fit-content;
    font-size: 15px;
    font-family: monospace;
    line-height: 1;
  }
  textarea {
    z-index: 100;
    color: transparent;
    caret-color: var(--text);
    background-color: transparent;
    resize: none;
  }
</style>