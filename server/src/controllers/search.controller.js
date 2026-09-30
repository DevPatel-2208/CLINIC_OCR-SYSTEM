const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const { generateJSON, getProvider } = require('../config/ai');
const { isPatient, resolvePatientForUser } = require('../utils/helpers');
const { vectorSearch } = require('../services/vectorSearch.service');

exports.search = async (req, res, next) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    const clinicId = req.user.clinicId;
    if (!q) return res.json({ success: true, data: { patients: [], prescriptions: [] }, meta: { total: 0 } });
    let patients = [];
    let prescriptions = [];
    if (type === 'all' || type === 'patients') {
      patients = await Patient.find({ clinicId, $or: [{ name: { $regex: q, $options: 'i' } }, { phone: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }).populate('assignedDoctor', 'name').limit(Number(limit));
    }
    if (type === 'all' || type === 'prescriptions') {
      const searchFilter = { clinicId, processingStatus: 'APPROVED' };
      if (isPatient(req.user)) { const ownPatient = await resolvePatientForUser(req.user); searchFilter.patientId = ownPatient._id; }
      prescriptions = await Prescription.find({ ...searchFilter, $or: [{ 'ai.summary': { $regex: q, $options: 'i' } }, { 'ai.tags': { $regex: q, $options: 'i' } }, { 'ai.medicines.name': { $regex: q, $options: 'i' } }, { doctorNotes: { $regex: q, $options: 'i' } }] }).populate('patientId', 'name phone').populate('doctorId', 'name').sort('-prescriptionDate').limit(Number(limit));
    }
    if (type === 'all' || type === 'medicines') {
      const medPrescriptions = await Prescription.find({ clinicId, processingStatus: 'APPROVED', 'ai.medicines.name': { $regex: q, $options: 'i' } }).populate('patientId', 'name phone').limit(Number(limit));
      const existingIds = new Set(prescriptions.map((p) => p._id.toString()));
      medPrescriptions.forEach((p) => { if (!existingIds.has(p._id.toString())) prescriptions.push(p); });
    }
    const total = prescriptions.length + patients.length;
    res.json({ success: true, data: { patients, prescriptions }, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (error) { next(error); }
};

exports.semanticSearch = async (req, res, next) => {
  try {
    const { query, patientId } = req.body;
    const clinicId = req.user.clinicId;
    if (!query) return res.status(400).json({ success: false, message: 'Query is required' });
    if (isPatient(req.user)) return res.status(403).json({ success: false, message: 'Patients cannot use semantic search' });
    const vsResults = await vectorSearch({ clinicId, query, patientId, limit: 20 });
    if (vsResults.length) {
      return res.json({ success: true, data: vsResults, message: `Found ${vsResults.length} relevant records via vector search`, provider: 'vector' });
    }
    const searchFilter = { clinicId, processingStatus: 'APPROVED' };
    if (patientId) searchFilter.patientId = patientId;
    const prescriptions = await Prescription.find(searchFilter).populate('patientId', 'name phone').populate('doctorId', 'name').sort('-prescriptionDate').limit(30);
    if (!prescriptions.length) return res.json({ success: true, data: [], message: 'No approved records found for semantic analysis' });
    const provider = getProvider();
    if (provider === 'none') {
      const fallback = prescriptions.slice(0, 10).map((p) => ({ ...p.toObject(), relevanceScore: 50 }));
      return res.json({ success: true, data: fallback, message: 'AI not configured — keyword fallback (set GROQ_API_KEY)' });
    }
    try {
      const recordsContext = prescriptions.map((p, i) => ({ index: i, id: p._id, patient: p.patientId?.name, date: p.prescriptionDate, doctor: p.doctorId?.name, summary: p.ai?.summary || '', medicines: (p.ai?.medicines || []).map((m) => m.name).join(', '), tags: p.ai?.tags || [], notes: p.doctorNotes || '' }));
      const prompt = `You are a medical record search engine. Given a search query, rank the following records by relevance.\n\nSearch Query: "${query}"\n\nRecords:\n${JSON.stringify(recordsContext, null, 2)}\n\nReturn a JSON array of objects with "index" (record index) and "relevanceScore" (0-100) sorted by relevance descending.\nOnly include records with relevanceScore > 30.\nReturn ONLY the JSON array, no other text.`;
      const rankings = await generateJSON(prompt, { temperature: 0.1, maxTokens: 2048 });
      const arr = Array.isArray(rankings) ? rankings : rankings.rankings || rankings.results || [];
      const rankedPrescriptions = arr.filter((r) => r.relevanceScore > 30).map((r) => ({ ...prescriptions[r.index].toObject(), relevanceScore: r.relevanceScore }));
      res.json({ success: true, data: rankedPrescriptions, message: `Found ${rankedPrescriptions.length} relevant records via ${provider}`, provider });
    } catch (aiError) {
      console.error('Semantic search AI error:', aiError.message);
      const fallback = prescriptions.slice(0, 10).map((p) => ({ ...p.toObject(), relevanceScore: 50 }));
      res.json({ success: true, data: fallback, message: 'Using keyword-based fallback search' });
    }
  } catch (error) { next(error); }
};
