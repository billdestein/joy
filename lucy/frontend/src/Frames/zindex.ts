let _maxZIndex = 0

export function getMaxZIndex(): number {
    return _maxZIndex
}

export function nextZIndex(): number {
    return ++_maxZIndex
}

export function setZIndex(z: number): void {
    if (z > _maxZIndex) _maxZIndex = z
}
