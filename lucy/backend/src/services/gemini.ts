import { GoogleGenAI } from '@google/genai'
import { config } from '../config'

let aiInstance: GoogleGenAI | null = null

export function getAiClient(): GoogleGenAI {
    if (!aiInstance) {
        aiInstance = new GoogleGenAI({ apiKey: config.googleApiKey })
    }
    return aiInstance
}
