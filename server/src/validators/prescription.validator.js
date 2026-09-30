const { z } = require('zod');

const reviewSchema = z.object({
  corrections: z.array(z.object({
    field: z.string(),
    originalValue: z.any(),
    correctedValue: z.any(),
    reason: z.string().optional(),
  })).optional(),
  doctorNotes: z.string().optional(),
  important: z.boolean().optional(),
});

const approveSchema = z.object({
  doctorNotes: z.string().optional(),
  important: z.boolean().optional(),
  corrections: z.array(z.object({
    field: z.string(),
    originalValue: z.any(),
    correctedValue: z.any(),
    reason: z.string().optional(),
  })).optional(),
});

module.exports = { reviewSchema, approveSchema };