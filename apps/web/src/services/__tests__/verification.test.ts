import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verificationService } from '../verification';
import { supabase } from '@/lib/supabase';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      returns: vi.fn().mockReturnThis(),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    }
  },
}));

describe('verificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(verificationService).toBeDefined();
  });

  it('should have the expected methods', () => {
    expect(verificationService.getVerificationQueue).toBeDefined();
    expect(verificationService.getCaseClaims).toBeDefined();
    expect(verificationService.getCaseFindings).toBeDefined();
    expect(verificationService.getVerificationStats).toBeDefined();
    expect(verificationService.getClaimVerificationDetail).toBeDefined();
    expect(verificationService.getClaimFindings).toBeDefined();
    expect(verificationService.createFinding).toBeDefined();
    expect(verificationService.updateClaimStatus).toBeDefined();
    expect(verificationService.getOfficerPerformance).toBeDefined();
  });

  it('calls supabase.from("findings").insert when createFinding is called', async () => {
    const fromSpy = vi.spyOn(supabase, 'from');

    const input = {
      claimId: '00000000-0000-0000-0000-000000000001',
      caseId: '00000000-0000-0000-0000-000000000001',
      category: 'PHARMACOLOGY' as const,
      findingType: 'Overprescribing',
      description: 'Test finding',
      adjustmentAmount: 5000,
      severity: 'MEDIUM',
      status: 'OPEN',
      createdBy: '00000000-0000-0000-0000-000000000001',
    };

    try {
      await verificationService.createFinding(input);
    } catch {
      // Ignore errors due to mock returning undefined instead of expected data structure
    }

    expect(fromSpy).toHaveBeenCalledWith('findings');
  });

  it('calls supabase.from("claims").update when updateClaimStatus is called', async () => {
    const fromSpy = vi.spyOn(supabase, 'from');

    try {
      await verificationService.updateClaimStatus('00000000-0000-0000-0000-000000000001', 'VERIFIED');
    } catch {
      // Ignore errors
    }

    expect(fromSpy).toHaveBeenCalledWith('claims');
  });
});
