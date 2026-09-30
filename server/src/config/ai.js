const axios = require('axios');
const config = require('./env');

let geminiModule = null;
try {
  geminiModule = require('./gemini');
} catch {}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const GROQ_FALLBACK_MODEL = 'groq/compound-mini';

function getProvider() {
  const groqKey = process.env.GROQ_API_KEY;
  const hasGroq = groqKey && groqKey.trim() !== '' && groqKey !== 'your-groq-api-key' && groqKey.startsWith('gsk_');
  if (hasGroq) return 'groq';
  const gemKey = process.env.GEMINI_API_KEY;
  const hasGemini = gemKey && gemKey.trim() !== '' && gemKey !== 'your-gemini-api-key';
  if (hasGemini) return 'gemini';
  return 'none';
}

function getGroqConfig() {
  return {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL,
    temperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0.3,
    maxTokens: parseInt(process.env.GROQ_MAX_TOKENS, 10) || 4096,
  };
}

async function callGroq(prompt, { jsonMode = false, temperature, maxTokens, systemPrompt } = {}) {
  const { apiKey, model, temperature: defTemp, maxTokens: defMax } = getGroqConfig();
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const body = {
    model,
    messages,
    temperature: temperature !== undefined ? temperature : defTemp,
    max_tokens: maxTokens || defMax,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  try {
    const res = await axios.post(GROQ_API_URL, body, {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    return res.data.choices?.[0]?.message?.content || '';
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;
    const msg = data?.error?.message || err.message;
    const code = data?.error?.code || '';
    console.error(`[Groq] call failed status=${status} model=${model} code=${code} msg=${msg?.slice(0,200)}`);
    if (code === 'invalid_api_key' || msg.toLowerCase().includes('invalid api key')) {
      throw new Error('GROQ_INVALID_KEY: Groq API key invalid or expired. Get new key at https://console.groq.com/keys');
    }
    if (status === 429 || msg.toLowerCase().includes('rate')) {
      const e = new Error(`Groq rate limited: ${msg}`);
      e.statusCode = 429;
      throw e;
    }
    if (status >= 500) {
      const e = new Error(`Groq service error (${status}): ${msg}`);
      e.statusCode = 502;
      throw e;
    }
    const isModelError = status === 400 || status === 404 || code === 'model_not_found' || msg.toLowerCase().includes('model') || msg.toLowerCase().includes('decommissioned') || msg.toLowerCase().includes('does not exist');
    if (model !== GROQ_FALLBACK_MODEL && isModelError) {
      console.warn(`[Groq] model ${model} failed, retrying fallback ${GROQ_FALLBACK_MODEL}`);
      try {
        const fallbackBody = { ...body, model: GROQ_FALLBACK_MODEL };
        const res2 = await axios.post(GROQ_API_URL, fallbackBody, {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          timeout: 30000,
        });
        return res2.data.choices?.[0]?.message?.content || '';
      } catch (fallbackErr) {
        const fStatus = fallbackErr.response?.status;
        const fMsg = fallbackErr.response?.data?.error?.message || fallbackErr.message;
        console.error(`[Groq] fallback also failed status=${fStatus} msg=${fMsg?.slice(0,200)}`);
        const e = new Error(`Groq API error (model ${model} deprecated, fallback ${GROQ_FALLBACK_MODEL} also failed): ${fMsg}`);
        e.statusCode = fStatus === 429 ? 429 : 502;
        throw e;
      }
    }
    const e = new Error(`Groq API error: ${msg}`);
    if (status === 401 || status === 403) e.statusCode = 503;
    else if (status) e.statusCode = status >= 500 ? 502 : 503;
    throw e;
  }
}

async function callGemini(prompt) {
  if (!geminiModule) throw new Error('Gemini module not available');
  const model = geminiModule.getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateText(prompt, opts = {}) {
  const provider = getProvider();
  if (provider === 'groq') return callGroq(prompt, opts);
  if (provider === 'gemini') return callGemini(prompt);
  throw new Error('NO_AI_KEY');
}

async function generateJSON(prompt, opts = {}) {
  const provider = getProvider();
  let text = '';
  if (provider === 'groq') {
    text = await callGroq(prompt, { ...opts, jsonMode: true });
  } else if (provider === 'gemini') {
    text = await callGemini(prompt);
  } else {
    throw new Error('NO_AI_KEY');
  }
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) return JSON.parse(cleaned.slice(start, end + 1));
    throw e;
  }
}

module.exports = { getProvider, getGroqConfig, callGroq, callGemini, generateText, generateJSON, GROQ_DEFAULT_MODEL };
