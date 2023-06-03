import { registerDragElement, DragElementOptions } from './drag-element'

interface DraglineOptions {
  activeClassName: string
}

export class Dragline {
  dragElements: HTMLElement[] = []
  activeElement: HTMLElement | null = null

  options: DraglineOptions = {
    activeClassName: 'active'
  }

  constructor(options: Partial<DraglineOptions> = {}) {
    this.options = {
      ...this.options,
      ...options
    }
  }

  registerDragElement(options: DragElementOptions) {
    const container = options.container

    const onDragStart = (event: MouseEvent) => {
      this.setActiveElement(container)
      options.onDragStart?.(event)
    }

    const onDragEnd = (event: MouseEvent) => {
      this.removeActiveElement()
      options.onDragEnd?.(event)
    }

    this.dragElements.push(container)

    const newOptions: DragElementOptions = {
      ...options,
      onDragStart,
      onDragEnd
    }

    return registerDragElement(newOptions)
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
}
