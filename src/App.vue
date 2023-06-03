<script setup lang="ts">
import DragItem from './components/drag-item.vue'
import { Dragline } from './feature/dragline'

const dragline = new Dragline({
  activeClassName: 'active-item'
})
</script>

<template>
  <div>
    <div class="drag-container">
      <DragItem :dragline="dragline" />
      <DragItem :dragline="dragline" />
      <DragItem :dragline="dragline" />
      <DragItem :dragline="dragline" />
      <DragItem :dragline="dragline" />
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

.active-item {
  background-color: #e66453;
}
</style>
