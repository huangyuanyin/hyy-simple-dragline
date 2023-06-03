import { registerDragElement, DragElementOptions } from './drag-element'

interface DraglineOptions {
  activeClassName: string
  threshold: number
}

interface ElementPosition {
  l: number
  r: number
  t: number
  b: number
}

export class Dragline {
  dragElements: HTMLElement[] = []
  activeElement: HTMLElement | null = null
  elementToPositionMap: Map<HTMLElement, ElementPosition> = new Map()
  destories: (() => void)[] = []
  dragContainer: HTMLElement | null = null
  targetToLineMap: Map<HTMLElement, HTMLElement> = new Map()

  options: DraglineOptions = {
    activeClassName: 'active',
    threshold: 5
  }

  constructor(options: Partial<DraglineOptions> = {}) {
    this.options = {
      ...this.options,
      ...options
    }
  }

  destoryAll() {
    this.destories.forEach((destory) => destory())
    this.elementToPositionMap.clear()
    this.targetToLineMap.clear()
  }

  registerDragContainer(el: HTMLElement) {
    this.dragContainer = el
  }

  registerDragElement(options: DragElementOptions) {
    const container = options.container

    this.setElementPosition(container)

    const onDragStart = (event: MouseEvent) => {
      this.setActiveElement(container)
      options.onDragStart?.(event)
    }

    const onDragEnd = (event: MouseEvent) => {
      this.removeActiveElement()
      this.clearAllLine()
      options.onDragEnd?.(event)
    }

    const onDrag = (event: MouseEvent) => {
      options.onDrag?.(event)

      this.updateElementPosition(container)

      // 计算是否应该展示一条线，并且给他展示出来
      this.calculateLine()
    }

    this.dragElements.push(container)

    const newOptions: DragElementOptions = {
      ...options,
      onDragStart,
      onDragEnd,
      onDrag
    }

    const removeEventListener = registerDragElement(newOptions)

    const destory = () => {
      removeEventListener()
      this.elementToPositionMap.delete(container)
      this.destories = this.destories.filter((item) => item !== destory)
      this.clearTaegetLine(container)
    }

    this.destories.push(destory)

    return destory
  }

  private clearAllLine() {
    this.targetToLineMap.forEach((line) => {
      line.remove()
    })

    this.targetToLineMap.clear()
  }

  private clearTaegetLine(target: HTMLElement) {
    const line = this.targetToLineMap.get(target)
    if (line) {
      line.remove()
      this.targetToLineMap.delete(target)
    }
  }

  private setElementPosition(element: HTMLElement) {
    const elPosition: ElementPosition = {
      l: element.offsetLeft,
      r: element.offsetLeft + element.offsetWidth,
      t: element.offsetTop,
      b: element.offsetTop + element.offsetHeight
    }

    this.elementToPositionMap.set(element, elPosition)
  }

  private setActiveElement(element: HTMLElement) {
    this.activeElement = element
    this.activeElement.classList.add(this.options.activeClassName)
  }

  private removeActiveElement() {
    if (this.activeElement) {
      this.activeElement.classList.remove(this.options.activeClassName)
    }
  }

  private getOtheElements() {
    return this.dragElements.filter((item) => item !== this.activeElement)
  }

  private updateElementPosition(element: HTMLElement) {
    const position = this.elementToPositionMap.get(element)!
    if (position) {
      position.l = element.offsetLeft
      position.r = element.offsetLeft + element.offsetWidth
      position.t = element.offsetTop
      position.b = element.offsetTop + element.offsetHeight
    }
  }

  private calculateLine() {
    const otherElements = this.getOtheElements()
    const activeElPosition = this.elementToPositionMap.get(this.activeElement!)!

    this.dragContainer = this.dragContainer || (this.activeElement!.offsetParent as HTMLElement)

    otherElements.forEach((target) => {
      const targetTop = target.offsetTop
      const activeTop = this.activeElement!.offsetTop
      const targetElPosition = this.elementToPositionMap.get(target)!

      if (Math.abs(targetTop - activeTop) < this.options.threshold) {
        this.activeElement!.style.top = `${targetElPosition['t']}px`

        const xAxis = [activeElPosition.l, activeElPosition.r, targetElPosition.l, targetElPosition.r]
        const minX = Math.min(...xAxis)
        const maxX = Math.max(...xAxis)

        let dragLineEl: HTMLElement
        if (!this.targetToLineMap.has(target)) {
          dragLineEl = document.createElement('div')

          dragLineEl.style.position = 'absolute'
          dragLineEl.style.boxSizing = 'border-box'
          dragLineEl.style.borderBottom = '1px dashed #f00'
          this.targetToLineMap.set(target, dragLineEl)
        } else {
          dragLineEl = this.targetToLineMap.get(target)!
        }

        const dragLineElWidth = maxX - minX
        dragLineEl.style.height = '0px'
        dragLineEl.style.width = `${dragLineElWidth}px`
        dragLineEl.style.top = `${targetElPosition['t']}px`
        dragLineEl.style.left = `${minX}px`

        if (!dragLineEl.parentElement) {
          this.dragContainer!.appendChild(dragLineEl)
        }
      } else {
        this.clearTaegetLine(target)
      }
    })
  }
}
