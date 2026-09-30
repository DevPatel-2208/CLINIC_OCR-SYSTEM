# AI Pipeline Documentation

## Overview

The AI pipeline converts raw OCR text into structured, doctor-approved medical records.

## Pipeline Steps

### 1. OCR Text Reception
Raw text from Tesseract OCR arrives at Node.js backend.

### 2. Gemini AI Extraction
- **Prompt**: Prescription-specific prompt (see `server/src/prompts/prescription.prompt.js`)
- **Rules**:
  - No hallucination of missing data
  - Uncertain medicines prefixed with "Possibly"
  - Never invent dosage/frequency/duration
  - Return valid JSON only

### 3. Response Parsing & Validation
- Parse JSON response
- Validate against expected schema
- Check for uncertain/missing fields

### 4. Confidence Scoring
Each medicine extracted gets a confidence score (0-100):
- 80+ : High confidence (green)
- 60-79 : Medium confidence (yellow)
- <60 : Low confidence (orange/red)

### 5. Doctor Review (Mandatory)
AI output is NEVER automatically saved as final medical data.
Doctor must:
- Review extracted information
- Edit/correct as needed
- Explicitly approve

### 6. Approval & Storage
On approval:
- Prescription status changes to APPROVED
- Medicine records created in Medicine collection
- AIProcessingLog updated with accuracy data

## AI Processing Log

Every AI extraction is logged with:
- OCR start/end timestamps
- AI start/end timestamps
- Processing times
- OCR confidence
- AI confidence
- Fields extracted count
- Fields corrected count (doctor corrections)
- Raw OCR and AI response texts
- Status (SUCCESS/FAILED/PARTIAL)

This powers the AI/OCR Evaluation Dashboard.

## RAG Architecture

```
Doctor Query
    ↓
Query Processing (extract keywords, patient references)
    ↓
MongoDB Search (find relevant prescriptions)
    ↓
Context Builder (build context from retrieved records)
    ↓
Gemini AI (answer based on context)
    ↓
Grounded Answer + Source References
```

Safety rules:
- Only retrieve records from the doctor's clinic
- Never send entire database to Gemini
- If information not found, state it clearly
- No autonomous clinical decisions

## Prompt Engineering

### Prescription Extraction Prompt
Location: `server/src/prompts/prescription.prompt.js`

Key instructions:
1. Extract medicines with dosage, frequency, duration
2. Generate brief summary
3. Identify important findings
4. Generate searchable tags
5. Return structured JSON only

### Assistant Prompt
Location: `server/src/prompts/assistant.prompt.js`

Key instructions:
1. Answer based ONLY on provided records
2. If not found, say so explicitly
3. No diagnoses or treatment recommendations
4. Be concise and factual