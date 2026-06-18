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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching facilities:', message);
      return { data: null, error: message };
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
      return { data: data as unknown[], error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching claims:', message);
      return { data: null, error: message };
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
      return { data: data as unknown[], error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching verification queue:', message);
      return { data: null, error: message };
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error fetching dashboard data:', message);
      return { data: null, error: message };
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error creating upload:', message);
      return { data: null, error: message };
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error creating claim:', message);
      return { data: null, error: message };
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error updating verification result:', message);
      return { data: null, error: message };
    }
  }
};
