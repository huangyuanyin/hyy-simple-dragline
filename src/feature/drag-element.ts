export interface DragElementOptions {
  container: HTMLElement
  dragHandler?: HTMLElement
  onDragStart?: (event: MouseEvent) => void
  onDrag?: (event: MouseEvent) => void
  onDragEnd?: (event: MouseEvent) => void
}

export function registerDragElement(options: DragElementOptions) {
  const { container, dragHandler = container, onDragStart, onDrag, onDragEnd } = options

  let isDragging = false
  // 鼠标位置
  let startX = 0
  let startY = 0

  // 元素位置
  let startLeft = 0
  let startTop = 0

  const onMouseStart = (event: MouseEvent) => {
    isDragging = true
    const { clientX: x, clientY: y } = event
    startX = x
    startY = y

    startLeft = container.offsetLeft
    startTop = container.offsetTop

    onDragStart?.(event)
  }

  const onMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      const { clientX: x, clientY: y } = event

      const deltaX = x - startX
      const deltaY = y - startY

      container.style.left = `${startLeft + deltaX}px`
      container.style.top = `${startTop + deltaY}px`

      onDrag?.(event)
    }
  }

  const onMouseUp = (event: MouseEvent) => {
    if (isDragging) {
      isDragging = false

      onDragEnd?.(event)
    }
  }

  dragHandler.addEventListener('mousedown', onMouseStart, false)
  document.addEventListener('mousemove', onMouseMove, false)
  document.addEventListener('mouseup', onMouseUp)

  return () => {
    dragHandler.removeEventListener('mousedown', onMouseStart, false)
    document.removeEventListener('mousemove', onMouseMove, false)
    document.removeEventListener('mouseup', onMouseUp)
  }
}
