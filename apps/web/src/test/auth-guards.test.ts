import { describe, it, expect } from 'vitest';
import { hasPermission, Role } from '@/lib/auth-guards';

describe('RBAC Guards', () => {
  it('should allow ADMIN to manage users', () => {
    expect(hasPermission('ADMIN' as Role, 'MANAGE_USERS')).toBe(true);
  });

  it('should not allow TECHNICAL_OFFICER to manage users', () => {
    expect(hasPermission('TECHNICAL_OFFICER' as Role, 'MANAGE_USERS')).toBe(false);
  });
});
