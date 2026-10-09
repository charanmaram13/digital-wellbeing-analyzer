import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';
import logger from '../utils/logger.js';

let genAI = null;

if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    logger.info('Gemini AI Provider initialized with API key.');
  } catch (err) {
    logger.warn('Failed to initialize GoogleGenerativeAI:', err.message);
  }
} else {
  logger.info('No GEMINI_API_KEY configured. System will use deterministic rule-based insights.');
}

/**
 * Calls Gemini with system prompt and validated user metrics,
 * expecting a JSON structure matching the schema.
 */
export async function generateGeminiInsights({ systemInstruction, userInstruction }) {
  if (!genAI || !env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured or client unavailable');
  }

  try {
    // Use gemini-1.5-flash or gemini-2.0-flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(userInstruction);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Empty response received from Gemini');
    }

    // Clean any markdown formatting if present
    const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return parsed;
  } catch (error) {
    logger.warn('Gemini API request failed:', error.message);
    throw error;
  }
}

export function isGeminiAvailable() {
  return Boolean(genAI && env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);
}

export default { generateGeminiInsights, isGeminiAvailable };
