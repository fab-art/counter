import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Tables = Database['public']['Tables'];

export const dataService = {
  /**
   * Fetch all facilities
   */
  async getFacilities() {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data: data as Tables['facilities']['Row'][], error: null };
    } catch (error: any) {
      console.error('Error fetching facilities:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Fetch claims with optional filtering
   */
  async getClaims(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          facilities(name),
          verification_results(status, score)
        `)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as any[], error: null };
    } catch (error: any) {
      console.error('Error fetching claims:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Fetch verification queue
   */
  async getVerificationQueue() {
    try {
      const { data, error } = await supabase
        .from('verification_queue')
        .select(`
          *,
          claims(*)
        `)
        .eq('status', 'pending')
        .order('priority', { ascending: false });

      if (error) throw error;
      return { data: data as any[], error: null };
    } catch (error: any) {
      console.error('Error fetching verification queue:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Get dashboard statistics for verification
   */
  async getVerificationDashboard() {
    try {
      const [totalRes, pendingRes, verifiedRes] = await Promise.all([
        supabase.from('claims').select('*', { count: 'exact', head: true }),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
      ]);

      if (totalRes.error || pendingRes.error || verifiedRes.error) {
        throw totalRes.error || pendingRes.error || verifiedRes.error;
      }

      return {
        data: {
          total: totalRes.count || 0,
          pending: pendingRes.count || 0,
          verified: verifiedRes.count || 0,
        },
        error: null,
      };
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Create a new upload record
   */
  async createUpload(upload: Tables['uploads']['Insert']) {
    try {
      const { data, error } = await (supabase
        .from('uploads') as any)
        .insert(upload)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Tables['uploads']['Row'], error: null };
    } catch (error: any) {
      console.error('Error creating upload:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Create a new claim
   */
  async createClaim(claim: Tables['claims']['Insert']) {
    try {
      const { data, error } = await (supabase
        .from('claims') as any)
        .insert(claim)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Tables['claims']['Row'], error: null };
    } catch (error: any) {
      console.error('Error creating claim:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Update a verification result
   */
  async updateVerificationResult(
    id: string,
    updates: Tables['verification_results']['Update']
  ) {
    try {
      const { data, error } = await (supabase
        .from('verification_results') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Tables['verification_results']['Row'], error: null };
    } catch (error: any) {
      console.error('Error updating verification result:', error);
      return { data: null, error: error.message };
    }
  }
};
