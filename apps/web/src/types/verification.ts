import type { Database, Json } from '@/lib/database.types';

export type ClaimStatus = 'UNREVIEWED' | 'IN_PROGRESS' | 'VERIFIED' | 'FLAGGED' | string;
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
export type FindingStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED' | string;
export type VerificationSessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | string;

export type ClaimRow = Database['public']['Tables']['claims']['Row'];
export type FindingRow = Database['public']['Tables']['findings']['Row'];
export type VerificationQueueRow = Database['public']['Tables']['verification_queue']['Row'];
export type VerificationResultRow = Database['public']['Tables']['verification_results']['Row'];
export type OfficerMetricsRow = Database['public']['Tables']['officer_metrics']['Row'];

export interface Claim extends ClaimRow {
  status: ClaimStatus;
  findings?: Finding[];
  verification_result?: VerificationResultRow | null;
}

export interface Finding extends FindingRow {
  severity: FindingSeverity;
  status: FindingStatus;
}

export interface VerificationSession extends VerificationQueueRow {
  status: VerificationSessionStatus;
  claim: Claim;
}

export interface VerificationStats {
  caseId: string;
  totalClaims: number;
  unreviewedClaims: number;
  inProgressClaims: number;
  verifiedClaims: number;
  flaggedClaims: number;
  totalFindings: number;
  totalAdjustments: number;
  verifiedAmount: number;
}

export interface OfficerPerformance extends OfficerMetricsRow {
  officerName?: string | null;
}

export interface ClaimVerificationDetail {
  claim: Claim;
  findings: Finding[];
  stats: VerificationStats;
}

export interface FindingInput {
  claimId: string;
  caseId: string;
  category: string;
  findingType: string;
  description: string;
  adjustmentAmount: number;
  severity: FindingSeverity;
  status: FindingStatus;
  createdBy: string;
  metadata?: Json;
}
