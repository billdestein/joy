class CanvasManager {
    private el: HTMLElement | null = null
    private zCounter = 100

    init(el: HTMLElement): void {
        this.el = el
    }

    getElement(): HTMLElement | null {
        return this.el
    }

    nextZIndex(): number {
        return ++this.zCounter
    }

    bringToFront(frameEl: HTMLElement): void {
        frameEl.style.zIndex = String(++this.zCounter)
    }

    addModalBackdrop(): HTMLElement {
        if (!this.el) throw new Error('Canvas not initialized')
        const backdrop = document.createElement('div')
        backdrop.style.cssText = [
            'position:absolute',
            'inset:0',
            'background:rgba(0,0,0,0.5)',
            `z-index:${++this.zCounter}`,
            'pointer-events:all',
        ].join(';')
        this.el.appendChild(backdrop)
        return backdrop
    }

    removeModalBackdrop(backdrop: HTMLElement): void {
        backdrop.parentNode?.removeChild(backdrop)
    }

    getSize(): { width: number; height: number } | null {
        if (!this.el) return null
        return { width: this.el.clientWidth, height: this.el.clientHeight }
    }
}

export const Canvas = new CanvasManager()
