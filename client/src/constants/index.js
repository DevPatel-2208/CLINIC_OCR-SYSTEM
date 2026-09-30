export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
  PATIENT: 'PATIENT',
}

export const ROLES_LIST = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.DOCTOR, label: 'Doctor' },
  { value: ROLES.RECEPTIONIST, label: 'Receptionist' },
  { value: ROLES.PATIENT, label: 'Patient' },
]

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
}

export const PROCESSING_STATUS = {
  UPLOADED: 'UPLOADED',
  IMAGE_PROCESSING: 'IMAGE_PROCESSING',
  OCR_PROCESSING: 'OCR_PROCESSING',
  AI_PROCESSING: 'AI_PROCESSING',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
}

export const PROCESSING_STATUS_CONFIG = {
  [PROCESSING_STATUS.UPLOADED]: { label: 'Uploaded', color: 'gray' },
  [PROCESSING_STATUS.IMAGE_PROCESSING]: { label: 'Processing Image', color: 'blue' },
  [PROCESSING_STATUS.OCR_PROCESSING]: { label: 'OCR Processing', color: 'yellow' },
  [PROCESSING_STATUS.AI_PROCESSING]: { label: 'AI Analysis', color: 'purple' },
  [PROCESSING_STATUS.NEEDS_REVIEW]: { label: 'Needs Review', color: 'orange' },
  [PROCESSING_STATUS.APPROVED]: { label: 'Approved', color: 'green' },
  [PROCESSING_STATUS.REJECTED]: { label: 'Rejected', color: 'red' },
  [PROCESSING_STATUS.PROCESSING_FAILED]: { label: 'Failed', color: 'red' },
}

export const FOLLOWUP_STATUS = {
  UPCOMING: 'UPCOMING',
  COMPLETED: 'COMPLETED',
  MISSED: 'MISSED',
  CANCELLED: 'CANCELLED',
}

export const FOLLOWUP_STATUS_CONFIG = {
  [FOLLOWUP_STATUS.UPCOMING]: { label: 'Upcoming', color: 'blue' },
  [FOLLOWUP_STATUS.COMPLETED]: { label: 'Completed', color: 'green' },
  [FOLLOWUP_STATUS.MISSED]: { label: 'Missed', color: 'red' },
  [FOLLOWUP_STATUS.CANCELLED]: { label: 'Cancelled', color: 'gray' },
}

export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
}

export const GENDER_OPTIONS = [
  { value: GENDER.MALE, label: 'Male' },
  { value: GENDER.FEMALE, label: 'Female' },
  { value: GENDER.OTHER, label: 'Other' },
]

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const DOCUMENT_TYPES = {
  PRESCRIPTION: 'PRESCRIPTION',
  LAB_REPORT: 'LAB_REPORT',
  IMAGING: 'IMAGING',
  OTHER: 'OTHER',
}

export const TIMELINE_EVENT_TYPES = {
  PRESCRIPTION: 'PRESCRIPTION',
  FOLLOWUP: 'FOLLOWUP',
  MEDICINE: 'MEDICINE',
  NOTE: 'NOTE',
}

export const PAGE_SIZE = 10

export const FILE_SIZE_LIMIT = 10 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
