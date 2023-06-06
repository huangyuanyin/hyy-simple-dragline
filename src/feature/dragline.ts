import { registerDragElement } from './drag-element'
import type { DragElementOptions, StartPos } from './drag-element'

interface DraglineOptions {
  activeClassName: string
  threshold: number
  lineTypes?: LineType[]
  preventDragultDrag?: boolean
  draglineClassName?: string
  alignedClassName?: string
}

interface ElementPosition {
  l: number
  r: number
  t: number
  b: number
}

type Direction = keyof ElementPosition

type LineType = 'tt' | 'bb' | 'll' | 'rr' | 'tb' | 'bt' | 'lr' | 'rl'

const lineTypes: LineType[] = ['tt', 'bb', 'll', 'rr', 'tb', 'bt', 'lr', 'rl']

export class Dragline {
  dragElements: HTMLElement[] = []
  activeElement: HTMLElement | null = null
  elementToPositionMap: Map<HTMLElement, ElementPosition> = new Map()
  destories: (() => void)[] = []
  dragContainer: HTMLElement | null = null
  targetToLineMap: Map<HTMLElement, Map<LineType, HTMLElement>> = new Map()

  options: DraglineOptions = {
    activeClassName: 'active',
    threshold: 5,
    lineTypes,
    preventDragultDrag: false,
    draglineClassName: 'dragline',
    alignedClassName: 'aligned-item'
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
      this.calculateLine()
    }

    const onDragEnd = (event: MouseEvent) => {
      this.removeActiveElement()
      this.clearAllLine()
      this.updateElementPosition(container)
      options.onDragEnd?.(event)
    }

    const onDrag = (event: MouseEvent, startPos: StartPos) => {
      options.onDrag?.(event, startPos)

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

    const removeEventListener = registerDragElement(newOptions, this.options.preventDragultDrag)

    const destory = () => {
      removeEventListener()
      this.elementToPositionMap.delete(container)
      this.destories = this.destories.filter((item) => item !== destory)
      this.clearTaegetLine(container)
    }

    this.destories.push(destory)

    return destory
  }

  private isHorizantal(lineType: LineType) {
    if (lineType.includes('b') || lineType.includes('t')) {
      return true
    } else {
      return false
    }
  }

  private clearAllLine() {
    this.targetToLineMap.forEach((lineTypeToLines) => {
      lineTypeToLines.forEach((line) => {
        line.remove()
      })
    })
    const otherElements = this.getOtheElements()
    otherElements.forEach((el) => {
      el.classList.remove(this.options.alignedClassName!)
    })
    this.targetToLineMap.clear()
  }

  private clearTaegetLine(target: HTMLElement) {
    const lineTypeToLines = this.targetToLineMap.get(target)
    if (lineTypeToLines) {
      lineTypeToLines.forEach((line) => {
        line.remove()
      })
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

  private createDraglineEl() {
    const dragLineEl = document.createElement('div')
    dragLineEl.style.position = 'absolute'
    dragLineEl.style.boxSizing = 'border-box'
    dragLineEl.classList.add(this.options.draglineClassName!)
    return dragLineEl
  }

  private calculateLine() {
    const otherElements = this.getOtheElements()
    const activeElPosition = this.elementToPositionMap.get(this.activeElement!)!

    this.dragContainer = this.dragContainer || (this.activeElement!.offsetParent as HTMLElement)

    otherElements.forEach((target) => {
      const targetElPosition = this.elementToPositionMap.get(target)!

      this.options.lineTypes?.forEach((lineType) => {
        const [activeDirection, targetDirection] = lineType.split('') as [Direction, Direction]

        if (Math.abs(targetElPosition[targetDirection] - activeElPosition[activeDirection]) < this.options.threshold) {
          target.classList.add(this.options.alignedClassName!)
          // 磁吸效果
          if (this.isHorizantal(lineType)) {
            this.activeElement!.style.top = `${
              activeDirection === 'b' ? targetElPosition[targetDirection] - this.activeElement!.clientHeight : targetElPosition[targetDirection]
            }px`
          } else {
            this.activeElement!.style.left = `${
              activeDirection === 'r' ? targetElPosition[targetDirection] - this.activeElement!.clientWidth : targetElPosition[targetDirection]
            }px`
          }

          let dragLineEl: HTMLElement
          if (!this.targetToLineMap.has(target)) {
            const lineTypeToLines = new Map<LineType, HTMLElement>()
            dragLineEl = this.createDraglineEl()
            lineTypeToLines.set(lineType, dragLineEl)
            this.targetToLineMap.set(target, lineTypeToLines)
          } else {
            const lineTypeToLines = this.targetToLineMap.get(target)!
            if (lineTypeToLines.has(lineType)) {
              dragLineEl = lineTypeToLines.get(lineType)!
            } else {
              dragLineEl = this.createDraglineEl()
              lineTypeToLines.set(lineType, dragLineEl)
            }
          }

          if (this.isHorizantal(lineType)) {
            const xAxis = [activeElPosition.l, activeElPosition.r, targetElPosition.l, targetElPosition.r]
            const minX = Math.min(...xAxis)
            const maxX = Math.max(...xAxis)

            const dragLineElWidth = maxX - minX
            dragLineEl.style.height = '0px'
            dragLineEl.style.width = `${dragLineElWidth}px`
            dragLineEl.style.top = `${targetElPosition[targetDirection]}px`
            dragLineEl.style.left = `${minX}px`

            dragLineEl.style.borderBottom = '1px dashed #f00'
          } else {
            const yAxis = [activeElPosition.t, activeElPosition.b, targetElPosition.t, targetElPosition.b]
            const minY = Math.min(...yAxis)
            const maxY = Math.max(...yAxis)

            const dragLineElHeight = maxY - minY
            dragLineEl.style.width = '0px'
            dragLineEl.style.height = `${dragLineElHeight}px`
            dragLineEl.style.top = `${minY}px`
            dragLineEl.style.left = `${targetElPosition[targetDirection]}px`

            dragLineEl.style.borderLeft = '1px dashed #f00'
          }

          if (!dragLineEl.parentElement) {
            this.dragContainer!.appendChild(dragLineEl)
          }
        } else {
          const lineTypeToLines = this.targetToLineMap.get(target)
          if (lineTypeToLines?.has(lineType)) {
            const dragLineEl = lineTypeToLines.get(lineType)!
            dragLineEl.remove()
            lineTypeToLines.delete(lineType)

            if (lineTypeToLines.size === 0) {
              target.classList.remove(this.options.alignedClassName!)
            }
          }
        }
      })
    })
  }
}
