import { useHasPermission } from './useHasPermission';
import { UserRole } from '../types/user';

/**
 * Custom hook to check if current user is COMPRADOR.
 * @returns { isComprador, isLoading }
 */
export const useIsComprador = () => {
  const { hasPermission, isLoading } = useHasPermission([UserRole.COMPRADOR]);
  return { isComprador: hasPermission, isLoading };
};
