export type Role = 'ADMIN' | 'MANAGER' | 'TEAM_LEAD' | 'OFFICER' | 'AUDITOR';

export const PERMISSIONS = {
  VIEW_DASHBOARD: ['ADMIN', 'MANAGER', 'TEAM_LEAD', 'OFFICER', 'AUDITOR'],
  MANAGE_USERS: ['ADMIN'],
  VIEW_CASES: ['ADMIN', 'MANAGER', 'TEAM_LEAD', 'OFFICER', 'AUDITOR'],
  CREATE_CASE: ['ADMIN', 'MANAGER', 'TEAM_LEAD'],
  ASSIGN_CASE: ['ADMIN', 'MANAGER', 'TEAM_LEAD'],
  PROCESS_CASE: ['OFFICER', 'AUDITOR'],
  VIEW_REPORTS: ['ADMIN', 'MANAGER'],
  MANAGE_SETTINGS: ['ADMIN'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}

export function hasAnyRole(currentRole: Role, roles: Role[]): boolean {
  return roles.includes(currentRole);
}
