import { GoogleGenAI } from '@google/genai'
import { config } from '../config'

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey })

export async function generateImage(prompt: string): Promise<{ data: Buffer; mimeType: string }> {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt,
        config: { numberOfImages: 1 },
    })

    const image = response.generatedImages?.[0]
    if (!image?.image?.imageBytes) {
        throw new Error('No image returned from Gemini')
    }

    return {
        data: Buffer.from(image.image.imageBytes, 'base64'),
        mimeType: 'image/png',
    }
}
