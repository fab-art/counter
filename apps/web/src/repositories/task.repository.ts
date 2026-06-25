import { supabase } from '@/lib/supabase';

export const taskRepository = {
  async findById(id: string) {
    const { data, error } = await supabase
      .from('task_assignments')
      .select('*, cases(case_number), claims(claim_number)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async findMany(filters: {
    assignedToId?: string;
    caseId?: string;
    claimId?: string;
    status?: string;
    offset?: number;
    limit?: number;
  } = {}) {
    let query = supabase
      .from('task_assignments')
      .select('*, cases(case_number), claims(claim_number)', { count: 'exact' });

    if (filters.assignedToId) query = query.eq('assigned_to_id', filters.assignedToId);
    if (filters.caseId) query = query.eq('case_id', filters.caseId);
    if (filters.claimId) query = query.eq('claim_id', filters.claimId);
    if (filters.status && filters.status !== 'ALL') query = query.eq('status', filters.status as any);

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count };
  },

  async create(task: {
    caseId?: string;
    claimId?: string;
    assignedToId: string;
    assignedById: string;
    status?: string;
    dueDate?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('task_assignments')
      .insert({
        case_id: task.caseId,
        claim_id: task.claimId,
        assigned_to_id: task.assignedToId,
        assigned_by_id: task.assignedById,
        status: task.status,
        due_date: task.dueDate,
        notes: task.notes,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: {
    status?: string;
    dueDate?: string;
    completedAt?: string;
    notes?: string;
  }) {
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;
    if (updates.notes) dbUpdates.notes = updates.notes;

    const { data, error } = await supabase
      .from('task_assignments')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
