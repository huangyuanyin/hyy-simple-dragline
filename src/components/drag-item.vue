<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Dragline } from '../feature/dragline'

const props = defineProps<{
  dragline: Dragline
}>()

const dragItemRef = ref<HTMLElement | null>(null)
let destory: (() => void) | null = null

onMounted(() => {
  if (dragItemRef.value) {
    destory = props.dragline.registerDragElement({
      container: dragItemRef.value
    })
  }
})

onBeforeUnmount(() => {
  destory && destory()
})
</script>

<template>
  <div ref="dragItemRef" class="item">
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
  cursor: move;
}
</style>
