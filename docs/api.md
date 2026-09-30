# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### POST /auth/login
Authenticate user and get JWT token.
```json
{ "email": "doctor@clinic.com", "password": "password123" }
```
Response: `{ success, data: { user, token } }`

### POST /auth/register
Create new user.
```json
{ "name": "Dr. Smith", "email": "...", "password": "...", "role": "DOCTOR", "clinicId": "..." }
```

## Admin APIs (require ADMIN role)

### GET /admin/dashboard
Returns clinic statistics.

### GET /admin/doctors
List all doctors in clinic.

### POST /admin/doctors
Add new doctor.

### GET/PUT /admin/doctors/:id
Get/update doctor details.

### PUT /admin/doctors/:id/status
Toggle doctor active/inactive.

### GET /admin/staff
List reception staff.

### POST /admin/staff
Add staff member.

### GET /admin/patients
List patients with search and pagination.

### GET /admin/analytics
Patient growth, prescription volume, processing stats.

### GET /admin/audit-logs
Paginated audit trail.

## Patient APIs

### GET /patients
List patients (query: search, page, limit).

### GET /patients/search?q=
Quick search by name/phone.

### POST /patients
Create patient.

### GET /patients/:id
Patient 360° profile.

### PUT /patients/:id
Update patient.

### GET /patients/:id/prescriptions
Patient's prescription history.

### GET /patients/:id/timeline
Treatment timeline events.

### GET /patients/:id/medicines
Grouped medicine history.

### GET /patients/:id/followups
Patient follow-up records.

## Prescription APIs

### POST /prescriptions/upload
Upload prescription image (multipart/form-data).
- Fields: image (file), patientId, prescriptionDate

### GET /prescriptions
List prescriptions (query: patientId, page, limit).

### GET /prescriptions/:id
Full prescription details with populated references.

### POST /prescriptions/:id/review
Save doctor edits/corrections.

### POST /prescriptions/:id/approve
Final approval, creates Medicine records.

### GET /prescriptions/:id/compare
Compare with previous prescription (deterministic diff).

### PUT /prescriptions/:id/important
Toggle important flag.

## OCR & AI APIs

### POST /ocr/process
Send prescription image to Python FastAPI for OCR.

### GET /ocr/status/:prescriptionId
Check OCR processing status.

### POST /ai/extract
Send OCR text to Gemini AI for structured extraction.

### POST /ai/validate
Validate AI extraction (detect uncertainty).

## Search APIs

### GET /search?q=&type=
Search patients and prescriptions by text.

### POST /search/semantic
Retrieve records for semantic analysis.

## Assistant API (DOCTOR only)

### POST /assistant/ask
Ask questions about patient records.
```json
{ "query": "Summarize last 3 prescriptions for patient X", "patientId": "..." }
```

## Other APIs

### GET/POST /followups
CRUD for follow-ups.

### PUT /followups/:id/status
Update follow-up status.

### POST /reports/prescription/:id
Generate and download PDF report.

### GET /notifications
List user notifications.

### PUT /notifications/:id/read
Mark notification as read.

## Standard Response Format

Success:
```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
```

Error:
```json
{ "success": false, "message": "...", "error": { "code": "...", "details": [] } }
```