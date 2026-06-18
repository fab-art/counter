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
      facilities: {
        Row: {
          id: string
          name: string
          code: string
          type: string
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          type: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          type?: string
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: string
          facility_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role: string
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          facility_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      uploads: {
        Row: {
          id: string
          file_name: string
          file_path: string
          file_size: number
          status: string
          uploaded_by: string
          facility_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          file_name: string
          file_path: string
          file_size: number
          status?: string
          uploaded_by: string
          facility_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          status?: string
          uploaded_by?: string
          facility_id?: string | null
          created_at?: string
        }
      }
      claims: {
        Row: {
          id: string
          upload_id: string | null
          claim_number: string
          patient_name: string
          patient_id: string
          facility_id: string
          status: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          upload_id?: string | null
          claim_number: string
          patient_name: string
          patient_id: string
          facility_id: string
          status?: string
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          upload_id?: string | null
          claim_number?: string
          patient_name?: string
          patient_id?: string
          facility_id?: string
          status?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      verification_results: {
        Row: {
          id: string
          claim_id: string
          status: string
          score: number
          findings: Json | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          status?: string
          score?: number
          findings?: Json | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          status?: string
          score?: number
          findings?: Json | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
        }
      }
      reference_medicines: {
        Row: {
          id: string
          code: string
          name: string
          unit_price: number
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          unit_price: number
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          unit_price?: number
          category?: string | null
          created_at?: string
        }
      }
      claim_medicines: {
        Row: {
          id: string
          claim_id: string
          medicine_code: string
          medicine_name: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          id?: string
          claim_id: string
          medicine_code: string
          medicine_name: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          id?: string
          claim_id?: string
          medicine_code?: string
          medicine_name?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      practitioners: {
        Row: {
          id: string
          name: string
          license_number: string
          specialty: string | null
          facility_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          license_number: string
          specialty?: string | null
          facility_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          license_number?: string
          specialty?: string | null
          facility_id?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          permissions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          permissions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          permissions?: Json | null
          created_at?: string
        }
      }
      verification_batches: {
        Row: {
          id: string
          name: string
          status: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: string
          created_by?: string
          created_at?: string
        }
      }
      verification_queue: {
        Row: {
          id: string
          claim_id: string
          batch_id: string | null
          priority: number
          status: string
          assigned_to: string | null
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          batch_id?: string | null
          priority?: number
          status?: string
          assigned_to?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          batch_id?: string | null
          priority?: number
          status?: string
          assigned_to?: string | null
          created_at?: string
        }
      }
      duplicate_claims: {
        Row: {
          id: string
          claim_id_1: string
          claim_id_2: string
          confidence_score: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          claim_id_1: string
          claim_id_2: string
          confidence_score: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          claim_id_1?: string
          claim_id_2?: string
          confidence_score?: number
          status?: string
          created_at?: string
        }
      }
      reimbursement_rules: {
        Row: {
          id: string
          name: string
          rule_definition: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          rule_definition: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          rule_definition?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      exceptions: {
        Row: {
          id: string
          claim_id: string
          type: string
          message: string
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          type: string
          message: string
          resolved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          type?: string
          message?: string
          resolved?: boolean
          created_at?: string
        }
      }
      activity_tracking: {
        Row: {
          id: string
          user_id: string
          action: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          details?: Json | null
          created_at?: string
        }
      }
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
