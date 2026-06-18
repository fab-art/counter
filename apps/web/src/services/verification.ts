import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type {
  Claim,
  ClaimVerificationDetail,
  Finding,
  FindingInput,
  OfficerPerformance,
  VerificationSession,
  VerificationStats,
} from '@/types/verification';

type ClaimUpdate = Database['public']['Tables']['claims']['Update'];
type FindingInsert = Database['public']['Tables']['findings']['Insert'];
type OfficerMetricsRow = Database['public']['Tables']['officer_metrics']['Row'];

interface VerificationQueueRecord {
  id: string;
  claim_id: string;
  batch_id: string | null;
  priority: number;
  status: string;
  assigned_to: string | null;
  created_at: string;
  claims: Claim | null;
}

function toVerificationSession(record: VerificationQueueRecord): VerificationSession | null {
  if (!record.claims) {
    return null;
  }

  return {
    id: record.id,
    claim_id: record.claim_id,
    batch_id: record.batch_id,
    priority: record.priority,
    status: record.status,
    assigned_to: record.assigned_to,
    created_at: record.created_at,
    claim: record.claims,
  };
}

function sumAdjustments(findings: Finding[]): number {
  return findings.reduce((total, finding) => total + finding.adjustment_amount, 0);
}

function buildStats(caseId: string, claims: Claim[], findings: Finding[]): VerificationStats {
  const totalAdjustments = sumAdjustments(findings);
  const originalAmount = claims.reduce((total, claim) => total + claim.total_amount, 0);

  return {
    caseId,
    totalClaims: claims.length,
    unreviewedClaims: claims.filter((claim) => claim.status === 'UNREVIEWED').length,
    inProgressClaims: claims.filter((claim) => claim.status === 'IN_PROGRESS').length,
    verifiedClaims: claims.filter((claim) => claim.status === 'VERIFIED').length,
    flaggedClaims: claims.filter((claim) => claim.status === 'FLAGGED').length,
    totalFindings: findings.length,
    totalAdjustments,
    verifiedAmount: Math.max(originalAmount - totalAdjustments, 0),
  };
}

export const verificationService = {
  async getVerificationQueue(caseId: string): Promise<VerificationSession[]> {
    const { data, error } = await supabase
      .from('verification_queue')
      .select('id, claim_id, batch_id, priority, status, assigned_to, created_at, claims(*)')
      .eq('claims.case_id', caseId)
      .order('priority', { ascending: false })
      .returns<VerificationQueueRecord[]>();

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(toVerificationSession).filter((session): session is VerificationSession => session !== null);
  },

  async getCaseClaims(caseId: string): Promise<Claim[]> {
    const { data, error } = await supabase
      .from('claims')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .returns<Claim[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getCaseFindings(caseId: string): Promise<Finding[]> {
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .returns<Finding[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getVerificationStats(caseId: string): Promise<VerificationStats> {
    const [claims, findings] = await Promise.all([
      this.getCaseClaims(caseId),
      this.getCaseFindings(caseId),
    ]);

    return buildStats(caseId, claims, findings);
  },

  async getClaimVerificationDetail(caseId: string, claimId: string): Promise<ClaimVerificationDetail | null> {
    const { data: claims, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('case_id', caseId)
      .eq('id', claimId)
      .limit(1)
      .returns<Claim[]>();

    if (claimError) {
      throw new Error(claimError.message);
    }

    const claim = claims?.[0];

    if (!claim) {
      return null;
    }

    const [findings, stats] = await Promise.all([
      this.getClaimFindings(claimId),
      this.getVerificationStats(caseId),
    ]);

    return { claim, findings, stats };
  },

  async getClaimFindings(claimId: string): Promise<Finding[]> {
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false })
      .returns<Finding[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async createFinding(input: FindingInput): Promise<Finding> {
    const insert: FindingInsert = {
      claim_id: input.claimId,
      case_id: input.caseId,
      category: input.category,
      finding_type: input.findingType,
      description: input.description,
      adjustment_amount: input.adjustmentAmount,
      severity: input.severity,
      status: input.status,
      created_by: input.createdBy,
      metadata: input.metadata ?? null,
    };

    const { data, error } = await supabase
      .from('findings')
      .insert([insert])
      .select('*')
      .single()
      .returns<Finding>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateClaimStatus(claimId: string, status: Claim['status']): Promise<Claim> {
    const update: ClaimUpdate = { status };

    const { data, error } = await supabase
      .from('claims')
      .update(update)
      .eq('id', claimId)
      .select('*')
      .single()
      .returns<Claim>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getOfficerPerformance(officerId: string): Promise<OfficerPerformance | null> {
    const { data, error } = await supabase
      .from('officer_metrics')
      .select('*')
      .eq('officer_id', officerId)
      .order('metric_date', { ascending: false })
      .limit(1)
      .returns<OfficerMetricsRow[]>();

    if (error) {
      throw new Error(error.message);
    }

    const metrics = data?.[0];

    return metrics ? { ...metrics, officerName: null } : null;
  },
};
