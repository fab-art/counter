import { z } from 'zod';

export const findingSchema = z.object({
  claimId: z.string().uuid(),
  caseId: z.string().uuid(),
  category: z.enum(['PHARMACOLOGY', 'RSSB_RULES', 'FRAUD', 'DOCUMENTATION']),
  findingType: z.string().min(2, 'Finding type is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  adjustmentAmount: z.number().nonnegative(),
  severity: z.string(),
  status: z.string().default('OPEN'),
  createdBy: z.string().uuid(),
  metadata: z.any().optional(),
});

export type FindingSchema = z.infer<typeof findingSchema>;

export const uploadSchema = z.object({
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  fileSize: z.number().positive(),
  status: z.string().default('PENDING'),
  uploadedBy: z.string().uuid(),
  facilityId: z.string().uuid().nullable().optional(),
});

export const claimSchema = z.object({
  claimNumber: z.string().min(1),
  patientName: z.string().min(1),
  patientId: z.string().min(1),
  totalAmount: z.number().nonnegative(),
  facilityId: z.string().uuid(),
  caseId: z.string().uuid().nullable().optional(),
  status: z.string().default('UNREVIEWED'),
});
