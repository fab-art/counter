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
