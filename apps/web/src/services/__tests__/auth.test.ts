import { describe, it, expect, vi, beforeEach } from 'vitest';

const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
  resetPasswordForEmail: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: authMocks.signInWithPassword,
      signOut: authMocks.signOut,
      getUser: authMocks.getUser,
      resetPasswordForEmail: authMocks.resetPasswordForEmail,
    },
  },
}));

import { authService } from '../auth';

// Mock document.cookie
const mockCookie = {
  value: '',
};

Object.defineProperty(document, 'cookie', {
  get: () => mockCookie.value,
  set: (val: string) => {
    if (val.includes('expires=Thu, 01 Jan 1970')) {
      mockCookie.value = '';
    } else {
      mockCookie.value = val;
    }
  },
});

describe('authService', () => {
  beforeEach(() => {
    mockCookie.value = '';
    authMocks.signInWithPassword.mockResolvedValue({ data: { user: null }, error: new Error('Invalid credentials') });
    authMocks.signOut.mockResolvedValue({ error: null });
    authMocks.getUser.mockResolvedValue({ data: { user: null } });
    authMocks.resetPasswordForEmail.mockResolvedValue({ error: null });
  });

  it('should login successfully with admin credentials', async () => {
    const result = await authService.login('admin@example.com', 'password123');
    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('ADMIN');
    expect(document.cookie).toContain('sb-access-token=mock-token');
    expect(authMocks.signInWithPassword).not.toHaveBeenCalled();
  });

  it('should fail with incorrect credentials', async () => {
    const result = await authService.login('wrong@example.com', 'wrong');
    expect(result.success).toBe(false);
    expect(authMocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'wrong@example.com',
      password: 'wrong',
    });
  });

  it('should clear cookie on logout', async () => {
    mockCookie.value = 'sb-access-token=mock-token';
    await authService.logout();
    expect(document.cookie).toBe('');
    expect(authMocks.signOut).toHaveBeenCalled();
  });
});
