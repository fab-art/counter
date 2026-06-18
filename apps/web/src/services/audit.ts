import { supabase } from '@/lib/supabase';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_CASE'
  | 'UPDATE_CASE'
  | 'ASSIGN_CASE'
  | 'DELETE_CASE'
  | 'UPDATE_USER'
  | 'UPDATE_SETTINGS'
  | 'CREATE_FINDING'
  | 'UPDATE_CLAIM_STATUS';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  async log(entry: AuditLogEntry) {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: entry.userId,
          action: entry.action,
          table_name: entry.entityType,
          record_id: entry.entityId,
          old_data: entry.oldValue,
          new_data: entry.newValue,
        });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Audit Log Error:', error);
      // We don't want to break the main flow if audit logging fails
      return { success: false, error: error.message };
    }
  }
};
