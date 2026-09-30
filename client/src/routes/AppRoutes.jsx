import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import { LoadingState } from '@/components/common'

import AuthLayout from '../layouts/AuthLayout'
import AdminLayout from '../layouts/AdminLayout'
import DoctorLayout from '../layouts/DoctorLayout'
import StaffLayout from '../layouts/StaffLayout'
import PatientLayout from '../layouts/PatientLayout'

const Login = lazy(() => import('../pages/auth/Login'))
const Unauthorized = lazy(() => import('../pages/auth/Unauthorized'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'))

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'))
const AdminDoctors = lazy(() => import('../pages/admin/Doctors'))
const AdminDoctorDetails = lazy(() => import('../pages/admin/DoctorDetails'))
const AdminStaff = lazy(() => import('../pages/admin/Staff'))
const AdminPatients = lazy(() => import('../pages/admin/Patients'))
const AdminPatientDetails = lazy(() => import('../pages/admin/PatientDetails'))
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics'))
const AdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs'))
const AdminSettings = lazy(() => import('../pages/admin/ClinicSettings'))
const AdminProfile = lazy(() => import('../pages/admin/Profile'))

const DoctorDashboard = lazy(() => import('../pages/doctor/Dashboard'))
const DoctorPatients = lazy(() => import('../pages/doctor/Patients'))
const DoctorPatientProfile = lazy(() => import('../pages/doctor/PatientProfile'))
const DoctorPrescriptionUpload = lazy(() => import('../pages/doctor/PrescriptionUpload'))
const DoctorPrescriptionProcessing = lazy(() => import('../pages/doctor/PrescriptionProcessing'))
const DoctorPrescriptionReview = lazy(() => import('../pages/doctor/PrescriptionReview'))
const DoctorPrescriptionDetails = lazy(() => import('../pages/doctor/PrescriptionDetails'))
const DoctorPrescriptionComparison = lazy(() => import('../pages/doctor/PrescriptionComparison'))
const DoctorTreatmentTimeline = lazy(() => import('../pages/doctor/TreatmentTimeline'))
const DoctorMedicineHistory = lazy(() => import('../pages/doctor/MedicineHistory'))
const DoctorSearch = lazy(() => import('../pages/doctor/Search'))
const DoctorAIAssistant = lazy(() => import('../pages/doctor/AIAssistant'))
const DoctorFollowUps = lazy(() => import('../pages/doctor/FollowUps'))
const DoctorDocuments = lazy(() => import('../pages/doctor/Documents'))
const DoctorReports = lazy(() => import('../pages/doctor/Reports'))
const DoctorAnalytics = lazy(() => import('../pages/doctor/Analytics'))
const DoctorImportantRecords = lazy(() => import('../pages/doctor/ImportantRecords'))
const DoctorProfile = lazy(() => import('../pages/doctor/Profile'))

const ReceptionistDashboard = lazy(() => import('../pages/receptionist/Dashboard'))
const ReceptionistPatients = lazy(() => import('../pages/receptionist/Patients'))
const ReceptionistAddPatient = lazy(() => import('../pages/receptionist/AddPatient'))
const ReceptionistPatientDetails = lazy(() => import('../pages/receptionist/PatientDetails'))
const ReceptionistUploadDocument = lazy(() => import('../pages/receptionist/UploadDocument'))
const ReceptionistFollowUps = lazy(() => import('../pages/receptionist/FollowUps'))
const ReceptionistProfile = lazy(() => import('../pages/receptionist/Profile'))

const PatientDashboard = lazy(() => import('../pages/patient/Dashboard'))
const PatientMyProfile = lazy(() => import('../pages/patient/MyProfile'))
const PatientMyPrescriptions = lazy(() => import('../pages/patient/MyPrescriptions'))
const PatientPrescriptionDetails = lazy(() => import('../pages/patient/PrescriptionDetails'))
const PatientMyMedicines = lazy(() => import('../pages/patient/MyMedicines'))
const PatientMyFollowUps = lazy(() => import('../pages/patient/MyFollowUps'))
const PatientMyReports = lazy(() => import('../pages/patient/MyReports'))
const PatientNotifications = lazy(() => import('../pages/patient/Notifications'))

const Landing = lazy(() => import('../pages/public/Landing'))
const Technology = lazy(() => import('../pages/public/Technology'))
const NotFound = lazy(() => import('../pages/public/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingState message="Loading..." />
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/technology" element={<Technology />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<RoleRoute role="ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="doctors/:id" element={<AdminDoctorDetails />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="patients/:id" element={<AdminPatientDetails />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>
          </Route>

          <Route path="/doctor" element={<RoleRoute role="DOCTOR" />}>
            <Route element={<DoctorLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="patients/:id" element={<DoctorPatientProfile />} />
              <Route path="patients/:id/timeline" element={<DoctorTreatmentTimeline />} />
              <Route path="patients/:id/medicines" element={<DoctorMedicineHistory />} />
              <Route path="prescriptions/upload" element={<DoctorPrescriptionUpload />} />
              <Route path="prescriptions/:id/processing" element={<DoctorPrescriptionProcessing />} />
              <Route path="prescriptions/:id/review" element={<DoctorPrescriptionReview />} />
              <Route path="prescriptions/:id" element={<DoctorPrescriptionDetails />} />
              <Route path="prescriptions/:id/compare" element={<DoctorPrescriptionComparison />} />
              <Route path="search" element={<DoctorSearch />} />
              <Route path="ai-assistant" element={<DoctorAIAssistant />} />
              <Route path="follow-ups" element={<DoctorFollowUps />} />
              <Route path="documents" element={<DoctorDocuments />} />
              <Route path="reports" element={<DoctorReports />} />
              <Route path="analytics" element={<DoctorAnalytics />} />
              <Route path="important-records" element={<DoctorImportantRecords />} />
              <Route path="profile" element={<DoctorProfile />} />
            </Route>
          </Route>

          <Route path="/receptionist" element={<RoleRoute role="RECEPTIONIST" />}>
            <Route element={<StaffLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<ReceptionistDashboard />} />
              <Route path="patients" element={<ReceptionistPatients />} />
              <Route path="patients/new" element={<ReceptionistAddPatient />} />
              <Route path="patients/:id" element={<ReceptionistPatientDetails />} />
              <Route path="upload" element={<ReceptionistUploadDocument />} />
              <Route path="follow-ups" element={<ReceptionistFollowUps />} />
              <Route path="profile" element={<ReceptionistProfile />} />
            </Route>
          </Route>

          <Route path="/patient" element={<RoleRoute role="PATIENT" />}>
            <Route element={<PatientLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="profile" element={<PatientMyProfile />} />
              <Route path="prescriptions" element={<PatientMyPrescriptions />} />
              <Route path="prescriptions/:id" element={<PatientPrescriptionDetails />} />
              <Route path="medicines" element={<PatientMyMedicines />} />
              <Route path="follow-ups" element={<PatientMyFollowUps />} />
              <Route path="reports" element={<PatientMyReports />} />
              <Route path="notifications" element={<PatientNotifications />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
