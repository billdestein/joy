import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai'
import { config } from '../config'

const genAI = new GoogleGenerativeAI(config.geminiApiKey)

export async function generateImage(prompt: string): Promise<{ data: Buffer; mimeType: string }> {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-preview-image-generation',
    })

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
        } as GenerationConfig,
    })

    const parts = result.response.candidates?.[0]?.content?.parts ?? []
    for (const part of parts) {
        if (part.inlineData) {
            return {
                data: Buffer.from(part.inlineData.data, 'base64'),
                mimeType: part.inlineData.mimeType,
            }
        }
    }

    throw new Error('No image returned from Gemini')
}
