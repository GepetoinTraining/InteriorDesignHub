import { useHasPermission } from './useHasPermission';
import { UserRole } from '../types/user';

/**
 * Custom hook to check if current user is an ADMIN.
 * @returns { isAdmin, isLoading }
 */
export const useIsAdmin = () => {
  const { hasPermission, isLoading } = useHasPermission([UserRole.ADMIN]);
  return { isAdmin: hasPermission, isLoading };
};
