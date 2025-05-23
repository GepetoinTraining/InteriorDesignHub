import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../contexts/AuthContext';

/**
 * Custom hook to check if the current user has one of the required roles.
 * @param requiredRoles An array of UserRole values.
 * @returns True if the user has one of the required roles, false otherwise.
 */
export const useHasPermission = (requiredRoles: UserRole[]): boolean => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return false; // Still loading user data, assume no permission yet
  }

  if (!currentUser || !currentUser.role) {
    return false; // Not authenticated or role not set
  }

  // currentUser.role should be of type UserRole | null as per AuthContext
  // If it's not null here, it's UserRole
  const userRole = currentUser.role; 

  return requiredRoles.includes(userRole);
};
