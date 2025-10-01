// ==================== ROLES Y PERMISOS ====================
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'OPERADOR' | 'CLIENTE';

export interface Permission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

// ==================== CLIENTES ====================
export interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  country: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
}

// ==================== VEHÍCULOS ====================
export interface Vehiculo {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  type: 'sedan' | 'suv' | 'truck' | 'van';
  status: 'available' | 'reserved' | 'maintenance' | 'rented';
  dailyRate: number;
  features: string[];
  image?: string;
  createdAt: string;
}

// ==================== RESERVAS ====================
export type ReservaStatus = 
  | 'pending'           // Pre-reserva creada por Operador
  | 'confirmed'         // Aprobada por Admin + anticipo pagado
  | 'en_uso'            // Vehículo entregado al cliente
  | 'por_devolver'      // Fecha próxima de devolución (alerta)
  | 'devuelto'          // Cliente devolvió, pendiente factura final
  | 'completed'         // Factura pagada y completada
  | 'cancelled'         // Cancelada
  | 'rejected';         // Rechazada por Admin

export interface Reserva {
  id: string;
  clienteId: string;
  clienteName: string;
  vehiculoId: string;
  vehiculoInfo: string;
  vehiculoAlternativoId?: string;      // Segundo vehículo opcional
  vehiculoAlternativoInfo?: string;
  vehiculoSeleccionadoId?: string;     // Vehículo definitivo elegido por Admin
  startDate: string;
  endDate: string;
  days: number;
  totalAmount: number;
  anticipoMonto?: number;              // Monto del anticipo/depósito
  status: ReservaStatus;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

// ==================== FACTURAS ====================
export interface Factura {
  id: string;
  reservaId: string;
  clienteId: string;
  clienteName: string;
  amount: number;
  tax: number;
  total: number;
  anticipo?: number;              // Anticipo/depósito aplicado
  montoPendiente: number;          // total - anticipo
  extras?: number;                 // Total de cargos adicionales
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  createdBy: string;
}

// ==================== CONTRATOS ====================
export interface Contrato {
  id: string;
  reservaId: string;
  clienteId: string;
  clienteName: string;
  vehiculoInfo: string;
  startDate: string;
  endDate: string;
  terms: string[];
  signedDate?: string;
  status: 'draft' | 'active' | 'completed' | 'terminated';
  createdAt: string;
}

// ==================== DASHBOARD STATS ====================
export interface DashboardStats {
  totalCustomers: number;
  customersTrend: number;
  totalMembers: number;
  membersTrend: number;
  activeNow: number;
  activeUsers: User[];
  totalVehicles: number;
  availableVehicles: number;
  pendingReservations: number;
  monthlyRevenue: number;
}

// ==================== ANTICIPOS ====================
export interface Anticipo {
  id: string;
  reservaId: string;
  monto: number;
  fecha: string;
  concepto: 'deposito' | 'anticipo';
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  recibidoPor: string;
  notas?: string;
}

// ==================== INSPECCIONES ====================
export interface Inspeccion {
  id: string;
  reservaId: string;
  vehiculoId: string;
  tipo: 'entrega' | 'devolucion';
  fecha: string;
  kilometraje: number;
  nivelCombustible: number; // 0-100%
  danos: Dano[];
  fotos?: string[];
  observaciones?: string;
  inspeccionadoPor: string;
  firmadoPor?: string; // Cliente
}

export interface Dano {
  id: string;
  tipo: 'rayadura' | 'abolladura' | 'rotura' | 'faltante' | 'otro';
  ubicacion: string;
  descripcion: string;
  gravedad: 'leve' | 'moderado' | 'grave';
  costoEstimado?: number;
  foto?: string;
}

// ==================== EXTRAS ====================
export interface Extra {
  id: string;
  reservaId: string;
  tipo: 'dias_extra' | 'kilometraje' | 'combustible' | 'dano' | 'otro';
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string;
}

// ==================== DEVOLUCIONES ====================
export interface Devolucion {
  id: string;
  reservaId: string;
  fechaDevolucion: string;
  fechaProgramada: string;
  diasExtras?: number;
  kilometrajeInicial: number;
  kilometrajeFinal: number;
  kilometrajePermitido: number;
  nivelCombustibleInicial: number;
  nivelCombustibleFinal: number;
  inspeccionId: string;
  extras: Extra[];
  totalExtras: number;
  observaciones?: string;
  recibidoPor: string;
  aceptadoPor?: string; // Cliente
}
