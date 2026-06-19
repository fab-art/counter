import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type ClaimInsert = any;
type ClaimUpdate = any;

export const claimRepository = {
  async findById(id: string) {
    const { data, error } = await supabase
      .from('claims')
      .select('*, facilities(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as any;
  },

  async findMany(filters: {
    caseId?: string;
    claimNumber?: string;
    patientId?: string;
    facilityId?: string;
    branchId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    offset?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('claims')
      .select('*, facilities(name)', { count: 'exact' });

    if (filters.caseId) query = query.eq('case_id', filters.caseId);
    if (filters.claimNumber) query = query.ilike('claim_number', `%${filters.claimNumber}%`);
    if (filters.patientId) query = query.eq('patient_id', filters.patientId);
    if (filters.facilityId) query = query.eq('facility_id', filters.facilityId);
    if (filters.branchId) query = query.eq('branch_id', filters.branchId);
    if (filters.status && filters.status !== 'ALL') query = query.eq('status', filters.status);
    if (filters.startDate) query = query.gte('dispensing_date', filters.startDate);
    if (filters.endDate) query = query.lte('dispensing_date', filters.endDate);

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count };
  },

  async create(claim: ClaimInsert) {
    const { data, error } = await supabase
      .from('claims')
      .insert(claim as any)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  async update(id: string, updates: ClaimUpdate) {
    const { data, error } = await supabase
      .from('claims')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }
};
