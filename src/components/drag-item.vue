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
      container: dragItemRef.value,
      onDrag(event, startPos) {
        const { startX, startY, startLeft, startTop } = startPos
        const { x, y } = event

        const deltaX = x - startX
        const deltaY = y - startY

        dragItemRef.value!.style.left = `${startLeft + deltaX}px`
        dragItemRef.value!.style.top = `${startTop + deltaY}px`

        // 左右边界
        if (startLeft + deltaX < 0) {
          dragItemRef.value!.style.left = `0px`
        }

        if (startLeft + deltaX > props.dragline.dragContainer!.clientWidth - dragItemRef.value!.clientWidth) {
          dragItemRef.value!.style.left = `${props.dragline.dragContainer!.clientWidth - dragItemRef.value!.clientWidth}px`
        }

        // 上下边界
        if (startTop + deltaY < 0) {
          dragItemRef.value!.style.top = `0px`
        }

        if (startTop + deltaY > props.dragline.dragContainer!.clientHeight - dragItemRef.value!.clientHeight) {
          dragItemRef.value!.style.top = `${props.dragline.dragContainer!.clientHeight - dragItemRef.value!.clientHeight}px`
        }
      }
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
