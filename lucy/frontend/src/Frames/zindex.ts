let currentMaxZ = 10

export function getNextZ(): number {
    return ++currentMaxZ
}

export function getCurrentMax(): number {
    return currentMaxZ
}
