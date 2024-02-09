<script setup lang="ts">


import PasteEditor from '@/components/PasteEditor.vue'
</script>

<template>
  <main>
    <PasteEditor is-editing :id="$route.params.id"></PasteEditor>
  </main>
</template>

<style lang="scss" scoped>
main {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 100px);
}
</style>