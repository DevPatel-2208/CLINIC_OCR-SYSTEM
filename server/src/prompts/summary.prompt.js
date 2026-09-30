const summaryPrompt = (rawOcrText, correctedText) => `
Generate a concise medical summary from this prescription text.

Rules:
- Only use information present in the text.
- Do not add clinical interpretations.
- Be concise (1-2 lines).

Raw OCR: ${rawOcrText}
Corrected: ${correctedText}

Return only the summary text, no JSON.
`;

module.exports = { summaryPrompt };