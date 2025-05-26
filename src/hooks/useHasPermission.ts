import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';

/**
 * Custom hook to check if the current user has one of the required roles.
 * @param requiredRoles An array of UserRole values.
 * @returns { hasPermission, isLoading } object.
 */
export const useHasPermission = (requiredRoles: UserRole[]) => {
  const { currentUser, isLoading } = useAuth();

  const hasPermission = useMemo(() => {
    if (isLoading || !currentUser?.role) return false;
    return requiredRoles.includes(currentUser.role);
  }, [isLoading, currentUser, requiredRoles]);

  return { hasPermission, isLoading };
};
