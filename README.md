# ClinicOCR

**AI-Powered Medical Document Intelligence & Patient Record Management Platform**

ClinicOCR is a full-stack healthcare document-intelligence platform that digitizes handwritten prescriptions, organizes patient records, and provides AI-powered medical document processing with doctor-in-the-loop verification.

## Problem Statement

Small clinics and private doctors face challenges with:
- Illegible handwritten prescriptions
- Lost or misplaced paper records
- Difficulty searching patient history
- Manual prescription data entry
- Unstructured medical records

## Solution

ClinicOCR converts prescription images into structured digital medical records through:
1. Image quality analysis
2. OpenCV preprocessing
3. Tesseract OCR
4. Gemini AI extraction
5. Doctor verification
6. Structured storage in MongoDB

## Architecture

```
React (Frontend)
    ↓ REST API
Node.js + Express (Backend)
    ↓ ↕
MongoDB ← → Python FastAPI
               ↓ ↕
          OpenCV + Tesseract
               
Gemini AI ← Node.js ← Python OCR output
    ↓
Doctor Review
    ↓
Approved Records → Timeline / Medicine History / Comparison / RAG
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, shadcn/ui, TanStack Query, Zustand |
| Backend | Node.js, Express.js, Mongoose, JWT |
| Database | MongoDB with Mongoose ODM |
| AI/ML | Google Gemini AI, LangChain-style RAG |
| CV/OCR | Python, FastAPI, OpenCV, Tesseract |
| Storage | Cloudinary |
| Security | JWT, RBAC, bcryptjs, Helmet, Rate Limiting |

## Features

### Core
- **Smart Prescription Upload**: Upload, validate, and process prescription images
- **Image Quality Analysis**: Detect blur, lighting, rotation, resolution issues
- **OpenCV Preprocessing**: Deskew, denoise, threshold, sharpen
- **Tesseract OCR**: Extract raw text with confidence scoring
- **Gemini AI Extraction**: Structure raw OCR into medicines, dosage, frequency, duration
- **Doctor Verification**: Review, edit, and approve AI extractions (mandatory)
- **Confidence Scoring**: Each extracted field has a confidence percentage

### Medical Intelligence
- **Patient 360° Profile**: Complete patient view with history
- **Treatment Timeline**: Chronological view of all medical events
- **Medicine History**: Per-medicine historical tracking
- **Prescription Comparison**: Deterministic diff between prescriptions
- **Important Records**: Flag critical patient records

### Advanced AI
- **RAG-based AI Assistant**: Query patient records with natural language
- **Semantic Search**: Find patients, medicines, and records intelligently
- **AI Evaluation Dashboard**: Track OCR/AI accuracy and correction rates

### User Roles
- **Admin**: Clinic management, analytics, audit logs
- **Doctor**: Full prescription workflow, AI review, patient management
- **Receptionist**: Patient registration, document upload (no medical approval)
- **Patient**: View approved prescriptions, medicines, follow-ups, reports

### Security
- JWT authentication
- Role-Based Access Control (RBAC)
- Clinic-level data isolation
- Input validation with Zod
- Rate limiting
- Audit logging
- Secure file upload validation

## Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB 6+
- Tesseract OCR installed locally
- Google Gemini API key

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd ClinicOCR

# Install dependencies
npm run install:all

# Configure environment
cp .env.example server/.env
# Edit server/.env with your credentials

# Start all services
npm run dev
```

### Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/clinicocr
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PYTHON_AI_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:5173
```

### Running Individual Services

```bash
# Backend (Node.js)
cd server && npm run dev

# Frontend (React)
cd client && npm run dev

# Python AI Service
cd ai-service && uvicorn app.main:app --reload --port 8000
```

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | User login |
| `POST /api/auth/register` | User registration |
| `POST /api/prescriptions/upload` | Upload prescription image |
| `POST /api/ocr/process` | Process image through OpenCV + Tesseract |
| `POST /api/ai/extract` | Extract structured data via Gemini |
| `GET /api/prescriptions/:id` | Get prescription details |
| `POST /api/prescriptions/:id/approve` | Doctor approves prescription |
| `GET /api/timeline/patient/:id` | Get patient treatment timeline |
| `GET /api/medicines/history/:patientId` | Get medicine history |
| `GET /api/prescriptions/:id/compare` | Compare with previous prescription |
| `POST /api/assistant/ask` | AI Record Assistant query |
| `POST /api/reports/prescription/:id` | Generate PDF report |

## Prescription Processing Flow

```
Upload Image → Validate → Store in Cloudinary
    ↓
Call Python FastAPI → Quality Check → OpenCV Preprocess → Tesseract OCR
    ↓
Receive Raw OCR Text
    ↓
Send to Gemini AI → Structured Extraction → Medicines, Dosage, etc.
    ↓
Set Status: NEEDS_REVIEW
    ↓
Doctor Reviews → Edits if needed → Approves
    ↓
Save to MongoDB → Update Timeline → Update Medicine History
```

## AI Safety Principles

1. AI output requires **mandatory doctor verification** before final storage
2. Never hallucinate missing information
3. Uncertain medicines are prefixed with "Possibly"
4. Raw OCR is preserved separately from AI-corrected text
5. All corrections are logged for evaluation
6. The AI Record Assistant answers only from retrieved clinic records
7. No autonomous diagnosis or treatment recommendations

## Project Structure

```
ClinicOCR/
├── client/           # React frontend
│   ├── src/
│   │   ├── pages/    # Role-specific pages (admin, doctor, patient, receptionist)
│   │   ├── components/ # Reusable UI components
│   │   ├── services/  # API service layer
│   │   └── store/    # Zustand state management
│
├── server/           # Node.js + Express backend
│   ├── src/
│   │   ├── models/     # Mongoose schemas
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic layer
│   │   ├── routes/      # API routes
│   │   ├── middleware/   # Auth, RBAC, validation
│   │   └── prompts/     # Gemini AI prompts
│
├── ai-service/       # Python FastAPI CV/OCR service
│   ├── app/
│   │   ├── services/image/  # OpenCV operations
│   │   ├── services/ocr/     # Tesseract OCR
│   │   └── routes/           # API endpoints
│
└── docs/             # Documentation
```

## Screenshots

(Add screenshots of the application here)

## License

MIT

## Future Scope

- Multi-language OCR support
- Voice-to-text prescription entry
- Telemedicine integration
- Pharmacy integration
- Insurance claim processing
- Advanced analytics dashboard
- Mobile apps (React Native)