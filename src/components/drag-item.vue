<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { registerDragElement } from '../feature/drag-element'

const dragItemRef = ref<HTMLElement | null>(null)
const handlerRef = ref<HTMLElement | null>(null)
let destory: (() => void) | null = null

onMounted(() => {
  if (dragItemRef.value && handlerRef.value) {
    destory = registerDragElement({
      container: dragItemRef.value,
      dragHandler: handlerRef.value
    })
  }
})

onBeforeUnmount(() => {
  destory && destory()
})
</script>

<template>
  <div ref="dragItemRef" class="item">
    <div ref="handlerRef" class="handler">handler</div>
    <div>item</div>
  </div>
</template>

<style scoped>
.item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  background-color: #ffbcad;
}

.handler {
  background-color: #af8;
  cursor: move;
}
</style>
