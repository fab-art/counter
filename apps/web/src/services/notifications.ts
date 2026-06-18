import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
  createdAt: string;
}

export const notificationService = {
  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return {
        data: (data || []).map(n => ({
          id: n.id,
          userId: n.user_id,
          title: n.title,
          message: n.message,
          isRead: n.is_read,
          type: n.type,
          link: n.link,
          createdAt: n.created_at
        })) as Notification[],
        error: null
      };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return { data: null, error: error.message };
    }
  },

  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  },

  async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { count: count || 0, error: null };
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      return { count: 0, error: error.message };
    }
  }
};
