import { supabase } from '@/lib/supabase';

export const findingRepository = {
  async findByClaimId(claimId: string) {
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async findByCaseId(caseId: string) {
    const { data, error } = await supabase
      .from('findings')
      .select('*, claims(claim_number, patient_name)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(finding: any) {
    const { data, error } = await supabase
      .from('findings')
      .insert(finding)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('findings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
