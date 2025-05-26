export enum UserRole {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
  COMPRADOR = 'COMPRADOR',
  FINANCEIRO = 'FINANCEIRO',
  CLIENTE_FINAL = 'CLIENTE_FINAL',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  avatarUrl?: string;
}
