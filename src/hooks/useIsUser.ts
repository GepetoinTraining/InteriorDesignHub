import { useHasPermission } from './useHasPermission';
import { UserRole } from '../types/user';

/**
 * Custom hook to check if current user is USER.
 * @returns { isUser, isLoading }
 */
export const useIsUser = () => {
  const { hasPermission, isLoading } = useHasPermission([UserRole.USER]);
  return { isUser: hasPermission, isLoading };
};
