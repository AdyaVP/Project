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
  | 'pending'           // Pre-reserva creada por Operador, pendiente de aprobación
  | 'confirmed'         // Aprobada por Admin/Super Admin
  | 'cancelled';        // Cancelada o Rechazada

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
  inspeccionData?: {
    kilometraje?: string;
    nivelCombustible?: string;
    observaciones?: string;
    checklistInterior?: any;
    checklistExterior?: any;
  };
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
  contratoData?: any; // Datos completos del formulario llenado por el Operador
  firmaCliente?: string; // Firma digital del cliente
  firmaRepresentante?: string; // Firma digital del representante
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
export interface ChecklistInterior {
  marcadorCombustible: boolean;
  encendedor: boolean;
  radioDiscos: boolean;
  radioCassette: boolean;
  radio: boolean;
  alfombrasPiso: boolean;
  tacometro: boolean;
  luzAdvertencia: boolean;
  vidriosManuales: boolean;
  botonEncendido: boolean;
  botonPuerta: boolean;
}

export interface ChecklistExterior {
  antena: boolean;
  copas: boolean;
  retrovisores: boolean;
  emblemas: boolean;
  taponGasolina: boolean;
  tapasBatea: boolean;
  llantaRepuesto: boolean;
  llantaMantenera: boolean;
  llantaPasax: boolean;
  puertaElevatriz: boolean;
  frenoMano: boolean;
}

export interface Inspeccion {
  id: string;
  reservaId: string;
  vehiculoId: string;
  vehiculoMarca: string;
  vehiculoModelo: string;
  vehiculoPlaca: string;
  unidad: string;
  tipo: 'entrega' | 'devolucion';
  fecha: string;
  hora: string;
  kilometraje: number;
  nivelCombustible: number; // 0-100%
  checklistInterior: ChecklistInterior;
  checklistExterior: ChecklistExterior;
  danos: Dano[];
  danosVisuales?: {
    ladoConductor: string[];
    ladoPasajero: string[];
    frente: string[];
    atras: string[];
    parabrisas: string[];
  };
  fotos?: string[];
  observaciones?: string;
  inspeccionadoPor: string;
  firmadoPor?: string; // Cliente
  firmaRepresentante?: string;
  firmaCliente?: string;
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

// ==================== MANTENIMIENTO ====================
export type DamageStatus = 'en_revision' | 'reparado';
export type DamageSeverity = 'leve' | 'moderado' | 'grave';

export interface DamageDetail {
  id: string;
  descripcion: string;
  tipo: string; // Rayón, Golpe, Faltante, etc.
  severidad: DamageSeverity;
  costo: number;
}

export interface DamageReport {
  id: string;
  vehiculoId: string;
  vehiculoInfo: string; // "Toyota Corolla 2024 (ABC-123)"
  clienteId: string;
  clienteName: string;
  fecha: string;
  danos: DamageDetail[];
  totalEstimado: number;
  estado: DamageStatus;
  createdBy: string;
  reparadoFecha?: string;
  facturaId?: string;
}
