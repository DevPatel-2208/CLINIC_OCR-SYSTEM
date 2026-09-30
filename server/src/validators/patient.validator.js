const { z } = require('zod');

const createPatientSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  dateOfBirth: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  assignedDoctor: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.array(z.string()).optional(),
});

const updatePatientSchema = createPatientSchema.partial();

module.exports = { createPatientSchema, updatePatientSchema };