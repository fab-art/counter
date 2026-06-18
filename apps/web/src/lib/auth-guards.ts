export type Role = 'ADMIN' | 'MANAGER' | 'LEAD_OFFICER' | 'TECHNICAL_OFFICER' | 'COMPLIANCE_OFFICER';

export const PERMISSIONS = {
  VIEW_DASHBOARD: ['ADMIN', 'MANAGER', 'LEAD_OFFICER', 'TECHNICAL_OFFICER', 'COMPLIANCE_OFFICER'],
  MANAGE_USERS: ['ADMIN'],
  VIEW_CASES: ['ADMIN', 'MANAGER', 'LEAD_OFFICER', 'TECHNICAL_OFFICER', 'COMPLIANCE_OFFICER'],
  CREATE_CASE: ['ADMIN', 'MANAGER', 'LEAD_OFFICER'],
  ASSIGN_CASE: ['ADMIN', 'MANAGER', 'LEAD_OFFICER'],
  PROCESS_CASE: ['TECHNICAL_OFFICER', 'COMPLIANCE_OFFICER'],
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
