# Security Documentation

## Authentication

- JWT-based authentication with Bearer tokens
- Passwords hashed using bcryptjs (12 salt rounds)
- Token expiration: 7 days (configurable)
- Rate limiting on login endpoints: 10 attempts per 15 minutes

## Authorization

Four roles with strict permissions:
- **ADMIN**: Full clinic management, user management, analytics
- **DOCTOR**: Medical operations, prescription upload, AI review/approve
- **RECEPTIONIST**: Patient registration, document upload (NO medical approval)
- **PATIENT**: Read-only access to own approved records

Role enforced at middleware level on every protected route.

## Data Isolation

- All database queries filter by `clinicId`
- Cross-clinic data access is impossible
- Patients can only see their own records
- Receptionists cannot approve medical data

## Input Validation

- All API inputs validated with Zod schemas
- File uploads restricted to JPG/JPEG/PNG only
- Maximum file size: 10MB
- File names sanitized (UUID-based)

## API Security

- Helmet middleware for security headers
- CORS configured to allow only the client origin
- Rate limiting on all API routes
- No stack traces exposed in production
- Consistent error response format

## Secrets Management

- All secrets in environment variables (never hardcoded)
- Gemini API key never exposed to frontend
- Cloudinary credentials server-side only
- JWT secret configurable per environment

## Audit Trail

All important actions logged:
- Login/logout
- Patient creation
- Prescription upload
- AI processing
- Doctor corrections
- Doctor approvals
- Record modifications
- PDF exports
- User management actions

## Medical Safety

- AI output requires mandatory doctor verification
- Never save unverified AI output as final medical data
- Uncertain information clearly marked
- Raw OCR preserved alongside AI-corrected text
- Patient cannot access raw OCR or internal AI processing
# Security baseline

## Authentication

ClinicOCR stores the signed JWT in the `clinicocr_token` HTTP-only cookie. The React client sends requests with credentials and restores the signed-in user through `GET /api/auth/me`; it does not persist authentication tokens in local storage.

Set `COOKIE_SECURE=true` in production. This enables the Secure cookie flag and uses `SameSite=None` for a separately hosted client. Keep `CLIENT_URL` restricted to the deployed frontend origin.

## Patient data boundaries

Patient-facing prescription endpoints return only doctor-approved records. Raw OCR, processed images, AI review metadata, and private doctor notes are excluded from patient responses. Patient report generation follows the same approval boundary.
