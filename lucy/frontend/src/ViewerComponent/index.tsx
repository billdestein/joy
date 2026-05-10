interface Props {
    encodedImage: string
    mimeType: string
}

export function ViewerComponent({ encodedImage, mimeType }: Props) {
    if (!encodedImage) {
        return <div style={{ width: '100%', height: '100%', background: '#000' }} />
    }

    const fullMimeType = mimeType.startsWith('image/') ? mimeType : `image/${mimeType}`
    const src = `data:${fullMimeType};base64,${encodedImage}`

    return (
        <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
                src={src}
                alt="Generated"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
        </div>
    )
}
