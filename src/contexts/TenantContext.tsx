
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth to get tenantId
import * as tenantService from '../services/tenantService';
import { Tenant } from '../types/tenant'; // Ensure Tenant type is correctly defined/imported

interface TenantContextType {
  currentTenant: Tenant | null;
  isLoadingTenant: boolean;
  tenantError: Error | null; // Store error object for more details
  fetchCurrentTenantDetails: (tenantId: string) => Promise<void>; // Explicit function to load/reload
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Default theme colors (consider moving to a theme configuration file)
const DEFAULT_THEME = {
  primary: '#0b80ee',
  primaryDark: '#0069cc',
  primaryLight: '#60a5fa',
  // Add other default theme properties as needed
};

const updateThemeVariables = (tenantDetails: Tenant | null) => {
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--color-primary', tenantDetails?.themePrimaryColor || DEFAULT_THEME.primary);
  rootStyle.setProperty('--color-primary-dark', tenantDetails?.themePrimaryColorDark || DEFAULT_THEME.primaryDark);
  rootStyle.setProperty('--color-primary-light', tenantDetails?.themePrimaryColorLight || DEFAULT_THEME.primaryLight);
  // Update logo or other theme aspects here
  // e.g., if you have a logo element:
  // const logoElement = document.getElementById('app-logo');
  // if (logoElement && tenantDetails?.logoUrl) {
  //   logoElement.setAttribute('src', tenantDetails.logoUrl);
  // }
};

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState<boolean>(false); // Start false, true when fetching
  const [tenantError, setTenantError] = useState<Error | null>(null);
  const { tenantId: authTenantId, isLoading: authIsLoading } = useAuth(); // Get tenantId from AuthContext

  const fetchCurrentTenantDetails = async (tenantIdToFetch: string) => {
    if (!tenantIdToFetch) {
      setCurrentTenant(null);
      updateThemeVariables(null); // Apply default theme
      setTenantError(null);
      return;
    }

    setIsLoadingTenant(true);
    setTenantError(null);
    try {
      console.log(`TenantContext: Fetching details for tenantId: ${tenantIdToFetch}`);
      const tenantDetails = await tenantService.fetchTenantDetails(tenantIdToFetch);
      setCurrentTenant(tenantDetails);
      updateThemeVariables(tenantDetails);
    } catch (err) {
      console.error(`TenantContext: Failed to fetch tenant with ID ${tenantIdToFetch}`, err);
      setTenantError(err instanceof Error ? err : new Error('Failed to load tenant data.'));
      setCurrentTenant(null); // Fallback to no tenant
      updateThemeVariables(null); // Apply default theme on error
    } finally {
      setIsLoadingTenant(false);
    }
  };

  useEffect(() => {
    // Only fetch if auth is not loading and tenantId is available
    if (!authIsLoading && authTenantId) {
      fetchCurrentTenantDetails(authTenantId);
    } else if (!authIsLoading && !authTenantId) {
      // User is loaded but has no tenantId (e.g. logged out, or new user without tenant assigned)
      setCurrentTenant(null);
      updateThemeVariables(null);
      setTenantError(null); // Clear any previous tenant error
      setIsLoadingTenant(false); // Not loading if no tenantId to load
    }
    // Intentionally not re-running if fetchCurrentTenantDetails changes, only when authTenantId or authIsLoading.
  }, [authTenantId, authIsLoading]);


  return (
    <TenantContext.Provider value={{ currentTenant, isLoadingTenant, tenantError, fetchCurrentTenantDetails }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};