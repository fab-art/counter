import { supabase } from '@/lib/supabase';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_CASE'
  | 'UPDATE_CASE'
  | 'ASSIGN_CASE'
  | 'DELETE_CASE'
  | 'UPDATE_USER'
  | 'UPDATE_SETTINGS';

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
    console.log('Audit Log:', entry);
    return { success: true };
  }
};
