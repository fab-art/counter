import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { uploadSchema, claimSchema } from '@/lib/validations';

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
  async getClaims(filters: {
    claimNumber?: string;
    patientId?: string;
    facilityId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    offset?: number;
    limit?: number;
  } = {}) {
    try {
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;

      let query = supabase
        .from('claims')
        .select(`
          *,
          facilities(name),
          verification_results(status, score)
        `, { count: 'exact' });

      if (filters.claimNumber) {
        query = query.ilike('claim_number', `%${filters.claimNumber}%`);
      }
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters.facilityId && filters.facilityId !== 'ALL') {
        query = query.eq('facility_id', filters.facilityId);
      }
      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('dispensing_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('dispensing_date', filters.endDate);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as any[], count, error: null };
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const [totalRes, pendingRes, verifiedRes, todayVerifiedRes, metricsRes] = await Promise.all([
        supabase.from('claims').select('*', { count: 'exact', head: true }),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'UNREVIEWED'),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'VERIFIED'),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'VERIFIED').gte('updated_at', todayStr),
        supabase.from('officer_metrics').select('*').limit(5),
      ]);

      if (totalRes.error || pendingRes.error || verifiedRes.error || todayVerifiedRes.error || metricsRes.error) {
        throw totalRes.error || pendingRes.error || verifiedRes.error || todayVerifiedRes.error || metricsRes.error;
      }

      return {
        data: {
          total: totalRes.count || 0,
          pending: pendingRes.count || 0,
          verified: verifiedRes.count || 0,
          verifiedToday: todayVerifiedRes.count || 0,
          officerMetrics: metricsRes.data || [],
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
      uploadSchema.parse({
        fileName: upload.file_name,
        filePath: upload.file_path,
        fileSize: upload.file_size,
        status: upload.status,
        uploadedBy: upload.uploaded_by,
        facilityId: upload.facility_id,
      });

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
      claimSchema.parse({
        claimNumber: claim.claim_number,
        patientName: claim.patient_name,
        patientId: claim.patient_id,
        totalAmount: claim.total_amount,
        facilityId: claim.facility_id,
        caseId: claim.case_id,
        status: claim.status,
      });

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
