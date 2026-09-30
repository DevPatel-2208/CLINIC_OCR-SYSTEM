import api from './api'

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  updateProfile: (data) => api.patch('/auth/me', data),
}

export const patientApi = {
  list: (params) => api.get('/patients', { params }),
  search: (q) => api.get(`/patients/search?q=${q}`),
  getMe: () => api.get('/patients/me'),
  create: (data) => api.post('/patients', data),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  getPrescriptions: (id) => api.get(`/patients/${id}/prescriptions`),
  getTimeline: (id) => api.get(`/patients/${id}/timeline`),
  getMedicines: (id) => api.get(`/patients/${id}/medicines`),
  getFollowUps: (id) => api.get(`/patients/${id}/followups`),
  getDocuments: (id) => api.get(`/patients/${id}/documents`),
}

export const prescriptionApi = {
  list: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  upload: (formData) => api.post('/prescriptions/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  review: (id, data) => api.post(`/prescriptions/${id}/review`, data),
  approve: (id, data) => api.post(`/prescriptions/${id}/approve`, data),
  reject: (id, data) => api.post(`/prescriptions/${id}/reject`, data),
  retry: (id) => api.post(`/prescriptions/${id}/retry`),
  compare: (id) => api.get(`/prescriptions/${id}/compare`),
  toggleImportant: (id) => api.put(`/prescriptions/${id}/important`),
  getRevisions: (id) => api.get(`/prescriptions/${id}/revisions`),
}

export const medicineApi = {
  getPatientHistory: (patientId) => api.get(`/medicines/history/${patientId}`),
  searchByName: (name) => api.get(`/medicines/search/${name}`),
}

export const timelineApi = {
  getPatientTimeline: (patientId) => api.get(`/timeline/patient/${patientId}`),
}

export const searchApi = {
  search: (params) => api.get('/search', { params }),
  semanticSearch: (data) => api.post('/search/semantic', data),
}

export const followUpApi = {
  list: (params) => api.get('/followups', { params }),
  create: (data) => api.post('/followups', data),
  getById: (id) => api.get(`/followups/${id}`),
  update: (id, data) => api.put(`/followups/${id}`, data),
  updateStatus: (id, status) => api.put(`/followups/${id}/status`, { status }),
  remove: (id) => api.delete(`/followups/${id}`),
}

export const reportApi = {
  generatePrescriptionReport: (id) => api.post(`/reports/prescription/${id}`, {}, { responseType: 'blob' }),
  getPatientReports: (patientId) => api.get(`/reports/patient/${patientId}`),
}

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getAIEvaluation: () => api.get('/analytics/ai-evaluation'),
}

export const notificationApi = {
  list: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
}

export const ocrApi = {
  processImage: (prescriptionId) => api.post('/ocr/process', { prescriptionId }),
  getStatus: (id) => api.get(`/ocr/status/${id}`),
}

export const aiApi = {
  extract: (prescriptionId) => api.post('/ai/extract', { prescriptionId }),
  validate: (prescriptionId) => api.post('/ai/validate', { prescriptionId }),
}

export const assistantApi = {
  ask: (data) => api.post('/assistant/ask', data),
}

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getDoctors: () => api.get('/admin/doctors'),
  addDoctor: (data) => api.post('/admin/doctors', data),
  getDoctor: (id) => api.get(`/admin/doctors/${id}`),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  toggleDoctorStatus: (id) => api.put(`/admin/doctors/${id}/status`),
  getStaff: () => api.get('/admin/staff'),
  addStaff: (data) => api.post('/admin/staff', data),
  getStaffMember: (id) => api.get(`/admin/staff/${id}`),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  toggleStaffStatus: (id) => api.put(`/admin/staff/${id}/status`),
  getPatients: (params) => api.get('/admin/patients', { params }),
  getPatientDetails: (id) => api.get(`/admin/patients/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
}
