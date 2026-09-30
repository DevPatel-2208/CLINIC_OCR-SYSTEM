const axios = require('axios');
const Prescription = require('../models/Prescription');

const EMBEDDING_DIM = 768;
const VECTOR_INDEX_NAME = 'prescription_vector_index';

async function generateEmbedding(text) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || process.env.EMBEDDING_PROVIDER === 'local') return keywordEmbedding(text);
  try {
    const res = await axios.post('https://api.groq.com/openai/v1/embeddings', {
      model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
      input: text.slice(0, 8000),
    }, { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 10000 });
    const vec = res.data?.data?.[0]?.embedding;
    if (Array.isArray(vec) && vec.length) return vec;
  } catch (_) {}
  return keywordEmbedding(text);
}

function keywordEmbedding(text) {
  const vec = new Array(EMBEDDING_DIM).fill(0);
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean).slice(0, 200);
  tokens.forEach((t, i) => {
    let h = 0; for (let c = 0; c < t.length; c++) h = (h * 31 + t.charCodeAt(c)) % EMBEDDING_DIM;
    vec[h] += 1 / (i + 1);
  });
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

function prescriptionText(p) {
  return [p.ai?.summary, (p.ai?.medicines||[]).map(m=>m.name).join(' '), (p.ai?.tags||[]).join(' '), p.doctorNotes, p.ai?.importantFindings?.join(' ')].filter(Boolean).join(' | ');
}

async function ensureVectorIndex() {
  try {
    await Prescription.collection.createIndex({ embedding: 'vector' });
  } catch (_) {}
}

async function upsertEmbedding(prescription) {
  if (prescription.processingStatus !== 'APPROVED') return;
  const text = prescriptionText(prescription);
  if (!text.trim()) return;
  const vec = await generateEmbedding(text);
  await Prescription.updateOne({ _id: prescription._id }, { $set: { embedding: vec, embeddingUpdatedAt: new Date() } });
}

async function vectorSearch({ clinicId, query, patientId, limit = 20 }) {
  const filter = { clinicId, processingStatus: 'APPROVED' };
  if (patientId) filter.patientId = patientId;
  let candidates = await Prescription.find(filter).populate('patientId', 'name phone').populate('doctorId', 'name').limit(100).select('+embedding');
  if (!candidates.length) return [];
  const hasVectors = candidates.some(c => Array.isArray(c.embedding) && c.embedding.length === EMBEDDING_DIM);
  if (!hasVectors) {
    try {
      const mongoose = require('mongoose');
      const pipeline = [{ $vectorSearch: { index: VECTOR_INDEX_NAME, path: 'embedding', queryVector: await generateEmbedding(query), numCandidates: 100, limit } }, { $match: filter }];
      const vs = await Prescription.aggregate(pipeline);
      if (vs.length) return vs;
    } catch (_) {}
  }
  const qVec = await generateEmbedding(query);
  const scored = candidates.map(c => {
    const vec = c.embedding && c.embedding.length === EMBEDDING_DIM ? c.embedding : keywordEmbedding(prescriptionText(c));
    return { doc: c, score: Math.round(cosine(qVec, vec) * 100) };
  }).filter(s => s.score > 25).sort((a,b)=>b.score-a.score).slice(0, limit).map(s => ({ ...s.doc.toObject(), relevanceScore: s.score }));
  return scored;
}

module.exports = { generateEmbedding, keywordEmbedding, upsertEmbedding, vectorSearch, prescriptionText, ensureVectorIndex, EMBEDDING_DIM };
