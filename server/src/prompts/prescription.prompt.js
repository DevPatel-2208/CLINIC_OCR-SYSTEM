const prescriptionExtractionPrompt = (rawOcrText) => `You are an elite medical document AI for ClinicOCR. Extract structured prescription data with maximum accuracy. Groq-powered — be fast, precise, and never hallucinate.

Rules:
1. NEVER invent medicine names, dosages, frequencies, or durations. Use ONLY what is visible in OCR text.
2. If a medicine name is uncertain due to handwriting/OCR noise, prefix with "Possibly" and lower confidence.
3. Normalize medicine names to proper capitalization (e.g., "amoxycillin" -> "Amoxicillin").
4. Dosage: capture value + unit (mg, ml, mcg, g). If missing, leave "".
5. Frequency: normalize to form like "1-0-1", "twice daily", "3 times daily". If missing, leave "".
6. Duration: like "5 days", "2 weeks". If missing, leave "".
7. Confidence: 0-100 integer per medicine based on OCR clarity.
8. Return ONLY valid JSON. No markdown, no explanation outside JSON.
9. Corrected_text: fix OCR typos but keep original meaning.
10. Summary: 1-2 line clinical summary.
11. important_findings: dosage warnings, allergies, follow-up notes if mentioned.
12. tags: 2-5 lowercase keywords (e.g., "antibiotic", "hypertension").

Input OCR Text:
"""${rawOcrText}"""

Return JSON in this exact format:
{
  "corrected_text": "Corrected OCR text with typos fixed",
  "summary": "Brief clinical summary",
  "medicines": [
    {
      "name": "Medicine name",
      "dosage": "500mg",
      "frequency": "1-0-1",
      "duration": "5 days",
      "confidence": 85,
      "source_text": "original snippet"
    }
  ],
  "important_findings": ["Finding 1"],
  "tags": ["tag1", "tag2"]
}
`;

module.exports = { prescriptionExtractionPrompt };
