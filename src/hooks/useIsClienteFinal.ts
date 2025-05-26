import { useHasPermission } from './useHasPermission';
import { UserRole } from '../types/user';

/**
 * Custom hook to check if current user is CLIENTE_FINAL.
 * @returns { isClienteFinal, isLoading }
 */
export const useIsClienteFinal = () => {
  const { hasPermission, isLoading } = useHasPermission([UserRole.CLIENTE_FINAL]);
  return { isClienteFinal: hasPermission, isLoading };
};
