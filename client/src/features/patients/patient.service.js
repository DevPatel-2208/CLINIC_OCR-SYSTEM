import { patientApi } from '@/services'
import { useQuery } from '@tanstack/react-query'

export const patientService = {
  list: (params) => patientApi.list(params),
  search: (q) => patientApi.search(q),
  getMe: () => patientApi.getMe(),
  create: (data) => patientApi.create(data),
  getById: (id) => patientApi.getById(id),
  update: (id, data) => patientApi.update(id, data),
  getPrescriptions: (id) => patientApi.getPrescriptions(id),
  getTimeline: (id) => patientApi.getTimeline(id),
  getMedicines: (id) => patientApi.getMedicines(id),
  getFollowUps: (id) => patientApi.getFollowUps(id),
}

export function usePatients(params, options = {}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientService.list(params).then((r) => r.data.data),
    ...options,
  })
}

export function usePatientSearch(query, options = {}) {
  return useQuery({
    queryKey: ['patients-search', query],
    queryFn: () => patientService.search(query).then((r) => r.data.data),
    enabled: query.length > 1,
    ...options,
  })
}

export function usePatient(id, options = {}) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getById(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function usePatientPrescriptions(id, options = {}) {
  return useQuery({
    queryKey: ['patient-prescriptions', id],
    queryFn: () => patientService.getPrescriptions(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function usePatientMedicines(id, options = {}) {
  return useQuery({
    queryKey: ['patient-medicines', id],
    queryFn: () => patientService.getMedicines(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function usePatientTimeline(id, options = {}) {
  return useQuery({
    queryKey: ['patient-timeline', id],
    queryFn: () => patientService.getTimeline(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}

export function usePatientFollowUps(id, options = {}) {
  return useQuery({
    queryKey: ['patient-followups', id],
    queryFn: () => patientService.getFollowUps(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  })
}
