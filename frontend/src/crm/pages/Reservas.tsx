import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useForm } from '../hooks/useForm';
import { Card, Table, Button, Modal, Input, Select, SearchBar, Badge } from '../components/common';
import { mockReservas, mockClientes, mockVehiculos } from '../data/mockData';
import { Reserva, ReservaStatus } from '../types';
import { validateForm } from '../utils/validation';
import { formatCurrency, formatShortDate, calculateDays } from '../utils/formatters';

// Tipo para Contrato
interface Contrato {
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

export const Reservas: React.FC = () => {
  const { currentUser } = useAuth();
  const { canCreate, canApprove } = usePermissions('reservas');
  const [reservas, setReservas] = useState<Reserva[]>(mockReservas);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'reservas' | 'contratos'>('reservas');

  const { values, errors, handleChange, handleSubmit, resetForm } = useForm<{
    clienteId: string;
    vehiculoId: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>({
    initialValues: {
      clienteId: '',
      vehiculoId: '',
      startDate: '',
      endDate: '',
      notes: '',
    },
    onSubmit: (formValues) => {
      const cliente = mockClientes.find(c => c.id === formValues.clienteId);
      const vehiculo = mockVehiculos.find(v => v.id === formValues.vehiculoId);
      
      if (!cliente || !vehiculo) return;

      const days = calculateDays(formValues.startDate, formValues.endDate);
      const totalAmount = days * vehiculo.dailyRate;

      const newReserva: Reserva = {
        id: `res-${Date.now()}`,
        clienteId: formValues.clienteId,
        clienteName: cliente.name,
        vehiculoId: formValues.vehiculoId,
        vehiculoInfo: `${vehiculo.brand} ${vehiculo.model} (${vehiculo.plate})`,
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        days,
        totalAmount,
        status: currentUser?.role === 'OPERADOR' ? 'pending' : 'confirmed',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: currentUser?.id || '',
        notes: formValues.notes,
      };

      setReservas(prev => [newReserva, ...prev]);
      setShowModal(false);
      resetForm();
    },
    validate: (values) => {
      const validation = validateForm({
        clienteId: { value: values.clienteId, rules: { required: true } },
        vehiculoId: { value: values.vehiculoId, rules: { required: true } },
        startDate: { value: values.startDate, rules: { required: true } },
        endDate: { value: values.endDate, rules: { required: true } },
      });

      if (values.startDate && values.endDate && new Date(values.startDate) > new Date(values.endDate)) {
        validation.errors.endDate = 'La fecha final debe ser posterior a la inicial';
      }

      return validation.errors;
    },
  });

  const handleApprove = (id: string) => {
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) return;

    // Actualizar reserva a confirmada
    setReservas(prev =>
      prev.map(r => r.id === id ? {
        ...r,
        status: 'confirmed' as ReservaStatus,
        approvedBy: currentUser?.id,
        approvedAt: new Date().toISOString().split('T')[0],
      } : r)
    );

    // Crear contrato automáticamente
    const nuevoContrato: Contrato = {
      id: `ctr-${Date.now()}`,
      reservaId: reserva.id,
      clienteId: reserva.clienteId,
      clienteName: reserva.clienteName,
      vehiculoInfo: reserva.vehiculoInfo,
      startDate: reserva.startDate,
      endDate: reserva.endDate,
      terms: [
        'El vehículo debe devolverse con el mismo nivel de combustible',
        'El cliente es responsable de cualquier daño durante el alquiler',
        'Se requiere licencia de conducir válida y vigente',
        'Seguro completo incluido para daños a terceros',
        'Kilometraje ilimitado dentro del territorio nacional',
        'Asistencia en carretera disponible 24 horas, 7 días',
        'Prohibido fumar dentro del vehículo',
        'Reportar cualquier incidente de forma inmediata',
        'Multas de tránsito son responsabilidad del cliente',
        'Devolución obligatoria en la ubicación acordada',
      ],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setContratos(prev => [...prev, nuevoContrato]);
    alert(`✅ Reserva aprobada exitosamente\n\n📄 Contrato generado: ${nuevoContrato.id}\nEstado: Activo\nTérminos: 10 cláusulas incluidas`);
  };

  const handleReject = (id: string) => {
    setReservas(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'rejected' as ReservaStatus } : r)
    );
  };

  const filteredReservas = useMemo(() => {
    return reservas.filter(reserva => {
      // Si es cliente, solo ver sus propias reservas
      if (currentUser?.role === 'CLIENTE') {
        // En producción, filtrar por currentUser.id === reserva.clienteId
        return true; // Mock: mostrar todas para demo
      }

      const matchesSearch = reserva.clienteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reserva.vehiculoInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reserva.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || reserva.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [reservas, searchQuery, filterStatus, currentUser]);

  const getStatusBadge = (status: ReservaStatus) => {
    const config = {
      pending: { variant: 'warning' as const, label: 'Pendiente' },
      confirmed: { variant: 'info' as const, label: 'Confirmada' },
      completed: { variant: 'success' as const, label: 'Completada' },
      cancelled: { variant: 'danger' as const, label: 'Cancelada' },
      rejected: { variant: 'danger' as const, label: 'Rechazada' },
    };
    return config[status];
  };

  const columns = [
    {
      key: 'id',
      label: 'Reserva #',
      width: '15%',
      render: (reserva: Reserva) => (
        <div>
          <p className="font-mono text-xs text-gray-900 dark:text-gray-100">{reserva.id}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Creada: {formatShortDate(reserva.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (reserva: Reserva) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{reserva.clienteName}</p>
        </div>
      ),
    },
    {
      key: 'vehiculo',
      label: 'Vehículo',
      render: (reserva: Reserva) => (
        <p className="text-sm text-gray-900 dark:text-gray-100">{reserva.vehiculoInfo}</p>
      ),
    },
    {
      key: 'periodo',
      label: 'Período de Alquiler',
      render: (reserva: Reserva) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-gray-100">Inicio: {formatShortDate(reserva.startDate)}</p>
          <p className="text-gray-900 dark:text-gray-100">Fin: {formatShortDate(reserva.endDate)}</p>
          <p className="text-gray-600 dark:text-gray-400">{reserva.days} días ({formatCurrency(reserva.totalAmount)})</p>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (reserva: Reserva) => (
        <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(reserva.totalAmount)}</p>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (reserva: Reserva) => {
        const config = getStatusBadge(reserva.status);
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (reserva: Reserva) => {
        const contrato = contratos.find(c => c.reservaId === reserva.id);
        return (
          <div className="flex flex-col gap-1">
            {canApprove && reserva.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(reserva.id)}
                  className="text-success hover:text-success-dark text-sm font-medium"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleReject(reserva.id)}
                  className="text-danger hover:text-danger-dark text-sm font-medium"
                >
                  Rechazar
                </button>
              </>
            )}
            {reserva.status === 'confirmed' && contrato && (
              <button
                onClick={() => {
                  setSelectedContrato(contrato);
                  setShowContratoModal(true);
                }}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                📄 Ver Contrato
              </button>
            )}
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver detalles
            </button>
          </div>
        );
      },
    },
  ];

  const vehiculosDisponibles = mockVehiculos.filter(v => v.status === 'available');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reservas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestión completa de reservas y contratos de alquiler
          </p>
        </div>
        {canCreate && activeTab === 'reservas' && (
          <Button onClick={() => setShowModal(true)} icon="➕">
            {currentUser?.role === 'OPERADOR' ? 'Nueva Pre-Reserva' : 'Nueva Reserva'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reservas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'reservas'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            📅 Reservas ({reservas.length})
          </button>
          <button
            onClick={() => setActiveTab('contratos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'contratos'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            📄 Contratos ({contratos.length})
          </button>
        </nav>
      </div>

      {/* Contenido de Reservas */}
      {activeTab === 'reservas' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['pending', 'confirmed', 'completed', 'cancelled'].map(status => {
          const count = reservas.filter(r => r.status === status).length;
          const config = getStatusBadge(status as ReservaStatus);
          return (
            <Card key={status}>
              <div>
                <p className="text-sm text-gray-500 mb-1 capitalize">{config.label}</p>
                <p className="text-3xl font-bold text-gray-900">{count}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por ID, cliente, placa..."
            className="flex-1"
          />
          <Select
            name="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'confirmed', label: 'Confirmadas' },
              { value: 'completed', label: 'Completadas' },
              { value: 'cancelled', label: 'Canceladas' },
            ]}
            className="w-48"
          />
        </div>
      </Card>

          {/* Table */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lista de Reservas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gestiona las reservas de vehículos</p>
            </div>
            <Table
              data={filteredReservas}
              columns={columns}
              emptyMessage="No se encontraron reservas"
            />
          </Card>
        </>
      )}

      {/* Contenido de Contratos */}
      {activeTab === 'contratos' && (
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contratos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Contratos generados desde reservas aprobadas</p>
          </div>
          {contratos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay contratos todavía</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Los contratos se crean automáticamente al aprobar reservas</p>
              <Button onClick={() => setActiveTab('reservas')} variant="primary">Ir a Reservas</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contratos.map((contrato) => (
                <div
                  key={contrato.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedContrato(contrato);
                    setShowContratoModal(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{contrato.id}</span>
                        <Badge variant={contrato.status === 'active' ? 'success' : 'default'}>
                          {contrato.status === 'active' ? '✅ Activo' : '📝 Borrador'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Cliente</p>
                          <p className="font-medium text-gray-900 dark:text-white">{contrato.clienteName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Vehículo</p>
                          <p className="font-medium text-gray-900 dark:text-white">{contrato.vehiculoInfo}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Período</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatShortDate(contrato.startDate)} - {formatShortDate(contrato.endDate)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Reserva: {contrato.reservaId}</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Ver →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={currentUser?.role === 'OPERADOR' ? 'Nueva Pre-Reserva' : 'Nueva Reserva'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => { handleSubmit({ preventDefault: () => {} } as any); }}>
              Crear Reserva
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            name="clienteId"
            label="Cliente"
            value={values.clienteId}
            onChange={handleChange}
            error={errors.clienteId}
            options={mockClientes
              .filter(c => c.status === 'active')
              .map(c => ({ value: c.id, label: `${c.name} - ${c.email}` }))}
            placeholder="Seleccionar cliente"
            required
          />
          <Select
            name="vehiculoId"
            label="Vehículo"
            value={values.vehiculoId}
            onChange={handleChange}
            error={errors.vehiculoId}
            options={vehiculosDisponibles.map(v => ({
              value: v.id,
              label: `${v.brand} ${v.model} (${v.plate}) - ${formatCurrency(v.dailyRate)}/día`,
            }))}
            placeholder="Seleccionar vehículo"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="startDate"
              label="Fecha de Inicio"
              type="date"
              value={values.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
              min={new Date().toISOString().split('T')[0]}
            />
            <Input
              name="endDate"
              label="Fecha de Fin"
              type="date"
              value={values.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
              min={values.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (Opcional)
            </label>
            <textarea
              name="notes"
              value={values.notes}
              onChange={handleChange as any}
              rows={3}
              className="input-field"
              placeholder="Agregar notas o requerimientos especiales..."
            />
          </div>
          {values.startDate && values.endDate && (
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Resumen de la Reserva</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>Días: {calculateDays(values.startDate, values.endDate)}</p>
                {values.vehiculoId && (
                  <p className="font-semibold text-lg text-primary-700">
                    Total estimado: {formatCurrency(
                      calculateDays(values.startDate, values.endDate) * 
                      (vehiculosDisponibles.find(v => v.id === values.vehiculoId)?.dailyRate || 0)
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal de Contrato */}
      <Modal
        isOpen={showContratoModal}
        onClose={() => {
          setShowContratoModal(false);
          setSelectedContrato(null);
        }}
        title="📄 Contrato de Alquiler"
        size="xl"
      >
        {selectedContrato && (
          <div className="space-y-6">
            {/* Información del Contrato */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">ID Contrato</p>
                  <p className="font-mono font-semibold text-gray-900 dark:text-white">{selectedContrato.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Estado</p>
                  <Badge variant={selectedContrato.status === 'active' ? 'success' : 'default'}>
                    {selectedContrato.status === 'active' ? '✅ Activo' : selectedContrato.status === 'completed' ? '📦 Completado' : '📝 Borrador'}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Cliente</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedContrato.clienteName}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Fecha de Creación</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatShortDate(selectedContrato.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">Vehículo</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedContrato.vehiculoInfo}</p>
                </div>
              </div>
            </div>

            {/* Período de Alquiler */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Período de Alquiler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Inicio</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatShortDate(selectedContrato.startDate)}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Fin</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatShortDate(selectedContrato.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Términos y Condiciones */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Términos y Condiciones</h3>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                <ol className="space-y-3">
                  {selectedContrato.terms.map((term, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{term}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contrato vinculado a reserva: <span className="font-mono font-semibold">{selectedContrato.reservaId}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowContratoModal(false);
                    setSelectedContrato(null);
                  }}
                >
                  Cerrar
                </Button>
                <Button variant="primary">
                  📄 Imprimir/Descargar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
