import { supabase } from '@/lib/supabase';

export const branchRepository = {
  async findAll() {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from('branches')
      .select('*, branch_users(user_id)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getMetrics(branchId: string) {
    const { data, error } = await supabase
      .from('claims')
      .select('status, total_amount')
      .eq('branch_id', branchId);

    if (error) throw error;

    const stats = {
      totalClaims: data.length,
      verified: data.filter(c => c.status === 'VERIFIED').length,
      flagged: data.filter(c => c.status === 'FLAGGED').length,
      totalAmount: data.reduce((sum, c) => sum + (c.total_amount || 0), 0)
    };

    return stats;
  }
};
