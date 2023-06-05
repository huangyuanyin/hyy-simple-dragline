<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import DragItem from './components/drag-item.vue'
import { Dragline } from './feature/dragline'

const dragline = new Dragline({
  activeClassName: 'active-item'
})

const containerEl = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (containerEl.value) {
    dragline.registerDragContainer(containerEl.value)
  }
})

onBeforeUnmount(() => {
  dragline.destoryAll()
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

/* .active-item {
  background-color: #e66453;
} */

.aligned-item {
  opacity: 0.7;
}
</style>
