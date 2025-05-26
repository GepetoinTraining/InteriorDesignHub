import { useHasPermission } from './useHasPermission';
import { UserRole } from '../types/user';

/**
 * Custom hook to check if current user is FINANCEIRO.
 * @returns { isFinanceiro, isLoading }
 */
export const useIsFinanceiro = () => {
  const { hasPermission, isLoading } = useHasPermission([UserRole.FINANCEIRO]);
  return { isFinanceiro: hasPermission, isLoading };
};
