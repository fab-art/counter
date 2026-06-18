import { supabase } from '@/lib/supabase';

export interface Finding {
  category: 'PHARMACOLOGY' | 'RSSB_RULES' | 'FRAUD' | 'DOCUMENTATION';
  findingType: string;
  description?: string;
  adjustmentAmount: number;
}

/**
 * Service to handle verification business logic
 */
export const verificationService = {
  /**
   * Adds a finding to a claim and updates the summary
   */
  async addFinding(caseId: string, claimId: string, finding: Finding, userId: string) {
    // 1. Insert finding
    const { data: findingData, error: findingError } = await supabase
      .from('findings')
      .insert({
        case_id: caseId,
        claim_id: claimId,
        category: finding.category,
        finding_type: finding.findingType,
        description: finding.description,
        adjustment_amount: finding.adjustmentAmount,
        created_by_id: userId,
      })
      .select()
      .single();

    if (findingError) throw findingError;

    // 2. Update claim verification summary
    await this.refreshClaimSummary(claimId);

    return findingData;
  },

  /**
   * Removes a finding and refreshes the summary
   */
  async removeFinding(claimId: string, findingId: string) {
    const { error } = await supabase
      .from('findings')
      .delete()
      .eq('id', findingId);

    if (error) throw error;

    await this.refreshClaimSummary(claimId);
  },

  /**
   * Recalculates and updates the verification summary for a claim
   */
  async refreshClaimSummary(claimId: string) {
    // Get all findings for this claim
    const { data: findings, error: findingsError } = await supabase
      .from('findings')
      .select('adjustment_amount')
      .eq('claim_id', claimId);

    if (findingsError) throw findingsError;

    // Get the claim's original insurance copayment
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('insurance_copayment, status')
      .eq('id', claimId)
      .single();

    if (claimError) throw claimError;

    const totalAdjustments = findings.reduce((sum, f) => sum + (f.adjustment_amount || 0), 0);
    const verifiedAmount = claim.insurance_copayment - totalAdjustments;

    // Update or insert summary
    const { error: summaryError } = await supabase
      .from('claim_verification_summary')
      .upsert({
        claim_id: claimId,
        original_amount: claim.insurance_copayment,
        total_adjustments: totalAdjustments,
        verified_amount: verifiedAmount,
        finding_count: findings.length,
        status: claim.status,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'claim_id' });

    if (summaryError) throw summaryError;
  },

  /**
   * Finalizes the claim verification and updates officer metrics
   */
  async submitClaimVerification(claimId: string, userId: string) {
    // 1. Update claim status
    const { error: claimError } = await supabase
      .from('claims')
      .update({ status: 'VERIFIED', updated_at: new Date().toISOString() })
      .eq('id', claimId);

    if (claimError) throw claimError;

    // 2. Get summary for metrics
    const { data: summary, error: summaryError } = await supabase
      .from('claim_verification_summary')
      .select('total_adjustments, finding_count')
      .eq('claim_id', claimId)
      .single();

    if (summaryError) throw summaryError;

    // 3. Update officer metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('officer_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (metricsError && metricsError.code !== 'PGRST116') throw metricsError;

    if (metrics) {
      await supabase
        .from('officer_metrics')
        .update({
          claims_reviewed: metrics.claims_reviewed + 1,
          findings_created: metrics.findings_created + summary.finding_count,
          adjustments_made: metrics.adjustments_made + summary.total_adjustments,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('officer_metrics')
        .insert({
          user_id: userId,
          claims_reviewed: 1,
          findings_created: summary.finding_count,
          adjustments_made: summary.total_adjustments,
        });
    }

    // 4. Update summary status too
    await supabase
      .from('claim_verification_summary')
      .update({ status: 'VERIFIED' })
      .eq('claim_id', claimId);
  }
};
