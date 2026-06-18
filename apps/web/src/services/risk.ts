import { supabase } from '@/lib/supabase';
import { claimRepository } from '@/repositories/claim.repository';

export interface RiskScore {
  score: number;
  category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
}

export const riskService = {
  /**
   * Calculates a risk score for a claim based on business rules
   */
  async calculateClaimRisk(claimId: string): Promise<RiskScore> {
    const claim = await claimRepository.findById(claimId);
    if (!claim) throw new Error('Claim not found');

    let score = 0;
    const reasons: string[] = [];

    // Load active risk rules from DB
    const { data: dbRules } = await supabase
      .from('risk_rules')
      .select('*')
      .eq('is_active', true);

    if (dbRules && dbRules.length > 0) {
      // Dynamic rule evaluation would go here
      // For the pilot, we'll keep the core logic but acknowledge the DB rules exist
    }

    // Rule 1: High Amount
    if (claim.total_amount > 500000) {
      score += 40;
      reasons.push('High claim amount (> 500k RWF)');
    } else if (claim.total_amount > 100000) {
      score += 20;
      reasons.push('Moderate claim amount (> 100k RWF)');
    }

    // Rule 2: Duplicate Check (Simplified)
    if (claim.duplicate_flag) {
      score += 50;
      reasons.push('Potential duplicate detected by system');
    }

    // Rule 3: Patient Pattern
    const { count: patientClaimsToday } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', claim.patient_id)
      .eq('dispensing_date', claim.dispensing_date);

    if (patientClaimsToday && patientClaimsToday > 1) {
      score += 30;
      reasons.push('Multiple claims for same patient on same day');
    }

    // Rule 4: Provider Pattern (Cross-facility)
    if (claim.cross_facility_flag) {
      score += 30;
      reasons.push('Cross-facility dispensing pattern detected');
    }

    // Determine category
    let category: RiskScore['category'] = 'LOW';
    if (score >= 80) category = 'CRITICAL';
    else if (score >= 60) category = 'HIGH';
    else if (score >= 30) category = 'MEDIUM';

    return {
      score: Math.min(score, 100),
      category,
      reasons
    };
  },

  /**
   * Updates a claim with its calculated risk score
   */
  async updateClaimRisk(claimId: string) {
    const risk = await this.calculateClaimRisk(claimId);

    const { error } = await supabase
      .from('claims')
      .update({
        risk_score: risk.score,
        risk_category: risk.category
      })
      .eq('id', claimId);

    if (error) throw error;

    // Save detailed risk breakdown
    await (supabase.from('risk_scores') as any).insert({
      claim_id: claimId,
      score: risk.score,
      category: risk.category,
      reasons: risk.reasons
    });

    return risk;
  }
};
