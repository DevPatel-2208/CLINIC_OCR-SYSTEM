const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./env');

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
const GEMINI_TEMPERATURE = parseFloat(process.env.GEMINI_TEMPERATURE) || 0.3;
const GEMINI_MAX_OUTPUT_TOKENS = parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, 10) || 4096;

const getGeminiModel = (modelName) => {
  return genAI.getGenerativeModel({
    model: modelName || GEMINI_MODEL,
    generationConfig: {
      temperature: GEMINI_TEMPERATURE,
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
    },
  });
};

module.exports = { genAI, getGeminiModel };
