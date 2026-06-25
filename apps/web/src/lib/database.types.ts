export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; full_name: string | null; avatar_url: string | null; is_active: boolean; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: { id?: string; email: string; full_name?: string | null; avatar_url?: string | null; is_active?: boolean; created_at?: string; updated_at?: string; deleted_at?: string | null }
        Update: { id?: string; email?: string; full_name?: string | null; avatar_url?: string | null; is_active?: boolean; created_at?: string; updated_at?: string; deleted_at?: string | null }
        Relationships: []
      }
      branches: {
        Row: { id: string; name: string; code: string; location: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; code: string; location?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; code?: string; location?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      profiles: {
        Row: { id: string; full_name: string | null; avatar_url: string | null; role: string; facility_id: string | null; branch_id: string | null; created_at: string; updated_at: string }
        Insert: { id: string; full_name?: string | null; avatar_url?: string | null; role: string; facility_id?: string | null; branch_id?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; full_name?: string | null; avatar_url?: string | null; role?: string; facility_id?: string | null; branch_id?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
            {
              foreignKeyName: "profiles_branch_id_fkey"
              columns: ["branch_id"]
              isOneToOne: false
              referencedRelation: "branches"
              referencedColumns: ["id"]
            }
        ]
      }
      roles: {
        Row: { id: string; name: string; description: string | null; permissions: string[] }
        Insert: { id?: string; name: string; description?: string | null; permissions?: string[] }
        Update: { id?: string; name?: string; description?: string | null; permissions?: string[] }
        Relationships: []
      }
      user_roles: {
        Row: { user_id: string; role_id: string }
        Insert: { user_id: string; role_id: string }
        Update: { user_id?: string; role_id?: string }
        Relationships: []
      }
      cases: {
        Row: { id: string; case_number: string; title: string; description: string | null; status: string; priority: string; assigned_to_id: string | null; created_by_id: string; metadata: Json; created_at: string; updated_at: string; deleted_at: string | null }
        Insert: { id?: string; case_number: string; title: string; description?: string | null; status?: string; priority?: string; assigned_to_id?: string | null; created_by_id: string; metadata?: Json; created_at?: string; updated_at?: string; deleted_at?: string | null }
        Update: { id?: string; case_number?: string; title?: string; description?: string | null; status?: string; priority?: string; assigned_to_id?: string | null; created_by_id?: string; metadata?: Json; created_at?: string; updated_at?: string; deleted_at?: string | null }
        Relationships: []
      }
      facilities: {
        Row: { id: string; name: string; code: string; type: string; address: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; code: string; type: string; address?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; code?: string; type?: string; address?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      uploads: {
        Row: { id: string; file_name: string; file_path: string; file_size: number; status: string; uploaded_by: string; facility_id: string | null; created_at: string }
        Insert: { id?: string; file_name: string; file_path: string; file_size: number; status?: string; uploaded_by: string; facility_id?: string | null; created_at?: string }
        Update: { id?: string; file_name?: string; file_path?: string; file_size?: number; status?: string; uploaded_by?: string; facility_id?: string | null; created_at?: string }
        Relationships: []
      }
      claims: {
        Row: { id: string; upload_id: string | null; case_id: string | null; claim_number: string; paper_code: string | null; dispensing_date: string | null; patient_name: string; patient_id: string; patient_type: string | null; gender: string | null; is_newborn: boolean | null; rama_number: string | null; practitioner_name: string | null; practitioner_type: string | null; facility_id: string; branch_id: string | null; status: string; total_amount: number; patient_copayment: number | null; insurance_copayment: number | null; duplicate_flag: boolean; duplicate_score: number | null; cross_facility_flag: boolean; cross_facility_score: number | null; risk_score: number; risk_category: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; upload_id?: string | null; case_id?: string | null; claim_number: string; paper_code?: string | null; dispensing_date?: string | null; patient_name: string; patient_id: string; patient_type?: string | null; gender?: string | null; is_newborn?: boolean | null; rama_number?: string | null; practitioner_name?: string | null; practitioner_type?: string | null; facility_id: string; branch_id?: string | null; status?: string; total_amount: number; patient_copayment?: number | null; insurance_copayment?: number | null; duplicate_flag?: boolean; duplicate_score?: number | null; cross_facility_flag?: boolean; cross_facility_score?: number | null; risk_score?: number; risk_category?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; upload_id?: string | null; case_id?: string | null; claim_number?: string; paper_code?: string | null; dispensing_date?: string | null; patient_name?: string; patient_id?: string; patient_type?: string | null; gender?: string | null; is_newborn?: boolean | null; rama_number?: string | null; practitioner_name?: string | null; practitioner_type?: string | null; facility_id?: string; branch_id?: string | null; status?: string; total_amount?: number; patient_copayment?: number | null; insurance_copayment?: number | null; duplicate_flag?: boolean; duplicate_score?: number | null; cross_facility_flag?: boolean; cross_facility_score?: number | null; risk_score?: number; risk_category?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      verification_queue: {
        Row: { id: string; claim_id: string; batch_id: string | null; priority: number; status: string; assigned_to: string | null; created_at: string }
        Insert: { id?: string; claim_id: string; batch_id?: string | null; priority?: number; status?: string; assigned_to?: string | null; created_at?: string }
        Update: { id?: string; claim_id?: string; batch_id?: string | null; priority?: number; status?: string; assigned_to?: string | null; created_at?: string }
        Relationships: []
      }
      verification_results: {
        Row: { id: string; claim_id: string; status: string; score: number; findings: Json; verified_by: string | null; verified_at: string | null; created_at: string }
        Insert: { id?: string; claim_id: string; status?: string; score?: number; findings?: Json; verified_by?: string | null; verified_at?: string | null; created_at?: string }
        Update: { id?: string; claim_id?: string; status?: string; score?: number; findings?: Json; verified_by?: string | null; verified_at?: string | null; created_at?: string }
        Relationships: []
      }
      findings: {
        Row: { id: string; claim_id: string; case_id: string; category: string; finding_type: string; description: string; adjustment_amount: number; severity: string; status: string; created_by: string; metadata: Json; created_at: string; updated_at: string }
        Insert: { id?: string; claim_id: string; case_id: string; category: string; finding_type: string; description: string; adjustment_amount?: number; severity: string; status?: string; created_by: string; metadata?: Json; created_at?: string; updated_at?: string }
        Update: { id?: string; claim_id?: string; case_id?: string; category?: string; finding_type?: string; description?: string; adjustment_amount?: number; severity?: string; status?: string; created_by?: string; metadata?: Json; created_at?: string; updated_at?: string }
        Relationships: []
      }
      claim_verification_summary: {
        Row: { id: string; claim_id: string; original_amount: number; total_adjustments: number; verified_amount: number; finding_count: number; status: string; updated_at: string }
        Insert: { id?: string; claim_id: string; original_amount?: number; total_adjustments?: number; verified_amount?: number; finding_count?: number; status: string; updated_at: string }
        Update: { id?: string; claim_id?: string; original_amount?: number; total_adjustments?: number; verified_amount?: number; finding_count?: number; status?: string; updated_at?: string }
        Relationships: []
      }
      officer_metrics: {
        Row: { id: string; officer_id: string; claims_reviewed: number; findings_created: number; adjustments_generated: number; cases_completed: number; review_time_minutes: number; metric_date: string; created_at: string; updated_at: string }
        Insert: { id?: string; officer_id: string; claims_reviewed?: number; findings_created?: number; adjustments_generated?: number; cases_completed?: number; review_time_minutes?: number; metric_date: string; created_at?: string; updated_at?: string }
        Update: { id?: string; officer_id?: string; claims_reviewed?: number; findings_created?: number; adjustments_generated?: number; cases_completed?: number; review_time_minutes?: number; metric_date?: string; created_at?: string; updated_at?: string }
        Relationships: []
      }
      audit_logs: {
        Row: { id: string; user_id: string | null; action: string; table_name: string; record_id: string | null; old_data: Json; new_data: Json; created_at: string }
        Insert: { id?: string; user_id?: string | null; action: string; table_name: string; record_id?: string | null; old_data?: Json; new_data?: Json; created_at?: string }
        Update: { id?: string; user_id?: string | null; action?: string; table_name?: string; record_id?: string | null; old_data?: Json; new_data?: Json; created_at?: string }
        Relationships: []
      }
      notifications: {
        Row: { id: string; user_id: string; title: string; message: string; is_read: boolean; type: string; link: string | null; created_at: string }
        Insert: { id?: string; user_id: string; title: string; message: string; is_read?: boolean; type?: string; link?: string | null; created_at?: string }
        Update: { id?: string; user_id?: string; title?: string; message?: string; is_read?: boolean; type?: string; link?: string | null; created_at?: string }
        Relationships: []
      }
      system_settings: {
        Row: { id: string; key: string; value: Json; description: string | null; updated_at: string }
        Insert: { id?: string; key: string; value: Json; description?: string | null; updated_at?: string }
        Update: { id?: string; key?: string; value?: Json; description?: string | null; updated_at?: string }
        Relationships: []
      }
      risk_rules: {
        Row: { id: string; name: string; risk_level: string; criteria: Json; is_active: boolean; created_at: string }
        Insert: { id?: string; name: string; risk_level: string; criteria: Json; is_active?: boolean; created_at?: string }
        Update: { id?: string; name?: string; risk_level?: string; criteria?: Json; is_active?: boolean; created_at?: string }
        Relationships: []
      }
      risk_scores: {
        Row: { id: string; claim_id: string; score: number; category: string; reason: string | null; created_at: string }
        Insert: { id?: string; claim_id: string; score: number; category: string; reason?: string | null; created_at?: string }
        Update: { id?: string; claim_id?: string; score?: number; category?: string; reason?: string | null; created_at?: string }
        Relationships: []
      }
      facility_metrics: {
        Row: { id: string; facility_id: string; metric_date: string; claims_submitted: number; claims_approved: number; claims_rejected: number; claims_flagged: number; total_amount: number; deduction_amount: number; created_at: string; updated_at: string }
        Insert: { id?: string; facility_id: string; metric_date: string; claims_submitted?: number; claims_approved?: number; claims_rejected?: number; claims_flagged?: number; total_amount?: number; deduction_amount?: number; created_at?: string; updated_at?: string }
        Update: { id?: string; facility_id?: string; metric_date?: string; claims_submitted?: number; claims_approved?: number; claims_rejected?: number; claims_flagged?: number; total_amount?: number; deduction_amount?: number; created_at?: string; updated_at?: string }
        Relationships: []
      }
      medicine_metrics: {
        Row: { id: string; medicine_code: string; medicine_name: string; metric_date: string; utilization_count: number; flagged_count: number; rejected_count: number; total_cost: number; total_deductions: number; created_at: string }
        Insert: { id?: string; medicine_code: string; medicine_name: string; metric_date: string; utilization_count?: number; flagged_count?: number; rejected_count?: number; total_cost?: number; total_deductions?: number; created_at?: string }
        Update: { id?: string; medicine_code?: string; medicine_name?: string; metric_date?: string; utilization_count?: number; flagged_count?: number; rejected_count?: number; total_cost?: number; total_deductions?: number; created_at?: string }
        Relationships: []
      }
      report_schedules: {
        Row: { id: string; user_id: string; report_type: string; frequency: string; last_run: string | null; next_run: string | null; recipients: string[]; is_active: boolean; created_at: string }
        Insert: { id?: string; user_id: string; report_type: string; frequency: string; last_run?: string | null; next_run?: string | null; recipients?: string[]; is_active?: boolean; created_at?: string }
        Update: { id?: string; user_id?: string; report_type?: string; frequency?: string; last_run?: string | null; next_run?: string | null; recipients?: string[]; is_active?: boolean; created_at?: string }
        Relationships: []
      }
      imports: {
        Row: { id: string; file_name: string; status: string; total_records: number; processed_records: number; error_count: number; created_by: string; created_at: string; completed_at: string | null }
        Insert: { id?: string; file_name: string; status?: string; total_records?: number; processed_records?: number; error_count?: number; created_by: string; created_at?: string; completed_at?: string | null }
        Update: { id?: string; file_name?: string; status?: string; total_records?: number; processed_records?: number; error_count?: number; created_by?: string; created_at?: string; completed_at?: string | null }
        Relationships: []
      }
      import_errors: {
        Row: { id: string; import_id: string; row_number: number; error_message: string; raw_data: Json; created_at: string }
        Insert: { id?: string; import_id: string; row_number: number; error_message: string; raw_data?: Json; created_at?: string }
        Update: { id?: string; import_id?: string; row_number?: number; error_message?: string; raw_data?: Json; created_at?: string }
        Relationships: []
      }
      verification_batches: {
        Row: { id: string; name: string; status: string; created_by: string; created_at: string }
        Insert: { id?: string; name: string; status?: string; created_by: string; created_at?: string }
        Update: { id?: string; name?: string; status?: string; created_by?: string; created_at?: string }
        Relationships: []
      }
      reference_medicines: {
        Row: { id: string; code: string; name: string; unit_price: number; category: string | null; created_at: string }
        Insert: { id?: string; code: string; name: string; unit_price: number; category?: string | null; created_at?: string }
        Update: { id?: string; code?: string; name?: string; unit_price?: number; category?: string | null; created_at?: string }
        Relationships: []
      }
      claim_medicines: {
        Row: { id: string; claim_id: string; medicine_code: string; medicine_name: string; quantity: number; unit_price: number; total_price: number }
        Insert: { id?: string; claim_id: string; medicine_code: string; medicine_name: string; quantity: number; unit_price: number; total_price: number }
        Update: { id?: string; claim_id?: string; medicine_code?: string; medicine_name?: string; quantity?: number; unit_price?: number; total_price?: number }
        Relationships: []
      }
      investigations: {
        Row: { id: string; claim_id: string; case_id: string; status: Database['public']['Enums']['investigation_status']; priority: string; assigned_to_id: string | null; findings: string | null; evidence_urls: string[] | null; created_at: string; updated_at: string }
        Insert: { id?: string; claim_id: string; case_id: string; status?: Database['public']['Enums']['investigation_status']; priority?: string; assigned_to_id?: string | null; findings?: string | null; evidence_urls?: string[] | null; created_at?: string; updated_at?: string }
        Update: { id?: string; claim_id?: string; case_id?: string; status?: Database['public']['Enums']['investigation_status']; priority?: string; assigned_to_id?: string | null; findings?: string | null; evidence_urls?: string[] | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      fraud_alerts: {
        Row: { id: string; claim_id: string; rule_id: string | null; score: number; status: string; created_at: string }
        Insert: { id?: string; claim_id: string; rule_id?: string | null; score: number; status?: string; created_at?: string }
        Update: { id?: string; claim_id?: string; rule_id?: string | null; score?: number; status?: string; created_at?: string }
        Relationships: []
      }
      task_assignments: {
        Row: { id: string; case_id: string | null; claim_id: string | null; assigned_to_id: string; assigned_by_id: string; status: Database['public']['Enums']['task_status']; due_date: string | null; completed_at: string | null; notes: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; case_id?: string | null; claim_id?: string | null; assigned_to_id: string; assigned_by_id: string; status?: Database['public']['Enums']['task_status']; due_date?: string | null; completed_at?: string | null; notes?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; case_id?: string | null; claim_id?: string | null; assigned_to_id?: string; assigned_by_id?: string; status?: Database['public']['Enums']['task_status']; due_date?: string | null; completed_at?: string | null; notes?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      role: 'ADMIN' | 'MANAGER' | 'TEAM_LEAD' | 'OFFICER' | 'AUDITOR'
      case_status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'REJECTED'
      claim_status: 'UNREVIEWED' | 'IN_PROGRESS' | 'VERIFIED' | 'FLAGGED' | 'UNDER_SUPERVISOR_REVIEW' | 'SUPERVISOR_APPROVED' | 'SUPERVISOR_REJECTED' | 'ESCALATED'
      finding_category: 'PHARMACOLOGY' | 'RSSB_RULES' | 'FRAUD' | 'DOCUMENTATION'
      investigation_status: 'OPEN' | 'UNDER_REVIEW' | 'ESCALATED' | 'CLOSED'
      task_status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
