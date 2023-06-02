<script setup lang="ts">
import DragItem from './components/drag-item.vue'
</script>

<template>
  <div>
    <div class="drag-container">
      <DragItem />
      <DragItem />
      <DragItem />
      <DragItem />
      <DragItem />
    </div>
  </div>
</template>

<style scoped>
.drag-container {
  position: relative;
  width: 600px;
  height: 600px;
  border: 1px solid #4100d9;
}
</style>
