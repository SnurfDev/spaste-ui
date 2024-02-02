<script setup lang="ts">
  let emit = defineEmits(["submit"])
  defineProps({
    open: Boolean
  })

  function submitPopup(e:Event) {
    let submitEvent = e as SubmitEvent;
    let form = submitEvent.target as HTMLFormElement
    emit("submit",Object.fromEntries(Object.entries(form.elements).filter(v=>isNaN(parseInt(v[0]))).map(([n,e])=>[n,(e as HTMLInputElement).value])));
  }
</script>

<template>
<div v-if="open" class="popup">
  <form @submit.prevent="submitPopup" class="viewBox">
    <slot></slot>
  </form>
</div>
</template>

<style scoped>
.popup {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  z-index: 500;
  background-color: #0008;
  form {
    background-color: var(--background);
    width: min(300px,90vw);
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 50px;
    gap: 5px;
  }
  #mainText {
    grid-column: 1/3;
  }
}
</style>