
import { Tenant } from '../contexts/AuthContext'; // Adjust path if Tenant interface moves

const MOCK_TENANTS: Tenant[] = [
  { 
    id: 'stitchdesign', 
    name: 'Stitch Design Co.', 
    themePrimaryColor: '#0b80ee',
    themePrimaryColorDark: '#0069cc',
    themePrimaryColorLight: '#60a5fa',
    logoUrl: '/assets/logos/stitch_logo_placeholder.svg', // Placeholder path
    defaultProductMarkup: 0.20, // 20% markup
  },
  { 
    id: 'modernhomes', 
    name: 'Modern Homes Inc.', 
    themePrimaryColor: '#10b981', // Tailwind green-500
    themePrimaryColorDark: '#059669', // Tailwind green-600
    themePrimaryColorLight: '#34d399', // Tailwind green-400
    logoUrl: '/assets/logos/modernhomes_logo_placeholder.svg', // Placeholder path
    defaultProductMarkup: 0.25, // 25% markup
  },
  { 
    id: 'classicinteriors', 
    name: 'Classic Interiors Ltd.', 
    themePrimaryColor: '#8b5cf6', // Tailwind violet-500
    themePrimaryColorDark: '#7c3aed', // Tailwind violet-600
    themePrimaryColorLight: '#a78bfa', // Tailwind violet-400
    logoUrl: '/assets/logos/classicinteriors_logo_placeholder.svg', // Placeholder path
    defaultProductMarkup: 0.18, // 18% markup
  },
];

const API_DELAY = 300; // Simulate network delay

export const fetchTenantById = (tenantId: string): Promise<Tenant> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tenant = MOCK_TENANTS.find(t => t.id === tenantId);
      if (tenant) {
        resolve(tenant);
      } else {
        reject(new Error(`Tenant with ID "${tenantId}" not found.`));
      }
    }, API_DELAY);
  });
};

export const fetchDefaultTenant = (): Promise<Tenant> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TENANTS[0]); 
    }, API_DELAY);
  });
};

export const listTenants = (): Promise<Tenant[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TENANTS);
    }, API_DELAY);
  });
};
