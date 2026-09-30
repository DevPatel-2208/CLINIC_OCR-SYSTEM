const { z } = require('zod');

const createFollowUpSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  date: z.string().min(1, 'Date is required').refine((v) => !isNaN(new Date(v).getTime()), 'Invalid date'),
  reason: z.string().min(2, 'Reason must be at least 2 characters').max(200).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  prescriptionId: z.string().optional().or(z.literal('')),
});

const updateFollowUpSchema = z.object({
  date: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['UPCOMING', 'COMPLETED', 'MISSED', 'CANCELLED']).optional(),
});

module.exports = { createFollowUpSchema, updateFollowUpSchema };