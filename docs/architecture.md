# Architecture

ClinicOCR follows a **three-tier architecture** with an additional AI/CV microservice.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Client                      │
│  (Tailwind CSS, TanStack Query, Zustand, shadcn/ui) │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS REST API
                       ▼
┌─────────────────────────────────────────────────────┐
│                Node.js + Express Server              │
│                                                      │
│  Routes → Middleware (Auth, RBAC, Rate Limit)        │
│       → Controllers → Services → Models             │
│                                                      │
│  Services:                                           │
│  ├── Auth Service           ┌─────────────────┐     │
│  ├── Patient Service        │   Google Gemini  │     │
│  ├── Prescription Service  ◄─── AI Service     │     │
│  ├── OCR Service           └─────────────────┘     │
│  ├── AI Service                                     │
│  ├── Comparison Engine                              │
│  ├── Timeline Engine                                │
│  ├── RAG Assistant                                  │
│  └── Report Generator                               │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌───────────┐ ┌──────────┐ ┌──────────┐
   │  MongoDB  │ │Python AI │ │Cloudinary│
   │           │ │ Service  │ │  Image   │
   │ 10 Models │ │FastAPI   │ │ Storage  │
   │ Indexed   │ │OpenCV    │ │          │
   │           │ │Tesseract │ │          │
   └───────────┘ └──────────┘ └──────────┘
```

## Data Flow: Prescription Processing

```
1. Doctor uploads prescription image
2. Backend validates file type & size
3. Image stored in Cloudinary
4. Original URL saved in Prescription model
5. Backend calls Python FastAPI
6. Python loads image, runs quality check
7. OpenCV preprocessing pipeline:
   - Deskew → Grayscale → Denoise → CLAHE → Threshold → Sharpen
8. Tesseract OCR extracts raw text
9. OCR confidence calculated
10. Backend receives raw text
11. Gemini AI extracts structured data:
    - Corrects text
    - Extracts medicines + dosage + frequency + duration
    - Generates summary
    - Identifies important findings
    - Generates tags
12. AIProcessingLog records all timing & accuracy data
13. Prescription status set to NEEDS_REVIEW
14. Doctor reviews, edits, approves
15. Approved record saved, Medicine instances created
16. Patient timeline and medicine history updated
17. Record available for search, RAG, and patient portal
```

## Security Architecture

```
Client Request
    │
    ▼
HTTPS (TLS)
    │
    ▼
Rate Limiter
    │
    ▼
JWT Authentication (Bearer Token)
    │
    ▼
Role-Based Access Control
    ├── ADMIN: Full access within clinic
    ├── DOCTOR: Medical operations, review, approve
    ├── RECEPTIONIST: Patient CRUD, upload (no medical approval)
    └── PATIENT: Read-only approved records
    │
    ▼
Input Validation (Zod)
    │
    ▼
Clinic-Level Data Isolation
    All queries filter by clinicId
    │
    ▼
Audit Logging