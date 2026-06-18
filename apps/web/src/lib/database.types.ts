export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type TableDefinition<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}


export interface Database {
  public: {
    Tables: {
      facilities: TableDefinition<
        { id: string; name: string; code: string; type: string; address: string | null; created_at: string; updated_at: string },
        { id?: string; name: string; code: string; type: string; address?: string | null; created_at?: string; updated_at?: string },
        { id?: string; name?: string; code?: string; type?: string; address?: string | null; created_at?: string; updated_at?: string }
      >
      profiles: TableDefinition<
        { id: string; full_name: string | null; avatar_url: string | null; role: string; facility_id: string | null; created_at: string; updated_at: string },
        { id: string; full_name?: string | null; avatar_url?: string | null; role: string; facility_id?: string | null; created_at?: string; updated_at?: string },
        { id?: string; full_name?: string | null; avatar_url?: string | null; role?: string; facility_id?: string | null; created_at?: string; updated_at?: string }
      >
      uploads: TableDefinition<
        { id: string; file_name: string; file_path: string; file_size: number; status: string; uploaded_by: string; facility_id: string | null; created_at: string },
        { id?: string; file_name: string; file_path: string; file_size: number; status?: string; uploaded_by: string; facility_id?: string | null; created_at?: string },
        { id?: string; file_name?: string; file_path?: string; file_size?: number; status?: string; uploaded_by?: string; facility_id?: string | null; created_at?: string }
      >
      claims: TableDefinition<
        {
          id: string; upload_id: string | null; case_id: string | null; claim_number: string; paper_code: string | null; dispensing_date: string | null;
          patient_name: string; patient_id: string; patient_type: string | null; gender: string | null; is_newborn: boolean | null; rama_number: string | null;
          practitioner_name: string | null; practitioner_type: string | null; facility_id: string; status: string; total_amount: number;
          patient_copayment: number | null; insurance_copayment: number | null; duplicate_flag: boolean; duplicate_score: number | null;
          cross_facility_flag: boolean; cross_facility_score: number | null; created_at: string; updated_at: string
        },
        {
          id?: string; upload_id?: string | null; case_id?: string | null; claim_number: string; paper_code?: string | null; dispensing_date?: string | null;
          patient_name: string; patient_id: string; patient_type?: string | null; gender?: string | null; is_newborn?: boolean | null; rama_number?: string | null;
          practitioner_name?: string | null; practitioner_type?: string | null; facility_id: string; status?: string; total_amount: number;
          patient_copayment?: number | null; insurance_copayment?: number | null; duplicate_flag?: boolean; duplicate_score?: number | null;
          cross_facility_flag?: boolean; cross_facility_score?: number | null; created_at?: string; updated_at?: string
        },
        {
          id?: string; upload_id?: string | null; case_id?: string | null; claim_number?: string; paper_code?: string | null; dispensing_date?: string | null;
          patient_name?: string; patient_id?: string; patient_type?: string | null; gender?: string | null; is_newborn?: boolean | null; rama_number?: string | null;
          practitioner_name?: string | null; practitioner_type?: string | null; facility_id?: string; status?: string; total_amount?: number;
          patient_copayment?: number | null; insurance_copayment?: number | null; duplicate_flag?: boolean; duplicate_score?: number | null;
          cross_facility_flag?: boolean; cross_facility_score?: number | null; created_at?: string; updated_at?: string
        }
      >
      verification_results: TableDefinition<
        { id: string; claim_id: string; status: string; score: number; findings: Json | null; verified_by: string | null; verified_at: string | null; created_at: string },
        { id?: string; claim_id: string; status?: string; score?: number; findings?: Json | null; verified_by?: string | null; verified_at?: string | null; created_at?: string },
        { id?: string; claim_id?: string; status?: string; score?: number; findings?: Json | null; verified_by?: string | null; verified_at?: string | null; created_at?: string }
      >
      findings: TableDefinition<
        { id: string; claim_id: string; case_id: string; category: string; finding_type: string; description: string; adjustment_amount: number; severity: string; status: string; created_by: string; metadata: Json | null; created_at: string; updated_at: string },
        { id?: string; claim_id: string; case_id: string; category: string; finding_type: string; description: string; adjustment_amount?: number; severity: string; status?: string; created_by: string; metadata?: Json | null; created_at?: string; updated_at?: string },
        { id?: string; claim_id?: string; case_id?: string; category?: string; finding_type?: string; description?: string; adjustment_amount?: number; severity?: string; status?: string; created_by?: string; metadata?: Json | null; created_at?: string; updated_at?: string }
      >
      officer_metrics: TableDefinition<
        { id: string; officer_id: string; claims_reviewed: number; findings_created: number; adjustments_generated: number; cases_completed: number; review_time_minutes: number; metric_date: string; created_at: string; updated_at: string },
        { id?: string; officer_id: string; claims_reviewed?: number; findings_created?: number; adjustments_generated?: number; cases_completed?: number; review_time_minutes?: number; metric_date: string; created_at?: string; updated_at?: string },
        { id?: string; officer_id?: string; claims_reviewed?: number; findings_created?: number; adjustments_generated?: number; cases_completed?: number; review_time_minutes?: number; metric_date?: string; created_at?: string; updated_at?: string }
      >
      verification_batches: TableDefinition<
        { id: string; name: string; status: string; created_by: string; created_at: string },
        { id?: string; name: string; status?: string; created_by: string; created_at?: string },
        { id?: string; name?: string; status?: string; created_by?: string; created_at?: string }
      >
      verification_queue: TableDefinition<
        { id: string; claim_id: string; batch_id: string | null; priority: number; status: string; assigned_to: string | null; created_at: string },
        { id?: string; claim_id: string; batch_id?: string | null; priority?: number; status?: string; assigned_to?: string | null; created_at?: string },
        { id?: string; claim_id?: string; batch_id?: string | null; priority?: number; status?: string; assigned_to?: string | null; created_at?: string }
      >
      reference_medicines: TableDefinition<
        { id: string; code: string; name: string; unit_price: number; category: string | null; created_at: string },
        { id?: string; code: string; name: string; unit_price: number; category?: string | null; created_at?: string },
        { id?: string; code?: string; name?: string; unit_price?: number; category?: string | null; created_at?: string }
      >
      claim_medicines: TableDefinition<
        { id: string; claim_id: string; medicine_code: string; medicine_name: string; quantity: number; unit_price: number; total_price: number },
        { id?: string; claim_id: string; medicine_code: string; medicine_name: string; quantity: number; unit_price: number; total_price: number },
        { id?: string; claim_id?: string; medicine_code?: string; medicine_name?: string; quantity?: number; unit_price?: number; total_price?: number }
      >
      practitioners: TableDefinition<
        { id: string; name: string; license_number: string; specialty: string | null; facility_id: string | null; created_at: string },
        { id?: string; name: string; license_number: string; specialty?: string | null; facility_id?: string | null; created_at?: string },
        { id?: string; name?: string; license_number?: string; specialty?: string | null; facility_id?: string | null; created_at?: string }
      >
      audit_logs: TableDefinition<
        { id: string; user_id: string | null; action: string; table_name: string; record_id: string | null; old_data: Json | null; new_data: Json | null; created_at: string },
        { id?: string; user_id?: string | null; action: string; table_name: string; record_id?: string | null; old_data?: Json | null; new_data?: Json | null; created_at?: string },
        { id?: string; user_id?: string | null; action?: string; table_name?: string; record_id?: string | null; old_data?: Json | null; new_data?: Json | null; created_at?: string }
      >
      roles: TableDefinition<
        { id: string; name: string; permissions: Json | null; created_at: string },
        { id?: string; name: string; permissions?: Json | null; created_at?: string },
        { id?: string; name?: string; permissions?: Json | null; created_at?: string }
      >
      duplicate_claims: TableDefinition<
        { id: string; claim_id_1: string; claim_id_2: string; confidence_score: number; status: string; created_at: string },
        { id?: string; claim_id_1: string; claim_id_2: string; confidence_score: number; status?: string; created_at?: string },
        { id?: string; claim_id_1?: string; claim_id_2?: string; confidence_score?: number; status?: string; created_at?: string }
      >
      reimbursement_rules: TableDefinition<
        { id: string; name: string; rule_definition: Json; is_active: boolean; created_at: string },
        { id?: string; name: string; rule_definition: Json; is_active?: boolean; created_at?: string },
        { id?: string; name?: string; rule_definition?: Json; is_active?: boolean; created_at?: string }
      >
      exceptions: TableDefinition<
        { id: string; claim_id: string; type: string; message: string; resolved: boolean; created_at: string },
        { id?: string; claim_id: string; type: string; message: string; resolved?: boolean; created_at?: string },
        { id?: string; claim_id?: string; type?: string; message?: string; resolved?: boolean; created_at?: string }
      >
      activity_tracking: TableDefinition<
        { id: string; user_id: string; action: string; details: Json | null; created_at: string },
        { id?: string; user_id: string; action: string; details?: Json | null; created_at?: string },
        { id?: string; user_id?: string; action?: string; details?: Json | null; created_at?: string }
      >
      user_roles: TableDefinition<
        { user_id: string; role_id: string },
        { user_id: string; role_id: string },
        { user_id?: string; role_id?: string }
      >
      notifications: TableDefinition<
        { id: string; user_id: string; title: string; message: string; is_read: boolean; type: string; link: string | null; created_at: string },
        { id?: string; user_id: string; title: string; message: string; is_read?: boolean; type?: string; link?: string | null; created_at?: string },
        { id?: string; user_id?: string; title?: string; message?: string; is_read?: boolean; type?: string; link?: string | null; created_at?: string }
      >
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
