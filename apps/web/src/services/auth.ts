import { supabase } from '@/lib/supabase';

export const authService = {
  async login(email: string, password: string) {
    // For Sprint 1, we simulate success for demo purposes if needed,
    // but ideally we use the supabase client.

    // MOCK LOGIN FOR SPRINT 1 DEMO
    if (email === 'admin@example.com' && password === 'password123') {
      // Set a mock cookie for middleware
      document.cookie = 'sb-access-token=mock-token; path=/; max-age=3600';
      return { success: true, user: { id: '1', email, role: 'ADMIN' } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Set cookie for middleware
      if (data.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax`;
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async logout() {
    // Clear mock cookie
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    const { error } = await supabase.auth.signOut();
    return { success: !error, error: error?.message };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          roles (
            name
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return (data as any)?.roles?.name || 'OFFICER';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'OFFICER'; // Default role
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { success: !error, error: error?.message };
  }
};
