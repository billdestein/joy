import { PicType } from '@billdestein/joy-common'

export function extractOutputFilename(text: string): string | null {
    for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('-- save as ')) {
            const filename = trimmed.slice('-- save as '.length).trim()
            if (filename) return filename
        }
    }
    return null
}

export function extractReferencedPics(text: string, pics: PicType[]): PicType[] {
    const filenames: string[] = []
    for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (trimmed.startsWith('-- using ')) {
            const filename = trimmed.slice('-- using '.length).trim()
            if (filename) filenames.push(filename)
        }
    }
    return filenames
        .map(f => pics.find(p => p.filename === f))
        .filter((p): p is PicType => p !== undefined)
}

export function stripCommandsAndComments(text: string): string {
    return text
        .split('\n')
        .filter(line => {
            const t = line.trim()
            return !t.startsWith('//') && !t.startsWith('--')
        })
        .join('\n')
        .trim()
}
