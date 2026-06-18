import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth';

// Mock supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error('Invalid credentials') }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

// Mock document.cookie
const mockCookie = {
  value: '',
};

if (typeof document !== 'undefined') {
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
}

describe('authService', () => {
  beforeEach(() => {
    mockCookie.value = '';
    vi.clearAllMocks();
  });

  it('should login successfully with admin credentials', async () => {
    const result = await authService.login('admin@example.com', 'password123');
    expect(result.success).toBe(true);
    expect(result.user?.role).toBe('ADMIN');
    if (typeof document !== 'undefined') {
      expect(document.cookie).toContain('sb-access-token=mock-token');
    }
  });

  it('should fail with incorrect credentials', async () => {
    const result = await authService.login('wrong@example.com', 'wrong');
    expect(result.success).toBe(false);
  });

  it('should clear cookie on logout', async () => {
    mockCookie.value = 'sb-access-token=mock-token';
    await authService.logout();
    if (typeof document !== 'undefined') {
      expect(document.cookie).toBe('');
    }
  });
});
