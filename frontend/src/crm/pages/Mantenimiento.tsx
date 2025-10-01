import React, { useState, useMemo } from 'react';
import { Card, Table, Badge, SearchBar, Button, Modal } from '../components/common';
import { mockVehiculos } from '../data/mockData';
import { Vehiculo } from '../types';
import { formatShortDate, formatCurrency } from '../utils/formatters';

// Tipo para reporte de daño (mock)
interface ReporteDano {
  id: string;
  vehiculoId: string;
  vehiculoInfo: string;
  clienteNombre: string;
  reservaId: string;
  fecha: string;
  danos: Array<{
    ubicacion: string;
    tipo: string;
    descripcion: string;
    gravedad: 'leve' | 'moderado' | 'grave';
    costoEstimado: number;
  }>;
  estado: 'reportado' | 'en-revision' | 'reparado' | 'facturado';
  totalEstimado: number;
}

// Mock de reportes de daños
const mockReportes: ReporteDano[] = [
  {
    id: 'rep-001',
    vehiculoId: 'veh-001',
    vehiculoInfo: 'Toyota Corolla 2024 (ABC-123)',
    clienteNombre: 'Juan Pérez',
    reservaId: 'res-001',
    fecha: '2024-10-15',
    danos: [
      {
        ubicacion: 'Puerta trasera derecha',
        tipo: 'Rayón',
        descripcion: 'Rayón profundo de 15cm en pintura',
        gravedad: 'moderado',
        costoEstimado: 500,
      },
      {
        ubicacion: 'Cajuela',
        tipo: 'Faltante',
        descripcion: 'No se encontró gato hidráulico',
        gravedad: 'leve',
        costoEstimado: 800,
      },
    ],
    estado: 'en-revision',
    totalEstimado: 1300,
  },
  {
    id: 'rep-002',
    vehiculoId: 'veh-002',
    vehiculoInfo: 'Honda CR-V 2023 (XYZ-456)',
    clienteNombre: 'María González',
    reservaId: 'res-002',
    fecha: '2024-10-20',
    danos: [
      {
        ubicacion: 'Parachoques delantero',
        tipo: 'Abolladura',
        descripcion: 'Abolladura pequeña en esquina',
        gravedad: 'leve',
        costoEstimado: 350,
      },
    ],
    estado: 'reparado',
    totalEstimado: 350,
  },
];

export const Mantenimiento: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vehiculos' | 'reportes'>('vehiculos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReporte, setSelectedReporte] = useState<ReporteDano | null>(null);
  const [showReporteModal, setShowReporteModal] = useState(false);

  // Vehículos en mantenimiento o dañados
  const vehiculosMantenimiento = useMemo(() => {
    return mockVehiculos.filter(v => v.status === 'maintenance');
  }, []);

  // Filtrar reportes
  const filteredReportes = useMemo(() => {
    if (!searchQuery) return mockReportes;
    return mockReportes.filter(r =>
      r.vehiculoInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clienteNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getEstadoBadge = (estado: string) => {
    const config = {
      'reportado': { variant: 'warning' as const, label: '📋 Reportado' },
      'en-revision': { variant: 'info' as const, label: '🔍 En Revisión' },
      'reparado': { variant: 'success' as const, label: '✅ Reparado' },
      'facturado': { variant: 'default' as const, label: '💰 Facturado' },
    };
    return config[estado as keyof typeof config] || config.reportado;
  };

  const getGravedadBadge = (gravedad: string) => {
    const config = {
      'leve': { variant: 'success' as const, label: '🟢 Leve' },
      'moderado': { variant: 'warning' as const, label: '🟡 Moderado' },
      'grave': { variant: 'danger' as const, label: '🔴 Grave' },
    };
    return config[gravedad as keyof typeof config] || config.leve;
  };

  const columnsVehiculos = [
    {
      key: 'vehicle',
      label: 'Vehículo',
      render: (vehiculo: Vehiculo) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{vehiculo.brand} {vehiculo.model}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{vehiculo.plate}</p>
        </div>
      ),
    },
    { key: 'year', label: 'Año' },
    {
      key: 'type',
      label: 'Tipo',
      render: (vehiculo: Vehiculo) => (
        <span className="capitalize text-gray-900 dark:text-white">{vehiculo.type}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: () => (
        <Badge variant="warning">🔧 Mantenimiento</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: () => (
        <div className="flex gap-2">
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver Historial
          </button>
          <button className="text-success hover:text-success-dark text-sm font-medium">
            Marcar Disponible
          </button>
        </div>
      ),
    },
  ];

  const columnsReportes = [
    {
      key: 'id',
      label: 'ID Reporte',
      render: (reporte: ReporteDano) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">{reporte.id}</span>
      ),
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (reporte: ReporteDano) => formatShortDate(reporte.fecha),
    },
    {
      key: 'vehiculo',
      label: 'Vehículo',
      render: (reporte: ReporteDano) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{reporte.vehiculoInfo}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cliente: {reporte.clienteNombre}</p>
        </div>
      ),
    },
    {
      key: 'danos',
      label: 'Daños Reportados',
      render: (reporte: ReporteDano) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-white">{reporte.danos.length} daño(s)</p>
          {reporte.danos.map((dano, idx) => (
            <p key={idx} className="text-gray-500 dark:text-gray-400">{dano.ubicacion}</p>
          ))}
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Costo Estimado',
      render: (reporte: ReporteDano) => (
        <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(reporte.totalEstimado)}</p>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (reporte: ReporteDano) => {
        const config = getEstadoBadge(reporte.estado);
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (reporte: ReporteDano) => (
        <button
          onClick={() => {
            setSelectedReporte(reporte);
            setShowReporteModal(true);
          }}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Ver Detalles
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">🔧 Mantenimiento</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestión de vehículos en mantenimiento y reportes de daños
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center text-2xl">
              🔧
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En Mantenimiento</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehiculosMantenimiento.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reportes de Daños</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockReportes.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-2xl">
              🔍
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En Revisión</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockReportes.filter(r => r.estado === 'en-revision').length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reparados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockReportes.filter(r => r.estado === 'reparado').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('vehiculos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'vehiculos'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            🚗 Vehículos ({vehiculosMantenimiento.length})
          </button>
          <button
            onClick={() => setActiveTab('reportes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reportes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            📋 Reportes de Daños ({mockReportes.length})
          </button>
        </nav>
      </div>

      {/* Tab: Vehículos en Mantenimiento */}
      {activeTab === 'vehiculos' && (
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehículos en Mantenimiento</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vehículos que requieren reparación o servicio</p>
          </div>
          {vehiculosMantenimiento.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay vehículos en mantenimiento
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Todos los vehículos están disponibles o en uso
              </p>
            </div>
          ) : (
            <Table
              data={vehiculosMantenimiento}
              columns={columnsVehiculos}
              emptyMessage="No hay vehículos en mantenimiento"
            />
          )}
        </Card>
      )}

      {/* Tab: Reportes de Daños */}
      {activeTab === 'reportes' && (
        <>
          <Card>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por vehículo, cliente o ID..."
              className="mb-4"
            />
          </Card>
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reportes de Daños</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daños reportados por Operadores durante inspecciones</p>
            </div>
            <Table
              data={filteredReportes}
              columns={columnsReportes}
              emptyMessage="No hay reportes de daños"
            />
          </Card>
        </>
      )}

      {/* Modal: Detalle de Reporte */}
      <Modal
        isOpen={showReporteModal}
        onClose={() => {
          setShowReporteModal(false);
          setSelectedReporte(null);
        }}
        title="📋 Detalle del Reporte de Daños"
        size="xl"
      >
        {selectedReporte && (
          <div className="space-y-6">
            {/* Info General */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ID Reporte</p>
                <p className="font-mono font-semibold text-gray-900 dark:text-white">{selectedReporte.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatShortDate(selectedReporte.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehículo</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedReporte.vehiculoInfo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cliente</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedReporte.clienteNombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                {(() => {
                  const config = getEstadoBadge(selectedReporte.estado);
                  return <Badge variant={config.variant}>{config.label}</Badge>;
                })()}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Estimado</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedReporte.totalEstimado)}</p>
              </div>
            </div>

            {/* Lista de Daños */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Daños Detallados</h4>
              <div className="space-y-3">
                {selectedReporte.danos.map((dano, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{dano.ubicacion}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{dano.tipo}</p>
                      </div>
                      {(() => {
                        const config = getGravedadBadge(dano.gravedad);
                        return <Badge variant={config.variant}>{config.label}</Badge>;
                      })()}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{dano.descripcion}</p>
                    <p className="text-lg font-semibold text-primary-600">
                      {formatCurrency(dano.costoEstimado)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="secondary" onClick={() => setShowReporteModal(false)}>
                Cerrar
              </Button>
              {selectedReporte.estado === 'en-revision' && (
                <>
                  <Button variant="primary">
                    ✅ Marcar como Reparado
                  </Button>
                  <Button variant="primary">
                    💰 Generar Factura
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
