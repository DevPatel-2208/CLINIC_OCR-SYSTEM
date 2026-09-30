# Database Schema

## Collections

### Users
Collection of all system users (Admin, Doctor, Receptionist, Patient).

```
{
  name, email, password (hashed), role, clinicId,
  phone, specialization, professionalInfo,
  status (ACTIVE/INACTIVE),
  resetPasswordToken, resetPasswordExpires
}
```

### Clinics
Clinic/hospital information.

```
{ name, logo, address, phone, email, settings }
```

### Patients
Patient medical records.

```
{
  name, dateOfBirth, age, gender, phone, email,
  address, bloodGroup, clinicId, assignedDoctor,
  medicalHistory, allergies[]
}
```

### Prescriptions
Core collection - stores all prescription data including OCR and AI results.

```
{
  patientId, doctorId, clinicId,
  originalImage: { url, publicId, filename },
  processedImage: { url },
  imageQuality: { score, issues[] },
  ocr: { rawText, confidence, processingTime },
  ai: {
    correctedText, summary,
    medicines: [{ name, dosage, frequency, duration, confidence }],
    importantFindings[], tags[], extractionTime
  },
  doctorReview: { status, reviewedBy, reviewedAt, corrections[] },
  doctorNotes, important, prescriptionDate,
  processingStatus
}
```

### Medicines
Individual medicine records from approved prescriptions.

```
{
  name, dosage, frequency, duration, confidence,
  prescriptionId, patientId, clinicId
}
```

### FollowUps
Patient follow-up appointments.

```
{
  patientId, doctorId, clinicId, prescriptionId,
  date, reason, notes, status, completedAt
}
```

### Documents
General medical documents (lab reports, scans).

```
{
  patientId, uploadedBy, clinicId, type,
  title, description, fileUrl, publicId,
  mimeType, fileSize, important
}
```

### Notifications
User notifications.

```
{
  userId, clinicId, type (FOLLOW_UP, PRESCRIPTION, etc.),
  title, message, read, relatedEntity
}
```

### AuditLogs
Complete audit trail for security and compliance.

```
{
  userId, clinicId, action, entity, entityId,
  previousValue, newValue, metadata, ip
}
```

### AIProcessingLogs
Detailed logs of OCR/AI processing for evaluation.

```
{
  prescriptionId, clinicId,
  ocrStartedAt, ocrCompletedAt, ocrProcessingTime, ocrConfidence,
  aiStartedAt, aiCompletedAt, aiProcessingTime, aiConfidence,
  totalProcessingTime,
  fieldsExtracted, fieldsCorrected,
  rawOcrText, aiRawResponse,
  status, error, errorStage
}
```

## Indexes

Key indexes for performance:
- Users: `{ email }`, `{ clinicId, role }`
- Patients: `{ phone, clinicId }`, `{ name, phone }` (text)
- Prescriptions: `{ patientId, prescriptionDate }`, `{ doctorId }`, `{ clinicId }`, `{ processingStatus }`
- Medicines: `{ name, patientId }`
- FollowUps: `{ patientId, date }`, `{ date, status }`
- AuditLogs: `{ clinicId, createdAt }`
- AIProcessingLogs: `{ clinicId, createdAt }`

## Relationships

- User → Clinic (many-to-one)
- Patient → Clinic (many-to-one)
- Patient → Doctor (many-to-one)
- Prescription → Patient (many-to-one)
- Prescription → Doctor (many-to-one)
- Medicine → Prescription (many-to-one)
- Medicine → Patient (many-to-one)
- FollowUp → Patient (many-to-one)
- All entities filtered by clinicId for multi-clinic isolation