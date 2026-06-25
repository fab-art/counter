import { supabase } from '@/lib/supabase';

export const investigationRepository = {
  async findById(id: string) {
    const { data, error } = await supabase
      .from('investigations')
      .select('*, claims(*), cases(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async findMany(filters: {
    caseId?: string;
    claimId?: string;
    status?: string;
    assignedToId?: string;
    priority?: string;
    offset?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('investigations')
      .select('*, claims(claim_number, patient_name), cases(case_number, title)', { count: 'exact' });

    if (filters.caseId) query = query.eq('case_id', filters.caseId);
    if (filters.claimId) query = query.eq('claim_id', filters.claimId);
    if (filters.status && filters.status !== 'ALL') query = query.eq('status', filters.status as any);
    if (filters.assignedToId) query = query.eq('assigned_to_id', filters.assignedToId);
    if (filters.priority) query = query.eq('priority', filters.priority);

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count };
  },

  async create(investigation: {
    claimId: string;
    caseId: string;
    status?: string;
    priority?: string;
    assignedToId?: string;
    findings?: string;
    evidenceUrls?: string[];
  }) {
    const { data, error } = await supabase
      .from('investigations')
      .insert({
        claim_id: investigation.claimId,
        case_id: investigation.caseId,
        status: investigation.status,
        priority: investigation.priority,
        assigned_to_id: investigation.assignedToId,
        findings: investigation.findings,
        evidence_urls: investigation.evidenceUrls,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: {
    status?: string;
    priority?: string;
    assignedToId?: string;
    findings?: string;
    evidenceUrls?: string[];
  }) {
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.priority) dbUpdates.priority = updates.priority;
    if (updates.assignedToId) dbUpdates.assigned_to_id = updates.assignedToId;
    if (updates.findings) dbUpdates.findings = updates.findings;
    if (updates.evidenceUrls) dbUpdates.evidence_urls = updates.evidenceUrls;

    const { data, error } = await supabase
      .from('investigations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
