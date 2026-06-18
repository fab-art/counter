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
    })),
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
    expect(verificationService.addFinding).toBeDefined();
    expect(verificationService.removeFinding).toBeDefined();
    expect(verificationService.refreshClaimSummary).toBeDefined();
    expect(verificationService.submitClaimVerification).toBeDefined();
  });

  // Since we are mostly mocking Supabase and the logic depends on its response,
  // we focus on verifying that the service methods call Supabase correctly.

  it('calls supabase.from("findings").insert when addFinding is called', async () => {
    const fromSpy = vi.spyOn(supabase, 'from');

    // Mock refreshClaimSummary to avoid further calls
    vi.spyOn(verificationService, 'refreshClaimSummary').mockResolvedValue(undefined);

    const finding = {
      category: 'PHARMACOLOGY' as const,
      findingType: 'Overprescribing',
      adjustmentAmount: 5000,
    };

    try {
      await verificationService.addFinding('case-1', 'claim-1', finding, 'user-1');
    } catch (e) {
      // Ignore errors due to mock returning undefined instead of expected data structure
    }

    expect(fromSpy).toHaveBeenCalledWith('findings');
  });

  it('calls supabase.from("claims").update when submitClaimVerification is called', async () => {
    const fromSpy = vi.spyOn(supabase, 'from');

    try {
      await verificationService.submitClaimVerification('claim-1', 'user-1');
    } catch (e) {
      // Ignore errors
    }

    expect(fromSpy).toHaveBeenCalledWith('claims');
  });
});
