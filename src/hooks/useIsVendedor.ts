import { useHasPermission } from './useHasPermission';
import { UserRole } from '../types/user';

/**
 * Custom hook to check if current user is a VENDEDOR.
 * @returns { isVendedor, isLoading }
 */
export const useIsVendedor = () => {
  const { hasPermission, isLoading } = useHasPermission([UserRole.VENDEDOR]);
  return { isVendedor: hasPermission, isLoading };
};
