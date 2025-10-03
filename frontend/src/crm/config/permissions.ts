import { Role, Permission, User } from '../types';

// Configuración de permisos por rol
export const ROLE_PERMISSIONS: Record<Role, Record<string, Permission>> = {
  SUPER_ADMIN: {
    dashboard: { module: 'dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
    usuarios: { module: 'usuarios', canView: true, canCreate: true, canEdit: true, canDelete: true }, // CRUD completo de TODOS los roles
    vehiculos: { module: 'vehiculos', canView: true, canCreate: true, canEdit: true, canDelete: true },
    clientes: { module: 'clientes', canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    reservas: { module: 'reservas', canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
    facturacion: { module: 'facturacion', canView: true, canCreate: true, canEdit: true, canDelete: true }, // Puede anular facturas
    mantenimiento: { module: 'mantenimiento', canView: true, canCreate: true, canEdit: true, canDelete: false }, // Gestión de vehículos dañados y mantenimiento
    perfil: { module: 'perfil', canView: true, canCreate: false, canEdit: true, canDelete: false },
  },
  ADMIN: {
    dashboard: { module: 'dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
    usuarios: { module: 'usuarios', canView: true, canCreate: true, canEdit: true, canDelete: false }, // Solo puede crear Operadores y Clientes
    vehiculos: { module: 'vehiculos', canView: true, canCreate: true, canEdit: true, canDelete: true },
    clientes: { module: 'clientes', canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
    reservas: { module: 'reservas', canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
    facturacion: { module: 'facturacion', canView: true, canCreate: true, canEdit: true, canDelete: true },
    mantenimiento: { module: 'mantenimiento', canView: true, canCreate: true, canEdit: true, canDelete: false }, // Gestión de vehículos dañados y mantenimiento
    perfil: { module: 'perfil', canView: true, canCreate: false, canEdit: true, canDelete: false },
  },
  OPERADOR: {
    dashboard: { module: 'dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
    vehiculos: { module: 'vehiculos', canView: true, canCreate: false, canEdit: false, canDelete: false }, // Solo lectura, sin tarifas
    clientes: { module: 'clientes', canView: true, canCreate: true, canEdit: false, canDelete: false }, // Solo agregar (queda pendiente)
    reservas: { module: 'reservas', canView: true, canCreate: true, canEdit: false, canDelete: false }, // Solo pre-reservas
    perfil: { module: 'perfil', canView: true, canCreate: false, canEdit: true, canDelete: false },
  },
  CLIENTE: {
    dashboard: { module: 'dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
    reservas: { module: 'reservas', canView: true, canCreate: false, canEdit: false, canDelete: false }, // Solo sus reservas
    facturacion: { module: 'facturacion', canView: true, canCreate: false, canEdit: false, canDelete: false }, // Solo sus facturas
    perfil: { module: 'perfil', canView: true, canCreate: false, canEdit: true, canDelete: false },
  },
};

/**
 * Roles que un ADMIN puede gestionar
 * CRÍTICO: Admin NO puede crear, editar o eliminar otros Admins ni Super Admins
 */
export const ADMIN_ALLOWED_ROLES: Role[] = ['OPERADOR', 'CLIENTE'];

/**
 * Roles que un SUPER_ADMIN puede gestionar (todos)
 */
export const SUPERADMIN_ALLOWED_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'OPERADOR', 'CLIENTE'];

/**
 * Verificar si un usuario puede gestionar a otro usuario según su rol
 */
export const canManageUser = (currentUserRole: Role, targetUser: User): boolean => {
  // Super Admin puede gestionar a todos
  if (currentUserRole === 'SUPER_ADMIN') {
    return true;
  }

  // Admin solo puede gestionar Clientes
  if (currentUserRole === 'ADMIN') {
    return ADMIN_ALLOWED_ROLES.includes(targetUser.role);
  }

  return false;
};

/**
 * Verificar si el usuario actual puede crear un rol específico
 */
export const canCreateRole = (currentUserRole: Role, newUserRole: Role): boolean => {
  // Super Admin puede crear cualquier rol
  if (currentUserRole === 'SUPER_ADMIN') {
    return SUPERADMIN_ALLOWED_ROLES.includes(newUserRole);
  }

  // Admin solo puede crear Clientes
  if (currentUserRole === 'ADMIN') {
    return newUserRole === 'CLIENTE';
  }

  return false;
};

// Módulos disponibles en el sidebar por rol
export const SIDEBAR_MODULES: Record<Role, string[]> = {
  SUPER_ADMIN: ['dashboard', 'usuarios', 'vehiculos', 'clientes', 'reservas', 'facturacion', 'mantenimiento', 'perfil'],
  ADMIN: ['dashboard', 'usuarios', 'vehiculos', 'clientes', 'reservas', 'facturacion', 'mantenimiento', 'perfil'],
  OPERADOR: ['dashboard', 'vehiculos', 'clientes', 'reservas', 'perfil'],
  CLIENTE: ['dashboard', 'reservas', 'facturacion', 'perfil'],
};

// Información de módulos para el sidebar
export interface ModuleInfo {
  id: string;
  name: string;
  path: string;
  iconPlaceholder: string; // Placeholder para íconos
}

export const MODULE_INFO: Record<string, ModuleInfo> = {
  dashboard: { id: 'dashboard', name: 'Dashboard', path: '/crm/dashboard', iconPlaceholder: '📊' },
  usuarios: { id: 'usuarios', name: 'Usuarios', path: '/crm/usuarios', iconPlaceholder: '👥' },
  vehiculos: { id: 'vehiculos', name: 'Vehículos', path: '/crm/vehiculos', iconPlaceholder: '🚗' },
  clientes: { id: 'clientes', name: 'Clientes', path: '/crm/clientes', iconPlaceholder: '👤' },
  reservas: { id: 'reservas', name: 'Reservas', path: '/crm/reservas', iconPlaceholder: '📅' },
  facturacion: { id: 'facturacion', name: 'Facturación', path: '/crm/facturacion', iconPlaceholder: '💰' },
  mantenimiento: { id: 'mantenimiento', name: 'Mantenimiento', path: '/crm/mantenimiento', iconPlaceholder: '🔧' },
  perfil: { id: 'perfil', name: 'Perfil', path: '/crm/perfil', iconPlaceholder: '⚙️' },
};
