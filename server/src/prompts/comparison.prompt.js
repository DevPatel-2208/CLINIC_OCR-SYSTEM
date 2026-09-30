const comparisonPrompt = (current, previous, diffData) => `
Compare these two prescriptions for the same patient and explain the changes.

Rules:
- Only describe actual differences found in the structured data.
- Do not speculate about reasons for changes.
- Keep the explanation concise.

Previous Prescription Date: ${previous.prescriptionDate || 'Unknown'}
Current Prescription Date: ${current.prescriptionDate || 'Unknown'}

Added Medicines: ${JSON.stringify(diffData.added)}
Removed Medicines: ${JSON.stringify(diffData.removed)}
Changed Dosages: ${JSON.stringify(diffData.dosageChanged || [])}
Changed Frequencies: ${JSON.stringify(diffData.frequencyChanged || [])}

Provide a brief, clear comparison summary. Do not use markdown.
`;

module.exports = { comparisonPrompt };