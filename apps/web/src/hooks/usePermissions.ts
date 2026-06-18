'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/auth';

export type Role = 'ADMIN' | 'MANAGER' | 'LEAD_OFFICER' | 'TECHNICAL_OFFICER' | 'COMPLIANCE_OFFICER';

export function usePermissions() {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      const user = await authService.getCurrentUser();
      if (user) {
        const userRole = await authService.getUserRole(user.id);
        setRole(userRole as Role);
      }
      setLoading(false);
    }
    fetchRole();
  }, []);

  const hasPermission = (allowedRoles: Role[]) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const isAdmin = role === 'ADMIN';
  const isManager = role === 'MANAGER' || role === 'ADMIN';
  const isOfficer = role === 'TECHNICAL_OFFICER' || role === 'LEAD_OFFICER' || role === 'ADMIN';

  return { role, loading, hasPermission, isAdmin, isManager, isOfficer };
}
