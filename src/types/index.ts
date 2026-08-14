import { UserRole, Database } from './database';

export * from './database';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login?: string | null;
  avatar_url?: string | null;
}

export interface PermissionMatrix {
  canViewCostPrices: boolean;
  canViewSuppliers: boolean;
  canManageSuppliers: boolean;
  canViewAccountsPayable: boolean;
  canManageAccountsPayable: boolean;
  canViewAuditLogs: boolean;
  canManageUsers: boolean;
  canManageSystemSettings: boolean;
  canManageClients: boolean;
  canCreateServiceOrders: boolean;
  canManageAllServiceOrders: boolean;
  canAccessPOS: boolean;
  canPerformCashBleedAndSupply: boolean;
  canViewAllCommissions: boolean;
  canViewOwnCommissions: boolean;
}

export function getRolePermissions(role: UserRole): PermissionMatrix {
  if (role === 'ADMIN') {
    return {
      canViewCostPrices: true,
      canViewSuppliers: true,
      canManageSuppliers: true,
      canViewAccountsPayable: true,
      canManageAccountsPayable: true,
      canViewAuditLogs: true,
      canManageUsers: true,
      canManageSystemSettings: true,
      canManageClients: true,
      canCreateServiceOrders: true,
      canManageAllServiceOrders: true,
      canAccessPOS: true,
      canPerformCashBleedAndSupply: true,
      canViewAllCommissions: true,
      canViewOwnCommissions: true,
    };
  }

  // SELLER / USUARIO OPERACIONAL
  return {
    canViewCostPrices: false, // BLOQUEADO
    canViewSuppliers: false, // BLOQUEADO
    canManageSuppliers: false, // BLOQUEADO
    canViewAccountsPayable: false, // BLOQUEADO
    canManageAccountsPayable: false, // BLOQUEADO
    canViewAuditLogs: false, // BLOQUEADO
    canManageUsers: false, // BLOQUEADO
    canManageSystemSettings: false, // BLOQUEADO
    canManageClients: true,
    canCreateServiceOrders: true,
    canManageAllServiceOrders: false,
    canAccessPOS: true,
    canPerformCashBleedAndSupply: true,
    canViewAllCommissions: false, // BLOQUEADO
    canViewOwnCommissions: true,
  };
}

export interface SystemModule {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'OPERATIONAL' | 'COMMERCIAL' | 'FINANCIAL' | 'SECURITY';
  requiresAdmin: boolean;
  status: 'READY_IN_SCHEMA' | 'PLANNED_NEXT_STAGE';
}

export interface SecurityAuditTestResult {
  endpoint: string;
  resource: string;
  description: string;
  testedAsRole: UserRole;
  expectedResult: 'ALLOWED' | 'FORBIDDEN';
  actualResult: 'ALLOWED' | 'FORBIDDEN' | 'ERROR';
  statusCode: number;
  message: string;
  dataSample?: unknown;
  timestamp: string;
  passed: boolean;
}

export interface CreateUserData {
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}
