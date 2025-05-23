
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from './AuthContext'; 
import * as tenantService from '../services/tenantService';

interface TenantContextType {
  currentTenant: Tenant | null;
  isLoadingTenant: boolean;
  tenantError: string | null;
  setCurrentTenantById: (tenantId: string | null) => Promise<void>;
  allTenants: Tenant[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Default theme colors from globals.css or a sensible fallback
const DEFAULT_PRIMARY_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#0b80ee';
const DEFAULT_PRIMARY_DARK_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-dark').trim() || '#0069cc';
const DEFAULT_PRIMARY_LIGHT_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-light').trim() || '#60a5fa';


const updateThemeVariables = (tenant: Tenant | null) => {
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--color-primary', tenant?.themePrimaryColor || DEFAULT_PRIMARY_COLOR);
  rootStyle.setProperty('--color-primary-dark', tenant?.themePrimaryColorDark || DEFAULT_PRIMARY_DARK_COLOR);
  rootStyle.setProperty('--color-primary-light', tenant?.themePrimaryColorLight || DEFAULT_PRIMARY_LIGHT_COLOR);
  // Add other theme variables here if needed
};


export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [isLoadingTenant, setIsLoadingTenant] = useState<boolean>(true);
  const [tenantError, setTenantError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingTenant(true);
      setTenantError(null);
      try {
        const [defaultTenant, tenants] = await Promise.all([
          tenantService.fetchDefaultTenant(),
          tenantService.listTenants()
        ]);
        setCurrentTenant(defaultTenant);
        setAllTenants(tenants);
        updateThemeVariables(defaultTenant);
      } catch (err) {
        console.error("Failed to load initial tenant data", err);
        setTenantError(err instanceof Error ? err.message : "Could not load tenant data.");
        setCurrentTenant(null); // Fallback to no tenant
        updateThemeVariables(null); // Apply default theme
      } finally {
        setIsLoadingTenant(false);
      }
    };
    loadInitialData();
  }, []);

  const setCurrentTenantById = async (tenantId: string | null) => {
    if (!tenantId) {
      setCurrentTenant(null);
      updateThemeVariables(null); // Apply default theme if tenantId is null
      return;
    }
    setIsLoadingTenant(true);
    setTenantError(null);
    try {
      const tenant = await tenantService.fetchTenantById(tenantId);
      setCurrentTenant(tenant);
      updateThemeVariables(tenant);
    } catch (err) {
      console.error(`Failed to fetch tenant with ID ${tenantId}`, err);
      setTenantError(err instanceof Error ? err.message : `Could not load tenant ${tenantId}.`);
      setCurrentTenant(null); // Fallback or keep previous tenant? For now, clear.
      updateThemeVariables(null); // Apply default theme on error
    } finally {
      setIsLoadingTenant(false);
    }
  };

  return (
    <TenantContext.Provider value={{ currentTenant, allTenants, isLoadingTenant, tenantError, setCurrentTenantById }}>
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