import { z } from 'zod'

export const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(5, 'Phone must be at least 5 characters'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  bloodGroup: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
})

export const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal('')),
})

export const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().or(z.literal('')),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const followUpSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  date: z.string().min(1, 'Date is required'),
  reason: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['UPCOMING', 'COMPLETED', 'MISSED', 'CANCELLED']).optional(),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().or(z.literal('')),
  specialization: z.string().optional().or(z.literal('')),
  professionalInfo: z.string().optional().or(z.literal('')),
})

export const clinicSettingsSchema = z.object({
  name: z.string().min(2, 'Clinic name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
